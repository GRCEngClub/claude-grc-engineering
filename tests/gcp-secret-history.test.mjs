import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const script = resolve('plugins/connectors/gcp-secret-metadata/scripts/history.js');
test('collects only validated metadata, never payloads or provider errors', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gcp-history-'));
  try {
    writeFileSync(join(dir, 'gcloud'), `#!/usr/bin/env node\nconst fs=require('fs'); const a=process.argv.slice(2); fs.appendFileSync(process.env.RECORD,JSON.stringify(a)+'\\n'); console.error('provider-sensitive'); if(process.env.FAIL && a[1]==='versions') process.exit(1); console.log(a[1]==='describe'?process.env.SECRET:process.env.VERSIONS);\n`, { mode: 0o755 });
    const name = 'projects/123456/secrets/sample';
    const metadata = { name, createTime: '2025-01-01T00:00:00Z', rotation: { nextRotationTime: '2026-01-01T00:00:00Z', rotationPeriod: '86400s' }, labels: { confidential: 'sentinel' } };
    const versions = [{ name: `${name}/versions/1`, state: 'ENABLED', createTime: '2025-01-01T00:00:00Z', payload: 'sentinel' }, { name: `${name}/versions/2`, state: 'DESTROYED', destroyTime: '2025-02-01T00:00:00Z' }];
    const env = { PATH: `${dir}:${process.env.PATH}`, RECORD: join(dir, 'args'), SECRET: JSON.stringify(metadata), VERSIONS: JSON.stringify(versions) };
    const run = (overrides = {}, args = ['project-one', 'sample']) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', env: { ...env, ...overrides } });
    let r = run();
    assert.equal(r.status, 0); assert.doesNotMatch(r.stdout + r.stderr, /sentinel|provider-sensitive/);
    assert.deepEqual(JSON.parse(r.stdout), { project: 'project-one', name, rotation: metadata.rotation, createTime: metadata.createTime, versions: versions.map(({ payload, ...v }) => v) });
    assert.deepEqual(readFileSync(env.RECORD, 'utf8').trim().split('\n').map(JSON.parse), [
      ['secrets', 'describe', 'sample', '--project=project-one', '--format=json', '--quiet'],
      ['secrets', 'versions', 'list', 'sample', '--project=project-one', '--format=json', '--quiet'],
    ]);
    for (const overrides of [{ FAIL: '1' }, { SECRET: '{bad' }, { VERSIONS: '{}' }, { VERSIONS: JSON.stringify([{ ...versions[0], name: 'projects/999/secrets/other/versions/1' }]) }, { VERSIONS: JSON.stringify([{ ...versions[0], state: 'sentinel' }]) }, { SECRET: JSON.stringify({ ...metadata, rotation: { rotationPeriod: 'sentinel' } }) }, { PATH: '/nonexistent' }]) {
      r = run(overrides); assert.equal(r.status, 1); assert.equal(r.stdout, ''); assert.doesNotMatch(r.stderr, /sentinel|provider-sensitive/);
    }
    r = run({ SECRET: JSON.stringify({ name }), VERSIONS: '[]' });
    assert.deepEqual(JSON.parse(r.stdout), { project: 'project-one', name, rotation: null, versions: [] });
    assert.equal(run({}, ['--bad', 'sample']).status, 2);
    assert.equal(run({}, ['project-one', '--bad']).status, 2);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
