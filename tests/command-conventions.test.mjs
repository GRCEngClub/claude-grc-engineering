import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

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

const commands = pluginDirs.flatMap(dir => walk(join(dir, 'commands'), f => f.endsWith('.md')));
const skills = pluginDirs.flatMap(dir => walk(join(dir, 'skills'), f => f.endsWith('SKILL.md')));

test('every command and skill has frontmatter with a description', () => {
  const problems = [];
  for (const file of [...commands, ...skills]) {
    const match = readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---\n/);
    if (!match) problems.push(`${relative(repo, file)}: no frontmatter`);
    else if (!/^description:\s*\S/m.test(match[1])) problems.push(`${relative(repo, file)}: no description`);
  }
  assert.deepEqual(problems, []);
});

// Claude Code replaces $0, $1, ... in a command with the arguments typed after
// it, counting from 0, wherever they appear: `$1,000`, `awk '{print $1}'` and
// "`$1` - the repository" all get rewritten. A backslash keeps the text literal.
test('commands escape every literal dollar sign that precedes a digit', () => {
  const problems = [];
  for (const file of commands) {
    readFileSync(file, 'utf8').split('\n').forEach((line, index) => {
      if (/(?<!\\)\$[0-9]/.test(line)) problems.push(`${relative(repo, file)}:${index + 1} ${line.trim().slice(0, 80)}`);
    });
  }
  assert.deepEqual(problems, []);
});
