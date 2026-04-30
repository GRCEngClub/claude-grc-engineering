#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const CONFIG_DIR = process.env.CLAUDE_GRC_CONFIG_DIR || path.join(os.homedir(), '.config', 'claude-grc');
const CONFIG_FILE = path.join(CONFIG_DIR, 'connectors', 'splunk-inspector.yaml');
const ENV_FILE = path.join(CONFIG_DIR, 'connectors', 'splunk-inspector.env');
const CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'findings', 'splunk-inspector');
const RUNS_LOG = path.join(os.homedir(), '.cache', 'claude-grc', 'runs.log');
const SOURCE = 'splunk-inspector';
const SOURCE_VERSION = '0.1.0';
const EXIT = { OK: 0, USAGE: 2, AUTH: 2, PARTIAL: 4, NOT_CONFIGURED: 5 };

async function main(argv) {
  const args = parseArgs(argv);
  const log = args.quiet ? () => {} : (m) => process.stderr.write(`[${SOURCE}] ${m}\n`);
  let config;
  try {
    config = parseYaml(await fs.readFile(CONFIG_FILE, 'utf8'));
  } catch {
    fail(EXIT.NOT_CONFIGURED, `config missing (${CONFIG_FILE}). Run /splunk-inspector:setup first.`);
  }

  const env = await loadEnv();
  const auth = {
    token: process.env.SPLUNK_TOKEN || env.SPLUNK_TOKEN,
    username: process.env.SPLUNK_USERNAME || env.SPLUNK_USERNAME,
    password: process.env.SPLUNK_PASSWORD || env.SPLUNK_PASSWORD
  };
  const baseUrl = config.base_url || process.env.SPLUNK_BASE_URL;
  const minRetentionDays = args.minRetentionDays || config.defaults?.min_retention_days || 30;
  if (!baseUrl) fail(EXIT.NOT_CONFIGURED, 'missing Splunk base_url in config.');
  if (!auth.token && (!auth.username || !auth.password)) fail(EXIT.AUTH, 'missing Splunk token or username/password.');
  if (config.insecure === true || config.insecure === 'true') process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const startedAt = Date.now();
  const runId = makeRunId();
  const collectedAt = new Date().toISOString();
  const errors = [];
  const findings = [];

  const server = await probe(baseUrl, '/services/server/info', auth);
  if (!server.ok) fail(EXIT.AUTH, `Splunk server/info failed: ${server.error}`);
  log(`connected to ${baseUrl}`);

  const indexes = await probe(baseUrl, '/services/data/indexes', auth);
  if (indexes.ok) {
    for (const item of entries(indexes.raw)) findings.push(indexFinding(item, { runId, collectedAt, baseUrl, minRetentionDays }));
  } else {
    errors.push({ endpoint: 'indexes', error: indexes.error });
    findings.push(tenantFinding({ runId, collectedAt, baseUrl, evaluations: [inconclusive('LOG-05', `Splunk index retention could not be evaluated: ${indexes.error}`)], raw: { indexes: indexes.raw } }));
  }

  const roles = await probe(baseUrl, '/services/authorization/roles', auth);
  if (roles.ok) {
    for (const item of entries(roles.raw)) findings.push(roleFinding(item, { runId, collectedAt, baseUrl }));
  } else {
    errors.push({ endpoint: 'roles', error: roles.error });
    findings.push(tenantFinding({ runId, collectedAt, baseUrl, evaluations: [inconclusive('IAC-07', `Splunk RBAC roles could not be evaluated: ${roles.error}`)], raw: { roles: roles.raw } }));
  }

  const users = await probe(baseUrl, '/services/authentication/users', auth);
  findings.push(userAuthFinding(users, { runId, collectedAt, baseUrl }));
  if (!users.ok) errors.push({ endpoint: 'users', error: users.error });

  const savedSearches = await probe(baseUrl, '/servicesNS/-/-/saved/searches', auth);
  if (savedSearches.ok) {
    const shared = entries(savedSearches.raw).filter(s => ['global', 'app'].includes(String(s.acl?.sharing || '').toLowerCase()));
    findings.push(savedSearchAclFinding(shared, { runId, collectedAt, baseUrl, raw: savedSearches.raw }));
  } else {
    errors.push({ endpoint: 'saved-searches', error: savedSearches.error });
    findings.push(tenantFinding({ runId, collectedAt, baseUrl, evaluations: [inconclusive('IAC-07', `Splunk saved-search ACLs could not be evaluated: ${savedSearches.error}`)], raw: { saved_searches: savedSearches.raw } }));
  }

  const auditIndex = entries(indexes.raw).find(i => i.name === '_audit' || i.name === 'audit');
  findings.push(auditCoverageFinding(auditIndex, { runId, collectedAt, baseUrl }));

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const cachePath = path.join(CACHE_DIR, `${runId}.json`);
  await fs.writeFile(cachePath, JSON.stringify(findings, null, 2));

  const counters = { pass: 0, fail: 0, inconclusive: 0, not_applicable: 0, skipped: 0 };
  const severities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  const failingSeverities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const doc of findings) {
    for (const ev of doc.evaluations) {
      counters[ev.status] = (counters[ev.status] || 0) + 1;
      if (ev.severity) severities[ev.severity] = (severities[ev.severity] || 0) + 1;
      if (ev.status === 'fail' && ev.severity) failingSeverities[ev.severity] = (failingSeverities[ev.severity] || 0) + 1;
    }
  }

  const manifest = {
    source: SOURCE,
    run_id: runId,
    started_at: new Date(startedAt).toISOString(),
    duration_ms: Date.now() - startedAt,
    scope: baseUrl,
    resources: findings.length,
    evaluations: findings.reduce((n, d) => n + d.evaluations.length, 0),
    counters,
    severities,
    failing_severities: failingSeverities,
    errors: errors.length
  };
  await fs.appendFile(RUNS_LOG, JSON.stringify(manifest) + '\n');

  const summary = `${SOURCE}: ${findings.length} resources, ${manifest.evaluations} evaluations, ${counters.fail || 0} failing (${failingSeverities.high || 0} high, ${failingSeverities.medium || 0} medium).`;
  if (args.output === 'json') process.stdout.write(JSON.stringify({ run_id: runId, cache_path: cachePath, summary: manifest }, null, 2) + '\n');
  else if (args.output !== 'silent') process.stdout.write(summary + '\n');
  process.exit(errors.length ? EXIT.PARTIAL : EXIT.OK);
}

