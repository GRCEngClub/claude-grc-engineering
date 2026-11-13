import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('mixed sources make empty coverage visible and suppress CLI issue labels', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gap-empty-'));
  try {
    const cache = path.join(dir, 'scf');
    const put = (file, data) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, data); };
    const json = (file, value) => put(file, JSON.stringify(value));
    json(path.join(cache, '_unknown/api/summary.json'), { scf_version: 'test' });
    json(path.join(cache, 'test/api/crosswalks.json'), { frameworks: [{ framework_id: 'profile', display_name: 'Profile', framework_controls_mapped: 1 }] });
    json(path.join(cache, 'test/api/crosswalks/profile.json'), { framework_to_scf: { mappings: { MAPPED: ['SCF-1'] } }, scf_to_framework: { mappings: { 'SCF-1': ['MAPPED'] } } });
    json(path.join(cache, 'test/api/controls/SCF-1.json'), { control_id: 'SCF-1', title: 'Mapped control' });
    const findings = path.join(dir, 'findings');
    json(path.join(findings, 'valid/findings.json'), [{ schema_version: '1.0', source: 'valid', source_version: '1', run_id: 'run', collected_at: '2026-01-01T00:00:00Z', resource: { type: 'resource', id: 'retained' }, evaluations: [{ control_framework: 'profile', control_id: 'MAPPED', status: 'fail', severity: 'medium', message: 'failure' }] }]);
    const report = path.join(dir, 'report');
    const previewFile = path.join(report, 'gap-report.github-issues.json');
    const run = () => {
      const result = spawnSync(process.execPath, ['plugins/grc-engineer/scripts/gap-assessment.js', 'profile', '--offline', '--quiet', '--output=github-issues', `--cache-dir=${findings}`, `--report-dir=${report}`], { encoding: 'utf8', env: { ...process.env, CLAUDE_GRC_SCF_CACHE: cache } });
      assert.equal(result.status, 0, result.stderr);
      const preview = JSON.parse(result.stdout);
      assert.deepEqual(JSON.parse(fs.readFileSync(previewFile, 'utf8')), preview);
      return preview;
    };
    const clean = run();
    assert.deepEqual(clean.data_quality_warnings, []);
    assert.equal(clean.issues[0].label_severity, 'medium');
    const bin = path.join(dir, 'bin'); fs.mkdirSync(bin);
    const record = path.join(dir, 'record');
    put(path.join(bin, 'gh'), '#!/usr/bin/env node\nconst fs = require("fs"); fs.writeFileSync(process.env.RECORD, JSON.stringify({args: process.argv.slice(2), body: fs.readFileSync(0, "utf8")}));\n');
    fs.chmodSync(path.join(bin, 'gh'), 0o755);
    for (const scenario of ['empty-directory', 'non-json', 'empty-array', 'invalid-json', 'read-error']) {
      const other = path.join(findings, 'other'); fs.mkdirSync(other);
      if (scenario === 'non-json') put(path.join(other, 'notes.txt'), 'not findings');
      if (scenario === 'empty-array') json(path.join(other, 'empty.json'), []);
      if (scenario === 'invalid-json') put(path.join(other, 'bad.json'), '{bad');
      if (scenario === 'read-error') fs.mkdirSync(path.join(other, 'directory.json'));
      const preview = run();
      const kind = scenario === 'invalid-json' ? 'invalid-json' : scenario === 'read-error' ? 'read-error' : 'coverage-unverified';
      assert.equal(preview.data_quality_warnings.length, 1, scenario);
      assert.equal(preview.data_quality_warnings[0].kind, kind, scenario);
      assert.equal(preview.data_quality_warnings[0].source, 'other');
      if (kind === 'coverage-unverified') assert.match(preview.data_quality_warnings[0].message, /coverage cannot be verified/);
      assert.deepEqual({ ...preview.issues[0], label_severity: 'medium' }, clean.issues[0]);
      assert.equal(preview.issues[0].label_severity, null);
      const normalized = JSON.parse(fs.readFileSync(path.join(report, 'findings.normalized.json'), 'utf8'));
      assert.deepEqual(normalized.load_errors, preview.data_quality_warnings);
      for (const create of [false, true]) {
        const args = ['plugins/grc-engineer/scripts/create-gap-issue.js', previewFile, 'owner/repo', '0', '--severity-label'];
        if (create) args.push('--create');
        const result = spawnSync(process.execPath, args, { encoding: 'utf8', env: { ...process.env, PATH: bin + path.delimiter + process.env.PATH, RECORD: record } });
        assert.equal(result.status, 0, result.stderr);
        if (create) {
          const call = JSON.parse(fs.readFileSync(record, 'utf8'));
          assert.equal(call.args.includes('--label'), false);
          assert.ok(call.body.includes(kind));
        } else {
          const draft = JSON.parse(result.stdout);
          assert.deepEqual(draft.labels, []);
          assert.ok(draft.body.includes(kind));
        }
      }
      fs.rmSync(other, { recursive: true, force: true });
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
