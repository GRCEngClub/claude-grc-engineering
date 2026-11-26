#!/usr/bin/env node

import { realpathSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { resolveWritePathInside, WritePathRejected } from './write-path.js';

const execFileP = promisify(execFile);

const CONFIG_DIR = process.env.CLAUDE_GRC_CONFIG_DIR || path.join(os.homedir(), '.config', 'claude-grc');
const CONFIG_FILE = path.join(CONFIG_DIR, 'connectors', 'aws-secrets-inspector.yaml');
const SECRETS_DIR = path.join(CONFIG_DIR, 'secrets');
const CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'findings', 'aws-secrets-inspector');
const RUNS_LOG = path.join(os.homedir(), '.cache', 'claude-grc', 'runs.log');
const SOURCE = 'aws-secrets-inspector';
const SOURCE_VERSION = '0.1.0';

const EXIT = {
  OK: 0,
  USAGE: 2,
  AUTH: 2,
  RATE_LIMITED: 3,
  PARTIAL: 4,
  NOT_CONFIGURED: 5,
  NOT_FOUND: 6
};

async function main(argv) {
  const args = parseArgs(argv);
  const log = args.quiet ? () => {} : (m) => process.stderr.write(`[${SOURCE}] ${m}\n`);

  if (args.retrieve) {
    return await retrieveSecret(args, log);
  }

  let config;
  try { config = parseYaml(await fs.readFile(CONFIG_FILE, 'utf8')); }
  catch { fail(EXIT.NOT_CONFIGURED, `config missing (${CONFIG_FILE}). Run /aws-secrets-inspector:setup first.`); }

  const profile = args.profile || config.profile || process.env.AWS_PROFILE || '';
  const regions = args.regions?.length ? args.regions : (config.defaults?.regions || [config.default_region || 'us-east-1']);
  const accountId = config.account_id;
  if (!accountId) fail(EXIT.NOT_CONFIGURED, 'account_id missing from config. Re-run /aws-secrets-inspector:setup.');

  const env = { ...process.env };
  if (profile) env.AWS_PROFILE = profile;

  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.mkdir(path.dirname(RUNS_LOG), { recursive: true, mode: 0o700 });
  await fs.chmod(path.dirname(RUNS_LOG), 0o700);
  const runId = makeRunId();
  const startedAt = Date.now();
  log(`regions=${regions.join(',')} profile=${profile || '<default>'}`);

  const findings = [];
  const errors = [];

  const seenArns = new Set();

  for (const region of regions) {
    try {
      const regionFindings = await collectSecretsManager({ env, region, runId, accountId, seenArns, log });
      findings.push(...regionFindings);
    } catch (err) {
      errors.push({ service: 'secretsmanager', region, error: err.message });
      log(`secretsmanager ${region} failed: ${err.message}`);
    }
  }

  const cachePath = path.join(CACHE_DIR, `${runId}.json`);
  await fs.writeFile(cachePath, JSON.stringify(findings, null, 2), { mode: 0o600 });
  await fs.chmod(cachePath, 0o600);

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
    resources: findings.length,
    evaluations: findings.reduce((n, d) => n + d.evaluations.length, 0),
    counters,
    severities: sev,
    errors: errors.length
  };
  await fs.appendFile(RUNS_LOG, JSON.stringify(manifest) + '\n', { flag: 'a', mode: 0o600 });
  await fs.chmod(RUNS_LOG, 0o600);

  const summary = `${SOURCE}: ${findings.length} resources, ${manifest.evaluations} evaluations, ${counters.fail || 0} failing (${sev.critical || 0} critical, ${sev.high || 0} high, ${sev.medium || 0} medium).`;
  if (args.output === 'json') {
    process.stdout.write(JSON.stringify({ run_id: runId, cache_path: cachePath, summary: manifest, errors }, null, 2) + '\n');
  } else if (args.output !== 'silent') {
    process.stdout.write(summary + '\n');
    if (errors.length) process.stdout.write(`(${errors.length} partial errors — see JSON output for details)\n`);
  }

  process.exit(errors.length ? EXIT.PARTIAL : EXIT.OK);
}

