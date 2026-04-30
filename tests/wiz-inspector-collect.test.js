import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const collectScript = path.join(repoRoot, 'plugins/connectors/wiz-inspector/scripts/collect.js');
const fixturesRoot = path.join(repoRoot, 'tests/fixtures/wiz-api');

async function writeConfig() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'wiz-inspector-test-'));
  const connectors = path.join(dir, 'connectors');
  await fs.mkdir(connectors, { recursive: true });
  await fs.writeFile(path.join(connectors, 'wiz-inspector.yaml'), [
    'version: 1',
    'source: wiz-inspector',
    'source_version: "0.1.0"',
    'auth_url: "https://auth.app.wiz.io/oauth/token"',
    'api_url: "https://api.us1.app.wiz.io/graphql"',
    'project_id: "project-redacted-1"',
    'defaults:',
    '  limit: 1',
    ''
  ].join('\n'));
  return dir;
}

async function runCollect(fixtureName) {
  const configDir = await writeConfig();
  const home = await fs.mkdtemp(path.join(os.tmpdir(), 'wiz-inspector-home-'));
  const result = spawnSync(process.execPath, [collectScript, '--output=json'], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      HOME: home,
      CLAUDE_GRC_CONFIG_DIR: configDir,
      WIZ_CLIENT_ID: 'redacted-client-id',
      WIZ_CLIENT_SECRET: 'redacted-client-secret',
      WIZ_FIXTURE_DIR: path.join(fixturesRoot, fixtureName)
    }
  });
  const stdout = result.stdout.trim();
  const payload = stdout ? JSON.parse(stdout) : null;
  return { result, payload };
}

test('collect paginates project-scoped Wiz resources and normalizes findings', async () => {
  const { result, payload } = await runCollect('project-success');

  assert.equal(result.status, 0, result.stderr);
  assert.equal(payload.summary.project_id, 'project-redacted-1');
  assert.equal(payload.summary.scope_type, 'project');
  assert.equal(payload.summary.errors, 0);

  const findings = JSON.parse(await fs.readFile(payload.cache_path, 'utf8'));
  const configuration = findings.filter(f => f.resource.type === 'wiz_configuration_finding');
  assert.equal(configuration.length, 2);

  const encrypted = configuration.find(f => f.resource.id === 'cfg-redacted-1');
  assert.equal(encrypted.resource.region, 'us-east-1');
  assert.equal(encrypted.resource.account_id, 'cloud-account-redacted-1');
  assert.equal(encrypted.metadata.project.id, 'project-redacted-1');
  assert.equal(encrypted.evaluations[0].control_id, 'CRY-05');
  assert.equal(encrypted.evaluations[0].status, 'fail');
  assert.equal(encrypted.evaluations[0].severity, 'high');

  const resolved = configuration.find(f => f.resource.id === 'cfg-redacted-2');
  assert.equal(resolved.evaluations[0].status, 'pass');
  assert.equal(resolved.evaluations[0].severity, 'info');

  const vulnerability = findings.find(f => f.resource.type === 'wiz_vulnerability');
  assert.equal(vulnerability.evaluations[0].severity, 'critical');
  assert.equal(vulnerability.metadata.wiz_status, 'OPEN');

  const inventory = findings.find(f => f.resource.type === 'wiz_tenant');
  assert.equal(inventory.metadata.resource_count, 2);
  assert.equal(inventory.metadata.scope_type, 'project');
});

test('collect emits partial inconclusive findings when a Wiz GraphQL query fails', async () => {
  const { result, payload } = await runCollect('query-error');

  assert.equal(result.status, 4, result.stderr);
  assert.equal(payload.summary.errors, 1);

  const findings = JSON.parse(await fs.readFile(payload.cache_path, 'utf8'));
  const failedQuery = findings.find(f => f.raw_attributes?.vulnerabilities === null);
  assert.ok(failedQuery);
  assert.equal(failedQuery.evaluations[0].status, 'inconclusive');
  assert.equal(failedQuery.evaluations[0].control_id, 'VPM-02');
  assert.match(failedQuery.evaluations[0].message, /Field 'vulnerabilities' is not available/);
});
