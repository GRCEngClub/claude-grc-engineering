#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const CONFIG_DIR = process.env.CLAUDE_GRC_CONFIG_DIR || path.join(os.homedir(), '.config', 'claude-grc');
const CONFIG_FILE = path.join(CONFIG_DIR, 'connectors', 'datadog-inspector.yaml');
const ENV_FILE = path.join(CONFIG_DIR, 'connectors', 'datadog-inspector.env');
const CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'findings', 'datadog-inspector');
const RUNS_LOG = path.join(os.homedir(), '.cache', 'claude-grc', 'runs.log');
const SOURCE = 'datadog-inspector';
const SOURCE_VERSION = '0.1.0';
const EXIT = { OK: 0, USAGE: 2, AUTH: 2, NOT_CONFIGURED: 5 };

async function main(argv) {
  const args = parseArgs(argv);
  const log = args.quiet ? () => {} : (m) => process.stderr.write(`[${SOURCE}] ${m}\n`);
  let config;
  try {
    config = parseYaml(await fs.readFile(CONFIG_FILE, 'utf8'));
  } catch {
    fail(EXIT.NOT_CONFIGURED, `config missing (${CONFIG_FILE}). Run /datadog-inspector:setup first.`);
  }

  const env = await loadEnv();
  const apiKey = process.env.DD_API_KEY || env.DD_API_KEY;
  const appKey = process.env.DD_APP_KEY || env.DD_APP_KEY;
  const site = config.site || 'datadoghq.com';
  if (!apiKey || !appKey) fail(EXIT.AUTH, 'missing Datadog API/app key. Set DD_API_KEY/DD_APP_KEY or run setup.');

  const startedAt = Date.now();
  const runId = makeRunId();
  const evaluations = [];
  const raw = {};

  try {
    raw.validate = await dd('/api/v1/validate', { apiKey, appKey, site });
    if (raw.validate.valid) evaluations.push(pass('GOV-03', 'Datadog API and application keys validated for organization inventory.'));
    else fail(EXIT.AUTH, 'Datadog credential validation returned invalid.');
  } catch (err) {
    fail(EXIT.AUTH, `Datadog credential validation failed: ${err.message}`);
  }

  const logs = await probe('/api/v1/logs/config/indexes', { apiKey, appKey, site });
  raw.logs = logs.raw;
  if (logs.ok) {
    const indexes = logs.raw?.indexes || [];
    const missingRetention = indexes.filter(i => !i.retention_days || i.retention_days < 7);
    if (indexes.length === 0) evaluations.push(inconclusive('DCH-07', 'Datadog log indexes API returned no indexes; verify logging scope manually.'));
    else if (missingRetention.length) evaluations.push(failHigh('DCH-07', `${missingRetention.length} Datadog log index(es) have less than 7 days of retention or no retention value.`, 'Set retention on Datadog log indexes according to compliance and incident-response requirements.'));
    else evaluations.push(pass('DCH-07', 'Datadog log indexes expose retention of at least 7 days.'));
  } else {
    evaluations.push(inconclusive('DCH-07', `Datadog log index retention could not be evaluated: ${logs.error}`));
  }

  const monitors = await probe('/api/v1/monitor', { apiKey, appKey, site });
  raw.monitors = monitors.raw;
  if (monitors.ok) {
    const list = Array.isArray(monitors.raw) ? monitors.raw : [];
    const critical = list.filter(m => String(m.priority || '').toLowerCase() === 'p1' || String(m.name || '').match(/critical|prod|production/i));
    if (critical.length) evaluations.push(pass('MON-01.2', `Datadog monitor inventory includes ${critical.length} critical or production monitor(s).`));
    else evaluations.push(failHigh('MON-01.2', 'No critical or production Datadog monitors were detected.', 'Define monitors for critical services and resources, with severity and routing aligned to incident response.'));
  } else {
    evaluations.push(inconclusive('MON-01.2', `Datadog monitor coverage could not be evaluated: ${monitors.error}`));
  }

  const audit = await probe('/api/v2/audit/events?filter[from]=now-1d&page[limit]=1', { apiKey, appKey, site });
  raw.audit = audit.raw;
  if (audit.ok) evaluations.push(pass('LOG-08', 'Datadog audit events API is available for review.'));
  else evaluations.push(inconclusive('LOG-08', `Datadog audit log coverage could not be evaluated: ${audit.error}`));

  const roles = await probe('/api/v2/roles?page[size]=10', { apiKey, appKey, site });
  raw.roles = roles.raw;
  if (roles.ok) evaluations.push(pass('IAC-07', 'Datadog RBAC role inventory is available for review.'));
  else evaluations.push(inconclusive('IAC-07', `Datadog RBAC roles could not be evaluated: ${roles.error}`));

  const authn = await probe('/api/v2/saml_configurations', { apiKey, appKey, site });
  raw.sso = authn.raw;
  if (authn.ok) evaluations.push(pass('IAC-04', 'Datadog SAML/SSO configuration endpoint is available for review.'));
  else evaluations.push(inconclusive('IAC-04', `Datadog SSO enforcement could not be evaluated from available API permissions: ${authn.error}`));

  const findings = [{
    schema_version: '1.0.0',
    source: SOURCE,
    source_version: SOURCE_VERSION,
    run_id: runId,
    collected_at: new Date().toISOString(),
    resource: {
      type: 'datadog_organization',
      id: site,
      uri: `https://app.${site}/`,
      region: null,
      account_id: site
    },
    evaluations,
    raw_attributes: raw,
    metadata: { site, partial_coverage: evaluations.some(e => e.status === 'inconclusive') }
  }];

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const cachePath = path.join(CACHE_DIR, `${runId}.json`);
  await fs.writeFile(cachePath, JSON.stringify(findings, null, 2));

  const counters = { pass: 0, fail: 0, inconclusive: 0, not_applicable: 0, skipped: 0 };
  const severities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  const failingSeverities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const ev of evaluations) {
    counters[ev.status] = (counters[ev.status] || 0) + 1;
    if (ev.severity) severities[ev.severity] = (severities[ev.severity] || 0) + 1;
    if (ev.status === 'fail' && ev.severity) failingSeverities[ev.severity] = (failingSeverities[ev.severity] || 0) + 1;
  }

  const manifest = {
    source: SOURCE,
    run_id: runId,
    started_at: new Date(startedAt).toISOString(),
    duration_ms: Date.now() - startedAt,
    scope: site,
    resources: findings.length,
    evaluations: evaluations.length,
    counters,
    severities,
    failing_severities: failingSeverities,
    errors: evaluations.filter(e => e.status === 'inconclusive').length
  };
  await fs.appendFile(RUNS_LOG, JSON.stringify(manifest) + '\n');

  const summary = `${SOURCE}: ${findings.length} resources, ${evaluations.length} evaluations, ${counters.fail || 0} failing (${failingSeverities.high || 0} high).`;
  if (args.output === 'json') process.stdout.write(JSON.stringify({ run_id: runId, cache_path: cachePath, summary: manifest }, null, 2) + '\n');
  else if (args.output !== 'silent') process.stdout.write(summary + '\n');
}

