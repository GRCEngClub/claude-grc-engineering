#!/usr/bin/env node

import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PLUGIN_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(PLUGIN_ROOT, 'public');
const REPO_ROOT = path.resolve(PLUGIN_ROOT, '../../..');

const DEFAULT_DATA_PATH = path.join(REPO_ROOT, 'grc-data/dashboard/monitor-continuous');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8'
};

function usage() {
  return `Usage:
  node plugins/dashboards/compliance-posture/scripts/serve.js [options]

Options:
  --data=<path[,path]>   Monitor JSON file or directory (default: grc-data/dashboard/monitor-continuous)
  --host=<host>          Bind host (default: 127.0.0.1)
  --port=<port>          Bind port (default: 8787)
  --demo                 Serve built-in demo runs and ignore local JSON
  --help                 Show this help
`;
}

function parseArgs(argv) {
  const out = {
    dataPaths: [DEFAULT_DATA_PATH],
    host: '127.0.0.1',
    port: 8787,
    demo: false,
    help: false
  };

  for (const token of argv) {
    if (!token.startsWith('--')) {
      out.dataPaths = [path.resolve(token)];
      continue;
    }
    const [rawKey, rawValue] = token.slice(2).split('=');
    const value = rawValue ?? true;
    switch (rawKey) {
      case 'data':
        out.dataPaths = String(value).split(',').map(p => path.resolve(p.trim())).filter(Boolean);
        break;
      case 'host':
        out.host = String(value);
        break;
      case 'port':
        out.port = Number(value);
        if (!Number.isInteger(out.port) || out.port <= 0 || out.port > 65535) {
          throw new Error(`--port must be a valid TCP port (got ${value})`);
        }
        break;
      case 'demo':
        out.demo = true;
        break;
      case 'help':
      case 'h':
        out.help = true;
        break;
      default:
        throw new Error(`Unknown flag: --${rawKey}`);
    }
  }
  return out;
}

async function listJsonFiles(inputPath) {
  const files = [];
  const stat = await fs.stat(inputPath);
  if (stat.isFile()) {
    if (inputPath.endsWith('.json')) files.push(inputPath);
    return files;
  }
  if (!stat.isDirectory()) return files;

  const entries = await fs.readdir(inputPath, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(inputPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listJsonFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(full);
    }
  }
  return files;
}

function asMonitorRuns(parsed, file) {
  const docs = Array.isArray(parsed) ? parsed : [parsed];
  return docs
    .filter(doc => doc && typeof doc === 'object')
    .filter(doc => doc.kind === 'monitor_continuous_run' || (doc.summary && Array.isArray(doc.framework_results)))
    .map(doc => ({
      ...doc,
      source_file: path.relative(REPO_ROOT, file)
    }));
}

async function loadRuns(dataPaths, demo) {
  if (demo) {
    return {
      loaded_at: new Date().toISOString(),
      data_paths: ['demo-data'],
      files: [],
      errors: [],
      runs: demoRuns()
    };
  }

  const runs = [];
  const errors = [];
  const files = [];

  for (const dataPath of dataPaths) {
    try {
      files.push(...await listJsonFiles(dataPath));
    } catch (err) {
      if (err.code === 'ENOENT') {
        errors.push({ path: path.relative(REPO_ROOT, dataPath), message: 'path does not exist' });
        continue;
      }
      errors.push({ path: path.relative(REPO_ROOT, dataPath), message: err.message });
    }
  }

  for (const file of files) {
    try {
      const parsed = JSON.parse(await fs.readFile(file, 'utf8'));
      runs.push(...asMonitorRuns(parsed, file));
    } catch (err) {
      errors.push({ path: path.relative(REPO_ROOT, file), message: err.message });
    }
  }

  runs.sort((a, b) => new Date(a.generated_at || 0) - new Date(b.generated_at || 0));
  return {
    loaded_at: new Date().toISOString(),
    data_paths: dataPaths.map(p => path.relative(REPO_ROOT, p) || '.'),
    files: files.map(f => path.relative(REPO_ROOT, f)),
    errors,
    runs
  };
}

