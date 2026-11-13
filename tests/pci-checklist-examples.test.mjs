import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const path = 'plugins/frameworks/pci-dss/commands/evidence-checklist.md';
const text = readFileSync(path, 'utf8');
const examples = [
  { heading: 'Requirement 4, merchant D', requirement: '4', saq: 'D merchant' },
  { heading: 'Requirement 8, SAQ A', requirement: '8', saq: 'A' },
];

test('PCI checklist examples preserve field values and unknown-scope safeguards', () => {
  const sections = text.split(/^## Example \d+ — /m).slice(1);
  assert.equal(sections.length, examples.length);
  for (const [index, section] of sections.entries()) {
    const expected = examples[index];
    assert.ok(section.startsWith(expected.heading), 'example heading');
    const output = section.match(/```markdown\n([\s\S]*?)\n```/)?.[1];
    assert.ok(output, 'example has a Markdown output');
    assert.match(output, /eligibility unconfirmed/);
    assert.match(output, /entity, boundary and assessment period: unknown/);
    assert.match(output, /Source revision and SAQ membership: unverified/);
    const rows = output.split(/^- \[ \] /m).slice(1);
    assert.ok(rows.length >= 2);
    for (const row of rows) {
      const fields = Object.fromEntries(
        [...row.matchAll(/(?:^  - |; )(requirement|saq|source_revision|source_reference|item|owner|frequency|verification|status):[ \t]*([^;\n]*)/gm)]
          .map(([, name, value]) => [name, value.trim()]),
      );
      for (const field of ['requirement', 'saq', 'source_revision', 'source_reference', 'item', 'owner', 'frequency', 'verification', 'status']) {
        assert.ok(fields[field], `missing or empty ${field}`);
      }
      assert.match(row, new RegExp(`^  - requirement: ${expected.requirement} \\(family-level candidate; descendants unverified\\)$`, 'm'));
      assert.equal(fields.saq, expected.saq);
      assert.equal(fields.source_revision, 'unverified');
      assert.equal(fields.source_reference, 'unavailable');
      assert.equal(fields.status, 'membership_unverified');
      assert.match(row, /status: membership_unverified; evidence not verified/);
    }
  }
  assert.match(text, /not actual SAQ membership, completeness or relative scope/);
});
