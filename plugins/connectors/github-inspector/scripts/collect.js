#!/usr/bin/env node

/**
 * github-inspector:collect
 *
 * Queries GitHub via `gh api`, evaluates each repo in scope against SCF
 * controls, and writes a Findings array to the shared cache.
 *
 * Usage:
 *   node collect.js [--scope=@me|org:<name>|repo:<owner/name>|repos-file]
 *                   [--repos-file=<path>] [--refresh] [--output=silent|summary|json]
 *                   [--limit=<n>] [--concurrency=<n>] [--quiet]
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

const execFileP = promisify(execFile);

const CONFIG_DIR = process.env.CLAUDE_GRC_CONFIG_DIR || path.join(os.homedir(), '.config', 'claude-grc');
const CONFIG_FILE = path.join(CONFIG_DIR, 'connectors', 'github-inspector.yaml');
const CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'findings', 'github-inspector');
const PLUGIN_DIR = path.resolve(new URL('.', import.meta.url).pathname, '..');
const DEFAULT_REPOS_FILE = path.join(PLUGIN_DIR, 'config', 'repos.yaml');
const RUNS_LOG = path.join(os.homedir(), '.cache', 'claude-grc', 'runs.log');
const SOURCE = 'github-inspector';
const SOURCE_VERSION = '0.1.0';

const EXIT = { OK: 0, USAGE: 2, AUTH: 2, RATE_LIMITED: 3, PARTIAL: 4, NOT_CONFIGURED: 5 };

async function main(argv) {
  const args = parseArgs(argv);
  const log = args.quiet ? () => {} : (m) => process.stderr.write(`[${SOURCE}] ${m}\n`);
  let config;
  try {
    config = parseYaml(await fs.readFile(CONFIG_FILE, 'utf8'));
  } catch (err) {
    fail(EXIT.NOT_CONFIGURED, `config missing (${CONFIG_FILE}). Run /github-inspector:setup first.`);
  }

  const scope = args.scope || config?.defaults?.scope || '@me';
  const concurrency = Math.min(8, Math.max(1, args.concurrency || config?.defaults?.concurrency || 4));
  const includeArchived = args.includeArchived ?? config?.defaults?.include_archived ?? false;
  const includeForks = args.includeForks ?? config?.defaults?.include_forks ?? false;

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const runId = makeRunId();
  const startedAt = Date.now();

  log(`scope=${scope} concurrency=${concurrency}`);

  // 1. Enumerate repos
  let repos;
  try {
    repos = await enumerateRepos(scope, { includeArchived, includeForks, limit: args.limit, reposFile: args.reposFile });
  } catch (err) {
    if (err.code === 'AUTH_FAILED') fail(EXIT.AUTH, err.message);
    throw err;
  }
  log(`repos to scan: ${repos.length}`);

  // 2. Evaluate each repo (bounded concurrency)
  const findings = [];
  const errors = [];
  let rateLimitRemaining = null;
  let counters = { pass: 0, fail: 0, inconclusive: 0 };
  let sevCounters = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };

  await runPool(repos, concurrency, async (repo, i) => {
    try {
      const doc = await evaluateRepo(repo, runId);
      findings.push(doc);
      for (const e of doc.evaluations) {
        counters[e.status] = (counters[e.status] || 0) + 1;
        if (e.severity) sevCounters[e.severity] = (sevCounters[e.severity] || 0) + 1;
      }
      if (i % 10 === 0) log(`progress: ${i + 1}/${repos.length}`);
    } catch (err) {
      errors.push({ repo: repo.full_name, error: err.message });
      log(`skipped ${repo.full_name}: ${err.message}`);
    }
  });

  // 3. Rate limit snapshot
  try {
    const { stdout } = await gh(['api', '/rate_limit', '--jq', '.rate.remaining']);
    rateLimitRemaining = parseInt(stdout.trim(), 10);
  } catch { /* ignore */ }

  // 4. Write cache
  const cachePath = path.join(CACHE_DIR, `${runId}.json`);
  await fs.writeFile(cachePath, JSON.stringify(findings, null, 2));

  // 5. Append run manifest
  const durationMs = Date.now() - startedAt;
  const manifest = {
    source: SOURCE,
    run_id: runId,
    started_at: new Date(startedAt).toISOString(),
    duration_ms: durationMs,
    scope,
    resources: findings.length,
    evaluations: findings.reduce((n, d) => n + d.evaluations.length, 0),
    counters,
    severities: sevCounters,
    errors: errors.length,
    rate_limit_remaining: rateLimitRemaining
  };
  await fs.appendFile(RUNS_LOG, JSON.stringify(manifest) + '\n');

  // 6. Summary
  const summary = `${SOURCE}: ${findings.length} resources, ${manifest.evaluations} evaluations, ${counters.fail || 0} failing (${sevCounters.high || 0} high, ${sevCounters.medium || 0} medium, ${sevCounters.low || 0} low).`;
  if (args.output === 'json') {
    process.stdout.write(JSON.stringify({ run_id: runId, cache_path: cachePath, summary: manifest }, null, 2) + '\n');
  } else if (args.output !== 'silent') {
    process.stdout.write(summary + '\n');
  }

  if (errors.length && findings.length === 0) fail(EXIT.PARTIAL, 'all repo scans failed; see logs');
  if (errors.length) process.exit(EXIT.PARTIAL);
  process.exit(EXIT.OK);
}

