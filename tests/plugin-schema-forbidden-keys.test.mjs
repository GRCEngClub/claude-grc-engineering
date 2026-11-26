import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const validator = resolve('tests/validate-json-schema.cjs');
const schema = resolve('schemas/plugin.schema.json');
const base = { name: 'example', version: '0.1.0', description: 'Example', author: { name: 'Example' } };

function validate(manifest) {
  const dir = mkdtempSync(join(tmpdir(), 'plugin-schema-'));
  try {
    const file = join(dir, 'plugin.json');
    writeFileSync(file, JSON.stringify(manifest));
    return spawnSync(process.execPath, [validator, '--schema', schema, '--data', file, '--quiet'], { encoding: 'utf8' });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// A JSON object with a repeated key parses without error and keeps only the
// last one, so a second top-level "not" would silently drop the first.
test('plugin schema has exactly one top-level "not"', () => {
  assert.equal(readFileSync(schema, 'utf8').match(/^  "not":/gm)?.length, 1);
});

test('plugin schema accepts a minimal manifest and repo data under metadata', () => {
  assert.equal(validate(base).status, 0);
  assert.equal(validate({ ...base, metadata: { framework: { depth: 'reference' }, license_note: 'x' } }).status, 0);
});

test('plugin schema rejects each forbidden top-level key', () => {
  const forbidden = {
    namespace: 'x',
    commands: ['./commands/a.md'],
    skills: ['./skills/a'],
    hooks: {},
    framework_metadata: {},
    knowledge_source_metadata: {},
    license_note: 'x',
    tags: ['x'],
  };
  for (const [key, value] of Object.entries(forbidden)) {
    assert.equal(validate({ ...base, [key]: value }).status, 1, `${key} should be rejected`);
  }
});
