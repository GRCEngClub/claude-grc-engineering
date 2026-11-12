import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const script = resolve('plugins/connectors/onepassword-connector/scripts/run.js');
test('passes literal arguments to op and suppresses its output on success and failure', () => {
  const dir = mkdtempSync(join(tmpdir(), 'op-test-'));
  try {
    const record = join(dir, 'args.json');
    writeFileSync(join(dir, 'op'), `#!/usr/bin/env node\nrequire('fs').writeFileSync(process.env.RECORD, JSON.stringify(process.argv.slice(2)));\nconsole.log('sentinel-secret'); console.error('sentinel-secret'); process.exit(Number(process.env.CODE));\n`, { mode: 0o755 });
    for (const code of ['0', '7']) {
      const result = spawnSync(process.execPath, [script, '--', 'collector', 'literal;not-a-shell'], {
        encoding: 'utf8', env: { PATH: `${dir}:${process.env.PATH}`, RECORD: record, CODE: code, TOKEN: 'op://vault/item/field' },
      });
      assert.equal(result.status, code === '0' ? 0 : 1);
      assert.deepEqual(JSON.parse(readFileSync(record)), ['run', '--', 'collector', 'literal;not-a-shell']);
      assert.doesNotMatch(result.stdout + result.stderr, /sentinel-secret/);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
test('rejects missing reference or command, and handles missing provider without leakage', () => {
  const env = { PATH: '/nonexistent' };
  assert.equal(spawnSync(process.execPath, [script, '--', 'cmd'], { env }).status, 2);
  assert.equal(spawnSync(process.execPath, [script], { env }).status, 2);
  const missing = spawnSync(process.execPath, [script, '--', 'cmd'], { encoding: 'utf8', env: { ...env, TOKEN: 'op://v/i/f' } });
  assert.equal(missing.status, 1);
  assert.doesNotMatch(missing.stderr, /op:\/\/v\/i\/f/);
});
