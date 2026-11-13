import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadFindings, buildReport, renderGithubIssuePreview } from '../plugins/grc-engineer/scripts/gap-assessment.js';

const doc = id => ({ schema_version: '1.0', source: 'test', source_version: '1', run_id: 'run', collected_at: '2026-01-01T00:00:00Z', resource: { type: 'resource', id }, evaluations: [{ control_framework: 'SCF', control_id: id, status: 'fail', severity: 'high', message: 'failure' }] });

test('mixed malformed inputs and SCF failures remain visible through issue creation', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gap-mixed-'));
  try {
    const source = path.join(dir, 'test'); fs.mkdirSync(source);
    const malformed = doc('bad'); malformed.evaluations = [null];
    fs.writeFileSync(path.join(source, 'findings.json'), JSON.stringify([doc('A'), doc('BROKEN'), doc('BROKEN'), null, 42, 'invalid', malformed]));
    const { findings, errors } = await loadFindings(dir, ['test']);
    assert.equal(findings.length, 3);
    assert.equal(errors.length, 4);
    assert.ok(errors.some(e => e.violations.some(v => /evaluations\[0\] must be an object/.test(v))));
    let calls = 0;
    const scf = {
      resolve: async (_fw, id) => { if (id === 'BROKEN') { calls++; throw new Error('crosswalk unavailable'); } return [{ scf_id: id, scf_control: { title: id } }]; },
      expand: async id => new Map([['profile', [id]]]),
      frameworkSummary: async () => ({ framework_controls_mapped: 3 }), version: () => 'test'
    };
    const report = await buildReport({ runId: 'test', frameworks: ['profile'], sources: ['test'], findings, scf, loadErrors: errors, log: () => {} });
    const preview = renderGithubIssuePreview(report);
    assert.equal(calls, 1);
    assert.equal(errors.length, 4);
    assert.equal(preview.data_quality_warnings.length, 5);
    assert.ok(preview.data_quality_warnings.some(w => w.kind === 'scf-resolution-failed' && /SCF:BROKEN.*crosswalk unavailable/.test(w.message)));
    assert.deepEqual(report.summary.load_errors, preview.data_quality_warnings);
    assert.deepEqual(preview.issues.map(i => [i.scf_id, i.label_severity]), [['A', null]]);
    const previewFile = path.join(dir, 'preview.json'); fs.writeFileSync(previewFile, JSON.stringify(preview));
    const bin = path.join(dir, 'bin'); fs.mkdirSync(bin);
    const record = path.join(dir, 'record');
    fs.writeFileSync(path.join(bin, 'gh'), '#!/usr/bin/env node\nconst fs = require("fs"); fs.writeFileSync(process.env.RECORD, JSON.stringify({ args: process.argv.slice(2), body: fs.readFileSync(0, "utf8") }));\n', { mode: 0o755 });
    const result = spawnSync(process.execPath, ['plugins/grc-engineer/scripts/create-gap-issue.js', previewFile, 'owner/repo', '0', '--severity-label', '--create'], { encoding: 'utf8', env: { ...process.env, PATH: bin + path.delimiter + process.env.PATH, RECORD: record } });
    assert.equal(result.status, 0, result.stderr);
    const { args, body } = JSON.parse(fs.readFileSync(record, 'utf8'));
    assert.equal(args.includes('--label'), false);
    assert.match(body, /scf-resolution-failed/);
    assert.match(body, /schema-violation/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('standalone malformed documents and expansion failures produce warnings', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gap-expansion-'));
  try {
    fs.mkdirSync(path.join(dir, 'test'));
    for (const [i, value] of [null, 3, 'bad', true].entries()) fs.writeFileSync(path.join(dir, 'test', `${i}.json`), JSON.stringify(value));
    fs.writeFileSync(path.join(dir, 'test', 'valid.json'), JSON.stringify([doc('A'), doc('B')]));
    const { findings, errors } = await loadFindings(dir, ['test']);
    assert.equal(errors.length, 4);
    const scf = {
      resolve: async (_fw, id) => [{ scf_id: id, scf_control: { title: id } }],
      expand: async id => { if (id === 'B') throw new Error('expansion unavailable'); return new Map([['profile', [id]]]); },
      frameworkSummary: async () => ({ framework_controls_mapped: 2 }), version: () => 'test'
    };
    const report = await buildReport({ runId: 'test', frameworks: ['profile'], sources: ['test'], findings, scf, loadErrors: errors, log: () => {} });
    const preview = renderGithubIssuePreview(report);
    assert.ok(preview.data_quality_warnings.some(w => w.kind === 'scf-expansion-failed' && /B.*expansion unavailable/.test(w.message)));
    assert.deepEqual(preview.issues.map(i => [i.scf_id, i.label_severity]), [['A', null]]);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
