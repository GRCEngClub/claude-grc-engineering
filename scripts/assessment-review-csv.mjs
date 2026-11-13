// Experimental CSV review aids, not FedRAMP templates or assessment conclusions.
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { generateReview } from './assessment-review-draft.mjs';

const notice = 'DRAFT REVIEW AID ONLY; unverified supplied data; not a FedRAMP artifact or authorization';
const riskFields = ['likelihood', 'impact', 'risk_rating', 'owner', 'remediation', 'due_date'];
const headers = {
  traceability: ['notice', 'assessment_id', 'source', 'observation_id', 'control_id', 'test_result', 'evidence_refs_json', 'deficiency_refs_json'],
  risks: ['notice', 'assessment_id', 'source', 'deficiency_id', 'description', ...riskFields, 'observation_ids_json', 'control_ids_json'],
};

// Spreadsheet applications may interpret imported cells as formulas. Prefix dangerous
// leading characters (including whitespace/control-prefixed formulas) with an apostrophe.
function csvCell(value) {
  let text = String(value);
  if (/^[\s\u0000-\u001f]*[=+\-@]/u.test(text) || /^[\t\r\n]/u.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function generateReviewCsvWithWarnings(input, type) {
  if (!Object.hasOwn(headers, type)) throw new Error('Export type must be traceability or risks');
  const review = generateReview(input); // validates the entire input, including all references
  const problems = [];
  if (!review.traceability.length) problems.push('no observations supplied');
  for (const row of review.traceability) {
    if (!row.evidence_refs.length) problems.push(`Observation ${row.observation_id}: no evidence references supplied`);
    if (!row.deficiency_refs.length) problems.push(`Observation ${row.observation_id}: no deficiency links supplied`);
  }
  if (!review.risks.length) problems.push('no deficiencies supplied');
  for (const row of review.risks) {
    if (!row.observation_ids.length) problems.push(`Deficiency ${row.id}: no observation links supplied`);
    if (type === 'risks' && row.missing_fields.length) problems.push(`Deficiency ${row.id}: missing ${row.missing_fields.join(', ')}`);
  }
  if (problems.length) throw new Error(`Cannot export incomplete review: ${problems.join('; ')}`);
  const common = [notice, review.assessment_id, review.source];
  const rows = type === 'traceability'
    ? review.traceability.map(o => [...common, o.observation_id, o.control_id, o.test_result, JSON.stringify(o.evidence_refs), JSON.stringify(o.deficiency_refs)])
    : review.risks.map(r => [...common, r.id, r.description, ...riskFields.map(f => r[f]), JSON.stringify(r.observation_ids), JSON.stringify(r.control_ids)]);
  const csv = [headers[type], ...rows].map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
  return { csv, warnings: review.warnings };
}

export function generateReviewCsv(input, type) {
  return generateReviewCsvWithWarnings(input, type).csv;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length !== 5) throw new Error('Usage: node scripts/assessment-review-csv.mjs <traceability|risks> <input.json> <new-output.csv>');
    const data = JSON.parse(readFileSync(process.argv[3], 'utf8'));
    const { csv, warnings } = generateReviewCsvWithWarnings(data, process.argv[2]);
    // Exclusive creation prevents overwriting files, including the input or symlinks.
    writeFileSync(process.argv[4], csv, { flag: 'wx', mode: 0o600 });
    for (const warning of warnings) console.error(`Warning: ${warning}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
