import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const setupScript = fileURLToPath(new URL('../../plugins/connectors/okta-inspector/scripts/setup.sh', import.meta.url));
const TOKEN = '00sentinel-okta-token-value';

const FAKE_CURL = `#!/usr/bin/env bash
while [[ $# -gt 0 ]]; do
  case "$1" in
    -o) out="$2"; shift ;;
  esac
  shift
done
printf '{"id":"00o1","profile":{"login":"auditor@example.com"}}' > "$out"
printf '200'
`;

function runSetup(t, args, env) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'okta-setup-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const bin = path.join(dir, 'bin');
  fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, 'curl'), FAKE_CURL, { mode: 0o755 });
  const result = spawnSync('bash', [setupScript, '--domain=acme.okta.com', ...args], {
    encoding: 'utf8',
    env: {
      ...process.env,
      ...env,
      HOME: dir,
      CLAUDE_GRC_CONFIG_DIR: path.join(dir, 'config'),
      PATH: `${bin}${path.delimiter}${process.env.PATH}`
    }
  });
  return { result, dir };
}

function everyFileUnder(dir) {
  return fs.readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name !== 'curl')
    .map(entry => path.join(entry.parentPath ?? entry.path, entry.name));
}

for (const [label, args, env] of [
  ['from the environment', [], { OKTA_API_TOKEN: TOKEN }],
  ['from --token', [`--token=${TOKEN}`], {}]
]) {
  test(`setup stores the token's env-var name and never the token itself (${label})`, { skip: process.platform === 'win32' }, (t) => {
    const { result, dir } = runSetup(t, args, env);
    assert.equal(result.status, 0, result.stderr);

    const config = fs.readFileSync(path.join(dir, 'config', 'connectors', 'okta-inspector.yaml'), 'utf8');
    assert.match(config, /^token_env: "OKTA_API_TOKEN"$/m);

    assert.doesNotMatch(result.stdout + result.stderr, new RegExp(TOKEN));
    for (const file of everyFileUnder(dir)) {
      assert.doesNotMatch(fs.readFileSync(file, 'utf8'), new RegExp(TOKEN), file);
    }
  });
}
