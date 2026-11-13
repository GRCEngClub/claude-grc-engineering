import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const script = path.resolve('plugins/grc-engineer/scripts/create-gap-issue.js');

test('optional severity label is previewed and passed to gh only with create', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gap-severity-'));
  try {
    const file = path.join(dir, 'preview.json');
    const record = path.join(dir, 'record');
    const bin = path.join(dir, 'bin'); fs.mkdirSync(bin);
    fs.writeFileSync(path.join(bin, 'gh'), '#!/usr/bin/env node\nrequire("node:fs").writeFileSync(process.env.RECORD, JSON.stringify(process.argv.slice(2)));\n', { mode: 0o755 });
    const run = (...args) => spawnSync(process.execPath, [script, file, 'owner/repo', '0', ...args], { encoding: 'utf8', env: { ...process.env, PATH: bin + path.delimiter + process.env.PATH, RECORD: record } });
    for (const [tier, severity] of [[1, 'critical'], [1, 'high'], [2, 'medium']]) {
      fs.writeFileSync(file, JSON.stringify({ issues: [{ tier, severity, title: 'x', scf_id: 'x' }] }));
      const preview = run('--severity-label');
      assert.equal(preview.status, 0, preview.stderr);
      assert.deepEqual(JSON.parse(preview.stdout).labels, [`severity:${severity}`]);
      assert.equal(fs.existsSync(record), false);
      const created = run('--severity-label', '--create');
      assert.equal(created.status, 0, created.stderr);
      const args = JSON.parse(fs.readFileSync(record, 'utf8'));
      assert.deepEqual(args.slice(-2), ['--label', `severity:${severity}`]);
      fs.unlinkSync(record);
    }
    for (const [tier, severity] of [[1, 'medium'], [2, 'high'], [1, '--evil'], [2, null]]) {
      fs.writeFileSync(file, JSON.stringify({ issues: [{ tier, severity, title: 'x', scf_id: 'x' }] }));
      const result = run('--create', '--severity-label');
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /severity/i);
      assert.equal(fs.existsSync(record), false);
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
