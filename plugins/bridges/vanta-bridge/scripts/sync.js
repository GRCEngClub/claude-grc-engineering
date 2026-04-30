#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const CONFIG_FILE = path.join(process.env.CLAUDE_GRC_CONFIG_DIR || path.join(os.homedir(), '.config', 'claude-grc'), 'bridges', 'vanta-bridge.yaml');
const CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'findings', 'vanta-bridge');
const RUNS_LOG = path.join(os.homedir(), '.cache', 'claude-grc', 'runs.log');
const SOURCE = 'vanta-bridge';
const SOURCE_VERSION = '0.1.0';
const EXIT = { OK: 0, USAGE: 2, PARTIAL: 4, NOT_CONFIGURED: 5 };

async function main(argv) {
  const args = parseArgs(argv);
  const log = args.quiet ? () => {} : (m) => process.stderr.write(`[${SOURCE}] ${m}\n`);
  let config = {};
  try {
    config = parseYaml(await fs.readFile(CONFIG_FILE, 'utf8'));
  } catch {
    if (!args.input) fail(EXIT.NOT_CONFIGURED, `config missing (${CONFIG_FILE}). Run /vanta-bridge:setup or pass --input.`);
  }

  const inputPath = args.input || config.default_input;
  if (!inputPath) fail(EXIT.USAGE, 'missing --input=<vanta-mcp-output.json>.');

  const startedAt = Date.now();
  const runId = makeRunId();
  const collectedAt = new Date().toISOString();
  const payload = JSON.parse(await fs.readFile(inputPath, 'utf8'));
  log(`normalizing ${inputPath}`);

  const findings = [
    ...normalizeTests(payload.tests || payload.test_entities || [], { runId, collectedAt }),
    ...normalizeControls(payload.controls || [], payload.control_tests || [], payload.control_documents || [], { runId, collectedAt }),
    ...normalizeVulnerabilities(payload.vulnerabilities || [], { runId, collectedAt })
  ];

  if (findings.length === 0) {
    findings.push(doc({ runId, collectedAt }, 'vanta_export', path.basename(inputPath), [{
      control_framework: 'SCF',
      control_id: 'GOV-03',
      status: 'inconclusive',
      severity: 'info',
      message: 'Vanta bridge input did not contain tests, controls, or vulnerabilities collections.'
    }], { input_keys: Object.keys(payload) }, { input_path: inputPath }));
  }

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const cachePath = path.join(CACHE_DIR, `${runId}.json`);
  await fs.writeFile(cachePath, JSON.stringify(findings, null, 2));

  const counters = { pass: 0, fail: 0, inconclusive: 0, not_applicable: 0, skipped: 0 };
  const severities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  const failingSeverities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const finding of findings) {
    for (const ev of finding.evaluations) {
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
    scope: inputPath,
    resources: findings.length,
    evaluations: findings.reduce((n, d) => n + d.evaluations.length, 0),
    counters,
    severities,
    failing_severities: failingSeverities,
    errors: 0
  };
  await fs.appendFile(RUNS_LOG, JSON.stringify(manifest) + '\n');

  const summary = `${SOURCE}: ${findings.length} resources, ${manifest.evaluations} evaluations, ${counters.fail || 0} failing (${failingSeverities.high || 0} high, ${failingSeverities.medium || 0} medium).`;
  if (args.output === 'json') process.stdout.write(JSON.stringify({ run_id: runId, cache_path: cachePath, summary: manifest }, null, 2) + '\n');
  else if (args.output !== 'silent') process.stdout.write(summary + '\n');
}

function normalizeTests(tests, ctx) {
  return asArray(tests).map(test => {
    const status = normalizeStatus(test.status || test.result || test.outcome);
    const control = test.scf_control_id || test.control_id || test.framework_control_id || 'GOV-03';
    return doc(ctx, test.resource_type || 'vanta_test_entity', String(test.entity_id || test.resource_id || test.id || test.name), [{
      control_framework: test.scf_control_id ? 'SCF' : normalizeFramework(test.framework || test.control_framework),
      control_id: String(control),
      status,
      severity: status === 'fail' ? normalizeSeverity(test.severity, 'high') : 'info',
      message: test.message || `Vanta test '${test.name || test.id}' normalized as ${status}.`,
      ...(status === 'fail' ? { remediation: remediation(test.remediation || 'Review the failing Vanta test and remediate the linked control evidence.') } : {})
    }], { test }, { vanta_test_id: test.id || null, vanta_control_id: test.control_id || null });
  });
}

