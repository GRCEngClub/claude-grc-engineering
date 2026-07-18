import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const validator = new URL('./validate-json-schema.cjs', import.meta.url);

function fixtureFiles() {
  const directory = mkdtempSync(join(tmpdir(), 'schema-validator-'));
  const schema = join(directory, 'schema.json');
  const valid = join(directory, 'valid.json');
  const invalid = join(directory, 'invalid.json');
  const malformed = join(directory, 'malformed.json');

  writeFileSync(schema, JSON.stringify({
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    required: ['name'],
    additionalProperties: false,
    properties: {
      name: { type: 'string', minLength: 1 },
    },
  }));
  writeFileSync(valid, JSON.stringify({ name: 'research-companion' }));
  writeFileSync(invalid, JSON.stringify({ name: '', unexpected: true }));
  writeFileSync(malformed, '{broken');

  return { schema, valid, invalid, malformed };
}

function runValidator(...args) {
  return spawnSync(process.execPath, [validator.pathname, ...args], {
    encoding: 'utf8',
  });
}

test('schema validator accepts valid JSON against a Draft 2020-12 schema', () => {
  const { schema, valid } = fixtureFiles();
  const result = runValidator('--schema', schema, '--data', valid);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /valid\.json valid/);
});

test('schema validator rejects invalid JSON and reports validation errors', () => {
  const { schema, invalid } = fixtureFiles();
  const result = runValidator('--schema', schema, '--data', invalid);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /invalid\.json invalid/);
  assert.match(result.stderr, /must NOT have additional properties|must NOT have fewer than 1 characters/);
});

test('schema validator names malformed JSON files and exits with an operational error', () => {
  const { schema, malformed } = fixtureFiles();
  const result = runValidator('--schema', schema, '--data', malformed);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /malformed\.json/);
  assert.match(result.stderr, /invalid JSON/);
});