async function collectSecretsManager(ctx) {
  const { env, region, runId, accountId, seenArns, log } = ctx;
  const listOut = (await aws(env, ['secretsmanager', 'list-secrets', '--region', region, '--output', 'json'])).stdout;
  const list = JSON.parse(listOut).SecretList || [];
  log(`secretsmanager ${region}: ${list.length} secret(s)`);

  const findings = [];
  for (const s of list) {
    const arn = s.ARN;
    if (!arn || seenArns.has(arn)) continue;
    seenArns.add(arn);
    try {
      const finding = await evaluateSecret({ env, region, runId, accountId, arn, summary: s });
      findings.push(finding);
    } catch (err) {
      const name = s.Name || arn;
      findings.push({
        schema_version: '1.0.0',
        source: SOURCE,
        source_version: SOURCE_VERSION,
        run_id: runId,
        collected_at: new Date().toISOString(),
        resource: {
          type: 'aws_secretsmanager_secret',
          id: arn,
          arn,
          region,
          account_id: accountId,
          tags: tagsToObject(s.Tags)
        },
        raw_attributes: { Name: name, ARN: arn },
        evaluations: [
          { control_framework: 'SCF', control_id: 'CRY-09',   status: 'inconclusive', severity: 'medium', message: `describe-secret failed: ${err.message}` },
          { control_framework: 'SCF', control_id: 'CRY-09',   status: 'inconclusive', severity: 'medium', message: `describe-secret failed: ${err.message}` },
          { control_framework: 'SCF', control_id: 'IAC-21',   status: 'inconclusive', severity: 'medium', message: `describe-secret failed: ${err.message}` },
          { control_framework: 'SCF', control_id: 'IAC-15.3', status: 'inconclusive', severity: 'medium', message: `describe-secret failed: ${err.message}` }
        ]
      });
    }
  }
  return findings;
}

