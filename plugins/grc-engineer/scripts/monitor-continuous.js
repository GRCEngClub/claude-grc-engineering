#!/usr/bin/env node

/**
 * /grc-engineer:monitor-continuous
 *
 * Scheduler-friendly runner for recurring compliance checks. Wraps
 * gap-assessment.js, applies warn/critical thresholds per framework, and
 * optionally chains record-automation-metrics.js so a single cron/Actions
 * invocation keeps both gap reporting and automation-history snapshots fresh.
 *
 * Pipeline:
 *   1. Resolve frameworks + options from CLI args and/or --config=<yaml|json>.
 *   2. Spawn gap-assessment.js with --output=json and capture the summary.
 *   3. Evaluate per-framework pass rates against configured thresholds.
 *   4. Optionally spawn record-automation-metrics.js for the same period.
 *   5. Emit a structured JSON summary (stdout) + a human summary (stderr).
 *   6. Exit non-zero when any framework breaches a threshold, unless
 *      --no-exit-code is set. This is what makes the command useful to cron
 *      and GitHub Actions without extra glue.
 *
 * Usage:
 *   node plugins/grc-engineer/scripts/monitor-continuous.js SOC2,PCI-DSS,NIST-800-53
 *   node plugins/grc-engineer/scripts/monitor-continuous.js --config=./monitor-continuous.yaml
 *
 * The JSON output is the contract downstream alerting tools should read. See
 * plugins/grc-engineer/commands/monitor-continuous.md for the shape.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../..');
const GAP_ASSESSMENT_SCRIPT = path.join(__dirname, 'gap-assessment.js');
const RECORD_METRICS_SCRIPT = path.join(__dirname, 'record-automation-metrics.js');

const DEFAULT_WARN = 0.90;
const DEFAULT_CRITICAL = 0.80;

const EXIT = { OK: 0, USAGE: 2, WARNING: 2, CRITICAL: 3, ERROR: 1 };

function usage() {
  return `Usage:
  node plugins/grc-engineer/scripts/monitor-continuous.js <frameworks> [options]
  node plugins/grc-engineer/scripts/monitor-continuous.js --config=<path> [options]

Arguments:
  <frameworks>                       Comma-separated list (e.g. SOC2,PCI-DSS,NIST-800-53)

Options:
  --config=<path>                    YAML or JSON config (see examples/monitor-continuous.yaml)
  --sources=<csv>                    Forwarded to gap-assessment (default: all cached)
  --schedule=<name>                  Label only (daily|weekly|hourly). Recorded in output.
  --report-dir=<path>                Where gap-assessment writes its bundle
                                     (default: ./monitor-continuous-<run_id>/)
  --output=<path>                    Write JSON summary to this path (also printed to stdout)
  --warn-threshold=<0..1>            Per-framework pass-rate warning floor (default: ${DEFAULT_WARN})
  --critical-threshold=<0..1>        Per-framework pass-rate critical floor (default: ${DEFAULT_CRITICAL})
  --record-metrics                   After assessment, run record-automation-metrics
  --metrics-config=<path>            Config for record-automation-metrics (implies --record-metrics)
  --window-label=<label>             Forwarded to record-automation-metrics
  --cache-dir=<path>                 Forwarded to gap-assessment (finding cache dir)
  --offline                          Forwarded to gap-assessment (SCF offline mode)
  --no-exit-code                     Always exit 0, even when thresholds breach
  --quiet                            Suppress stderr progress
  --dry-run                          Resolve config + print planned actions; do not run subprocesses
  --help                             Show this help

Exit codes:
  0   ok — all frameworks at or above the warning threshold
  2   warning — at least one framework below warning threshold
  3   critical — at least one framework below critical threshold
  1   error (usage, subprocess failure)

Example config (YAML):
  frameworks: [SOC2, PCI-DSS, NIST-800-53]
  schedule: daily
  sources: [aws-inspector, github-inspector]
  thresholds:
    warning: 0.90
    critical: 0.80
  report_dir: ./monitor-reports
  record_metrics:
    enabled: true
    config: ./automation-metrics.yaml
    window_label: current-week
`;
}

function fail(message, code = EXIT.ERROR) {
  process.stderr.write(`monitor-continuous: ${message}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  const opts = {
    frameworks: [],
    configPath: null,
    sources: null,
    schedule: null,
    reportDir: null,
    outputPath: null,
    warnThreshold: null,
    criticalThreshold: null,
    recordMetrics: false,
    metricsConfig: null,
    windowLabel: null,
    cacheDir: null,
    offline: false,
    noExitCode: false,
    quiet: false,
    dryRun: false,
    help: false,
    provided: new Set()
  };

  const positionals = [];
  for (const token of argv) {
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }
    const [rawKey, rawValue] = token.slice(2).split('=');
    const key = rawKey;
    const value = rawValue ?? true;
    switch (key) {
      case 'config':
        opts.configPath = path.resolve(String(value));
        break;
      case 'sources':
        opts.sources = String(value).split(',').map(s => s.trim()).filter(Boolean);
        opts.provided.add('sources');
        break;
      case 'schedule':
        opts.schedule = String(value);
        opts.provided.add('schedule');
        break;
      case 'report-dir':
        opts.reportDir = path.resolve(String(value));
        opts.provided.add('reportDir');
        break;
      case 'output':
        opts.outputPath = path.resolve(String(value));
        opts.provided.add('outputPath');
        break;
      case 'warn-threshold':
        opts.warnThreshold = parseThreshold(value, '--warn-threshold');
        opts.provided.add('warnThreshold');
        break;
      case 'critical-threshold':
        opts.criticalThreshold = parseThreshold(value, '--critical-threshold');
        opts.provided.add('criticalThreshold');
        break;
      case 'record-metrics':
        opts.recordMetrics = true;
        opts.provided.add('recordMetrics');
        break;
      case 'metrics-config':
        opts.metricsConfig = path.resolve(String(value));
        opts.recordMetrics = true;
        opts.provided.add('metricsConfig');
        break;
      case 'window-label':
        opts.windowLabel = String(value);
        opts.provided.add('windowLabel');
        break;
      case 'cache-dir':
        opts.cacheDir = path.resolve(String(value));
        opts.provided.add('cacheDir');
        break;
      case 'offline':
        opts.offline = true;
        opts.provided.add('offline');
        break;
      case 'no-exit-code':
        opts.noExitCode = true;
        break;
      case 'quiet':
        opts.quiet = true;
        break;
      case 'dry-run':
        opts.dryRun = true;
        break;
      case 'help':
      case 'h':
        opts.help = true;
        break;
      default:
        fail(`Unknown flag: --${key}`, EXIT.USAGE);
    }
  }

  if (positionals[0]) {
    opts.frameworks = positionals[0].split(',').map(s => s.trim()).filter(Boolean);
  }
  return opts;
}

function parseThreshold(value, flagName) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    fail(`${flagName} must be a number between 0 and 1 (got: ${value})`, EXIT.USAGE);
  }
  return parsed;
}

async function loadConfig(configPath) {
  const raw = await fs.readFile(configPath, 'utf8');
  const parsed = configPath.endsWith('.json') ? JSON.parse(raw) : yaml.load(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    fail(`config at ${configPath} must be a YAML or JSON object`, EXIT.USAGE);
  }
  return parsed;
}

function resolveConfigPath(baseDir, value) {
  if (value === undefined || value === null || value === '') return null;
  const asString = String(value);
  return path.isAbsolute(asString) ? asString : path.resolve(baseDir, asString);
}

function mergeConfigWithCli(cliOpts, configData, configPath) {
  // CLI flags override config values. Start from config, then overlay CLI.
  const baseDir = configPath ? path.dirname(configPath) : process.cwd();
  const merged = {
    frameworks: configData.frameworks || [],
    sources: configData.sources || null,
    schedule: configData.schedule || null,
    reportDir: resolveConfigPath(baseDir, configData.report_dir || configData.reportDir),
    outputPath: resolveConfigPath(baseDir, configData.output || configData.output_path),
    warnThreshold: configData.thresholds?.warning ?? null,
    criticalThreshold: configData.thresholds?.critical ?? null,
    cacheDir: resolveConfigPath(baseDir, configData.cache_dir || configData.cacheDir),
    offline: Boolean(configData.offline),
    recordMetrics: Boolean(configData.record_metrics?.enabled),
    metricsConfig: resolveConfigPath(baseDir, configData.record_metrics?.config),
    windowLabel: configData.record_metrics?.window_label || configData.record_metrics?.windowLabel || null
  };

  if (cliOpts.frameworks.length) merged.frameworks = cliOpts.frameworks;
  if (cliOpts.provided.has('sources')) merged.sources = cliOpts.sources;
  if (cliOpts.provided.has('schedule')) merged.schedule = cliOpts.schedule;
  if (cliOpts.provided.has('reportDir')) merged.reportDir = cliOpts.reportDir;
  if (cliOpts.provided.has('outputPath')) merged.outputPath = cliOpts.outputPath;
  if (cliOpts.provided.has('warnThreshold')) merged.warnThreshold = cliOpts.warnThreshold;
  if (cliOpts.provided.has('criticalThreshold')) merged.criticalThreshold = cliOpts.criticalThreshold;
  if (cliOpts.provided.has('cacheDir')) merged.cacheDir = cliOpts.cacheDir;
  if (cliOpts.provided.has('offline')) merged.offline = cliOpts.offline;
  if (cliOpts.provided.has('recordMetrics')) merged.recordMetrics = cliOpts.recordMetrics;
  if (cliOpts.provided.has('metricsConfig')) merged.metricsConfig = cliOpts.metricsConfig;
  if (cliOpts.provided.has('windowLabel')) merged.windowLabel = cliOpts.windowLabel;

  merged.warnThreshold = merged.warnThreshold ?? DEFAULT_WARN;
  merged.criticalThreshold = merged.criticalThreshold ?? DEFAULT_CRITICAL;

  if (merged.criticalThreshold > merged.warnThreshold) {
    fail(`critical threshold (${merged.criticalThreshold}) must be <= warning threshold (${merged.warnThreshold})`, EXIT.USAGE);
  }

  merged.noExitCode = cliOpts.noExitCode;
  merged.quiet = cliOpts.quiet;
  merged.dryRun = cliOpts.dryRun;

  return merged;
}

function makeRunId() {
  const d = new Date();
  const date = d.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const rand = crypto.randomBytes(4).toString('hex');
  return `${date}-${rand}`;
}

function log(resolved, message) {
  if (resolved.quiet) return;
  process.stderr.write(`[monitor-continuous] ${message}\n`);
}

function runProcess(script, args, { quiet }) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], { stdio: ['ignore', 'pipe', quiet ? 'ignore' : 'inherit'] });
    let stdout = '';
    child.stdout.on('data', chunk => { stdout += chunk.toString(); });
    child.on('error', reject);
    child.on('close', code => resolve({ code, stdout }));
  });
}

async function runGapAssessment(resolved, runId) {
  const reportDir = resolved.reportDir || path.resolve(`./monitor-continuous-${runId}`);
  const args = [
    resolved.frameworks.join(','),
    '--output=json',
    `--report-dir=${reportDir}`,
    '--quiet'
  ];
  if (resolved.sources && resolved.sources.length) args.push(`--sources=${resolved.sources.join(',')}`);
  if (resolved.cacheDir) args.push(`--cache-dir=${resolved.cacheDir}`);
  if (resolved.offline) args.push('--offline');

  log(resolved, `gap-assessment ${resolved.frameworks.join(',')} → ${path.relative(process.cwd(), reportDir) || '.'}`);
  const { code, stdout } = await runProcess(GAP_ASSESSMENT_SCRIPT, args, { quiet: resolved.quiet });
  if (code !== 0) {
    fail(`gap-assessment exited with code ${code}`, EXIT.ERROR);
  }
  let summary;
  try {
    summary = JSON.parse(stdout);
  } catch (err) {
    fail(`failed to parse gap-assessment JSON: ${err.message}`, EXIT.ERROR);
  }
  return { summary, reportDir };
}

async function runRecordMetrics(resolved, recordedAt) {
  if (!resolved.metricsConfig) {
    log(resolved, 'record-metrics requested but no metrics config supplied — skipping');
    return { skipped: true, reason: 'no-config' };
  }
  const args = [
    `--config=${resolved.metricsConfig}`,
    `--recorded-at=${recordedAt}`
  ];
  if (resolved.windowLabel) args.push(`--window-label=${resolved.windowLabel}`);
  log(resolved, `record-automation-metrics --config=${path.relative(process.cwd(), resolved.metricsConfig)}`);
  const { code, stdout } = await runProcess(RECORD_METRICS_SCRIPT, args, { quiet: resolved.quiet });
  if (code !== 0) {
    return { skipped: false, failed: true, exit_code: code };
  }
  return { skipped: false, failed: false, stdout: stdout.trim() };
}

function classifyFramework(stat, resolved) {
  const passRate = stat.evaluated > 0 ? stat.passing / stat.evaluated : null;
  let status = 'ok';
  if (passRate === null) {
    status = 'no_data';
  } else if (passRate < resolved.criticalThreshold) {
    status = 'critical';
  } else if (passRate < resolved.warnThreshold) {
    status = 'warning';
  }
  return {
    framework: stat.framework,
    display_name: stat.display_name || stat.framework,
    evaluated: stat.evaluated,
    passing: stat.passing,
    failing: stat.failing,
    inconclusive: stat.inconclusive,
    total_controls: stat.total_controls,
    pass_rate: passRate,
    pass_rate_pct: stat.pass_rate_pct,
    coverage_pct: stat.coverage_pct,
    status
  };
}

function rollupStatus(frameworkResults) {
  const order = { ok: 0, warning: 1, critical: 2, no_data: -1 };
  let worst = 'ok';
  let hasData = false;
  for (const f of frameworkResults) {
    if (f.status === 'no_data') continue;
    hasData = true;
    if ((order[f.status] ?? 0) > (order[worst] ?? 0)) worst = f.status;
  }
  return hasData ? worst : 'no_data';
}

function buildAlerts(frameworkResults, resolved) {
  const alerts = [];
  for (const f of frameworkResults) {
    if (f.status === 'critical') {
      alerts.push({
        severity: 'critical',
        framework: f.framework,
        pass_rate: f.pass_rate,
        threshold: resolved.criticalThreshold,
        message: `${f.framework} pass rate ${(f.pass_rate * 100).toFixed(1)}% below critical floor ${(resolved.criticalThreshold * 100).toFixed(0)}%`
      });
    } else if (f.status === 'warning') {
      alerts.push({
        severity: 'warning',
        framework: f.framework,
        pass_rate: f.pass_rate,
        threshold: resolved.warnThreshold,
        message: `${f.framework} pass rate ${(f.pass_rate * 100).toFixed(1)}% below warning floor ${(resolved.warnThreshold * 100).toFixed(0)}%`
      });
    } else if (f.status === 'no_data') {
      alerts.push({
        severity: 'warning',
        framework: f.framework,
        pass_rate: null,
        threshold: null,
        message: `${f.framework} has no evaluated controls — connectors may not be reporting on scope`
      });
    }
  }
  return alerts;
}

function exitCodeFor(status, noExitCode) {
  if (noExitCode) return EXIT.OK;
  if (status === 'critical') return EXIT.CRITICAL;
  if (status === 'warning') return EXIT.WARNING;
  return EXIT.OK;
}

function renderHumanSummary(result) {
  if (result.dry_run) {
    const lines = [
      '',
      `Dry run: ${result.run_id}`,
      `Frameworks: ${(result.frameworks || []).join(', ')}`,
      'Planned actions:'
    ];
    for (const action of result.planned_actions || []) {
      lines.push(`  - ${action}`);
    }
    lines.push('');
    return lines.join('\n');
  }
  const lines = [];
  lines.push('');
  lines.push(`Run: ${result.run_id}  ·  ${result.generated_at}`);
  if (result.schedule) lines.push(`Schedule: ${result.schedule}`);
  lines.push(`Frameworks: ${result.frameworks.join(', ')}`);
  lines.push(`Thresholds: warn=${result.thresholds.warning}  critical=${result.thresholds.critical}`);
  lines.push('');
  lines.push('Framework           Evaluated   Passing   Failing   Pass Rate   Status');
  lines.push('------------------  ---------   -------   -------   ---------   --------');
  for (const f of result.framework_results) {
    const rate = f.pass_rate === null ? '  n/a' : `${(f.pass_rate * 100).toFixed(1)}%`.padStart(7);
    lines.push(`${f.framework.padEnd(18)}  ${String(f.evaluated).padStart(9)}   ${String(f.passing).padStart(7)}   ${String(f.failing).padStart(7)}   ${rate}   ${f.status}`);
  }
  lines.push('');
  lines.push(`Overall: ${result.summary.overall_status.toUpperCase()}  ·  ${result.summary.tier1_blockers} tier-1, ${result.summary.tier2_findings} tier-2, ${result.summary.tier3_recommendations} tier-3`);
  if (result.alerts.length) {
    lines.push('');
    lines.push('Alerts:');
    for (const a of result.alerts) {
      lines.push(`  [${a.severity}] ${a.message}`);
    }
  }
  if (result.artifacts.gap_report_dir) {
    lines.push('');
    lines.push(`Gap report bundle: ${path.relative(process.cwd(), result.artifacts.gap_report_dir) || result.artifacts.gap_report_dir}`);
  }
  lines.push('');
  return lines.join('\n');
}

export async function runMonitor(resolved, runId) {
  if (!resolved.frameworks.length) {
    fail('Missing frameworks. Pass a comma-separated list or set `frameworks:` in --config.', EXIT.USAGE);
  }

  const generatedAt = new Date().toISOString();

  if (resolved.dryRun) {
    const plan = {
      run_id: runId,
      dry_run: true,
      generated_at: generatedAt,
      frameworks: resolved.frameworks,
      sources: resolved.sources,
      schedule: resolved.schedule,
      thresholds: { warning: resolved.warnThreshold, critical: resolved.criticalThreshold },
      planned_actions: [
        `spawn gap-assessment.js ${resolved.frameworks.join(',')} --output=json`,
        resolved.recordMetrics
          ? `spawn record-automation-metrics.js --config=${resolved.metricsConfig || '(missing)'} --window-label=${resolved.windowLabel || '(none)'}`
          : null
      ].filter(Boolean),
      report_dir: resolved.reportDir || `./monitor-continuous-${runId}`,
      output_path: resolved.outputPath
    };
    return { result: plan, exitCode: EXIT.OK };
  }

  const { summary, reportDir } = await runGapAssessment(resolved, runId);
  const frameworkResults = (summary.stats || []).map(stat => classifyFramework(stat, resolved));
  const overall = rollupStatus(frameworkResults);
  const alerts = buildAlerts(frameworkResults, resolved);

  let metricsResult = null;
  if (resolved.recordMetrics) {
    metricsResult = await runRecordMetrics(resolved, generatedAt);
  }

  const totalPassing = frameworkResults.reduce((n, f) => n + f.passing, 0);
  const totalEvaluated = frameworkResults.reduce((n, f) => n + f.evaluated, 0);

  const result = {
    schema_version: '1.0.0',
    kind: 'monitor_continuous_run',
    run_id: runId,
    generated_at: generatedAt,
    schedule: resolved.schedule,
    frameworks: resolved.frameworks,
    sources: resolved.sources || summary.sources || [],
    thresholds: {
      warning: resolved.warnThreshold,
      critical: resolved.criticalThreshold
    },
    framework_results: frameworkResults,
    summary: {
      overall_status: overall,
      overall_pass_rate: totalEvaluated > 0 ? totalPassing / totalEvaluated : null,
      tier1_blockers: summary.totals?.tier1 ?? 0,
      tier2_findings: summary.totals?.tier2 ?? 0,
      tier3_recommendations: summary.totals?.tier3 ?? 0,
      passes: summary.totals?.passes ?? 0,
      inconclusive: summary.totals?.inconclusive ?? 0
    },
    alerts,
    artifacts: {
      gap_report_dir: reportDir,
      metrics: metricsResult
    },
    gap_assessment_summary: summary
  };

  return { result, exitCode: exitCodeFor(overall, resolved.noExitCode) };
}

async function writeOutput(result, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
}

async function main() {
  const cliOpts = parseArgs(process.argv.slice(2));
  if (cliOpts.help) {
    process.stdout.write(usage());
    return;
  }

  let configData = {};
  if (cliOpts.configPath) {
    configData = await loadConfig(cliOpts.configPath);
  }
  const resolved = mergeConfigWithCli(cliOpts, configData, cliOpts.configPath);

  const runId = makeRunId();
  const { result, exitCode } = await runMonitor(resolved, runId);

  const json = JSON.stringify(result, null, 2);
  if (resolved.outputPath) {
    await writeOutput(result, resolved.outputPath);
    log(resolved, `wrote summary → ${path.relative(process.cwd(), resolved.outputPath)}`);
  }
  process.stdout.write(`${json}\n`);
  if (!resolved.quiet) {
    process.stderr.write(renderHumanSummary(result));
  }
  process.exit(exitCode);
}

const invokedFromCLI = import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedFromCLI) {
  main().catch(err => {
    process.stderr.write(`monitor-continuous: ${err.stack || err.message}\n`);
    process.exit(EXIT.ERROR);
  });
}

export { parseArgs, mergeConfigWithCli, classifyFramework, rollupStatus, buildAlerts };
