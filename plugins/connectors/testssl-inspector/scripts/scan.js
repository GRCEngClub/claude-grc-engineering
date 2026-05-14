#!/usr/bin/env node

/**
 * testssl-inspector:scan
 *
 * Wraps testssl.sh and emits findings conforming to schemas/finding.schema.json v1.
 *
 * Resource type is `tls_endpoint`. Each finding from testssl is mapped to one
 * or more control evaluations across SOC 2, NIST 800-53, PCI DSS 4.0.1,
 * ISO 27001:2022, and SCF.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const CONFIG_DIR = process.env.CLAUDE_GRC_CONFIG_DIR || path.join(os.homedir(), '.config', 'claude-grc');
const CONFIG_FILE = path.join(CONFIG_DIR, 'connectors', 'testssl-inspector.yaml');
const CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'findings', 'testssl-inspector');
const RUNS_LOG = path.join(os.homedir(), '.cache', 'claude-grc', 'runs.log');
const SOURCE = 'testssl-inspector';
const SOURCE_VERSION = '0.1.0';

const EXIT = { OK: 0, USAGE: 2, TOOL_UNAVAILABLE: 3, PARTIAL: 4, NOT_CONFIGURED: 5 };

async function main(argv) {
  const args = parseArgs(argv);
  const log = args.quiet ? () => {} : (m) => process.stderr.write(`[${SOURCE}] ${m}\n`);

  let config = {};
  try { config = parseYaml(await fs.readFile(CONFIG_FILE, 'utf8')); }
  catch { /* config is optional; targets can come from CLI */ }

  const targets = args.targets.length ? args.targets : (config.targets || []);
  if (!targets.length) {
    fail(EXIT.USAGE, 'no targets. Pass --target=host[:port] (repeatable) or list them in config (run /testssl-inspector:setup).');
  }

  const mode = args.fast ? 'fast' : 'full';
  const useDocker = args.docker ?? (config.use_docker === true);
  const runner = await resolveRunner({ useDocker, configBinary: config.testssl_path });
  log(`runner=${runner.label} mode=${mode} targets=${targets.length}`);

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const runId = makeRunId();
  const startedAt = Date.now();
  const findings = [];
  const errors = [];

  for (const target of targets) {
    try {
      const raw = await runTestssl(runner, target, mode, log);
      const doc = normalizeTargetFindings(raw, target, runId, runner.version);
      findings.push(doc);
    } catch (err) {
      errors.push({ target, error: err.message });
      log(`${target} scan failed: ${err.message}`);
    }
  }

  const cachePath = path.join(CACHE_DIR, `${runId}.json`);
  await fs.writeFile(cachePath, JSON.stringify(findings, null, 2));

  const counters = { pass: 0, fail: 0, inconclusive: 0, not_applicable: 0, skipped: 0 };
  const sev = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const d of findings) for (const e of d.evaluations) {
    counters[e.status] = (counters[e.status] || 0) + 1;
    if (e.severity) sev[e.severity] = (sev[e.severity] || 0) + 1;
  }

  await appendRunLog({
    source: SOURCE, run_id: runId, started_at: new Date(startedAt).toISOString(),
    duration_ms: Date.now() - startedAt,
    targets: targets.length, errors: errors.length,
    counters, severities: sev, cache_path: cachePath,
  });

  if (args.output === 'json') {
    process.stdout.write(JSON.stringify({ run_id: runId, cache_path: cachePath, counters, severities: sev, errors }, null, 2) + '\n');
  } else if (args.output !== 'silent') {
    const failingSev = `${sev.critical} critical, ${sev.high} high, ${sev.medium} medium, ${sev.low} low`;
    process.stdout.write(
      `${SOURCE}: ${targets.length} target${targets.length === 1 ? '' : 's'}, ` +
      `${findings.length} resource${findings.length === 1 ? '' : 's'}, ` +
      `${counters.fail + counters.pass + counters.inconclusive} evaluations, ` +
      `${counters.fail} failing (${failingSev}). ` +
      `${errors.length ? `${errors.length} scan errors. ` : ''}` +
      `→ ${cachePath}\n`
    );
  }

  if (errors.length && findings.length === 0) process.exit(EXIT.TOOL_UNAVAILABLE);
  if (errors.length) process.exit(EXIT.PARTIAL);
  process.exit(EXIT.OK);
}

