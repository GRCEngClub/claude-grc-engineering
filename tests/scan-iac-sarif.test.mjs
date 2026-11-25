import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import IaCScanner from '../plugins/grc-engineer/scripts/scan-iac.js';

const SCRIPT = fileURLToPath(new URL('../plugins/grc-engineer/scripts/scan-iac.js', import.meta.url));

function fixtureDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scan-iac-sarif-'));
  fs.writeFileSync(path.join(dir, 'main.tf'), 'resource "aws_s3_bucket" "logs" {\n  bucket = "logs"\n}\n');
  return dir;
}

function runCli(dir, format) {
  return execFileSync(process.execPath, [SCRIPT, dir, 'SOC2', format], {
    cwd: dir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

test('sarif: CLI writes valid SARIF 2.1.0 to stdout with one result per violation', () => {
  const dir = fixtureDir();
  const sarif = JSON.parse(runCli(dir, 'sarif'));

  assert.equal(sarif.version, '2.1.0');
  const [run] = sarif.runs;
  assert.ok(run.results.length > 0);

  const ruleIds = new Set(run.tool.driver.rules.map(r => r.id));
  for (const result of run.results) {
    assert.ok(ruleIds.has(result.ruleId), `rule ${result.ruleId} is declared`);
    assert.ok(['error', 'warning', 'note'].includes(result.level));
    const { artifactLocation, region } = result.locations[0].physicalLocation;
    assert.equal(artifactLocation.uri, 'main.tf');
    assert.ok(region.startLine >= 1);
  }
});

test('json: CLI stdout parses as JSON because progress goes to stderr', () => {
  const dir = fixtureDir();
  const report = JSON.parse(runCli(dir, 'json'));
  assert.equal(typeof report.summary.compliancePercentage, 'number');
  assert.equal(report.filesScanned, 1);
});

test('sarif: severities map to SARIF levels and paths outside the working directory become file URIs', () => {
  const scanner = new IaCScanner('.', ['SOC2'], {});
  const outside = path.join(path.parse(process.cwd()).root, 'elsewhere', 'main.tf');
  const sarif = scanner.toSarif({
    violations: [
      { controlId: 'a', controlName: 'A', frameworks: ['SOC2 CC6.7'], severity: 'CRITICAL', file: outside, line: 0, resource: 'r.a', issue: 'i', remediation: 'fix' },
      { controlId: 'b', controlName: 'B', frameworks: [], severity: 'MEDIUM', file: 'x.tf', line: 4, resource: 'r.b', issue: 'i', remediation: 'fix' },
      { controlId: 'c', controlName: 'C', frameworks: [], severity: 'LOW', file: 'y.tf', line: 2, resource: 'r.c', issue: 'i', remediation: 'fix' },
    ],
  });

  const levels = sarif.runs[0].results.map(r => r.level);
  assert.deepEqual(levels, ['error', 'warning', 'note']);
  const first = sarif.runs[0].results[0].locations[0].physicalLocation;
  assert.match(first.artifactLocation.uri, /^file:\/\//);
  assert.equal(first.region.startLine, 1);
});

test('sarif: different checks under one control get their own rules with matching help and score', () => {
  const dir = fixtureDir();
  const sarif = JSON.parse(runCli(dir, 'sarif'));
  const rules = new Map(sarif.runs[0].tool.driver.rules.map(r => [r.id, r]));

  const versioning = rules.get('data_protection/versioning-missing');
  const publicAccess = rules.get('data_protection/public_access_block-missing');
  assert.ok(versioning && publicAccess, 'versioning and public access are separate rules');
  assert.match(versioning.help.text, /versioning/i);
  assert.match(publicAccess.help.text, /public_access_block/);
  assert.equal(versioning.properties['security-severity'], '5.0');
  assert.equal(publicAccess.properties['security-severity'], '7.5');
});

test('sarif: relative path segments are percent-encoded so # and spaces stay part of the file name', () => {
  const scanner = new IaCScanner('.', ['SOC2'], {});
  const sarif = scanner.toSarif({
    violations: [{ controlId: 'a', check: 'x', controlName: 'A', frameworks: [], severity: 'HIGH', file: path.join('prod #1', '50%.tf'), line: 3, resource: 'r', issue: 'i', remediation: 'fix' }],
  });
  assert.equal(sarif.runs[0].results[0].locations[0].physicalLocation.artifactLocation.uri, 'prod%20%231/50%25.tf');
  assert.equal(sarif.runs[0].results[0].ruleId, 'a/x');
});

test('summary: compliance counts each failed (rule, framework) pair, like the per-framework scores', () => {
  const scanner = new IaCScanner('.', ['SOC2', 'PCI-DSS', 'NIST'], {});
  const totalRules = Object.keys(scanner.rules).length;
  const finding = { controlId: 'encryption_at_rest', frameworks: ['SOC2 CC6.7', 'PCI-DSS 3.4', 'NIST SC-28'], severity: 'HIGH' };
  scanner.violations.push(finding, { ...finding });

  const report = scanner.generateReport();
  assert.equal(report.summary.totalControls, totalRules * 3);
  assert.equal(report.summary.satisfied, totalRules * 3 - 3);
  assert.equal(report.summary.violations, 2);
});
