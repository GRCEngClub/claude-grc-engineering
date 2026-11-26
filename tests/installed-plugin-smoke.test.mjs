import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

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
  const runsCheckoutPath = /^\s*(?:[A-Z_]+=\S+\s+)*(?:(?:node|bash|sh|python3?)\s+)?(?:\.\/)?plugins\/\S+\/(?:scripts|hooks|bin)\//;
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

// Each script must start from an installed copy and handle --help without
// doing work: it prints help or a usage error (exit 0, 1 or 2), and does not
// crash, time out or touch the network. A preloaded shim records and blocks
// every connection attempt, so a script that ignores --help and starts
// collecting fails here.
test('every plugin script answers --help from an installed copy, offline', { timeout: 300_000 }, () => {
  const cache = mkdtempSync(join(tmpdir(), 'plugin-cache-'));
  const cwd = mkdtempSync(join(tmpdir(), 'plugin-cwd-'));
  const shim = join(cwd, 'no-network.cjs');
  writeFileSync(shim, `
    const fs = require('node:fs');
    const blocked = () => {
      fs.appendFileSync(process.env.SMOKE_NETWORK_LOG, process.argv[1] + '\\n');
      throw new Error('network is blocked in the smoke test');
    };
    require('node:net').Socket.prototype.connect = blocked;
    globalThis.fetch = async () => blocked();
  `);
  const networkLog = join(cwd, 'network.log');
  const problems = [];
  try {
    for (const plugin of plugins) {
      const scripts = walk(join(plugin.dir, 'scripts'), f => CODE_EXT.test(f) && statSync(f).isFile());
      if (scripts.length === 0) continue;
      const installed = join(cache, marketplace.name, plugin.name, '0.0.0');
      mkdirSync(dirname(installed), { recursive: true });
      cpSync(plugin.dir, installed, { recursive: true, dereference: true, filter: src => !src.includes(`${sep}node_modules`) });
      const linked = join(cache, `link-${plugin.name}`);
      symlinkSync(installed, linked, 'dir');
      for (const script of scripts) {
        const rel = relative(plugin.dir, script);
        const run = spawnSync(process.execPath, ['--require', shim, join(installed, rel), '--help'], {
          cwd, encoding: 'utf8', timeout: 20_000, stdio: ['ignore', 'pipe', 'pipe'],
          env: { PATH: process.env.PATH, HOME: cwd, SMOKE_NETWORK_LOG: networkLog },
        });
        const output = `${run.stdout}${run.stderr}`;
        const label = `${plugin.name}/${rel}`;
        const firstLine = output.trim().split('\n')[0].slice(0, 120);
        if (run.error) problems.push(`${label}: ${run.error.code || run.error.message}`);
        else if (run.signal) problems.push(`${label}: killed by ${run.signal}`);
        else if (existsSync(networkLog)) problems.push(`${label}: --help tried to use the network`);
        else if (/\nNode\.js v\d/.test(output)) problems.push(`${label}: uncaught exception: ${firstLine}`);
        else if (![0, 1, 2].includes(run.status)) problems.push(`${label}: --help exited ${run.status}: ${firstLine}`);
        rmSync(networkLog, { force: true });

        // The same script reached through a symlinked folder must behave the
        // same. A check such as `import.meta.url === pathToFileURL(argv[1])`
        // fails there, because Node resolves the module path but not argv[1],
        // and the script then exits 0 without doing anything.
        const viaLink = spawnSync(process.execPath, ['--require', shim, join(linked, rel), '--help'], {
          cwd, encoding: 'utf8', timeout: 20_000, stdio: ['ignore', 'pipe', 'pipe'],
          env: { PATH: process.env.PATH, HOME: cwd, SMOKE_NETWORK_LOG: networkLog },
        });
        const linkOutput = `${viaLink.stdout}${viaLink.stderr}`;
        if (viaLink.status !== run.status || (linkOutput.length > 0) !== (output.length > 0)) {
          problems.push(`${label}: behaves differently through a symlink (exit ${viaLink.status} vs ${run.status}, ${linkOutput.length} vs ${output.length} bytes of output)`);
        }
        rmSync(networkLog, { force: true });
      }
    }
  } finally {
    rmSync(cache, { recursive: true, force: true });
    rmSync(cwd, { recursive: true, force: true });
  }
  assert.deepEqual(problems, []);
});

// CI configs written before the regroup run plugins/grc-engineer/scripts/...
// from a checkout. That path is now a symlink and must still do real work.
test('the plugins/grc-engineer compatibility path runs a real scan', () => {
  const work = mkdtempSync(join(tmpdir(), 'compat-scan-'));
  try {
    writeFileSync(join(work, 'main.tf'), 'resource "aws_s3_bucket" "b" {\n  bucket = "x"\n}\n');
    const run = spawnSync(process.execPath, [join(repo, 'plugins/grc-engineer/scripts/scan-iac.js'), '.', 'SOC2', 'json'], {
      cwd: work, encoding: 'utf8', timeout: 30_000,
    });
    assert.equal(run.error, undefined);
    const report = JSON.parse(run.stdout);
    assert.equal(report.filesScanned, 1);
    assert.ok(report.summary.totalControls > 0, 'the scan evaluated controls');
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
});

// With `node -` or `node --eval`, process.argv[1] is "-" or missing. Importing a
// script as a module there must not throw or start its CLI.
test('scripts can be imported as modules when there is no entry file', () => {
  const targets = [
    'plugins/personas/grc-engineer/scripts/scan-iac.js',
    'plugins/connectors/datadog-inspector/scripts/collect.js',
    'tools/assessment-review-draft.mjs',
  ];
  for (const target of targets) {
    const source = `await import(${JSON.stringify(pathToFileURL(join(repo, target)).href)}); console.log('imported');`;
    const run = spawnSync(process.execPath, ['--input-type=module', '-'], { input: source, encoding: 'utf8', timeout: 20_000 });
    assert.equal(run.status, 0, `${target}: ${run.stderr.trim().split('\n')[0]}`);
    assert.equal(run.stdout.trim(), 'imported', target);
  }
});
