import test from 'node:test';
import assert from 'node:assert/strict';
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
  assert.equal(result.summary.errors, 9);
  assert.equal(result.summary.not_implemented, 6);
  for (const framework of Object.values(result.framework_compliance)) assert.equal(framework.status, 'INDETERMINATE');
});
