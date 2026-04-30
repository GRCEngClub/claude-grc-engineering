#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const CONFIG_DIR = process.env.CLAUDE_GRC_CONFIG_DIR || path.join(os.homedir(), '.config', 'claude-grc');
const CONFIG_FILE = path.join(CONFIG_DIR, 'connectors', 'crowdstrike-inspector.yaml');
const ENV_FILE = path.join(CONFIG_DIR, 'connectors', 'crowdstrike-inspector.env');
const CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'findings', 'crowdstrike-inspector');
const RUNS_LOG = path.join(os.homedir(), '.cache', 'claude-grc', 'runs.log');
const SOURCE = 'crowdstrike-inspector';
const SOURCE_VERSION = '0.1.0';
const EXIT = { OK: 0, USAGE: 2, AUTH: 2, PARTIAL: 4, NOT_CONFIGURED: 5 };

async function main(argv) {
  const args = parseArgs(argv);
  let config;
  try { config = parseYaml(await fs.readFile(CONFIG_FILE, 'utf8')); }
  catch { fail(EXIT.NOT_CONFIGURED, `config missing (${CONFIG_FILE}). Run /crowdstrike-inspector:setup first.`); }
  const env = await loadEnv();
  const baseUrl = config.base_url || process.env.FALCON_BASE_URL || 'https://api.crowdstrike.com';
  const clientId = process.env.FALCON_CLIENT_ID || env.FALCON_CLIENT_ID;
  const clientSecret = process.env.FALCON_CLIENT_SECRET || env.FALCON_CLIENT_SECRET;
  const limit = args.limit || config.defaults?.limit || 100;
  if (!clientId || !clientSecret) fail(EXIT.AUTH, 'missing Falcon client id/secret.');

  const token = await getToken(baseUrl, clientId, clientSecret);
  const runId = makeRunId();
  const collectedAt = new Date().toISOString();
  const startedAt = Date.now();
  const errors = [];
  const findings = [];

  const hostIds = await probe(baseUrl, `/devices/queries/devices/v1?limit=${limit}`, token);
  if (hostIds.ok) {
    const ids = hostIds.raw?.resources || [];
    const details = ids.length ? await probe(baseUrl, `/devices/entities/devices/v2?ids=${ids.map(encodeURIComponent).join('&ids=')}`, token) : { ok: true, raw: { resources: [] } };
    if (details.ok) {
      for (const host of details.raw?.resources || []) findings.push(hostFinding(host, { runId, collectedAt, baseUrl }));
    } else {
      errors.push({ endpoint: 'host-details', error: details.error });
      findings.push(tenantFinding({ runId, collectedAt, baseUrl }, [inconclusive('END-03', `Falcon host details could not be read: ${details.error}`)], { hostIds: ids }));
    }
  } else {
    errors.push({ endpoint: 'host-ids', error: hostIds.error });
    findings.push(tenantFinding({ runId, collectedAt, baseUrl }, [inconclusive('END-03', `Falcon host inventory could not be read: ${hostIds.error}`)], { hostIds: hostIds.raw }));
  }

  for (const [name, endpoint, control] of [
    ['prevention policies', '/policy/queries/prevention/v1?limit=1', 'CFG-02'],
    ['detection policies', '/policy/queries/detection-suppression/v1?limit=1', 'MON-01.2'],
    ['host groups', '/devices/queries/host-groups/v1?limit=1', 'AST-02']
  ]) {
    const res = await probe(baseUrl, endpoint, token);
    findings.push(tenantFinding({ runId, collectedAt, baseUrl }, [
      res.ok ? pass(control, `CrowdStrike ${name} endpoint is available for review.`) : inconclusive(control, `CrowdStrike ${name} could not be evaluated: ${res.error}`)
    ], { [name.replaceAll(' ', '_')]: res.raw }));
    if (!res.ok) errors.push({ endpoint: name, error: res.error });
  }

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const cachePath = path.join(CACHE_DIR, `${runId}.json`);
  await fs.writeFile(cachePath, JSON.stringify(findings, null, 2));
  const counters = { pass: 0, fail: 0, inconclusive: 0, not_applicable: 0, skipped: 0 };
  const severities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  const failingSeverities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const doc of findings) for (const ev of doc.evaluations) {
    counters[ev.status] = (counters[ev.status] || 0) + 1;
    if (ev.severity) severities[ev.severity] = (severities[ev.severity] || 0) + 1;
    if (ev.status === 'fail' && ev.severity) failingSeverities[ev.severity] = (failingSeverities[ev.severity] || 0) + 1;
  }
  const manifest = { source: SOURCE, run_id: runId, started_at: new Date(startedAt).toISOString(), duration_ms: Date.now() - startedAt, scope: baseUrl, resources: findings.length, evaluations: findings.reduce((n, d) => n + d.evaluations.length, 0), counters, severities, failing_severities: failingSeverities, errors: errors.length };
  await fs.appendFile(RUNS_LOG, JSON.stringify(manifest) + '\n');
  if (args.output === 'json') process.stdout.write(JSON.stringify({ run_id: runId, cache_path: cachePath, summary: manifest }, null, 2) + '\n');
  else if (args.output !== 'silent') process.stdout.write(`${SOURCE}: ${findings.length} resources, ${manifest.evaluations} evaluations, ${counters.fail || 0} failing.\n`);
  process.exit(errors.length ? EXIT.PARTIAL : EXIT.OK);
}

