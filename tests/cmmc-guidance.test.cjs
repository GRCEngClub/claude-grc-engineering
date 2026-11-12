const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '../plugins/frameworks/cmmc');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('CMMC guidance guards against known unsafe claims', () => {
  const expert = read('skills/cmmc-expert/SKILL.md');
  const level = read('commands/level-select.md');
  const practice = read('commands/practice-check.md');
  const domain = read('commands/domain-guidance.md');
  const objectives = read('skills/cmmc-assessment-objectives/SKILL.md');
  assert.match(expert, /weighted score of at least 80% is only one/);
  assert.doesNotMatch(expert, /88 of 110 practices must be MET|assessor discretion for partially implemented/);
  assert.match(level, /Do not infer a level solely/);
  assert.match(practice, /IA\.L2-3\.5\.3/);
  assert.match(domain, /AM, RE, RM and SA are not Level 2/);
  assert.match(objectives, /not an authoritative transcription/);
  assert.match(read('commands/evidence-checklist.md'), /not reviewed/);
});
