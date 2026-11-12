#!/usr/bin/env node
// Operator-only helper: provider and child output may contain secrets.
import { spawnSync } from 'node:child_process';
import { TextDecoder } from 'node:util';

const args = process.argv.slice(2);
const [project, secret, version, variable, separator, command, ...commandArgs] = args;
const projectPattern = /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/;
if (!projectPattern.test(project || '') || !/^[A-Za-z0-9_-]{1,255}$/.test(secret || '') ||
    !/^(?:latest|[1-9][0-9]*)$/.test(version || '') || variable !== 'GCP_SECRET_VALUE' ||
    separator !== '--' || !command || command.startsWith('-')) {
  console.error('Usage: node run.js <project-id> <secret-id> <latest|version> GCP_SECRET_VALUE -- <trusted-command> [args...]');
  process.exit(2);
}
// Ask gcloud for the encoded payload, never allowing provider diagnostics through.
const result = spawnSync('gcloud', ['secrets', 'versions', 'access', version, `--secret=${secret}`, `--project=${project}`, '--format=get(payload.data)', '--quiet'], {
  encoding: 'utf8', shell: false, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1024 * 1024, timeout: 15000, killSignal: 'SIGKILL',
});
if (result.error || result.signal || result.status !== 0) {
  console.error('Secret access failed; provider output suppressed.');
  process.exit(1);
}
let value;
try {
  const encoded = result.stdout.trim();
  if (!/^(?:[A-Za-z0-9_-]{2,}|[A-Za-z0-9+/]{2,})={0,2}$/.test(encoded)) throw new Error();
  const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Buffer.from(normalized, 'base64');
  const canonical = bytes.toString('base64');
  if (normalized.includes('=') ? normalized !== canonical : normalized !== canonical.replace(/=+$/, '')) throw new Error();
  // A leading BOM is part of the secret, not a text encoding signature.
  value = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  bytes.fill(0);
  if (value.includes('\0')) throw new Error();
} catch {
  console.error('Secret access returned an unsupported payload; provider output suppressed.');
  process.exit(1);
}
const child = spawnSync(command, commandArgs, { shell: false, stdio: 'ignore', env: { ...process.env, [variable]: value } });
if (child.error || child.signal || child.status !== 0) {
  console.error('Trusted command failed; command output suppressed.');
  process.exit(1);
}
