#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const CONFIG_DIR = process.env.CLAUDE_GRC_CONFIG_DIR || path.join(os.homedir(), '.config', 'claude-grc');
const CONFIG_FILE = path.join(CONFIG_DIR, 'connectors', 'wiz-inspector.yaml');
const ENV_FILE = path.join(CONFIG_DIR, 'connectors', 'wiz-inspector.env');
const CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'findings', 'wiz-inspector');
const RUNS_LOG = path.join(os.homedir(), '.cache', 'claude-grc', 'runs.log');
const SOURCE = 'wiz-inspector';
const SOURCE_VERSION = '0.1.0';
const EXIT = { OK: 0, USAGE: 2, AUTH: 2, PARTIAL: 4, NOT_CONFIGURED: 5 };

const QUERIES = {
  configurationFindings: `query ConfigurationFindings($first: Int, $after: String, $filterBy: ConfigurationFindingFilters) {
    configurationFindings(first: $first, after: $after, filterBy: $filterBy) {
      nodes {
        id name title severity status result cloudPlatform
        resource { id name type nativeType subscriptionId cloudAccountId region }
        project { id name }
        control { id name }
        frameworkCategories { name }
      }
      pageInfo { hasNextPage endCursor }
    }
  }`,
  issues: `query Issues($first: Int, $after: String, $filterBy: IssueFilters) {
    issues(first: $first, after: $after, filterBy: $filterBy) {
      nodes {
        id title severity status type createdAt
        entitySnapshot { id name type nativeType subscriptionId cloudAccountId region }
        project { id name }
        frameworkCategories { name }
      }
      pageInfo { hasNextPage endCursor }
    }
  }`,
  vulnerabilities: `query Vulnerabilities($first: Int, $after: String, $filterBy: VulnerabilityFilters) {
    vulnerabilities(first: $first, after: $after, filterBy: $filterBy) {
      nodes {
        id name severity status firstDetectedAt cveIds
        vulnerableAsset { id name type nativeType subscriptionId cloudAccountId region }
        project { id name }
        frameworkCategories { name }
      }
      pageInfo { hasNextPage endCursor }
    }
  }`,
  cloudResources: `query CloudResources($first: Int, $after: String, $filterBy: CloudResourceFilters) {
    cloudResources(first: $first, after: $after, filterBy: $filterBy) {
      nodes {
        id name type nativeType cloudPlatform subscriptionId cloudAccountId region
        project { id name }
      }
      pageInfo { hasNextPage endCursor }
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
  const clientIdEnv = config.client_id_env || 'WIZ_CLIENT_ID';
  const clientSecretEnv = config.client_secret_env || 'WIZ_CLIENT_SECRET';
  const clientId = process.env[clientIdEnv] || process.env.WIZ_CLIENT_ID || env.WIZ_CLIENT_ID;
  const clientSecret = process.env[clientSecretEnv] || process.env.WIZ_CLIENT_SECRET || env.WIZ_CLIENT_SECRET;
  const projectId = args.projectId || process.env.WIZ_PROJECT_ID || config.project_id || '';
  const limit = args.limit || config.defaults?.limit || 100;
  const fixtureDir = args.fixtureDir || process.env.WIZ_FIXTURE_DIR || '';
  if (!apiUrl || !clientId || !clientSecret) fail(EXIT.AUTH, 'missing Wiz API URL, client id, or client secret.');

  const startedAt = Date.now(), runId = makeRunId(), collectedAt = new Date().toISOString();
  const ctx = {
    runId,
    collectedAt,
    apiUrl,
    region: regionFromUrl(apiUrl),
    projectId,
    scopeType: projectId ? 'project' : 'tenant',
    fixtureDir
  };
  const findings = [], errors = [];
  const token = await getToken(authUrl, clientId, clientSecret, fixtureDir);

  const filterBy = projectId ? { project: [projectId] } : undefined;
  await collectConfigurationFindings(apiUrl, token, limit, filterBy, ctx, findings, errors);
  await collectIssues(apiUrl, token, limit, filterBy, ctx, findings, errors);
  await collectVulnerabilities(apiUrl, token, limit, filterBy, ctx, findings, errors);
  await collectInventory(apiUrl, token, limit, filterBy, ctx, findings, errors);

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const cachePath = path.join(CACHE_DIR, `${runId}.json`);
  await fs.writeFile(cachePath, JSON.stringify(findings, null, 2));
  const manifest = summarize(findings, {
    source: SOURCE,
    run_id: runId,
    started_at: new Date(startedAt).toISOString(),
    duration_ms: Date.now() - startedAt,
    scope: apiUrl,
    scope_type: ctx.scopeType,
    project_id: projectId || null,
    resources: findings.length,
    errors: errors.length
  });
  await fs.mkdir(path.dirname(RUNS_LOG), { recursive: true });
  await fs.appendFile(RUNS_LOG, JSON.stringify(manifest) + '\n');
  if (args.output === 'json') process.stdout.write(JSON.stringify({ run_id: runId, cache_path: cachePath, summary: manifest, errors }, null, 2) + '\n');
  else if (args.output !== 'silent') {
    process.stdout.write(`${SOURCE}: ${findings.length} resources, ${manifest.evaluations} evaluations, ${manifest.counters.fail} failing.\n`);
    if (errors.length) process.stdout.write(`(${errors.length} partial errors)\n`);
  }
  process.exit(errors.length ? EXIT.PARTIAL : EXIT.OK);
}

async function collectConfigurationFindings(apiUrl, token, limit, filterBy, ctx, findings, errors) {
  const res = await collectConnection(apiUrl, token, 'configurationFindings', QUERIES.configurationFindings, limit, filterBy, ctx);
  if (!res.ok) return recordError('configurationFindings', 'CFG-01', res.error, ctx, findings, errors);
  if (res.rows.length === 0) findings.push(tenant(ctx, [pass('CFG-01', 'Wiz returned no open configuration findings for the inspected scope.')], { configurationFindings: [] }, { pages: res.pages, resource_count: 0 }));
  for (const row of res.rows) findings.push(wizFinding(ctx, 'wiz_configuration_finding', row.id, row, [openRiskEval(mapControl(row, 'CFG-01'), row, 'configuration finding', 'wiz_configuration_finding')], { pages: res.pages }));
}

async function collectIssues(apiUrl, token, limit, filterBy, ctx, findings, errors) {
  const res = await collectConnection(apiUrl, token, 'issues', QUERIES.issues, limit, filterBy, ctx);
  if (!res.ok) return recordError('issues', 'RSK-01', res.error, ctx, findings, errors);
  if (res.rows.length === 0) findings.push(tenant(ctx, [pass('RSK-01', 'Wiz returned no open issues for the inspected scope.')], { issues: [] }, { pages: res.pages, resource_count: 0 }));
  for (const row of res.rows) findings.push(wizFinding(ctx, 'wiz_issue', row.id, row, [openRiskEval(mapControl(row, 'RSK-01'), row, 'issue', 'wiz_issue')], { pages: res.pages }));
}

async function collectVulnerabilities(apiUrl, token, limit, filterBy, ctx, findings, errors) {
  const res = await collectConnection(apiUrl, token, 'vulnerabilities', QUERIES.vulnerabilities, limit, filterBy, ctx);
  if (!res.ok) return recordError('vulnerabilities', 'VPM-02', res.error, ctx, findings, errors);
  if (res.rows.length === 0) findings.push(tenant(ctx, [pass('VPM-02', 'Wiz returned no open vulnerabilities for the inspected scope.')], { vulnerabilities: [] }, { pages: res.pages, resource_count: 0 }));
  for (const row of res.rows) findings.push(wizFinding(ctx, 'wiz_vulnerability', row.id, row, [openRiskEval(mapControl(row, 'VPM-02'), row, 'vulnerability', 'wiz_vulnerability')], { pages: res.pages }));
}

async function collectInventory(apiUrl, token, limit, filterBy, ctx, findings, errors) {
  const res = await collectConnection(apiUrl, token, 'cloudResources', QUERIES.cloudResources, limit, filterBy, ctx);
  if (!res.ok) return recordError('cloudResources', 'AST-01', res.error, ctx, findings, errors);
  const evals = res.rows.length ? [pass('AST-01', `Wiz returned cloud resource inventory for ${res.rows.length} resource(s).`)] : [inconclusive('AST-01', 'Wiz cloud resource inventory query returned no resources for the inspected scope.')];
  findings.push(tenant(ctx, evals, { cloudResources: res.rows }, { pages: res.pages, resource_count: res.rows.length }));
}

async function collectConnection(apiUrl, token, endpoint, query, limit, filterBy, ctx) {
  const rows = [];
  let after = null;
  let pages = 0;
  do {
    const variables = { first: limit, after, filterBy };
    const res = await gql(apiUrl, token, query, variables, endpoint, pages + 1, ctx.fixtureDir);
    if (!res.ok) return { ok: false, rows, pages, error: res.error };
    const connection = res.raw?.[endpoint];
    rows.push(...nodes(connection));
    pages++;
    const pageInfo = connection?.pageInfo || {};
    after = pageInfo.hasNextPage ? pageInfo.endCursor : null;
  } while (after);
  return { ok: true, rows, pages };
}

function wizFinding(ctx, type, id, row, evaluations, extraMetadata = {}) {
  const resource = row.resource || row.entitySnapshot || row.vulnerableAsset || row;
  const project = normalizeProject(row.project, ctx.projectId);
  return doc(ctx, type, id || row.name || type, evaluations, row, {
    ...baseMetadata(ctx, resource),
    ...extraMetadata,
    name: row.name || row.title || null,
    wiz_severity: row.severity || null,
    wiz_status: row.status || row.result || null,
    cloud_platform: row.cloudPlatform || resource.cloudPlatform || null,
    project,
    framework_tags: frameworkTags(row),
    wiz_control: row.control || null
  }, resource);
}

function openRiskEval(controlId, row, label, remediationRef) {
  const status = normalizeStatus(row.status || row.result);
  const severity = status === 'pass' ? 'info' : mapSeverity(row.severity, 'medium');
  const title = row.title || row.name || row.id || label;
  if (status === 'pass') return pass(controlId, `Wiz ${label} '${title}' is ${row.status || row.result || 'resolved'}.`);
  return {
    control_framework: 'SCF',
    control_id: controlId,
    status,
    severity,
    message: `Wiz ${label} '${title}' is open with severity ${row.severity || 'unknown'}.`,
    remediation: { summary: `Remediate or accept the Wiz ${label} in accordance with cloud risk management procedures.`, ref: `grc-engineer://generate-implementation/${remediationRef}`, effort_hours: severity === 'critical' ? 4 : 2, automation: 'manual' }
  };
}

