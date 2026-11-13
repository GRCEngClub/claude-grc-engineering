import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { generateReview } from '../scripts/assessment-review-draft.mjs';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/assessment-observations/synthetic.json', import.meta.url)));
const input = () => structuredClone(fixture);
const context = () => ({
  scope: 'Synthetic scoped service', process: 'Synthetic assessment process',
  procedures: 'Synthetic test procedure', methodology: 'Synthetic methodology',
  corrected_deficiency_refs: [], remaining_deficiency_refs: ['example-deficiency-1'],
});

test('draft carries explicitly supplied assessment context and status links without conclusions', () => {
  const data = input();
  data.assessment_context = context();
  const review = generateReview(data);
  assert.match(review.notice, /DRAFT/);
  assert.deepEqual(review.assessment_context, { ...data.assessment_context, unclassified_deficiency_refs: [] });
  assert.match(review.review.attestation, /NOT PROVIDED/);
  assert.equal(review.risks[0].risk_rating, undefined);
});

test('missing context and unclassified deficiencies remain visible and are not treated as closed', () => {
  const review = generateReview(input());
  assert.equal(review.assessment_context.scope, null);
  assert.deepEqual(review.assessment_context.unclassified_deficiency_refs, ['example-deficiency-1']);
  assert.ok(review.warnings.some(w => w.includes('missing assessment context: scope')));
  assert.ok(review.warnings.some(w => w.includes('not classified as corrected or remaining')));
});

test('rejects unknown, conflicting and duplicate classification references', () => {
  const data = input();
  data.assessment_context = context();
  data.assessment_context.corrected_deficiency_refs = ['unknown'];
  assert.throws(() => generateReview(data), /unknown deficiency reference unknown/);
  data.assessment_context.corrected_deficiency_refs = ['example-deficiency-1'];
  assert.throws(() => generateReview(data), /both corrected and remaining/);
  data.assessment_context.corrected_deficiency_refs = [];
  data.assessment_context.remaining_deficiency_refs = ['example-deficiency-1', 'example-deficiency-1'];
  assert.throws(() => generateReview(data), /duplicate items/);
});

test('rejects blank assessment context scope', () => {
  const data = input();
  data.assessment_context = { ...context(), scope: '   ' };
  assert.throws(() => generateReview(data), /\/assessment_context\/scope must match pattern/);
});

test('rejects unsupported assessment context fields', () => {
  const data = input();
  data.assessment_context = { ...context(), invented: 'value' };
  assert.throws(() => generateReview(data), /\/assessment_context must NOT have additional properties/);
});

test('CLI emits context for synthetic input and no JSON for conflicting references', () => {
  const data = input();
  data.assessment_context = context();
  // Exercise the actual CLI against a synthetic fixture.
  const tmp = new URL('./fixtures/assessment-observations/synthetic-context.json', import.meta.url);
  const ok = spawnSync(process.execPath, ['scripts/assessment-review-draft.mjs', tmp.pathname], { encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stderr);
  assert.equal(JSON.parse(ok.stdout).assessment_context.scope, 'Synthetic scoped service');
  data.assessment_context.corrected_deficiency_refs = ['example-deficiency-1'];
  const dir = mkdtempSync(join(tmpdir(), 'assessment-context-'));
  try {
    const path = join(dir, 'invalid.json');
    writeFileSync(path, JSON.stringify(data));
    const bad = spawnSync(process.execPath, ['scripts/assessment-review-draft.mjs', path], { encoding: 'utf8' });
    assert.notEqual(bad.status, 0);
    assert.equal(bad.stdout, '');
    assert.match(bad.stderr, /both corrected and remaining/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
