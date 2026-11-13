import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const finding = (framework, control, severity, id) => ({
  schema_version: '1.0', source: 'test', source_version: '1', run_id: 'run',
  collected_at: '2026-01-01T00:00:00Z', resource: { type: 'resource', id },
  evaluations: [{ control_framework: framework, control_id: control, status: 'fail', severity, message: `${id} failure` }]
});

test('CLI retains mapped findings but suppresses labels for unmapped critical failures', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gap-unmapped-'));
  try {
    const cache = path.join(dir, 'scf');
    const put = (name, data) => { const file = path.join(cache, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(data)); };
    put('_unknown/api/summary.json', { scf_version: 'test' });
    put('test/api/crosswalks.json', { frameworks: [{ framework_id: 'profile', display_name: 'Profile', framework_controls_mapped: 1 }] });
    put('test/api/crosswalks/profile.json', { framework_to_scf: { mappings: { MAPPED: ['SCF-1'] } }, scf_to_framework: { mappings: { 'SCF-1': ['MAPPED'] } } });
    put('test/api/controls/SCF-1.json', { control_id: 'SCF-1', title: 'Mapped control' });
    const findings = path.join(dir, 'findings', 'test'); fs.mkdirSync(findings, { recursive: true });
    const file = path.join(findings, 'findings.json');
    const report = path.join(dir, 'report');
    const run = docs => {
      fs.writeFileSync(file, JSON.stringify(docs));
      const result = spawnSync(process.execPath, ['plugins/grc-engineer/scripts/gap-assessment.js', 'profile', '--offline', '--quiet', '--output=github-issues', `--cache-dir=${path.dirname(findings)}`, `--report-dir=${report}`], { encoding: 'utf8', env: { ...process.env, CLAUDE_GRC_SCF_CACHE: cache } });
      assert.equal(result.status, 0, result.stderr);
      const preview = JSON.parse(result.stdout);
      assert.deepEqual(JSON.parse(fs.readFileSync(path.join(report, 'gap-report.github-issues.json'), 'utf8')), preview);
      return preview;
    };
    const mapped = finding('profile', 'MAPPED', 'medium', 'retained');
    const clean = run([mapped]);
    assert.deepEqual(clean.data_quality_warnings, []);
    assert.equal(clean.issues[0].label_severity, 'medium');
    for (const [framework, control] of [['profile', 'UNKNOWN'], ['unknown-framework', 'MAPPED']]) {
      const missing = finding(framework, control, 'critical', 'unmapped');
      const preview = run([mapped, missing, missing]);
      assert.equal(preview.data_quality_warnings.length, 1);
      assert.equal(preview.data_quality_warnings[0].kind, 'scf-unmapped');
      assert.ok(preview.data_quality_warnings[0].message.includes(`${framework}:${control}`));
      assert.equal(preview.issues.length, 1);
      assert.deepEqual({ ...preview.issues[0], label_severity: 'medium' }, clean.issues[0]);
      assert.equal(preview.issues[0].label_severity, null);
      const normalized = JSON.parse(fs.readFileSync(path.join(report, 'findings.normalized.json'), 'utf8'));
      assert.deepEqual(normalized.load_errors, preview.data_quality_warnings);
      assert.equal(normalized.tier2[0].failing_resources[0].resource_id, 'retained');
      const draft = spawnSync(process.execPath, ['plugins/grc-engineer/scripts/create-gap-issue.js', path.join(report, 'gap-report.github-issues.json'), 'owner/repo', '0', '--severity-label'], { encoding: 'utf8' });
      assert.equal(draft.status, 0, draft.stderr);
      assert.deepEqual(JSON.parse(draft.stdout).labels, []);
      assert.match(JSON.parse(draft.stdout).body, /scf-unmapped/);
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