async function getToken(authUrl, clientId, clientSecret, fixtureDir) {
  if (fixtureDir) {
    const raw = JSON.parse(await fs.readFile(path.join(fixtureDir, 'auth.json'), 'utf8'));
    if (!raw.access_token) fail(EXIT.AUTH, 'Wiz fixture auth.json did not include access_token.');
    return raw.access_token;
  }
  const body = new URLSearchParams({ grant_type: 'client_credentials', audience: 'wiz-api', client_id: clientId, client_secret: clientSecret });
  const r = await fetch(authUrl, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body });
  const raw = await r.json().catch(() => ({}));
  if (!r.ok || !raw.access_token) fail(EXIT.AUTH, `Wiz token request failed: ${raw.error || raw.message || `http_${r.status}`}`);
  return raw.access_token;
}

async function gql(apiUrl, token, query, variables, endpoint, page, fixtureDir) {
  try {
    const raw = fixtureDir
      ? JSON.parse(await fs.readFile(path.join(fixtureDir, `${endpoint}-${page}.json`), 'utf8'))
      : await postGraphql(apiUrl, token, query, variables);
    if (raw.errors?.length) throw new Error(raw.errors.map(e => e.message).join('; '));
    return { ok: true, raw: raw.data };
  } catch (e) { return { ok: false, raw: null, error: e.message }; }
}

