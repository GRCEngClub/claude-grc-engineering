// Experimental, program-neutral input validation; not an assessment generator.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const schema = JSON.parse(readFileSync(new URL('../schemas/assessment-observations-proposal.schema.json', import.meta.url), 'utf8'));
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validateSchema = ajv.compile(schema);

export function validateObservations(data) {
  if (!validateSchema(data)) {
    return { valid: false, errors: validateSchema.errors.map(e => `${e.instancePath || '/'} ${e.message}`), warnings: [] };
  }
  const errors = [];
  const warnings = [];
  const obsIds = new Set();
  const deficiencyIds = new Set();
  for (const d of data.deficiencies) {
    if (deficiencyIds.has(d.id)) errors.push(`Duplicate deficiency ID: ${d.id}`);
    deficiencyIds.add(d.id);
    for (const field of ['likelihood', 'impact', 'risk_rating', 'owner', 'remediation', 'due_date']) {
      if (!(field in d)) warnings.push(`Deficiency ${d.id}: missing ${field}`);
    }
  }
  for (const o of data.observations) {
    if (obsIds.has(o.id)) errors.push(`Duplicate observation ID: ${o.id}`);
    obsIds.add(o.id);
    if (!o.evidence_refs.length) warnings.push(`Observation ${o.id}: no evidence references supplied`);
    for (const ref of o.deficiency_refs) {
      if (!deficiencyIds.has(ref)) errors.push(`Observation ${o.id}: unknown deficiency reference ${ref}`);
    }
  }
  const context = data.assessment_context ?? {};
  for (const field of ['corrected_deficiency_refs', 'remaining_deficiency_refs']) {
    for (const ref of context[field] ?? []) {
      if (!deficiencyIds.has(ref)) errors.push(`Assessment context ${field}: unknown deficiency reference ${ref}`);
    }
  }
  const corrected = new Set(context.corrected_deficiency_refs ?? []);
  for (const ref of context.remaining_deficiency_refs ?? []) {
    if (corrected.has(ref)) errors.push(`Deficiency ${ref}: classified as both corrected and remaining`);
  }
  if (!data.observations.length) warnings.push('No observations supplied; coverage is unknown');
  return { valid: errors.length === 0, errors, warnings };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length !== 3) throw new Error('Usage: node scripts/assessment-observations-proposal.mjs <input.json>');
    const result = validateObservations(JSON.parse(readFileSync(process.argv[2], 'utf8')));
    console.log(JSON.stringify(result, null, 2));
    if (!result.valid) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
