#!/usr/bin/env node
// Never capture or forward provider or child output: either may contain secrets.
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
if (args[0] !== '--' || !args[1] || args[1].startsWith('-')) {
  console.error('Usage: node run.js -- <trusted-command> [args...]');
  process.exit(2);
}
// A provider-resolved value in a loader/runtime variable can execute code before
// the intended child starts. Permit references only in fixed data variables.
const allowed = new Set(['CONNECTOR_TOKEN', 'TOKEN', 'API_TOKEN', 'API_KEY', 'ACCESS_TOKEN', 'PASSWORD']);
let hasReference = false;
for (const [name, value] of Object.entries(process.env)) {
  if (!value.includes('op://')) continue;
  if (!allowed.has(name) || !value.startsWith('op://')) {
    console.error('References are allowed only as complete values in supported secret variables.');
    process.exit(2);
  }
  hasReference = true;
}
if (!hasReference) {
  console.error('Set a supported secret variable to an op:// reference.');
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