function demoRuns() {
  const base = Date.now();
  const frameworks = ['SOC2', 'NIST-800-53', 'PCI-DSS'];
  return [0, 1, 2, 3, 4].map(i => {
    const rates = [0.74 + i * 0.035, 0.66 + i * 0.025, 0.82 - i * 0.01];
    const generated = new Date(base - (4 - i) * 86400000).toISOString();
    const frameworkResults = frameworks.map((framework, idx) => {
      const passRate = Math.max(0, Math.min(1, rates[idx]));
      const evaluated = [64, 92, 48][idx];
      const passing = Math.round(evaluated * passRate);
      const status = passRate < 0.8 ? 'critical' : passRate < 0.9 ? 'warning' : 'ok';
      return {
        framework,
        display_name: framework === 'SOC2' ? 'Trust Services Criteria' : framework,
        evaluated,
        passing,
        failing: evaluated - passing,
        inconclusive: idx + i,
        total_controls: [399, 810, 288][idx],
        pass_rate: passRate,
        pass_rate_pct: Math.round(passRate * 100),
        coverage_pct: [42 + i * 3, 35 + i * 2, 58 - i][idx],
        status
      };
    });
    const totalPassing = frameworkResults.reduce((sum, f) => sum + f.passing, 0);
    const totalEvaluated = frameworkResults.reduce((sum, f) => sum + f.evaluated, 0);
    const alerts = frameworkResults
      .filter(f => f.status !== 'ok')
      .map(f => ({
        severity: f.status,
        framework: f.framework,
        pass_rate: f.pass_rate,
        threshold: f.status === 'critical' ? 0.8 : 0.9,
        message: `${f.framework} pass rate ${(f.pass_rate * 100).toFixed(1)}% below ${f.status} floor`
      }));
    return {
      schema_version: '1.0.0',
      kind: 'monitor_continuous_run',
      run_id: `demo-${i + 1}`,
      generated_at: generated,
      schedule: 'daily',
      frameworks,
      sources: ['aws-inspector', 'github-inspector', 'poam-automation'],
      thresholds: { warning: 0.9, critical: 0.8 },
      framework_results: frameworkResults,
      summary: {
        overall_status: alerts.some(a => a.severity === 'critical') ? 'critical' : alerts.length ? 'warning' : 'ok',
        overall_pass_rate: totalPassing / totalEvaluated,
        tier1_blockers: Math.max(0, 7 - i),
        tier2_findings: 10 + i,
        tier3_recommendations: 14 - i,
        passes: totalPassing,
        inconclusive: 6 + i
      },
      alerts,
      artifacts: { gap_report_dir: './monitor-reports', metrics: { skipped: true, reason: 'demo' } },
      source_file: 'demo-data'
    };
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'content-type': MIME_TYPES['.json'],
    'cache-control': 'no-store'
  });
  res.end(`${JSON.stringify(payload, null, 2)}\n`);
}

async function sendStatic(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const requested = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  const full = path.resolve(PUBLIC_DIR, `.${requested}`);
  if (!full.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  try {
    const body = await fs.readFile(full);
    res.writeHead(200, {
      'content-type': MIME_TYPES[path.extname(full)] || 'application/octet-stream',
      'cache-control': 'no-store'
    });
    res.end(body);
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    throw err;
  }
}

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`dashboard: ${err.message}\n\n${usage()}`);
    process.exit(1);
  }

  if (opts.help) {
    process.stdout.write(usage());
    return;
  }

  const server = http.createServer(async (req, res) => {
    try {
      if (req.url.startsWith('/api/runs')) {
        sendJson(res, 200, await loadRuns(opts.dataPaths, opts.demo));
        return;
      }
      await sendStatic(req, res);
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
  });

  server.on('error', err => {
    process.stderr.write(`dashboard: failed to listen on ${opts.host}:${opts.port}: ${err.message}\n`);
    process.exit(1);
  });

  server.listen(opts.port, opts.host, () => {
    const data = opts.demo ? 'demo data' : opts.dataPaths.map(p => path.relative(REPO_ROOT, p) || '.').join(', ');
    process.stderr.write(`compliance-posture dashboard: http://${opts.host}:${opts.port}\n`);
    process.stderr.write(`data: ${data}\n`);
  });
}

main().catch(err => {
  process.stderr.write(`dashboard: ${err.stack || err.message}\n`);
  process.exit(1);
});
