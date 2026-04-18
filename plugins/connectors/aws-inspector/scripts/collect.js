#!/usr/bin/env node

/**
 * aws-inspector:collect
 *
 * Runs AWS CLI read-only queries and emits findings conforming to
 * schemas/finding.schema.json v1.
 *
 * Usage:
 *   node collect.js [--regions=us-east-1,us-west-2]
 *                   [--services=iam,s3,cloudtrail,ebs]
 *                   [--profile=<name>] [--output=summary|silent|json]
 *                   [--scope-file=<path>] [--tag-filter=env=production]
 *                   [--quiet]
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
const CONFIG_FILE = path.join(CONFIG_DIR, 'connectors', 'aws-inspector.yaml');
const CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'findings', 'aws-inspector');
const RUNS_LOG = path.join(os.homedir(), '.cache', 'claude-grc', 'runs.log');
const PLUGIN_DIR = path.resolve(new URL('.', import.meta.url).pathname, '..');
const DEFAULT_SCOPE_FILE = path.join(PLUGIN_DIR, 'config', 'scope.yaml');
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
  let regions = args.regions?.length ? args.regions : (config.defaults?.regions || [config.default_region || 'us-east-1']);
  const services = args.services?.length ? args.services : (config.defaults?.services || ['iam', 's3', 'cloudtrail', 'ebs']);

  // Load scope file for production filtering
  let scope = null;
  const scopePath = args.scopeFile || config.defaults?.scope_file || '';
  if (scopePath) {
    try {
      scope = parseYaml(await fs.readFile(scopePath, 'utf8'));
      log(`scope: loaded from ${scopePath}`);
    } catch { fail(EXIT.USAGE, `Scope file not found: ${scopePath}`); }
  } else if (await fileExists(DEFAULT_SCOPE_FILE)) {
    try {
      const parsed = parseYaml(await fs.readFile(DEFAULT_SCOPE_FILE, 'utf8'));
      // Only activate scope if the file has meaningful content (non-empty lists or tag filters)
      const hasContent = (Array.isArray(parsed.profiles) && parsed.profiles.length)
        || (Array.isArray(parsed.tag_filters) && parsed.tag_filters.length)
        || parsed.tag_key
        || (Array.isArray(parsed.bucket_patterns) && parsed.bucket_patterns.length)
        || (Array.isArray(parsed.regions) && parsed.regions.length);
      if (hasContent) { scope = parsed; log(`scope: loaded from ${DEFAULT_SCOPE_FILE}`); }
    } catch { /* default scope file missing or unreadable — no scoping */ }
  }

  // Merge CLI --tag-filter into scope
  if (args.tagFilters?.length) {
    if (!scope) scope = {};
    scope.tag_filters = [...(scope.tag_filters || []), ...args.tagFilters];
  }

  // Override regions from scope if present
  if (scope && Array.isArray(scope.regions) && scope.regions.length) {
    regions = scope.regions;
  }

  // Determine profiles to scan
  const profiles = (scope && Array.isArray(scope.profiles) && scope.profiles.length)
    ? scope.profiles
    : [profile];
  const isMultiProfile = profiles.length > 1 || (scope?.profiles?.length > 0);

  // For single-profile mode, require account_id from config
  if (!isMultiProfile) {
    const accountId = config.account_id;
    if (!accountId) fail(EXIT.NOT_CONFIGURED, 'account_id missing from config. Re-run /aws-inspector:setup.');
  }

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const runId = makeRunId();
  const startedAt = Date.now();

  const allFindings = [];
  const allErrors = [];

  for (const prof of profiles) {
    const profEnv = { ...process.env };
    if (prof) profEnv.AWS_PROFILE = prof;

    // Resolve account ID for this profile
    let accountId;
    if (isMultiProfile || !config.account_id) {
      try {
        const { stdout } = await aws(profEnv, ['sts', 'get-caller-identity', '--output', 'json']);
        accountId = JSON.parse(stdout).Account;
      } catch (err) {
        allErrors.push({ profile: prof, error: `Auth failed: ${err.message}` });
        log(`profile=${prof || '<default>'} auth failed, skipping`);
        continue;
      }
    } else {
      accountId = config.account_id;
    }

    log(`profile=${prof || '<default>'} account=${accountId} regions=${regions.join(',')} services=${services.join(',')}`);

    const { findings, errors } = await scanAccount({ env: profEnv, accountId, regions, services, scope, runId, log });
    allFindings.push(...findings);
    allErrors.push(...errors);
  }

  const cachePath = path.join(CACHE_DIR, `${runId}.json`);
  await fs.writeFile(cachePath, JSON.stringify(allFindings, null, 2));

  const counters = { pass: 0, fail: 0, inconclusive: 0, not_applicable: 0, skipped: 0 };
  const sev = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const d of allFindings) for (const e of d.evaluations) {
    counters[e.status] = (counters[e.status] || 0) + 1;
    if (e.severity) sev[e.severity] = (sev[e.severity] || 0) + 1;
  }

  const manifest = {
    source: SOURCE,
    run_id: runId,
    started_at: new Date(startedAt).toISOString(),
    duration_ms: Date.now() - startedAt,
    profiles: profiles.filter(Boolean),
    regions,
    services,
    scope: scope ? true : false,
    resources: allFindings.length,
    evaluations: allFindings.reduce((n, d) => n + d.evaluations.length, 0),
    counters,
    severities: sev,
    errors: allErrors.length
  };
  await fs.appendFile(RUNS_LOG, JSON.stringify(manifest) + '\n');

  const summary = `${SOURCE}: ${allFindings.length} resources, ${manifest.evaluations} evaluations, ${counters.fail || 0} failing (${sev.critical || 0} critical, ${sev.high || 0} high, ${sev.medium || 0} medium).`;
  if (args.output === 'json') {
    process.stdout.write(JSON.stringify({ run_id: runId, cache_path: cachePath, summary: manifest, errors: allErrors }, null, 2) + '\n');
  } else if (args.output !== 'silent') {
    process.stdout.write(summary + '\n');
    if (allErrors.length) process.stdout.write(`(${allErrors.length} partial errors — see JSON output for details)\n`);
  }

  process.exit(allErrors.length ? EXIT.PARTIAL : EXIT.OK);
}

