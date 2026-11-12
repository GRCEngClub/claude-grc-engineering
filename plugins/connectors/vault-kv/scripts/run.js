#!/usr/bin/env node
// Operator-only: never expose provider or child output to the agent.
import { spawnSync } from 'node:child_process';
import { TextDecoder } from 'node:util';

const [mount, path, field, separator, command, ...args] = process.argv.slice(2);
const safePath = value => typeof value === 'string' && value.length <= 512 &&
  /^[A-Za-z0-9_][A-Za-z0-9_./-]*$/.test(value) &&
  value.split('/').every(part => part && part !== '.' && part !== '..');
if (!safePath(mount) || !safePath(path) || !/^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$/.test(field || '') ||
    separator !== '--' || !command || command.startsWith('-')) {
  console.error('Usage: node run.js <mount> <path> <field> -- <trusted-command> [args...]');
  process.exit(2);
}
const result = spawnSync('vault', ['kv', 'get', `-mount=${mount}`, `-field=${field}`, path], {
  shell: false, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1024 * 1024,
  timeout: 15000, killSignal: 'SIGKILL',
});
if (result.error || result.signal || result.status !== 0) {
  console.error('Vault access failed; provider output suppressed.');
  process.exit(1);
}
let value;
try {
  value = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(result.stdout);
  if (!value || value.includes('\0')) throw new Error();
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
