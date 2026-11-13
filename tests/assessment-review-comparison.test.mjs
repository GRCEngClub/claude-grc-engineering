import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync, writeFileSync, symlinkSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { compareAssessments } from '../scripts/assessment-review-comparison.mjs';

const before = JSON.parse(readFileSync(new URL('./fixtures/assessment-observations/synthetic-context.json', import.meta.url)));
const after = JSON.parse(readFileSync(new URL('./fixtures/assessment-observations/synthetic-comparison-after.json', import.meta.url)));

test('compares supplied changes without interpreting them as closure', () => {
  const result = compareAssessments(before, after);
  assert.deepEqual(result.observations.added, ['observation-2']);
  assert.deepEqual(result.deficiencies.added, ['example-deficiency-2']);
  assert.deepEqual(result.observations.changed, [{ id: 'observation-1', fields: ['evidence_refs', 'test_result'] }]);
  assert.deepEqual(result.deficiencies.changed, [{ id: 'example-deficiency-1', fields: ['owner'] }]);
  assert.deepEqual(result.context_changed, ['corrected_deficiency_refs', 'remaining_deficiency_refs']);
  assert.match(result.notice, /not.*closure/i);
  assert.ok(result.warnings.before.length);
});

test('ignores reference and record ordering but distinguishes missing from empty', () => {
  const a = structuredClone(after), b = structuredClone(after);
  b.observations.reverse(); b.deficiencies.reverse();
  b.observations[0].evidence_refs.reverse();
  assert.deepEqual(compareAssessments(a, b).observations.changed, []);
  delete b.assessment_context.corrected_deficiency_refs;
  assert.deepEqual(compareAssessments(a, b).context_changed, ['corrected_deficiency_refs']);
});

test('rejects invalid inputs and incompatible identities', () => {
  const bad = structuredClone(after); bad.observations[0].deficiency_refs = ['missing'];
  assert.throws(() => compareAssessments(before, bad), /unknown deficiency reference/);
  const other = structuredClone(after); other.assessment_id = 'different';
  assert.throws(() => compareAssessments(before, other), /assessment_id/);
});

test('reports removals, source changes and optional field removal deterministically', () => {
  const modified = structuredClone(after);
  modified.source = 'another synthetic source';
  modified.observations = modified.observations.filter(o => o.id !== 'observation-2');
  modified.deficiencies = modified.deficiencies.filter(d => d.id !== 'example-deficiency-2');
  modified.assessment_context.remaining_deficiency_refs = [];
  delete modified.deficiencies[0].owner;
  const result = compareAssessments(after, modified);
  assert.equal(result.source_changed, true);
  assert.deepEqual(result.observations.removed, ['observation-2']);
  assert.deepEqual(result.deficiencies.removed, ['example-deficiency-2']);
  assert.deepEqual(result.deficiencies.changed, [{ id: 'example-deficiency-1', fields: ['owner'] }]);
  assert.ok(result.warnings.after.length);
});

test('empty inputs remain explicitly unverified and unusual identifiers round-trip', () => {
  const empty = { schema_version: '0.1-proposal', assessment_id: 'id', source: 'source', observations: [], deficiencies: [] };
  const result = compareAssessments(empty, structuredClone(empty));
  assert.deepEqual(result.observations, { added: [], removed: [], changed: [] });
  assert.match(result.warnings.after.join('\n'), /coverage is unknown/);
  assert.match(result.notice, /not.*closure/i);

  const modified = structuredClone(after);
  const id = '=1+1,"quoted"\n<markup>';
  modified.observations[0].id = id;
  const parsed = JSON.parse(JSON.stringify(compareAssessments(after, modified)));
  assert.deepEqual(parsed.observations.added, [id]);
  assert.ok(parsed.observations.removed.includes(after.observations[0].id));
});

test('CLI validates before exclusive output creation and refuses existing paths', () => {
  const dir = mkdtempSync(join(tmpdir(), 'comparison-'));
  try {
    const output = join(dir, 'result.json');
    const run = (a, b, out) => spawnSync(process.execPath, ['scripts/assessment-review-comparison.mjs', a, b, out], { encoding: 'utf8' });
    const first = 'tests/fixtures/assessment-observations/synthetic-context.json';
    const second = 'tests/fixtures/assessment-observations/synthetic-comparison-after.json';
    const previousUmask = process.umask(0);
    try { assert.equal(run(first, second, output).status, 0); }
    finally { process.umask(previousUmask); }
    if (process.platform !== 'win32') assert.equal(statSync(output).mode & 0o777, 0o600);
    const original = readFileSync(output, 'utf8');
    assert.deepEqual(JSON.parse(original).observations.added, ['observation-2']);
    assert.notEqual(run(first, second, output).status, 0);
    assert.equal(readFileSync(output, 'utf8'), original);
    const link = join(dir, 'link'); symlinkSync(join(dir, 'missing'), link);
    assert.notEqual(run(first, second, link).status, 0);
    const invalid = join(dir, 'invalid.json'); writeFileSync(invalid, '{}');
    const absent = join(dir, 'absent.json');
    assert.notEqual(run(first, invalid, absent).status, 0);
    assert.equal(existsSync(absent), false);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
