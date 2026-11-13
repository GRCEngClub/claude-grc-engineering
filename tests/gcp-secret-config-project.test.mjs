import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const script = resolve('plugins/connectors/gcp-secret-metadata/scripts/run.js');
test('configured project is opt-in, validated, and pinned before access', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gcp-project-'));
  try {
    writeFileSync(join(dir, 'gcloud'), `#!/usr/bin/env node
const fs = require('fs'); const args = process.argv.slice(2);
fs.appendFileSync(process.env.LOG, JSON.stringify(args) + '\\n');
if (args[0] === 'config') { console.error('provider-sensitive'); process.stdout.write(process.env.CONFIG); process.exit(Number(process.env.CONFIG_STATUS)); }
console.log(Buffer.from('synthetic-secret').toString('base64url'));
`, { mode: 0o755 });
    const env = { PATH: `${dir}:${process.env.PATH}`, LOG: join(dir, 'log'), CONFIG: 'project-one\n', CONFIG_STATUS: '0' };
    const invoke = (project, overrides = {}, rest = ['sample', 'latest', 'GCP_SECRET_VALUE', '--', process.execPath, '-e', 'process.exit(process.env.GCP_SECRET_VALUE === "synthetic-secret" ? 0 : 1)']) => {
      rmSync(env.LOG, { force: true });
      return spawnSync(process.execPath, [script, project, ...rest], { encoding: 'utf8', env: { ...env, ...overrides } });
    };
    let r = invoke('--configured-project');
    assert.equal(r.status, 0); assert.equal(r.stdout + r.stderr, '');
    let calls = readFileSync(env.LOG, 'utf8').trim().split('\n').map(JSON.parse);
    assert.deepEqual(calls[0], ['config', 'get', 'project', '--quiet']);
    assert.ok(calls[1].includes('--project=project-one'));
    r = invoke('override-project'); assert.equal(r.status, 0);
    calls = readFileSync(env.LOG, 'utf8').trim().split('\n').map(JSON.parse);
    assert.equal(calls.length, 1); assert.ok(calls[0].includes('--project=override-project'));
    for (const overrides of [{ CONFIG: '' }, { CONFIG: '(unset)\n' }, { CONFIG: 'project-one\n\n' }, { CONFIG: 'project-one\nother-project\n' }, { CONFIG: '123456\n' }, { CONFIG: 'project-one\n', CONFIG_STATUS: '1' }]) {
      r = invoke('--configured-project', overrides); assert.equal(r.status, 1); assert.equal(r.stdout, '');
      assert.doesNotMatch(r.stderr, /provider-sensitive|project-one|synthetic-secret/);
      calls = readFileSync(env.LOG, 'utf8').trim().split('\n').map(JSON.parse);
      assert.equal(calls.length, 1);
    }
    r = invoke('--configured-project', {}, ['bad!', 'latest', 'GCP_SECRET_VALUE', '--', process.execPath]);
    assert.equal(r.status, 2); assert.equal(existsSync(env.LOG), false);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('lookup failures suppress provider output and never access secrets or launch the child', { timeout: 30000 }, async (t) => {
  for (const scenario of ['timeout', 'oversize', 'missing executable']) {
    await t.test(scenario, () => {
      const dir = mkdtempSync(join(tmpdir(), 'gcp-lookup-failure-'));
      try {
        const log = join(dir, 'calls');
        const childMarker = join(dir, 'child');
        if (scenario !== 'missing executable') {
          // Absolute interpreter and isolated PATH ensure this mock is the only gcloud.
          writeFileSync(join(dir, 'gcloud'), `#!${process.execPath}
const fs = require('fs');
fs.appendFileSync(process.env.LOG, JSON.stringify(process.argv.slice(2)) + '\\n');
process.stderr.write('provider-stderr-sensitive');
if (process.env.SCENARIO === 'timeout') {
  process.stdout.write('provider-stdout-sensitive');
  setInterval(() => {}, 1000);
} else {
  process.stdout.write('provider-stdout-sensitive' + 'x'.repeat(8192));
}
`, { mode: 0o755 });
        }
        const childCode = `require('fs').writeFileSync(process.env.CHILD_MARKER, 'launched'); console.log('child-sensitive');`;
        const result = spawnSync(process.execPath, [script, '--configured-project', 'sample', 'latest', 'GCP_SECRET_VALUE', '--', process.execPath, '-e', childCode], {
          encoding: 'utf8', timeout: 25000,
          env: { PATH: dir, LOG: log, CHILD_MARKER: childMarker, SCENARIO: scenario },
        });
        assert.equal(result.error, undefined, `helper must finish within test timeout: ${result.error}`);
        assert.equal(result.signal, null);
        assert.equal(result.status, 1);
        assert.equal(result.stdout, '');
        assert.equal(result.stderr, 'Configured project lookup failed or returned an invalid project ID; provider output suppressed.\n');
        assert.equal(existsSync(childMarker), false, 'trusted command must not launch');
        if (scenario === 'missing executable') {
          assert.equal(existsSync(log), false);
        } else {
          const calls = readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse);
          assert.deepEqual(calls, [['config', 'get', 'project', '--quiet']], 'no secret access call');
        }
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  }
});
