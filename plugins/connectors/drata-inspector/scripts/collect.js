#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileP = promisify(execFile);
const CONFIG_DIR = process.env.CLAUDE_GRC_CONFIG_DIR || path.join(os.homedir(), '.config', 'claude-grc');
const CONFIG_FILE = path.join(CONFIG_DIR, 'connectors', 'drata-inspector.yaml');
const CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'findings', 'drata-inspector');
const RUNS_LOG = path.join(os.homedir(), '.cache', 'claude-grc', 'runs.log');
const SOURCE = 'drata-inspector';
const SOURCE_VERSION = '0.1.0';
const EXIT = { OK: 0, USAGE: 2, AUTH: 2, PARTIAL: 4, NOT_CONFIGURED: 5 };

async function main(argv) {
  const args = parseArgs(argv);
  const log = args.quiet ? () => {} : (m) => process.stderr.write(`[${SOURCE}] ${m}\n`);
  let config;
  try {
    config = parseYaml(await fs.readFile(CONFIG_FILE, 'utf8'));
  } catch {
    fail(EXIT.NOT_CONFIGURED, `config missing (${CONFIG_FILE}). Run /drata-inspector:setup first.`);
  }

  const drata = config.drata_command || process.env.DRATA_CMD || 'drata';
  const region = config.region || process.env.DRATA_REGION || 'us';
  const limit = args.limit || config.defaults?.limit || 50;
  const maxPages = args.maxPages || config.defaults?.max_pages || 20;
  const evidenceDays = args.evidenceDays || config.defaults?.evidence_days || 60;
  const env = { ...process.env, DRATA_READ_ONLY: '1', DRATA_REGION: region };

  const startedAt = Date.now();
  const runId = makeRunId();
  const collectedAt = new Date().toISOString();
  const errors = [];
  const outputs = {};

  const workflows = [
    ['summary', ['summary', '--json', '--compact', '--limit', String(limit), '--max-pages', String(maxPages)]],
    ['controls_failing', ['controls', 'failing', '--json', '--compact', '--limit', String(limit), '--max-pages', String(maxPages)]],
    ['monitors_failing', ['monitors', 'failing', '--json', '--compact', '--limit', String(limit), '--max-pages', String(maxPages)]],
    ['connections', ['connections', 'list', '--json', '--compact', '--limit', String(limit), '--max-pages', String(maxPages)]],
    ['personnel', ['personnel', 'issues', '--json', '--compact', '--limit', String(limit), '--max-pages', String(maxPages)]],
    ['evidence', ['evidence', 'expiring', '--json', '--compact', '--days', String(evidenceDays), '--limit', String(limit), '--max-pages', String(maxPages)]]
  ];

  for (const [name, commandArgs] of workflows) {
    try {
      log(`drata ${commandArgs.join(' ')}`);
      outputs[name] = await runDrataJson(drata, commandArgs, env);
    } catch (err) {
      if (String(err.message).match(/Missing Drata API key|auth|unauthorized|forbidden/i)) fail(EXIT.AUTH, err.message);
      errors.push({ workflow: name, error: err.message });
      outputs[name] = null;
    }
  }

  const findings = buildFindings({ outputs, runId, collectedAt, region, errors });
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
    scope: region,
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

function buildFindings({ outputs, runId, collectedAt, region, errors }) {
  const docs = [];
  const orgEvaluations = [];
  const summary = outputs.summary;
  if (summary) {
    orgEvaluations.push(summary.status === 'COMPLIANT'
      ? pass('GOV-03', 'Drata summary reports compliant status.')
      : failHigh('GOV-03', `Drata summary reports ${summary.status || 'NEEDS_ATTENTION'} status.`, 'Review Drata summary recommendations and remediate failing controls, monitors, personnel issues, and disconnected integrations.'));
    const failedMonitors = Number(summary.monitors?.failed || 0);
    orgEvaluations.push(failedMonitors > 0
      ? failHigh('MON-01.2', `Drata reports ${failedMonitors} failing monitor(s).`, 'Investigate failing Drata monitors and restore automated control checks.')
      : pass('MON-01.2', 'Drata reports no failing monitors in the summary workflow.'));
    const disconnected = Number(summary.connections?.disconnected || 0) + Number(summary.connections?.failed || 0) + Number(summary.connections?.never_connected || 0);
    orgEvaluations.push(disconnected > 0
      ? failMedium('DCH-04', `Drata reports ${disconnected} integration connection(s) disconnected, failed, or never connected.`, 'Reconnect Drata integrations used for automated evidence collection.')
      : pass('DCH-04', 'Drata reports integration connections are active in the summary workflow.'));
  } else {
    orgEvaluations.push(inconclusive('GOV-03', 'Drata summary workflow did not complete.'));
  }

  for (const err of errors) {
    orgEvaluations.push(inconclusive('GOV-03', `Drata workflow ${err.workflow} did not complete: ${err.error}`));
  }

  docs.push(doc({
    runId,
    collectedAt,
    type: 'drata_tenant',
    id: `drata-${region}`,
    uri: null,
    accountId: region,
    evaluations: orgEvaluations,
    raw: { summary },
    metadata: { region, workflows: Object.keys(outputs).filter(k => outputs[k]) }
  }));

  for (const control of outputs.controls_failing?.controls || []) {
    const status = control.status || 'NEEDS_ATTENTION';
    docs.push(doc({
      runId,
      collectedAt,
      type: 'drata_control',
      id: String(control.code || control.id),
      uri: null,
      accountId: region,
      evaluations: [controlEvaluation(status, control)],
      raw: { control },
      metadata: { drata_control_code: control.code || null, drata_control_id: control.id || null }
    }));
  }

  for (const monitor of outputs.monitors_failing?.monitors || []) {
    docs.push(doc({
      runId,
      collectedAt,
      type: 'drata_monitor',
      id: String(monitor.id),
      uri: null,
      accountId: region,
      evaluations: [failHigh('MON-01.2', `Drata monitor '${monitor.name || monitor.id}' is failing.`, 'Investigate the failed Drata monitor and restore the underlying automated evidence check.')],
      raw: { monitor },
      metadata: { related_controls: monitor.controls || [] }
    }));
  }

  for (const connection of outputs.connections?.connections || []) {
    if (!['FAILED', 'DISCONNECTED', 'NEVER_CONNECTED'].includes(connection.status)) continue;
    docs.push(doc({
      runId,
      collectedAt,
      type: 'drata_connection',
      id: String(connection.id || connection.alias || connection.clientType),
      uri: null,
      accountId: region,
      evaluations: [failMedium('DCH-04', `Drata connection '${connection.alias || connection.clientType || connection.id}' is ${connection.status}.`, 'Reconnect or retire stale Drata integrations so evidence automation remains reliable.')],
      raw: { connection },
      metadata: { provider_types: connection.providers || [] }
    }));
  }

  for (const person of outputs.personnel?.personnel || []) {
    docs.push(doc({
      runId,
      collectedAt,
      type: 'drata_personnel',
      id: String(person.id || person.email),
      uri: null,
      accountId: region,
      evaluations: [failMedium('IAC-02', `Drata personnel record has ${person.failing_devices || 0} failing device compliance check(s).`, 'Resolve personnel device compliance issues or document approved exceptions.')],
      raw: { personnel: person },
      metadata: { email_present: Boolean(person.email), employment_status: person.status || null }
    }));
  }

  for (const evidence of outputs.evidence?.evidence || []) {
    docs.push(doc({
      runId,
      collectedAt,
      type: 'drata_evidence',
      id: String(evidence.id),
      uri: null,
      accountId: region,
      evaluations: [failMedium('GOV-08', `Drata evidence '${evidence.name || evidence.id}' appears stale or expiring.`, 'Refresh the evidence artifact and verify linked controls still have current support.')],
      raw: { evidence },
      metadata: { updated_at: evidence.updatedAt || null, versions: evidence.versions || 0 }
    }));
  }

  return docs;
}

function controlEvaluation(status, control) {
  switch (status) {
    case 'NO_OWNER':
      return failMedium('GOV-01', `Drata control ${control.code || control.id} has no owner.`, 'Assign a control owner in Drata and document accountability.');
    case 'NEEDS_EVIDENCE':
      return failHigh('GOV-08', `Drata control ${control.code || control.id} needs evidence.`, 'Attach current evidence or fix the automated evidence source.');
    case 'NOT_READY':
      return failHigh('GOV-03', `Drata control ${control.code || control.id} is not ready.`, 'Review control implementation status and close missing readiness tasks.');
    default:
      return failMedium('GOV-03', `Drata control ${control.code || control.id} needs attention (${status}).`, 'Review the Drata control and update implementation, evidence, and ownership.');
  }
}

function doc({ runId, collectedAt, type, id, uri, accountId, evaluations, raw, metadata }) {
  return {
    schema_version: '1.0.0',
    source: SOURCE,
    source_version: SOURCE_VERSION,
    run_id: runId,
    collected_at: collectedAt,
    resource: { type, id, uri, region: null, account_id: accountId },
    evaluations,
    raw_attributes: raw,
    metadata
  };
}

async function runDrataJson(drata, args, env) {
  const { stdout, stderr } = await execFileP(drata, args, { env, maxBuffer: 20 * 1024 * 1024 });
  try {
    return JSON.parse(stdout);
  } catch (err) {
    throw new Error(`Could not parse drata JSON for '${args.join(' ')}': ${err.message}; stderr=${stderr.trim()}`);
  }
}

function parseArgs(argv) {
  const out = { output: 'summary', quiet: false, limit: 0, maxPages: 0, evidenceDays: 0 };
  for (const tok of argv) {
    if (!tok.startsWith('--')) continue;
    const [k, v] = tok.slice(2).split('=');
    switch (k) {
      case 'output':
        if (!['summary', 'json', 'silent'].includes(v)) fail(EXIT.USAGE, `Unknown output mode: ${v}`);
        out.output = v;
        break;
      case 'quiet': out.quiet = true; break;
      case 'limit': out.limit = parseInt(v, 10); break;
      case 'max-pages': out.maxPages = parseInt(v, 10); break;
      case 'evidence-days': out.evidenceDays = parseInt(v, 10); break;
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
      ref: 'grc-engineer://generate-implementation/drata_compliance_workflow',
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
  if (v.startsWith('[') && v.endsWith(']')) return v.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
  if (/^\d+$/.test(v)) return Number(v);
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
