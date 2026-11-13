#!/usr/bin/env node
// Operator-only: document bytes flow through memory into a trusted child's stdin.
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const id = /^[A-Za-z0-9]{26}$/;
if (args.length < 4 || !id.test(args[0]) || !id.test(args[1]) ||
    args[2] !== '--' || !args[3] || args[3].startsWith('-')) {
  console.error('Usage: node document.js <vault-id> <document-id> -- <trusted-command> [args...]');
  process.exit(2);
}
// Bound memory use, and never start the consumer if retrieval failed or overflowed.
const document = spawnSync('op', ['document', 'get', args[1], '--vault', args[0]], {
  shell: false, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 10 * 1024 * 1024,
});
if (document.error || document.signal || document.status !== 0) {
  console.error('1Password document retrieval failed; provider output suppressed.');
  process.exit(1);
}
// Provider authentication variables are not needed by the consumer.
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('OP_')));
const result = spawnSync(args[3], args.slice(4), {
  shell: false, input: document.stdout, stdio: ['pipe', 'ignore', 'ignore'], env,
});
if (result.error || result.signal || result.status !== 0) {
  console.error('Trusted command failed; command output suppressed.');
  process.exit(1);
}
