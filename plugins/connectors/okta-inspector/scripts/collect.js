#!/usr/bin/env node

/**
 * okta-inspector:collect
 *
 * Calls Okta REST API read-only and emits findings conforming to v1.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const CONFIG_DIR = process.env.CLAUDE_GRC_CONFIG_DIR || path.join(os.homedir(), '.config', 'claude-grc');
const CONFIG_FILE = path.join(CONFIG_DIR, 'connectors', 'okta-inspector.yaml');
const CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'findings', 'okta-inspector');
const RUNS_LOG = path.join(os.homedir(), '.cache', 'claude-grc', 'runs.log');
const SOURCE = 'okta-inspector';
const SOURCE_VERSION = '0.1.0';

const EXIT = { OK: 0, USAGE: 2, AUTH: 2, RATE_LIMITED: 3, PARTIAL: 4, NOT_CONFIGURED: 5 };

async function main(argv) {
  const args = parseArgs(argv);
  const log = args.quiet ? () => {} : (m) => process.stderr.write(`[${SOURCE}] ${m}\n`);

  let config;
  try { config = parseYaml(await fs.readFile(CONFIG_FILE, 'utf8')); }
  catch { fail(EXIT.NOT_CONFIGURED, `config missing (${CONFIG_FILE}). Run /okta-inspector:setup --domain=<org>.okta.com first.`); }

  const domain = config.domain;
  const orgId = config.org_id || 'unknown';
  const tokenEnv = config.token_env || 'OKTA_API_TOKEN';
  const token = process.env[tokenEnv];
  if (!token) fail(EXIT.AUTH, `Token env var ${tokenEnv} is not set. Export it and re-run.`);

  const services = args.services?.length ? args.services : ['policies', 'users', 'factors'];
  const inactiveThreshold = args.inactiveThresholdDays ?? config.defaults?.inactive_threshold_days ?? 90;

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const runId = makeRunId();
  const startedAt = Date.now();
  log(`domain=${domain} services=${services.join(',')}`);

  const ctx = { domain, orgId, token, runId, inactiveThreshold };
  const findings = [];
  const errors = [];

  for (const svc of services) {
    try {
      const results = await serviceHandlers[svc](ctx, log);
      findings.push(...results);
    } catch (err) {
      if (err.code === 'OKTA_AUTH') fail(EXIT.AUTH, err.message);
      if (err.code === 'OKTA_RATE_LIMIT') {
        errors.push({ service: svc, error: 'rate limited' });
        log(`rate limit hit on ${svc}; emitting partial result`);
        continue;
      }
      errors.push({ service: svc, error: err.message });
      log(`${svc} failed: ${err.message}`);
    }
  }

  const cachePath = path.join(CACHE_DIR, `${runId}.json`);
  await fs.writeFile(cachePath, JSON.stringify(findings, null, 2));

  const counters = { pass: 0, fail: 0, inconclusive: 0, not_applicable: 0, skipped: 0 };
  const sev = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const d of findings) for (const e of d.evaluations) {
    counters[e.status] = (counters[e.status] || 0) + 1;
    if (e.severity) sev[e.severity] = (sev[e.severity] || 0) + 1;
  }

  const manifest = {
    source: SOURCE, run_id: runId,
    started_at: new Date(startedAt).toISOString(),
    duration_ms: Date.now() - startedAt,
    domain, org_id: orgId, services,
    resources: findings.length,
    evaluations: findings.reduce((n, d) => n + d.evaluations.length, 0),
    counters, severities: sev, errors: errors.length
  };
  await fs.appendFile(RUNS_LOG, JSON.stringify(manifest) + '\n');

  const summary = `${SOURCE}: ${findings.length} resources, ${manifest.evaluations} evaluations, ${counters.fail || 0} failing (${sev.critical || 0} critical, ${sev.high || 0} high, ${sev.medium || 0} medium).`;
  if (args.output === 'json') process.stdout.write(JSON.stringify({ run_id: runId, cache_path: cachePath, summary: manifest, errors }, null, 2) + '\n');
  else if (args.output !== 'silent') {
    process.stdout.write(summary + '\n');
    if (errors.length) process.stdout.write(`(${errors.length} partial errors)\n`);
  }

  process.exit(errors.length ? EXIT.PARTIAL : EXIT.OK);
}

// ---------------------------------------------------------------------------

const serviceHandlers = {
  async policies(ctx, log) {
    const findings = [];

    // Password policies
    const pwdPolicies = await oktaGet(ctx, '/api/v1/policies?type=PASSWORD');
    log(`policies: ${pwdPolicies.length} password policies`);
    for (const p of pwdPolicies) {
      const resource = { type: 'okta_password_policy', id: p.id, uri: `https://${ctx.domain}/admin/access/policies`, account_id: ctx.orgId };
      const evaluations = [];
      const c = p.settings?.password?.complexity || {};
      const a = p.settings?.password?.age || {};
      const issues = [];
      if ((c.minLength || 0) < 14) issues.push(`minLength=${c.minLength || 0} (<14)`);
      if (c.minNumber === 0 && c.minSymbol === 0 && c.minLowerCase === 0 && c.minUpperCase === 0) issues.push('no complexity requirements');
      if (!a.maxAgeDays || a.maxAgeDays > 90) issues.push(`maxAgeDays=${a.maxAgeDays || 'unset'} (>90)`);
      if ((a.historyCount || 0) < 24) issues.push(`historyCount=${a.historyCount || 0} (<24)`);
      if (issues.length === 0) {
        evaluations.push({ control_framework: 'SCF', control_id: 'IAC-06', status: 'pass', severity: 'info' });
      } else {
        evaluations.push({
          control_framework: 'SCF', control_id: 'IAC-06', status: 'fail', severity: 'high',
          message: `Password policy '${p.name}' is below baseline: ${issues.join(', ')}.`,
          remediation: {
            summary: 'Tighten password complexity, age, and history to FedRAMP/NIST baseline.',
            ref: 'grc-engineer://generate-implementation/password_policy/okta',
            effort_hours: 0.25,
            automation: 'semi_automated'
          }
        });
      }
      findings.push(buildDoc(ctx, resource, evaluations));
    }

    // MFA enroll policies
    const mfaPolicies = await oktaGet(ctx, '/api/v1/policies?type=MFA_ENROLL');
    log(`policies: ${mfaPolicies.length} MFA enrollment policies`);
    let mfaRequired = false;
    for (const p of mfaPolicies) {
      // A policy "requires" MFA if it has enroll=REQUIRED for at least one factor and it's the default policy or has broad rules.
      // We approximate: any active policy with REQUIRED enrollment for any factor.
      const settings = p.settings?.factors || {};
      const requiredFactors = Object.entries(settings).filter(([_, cfg]) => cfg?.enroll?.self === 'REQUIRED');
      if (p.status === 'ACTIVE' && requiredFactors.length > 0) mfaRequired = true;
    }
    const mfaResource = { type: 'okta_org_mfa_posture', id: `mfa-${ctx.orgId}`, account_id: ctx.orgId };
    if (mfaRequired) {
      findings.push(buildDoc(ctx, mfaResource, [{ control_framework: 'SCF', control_id: 'IAC-01.2', status: 'pass', severity: 'info' }]));
    } else {
      findings.push(buildDoc(ctx, mfaResource, [{
        control_framework: 'SCF', control_id: 'IAC-01.2', status: 'fail', severity: 'high',
        message: 'No active MFA enrollment policy requires at least one factor.',
        remediation: { summary: 'Configure an MFA enrollment policy requiring WebAuthn or TOTP for all users.', ref: 'grc-engineer://generate-implementation/mfa_enforcement/okta', effort_hours: 0.5, automation: 'semi_automated' }
      }]));
    }

    // Sign-on policies — session timeouts
    const soPolicies = await oktaGet(ctx, '/api/v1/policies?type=OKTA_SIGN_ON');
    log(`policies: ${soPolicies.length} sign-on policies`);
    for (const p of soPolicies) {
      if (p.status !== 'ACTIVE') continue;
      const resource = { type: 'okta_signon_policy', id: p.id, uri: `https://${ctx.domain}/admin/access/policies`, account_id: ctx.orgId };
      const evaluations = [];
      // Fetch rules for session settings
      try {
        const rules = await oktaGet(ctx, `/api/v1/policies/${p.id}/rules`);
        // Okta encodes "unlimited" as 0, so filter on presence rather than
        // truthiness — filter(Boolean) would drop exactly the worst case and
        // report it as a pass.
        const longest = mostPermissiveSessionValue(rules, 'maxSessionLifetimeMinutes');
        const longestIdle = mostPermissiveSessionValue(rules, 'maxSessionIdleMinutes');
        evaluations.push(sessionEvaluation({
          controlId: 'IAC-15',
          policyName: p.name,
          value: longest,
          baselineMinutes: 720,
          label: 'session lifetime',
          baselineLabel: '>720min/12h baseline',
          remediationSummary: 'Cap maxSessionLifetimeMinutes at 720 (12 hours) or less.',
          missingMessage: `Policy '${p.name}' has no rule declaring maxSessionLifetimeMinutes; session lifetime could not be evaluated.`
        }));
        evaluations.push(sessionEvaluation({
          controlId: 'IAC-15.1',
          policyName: p.name,
          value: longestIdle,
          baselineMinutes: 15,
          label: 'idle timeout',
          baselineLabel: '>15min baseline',
          remediationSummary: 'Cap maxSessionIdleMinutes at 15 or less.',
          missingMessage: `Policy '${p.name}' has no rule declaring maxSessionIdleMinutes; idle timeout could not be evaluated.`
        }));
      } catch (err) {
        evaluations.push({ control_framework: 'SCF', control_id: 'IAC-15', status: 'inconclusive', severity: 'low', message: `Rules fetch failed: ${err.message}` });
      }
      findings.push(buildDoc(ctx, resource, evaluations));
    }

    return findings;
  },

  async users(ctx, log) {
    // Inactive users: /api/v1/users with filter
    const threshold = ctx.inactiveThreshold;
    const thresholdDate = new Date(Date.now() - threshold * 86400000).toISOString();
    const users = await oktaGetPaginated(ctx, `/api/v1/users?filter=status eq "ACTIVE"&limit=200`);
    log(`users: ${users.length} active users`);
    const stale = users.filter(u => {
      const last = u.lastLogin ? Date.parse(u.lastLogin) : null;
      if (!last) return false; // never logged in — that's a separate check
      return last < Date.parse(thresholdDate);
    });
    const neverLogged = users.filter(u => !u.lastLogin && u.activated && Date.parse(u.activated) < Date.parse(thresholdDate));

    const resource = { type: 'okta_user_inventory', id: `users-${ctx.orgId}`, account_id: ctx.orgId };
    const evaluations = [];
    if (!stale.length && !neverLogged.length) {
      evaluations.push({ control_framework: 'SCF', control_id: 'IAC-15.1', status: 'pass', severity: 'info' });
    } else {
      const parts = [];
      if (stale.length) parts.push(`${stale.length} user(s) inactive >${threshold}d`);
      if (neverLogged.length) parts.push(`${neverLogged.length} user(s) never logged in (activated >${threshold}d ago)`);
      evaluations.push({
        control_framework: 'SCF', control_id: 'IAC-15.1', status: 'fail', severity: 'medium',
        message: `${parts.join(' · ')}.`,
        remediation: {
          summary: `Deactivate or re-certify users inactive beyond ${threshold} days. FedRAMP requires review at ≤35 days.`,
          ref: 'grc-engineer://generate-implementation/user_lifecycle/okta',
          effort_hours: 1,
          automation: 'semi_automated'
        }
      });
    }
    return [buildDoc(ctx, resource, evaluations)];
  },

  async factors(ctx, log) {
    // Super admin users: /api/v1/iam/assignees/users?roleType=SUPER_ADMIN
    let admins;
    try {
      admins = await oktaGet(ctx, '/api/v1/iam/assignees/users?roleType=SUPER_ADMIN');
    } catch (err) {
      // Older orgs have /api/v1/users?filter=... nope, actually the classic endpoint is /api/v1/roles
      // Fall back to parsing group memberships for 'okta-admins' - coarse approximation
      return [buildDoc(ctx,
        { type: 'okta_admin_factors', id: `admin-factors-${ctx.orgId}`, account_id: ctx.orgId },
        [{ control_framework: 'SCF', control_id: 'IAC-01.2', status: 'inconclusive', severity: 'medium', message: `Super-admin enumeration failed: ${err.message}` }])];
    }
    log(`factors: ${admins.length} super admins`);
    const resource = { type: 'okta_admin_factors', id: `admin-factors-${ctx.orgId}`, account_id: ctx.orgId };
    const evaluations = [];

    if (admins.length > 5) {
      evaluations.push({
        control_framework: 'SCF', control_id: 'IAC-07.1', status: 'fail', severity: 'medium',
        message: `${admins.length} super admins exceeds typical baseline (≤5).`,
        remediation: { summary: 'Use role-based admin delegation instead of blanket super-admin.', ref: 'grc-engineer://generate-implementation/admin_scope/okta', effort_hours: 2, automation: 'manual' }
      });
    } else {
      evaluations.push({ control_framework: 'SCF', control_id: 'IAC-07.1', status: 'pass', severity: 'info' });
    }

    let adminsWithoutMFA = 0;
    let adminsSingleFactor = 0;
    for (const admin of admins) {
      try {
        const factors = await oktaGet(ctx, `/api/v1/users/${admin.id || admin.userId || admin}/factors`);
        const active = factors.filter(f => f.status === 'ACTIVE');
        if (active.length === 0) adminsWithoutMFA++;
        else if (active.length < 2) adminsSingleFactor++;
      } catch { adminsWithoutMFA++; }
    }

    if (adminsWithoutMFA > 0) {
      evaluations.push({
        control_framework: 'SCF', control_id: 'IAC-01.2', status: 'fail', severity: 'critical',
        message: `${adminsWithoutMFA} super-admin user(s) have no MFA factors enrolled.`,
        remediation: { summary: 'Require WebAuthn enrollment for all admins before next login.', ref: 'grc-engineer://generate-implementation/mfa_enforcement/okta', effort_hours: 0.5, automation: 'semi_automated' }
      });
    } else {
      evaluations.push({ control_framework: 'SCF', control_id: 'IAC-01.2', status: 'pass', severity: 'info' });
    }
    if (adminsSingleFactor > 0) {
      evaluations.push({
        control_framework: 'SCF', control_id: 'IAC-01.3', status: 'fail', severity: 'high',
        message: `${adminsSingleFactor} super-admin(s) have only 1 MFA factor (no backup).`,
        remediation: { summary: 'Require enrollment of at least two distinct factor types per admin.', ref: 'grc-engineer://generate-implementation/mfa_enforcement/okta', effort_hours: 0.5, automation: 'semi_automated' }
      });
    }

    return [buildDoc(ctx, resource, evaluations)];
  }
};

// ---------------------------------------------------------------------------

function isFiniteNumber(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

/**
 * Most permissive value a policy's rules allow for a session setting.
 *
 * Okta encodes "unlimited" as 0, which is the *weakest* setting but the
 * smallest number, so a plain Math.max would rank it as the strictest and
 * report unlimited sessions as compliant. Unlimited is mapped to Infinity for
 * the comparison and reported back as 0.
 *
 * Returns null when no rule declares the setting, which the caller reports as
 * inconclusive rather than pass.
 */