async function postGraphql(apiUrl, token, query, variables) {
  const r = await fetch(apiUrl, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ query, variables }) });
  const raw = await r.json().catch(() => ({}));
  if (!r.ok || raw.errors?.length) throw new Error(raw.errors?.map(e => e.message).join('; ') || `http_${r.status}`);
  return raw;
}

function recordError(endpoint, controlId, error, ctx, findings, errors) {
  errors.push({ endpoint, error });
  findings.push(tenant(ctx, [inconclusive(controlId, `Wiz ${endpoint} could not be evaluated: ${error}`)], { [endpoint]: null }, { endpoint, error }));
}

function tenant(ctx, evaluations, raw, metadata = {}) {
  return doc(ctx, 'wiz_tenant', ctx.apiUrl, evaluations, raw, {
    ...baseMetadata(ctx, {}),
    ...metadata
  }, {});
}

function doc(ctx, type, id, evaluations, raw, metadata, resource = {}) {
  return {
    schema_version: '1.0.0',
    source: SOURCE,
    source_version: SOURCE_VERSION,
    run_id: ctx.runId,
    collected_at: ctx.collectedAt,
    resource: {
      type,
      id: String(id),
      uri: uriFor(type, id, ctx.apiUrl),
      region: resource.region || ctx.region,
      account_id: resource.subscriptionId || resource.cloudAccountId || ctx.apiUrl
    },
    evaluations,
    raw_attributes: raw,
    metadata
  };
}

