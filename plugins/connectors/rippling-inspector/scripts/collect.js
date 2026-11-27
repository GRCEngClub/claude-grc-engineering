#!/usr/bin/env node
// rippling-inspector: read-only offboarding, device and activity-log checks
// against the Rippling REST API. Emits Findings (schemas/finding.schema.json).
//
// Personal data: findings carry Rippling's opaque IDs, dates and states only.
// Names, emails, phone numbers, addresses, pay and termination reasons are
// never written, even when the API returns them.

import { realpathSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import {
  SOURCE, SOURCE_VERSION, CACHE_DIR, RUNS_LOG, CONFIG_FILE, DEFAULT_TOKEN_ENV,
  ApiError, createClient, fetchCompany, isValidEnvName, query, readConfig, resolveBaseUrl,
} from './api.js';

const EXIT = { OK: 0, ERROR: 1, USAGE: 2, AUTH: 2, RATE_LIMITED: 3, PARTIAL: 4, NOT_CONFIGURED: 5 };
const SERVICES = ['access', 'devices', 'apps', 'activity'];
const DAY_MS = 86_400_000;
const DEFAULT_RETIRED_STATES = ['DECOMMISSIONED', 'FULL_WIPED', 'E_CYCLED', 'SOLD', 'LOCKED', 'MDM_LOCKED'];

const USAGE = `Usage: node collect.js [options]

Read-only checks against the Rippling REST API. Run /rippling-inspector:setup first.

Options:
  --services=<csv>              Subset of ${SERVICES.join(',')} (default: all)
  --offboarding-window-days=<n> Report passing offboardings and look up app accounts
                                for workers terminated within n days (default: 365)
  --max-app-lookups=<n>         Most recent terminated workers to look up app accounts for (default: 200)
  --max-pages=<n>               Pages of 100 to read per list before stopping (default: 2000)
  --stale-device-days=<n>       Flag active devices with no check-in for n days (default: 30)
  --retired-states=<csv>        Device lifecycle states that count as returned
                                (default: ${DEFAULT_RETIRED_STATES.join(',')})
  --top-level-workers=<n>       Active workers allowed to have no manager (default: 1)
  --activity-days=<n>           Days of activity log to sample, at most 90 (default: 30)
  --output=<fmt>                summary (default) | json | silent
  --quiet                       No progress on stderr
  --help                        Show this text

Exit codes: 0 ok, 2 usage or token rejected, 3 rate limited, 4 partial, 5 not configured.
`;

// ---------- evaluation helpers ----------

const scf = (controlId, status, severity, message, remediation) => {
  const evaluation = { control_framework: 'SCF', control_id: controlId, status, severity };
  if (message) evaluation.message = message;
  if (remediation) evaluation.remediation = remediation;
  return evaluation;
};
const manual = (summary, hours) => ({ summary, effort_hours: hours, automation: 'manual' });
const daysBetween = (later, earlier) => Math.floor((later - earlier) / DAY_MS);
const parseTime = value => (typeof value === 'string' ? Date.parse(value) : NaN);

function latestEnd(records) {
  const ends = records.map(r => parseTime(r.end_date)).filter(Number.isFinite);
  return ends.length ? Math.max(...ends) : null;
}

/**
 * Offboarding: a user account that is still active although every one of the
 * person's worker records is terminated. Grouping by user_id matters because
 * a rehire has several worker records for one user.
 */
export function evaluateOffboarding(workers, { now, windowDays, redacted = new Set(), truncated = false }) {
  const posture = { type: 'rippling_offboarding_posture', id: 'offboarding' };
  if (truncated) {
    // "Every worker record is terminated" cannot be decided from a partial
    // list: a rehire's active record may be on a page that was not fetched.
    return [{ resource: posture, evaluations: [scf('IAC-07.2', 'inconclusive', 'medium',
      `The worker list was cut off at ${workers.length} records, so offboarding was not evaluated. Raise --max-pages and run again.`)] }];
  }
  if (redacted.has('status') || redacted.has('user_id') || redacted.has('user')) {
    return [{ resource: posture, evaluations: [scf('IAC-07.2', 'inconclusive', 'medium',
      'The token owner cannot read worker status or the linked user account, so offboarding could not be checked.')] }];
  }
  const byUser = new Map();
  for (const worker of workers) {
    if (typeof worker.user_id !== 'string' || !worker.user_id) continue;
    if (!byUser.has(worker.user_id)) byUser.set(worker.user_id, []);
    byUser.get(worker.user_id).push(worker);
  }
  const docs = [];
  let terminated = 0;
  let failing = 0;
  let unreadable = 0;
  for (const [userId, records] of byUser) {
    if (!records.every(r => r.status === 'TERMINATED')) continue;
    terminated += 1;
    const end = latestEnd(records);
    const days = end === null ? null : daysBetween(now, end);
    const user = records.map(r => r.user).find(u => u && typeof u === 'object');
    const resource = { type: 'rippling_user', id: userId };
    const when = days === null ? 'on an unknown date' : `${days} day(s) ago`;
    if (!user || typeof user.active !== 'boolean') { unreadable += 1; continue; }
    if (user.active) {
      failing += 1;
      docs.push({ resource, evaluations: [scf('IAC-07.2', 'fail', days !== null && days >= 30 ? 'critical' : 'high',
        `User account is still active although all ${records.length} worker record(s) are terminated; employment ended ${when}.`,
        manual('Deactivate the user in Rippling and confirm its app access was removed.', 0.25))] });
    } else if (days === null || days <= windowDays) {
      docs.push({ resource, evaluations: [scf('IAC-07.2', 'pass', 'info', `User account is inactive; employment ended ${when}.`)] });
    }
  }
  if (terminated > 0 && unreadable === terminated) {
    return [{ resource: posture, evaluations: [scf('IAC-07.2', 'inconclusive', 'medium',
      `Found ${terminated} terminated user(s) but could not read any linked user account. Add the users.read scope to the token.`)] }];
  }
  if (unreadable > 0) {
    docs.push({ resource: posture, evaluations: [scf('IAC-07.2', 'inconclusive', 'low',
      `${unreadable} of ${terminated} terminated user(s) had no readable user account and were not checked.`)] });
  } else if (failing === 0) {
    docs.push({ resource: posture, evaluations: [scf('IAC-07.2', 'pass', 'info',
      `${terminated} terminated user(s) visible to this token; none has an active user account.`)] });
  }
  return docs;
}

/**
 * Reporting lines: manager-based access reviews need a manager on every
 * active worker. A few people at the top of the organisation have none.
 */
export function evaluateManagers(workers, { topLevelWorkers, redacted = new Set(), truncated = false }) {
  const resource = { type: 'rippling_reporting_structure', id: 'managers' };
  if (truncated) {
    return [{ resource, evaluations: [scf('IAC-17', 'inconclusive', 'low',
      `The worker list was cut off at ${workers.length} records, so reporting lines were not evaluated. Raise --max-pages and run again.`)] }];
  }
  if (redacted.has('manager_id') || redacted.has('manager') || redacted.has('status')) {
    return [{ resource, evaluations: [scf('IAC-17', 'inconclusive', 'low',
      'The token owner cannot read worker managers, so reporting lines could not be checked.')] }];
  }
  const active = workers.filter(w => w.status === 'ACTIVE');
  const missing = active.filter(w => !w.manager_id);
  if (missing.length <= topLevelWorkers) {
    return [{ resource, evaluations: [scf('IAC-17', 'pass', 'info',
      `${active.length} active worker(s); ${missing.length} without a manager, within the allowance of ${topLevelWorkers}.`)] }];
  }
  return [{
    resource,
    evaluations: [scf('IAC-17', 'fail', 'low',
      `${missing.length} of ${active.length} active workers have no manager (allowance ${topLevelWorkers}). Manager-based access reviews have no reviewer for them.`,
      manual('Assign a manager to each active worker in Rippling, or raise --top-level-workers if these are genuine top-level roles.', 1))],
    raw_attributes: { worker_ids_without_manager: missing.slice(0, 50).map(w => w.id), listed: Math.min(missing.length, 50), total: missing.length },
  }];
}

/** Devices: disk encryption, MDM management, recent check-in, and return on termination. */
export function evaluateDevices(devices, { now, staleDays, retiredStates = DEFAULT_RETIRED_STATES, redacted = new Set() }) {
  const retired = new Set(retiredStates);
  const docs = [];
  for (const device of devices) {
    if (typeof device.id !== 'string') continue;
    const evaluations = [];
    const platform = device.platform || 'unknown platform';
    if (device.lifecycle_state === 'ACTIVE') {
      if (device.is_encrypted === true) evaluations.push(scf('CRY-05', 'pass', 'info'));
      else if (device.is_encrypted === false) {
        evaluations.push(scf('CRY-05', 'fail', 'high', `Disk encryption is off on this ${platform} device.`,
          manual('Turn on FileVault or BitLocker through a Rippling device policy.', 0.5)));
      } else if (['IOS', 'IPADOS'].includes(device.platform)) {
        evaluations.push(scf('CRY-05', 'not_applicable', 'info', 'Rippling reports disk encryption for macOS and Windows only.'));
      } else evaluations.push(scf('CRY-05', 'inconclusive', 'low', 'Rippling returned no encryption state for this device.'));

      if (device.is_managed === true && device.enrollment_status === 'ENROLLED') evaluations.push(scf('END-01', 'pass', 'info'));
      else if (device.is_managed === false || (device.enrollment_status && device.enrollment_status !== 'ENROLLED')) {
        evaluations.push(scf('END-01', 'fail', 'medium',
          `Device is not under management (is_managed=${device.is_managed}, enrollment_status=${device.enrollment_status || 'unknown'}).`,
          manual('Enrol the device in MDM or retire it.', 0.5)));
      } else evaluations.push(scf('END-01', 'inconclusive', 'low', 'Rippling returned no management state for this device.'));

      const seen = parseTime(device.last_checkin_at);
      if (!Number.isFinite(seen)) evaluations.push(scf('AST-02', 'inconclusive', 'low', 'Rippling returned no last check-in time for this device.'));
      else if (daysBetween(now, seen) > staleDays) {
        evaluations.push(scf('AST-02', 'fail', 'low',
          `Active device has not checked in for ${daysBetween(now, seen)} days (threshold ${staleDays}).`,
          manual('Locate the device, or update its lifecycle state if it is lost or retired.', 0.5)));
      } else evaluations.push(scf('AST-02', 'pass', 'info'));
    }
    const state = typeof device.lifecycle_state === 'string' && device.lifecycle_state ? device.lifecycle_state : null;
    if (!state) {
      // Without the lifecycle state it is unknown whether the device is in use.
      evaluations.push(scf('END-01', 'inconclusive', 'low', 'Rippling returned no lifecycle state for this device, so it was not evaluated.'));
    }
    const holder = device.worker && typeof device.worker === 'object' ? device.worker : null;
    if (device.worker_id && (!holder || typeof holder.status !== 'string' || redacted.has('worker'))) {
      evaluations.push(scf('AST-10', 'inconclusive', 'low',
        'The device is assigned to a worker whose status this token cannot read, so return on termination was not checked. The token needs workers.read.'));
    } else if (device.worker_id && holder.status === 'TERMINATED') {
      const end = parseTime(holder.end_date);
      const when = Number.isFinite(end) ? `${daysBetween(now, end)} day(s) ago` : 'on an unknown date';
      if (!state) {
        evaluations.push(scf('AST-10', 'inconclusive', 'low', `The device is assigned to a worker terminated ${when}, but its lifecycle state is not readable.`));
      } else if (retired.has(state)) evaluations.push(scf('AST-10', 'pass', 'info'));
      else {
        evaluations.push(scf('AST-10', 'fail', 'medium',
          `Device is still assigned to a worker terminated ${when} and its lifecycle state is ${device.lifecycle_state || 'unknown'}.`,
          manual('Recover, lock or wipe the device and update its assignment in Rippling.', 1)));
      }
    }
    if (!evaluations.length) continue;
    const tags = {};
    if (device.platform) tags.platform = String(device.platform);
    if (device.lifecycle_state) tags.lifecycle_state = String(device.lifecycle_state);
    docs.push({
      resource: { type: 'rippling_device', id: device.id, tags },
      evaluations,
      raw_attributes: {
        serial_number: device.serial_number ?? null, os_version: device.os_version ?? null,
        enrollment_status: device.enrollment_status ?? null, mdm_provider: device.mdm_provider ?? null,
        worker_id: device.worker_id ?? null,
      },
    });
  }
  return docs;
}

const REMOVED = new Set(['DELETE_CONFIRMED', 'SUSPEND_CONFIRMED']);
const REMOVAL_FAILED = new Set(['DELETE_FAILED', 'SUSPEND_FAILED']);
const REMOVAL_PENDING = new Set(['DELETE_PENDING', 'SUSPEND_PENDING']);
const PROVISIONED = new Set(['CREATE_CONFIRMED', 'INVITE_CONFIRMED']);

/** Third-party app accounts that Rippling still shows for a terminated worker. */
export function evaluateAppUsers(appUsers, { daysSinceEnd }) {
  const docs = [];
  for (const account of appUsers) {
    if (typeof account.id !== 'string') continue;
    // app_display_name is free text set by the customer and can hold an email
    // address, so only the catalog handle is written to findings.
    const handle = typeof account.app_handle === 'string' ? account.app_handle.toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 60) : '';
    const app = handle || 'a connected app';
    const state = account.push_state || 'unknown';
    const when = daysSinceEnd === null ? 'on an unknown date' : `${daysSinceEnd} day(s) ago`;
    const fix = manual(`Remove or suspend the ${app} account, then confirm in the app itself.`, 0.25);
    let evaluation;
    if (REMOVED.has(state)) evaluation = scf('IAC-07.2', 'pass', 'info');
    else if (REMOVAL_FAILED.has(state)) {
      evaluation = scf('IAC-07.2', 'fail', 'high', `Rippling failed to remove the ${app} account (${state}) of a worker terminated ${when}.`, fix);
    } else if (PROVISIONED.has(state)) {
      evaluation = scf('IAC-07.2', 'fail', 'high', `The ${app} account of a worker terminated ${when} is still provisioned (${state}).`, fix);
    } else if (REMOVAL_PENDING.has(state)) {
      evaluation = scf('IAC-07.2', 'fail', 'medium', `Removal of the ${app} account is still pending (${state}) for a worker terminated ${when}.`, fix);
    } else {
      evaluation = scf('IAC-07.2', 'inconclusive', 'low', `The ${app} account of a terminated worker is in state ${state}, which does not show whether access remains.`);
    }
    const tags = {};
    if (handle) tags.app_handle = handle;
    docs.push({
      resource: { type: 'rippling_app_user', id: account.id, tags },
      evaluations: [evaluation],
      raw_attributes: { worker_id: account.worker_id ?? null, push_state: state, match_state: account.match_state ?? null },
    });
  }
  return docs;
}