function parseArgs(argv) {
  const out = { scope: null, refresh: false, output: 'summary', limit: 0, concurrency: 0, quiet: false };
  for (const tok of argv) {
    if (!tok.startsWith('--')) continue;
    const [k, v] = tok.slice(2).split('=');
    switch (k) {
      case 'scope': out.scope = v; break;
      case 'refresh': out.refresh = true; break;
      case 'output': out.output = v; break;
      case 'limit': out.limit = parseInt(v, 10); break;
      case 'concurrency': out.concurrency = parseInt(v, 10); break;
      case 'quiet': out.quiet = true; break;
      case 'include-archived': out.includeArchived = v === undefined || v === 'true'; break;
      case 'include-forks': out.includeForks = v === undefined || v === 'true'; break;
      case 'repos-file': out.reposFile = v; break;
      default: fail(EXIT.USAGE, `Unknown flag: --${k}`);
    }
  }
  return out;
}

async function enumerateRepos(scope, { includeArchived, includeForks, limit, reposFile }) {
  // scope variants:
  //   @me             → /user/repos?per_page=100&affiliation=owner
  //   org:<n>         → /orgs/<n>/repos?per_page=100
  //   repo:<o/r>      → /repos/<o>/<r> (single)
  //   repos-file      → read repos from YAML config file
  if (scope === 'repos-file') {
    return enumerateFromFile(reposFile, { includeArchived, includeForks, limit });
  }
  if (scope.startsWith('repo:')) {
    const slug = scope.slice(5);
    const { stdout } = await gh(['api', `/repos/${slug}`]);
    return [JSON.parse(stdout)];
  }
  let endpoint;
  if (scope === '@me') endpoint = '/user/repos?affiliation=owner&per_page=100';
  else if (scope.startsWith('org:')) endpoint = `/orgs/${scope.slice(4)}/repos?per_page=100`;
  else fail(EXIT.USAGE, `Unknown scope format: ${scope}. Valid: @me, org:<name>, repo:<owner/name>, repos-file`);

  // Paginate via gh api --paginate
  const { stdout } = await gh(['api', '--paginate', endpoint]);
  // --paginate emits concatenated JSON arrays; parse each line defensively
  const repos = parseConcatenatedJsonArrays(stdout);
  return repos.filter(r => {
    if (!includeArchived && r.archived) return false;
    if (!includeForks && r.fork) return false;
    return true;
  }).slice(0, limit || undefined);
}

