import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadFindings, buildReport, renderGithubIssuePreview } from '../plugins/grc-engineer/scripts/gap-assessment.js';

const scf = {
  resolve: async (_fw, id) => [{ scf_id: id, scf_control: { title: id } }],
  expand: async id => new Map([['profile', [id]]]),
  frameworkSummary: async () => ({ framework_controls_mapped: 3 }), version: () => 'test'
};
const doc = (id, status, severity) => ({
  schema_version: '1.0', source: 'test', source_version: '1', run_id: 'run', collected_at: '2026-01-01T00:00:00Z',
  resource: { type: 'resource', id: `${id}-${status}` },
  evaluations: [{ control_framework: 'SCF', control_id: id, status, severity, message: 'test' }]
});

test('loader warnings prevent definitive issue labels and follow drafts to creation', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gap-loader-'));
  try {
    const source = path.join(dir, 'test'); fs.mkdirSync(source);
    const valid = [doc('A', 'fail', 'medium'), doc('A', 'pass', 'critical'), doc('B', 'fail', 'high')];
    const file = path.join(source, 'findings.json');
    const previewFile = path.join(dir, 'preview.json');
    const bin = path.join(dir, 'bin'); fs.mkdirSync(bin);
    const record = path.join(dir, 'record');
    fs.writeFileSync(path.join(bin, 'gh'), '#!/usr/bin/env node\nrequire("fs").writeFileSync(process.env.RECORD, JSON.stringify(process.argv.slice(2)));\n', { mode: 0o755 });
    const run = (...args) => spawnSync(process.execPath, ['plugins/grc-engineer/scripts/create-gap-issue.js', previewFile, 'owner/repo', '0', ...args], { encoding: 'utf8', env: { ...process.env, PATH: bin + path.delimiter + process.env.PATH, RECORD: record } });
    const render = async documents => {
      fs.writeFileSync(file, JSON.stringify(documents));
      const { findings, errors } = await loadFindings(dir, ['test']);
      const report = await buildReport({ runId: 'test', frameworks: ['profile'], sources: ['test'], findings, scf, loadErrors: errors, log: () => {} });
      return renderGithubIssuePreview(report);
    };
    const clean = await render(valid);
    assert.deepEqual(clean.data_quality_warnings, []);
    assert.deepEqual(clean.issues.map(i => [i.scf_id, i.label_severity]), [['A', 'medium'], ['B', 'high']]);
    for (const invalid of [doc('A', 'fail', 'unknown'), doc('A', 'fail', undefined), doc('C', 'fail', 'invalid')]) {
      // The entire invalid document is discarded even when it contains a valid failure.
      invalid.evaluations.push({ control_framework: 'SCF', control_id: 'B', status: 'fail', severity: 'critical', message: 'discarded' });
      const preview = await render([...valid, invalid]);
      assert.equal(preview.data_quality_warnings.length, 1);
      assert.equal(preview.data_quality_warnings[0].kind, 'schema-violation');
      assert.ok(preview.data_quality_warnings[0].violations.some(v => /severity/.test(v)));
      assert.deepEqual(preview.issues.map(i => i.label_severity), [null, null]);
      fs.writeFileSync(previewFile, JSON.stringify(preview));
      const shown = run('--severity-label');
      assert.equal(shown.status, 0, shown.stderr);
      assert.deepEqual(JSON.parse(shown.stdout).labels, []);
      assert.match(JSON.parse(shown.stdout).body, /schema-violation/);
      // Even a contradictory manually modified draft must not get a priority label.
      preview.issues[0].label_severity = 'medium';
      fs.writeFileSync(previewFile, JSON.stringify(preview));
      const created = run('--severity-label', '--create');
      assert.equal(created.status, 0, created.stderr);
      assert.equal(JSON.parse(fs.readFileSync(record, 'utf8')).includes('--label'), false);
    }
    fs.writeFileSync(file, '{bad json');
    const { errors } = await loadFindings(dir, ['test', 'missing']);
    assert.deepEqual(errors.map(e => e.kind), ['invalid-json', 'no-cache']);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
