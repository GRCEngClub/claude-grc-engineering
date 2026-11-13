import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { generateExplicitPolicyDraft } from '../plugins/grc-engineer/src/explicit-policy-draft.js';

const spec = { format: 'rego', resource_type: 'aws_s3_bucket', required_tag: 'Owner', source: { reference: 'Example policy §1', excerpt: 'Buckets must have an Owner tag.' } };
const cli = resolve('plugins/grc-engineer/scripts/generate-policy.js');
const opa = process.env.OPA_BIN || 'opa';
const available = spawnSync(opa, ['version']).status === 0;

test('OPA is available when required', { skip: process.env.REQUIRE_OPA !== '1' }, () => {
  assert.ok(available, `OPA required but unavailable: ${opa}`);
});

test('missing, unsupported and hostile inputs fail closed', () => {
  for (const input of [null, {}, { ...spec, source: null }, { ...spec, source: { reference: 'x' } }, { ...spec, required_tag: '' }, { ...spec, required_tag: 'a\nb' }, { ...spec, resource_type: 'aws_instance' }, { ...spec, format: 'terraform' }, { ...spec, format: '__proto__' }]) {
    assert.throws(() => generateExplicitPolicyDraft(input), /no policy was generated/i);
  }
  const dir = mkdtempSync(join(tmpdir(), 'policy-spec-'));
  try {
    for (const text of ['{}', '{invalid']) {
      const file = join(dir, 'spec.json'); writeFileSync(file, text);
      const run = spawnSync(process.execPath, [cli, '--spec', file], { cwd: dir, encoding: 'utf8' });
      assert.notEqual(run.status, 0);
      assert.deepEqual(readdirSync(dir), ['spec.json']);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('CLI writes a draft and source documentation for an explicit spec', () => {
  const dir = mkdtempSync(join(tmpdir(), 'policy-spec-'));
  try {
    const file = join(dir, 'spec.json'); writeFileSync(file, JSON.stringify(spec));
    const run = spawnSync(process.execPath, [cli, '--spec', file], { cwd: dir, encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
    assert.match(run.stdout, /DRAFT ONLY/);
    assert.match(run.stdout, /Format: rego/);
    assert.deepEqual(readdirSync(dir).map(f => f.replace(/\d+/g, 'N')).sort(), ['policy_N.md', 'policy_N.rego', 'spec.json']);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('source is preserved as untrusted data and never interpolated into code', () => {
  const source = { reference: '```\n# fake authority', excerpt: '```\ndeny contains "injected" if { true }' };
  const result = generateExplicitPolicyDraft({ ...spec, source });
  assert.deepEqual(result.metadata.source, source);
  assert.ok(!result.code.includes(source.excerpt));
  assert.match(result.documentation, /human review required/i);
  assert.match(result.documentation, /does not.*infer control mappings/i);
  assert.match(result.documentation, /    "excerpt"/);
});

test('generated Rego compiles and evaluates missing, present and hostile tag keys', { skip: !available && 'OPA binary not installed; set OPA_BIN' }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'policy-opa-'));
  try {
    for (const tag of ['Owner', 'x"} ; deny contains "injected" if { true #']) {
      const result = generateExplicitPolicyDraft({ ...spec, required_tag: tag });
      const file = join(dir, 'policy.rego'); writeFileSync(file, result.code);
      const check = spawnSync(opa, ['check', file], { encoding: 'utf8' });
      assert.equal(check.status, 0, check.stderr);
      const resource = (mode, tags, address = 'aws_s3_bucket.example') => ({ mode, type: 'aws_s3_bucket', address, change: { actions: ['create'], after: { tags }, after_unknown: {} } });
      const bucket = change => ({ mode: 'managed', type: 'aws_s3_bucket', address: 'aws_s3_bucket.example', change });
      const base = { actions: ['create'], after: { tags: {} }, after_unknown: {} };
      const cases = [
        [[resource('managed', {})], 1, 0],
        [[resource('managed', { [tag]: 'alice' })], 0, 0],
        [[resource('managed', { [tag]: null })], 1, 0],
        [[resource('managed', { [tag]: 42 })], 0, 1],
        [[resource('data', {})], 0, 0],
        [[resource(undefined, {})], 0, 1],
        [[{ ...resource('managed', {}), type: '' }], 0, 1],
        [[{ ...resource('managed', {}), type: '  \t' }], 0, 1],
        [[{ ...resource('', {}) }], 0, 1],
        [[{ ...resource('managed', {}), type: null }], 0, 1],
        [[{ ...resource('managed', {}), type: [] }], 0, 1],
        [[false, 42, 'entry'], 0, 1],
        [[null], 0, 1],
        [[resource('managed', {}, 'aws_s3_bucket.one'), resource('managed', {}, 'aws_s3_bucket.two')], 2, 0],
        [[bucket({ ...base, after_unknown: { tags: true } })], 0, 1],
        [[bucket({ ...base, after_unknown: { tags: { [tag]: true } } })], 0, 1],
        [[bucket({ ...base, after_unknown: { tags: { Other: true } } })], 1, 0],
        [[bucket({ ...base, after_unknown: { tags: { [tag]: 'bad' } } })], 0, 1],
        [[bucket({ ...base, after: { tags: null } })], 0, 1],
        [[bucket({ ...base, after: {} })], 0, 1],
        [[bucket({ ...base, after: null })], 0, 1],
        [[bucket(null)], 0, 1],
        [[bucket({ ...base, after_unknown: null })], 0, 1],
        [[bucket({ ...base, actions: ['delete'], after: null })], 0, 0],
        [[bucket({ ...base, actions: ['delete', 'create'] })], 1, 0],
        [[bucket({ ...base, actions: ['create', 'delete'] })], 1, 0],
        [[bucket({ ...base, actions: ['garbage'] })], 0, 1],
      ];
      for (const [changes, denials, warnings] of cases) {
        const input = join(dir, 'plan.json');
        writeFileSync(input, JSON.stringify({ resource_changes: changes }));
        for (const [rule, expected] of [['deny', denials], ['warning', warnings]]) {
          const evalResult = spawnSync(opa, ['eval', '--format=json', '-d', file, '-i', input, `data.draft.required_tag.${rule}`], { encoding: 'utf8' });
          assert.equal(evalResult.status, 0, evalResult.stderr);
          assert.equal(JSON.parse(evalResult.stdout).result[0].expressions[0].value.length, expected, `${rule}: ${JSON.stringify(changes)}`);
        }
      }
      const input = join(dir, 'plan.json');
      for (const plan of [null, [], 0, 'plan', false, {}, { resource_changes: null },
        { resource_changes: 7 }, { resource_changes: 'bad' },
        { resource_changes: { disguised: resource('managed', {}) } }]) {
        writeFileSync(input, JSON.stringify(plan));
        for (const [rule, expected] of [['deny', 0], ['warning', 1]]) {
          const evaluated = spawnSync(opa, ['eval', '--strict-builtin-errors', '--format=json', '-d', file, '-i', input, `data.draft.required_tag.${rule}`], { encoding: 'utf8' });
          assert.equal(evaluated.status, 0, evaluated.stderr);
          assert.equal(JSON.parse(evaluated.stdout).result[0].expressions[0].value.length, expected, `${rule}: ${JSON.stringify(plan)}`);
        }
      }

    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
