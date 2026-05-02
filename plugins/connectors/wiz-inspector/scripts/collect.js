#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const CONFIG_DIR = process.env.CLAUDE_GRC_CONFIG_DIR || path.join(os.homedir(), '.config', 'claude-grc');
const CONFIG_FILE = path.join(CONFIG_DIR, 'connectors', 'wiz-inspector.yaml');
const ENV_FILE = path.join(CONFIG_DIR, 'connectors', 'wiz-inspector.env');
const CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'findings', 'wiz-inspector');
const RUNS_LOG = path.join(os.homedir(), '.cache', 'claude-grc', 'runs.log');
const SOURCE = 'wiz-inspector';
const SOURCE_VERSION = '0.1.0';
const EXIT = { OK: 0, USAGE: 2, AUTH: 2, PARTIAL: 4, NOT_CONFIGURED: 5 };

const QUERIES = {
  configurationFindings: `query ConfigurationFindings($first: Int, $filterBy: ConfigurationFindingFilters) {
    configurationFindings(first: $first, filterBy: $filterBy) {
      nodes { id name title severity status result cloudPlatform resource { id name type nativeType subscriptionId region } project { id name } control { id name } frameworkCategories { name } }
    }
  }`,
  issues: `query Issues($first: Int, $filterBy: IssueFilters) {
    issues(first: $first, filterBy: $filterBy) {
      nodes { id title severity status type createdAt entitySnapshot { id name type nativeType subscriptionId region } project { id name } }
    }
  }`,
  vulnerabilities: `query Vulnerabilities($first: Int, $filterBy: VulnerabilityFilters) {
    vulnerabilities(first: $first, filterBy: $filterBy) {
      nodes { id name severity status firstDetectedAt cveIds vulnerableAsset { id name type subscriptionId region } project { id name } }
    }
  }`,
  cloudResources: `query CloudResources($first: Int, $filterBy: CloudResourceFilters) {
    cloudResources(first: $first, filterBy: $filterBy) {
      nodes { id name type nativeType cloudPlatform subscriptionId region project { id name } }
    }
  }`
};

async function main(argv) {
  const args = parseArgs(argv);
  let config;
  try { config = parseYaml(await fs.readFile(CONFIG_FILE, 'utf8')); }
  catch { fail(EXIT.NOT_CONFIGURED, `config missing (${CONFIG_FILE}). Run /wiz-inspector:setup first.`); }

  const env = await loadEnv();
  const authUrl = process.env.WIZ_AUTH_URL || config.auth_url || 'https://auth.app.wiz.io/oauth/token';
  const apiUrl = process.env.WIZ_API_URL || config.api_url;
  const clientId = process.env.WIZ_CLIENT_ID || env.WIZ_CLIENT_ID;
  const clientSecret = process.env.WIZ_CLIENT_SECRET || env.WIZ_CLIENT_SECRET;
  const projectId = args.projectId || process.env.WIZ_PROJECT_ID || config.project_id || '';
  const limit = args.limit || config.defaults?.limit || 100;
  if (!apiUrl || !clientId || !clientSecret) fail(EXIT.AUTH, 'missing Wiz API URL, client id, or client secret.');

  const startedAt = Date.now(), runId = makeRunId(), collectedAt = new Date().toISOString();
  const ctx = { runId, collectedAt, apiUrl, region: regionFromUrl(apiUrl) };
  const findings = [], errors = [];
  const token = await getToken(authUrl, clientId, clientSecret);

  const filterBy = projectId ? { project: [projectId] } : undefined;
  await collectConfigurationFindings(apiUrl, token, limit, filterBy, ctx, findings, errors);
  await collectIssues(apiUrl, token, limit, filterBy, ctx, findings, errors);
  await collectVulnerabilities(apiUrl, token, limit, filterBy, ctx, findings, errors);
  await collectInventory(apiUrl, token, limit, filterBy, ctx, findings, errors);

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const cachePath = path.join(CACHE_DIR, `${runId}.json`);
  await fs.writeFile(cachePath, JSON.stringify(findings, null, 2));
  const manifest = summarize(findings, { source: SOURCE, run_id: runId, started_at: new Date(startedAt).toISOString(), duration_ms: Date.now() - startedAt, scope: apiUrl, resources: findings.length, errors: errors.length });
  await fs.appendFile(RUNS_LOG, JSON.stringify(manifest) + '\n');
  if (args.output === 'json') process.stdout.write(JSON.stringify({ run_id: runId, cache_path: cachePath, summary: manifest }, null, 2) + '\n');
  else if (args.output !== 'silent') process.stdout.write(`${SOURCE}: ${findings.length} resources, ${manifest.evaluations} evaluations, ${manifest.counters.fail} failing.\n`);
  process.exit(errors.length ? EXIT.PARTIAL : EXIT.OK);
}

