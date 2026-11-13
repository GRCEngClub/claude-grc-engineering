import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const path = 'plugins/frameworks/pci-dss/commands/evidence-checklist.md';

test('PCI checklist examples expose every row field without asserting membership', () => {
  const text = readFileSync(path, 'utf8');
  const sections = text.split(/^## Example \d+ — /m).slice(1);
  assert.equal(sections.length, 2);
  for (const section of sections) {
    const output = section.match(/```markdown\n([\s\S]*?)\n```/)?.[1];
    assert.ok(output, 'example has a Markdown output');
    const rows = output.split(/^- \[ \] /m).slice(1);
    assert.ok(rows.length >= 2);
    for (const row of rows) {
      for (const field of ['requirement', 'saq', 'source_revision', 'source_reference', 'item', 'owner', 'frequency', 'verification', 'status']) {
        assert.match(row, new RegExp(`\\b${field}:`), `missing ${field}`);
      }
      assert.match(row, /status: membership_unverified; evidence not verified/);
      assert.match(row, /source_revision: unverified; source_reference: unavailable/);
    }
  }
});
