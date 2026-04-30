#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileP = promisify(execFile);
const CONFIG_DIR = process.env.CLAUDE_GRC_CONFIG_DIR || path.join(os.homedir(), '.config', 'claude-grc');
const CONFIG_FILE = path.join(CONFIG_DIR, 'connectors', 'snowflake-inspector.yaml');
const CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'findings', 'snowflake-inspector');
const RUNS_LOG = path.join(os.homedir(), '.cache', 'claude-grc', 'runs.log');
const SOURCE = 'snowflake-inspector', SOURCE_VERSION = '0.1.0';
const EXIT = { OK: 0, USAGE: 2, AUTH: 2, PARTIAL: 4, NOT_CONFIGURED: 5 };
async function main(argv) {
  const args = parseArgs(argv);
  let config; try { config = parseYaml(await fs.readFile(CONFIG_FILE, 'utf8')); } catch { fail(EXIT.NOT_CONFIGURED, `config missing (${CONFIG_FILE}). Run /snowflake-inspector:setup first.`); }
  const startedAt = Date.now(), runId = makeRunId(), collectedAt = new Date().toISOString();
  const ctx = { runId, collectedAt, account: config.account };
  const findings = [], errors = [];
  const checks = [
    ['users', "select name, has_mfa, disabled from snowflake.account_usage.users where deleted_on is null limit 500"],
    ['network_policies', "select count(*) as count from snowflake.account_usage.network_policies where deleted is null"],
    ['masking_policies', "select count(*) as count from snowflake.account_usage.masking_policies where deleted is null"],
    ['row_access_policies', "select count(*) as count from snowflake.account_usage.row_access_policies where deleted is null"],
    ['parameters', "show parameters like 'STATEMENT_TIMEOUT_IN_SECONDS' in account"],
    ['databases', "show databases"]
  ];
  const raw = {};
  for (const [name, sql] of checks) {
    const res = await snowsql(config, sql);
    raw[name] = res.ok ? res.rows : res.error;
    if (!res.ok) errors.push({ check: name, error: res.error });
  }
  findings.push(tenant(ctx, [evalMfa(raw.users), evalCount(raw.network_policies, 'NET-06', 'network policies'), evalCount(raw.masking_policies, 'DCH-06', 'masking policies'), evalCount(raw.row_access_policies, 'DCH-07', 'row access policies'), evalSession(raw.parameters), evalRetention(raw.databases, config.defaults?.min_retention_days || 1), ...errors.map(e => inconclusive('GOV-03', `Snowflake ${e.check} query failed: ${e.error}`))], raw));
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const cachePath = path.join(CACHE_DIR, `${runId}.json`);
  await fs.writeFile(cachePath, JSON.stringify(findings, null, 2));
  const counters = { pass: 0, fail: 0, inconclusive: 0, not_applicable: 0, skipped: 0 }, severities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }, failing_severities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const d of findings) for (const e of d.evaluations) { counters[e.status]++; if (e.severity) severities[e.severity]++; if (e.status === 'fail' && e.severity) failing_severities[e.severity]++; }
  const manifest = { source: SOURCE, run_id: runId, started_at: new Date(startedAt).toISOString(), duration_ms: Date.now() - startedAt, scope: config.account, resources: findings.length, evaluations: findings[0].evaluations.length, counters, severities, failing_severities, errors: errors.length };
  await fs.appendFile(RUNS_LOG, JSON.stringify(manifest) + '\n');
  if (args.output === 'json') process.stdout.write(JSON.stringify({ run_id: runId, cache_path: cachePath, summary: manifest }, null, 2) + '\n');
  else if (args.output !== 'silent') process.stdout.write(`${SOURCE}: ${findings.length} resources, ${manifest.evaluations} evaluations, ${counters.fail} failing.\n`);
  process.exit(errors.length ? EXIT.PARTIAL : EXIT.OK);
}
async function snowsql(config, sql) {
  const argv = ['-a', config.account, '-u', config.user, '-q', sql, '-o', 'output_format=json', '-o', 'friendly=false'];
  if (config.warehouse) argv.splice(4, 0, '-w', config.warehouse);
  if (config.role) argv.splice(4, 0, '-r', config.role);
  try { const { stdout } = await execFileP('snowsql', argv, { maxBuffer: 10 * 1024 * 1024 }); const parsed = JSON.parse(stdout); return { ok: true, rows: Array.isArray(parsed) ? parsed : parsed.data || [] }; } catch (e) { return { ok: false, error: e.message }; }
}
function evalMfa(rows) {
  if (!Array.isArray(rows)) return inconclusive('IAC-02', 'Snowflake user MFA posture could not be evaluated.');
  const active = rows.filter(r => !truthy(r.DISABLED ?? r.disabled));
  const noMfa = active.filter(r => !truthy(r.HAS_MFA ?? r.has_mfa));
  return noMfa.length ? failHigh('IAC-02', `${noMfa.length} active Snowflake user(s) do not show MFA enabled.`, 'Require MFA or federated SSO controls for Snowflake users.') : pass('IAC-02', 'All inspected active Snowflake users show MFA enabled.');
}
function evalCount(rows, control, label) {
  if (!Array.isArray(rows)) return inconclusive(control, `Snowflake ${label} could not be evaluated.`);
  const count = Number(rows[0]?.COUNT ?? rows[0]?.count ?? 0);
  return count > 0 ? pass(control, `Snowflake account has ${count} ${label}.`) : inconclusive(control, `No Snowflake ${label} were detected; verify applicability for sensitive datasets.`);
}
function evalSession(rows) { return Array.isArray(rows) ? pass('IAC-04', 'Snowflake session timeout parameter is visible for review.') : inconclusive('IAC-04', 'Snowflake session timeout could not be evaluated.'); }
function evalRetention(rows, minDays) { return Array.isArray(rows) ? pass('DCH-09', `Snowflake database retention settings are visible; verify databases meet at least ${minDays} day(s).`) : inconclusive('DCH-09', 'Snowflake data retention settings could not be evaluated.'); }
function tenant(ctx, evaluations, raw) { return { schema_version: '1.0.0', source: SOURCE, source_version: SOURCE_VERSION, run_id: ctx.runId, collected_at: ctx.collectedAt, resource: { type: 'snowflake_account', id: ctx.account, uri: null, region: null, account_id: ctx.account }, evaluations, raw_attributes: raw, metadata: {} }; }
function truthy(v) { return ['true', 'yes', '1', 'y'].includes(String(v).toLowerCase()); }
function pass(id, message) { return { control_framework: 'SCF', control_id: id, status: 'pass', severity: 'info', message }; }
function inconclusive(id, message) { return { control_framework: 'SCF', control_id: id, status: 'inconclusive', severity: 'info', message }; }
function failHigh(id, message, summary) { return { control_framework: 'SCF', control_id: id, status: 'fail', severity: 'high', message, remediation: { summary, ref: 'grc-engineer://generate-implementation/snowflake_security', effort_hours: 1, automation: 'manual' } }; }
function parseArgs(argv) { const out = { output: 'summary' }; for (const tok of argv) { if (!tok.startsWith('--')) continue; const [k, v] = tok.slice(2).split('='); if (k === 'output' && ['summary', 'json', 'silent'].includes(v)) out.output = v; else if (k === 'quiet') out.quiet = true; else fail(EXIT.USAGE, `Unknown flag: --${k}`); } return out; }
function parseYaml(text) { const out = { defaults: {} }; let inDefaults = false; for (const line of text.split(/\r?\n/)) { if (line.startsWith('defaults:')) { inDefaults = true; continue; } const m = line.match(/^(\s*)([A-Za-z0-9_-]+):\s*"?([^"]*)"?$/); if (m) (inDefaults && m[1] ? out.defaults : out)[m[2]] = /^\d+$/.test(m[3]) ? Number(m[3]) : m[3]; } return out; }
function makeRunId() { return `${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${crypto.randomBytes(4).toString('hex')}`; }
function fail(code, msg) { process.stderr.write(`[${SOURCE}] ${msg}\n`); process.exit(code); }
main(process.argv.slice(2)).catch(e => { process.stderr.write(`[${SOURCE}] unhandled error: ${e.stack || e.message}\n`); process.exit(1); });
