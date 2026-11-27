// Shared helpers for the fedramp-20x scripts. Node built-ins only.
//
// Two data sources:
//   - the bundled index (data/cr26-index.json): IDs, names, KSI statements,
//     applicability and timeframes for one pinned release of FedRAMP's rules;
//   - the full dataset, once `rules.js sync` has downloaded it to
//     ~/.cache/claude-grc/fedramp/. It adds every rule's statement and notes.

import { realpathSync } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RULES_URL = 'https://raw.githubusercontent.com/FedRAMP/rules/2026/fedramp-consolidated-rules.json';
export const CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'fedramp');
export const CACHE_FILE = path.join(CACHE_DIR, 'fedramp-consolidated-rules.json');
export const CACHE_META = path.join(CACHE_DIR, 'meta.json');
const INDEX_FILE = fileURLToPath(new URL('../data/cr26-index.json', import.meta.url));

export const CLASSES = ['a', 'b', 'c', 'd'];
export const DAY_MS = 86_400_000;

export class UsageError extends Error {}

export async function loadIndex() {
  return JSON.parse(await fs.readFile(INDEX_FILE, 'utf8'));
}

export async function loadCachedDataset() {
  try {
    const dataset = JSON.parse(await fs.readFile(CACHE_FILE, 'utf8'));
    return dataset?.info?.version && dataset.KSI && dataset.FRR ? dataset : null;
  } catch { return null; }
}

export async function loadCacheMeta() {
  try { return JSON.parse(await fs.readFile(CACHE_META, 'utf8')); } catch { return null; }
}

export function parseClass(value, { allow = CLASSES } = {}) {
  const klass = String(value || '').trim().toLowerCase().replace(/^class[\s-]*/, '');
  if (!allow.includes(klass)) throw new UsageError(`Certification class must be one of ${allow.map(c => c.toUpperCase()).join(', ')}.`);
  return klass;
}

// Splits argv into flags (--key=value or --key) and positional arguments.
export function parseArgs(argv, known) {
  const flags = {};
  const positional = [];
  for (const token of argv) {
    if (token === '-h') { flags.help = true; continue; }
    if (!token.startsWith('--')) { positional.push(token); continue; }
    const eq = token.indexOf('=');
    const key = eq === -1 ? token.slice(2) : token.slice(2, eq);
    if (!known.includes(key)) throw new UsageError(`Unknown flag: --${key}`);
    flags[key] = eq === -1 ? true : token.slice(eq + 1);
  }
  return { flags, positional };
}

export function allKsis(index) {
  return index.themes.flatMap(theme => theme.indicators.map(ksi => ({ ...ksi, theme: theme.id, theme_name: theme.name })));
}

export function allRules(index) {
  return index.rulesets.flatMap(set => set.rules.map(rule => ({ ...rule, ruleset: set.key, ruleset_name: set.name })));
}

// How a KSI applies to a 20x class: 'required', 'optional' or null (not applicable).
// FedRAMP has not published the Class D set, so D returns null.
export function ksiApplicability(ksi, klass) {
  if (klass === 'a') return ksi.class_a ? 'required' : null;
  if (klass === 'b') return ksi.class_b;
  if (klass === 'c') return ksi.class_c;
  return null;
}

// How a rule applies to a certification type and class. Class A obligations are
// the three lists in FRC-CLA-MFR, -RFR and -OFR plus the FRC-CLA subset itself.
export function ruleApplicability(rule, index, { type, klass }) {
  const wanted = type === 'rev5' ? 'Rev5' : '20x';
  if (rule.types.length && !rule.types.includes(wanted)) return null;
  if (klass === 'a') {
    // The Class A lists describe provider obligations. Rules for agencies,
    // assessors and FedRAMP follow the ordinary class check.
    if (!rule.affects.includes('Providers')) return rule.classes.includes('a') ? 'applies' : null;
    if (index.class_a.mandatory.includes(rule.id)) return 'mandatory';
    if (index.class_a.recommended.includes(rule.id)) return 'recommended';
    if (index.class_a.optional.includes(rule.id)) return 'optional';
    return rule.classes.includes('a') && rule.subset === 'CLA' ? 'mandatory' : null;
  }
  return rule.classes.includes(klass) ? 'applies' : null;
}

export const forceFor = (rule, klass) => (typeof rule.force === 'string' ? rule.force : rule.force?.[klass] ?? null);

export function durationMs(timeframe) {
  if (!timeframe) return null;
  const unit = { hours: 3_600_000, days: DAY_MS, months: 30 * DAY_MS }[timeframe.type];
  return unit ? timeframe.num * unit : null;
}

export const describeTimeframe = timeframe => (timeframe ? `${timeframe.num} ${timeframe.type}` : 'no timeframe');

export function staleNote(index, meta) {
  const reference = Date.parse(meta?.fetched_at || index.last_updated);
  const age = Math.floor((Date.now() - reference) / DAY_MS);
  return age > 45
    ? `FedRAMP publishes rule updates about monthly. This copy is ${age} days old; run /fedramp-20x:sync-rules.`
    : null;
}

// True when the file at metaUrl is the script Node was started with, also
// through a symlinked path. Lets the scripts be imported without running.
export function isMain(metaUrl) {
  try { return fileURLToPath(metaUrl) === realpathSync(process.argv[1]); } catch { return false; }
}

export async function run(main, usage) {
  // Output piped into `head` closes early; that is not an error.
  process.stdout.on('error', err => { if (err.code === 'EPIPE') process.exit(0); });
  try {
    process.exitCode = (await main(process.argv.slice(2))) ?? 0;
  } catch (err) {
    if (err instanceof UsageError) {
      process.stderr.write(`${err.message}\n\n${usage}`);
      process.exitCode = 2;
    } else {
      process.stderr.write(`${err.message}\n`);
      process.exitCode = 1;
    }
  }
}