function mostPermissiveSessionValue(rules, key) {
  const declared = rules.map(r => r.actions?.signon?.session?.[key]).filter(isFiniteNumber);
  if (!declared.length) return null;
  return declared.some(v => v === 0) ? 0 : Math.max(...declared);
}

function sessionEvaluation({ controlId, policyName, value, baselineMinutes, label, baselineLabel, remediationSummary, missingMessage }) {
  if (value === null) {
    return { control_framework: 'SCF', control_id: controlId, status: 'inconclusive', severity: 'low', message: missingMessage };
  }
  if (value === 0 || value > baselineMinutes) {
    return {
      control_framework: 'SCF', control_id: controlId, status: 'fail', severity: 'medium',
      message: `Policy '${policyName}' allows ${label} ${value === 0 ? 'unlimited' : value + 'min'} (${baselineLabel}).`,
      remediation: { summary: remediationSummary, ref: 'grc-engineer://generate-implementation/session_policy/okta', effort_hours: 0.1, automation: 'auto_fixable' }
    };
  }
  return {
    control_framework: 'SCF', control_id: controlId, status: 'pass', severity: 'info',
    message: `Policy '${policyName}' caps ${label} at ${value}min.`
  };
}

function buildDoc(ctx, resource, evaluations) {
  return {
    schema_version: '1.0.0',
    source: SOURCE,
    source_version: SOURCE_VERSION,
    run_id: ctx.runId,
    collected_at: new Date().toISOString(),
    resource,
    evaluations
  };
}

