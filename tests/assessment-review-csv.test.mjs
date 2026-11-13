import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, symlinkSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { generateReviewCsv, generateReviewCsvWithWarnings } from '../scripts/assessment-review-csv.mjs';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/assessment-observations/synthetic.json', import.meta.url)));
const complete = () => {
  const input = structuredClone(fixture);
  Object.assign(input.deficiencies[0], { likelihood: 'supplied', impact: 'supplied', risk_rating: 'unverified', owner: 'example owner', remediation: 'example plan', due_date: '2027-01-01' });
  return input;
};
// Parse with Python's standard CSV reader to exercise actual interoperability.
function parse(csv) {
  const p = spawnSync('python3', ['-c', 'import csv,io,json,sys; print(json.dumps(list(csv.DictReader(io.StringIO(sys.stdin.read(), newline="")))))'], { input: csv, encoding: 'utf8' });
  assert.equal(p.status, 0, p.stderr);
  return JSON.parse(p.stdout);
}

test('exports trace and risk rows with source links and supplied values', () => {
  const input = complete();
  input.observations[0].test_result = 'a, "quoted"\nresult';
  const trace = parse(generateReviewCsv(input, 'traceability'))[0];
  const risk = parse(generateReviewCsv(input, 'risks'))[0];
  assert.equal(trace.test_result, input.observations[0].test_result);
  assert.deepEqual(JSON.parse(trace.evidence_refs_json), ['example-evidence-1']);
  assert.deepEqual(JSON.parse(trace.deficiency_refs_json), ['example-deficiency-1']);
  assert.deepEqual(JSON.parse(risk.observation_ids_json), ['observation-1']);
  assert.deepEqual(JSON.parse(risk.control_ids_json), ['AC-1']);
  assert.equal(risk.risk_rating, 'unverified');
  assert.equal(risk.assessment_id, input.assessment_id);
  assert.match(risk.notice, /not a FedRAMP artifact/);
});

test('neutralizes formula-leading cells and preserves other values', () => {
  const input = complete();
  input.observations[0].test_result = '  =1+1';
  input.deficiencies[0].owner = '@example';
  assert.equal(parse(generateReviewCsv(input, 'traceability'))[0].test_result, "'  =1+1");
  assert.equal(parse(generateReviewCsv(input, 'risks'))[0].owner, "'@example");
});

test('fails closed for missing risks, links, evidence, duplicate IDs and dangling refs', () => {
  assert.throws(() => generateReviewCsv(structuredClone(fixture), 'risks'), /missing likelihood/);
  for (const mutate of [
    d => { d.observations = []; },
    d => { d.observations[0].evidence_refs = []; },
    d => { d.observations[0].deficiency_refs = []; },
    d => { d.deficiencies.push({ id: 'unlinked', description: 'example' }); },
    d => { d.observations[0].deficiency_refs = ['unknown']; },
    d => { d.observations.push(structuredClone(d.observations[0])); },
  ]) {
    const input = complete(); mutate(input);
    assert.throws(() => generateReviewCsv(input, 'traceability'));
    assert.throws(() => generateReviewCsv(input, 'risks'));
  }
  assert.throws(() => generateReviewCsv(complete(), 'bad'), /Export type/);
});

test('CLI validates before exclusive creation and reports warnings separately', () => {
  const dir = mkdtempSync(join(tmpdir(), 'review-csv-'));
  try {
    const output = join(dir, 'output.csv');
    const args = ['scripts/assessment-review-csv.mjs', 'risks', 'tests/fixtures/assessment-observations/synthetic.json', output];
    const run = () => spawnSync(process.execPath, args, { encoding: 'utf8' });
    let result = run();
    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /missing likelihood/);
    assert.equal(existsSync(output), false);
    writeFileSync(output, 'preserve me');
    result = run();
    assert.notEqual(result.status, 0);
    assert.equal(readFileSync(output, 'utf8'), 'preserve me');
    args[1] = 'traceability';
    result = run();
    assert.notEqual(result.status, 0);
    assert.equal(readFileSync(output, 'utf8'), 'preserve me');
    rmSync(output);
    symlinkSync(join(dir, 'missing-target'), output);
    assert.notEqual(run().status, 0);
    assert.equal(existsSync(join(dir, 'missing-target')), false);
    rmSync(output);
    result = run();
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /missing likelihood/);
    const csv = readFileSync(output, 'utf8');
    assert.equal(parse(csv)[0].control_id, 'AC-1');
    assert.doesNotMatch(csv, /missing likelihood/);
    assert.equal(statSync(output).mode & 0o077, 0);
    const withWarnings = generateReviewCsvWithWarnings(fixture, 'traceability');
    assert.equal(withWarnings.csv, csv);
    assert.ok(withWarnings.warnings.some(w => w.includes('missing likelihood')));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
