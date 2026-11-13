import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const script = path.resolve('plugins/grc-engineer/scripts/create-gap-issue.js');

test('one explicitly selected draft is previewed and created only by opt-in, without shell execution', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gap-issue-'));
  try {
    const marker = path.join(dir, 'executed');
    const record = path.join(dir, 'record');
    const bin = path.join(dir, 'bin'); fs.mkdirSync(bin);
    fs.writeFileSync(path.join(bin, 'gh'), '#!/usr/bin/env node\nrequire("node:fs").writeFileSync(process.env.RECORD, JSON.stringify({args: process.argv.slice(2), body: require("node:fs").readFileSync(0,"utf8")}));\n', { mode: 0o755 });
    const hostile = `$(touch ${marker})\n\`\`\`\`\n@everyone <script> ' "`;
    const issue = { tier: 1, scf_id: hostile, title: hostile, failing_resources: [{ message: hostile, remediation: { ref: hostile } }] };
    const file = path.join(dir, 'preview.json'); fs.writeFileSync(file, JSON.stringify({ issues: [issue, { ...issue, tier: 2 }] }));
    const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', env: { ...process.env, PATH: bin + path.delimiter + process.env.PATH, RECORD: record } });
    const preview = run(file, 'owner/repo', '0');
    assert.equal(preview.status, 0, preview.stderr);
    assert.equal(fs.existsSync(record), false);
    const payload = JSON.parse(preview.stdout);
    assert.match(payload.notice, /no issue created/i);
    assert.doesNotMatch(payload.body, /@everyone/);
    const match = payload.body.match(/(`+)json\n([\s\S]*)\n\1\n$/);
    assert.ok(match); assert.ok(match[1].length > 4);
    assert.deepEqual(JSON.parse(match[2]), issue);
    for (const args of [[file, 'owner/repo', '0', '--yes'], [file, '-bad/repo', '0', '--create'], [file, 'owner/repo', '2', '--create'], [file, 'owner/repo', '1.0', '--create']]) {
      assert.notEqual(run(...args).status, 0); assert.equal(fs.existsSync(record), false);
    }
    const created = run(file, 'owner/repo', '0', '--create');
    assert.equal(created.status, 0, created.stderr);
    const call = JSON.parse(fs.readFileSync(record, 'utf8'));
    assert.deepEqual(call.args, ['issue', 'create', '--repo', 'github.com/owner/repo', '--title', payload.title, '--body-file', '-']);
    assert.equal(call.body, payload.body);
    assert.equal(fs.existsSync(marker), false);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('rejects malformed and non-tier-1/2 previews before invoking gh', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gap-issue-invalid-'));
  try {
    const file = path.join(dir, 'preview.json');
    for (const content of ['{', '{}', JSON.stringify({ issues: [{ tier: 3, title: 'x', scf_id: 'x' }] })]) {
      fs.writeFileSync(file, content);
      const result = spawnSync(process.execPath, [script, file, 'owner/repo', '0', '--create'], { encoding: 'utf8', env: { ...process.env, PATH: dir } });
      assert.notEqual(result.status, 0);
      assert.doesNotMatch(result.stderr, /gh failed/);
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
