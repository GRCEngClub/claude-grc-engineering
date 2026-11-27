#!/usr/bin/env node
// Vulnerability activity reports under FedRAMP's VDR and VER rulesets, which
// apply to every certified offering, 20x and Rev5.
//
// From a working file of vulnerabilities this script works out, for a given
// certification class and date: whether evaluation is late (VER-TFR-EVU), when
// the next reduction is due and whether it is late (VDR-TFR-PVR), and which
// items have passed 192 days from evaluation and must be listed as accepted
// vulnerabilities (VER-TFR-MAV). It then writes the reports in the shape of
// FedRAMP's schemas plus a human-readable monthly report.
//
// It applies FedRAMP's published timeframes to the dates and ratings you
// supply. It does not rate anything: exploitability, reachability and the
// N-rating are the provider's evaluation.

import fs from 'node:fs/promises';
import path from 'node:path';
import { UsageError, describeTimeframe, durationMs, isMain, loadIndex, parseArgs, parseClass, run } from './lib.js';

const USAGE = `Usage: node ver-report.js <command> [options]

Commands:
  init [--out=<file>]                    Write an example working file
  check <working-file> [--as-of=<date>]  Show due dates, overdue items and items that must be accepted
  build <working-file> --out-dir=<dir> [--as-of=<date>]
                                         Write vulnerability-detail-report.json,
                                         accepted-vulnerability-info.json,
                                         historical-ver-activity.json and
                                         vulnerability-activity-report.md

Options:
  --as-of=<ISO date>  Evaluate as of this moment instead of now
  --force             Let build replace report files that already exist
  --json              Machine-readable output for check
  --help              Show this text
`;

const RESOLVED = ['Fully Mitigated', 'Remediated', 'False Positive'];
const DISPOSITIONS = [...RESOLVED, 'Partially Mitigated'];
const SCHEMAS = 'https://www.fedramp.gov/schemas/';

const time = value => (typeof value === 'string' && value ? Date.parse(value) : NaN);
const iso = ms => new Date(ms).toISOString();
const day = ms => new Date(ms).toISOString().slice(0, 10);
const isUri = value => { try { return Boolean(new URL(value).protocol); } catch { return false; } };
const isRating = value => Number.isInteger(value) && value >= 0 && value <= 5;

const EXAMPLE = {
  _about: 'Working file for /fedramp-20x:ver-report. Keep every open and accepted vulnerability here, plus those closed during the period, and carry the file forward month to month. Keys starting with _ are notes and are left out of the reports.',
  certificationClass: 'C',
  certificationPackageOverviewUri: 'https://trust.example.com/fedramp/certification-package-overview.json',
  reportPeriod: { from: '2026-11-01T00:00:00Z', to: '2026-11-30T23:59:59Z' },
  vulnerabilities: [
    {
      providerTrackingId: 'VULN-2026-0412',
      detection: { detectedAt: '2026-11-03T14:20:00Z', detectionSource: 'container image scan' },
      vulnerabilityDescription: 'Describe the vulnerability without detail that would help an attacker (VER-RPT-NID).',
      potentialAgencyImpact: 'What an agency would experience if this were exploited.',
      evaluationCompletedAt: '2026-11-05T09:00:00Z',
      isInternetReachable: true,
      isLikelyExploitable: true,
      currentRating: 3,
      _currentRating: 'Potential Agency Impact N-rating, 0 to 5, from your evaluation (VER-EVA-EPA).',
      painReductionEvents: [],
      projectedNextReduction: { estimatedAt: '2026-11-18T00:00:00Z', targetRating: 1 },
      supplementaryRiskInformation: '',
      _finalDisposition: 'Add finalDisposition (Fully Mitigated, Partially Mitigated, Remediated, False Positive) when work ends. Omit while active.',
      _accepted: 'Set accepted to true and add acceptanceRationale when you decide to accept. The script also moves anything past 192 days from evaluation to the accepted list.',
      _closedAt: 'When you add a resolving finalDisposition, also add closedAt (date-time). The item is reported in the period it closed and left out afterwards.',
    },
  ],
};

