import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const collectScript = path.join(repoRoot, 'plugins/connectors/aws-secrets-inspector/scripts/collect.js');
const fixtureDir = path.join(repoRoot, 'tests/fixtures/aws-api/secretsmanager');
const fakeAwsBinDir = path.join(repoRoot, 'tests/fixtures/aws-api/bin');
const fixedClock = path.join(repoRoot, 'tests/helpers/fixed-date-now.mjs');

async function makeEnv() {
  const configDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aws-secrets-inspector-cfg-'));
  await fs.mkdir(path.join(configDir, 'connectors'), { recursive: true });
  await fs.writeFile(path.join(configDir, 'connectors/aws-secrets-inspector.yaml'),
    'version: 1\n' +
    'source: aws-secrets-inspector\n' +
    'source_version: "0.1.0"\n' +
    'account_id: "123456789012"\n' +
    'default_region: us-east-1\n' +
    'defaults:\n' +
    '  regions:\n' +
    '    - us-east-1\n');
  const home = await fs.mkdtemp(path.join(os.tmpdir(), 'aws-secrets-inspector-home-'));
  return {
    configDir,
    home,
    env: {
      ...process.env,
      HOME: home,
      USERPROFILE: home,
      CLAUDE_GRC_CONFIG_DIR: configDir,
      PATH: `${fakeAwsBinDir}${path.delimiter}${process.env.PATH}`,
      FAKE_AWS_FIXTURE_DIR: fixtureDir,
      FIXED_DATE_NOW: '2026-04-20T08:30:00Z'
    }
  };
}

function runCollect(env, args = []) {
  return spawnSync(process.execPath, ['--import', fixedClock, collectScript, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    env
  });
}

test('inspector mode emits 3 schema-conformant findings with the expected SCF evaluations', async () => {
  const { configDir, env } = await makeEnv();
  const result = runCollect(env, ['--quiet', '--output=json']);

  assert.equal(result.status, 0, `stderr: ${result.stderr}`);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.summary.resources, 3);
  assert.equal(payload.summary.evaluations, 12);
  assert.equal(payload.summary.errors, 0);
  assert.equal(payload.summary.counters.fail, 3);
  assert.equal(payload.summary.counters.inconclusive, 2);
  assert.equal(payload.summary.severities.critical, 1);

  const findings = JSON.parse(await fs.readFile(payload.cache_path, 'utf8'));
  assert.equal(findings.length, 3);
  for (const f of findings) {
    assert.equal(f.source, 'aws-secrets-inspector');
    assert.equal(f.schema_version, '1.0.0');
    assert.equal(f.resource.type, 'aws_secretsmanager_secret');
    assert.equal(f.evaluations.length, 4);
    assert.equal(typeof f.resource.tags, 'object');
    assert.ok(!Array.isArray(f.resource.tags));
  }

  const publicPolicy = findings.find(f => f.resource.id.endsWith('public-thirdparty-api-key-GhIjKl'));
  assert.ok(publicPolicy, 'public-thirdparty-api-key secret not found');
  const iac21 = publicPolicy.evaluations.find(e => e.control_id === 'IAC-21');
  assert.equal(iac21.status, 'fail');
  assert.equal(iac21.severity, 'critical');
  assert.match(iac21.message, /Principal="\*"/);

  const rotationFail = findings.find(f => f.resource.id.endsWith('legacy-db-credentials-AbCdEf'));
  assert.ok(rotationFail, 'legacy-db-credentials secret not found');
  const cry09s = rotationFail.evaluations.filter(e => e.control_id === 'CRY-09');
  assert.equal(cry09s.length, 2);
  assert.ok(cry09s.every(e => e.status === 'fail'));
  assert.ok(cry09s.every(e => e.severity === 'high'));

  const inconclusive = findings.find(f => f.resource.id.endsWith('never-accessed-credential-MnOpQr'));
  assert.ok(inconclusive, 'never-accessed-credential secret not found');
  const iac153 = inconclusive.evaluations.find(e => e.control_id === 'IAC-15.3');
  assert.equal(iac153.status, 'inconclusive');
  const iac21Inc = inconclusive.evaluations.find(e => e.control_id === 'IAC-21');
  assert.equal(iac21Inc.status, 'inconclusive');
});