async function enumerateFromFile(reposFilePath, { includeArchived, includeForks, limit }) {
  const filePath = reposFilePath || DEFAULT_REPOS_FILE;
  let content;
  try {
    content = await fs.readFile(filePath, 'utf8');
  } catch {
    fail(EXIT.USAGE, `Repos file not found: ${filePath}. Create it or use a different --scope.`);
  }
  const cfg = parseYaml(content);

  // Support both array-style and the flat YAML our parser produces
  let repoSlugs = cfg.repos;
  if (!repoSlugs || (Array.isArray(repoSlugs) && repoSlugs.length === 0)) {
    fail(EXIT.USAGE, `No repos listed in ${filePath}. Add entries under the 'repos:' key.`);
  }
  // Our minimal YAML parser returns arrays as objects with numeric keys; normalize
  if (!Array.isArray(repoSlugs)) {
    repoSlugs = Object.values(repoSlugs).filter(v => typeof v === 'string');
  }

  const excludePatterns = normalizeList(cfg.exclude || []);

  // Resolve slugs: plain slugs are fetched directly, glob patterns expand via org listing
  const plainSlugs = [];
  const globPatterns = [];
  for (const slug of repoSlugs) {
    if (slug.includes('*')) globPatterns.push(slug);
    else plainSlugs.push(slug);
  }

  const repos = [];

  // Fetch explicit repos in parallel (bounded)
  for (const slug of plainSlugs) {
    try {
      const { stdout } = await gh(['api', `/repos/${slug}`]);
      repos.push(JSON.parse(stdout));
    } catch (err) {
      process.stderr.write(`[${SOURCE}] warning: could not fetch repo ${slug}: ${err.message.split('\n')[0]}\n`);
    }
  }

  // Expand glob patterns by fetching org repos and matching
  const orgCache = new Map();
  for (const pattern of globPatterns) {
    const orgName = pattern.split('/')[0];
    if (!orgCache.has(orgName)) {
      try {
        const { stdout } = await gh(['api', '--paginate', `/orgs/${orgName}/repos?per_page=100`]);
        orgCache.set(orgName, parseConcatenatedJsonArrays(stdout));
      } catch {
        // Fall back to user repos if not an org
        try {
          const { stdout } = await gh(['api', '--paginate', `/users/${orgName}/repos?per_page=100`]);
          orgCache.set(orgName, parseConcatenatedJsonArrays(stdout));
        } catch (err) {
          process.stderr.write(`[${SOURCE}] warning: could not list repos for ${orgName}: ${err.message.split('\n')[0]}\n`);
          orgCache.set(orgName, []);
        }
      }
    }
    const orgRepos = orgCache.get(orgName);
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const r of orgRepos) {
      if (regex.test(r.full_name) && !repos.some(existing => existing.full_name === r.full_name)) {
        repos.push(r);
      }
    }
  }

  // Apply exclude patterns
  const filtered = repos.filter(r => {
    if (!includeArchived && r.archived) return false;
    if (!includeForks && r.fork) return false;
    for (const pat of excludePatterns) {
      if (pat.includes('*')) {
        const regex = new RegExp('^' + pat.replace(/\*/g, '.*') + '$');
        if (regex.test(r.full_name)) return false;
      } else if (r.full_name === pat) {
        return false;
      }
    }
    return true;
  });

  return filtered.slice(0, limit || undefined);
}

function normalizeList(val) {
  if (Array.isArray(val)) return val;
  if (val && typeof val === 'object') return Object.values(val).filter(v => typeof v === 'string');
  return [];
}

function parseConcatenatedJsonArrays(s) {
  // gh --paginate returns e.g. "[{...},{...}][{...}]" across page boundaries.
  // Parse by tracking bracket depth and then JSON.parse the slices.
  const out = [];
  let depth = 0, start = -1;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '[') { if (depth === 0) start = i; depth++; }
    else if (ch === ']') {
      depth--;
      if (depth === 0 && start !== -1) {
        try { out.push(...JSON.parse(s.slice(start, i + 1))); } catch { /* skip malformed */ }
        start = -1;
      }
    }
  }
  return out;
}