export function evaluate(vuln, { klass, index, asOf }) {
  const errors = [];
  const id = typeof vuln.providerTrackingId === 'string' && vuln.providerTrackingId ? vuln.providerTrackingId : null;
  if (!id) errors.push('providerTrackingId is missing.');
  const detectedAt = time(vuln.detection?.detectedAt);
  if (!Number.isFinite(detectedAt)) errors.push('detection.detectedAt is missing or not a date-time.');
  if (!vuln.detection?.detectionSource) errors.push('detection.detectionSource is missing.');
  if (!vuln.vulnerabilityDescription) errors.push('vulnerabilityDescription is missing.');
  if (vuln.finalDisposition !== undefined && !DISPOSITIONS.includes(vuln.finalDisposition)) errors.push(`finalDisposition must be one of ${DISPOSITIONS.join(', ')}.`);
  if (vuln.currentRating !== undefined && !isRating(vuln.currentRating)) errors.push('currentRating must be a whole number from 0 to 5.');
  for (const event of vuln.painReductionEvents || []) {
    if (!Number.isFinite(time(event?.reducedAt)) || !isRating(event?.rating)) errors.push('Each painReductionEvents entry needs reducedAt (date-time) and rating (0 to 5).');
  }
  const next = vuln.projectedNextReduction;
  if (next !== undefined && (!Number.isFinite(time(next?.estimatedAt)) || !isRating(next?.targetRating))) errors.push('projectedNextReduction needs estimatedAt (date-time) and targetRating (0 to 5).');

  const t = index.timeframes;
  const evaluatedAt = time(vuln.evaluationCompletedAt);
  const evaluated = Number.isFinite(evaluatedAt);
  if (vuln.evaluationCompletedAt && !evaluated) errors.push('evaluationCompletedAt is not a date-time.');
  const resolved = RESOLVED.includes(vuln.finalDisposition);
  if (vuln.closedAt !== undefined && !Number.isFinite(time(vuln.closedAt))) errors.push('closedAt is not a date-time.');
  // Without a closing date a resolved item cannot be placed in a period and
  // would silently drop out of the reports.
  if (resolved && vuln.closedAt === undefined) errors.push(`closedAt (date-time) is required when finalDisposition is ${vuln.finalDisposition}.`);
  // The script reads the file as it stands today. It cannot rebuild the state
  // at an earlier date from a file that already records later events.
  const later = [vuln.detection?.detectedAt, vuln.evaluationCompletedAt, vuln.closedAt, ...(vuln.painReductionEvents || []).map(e => e?.reducedAt)].map(time).filter(d => Number.isFinite(d) && d > asOf);
  if (later.length) errors.push(`has an event dated ${day(Math.max(...later))}, after the evaluation date ${day(asOf)}. Use a copy of the working file from that date, or a later --as-of.`);
  // A resolved vulnerability is closed even if it was accepted earlier.
  const out = { id, errors, resolved, evaluated, reasons: [], evaluationDue: null, mitigationDue: null, acceptDeadline: null, mustAccept: false, accepted: vuln.accepted === true && !resolved, timeframe: null, cell: null };

  if (!evaluated && Number.isFinite(detectedAt)) {
    const limit = t.evaluation_from_detection.by_class[klass];
    out.evaluationDue = detectedAt + durationMs(limit);
    if (!resolved && asOf > out.evaluationDue) out.reasons.push(`Evaluation was due within ${describeTimeframe(limit)} of detection (VER-TFR-EVU, Class ${klass.toUpperCase()}), by ${day(out.evaluationDue)}, and is not recorded.`);
  }
  if (evaluated && !resolved) {
    out.acceptDeadline = evaluatedAt + durationMs(t.accepted_after);
    if (asOf > out.acceptDeadline) out.mustAccept = true;
    if (!isRating(vuln.currentRating)) errors.push('currentRating is required once evaluation is complete.');
    if (typeof vuln.isLikelyExploitable !== 'boolean') errors.push('isLikelyExploitable (true or false) is required once evaluation is complete.');
    else if (vuln.isLikelyExploitable && typeof vuln.isInternetReachable !== 'boolean') errors.push('isInternetReachable (true or false) is required for a likely exploitable vulnerability.');
    if (!errors.length) {
      out.cell = !vuln.isLikelyExploitable ? 'nlev' : vuln.isInternetReachable ? 'irv_lev' : 'nirv_lev';
      out.timeframe = t.mitigation_from_evaluation.by_class[klass][String(vuln.currentRating)]?.[out.cell] ?? null;
      if (out.timeframe) {
        out.mitigationDue = evaluatedAt + durationMs(out.timeframe);
        if (asOf > out.mitigationDue) {
          const kind = { irv_lev: 'internet-reachable and likely exploitable', nirv_lev: 'likely exploitable, not internet-reachable', nlev: 'not likely exploitable' }[out.cell];
          out.reasons.push(`A reduction to a lower N-rating was expected within ${describeTimeframe(out.timeframe)} of evaluation (VDR-TFR-PVR, Class ${klass.toUpperCase()}, N${vuln.currentRating}, ${kind}), by ${day(out.mitigationDue)}.`);
        }
      }
    }
  }
  if (out.accepted || out.mustAccept) {
    out.accepted = true;
    if (!vuln.acceptanceRationale) {
      errors.push(out.mustAccept && vuln.accepted !== true
        ? `More than ${describeTimeframe(t.accepted_after)} have passed since evaluation, so this must be listed as an accepted vulnerability (VER-TFR-MAV). Add acceptanceRationale.`
        : 'acceptanceRationale is required for an accepted vulnerability.');
    }
  }
  out.overdue = out.reasons.length > 0;
  return out;
}

