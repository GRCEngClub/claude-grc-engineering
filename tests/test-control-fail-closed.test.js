import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ControlTester from '../plugins/grc-engineer/scripts/test-control.js';

const id = 'access_control_account_management';

test('unimplemented checks never fabricate evidence or findings', async () => {
  const tester = new ControlTester(id);
  for (const name of ['testAccessReviewSchedule', 'testLogRetentionCompliance', 'testSeparationOfDuties', 'testEvidenceAvailability', 'testDocumentation', 'testEndToEndLifecycle']) await tester[name]();
  for (const result of tester.results.tests) {
    assert.equal(result.status, 'NOT_IMPLEMENTED');
    assert.equal(result.result, undefined);
    assert.equal(result.remediation, undefined);
  }
});

test('unknown and errors prevent effective or compliant assessment', () => {
  const tester = new ControlTester(id);
  tester.recordTest({ name: 'working', status: 'PASS', frameworks: ['NIST'] });
  tester.recordTest({ name: 'unknown', status: 'ERROR', frameworks: ['NIST'] });
  tester.recordTest({ name: 'not implemented', status: 'NOT_IMPLEMENTED', frameworks: ['All'] });
  tester.calculateSummary();
  assert.equal(tester.determineStatus(), 'INDETERMINATE');
  assert.equal(tester.calculateFrameworkCompliance().NIST.status, 'INDETERMINATE');
  assert.deepEqual(tester.calculateFrameworkCompliance().NIST.issues, ['unknown', 'not implemented']);
});

test('unsupported provider and CLI fail closed without AWS', async () => {
  const tester = new ControlTester(id, 'azure');
  const results = await tester.runTests();
  assert.equal(results.status, 'INDETERMINATE');
  assert.ok(results.summary.errors > 0);
  const cli = spawnSync(process.execPath, ['plugins/grc-engineer/scripts/test-control.js', id, 'azure', '--output=json'], { encoding: 'utf8' });
  assert.notEqual(cli.status, 0);
});

test('unsupported controls and unexpected execution errors are indeterminate', async () => {
  const tester = new ControlTester('encryption_at_rest');
  const results = await tester.runTests();
  assert.equal(results.status, 'INDETERMINATE');
  assert.ok(results.summary.errors > 0);
  const broken = new ControlTester(id);
  broken.runConfigurationTests = async () => { throw new Error('boom'); };
  const result = await broken.runTests();
  assert.equal(result.status, 'INDETERMINATE');
  assert.equal(result.error, 'boom');
});

test('missing AWS CLI yields errors, no fabricated PASS, and nonzero exit with valid JSON', () => {
  const cli = spawnSync(process.execPath, ['plugins/grc-engineer/scripts/test-control.js', id, '--output=json'], { encoding: 'utf8', env: { ...process.env, PATH: '/nonexistent' } });
  assert.notEqual(cli.status, 0);
  const result = JSON.parse(cli.stdout);
  assert.equal(result.status, 'INDETERMINATE');
  assert.equal(result.summary.passed, 0);
  assert.equal(result.summary.errors, 2);
  assert.equal(result.summary.not_implemented, 13);
  for (const framework of Object.values(result.framework_compliance)) assert.equal(framework.status, 'INDETERMINATE');
});


test('misleading AWS configurations never pass control checks or CLI', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'control-mock-'));
  try {
    const aws = path.join(dir, 'aws');
    fs.writeFileSync(aws, `#!/bin/sh
case "$*" in
  "cloudtrail describe-trails") printf '%s' '{"trailList":[{"IsMultiRegionTrail":true,"LogFileValidationEnabled":true}]}' ;;
  "iam get-account-summary") printf '%s' '{"SummaryMap":{"AccountMFAEnabled":1,"Users":10,"UsersWithMFA":0}}' ;;
  "sso-admin list-instances") printf '%s' '{"Instances":[{}]}' ;;
  *) exit 2 ;;
esac
`);
    fs.chmodSync(aws, 0o755);
    const cli = spawnSync(process.execPath, ['plugins/grc-engineer/scripts/test-control.js', id, 'aws', '--output=json'], { encoding: 'utf8', env: { ...process.env, PATH: dir } });
    assert.notEqual(cli.status, 0);
    const result = JSON.parse(cli.stdout);
    assert.equal(result.status, 'INDETERMINATE');
    for (const check of ['TEST-004', 'TEST-006', 'TEST-009']) {
      assert.equal(result.tests.find(t => t.id === check).status, 'NOT_IMPLEMENTED');
    }
    assert.ok(Object.values(result.framework_compliance).every(f => f.status === 'INDETERMINATE'));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('disabled root MFA and missing trail are failures', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'control-mock-'));
  try {
    const aws = path.join(dir, 'aws');
    fs.writeFileSync(aws, `#!/bin/sh
case "$*" in
  "cloudtrail describe-trails") printf '%s' '{"trailList":[]}' ;;
  "iam get-account-summary") printf '%s' '{"SummaryMap":{"AccountMFAEnabled":0}}' ;;
  *) exit 2 ;;
esac
`);
    fs.chmodSync(aws, 0o755);
    const cli = spawnSync(process.execPath, ['plugins/grc-engineer/scripts/test-control.js', id, 'aws', '--output=json'], { encoding: 'utf8', env: { ...process.env, PATH: dir } });
    assert.notEqual(cli.status, 0);
    const result = JSON.parse(cli.stdout);
    for (const check of ['TEST-006', 'TEST-009']) assert.equal(result.tests.find(t => t.id === check).status, 'FAIL');
    assert.equal(result.status, 'INDETERMINATE');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});


test('command instructions preserve requested arguments rather than hardcode an invocation', () => {
  const command = fs.readFileSync('plugins/grc-engineer/commands/test-control.md', 'utf8');
  assert.match(command, /Use the user's arguments verbatim/);
  assert.match(command, /Do not run the example unless the user requested/);
  const cli = spawnSync(process.execPath, ['plugins/grc-engineer/scripts/test-control.js', 'encryption_at_rest', 'azure', '--output=json'], { encoding: 'utf8' });
  assert.notEqual(cli.status, 0);
  const result = JSON.parse(cli.stdout);
  assert.equal(result.control_id, 'encryption_at_rest');
  assert.match(result.error, /Unsupported cloud provider: azure/);
});
