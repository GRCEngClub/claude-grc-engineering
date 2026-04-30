#!/usr/bin/env node

/**
 * slack-inspector:collect
 *
 * Queries Slack Web API, evaluates workspace-level security posture, and
 * writes Finding documents to the shared claude-grc cache.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const CONFIG_DIR = process.env.CLAUDE_GRC_CONFIG_DIR || path.join(os.homedir(), '.config', 'claude-grc');
const CONFIG_FILE = path.join(CONFIG_DIR, 'connectors', 'slack-inspector.yaml');
const TOKEN_FILE = path.join(CONFIG_DIR, 'connectors', 'slack-inspector.token');
const CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'findings', 'slack-inspector');
const RUNS_LOG = path.join(os.homedir(), '.cache', 'claude-grc', 'runs.log');
const SOURCE = 'slack-inspector';
const SOURCE_VERSION = '0.1.0';
const EXIT = { OK: 0, USAGE: 2, AUTH: 2, PARTIAL: 4, NOT_CONFIGURED: 5 };

async function main(argv) {
  const args = parseArgs(argv);
  const log = args.quiet ? () => {} : (m) => process.stderr.write(`[${SOURCE}] ${m}\n`);
  let config;
  try {
    config = parseYaml(await fs.readFile(CONFIG_FILE, 'utf8'));
  } catch {
    fail(EXIT.NOT_CONFIGURED, `config missing (${CONFIG_FILE}). Run /slack-inspector:setup first.`);
  }

  const token = await getToken();
  if (!token) fail(EXIT.AUTH, 'missing Slack token. Set SLACK_TOKEN or run /slack-inspector:setup.');

  const runId = makeRunId();
  const startedAt = Date.now();
  const findings = [];
  const errors = [];

  let auth;
  try {
    auth = await slack('auth.test', {}, token);
  } catch (err) {
    fail(EXIT.AUTH, `Slack auth.test failed: ${err.message}`);
  }

  const team = {
    id: auth.team_id || config.team_id || 'unknown-team',
    name: auth.team || config.team_name || config.workspace || 'unknown-workspace',
    url: auth.url || null
  };
  log(`team=${team.name} (${team.id})`);

  const workspaceEvaluations = [];
  const raw = { auth: scrubAuth(auth), team: null, admins: {}, retention: null, apps: null, dlp: null };

  try {
    raw.team = await slack('team.info', {}, token);
    workspaceEvaluations.push(pass('GOV-03', 'Slack workspace metadata is readable for this connector run.'));
  } catch (err) {
    workspaceEvaluations.push(inconclusive('GOV-03', `Slack team.info was unavailable: ${err.message}`));
    errors.push({ check: 'team.info', error: err.message });
  }

  const twoFa = await adminProbe('admin.users.info', { user_id: auth.user_id }, token);
  raw.admins.user_info = twoFa.raw;
  if (twoFa.ok && typeof twoFa.raw?.user?.has_2fa === 'boolean') {
    if (twoFa.raw.user.has_2fa) workspaceEvaluations.push(pass('IAC-02', 'The inspected principal has 2FA enabled.'));
    else workspaceEvaluations.push(failHigh('IAC-02', 'The inspected Slack principal does not have 2FA enabled.', 'Require 2FA for Slack users and administrators.'));
  } else {
    workspaceEvaluations.push(inconclusive('IAC-02', `Slack 2FA enforcement requires admin visibility: ${twoFa.error}`));
  }

  const retention = await adminProbe('admin.conversations.getConversationPrefs', { channel_id: config.defaults?.retention_channel_id || '' }, token);
  raw.retention = retention.raw;
  if (retention.ok && retention.raw?.prefs) {
    workspaceEvaluations.push(pass('DCH-07', 'Slack retention preferences were available for review.'));
  } else {
    workspaceEvaluations.push(inconclusive('DCH-07', `Slack retention policy requires admin or channel-specific visibility: ${retention.error}`));
  }

  const apps = await adminProbe('admin.apps.approved.list', { limit: 1 }, token);
  raw.apps = apps.raw;
  if (apps.ok) {
    workspaceEvaluations.push(pass('TPM-03', 'Slack app approval data is available for review.'));
  } else {
    workspaceEvaluations.push(inconclusive('TPM-03', `Slack app approval data requires admin app scopes: ${apps.error}`));
  }

  const dlp = await adminProbe('discovery.enterprise.info', {}, token);
  raw.dlp = dlp.raw;
  if (dlp.ok) {
    workspaceEvaluations.push(pass('DLP-01', 'Slack discovery/DLP integration visibility is available.'));
  } else {
    workspaceEvaluations.push(inconclusive('DLP-01', `Slack DLP/discovery visibility requires Enterprise Grid or discovery scopes: ${dlp.error}`));
  }

  workspaceEvaluations.push(inconclusive('IAC-04', 'Slack SSO and session-duration enforcement are not exposed by the standard bot token API; verify in Enterprise Admin settings or provide an admin-scoped integration.'));

  findings.push({
    schema_version: '1.0.0',
    source: SOURCE,
    source_version: SOURCE_VERSION,
    run_id: runId,
    collected_at: new Date().toISOString(),
    resource: {
      type: 'slack_workspace',
      id: team.id,
      uri: team.url,
      region: null,
      account_id: team.id
    },
    evaluations: workspaceEvaluations,
    raw_attributes: raw,
    metadata: {
      workspace: team.name,
      token_principal: auth.user_id || null,
      partial_coverage: workspaceEvaluations.some(e => e.status === 'inconclusive')
    }
  });

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
    scope: team.id,
    resources: findings.length,
    evaluations: findings.reduce((n, d) => n + d.evaluations.length, 0),
    counters,
    severities,
    failing_severities: failingSeverities,
    errors: errors.length
  };
  await fs.appendFile(RUNS_LOG, JSON.stringify(manifest) + '\n');

  const summary = `${SOURCE}: ${findings.length} resources, ${manifest.evaluations} evaluations, ${counters.fail || 0} failing (${failingSeverities.high || 0} high, ${failingSeverities.medium || 0} medium, ${failingSeverities.low || 0} low).`;
  if (args.output === 'json') process.stdout.write(JSON.stringify({ run_id: runId, cache_path: cachePath, summary: manifest }, null, 2) + '\n');
  else if (args.output !== 'silent') process.stdout.write(summary + '\n');

  process.exit(errors.length ? EXIT.PARTIAL : EXIT.OK);
}

function parseArgs(argv) {
  const out = { output: 'summary', quiet: false };
  for (const tok of argv) {
    if (!tok.startsWith('--')) continue;
    const [k, v] = tok.slice(2).split('=');
    switch (k) {
      case 'output':
        if (!['summary', 'json', 'silent'].includes(v)) fail(EXIT.USAGE, `Unknown output mode: ${v}`);
        out.output = v;
        break;
      case 'quiet':
        out.quiet = true;
        break;
      default:
        fail(EXIT.USAGE, `Unknown flag: --${k}`);
    }
  }
  return out;
}

async function getToken() {
  if (process.env.SLACK_TOKEN) return process.env.SLACK_TOKEN;
  try {
    return (await fs.readFile(TOKEN_FILE, 'utf8')).trim();
  } catch {
    return '';
  }
}

async function slack(method, params, token) {
  const url = new URL(`https://slack.com/api/${method}`);
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.ok) {
    const err = new Error(body.error || `http_${response.status}`);
    err.body = body;
    throw err;
  }
  return body;
}

async function adminProbe(method, params, token) {
  try {
    const raw = await slack(method, params, token);
    return { ok: true, raw, error: null };
  } catch (err) {
    return { ok: false, raw: err.body || null, error: err.message };
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
      ref: 'grc-engineer://generate-implementation/slack_workspace_security',
      effort_hours: 1,
      automation: 'manual'
    }
  };
}

function scrubAuth(auth) {
  return {
    team: auth.team,
    team_id: auth.team_id,
    url: auth.url,
    user_id: auth.user_id,
    bot_id: auth.bot_id,
    enterprise_id: auth.enterprise_id
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
  if (v.startsWith('[') && v.endsWith(']')) {
    return v.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
  }
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

if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv.slice(2)).catch(err => {
    process.stderr.write(`[${SOURCE}] unhandled error: ${err.stack || err.message}\n`);
    process.exit(1);
  });
}
