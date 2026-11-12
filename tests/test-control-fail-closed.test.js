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
  assert.equal(tester.results.summary.assessed, 1);
  assert.equal(tester.results.summary.pass_rate, 1);
  assert.equal(tester.calculateFrameworkCompliance().NIST.status, 'INDETERMINATE');
  assert.equal(tester.calculateFrameworkCompliance().NIST.score, 1);
  assert.equal(tester.calculateFrameworkCompliance().NIST.assessed, 1);
  assert.deepEqual(tester.calculateFrameworkCompliance().NIST.issues, ['unknown', 'not implemented']);
});

test('scores include only assessed outcomes and are null without assessments', () => {
  const tester = new ControlTester(id);
  tester.recordTest({ name: 'unknown', status: 'NOT_IMPLEMENTED', frameworks: ['NIST'] });
  tester.recordTest({ name: 'error', status: 'ERROR', frameworks: ['NIST'] });
  tester.calculateSummary();
  assert.equal(tester.results.summary.pass_rate, null);
  assert.equal(tester.calculateFrameworkCompliance().NIST.score, null);
  assert.equal(tester.calculateFrameworkCompliance().NIST.assessed, 0);
  assert.match(tester.generateReport(), /Pass Rate \(assessed only\): N\/A/);
  for (const status of ['PASS', 'FAIL', 'WARNING']) tester.recordTest({ name: status, status, frameworks: ['NIST'] });
  tester.calculateSummary();
  assert.equal(tester.results.summary.assessed, 3);
  assert.equal(tester.results.summary.pass_rate, 1 / 3);
  assert.equal(tester.calculateFrameworkCompliance().NIST.score, 0.33);
  assert.equal(tester.calculateFrameworkCompliance().NIST.status, 'INDETERMINATE');
});

test('unknown control IDs yield structured indeterminate JSON and nonzero exit', () => {
  for (const control of ['nonexistent-control', 'toString', '__proto__']) {
    const cli = spawnSync(process.execPath, ['plugins/grc-engineer/scripts/test-control.js', control, '--output=json'], { encoding: 'utf8' });
    assert.notEqual(cli.status, 0);
    const result = JSON.parse(cli.stdout);
    assert.equal(result.control_id, control);
    assert.equal(result.status, 'INDETERMINATE');
    assert.equal(result.error, `Control not found: ${control}`);
    assert.equal(result.summary.pass_rate, null);
    assert.equal(result.summary.errors, 1);
    assert.equal(result.tests[0].status, 'ERROR');
  }
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
  assert.equal(result.summary.pass_rate, null);
  for (const framework of Object.values(result.framework_compliance)) {
    assert.equal(framework.status, 'INDETERMINATE');
    assert.equal(framework.score, null);
  }
});


test('misleading AWS configurations never pass control checks or CLI', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'control-mock-'));
  try {
    const aws = path.join(dir, 'aws');
    fs.writeFileSync(aws, `#!/bin/sh
case "$*" in
  "cloudtrail describe-trails --output json") printf '%s' '{"trailList":[{"IsMultiRegionTrail":true,"LogFileValidationEnabled":true}]}' ;;
  "iam get-account-summary --output json") printf '%s' '{"SummaryMap":{"AccountMFAEnabled":1,"Users":10,"UsersWithMFA":0}}' ;;
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

test('AWS JSON observations override a non-JSON default output format', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'control-output-'));
  try {
    const aws = path.join(dir, 'aws');
    fs.writeFileSync(aws, `#!/bin/sh
case "$*" in
  "cloudtrail describe-trails --output json") printf '%s' '{"trailList":[{"IsMultiRegionTrail":true}]}' ;;
  "iam get-account-summary --output json") printf '%s' '{"SummaryMap":{"AccountMFAEnabled":1}}' ;;
  *) printf '%s' 'configured text output' ;;
esac
`);
    fs.chmodSync(aws, 0o755);
    const env = { ...process.env, PATH: dir, AWS_DEFAULT_OUTPUT: 'text' };
    assert.equal(spawnSync(aws, ['iam', 'get-account-summary'], { encoding: 'utf8', env }).stdout, 'configured text output');
    const cli = spawnSync(process.execPath, ['plugins/grc-engineer/scripts/test-control.js', id, 'aws', '--output=json'], { encoding: 'utf8', env });
    assert.equal(cli.status, 1);
    const result = JSON.parse(cli.stdout);
    const trail = result.tests.find(t => t.id === 'TEST-006');
    const mfa = result.tests.find(t => t.id === 'TEST-009');
    assert.equal(trail.status, 'NOT_IMPLEMENTED');
    assert.deepEqual(trail.result, { total_trails: 1, multi_region_trails: 1 });
    assert.equal(mfa.status, 'NOT_IMPLEMENTED');
    assert.deepEqual(mfa.result, { root_account_mfa: true });
    assert.equal(result.status, 'INDETERMINATE');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('single-region trail does not establish active logging or event coverage', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'control-mock-'));
  try {
    const aws = path.join(dir, 'aws');
    fs.writeFileSync(aws, `#!/bin/sh