async function oktaGet(ctx, pathAndQuery) {
  const url = `https://${ctx.domain}${pathAndQuery}`;
  const res = await fetch(url, { headers: { 'Authorization': `SSWS ${ctx.token}`, 'Accept': 'application/json' } });
  if (res.status === 401 || res.status === 403) {
    const e = new Error(`Okta ${res.status} on ${pathAndQuery}. Token may be invalid or lack scope.`);
    e.code = 'OKTA_AUTH';
    throw e;
  }
  if (res.status === 429) {
    const e = new Error(`Okta rate limit on ${pathAndQuery}.`);
    e.code = 'OKTA_RATE_LIMIT';
    throw e;
  }
  if (!res.ok) throw new Error(`Okta HTTP ${res.status} on ${pathAndQuery}`);
  return res.json();
}

async function oktaGetPaginated(ctx, pathAndQuery, maxPages = 10) {
  let url = `https://${ctx.domain}${pathAndQuery}`;
  const out = [];
  for (let i = 0; i < maxPages && url; i++) {
    const res = await fetch(url, { headers: { 'Authorization': `SSWS ${ctx.token}`, 'Accept': 'application/json' } });
    if (res.status === 401 || res.status === 403) { const e = new Error(`Okta ${res.status}`); e.code = 'OKTA_AUTH'; throw e; }
    if (res.status === 429) { const e = new Error('Okta rate limit'); e.code = 'OKTA_RATE_LIMIT'; throw e; }
    if (!res.ok) throw new Error(`Okta HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) out.push(...data);
    const link = res.headers.get('link') || '';
    const next = /<([^>]+)>;\s*rel="next"/.exec(link);
    url = next ? next[1] : null;
  }
  return out;
}

function parseArgs(argv) {
  const out = { services: [], output: 'summary', quiet: false, includeDeactivated: false, inactiveThresholdDays: null };
  for (const tok of argv) {
    if (!tok.startsWith('--')) continue;
    const [k, v] = tok.slice(2).split('=');
    switch (k) {
      case 'services': out.services = String(v || '').split(',').map(s => s.trim()).filter(Boolean); break;
      case 'output':   out.output = v || 'summary'; break;
      case 'include-deactivated': out.includeDeactivated = true; break;
      case 'inactive-threshold-days': out.inactiveThresholdDays = parseInt(v, 10); break;
      case 'quiet':    out.quiet = true; break;
      default: fail(EXIT.USAGE, `Unknown flag: --${k}`);
    }
  }
  return out;
}

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
    const key = m[1]; let val = m[2];
    if (val === '') { const child = {}; parent[key] = child; stack.push({ indent, obj: child }); }
    else {
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      else if (val === 'true' || val === 'false') val = val === 'true';
      else if (/^-?\d+(\.\d+)?$/.test(val)) val = Number(val);
      parent[key] = val;
    }
  }
  return out;
}

function makeRunId() {
  const d = new Date();
  const date = d.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const rand = crypto.randomBytes(4).toString('hex');
  return `${date}-${rand}`;
}

function fail(code, msg) {
  process.stderr.write(`[${SOURCE}] ${msg}\n`);
  process.exit(code);
}

const invokedFromCLI = process.argv[1] !== undefined
  && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedFromCLI) {
  main(process.argv.slice(2)).catch(err => {
    process.stderr.write(`[${SOURCE}] unexpected error: ${err.stack || err.message}\n`);
    process.exit(1);
  });
}

export { mostPermissiveSessionValue, sessionEvaluation };
