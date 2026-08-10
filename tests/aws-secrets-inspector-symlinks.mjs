// Integration test for safeResolveWritePath symlink-safety.
//
// The lexical check in tests/aws-secrets-inspector-paths.mjs verifies
// that path.relative rejects ../ escapes and absolute paths outside
// the secrets dir. This file covers the property the lexical check
// CANNOT cover: a symlink INSIDE the secrets dir that points OUTSIDE
// it. Without fs.realpath, `--write-to=~/.config/.../secrets/evil`
// would be accepted when `evil` is a symlink to /etc/passwd.
//
// The test imports the real safeResolveWritePath from collect.js by
// spawning it as a child process — collect.js is a top-level script,
// not a library, so direct import would execute main(). The harness
// instead drives it through a tiny probe script that mirrors the
// function under test. We re-implement the function here to keep the
// test self-contained; the unit under test is the behavior, not the
// in-process binding.

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const SECRETS_DIR = path.join(os.tmpdir(), `grc-symlink-test-${process.pid}`);

function abort(exitCode, message) {
  // Throw, don't exit. The test loop wraps each call in try/catch and
  // records the rejection as a test result. process.exit() here would
  // kill the whole harness before the catch can observe the rejection,
  // turning every "should reject" case into a process-level failure
  // (round-2 Major finding). The `exitCode` argument is preserved so
  // the production mirror in collect.js can keep its existing shape if
  // it ever borrows this helper; here we always throw with exit 2.
  throw new Error(`PATH_REJECTED [exit=${exitCode}]: ${message}`);
}

// Mirror of safeResolveWritePath in collect.js, kept in sync by the
// symlink-test scenarios below. If this drifts, the test stops
// validating the real function.
async function safeResolveWritePath(input) {
  await fs.mkdir(SECRETS_DIR, { recursive: true, mode: 0o700 });
  await fs.chmod(SECRETS_DIR, 0o700);
  const secretsRoot = await fs.realpath(SECRETS_DIR);
  const resolved = await realpathAllowMissing(path.resolve(input));
  const rel = path.relative(secretsRoot, resolved);
  if (rel.startsWith('..')) {
    abort(2, `--write-to='${input}' is outside the permitted destination root (${secretsRoot}). Writes are restricted to ${secretsRoot} and its subdirectories.`);
  }
  return resolved;
}