function baseMetadata(ctx, resource) {
  return {
    tenant_region: ctx.region,
    scope_type: ctx.scopeType,
    project_id: ctx.projectId || null,
    cloud_account_id: resource.subscriptionId || resource.cloudAccountId || null
  };
}

function mapControl(row, fallback) {
  const text = frameworkTags(row).join(' ').toUpperCase();
  if (/\bSC-28\b|CC6\.7|ENCRYPT|CRYPTO/.test(text)) return 'CRY-05';
  if (/\bAU-2\b|\bAU-6\b|CC7\.2|LOGGING|MONITOR/.test(text)) return 'MON-02';
  if (/\bRA-5\b|VULNERAB/.test(text)) return 'VPM-02';
  if (/\bRA-3\b|RISK/.test(text)) return 'RSK-01';
  if (/\bAC-2\b|CC6\.1|ACCESS|IDENTITY|IAM/.test(text)) return 'IAC-01';
  if (/\bCM-\d+\b|CONFIG/.test(text)) return 'CFG-01';
  if (/\bSC-7\b|NETWORK|SEGMENT/.test(text)) return 'NET-03';
  return fallback;
}

function frameworkTags(row) {
  return [
    ...(row.frameworkCategories || []),
    ...(row.frameworks || []),
    ...(row.complianceFrameworks || []),
    ...(row.rule?.frameworkCategories || [])
  ].map(v => typeof v === 'string' ? v : v?.name || v?.id).filter(Boolean);
}

function normalizeProject(project, projectId) {
  if (project?.id || project?.name) return { id: project.id || projectId || null, name: project.name || null };
  return projectId ? { id: projectId, name: null } : null;
}

