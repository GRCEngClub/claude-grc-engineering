#!/usr/bin/env node
// Read one global secret's metadata only; never access a payload.
import { spawnSync } from 'node:child_process';

const [project, secret, ...extra] = process.argv.slice(2);
if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(project || '') ||
    !/^[A-Za-z0-9_-]{1,255}$/.test(secret || '') || secret.startsWith('-') || extra.length) {
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
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,9})?Z$/.test(value) || !Number.isFinite(Date.parse(value))) throw new Error();
  return value;
}
function optionalTime(source, dest, key) {
  if (source[key] !== undefined) dest[key] = timestamp(source[key]);
}
try {
  const data = query(['secrets', 'describe', secret]);
  const versions = query(['secrets', 'versions', 'list', secret]);
  if (!data || typeof data !== 'object' || Array.isArray(data) || typeof data.name !== 'string' || !Array.isArray(versions)) throw new Error();
  const parts = data.name.split('/');
  if (parts.length !== 4 || parts[0] !== 'projects' || !/^(?:[a-z][a-z0-9-]{4,28}[a-z0-9]|[0-9]+)$/.test(parts[1]) || parts[2] !== 'secrets' || parts[3] !== secret || (!/^\d+$/.test(parts[1]) && parts[1] !== project)) throw new Error();
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
} catch {
  console.error('Secret metadata collection failed or returned malformed data; provider output suppressed.');
  process.exit(1);
}
