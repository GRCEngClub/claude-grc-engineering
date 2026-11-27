#!/usr/bin/env node
// Look up FedRAMP's Consolidated Rules: KSIs, rules, timeframes, and whether
// a newer release exists. Only `status` (without --offline) and `sync` use
// the network.

import fs from 'node:fs/promises';
import {
  CACHE_DIR, CACHE_FILE, CACHE_META, RULES_URL, UsageError,
  allKsis, allRules, describeTimeframe, forceFor, ksiApplicability, loadCachedDataset, loadCacheMeta,
  isMain, loadIndex, parseArgs, parseClass, ruleApplicability, run, staleNote,
} from './lib.js';

const USAGE = `Usage: node rules.js <command> [options]

Commands:
  status [--offline]                 Versions of the bundled, cached and published rules
  sync                               Download the published rules to ${CACHE_DIR}
  ksi [--class=A|B|C] [--theme=IAM]  List Key Security Indicators
  rules [--class=A|B|C|D] [--type=20x|rev5] [--set=MAS] [--affects=Providers]
                                     List rules that apply
  show <ID>                          One KSI or rule, with its statement when available
  timeframes --class=A|B|C|D         Vulnerability evaluation, mitigation and reporting timeframes

Options:
  --json   Machine-readable output
  --help   Show this text
`;

async function fetchPublished() {
  const res = await fetch(RULES_URL, { signal: AbortSignal.timeout(60_000), headers: { 'User-Agent': 'claude-grc-fedramp-20x' } });
  if (!res.ok) throw new Error(`Could not fetch the published rules (HTTP ${res.status}) from ${RULES_URL}`);
  const text = await res.text();
  let dataset;
  try { dataset = JSON.parse(text); } catch { throw new Error('The published rules file is not valid JSON.'); }
  if (!dataset?.info?.version || !dataset.KSI || !dataset.FRR) throw new Error('The published rules file does not have the expected sections (info, KSI, FRR).');
  return { dataset, text };
}

function findInDataset(dataset, id) {
  for (const theme of Object.values(dataset.KSI)) if (theme.indicators?.[id]) return theme.indicators[id];
  for (const set of Object.values(dataset.FRR)) for (const subsets of Object.values(set.data)) for (const rules of Object.values(subsets)) if (rules[id]) return rules[id];
  return null;
}

async function status(flags, index) {
  const meta = await loadCacheMeta();
  const cached = await loadCachedDataset();
  const out = { bundled: index.version, cached: cached?.info.version ?? null, cached_at: meta?.fetched_at ?? null, published: null };
  if (!flags.offline) {
    try { out.published = (await fetchPublished()).dataset.info.version; } catch (err) { out.error = err.message; }
  }
  const current = out.cached || out.bundled;
  // Versions are opaque strings: FedRAMP has said the scheme will change.
  out.update_available = out.published ? out.published !== current : null;
  if (flags.json) { process.stdout.write(`${JSON.stringify(out, null, 2)}\n`); return 0; }
  process.stdout.write(`bundled index:   ${out.bundled} (${index.counts.indicators} KSIs, ${index.counts.rules} rules)\n`);
  process.stdout.write(`cached dataset:  ${out.cached ? `${out.cached}, fetched ${out.cached_at}` : 'none (run sync for rule statements)'}\n`);
  if (flags.offline) process.stdout.write('published:       not checked (--offline)\n');
  else if (out.error) process.stdout.write(`published:       unknown. ${out.error}\n`);
  else process.stdout.write(`published:       ${out.published}${out.update_available ? '  <- differs from your copy; run sync' : '  (you are current)'}\n`);
  const note = staleNote(index, meta);
  if (note && flags.offline) process.stdout.write(`${note}\n`);
  if (out.published && out.published !== out.bundled) {
    process.stdout.write('The bundled index is from an older release. Lists and timeframes printed by these scripts use it; check anything that matters against the synced dataset.\n');
  }
  return 0;
}

async function sync(flags) {
  const { dataset, text } = await fetchPublished();
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(CACHE_FILE, text);
  const meta = { version: dataset.info.version, last_updated: dataset.info.last_updated, fetched_at: new Date().toISOString(), source: RULES_URL };
  await fs.writeFile(CACHE_META, `${JSON.stringify(meta, null, 2)}\n`);
  if (flags.json) process.stdout.write(`${JSON.stringify({ ...meta, path: CACHE_FILE }, null, 2)}\n`);
  else process.stdout.write(`Synced FedRAMP rules ${meta.version} (last updated ${meta.last_updated})\n${CACHE_FILE}\n`);
  return 0;
}