/** Terminated workers inside the window, most recent first, one entry per worker. */
export function recentTerminations(workers, { now, windowDays, limit }) {
  return workers
    .filter(w => w.status === 'TERMINATED' && typeof w.id === 'string')
    .map(w => ({ id: w.id, end: parseTime(w.end_date) }))
    .filter(w => Number.isFinite(w.end) && daysBetween(now, w.end) >= 0 && daysBetween(now, w.end) <= windowDays)
    .sort((a, b) => b.end - a.end)
    .slice(0, limit);
}

/** Activity log: is it readable, and what the sample shows. Retention is Rippling's, not the customer's. */
export function evaluateActivity(events, { days, truncated }) {
  const failures = events.filter(e => e.status === 'FAILURE').length;
  const proxy = events.filter(e => e.actor_type === 'PROXY').length;
  const sample = truncated ? `the most recent ${events.length} events` : `${events.length} event(s)`;
  return [{
    resource: { type: 'rippling_activity_log', id: 'activity-log' },
    evaluations: [
      scf('MON-01', events.length ? 'pass' : 'inconclusive', events.length ? 'info' : 'low',
        events.length
          ? `Activity log is readable: ${sample} in the last ${days} days, ${failures} failed, ${proxy} by Rippling staff acting in the tenant (actor_type PROXY).`
          : `Activity log returned no events for the last ${days} days. The token owner may see only some app installations.`),
      scf('MON-10', 'inconclusive', 'low',
        'Rippling keeps activity-log events for 90 days. Confirm that events are exported to a log store that meets your retention requirement.'),
    ],
    raw_attributes: { events_sampled: events.length, failures, proxy_actor_events: proxy, sample_truncated: truncated, window_days: days },
  }];
}

