#!/usr/bin/env node
// Security Decision Record helper for FedRAMP 20x.
//
// The Security Decision Record (SDR) replaced the System Security Plan, and
// FedRAMP no longer asks for a separate Security Assessment Report: the
// provider's verification and validation, and the assessor's findings, are
// recorded per rule and per Key Security Indicator inside the SDR.
//
// This script keeps a working file with one entry per applicable rule and KSI,
// checks it for gaps, writes JSON in the shape of FedRAMP's SDR schema, and
// prints a traceability summary. It records what people supply. It does not
// assess anything and its output is not evidence of a result.

import fs from 'node:fs/promises';
import {
  UsageError, allKsis, allRules, forceFor, isMain, ksiApplicability, loadIndex, parseArgs, parseClass, ruleApplicability, run,
} from './lib.js';

const USAGE = `Usage: node sdr.js <command> [options]

Commands:
  init --class=A|B|C [--out=<file>]   Write a working file listing every rule and KSI
                                      that applies to a 20x certification of that class
  check <working-file>                Report gaps: missing statements, unknown IDs, open items
  build <working-file> --out=<file>   Write the Security Decision Record as JSON in the
                                      shape of FedRAMP's SDR schema
  summary <working-file> [--out=<file>]
                                      Markdown traceability table and the facts an
                                      assessor's overall summary has to cover

Options:
  --json   Machine-readable output for check
  --help   Show this text

The working file is JSON you edit. It holds what the provider and the assessor
wrote; this script never fills in a result for you.
`;

const STATUSES = ['Implemented', 'Not Implemented', 'Partially Implemented'];
const EVIDENCE_TYPES = ['Log', 'Report', 'Screenshot', 'Configuration', 'Policy', 'Procedure', 'Audit Record'];
const SCHEMA_URL = 'https://www.fedramp.gov/schemas/fedramp-security-decision-record-schema-2026-06-24.json';

// Statement fields are arrays of strings. A single string is kept as a
// one-item array so a statement typed without brackets is not lost.
const strings = value => (typeof value === 'string' ? [value] : Array.isArray(value) ? value : []).filter(v => typeof v === 'string' && v.trim());
const badStatements = value => value !== undefined && typeof value !== 'string' && (!Array.isArray(value) || value.some(v => typeof v !== 'string'));

function isUri(value) {
  try { return Boolean(new URL(value).protocol); } catch { return false; }
}

async function readWorkingFile(file) {
  if (!file) throw new UsageError('Give the path of the working file.');
  let text;
  try { text = await fs.readFile(file, 'utf8'); } catch { throw new Error(`Cannot read ${file}.`); }
  let doc;
  try { doc = JSON.parse(text); } catch (err) { throw new Error(`${file} is not valid JSON: ${err.message}`); }
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) throw new Error(`${file} must contain a JSON object.`);
  return doc;
}

async function writeOut(file, text) {
  if (!file || file === true) { process.stdout.write(text); return; }
  // Records hold assessment statements; keep them readable by the owner only.
  await fs.writeFile(file, text, { flag: 'wx', mode: 0o600 }).catch(err => {
    if (err.code === 'EEXIST') throw new Error(`${file} already exists. Choose another name or remove it first.`);
    throw err;
  });
  process.stderr.write(`Wrote ${file}\n`);
}

export function buildSkeleton(index, klass) {
  const rules = allRules(index)
    .filter(rule => rule.affects.includes('Providers'))
    .map(rule => ({ rule, applies: ruleApplicability(rule, index, { type: '20x', klass }) }))
    .filter(row => row.applies);
  const ksis = allKsis(index).map(ksi => ({ ksi, applies: ksiApplicability(ksi, klass) })).filter(row => row.applies);
  return {
    _about: 'Working file for /fedramp-20x:sdr. Fill in the statements, then run check, build and summary. Keys starting with _ are notes for you and are left out of the built record.',
    certificationClass: klass.toUpperCase(),
    rulesVersion: index.version,
    certificationPackageOverviewUri: '',
    metadata: { version: '0.1.0', updateSource: '' },
    fedRampRequirements: rules.map(({ rule, applies }) => ({
      frrID: rule.id,
      _name: rule.name,
      _force: forceFor(rule, klass),
      ...(klass === 'a' ? { _classA: applies } : {}),
      frrImplementationStatus: '',
      frrImplementation: [],
      frrValidation: [],
      frrAssessment: [],
    })),
    keySecurityIndicators: ksis.map(({ ksi, applies }) => ({
      ksiId: ksi.id,
      _name: ksi.name,
      _statement: ksi.statement,
      _applicability: applies,
      ksiImplementationStatus: '',
      ksiImplementation: [],
      ksiValidation: [],
      ksiAssessment: [],
      ksiTests: [],
      ksiEvidence: [],
    })),
  };
}