async function evaluateRepo(repo, runId) {
  const fullName = repo.full_name;
  const defaultBranch = repo.default_branch || 'main';
  const collectedAt = new Date().toISOString();

  const evaluations = [];
  const rawAttributes = { owner: repo.owner?.login, visibility: repo.visibility, default_branch: defaultBranch, pushed_at: repo.pushed_at };

  // CHG-02: Configuration Change Control — branch protection on default branch
  try {
    const { stdout, branchNotProtected } = await gh(['api', `/repos/${fullName}/branches/${defaultBranch}/protection`], { okIf404: true, recognizeBranchNotProtected: true });
    if (branchNotProtected || stdout.trim() === '' || stdout.includes('"message":"Branch not protected"')) {
      evaluations.push({
        control_framework: 'SCF', control_id: 'CHG-02',
        status: 'fail', severity: 'high',
        message: `Default branch '${defaultBranch}' has no protection rule; direct pushes are permitted.`,
        remediation: {
          summary: 'Enable branch protection with required PR reviews and status checks.',
          ref: 'grc-engineer://generate-implementation/change_management/github',
          effort_hours: 0.25,
          automation: 'auto_fixable'
        }
      });
      // CHG-02.1 cannot be evaluated without a protection rule; mark not_applicable.
      evaluations.push({ control_framework: 'SCF', control_id: 'CHG-02.1', status: 'not_applicable', severity: 'info', message: 'No branch protection exists; required-status-checks cannot be evaluated.' });
    } else {
      const protection = JSON.parse(stdout);
      const requiredReviews = protection.required_pull_request_reviews?.required_approving_review_count ?? 0;
      if (requiredReviews < 1) {
        evaluations.push({
          control_framework: 'SCF', control_id: 'CHG-02',
          status: 'fail', severity: 'medium',
          message: `Branch protection exists but requires 0 approving reviews.`,
          remediation: { summary: 'Set required_approving_review_count >= 1.', ref: 'grc-engineer://generate-implementation/change_management/github', effort_hours: 0.1, automation: 'auto_fixable' }
        });
      } else {
        evaluations.push({ control_framework: 'SCF', control_id: 'CHG-02', status: 'pass', severity: 'info' });
      }
      // CHG-02.1: required status checks
      if (protection.required_status_checks?.checks?.length) {
        evaluations.push({ control_framework: 'SCF', control_id: 'CHG-02.1', status: 'pass', severity: 'info' });
      } else {
        evaluations.push({
          control_framework: 'SCF', control_id: 'CHG-02.1',
          status: 'fail', severity: 'medium',
          message: 'No required status checks configured on default branch.',
          remediation: { summary: 'Require at least one passing status check before merge.', ref: 'grc-engineer://generate-implementation/change_management/github', effort_hours: 0.2, automation: 'semi_automated' }
        });
      }
    }
  } catch (err) {
    evaluations.push({
      control_framework: 'SCF', control_id: 'CHG-02',
      status: 'inconclusive', severity: 'medium',
      message: `Could not read branch protection: ${err.message.split('\n')[0]}`
    });
  }

  // MON-01: secret scanning enabled
  const secretScanning = repo.security_and_analysis?.secret_scanning?.status;
  if (secretScanning === 'enabled') {
    evaluations.push({ control_framework: 'SCF', control_id: 'MON-01', status: 'pass', severity: 'info' });
  } else if (secretScanning === 'disabled') {
    evaluations.push({
      control_framework: 'SCF', control_id: 'MON-01',
      status: 'fail', severity: 'high',
      message: 'Secret scanning is disabled for this repository.',
      remediation: { summary: 'Enable GitHub Secret Scanning (Advanced Security on private repos).', ref: 'grc-engineer://generate-implementation/continuous_monitoring/github', effort_hours: 0.1, automation: 'auto_fixable' }
    });
  } else {
    evaluations.push({ control_framework: 'SCF', control_id: 'MON-01', status: 'inconclusive', severity: 'low', message: 'Secret scanning status unknown — requires admin:repo or security_events scope.' });
  }

  // MON-01.4: Dependabot alerts
  try {
    const { stdout } = await gh(['api', `/repos/${fullName}/vulnerability-alerts`, '-i'], { okIf404: true, okIf204: true });
    if (stdout.includes('204') || stdout.includes('Status: 204')) {
      evaluations.push({ control_framework: 'SCF', control_id: 'MON-01.4', status: 'pass', severity: 'info' });
    } else if (stdout.includes('404') || stdout.includes('Status: 404')) {
      evaluations.push({
        control_framework: 'SCF', control_id: 'MON-01.4',
        status: 'fail', severity: 'medium',
        message: 'Dependabot vulnerability alerts are not enabled.',
        remediation: { summary: 'Enable Dependabot alerts in repo Security settings.', ref: 'grc-engineer://generate-implementation/vulnerability_management/github', effort_hours: 0.1, automation: 'auto_fixable' }
      });
    } else {
      evaluations.push({ control_framework: 'SCF', control_id: 'MON-01.4', status: 'inconclusive', severity: 'low', message: 'Could not determine Dependabot status.' });
    }
  } catch {
    evaluations.push({ control_framework: 'SCF', control_id: 'MON-01.4', status: 'inconclusive', severity: 'low', message: 'Dependabot check failed.' });
  }

  // IAO-04: code scanning / CodeQL
  try {
    const { stdout } = await gh(['api', `/repos/${fullName}/code-scanning/alerts?per_page=1`], { okIf404: true });
    if (stdout.includes('"message":"Code scanning is not enabled"') || stdout.includes('"message":"no analysis found"')) {
      evaluations.push({
        control_framework: 'SCF', control_id: 'IAO-04',
        status: 'fail', severity: 'medium',
        message: 'Code scanning is not enabled.',
        remediation: { summary: 'Enable CodeQL via Actions or a third-party SAST.', ref: 'grc-engineer://generate-implementation/secure_coding/github', effort_hours: 0.5, automation: 'semi_automated' }
      });
    } else if (stdout.trim() === '' || stdout.includes('Not Found')) {
      evaluations.push({ control_framework: 'SCF', control_id: 'IAO-04', status: 'fail', severity: 'medium', message: 'Code scanning appears not configured.', remediation: { summary: 'Enable CodeQL.', ref: 'grc-engineer://generate-implementation/secure_coding/github', effort_hours: 0.5, automation: 'semi_automated' } });
    } else {
      evaluations.push({ control_framework: 'SCF', control_id: 'IAO-04', status: 'pass', severity: 'info' });
    }
  } catch {
    evaluations.push({ control_framework: 'SCF', control_id: 'IAO-04', status: 'inconclusive', severity: 'low', message: 'Code scanning check failed — missing security_events scope?' });
  }

  return {
    schema_version: '1.0.0',
    source: SOURCE,
    source_version: SOURCE_VERSION,
    run_id: runId,
    collected_at: collectedAt,
    resource: {
      type: 'github_repository',
      id: fullName,
      uri: repo.html_url || `https://github.com/${fullName}`,
      account_id: repo.owner?.login || null
    },
    evaluations,
    raw_attributes: rawAttributes,
    metadata: { source: SOURCE, source_version: SOURCE_VERSION }
  };
}

