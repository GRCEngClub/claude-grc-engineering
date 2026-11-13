import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { publishEvidence } from '../plugins/connectors/gcp-inspector/scripts/publish-evidence.js';

const payload = { secret: 'metadata' };
async function fixture(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'evidence-publish-'));
  try { await fn(dir, join(dir, 'final.json')); }
  finally { rmSync(dir, { recursive: true, force: true }); }
}

test('publishes complete restrictive evidence and never replaces existing targets', async () => fixture(async (dir, target) => {
  await publishEvidence(target, payload);
  assert.deepEqual(JSON.parse(await fs.readFile(target, 'utf8')), payload);
  assert.equal((await fs.stat(target)).mode & 0o777, 0o600);
  assert.deepEqual(await fs.readdir(dir), ['final.json']);
  await assert.rejects(publishEvidence(target, { other: true }), /publication failed/);
  assert.deepEqual(JSON.parse(await fs.readFile(target, 'utf8')), payload);
  assert.deepEqual(await fs.readdir(dir), ['final.json']);
  await fs.unlink(target);
  await fs.symlink(join(dir, 'missing'), target);
  await assert.rejects(publishEvidence(target, payload), /publication failed/);
  assert.equal((await fs.lstat(target)).isSymbolicLink(), true);
}));

test('injected open, partial write, close, and link failures never publish', async () => {
  for (const failure of ['open', 'write', 'close', 'link']) await fixture(async (dir, target) => {
    let closeCalls = 0;
    const io = {
      ...fs,
      async open(...args) {
        if (failure === 'open') throw new Error('sensitive');
        const f = await fs.open(...args);
        return {
          async writeFile(data) {
            if (failure === 'write') { await f.writeFile(data.slice(0, 4)); throw new Error('sensitive'); }
            await f.writeFile(data);
          },
          async close() { closeCalls++; await f.close(); if (failure === 'close') throw new Error('sensitive'); },
        };
      },
      async link(...args) { if (failure === 'link') throw new Error('sensitive'); await fs.link(...args); },
    };
    await assert.rejects(publishEvidence(target, payload, io), e => e.message === 'Secret Manager evidence publication failed.');
    assert.deepEqual(await fs.readdir(dir), [], failure);
    assert.equal(closeCalls, failure === 'open' ? 0 : 1, failure);
  });
});

test('cleanup failures preserve no-clobber and accurately report published state', async () => {
  for (const failLink of [true, false]) await fixture(async (dir, target) => {
    const io = { ...fs, async link(...args) { if (failLink) throw new Error('link'); await fs.link(...args); }, async unlink() { throw new Error('cleanup'); } };
    if (failLink) await assert.rejects(publishEvidence(target, payload, io));
    else await publishEvidence(target, payload, io);
    const names = await fs.readdir(dir);
    assert.equal(names.filter(n => n.endsWith('.tmp')).length, 1);
    assert.equal(names.includes('final.json'), !failLink);
    if (!failLink) assert.deepEqual(JSON.parse(await fs.readFile(target, 'utf8')), payload);
  });
});

test('process interruption during write leaves only an unpublished temporary file', async () => fixture(async (dir, target) => {
  const modulePath = resolve('plugins/connectors/gcp-inspector/scripts/publish-evidence.js');
  const code = `import * as fs from 'node:fs/promises'; import { publishEvidence } from ${JSON.stringify(new URL(`file://${modulePath}`).href)};
    const io = {...fs, async open(...args) { const f = await fs.open(...args); return { async writeFile(data) { await f.writeFile(data.slice(0, 3)); process.kill(process.pid, 'SIGKILL'); }, close: () => f.close() }; }};
    await publishEvidence(${JSON.stringify(target)}, {secret:'metadata'}, io);`;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', code], { encoding: 'utf8' });
  assert.equal(result.signal, 'SIGKILL', result.stderr);
  const names = await fs.readdir(dir);
  assert.equal(names.length, 1);
  assert.match(names[0], /^\.final\.json\..*\.tmp$/);
  assert.equal((await fs.readFile(join(dir, names[0]), 'utf8')).length, 3);
}));