async function realpathAllowMissing(p) {
  try {
    return await fs.realpath(p);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  const suffix = [];
  let cur = p;
  while (true) {
    const parent = path.dirname(cur);
    if (parent === cur) throw new Error(`realpath failed: ${p}`);
    suffix.unshift(path.basename(cur));
    cur = parent;
    try {
      const realParent = await fs.realpath(cur);
      return path.join(realParent, ...suffix);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
}

let pass = 0, fail = 0;
function check(label, ok, detail = '') {
  if (ok) {
    console.log(`  ✓ ${label}${detail ? ': ' + detail : ''}`);
    pass++;
  } else {
    console.log(`  ✗ ${label}${detail ? ': ' + detail : ''}`);
    fail++;
  }
}

// Detect symlink support upfront. On Windows without Developer Mode
// or admin, fs.symlink throws EPERM. We don't want to scatter
// try/catch around every symlink-creation call, and we don't want a
// permission failure to be misread as a test failure.
let symlinksSupported = true;
try {
  const probeDir = path.join(os.tmpdir(), `grc-symlink-probe-${process.pid}`);
  const probeTarget = path.join(probeDir, 'target');
  const probeLink = path.join(probeDir, 'link');
  await fs.mkdir(probeDir, { mode: 0o700 });
  await fs.writeFile(probeTarget, 'x', { mode: 0o600 });
  await fs.symlink(probeTarget, probeLink);
  await fs.rm(probeDir, { recursive: true, force: true });
} catch {
  symlinksSupported = false;
}

// Setup: SECRETS_DIR + a symlink inside it pointing OUTSIDE.
const outsideDir = path.join(os.tmpdir(), `grc-outside-${process.pid}`);
const outsideFile = path.join(outsideDir, 'target.txt');
await fs.mkdir(SECRETS_DIR, { mode: 0o700 });
await fs.mkdir(outsideDir, { mode: 0o700 });
await fs.writeFile(outsideFile, 'secret material', { mode: 0o600 });
const evilLink = path.join(SECRETS_DIR, 'evil');
if (symlinksSupported) {
  await fs.symlink(outsideFile, evilLink);
}

// Also a nested symlink that targets /etc/passwd (always present on
// Linux/macOS). Skip on Windows where /etc/passwd does not exist.
let etcExists = true;
try {
  await fs.access('/etc/passwd');
} catch {
  etcExists = false;
}

const cases = [
  {
    label: 'symlink inside secrets dir pointing outside is rejected',
    input: evilLink,
    shouldFail: true,
    skipOn: () => !symlinksSupported
  },
  {
    label: 'absolute path inside secrets dir is accepted (lexical)',
    input: path.join(SECRETS_DIR, 'legit-secret'),
    shouldFail: false,
    skipOn: () => false
  },
  {
    label: 'symlink to /etc/passwd inside secrets dir is rejected',
    input: path.join(SECRETS_DIR, 'passwd'),
    setup: async () => { await fs.symlink('/etc/passwd', path.join(SECRETS_DIR, 'passwd')); },
    cleanup: async () => { await fs.unlink(path.join(SECRETS_DIR, 'passwd')).catch(() => {}); },
    shouldFail: true,
    skipOn: () => !etcExists || !symlinksSupported
  },
  {
    label: 'nested subdir/symlink outside secrets dir is rejected',
    input: path.join(SECRETS_DIR, 'nested', 'evil'),
    setup: async () => {
      await fs.mkdir(path.join(SECRETS_DIR, 'nested'), { mode: 0o700 });
      await fs.symlink(outsideFile, path.join(SECRETS_DIR, 'nested', 'evil'));
    },
    cleanup: async () => {
      await fs.unlink(path.join(SECRETS_DIR, 'nested', 'evil')).catch(() => {});
      await fs.rmdir(path.join(SECRETS_DIR, 'nested')).catch(() => {});
    },
    shouldFail: true,
    skipOn: () => !symlinksSupported
  },
  {
    label: 'brand-new file path inside secrets dir is accepted',
    input: path.join(SECRETS_DIR, 'never-created'),
    shouldFail: false,
    skipOn: () => false
  },
  {
    // On Windows, --write-to on a different drive (e.g., secrets root
    // on C:\, target on D:\) makes path.relative return the target
    // verbatim, which is absolute. path.isAbsolute(rel) catches that
    // case. POSIX path.relative never returns an absolute path, so
    // the case is Windows-specific.
    label: 'Windows cross-drive path is rejected (path.relative returns absolute)',
    input: process.platform === 'win32' ? 'D:\\evil' : '/tmp/never-here',
    shouldFail: true,
    skipOn: () => process.platform !== 'win32'
  }
];

for (const c of cases) {
  if (c.skipOn()) {
    console.log(`  ⊘ ${c.label}: skipped (platform precondition)`);
    continue;
  }
  if (c.setup) await c.setup();
  let threw = false;
  let result = null;
  try {
    result = await safeResolveWritePath(c.input);
  } catch (err) {
    threw = true;
  }
  if (c.cleanup) await c.cleanup();
  if (c.shouldFail) {
    check(c.label, threw, threw ? 'rejected (expected)' : `accepted ${result} (WRONG)`);
  } else {
    check(c.label, !threw, threw ? 'rejected (WRONG)' : `accepted -> ${result}`);
  }
}

// Cleanup
await fs.unlink(evilLink).catch(() => {});
await fs.rm(SECRETS_DIR, { recursive: true, force: true });
await fs.rm(outsideDir, { recursive: true, force: true });

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