function listKsis(flags, index) {
  const klass = flags.class ? parseClass(flags.class, { allow: ['a', 'b', 'c'] }) : null;
  const theme = flags.theme ? String(flags.theme).toUpperCase().replace(/^KSI-/, '') : null;
  if (theme && !index.themes.some(t => t.id === theme)) throw new UsageError(`Unknown theme ${theme}. Themes: ${index.themes.map(t => t.id).join(', ')}.`);
  const rows = allKsis(index)
    .filter(ksi => !theme || ksi.theme === theme)
    .map(ksi => ({ ...ksi, applies: klass ? ksiApplicability(ksi, klass) : 'required' }))
    .filter(ksi => ksi.applies);
  if (flags.json) { process.stdout.write(`${JSON.stringify({ rules_version: index.version, class: klass?.toUpperCase() ?? null, indicators: rows }, null, 2)}\n`); return 0; }
  process.stdout.write(`FedRAMP rules ${index.version}${klass ? `, 20x Class ${klass.toUpperCase()}` : ''}: ${rows.length} Key Security Indicator(s)\n`);
  let last = null;
  for (const ksi of rows) {
    if (ksi.theme !== last) { process.stdout.write(`\n${ksi.theme}  ${ksi.theme_name}\n`); last = ksi.theme; }
    process.stdout.write(`  ${ksi.id}  ${ksi.name}${ksi.applies === 'optional' ? '  (optional for this class)' : ''}\n      ${ksi.statement}\n`);
  }
  if (klass === 'a') process.stdout.write('\nClass A addresses these seven KSIs (FRC-CLA-MFR). The others are not required for Class A.\n');
  return 0;
}

function listRules(flags, index) {
  const klass = flags.class ? parseClass(flags.class) : null;
  const type = flags.type ? String(flags.type).toLowerCase() : '20x';
  if (!['20x', 'rev5'].includes(type)) throw new UsageError('--type must be 20x or rev5.');
  const set = flags.set ? String(flags.set).toUpperCase() : null;
  if (set && !index.rulesets.some(s => s.key === set)) throw new UsageError(`Unknown ruleset ${set}. Rulesets: ${index.rulesets.map(s => s.key).join(', ')}.`);
  const affects = flags.affects ? String(flags.affects).toLowerCase() : null;
  const rows = allRules(index)
    .filter(rule => !set || rule.ruleset === set)
    .filter(rule => !affects || rule.affects.some(a => a.toLowerCase() === affects))
    .map(rule => ({ ...rule, applies: klass ? ruleApplicability(rule, index, { type, klass }) : 'applies', force_for_class: klass ? forceFor(rule, klass) : rule.force }))
    .filter(rule => rule.applies);
  if (flags.json) { process.stdout.write(`${JSON.stringify({ rules_version: index.version, type, class: klass?.toUpperCase() ?? null, rules: rows }, null, 2)}\n`); return 0; }
  process.stdout.write(`FedRAMP rules ${index.version}${klass ? `, ${type === 'rev5' ? 'Rev5' : '20x'} Class ${klass.toUpperCase()}` : ''}: ${rows.length} rule(s)\n`);
  let last = null;
  for (const rule of rows) {
    if (rule.ruleset !== last) { process.stdout.write(`\n${rule.ruleset}  ${rule.ruleset_name}\n`); last = rule.ruleset; }
    const force = typeof rule.force_for_class === 'string' ? rule.force_for_class : 'varies by class';
    const tier = ['mandatory', 'recommended', 'optional'].includes(rule.applies) ? `, Class A ${rule.applies}` : '';
    process.stdout.write(`  ${rule.id}  ${rule.name}  [${force}; ${rule.affects.join(', ')}${tier}]\n`);
  }
  return 0;
}

