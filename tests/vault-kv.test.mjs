import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
const script = resolve('plugins/connectors/vault-kv/scripts/run.js');

test('mock Vault injects exact value, with literal argv and suppressed output', () => {
  const dir = mkdtempSync(join(tmpdir(), 'vault-mock-'));
  try {
    writeFileSync(join(dir, 'vault'), `#!/usr/bin/env node\nrequire('fs').writeFileSync(process.env.RECORD, JSON.stringify(process.argv.slice(2))); process.stdout.write('fake-secret\\n'); console.error('fake-secret');`, {mode: 0o755});
    writeFileSync(join(dir, 'child.cjs'), `require('fs').writeFileSync(process.env.CHILD_RECORD, JSON.stringify([process.env.VAULT_KV_VALUE, process.env.VAULT_TOKEN, process.argv[2]])); console.log(process.env.VAULT_KV_VALUE);`);
    const env = {PATH: `${dir}:${process.env.PATH}`, RECORD: join(dir, 'provider'), CHILD_RECORD: join(dir, 'child'), VAULT_TOKEN: 'fake-token'};
    const r = spawnSync(process.execPath, [script, 'secret', 'app/path', 'key', '--', process.execPath, join(dir, 'child.cjs'), 'literal;no-shell'], {env, encoding:'utf8'});
    assert.equal(r.status, 0); assert.equal(r.stdout + r.stderr, '');
    assert.deepEqual(JSON.parse(readFileSync(env.RECORD)), ['kv', 'get', '-mount=secret', '-field=key', 'app/path']);
    assert.deepEqual(JSON.parse(readFileSync(env.CHILD_RECORD)), ['fake-secret\n', null, 'literal;no-shell']);
  } finally { rmSync(dir, {recursive:true, force:true}); }
});

test('rejects invalid input before provider and suppresses provider failures', () => {
  const dir = mkdtempSync(join(tmpdir(), 'vault-mock-'));
  try {
    const marker = join(dir, 'marker');
    writeFileSync(join(dir, 'vault'), `#!/usr/bin/env node\nrequire('fs').writeFileSync(process.env.MARKER,'called'); process.stdout.write('fake-secret'); console.error('fake-secret'); process.exit(1);`, {mode:0o755});
    const env = {PATH:`${dir}:${process.env.PATH}`, MARKER:marker};
    for (const input of [['../secret','app','key','--','cmd'], ['secret','app','-bad','--','cmd'], ['secret','app','key','--','-bad']]) {
      const r = spawnSync(process.execPath,[script,...input],{env,encoding:'utf8'}); assert.equal(r.status,2); assert.equal(existsSync(marker),false);
    }
    const r = spawnSync(process.execPath,[script,'secret','app','key','--','cmd'],{env,encoding:'utf8'});
    assert.equal(r.status,1); assert.doesNotMatch(r.stdout+r.stderr,/fake-secret/);
  } finally { rmSync(dir,{recursive:true,force:true}); }
});

test('rejects malformed provider payload without launching child', () => {
  const dir = mkdtempSync(join(tmpdir(), 'vault-mock-'));
  try {
    const marker = join(dir,'child');
    writeFileSync(join(dir,'vault'), `#!/usr/bin/env node\nprocess.stdout.write(Buffer.from([255,0]));`,{mode:0o755});
    const r=spawnSync(process.execPath,[script,'secret','app','key','--',process.execPath,'-e',`require('fs').writeFileSync(${JSON.stringify(marker)},'called')`],{env:{PATH:`${dir}:${process.env.PATH}`},encoding:'utf8'});
    assert.equal(r.status,1); assert.equal(existsSync(marker),false);
  } finally { rmSync(dir,{recursive:true,force:true}); }
});
