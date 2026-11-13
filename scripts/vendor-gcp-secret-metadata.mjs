#!/usr/bin/env node
// The metadata plugin is the source of truth. Copy only the helpers needed by
// gcp-inspector; --check makes stale or missing copies a CI failure.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const source = new URL('../plugins/connectors/gcp-secret-metadata/scripts/', import.meta.url);
const target = new URL('../plugins/connectors/gcp-inspector/scripts/secret-metadata/', import.meta.url);
const files = ['list.js', 'history.js', 'project-scope.js'];
const check = process.argv.slice(2).join(' ') === '--check';
if (process.argv.length > 2 && !check) throw new Error('Usage: node scripts/vendor-gcp-secret-metadata.mjs [--check]');
if (!check) await mkdir(target, { recursive: true });
let stale = false;
for (const name of files) {
  const bytes = await readFile(new URL(name, source));
  const dest = new URL(name, target);
  if (!check) await writeFile(dest, bytes);
  else {
    const current = await readFile(dest).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
    if (!current || !bytes.equals(current)) { console.error(`Stale or missing vendored helper: ${fileURLToPath(dest)}`); stale = true; }
  }
}
if (stale) { console.error('Run node scripts/vendor-gcp-secret-metadata.mjs'); process.exitCode = 1; }
