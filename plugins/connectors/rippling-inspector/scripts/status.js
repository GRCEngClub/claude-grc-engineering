#!/usr/bin/env node
// Reports whether the connector is configured, whether the token still works,
// and when it last produced findings. Makes one GET /companies/ request.

import fs from 'node:fs/promises';
import path from 'node:path';
import {
  SOURCE, CONFIG_FILE, CACHE_DIR, DEFAULT_TOKEN_ENV,
  ApiError, createClient, fetchCompany, isValidEnvName, readConfig, resolveBaseUrl,
} from './api.js';

const line = (label, value) => process.stdout.write(`  ${`${label}:`.padEnd(15)}${value}\n`);

async function lastRun() {
  let names;
  try { names = (await fs.readdir(CACHE_DIR)).filter(n => n.endsWith('.json')); } catch { return null; }
  let latest = null;
  for (const name of names) {
    const stat = await fs.stat(path.join(CACHE_DIR, name));
    if (!latest || stat.mtimeMs > latest.mtimeMs) latest = { name, mtimeMs: stat.mtimeMs };
  }
  if (!latest) return null;
  let resources = '?';
  let evaluations = '?';
  try {
    const docs = JSON.parse(await fs.readFile(path.join(CACHE_DIR, latest.name), 'utf8'));
    resources = docs.length;
    evaluations = docs.reduce((n, d) => n + (d.evaluations || []).length, 0);
  } catch { /* unreadable cache file: report what is known */ }
  return { runId: latest.name.replace(/\.json$/, ''), ageHours: Math.floor((Date.now() - latest.mtimeMs) / 3_600_000), resources, evaluations };
}

async function main(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write('Usage: node status.js\n\nShows configuration, token validity and last-run freshness for rippling-inspector.\n');
    return 0;
  }
  process.stdout.write(`${SOURCE}\n`);
  const config = await readConfig();
  if (!config) {
    line('status', 'not-configured');
    line('fix', 'run /rippling-inspector:setup');
    return 2;
  }
  const tokenEnv = isValidEnvName(config.token_env) ? config.token_env : DEFAULT_TOKEN_ENV;
  const token = process.env[tokenEnv];
  if (!token) {
    line('status', 'token-missing');
    line('fix', `export ${tokenEnv}=<token> in your own terminal`);
    return 2;
  }
  try {
    await fetchCompany(createClient({ token, baseUrl: resolveBaseUrl() }));
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
    if (err.code === 'AUTH') { line('status', 'token-invalid'); line('detail', err.message); return 2; }
    if (err.code !== 'FORBIDDEN') { line('status', err.code === 'NETWORK' ? 'network-error' : 'api-error'); line('detail', err.message); return 2; }
  }
  line('company id', config.company_id || 'unknown');
  line('token source', `$${tokenEnv} (valid)`);
  line('config', CONFIG_FILE);
  const run = await lastRun();
  if (!run) { line('status', 'ready (no runs yet)'); line('last run', 'never'); return 0; }
  const age = run.ageHours < 24 ? `${run.ageHours}h ago` : `${Math.floor(run.ageHours / 24)}d ago`;
  line('status', run.ageHours >= 168 ? 'stale' : 'ready');
  line('last run', `${age} (${run.runId})`);
  line('cached', `${run.resources} resources, ${run.evaluations} evaluations`);
  return 0;
}

main(process.argv.slice(2)).then(code => { process.exitCode = code; }).catch(err => {
  process.stderr.write(`[${SOURCE}:status] unexpected error: ${err.message}\n`);
  process.exitCode = 1;
});
