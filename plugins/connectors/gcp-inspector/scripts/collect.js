#!/usr/bin/env node

/**
 * gcp-inspector:collect
 *
 * Runs gcloud read-only queries and emits findings conforming to
 * schemas/finding.schema.json v1.
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
const CONFIG_FILE = path.join(CONFIG_DIR, 'connectors', 'gcp-inspector.yaml');
const CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'findings', 'gcp-inspector');
const RUNS_LOG = path.join(os.homedir(), '.cache', 'claude-grc', 'runs.log');
const SOURCE = 'gcp-inspector';
const SOURCE_VERSION = '0.1.0';

const EXIT = { OK: 0, USAGE: 2, AUTH: 2, RATE_LIMITED: 3, PARTIAL: 4, NOT_CONFIGURED: 5 };

async function main(argv) {
  const args = parseArgs(argv);
  const log = args.quiet ? () => {} : (m) => process.stderr.write(`[${SOURCE}] ${m}\n`);

  let config;
  try { config = parseYaml(await fs.readFile(CONFIG_FILE, 'utf8')); }
  catch { fail(EXIT.NOT_CONFIGURED, `config missing (${CONFIG_FILE}). Run /gcp-inspector:setup first.`); }

  const project = args.project || config.project_id;
  const services = args.services?.length ? args.services : (config.defaults?.services || ['iam', 'storage', 'logging', 'kms', 'compute']);
  if (!project) fail(EXIT.NOT_CONFIGURED, 'project_id missing. Re-run /gcp-inspector:setup.');

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const runId = makeRunId();
  const startedAt = Date.now();
  log(`project=${project} services=${services.join(',')}`);

  const findings = [];
  const errors = [];
  const ctx = { project, runId };

  for (const svc of services) {
    try {
      const results = await serviceHandlers[svc](ctx, log);
      findings.push(...results);
    } catch (err) {
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
    project_id: project, services,
    resources: findings.length,
    evaluations: findings.reduce((n, d) => n + d.evaluations.length, 0),
    counters, severities: sev, errors: errors.length
  };
  await fs.appendFile(RUNS_LOG, JSON.stringify(manifest) + '\n');

  const summary = `${SOURCE}: ${findings.length} resources, ${manifest.evaluations} evaluations, ${counters.fail || 0} failing (${sev.critical || 0} critical, ${sev.high || 0} high, ${sev.medium || 0} medium).`;
  if (args.output === 'json') process.stdout.write(JSON.stringify({ run_id: runId, cache_path: cachePath, summary: manifest, errors }, null, 2) + '\n');
  else if (args.output !== 'silent') {
    process.stdout.write(summary + '\n');
    if (errors.length) process.stdout.write(`(${errors.length} partial errors — see JSON output for details)\n`);
  }

  process.exit(errors.length ? EXIT.PARTIAL : EXIT.OK);
}

// ---------------------------------------------------------------------------
// Service handlers

const serviceHandlers = {
  async iam(ctx, log) {
    const findings = [];
    const project = ctx.project;
    const resource = { type: 'gcp_project_iam', id: project, uri: `//cloudresourcemanager.googleapis.com/projects/${project}`, account_id: project };
    const evaluations = [];

    // IAC-07.2: No user accounts with primitive roles (owner, editor)
    try {
      const { stdout } = await gcloud(['projects', 'get-iam-policy', project, '--format=json']);
      const policy = JSON.parse(stdout);
      const primitive = new Set(['roles/owner', 'roles/editor']);
      const offenders = [];
      for (const b of policy.bindings || []) {
        if (!primitive.has(b.role)) continue;
        for (const m of b.members || []) {
          if (m.startsWith('user:')) offenders.push({ member: m, role: b.role });
        }
      }
      if (offenders.length === 0) {
        evaluations.push({ control_framework: 'SCF', control_id: 'IAC-07.2', status: 'pass', severity: 'info' });
      } else {
        evaluations.push({
          control_framework: 'SCF', control_id: 'IAC-07.2',
          status: 'fail', severity: 'high',
          message: `${offenders.length} user account(s) hold primitive role(s): ${offenders.slice(0, 5).map(o => `${o.member} (${o.role})`).join('; ')}${offenders.length > 5 ? ', …' : ''}.`,
          remediation: {
            summary: 'Replace primitive roles with predefined or custom roles. roles/owner and roles/editor are over-broad.',
            ref: 'grc-engineer://generate-implementation/least_privilege/gcp',
            effort_hours: 1,
            automation: 'semi_automated'
          }
        });
      }
    } catch (err) {
      evaluations.push({ control_framework: 'SCF', control_id: 'IAC-07.2', status: 'inconclusive', severity: 'medium', message: `IAM policy fetch failed: ${err.message}` });
    }

    // IAC-15.1: Service account key age
    try {
      const { stdout } = await gcloud(['iam', 'service-accounts', 'list', `--project=${project}`, '--format=json']);
      const sas = JSON.parse(stdout);
      const now = Date.now();
      const staleKeys = [];
      for (const sa of sas) {
        if (sa.disabled) continue;
        try {
          const { stdout: keysOut } = await gcloud(['iam', 'service-accounts', 'keys', 'list', `--iam-account=${sa.email}`, '--managed-by=user', `--project=${project}`, '--format=json']);
          const keys = JSON.parse(keysOut || '[]');
          for (const k of keys) {
            if (!k.validAfterTime) continue;
            const ageDays = Math.floor((now - Date.parse(k.validAfterTime)) / 86400000);
            if (ageDays > 90) staleKeys.push({ sa: sa.email, key_id: k.name.split('/').pop(), age_days: ageDays });
          }
        } catch { /* ignore per-SA errors */ }
      }
      if (!staleKeys.length) {
        evaluations.push({ control_framework: 'SCF', control_id: 'IAC-15.1', status: 'pass', severity: 'info' });
      } else {
        // staleKeys is in service-account iteration order, so element 0 is
        // just the first one found, not the oldest one.
        const oldestKey = staleKeys.reduce((a, b) => (b.age_days > a.age_days ? b : a));
        evaluations.push({
          control_framework: 'SCF', control_id: 'IAC-15.1',
          status: 'fail', severity: 'medium',
          message: `${staleKeys.length} service-account key(s) older than 90 days. Oldest: ${oldestKey.sa} key ${oldestKey.key_id} (${oldestKey.age_days}d).`,
          remediation: { summary: 'Rotate service account keys or replace with Workload Identity / IAM conditions where possible.', ref: 'grc-engineer://generate-implementation/key_rotation/gcp', effort_hours: 2, automation: 'semi_automated' }
        });
      }
    } catch (err) {
      evaluations.push({ control_framework: 'SCF', control_id: 'IAC-15.1', status: 'inconclusive', severity: 'medium', message: `Service account enumeration failed: ${err.message}` });
    }

    findings.push(buildDoc(ctx, resource, evaluations));
    return findings;
  },

  async storage(ctx, log) {
    const findings = [];
    let buckets;
    try {
      const { stdout } = await gcloud(['storage', 'buckets', 'list', `--project=${ctx.project}`, '--format=json']);
      buckets = JSON.parse(stdout || '[]');
    } catch (err) {
      // Return single inconclusive document at project level
      return [buildDoc(ctx,
        { type: 'gcp_storage_project', id: ctx.project, account_id: ctx.project },
        [{ control_framework: 'SCF', control_id: 'CRY-05', status: 'inconclusive', severity: 'medium', message: `Bucket enumeration failed: ${err.message}` }])];
    }
    log(`storage: ${buckets.length} buckets`);
    for (const b of buckets) {
      const name = b.name || b.metadata?.name;
      if (!name) continue;
      const resource = { type: 'gcp_storage_bucket', id: name, uri: `gs://${name}`, region: (b.location || '').toLowerCase(), account_id: ctx.project };
      const evaluations = [];

      // DCH-01.2: Public access prevention
      const pap = b.iamConfiguration?.publicAccessPrevention;
      if (pap === 'enforced') {
        evaluations.push({ control_framework: 'SCF', control_id: 'DCH-01.2', status: 'pass', severity: 'info' });
      } else {
        evaluations.push({
          control_framework: 'SCF', control_id: 'DCH-01.2', status: 'fail', severity: 'critical',
          message: `Public access prevention is '${pap || 'inherited'}'. Bucket is not protected from accidental public exposure.`,
          remediation: { summary: 'Set publicAccessPrevention=enforced on the bucket.', ref: 'grc-engineer://generate-implementation/storage_public_access/gcp', effort_hours: 0.1, automation: 'auto_fixable' }
        });
      }

      // DCH-01.2: Uniform bucket-level access
      const uba = b.iamConfiguration?.uniformBucketLevelAccess?.enabled;
      if (uba) evaluations.push({ control_framework: 'SCF', control_id: 'IAC-10', status: 'pass', severity: 'info' });
      else evaluations.push({
        control_framework: 'SCF', control_id: 'IAC-10', status: 'fail', severity: 'medium',
        message: 'Uniform bucket-level access is disabled; ACLs can grant object-level permissions.',
        remediation: { summary: 'Enable uniformBucketLevelAccess to force IAM-only access control.', ref: 'grc-engineer://generate-implementation/storage_uniform_access/gcp', effort_hours: 0.1, automation: 'auto_fixable' }
      });

      // CRY-05: Encryption — GCS always encrypts at rest, but CMEK is the FedRAMP/high-sensitivity bar
      if (b.encryption?.defaultKmsKeyName) {
        evaluations.push({ control_framework: 'SCF', control_id: 'CRY-05', status: 'pass', severity: 'info' });
      } else {
        evaluations.push({
          control_framework: 'SCF', control_id: 'CRY-05', status: 'pass', severity: 'info',
          message: 'Google-managed encryption (default). For regulated workloads, consider CMEK.'
        });
      }

      // MON-01.2: Access logging
      const logging = b.logging?.logBucket;
      if (logging) evaluations.push({ control_framework: 'SCF', control_id: 'MON-01.2', status: 'pass', severity: 'info' });
      else evaluations.push({
        control_framework: 'SCF', control_id: 'MON-01.2', status: 'fail', severity: 'low',
        message: 'Bucket access logging not configured.',
        remediation: { summary: 'Enable access logging to a dedicated log sink bucket.', ref: 'grc-engineer://generate-implementation/storage_logging/gcp', effort_hours: 0.25, automation: 'auto_fixable' }
      });

      findings.push(buildDoc(ctx, resource, evaluations));
    }
    return findings;
  },

  async logging(ctx, log) {
    const resource = { type: 'gcp_logging', id: `logging-${ctx.project}`, account_id: ctx.project };
    const evaluations = [];
    try {
      const { stdout } = await gcloud(['logging', 'sinks', 'list', `--project=${ctx.project}`, '--format=json']);
      const sinks = JSON.parse(stdout || '[]');
      if (sinks.length) {
        evaluations.push({ control_framework: 'SCF', control_id: 'MON-02', status: 'pass', severity: 'info' });
        // MON-02.1: destination isn't a public bucket
        const publicSinks = sinks.filter(s => (s.destination || '').includes('publicly-readable'));
        if (publicSinks.length) {
          evaluations.push({
            control_framework: 'SCF', control_id: 'MON-02.1', status: 'fail', severity: 'high',
            message: `${publicSinks.length} log sink(s) route to a publicly accessible destination.`,
            remediation: { summary: 'Route log sinks to a private storage bucket or BigQuery dataset.', ref: 'grc-engineer://generate-implementation/audit_logging/gcp', effort_hours: 0.5, automation: 'manual' }
          });
        } else {
          evaluations.push({ control_framework: 'SCF', control_id: 'MON-02.1', status: 'pass', severity: 'info' });
        }
      } else {
        evaluations.push({
          control_framework: 'SCF', control_id: 'MON-02', status: 'fail', severity: 'high',
          message: 'No log sinks configured. Admin Activity + Data Access logs are not being retained outside the default 30-day window.',
          remediation: { summary: 'Create a log sink exporting audit logs to long-term storage (GCS or BigQuery).', ref: 'grc-engineer://generate-implementation/audit_logging/gcp', effort_hours: 1, automation: 'auto_fixable' }
        });
      }
    } catch (err) {
      evaluations.push({ control_framework: 'SCF', control_id: 'MON-02', status: 'inconclusive', severity: 'medium', message: `Log sinks fetch failed: ${err.message}` });
    }
    return [buildDoc(ctx, resource, evaluations)];
  },

  async kms(ctx, log) {
    const findings = [];
    // KMS keyrings are regional; enumerate via `gcloud kms keyrings list --location=global`
    // and then for each keyring, fetch keys and their rotationPeriod.
    let keyrings;
    try {
      // Discover locations by scanning a standard set; gcloud doesn't have "list all locations" on the free tier.
      const locations = ['global', 'us', 'us-central1', 'us-east1', 'us-west1', 'europe', 'europe-west1', 'asia'];
      keyrings = [];
      for (const loc of locations) {
        try {
          const { stdout } = await gcloud(['kms', 'keyrings', 'list', `--location=${loc}`, `--project=${ctx.project}`, '--format=json'], { tolerateFailure: true });
          const krs = JSON.parse(stdout || '[]');
          for (const kr of krs) keyrings.push({ ...kr, location: loc });
        } catch { /* skip unavailable locations */ }
      }
    } catch (err) {
      return [buildDoc(ctx, { type: 'gcp_kms', id: `kms-${ctx.project}`, account_id: ctx.project },
        [{ control_framework: 'SCF', control_id: 'CRY-09', status: 'inconclusive', severity: 'medium', message: `KMS enumeration failed: ${err.message}` }])];
    }

    if (!keyrings.length) {
      return [buildDoc(ctx, { type: 'gcp_kms', id: `kms-${ctx.project}`, account_id: ctx.project },
        [{ control_framework: 'SCF', control_id: 'CRY-09', status: 'not_applicable', severity: 'info', message: 'No CMEK keyrings found in probed locations.' }])];
    }

    for (const kr of keyrings) {
      const krName = kr.name.split('/').pop();
      try {
        const { stdout } = await gcloud(['kms', 'keys', 'list', `--keyring=${krName}`, `--location=${kr.location}`, `--project=${ctx.project}`, '--format=json']);
        const keys = JSON.parse(stdout || '[]');
        for (const k of keys) {
          const keyName = k.name.split('/').pop();
          const resource = { type: 'gcp_kms_key', id: k.name, uri: k.name, region: kr.location, account_id: ctx.project };
          const evaluations = [];
          const period = k.rotationPeriod;  // e.g. "7776000s" (90d)
          if (k.purpose !== 'ENCRYPT_DECRYPT') {
            evaluations.push({ control_framework: 'SCF', control_id: 'CRY-09', status: 'not_applicable', severity: 'info', message: `Purpose '${k.purpose}' — rotation semantics differ.` });
          } else if (!period) {
            evaluations.push({
              control_framework: 'SCF', control_id: 'CRY-09', status: 'fail', severity: 'medium',
              message: `Key ${keyName} has no automatic rotation configured.`,
              remediation: { summary: 'Set rotationPeriod to 7776000s (90d) or shorter.', ref: 'grc-engineer://generate-implementation/key_rotation/gcp', effort_hours: 0.1, automation: 'auto_fixable' }
            });
          } else {
            const seconds = parseInt(period, 10);
            if (seconds > 7776000) evaluations.push({
              control_framework: 'SCF', control_id: 'CRY-09', status: 'fail', severity: 'medium',
              message: `Key ${keyName} rotation period is ${Math.round(seconds/86400)}d — exceeds 90d baseline.`,
              remediation: { summary: 'Shorten rotationPeriod to 7776000s (90d).', ref: 'grc-engineer://generate-implementation/key_rotation/gcp', effort_hours: 0.1, automation: 'auto_fixable' }
            });
            else evaluations.push({ control_framework: 'SCF', control_id: 'CRY-09', status: 'pass', severity: 'info' });
          }
          findings.push(buildDoc(ctx, resource, evaluations));
        }
      } catch (err) {
        findings.push(buildDoc(ctx, { type: 'gcp_kms_keyring', id: kr.name, region: kr.location, account_id: ctx.project },
          [{ control_framework: 'SCF', control_id: 'CRY-09', status: 'inconclusive', severity: 'low', message: err.message }]));
      }
    }
    return findings;
  },

  async compute(ctx, log) {
    const resource = { type: 'gcp_compute_project', id: `compute-${ctx.project}`, account_id: ctx.project };
    const evaluations = [];
    try {
      const { stdout } = await gcloud(['compute', 'project-info', 'describe', `--project=${ctx.project}`, '--format=json']);
      const info = JSON.parse(stdout);
      const metadata = info.commonInstanceMetadata?.items || [];
      const osLogin = metadata.find(i => i.key === 'enable-oslogin');
      if (osLogin?.value === 'TRUE') {
        evaluations.push({ control_framework: 'SCF', control_id: 'IAC-02', status: 'pass', severity: 'info' });
      } else {
        evaluations.push({
          control_framework: 'SCF', control_id: 'IAC-02', status: 'fail', severity: 'medium',
          message: 'OS Login is not enabled at the project level; instances may fall back to SSH keys in metadata.',
          remediation: { summary: 'Set project metadata enable-oslogin=TRUE.', ref: 'grc-engineer://generate-implementation/compute_os_login/gcp', effort_hours: 0.1, automation: 'auto_fixable' }
        });
      }
    } catch (err) {
      evaluations.push({ control_framework: 'SCF', control_id: 'IAC-02', status: 'inconclusive', severity: 'low', message: err.message });
    }
    return [buildDoc(ctx, resource, evaluations)];
  }
};