test('retrieval mode emits value to stdout and never writes the value to runs.log or cache', async () => {
  const { configDir, home, env } = await makeEnv();
  const arn = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:legacy-db-credentials-AbCdEf';

  const insp = runCollect(env, ['--quiet', '--output=json']);
  assert.equal(insp.status, 0);
  const inspCache = JSON.parse(insp.stdout).cache_path;
  const inspFindings = JSON.parse(await fs.readFile(inspCache, 'utf8'));
  const inspFindingCount = inspFindings.length;

  const ret = runCollect(env, ['--retrieve=' + arn, '--quiet']);
  assert.equal(ret.status, 0, `stderr: ${ret.stderr}`);
  assert.match(ret.stderr, /^$|^\[aws-secrets-inspector\] /, `unexpected stderr: ${ret.stderr}`);
  const retValue = JSON.parse(ret.stdout.trim());
  assert.equal(retValue.arn, arn);
  assert.equal(retValue.secret_string, 'fixture-synthetic-redacted-value-not-a-real-secret');

  const runsLog = await fs.readFile(path.join(home, '.cache', 'claude-grc', 'runs.log'), 'utf8');
  const lines = runsLog.trim().split('\n').map(l => JSON.parse(l));
  const retEntry = lines.find(l => l.mode === 'retrieve');
  assert.ok(retEntry, 'no retrieve manifest in runs.log');
  assert.equal(retEntry.exit_code, 0);
  const expectedPayload = JSON.stringify(retValue) + '\n';
  assert.equal(retEntry.byte_size, Buffer.byteLength(expectedPayload, 'utf8'));
  const stdoutLine = ret.stdout;
  const stdoutSha = crypto.createHash('sha256').update(stdoutLine).digest('hex');
  assert.equal(retEntry.sha256, stdoutSha, 'manifest sha256 must match sha256 of the stdout payload');
  assert.match(retEntry.sha256, /^[a-f0-9]{64}$/);
  assert.equal(retEntry.destination, 'stdout');
  assert.equal(typeof retEntry.sha256, 'string');
  for (const forbidden of ['secret_string', 'secret_binary', 'value', 'secret_value', 'data']) {
    assert.equal(retEntry[forbidden], undefined, `runs.log retrieve entry must not contain '${forbidden}'`);
  }

  const afterCache = JSON.parse(await fs.readFile(inspCache, 'utf8'));
  assert.equal(afterCache.length, inspFindingCount);

  // File mode bits check is POSIX-only; on Windows the chmod is a no-op
  // and the platform enforces ACLs instead. Skip the check there.
  if (process.platform !== 'win32') {
    const stat = await fs.stat(inspCache);
    assert.ok((stat.mode & 0o077) === 0, `cache file has world-readable mode: ${(stat.mode & 0o777).toString(8)}`);
  }
});

test('retrieval mode rejects --write-to paths outside the secrets dir', async () => {
  const { configDir, env } = await makeEnv();
  const arn = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:legacy-db-credentials-AbCdEf';

  const escape = runCollect(env, ['--retrieve=' + arn, '--write-to=/etc/cron.d/evil', '--quiet']);
  assert.equal(escape.status, 2, `expected exit 2, got ${escape.status}; stderr: ${escape.stderr}`);
  assert.match(escape.stderr, /outside the permitted destination root/);

  const traverse = runCollect(env, [
    '--retrieve=' + arn,
    '--write-to=' + path.join(configDir, 'connectors', '..', 'evil'),
    '--quiet'
  ]);
  assert.equal(traverse.status, 2, `expected exit 2 for traversal, got ${traverse.status}; stderr: ${traverse.stderr}`);
  assert.match(traverse.stderr, /outside the permitted destination root/);
});

test('retrieval mode reasserts restrictive permissions on a wide secrets dir', async () => {
  if (process.platform === 'win32') return; // chmod is a no-op on Windows

  const { configDir, env } = await makeEnv();
  const secretsDir = path.join(configDir, 'secrets');
  await fs.mkdir(secretsDir, { recursive: true, mode: 0o700 });
  await fs.chmod(secretsDir, 0o755);
  const target = path.join(secretsDir, 'leak.json');
  const arn = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:legacy-db-credentials-AbCdEf';

  const ret = runCollect(env, ['--retrieve=' + arn, '--write-to=' + target, '--quiet']);
  assert.equal(ret.status, 0, `stderr: ${ret.stderr}`);
  const dirStat = await fs.stat(secretsDir);
  const fileStat = await fs.stat(target);
  assert.equal((dirStat.mode & 0o777), 0o700, `expected restored 0700, got ${(dirStat.mode & 0o777).toString(8)}`);
  assert.equal((fileStat.mode & 0o777), 0o600, `expected 0600, got ${(fileStat.mode & 0o777).toString(8)}`);
});

test('retrieval mode rejects --regions with more than one entry', async () => {
  const { env } = await makeEnv();
  const arn = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:legacy-db-credentials-AbCdEf';

  const ret = runCollect(env, ['--retrieve=' + arn, '--regions=us-east-1,eu-west-1', '--quiet']);
  assert.equal(ret.status, 2, `expected exit 2 for multi-region, got ${ret.status}; stderr: ${ret.stderr}`);
  assert.match(ret.stderr, /does not accept --regions with multiple entries/);
});