// ---------- collection ----------

function inconclusiveService(service, err) {
  const map = {
    access: ['rippling_offboarding_posture', 'offboarding', 'IAC-07.2', 'workers.read and users.read'],
    devices: ['rippling_device_fleet', 'devices', 'END-01', 'devices.read and workers.read'],
    apps: ['rippling_app_access', 'app-users', 'IAC-07.2', 'app-users.read'],
    activity: ['rippling_activity_log', 'activity-log', 'MON-01', 'activity-log.read, owned by a full admin or Activity Log admin'],
  };
  const [type, id, controlId, scopes] = map[service];
  return { resource: { type, id }, evaluations: [scf(controlId, 'inconclusive', 'low', `Could not read this data: ${err.message} The token needs ${scopes}.`)] };
}

export async function collect({ client, options, now, log = () => {} }) {
  const docs = [];
  const errors = [];
  const notes = [];
  const want = new Set(options.services);
  let workers = null;

  async function run(service, fn) {
    if (!want.has(service)) return;
    try { await fn(); } catch (err) {
      if (!(err instanceof ApiError) || err.code === 'AUTH' || err.code === 'BAD_LINK') throw err;
      if (err.code === 'FORBIDDEN' || (err.code === 'HTTP' && err.status === 400)) {
        docs.push(inconclusiveService(service, err));
        notes.push(`${service}: not readable with this token`);
        return;
      }
      errors.push({ service, code: err.code, error: err.message });
      log(`${service} failed: ${err.message}`);
    }
  }

  async function loadWorkers() {
    if (workers) return workers;
    const page = await client.list(query('/workers/', { limit: 100, expand: 'user' }), { maxPages: options.maxPages });
    if (page.truncated) notes.push(`workers: stopped at ${options.maxPages} pages; worker-based checks are inconclusive`);
    workers = page;
    log(`workers: ${page.results.length}`);
    return page;
  }

  await run('access', async () => {
    const { results, redacted, truncated } = await loadWorkers();
    docs.push(...evaluateOffboarding(results, { now, windowDays: options.offboardingWindowDays, redacted, truncated }));
    docs.push(...evaluateManagers(results, { topLevelWorkers: options.topLevelWorkers, redacted, truncated }));
  });

  await run('devices', async () => {
    const page = await client.list(query('/devices/', { limit: 100, expand: 'worker' }), { maxPages: options.maxPages });
    log(`devices: ${page.results.length}`);
    const found = evaluateDevices(page.results, { now, staleDays: options.staleDeviceDays, retiredStates: options.retiredStates, redacted: page.redacted });
    if (page.truncated) {
      notes.push(`devices: stopped at ${options.maxPages} pages; the fleet is only partly covered`);
      docs.push({ resource: { type: 'rippling_device_fleet', id: 'devices' }, evaluations: [scf('END-01', 'inconclusive', 'low',
        `The device list was cut off at ${page.results.length} records. Devices beyond that were not evaluated. Raise --max-pages and run again.`)] });
    }
    if (found.length) docs.push(...found);
    else {
      docs.push({ resource: { type: 'rippling_device_fleet', id: 'devices' }, evaluations: [scf('END-01', 'inconclusive', 'low',
        'Rippling returned no active or assigned devices. The company may not use Rippling device management, or the token owner cannot see devices.')] });
    }
  });

  await run('apps', async () => {
    const { results, redacted, truncated } = await loadWorkers();
    const posture = { type: 'rippling_app_access', id: 'app-users' };
    if (redacted.has('status') || redacted.has('end_date')) {
      // Without status and end date, recently terminated workers cannot be
      // picked out, and an empty selection would read as a clean result.
      docs.push({ resource: posture, evaluations: [scf('IAC-07.2', 'inconclusive', 'medium',
        'The token owner cannot read worker status or end date, so terminated workers could not be selected and no app accounts were checked.')] });
      return;
    }
    const terminated = results.filter(w => w.status === 'TERMINATED');
    const undated = terminated.filter(w => !Number.isFinite(parseTime(w.end_date))).length;
    const recent = recentTerminations(results, { now, windowDays: options.offboardingWindowDays, limit: options.maxAppLookups });
    const inWindow = recentTerminations(results, { now, windowDays: options.offboardingWindowDays, limit: Infinity }).length;
    const gaps = [];
    if (truncated) gaps.push(`the worker list was cut off at ${results.length} records`);
    if (undated) gaps.push(`${undated} terminated worker(s) have no readable end date`);
    if (inWindow > recent.length) gaps.push(`${inWindow - recent.length} of ${inWindow} recently terminated workers are beyond --max-app-lookups`);
    if (gaps.length) {
      notes.push(`apps: partial coverage (${gaps.join('; ')})`);
      docs.push({ resource: { type: 'rippling_app_access', id: 'app-users-coverage' }, evaluations: [scf('IAC-07.2', 'inconclusive', 'low',
        `App accounts were checked for ${recent.length} terminated worker(s) only: ${gaps.join('; ')}.`)] });
    }
    log(`apps: looking up app accounts for ${recent.length} terminated worker(s)`);
    let accounts = 0;
    for (const worker of recent) {
      const page = await client.list(query('/app-users/', { limit: 100, filter: `worker_id eq '${worker.id.replace(/'/g, '')}'` }), { maxPages: 10 });
      accounts += page.results.length;
      docs.push(...evaluateAppUsers(page.results, { daysSinceEnd: daysBetween(now, worker.end) }));
    }
    if (accounts === 0 && !gaps.length) {
      docs.push({ resource: posture, evaluations: [scf('IAC-07.2', 'pass', 'info',
        `No app accounts are recorded for the ${recent.length} worker(s) terminated in the last ${options.offboardingWindowDays} days.`)] });
    }
  });

  await run('activity', async () => {
    const since = new Date(now - options.activityDays * DAY_MS).toISOString().slice(0, 19);
    const page = await client.list(query('/activity-log/', { limit: 100, order_by: 'occurred_at desc', filter: `occurred_at ge ${since}` }), { maxPages: 10 });
    log(`activity: ${page.results.length} event(s)${page.truncated ? ' (sample)' : ''}`);
    docs.push(...evaluateActivity(page.results, { days: options.activityDays, truncated: page.truncated }));
  });

  return { docs, errors, notes };
}

