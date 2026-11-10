import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReport } from '../plugins/grc-engineer/scripts/gap-assessment.js';

test('coverage counts distinct mapped items and combines worst observed status', async () => {
  const expansions = { A: ['shared', 'pass'], B: ['shared', 'uncertain'], C: ['shared'] };
  const scf = {
    resolve: async (_framework, id) => [{ scf_id: id, scf_control: { title: id } }],
    expand: async id => new Map([['profile', expansions[id]]]),
    frameworkSummary: async () => ({ framework_id: 'profile', display_name: 'Profile', framework_controls_mapped: 3 }),
    version: () => 'test'
  };
  const findings = [
    { resource: { id: 'a', type: 'test' }, evaluations: [{ control_framework: 'SCF', control_id: 'A', status: 'pass' }] },
    { resource: { id: 'b', type: 'test' }, evaluations: [{ control_framework: 'SCF', control_id: 'B', status: 'inconclusive' }] },
    { resource: { id: 'c', type: 'test' }, evaluations: [{ control_framework: 'SCF', control_id: 'C', status: 'fail', severity: 'high' }] }
  ];
  const report = await buildReport({ runId: 'test', frameworks: ['profile'], sources: [], findings, scf, loadErrors: [], log: () => {} });
  const stats = report.stats[0];
  assert.equal(stats.evaluated, 3);
  assert.equal(stats.coverage_pct, 100);
  assert.equal(stats.passing, 1);
  assert.equal(stats.inconclusive, 1);
  assert.equal(stats.failing, 1);
  assert.equal(stats.failing_high, 1);
  assert.equal(stats.pass_rate_pct, 33);
});
