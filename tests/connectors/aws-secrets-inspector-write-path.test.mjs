import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  resolveWritePathInside,
  WritePathRejected
} from '../../plugins/connectors/aws-secrets-inspector/scripts/write-path.js';

async function makeRoot(t) {
  const base = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'write-path-')));
  t.after(() => fs.rm(base, { recursive: true, force: true }));
  const root = path.join(base, 'secrets');
  const outside = path.join(base, 'outside');
  await fs.mkdir(root, { mode: 0o700 });
  await fs.mkdir(outside, { mode: 0o700 });
  await fs.writeFile(path.join(outside, 'target.txt'), 'x', { mode: 0o600 });
  return { root, outside };
}

async function symlinkOrSkip(t, target, link) {
  try {
    await fs.symlink(target, link);
    return true;
  } catch {
    t.skip('symlinks are unavailable on this platform');
    return false;
  }
}

test('accepts existing and not-yet-created paths inside the root', async (t) => {
  const { root } = await makeRoot(t);
  assert.equal(await resolveWritePathInside(root, path.join(root, 'new-secret')), path.join(root, 'new-secret'));
  assert.equal(await resolveWritePathInside(root, path.join(root, 'sub', 'dir', 'new-secret')), path.join(root, 'sub', 'dir', 'new-secret'));
});

test('rejects paths outside the root', async (t) => {
  const { root, outside } = await makeRoot(t);
  for (const input of [
    'relative-secret',
    path.join(outside, 'target.txt'),
    path.join(root, '..', 'evil'),
    path.join(root, '..', '..', '..', 'etc', 'passwd'),
    `${root}-sibling`
  ]) {
    await assert.rejects(resolveWritePathInside(root, input), WritePathRejected, input);
  }
});

test('rejects a symlink inside the root that points outside it', async (t) => {
  const { root, outside } = await makeRoot(t);
  const link = path.join(root, 'evil');
  if (!(await symlinkOrSkip(t, path.join(outside, 'target.txt'), link))) return;
  await assert.rejects(resolveWritePathInside(root, link), WritePathRejected);
});

test('rejects a new file under a symlinked directory that points outside the root', async (t) => {
  const { root, outside } = await makeRoot(t);
  const link = path.join(root, 'nested');
  if (!(await symlinkOrSkip(t, outside, link))) return;
  await assert.rejects(resolveWritePathInside(root, path.join(link, 'new-secret')), WritePathRejected);
});

test('follows a symlinked root and returns the real destination', async (t) => {
  const { root, outside } = await makeRoot(t);
  const linkedRoot = path.join(outside, 'linked-root');
  if (!(await symlinkOrSkip(t, root, linkedRoot))) return;
  assert.equal(await resolveWritePathInside(linkedRoot, path.join(linkedRoot, 'new-secret')), path.join(root, 'new-secret'));
});

test('tightens a group/other-accessible root to 0700 before writing', async (t) => {
  if (process.platform === 'win32') return t.skip('Windows has no mode bits to tighten');
  const { root } = await makeRoot(t);
  await fs.chmod(root, 0o755);
  await resolveWritePathInside(root, path.join(root, 'new-secret'));
  assert.equal((await fs.stat(root)).mode & 0o777, 0o700);
});

test('rejects a root that is not a directory', async (t) => {
  const { outside } = await makeRoot(t);
  const fileRoot = path.join(outside, 'target.txt');
  await assert.rejects(resolveWritePathInside(fileRoot, path.join(fileRoot, 'x')));
});
