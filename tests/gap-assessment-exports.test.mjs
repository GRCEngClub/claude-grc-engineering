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
        { source: 'fixture', file: 'invalid.json', kind: 'schema-violation' }
      ]);
      assert.ok(normalized.load_errors[0].message);
      assert.ok(normalized.load_errors[1].violations.includes('missing schema_version'));
      assert.deepEqual(normalized.inconclusive, []);
      if (format === 'html') assert.match(result.stdout, /broken\.json.*invalid-json/);
      if (format === 'csv') assert.doesNotMatch(result.stdout, /broken\.json|invalid\.json/);
    }
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});