async function scanAccount({ env, accountId, regions, services, scope, runId, log }) {
  const findings = [];
  const errors = [];
  const ctx = { env, regions, runId, accountId };

  if (services.includes('iam')) {
    try { findings.push(...await collectIAM(ctx, log)); }
    catch (err) { errors.push({ service: 'iam', account: accountId, error: err.message }); log(`iam failed: ${err.message}`); }
  }

  if (services.includes('ebs')) {
    for (const region of regions) {
      try { findings.push(...await collectEBS(ctx, region, log)); }
      catch (err) { errors.push({ service: 'ebs', region, account: accountId, error: err.message }); log(`ebs ${region} failed: ${err.message}`); }
    }
  }

  if (services.includes('s3')) {
    try { findings.push(...await collectS3(ctx, log, scope)); }
    catch (err) { errors.push({ service: 's3', account: accountId, error: err.message }); log(`s3 failed: ${err.message}`); }
  }

  if (services.includes('cloudtrail')) {
    for (const region of regions) {
      try { findings.push(...await collectCloudTrail(ctx, region, log)); }
      catch (err) { errors.push({ service: 'cloudtrail', region, account: accountId, error: err.message }); log(`cloudtrail ${region} failed: ${err.message}`); }
    }
  }

  return { findings, errors };
}

// ---------------------------------------------------------------------------
// IAM checks (account-level)