async function gh(args, opts = {}) {
  try {
    const res = await execFileP('gh', args, { maxBuffer: 64 * 1024 * 1024 });
    return res;
  } catch (err) {
    const stderr = String(err.stderr || '');
    const stdout = String(err.stdout || '');
    const combined = stderr + stdout;
    if (/401|authentication required|not authenticated/i.test(stderr)) {
      const e = new Error('gh is not authenticated. Run gh auth login.');
      e.code = 'AUTH_FAILED';
      throw e;
    }
    if (opts.recognizeBranchNotProtected && /Branch not protected/i.test(combined)) {
      return { stdout, stderr, branchNotProtected: true };
    }
    if (opts.okIf404 && /Not Found|HTTP 404/.test(combined)) return { stdout: stdout || '', stderr, notFound: true };
    if (opts.okIf204 && /204/.test(combined)) return { stdout: '204', stderr, noContent: true };
    throw new Error(stderr.split('\n').slice(0, 3).join(' ') || err.message);
  }
}

async function runPool(items, concurrency, worker) {
  let idx = 0;
  const running = new Set();
  async function next() {
    const i = idx++;
    if (i >= items.length) return;
    const p = worker(items[i], i).finally(() => running.delete(p));
    running.add(p);
    if (running.size >= concurrency) await Promise.race(running);
    return next();
  }
  const starters = Array.from({ length: Math.min(concurrency, items.length) }, () => next());
  await Promise.all(starters);
  await Promise.all(running);
}

function makeRunId() {
  const d = new Date();
  const date = d.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const rand = crypto.randomBytes(4).toString('hex');
  return `${date}-${rand}`;
}

/**
 * Minimal single-doc YAML parser for the flat config files this connector writes.
 * Supports: scalar key/value, nested one-level maps, quoted strings, booleans, numbers.
 * Not a full YAML parser; sufficient for our known shape.
 */
function parseYaml(src) {
  const out = {};
  const stack = [{ indent: -1, obj: out }];
  for (const raw of src.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line || line.trimStart().startsWith('#')) continue;
    const indent = line.search(/\S/);
    while (stack.length && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].obj;
    const m = line.slice(indent).match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    if (val === '') {
      const child = {};
      parent[key] = child;
      stack.push({ indent, obj: child });
    } else {
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      else if (val === 'true' || val === 'false') val = val === 'true';
      else if (/^-?\d+(\.\d+)?$/.test(val)) val = Number(val);
      parent[key] = val;
    }
  }
  return out;
}

function fail(code, msg) {
  process.stderr.write(`[${SOURCE}] ${msg}\n`);
  process.exit(code);
}

const invokedFromCLI = import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedFromCLI) {
  main(process.argv.slice(2)).catch(err => {
    process.stderr.write(`[${SOURCE}] unexpected error: ${err.stack || err.message}\n`);
    process.exit(1);
  });
}