async function collectConfigurationFindings(apiUrl, token, limit, filterBy, ctx, findings, errors) {
  const res = await gql(apiUrl, token, QUERIES.configurationFindings, { first: limit, filterBy });
  if (!res.ok) return recordError('configurationFindings', 'CFG-01', res.error, ctx, findings, errors);
  const rows = nodes(res.raw?.configurationFindings);
  if (rows.length === 0) findings.push(tenant(ctx, [pass('CFG-01', 'Wiz returned no open configuration findings for the inspected scope.')], { configurationFindings: [] }));
  for (const row of rows) findings.push(wizFinding(ctx, 'wiz_configuration_finding', row.id, row, [openRiskEval('CFG-01', row, 'configuration finding', 'wiz_configuration_finding')]));
}

async function collectIssues(apiUrl, token, limit, filterBy, ctx, findings, errors) {
  const res = await gql(apiUrl, token, QUERIES.issues, { first: limit, filterBy });
  if (!res.ok) return recordError('issues', 'RSK-01', res.error, ctx, findings, errors);
  const rows = nodes(res.raw?.issues);
  if (rows.length === 0) findings.push(tenant(ctx, [pass('RSK-01', 'Wiz returned no open issues for the inspected scope.')], { issues: [] }));
  for (const row of rows) findings.push(wizFinding(ctx, 'wiz_issue', row.id, row, [openRiskEval('RSK-01', row, 'issue', 'wiz_issue')]));
}

async function collectVulnerabilities(apiUrl, token, limit, filterBy, ctx, findings, errors) {
  const res = await gql(apiUrl, token, QUERIES.vulnerabilities, { first: limit, filterBy });
  if (!res.ok) return recordError('vulnerabilities', 'VPM-02', res.error, ctx, findings, errors);
  const rows = nodes(res.raw?.vulnerabilities);
  if (rows.length === 0) findings.push(tenant(ctx, [pass('VPM-02', 'Wiz returned no open vulnerabilities for the inspected scope.')], { vulnerabilities: [] }));
  for (const row of rows) findings.push(wizFinding(ctx, 'wiz_vulnerability', row.id, row, [openRiskEval('VPM-02', row, 'vulnerability', 'wiz_vulnerability')]));
}

async function collectInventory(apiUrl, token, limit, filterBy, ctx, findings, errors) {
  const res = await gql(apiUrl, token, QUERIES.cloudResources, { first: limit, filterBy });
  if (!res.ok) return recordError('cloudResources', 'AST-01', res.error, ctx, findings, errors);
  const rows = nodes(res.raw?.cloudResources);
  const evals = rows.length ? [pass('AST-01', `Wiz returned cloud resource inventory for ${rows.length} resource(s).`)] : [inconclusive('AST-01', 'Wiz cloud resource inventory query returned no resources for the inspected scope.')];
  findings.push(tenant(ctx, evals, { cloudResources: rows }, { resource_count: rows.length }));
}

function wizFinding(ctx, type, id, row, evaluations) {
  const resource = row.resource || row.entitySnapshot || row.vulnerableAsset || row;
  return doc(ctx, type, id || row.name || type, evaluations, row, {
    name: row.name || row.title || null,
    severity: row.severity || null,
    status: row.status || row.result || null,
    project: row.project?.name || null
  }, resource);
}

function openRiskEval(controlId, row, label, remediationRef) {
  const status = String(row.status || row.result || '').toLowerCase();
  const severity = mapSeverity(row.severity);
  const closed = ['resolved', 'closed', 'fixed', 'passed', 'pass'].includes(status);
  const title = row.title || row.name || row.id || label;
  if (closed) return pass(controlId, `Wiz ${label} '${title}' is ${row.status || row.result}.`);
  return {
    control_framework: 'SCF',
    control_id: controlId,
    status: 'fail',
    severity,
    message: `Wiz ${label} '${title}' is open with severity ${row.severity || 'unknown'}.`,
    remediation: { summary: `Remediate or accept the Wiz ${label} in accordance with cloud risk management procedures.`, ref: `grc-engineer://generate-implementation/${remediationRef}`, effort_hours: severity === 'critical' ? 4 : 2, automation: 'manual' }
  };
}

async function getToken(authUrl, clientId, clientSecret) {
  const body = new URLSearchParams({ grant_type: 'client_credentials', audience: 'wiz-api', client_id: clientId, client_secret: clientSecret });
  const r = await fetch(authUrl, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body });
  const raw = await r.json().catch(() => ({}));
  if (!r.ok || !raw.access_token) fail(EXIT.AUTH, `Wiz token request failed: ${raw.error || raw.message || `http_${r.status}`}`);
  return raw.access_token;
}

