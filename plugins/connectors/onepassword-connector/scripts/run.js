#!/usr/bin/env node
// Never capture or forward provider or child output: either may contain secrets.
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
if (args[0] !== '--' || !args[1] || args[1].startsWith('-')) {
  console.error('Usage: node run.js -- <trusted-command> [args...]');
  process.exit(2);
}
if (!Object.values(process.env).some(value => value.startsWith('op://'))) {
  console.error('Set at least one environment variable to an op:// reference.');
  process.exit(2);
}
const result = spawnSync('op', ['run', '--', ...args.slice(1)], {
  shell: false,
  stdio: 'ignore',
  env: process.env,
});
if (result.error || result.signal || result.status !== 0) {
  console.error('1Password run failed; provider and command output suppressed.');
  process.exit(1);
}
