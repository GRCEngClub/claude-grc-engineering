#!/usr/bin/env node
// Operator-only: field bytes flow through memory into a trusted child's stdin.
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
// Deliberately narrow subset: stable vault/item IDs and literal field/section labels.
const reference = /^op:\/\/[A-Za-z0-9]{26}\/[A-Za-z0-9]{26}\/(?:[A-Za-z0-9_][A-Za-z0-9_ .-]*\/)?[A-Za-z0-9_][A-Za-z0-9_ .-]*$/;
if (args.length < 3 || !reference.test(args[0]) || /[\r\n]/.test(args[0]) ||
    args[1] !== '--' || !args[2] || args[2].startsWith('-')) {
  console.error('Usage: node field.js <field-reference> -- <trusted-command> [args...]');
  process.exit(2);
}
const field = spawnSync('op', ['read', '--no-newline', args[0]], {
  shell: false, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1024 * 1024,
  timeout: 120_000, killSignal: 'SIGKILL',
});
if (field.error || field.signal || field.status !== 0) {
  console.error('1Password field retrieval failed; provider output suppressed.');
  process.exit(1);
}
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('OP_')));
const result = spawnSync(args[2], args.slice(3), {
  shell: false, input: field.stdout, stdio: ['pipe', 'ignore', 'ignore'], env,
  timeout: 300_000, killSignal: 'SIGKILL',
});
if (result.error || result.signal || result.status !== 0) {
  console.error('Trusted command failed; command output suppressed.');
  process.exit(1);
}