function parseArgs(argv) {
  const args = { targets: [], fast: false, docker: undefined, quiet: false, output: 'summary' };
  for (const a of argv) {
    if (a === '--fast') args.fast = true;
    else if (a === '--full') args.fast = false;
    else if (a === '--docker') args.docker = true;
    else if (a === '--no-docker') args.docker = false;
    else if (a === '--quiet') args.quiet = true;
    else if (a.startsWith('--target=')) args.targets.push(a.slice(9));
    else if (a.startsWith('--output=')) args.output = a.slice(9);
    else if (a === '-h' || a === '--help') {
      process.stdout.write(
        `Usage: scan.js --target=host[:port] [--target=...] [--fast|--full] [--docker] [--output=summary|silent|json] [--quiet]\n`
      );
      process.exit(0);
    } else if (!a.startsWith('-')) args.targets.push(a);
    else fail(EXIT.USAGE, `unknown flag: ${a}`);
  }
  return args;
}

/** Resolve which testssl invocation we'll use. */
async function resolveRunner({ useDocker, configBinary }) {
  if (useDocker) {
    if (!await commandExists('docker')) fail(EXIT.TOOL_UNAVAILABLE, 'docker not on PATH — drop --docker or install Docker.');
    return {
      label: 'docker drwetter/testssl.sh',
      version: await dockerImageVersion(),
      argv: (target, mode) => [
        'run', '--rm', '--network', 'host',
        '-v', `${CACHE_DIR}:/tmp/scan-out`,
        'drwetter/testssl.sh:latest',
        ...testsslArgs(target, mode, '/tmp/scan-out'),
      ],
      cmd: 'docker',
    };
  }
  const binary = configBinary || await whichTestssl();
  if (!binary) {
    fail(EXIT.TOOL_UNAVAILABLE,
      'testssl.sh not on PATH. Install via: brew install testssl (macOS), apt install testssl.sh (Debian/Ubuntu), or ' +
      'git clone https://github.com/testssl/testssl.sh ~/.local/share/testssl.sh && ' +
      `export PATH="$HOME/.local/share/testssl.sh:$PATH". Or rerun with --docker.`);
  }
  const version = await runCapture(binary, ['--version']).then(parseTestsslVersion).catch(() => 'unknown');
  return {
    label: binary,
    version,
    cmd: binary,
    argv: (target, mode) => testsslArgs(target, mode),
  };
}

async function whichTestssl() {
  for (const candidate of ['testssl.sh', 'testssl']) {
    if (await commandExists(candidate)) return candidate;
  }
  for (const candidate of [
    path.join(os.homedir(), '.local/share/testssl.sh/testssl.sh'),
    '/opt/testssl.sh/testssl.sh',
    '/usr/local/bin/testssl.sh',
  ]) {
    try { await fs.access(candidate); return candidate; } catch {}
  }
  return null;
}

async function dockerImageVersion() {
  try {
    const out = await runCapture('docker', ['run', '--rm', 'drwetter/testssl.sh:latest', '--version']);
    return parseTestsslVersion(out);
  } catch { return 'unknown'; }
}

function parseTestsslVersion(text) {
  const m = String(text).match(/testssl\.sh\s+([0-9][^\s,]+)/i);
  return m ? m[1] : 'unknown';
}

function testsslArgs(target, mode, outDir = null) {
  const out = outDir || CACHE_DIR;
  const jsonPath = path.join(out, `testssl-raw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`);
  const base = [
    '--quiet', '--warnings', 'off', '--color', '0',
    '--jsonfile-pretty', jsonPath,
  ];
  if (mode === 'fast') base.push('--fast');
  base.push(target);
  base.__jsonPath = jsonPath;
  return base;
}

