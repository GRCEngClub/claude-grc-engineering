import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { validateObservations } from '../scripts/assessment-observations-proposal.mjs';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/assessment-observations/synthetic.json', import.meta.url)));
const fresh = () => structuredClone(fixture);

test('accepts synthetic input but reports missing risk and remediation details', () => {
  const result = validateObservations(fresh());
  assert.equal(result.valid, true);
  assert.equal(result.warnings.length, 6);
  assert.ok(result.warnings.some(x => x.includes('missing risk_rating')));
});

test('rejects missing fields, whitespace, invalid date and unknown properties', () => {
  const f = fresh();
  delete f.observations[0].test_result;
  f.source = '  ';
  f.deficiencies[0].due_date = '2026-02-30';
  f.unknown = true;
  const result = validateObservations(f);
  assert.equal(result.valid, false);
  assert.ok(result.errors.length >= 4);
});

test('rejects dangling references and duplicate IDs without silently dropping them', () => {
  const f = fresh();
  f.observations.push(structuredClone(f.observations[0]));
  f.observations[0].deficiency_refs.push('missing');
  f.deficiencies.push(structuredClone(f.deficiencies[0]));
  const result = validateObservations(f);
  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 3);
});

test('empty evidence and observations are explicitly reported', () => {
  const f = fresh();
  f.observations[0].evidence_refs = [];
  assert.ok(validateObservations(f).warnings.some(x => x.includes('no evidence')));
  f.observations = [];
  assert.ok(validateObservations(f).warnings.some(x => x.includes('coverage is unknown')));
});

test('CLI reports invalid input through nonzero exit', () => {
  const result = spawnSync(process.execPath, ['scripts/assessment-observations-proposal.mjs', 'package.json'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).valid, false);
});
