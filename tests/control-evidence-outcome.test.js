import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const script = 'plugins/grc-diagrams/scripts/control-evidence.py';
const row = { control: 'Access <review>', owner: 'IT & Security', evidence: 'Snapshot', cadence: 'quarterly', reviewer: 'Audit' };
const run = (input, output) => spawnSync('python3', [script, input, output], { encoding: 'utf8' });

test('optional review outcome is an editable explicitly connected node, including mixed batches', () => {
  const dir = mkdtempSync(join(tmpdir(), 'review-outcome-'));
  try {
    const input = join(dir, 'in.json'), output = join(dir, 'out.drawio');
    writeFileSync(input, JSON.stringify([row, {...row, review_outcome: 'changes requested'}]));
    const result = run(input, output);
    assert.equal(result.status, 0, result.stderr);
    const check = spawnSync('python3', ['-c', `
import sys, xml.etree.ElementTree as ET
root = ET.parse(sys.argv[1]).getroot()
cells = {c.get('id'): c for c in root.find('root').findall('mxCell')}
assert 'r1-outcome' not in cells and 'r1-e4' not in cells
assert cells['legend'].get('value') == 'Legend: solid = responsibility; dashed = evidence or review flow'
for p in ('r1-', 'r2-'):
    for n, source, target, label in (
        (1, 'control', 'owner', 'assigned to'),
        (2, 'owner', 'evidence', 'produces: quarterly'),
        (3, 'evidence', 'reviewer', 'reviewed by')):
        e = cells[p + 'e' + str(n)]
        assert (e.get('source'), e.get('target'), e.get('value')) == (p + source, p + target, label)
node = cells['r2-outcome']
assert node.get('value') == 'Review outcome: changes requested'
assert node.get('vertex') == '1' and 'html=0' in node.get('style')
edge = cells['r2-e4']
assert (edge.get('source'), edge.get('target'), edge.get('value')) == ('r2-reviewer', 'r2-outcome', 'records')
assert edge.get('edge') == '1' and edge.find("mxGeometry[@as='geometry']") is not None
assert int(node.find('mxGeometry').get('x')) + int(node.find('mxGeometry').get('width')) <= int(root.get('pageWidth'))
`, output], { encoding: 'utf8' });
    assert.equal(check.status, 0, check.stderr);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('rejects invalid review outcomes without creating output; accepts documented example', () => {
  const dir = mkdtempSync(join(tmpdir(), 'review-outcome-'));
  try {
    const input = join(dir, 'in.json'), output = join(dir, 'out.drawio');
    for (const review_outcome of ['', 'accepted', null, 1, '<script>']) {
      writeFileSync(input, JSON.stringify({...row, review_outcome}));
      assert.notEqual(run(input, output).status, 0);
      assert.equal(existsSync(output), false);
    }
    const example = 'plugins/grc-diagrams/examples/control-evidence-review-input.json';
    const result = run(example, output);
    assert.equal(result.status, 0, result.stderr);
    assert.match(readFileSync(output, 'utf8'), /Review outcome: pending/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
