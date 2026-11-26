import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { EXIT, usage } from '../plugins/personas/engineer/scripts/monitor-continuous.js';

const commandDoc = fs.readFileSync(
  new URL('../plugins/personas/engineer/commands/monitor-continuous.md', import.meta.url),
  'utf8'
);

function section(text, heading, lineShape) {
  const start = text.indexOf(heading);
  assert.notEqual(start, -1, `missing "${heading}"`);
  const codes = [];
  for (const line of text.slice(start + heading.length).split('\n').slice(1)) {
    const match = lineShape.exec(line);
    if (match) codes.push(Number(match[1]));
    else if (codes.length) break;
  }
  return codes.sort();
}

const implemented = [...new Set(Object.values(EXIT))].sort();

test('usage() documents exactly the exit codes the script can return', () => {
  assert.deepEqual(section(usage(), 'Exit codes:', /^\s+(\d+)\s/), implemented);
});

test('the command doc documents exactly the exit codes the script can return', () => {
  assert.deepEqual(section(commandDoc, '## Exit codes', /^- `(\d+)` - /), implemented);
});