async function evaluateSecret({ env, region, runId, accountId, arn, summary }) {
  const descOut = (await aws(env, ['secretsmanager', 'describe-secret', '--secret-id', arn, '--region', region, '--output', 'json'])).stdout;
  const desc = JSON.parse(descOut);
  const name = desc.Name || summary.Name || arn;

  let policy = null;
  let policyInconclusive = null;
  try {
    const polOut = (await aws(env, ['secretsmanager', 'get-resource-policy', '--secret-id', arn, '--region', region, '--output', 'json'])).stdout;
    policy = JSON.parse(polOut).ResourcePolicy;
  } catch (err) {
    if (/ResourcePolicyNotFoundException/.test(err.message)) {
      policy = null;
    } else {
      policyInconclusive = err.message;
    }
  }

  const resource = {
    type: 'aws_secretsmanager_secret',
    id: arn,
    arn,
    region,
    account_id: accountId,
    tags: tagsToObject(desc.Tags)
  };

  const raw = {
    Name: name,
    ARN: arn,
    RotationEnabled: desc.RotationEnabled === true,
    RotationRules: desc.RotationRules || null,
    LastRotatedDate: desc.LastRotatedDate || null,
    LastChangedDate: desc.LastChangedDate || null,
    LastAccessedDate: desc.LastAccessedDate || null,
    KmsKeyId: desc.KmsKeyId || null,
    OwningService: desc.OwningService || null,
    PrimaryRegion: desc.PrimaryRegion || null,
    Description: desc.Description || null
  };

  const evaluations = [];

  if (desc.RotationEnabled === true) {
    evaluations.push({
      control_framework: 'SCF', control_id: 'CRY-09',
      status: 'pass', severity: 'info',
      message: `Rotation enabled${desc.RotationRules?.AutomaticallyAfterDays ? ` (${desc.RotationRules.AutomaticallyAfterDays} day(s))` : ''}.`
    });
  } else {
    evaluations.push({
      control_framework: 'SCF', control_id: 'CRY-09',
      status: 'fail', severity: 'high',
      message: 'Automatic rotation is not enabled.',
      remediation: {
        summary: 'Enable automatic rotation with a rotation Lambda; this is a key-management lifecycle control.',
        ref: 'grc-engineer://generate-implementation/secret_rotation/aws',
        effort_hours: 1,
        automation: 'semi_automated'
      }
    });
  }

  const kmsId = desc.KmsKeyId || null;
  if (kmsId && !/^alias\/aws\/secretsmanager$/i.test(kmsId)) {
    evaluations.push({
      control_framework: 'SCF', control_id: 'CRY-09',
      status: 'pass', severity: 'info',
      message: `Encrypted with customer-managed KMS key (${kmsId}).`
    });
  } else {
    evaluations.push({
      control_framework: 'SCF', control_id: 'CRY-09',
      status: 'fail', severity: 'high',
      message: kmsId
        ? `Encrypted with AWS-managed key (${kmsId}); no customer-managed key with assigned owner.`
        : 'No KMS key associated; AWS uses the default account key for encryption.',
      remediation: {
        summary: 'Create or assign a customer-managed KMS key to this secret so the key has an assigned owner and rotation policy.',
        ref: 'grc-engineer://generate-implementation/kms_cmk/aws',
        effort_hours: 0.5,
        automation: 'auto_fixable'
      }
    });
  }

  if (policyInconclusive) {
    evaluations.push({
      control_framework: 'SCF', control_id: 'IAC-21',
      status: 'inconclusive', severity: 'medium',
      message: `Could not read resource policy: ${policyInconclusive}`
    });
  } else if (policy == null) {
    evaluations.push({
      control_framework: 'SCF', control_id: 'IAC-21',
      status: 'pass', severity: 'info',
      message: 'No resource policy attached; access is governed by IAM only.'
    });
  } else {
    const publicAccess = detectPublicAccess(policy);
    if (publicAccess) {
      evaluations.push({
        control_framework: 'SCF', control_id: 'IAC-21',
        status: 'fail', severity: 'critical',
        message: `Resource policy grants public access: ${publicAccess.reason}.`,
        remediation: {
          summary: 'Remove public principals from the resource policy; restrict to specific AWS account IDs or IAM roles.',
          ref: 'grc-engineer://generate-implementation/iam_least_privilege/aws',
          effort_hours: 0.5,
          automation: 'auto_fixable'
        }
      });
    } else {
      evaluations.push({
        control_framework: 'SCF', control_id: 'IAC-21',
        status: 'pass', severity: 'info',
        message: 'Resource policy does not grant public access.'
      });
    }
  }

  const lastAccessed = parseIsoDate(desc.LastAccessedDate);
  const lastRotated = parseIsoDate(desc.LastRotatedDate);
  const now = Date.now();
  const inactiveDays = lastAccessed ? Math.floor((now - lastAccessed.getTime()) / 86400000) : null;
  const rotationAgeDays = lastRotated ? Math.floor((now - lastRotated.getTime()) / 86400000) : null;

  if (lastAccessed && inactiveDays > 180) {
    evaluations.push({
      control_framework: 'SCF', control_id: 'IAC-15.3',
      status: 'fail', severity: 'medium',
      message: `Secret has not been accessed in ${inactiveDays} day(s); review whether it is still needed.`,
      remediation: {
        summary: 'Disable or delete the secret if no consumer remains; otherwise document why it is retained.',
        ref: 'grc-engineer://generate-implementation/inactive_credential_review/aws',
        effort_hours: 0.25,
        automation: 'manual'
      }
    });
  } else if (lastAccessed) {
    evaluations.push({
      control_framework: 'SCF', control_id: 'IAC-15.3',
      status: 'pass', severity: 'info',
      message: `Last accessed ${inactiveDays} day(s) ago.`
    });
  } else {
    evaluations.push({
      control_framework: 'SCF', control_id: 'IAC-15.3',
      status: 'inconclusive', severity: 'low',
      message: 'LastAccessedDate unavailable (either never accessed or tracking disabled); rely on LastRotatedDate and consumer inventory for review.'
    });
  }

  raw.InactiveDays = inactiveDays;
  raw.RotationAgeDays = rotationAgeDays;

  return {
    schema_version: '1.0.0',
    source: SOURCE,
    source_version: SOURCE_VERSION,
    run_id: runId,
    collected_at: new Date().toISOString(),
    resource,
    raw_attributes: raw,
    evaluations
  };
}

function detectPublicAccess(policyString) {
  if (policyString == null) return null;
  let policy;
  try { policy = JSON.parse(policyString); }
  catch { return null; }
  if (!policy || typeof policy !== 'object') return null;
  const stmts = Array.isArray(policy.Statement) ? policy.Statement : (policy.Statement ? [policy.Statement] : []);
  for (const s of stmts) {
    if (!s || s.Effect !== 'Allow') continue;
    const principals = normalizePrincipals(s.Principal);
    if (!principals.includes('*')) continue;
    if (actionAllowsRead(s.Action)) {
      return { reason: `Allow statement with Principal="*" permits ${s.Action}` };
    }
  }
  return null;
}

