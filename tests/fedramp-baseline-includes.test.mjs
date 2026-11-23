import test from 'node:test';
import assert from 'node:assert/strict';

import { loadFedRAMPBaseline } from '../plugins/grc-engineer/src/config-loader.js';

test('the High baseline contains every Moderate control plus its own', async () => {
  const moderate = await loadFedRAMPBaseline('moderate');
  const high = await loadFedRAMPBaseline('high');

  const missing = Object.keys(moderate.controls).filter(id => !(id in high.controls));
  assert.deepEqual(missing, []);
  assert.ok(Object.keys(high.controls).length > Object.keys(moderate.controls).length);
  assert.ok('SI-7(15)' in high.controls);
});

test('no baseline exposes its include directive as a control or a field', async () => {
  for (const level of ['low', 'moderate', 'high']) {
    const baseline = await loadFedRAMPBaseline(level);
    assert.equal('includes' in baseline, false, level);
    for (const [id, control] of Object.entries(baseline.controls)) {
      assert.equal(typeof control, 'object', `${level} ${id}`);
      assert.equal(Array.isArray(control), false, `${level} ${id}`);
    }
  }
});
