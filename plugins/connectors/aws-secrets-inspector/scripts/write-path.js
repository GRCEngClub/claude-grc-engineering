import fs from 'node:fs/promises';
import path from 'node:path';

export class WritePathRejected extends Error {}

export async function resolveWritePathInside(rootDir, input) {
  await fs.mkdir(rootDir, { recursive: true, mode: 0o700 });
  await fs.chmod(rootDir, 0o700);

  const root = await realRoot(rootDir);
  await assertOwnerOnlyDirectory(root);

  const resolved = await realpathAllowMissing(path.resolve(input));
  if (!isInside(root, resolved)) {
    throw new WritePathRejected(`--write-to='${input}' is outside the permitted destination root (${root}). Writes are restricted to ${root} and its subdirectories.`);
  }
  return resolved;
}

async function realRoot(rootDir) {
  try {
    return await fs.realpath(rootDir);
  } catch (err) {
    throw new WritePathRejected(`Cannot resolve secrets root '${rootDir}': ${err.message}. Refusing to write — investigate filesystem state before retrying.`);
  }
}

async function assertOwnerOnlyDirectory(root) {
  // Windows has no owner/group/other mode bits, so fs.stat reports nothing to check there.
  if (process.platform === 'win32') return;

  let stat;
  try {
    stat = await fs.stat(root);
  } catch (err) {
    throw new WritePathRejected(`Cannot stat secrets root '${root}': ${err.message}.`);
  }
  if (!stat.isDirectory()) {
    throw new WritePathRejected(`Secrets root '${root}' is not a directory — refusing to write.`);
  }
  if ((stat.mode & 0o077) !== 0) {
    throw new WritePathRejected(`Secrets root '${root}' has group/other permissions (mode ${(stat.mode & 0o777).toString(8)}); expected 0700. Run 'chmod 0700 ${root}' and retry.`);
  }
}

function isInside(root, candidate) {
  const rel = path.relative(root, candidate);
  // On Windows, path.relative returns the candidate verbatim when it is on
  // another drive, so an absolute result also means "outside".
  return !rel.startsWith('..') && !path.isAbsolute(rel);
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
