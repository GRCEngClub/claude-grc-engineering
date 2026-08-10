// Unit test for safeResolveWritePath. Mirrors the function from
// collect.js; the function is the safety net for the retrieval branch.

import path from 'node:path';
import os from 'node:os';

const SECRETS_DIR = path.join(os.homedir(), '.config', 'claude-grc', 'secrets');

function safeResolveWritePath(input) {
  const resolved = path.isAbsolute(input)
    ? path.resolve(input)
    : path.resolve(process.cwd(), input);
  const secretsRoot = path.resolve(SECRETS_DIR);
  const rel = path.relative(secretsRoot, resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`PATH_TRAVERSAL: '${input}' resolves outside ${secretsRoot}`);
  }
  return resolved;
}

const cases = [
  // [input, expectedThrow, label]
  [`${SECRETS_DIR}/my-secret`, false, 'absolute path inside secrets dir'],
  [`${SECRETS_DIR}/sub/dir/my-secret`, false, 'absolute path in subdir'],
  ['my-secret', true, 'relative path resolves to cwd (not in secrets dir)'],
  ['/etc/cron.d/evil', true, 'absolute path outside secrets dir'],
  ['/etc/passwd', true, 'absolute system file'],
  [`${SECRETS_DIR}/../../../etc/passwd`, true, 'traversal with ..'],
  ['/var/log/secret', true, 'absolute path with /var/'],
  [`${SECRETS_DIR}/../evil`, true, 'one-level escape via ..']
];

let pass = 0, fail = 0;
for (const [input, shouldThrow, label] of cases) {
  let threw = false;
  let result = null;
  try {
    result = safeResolveWritePath(input);
  } catch (err) {
    threw = true;
  }
  if (threw === shouldThrow) {
    console.log(`  ✓ ${label}: ${threw ? 'rejected' : 'accepted -> ' + result}`);
    pass++;
  } else {
    console.log(`  ✗ ${label}: expected ${shouldThrow ? 'throw' : 'accept'}, got ${threw ? 'throw' : 'accept -> ' + result}`);
    fail++;
  }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
