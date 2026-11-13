import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { buildReport, renderGithubIssuePreview } from '../plugins/grc-engineer/scripts/gap-assessment.js';

test('issue labels use failing evaluations only, without changing report tiers', async () => {
  const scf = {
    resolve: async (_fw, id) => [{ scf_id: id, scf_control: { title: id } }],
    expand: async id => new Map([['profile', [id]]]),
    frameworkSummary: async () => ({ framework_controls_mapped: 3 }), version: () => 'test'
  };
  const findings = [
    ['A', 'pass', 'high'], ['A', 'fail', 'low'],
    ['B', 'inconclusive', 'critical'], ['B', 'fail', 'medium'],
    ['C', 'fail', 'high'], ['C', 'fail', 'critical'],
    ['D', 'inconclusive', 'critical'],
    ['E', 'fail', 'high'], ['E', 'fail', undefined]
  ].map(([id, status, severity], i) => ({ source: 'test', resource: { id: String(i), type: 'test' }, evaluations: [{ control_framework: 'SCF', control_id: id, status, severity, message: 'finding' }] }));
  const report = await buildReport({ runId: 'test', frameworks: ['profile'], sources: [], findings, scf, loadErrors: [], log: () => {} });
  assert.deepEqual(report.tiers.tier1.map(x => [x.scf_id, x.severity]), [['A', 'high'], ['B', 'critical'], ['C', 'critical'], ['E', 'high']]);
  assert.equal(report.tiers.inconclusive[0].scf_id, 'D');
  const preview = renderGithubIssuePreview(report);
  assert.deepEqual(preview.issues.map(x => [x.scf_id, x.label_severity ?? null]), [['A', null], ['B', 'medium'], ['C', 'critical'], ['E', null]]);
  assert.equal(JSON.stringify(report.normalized).includes('label_severity'), false);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gap-aggregation-'));
  try {
    const file = path.join(dir, 'preview.json'); fs.writeFileSync(file, JSON.stringify(preview));
    const bin = path.join(dir, 'bin'); fs.mkdirSync(bin);
    const record = path.join(dir, 'record');
    fs.writeFileSync(path.join(bin, 'gh'), '#!/usr/bin/env node\nrequire("fs").writeFileSync(process.env.RECORD, JSON.stringify(process.argv.slice(2)));\n', { mode: 0o755 });
    const script = path.resolve('plugins/grc-engineer/scripts/create-gap-issue.js');
    const run = (index, ...args) => spawnSync(process.execPath, [script, file, 'owner/repo', String(index), ...args], { encoding: 'utf8', env: { ...process.env, PATH: bin + path.delimiter + process.env.PATH, RECORD: record } });
    for (const [i, labels] of [[0, []], [1, ['severity:medium']], [2, ['severity:critical']], [3, []]]) {
      const p = run(i, '--severity-label'); assert.equal(p.status, 0, p.stderr); assert.deepEqual(JSON.parse(p.stdout).labels, labels);
      const created = run(i, '--severity-label', '--create'); assert.equal(created.status, 0, created.stderr);
      const args = JSON.parse(fs.readFileSync(record, 'utf8'));
      assert.deepEqual(args.includes('--label') ? args.slice(-2) : [], labels.flatMap(label => ['--label', label]));
      assert.deepEqual(JSON.parse(run(i).stdout).labels, []);
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
