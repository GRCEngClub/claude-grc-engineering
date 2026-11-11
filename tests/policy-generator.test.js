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
    ['All EC2 instances must have encryption enabled', 'sentinel'],
    ['All EC2 instances must have encryption enabled', 'aws-config'],
  ]) {
    assert.throws(() => generatePolicy(requirement, format), /no.*template/i);
  }
  assert.throws(() => generatePolicy('Ensure no S3 buckets are public', 'terraform'), /unsupported format/i);
  assert.throws(() => generatePolicy('Ensure no S3 buckets are public', 'checkov'), /unsupported format/i);
});

test('existing templates retain their return shape and carry draft warnings', () => {
  for (const [requirement, format] of [
    ['Ensure no S3 buckets are public', 'rego'], ['All EC2 instances must have encryption enabled', 'rego'],
    ['Ensure no S3 buckets are public', 'sentinel'], ['Ensure no S3 buckets are public', 'aws-config'],
  ]) {
    const result = generatePolicy(requirement, format);
    assert.equal(result.requirement, requirement);
    assert.equal(result.format, format);
    assert.match(result.code, /DRAFT.*NOT.*ENFORCE/i);
    assert.match(result.code, /^# DRAFT[^\n]*\n(?:package |import )/);
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


test('contradictory, unrelated, mixed and ambiguous requirements fail closed', () => {
  for (const requirement of [
    'S3 public access must be allowed',
    'Kubernetes tag policy references s3',
    'Ensure no S3 buckets are public but allow public access',
    'Ensure no S3 buckets are public and encrypt EC2 instances',
    'EC2 instances must not have encryption enabled',
    'S3 public', 'EC2 encryption', '', null,
  ]) {
    for (const format of ['rego', 'sentinel', 'aws-config']) {
      assert.throws(() => generatePolicy(requirement, format), /no.*template/i);
    }
  }
  assert.equal(generatePolicy('  ENSURE  no S3 buckets are public  ').metadata.requirement_type, 's3_public');
});

test('CLI rejects misleading requirements without writing files', () => {
  for (const requirement of ['S3 public access must be allowed', 'Kubernetes tag policy references s3']) {
    const dir = mkdtempSync(join(tmpdir(), 'policy-generator-'));
    try {
      const run = spawnSync(process.execPath, [cli, requirement, 'rego'], { cwd: dir, encoding: 'utf8' });
      assert.notEqual(run.status, 0);
      assert.match(run.stderr, /no.*template/i);
      assert.deepEqual(readdirSync(dir), []);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});
