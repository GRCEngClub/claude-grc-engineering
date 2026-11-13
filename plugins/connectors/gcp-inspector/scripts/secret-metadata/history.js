#!/usr/bin/env node
// Read one global secret's metadata only; never access a payload.
import { spawnSync } from 'node:child_process';
import { projectScope } from './project-scope.js';

const [project, secret, ...extra] = process.argv.slice(2);
if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(project || '') ||
    !/^[A-Za-z0-9_-]{1,255}$/.test(secret || '') || extra.length) {
  console.error('Usage: node history.js <project-id> <secret-id>');
  process.exit(2);
}
function query(args) {
  const result = spawnSync('gcloud', [...args, `--project=${project}`, '--format=json', '--quiet'], {
    encoding: 'utf8', shell: false, stdio: ['ignore', 'pipe', 'ignore'],
    maxBuffer: 16 * 1024 * 1024, timeout: 15000, killSignal: 'SIGKILL',
  });
  if (result.error || result.signal || result.status !== 0) throw new Error();
  return JSON.parse(result.stdout);
}
function timestamp(value) {
  const match = typeof value === 'string' && /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(?:\.\d{1,9})?Z$/.exec(value);
  if (!match) throw new Error();
  const [, y, m, d, h, min, s] = match;
  const year = Number(y), month = Number(m), day = Number(d);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year === 0 || month < 1 || month > 12 || day < 1 || day > days[month - 1] ||
      Number(h) > 23 || Number(min) > 59 || Number(s) > 59) throw new Error();
  return value;
}
function optionalTime(source, dest, key) {
  if (source[key] !== undefined) dest[key] = timestamp(source[key]);
}
try {
  // A resource name cannot be mistaken for a flag even when the ID starts with '-'.
  const resource = `projects/${project}/secrets/${secret}`;
  const data = query(['secrets', 'describe', resource]);
  const versions = query(['secrets', 'versions', 'list', resource]);
  if (!data || typeof data !== 'object' || Array.isArray(data) || typeof data.name !== 'string' || !Array.isArray(versions)) throw new Error();
  const parts = data.name.split('/');
  if (parts.length !== 4 || parts[0] !== 'projects' || !/^(?:[a-z][a-z0-9-]{4,28}[a-z0-9]|[0-9]+)$/.test(parts[1]) || parts[2] !== 'secrets' || parts[3] !== secret) throw new Error();
  projectScope(project)(parts[1]);
  const result = { project, name: data.name, rotation: null, versions: [] };
  optionalTime(data, result, 'createTime');
  optionalTime(data, result, 'expireTime');
  if (data.rotation !== undefined) {
    if (!data.rotation || typeof data.rotation !== 'object' || Array.isArray(data.rotation)) throw new Error();
    result.rotation = {};
    optionalTime(data.rotation, result.rotation, 'nextRotationTime');
    if (data.rotation.rotationPeriod !== undefined) {
      if (typeof data.rotation.rotationPeriod !== 'string' || !/^\d+(?:\.\d{1,9})?s$/.test(data.rotation.rotationPeriod)) throw new Error();
      result.rotation.rotationPeriod = data.rotation.rotationPeriod;
    }
  }
  const seen = new Set();
  result.versions = versions.map(version => {
    if (!version || typeof version !== 'object' || typeof version.name !== 'string' || !version.name.startsWith(`${data.name}/versions/`) || !/^[1-9][0-9]*$/.test(version.name.slice(`${data.name}/versions/`.length)) || seen.has(version.name) || !['ENABLED', 'DISABLED', 'DESTROYED'].includes(version.state)) throw new Error();
    seen.add(version.name);
    const item = { name: version.name, state: version.state };
    optionalTime(version, item, 'createTime');
    optionalTime(version, item, 'destroyTime');
    return item;
  });
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error.message === 'mapping'
    ? 'Project mapping failed; check project lookup permission. Provider output suppressed.'
    : 'Secret metadata collection failed or returned malformed or out-of-scope data; provider output suppressed.');
  process.exit(1);
}
