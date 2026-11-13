// Experimental comparison of supplied data, not a remediation determination.
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { generateReview } from './assessment-review-draft.mjs';

function sameValue(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
  }
  return a === b;
}

function changedFields(a, b) {
  return [...new Set([...Object.keys(a), ...Object.keys(b)])]
    .filter(key => key !== 'id' && !sameValue(a[key], b[key])).sort();
}

function compareRecords(before, after) {
  const left = new Map(before.map(record => [record.id, record]));
  const right = new Map(after.map(record => [record.id, record]));
  return {
    added: [...right.keys()].filter(id => !left.has(id)).sort(),
    removed: [...left.keys()].filter(id => !right.has(id)).sort(),
    changed: [...left.keys()].filter(id => right.has(id)).sort()
      .map(id => ({ id, fields: changedFields(left.get(id), right.get(id)) }))
      .filter(record => record.fields.length),
  };
}

export function compareAssessments(before, after) {
  // Reuse validation and review warnings, including missing context and links.
  const beforeReview = generateReview(before);
  const afterReview = generateReview(after);
  if (before.assessment_id !== after.assessment_id) throw new Error('Inputs must have the same assessment_id');
  return {
    version: '0.1-proposal',
    notice: 'DRAFT REVIEW AID ONLY — changes do not establish remediation, closure, assessment, or authorization.',
    assessment_id: before.assessment_id,
    source_changed: before.source !== after.source,
    context_changed: changedFields(before.assessment_context ?? {}, after.assessment_context ?? {}),
    observations: compareRecords(before.observations, after.observations),
    deficiencies: compareRecords(before.deficiencies, after.deficiencies),
    warnings: { before: beforeReview.warnings, after: afterReview.warnings },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length !== 5) throw new Error('Usage: node scripts/assessment-review-comparison.mjs <before.json> <after.json> <new-output.json>');
    const before = JSON.parse(readFileSync(process.argv[2], 'utf8'));
    const after = JSON.parse(readFileSync(process.argv[3], 'utf8'));
    const output = JSON.stringify(compareAssessments(before, after), null, 2) + '\n';
    writeFileSync(process.argv[4], output, { flag: 'wx', mode: 0o600 });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