function parseArgs(argv) {
  const out = { output: 'summary', quiet: false };
  for (const tok of argv) {
    if (!tok.startsWith('--')) continue;
    const [k, v] = tok.slice(2).split('=');
    if (k === 'quiet') out.quiet = true;
    else if (k === 'output' && ['summary', 'json', 'silent'].includes(v)) out.output = v;
    else fail(EXIT.USAGE, `Unknown flag: --${k}`);
  }
  return out;
}

async function dd(endpoint, { apiKey, appKey, site }) {
  const response = await fetch(`https://api.${site}${endpoint}`, {
    headers: { 'DD-API-KEY': apiKey, 'DD-APPLICATION-KEY': appKey, Accept: 'application/json' }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.errors?.join('; ') || body.error || `http_${response.status}`);
  return body;
}

async function probe(endpoint, opts) {
  try {
    return { ok: true, raw: await dd(endpoint, opts), error: null };
  } catch (err) {
    return { ok: false, raw: null, error: err.message };
  }
}

async function loadEnv() {
  try {
    const text = await fs.readFile(ENV_FILE, 'utf8');
    const out = {};
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
      if (m) out[m[1]] = m[2];
    }
    return out;
  } catch {
    return {};
  }
}

function pass(controlId, message) {
  return { control_framework: 'SCF', control_id: controlId, status: 'pass', severity: 'info', message };
}

function inconclusive(controlId, message) {
  return { control_framework: 'SCF', control_id: controlId, status: 'inconclusive', severity: 'info', message };
}

function failHigh(controlId, message, summary) {
  return {
    control_framework: 'SCF',
    control_id: controlId,
    status: 'fail',
    severity: 'high',
    message,
    remediation: {
      summary,
      ref: 'grc-engineer://generate-implementation/datadog_monitoring',
      effort_hours: 1,
      automation: 'manual'
    }
  };
}

function parseYaml(text) {
  const out = {};
  const stack = [out];
  const indents = [0];
  for (const rawLine of text.split(/\r?\n/)) {
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue;
    const indent = rawLine.match(/^\s*/)[0].length;
    const line = rawLine.trim();
    while (indent < indents[indents.length - 1]) { stack.pop(); indents.pop(); }
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, rawValue] = m;
    if (rawValue === '') {
      const child = {};
      stack[stack.length - 1][key] = child;
      stack.push(child);
      indents.push(indent + 2);
    } else {
      stack[stack.length - 1][key] = parseYamlValue(rawValue);
    }
  }
  return out;
}

function parseYamlValue(raw) {
  const v = raw.trim();
  if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1);
  if (v.startsWith('[') && v.endsWith(']')) return v.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
  return v;
}

function makeRunId() {
  return `${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${crypto.randomBytes(4).toString('hex')}`;
}

function fail(code, msg) {
  process.stderr.write(`[${SOURCE}] ${msg}\n`);
  process.exit(code);
}

main(process.argv.slice(2)).catch(err => {
  process.stderr.write(`[${SOURCE}] unhandled error: ${err.stack || err.message}\n`);
  process.exit(1);
});
