import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PLUGIN_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// An installed copy sits at <cache>/<marketplace>/engineer/<version>, so two
// levels up is the marketplace cache folder that holds every other installed
// plugin. In a checkout the repo root is found by walking up to marketplace.json.
const INSTALL_PARENT = path.resolve(PLUGIN_ROOT, '..', '..');
const MAX_CLIMB = 5;

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function readManifest(pluginDir) {
  const manifestPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');
  try {
    return { manifestPath, manifest: JSON.parse(await fs.readFile(manifestPath, 'utf8')) };
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') return null;
    throw new Error(`Could not read ${manifestPath}: ${err.message}`);
  }
}

async function subdirs(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter(e => e.isDirectory()).map(e => path.join(dir, e.name));
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') return [];
    throw err;
  }
}

export async function repoRoot() {
  let dir = PLUGIN_ROOT;
  for (let i = 0; i < MAX_CLIMB; i += 1) {
    dir = path.dirname(dir);
    if (await exists(path.join(dir, '.claude-plugin', 'marketplace.json'))) return dir;
  }
  return null;
}

export async function requireRepoRoot(tool) {
  const root = await repoRoot();
  if (!root) {
    throw new Error(`${tool} maintains the marketplace repository and only runs from a clone of it, not from an installed plugin.`);
  }
  return root;
}

export function frameworkMetadata(manifest) {
  const metadata = manifest?.metadata?.framework ?? manifest?.framework_metadata;
  return metadata && typeof metadata === 'object' ? metadata : null;
}

async function newestInstalledVersion(pluginCacheDir) {
  let best = null;
  for (const versionDir of await subdirs(pluginCacheDir)) {
    const found = await readManifest(versionDir);
    if (!found) continue;
    const { mtimeMs } = await fs.stat(found.manifestPath);
    if (!best || mtimeMs > best.mtimeMs) best = { dir: versionDir, mtimeMs, ...found };
  }
  return best;
}

export async function listFrameworkPlugins() {
  const root = await repoRoot();
  const plugins = [];
  if (root) {
    for (const dir of await subdirs(path.join(root, 'plugins', 'frameworks'))) {
      const found = await readManifest(dir);
      if (found) plugins.push({ slug: path.basename(dir), dir, ...found });
    }
  } else {
    for (const cacheDir of await subdirs(INSTALL_PARENT)) {
      const found = await newestInstalledVersion(cacheDir);
      if (found && frameworkMetadata(found.manifest)) {
        plugins.push({ slug: path.basename(cacheDir), dir: found.dir, manifestPath: found.manifestPath, manifest: found.manifest });
      }
    }
  }
  return plugins.sort((a, b) => a.slug.localeCompare(b.slug));
}

export function displayPath(target) {
  const relative = path.relative(process.cwd(), target);
  return relative && !relative.startsWith('..') ? relative : target;
}