function indexFinding(index, ctx) {
  const frozenSeconds = Number(index.content?.frozenTimePeriodInSecs ?? index.content?.maxGlobalDataSizeMB ?? 0);
  const retentionDays = frozenSeconds > 0 ? Math.floor(frozenSeconds / 86400) : null;
  const evaluation = retentionDays === null
    ? inconclusive('LOG-05', `Splunk index '${index.name}' does not expose retention seconds.`)
    : retentionDays < ctx.minRetentionDays
      ? failHigh('LOG-05', `Splunk index '${index.name}' retention is ${retentionDays} day(s), below ${ctx.minRetentionDays}.`, 'Increase Splunk index retention to meet logging and audit evidence requirements.')
      : pass('LOG-05', `Splunk index '${index.name}' retention is ${retentionDays} day(s).`);
  return doc(ctx, 'splunk_index', index.name, [evaluation], { index }, { retention_days: retentionDays });
}

function roleFinding(role, ctx) {
  const caps = role.content?.capabilities || [];
  const highRisk = caps.filter(c => ['admin_all_objects', 'edit_roles', 'edit_user', 'indexes_edit', 'schedule_search'].includes(c));
  const evaluation = highRisk.length
    ? failMedium('IAC-07', `Splunk role '${role.name}' has broad capabilities: ${highRisk.join(', ')}.`, 'Review broad Splunk capabilities and restrict administrative permissions to least privilege.')
    : pass('IAC-07', `Splunk role '${role.name}' does not expose broad administrative capabilities in the inspected set.`);
  return doc(ctx, 'splunk_role', role.name, [evaluation], { role }, { capabilities: caps });
}

function userAuthFinding(users, ctx) {
  if (!users.ok) return tenantFinding({ ...ctx, evaluations: [inconclusive('IAC-04', `Splunk users/auth methods could not be evaluated: ${users.error}`)], raw: { users: users.raw } });
  const list = entries(users.raw);
  const localUsers = list.filter(u => String(u.content?.type || u.content?.authType || '').toLowerCase().includes('splunk'));
  const evaluation = localUsers.length
    ? failMedium('IAC-04', `${localUsers.length} Splunk user(s) appear to use local/Splunk authentication.`, 'Prefer SAML/LDAP/SSO-backed Splunk authentication and document any local break-glass accounts.')
    : pass('IAC-04', 'No local/Splunk-authenticated users were detected from the inspected user API response.');
  return tenantFinding({ ...ctx, evaluations: [evaluation], raw: { users: users.raw }, metadata: { local_user_count: localUsers.length } });
}