function hostFinding(host, ctx) {
  const stale = host.last_seen ? (Date.now() - Date.parse(host.last_seen)) / 86400000 > 7 : true;
  const status = String(host.status || '').toLowerCase();
  const ev = stale || status.includes('offline')
    ? failHigh('END-03', `Falcon host '${host.hostname || host.device_id}' has stale/offline sensor telemetry.`, 'Restore Falcon sensor coverage or formally retire the endpoint from inventory.')
    : pass('END-03', `Falcon host '${host.hostname || host.device_id}' has recent sensor telemetry.`);
  return doc(ctx, 'crowdstrike_host', host.device_id || host.id || host.hostname, [ev], { host }, { hostname: host.hostname || null, platform: host.platform_name || null });
}

function tenantFinding(ctx, evaluations, raw) {
  return doc(ctx, 'crowdstrike_tenant', ctx.baseUrl, evaluations, raw, {});
}

function doc(ctx, type, id, evaluations, raw, metadata) {
  return { schema_version: '1.0.0', source: SOURCE, source_version: SOURCE_VERSION, run_id: ctx.runId, collected_at: ctx.collectedAt, resource: { type, id: String(id), uri: ctx.baseUrl, region: null, account_id: ctx.baseUrl }, evaluations, raw_attributes: raw, metadata };
}

async function getToken(baseUrl, clientId, clientSecret) {
  const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret });
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/oauth2/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || !json.access_token) fail(EXIT.AUTH, json.errors?.[0]?.message || json.error || `Falcon auth failed: ${response.status}`);
  return json.access_token;
}

async function probe(baseUrl, endpoint, token) {
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}${endpoint}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(raw.errors?.[0]?.message || raw.error || `http_${response.status}`);
    return { ok: true, raw, error: null };
  } catch (err) {
    return { ok: false, raw: null, error: err.message };
  }
}

async function loadEnv() {
  try {
    const text = await fs.readFile(ENV_FILE, 'utf8');
    return Object.fromEntries(text.split(/\r?\n/).map(l => l.match(/^([A-Z0-9_]+)="?(.*?)"?$/)).filter(Boolean).map(m => [m[1], m[2]]));
  } catch { return {}; }
}

function parseArgs(argv) {
  const out = { output: 'summary', quiet: false, limit: 0 };
  for (const tok of argv) {
    if (!tok.startsWith('--')) continue;
    const [k, v] = tok.slice(2).split('=');
    if (k === 'output' && ['summary', 'json', 'silent'].includes(v)) out.output = v;
    else if (k === 'quiet') out.quiet = true;
    else if (k === 'limit') out.limit = parseInt(v, 10);
    else fail(EXIT.USAGE, `Unknown flag: --${k}`);
  }
  return out;
}

function pass(controlId, message) { return { control_framework: 'SCF', control_id: controlId, status: 'pass', severity: 'info', message }; }
function inconclusive(controlId, message) { return { control_framework: 'SCF', control_id: controlId, status: 'inconclusive', severity: 'info', message }; }
function failHigh(controlId, message, summary) { return { control_framework: 'SCF', control_id: controlId, status: 'fail', severity: 'high', message, remediation: { summary, ref: 'grc-engineer://generate-implementation/crowdstrike_sensor_coverage', effort_hours: 1, automation: 'manual' } }; }
function parseYaml(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*"?([^"]*)"?$/);
    if (m) out[m[1]] = /^\d+$/.test(m[2]) ? Number(m[2]) : m[2];
  }
  return out;
}
function makeRunId() { return `${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${crypto.randomBytes(4).toString('hex')}`; }
function fail(code, msg) { process.stderr.write(`[${SOURCE}] ${msg}\n`); process.exit(code); }
main(process.argv.slice(2)).catch(err => { process.stderr.write(`[${SOURCE}] unhandled error: ${err.stack || err.message}\n`); process.exit(1); });