function detail(vuln, result) {
  const out = {
    providerTrackingId: vuln.providerTrackingId,
    detection: { detectedAt: vuln.detection.detectedAt, detectionSource: vuln.detection.detectionSource },
    vulnerabilityDescription: vuln.vulnerabilityDescription,
  };
  for (const key of ['potentialAgencyImpact', 'evaluationCompletedAt', 'supplementaryRiskInformation', 'finalDisposition']) if (vuln[key]) out[key] = vuln[key];
  for (const key of ['isInternetReachable', 'isLikelyExploitable']) if (typeof vuln[key] === 'boolean') out[key] = vuln[key];
  if (isRating(vuln.currentRating)) out.currentRating = vuln.currentRating;
  if (vuln.projectedNextReduction && !result.resolved) out.projectedNextReduction = { estimatedAt: vuln.projectedNextReduction.estimatedAt, targetRating: vuln.projectedNextReduction.targetRating };
  out.overdueStatus = { isOverdue: result.overdue };
  if (result.overdue) out.overdueStatus.explanation = [...result.reasons, vuln.overdueExplanation].filter(Boolean).join(' ');
  if (Array.isArray(vuln.painReductionEvents) && vuln.painReductionEvents.length) out.painReductionEvents = vuln.painReductionEvents.map(e => ({ reducedAt: e.reducedAt, rating: e.rating }));
  return out;
}