function normalizeControls(controls, controlTests, documents, ctx) {
  const testsByControl = groupBy(asArray(controlTests), item => String(item.control_id || item.controlId || item.control || ''));
  const docsByControl = groupBy(asArray(documents), item => String(item.control_id || item.controlId || item.control || ''));
  return asArray(controls).map(control => {
    const id = String(control.id || control.control_id || control.code || control.name);
    const relatedTests = testsByControl.get(id) || [];
    const relatedDocs = docsByControl.get(id) || [];
    const failing = relatedTests.filter(t => normalizeStatus(t.status || t.result || t.outcome) === 'fail').length;
    const status = failing > 0 || String(control.status || '').match(/fail|gap|not[_ -]?ready/i) ? 'fail' : 'pass';
    const framework = control.scf_control_id ? 'SCF' : normalizeFramework(control.framework || control.control_framework);
    const controlId = String(control.scf_control_id || control.framework_control_id || control.code || id);
    return doc(ctx, 'vanta_control', id, [{
      control_framework: framework,
      control_id: controlId,
      status,
      severity: status === 'fail' ? normalizeSeverity(control.severity, 'high') : 'info',
      message: status === 'fail' ? `Vanta control '${control.name || id}' has failing or incomplete linked tests.` : `Vanta control '${control.name || id}' has no failing linked tests in the bridge input.`,
      evidence_refs: relatedDocs.map(d => d.url || d.href || d.id).filter(Boolean),
      ...(status === 'fail' ? { remediation: remediation(control.remediation || 'Review linked Vanta tests and documents, then refresh evidence or remediate the control gap.') } : {})
    }], { control, tests: relatedTests, documents: relatedDocs }, { vanta_control_id: id });
  });
}

function normalizeVulnerabilities(vulnerabilities, ctx) {
  return asArray(vulnerabilities).map(vuln => doc(ctx, vuln.asset_type || 'vanta_vulnerability', String(vuln.asset_id || vuln.id || vuln.name), [{
    control_framework: 'SCF',
    control_id: 'VPM-04',
    status: 'fail',
    severity: normalizeSeverity(vuln.severity, 'high'),
    message: vuln.message || `Vanta vulnerability '${vuln.name || vuln.id}' is open.`,
    remediation: remediation(vuln.remediation || 'Remediate or formally accept the vulnerability in the source system.')
  }], { vulnerability: vuln }, { vanta_vulnerability_id: vuln.id || null }));
}

function doc(ctx, type, id, evaluations, raw, metadata) {
  return {
    schema_version: '1.0.0',
    source: SOURCE,
    source_version: SOURCE_VERSION,
    run_id: ctx.runId,
    collected_at: ctx.collectedAt,
    resource: { type, id, uri: null, region: null, account_id: 'vanta' },
    evaluations,
    raw_attributes: raw,
    metadata
  };
}

function normalizeStatus(value) {
  const s = String(value || '').toLowerCase();
  if (s.match(/fail|error|non[_ -]?compliant|not[_ -]?(ok|compliant|complete)|incomplete|broken|gap/)) return 'fail';
  if (s.match(/^(pass|passed|ok|success|successful|complete|completed|compliant)$/)) return 'pass';
  if (s.match(/skip/)) return 'skipped';
  return 'inconclusive';
}

function normalizeSeverity(value, fallback) {
  const s = String(value || fallback).toLowerCase();
  if (['critical', 'high', 'medium', 'low', 'info'].includes(s)) return s;
  return fallback;
}

function normalizeFramework(value) {
  const s = String(value || '').toLowerCase();
  if (s.includes('soc')) return 'SOC2-TSC-2017';
  if (s.includes('iso')) return 'ISO-27001-2022';
  return 'SCF';
}

function remediation(summary) {
  return { summary, ref: 'grc-engineer://generate-implementation/vanta_bridge', effort_hours: 1, automation: 'manual' };
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function groupBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
}

function parseArgs(argv) {
  const out = { input: '', output: 'summary', quiet: false };
  for (const tok of argv) {
    if (!tok.startsWith('--')) continue;
    const [k, v] = tok.slice(2).split('=');
    if (k === 'input') out.input = v;
    else if (k === 'output' && ['summary', 'json', 'silent'].includes(v)) out.output = v;
    else if (k === 'quiet') out.quiet = true;
    else fail(EXIT.USAGE, `Unknown flag: --${k}`);
  }
  return out;
}

function parseYaml(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*"?([^"]*)"?$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
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
