#!/usr/bin/env node

/**
 * azure-inspector:collect
 *
 * Runs Azure CLI read-only queries and emits findings conforming to
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
const CONFIG_FILE = path.join(CONFIG_DIR, 'connectors', 'azure-inspector.yaml');
const CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'findings', 'azure-inspector');
const RUNS_LOG = path.join(os.homedir(), '.cache', 'claude-grc', 'runs.log');
const SOURCE = 'azure-inspector';
const SOURCE_VERSION = '0.1.0';

const EXIT = { OK: 0, USAGE: 2, AUTH: 2, RATE_LIMITED: 3, PARTIAL: 4, NOT_CONFIGURED: 5 };

async function main(argv) {
  const args = parseArgs(argv);
  const log = args.quiet ? () => {} : (m) => process.stderr.write(`[${SOURCE}] ${m}\n`);

  let config;
  try { config = parseYaml(await fs.readFile(CONFIG_FILE, 'utf8')); }
  catch { fail(EXIT.NOT_CONFIGURED, `config missing (${CONFIG_FILE}). Run /azure-inspector:setup first.`); }

  const subscriptionId = args.subscription || config.subscription_id || process.env.AZURE_SUBSCRIPTION_ID;
  const tenantId = args.tenant || config.tenant_id;
  const services = args.services?.length ? args.services : (config.defaults?.services || ['entra', 'storage', 'keyvault', 'monitor', 'defender']);
  if (!subscriptionId) fail(EXIT.NOT_CONFIGURED, 'subscription_id missing. Re-run /azure-inspector:setup.');

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const runId = makeRunId();
  const startedAt = Date.now();
  log(`subscription=${subscriptionId} services=${services.join(',')}`);

  const findings = [];
  const errors = [];
  const ctx = { subscriptionId, tenantId, runId };

  for (const svc of services) {
    try {
      const handler = serviceHandlers[svc];
      if (!handler) throw new Error(`unknown service '${svc}'`);
      findings.push(...await handler(ctx, log));
    } catch (err) {
      errors.push({ service: svc, error: err.message });
      log(`${svc} failed: ${err.message}`);
    }
  }

  const cachePath = path.join(CACHE_DIR, `${runId}.json`);
  await fs.writeFile(cachePath, JSON.stringify(findings, null, 2));

  const counters = { pass: 0, fail: 0, inconclusive: 0, not_applicable: 0, skipped: 0 };
  const sev = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  const failSev = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const d of findings) for (const e of d.evaluations) {
    counters[e.status] = (counters[e.status] || 0) + 1;
    if (e.severity) sev[e.severity] = (sev[e.severity] || 0) + 1;
    if (e.status === 'fail' && e.severity) failSev[e.severity] = (failSev[e.severity] || 0) + 1;
  }

  const manifest = {
    source: SOURCE,
    run_id: runId,
    started_at: new Date(startedAt).toISOString(),
    duration_ms: Date.now() - startedAt,
    subscription_id: subscriptionId,
    tenant_id: tenantId || null,
    services,
    resources: findings.length,
    evaluations: findings.reduce((n, d) => n + d.evaluations.length, 0),
    counters,
    severities: sev,
    failing_severities: failSev,
    errors: errors.length
  };
  await fs.appendFile(RUNS_LOG, JSON.stringify(manifest) + '\n');

  const summary = `${SOURCE}: ${findings.length} resources, ${manifest.evaluations} evaluations, ${counters.fail || 0} failing (${failSev.critical || 0} critical, ${failSev.high || 0} high, ${failSev.medium || 0} medium).`;
  if (args.output === 'json') process.stdout.write(JSON.stringify({ run_id: runId, cache_path: cachePath, summary: manifest, errors }, null, 2) + '\n');
  else if (args.output !== 'silent') {
    process.stdout.write(summary + '\n');
    if (errors.length) process.stdout.write(`(${errors.length} partial errors - see JSON output for details)\n`);
  }

  process.exit(errors.length ? EXIT.PARTIAL : EXIT.OK);
}

const serviceHandlers = {
  async entra(ctx) {
    const resource = {
      type: 'azure_entra_tenant',
      id: ctx.tenantId || ctx.subscriptionId,
      uri: ctx.tenantId ? `https://login.microsoftonline.com/${ctx.tenantId}` : null,
      region: null,
      account_id: ctx.subscriptionId
    };
    const evaluations = [];

    try {
      const defaults = await azJson(['ad', 'user', 'list', '--filter', "userType eq 'Member' and accountEnabled eq true", '--query', '[0:25].{id:id,userPrincipalName:userPrincipalName}', '--output', 'json']);
      evaluations.push(defaults.length > 0
        ? { control_framework: 'SCF', control_id: 'IAC-01.1', status: 'inconclusive', severity: 'medium', message: 'Azure CLI cannot determine per-user MFA or Conditional Access posture from this read-only query. Verify Entra ID authentication methods and Conditional Access policies in Microsoft Graph or the portal.' }
        : { control_framework: 'SCF', control_id: 'IAC-01.1', status: 'inconclusive', severity: 'medium', message: 'No Entra user data returned.' });
    } catch (err) {
      evaluations.push({ control_framework: 'SCF', control_id: 'IAC-01.1', status: 'inconclusive', severity: 'medium', message: `Could not query Entra users: ${err.message}` });
    }

    try {
      const policies = await azJson(['rest', '--method', 'GET', '--url', 'https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies']);
      const enabled = (policies.value || []).filter(p => String(p.state).toLowerCase() === 'enabled');
      evaluations.push(enabled.length
        ? { control_framework: 'SCF', control_id: 'IAC-04', status: 'pass', severity: 'info', message: `${enabled.length} enabled Conditional Access polic${enabled.length === 1 ? 'y' : 'ies'} found.` }
        : {
            control_framework: 'SCF', control_id: 'IAC-04', status: 'fail', severity: 'high',
            message: 'No enabled Conditional Access policies were found.',
            remediation: { summary: 'Create baseline Conditional Access policies for MFA, risky sign-ins, admin roles, and legacy authentication blocking.', ref: 'grc-engineer://generate-implementation/conditional_access/azure', effort_hours: 3, automation: 'semi_automated' }
          });
    } catch (err) {
      evaluations.push({ control_framework: 'SCF', control_id: 'IAC-04', status: 'inconclusive', severity: 'medium', message: `Could not query Conditional Access policies through Microsoft Graph: ${err.message}` });
    }

    return [buildDoc(ctx, resource, evaluations)];
  },

  async storage(ctx, log) {
    const accounts = await azJson(['storage', 'account', 'list', '--subscription', ctx.subscriptionId, '--output', 'json']);
    log(`storage: ${accounts.length} accounts`);
    if (!accounts.length) {
      return [buildDoc(ctx, { type: 'azure_storage_subscription', id: ctx.subscriptionId, account_id: ctx.subscriptionId }, [
        { control_framework: 'SCF', control_id: 'CRY-05', status: 'not_applicable', severity: 'info', message: 'No storage accounts found in subscription.' }
      ])];
    }
    return accounts.map(a => {
      const evaluations = [];
      const encrypted = a.encryption?.services?.blob?.enabled !== false && a.encryption?.services?.file?.enabled !== false;
      evaluations.push(encrypted
        ? { control_framework: 'SCF', control_id: 'CRY-05', status: 'pass', severity: 'info' }
        : {
            control_framework: 'SCF', control_id: 'CRY-05', status: 'fail', severity: 'high',
            message: 'Blob or file service encryption is disabled for this storage account.',
            remediation: { summary: 'Enable Azure Storage service encryption for blob and file services.', ref: 'grc-engineer://generate-implementation/storage_encryption/azure', effort_hours: 0.5, automation: 'auto_fixable' }
          });

      evaluations.push(a.allowBlobPublicAccess === false
        ? { control_framework: 'SCF', control_id: 'DCH-01.2', status: 'pass', severity: 'info' }
        : {
            control_framework: 'SCF', control_id: 'DCH-01.2', status: 'fail', severity: 'critical',
            message: 'Blob public access is allowed at the storage account level.',
            remediation: { summary: 'Set allowBlobPublicAccess=false and review container ACLs.', ref: 'grc-engineer://generate-implementation/storage_public_access/azure', effort_hours: 0.25, automation: 'auto_fixable' }
          });

      evaluations.push(a.minimumTlsVersion && a.minimumTlsVersion !== 'TLS1_0' && a.minimumTlsVersion !== 'TLS1_1'
        ? { control_framework: 'SCF', control_id: 'CRY-06', status: 'pass', severity: 'info' }
        : {
            control_framework: 'SCF', control_id: 'CRY-06', status: 'fail', severity: 'medium',
            message: `Minimum TLS version is ${a.minimumTlsVersion || 'unset'}.`,
            remediation: { summary: 'Set the storage account minimum TLS version to TLS1_2 or later.', ref: 'grc-engineer://generate-implementation/storage_tls/azure', effort_hours: 0.25, automation: 'auto_fixable' }
          });

      return buildDoc(ctx, {
        type: 'azure_storage_account',
        id: a.name,
        uri: a.id,
        region: a.location || null,
        account_id: ctx.subscriptionId,
        tags: stringifyTags(a.tags)
      }, evaluations, { kind: a.kind, sku: a.sku?.name });
    });
  },

  async keyvault(ctx, log) {
    const vaults = await azJson(['keyvault', 'list', '--subscription', ctx.subscriptionId, '--output', 'json']);
    log(`keyvault: ${vaults.length} vaults`);
    if (!vaults.length) {
      return [buildDoc(ctx, { type: 'azure_keyvault_subscription', id: ctx.subscriptionId, account_id: ctx.subscriptionId }, [
        { control_framework: 'SCF', control_id: 'CRY-04', status: 'not_applicable', severity: 'info', message: 'No Key Vaults found in subscription.' }
      ])];
    }
    return vaults.map(v => {
      const evaluations = [];
      const softDelete = v.properties?.enableSoftDelete !== false;
      evaluations.push(softDelete
        ? { control_framework: 'SCF', control_id: 'BCD-11', status: 'pass', severity: 'info' }
        : {
            control_framework: 'SCF', control_id: 'BCD-11', status: 'fail', severity: 'high',
            message: 'Key Vault soft delete is disabled.',
            remediation: { summary: 'Enable soft delete and purge protection for production Key Vaults.', ref: 'grc-engineer://generate-implementation/keyvault_recovery/azure', effort_hours: 0.5, automation: 'auto_fixable' }
          });
      evaluations.push(v.properties?.enablePurgeProtection
        ? { control_framework: 'SCF', control_id: 'BCD-11', status: 'pass', severity: 'info', message: 'Purge protection is enabled.' }
        : {
            control_framework: 'SCF', control_id: 'BCD-11', status: 'fail', severity: 'medium',
            message: 'Key Vault purge protection is disabled.',
            remediation: { summary: 'Enable purge protection where regulatory retention or ransomware recovery requirements apply.', ref: 'grc-engineer://generate-implementation/keyvault_purge_protection/azure', effort_hours: 0.5, automation: 'semi_automated' }
          });
      evaluations.push(v.properties?.enableRbacAuthorization
        ? { control_framework: 'SCF', control_id: 'IAC-07.2', status: 'pass', severity: 'info' }
        : {
            control_framework: 'SCF', control_id: 'IAC-07.2', status: 'fail', severity: 'medium',
            message: 'Key Vault uses access policies instead of Azure RBAC authorization.',
            remediation: { summary: 'Migrate Key Vault authorization to Azure RBAC and remove broad access policies.', ref: 'grc-engineer://generate-implementation/keyvault_rbac/azure', effort_hours: 2, automation: 'semi_automated' }
          });
      return buildDoc(ctx, {
        type: 'azure_key_vault',
        id: v.name,
        uri: v.id,
        region: v.location || null,
        account_id: ctx.subscriptionId,
        tags: stringifyTags(v.tags)
      }, evaluations);
    });
  },

  async monitor(ctx) {
    const settings = await azJson(['monitor', 'diagnostic-settings', 'subscription', 'list', '--subscription', ctx.subscriptionId, '--output', 'json']);
    const values = settings.value || settings || [];
    const resource = { type: 'azure_subscription_monitor', id: ctx.subscriptionId, uri: `/subscriptions/${ctx.subscriptionId}`, region: null, account_id: ctx.subscriptionId };
    const evaluations = [values.length
      ? { control_framework: 'SCF', control_id: 'MON-02', status: 'pass', severity: 'info', message: `${values.length} subscription diagnostic setting(s) found.` }
      : {
          control_framework: 'SCF', control_id: 'MON-02', status: 'fail', severity: 'high',
          message: 'No subscription diagnostic settings were found for activity log export.',
          remediation: { summary: 'Create subscription diagnostic settings to export Activity Logs to Log Analytics, Event Hub, or Storage.', ref: 'grc-engineer://generate-implementation/activity_log_export/azure', effort_hours: 1, automation: 'auto_fixable' }
        }];
    return [buildDoc(ctx, resource, evaluations)];
  },

  async defender(ctx) {
    const plans = await azJson(['security', 'pricing', 'list', '--subscription', ctx.subscriptionId, '--output', 'json']);
    const values = plans.value || plans || [];
    const enabled = values.filter(p => String(p.pricingTier).toLowerCase() === 'standard');
    const resource = { type: 'azure_defender_for_cloud', id: ctx.subscriptionId, uri: `/subscriptions/${ctx.subscriptionId}/providers/Microsoft.Security/pricings`, region: null, account_id: ctx.subscriptionId };
    const evaluations = [enabled.length
      ? { control_framework: 'SCF', control_id: 'MON-01.2', status: 'pass', severity: 'info', message: `${enabled.length} Defender for Cloud plan(s) are Standard.` }
      : {
          control_framework: 'SCF', control_id: 'MON-01.2', status: 'fail', severity: 'high',
          message: 'No Defender for Cloud plans are set to Standard.',
          remediation: { summary: 'Enable Microsoft Defender for Cloud Standard plans for regulated workload resource types.', ref: 'grc-engineer://generate-implementation/defender_for_cloud/azure', effort_hours: 1, automation: 'semi_automated' }
        }];
    return [buildDoc(ctx, resource, evaluations)];
  }
};

function buildDoc(ctx, resource, evaluations, rawAttributes = undefined) {
  const doc = {
    schema_version: '1.0.0',
    source: SOURCE,
    source_version: SOURCE_VERSION,
    run_id: ctx.runId,
    collected_at: new Date().toISOString(),
    resource,
    evaluations
  };
  if (rawAttributes) doc.raw_attributes = rawAttributes;
  return doc;
}

async function azJson(args) {
  const outArgs = args.includes('--output') || args.includes('-o') ? args : [...args, '--output', 'json'];
  const { stdout } = await az([...outArgs, '--only-show-errors']);
  return JSON.parse(stdout || '[]');
}

async function az(args) {
  try {
    return await execFileP('az', args, { timeout: 60000, maxBuffer: 20 * 1024 * 1024 });
  } catch (err) {
    const msg = (err.stderr || err.stdout || err.message || '').trim();
    if (/Please run 'az login'|az login|AADSTS|expired|not logged in/i.test(msg)) fail(EXIT.AUTH, msg || 'Azure authentication is invalid.');
    if (/Too many requests|throttl|rate/i.test(msg)) fail(EXIT.RATE_LIMITED, msg);
    throw new Error(msg || err.message);
  }
}

function parseArgs(argv) {
  const args = { services: [], output: 'summary', quiet: false };
  for (const a of argv) {
    if (a === '--quiet') args.quiet = true;
    else if (a.startsWith('--services=')) args.services = csv(a);
    else if (a.startsWith('--subscription=')) args.subscription = a.slice('--subscription='.length);
    else if (a.startsWith('--tenant=')) args.tenant = a.slice('--tenant='.length);
    else if (a.startsWith('--output=')) args.output = a.slice('--output='.length);
    else fail(EXIT.USAGE, `unknown argument: ${a}`);
  }
  if (!['summary', 'silent', 'json'].includes(args.output)) fail(EXIT.USAGE, '--output must be summary, silent, or json');
  return args;
}

function csv(arg) {
  return arg.split('=')[1].split(',').map(s => s.trim()).filter(Boolean);
}

function parseYaml(src) {
  const out = {};
  let section = null;
  for (const line of src.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const m = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (m) {
      section = null;
      const [, k, raw] = m;
      out[k] = parseScalar(raw);
      if (raw === '') section = k;
      continue;
    }
    const sm = line.match(/^\s+([a-zA-Z0-9_]+):\s*(.*)$/);
    if (sm && section) {
      out[section] ||= {};
      out[section][sm[1]] = parseScalar(sm[2]);
    }
  }
  return out;
}

function parseScalar(raw) {
  const s = String(raw).trim();
  if (s.startsWith('[')) return s.slice(1, -1).split(',').map(x => x.trim().replace(/^"|"$/g, '')).filter(Boolean);
  return s.replace(/^"|"$/g, '');
}

function stringifyTags(tags) {
  if (!tags || typeof tags !== 'object') return undefined;
  return Object.fromEntries(Object.entries(tags).map(([k, v]) => [k, String(v)]));
}

function makeRunId() {
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return `${ts}-${crypto.randomBytes(4).toString('hex')}`;
}

function fail(code, msg) {
  process.stderr.write(`[${SOURCE}] ${msg}\n`);
  process.exit(code);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch(err => fail(EXIT.PARTIAL, err.stack || err.message));
}