export function assemble(doc, index, asOf) {
  const errors = [];
  let klass = null;
  try { klass = parseClass(doc.certificationClass); } catch { errors.push('certificationClass must be A, B, C or D.'); }
  if (!doc.certificationPackageOverviewUri || !isUri(doc.certificationPackageOverviewUri)) errors.push('certificationPackageOverviewUri must be the full URI of the Certification Package Overview.');
  const from = time(doc.reportPeriod?.from);
  const to = time(doc.reportPeriod?.to);
  if (!Number.isFinite(from) || !Number.isFinite(to) || from > to) errors.push('reportPeriod needs from and to date-times, with from before to.');
  if (!Array.isArray(doc.vulnerabilities)) errors.push('vulnerabilities must be an array.');
  if (errors.length || !klass) return { errors, klass, rows: [] };

  const seen = new Set();
  const rows = doc.vulnerabilities.map((vuln, n) => {
    const result = evaluate(vuln || {}, { klass, index, asOf });
    const label = result.id || `entry ${n + 1}`;
    if (result.id && seen.has(result.id)) result.errors.push('providerTrackingId is used more than once.');
    seen.add(result.id);
    errors.push(...result.errors.map(e => `${label}: ${e}`));
    return { vuln, result, label };
  });
  // Open and accepted items are always reported. A closed item is reported
  // only when something dated falls inside the period, so the same file can
  // be carried forward without closed items reappearing every month.
  for (const row of rows) {
    const dates = [row.vuln.detection?.detectedAt, row.vuln.evaluationCompletedAt, row.vuln.closedAt, ...(row.vuln.painReductionEvents || []).map(e => e?.reducedAt)].map(time).filter(Number.isFinite);
    row.inPeriod = !row.result.resolved || dates.some(d => d >= from && d <= to);
  }
  return { errors, klass, rows };
}

