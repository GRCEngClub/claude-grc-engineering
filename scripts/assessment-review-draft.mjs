// Experimental review aid; no baseline mapping or risk calculation is implied.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { validateObservations } from './assessment-observations-proposal.mjs';

export function generateReview(data) {
  const validation = validateObservations(data);
  if (!validation.valid) throw new Error(`Invalid assessment input: ${validation.errors.join('; ')}`);
  const warnings = [...validation.warnings];
  const used = new Set(data.observations.flatMap(o => o.deficiency_refs));
  for (const d of data.deficiencies) {
    if (!used.has(d.id)) warnings.push(`Deficiency ${d.id}: not linked to any observation`);
  }
  for (const o of data.observations) {
    if (!o.deficiency_refs.length) warnings.push(`Observation ${o.id}: no deficiency linkage supplied; review if required`);
  }
  return {
    version: '0.1-proposal',
    notice: 'DRAFT REVIEW AID ONLY — not an official assessment, FedRAMP template, attestation, or authorization.',
    assessment_id: data.assessment_id,
    source: data.source,
    warnings,
    traceability: data.observations.map(o => ({
      observation_id: o.id, control_id: o.control_id, test_result: o.test_result,
      evidence_refs: [...o.evidence_refs], deficiency_refs: [...o.deficiency_refs],
    })),
    risks: data.deficiencies.map(d => ({
      ...d,
      observation_ids: data.observations.filter(o => o.deficiency_refs.includes(d.id)).map(o => o.id),
      control_ids: [...new Set(data.observations.filter(o => o.deficiency_refs.includes(d.id)).map(o => o.control_id))],
      missing_fields: ['likelihood', 'impact', 'risk_rating', 'owner', 'remediation', 'due_date'].filter(f => !(f in d)),
    })),
    review: {
      executive_summary: 'NOT PROVIDED — human assessor must prepare and review.',
      assessment_conclusion: 'NOT PROVIDED — human assessor must determine.',
      attestation: 'NOT PROVIDED — reserved for qualified assessor; no signature or recommendation generated.',
    },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length !== 3) throw new Error('Usage: node scripts/assessment-review-draft.mjs <input.json>');
    const input = JSON.parse(readFileSync(process.argv[2], 'utf8'));
    console.log(JSON.stringify(generateReview(input), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
