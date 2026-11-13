import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const script = 'plugins/grc-diagrams/scripts/control-evidence.py';
const example = 'plugins/grc-diagrams/examples/control-evidence-input.json';
const run = (...args) => spawnSync('python3', [script, ...args], { encoding: 'utf8' });
const validator = 'plugins/grc-diagrams/examples/validate-control-evidence.py';
const diagram = 'plugins/grc-diagrams/examples/control-evidence-flow.drawio';

test('CLI produces an editable model with escaped practical labels and valid endpoints', () => {
  const dir = mkdtempSync(join(tmpdir(), 'drawio-test-'));
  try {
    const input = join(dir, 'in.json'), output = join(dir, 'out.drawio');
    writeFileSync(input, JSON.stringify({ control: 'Access <review>', owner: 'Security & IT', evidence: 'Report "A"', cadence: 'quarterly', reviewer: 'Audit' }));
    const result = run(input, output);
    assert.equal(result.status, 0, result.stderr);
    const validate = spawnSync('python3', ['-c', `
import sys, xml.etree.ElementTree as ET
r = ET.parse(sys.argv[1]).getroot()
assert r.tag == 'mxGraphModel'
cells = r.find('root').findall('mxCell')
by_id = {c.get('id'): c for c in cells}
assert len(cells) == len(by_id)
assert by_id['1'].get('parent') == '0'
assert by_id['control'].get('value') == 'Control: Access <review>'
assert by_id['owner'].get('value') == 'Owner: Security & IT'
assert by_id['evidence'].get('value') == 'Evidence: Report "A"'
assert by_id['e2'].get('value') == 'produces: quarterly'
for c in cells:
    if c.get('id') != '0': assert c.get('parent') in by_id
    if c.get('vertex') == '1': assert c.find("mxGeometry[@as='geometry']") is not None
    if c.get('edge') == '1':
        assert by_id[c.get('source')].get('vertex') == '1'
        assert by_id[c.get('target')].get('vertex') == '1'
        assert c.find("mxGeometry[@as='geometry'][@relative='1']") is not None
assert [(by_id[f'e{i}'].get('source'), by_id[f'e{i}'].get('target')) for i in (1,2,3)] == [('control','owner'),('owner','evidence'),('evidence','reviewer')]
`, output], { encoding: 'utf8' });
    assert.equal(validate.status, 0, validate.stderr);
    assert.match(readFileSync(output, 'utf8'), /Security &amp; IT/);
    assert.equal(run(example, join(dir, 'example.drawio')).status, 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('example validator checks each edge and rejects DTDs and entities', () => {
  const dir = mkdtempSync(join(tmpdir(), 'drawio-validator-'));
  try {
    const input = join(dir, 'example.drawio');
    const xml = readFileSync(diagram, 'utf8');
    const validate = () => spawnSync('python3', [validator, input], { encoding: 'utf8' });
    writeFileSync(input, xml);
    assert.equal(validate().status, 0);
    // Preserve the set of endpoints while swapping their edge identities.
    const swapped = xml.replace('source="control" target="owner"', 'source="TEMP" target="TEMP"')
      .replace('source="owner" target="evidence"', 'source="control" target="owner"')
      .replace('source="TEMP" target="TEMP"', 'source="owner" target="evidence"');
    writeFileSync(input, swapped);
    assert.notEqual(validate().status, 0);
    for (const declaration of [
      '<!DOCTYPE mxGraphModel>',
      '<!DOCTYPE mxGraphModel [<!ENTITY x "Security">]>',
      '<!DOCTYPE mxGraphModel SYSTEM "file:///nonexistent">',
    ]) {
      for (const encoding of ['utf8', 'utf16le']) {
        const payload = `${declaration}\n${xml.replace('Security &amp; IT', '&x; &amp; IT')}`;
        writeFileSync(input, encoding === 'utf16le' ? Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(payload, encoding)]) : payload);
        const result = validate();
        assert.notEqual(result.status, 0, `${declaration} (${encoding})`);
        assert.match(result.stderr, /DTD and entity declarations are not permitted/);
      }
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('rejects malformed, incomplete, duplicate, invalid XML and unexpected input without output', () => {
  const dir = mkdtempSync(join(tmpdir(), 'drawio-test-'));
  try {
    const input = join(dir, 'in.json'), output = join(dir, 'out.drawio');
    const valid = { control: 'control', owner: 'owner', evidence: 'evidence', cadence: 'monthly', reviewer: 'reviewer' };
    const cases = ['{', '[]', JSON.stringify({ ...valid, owner: '' }), JSON.stringify({ ...valid, owner: null }),
      JSON.stringify({ ...valid, owner: '\u0000' }), JSON.stringify({ ...valid, extra: 'x' }),
      JSON.stringify({ ...valid, reviewer: undefined }), '{"control":"a","control":"b"}'];
    for (const text of cases) {
      writeFileSync(input, text);
      const result = run(input, output);
      assert.notEqual(result.status, 0, text);
      assert.match(result.stderr, /error:/);
      assert.equal(existsSync(output), false, text);
    }
    writeFileSync(input, JSON.stringify(valid));
    writeFileSync(output, 'keep');
    assert.notEqual(run(input, output).status, 0);
    assert.equal(readFileSync(output, 'utf8'), 'keep');
    assert.notEqual(run(input, input).status, 0);
    assert.deepEqual(JSON.parse(readFileSync(input, 'utf8')), valid);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