test('retrieval mode writes the value to a 0600 file inside the secrets dir', async () => {
  if (process.platform === 'win32') return; // chmod is a no-op on Windows

  const { configDir, home, env } = await makeEnv();
  const secretsDir = path.join(configDir, 'secrets');
  const target = path.join(secretsDir, 'legacy-db.json');
  const arn = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:legacy-db-credentials-AbCdEf';

  const ret = runCollect(env, ['--retrieve=' + arn, '--write-to=' + target, '--quiet']);
  assert.equal(ret.status, 0, `stderr: ${ret.stderr}`);

  assert.match(ret.stdout, /^aws-secrets-inspector:retrieve wrote \d+ bytes to /);
  assert.ok(!ret.stdout.includes('fixture-synthetic-redacted-value'));

  const written = JSON.parse(await fs.readFile(target, 'utf8'));
  assert.equal(written.secret_string, 'fixture-synthetic-redacted-value-not-a-real-secret');

  const fileStat = await fs.stat(target);
  const dirStat = await fs.stat(secretsDir);
  assert.equal((fileStat.mode & 0o777), 0o600, `expected 0600, got ${(fileStat.mode & 0o777).toString(8)}`);
  assert.equal((dirStat.mode & 0o777), 0o700, `expected 0700, got ${(dirStat.mode & 0o777).toString(8)}`);

  const fileBytes = await fs.readFile(target);
  const fileSha = crypto.createHash('sha256').update(fileBytes).digest('hex');
  const runsLog = await fs.readFile(path.join(home, '.cache', 'claude-grc', 'runs.log'), 'utf8');
  const retEntry = runsLog.trim().split('\n').map(l => JSON.parse(l)).find(l => l.mode === 'retrieve');
  assert.ok(retEntry, 'no retrieve manifest in runs.log');
  assert.equal(retEntry.byte_size, fileBytes.length, 'manifest byte_size must match on-disk file size in bytes');
  assert.equal(retEntry.sha256, fileSha, 'manifest sha256 must match sha256 of on-disk file');
});

test('retrieval mode records the realpath-resolved destination when the secrets dir is a symlink', async (t) => {
  const probeDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aws-secrets-inspector-symprobe-'));
  try {
    await fs.symlink(probeDir, path.join(probeDir, 'self'));
  } catch {
    t.skip('symlinks are unavailable on this platform');
    return;
  } finally {
    await fs.rm(probeDir, { recursive: true, force: true });
  }

  const { configDir, env } = await makeEnv();
  const realSecretsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aws-secrets-inspector-realsecrets-'));
  await fs.chmod(realSecretsDir, 0o700);
  const linkedSecretsDir = path.join(configDir, 'secrets');
  await fs.symlink(realSecretsDir, linkedSecretsDir);
  const target = path.join(linkedSecretsDir, 'legacy-db.json');
  const arn = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:legacy-db-credentials-AbCdEf';

  const ret = runCollect(env, ['--retrieve=' + arn, '--write-to=' + target, '--quiet']);
  assert.equal(ret.status, 0, `stderr: ${ret.stderr}`);

  const expectedRealpath = path.join(await fs.realpath(realSecretsDir), 'legacy-db.json');
  const runsLog = await fs.readFile(path.join(env.HOME, '.cache', 'claude-grc', 'runs.log'), 'utf8');
  const retEntry = runsLog.trim().split('\n').map(l => JSON.parse(l)).find(l => l.mode === 'retrieve');
  assert.ok(retEntry, 'no retrieve manifest in runs.log');
  assert.equal(retEntry.destination, expectedRealpath);
  assert.notEqual(retEntry.destination, path.resolve(target));

  await fs.unlink(linkedSecretsDir).catch(() => {});
  await fs.rm(realSecretsDir, { recursive: true, force: true });
});