// ---------------------------------------------------------------------------
// Utilities

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

async function gcloud(args, opts = {}) {
  try {
    return await execFileP('gcloud', args, { maxBuffer: 64 * 1024 * 1024 });
  } catch (err) {
    const stderr = String(err.stderr || '').trim();
    if (/reauthentication is needed|credentials are no longer valid|AccessDeniedException.*ReauthFailed/i.test(stderr)) {
      const e = new Error(`gcloud auth expired: ${stderr.split('\n')[0]}`);
      e.code = 'AUTH_FAILED';
      throw e;
    }
    if (opts.tolerateFailure) return { stdout: '', stderr };
    throw new Error(stderr.split('\n')[0] || err.message);
  }
}

function parseArgs(argv) {
  const out = { project: '', services: [], output: 'summary', quiet: false };
  for (const tok of argv) {
    if (!tok.startsWith('--')) continue;
    const [k, v] = tok.slice(2).split('=');
    switch (k) {
      case 'project':  out.project = v || ''; break;
      case 'services': out.services = String(v || '').split(',').map(s => s.trim()).filter(Boolean); break;
      case 'output':   out.output = v || 'summary'; break;
      case 'refresh':  break;
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
    const trimmed = line.slice(indent);
    const listMatch = trimmed.match(/^-\s+(.*)$/);
    if (listMatch) {
      if (!Array.isArray(parent._list)) parent._list = [];
      let v = listMatch[1];
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      parent._list.push(v);
      continue;
    }
    const m = trimmed.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    if (val === '') {
      const child = {}; parent[key] = child; stack.push({ indent, obj: child });
    } else if (val.startsWith('[') && val.endsWith(']')) {
      parent[key] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
    } else {
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      else if (val === 'true' || val === 'false') val = val === 'true';
      else if (/^-?\d+(\.\d+)?$/.test(val)) val = Number(val);
      parent[key] = val;
    }
  }
  const fix = (o) => {
    if (!o || typeof o !== 'object') return;
    for (const [k, v] of Object.entries(o)) {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        if (Array.isArray(v._list) && Object.keys(v).length === 1) { o[k] = v._list; continue; }
        fix(v);
      }
    }
  };
  fix(out);
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
