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

  return { directory, schema, valid, invalid, malformed };
}

function runValidator(...args) {
  return spawnSync(process.execPath, [validator.pathname, ...args], {
    encoding: 'utf8',
  });
}

function assertNoWorkflowCommands(result) {
  assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /^::/m);
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

test('schema validator rejects unknown schema keywords in strict mode', () => {
  const { directory, valid } = fixtureFiles();
  const schema = join(directory, 'unknown-keyword.schema.json');
  writeFileSync(schema, JSON.stringify({
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    propertiez: { name: { type: 'string' } },
  }));

  const result = runValidator('--schema', schema, '--data', valid);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /strict mode: unknown keyword/);
});

test('schema validator cannot emit GitHub Actions commands from data filenames', () => {
  const { directory, schema } = fixtureFiles();
  const hostile = join(directory, 'line\n::warning::spoof.json');
  writeFileSync(hostile, JSON.stringify({ unexpected: true }));

  const result = runValidator('--schema', schema, '--data', hostile);

  assert.equal(result.status, 1);
  assertNoWorkflowCommands(result);
  assert.match(result.stderr, /line%0A%3A%3Awarning%3A%3Aspoof\.json/);
});

test('schema validator sanitizes workflow commands in Ajv diagnostics', () => {
  const { directory } = fixtureFiles();
  const schema = join(directory, 'property-values.schema.json');
  const data = join(directory, 'property-values.json');
  writeFileSync(schema, JSON.stringify({
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    additionalProperties: { type: 'integer' },
  }));
  writeFileSync(data, JSON.stringify({
    'bad\n::warning::DATA_INJECTION': 'not-an-integer',
  }));

  const result = runValidator('--schema', schema, '--data', data);

  assert.equal(result.status, 1);
  assertNoWorkflowCommands(result);
  assert.match(result.stderr, /%0A::warning::DATA_INJECTION/);
});

test('schema validator sanitizes workflow commands in schema compilation errors', () => {
  const { directory, valid } = fixtureFiles();
  const schema = join(directory, 'hostile-keyword.schema.json');
  writeFileSync(schema, JSON.stringify({
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    'bad\n::warning::SCHEMA_INJECTION': true,
  }));

  const result = runValidator('--schema', schema, '--data', valid);

  assert.equal(result.status, 2);
  assertNoWorkflowCommands(result);
  assert.match(result.stderr, /%0A::warning::SCHEMA_INJECTION/);
});

test('schema validator sanitizes workflow commands in filesystem errors', () => {
  const { directory, schema } = fixtureFiles();
  const missing = join(directory, 'missing\n::error::FS_INJECTION.json');

  const result = runValidator('--schema', schema, '--data', missing);

  assert.equal(result.status, 2);
  assertNoWorkflowCommands(result);
  assert.match(result.stderr, /%0A::error::FS_INJECTION/);
});
