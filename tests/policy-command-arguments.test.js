import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const cli = resolve('plugins/grc-engineer/scripts/generate-policy.js');

test('CLI honors requested requirement and format, defaults format, and rejects unsupported combinations', () => {
  for (const [args, format, extension, succeeds] of [
    [['All EC2 instances must have encryption enabled'], 'rego', '.rego', true],
    [['Ensure no S3 buckets are public', 'sentinel'], 'sentinel', '.sentinel', true],
    [['Ensure no S3 buckets are public', 'aws-config'], 'aws-config', '.py', true],
    [['All EC2 instances must have encryption enabled', 'sentinel'], 'sentinel', '', false],
    [['S3 public access must be allowed', 'rego'], 'rego', '', false],
  ]) {
    const dir = mkdtempSync(join(tmpdir(), 'policy-command-'));
    try {
      const run = spawnSync(process.execPath, [cli, ...args], { cwd: dir, encoding: 'utf8' });
      if (succeeds) {
        assert.equal(run.status, 0, run.stderr);
        assert.ok(run.stdout.includes(`Requirement: ${args[0]}`));
        assert.ok(run.stdout.includes(`Format: ${format}`));
        assert.ok(readdirSync(dir).some(file => file.endsWith(extension)));
      } else {
        assert.notEqual(run.status, 0);
        assert.match(run.stderr, /no.*template/i);
        assert.deepEqual(readdirSync(dir), []);
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});