function markdown(doc, index, klass, rows, asOf) {
  const active = rows.filter(r => !r.result.accepted && !r.result.resolved);
  const accepted = rows.filter(r => r.result.accepted);
  const closed = rows.filter(r => r.result.resolved && r.inPeriod);
  const overdue = rows.filter(r => r.result.overdue);
  const yesNo = v => (v === true ? 'yes' : v === false ? 'no' : 'not evaluated');
  const rating = v => (isRating(v.currentRating) ? `N${v.currentRating}` : 'not rated');
  const date = v => (Number.isFinite(time(v)) ? day(time(v)) : '');
  const cell = v => String(v ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
  const lines = ['# Vulnerability activity report', ''];
  lines.push(`- Period: ${date(doc.reportPeriod.from)} to ${date(doc.reportPeriod.to)}`);
  lines.push(`- Certification class: ${klass.toUpperCase()}`);
  lines.push(`- Evaluated as of: ${day(asOf)}`);
  lines.push(`- FedRAMP rules version used for timeframes: ${index.version}`);
  lines.push(`- Certification Package Overview: ${doc.certificationPackageOverviewUri}`, '');
  lines.push('Exploitability, internet reachability and the Potential Agency Impact N-rating are the provider\'s evaluation. Due dates apply FedRAMP\'s published timeframes to those values. Descriptions are left out of this report; they are in the JSON reports.', '');
  lines.push('## Summary', '', '| | Count |', '|---|---|');
  lines.push(`| Active vulnerabilities | ${active.length} |`, `| Accepted vulnerabilities | ${accepted.length} |`, `| Closed in this period | ${closed.length} |`, `| Overdue | ${overdue.length} |`, '');
  lines.push('| N-rating | Active |', '|---|---|');
  for (const n of [5, 4, 3, 2, 1, 0]) lines.push(`| N${n} | ${active.filter(r => r.vuln.currentRating === n).length} |`);
  lines.push(`| Not yet rated | ${active.filter(r => !isRating(r.vuln.currentRating)).length} |`, '');

  const table = (title, list, extra) => {
    lines.push(`## ${title}`, '');
    if (!list.length) { lines.push('None.', ''); return; }
    lines.push(`| Tracking ID | Detected | Source | Evaluated | Internet-reachable | Likely exploitable | N-rating | Next reduction due | Overdue |${extra ? ` ${extra.title} |` : ''}`);
    lines.push(`|---|---|---|---|---|---|---|---|---|${extra ? '---|' : ''}`);
    for (const { vuln, result } of list) {
      const due = result.mitigationDue ? day(result.mitigationDue) : result.evaluationDue ? `evaluate by ${day(result.evaluationDue)}` : 'none set by the rules';
      lines.push(`| ${cell(vuln.providerTrackingId)} | ${date(vuln.detection.detectedAt)} | ${cell(vuln.detection.detectionSource)} | ${date(vuln.evaluationCompletedAt) || 'no'} | ${yesNo(vuln.isInternetReachable)} | ${yesNo(vuln.isLikelyExploitable)} | ${rating(vuln)} | ${result.resolved ? 'closed' : due} | ${result.overdue ? 'yes' : 'no'} |${extra ? ` ${cell(extra.value(vuln))} |` : ''}`);
    }
    lines.push('');
  };
  table('Active vulnerabilities', active);
  table('Accepted vulnerabilities', accepted, { title: 'Reason for acceptance', value: v => v.acceptanceRationale });
  table('Closed', closed, { title: 'Final disposition', value: v => v.finalDisposition });

  lines.push('## Overdue items', '');
  if (!overdue.length) lines.push('None.');
  for (const { vuln, result } of overdue) lines.push(`- ${cell(vuln.providerTrackingId)}: ${[...result.reasons, vuln.overdueExplanation].filter(Boolean).join(' ')}`);
  lines.push('', '## Rating changes', '');
  const from = time(doc.reportPeriod.from);
  const to = time(doc.reportPeriod.to);
  const changed = rows.map(r => ({ vuln: r.vuln, events: (r.vuln.painReductionEvents || []).filter(e => time(e.reducedAt) >= from && time(e.reducedAt) <= to) })).filter(r => r.events.length);
  if (!changed.length) lines.push('None in this period.');
  for (const { vuln, events } of changed) lines.push(`- ${cell(vuln.providerTrackingId)}: ${events.map(e => `N${e.rating} on ${date(e.reducedAt)}`).join(', ')}`);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

async function readWorkingFile(file) {
  if (!file) throw new UsageError('Give the path of the working file.');
  let text;
  try { text = await fs.readFile(file, 'utf8'); } catch { throw new Error(`Cannot read ${file}.`); }
  try { return JSON.parse(text); } catch (err) { throw new Error(`${file} is not valid JSON: ${err.message}`); }
}

async function main(argv) {
  const { flags, positional } = parseArgs(argv, ['help', 'json', 'out', 'out-dir', 'as-of', 'force']);
  const command = positional[0];
  if (flags.help || !command) { process.stdout.write(USAGE); return command || flags.help ? 0 : 2; }

  if (command === 'init') {
    const text = `${JSON.stringify(EXAMPLE, null, 2)}\n`;
    if (!flags.out || flags.out === true) process.stdout.write(text);
    else {
      await fs.writeFile(flags.out, text, { flag: 'wx', mode: 0o600 }).catch(err => { throw new Error(err.code === 'EEXIST' ? `${flags.out} already exists.` : err.message); });
      process.stderr.write(`Wrote ${flags.out}\n`);
    }
    return 0;
  }
  if (!['check', 'build'].includes(command)) throw new UsageError(`Unknown command: ${command}`);

  const asOf = flags['as-of'] ? time(String(flags['as-of'])) : Date.now();
  if (!Number.isFinite(asOf)) throw new UsageError('--as-of must be a date or date-time such as 2026-12-01 or 2026-12-01T00:00:00Z.');
  const index = await loadIndex();
  const doc = await readWorkingFile(positional[1]);
  const { errors, klass, rows } = assemble(doc, index, asOf);

  if (command === 'check') {
    const report = rows.map(({ result, vuln }) => ({
      providerTrackingId: result.id, state: result.accepted ? 'accepted' : result.resolved ? 'closed' : 'active',
      currentRating: vuln.currentRating ?? null,
      evaluationDue: result.evaluationDue ? iso(result.evaluationDue) : null,
      nextReductionDue: result.mitigationDue ? iso(result.mitigationDue) : null,
      acceptedAfter: result.acceptDeadline ? iso(result.acceptDeadline) : null,
      overdue: result.overdue, reasons: result.reasons,
    }));
    if (flags.json) process.stdout.write(`${JSON.stringify({ rules_version: index.version, class: klass?.toUpperCase() ?? null, as_of: iso(asOf), errors, vulnerabilities: report }, null, 2)}\n`);
    else {
      process.stdout.write(`Class ${klass ? klass.toUpperCase() : '?'}, as of ${day(asOf)}, FedRAMP rules ${index.version}: ${rows.length} vulnerabilities, ${report.filter(r => r.overdue).length} overdue, ${report.filter(r => r.state === 'accepted').length} accepted, ${errors.length} error(s)\n`);
      for (const row of report) {
        const due = row.nextReductionDue ? `next reduction due ${row.nextReductionDue.slice(0, 10)}` : row.evaluationDue ? `evaluate by ${row.evaluationDue.slice(0, 10)}` : 'no timeframe applies';
        process.stdout.write(`  ${row.providerTrackingId || '(no ID)'}  ${row.state}  ${row.currentRating === null ? 'not rated' : `N${row.currentRating}`}  ${row.state === 'active' ? due : ''}${row.overdue ? '  OVERDUE' : ''}\n`);
        for (const reason of row.reasons) process.stdout.write(`      ${reason}\n`);
      }
      for (const error of errors) process.stdout.write(`Error: ${error}\n`);
    }
    return errors.length ? 1 : 0;
  }

  if (!flags['out-dir'] || flags['out-dir'] === true) throw new UsageError('build needs --out-dir=<directory>.');
  if (errors.length) throw new Error(`Cannot build the reports:\n${errors.map(e => `  - ${e}`).join('\n')}`);
  const outDir = String(flags['out-dir']);
  await fs.mkdir(outDir, { recursive: true, mode: 0o700 });
  const base = { certificationPackageOverviewUri: doc.certificationPackageOverviewUri };
  const period = { from: doc.reportPeriod.from, to: doc.reportPeriod.to };
  const activeRows = rows.filter(r => !r.result.accepted && r.inPeriod);
  const acceptedRows = rows.filter(r => r.result.accepted);
  const acceptedInfo = acceptedRows.map(r => ({ vulnerabilityDetail: detail(r.vuln, r.result), acceptanceRationale: r.vuln.acceptanceRationale }));
  const files = {
    'vulnerability-detail-report.json': { ...base, reportPeriod: period, vulnerabilities: activeRows.map(r => detail(r.vuln, r.result)) },
    'accepted-vulnerability-info.json': { ...base, reportPeriod: period, acceptedVulnerabilities: acceptedInfo },
    'historical-ver-activity.json': { ...base, generatedAt: iso(asOf), activeVulnerabilities: activeRows.filter(r => !r.result.resolved).map(r => detail(r.vuln, r.result)), acceptedVulnerabilities: acceptedInfo },
  };
  const outputs = Object.entries(files).map(([name, content]) => [name, `${JSON.stringify(content, null, 2)}\n`]);
  outputs.push(['vulnerability-activity-report.md', markdown(doc, index, klass, rows, asOf)]);
  // Last month's reports are a record. Refuse to replace them unless asked,
  // and never write through a symlink left in the directory.
  for (const [name] of outputs) {
    const existing = await fs.lstat(path.join(outDir, name)).catch(() => null);
    if (existing?.isSymbolicLink()) throw new Error(`${path.join(outDir, name)} is a symbolic link. Remove it or choose another directory.`);
    if (existing && !flags.force) throw new Error(`${path.join(outDir, name)} already exists. Use a new directory for each period, or pass --force to replace it.`);
  }
  for (const [name, text] of outputs) {
    const target = path.join(outDir, name);
    await fs.rm(target, { force: true });
    await fs.writeFile(target, text, { flag: 'wx', mode: 0o600 });
  }
  process.stdout.write(`Wrote 4 files to ${outDir}\n`);
  process.stdout.write(`  ${activeRows.length} in the detail report, ${acceptedRows.length} accepted, ${rows.filter(r => r.result.overdue).length} overdue\n`);
  process.stdout.write(`JSON shapes follow ${SCHEMAS}fedramp-vulnerability-detail-report-schema-2026-06-24.json and its companions. Validate at ${SCHEMAS}validator/ before sharing.\n`);
  return 0;
}

if (isMain(import.meta.url)) run(main, USAGE);
