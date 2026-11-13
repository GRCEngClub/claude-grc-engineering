import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const script = 'plugins/grc-diagrams/scripts/control-evidence.py';
const run = (...args) => spawnSync('python3', [script, ...args], { encoding: 'utf8' });
const row = { control: 'Access <review>', owner: 'Security & IT', evidence: 'Report "A"', cadence: 'monthly', reviewer: 'Audit' };

test('multiple controls produce separate editable, escaped, correctly connected rows', () => {
  const dir = mkdtempSync(join(tmpdir(), 'drawio-multi-'));
  try {
    const input = join(dir, 'in.json'), output = join(dir, 'out.drawio');
    writeFileSync(input, JSON.stringify([row, { ...row, control: '</mxCell><script>bad</script>', cadence: 'weekly & on demand' }]));
    const result = run(input, output);
    assert.equal(result.status, 0, result.stderr);
    const check = spawnSync('python3', ['-c', `
import sys, xml.etree.ElementTree as ET
r = ET.parse(sys.argv[1]).getroot()
cells = r.find('root').findall('mxCell')
d = {c.get('id'): c for c in cells}
assert len(cells) == len(d) == 17
assert d['r1-control'].get('value') == 'Control: Access <review>'
assert d['r2-control'].get('value') == 'Control: </mxCell><script>bad</script>'
assert d['r2-e2'].get('value') == 'produces: weekly & on demand'
for i in (1, 2):
    p = f'r{i}-'
    for name in ('control', 'owner', 'evidence', 'reviewer'):
        c = d[p+name]
        assert c.get('vertex') == '1' and 'html=0' in c.get('style')
        assert c.find("mxGeometry[@as='geometry']") is not None
    for n, source, target in ((1,'control','owner'), (2,'owner','evidence'), (3,'evidence','reviewer')):
        e = d[p+'e'+str(n)]
        assert (e.get('source'), e.get('target')) == (p+source, p+target)
        assert e.get('edge') == '1' and 'html=0' in e.get('style')
        assert e.find("mxGeometry[@as='geometry'][@relative='1']") is not None
assert int(d['r2-control'].find('mxGeometry').get('y')) > int(d['r1-control'].find('mxGeometry').get('y'))
`, output], { encoding: 'utf8' });
    assert.equal(check.status, 0, check.stderr);
    assert.match(readFileSync(output, 'utf8'), /&lt;script&gt;bad&lt;\/script&gt;/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('rejects invalid batches before creating output and refuses symlink overwrite', () => {
  const dir = mkdtempSync(join(tmpdir(), 'drawio-multi-'));
  try {
    const input = join(dir, 'in.json'), output = join(dir, 'out.drawio');
    const cases = [[], Array(11).fill(row), [row, { ...row, owner: '\u0000' }], [row, { ...row, extra: 'x' }], [row, null], [row, { ...row, owner: '\ud800' }], '[{"control":"a","control":"b"}]'];
    for (const item of cases) {
      writeFileSync(input, typeof item === 'string' ? item : JSON.stringify(item));
      const result = run(input, output);
      assert.notEqual(result.status, 0);
      assert.equal(existsSync(output), false);
    }
    for (const batch of [Array(10).fill(row), JSON.parse(readFileSync('plugins/grc-diagrams/examples/multi-control-evidence-input.json', 'utf8'))]) {
      writeFileSync(input, JSON.stringify(batch));
      assert.equal(run(input, output).status, 0);
      rmSync(output);
    }
    writeFileSync(input, JSON.stringify([row, row]));
    const victim = join(dir, 'victim');
    writeFileSync(victim, 'keep');
    symlinkSync(victim, output);
    assert.notEqual(run(input, output).status, 0);
    assert.equal(readFileSync(victim, 'utf8'), 'keep');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
