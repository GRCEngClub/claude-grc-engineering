import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const script = resolve('plugins/connectors/gcp-secret-metadata/scripts/run.js');
test('injects only into the trusted child and fails closed', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gcp-inject-'));
  try {
    writeFileSync(join(dir, 'gcloud'), `#!/usr/bin/env node\nrequire('fs').writeFileSync(process.env.ARGS, JSON.stringify(process.argv.slice(2))); if(process.env.HANG) { process.stdout.write('provider-sensitive'); setInterval(()=>{},1000); } else if(process.env.LARGE) { process.stdout.write('x'.repeat(1200000)); } else { console.error('provider-sensitive'); console.log(process.env.RESPONSE); process.exit(Number(process.env.CODE)); }\n`, { mode: 0o755 });
    writeFileSync(join(dir, 'child.cjs'), `require('fs').writeFileSync(process.env.RECORD, process.env.GCP_SECRET_VALUE === 'mock-sensitive' ? 'ok' : 'bad'); console.log(process.env.GCP_SECRET_VALUE); console.error(process.env.GCP_SECRET_VALUE);`);
    const env = { PATH: `${dir}:${process.env.PATH}`, ARGS: join(dir, 'args'), RECORD: join(dir, 'record'), RESPONSE: Buffer.from('mock-sensitive').toString('base64url'), CODE: '0' };
    const args = ['project-one', 'sample_secret', 'latest', 'GCP_SECRET_VALUE', '--', process.execPath, join(dir, 'child.cjs')];
    const run = (a = args, overrides = {}) => spawnSync(process.execPath, [script, ...a], { encoding: 'utf8', env: { ...env, ...overrides }, timeout: 20000 });
    let result = run();
    assert.equal(result.status, 0); assert.equal(result.stdout + result.stderr, '');
    assert.equal(readFileSync(env.RECORD, 'utf8'), 'ok');
    assert.deepEqual(JSON.parse(readFileSync(env.ARGS, 'utf8')), ['secrets', 'versions', 'access', 'latest', '--secret=sample_secret', '--project=project-one', '--format=get(payload.data)', '--quiet']);
    rmSync(env.RECORD); rmSync(env.ARGS);
    for (const variable of ['NODE_OPTIONS', 'LD_PRELOAD', 'PYTHONPATH', 'PATH', 'TOKEN', 'gcp_secret_value', 'GCP_SECRET_VALUE_EXTRA']) {
      result = run([...args.slice(0, 3), variable, ...args.slice(4)]);
      assert.equal(result.status, 2); assert.equal(existsSync(env.ARGS), false); assert.equal(existsSync(env.RECORD), false);
    }
    for (const overrides of [{ CODE: '1' }, { RESPONSE: 'bad!' }, { RESPONSE: Buffer.from([0xff]).toString('base64url') }, { RESPONSE: Buffer.from('bad\0payload').toString('base64url') }, { PATH: '/nonexistent' }, { LARGE: '1' }, { HANG: '1' }]) {
      result = run(args, overrides); assert.equal(result.status, 1); assert.equal(result.stdout, '');
      assert.doesNotMatch(result.stderr, /provider-sensitive|mock-sensitive/); assert.equal(existsSync(env.RECORD), false);
    }
    result = run(['--bad', ...args.slice(1)]); assert.equal(result.status, 2);
    result = run(['project-one', 'sample_secret', '3', 'GCP_SECRET_VALUE', '--', '/nonexistent']); assert.equal(result.status, 1);
    result = run(['project-one', 'sample_secret', '3', 'GCP_SECRET_VALUE', '--', process.execPath, '-e', 'console.log(process.env.GCP_SECRET_VALUE); console.error(process.env.GCP_SECRET_VALUE); process.exit(4)']);
    assert.equal(result.status, 1); assert.doesNotMatch(result.stdout + result.stderr, /mock-sensitive/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
