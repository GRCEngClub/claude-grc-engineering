#!/usr/bin/env node
// Sets one version on every plugin in this repository, the scaffold templates
// and the marketplace. Plugins move together because installed users keep a
// cached copy until the version string changes, and plugins call each other.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const next = process.argv[2];
if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(next || '')) {
  console.error('Usage: node tools/bump-version.mjs <major.minor.patch>');
  process.exit(next === '--help' || next === '-h' ? 0 : 2);
}

const setVersion = (file) => {
  const text = readFileSync(file, 'utf8');
  if (!/"version":\s*"[^"]*"/.test(text)) throw new Error(`no version field in ${file}`);
  const updated = text.replace(/("version":\s*)"[^"]*"/, `$1"${next}"`);
  writeFileSync(file, updated);
};

const marketplaceFile = join(root, '.claude-plugin/marketplace.json');
const marketplace = JSON.parse(readFileSync(marketplaceFile, 'utf8'));
let count = 0;
for (const entry of marketplace.plugins) {
  if (typeof entry.source !== 'string') continue;
  setVersion(join(root, entry.source, '.claude-plugin/plugin.json'));
  count += 1;
}
const templates = join(root, 'tools/framework-plugin-template');
for (const depth of readdirSync(templates)) setVersion(join(templates, depth, 'plugin.json.tmpl'));
setVersion(marketplaceFile);
console.log(`Set version ${next} on ${count} plugins, the scaffold templates and the marketplace.`);