// Returns { errors, gaps, notes }. Errors stop a build. Gaps are entries that
// are incomplete. Notes are facts worth a reader's attention.
export function checkWorkingFile(doc, index) {
  const errors = [];
  const gaps = [];
  const notes = [];
  let klass = null;
  try { klass = parseClass(doc.certificationClass, { allow: ['a', 'b', 'c'] }); } catch { errors.push('certificationClass must be A, B or C.'); }
  if (doc.rulesVersion && doc.rulesVersion !== index.version) {
    notes.push(`The working file was created against rules ${doc.rulesVersion}; this plugin bundles ${index.version}. Rule and KSI lists may have changed.`);
  }
  if (!doc.certificationPackageOverviewUri) gaps.push('certificationPackageOverviewUri is empty. The schema requires the full URI of the Certification Package Overview.');
  else if (!isUri(doc.certificationPackageOverviewUri)) errors.push('certificationPackageOverviewUri is not a valid URI.');
  if (!doc.metadata?.version || !doc.metadata?.updateSource) gaps.push('metadata.version and metadata.updateSource should say which version this is and who or what updated it (SDR-CSO-MTD).');

  const knownRules = new Map(allRules(index).map(r => [r.id, r]));
  const knownKsis = new Map(allKsis(index).map(k => [k.id, k]));
  const seen = new Set();
  const requirement = Array.isArray(doc.fedRampRequirements) ? doc.fedRampRequirements : [];
  if (!Array.isArray(doc.fedRampRequirements)) errors.push('fedRampRequirements must be an array.');
  for (const entry of requirement) {
    const id = entry?.frrID;
    if (typeof id !== 'string' || !id) { errors.push('A fedRampRequirements entry has no frrID.'); continue; }
    if (seen.has(id)) errors.push(`${id} appears more than once.`);
    seen.add(id);
    const rule = knownRules.get(id);
    if (!rule) { errors.push(`${id} is not a rule in FedRAMP rules ${index.version}.`); continue; }
    if (entry.frrImplementationStatus && !STATUSES.includes(entry.frrImplementationStatus)) errors.push(`${id}: frrImplementationStatus must be one of ${STATUSES.join(', ')}.`);
    for (const field of ['frrImplementation', 'frrValidation', 'frrAssessment']) if (badStatements(entry[field])) errors.push(`${id}: ${field} must be a list of text statements.`);
    if (!strings(entry.frrImplementation).length) gaps.push(`${id}: no implementation statement.`);
    if (!strings(entry.frrValidation).length) gaps.push(`${id}: no provider validation statement.`);
    if (!strings(entry.frrAssessment).length) gaps.push(`${id}: no independent assessment statement.`);
    if (!entry.frrImplementationStatus) gaps.push(`${id}: no implementation status.`);
    else if (entry.frrImplementationStatus !== 'Implemented') notes.push(`${id} (${rule.name}) is recorded as ${entry.frrImplementationStatus}.`);
  }

  const ksiEntries = Array.isArray(doc.keySecurityIndicators) ? doc.keySecurityIndicators : [];
  if (doc.keySecurityIndicators !== undefined && !Array.isArray(doc.keySecurityIndicators)) errors.push('keySecurityIndicators must be an array.');
  const expected = klass ? index.timeframes.automated_ksi_validation.by_class[klass] : null;
  for (const entry of ksiEntries) {
    const id = entry?.ksiId;
    if (typeof id !== 'string' || !id) { errors.push('A keySecurityIndicators entry has no ksiId.'); continue; }
    if (seen.has(id)) errors.push(`${id} appears more than once.`);
    seen.add(id);
    const ksi = knownKsis.get(id);
    if (!ksi) { errors.push(`${id} is not a Key Security Indicator in FedRAMP rules ${index.version}.`); continue; }
    if (klass && !ksiApplicability(ksi, klass)) notes.push(`${id} is not among the KSIs for Class ${klass.toUpperCase()}; it is included voluntarily.`);
    if (entry.ksiImplementationStatus && !STATUSES.includes(entry.ksiImplementationStatus)) errors.push(`${id}: ksiImplementationStatus must be one of ${STATUSES.join(', ')}.`);
    for (const field of ['ksiImplementation', 'ksiValidation', 'ksiAssessment', 'ksiTests']) if (badStatements(entry[field])) errors.push(`${id}: ${field} must be a list of text statements.`);
    if (entry.ksiEvidence !== undefined && !Array.isArray(entry.ksiEvidence)) errors.push(`${id}: ksiEvidence must be a list of evidence entries.`);
    for (const [field, label] of [['ksiImplementation', 'implementation statement'], ['ksiValidation', 'provider validation statement'], ['ksiAssessment', 'independent assessment statement'], ['ksiTests', 'test']]) {
      if (!strings(entry[field]).length) gaps.push(`${id}: no ${label}.`);
    }
    const evidence = Array.isArray(entry.ksiEvidence) ? entry.ksiEvidence : [];
    if (!evidence.length) gaps.push(`${id}: no evidence entry.`);
    evidence.forEach((item, n) => {
      if (!item || typeof item !== 'object') { errors.push(`${id}: evidence ${n + 1} must be an object.`); return; }
      if (item.evidenceType && !EVIDENCE_TYPES.includes(item.evidenceType)) errors.push(`${id}: evidence ${n + 1} has evidenceType "${item.evidenceType}". Allowed: ${EVIDENCE_TYPES.join(', ')}.`);
      if (item.evidenceLocation && !isUri(item.evidenceLocation)) errors.push(`${id}: evidence ${n + 1} evidenceLocation is not a URI.`);
      if (item.lastUpdated && !/^\d{4}-\d{2}-\d{2}$/.test(item.lastUpdated)) errors.push(`${id}: evidence ${n + 1} lastUpdated must be a date (YYYY-MM-DD).`);
    });
    if (!entry.ksiImplementationStatus) gaps.push(`${id}: no implementation status.`);
    else if (entry.ksiImplementationStatus !== 'Implemented') notes.push(`${id} (${ksi.name}) is recorded as ${entry.ksiImplementationStatus}.`);
    if (expected?.methods_per_ksi && strings(entry.ksiTests).length < expected.methods_per_ksi) {
      notes.push(`${id}: ${strings(entry.ksiTests).length} test(s) listed. FRC-CSX-VVK says Class ${klass.toUpperCase()} ${expected.force} have at least ${expected.methods_per_ksi} automated method(s) per KSI.`);
    }
  }

  if (klass) {
    for (const rule of allRules(index)) {
      const applies = rule.affects.includes('Providers') ? ruleApplicability(rule, index, { type: '20x', klass }) : null;
      if (applies && applies !== 'optional' && applies !== 'recommended' && !seen.has(rule.id)) gaps.push(`${rule.id} (${rule.name}) applies to Class ${klass.toUpperCase()} and has no entry.`);
    }
    for (const ksi of allKsis(index)) {
      if (ksiApplicability(ksi, klass) === 'required' && !seen.has(ksi.id)) gaps.push(`${ksi.id} (${ksi.name}) applies to Class ${klass.toUpperCase()} and has no entry.`);
    }
  }
  return { errors, gaps, notes, klass };
}

