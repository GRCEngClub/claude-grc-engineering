import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

for (const mode of ['list', 'history']) test(`${mode} verifies numeric project scope without leaking data`, () => {
  const dir = mkdtempSync(join(tmpdir(), 'gcp-scope-'));
  try {
    writeFileSync(join(dir, 'gcloud'), `#!/usr/bin/env node
const fs = require('fs'); const a = process.argv.slice(2);
fs.appendFileSync(process.env.RECORD, JSON.stringify(a)+'\\n');
console.error('private-provider-sentinel');
if (a[0] === 'projects') { if (process.env.DENY) process.exit(1); console.log(process.env.MAPPING); }
else if (a[1] === 'versions') console.log(process.env.VERSIONS);
else console.log(process.env.DATA);
`, { mode: 0o755 });
    const name = 'projects/123456/secrets/sample';
    const record = join(dir, 'args');
    const script = resolve(`plugins/connectors/gcp-secret-metadata/scripts/${mode}.js`);
    const run = (opts = {}) => {
      writeFileSync(record, '');
      const { resource = name, mapping = JSON.stringify({ projectId: 'project-one', projectNumber: '123456', extra: 'mapping-sentinel' }), deny = '', versions, list } = opts;
      const data = mode === 'list' ? (list || [{ name: resource, labels: 'secret-sentinel' }, { name: resource }]) : { name: resource, labels: 'secret-sentinel' };
      const result = spawnSync(process.execPath, [script, 'project-one', ...(mode === 'history' ? ['sample'] : [])], {
        encoding: 'utf8', env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, RECORD: record, DATA: JSON.stringify(data), VERSIONS: JSON.stringify(versions || [{ name: `${resource}/versions/1`, state: 'ENABLED', payload: 'secret-sentinel' }]), MAPPING: mapping, DENY: deny },
      });
      return { ...result, calls: readFileSync(record, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) };
    };
    let r = run();
    assert.equal(r.status, 0); assert.doesNotMatch(r.stdout + r.stderr, /sentinel/);
    assert.equal(r.calls.filter(c => c[0] === 'projects').length, 1);
    assert.deepEqual(r.calls.find(c => c[0] === 'projects'), ['projects', 'describe', 'project-one', '--format=json(projectId,projectNumber)', '--quiet']);
    assert.equal(mode === 'list' ? JSON.parse(r.stdout).secrets[0].name : JSON.parse(r.stdout).name, name);
    r = run({ resource: 'projects/project-one/secrets/sample', deny: '1' });
    assert.equal(r.status, 0); assert.equal(r.calls.some(c => c[0] === 'projects'), false);
    const cases = [
      { deny: '1' }, { mapping: '{private-sentinel' }, { mapping: '{}' },
      { mapping: JSON.stringify({ projectId: 'other-project', projectNumber: '123456' }) },
      { mapping: JSON.stringify({ projectId: 'project-one', projectNumber: '999999' }) },
      { mapping: JSON.stringify({ projectId: 'project-one', projectNumber: 123456 }) },
      { mapping: JSON.stringify({ projectId: 'project-one', projectNumber: '0123456' }) },
      { resource: 'projects/999999/secrets/sample' },
      { resource: 'projects/other-project/secrets/sample' },
      ...(mode === 'list' ? [{ list: [{ name }, { name: 'projects/999999/secrets/sample' }] }] : [{ versions: [{ name: 'projects/999999/secrets/sample/versions/1', state: 'ENABLED' }] }]),
    ];
    for (const opts of cases) {
      r = run(opts); assert.equal(r.status, 1, JSON.stringify(opts)); assert.equal(r.stdout, '');
      assert.doesNotMatch(r.stderr, /sentinel|999999|123456|other-project/);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