// ---------- CLI ----------

function positiveInt(name, value, max = 100_000) {
  if (!/^\d+$/.test(value || '')) throw new ApiError('USAGE', `--${name} needs a whole number.`);
  const n = Number(value);
  if (n > max) throw new ApiError('USAGE', `--${name} must be at most ${max}.`);
  return n;
}

export function parseArgs(argv) {
  const options = {
    services: [...SERVICES], output: 'summary', quiet: false, help: false,
    offboardingWindowDays: 365, maxAppLookups: 200, staleDeviceDays: 30,
    retiredStates: [...DEFAULT_RETIRED_STATES], topLevelWorkers: 1, activityDays: 30, maxPages: 2000,
  };
  for (const token of argv) {
    if (token === '--help' || token === '-h') { options.help = true; continue; }
    if (!token.startsWith('--')) throw new ApiError('USAGE', `Unexpected argument: ${token}`);
    const eq = token.indexOf('=');
    const key = eq === -1 ? token.slice(2) : token.slice(2, eq);
    const value = eq === -1 ? '' : token.slice(eq + 1);
    switch (key) {
      case 'services': {
        const list = value.split(',').map(s => s.trim()).filter(Boolean);
        const unknown = list.filter(s => !SERVICES.includes(s));
        if (!list.length || unknown.length) throw new ApiError('USAGE', `--services takes a comma-separated subset of ${SERVICES.join(',')}.`);
        options.services = list;
        break;
      }
      case 'output':
        if (!['summary', 'json', 'silent'].includes(value)) throw new ApiError('USAGE', '--output must be summary, json or silent.');
        options.output = value;
        break;
      case 'offboarding-window-days': options.offboardingWindowDays = positiveInt(key, value); break;
      case 'max-app-lookups': options.maxAppLookups = positiveInt(key, value, 5000); break;
      case 'max-pages': options.maxPages = Math.max(1, positiveInt(key, value, 100_000)); break;
      case 'stale-device-days': options.staleDeviceDays = positiveInt(key, value); break;
      case 'top-level-workers': options.topLevelWorkers = positiveInt(key, value); break;
      case 'activity-days': options.activityDays = positiveInt(key, value, 90); break;
      case 'retired-states': {
        const list = value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
        if (!list.length || list.some(s => !/^[A-Z_]+$/.test(s))) throw new ApiError('USAGE', '--retired-states takes a comma-separated list of lifecycle states.');
        options.retiredStates = list;
        break;
      }
      case 'quiet': options.quiet = true; break;
      default: throw new ApiError('USAGE', `Unknown flag: --${key}`);
    }
  }
  return options;
}

