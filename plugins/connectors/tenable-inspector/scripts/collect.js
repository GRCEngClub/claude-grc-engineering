#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
const CONFIG_DIR = process.env.CLAUDE_GRC_CONFIG_DIR || path.join(os.homedir(), '.config', 'claude-grc');
const CONFIG_FILE = path.join(CONFIG_DIR, 'connectors', 'tenable-inspector.yaml');
const ENV_FILE = path.join(CONFIG_DIR, 'connectors', 'tenable-inspector.env');
const CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'findings', 'tenable-inspector');
const RUNS_LOG = path.join(os.homedir(), '.cache', 'claude-grc', 'runs.log');
const SOURCE = 'tenable-inspector';
const SOURCE_VERSION = '0.1.0';
const EXIT = { OK: 0, USAGE: 2, AUTH: 2, PARTIAL: 4, NOT_CONFIGURED: 5 };
async function main(argv) {
  const args = parseArgs(argv);
  let config; try { config = parseYaml(await fs.readFile(CONFIG_FILE, 'utf8')); } catch { fail(EXIT.NOT_CONFIGURED, `config missing (${CONFIG_FILE}). Run /tenable-inspector:setup first.`); }
  const env = await loadEnv();
  const baseUrl = config.base_url || 'https://cloud.tenable.com';
  const access = process.env.TENABLE_ACCESS_KEY || env.TENABLE_ACCESS_KEY;
  const secret = process.env.TENABLE_SECRET_KEY || env.TENABLE_SECRET_KEY;
  const limit = args.limit || config.defaults?.limit || 100;
  const maxAgeDays = config.defaults?.max_vulnerability_age_days || 30;
  if (!access || !secret) fail(EXIT.AUTH, 'missing Tenable access/secret key.');
  const startedAt = Date.now(), runId = makeRunId(), collectedAt = new Date().toISOString();
  const ctx = { runId, collectedAt, baseUrl };
  const findings = [], errors = [];
  const scans = await probe(baseUrl, `/scans?limit=${limit}`, access, secret);
  if (scans.ok) {
    const list = scans.raw?.scans || [];
    if (list.length === 0) findings.push(tenant(ctx, [failHigh('VPM-02', 'No Tenable scans were returned for the inspected account.', 'Create recurring vulnerability scans for in-scope assets.')], { scans: list }));
    for (const scan of list) findings.push(scanFinding(scan, ctx));
  } else { errors.push({ endpoint: 'scans', error: scans.error }); findings.push(tenant(ctx, [inconclusive('VPM-02', `Tenable scan inventory could not be evaluated: ${scans.error}`)], { scans: scans.raw })); }
  const vulns = await probe(baseUrl, `/workbenches/vulnerabilities?limit=${limit}`, access, secret);
  if (vulns.ok) {
    const rows = vulns.raw?.vulnerabilities || [];
    const old = rows.filter(v => ageDays(v.last_seen || v.last_found || v.first_found) > maxAgeDays);
    findings.push(tenant(ctx, [old.length ? failHigh('VPM-04', `${old.length} Tenable vulnerability group(s) are older than ${maxAgeDays} days.`, 'Prioritize aged vulnerabilities and document remediation or accepted risk.') : pass('VPM-04', `No vulnerability groups older than ${maxAgeDays} days were detected.`)], { vulnerabilities: rows }, { aged_vulnerability_groups: old.length }));
  } else { errors.push({ endpoint: 'vulnerabilities', error: vulns.error }); findings.push(tenant(ctx, [inconclusive('VPM-04', `Tenable vulnerability age could not be evaluated: ${vulns.error}`)], { vulnerabilities: vulns.raw })); }
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const cachePath = path.join(CACHE_DIR, `${runId}.json`);
  await fs.writeFile(cachePath, JSON.stringify(findings, null, 2));
  const counters = { pass: 0, fail: 0, inconclusive: 0, not_applicable: 0, skipped: 0 }, severities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }, failing_severities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const d of findings) for (const e of d.evaluations) { counters[e.status]++; if (e.severity) severities[e.severity]++; if (e.status === 'fail' && e.severity) failing_severities[e.severity]++; }
  const manifest = { source: SOURCE, run_id: runId, started_at: new Date(startedAt).toISOString(), duration_ms: Date.now() - startedAt, scope: baseUrl, resources: findings.length, evaluations: findings.reduce((n, d) => n + d.evaluations.length, 0), counters, severities, failing_severities, errors: errors.length };
  await fs.appendFile(RUNS_LOG, JSON.stringify(manifest) + '\n');
  if (args.output === 'json') process.stdout.write(JSON.stringify({ run_id: runId, cache_path: cachePath, summary: manifest }, null, 2) + '\n');
  else if (args.output !== 'silent') process.stdout.write(`${SOURCE}: ${findings.length} resources, ${manifest.evaluations} evaluations, ${counters.fail} failing.\n`);
  process.exit(errors.length ? EXIT.PARTIAL : EXIT.OK);
}
function scanFinding(scan, ctx) {
  const credentialed = Boolean(scan.credentials || scan.credentialed || String(scan.name || '').match(/credential/i));
  const evals = [
    pass('VPM-02', `Tenable scan '${scan.name || scan.id}' is present in scan inventory.`),
    credentialed ? pass('VPM-03', `Tenable scan '${scan.name || scan.id}' has credentialed scan signals.`) : inconclusive('VPM-03', `Tenable scan '${scan.name || scan.id}' did not expose credentialed scan evidence.`)
  ];
  return doc(ctx, 'tenable_scan', scan.id || scan.uuid || scan.name, evals, { scan }, { name: scan.name || null, status: scan.status || null });
}
function tenant(ctx, evaluations, raw, metadata = {}) { return doc(ctx, 'tenable_tenant', ctx.baseUrl, evaluations, raw, metadata); }
function doc(ctx, type, id, evaluations, raw, metadata) { return { schema_version: '1.0.0', source: SOURCE, source_version: SOURCE_VERSION, run_id: ctx.runId, collected_at: ctx.collectedAt, resource: { type, id: String(id), uri: ctx.baseUrl, region: null, account_id: ctx.baseUrl }, evaluations, raw_attributes: raw, metadata }; }
async function probe(baseUrl, endpoint, access, secret) { try { const r = await fetch(`${baseUrl.replace(/\/$/, '')}${endpoint}`, { headers: { Accept: 'application/json', 'X-ApiKeys': `accessKey=${access}; secretKey=${secret}` } }); const raw = await r.json().catch(() => ({})); if (!r.ok) throw new Error(raw.error_msg || raw.error || `http_${r.status}`); return { ok: true, raw }; } catch (e) { return { ok: false, raw: null, error: e.message }; } }
async function loadEnv() { try { return Object.fromEntries((await fs.readFile(ENV_FILE, 'utf8')).split(/\r?\n/).map(l => l.match(/^([A-Z0-9_]+)="?(.*?)"?$/)).filter(Boolean).map(m => [m[1], m[2]])); } catch { return {}; } }
function ageDays(v) { const t = Date.parse(v || ''); return Number.isFinite(t) ? (Date.now() - t) / 86400000 : 0; }
function parseArgs(argv) { const out = { output: 'summary', quiet: false, limit: 0 }; for (const tok of argv) { if (!tok.startsWith('--')) continue; const [k, v] = tok.slice(2).split('='); if (k === 'output' && ['summary', 'json', 'silent'].includes(v)) out.output = v; else if (k === 'quiet') out.quiet = true; else if (k === 'limit') out.limit = parseInt(v, 10); else fail(EXIT.USAGE, `Unknown flag: --${k}`); } return out; }
function pass(id, message) { return { control_framework: 'SCF', control_id: id, status: 'pass', severity: 'info', message }; }
function inconclusive(id, message) { return { control_framework: 'SCF', control_id: id, status: 'inconclusive', severity: 'info', message }; }
function failHigh(id, message, summary) { return { control_framework: 'SCF', control_id: id, status: 'fail', severity: 'high', message, remediation: { summary, ref: 'grc-engineer://generate-implementation/tenable_vulnerability_management', effort_hours: 1, automation: 'manual' } }; }
function parseYaml(text) { const out = {}; for (const line of text.split(/\r?\n/)) { const m = line.match(/^([A-Za-z0-9_-]+):\s*"?([^"]*)"?$/); if (m) out[m[1]] = /^\d+$/.test(m[2]) ? Number(m[2]) : m[2]; } return out; }
function makeRunId() { return `${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${crypto.randomBytes(4).toString('hex')}`; }
function fail(code, msg) { process.stderr.write(`[${SOURCE}] ${msg}\n`); process.exit(code); }
main(process.argv.slice(2)).catch(err => { process.stderr.write(`[${SOURCE}] unhandled error: ${err.stack || err.message}\n`); process.exit(1); });
