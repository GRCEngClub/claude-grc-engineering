const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const root = join(__dirname, '../plugins/frameworks/cmmc/commands');
const read = name => readFileSync(join(root, name), 'utf8');

test('Level 2 draft plan has source-linked scope, methods and review gates', () => {
  const plan = read('assessment-plan.md');
  for (const term of ['section-170.16', 'section-170.17', 'section-170.19', 'NIST.SP.800-171A', 'NIST.SP.800-171r2']) assert.ok(plan.includes(term), term);
  for (const term of ['[not provided]', 'Self', 'C3PAO', 'boundary', 'SSP', 'examine', 'interview', 'test', 'reviewer', 'not assessed']) assert.ok(plan.toLowerCase().includes(term.toLowerCase()), term);
  assert.match(plan, /not an official/i);
  assert.match(plan, /do not.*(?:invent|infer)/i);
  assert.match(plan, /Level 1 or (?:Level )?3/i);
  assert.match(plan, /not.*(?:certification|status)/i);
  assert.match(plan, /never commit/i);
  assert.match(plan, /Synthetic walkthrough/);
  assert.match(read('assess.md'), /\/cmmc:assessment-plan/);
});