async function collectIAM(ctx, log) {
  const findings = [];
  const account = ctx.accountId;
  const resource = { type: 'aws_account', id: account, arn: `arn:aws:iam::${account}:root`, region: null, account_id: account };
  const evaluations = [];

  // IAC-01.1: root has MFA, and AccountAccessKeysPresent=0
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
        remediation: { summary: 'Enable a hardware or virtual MFA device on the root user immediately.', ref: 'grc-engineer://generate-implementation/root_mfa/aws', effort_hours: 0.25, automation: 'manual' }
      });
    }
    if (s.AccountAccessKeysPresent === 0) {
      evaluations.push({ control_framework: 'SCF', control_id: 'IAC-15.1', status: 'pass', severity: 'info' });
    } else {
      evaluations.push({
        control_framework: 'SCF', control_id: 'IAC-15.1',
        status: 'fail', severity: 'critical',
        message: 'Root account has active access keys. These should never exist.',
        remediation: { summary: 'Delete root access keys; use IAM users/roles for programmatic access.', ref: 'grc-engineer://generate-implementation/root_keys/aws', effort_hours: 0.1, automation: 'manual' }
      });
    }
  } catch (err) {
    evaluations.push({ control_framework: 'SCF', control_id: 'IAC-01.1', status: 'inconclusive', severity: 'medium', message: `Could not read account summary: ${err.message}` });
  }

  // IAC-02: Password policy
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
        remediation: { summary: 'Tighten the account password policy to the FedRAMP/NIST baseline.', ref: 'grc-engineer://generate-implementation/password_policy/aws', effort_hours: 0.25, automation: 'auto_fixable' }
      });
    }
  } catch (err) {
    if (/NoSuchEntity/.test(err.message)) {
      evaluations.push({
        control_framework: 'SCF', control_id: 'IAC-02',
        status: 'fail', severity: 'high',
        message: 'No account password policy is configured (NoSuchEntity).',
        remediation: { summary: 'Create a password policy meeting the FedRAMP/NIST baseline.', ref: 'grc-engineer://generate-implementation/password_policy/aws', effort_hours: 0.25, automation: 'auto_fixable' }
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

// ---------------------------------------------------------------------------
// EBS default encryption per region

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
          remediation: { summary: `Enable EBS default encryption in ${region} with a customer-managed KMS key.`, ref: 'grc-engineer://generate-implementation/encryption_at_rest/aws', effort_hours: 0.1, automation: 'auto_fixable' }
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

// ---------------------------------------------------------------------------
// S3 — list all buckets, evaluate each

async function collectS3(ctx, log, scope) {
  const findings = [];
  const allBuckets = JSON.parse((await aws(ctx.env, ['s3api', 'list-buckets', '--output', 'json'])).stdout).Buckets || [];
  log(`s3: ${allBuckets.length} buckets total`);

  // Build tag filters from scope and CLI
  const tagFilters = buildTagFilters(scope);
  const hasNameFilter = scope && ((Array.isArray(scope.bucket_patterns) && scope.bucket_patterns.length) || (Array.isArray(scope.bucket_exclude) && scope.bucket_exclude.length));

  // Name-pattern filtering first (free — no API calls)
  let buckets = allBuckets;
  if (hasNameFilter) {
    buckets = buckets.filter(b => matchesBucketScope(b.Name, scope));
    log(`s3: ${buckets.length}/${allBuckets.length} buckets after name filtering`);
  }

  for (const b of buckets) {
    const name = b.Name;

    // Tag filtering (requires one API call per bucket)
    if (tagFilters.length) {
      try {
        const tags = await getBucketTags(ctx.env, name);
        if (!matchesTagFilters(tags, tagFilters)) {
          log(`s3: skipping ${name} (tag filter mismatch)`);
          continue;
        }
      } catch (err) {
        log(`s3: skipping ${name} (tag check failed: ${err.message})`);
        continue;
      }
    }
    const resource = { type: 'aws_s3_bucket', id: name, arn: `arn:aws:s3:::${name}`, region: null, account_id: ctx.accountId };
    const evaluations = [];

    // CRY-05: default encryption
    try {
      const { stdout } = await aws(ctx.env, ['s3api', 'get-bucket-encryption', '--bucket', name, '--output', 'json']);
      const rules = JSON.parse(stdout).ServerSideEncryptionConfiguration?.Rules || [];
      if (rules.length) evaluations.push({ control_framework: 'SCF', control_id: 'CRY-05', status: 'pass', severity: 'info' });
      else evaluations.push({
        control_framework: 'SCF', control_id: 'CRY-05', status: 'fail', severity: 'high',
        message: 'Bucket has no default server-side encryption configured.',
        remediation: { summary: 'Enable SSE-KMS with a customer-managed KMS key and rotation.', ref: 'grc-engineer://generate-implementation/encryption_at_rest/aws', effort_hours: 0.25, automation: 'auto_fixable' }
      });
    } catch (err) {
      if (/ServerSideEncryptionConfigurationNotFoundError/.test(err.message)) {
        evaluations.push({
          control_framework: 'SCF', control_id: 'CRY-05', status: 'fail', severity: 'high',
          message: 'Bucket has no default server-side encryption configured.',
          remediation: { summary: 'Enable SSE-KMS with a customer-managed KMS key.', ref: 'grc-engineer://generate-implementation/encryption_at_rest/aws', effort_hours: 0.25, automation: 'auto_fixable' }
        });
      } else {
        evaluations.push({ control_framework: 'SCF', control_id: 'CRY-05', status: 'inconclusive', severity: 'medium', message: `Encryption check failed: ${err.message}` });
      }
    }

    // DCH-01.2: public access block
    try {
      const { stdout } = await aws(ctx.env, ['s3api', 'get-public-access-block', '--bucket', name, '--output', 'json']);
      const pab = JSON.parse(stdout).PublicAccessBlockConfiguration || {};
      const allOn = pab.BlockPublicAcls && pab.IgnorePublicAcls && pab.BlockPublicPolicy && pab.RestrictPublicBuckets;
      evaluations.push(allOn
        ? { control_framework: 'SCF', control_id: 'DCH-01.2', status: 'pass', severity: 'info' }
        : {
            control_framework: 'SCF', control_id: 'DCH-01.2', status: 'fail', severity: 'critical',
            message: 'Public access block is not fully enforced.',
            remediation: { summary: 'Enable all four public access block settings.', ref: 'grc-engineer://generate-implementation/s3_public_access/aws', effort_hours: 0.1, automation: 'auto_fixable' }
          });
    } catch (err) {
      if (/NoSuchPublicAccessBlockConfiguration/.test(err.message)) {
        evaluations.push({
          control_framework: 'SCF', control_id: 'DCH-01.2', status: 'fail', severity: 'critical',
          message: 'No public access block configured.',
          remediation: { summary: 'Apply a bucket-level public access block with all four settings enabled.', ref: 'grc-engineer://generate-implementation/s3_public_access/aws', effort_hours: 0.1, automation: 'auto_fixable' }
        });
      } else {
        evaluations.push({ control_framework: 'SCF', control_id: 'DCH-01.2', status: 'inconclusive', severity: 'medium', message: err.message });
      }
    }

    // AST-05: versioning
    try {
      const { stdout } = await aws(ctx.env, ['s3api', 'get-bucket-versioning', '--bucket', name, '--output', 'json']);
      const v = JSON.parse(stdout || '{}');
      if (v.Status === 'Enabled') evaluations.push({ control_framework: 'SCF', control_id: 'AST-05', status: 'pass', severity: 'info' });
      else evaluations.push({
        control_framework: 'SCF', control_id: 'AST-05', status: 'fail', severity: 'medium',
        message: `Versioning not enabled (status: ${v.Status || 'unset'}).`,
        remediation: { summary: 'Enable versioning for buckets that hold production or audit data.', ref: 'grc-engineer://generate-implementation/s3_versioning/aws', effort_hours: 0.1, automation: 'auto_fixable' }
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

// ---------------------------------------------------------------------------
// CloudTrail — per region

async function collectCloudTrail(ctx, region, log) {
  const { stdout } = await aws(ctx.env, ['cloudtrail', 'describe-trails', '--region', region, '--output', 'json']);
  const trails = (JSON.parse(stdout).trailList || []).filter(t => t.HomeRegion === region);
  log(`cloudtrail ${region}: ${trails.length} trails`);
  const findings = [];

  if (!trails.length) {
    // No trails in home region — if multi-region coverage exists elsewhere, it's ok, but flag for operator review.
    findings.push({
      schema_version: '1.0.0', source: SOURCE, source_version: SOURCE_VERSION, run_id: ctx.runId,
      collected_at: new Date().toISOString(),
      resource: { type: 'aws_cloudtrail_region', id: `cloudtrail-${region}`, region, account_id: ctx.accountId },
      evaluations: [{
        control_framework: 'SCF', control_id: 'MON-02', status: 'fail', severity: 'high',
        message: `No CloudTrail trail with home region ${region}. Verify multi-region coverage from another trail.`,
        remediation: { summary: 'Create a multi-region trail with log file validation and KMS-encrypted S3 destination.', ref: 'grc-engineer://generate-implementation/audit_logging/aws', effort_hours: 1, automation: 'auto_fixable' }
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
      remediation: { summary: 'Convert to a multi-region trail.', ref: 'grc-engineer://generate-implementation/audit_logging/aws', effort_hours: 0.25, automation: 'auto_fixable' }
    });

    if (t.LogFileValidationEnabled) evaluations.push({ control_framework: 'SCF', control_id: 'MON-02.1', status: 'pass', severity: 'info' });
    else evaluations.push({
      control_framework: 'SCF', control_id: 'MON-02.1', status: 'fail', severity: 'medium',
      message: 'Log file validation is disabled.',
      remediation: { summary: 'Enable log file validation to detect tampering.', ref: 'grc-engineer://generate-implementation/audit_logging/aws', effort_hours: 0.1, automation: 'auto_fixable' }
    });

    // Status check — is it actually logging?
    try {
      const st = JSON.parse((await aws(ctx.env, ['cloudtrail', 'get-trail-status', '--name', t.Name, '--region', region, '--output', 'json'])).stdout);
      if (st.IsLogging) evaluations.push({ control_framework: 'SCF', control_id: 'MON-02.2', status: 'pass', severity: 'info' });
      else evaluations.push({
        control_framework: 'SCF', control_id: 'MON-02.2', status: 'fail', severity: 'high',
        message: `Trail '${t.Name}' is not actively logging.`,
        remediation: { summary: 'Start logging on the trail.', ref: 'grc-engineer://generate-implementation/audit_logging/aws', effort_hours: 0.1, automation: 'auto_fixable' }
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

// ---------------------------------------------------------------------------
// Utilities

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
      case 'scope-file': out.scopeFile = v || ''; break;
      case 'tag-filter': out.tagFilters = String(v || '').split(',').map(s => s.trim()).filter(Boolean); break;
      case 'refresh':  break; // placeholder; always refreshes for now
      case 'quiet':    out.quiet = true; break;
      default: fail(EXIT.USAGE, `Unknown flag: --${k}`);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Scope filtering helpers

async function fileExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function getBucketTags(env, bucketName) {
  try {
    const { stdout } = await aws(env, ['s3api', 'get-bucket-tagging', '--bucket', bucketName, '--output', 'json']);
    const tagSet = JSON.parse(stdout).TagSet || [];
    const tags = {};
    for (const t of tagSet) tags[t.Key] = t.Value;
    return tags;
  } catch (err) {
    if (/NoSuchTagSet/.test(err.message)) return {};
    throw err;
  }
}

function buildTagFilters(scope) {
  if (!scope) return [];
  const filters = [];
  if (scope.tag_key && scope.tag_value) filters.push(`${scope.tag_key}=${scope.tag_value}`);
  if (Array.isArray(scope.tag_filters)) filters.push(...scope.tag_filters);
  return filters;
}

function matchesTagFilters(tags, filters) {
  for (const f of filters) {
    const eq = f.indexOf('=');
    if (eq < 0) continue;
    const key = f.slice(0, eq);
    const val = f.slice(eq + 1);
    if (tags[key] !== val) return false;
  }
  return true;
}

function matchesGlob(name, pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
  return new RegExp('^' + escaped + '$').test(name);
}

function matchesBucketScope(name, scope) {
  if (!scope) return true;
  const patterns = Array.isArray(scope.bucket_patterns) ? scope.bucket_patterns : [];
  const exclude = Array.isArray(scope.bucket_exclude) ? scope.bucket_exclude : [];
  if (patterns.length && !patterns.some(p => matchesGlob(name, p))) return false;
  if (exclude.length && exclude.some(p => matchesGlob(name, p))) return false;
  return true;
}

// ---------------------------------------------------------------------------
// YAML parser

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
    // list item
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
  // Post-process: convert objects with only _list into arrays
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

const invokedFromCLI = import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedFromCLI) {
  main(process.argv.slice(2)).catch(err => {
    process.stderr.write(`[${SOURCE}] unexpected error: ${err.stack || err.message}\n`);
    process.exit(1);
  });
}
