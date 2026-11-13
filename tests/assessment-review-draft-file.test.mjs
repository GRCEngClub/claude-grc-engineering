import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, symlinkSync, statSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const fixture = 'tests/fixtures/assessment-observations/synthetic.json';
const run = (...args) => spawnSync(process.execPath, ['scripts/assessment-review-draft.mjs', ...args], { encoding: 'utf8' });

test('JSON draft file is exclusively created after validation with restrictive permissions', () => {
  const dir = mkdtempSync(join(tmpdir(), 'assessment-draft-file-'));
  try {
    const output = join(dir, 'draft.json');
    const result = run(fixture, output);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '');
    assert.equal(JSON.parse(readFileSync(output, 'utf8')).assessment_id, 'synthetic-example');
    assert.equal(statSync(output).mode & 0o077, 0);
    const before = readFileSync(output, 'utf8');
    assert.notEqual(run(fixture, output).status, 0);
    assert.equal(readFileSync(output, 'utf8'), before);
    const link = join(dir, 'link.json');
    symlinkSync(output, link);
    assert.notEqual(run(fixture, link).status, 0);
    assert.equal(readFileSync(output, 'utf8'), before);
    const dangling = join(dir, 'dangling.json');
    const missingTarget = join(dir, 'missing-target.json');
    symlinkSync(missingTarget, dangling);
    assert.notEqual(run(fixture, dangling).status, 0);
    assert.throws(() => statSync(missingTarget), { code: 'ENOENT' });
    const invalid = join(dir, 'invalid.json');
    writeFileSync(invalid, '{}');
    const noOutput = join(dir, 'no-output.json');
    const bad = run(invalid, noOutput);
    assert.notEqual(bad.status, 0);
    assert.equal(bad.stdout, '');
    assert.throws(() => statSync(noOutput), { code: 'ENOENT' });
    assert.notEqual(run(fixture, fixture).status, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