async function show(positional, flags, index) {
  const id = String(positional[1] || '').toUpperCase();
  if (!id) throw new UsageError('show needs a KSI or rule ID, for example KSI-IAM-APM or MAS-CSO-IIR.');
  const entry = allKsis(index).find(k => k.id === id) || allRules(index).find(r => r.id === id);
  if (!entry) throw new UsageError(`${id} is not in FedRAMP rules ${index.version}. IDs look like KSI-IAM-APM or VER-TFR-MAV.`);
  const dataset = await loadCachedDataset();
  const full = dataset ? findInDataset(dataset, id) : null;
  if (flags.json) { process.stdout.write(`${JSON.stringify({ rules_version: index.version, cached_version: dataset?.info.version ?? null, index: entry, dataset: full }, null, 2)}\n`); return 0; }
  process.stdout.write(`${entry.id}  ${entry.name}\n`);
  if (entry.theme) {
    process.stdout.write(`Theme: ${entry.theme} ${entry.theme_name}\nApplies to 20x: Class A ${entry.class_a ? 'yes' : 'no'}, Class B ${entry.class_b}, Class C ${entry.class_c}\n`);
    process.stdout.write(`Statement (${index.version}): ${entry.statement}\nRelated SP 800-53 controls: ${entry.controls.join(', ') || 'none listed'}\n`);
  } else {
    process.stdout.write(`Ruleset: ${entry.ruleset} ${entry.ruleset_name}\nForce: ${typeof entry.force === 'string' ? entry.force : JSON.stringify(entry.force)}\nAffects: ${entry.affects.join(', ')}\n`);
    process.stdout.write(`Types: ${entry.types.join(', ') || 'n/a'}; classes: ${entry.classes.map(c => c.toUpperCase()).join(', ') || 'n/a'}\n`);
    if (full) {
      const statement = full.statement || Object.entries(full.varies_by_class || {}).map(([c, v]) => `\n  Class ${c.toUpperCase()}: ${v.statement}`).join('');
      process.stdout.write(`Statement (${dataset.info.version}): ${statement}\n`);
      for (const note of [].concat(full.notes || [], full.note || [])) process.stdout.write(`Note: ${note}\n`);
    } else process.stdout.write('Statement: not bundled. Run `node rules.js sync` to download the full rules, then run show again.\n');
  }
  return 0;
}

function timeframes(flags, index) {
  if (!flags.class) throw new UsageError('timeframes needs --class=A, B, C or D.');
  const klass = parseClass(flags.class);
  const t = index.timeframes;
  const out = {
    rules_version: index.version,
    class: klass.toUpperCase(),
    evaluation_from_detection: t.evaluation_from_detection.by_class[klass],
    mitigation_from_evaluation: t.mitigation_from_evaluation.by_class[klass],
    accepted_after: t.accepted_after,
    human_readable_report: t.human_readable_report,
    machine_readable_history: t.machine_readable_history.by_class[klass],
  };
  if (flags.json) { process.stdout.write(`${JSON.stringify(out, null, 2)}\n`); return 0; }
  const cell = v => describeTimeframe(v).padEnd(13);
  process.stdout.write(`FedRAMP rules ${index.version}, Class ${out.class}. These apply to 20x and Rev5 certifications alike.\n\n`);
  process.stdout.write(`Evaluate after detection (VER-TFR-EVU, ${out.evaluation_from_detection.force}): ${describeTimeframe(out.evaluation_from_detection)}\n\n`);
  process.stdout.write('Reduce to a lower N-rating, counted from evaluation (VDR-TFR-PVR, SHOULD):\n');
  process.stdout.write('  N-rating  reachable+exploitable  not reachable+exploitable  not likely exploitable\n');
  for (const rating of ['5', '4', '3', '2', '1']) {
    const row = out.mitigation_from_evaluation[rating] || {};
    process.stdout.write(`  N${rating}        ${cell(row.irv_lev)}          ${cell(row.nirv_lev)}              ${cell(row.nlev)}\n`);
  }
  process.stdout.write(`\nAccepted vulnerability (VER-TFR-MAV, MUST): anything not fully mitigated or remediated within ${describeTimeframe(out.accepted_after)} of evaluation\n`);
  process.stdout.write(`Human-readable activity report (VER-TFR-MHR, MUST): at least every ${describeTimeframe(out.human_readable_report)}\n`);
  process.stdout.write(`JSON history for automated retrieval (VER-TFR-MRH, ${out.machine_readable_history.force}): updated at least every ${describeTimeframe(out.machine_readable_history)}\n`);
  process.stdout.write('Known Exploited Vulnerabilities follow the CISA KEV catalog due dates (VDR-TFR-KEV).\n');
  return 0;
}

async function main(argv) {
  const { flags, positional } = parseArgs(argv, ['help', 'json', 'offline', 'class', 'theme', 'type', 'set', 'affects']);
  const command = positional[0];
  if (flags.help || !command) { process.stdout.write(USAGE); return command || flags.help ? 0 : 2; }
  if (command === 'sync') return sync(flags);
  const index = await loadIndex();
  if (command === 'status') return status(flags, index);
  if (command === 'ksi') return listKsis(flags, index);
  if (command === 'rules') return listRules(flags, index);
  if (command === 'show') return show(positional, flags, index);
  if (command === 'timeframes') return timeframes(flags, index);
  throw new UsageError(`Unknown command: ${command}`);
}

if (isMain(import.meta.url)) run(main, USAGE);