function normalizeStatus(v) {
  const s = String(v || '').trim().toLowerCase().replace(/[_\s-]+/g, '_');
  if (['resolved', 'closed', 'fixed', 'passed', 'pass', 'ok', 'success', 'succeeded', 'completed'].includes(s)) return 'pass';
  if (['not_applicable', 'not_applicable_due_to_cloud_platform', 'irrelevant'].includes(s)) return 'not_applicable';
  if (['unknown', 'indeterminate', 'inconclusive'].includes(s)) return 'inconclusive';
  if (['skipped', 'ignored'].includes(s)) return 'skipped';
  return 'fail';
}

function uriFor(type, id, fallback) { return id && id !== fallback ? `wiz://${type.replace(/^wiz_/, '').replaceAll('_', '-')}/${id}` : fallback; }
function nodes(v) { return Array.isArray(v?.nodes) ? v.nodes : Array.isArray(v) ? v : []; }
function mapSeverity(v, defaultSeverity = 'medium') {
  const s = String(v || '').trim().toLowerCase();
  if (s === 'informational' || s === 'none') return 'info';
  return ['critical', 'high', 'medium', 'low', 'info'].includes(s) ? s : defaultSeverity;
}
function pass(controlId, message) { return { control_framework: 'SCF', control_id: controlId, status: 'pass', severity: 'info', message }; }
function inconclusive(controlId, message) { return { control_framework: 'SCF', control_id: controlId, status: 'inconclusive', severity: 'info', message }; }
async function loadEnv() { try { return Object.fromEntries((await fs.readFile(ENV_FILE, 'utf8')).split(/\r?\n/).map(l => l.match(/^([A-Z0-9_]+)="?(.*?)"?$/)).filter(Boolean).map(m => [m[1], m[2]])); } catch { return {}; } }
function parseArgs(argv) {
  const out = { output: 'summary', limit: 0, projectId: '', fixtureDir: '' };
  for (const tok of argv) {
    if (!tok.startsWith('--')) continue;
    const [k, v = ''] = tok.slice(2).split('=');
    if (k === 'output' && ['summary', 'json', 'silent'].includes(v)) out.output = v;
    else if (k === 'limit') out.limit = parseInt(v, 10);
    else if (k === 'project-id') out.projectId = v;
    else if (k === 'fixture-dir') out.fixtureDir = v;
    else fail(EXIT.USAGE, `Unknown flag: --${k}`);
  }
  return out;
}
function parseYaml(text) { const out = {}, stack = [out]; let parent = null; for (const line of text.split(/\r?\n/)) { const m = line.match(/^(\s*)([A-Za-z0-9_-]+):\s*"?([^"]*)"?$/); if (!m) continue; if (m[1].length === 0) { parent = m[2]; out[parent] = m[3] === '' ? {} : scalar(m[3]); } else if (parent && typeof out[parent] === 'object') out[parent][m[2]] = scalar(m[3]); } return stack[0]; }
function scalar(v) { return /^\d+$/.test(v) ? Number(v) : v; }
function regionFromUrl(apiUrl) { const m = String(apiUrl).match(/https:\/\/api[.-]([a-z0-9-]+)\.app\.wiz\.io/i); return m?.[1] || null; }
function makeRunId() { return `${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${crypto.randomBytes(4).toString('hex')}`; }
function summarize(findings, base) { const counters = { pass: 0, fail: 0, inconclusive: 0, not_applicable: 0, skipped: 0 }, severities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }, failing_severities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }; let evaluations = 0; for (const d of findings) for (const e of d.evaluations) { evaluations++; counters[e.status]++; if (e.severity) severities[e.severity]++; if (e.status === 'fail' && e.severity) failing_severities[e.severity]++; } return { ...base, evaluations, counters, severities, failing_severities }; }
function fail(code, msg) { process.stderr.write(`[${SOURCE}] ${msg}\n`); process.exit(code); }

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch(err => { process.stderr.write(`[${SOURCE}] unhandled error: ${err.stack || err.message}\n`); process.exit(1); });
}