function normalizePrincipals(p) {
  if (p == null) return [];
  if (typeof p === 'string') return [p];
  if (Array.isArray(p)) return p;
  if (typeof p === 'object') {
    const out = [];
    for (const v of Object.values(p)) {
      if (typeof v === 'string') out.push(v);
      else if (Array.isArray(v)) out.push(...v);
    }
    return out;
  }
  return [];
}

function actionAllowsRead(action) {
  const list = Array.isArray(action) ? action : [action];
  for (const a of list) {
    if (typeof a !== 'string') continue;
    const normalized = a.toLowerCase();
    if (normalized === '*') return true;
    if (/^secretsmanager:\*$/.test(normalized)) return true;
    if (/^secretsmanager:getsecretvalue$/.test(normalized)) return true;
    if (/^secretsmanager:describesecret$/.test(normalized)) return true;
  }
  return false;
}

function parseIsoDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function tagsToObject(tags) {
  if (!Array.isArray(tags)) return {};
  const out = {};
  for (const t of tags) {
    if (t && typeof t === 'object' && typeof t.Key === 'string') {
      out[t.Key] = t.Value == null ? '' : String(t.Value);
    }
  }
  return out;
}

async function retrieveSecret(args, log) {
  const startedAt = Date.now();
  let config;
  try { config = parseYaml(await fs.readFile(CONFIG_FILE, 'utf8')); }
  catch { fail(EXIT.NOT_CONFIGURED, `config missing (${CONFIG_FILE}). Run /aws-secrets-inspector:setup first.`); }

  const profile = args.profile || config.profile || process.env.AWS_PROFILE || '';
  const env = { ...process.env };
  if (profile) env.AWS_PROFILE = profile;

  if (args.regions.length > 1) {
    fail(EXIT.USAGE, `--retrieve does not accept --regions with multiple entries; pass a single --region=<id> instead (got: ${args.regions.join(',')}).`);
  }
  let region;
  let regionSource;
  if (args.region) {
    region = args.region; regionSource = '--region';
  } else if (args.regions[0]) {
    region = args.regions[0]; regionSource = '--regions[0]';
  } else if (config.defaults?.regions?.[0]) {
    region = config.defaults.regions[0]; regionSource = 'config.defaults.regions[0]';
  } else if (config.default_region) {
    region = config.default_region; regionSource = 'config.default_region';
  } else if (process.env.AWS_DEFAULT_REGION) {
    region = process.env.AWS_DEFAULT_REGION; regionSource = 'AWS_DEFAULT_REGION';
  } else if (process.env.AWS_REGION) {
    region = process.env.AWS_REGION; regionSource = 'AWS_REGION';
  } else {
    region = 'us-east-1'; regionSource = 'default';
  }
  if (regionSource !== '--region') {
    log(`retrieve: region=${region} inferred from ${regionSource}; pass --region=<id> to make this explicit.`);
  }

  const awsArgs = ['secretsmanager', 'get-secret-value', '--secret-id', args.retrieve, '--region', region, '--output', 'json'];
  if (args.versionStage) awsArgs.push('--version-stage', args.versionStage);
  else if (args.versionId) awsArgs.push('--version-id', args.versionId);

  log(`retrieve: name=${args.retrieve} stage=${args.versionStage || '<AWSCURRENT>'} id=${args.versionId || '<latest>'} region=${region} profile=${profile || '<default>'}`);

  let raw;
  try {
    const out = (await aws(env, awsArgs)).stdout;
    raw = JSON.parse(out);
  } catch (err) {
    if (err.code === 'AUTH_FAILED') fail(EXIT.AUTH, `AWS auth failed: ${err.message}`);
    if (/ResourceNotFoundException/.test(err.message)) fail(EXIT.NOT_FOUND, `secret '${args.retrieve}' not found in this account/region.`);
    if (err.code === 'RATE_LIMITED') fail(EXIT.RATE_LIMITED, err.message);
    fail(EXIT.USAGE, `get-secret-value failed: ${err.message}`);
  }

  const output = {
    name: raw.Name,
    arn: raw.ARN,
    version_id: raw.VersionId,
    version_stages: raw.VersionStages || [],
    created_at: raw.CreatedDate || null
  };
  if (raw.SecretString !== undefined) {
    output.secret_string = raw.SecretString;
  } else if (raw.SecretBinary !== undefined) {
    output.secret_binary = raw.SecretBinary;
  } else {
    fail(EXIT.USAGE, 'AWS returned a secret with neither SecretString nor SecretBinary — unexpected response shape.');
  }

  const outputJson = JSON.stringify(output);
  const payload = outputJson + '\n';
  const byteSize = Buffer.byteLength(payload, 'utf8');
  const sha256 = crypto.createHash('sha256').update(payload).digest('hex');

  let target = null;
  if (args.writeTo) {
    try {
      target = await resolveWritePathInside(SECRETS_DIR, args.writeTo);
    } catch (err) {
      if (!(err instanceof WritePathRejected)) throw err;
      fail(EXIT.USAGE, err.message);
    }
    await fs.mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
    await fs.chmod(path.dirname(target), 0o700);
    const prevUmask = process.umask(0o077);
    try {
      await fs.writeFile(target, payload);
    } finally {
      process.umask(prevUmask);
    }
    await fs.chmod(target, 0o600);
    process.stdout.write(`${SOURCE}:retrieve wrote ${byteSize} bytes to ${target} (sha256=${sha256})\n`);
  } else {
    process.stdout.write(payload);
  }

  await fs.mkdir(path.dirname(RUNS_LOG), { recursive: true, mode: 0o700 });
  await fs.chmod(path.dirname(RUNS_LOG), 0o700);
  const manifest = {
    source: SOURCE,
    run_id: makeRunId(),
    started_at: new Date(startedAt).toISOString(),
    duration_ms: Date.now() - startedAt,
    mode: 'retrieve',
    secret_name: raw.Name,
    version_id: raw.VersionId,
    version_stage: args.versionStage || (args.versionId ? null : 'AWSCURRENT'),
    region,
    destination: target || 'stdout',
    byte_size: byteSize,
    sha256,
    exit_code: EXIT.OK
  };
  await fs.appendFile(RUNS_LOG, JSON.stringify(manifest) + '\n', { flag: 'a', mode: 0o600 });
  await fs.chmod(RUNS_LOG, 0o600);

  process.exit(EXIT.OK);
}

