import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

// Claude Code installs each plugin by copying its folder alone into
// <cache>/<marketplace>/<plugin>/<version>. Nothing outside the folder comes
// along: no repo-root node_modules, no sibling plugins, no schemas/.
const repo = resolve('.');
const marketplace = JSON.parse(readFileSync(join(repo, '.claude-plugin/marketplace.json'), 'utf8'));
const plugins = marketplace.plugins.map(p => ({ name: p.name, dir: resolve(repo, p.source) }));
const CODE_DIRS = ['scripts', 'src', 'hooks', 'bin'];
const CODE_EXT = /\.(?:js|mjs|cjs)$/;
const builtins = new Set(builtinModules.flatMap(m => [m, `node:${m}`]));

function walk(dir, keep, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '__pycache__') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, keep, out);
    else if (keep(full)) out.push(full);
  }
  return out;
}

const codeFiles = plugin => CODE_DIRS.flatMap(d => walk(join(plugin.dir, d), f => CODE_EXT.test(f)));

function importSpecifiers(source) {
  const specs = [];
  const patterns = [
    /^\s*import\s+(?:[^'"]*?\sfrom\s+)?['"]([^'"]+)['"]/gm,
    /^\s*export\s+[^'"]*?\sfrom\s+['"]([^'"]+)['"]/gm,
    /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) specs.push(match[1]);
  }
  return specs;
}

test('plugin code imports only Node built-ins and files inside its own plugin', () => {
  const problems = [];
  for (const plugin of plugins) {
    for (const file of codeFiles(plugin)) {
      for (const spec of importSpecifiers(readFileSync(file, 'utf8'))) {
        const where = `${relative(repo, file)} imports "${spec}"`;
        if (spec.startsWith('.')) {
          const target = resolve(dirname(file), spec);
          if (target !== plugin.dir && !target.startsWith(plugin.dir + sep)) problems.push(`${where}, which is outside the plugin`);
          else if (!existsSync(target)) problems.push(`${where}, which does not exist`);
        } else if (!builtins.has(spec)) {
          problems.push(`${where}, an npm package that an installed plugin does not have`);
        }
      }
    }
  }
  assert.deepEqual(problems, []);
});

test('commands, skills and hooks reference plugin files that exist', () => {
  const problems = [];
  for (const plugin of plugins) {
    const docs = [
      ...walk(join(plugin.dir, 'commands'), f => f.endsWith('.md')),
      ...walk(join(plugin.dir, 'skills'), f => f.endsWith('.md')),
      ...walk(join(plugin.dir, 'hooks'), f => f.endsWith('.json')),
    ];
    for (const doc of docs) {
      const text = readFileSync(doc, 'utf8');
      for (const match of text.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([A-Za-z0-9_./-]+)/g)) {
        const target = join(plugin.dir, match[1]);
        if (!existsSync(target)) problems.push(`${relative(repo, doc)} references missing ${match[1]}`);
      }
    }
  }
  assert.deepEqual(problems, []);
});

test('commands and skills do not tell Claude to run checkout-relative script paths', () => {
  const problems = [];
  const runsCheckoutPath = /^\s*(?:[A-Z_]+=\S+\s+)*(?:node|bash|sh|python3?)\s+(?:\.\/)?plugins\//;
  for (const plugin of plugins) {
    const docs = [
      ...walk(join(plugin.dir, 'commands'), f => f.endsWith('.md')),
      ...walk(join(plugin.dir, 'skills'), f => f.endsWith('.md')),
    ];
    for (const doc of docs) {
      let section = '';
      readFileSync(doc, 'utf8').split('\n').forEach((line, index) => {
        if (/^#{1,6}\s/.test(line)) section = line;
        if (/CI\/CD|GitHub Actions|\bCI\b/i.test(section)) return;
        if (runsCheckoutPath.test(line)) problems.push(`${relative(repo, doc)}:${index + 1} ${line.trim()}`);
      });
    }
  }
  assert.deepEqual(problems, []);
});

test('every plugin script starts from an installed copy', { timeout: 300_000 }, () => {
  const cache = mkdtempSync(join(tmpdir(), 'plugin-cache-'));
  const cwd = mkdtempSync(join(tmpdir(), 'plugin-cwd-'));
  const problems = [];
  try {
    for (const plugin of plugins) {
      const scripts = walk(join(plugin.dir, 'scripts'), f => CODE_EXT.test(f) && statSync(f).isFile());
      if (scripts.length === 0) continue;
      const installed = join(cache, marketplace.name, plugin.name, '0.0.0');
      mkdirSync(dirname(installed), { recursive: true });
      cpSync(plugin.dir, installed, { recursive: true, dereference: true, filter: src => !src.includes(`${sep}node_modules`) });
      for (const script of scripts) {
        const rel = relative(plugin.dir, script);
        const run = spawnSync(process.execPath, [join(installed, rel), '--help'], {
          cwd, encoding: 'utf8', timeout: 20_000, stdio: ['ignore', 'pipe', 'pipe'],
          env: { PATH: process.env.PATH, HOME: cwd },
        });
        const output = `${run.stdout}${run.stderr}`;
        const missing = output.match(/ERR_MODULE_NOT_FOUND|Cannot find (?:module|package) '[^']+'/);
        if (missing) problems.push(`${plugin.name}/${rel}: ${missing[0]}`);
      }
    }
  } finally {
    rmSync(cache, { recursive: true, force: true });
    rmSync(cwd, { recursive: true, force: true });
  }
  assert.deepEqual(problems, []);
});