case "$*" in
  "cloudtrail describe-trails --output json") printf '%s' '{"trailList":[{"Name":"regional","IsMultiRegionTrail":false}]}' ;;
  "iam get-account-summary --output json") printf '%s' '{"SummaryMap":{"AccountMFAEnabled":1}}' ;;
  *) exit 2 ;;
esac
`);
    fs.chmodSync(aws, 0o755);
    const cli = spawnSync(process.execPath, ['plugins/grc-engineer/scripts/test-control.js', id, 'aws', '--output=json'], { encoding: 'utf8', env: { ...process.env, PATH: dir } });
    assert.notEqual(cli.status, 0);
    const result = JSON.parse(cli.stdout);
    const trail = result.tests.find(t => t.id === 'TEST-006');
    assert.equal(trail.status, 'NOT_IMPLEMENTED');
    assert.deepEqual(trail.result, { total_trails: 1, multi_region_trails: 0 });
    assert.match(trail.message, /active logging and account management event coverage are not verified/);
    assert.equal(result.status, 'INDETERMINATE');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('disabled root MFA and missing trail do not establish enforcement or coverage', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'control-mock-'));
  try {
    const aws = path.join(dir, 'aws');
    fs.writeFileSync(aws, `#!/bin/sh
case "$*" in
  "cloudtrail describe-trails --output json") printf '%s' '{"trailList":[]}' ;;
  "iam get-account-summary --output json") printf '%s' '{"SummaryMap":{"AccountMFAEnabled":0}}' ;;
  *) exit 2 ;;
esac
`);
    fs.chmodSync(aws, 0o755);
    const cli = spawnSync(process.execPath, ['plugins/grc-engineer/scripts/test-control.js', id, 'aws', '--output=json'], { encoding: 'utf8', env: { ...process.env, PATH: dir } });
    assert.notEqual(cli.status, 0);
    const result = JSON.parse(cli.stdout);
    for (const check of ['TEST-006', 'TEST-009']) assert.equal(result.tests.find(t => t.id === check).status, 'NOT_IMPLEMENTED');
    assert.deepEqual(result.tests.find(t => t.id === 'TEST-006').result, { total_trails: 0, multi_region_trails: 0 });
    assert.equal(result.tests.find(t => t.id === 'TEST-009').result.root_account_mfa, false);
    assert.equal(result.status, 'INDETERMINATE');
    const text = spawnSync(process.execPath, ['plugins/grc-engineer/scripts/test-control.js', id, 'aws'], { encoding: 'utf8', env: { ...process.env, PATH: dir } });
    assert.notEqual(text.status, 0);
    assert.match(text.stdout, /Status: INDETERMINATE/);
    for (const check of ['TEST-006', 'TEST-009']) {
      const observation = result.tests.find(t => t.id === check);
      assert.ok(text.stdout.includes(`[NOT_IMPLEMENTED] ${observation.name}`));
      assert.ok(text.stdout.includes(observation.message));
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('text report includes unknown messages and error details', () => {
  const tester = new ControlTester(id);
  tester.recordTest({ name: 'Unknown check', status: 'NOT_IMPLEMENTED', message: 'Observed condition' });
  tester.recordTest({ name: 'Broken check', status: 'ERROR', message: 'Unable to assess', error: 'access denied' });
  tester.calculateSummary();
  tester.results.status = tester.determineStatus();
  const report = tester.generateReport();
  for (const expected of ['[NOT_IMPLEMENTED] Unknown check', 'Observed condition', '[ERROR] Broken check', 'Unable to assess', 'access denied', 'Status: INDETERMINATE']) assert.ok(report.includes(expected));
});

test('installed plugin example runs outside checkout without dependencies', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'installed plugin '));
  try {
    const plugin = path.join(dir, '.claude', 'plugins', 'cache', 'marketplace', 'grc-engineer', '1.0');
    const project = path.join(dir, 'other project');
    fs.mkdirSync(path.dirname(plugin), { recursive: true });
    fs.cpSync('plugins/grc-engineer', plugin, { recursive: true });
    fs.mkdirSync(project);
    const command = fs.readFileSync(path.join(plugin, 'commands/test-control.md'), 'utf8');
    const invocation = command.match(/```bash\n([^\n]+)\n```/)[1];
    assert.match(invocation, /"\$\{CLAUDE_PLUGIN_ROOT\}\/scripts\/test-control\.js"/);
    const env = { ...process.env, CLAUDE_PLUGIN_ROOT: plugin, PATH: '/nonexistent' };
    const run = args => spawnSync('/bin/sh', ['-c', `"${process.execPath}" ${invocation.slice(5).replace('access_control_account_management aws --output=json', args)}`], { cwd: project, encoding: 'utf8', env });
    const example = run('access_control_account_management aws --output=json');
    assert.equal(example.status, 1, example.stderr);
    assert.equal(JSON.parse(example.stdout).control_id, id);
    const alternate = run('encryption_at_rest azure --output=json');
    assert.equal(alternate.status, 1, alternate.stderr);
    const result = JSON.parse(alternate.stdout);
    assert.equal(result.control_id, 'encryption_at_rest');
    assert.match(result.error, /Unsupported cloud provider: azure/);
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
