import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const script = resolve('plugins/connectors/gcp-secret-metadata/scripts/list.js');
test('lists allowlisted fields using explicit project and suppresses provider errors', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gcp-metadata-'));
  try {
    writeFileSync(join(dir, 'gcloud'), `#!/usr/bin/env node\nrequire('fs').writeFileSync(process.env.RECORD, JSON.stringify(process.argv.slice(2)));\nconsole.error('private-provider-error');\nconsole.log(process.env.RESPONSE); process.exit(Number(process.env.CODE));\n`, { mode: 0o755 });
    const env = { PATH: `${dir}:${process.env.PATH}`, RECORD: join(dir, 'args'), RESPONSE: JSON.stringify([{ name: 'projects/project-one/secrets/foo', labels: { password: 'sentinel' } }]), CODE: '0' };
    const run = (project, overrides = {}) => spawnSync(process.execPath, [script, project], { encoding: 'utf8', env: { ...env, ...overrides } });
    const ok = run('project-one');
    assert.equal(ok.status, 0);
    assert.deepEqual(JSON.parse(ok.stdout), { project: 'project-one', secrets: [{ name: 'projects/project-one/secrets/foo' }] });
    assert.deepEqual(JSON.parse(readFileSync(env.RECORD)), ['secrets', 'list', '--project=project-one', '--format=json', '--quiet']);
    assert.doesNotMatch(ok.stdout + ok.stderr, /sentinel|private-provider-error/);
    for (const project of ['other-project', '123456', '999999']) {
      const failure = run('project-one', { RESPONSE: JSON.stringify([{ name: 'projects/project-one/secrets/foo' }, { name: `projects/${project}/secrets/sample` }]) });
      assert.equal(failure.status, 1); assert.equal(failure.stdout, '');
      assert.doesNotMatch(failure.stderr, /private-provider-error|other-project|123456|999999/);
      if (/^\d+$/.test(project)) assert.match(failure.stderr, /numeric project identifier.*unsupported/);
    }
    for (const overrides of [{ CODE: '1' }, { RESPONSE: '{bad' }, { RESPONSE: '[{"name":"sentinel"}]' }]) {
      const failure = run('project-one', overrides);
      assert.equal(failure.status, 1);
      assert.equal(failure.stdout, '');
      assert.doesNotMatch(failure.stderr, /sentinel|private-provider-error/);
    }
    assert.equal(run('--project=evil').status, 2);
    assert.equal(run('project-one', { PATH: '/nonexistent' }).status, 1);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