async function runTestssl(runner, target, mode, log) {
  const argv = runner.argv(target, mode);
  const jsonPath = argv.__jsonPath;
  log(`scanning ${target}`);
  await runCapture(runner.cmd, argv, { allowNonZero: true }); // testssl exits non-zero when it finds issues
  let raw;
  try { raw = JSON.parse(await fs.readFile(jsonPath, 'utf8')); }
  catch (err) { throw new Error(`testssl produced no parseable JSON at ${jsonPath}: ${err.message}`); }
  fs.rm(jsonPath, { force: true }).catch(() => {}); // best-effort cleanup
  return raw;
}

function runCapture(cmd, argv, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, argv, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', d => { stdout += d; });
    child.stderr.on('data', d => { stderr += d; });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0 || opts.allowNonZero) resolve(stdout);
      else reject(new Error(`${cmd} exited ${code}: ${stderr.trim().slice(0, 500)}`));
    });
  });
}

function commandExists(cmd) {
  return runCapture(process.platform === 'win32' ? 'where' : 'which', [cmd])
    .then(() => true).catch(() => false);
}

/** ---- Normalization: testssl JSON → v1 Finding doc ---- */

function normalizeTargetFindings(raw, target, runId, sourceVersion) {
  const entries = extractEntries(raw);
  const { host, port } = parseTarget(target);
  const collectedAt = new Date().toISOString();

  const evaluations = [];
  const narrative = [];
  // Track which (framework, control_id, mapping_key) tuples we've already emitted to avoid duplicates.
  const seen = new Set();

  for (const entry of entries) {
    const id = String(entry.id || '');
    const status = entrySeverityToStatus(entry);
    const severity = entrySeverityToOurSeverity(entry);
    const mappings = mapTestsslId(id, entry);
    if (!mappings.length) continue;

    for (const m of mappings) {
      const key = `${m.framework}::${m.control_id}::${id}::${status}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const ev = {
        control_framework: m.framework,
        control_id: m.control_id,
        status,
        severity,
      };
      if (status === 'fail' || status === 'inconclusive') {
        ev.message = formatMessage(entry, id);
      }
      evaluations.push(ev);
    }

    if (entry.cve || (status === 'fail' && severity === 'critical')) {
      narrative.push({
        id: `${SOURCE}-${id}`,
        title: `${id} — ${truncate(entry.finding || '', 100)}`,
        severity,
        description: formatMessage(entry, id),
        related_control_ids: mappings.map(m => `${m.framework}:${m.control_id}`),
      });
    }
  }

  if (evaluations.length === 0) {
    evaluations.push({
      control_framework: 'SCF',
      control_id: 'CRY-03',
      status: 'inconclusive',
      severity: 'info',
      message: 'testssl.sh produced no recognized TLS findings for this endpoint. Either the target is not exposing TLS, the scan was blocked, or all checked tests fell outside the mapping table.',
    });
  }

  return {
    schema_version: '1.0.0',
    source: SOURCE,
    source_version: `${SOURCE_VERSION}+testssl-${sourceVersion}`,
    run_id: runId,
    collected_at: collectedAt,
    resource: {
      type: 'tls_endpoint',
      id: `${host}:${port}`,
      uri: `https://${host}:${port}/`,
      region: null,
      account_id: null,
    },
    evaluations,
    findings: narrative.slice(0, 50), // narrative cap to keep documents bounded
    metadata: {
      target,
      host,
      port,
      mode_was: raw?.scanTime ? 'full' : 'unknown',
    },
  };
}

function extractEntries(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.scanResult)) {
    // Older testssl multi-target shape: scanResult[0].pretests + .protocols + .ciphers + ...
    const out = [];
    for (const target of raw.scanResult) {
      for (const k of Object.keys(target)) {
        const v = target[k];
        if (Array.isArray(v)) out.push(...v);
      }
    }
    return out;
  }
  return [];
}

function parseTarget(target) {
  const [host, portRaw] = target.split(':');
  const port = portRaw && /^\d+$/.test(portRaw) ? Number(portRaw) : 443;
  return { host, port };
}

function entrySeverityToStatus(entry) {
  const s = String(entry.severity || '').toUpperCase();
  if (s === 'OK' || s === 'INFO') return 'pass';
  if (s === 'LOW' || s === 'MEDIUM' || s === 'HIGH' || s === 'CRITICAL' || s === 'WARN' || s === 'FATAL') return 'fail';
  if (s === 'DEBUG') return 'pass';
  return 'inconclusive';
}

