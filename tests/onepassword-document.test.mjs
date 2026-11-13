import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const script = resolve('plugins/connectors/onepassword-connector/scripts/document.js');
const vault = 'A'.repeat(26), item = 'b'.repeat(26);
test('document bytes reach only the trusted consumer; failures are closed', () => {
  const dir = mkdtempSync(join(tmpdir(), 'op-document-'));
  try {
    writeFileSync(join(dir, 'op'), `#!${process.execPath}\nconst a=process.argv.slice(2); if(JSON.stringify(a)!==JSON.stringify(['document','get','${item}','--vault','${vault}'])) process.exit(3); process.stderr.write('fake-secret'); if(process.env.FAIL) {process.stdout.write('partial');process.exit(1)} if(process.env.BIG) {process.stdout.write(Buffer.alloc(11*1024*1024));} else process.stdout.write(Buffer.from([0,255,10,42]));`, { mode: 0o755 });
    writeFileSync(join(dir, 'child.cjs'), `const fs=require('fs');const data=fs.readFileSync(0); fs.writeFileSync(process.env.RECORD, JSON.stringify({bytes:[...data],args:process.argv.slice(2),op:process.env.OP_SERVICE_ACCOUNT_TOKEN})); console.log('fake-secret'); console.error('fake-secret');`);
    const record = join(dir, 'record');
    const env = { PATH: `${dir}:${process.env.PATH}`, RECORD: record, OP_SERVICE_ACCOUNT_TOKEN: 'fake-token' };
    const invoke = (extra = {}, argv = [vault, item, '--', process.execPath, join(dir, 'child.cjs'), ';literal']) =>
      spawnSync(process.execPath, [script, ...argv], { encoding: 'utf8', env: { ...env, ...extra } });
    let result = invoke();
    assert.equal(result.status, 0);
    assert.equal(result.stdout + result.stderr, '');
    assert.deepEqual(JSON.parse(readFileSync(record)), { bytes: [0, 255, 10, 42], args: [';literal'] });
    rmSync(record);
    for (const extra of [{ FAIL: '1' }, { BIG: '1' }]) {
      result = invoke(extra);
      assert.equal(result.status, 1);
      assert.equal(existsSync(record), false);
      assert.doesNotMatch(result.stdout + result.stderr, /fake-secret|partial/);
    }
    result = invoke({}, ['--bad', item, '--', process.execPath]);
    assert.equal(result.status, 2);
    result = invoke({}, [vault, item, '--', join(dir, 'missing')]);
    assert.equal(result.status, 1);
    assert.doesNotMatch(result.stderr, /fake-secret/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
