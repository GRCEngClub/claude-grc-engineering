import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { generatePolicy } from '../plugins/grc-engineer/src/policy-generator.js';

const cli = resolve('plugins/grc-engineer/scripts/generate-policy.js');

test('unsupported requirements and format combinations fail rather than return a stub', () => {
  for (const [requirement, format] of [
    ['Kubernetes pods not root', 'rego'],
    ['Kubernetes pods not root', 'sentinel'],
    ['Kubernetes pods not root', 'aws-config'],
    ['EC2 encryption', 'sentinel'],
    ['EC2 encryption', 'aws-config'],
  ]) {
    assert.throws(() => generatePolicy(requirement, format), /no.*template/i);
  }
  assert.throws(() => generatePolicy('S3 public', 'terraform'), /unsupported format/i);
  assert.throws(() => generatePolicy('S3 public', 'checkov'), /unsupported format/i);
});

test('existing templates retain their return shape and carry draft warnings', () => {
  for (const [requirement, format] of [
    ['S3 public', 'rego'], ['EC2 encryption', 'rego'],
    ['S3 public', 'sentinel'], ['S3 public', 'aws-config'],
  ]) {
    const result = generatePolicy(requirement, format);
    assert.equal(result.requirement, requirement);
    assert.equal(result.format, format);
    assert.match(result.code, /DRAFT.*NOT.*ENFORCE/i);
    assert.match(result.documentation, /draft/i);
    assert.ok(result.metadata.generated);
  }
});

test('CLI failures create no policy or documentation files', () => {
  const dir = mkdtempSync(join(tmpdir(), 'policy-generator-'));
  try {
    const run = spawnSync(process.execPath, [cli, 'Kubernetes pods not root', 'sentinel'], { cwd: dir, encoding: 'utf8' });
    assert.notEqual(run.status, 0);
    assert.match(run.stderr, /no.*template/i);
    assert.deepEqual(readdirSync(dir), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
