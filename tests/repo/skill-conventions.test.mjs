import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';

const repo = resolve('.');
const marketplace = JSON.parse(readFileSync(join(repo, '.claude-plugin/marketplace.json'), 'utf8'));
const pluginDirs = marketplace.plugins.filter(p => typeof p.source === 'string').map(p => resolve(repo, p.source));

function walk(dir, keep, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, keep, out);
    else if (keep(full)) out.push(full);
  }
  return out;
}

const skills = pluginDirs.flatMap(dir => walk(join(dir, 'skills'), f => f.endsWith('SKILL.md')));

test('plugins ship skills only, with no commands folder', () => {
  const leftovers = pluginDirs.filter(dir => existsSync(join(dir, 'commands'))).map(dir => relative(repo, dir));
  assert.deepEqual(leftovers, []);
});

test('every skill has frontmatter with a description and a name that matches its folder', () => {
  const problems = [];
  for (const file of skills) {
    const match = readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---\n/);
    const folder = basename(dirname(file));
    if (!match) problems.push(`${relative(repo, file)}: no frontmatter`);
    else {
      if (!/^description:\s*\S/m.test(match[1])) problems.push(`${relative(repo, file)}: no description`);
      const name = match[1].match(/^name:\s*(\S+)\s*$/m)?.[1];
      if (name !== folder) problems.push(`${relative(repo, file)}: name "${name}" does not match folder "${folder}"`);
    }
  }
  assert.deepEqual(problems, []);
});

// Claude Code replaces $0, $1, ... in a skill with the arguments typed after
// it, counting from 0, wherever they appear: `$1,000`, `awk '{print $1}'` and
// "`$1` - the repository" all get rewritten. A backslash keeps the text literal.
test('skills escape every literal dollar sign that precedes a digit', () => {
  const problems = [];
  for (const file of skills) {
    readFileSync(file, 'utf8').split('\n').forEach((line, index) => {
      if (/(?<!\\)\$[0-9]/.test(line)) problems.push(`${relative(repo, file)}:${index + 1} ${line.trim().slice(0, 80)}`);
    });
  }
  assert.deepEqual(problems, []);
});

// The folder name is the name users install and type before the colon.
test('every plugin folder, plugin.json name and marketplace entry name agree', () => {
  const problems = [];
  for (const entry of marketplace.plugins) {
    if (typeof entry.source !== 'string') continue;
    const dir = resolve(repo, entry.source);
    const manifest = JSON.parse(readFileSync(join(dir, '.claude-plugin/plugin.json'), 'utf8'));
    if (manifest.name !== entry.name) problems.push(`${entry.source}: plugin.json name "${manifest.name}" differs from marketplace name "${entry.name}"`);
    if (basename(dir) !== entry.name) problems.push(`${entry.source}: folder "${basename(dir)}" differs from plugin name "${entry.name}"`);
  }
  assert.deepEqual(problems, []);
});

// Installed users keep a cached copy until the version string changes, and
// plugins call each other's commands, so every plugin moves together.
test('every plugin shares the marketplace version, declared only in plugin.json', () => {
  const expected = marketplace.metadata.version;
  const problems = [];
  for (const entry of marketplace.plugins) {
    if ('version' in entry) problems.push(`marketplace entry ${entry.name} sets version; plugin.json is the only place for it`);
    if (typeof entry.source !== 'string') continue;
    const manifest = JSON.parse(readFileSync(join(resolve(repo, entry.source), '.claude-plugin/plugin.json'), 'utf8'));
    if (manifest.version !== expected) problems.push(`${entry.name} is ${manifest.version}, expected ${expected}`);
  }
  assert.deepEqual(problems, []);
});
