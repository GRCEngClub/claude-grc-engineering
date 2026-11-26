#!/usr/bin/env node

import { realpathSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

const execFileP = promisify(execFile);

const CONFIG_DIR = process.env.CLAUDE_GRC_CONFIG_DIR || path.join(os.homedir(), '.config', 'claude-grc');
const CONFIG_FILE = path.join(CONFIG_DIR, 'connectors', 'aws-inspector.yaml');
const CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'findings', 'aws-inspector');
const RUNS_LOG = path.join(os.homedir(), '.cache', 'claude-grc', 'runs.log');
const SOURCE = 'aws-inspector';
const SOURCE_VERSION = '0.1.0';

const EXIT = { OK: 0, USAGE: 2, AUTH: 2, RATE_LIMITED: 3, PARTIAL: 4, NOT_CONFIGURED: 5 };

async function main(argv) {
  const args = parseArgs(argv);
  const log = args.quiet ? () => {} : (m) => process.stderr.write(`[${SOURCE}] ${m}\n`);

  let config;
  try { config = parseYaml(await fs.readFile(CONFIG_FILE, 'utf8')); }
  catch { fail(EXIT.NOT_CONFIGURED, `config missing (${CONFIG_FILE}). Run /aws-inspector:setup first.`); }

  const profile = args.profile || config.profile || process.env.AWS_PROFILE || '';
  const regions = args.regions?.length ? args.regions : (config.defaults?.regions || [config.default_region || 'us-east-1']);
  const services = args.services?.length ? args.services : (config.defaults?.services || ['iam', 's3', 'cloudtrail', 'ebs']);
  const accountId = config.account_id;
  if (!accountId) fail(EXIT.NOT_CONFIGURED, 'account_id missing from config. Re-run /aws-inspector:setup.');

  const env = { ...process.env };
  if (profile) env.AWS_PROFILE = profile;

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const runId = makeRunId();
  const startedAt = Date.now();
  log(`regions=${regions.join(',')} services=${services.join(',')} profile=${profile || '<default>'}`);

  const findings = [];
  const errors = [];

  const ctx = { env, regions, runId, accountId };

  if (services.includes('iam')) {
    try { findings.push(...await collectIAM(ctx, log)); }
    catch (err) { errors.push({ service: 'iam', error: err.message }); log(`iam failed: ${err.message}`); }
  }

  if (services.includes('ebs')) {
    for (const region of regions) {
      try { findings.push(...await collectEBS(ctx, region, log)); }
      catch (err) { errors.push({ service: 'ebs', region, error: err.message }); log(`ebs ${region} failed: ${err.message}`); }
    }
  }

  if (services.includes('s3')) {
    try { findings.push(...await collectS3(ctx, log)); }
    catch (err) { errors.push({ service: 's3', error: err.message }); log(`s3 failed: ${err.message}`); }
  }

  if (services.includes('cloudtrail')) {
    for (const region of regions) {
      try { findings.push(...await collectCloudTrail(ctx, region, log)); }
      catch (err) { errors.push({ service: 'cloudtrail', region, error: err.message }); log(`cloudtrail ${region} failed: ${err.message}`); }
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
    source: SOURCE,
    run_id: runId,
    started_at: new Date(startedAt).toISOString(),
    duration_ms: Date.now() - startedAt,
    account_id: accountId,
    regions,
    services,
    resources: findings.length,
    evaluations: findings.reduce((n, d) => n + d.evaluations.length, 0),
    counters,
    severities: sev,
    errors: errors.length
  };
  await fs.appendFile(RUNS_LOG, JSON.stringify(manifest) + '\n');

  const summary = `${SOURCE}: ${findings.length} resources, ${manifest.evaluations} evaluations, ${counters.fail || 0} failing (${sev.critical || 0} critical, ${sev.high || 0} high, ${sev.medium || 0} medium).`;
  if (args.output === 'json') {
    process.stdout.write(JSON.stringify({ run_id: runId, cache_path: cachePath, summary: manifest, errors }, null, 2) + '\n');
  } else if (args.output !== 'silent') {
    process.stdout.write(summary + '\n');
    if (errors.length) process.stdout.write(`(${errors.length} partial errors — see JSON output for details)\n`);
  }

  process.exit(errors.length ? EXIT.PARTIAL : EXIT.OK);
}

async function collectIAM(ctx, log) {
  const findings = [];
  const account = ctx.accountId;
  const resource = { type: 'aws_account', id: account, arn: `arn:aws:iam::${account}:root`, region: null, account_id: account };
  const evaluations = [];

  try {
    const sum = JSON.parse((await aws(ctx.env, ['iam', 'get-account-summary', '--output', 'json'])).stdout);
    const s = sum.SummaryMap || {};
    if (s.AccountMFAEnabled === 1) {
      evaluations.push({ control_framework: 'SCF', control_id: 'IAC-01.1', status: 'pass', severity: 'info' });
    } else {
      evaluations.push({
        control_framework: 'SCF', control_id: 'IAC-01.1',
        status: 'fail', severity: 'critical',
        message: 'Root account does not have MFA enabled.',
        remediation: { summary: 'Enable a hardware or virtual MFA device on the root user immediately.', ref: 'engineer://generate-implementation/root_mfa/aws', effort_hours: 0.25, automation: 'manual' }
      });
    }
    if (s.AccountAccessKeysPresent === 0) {
      evaluations.push({ control_framework: 'SCF', control_id: 'IAC-15.1', status: 'pass', severity: 'info' });
    } else {
      evaluations.push({
        control_framework: 'SCF', control_id: 'IAC-15.1',
        status: 'fail', severity: 'critical',
        message: 'Root account has active access keys. These should never exist.',
        remediation: { summary: 'Delete root access keys; use IAM users/roles for programmatic access.', ref: 'engineer://generate-implementation/root_keys/aws', effort_hours: 0.1, automation: 'manual' }
      });
    }
  } catch (err) {
    evaluations.push({ control_framework: 'SCF', control_id: 'IAC-01.1', status: 'inconclusive', severity: 'medium', message: `Could not read account summary: ${err.message}` });
  }

  try {
    const pol = JSON.parse((await aws(ctx.env, ['iam', 'get-account-password-policy', '--output', 'json'])).stdout);
    const p = pol.PasswordPolicy || {};
    const issues = [];
    if ((p.MinimumPasswordLength || 0) < 14) issues.push(`MinimumPasswordLength=${p.MinimumPasswordLength || 0} (<14)`);
    if (!p.RequireSymbols)   issues.push('RequireSymbols=false');
    if (!p.RequireNumbers)   issues.push('RequireNumbers=false');
    if (!p.RequireUppercaseCharacters) issues.push('RequireUppercase=false');
    if (!p.RequireLowercaseCharacters) issues.push('RequireLowercase=false');
    if (!p.ExpirePasswords || (p.MaxPasswordAge || 365) > 90) issues.push(`MaxPasswordAge=${p.MaxPasswordAge || 'unset'} (>90)`);
    if ((p.PasswordReusePrevention || 0) < 24) issues.push(`PasswordReusePrevention=${p.PasswordReusePrevention || 0} (<24)`);
    if (issues.length === 0) {
      evaluations.push({ control_framework: 'SCF', control_id: 'IAC-02', status: 'pass', severity: 'info' });
    } else {
      evaluations.push({
        control_framework: 'SCF', control_id: 'IAC-02',
        status: 'fail', severity: 'high',
        message: `Password policy weaknesses: ${issues.join(', ')}.`,
        remediation: { summary: 'Tighten the account password policy to the FedRAMP/NIST baseline.', ref: 'engineer://generate-implementation/password_policy/aws', effort_hours: 0.25, automation: 'auto_fixable' }
      });
    }
  } catch (err) {
    if (/NoSuchEntity/.test(err.message)) {
      evaluations.push({
        control_framework: 'SCF', control_id: 'IAC-02',
        status: 'fail', severity: 'high',
        message: 'No account password policy is configured (NoSuchEntity).',
        remediation: { summary: 'Create a password policy meeting the FedRAMP/NIST baseline.', ref: 'engineer://generate-implementation/password_policy/aws', effort_hours: 0.25, automation: 'auto_fixable' }
      });
    } else {
      evaluations.push({ control_framework: 'SCF', control_id: 'IAC-02', status: 'inconclusive', severity: 'high', message: `Could not read password policy: ${err.message}` });
    }
  }

  findings.push({
    schema_version: '1.0.0',
    source: SOURCE,
    source_version: SOURCE_VERSION,
    run_id: ctx.runId,
    collected_at: new Date().toISOString(),
    resource,
    evaluations
  });
  return findings;
}

async function collectEBS(ctx, region, log) {
  try {
    const { stdout } = await aws(ctx.env, ['ec2', 'get-ebs-encryption-by-default', '--region', region, '--output', 'json']);
    const enabled = JSON.parse(stdout).EbsEncryptionByDefault;
    const resource = { type: 'aws_ebs_region', id: `ebs-${region}`, arn: null, region, account_id: ctx.accountId };
    const evaluations = [enabled
      ? { control_framework: 'SCF', control_id: 'CRY-05', status: 'pass', severity: 'info' }
      : {
          control_framework: 'SCF', control_id: 'CRY-05', status: 'fail', severity: 'high',
          message: `EBS default encryption is disabled in ${region}; new volumes can be created unencrypted.`,
          remediation: { summary: `Enable EBS default encryption in ${region} with a customer-managed KMS key.`, ref: 'engineer://generate-implementation/encryption_at_rest/aws', effort_hours: 0.1, automation: 'auto_fixable' }
        }];
    return [{
      schema_version: '1.0.0', source: SOURCE, source_version: SOURCE_VERSION, run_id: ctx.runId,
      collected_at: new Date().toISOString(), resource, evaluations
    }];
  } catch (err) {
    return [{
      schema_version: '1.0.0', source: SOURCE, source_version: SOURCE_VERSION, run_id: ctx.runId,
      collected_at: new Date().toISOString(),
      resource: { type: 'aws_ebs_region', id: `ebs-${region}`, region, account_id: ctx.accountId },
      evaluations: [{ control_framework: 'SCF', control_id: 'CRY-05', status: 'inconclusive', severity: 'medium', message: `Could not check EBS default encryption in ${region}: ${err.message}` }]
    }];
  }
}

async function collectS3(ctx, log) {
  const findings = [];
  const buckets = JSON.parse((await aws(ctx.env, ['s3api', 'list-buckets', '--output', 'json'])).stdout).Buckets || [];
  log(`s3: ${buckets.length} buckets`);
  for (const b of buckets) {
    const name = b.Name;
    const resource = { type: 'aws_s3_bucket', id: name, arn: `arn:aws:s3:::${name}`, region: null, account_id: ctx.accountId };
    const evaluations = [];

    try {
      const { stdout } = await aws(ctx.env, ['s3api', 'get-bucket-encryption', '--bucket', name, '--output', 'json']);
      const rules = JSON.parse(stdout).ServerSideEncryptionConfiguration?.Rules || [];
      if (rules.length) evaluations.push({ control_framework: 'SCF', control_id: 'CRY-05', status: 'pass', severity: 'info' });
      else evaluations.push({
        control_framework: 'SCF', control_id: 'CRY-05', status: 'fail', severity: 'high',
        message: 'Bucket has no default server-side encryption configured.',
        remediation: { summary: 'Enable SSE-KMS with a customer-managed KMS key and rotation.', ref: 'engineer://generate-implementation/encryption_at_rest/aws', effort_hours: 0.25, automation: 'auto_fixable' }
      });
    } catch (err) {
      if (/ServerSideEncryptionConfigurationNotFoundError/.test(err.message)) {
        evaluations.push({
          control_framework: 'SCF', control_id: 'CRY-05', status: 'fail', severity: 'high',
          message: 'Bucket has no default server-side encryption configured.',
          remediation: { summary: 'Enable SSE-KMS with a customer-managed KMS key.', ref: 'engineer://generate-implementation/encryption_at_rest/aws', effort_hours: 0.25, automation: 'auto_fixable' }
        });
      } else {
        evaluations.push({ control_framework: 'SCF', control_id: 'CRY-05', status: 'inconclusive', severity: 'medium', message: `Encryption check failed: ${err.message}` });
      }
    }

    try {
      const { stdout } = await aws(ctx.env, ['s3api', 'get-public-access-block', '--bucket', name, '--output', 'json']);
      const pab = JSON.parse(stdout).PublicAccessBlockConfiguration || {};
      const allOn = pab.BlockPublicAcls && pab.IgnorePublicAcls && pab.BlockPublicPolicy && pab.RestrictPublicBuckets;
      evaluations.push(allOn
        ? { control_framework: 'SCF', control_id: 'DCH-01.2', status: 'pass', severity: 'info' }
        : {
            control_framework: 'SCF', control_id: 'DCH-01.2', status: 'fail', severity: 'critical',
            message: 'Public access block is not fully enforced.',
            remediation: { summary: 'Enable all four public access block settings.', ref: 'engineer://generate-implementation/s3_public_access/aws', effort_hours: 0.1, automation: 'auto_fixable' }
          });
    } catch (err) {
      if (/NoSuchPublicAccessBlockConfiguration/.test(err.message)) {
        evaluations.push({
          control_framework: 'SCF', control_id: 'DCH-01.2', status: 'fail', severity: 'critical',
          message: 'No public access block configured.',
          remediation: { summary: 'Apply a bucket-level public access block with all four settings enabled.', ref: 'engineer://generate-implementation/s3_public_access/aws', effort_hours: 0.1, automation: 'auto_fixable' }
        });
      } else {
        evaluations.push({ control_framework: 'SCF', control_id: 'DCH-01.2', status: 'inconclusive', severity: 'medium', message: err.message });
      }
    }

    try {
      const { stdout } = await aws(ctx.env, ['s3api', 'get-bucket-versioning', '--bucket', name, '--output', 'json']);
      const v = JSON.parse(stdout || '{}');
      if (v.Status === 'Enabled') evaluations.push({ control_framework: 'SCF', control_id: 'AST-05', status: 'pass', severity: 'info' });
      else evaluations.push({
        control_framework: 'SCF', control_id: 'AST-05', status: 'fail', severity: 'medium',
        message: `Versioning not enabled (status: ${v.Status || 'unset'}).`,
        remediation: { summary: 'Enable versioning for buckets that hold production or audit data.', ref: 'engineer://generate-implementation/s3_versioning/aws', effort_hours: 0.1, automation: 'auto_fixable' }
      });
    } catch (err) {
      evaluations.push({ control_framework: 'SCF', control_id: 'AST-05', status: 'inconclusive', severity: 'low', message: err.message });
    }

    findings.push({
      schema_version: '1.0.0', source: SOURCE, source_version: SOURCE_VERSION, run_id: ctx.runId,
      collected_at: new Date().toISOString(), resource, evaluations
    });
  }
  return findings;
}

async function collectCloudTrail(ctx, region, log) {
  const { stdout } = await aws(ctx.env, ['cloudtrail', 'describe-trails', '--region', region, '--output', 'json']);
  const trails = (JSON.parse(stdout).trailList || []).filter(t => t.HomeRegion === region);
  log(`cloudtrail ${region}: ${trails.length} trails`);
  const findings = [];

  if (!trails.length) {
    findings.push({
      schema_version: '1.0.0', source: SOURCE, source_version: SOURCE_VERSION, run_id: ctx.runId,
      collected_at: new Date().toISOString(),
      resource: { type: 'aws_cloudtrail_region', id: `cloudtrail-${region}`, region, account_id: ctx.accountId },
      evaluations: [{
        control_framework: 'SCF', control_id: 'MON-02', status: 'fail', severity: 'high',
        message: `No CloudTrail trail with home region ${region}. Verify multi-region coverage from another trail.`,
        remediation: { summary: 'Create a multi-region trail with log file validation and KMS-encrypted S3 destination.', ref: 'engineer://generate-implementation/audit_logging/aws', effort_hours: 1, automation: 'auto_fixable' }
      }]
    });
    return findings;
  }

  for (const t of trails) {
    const resource = { type: 'aws_cloudtrail_trail', id: t.Name, arn: t.TrailARN, region, account_id: ctx.accountId };
    const evaluations = [];

    if (t.IsMultiRegionTrail) evaluations.push({ control_framework: 'SCF', control_id: 'MON-02', status: 'pass', severity: 'info' });
    else evaluations.push({
      control_framework: 'SCF', control_id: 'MON-02', status: 'fail', severity: 'high',
      message: `Trail '${t.Name}' is single-region.`,
      remediation: { summary: 'Convert to a multi-region trail.', ref: 'engineer://generate-implementation/audit_logging/aws', effort_hours: 0.25, automation: 'auto_fixable' }
    });

    if (t.LogFileValidationEnabled) evaluations.push({ control_framework: 'SCF', control_id: 'MON-02.1', status: 'pass', severity: 'info' });
    else evaluations.push({
      control_framework: 'SCF', control_id: 'MON-02.1', status: 'fail', severity: 'medium',
      message: 'Log file validation is disabled.',
      remediation: { summary: 'Enable log file validation to detect tampering.', ref: 'engineer://generate-implementation/audit_logging/aws', effort_hours: 0.1, automation: 'auto_fixable' }
    });

    try {
      const st = JSON.parse((await aws(ctx.env, ['cloudtrail', 'get-trail-status', '--name', t.Name, '--region', region, '--output', 'json'])).stdout);
      if (st.IsLogging) evaluations.push({ control_framework: 'SCF', control_id: 'MON-02.2', status: 'pass', severity: 'info' });
      else evaluations.push({
        control_framework: 'SCF', control_id: 'MON-02.2', status: 'fail', severity: 'high',
        message: `Trail '${t.Name}' is not actively logging.`,
        remediation: { summary: 'Start logging on the trail.', ref: 'engineer://generate-implementation/audit_logging/aws', effort_hours: 0.1, automation: 'auto_fixable' }
      });
    } catch (err) {
      evaluations.push({ control_framework: 'SCF', control_id: 'MON-02.2', status: 'inconclusive', severity: 'medium', message: err.message });
    }

    findings.push({
      schema_version: '1.0.0', source: SOURCE, source_version: SOURCE_VERSION, run_id: ctx.runId,
      collected_at: new Date().toISOString(), resource, evaluations
    });
  }
  return findings;
}

async function aws(env, args) {
  try {
    return await execFileP('aws', args, { env, maxBuffer: 64 * 1024 * 1024 });
  } catch (err) {
    const stderr = String(err.stderr || '').trim();
    if (/Unable to locate credentials|InvalidClientTokenId|ExpiredToken|AccessDenied.*sts/i.test(stderr)) {
      const e = new Error(`AWS auth failed: ${stderr.split('\n')[0]}`);
      e.code = 'AUTH_FAILED';
      throw e;
    }
    throw new Error(stderr.split('\n')[0] || err.message);
  }
}

function parseArgs(argv) {
  const out = { regions: [], services: [], profile: '', output: 'summary', quiet: false };
  for (const tok of argv) {
    if (!tok.startsWith('--')) continue;
    const [k, v] = tok.slice(2).split('=');
    switch (k) {
      case 'regions':  out.regions = String(v || '').split(',').map(s => s.trim()).filter(Boolean); break;
      case 'services': out.services = String(v || '').split(',').map(s => s.trim()).filter(Boolean); break;
      case 'profile':  out.profile = v || ''; break;
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
      const child = {};
      parent[key] = child;
      stack.push({ indent, obj: child });
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

const invokedFromCLI = import.meta.url === (() => { try { return pathToFileURL(realpathSync(process.argv[1])).href; } catch { return null; } })();
if (invokedFromCLI) {
  main(process.argv.slice(2)).catch(err => {
    process.stderr.write(`[${SOURCE}] unexpected error: ${err.stack || err.message}\n`);
    process.exit(1);
  });
}
