import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { generateReview } from '../scripts/assessment-review-draft.mjs';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/assessment-observations/synthetic.json', import.meta.url)));
const clone = () => structuredClone(fixture);

test('generates traceable draft from the supplied observations and deficiencies', () => {
  const result = generateReview(clone());
  assert.equal(result.traceability[0].control_id, 'AC-1');
  assert.deepEqual(result.traceability[0].evidence_refs, ['example-evidence-1']);
  assert.deepEqual(result.risks[0].observation_ids, ['observation-1']);
  assert.deepEqual(result.risks[0].control_ids, ['AC-1']);
  assert.equal(result.risks[0].risk_rating, undefined);
  assert.ok(result.risks[0].missing_fields.includes('risk_rating'));
  assert.match(result.review.attestation, /NOT PROVIDED/);
});

test('preserves supplied values, flags unlinked items and never drops them', () => {
  const input = clone();
  input.deficiencies[0].risk_rating = 'assessor supplied';
  input.deficiencies.push({ id: 'unlinked', description: 'other weakness' });
  input.observations.push({ id: 'obs-2', control_id: 'UNKNOWN', test_result: 'unknown', evidence_refs: [], deficiency_refs: [] });
  const result = generateReview(input);
  assert.equal(result.risks[0].risk_rating, 'assessor supplied');
  assert.deepEqual(result.risks[1].observation_ids, []);
  assert.equal(result.traceability[1].control_id, 'UNKNOWN');
  assert.ok(result.warnings.some(w => w.includes('unlinked')));
  assert.ok(result.warnings.some(w => w.includes('obs-2')));
});

test('rejects dangling references and duplicate IDs instead of emitting partial results', () => {
  const input = clone();
  input.observations[0].deficiency_refs = ['missing'];
  assert.throws(() => generateReview(input), /unknown deficiency reference/);
  input.observations[0].deficiency_refs = [];
  input.observations.push(structuredClone(input.observations[0]));
  assert.throws(() => generateReview(input), /Duplicate observation ID/);
});

test('CLI emits parseable JSON and fails without output on invalid data', () => {
  const output = execFileSync(process.execPath, ['scripts/assessment-review-draft.mjs', 'tests/fixtures/assessment-observations/synthetic.json'], { encoding: 'utf8' });
  assert.equal(JSON.parse(output).assessment_id, 'synthetic-example');
  const bad = spawnSync(process.execPath, ['scripts/assessment-review-draft.mjs', 'missing-file.json'], { encoding: 'utf8' });
  assert.notEqual(bad.status, 0);
  assert.equal(bad.stdout, '');
});
