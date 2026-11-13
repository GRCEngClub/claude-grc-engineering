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
      spawnSync(process.execPath, [script, ...argv], { encoding: 'utf8', timeout: 10_000, env: { ...env, ...extra } });
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
    writeFileSync(join(dir, 'fail.cjs'), `process.stdout.write('fake-secret');process.stderr.write('fake-secret');process.exit(7);`);
    result = invoke({}, [vault, item, '--', process.execPath, join(dir, 'fail.cjs')]);
    assert.equal(result.status, 1);
    assert.doesNotMatch(result.stdout + result.stderr, /fake-secret/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('provider and consumer timeouts kill direct processes and suppress output', () => {
  const dir = mkdtempSync(join(tmpdir(), 'op-timeout-'));
  try {
    // Shorten deadlines only in the test, while checking the production values.
    const preload = join(dir, 'preload.cjs');
    writeFileSync(preload, `const cp=require('node:child_process');const orig=cp.spawnSync;cp.spawnSync=(cmd,args,opts)=>{const expected=cmd==='op'?120000:300000;if(opts.timeout!==expected||opts.killSignal!=='SIGKILL')throw Error('incorrect deadline');return orig(cmd,args,{...opts,timeout:300});};require('node:module').syncBuiltinESMExports();`);
    const op = join(dir, 'op');
    writeFileSync(op, `#!${process.execPath}\nif(process.env.HANG_PROVIDER){process.stderr.write('fake-secret');setInterval(()=>{},1000)}else process.stdout.write('synthetic');`, { mode: 0o755 });
    const child = join(dir, 'hang.cjs');
    writeFileSync(child, `process.stderr.write('fake-secret');setInterval(()=>{},1000);`);
    const invoke = (extra, command) => spawnSync(process.execPath, ['--require', preload, script, vault, item, '--', ...command], {
      encoding: 'utf8', timeout: 3000, env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, ...extra },
    });
    for (const [extra, command] of [[{ HANG_PROVIDER: '1' }, [process.execPath, child]], [{}, [process.execPath, child]]]) {
      const result = invoke(extra, command);
      assert.equal(result.status, 1);
      assert.doesNotMatch(result.stdout + result.stderr, /fake-secret/);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