function entrySeverityToOurSeverity(entry) {
  const s = String(entry.severity || '').toUpperCase();
  if (s === 'CRITICAL' || s === 'FATAL') return 'critical';
  if (s === 'HIGH') return 'high';
  if (s === 'MEDIUM' || s === 'WARN') return 'medium';
  if (s === 'LOW') return 'low';
  return 'info';
}

function formatMessage(entry, id) {
  const parts = [];
  if (entry.finding) parts.push(entry.finding);
  if (entry.cve) parts.push(`CVE: ${entry.cve}`);
  if (entry.cwe) parts.push(`CWE: ${entry.cwe}`);
  return parts.join(' — ') || `testssl.sh ${id}: ${entry.severity || 'no detail'}`;
}

function truncate(s, n) {
  return s.length <= n ? s : s.slice(0, n - 1) + '…';
}

/** ---- Control mapping ----
 * Each function returns an array of {framework, control_id} pairs for a given testssl id.
 * The mapping is intentionally conservative — only well-established crosswalks.
 */

const MAPPINGS = (() => {
  // Group: protocol support (TLS 1.0/1.1 weak, TLS 1.2/1.3 strong, SSLv2/SSLv3 broken)
  const protocolWeak = [
    { framework: 'SOC2-TSC-2017',    control_id: 'CC6.7' },
    { framework: 'NIST-800-53-r5',   control_id: 'SC-8' },
    { framework: 'NIST-800-53-r5',   control_id: 'SC-13' },
    { framework: 'PCI-DSS-4.0',      control_id: '4.2.1' },
    { framework: 'ISO-27001-2022',   control_id: 'A.8.24' },
    { framework: 'SCF',              control_id: 'CRY-03' },
  ];
  // Group: cipher suite checks
  const cipherWeak = [
    { framework: 'SOC2-TSC-2017',    control_id: 'CC6.7' },
    { framework: 'NIST-800-53-r5',   control_id: 'SC-13' },
    { framework: 'PCI-DSS-4.0',      control_id: '4.2.1.1' },
    { framework: 'ISO-27001-2022',   control_id: 'A.8.24' },
    { framework: 'SCF',              control_id: 'CRY-04' },
  ];
  // Group: certificate posture
  const certificate = [
    { framework: 'SOC2-TSC-2017',    control_id: 'CC6.1' },
    { framework: 'NIST-800-53-r5',   control_id: 'SC-17' },
    { framework: 'PCI-DSS-4.0',      control_id: '4.2.1' },
    { framework: 'ISO-27001-2022',   control_id: 'A.8.24' },
    { framework: 'SCF',              control_id: 'CRY-08' },
  ];
  // Group: known TLS CVEs / vulnerability management
  const cve = [
    { framework: 'SOC2-TSC-2017',    control_id: 'CC6.6' },
    { framework: 'NIST-800-53-r5',   control_id: 'RA-5' },
    { framework: 'NIST-800-53-r5',   control_id: 'SI-2' },
    { framework: 'PCI-DSS-4.0',      control_id: '6.3.3' },
    { framework: 'ISO-27001-2022',   control_id: 'A.8.8' },
    { framework: 'SCF',              control_id: 'VPM-03' },
  ];
  // Group: HTTP transport security headers
  const headers = [
    { framework: 'SOC2-TSC-2017',    control_id: 'CC6.7' },
    { framework: 'NIST-800-53-r5',   control_id: 'SC-8' },
    { framework: 'ISO-27001-2022',   control_id: 'A.8.20' },
    { framework: 'SCF',              control_id: 'CRY-03' },
  ];

  // Map specific testssl id (or prefix) → group
  // Keys checked with both exact match and prefix match (longest prefix wins).
  return {
    // ---- protocols ----
    'SSLv2': protocolWeak,
    'SSLv3': protocolWeak,
    'TLS1':  protocolWeak,
    'TLS1_1': protocolWeak,
    'TLS1_2': protocolWeak,   // mapped — but if "offered" then passes; "not offered" is a fail
    'TLS1_3': protocolWeak,
    // ---- ciphers ----
    'cipher_negotiated': cipherWeak,
    'cipher_order':      cipherWeak,
    'cipherlist_':       cipherWeak, // prefix: cipherlist_NULL, cipherlist_LOW, etc.
    'std_NULL':          cipherWeak,
    'std_aNULL':         cipherWeak,
    'std_EXPORT':        cipherWeak,
    'std_LOW':           cipherWeak,
    'std_3DES_IDEA':     cipherWeak,
    'std_OBSOLETED':     cipherWeak,
    'std_STRONG_NOFS':   cipherWeak,
    'std_STRONG_FS':     cipherWeak,
    // ---- certificate ----
    'cert_': certificate, // prefix
    'OCSP_': certificate, // prefix
    'CT':    certificate,
    'DNS_CAArecord': certificate,
    // ---- known CVEs ----
    'heartbleed':           cve,
    'CCS':                  cve,
    'ticketbleed':          cve,
    'ROBOT':                cve,
    'secure_renego':        cve,
    'secure_client_renego': cve,
    'CRIME_TLS':            cve,
    'BREACH':               cve,
    'POODLE_SSL':           cve,
    'fallback_SCSV':        cve,
    'SWEET32':              cve,
    'FREAK':                cve,
    'DROWN':                cve,
    'LOGJAM':               cve,
    'LOGJAM-common_primes': cve,
    'BEAST_CBC_TLS1':       cve,
    'BEAST':                cve,
    'LUCKY13':              cve,
    'winshock':             cve,
    'RC4':                  cve,
    // ---- security headers ----
    'HSTS':                 headers,
    'HSTS_preload':         headers,
    'HSTS_time':            headers,
    'HPKP':                 headers,
    'cookie_secure':        headers,
    'cookie_httponly':      headers,
    'banner_server':        headers,
    'banner_application':   headers,
    'security_headers':     headers,
  };
})();