function makeRunId(now) {
  const stamp = new Date(now).toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  return `${stamp}-${crypto.randomBytes(4).toString('hex')}`;
}

async function main(argv) {
  const options = parseArgs(argv);
  if (options.help) { process.stdout.write(USAGE); return EXIT.OK; }
  const log = options.quiet ? () => {} : message => process.stderr.write(`[${SOURCE}] ${message}\n`);

  const config = await readConfig();
  if (!config) {
    process.stderr.write(`[${SOURCE}] Not configured (${CONFIG_FILE} is missing). Run /rippling-inspector:setup first.\n`);
    return EXIT.NOT_CONFIGURED;
  }
  const tokenEnv = isValidEnvName(config.token_env) ? config.token_env : DEFAULT_TOKEN_ENV;
  const token = process.env[tokenEnv];
  if (!token) {
    process.stderr.write(`[${SOURCE}] Environment variable ${tokenEnv} is not set. Export the token in your shell and run again.\n`);
    return EXIT.AUTH;
  }

  const client = createClient({ token, baseUrl: resolveBaseUrl() });
  const now = Date.now();
  const runId = makeRunId(now);
  const collectedAt = new Date(now).toISOString();
  const company = await fetchCompany(client).catch(err => { if (err.code === 'FORBIDDEN') return null; throw err; });
  const accountId = company?.id || config.company_id || 'unknown';
  log(`company=${accountId} services=${options.services.join(',')}`);

  const { docs, errors, notes } = await collect({ client, options, now, log });
  const findings = docs.map(doc => ({
    schema_version: '1.0.0', source: SOURCE, source_version: SOURCE_VERSION, run_id: runId, collected_at: collectedAt,
    resource: { ...doc.resource, account_id: accountId },
    evaluations: doc.evaluations,
    ...(doc.raw_attributes ? { raw_attributes: doc.raw_attributes } : {}),
  }));

  await fs.mkdir(CACHE_DIR, { recursive: true, mode: 0o700 });
  const cachePath = path.join(CACHE_DIR, `${runId}.json`);
  await fs.writeFile(cachePath, JSON.stringify(findings, null, 2), { mode: 0o600 });

  const counters = { pass: 0, fail: 0, inconclusive: 0, not_applicable: 0, skipped: 0 };
  const severities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  let evaluations = 0;
  for (const doc of findings) for (const evaluation of doc.evaluations) {
    evaluations += 1;
    counters[evaluation.status] += 1;
    if (evaluation.status === 'fail') severities[evaluation.severity] += 1;
  }
  const manifest = {
    source: SOURCE, run_id: runId, started_at: collectedAt, duration_ms: Date.now() - now,
    company_id: accountId, services: options.services, resources: findings.length, evaluations,
    counters, severities, errors: errors.length,
  };
  await fs.appendFile(RUNS_LOG, `${JSON.stringify(manifest)}\n`);

  if (options.output === 'json') {
    process.stdout.write(`${JSON.stringify({ run_id: runId, cache_path: cachePath, summary: manifest, notes, errors }, null, 2)}\n`);
  } else if (options.output === 'summary') {
    process.stdout.write(`${SOURCE}: ${findings.length} resources, ${evaluations} evaluations, ${counters.fail} failing ` +
      `(${severities.critical} critical, ${severities.high} high, ${severities.medium} medium), ${counters.inconclusive} inconclusive.\n`);
    process.stdout.write('Coverage is limited to what the token owner can see in Rippling; a list can be short without any error.\n');
    for (const note of notes) process.stdout.write(`note: ${note}\n`);
    if (errors.length) process.stdout.write(`${errors.length} service(s) failed; results are partial.\n`);
    process.stdout.write(`findings: ${cachePath}\n`);
  }
  if (errors.some(e => e.code === 'RATE_LIMIT')) return EXIT.RATE_LIMITED;
  return errors.length ? EXIT.PARTIAL : EXIT.OK;
}

const invokedFromCLI = process.argv[1] !== undefined
  && import.meta.url === (() => { try { return pathToFileURL(realpathSync(process.argv[1])).href; } catch { return null; } })();
if (invokedFromCLI) {
  main(process.argv.slice(2)).then(code => { process.exitCode = code; }).catch(err => {
    if (err instanceof ApiError) {
      process.stderr.write(`[${SOURCE}] ${err.message}\n`);
      process.exitCode = err.code === 'USAGE' ? EXIT.USAGE : err.code === 'AUTH' ? EXIT.AUTH : err.code === 'RATE_LIMIT' ? EXIT.RATE_LIMITED : EXIT.ERROR;
    } else {
      process.stderr.write(`[${SOURCE}] unexpected error: ${err.stack || err.message}\n`);
      process.exitCode = EXIT.ERROR;
    }
  });
}