async function gql(apiUrl, token, query, variables) {
  try {
    const r = await fetch(apiUrl, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ query, variables }) });
    const raw = await r.json().catch(() => ({}));
    if (!r.ok || raw.errors?.length) throw new Error(raw.errors?.map(e => e.message).join('; ') || `http_${r.status}`);
    return { ok: true, raw: raw.data };
  } catch (e) { return { ok: false, raw: null, error: e.message }; }
}

function recordError(endpoint, controlId, error, ctx, findings, errors) {
  errors.push({ endpoint, error });
  findings.push(tenant(ctx, [inconclusive(controlId, `Wiz ${endpoint} could not be evaluated: ${error}`)], { [endpoint]: null }));
}

function tenant(ctx, evaluations, raw, metadata = {}) { return doc(ctx, 'wiz_tenant', ctx.apiUrl, evaluations, raw, metadata, {}); }
function doc(ctx, type, id, evaluations, raw, metadata, resource = {}) {
  return { schema_version: '1.0.0', source: SOURCE, source_version: SOURCE_VERSION, run_id: ctx.runId, collected_at: ctx.collectedAt, resource: { type, id: String(id), uri: uriFor(type, id, ctx.apiUrl), region: resource.region || ctx.region, account_id: resource.subscriptionId || resource.cloudAccountId || ctx.apiUrl }, evaluations, raw_attributes: raw, metadata };
}
function uriFor(type, id, fallback) { return id && id !== fallback ? `wiz://${type.replace(/^wiz_/, '').replaceAll('_', '-')}/${id}` : fallback; }
function nodes(v) { return Array.isArray(v?.nodes) ? v.nodes : Array.isArray(v) ? v : []; }
function mapSeverity(v) { const s = String(v || '').toLowerCase(); return ['critical', 'high', 'medium', 'low', 'info'].includes(s) ? s : 'medium'; }
function pass(controlId, message) { return { control_framework: 'SCF', control_id: controlId, status: 'pass', severity: 'info', message }; }
function inconclusive(controlId, message) { return { control_framework: 'SCF', control_id: controlId, status: 'inconclusive', severity: 'info', message }; }
async function loadEnv() { try { return Object.fromEntries((await fs.readFile(ENV_FILE, 'utf8')).split(/\r?\n/).map(l => l.match(/^([A-Z0-9_]+)="?(.*?)"?$/)).filter(Boolean).map(m => [m[1], m[2]])); } catch { return {}; } }
function parseArgs(argv) { const out = { output: 'summary', limit: 0, projectId: '' }; for (const tok of argv) { if (!tok.startsWith('--')) continue; const [k, v = ''] = tok.slice(2).split('='); if (k === 'output' && ['summary', 'json', 'silent'].includes(v)) out.output = v; else if (k === 'limit') out.limit = parseInt(v, 10); else if (k === 'project-id') out.projectId = v; else fail(EXIT.USAGE, `Unknown flag: --${k}`); } return out; }
function parseYaml(text) { const out = {}, stack = [out]; let parent = null; for (const line of text.split(/\r?\n/)) { const m = line.match(/^(\s*)([A-Za-z0-9_-]+):\s*"?([^"]*)"?$/); if (!m) continue; if (m[1].length === 0) { parent = m[2]; out[parent] = m[3] === '' ? {} : scalar(m[3]); } else if (parent && typeof out[parent] === 'object') out[parent][m[2]] = scalar(m[3]); } return stack[0]; }
function scalar(v) { return /^\d+$/.test(v) ? Number(v) : v; }
function regionFromUrl(apiUrl) { const m = String(apiUrl).match(/https:\/\/api[.-]([a-z0-9-]+)\.app\.wiz\.io/i); return m?.[1] || null; }
function makeRunId() { return `${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${crypto.randomBytes(4).toString('hex')}`; }
function summarize(findings, base) { const counters = { pass: 0, fail: 0, inconclusive: 0, not_applicable: 0, skipped: 0 }, severities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }, failing_severities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }; let evaluations = 0; for (const d of findings) for (const e of d.evaluations) { evaluations++; counters[e.status]++; if (e.severity) severities[e.severity]++; if (e.status === 'fail' && e.severity) failing_severities[e.severity]++; } return { ...base, evaluations, counters, severities, failing_severities }; }
function fail(code, msg) { process.stderr.write(`[${SOURCE}] ${msg}\n`); process.exit(code); }

main(process.argv.slice(2)).catch(err => { process.stderr.write(`[${SOURCE}] unhandled error: ${err.stack || err.message}\n`); process.exit(1); });