function mapTestsslId(id, _entry) {
  if (!id) return [];
  // Exact match first
  if (MAPPINGS[id]) return MAPPINGS[id];
  // Longest-prefix match
  let bestKey = null;
  for (const key of Object.keys(MAPPINGS)) {
    if (key.endsWith('_') || (!MAPPINGS[id] && id.startsWith(key + '_'))) {
      if (id.startsWith(key) && (bestKey === null || key.length > bestKey.length)) {
        bestKey = key;
      }
    }
  }
  return bestKey ? MAPPINGS[bestKey] : [];
}

/** ---- Utils ---- */

function makeRunId() {
  return `tssl-${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}-${crypto.randomBytes(3).toString('hex')}`;
}

async function appendRunLog(record) {
  const line = JSON.stringify(record) + '\n';
  try { await fs.appendFile(RUNS_LOG, line); } catch {}
}

function fail(code, msg) {
  process.stderr.write(`[${SOURCE}] ${msg}\n`);
  process.exit(code);
}

function parseYaml(text) {
  // Minimal YAML for the small config shape we support: key: value, lists with "- " items.
  const out = {};
  let listKey = null;
  for (const line of text.split('\n')) {
    const trimmed = line.replace(/#.*$/, '').replace(/\s+$/, '');
    if (!trimmed) continue;
    if (/^\s+- /.test(trimmed) && listKey) {
      out[listKey].push(trimmed.replace(/^\s+- /, '').replace(/^["']|["']$/g, ''));
      continue;
    }
    const m = /^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/.exec(trimmed);
    if (!m) continue;
    const [, k, v] = m;
    if (v === '') { out[k] = []; listKey = k; continue; }
    listKey = null;
    if (v === 'true') out[k] = true;
    else if (v === 'false') out[k] = false;
    else if (/^[0-9]+$/.test(v)) out[k] = Number(v);
    else out[k] = v.replace(/^["']|["']$/g, '');
  }
  return out;
}

const invokedFromCLI = import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedFromCLI) {
  main(process.argv.slice(2)).catch(err => { fail(1, err.stack || err.message); });
}
