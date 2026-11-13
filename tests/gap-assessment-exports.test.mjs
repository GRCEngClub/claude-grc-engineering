import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { renderHtml, renderCsv, renderGithubIssuePreview } from '../plugins/grc-engineer/scripts/gap-assessment.js';

const dangerous = '<script>alert("x")</script>';
const finding = {
  scf_id: '=CMD()', title: '"quoted",\n=1+1', severity: 'high',
  frameworks: { '=EVIL()': ['+formula'] },
  failing_resources: [{ source: dangerous, resource_type: 'bucket', resource_id: '<img src=x onerror=alert(1)>', message: dangerous, remediation: { ref: dangerous, effort_hours: 3 } }]
};
const report = {
  runId: '@run', generated_at: '2026-01-01', scf_version: '1', sources: [dangerous], frameworks: ['=EVIL()'], load_errors: [{ source: dangerous, message: dangerous }],
  stats: [{ framework: dangerous, evaluated: 1, total_controls: 2, coverage_pct: 50, passing: 0, failing: 1, inconclusive: 0 }],
  tiers: { tier1: [finding], tier2: [], tier3: [], inconclusive: [], passes: [] }
};

test('HTML escapes untrusted text everywhere and retains coverage and detail', () => {
  const html = renderHtml(report);
  assert.match(html, /^<!doctype html>/);
  assert.doesNotMatch(html, /<script|<img/i);
  assert.match(html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
  assert.match(html, /<progress max="100" value="50"/);
  assert.match(html, /Remediation:/);
  assert.match(html, /Data quality warnings/);
});

test('CSV is parseable with embedded delimiters and neutralizes formula cells and headers', () => {
  const csv = renderCsv(report);
  const parsed = spawnSync('python3', ['-c', 'import csv,json,sys; print(json.dumps(list(csv.reader(sys.stdin))))'], { input: csv, encoding: 'utf8' });
  assert.equal(parsed.status, 0, parsed.stderr);
  const [header, row] = JSON.parse(parsed.stdout);
  assert.equal(header[5], "'=EVIL()_controls");
  assert.equal(row[0], "'@run");
  assert.equal(row[2], "'=CMD()");
  assert.equal(row[3], '"quoted",\n=1+1');
  assert.equal(row[5], "'+formula");
  assert.equal(row.length, header.length);
  assert.equal(row.at(-1), '3');
});

test('CSV neutralizes whitespace and control-prefixed formulas', () => {
  for (const value of [' =1', '\t+1', '\r-1', '\n@x', '\u0000=1']) {
    const altered = { ...report, tiers: { ...report.tiers, tier1: [{ ...finding, title: value }] } };
    assert.ok(renderCsv(altered).includes('"\'' + value + '"'), JSON.stringify(value));
  }
});

test('GitHub issue preview is data-only and includes only tier 1 and 2 findings', () => {
  const payload = `$(touch /tmp/unsafe); '"\n@everyone`;
  const malicious = { ...finding, title: payload, failing_resources: [{ ...finding.failing_resources[0], message: payload }] };
  const preview = renderGithubIssuePreview({ ...report, tiers: { ...report.tiers, tier1: [malicious], tier2: [finding], tier3: [finding] } });
  assert.match(preview.notice, /no issues have been created/i);
  assert.deepEqual(preview.issues.map(i => i.tier), [1, 2]);
  const parsed = JSON.parse(JSON.stringify(preview));
  assert.equal(parsed.issues[0].title, payload);
  assert.equal(parsed.issues[0].failing_resources[0].message, payload);
  assert.equal(parsed.issues[0].failing_resources[0].remediation.ref, dangerous);
  assert.ok(!('command' in parsed.issues[0]));
});

test('offline CLI previews nonempty hostile tier 1 and 2 data without executing it', async () => {
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const path = await import('node:path');
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'gap-preview-'));
  try {
    const cache = path.join(dir, 'scf');
    const api = path.join(cache, 'test', 'api');
    const findings = path.join(dir, 'findings', 'fixture');
    const bin = path.join(dir, 'bin');
    await Promise.all([fs.mkdir(path.join(cache, '_unknown', 'api'), { recursive: true }), fs.mkdir(path.join(api, 'controls'), { recursive: true }), fs.mkdir(path.join(api, 'crosswalks'), { recursive: true }), fs.mkdir(findings, { recursive: true }), fs.mkdir(bin)]);
    await fs.writeFile(path.join(cache, '_unknown', 'api', 'summary.json'), JSON.stringify({ version: 'test' }));
    await fs.writeFile(path.join(api, 'crosswalks.json'), JSON.stringify({ frameworks: [{ framework_id: 'fixture', framework_controls_mapped: 3 }] }));
    await fs.writeFile(path.join(api, 'crosswalks', 'fixture.json'), JSON.stringify({ mappings: { 'SCF-1': ['F-1'], 'SCF-2': ['F-2'], 'SCF-3': ['F-3'] } }));
    const marker = path.join(dir, 'executed');
    const ghMarker = path.join(dir, 'gh-called');
    const payload = `$(touch '${marker}'); '"\n@everyone <script>alert(1)</script>`;
    await fs.writeFile(path.join(bin, 'gh'), `#!/bin/sh\ntouch '${ghMarker}'\nexit 1\n`, { mode: 0o755 });
    for (const [id, title] of [['SCF-1', payload], ['SCF-2', 'medium finding'], ['SCF-3', 'low finding']]) {
      await fs.writeFile(path.join(api, 'controls', `${id}.json`), JSON.stringify({ control_id: id, title }));
    }
    const docs = ['high', 'medium', 'low'].map((severity, i) => ({
      schema_version: '1.0', source: 'fixture', source_version: '1', run_id: 'fixture-run', collected_at: '2026-01-01T00:00:00Z',
      resource: { type: 'bucket', id: i === 0 ? payload : `resource-${i}` },
      evaluations: [{ control_framework: 'SCF', control_id: `SCF-${i + 1}`, status: 'fail', severity, message: i === 0 ? payload : `${severity} message`, remediation: { ref: payload, effort_hours: 3 } }]
    }));
    await fs.writeFile(path.join(findings, 'findings.json'), JSON.stringify(docs));
    const out = path.join(dir, 'out');
    const result = spawnSync(process.execPath, ['plugins/grc-engineer/scripts/gap-assessment.js', 'fixture', '--offline', '--quiet', '--output=github-issues', '--cache-dir=' + path.dirname(findings), '--report-dir=' + out], { encoding: 'utf8', env: { ...process.env, CLAUDE_GRC_SCF_CACHE: cache, PATH: bin + path.delimiter + process.env.PATH } });
    assert.equal(result.status, 0, result.stderr);
    const output = await fs.readFile(path.join(out, 'gap-report.github-issues.json'), 'utf8');
    assert.equal(output.trimEnd(), result.stdout.trimEnd());
    const preview = JSON.parse(output);
    assert.match(preview.notice, /no issues have been created/i);
    assert.deepEqual(preview.issues.map(({ tier, scf_id }) => [tier, scf_id]), [[1, 'SCF-1'], [2, 'SCF-2']]);
    assert.deepEqual(preview.issues.map(issue => issue.label_severity), ['high', 'medium']);
    assert.equal(preview.issues[0].title, payload);
    assert.equal(preview.issues[0].failing_resources[0].resource_id, payload);
    assert.equal(preview.issues[0].failing_resources[0].message, payload);
    assert.equal(preview.issues[0].failing_resources[0].remediation.ref, payload);
    assert.ok(preview.issues.every(issue => !('command' in issue)));
    await assert.rejects(fs.access(marker), { code: 'ENOENT' });
    await assert.rejects(fs.access(ghMarker), { code: 'ENOENT' });
    const normalized = JSON.parse(await fs.readFile(path.join(out, 'findings.normalized.json'), 'utf8'));
    assert.deepEqual(normalized.load_errors, []);
    assert.equal(normalized.tier3.length, 1);
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('CLI accepts new formats and rejects unknown formats before SCF initialization', () => {
  for (const format of ['html', 'csv']) {
    const result = spawnSync(process.execPath, ['plugins/grc-engineer/scripts/gap-assessment.js', '--output=' + format], { encoding: 'utf8' });
    assert.equal(result.status, 4, result.stderr);
  }
  const invalid = spawnSync(process.execPath, ['plugins/grc-engineer/scripts/gap-assessment.js', '--output=invalid'], { encoding: 'utf8' });
  assert.equal(invalid.status, 2);
});

test('offline CLI writes the correct extension for every supported output', async () => {
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const path = await import('node:path');
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'gap-export-'));
  try {
    const cache = path.join(dir, 'scf');
    await fs.mkdir(path.join(cache, '_unknown', 'api'), { recursive: true });
    await fs.mkdir(path.join(cache, 'test', 'api'), { recursive: true });
    await fs.writeFile(path.join(cache, '_unknown', 'api', 'summary.json'), JSON.stringify({ version: 'test' }));
    await fs.writeFile(path.join(cache, 'test', 'api', 'crosswalks.json'), JSON.stringify({ frameworks: [{ framework_id: 'fixture', framework_controls_mapped: 1 }] }));
    const findings = path.join(dir, 'findings', 'fixture');
    await fs.mkdir(findings, { recursive: true });
    await fs.writeFile(path.join(findings, 'empty.json'), '[]');
    await fs.writeFile(path.join(findings, 'broken.json'), '{');
    await fs.writeFile(path.join(findings, 'invalid.json'), '{}');
    for (const [format, ext] of Object.entries({ markdown: 'md', json: 'json', sarif: 'sarif', 'oscal-ar': 'oscal-ar', html: 'html', csv: 'csv', 'github-issues': 'github-issues.json' })) {
      const out = path.join(dir, format);
      const result = spawnSync(process.execPath, ['plugins/grc-engineer/scripts/gap-assessment.js', 'fixture', '--offline', '--quiet', '--output=' + format, '--cache-dir=' + path.dirname(findings), '--report-dir=' + out], { encoding: 'utf8', env: { ...process.env, CLAUDE_GRC_SCF_CACHE: cache } });
      assert.equal(result.status, 0, result.stderr);
      assert.equal((await fs.readFile(path.join(out, 'gap-report.' + ext), 'utf8')).trimEnd(), result.stdout.trimEnd());
      const normalized = JSON.parse(await fs.readFile(path.join(out, 'findings.normalized.json'), 'utf8'));
      normalized.load_errors.sort((a, b) => a.file.localeCompare(b.file));
      assert.deepEqual(normalized.load_errors.map(({ source, file, kind }) => ({ source, file, kind })), [
        { source: 'fixture', file: 'broken.json', kind: 'invalid-json' },
        { source: 'fixture', file: 'empty.json', kind: 'coverage-unverified' },
        { source: 'fixture', file: 'invalid.json', kind: 'schema-violation' }
      ]);
      assert.ok(normalized.load_errors[0].message);
      assert.match(normalized.load_errors[1].message, /coverage cannot be verified/);
      assert.ok(normalized.load_errors[2].violations.includes('missing schema_version'));
      assert.deepEqual(normalized.inconclusive, []);
      if (format === 'html') assert.match(result.stdout, /broken\.json.*invalid-json/);
      if (format === 'csv') assert.doesNotMatch(result.stdout, /broken\.json|invalid\.json/);
    }
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});
