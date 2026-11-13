import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const script = resolve('plugins/connectors/vault-kv/scripts/run.js');

test('KV v2 pinned version is sent to Vault and verified before injection', () => {
  const dir = mkdtempSync(join(tmpdir(), 'vault-version-'));
  try {
    const provider = join(dir, 'provider');
    const child = join(dir, 'child');
    writeFileSync(join(dir, 'vault'), `#!/usr/bin/env node\nrequire('fs').writeFileSync(process.env.RECORD, JSON.stringify(process.argv.slice(2))); process.stdout.write(process.env.PAYLOAD); console.error('provider-secret');`, { mode: 0o755 });
    const env = { PATH: `${dir}:${process.env.PATH}`, RECORD: provider, PAYLOAD: JSON.stringify({data:{data:{key:'synthetic-value'},metadata:{version:7}}}) };
    const invoke = (version, pin, overrides = {}) => spawnSync(process.execPath, [script, version, 'secret', 'app/path', 'key', pin, '--', process.execPath, '-e', `require('fs').writeFileSync(${JSON.stringify(child)}, process.env.VAULT_KV_VALUE)`], {env:{...env,...overrides}, encoding:'utf8'});
    const ok = invoke('2', '--version=7');
    assert.equal(ok.status, 0, ok.stderr);
    assert.equal(ok.stdout + ok.stderr, '');
    assert.deepEqual(JSON.parse(readFileSync(provider)), ['kv','get','-format=json','-mount=secret','-version=7','app/path']);
    assert.equal(readFileSync(child, 'utf8'), 'synthetic-value');
    rmSync(child);
    for (const pin of ['1', '2147483647']) {
      const boundary = invoke('2', `--version=${pin}`, {PAYLOAD: JSON.stringify({data:{data:{key:'synthetic-value'},metadata:{version:Number(pin)}}})});
      assert.equal(boundary.status, 0, boundary.stderr);
      assert.equal(readFileSync(child, 'utf8'), 'synthetic-value');
      rmSync(child);
    }
    for (const metadata of [{version:8}, {}, {version:'7'}, {version:7.5}]) {
      const r = invoke('2', '--version=7', {PAYLOAD:JSON.stringify({data:{data:{key:'provider-secret'},metadata}})});
      assert.equal(r.status, 1); assert.doesNotMatch(r.stdout + r.stderr, /provider-secret/); assert.equal(existsSync(child), false);
    }
    // JSON.parse rounds these fractional values to 7; they are not Vault integers.
    for (const token of ['7.0000000000000001', '6.9999999999999999', '7.0', '7e0']) {
      const payload = `{"data":{"data":{"key":"provider-secret"},"metadata":{"version":${token}}}}`;
      const r = invoke('2', '--version=7', {PAYLOAD: payload});
      assert.equal(r.status, 1, `version token ${token}`);
      assert.doesNotMatch(r.stdout + r.stderr, /provider-secret/);
      assert.equal(existsSync(child), false);
    }
    // A matching version in secret data must not validate metadata.
    const decoy = invoke('2', '--version=7', {PAYLOAD: '{"data":{"data":{"key":"provider-secret","version":7},"metadata":{"version":7.0000000000000001}}}'});
    assert.equal(decoy.status, 1); assert.equal(existsSync(child), false);
    // Runtimes without JSON.parse source context must fail closed for pins.
    const shim = join(dir, 'no-source.cjs');
    writeFileSync(shim, `const parse = JSON.parse; JSON.parse = (text, reviver) => parse(text, reviver && function (key, value) { return reviver.call(this, key, value); });`);
    const oldRuntime = invoke('2', '--version=7', {NODE_OPTIONS: `--require=${shim}`});
    assert.equal(oldRuntime.status, 1); assert.equal(existsSync(child), false);
    rmSync(provider);
    for (const [version, pin] of [['1','--version=7'], ['2','--version=0'], ['2','--version=-1'], ['2','--version=01'], ['2','--version=2147483648'], ['2','--version=1x'], ['2','--version=']]) {
      const r = invoke(version, pin);
      assert.equal(r.status, 2, `${version} ${pin}`); assert.equal(existsSync(provider), false); assert.equal(existsSync(child), false);
    }
  } finally { rmSync(dir, {recursive:true, force:true}); }
});