test('retrieval mode records the resolved region in the runs.log manifest', async () => {
  const arn = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:legacy-db-credentials-AbCdEf';

  {
    const { env } = await makeEnv();
    const ret = runCollect(env, ['--retrieve=' + arn, '--region=eu-west-1', '--quiet']);
    assert.equal(ret.status, 0, `stderr: ${ret.stderr}`);
    const runsLog = await fs.readFile(path.join(env.HOME, '.cache', 'claude-grc', 'runs.log'), 'utf8');
    const lines = runsLog.trim().split('\n').map(l => JSON.parse(l));
    const retEntry = lines.find(l => l.mode === 'retrieve');
    assert.ok(retEntry, 'no retrieve manifest in runs.log');
    assert.equal(retEntry.region, 'eu-west-1', 'manifest should record the explicit --region');
  }

  {
    const { env } = await makeEnv();
    const ret = runCollect(env, ['--retrieve=' + arn, '--regions=eu-west-1', '--quiet']);
    assert.equal(ret.status, 0, `stderr: ${ret.stderr}`);
    const runsLog = await fs.readFile(path.join(env.HOME, '.cache', 'claude-grc', 'runs.log'), 'utf8');
    const manifest = JSON.parse(runsLog.trim().split('\n').pop());
    assert.equal(manifest.region, 'eu-west-1', 'manifest should honor a single --regions value');
  }

  {
    const { env } = await makeEnv();
    const ret = runCollect(env, ['--retrieve=' + arn, '--quiet']);
    assert.equal(ret.status, 0, `stderr: ${ret.stderr}`);
    const runsLog = await fs.readFile(path.join(env.HOME, '.cache', 'claude-grc', 'runs.log'), 'utf8');
    const manifest = JSON.parse(runsLog.trim().split('\n').pop());
    assert.equal(manifest.region, 'us-east-1', 'manifest should fall back to config default_region');
  }

  {
    const { env: baseEnv } = await makeEnv();
    const cfgDir = baseEnv.CLAUDE_GRC_CONFIG_DIR;
    await fs.writeFile(path.join(cfgDir, 'connectors/aws-secrets-inspector.yaml'),
      'version: 1\n' +
      'source: aws-secrets-inspector\n' +
      'source_version: "0.1.0"\n' +
      'account_id: "123456789012"\n');
    const home = await fs.mkdtemp(path.join(os.tmpdir(), 'aws-secrets-inspector-home-region-env-'));
    const env = { ...baseEnv, HOME: home, USERPROFILE: home, AWS_DEFAULT_REGION: 'ap-southeast-2', AWS_REGION: '' };
    const ret = runCollect(env, ['--retrieve=' + arn, '--quiet']);
    assert.equal(ret.status, 0, `stderr: ${ret.stderr}`);
    const runsLog = await fs.readFile(path.join(home, '.cache', 'claude-grc', 'runs.log'), 'utf8');
    const manifest = JSON.parse(runsLog.trim().split('\n').pop());
    assert.equal(manifest.region, 'ap-southeast-2', 'manifest should fall back to AWS_DEFAULT_REGION');
  }
});

test('inspector branch leaves runs.log at 0o600 and parent dir at 0o700 on POSIX', async () => {
  if (process.platform === 'win32') return; // chmod is a no-op on Windows

  const { home, env } = await makeEnv();
  const parentDir = path.join(home, '.cache', 'claude-grc');
  const runsLogPath = path.join(parentDir, 'runs.log');

  // Pre-create at default umask to force the chmod-after path to do real
  // work. Without this pre-creation, fs.mkdir's mode option would create
  // the dir at 0o700 and fs.appendFile's mode option would create the
  // file at 0o600 on first run, masking a regression in the chmod-after
  // calls (Node honors the mode option only on creation).
  await fs.mkdir(parentDir, { recursive: true });
  await fs.chmod(parentDir, 0o755);
  await fs.writeFile(runsLogPath, '');
  await fs.chmod(runsLogPath, 0o644);

  const result = runCollect(env, ['--quiet']);
  assert.equal(result.status, 0, `stderr: ${result.stderr}`);

  const dirStat = await fs.stat(parentDir);
  const fileStat = await fs.stat(runsLogPath);
  assert.equal((dirStat.mode & 0o777), 0o700, `parent dir not tightened: ${(dirStat.mode & 0o777).toString(8)}`);
  assert.equal((fileStat.mode & 0o777), 0o600, `runs.log not tightened: ${(fileStat.mode & 0o777).toString(8)}`);
});

test('retrieve branch leaves runs.log at 0o600 and parent dir at 0o700 on POSIX', async () => {
  if (process.platform === 'win32') return; // chmod is a no-op on Windows

  const { home, env } = await makeEnv();
  const parentDir = path.join(home, '.cache', 'claude-grc');
  const runsLogPath = path.join(parentDir, 'runs.log');
  const arn = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:legacy-db-credentials-AbCdEf';

  await fs.mkdir(parentDir, { recursive: true });
  await fs.chmod(parentDir, 0o755);
  await fs.writeFile(runsLogPath, '');
  await fs.chmod(runsLogPath, 0o644);

  const result = runCollect(env, ['--retrieve=' + arn, '--quiet']);
  assert.equal(result.status, 0, `stderr: ${result.stderr}`);

  const dirStat = await fs.stat(parentDir);
  const fileStat = await fs.stat(runsLogPath);
  assert.equal((dirStat.mode & 0o777), 0o700, `parent dir not tightened: ${(dirStat.mode & 0o777).toString(8)}`);
  assert.equal((fileStat.mode & 0o777), 0o600, `runs.log not tightened: ${(fileStat.mode & 0o777).toString(8)}`);
});