function savedSearchAclFinding(shared, ctx) {
  const evaluation = shared.length
    ? failMedium('IAC-07', `${shared.length} saved search(es) are shared at app/global scope.`, 'Review saved-search ACLs and limit write access to approved owners.')
    : pass('IAC-07', 'No app/global shared saved searches were detected.');
  return tenantFinding({ ...ctx, evaluations: [evaluation], raw: { saved_searches: ctx.raw }, metadata: { broad_saved_searches: shared.length } });
}

function auditCoverageFinding(auditIndex, ctx) {
  const evaluation = auditIndex
    ? pass('LOG-08', 'Splunk audit index is present for platform activity coverage.')
    : failHigh('LOG-08', 'No Splunk _audit or audit index was detected.', 'Enable and retain Splunk audit events for administrative activity monitoring.');
  return tenantFinding({ ...ctx, evaluations: [evaluation], raw: { audit_index: auditIndex || null } });
}

function tenantFinding({ runId, collectedAt, baseUrl, evaluations, raw, metadata = {} }) {
  return doc({ runId, collectedAt, baseUrl }, 'splunk_deployment', baseUrl, evaluations, raw, metadata);
}

function doc(ctx, type, id, evaluations, raw, metadata = {}) {
  return {
    schema_version: '1.0.0',
    source: SOURCE,
    source_version: SOURCE_VERSION,
    run_id: ctx.runId,
    collected_at: ctx.collectedAt,
    resource: { type, id: String(id), uri: ctx.baseUrl, region: null, account_id: ctx.baseUrl },
    evaluations,
    raw_attributes: raw,
    metadata
  };
}

async function probe(baseUrl, endpoint, auth) {
  try {
    return { ok: true, raw: await splunk(baseUrl, endpoint, auth), error: null };
  } catch (err) {
    return { ok: false, raw: err.body || null, error: err.message };
  }
}

async function splunk(baseUrl, endpoint, auth) {
  const url = `${baseUrl.replace(/\/$/, '')}${endpoint}${endpoint.includes('?') ? '&' : '?'}output_mode=json`;
  const headers = { Accept: 'application/json' };
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`;
  else headers.Authorization = `Basic ${Buffer.from(`${auth.username}:${auth.password}`).toString('base64')}`;
  const response = await fetch(url, { headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(body.messages?.[0]?.text || body.error || `http_${response.status}`);
    err.body = body;
    throw err;
  }
  return body;
}

function entries(payload) {
  return Array.isArray(payload?.entry) ? payload.entry : [];
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

function parseArgs(argv) {
  const out = { output: 'summary', quiet: false, minRetentionDays: 0 };
  for (const tok of argv) {
    if (!tok.startsWith('--')) continue;
    const [k, v] = tok.slice(2).split('=');
    switch (k) {
      case 'output':
        if (!['summary', 'json', 'silent'].includes(v)) fail(EXIT.USAGE, `Unknown output mode: ${v}`);
        out.output = v;
        break;
      case 'quiet': out.quiet = true; break;
      case 'min-retention-days': out.minRetentionDays = parseInt(v, 10); break;
      default: fail(EXIT.USAGE, `Unknown flag: --${k}`);
    }
  }
  return out;
}

function pass(controlId, message) {
  return { control_framework: 'SCF', control_id: controlId, status: 'pass', severity: 'info', message };
}

function inconclusive(controlId, message) {
  return { control_framework: 'SCF', control_id: controlId, status: 'inconclusive', severity: 'info', message };
}

function failHigh(controlId, message, summary) {
  return failEval(controlId, 'high', message, summary);
}

function failMedium(controlId, message, summary) {
  return failEval(controlId, 'medium', message, summary);
}

function failEval(controlId, severity, message, summary) {
  return {
    control_framework: 'SCF',
    control_id: controlId,
    status: 'fail',
    severity,
    message,
    remediation: {
      summary,
      ref: 'grc-engineer://generate-implementation/splunk_logging',
      effort_hours: severity === 'high' ? 1 : 0.5,
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
  if (/^\d+$/.test(v)) return Number(v);
  if (v === 'true') return true;
  if (v === 'false') return false;
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