async function aws(env, args) {
  try {
    return await execFileP('aws', args, { env, maxBuffer: 64 * 1024 * 1024 });
  } catch (err) {
    const stderr = String(err.stderr || '').trim();
    if (/Unable to locate credentials|InvalidClientTokenId|ExpiredToken|AccessDenied.*sts|SignatureDoesNotMatch/i.test(stderr)) {
      const e = new Error(`AWS auth failed: ${stderr.split('\n')[0]}`);
      e.code = 'AUTH_FAILED';
      throw e;
    }
    if (/Throttling|RequestLimitExceeded|TooManyRequests/i.test(stderr)) {
      const e = new Error(`AWS rate limited: ${stderr.split('\n')[0]}`);
      e.code = 'RATE_LIMITED';
      throw e;
    }
    throw new Error(stderr.split('\n')[0] || err.message);
  }
}

function parseArgs(argv) {
  const out = {
    regions: [],
    region: '',
    profile: '',
    output: 'summary',
    quiet: false,
    refresh: false,
    retrieve: '',
    versionStage: '',
    versionId: '',
    writeTo: ''
  };
  for (const tok of argv) {
    if (!tok.startsWith('--')) continue;
    const [k, v] = tok.slice(2).split('=');
    switch (k) {
      case 'regions':       out.regions = String(v || '').split(',').map(s => s.trim()).filter(Boolean); break;
      case 'region':        out.region = v || ''; break;
      case 'profile':       out.profile = v || ''; break;
      case 'output':        out.output = v || 'summary'; break;
      case 'refresh':       out.refresh = true; break;
      case 'quiet':         out.quiet = true; break;
      case 'retrieve':      out.retrieve = v || ''; break;
      case 'version-stage': out.versionStage = v || ''; break;
      case 'version-id':    out.versionId = v || ''; break;
      case 'write-to':      out.writeTo = v || ''; break;
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

const invokedFromCLI = import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
if (invokedFromCLI) {
  main(process.argv.slice(2)).catch(err => {
    process.stderr.write(`[${SOURCE}] unexpected error: ${err.stack || err.message}\n`);
    process.exit(1);
  });
}
