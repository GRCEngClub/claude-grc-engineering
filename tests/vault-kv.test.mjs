import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
const script = resolve('plugins/connectors/vault-kv/scripts/run.js');

test('KV v1 and v2 preserve exact string and suppress all output', () => {
  const dir = mkdtempSync(join(tmpdir(), 'vault-mock-'));
  try {
    writeFileSync(join(dir, 'vault'), `#!/usr/bin/env node\nrequire('fs').writeFileSync(process.env.RECORD, JSON.stringify(process.argv.slice(2))); process.stdout.write(process.env.PAYLOAD); console.error('provider-secret');`, {mode: 0o755});
    writeFileSync(join(dir, 'child.cjs'), `require('fs').writeFileSync(process.env.CHILD_RECORD, JSON.stringify([process.env.VAULT_KV_VALUE, process.env.VAULT_TOKEN, process.argv[2]])); console.log(process.env.VAULT_KV_VALUE); console.error(process.env.VAULT_KV_VALUE);`);
    for (const version of ['1', '2']) {
      const payload = version === '1' ? {data:{key:'fake-secret\n', data:{key:'wrong'}}} : {data:{data:{key:'fake-secret\n'}, metadata:{version:1}}};
      const env = {PATH: `${dir}:${process.env.PATH}`, RECORD: join(dir, 'provider'), CHILD_RECORD: join(dir, 'child'), VAULT_TOKEN: 'fake-token', PAYLOAD: JSON.stringify(payload)};
      const r = spawnSync(process.execPath, [script, version, 'secret', 'app/path', 'key', '--', process.execPath, join(dir, 'child.cjs'), 'literal;no-shell'], {env, encoding:'utf8'});
      assert.equal(r.status, 0); assert.equal(r.stdout + r.stderr, '');
      assert.deepEqual(JSON.parse(readFileSync(env.RECORD)), ['kv', 'get', '-format=json', '-mount=secret', 'app/path']);
      assert.deepEqual(JSON.parse(readFileSync(env.CHILD_RECORD)), ['fake-secret\n', null, 'literal;no-shell']);
    }
  } finally { rmSync(dir, {recursive:true, force:true}); }
});

test('rejects invalid inputs and all non-string or malformed payloads without output leakage or child launch', () => {
  const dir = mkdtempSync(join(tmpdir(), 'vault-mock-'));
  try {
    const marker = join(dir, 'child');
    writeFileSync(join(dir, 'vault'), `#!/usr/bin/env node\nif (process.env.INVALID_UTF8) process.stdout.write(Buffer.from([255,0])); else process.stdout.write(process.env.PAYLOAD || ''); console.error('provider-secret'); if (process.env.FAIL) process.exit(1);`, {mode:0o755});
    const base = {PATH:`${dir}:${process.env.PATH}`};
    const child = [process.execPath, '-e', `require('fs').writeFileSync(${JSON.stringify(marker)},'called')`];
    for (const input of [['3','secret','app','key','--',...child], ['1','../secret','app','key','--',...child], ['1','secret','app','-bad','--',...child], ['1','secret','app','key','--','-bad']]) {
      const r = spawnSync(process.execPath,[script,...input],{env:base,encoding:'utf8'}); assert.equal(r.status,2); assert.equal(existsSync(marker),false);
    }
    for (const version of ['1', '2']) {
      for (const value of [12, false, null, {}, [], '', 'bad\0secret']) {
        const data = {key:value, other:'provider-secret'};
        const payload = version === '1' ? {data} : {data:{data,metadata:{version:1}}};
        const r = spawnSync(process.execPath,[script,version,'secret','app','key','--',...child],{env:{...base,PAYLOAD:JSON.stringify(payload)},encoding:'utf8'});
        assert.equal(r.status,1); assert.doesNotMatch(r.stdout+r.stderr,/provider-secret|bad/); assert.equal(existsSync(marker),false);
      }
      for (const extra of [{PAYLOAD:'{provider-secret'}, {PAYLOAD:JSON.stringify({data:{other:'provider-secret'}})}, {INVALID_UTF8:'1'}, {FAIL:'1',PAYLOAD:'provider-secret'}]) {
        const r = spawnSync(process.execPath,[script,version,'secret','app','key','--',...child],{env:{...base,...extra},encoding:'utf8'});
        assert.equal(r.status,1); assert.doesNotMatch(r.stdout+r.stderr,/provider-secret/); assert.equal(existsSync(marker),false);
      }
    }
  } finally { rmSync(dir,{recursive:true,force:true}); }
});