const stripNotes = entry => Object.fromEntries(Object.entries(entry).filter(([key, value]) => !key.startsWith('_') && value !== ''));

export function buildRecord(doc, now = new Date()) {
  const record = {
    certificationPackageOverviewUri: doc.certificationPackageOverviewUri,
    metadata: { version: doc.metadata.version, lastUpdated: doc.metadata.lastUpdated || now.toISOString(), updateSource: doc.metadata.updateSource },
    fedRampRequirements: doc.fedRampRequirements.map(entry => {
      const out = stripNotes(entry);
      for (const field of ['frrImplementation', 'frrValidation', 'frrAssessment']) out[field] = strings(entry[field]);
      return out;
    }),
  };
  if (Array.isArray(doc.keySecurityIndicators) && doc.keySecurityIndicators.length) {
    record.keySecurityIndicators = doc.keySecurityIndicators.map(entry => {
      const out = stripNotes(entry);
      for (const field of ['ksiImplementation', 'ksiValidation', 'ksiAssessment', 'ksiTests']) out[field] = strings(entry[field]);
      out.ksiEvidence = (Array.isArray(entry.ksiEvidence) ? entry.ksiEvidence : []).map(stripNotes);
      return out;
    });
  }
  for (const extra of ['portsAndProtocols', 'securityControls']) if (Array.isArray(doc[extra]) && doc[extra].length) record[extra] = doc[extra];
  return record;
}

