#!/usr/bin/env node
// Operator-only: never expose provider or child output to the agent.
import { spawnSync } from 'node:child_process';
import { TextDecoder } from 'node:util';

const [version, mount, path, field, separator, command, ...args] = process.argv.slice(2);
const safePath = value => typeof value === 'string' && value.length <= 512 &&
  /^[A-Za-z0-9_][A-Za-z0-9_./-]*$/.test(value) &&
  value.split('/').every(part => part && part !== '.' && part !== '..');
if (!['1', '2'].includes(version) || !safePath(mount) || !safePath(path) || !/^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$/.test(field || '') ||
    separator !== '--' || !command || command.startsWith('-')) {
  console.error('Usage: node run.js <kv-version: 1|2> <mount> <path> <field> -- <trusted-command> [args...]');
  process.exit(2);
}
const result = spawnSync('vault', ['kv', 'get', '-format=json', `-mount=${mount}`, path], {
  shell: false, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1024 * 1024,
  timeout: 15000, killSignal: 'SIGKILL',
});
if (result.error || result.signal || result.status !== 0) {
  console.error('Vault access failed; provider output suppressed.');
  process.exit(1);
}
let value;
try {
  const response = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(result.stdout));
  const isObject = x => x !== null && typeof x === 'object' && !Array.isArray(x);
  if (!isObject(response) || !isObject(response.data)) throw new Error();
  const data = version === '2' ? response.data.data : response.data;
  if (version === '2' && (!isObject(response.data.metadata) || !isObject(data))) throw new Error();
  if (!Object.hasOwn(data, field) || typeof data[field] !== 'string') throw new Error();
  value = data[field];
  // JSON can encode unpaired UTF-16 surrogates, which Node would silently
  // replace with U+FFFD when passing the value through the environment.
  if (!value || value.includes('\0') || Buffer.from(value, 'utf8').toString('utf8') !== value) throw new Error();
} catch {
  console.error('Vault returned an unsupported payload; provider output suppressed.');
  process.exit(1);
} finally {
  result.stdout.fill(0);
}
const env = { ...process.env, VAULT_KV_VALUE: value };
delete env.VAULT_TOKEN;
const child = spawnSync(command, args, { shell: false, stdio: 'ignore', env });
if (child.error || child.signal || child.status !== 0) {
  console.error('Trusted command failed; command output suppressed.');
  process.exit(1);
}