const mark = value => (value ? 'yes' : 'no');
const cellText = value => String(value ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();

export function buildSummary(doc, index, result) {
  const klass = result.klass ? result.klass.toUpperCase() : '?';
  const rules = new Map(allRules(index).map(r => [r.id, r]));
  const ksis = new Map(allKsis(index).map(k => [k.id, k]));
  const reqs = Array.isArray(doc.fedRampRequirements) ? doc.fedRampRequirements : [];
  const inds = Array.isArray(doc.keySecurityIndicators) ? doc.keySecurityIndicators : [];
  const count = (list, field, value) => list.filter(e => e[field] === value).length;
  const lines = [];
  lines.push('# Security Decision Record: traceability summary', '');
  lines.push(`- Certification profile: 20x, Class ${klass}`);
  lines.push(`- FedRAMP rules version: ${doc.rulesVersion || index.version}`);
  lines.push(`- Record version: ${doc.metadata?.version || 'not set'}`);
  lines.push(`- Rules recorded: ${reqs.length}. Key Security Indicators recorded: ${inds.length}.`, '');
  lines.push('This summary restates what the working file contains. It is not an assessment, and a "yes" means a statement is present, not that it is adequate.', '');

  lines.push('## Status', '', '| | Implemented | Partially Implemented | Not Implemented | No status |', '|---|---|---|---|---|');
  for (const [label, list, field] of [['Rules', reqs, 'frrImplementationStatus'], ['Key Security Indicators', inds, 'ksiImplementationStatus']]) {
    lines.push(`| ${label} | ${count(list, field, 'Implemented')} | ${count(list, field, 'Partially Implemented')} | ${count(list, field, 'Not Implemented')} | ${list.filter(e => !e[field]).length} |`);
  }
  lines.push('');

  lines.push('## Key Security Indicators', '', '| KSI | Name | Status | Implementation | Provider validation | Independent assessment | Tests | Evidence |', '|---|---|---|---|---|---|---|---|');
  for (const entry of inds) {
    lines.push(`| ${cellText(entry.ksiId)} | ${cellText(ksis.get(entry.ksiId)?.name)} | ${cellText(entry.ksiImplementationStatus) || 'not set'} | ${mark(strings(entry.ksiImplementation).length)} | ${mark(strings(entry.ksiValidation).length)} | ${mark(strings(entry.ksiAssessment).length)} | ${strings(entry.ksiTests).length} | ${Array.isArray(entry.ksiEvidence) ? entry.ksiEvidence.length : 0} |`);
  }
  lines.push('');

  lines.push('## Rules', '', '| Rule | Name | Force | Status | Implementation | Provider validation | Independent assessment |', '|---|---|---|---|---|---|---|');
  for (const entry of reqs) {
    const rule = rules.get(entry.frrID);
    lines.push(`| ${cellText(entry.frrID)} | ${cellText(rule?.name)} | ${cellText(rule && result.klass ? forceFor(rule, result.klass) : '')} | ${cellText(entry.frrImplementationStatus) || 'not set'} | ${mark(strings(entry.frrImplementation).length)} | ${mark(strings(entry.frrValidation).length)} | ${mark(strings(entry.frrAssessment).length)} |`);
  }
  lines.push('');

  const open = [...reqs.filter(e => e.frrImplementationStatus && e.frrImplementationStatus !== 'Implemented').map(e => [e.frrID, rules.get(e.frrID)?.name, e.frrImplementationStatus]),
    ...inds.filter(e => e.ksiImplementationStatus && e.ksiImplementationStatus !== 'Implemented').map(e => [e.ksiId, ksis.get(e.ksiId)?.name, e.ksiImplementationStatus])];
  lines.push('## Recorded as not fully implemented', '');
  if (open.length) for (const [id, name, status] of open) lines.push(`- ${id} ${cellText(name)}: ${status}`);
  else lines.push('None recorded.');
  lines.push('');

  lines.push('## Gaps in the record', '');
  if (result.errors.length) lines.push(...result.errors.map(e => `- Error: ${e}`));
  if (result.gaps.length) lines.push(...result.gaps.map(g => `- ${g}`));
  if (!result.errors.length && !result.gaps.length) lines.push('None found.');
  lines.push('');
  if (result.notes.length) lines.push('## Notes', '', ...result.notes.map(n => `- ${n}`), '');

  lines.push('## For the assessor\'s overall summary (IVV-IAS-OSA)', '');
  lines.push('FedRAMP supplies no template. The overall summary goes in the Certification Package Overview and should cover the points below. The assessor writes it; nothing here is a finding.', '');
  lines.push(`- What was examined: ${reqs.length} rule(s) and ${inds.length} Key Security Indicator(s) for a 20x Class ${klass} certification, against FedRAMP rules ${doc.rulesVersion || index.version}.`);
  lines.push('- How it was examined: [assessor to describe the verification and validation methods, including any sampling]');
  lines.push(`- Where verification or validation failed: [assessor to complete; the record lists ${open.length} item(s) as not fully implemented]`);
  lines.push('- Areas of dispute between the assessor and the provider: [assessor to complete, or state that there are none]');
  lines.push('- Risks or limits a customer should know about: [assessor to complete]');
  lines.push(`- Entries with no independent assessment statement yet: ${reqs.filter(e => !strings(e.frrAssessment).length).length} rule(s), ${inds.filter(e => !strings(e.ksiAssessment).length).length} KSI(s).`, '');
  return `${lines.join('\n')}\n`;
}

async function main(argv) {
  const { flags, positional } = parseArgs(argv, ['help', 'json', 'class', 'out']);
  const command = positional[0];
  if (flags.help || !command) { process.stdout.write(USAGE); return command || flags.help ? 0 : 2; }
  const index = await loadIndex();

  if (command === 'init') {
    if (!flags.class) throw new UsageError('init needs --class=A, B or C. FedRAMP has not published the 20x Class D rules.');
    const klass = parseClass(flags.class, { allow: ['a', 'b', 'c'] });
    const skeleton = buildSkeleton(index, klass);
    await writeOut(flags.out, `${JSON.stringify(skeleton, null, 2)}\n`);
    process.stderr.write(`Class ${klass.toUpperCase()}: ${skeleton.fedRampRequirements.length} rule(s), ${skeleton.keySecurityIndicators.length} Key Security Indicator(s), rules ${index.version}\n`);
    return 0;
  }

  if (!['check', 'build', 'summary'].includes(command)) throw new UsageError(`Unknown command: ${command}`);
  const doc = await readWorkingFile(positional[1]);
  const result = checkWorkingFile(doc, index);

  if (command === 'check') {
    if (flags.json) process.stdout.write(`${JSON.stringify({ rules_version: index.version, errors: result.errors, gaps: result.gaps, notes: result.notes }, null, 2)}\n`);
    else {
      process.stdout.write(`${result.errors.length} error(s), ${result.gaps.length} gap(s), ${result.notes.length} note(s)\n`);
      for (const [label, list] of [['Error', result.errors], ['Gap', result.gaps], ['Note', result.notes]]) for (const item of list) process.stdout.write(`${label}: ${item}\n`);
      if (!result.errors.length && !result.gaps.length) process.stdout.write('Every listed entry has its statements. That shows the record is filled in, not that the statements are correct.\n');
    }
    return result.errors.length ? 1 : 0;
  }

  if (command === 'build') {
    if (!flags.out || flags.out === true) throw new UsageError('build needs --out=<file>.');
    const blocking = [...result.errors];
    if (!doc.certificationPackageOverviewUri) blocking.push('certificationPackageOverviewUri is required by the schema.');
    if (!doc.metadata?.version || !doc.metadata?.updateSource) blocking.push('metadata.version and metadata.updateSource are required by the schema.');
    if (blocking.length) throw new Error(`Cannot build the record:\n${blocking.map(e => `  - ${e}`).join('\n')}`);
    await writeOut(flags.out, `${JSON.stringify(buildRecord(doc), null, 2)}\n`);
    process.stderr.write(`Shape follows ${SCHEMA_URL}\n`);
    if (result.gaps.length) process.stderr.write(`${result.gaps.length} gap(s) remain; run check. Validate the file at https://www.fedramp.gov/schemas/validator/ before sharing it.\n`);
    return 0;
  }

  await writeOut(flags.out, buildSummary(doc, index, result));
  return 0;
}

if (isMain(import.meta.url)) run(main, USAGE);
