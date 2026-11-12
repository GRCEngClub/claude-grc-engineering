const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const root = join(__dirname, '../plugins/frameworks/cmmc');
const read = p => readFileSync(join(root, p), 'utf8');

test('MFA and password examples use the correct control identifiers', () => {
  const practice = read('commands/practice-check.md');
  const domain = read('commands/domain-guidance.md');
  assert.match(practice, /IA\.L2-3\.5\.3\*\*: MFA/);
  assert.match(practice, /IA\.L2-3\.5\.7\*\*: Password complexity/);
  assert.match(domain, /IA\.L2-3\.5\.3: Multi-factor/);
  assert.doesNotMatch(practice + domain, /3\.5\.[78][^\n]*(?:MFA|Multi-factor)/i);
  assert.match(practice, /dodcio\.defense\.gov\/Portals\/0\/Documents\/CMMC\/ModelOverview/);
});

test('weighted scoring, eligibility and CUI are not inferred from shortcuts', () => {
  const expert = read('skills/cmmc-expert/SKILL.md');
  const objectives = read('skills/cmmc-assessment-objectives/SKILL.md');
  assert.match(expert, /alone does not establish that a contractor possesses CUI/);
  assert.match(expert, /weighted score, not a count of MET practices/);
  assert.match(expert, /not discretionary partial credit/);
  assert.match(expert, /IA\.L2-3\.5\.3 and SC\.L2-3\.13\.11/);
  assert.doesNotMatch(expert, /88 of 110 practices must be MET|partial credit at assessor discretion/);
  for (const id of ['3.1.20', '3.1.22', '3.12.4', '3.10.3', '3.10.4', '3.10.5']) assert.ok(expert.includes(id));
  assert.match(objectives, /CA\.L2-3\.12\.4 cannot be on a Level 2 POA&M/);
  assert.match(expert, /ecfr\.gov\/current\/title-32\/section-170\.21/);
  assert.match(expert, /ecfr\.gov\/current\/title-32\/section-170\.24/);
});

test('working aids require qualified review and no invented assessment selection', () => {
  for (const path of ['commands/practice-check.md', 'commands/domain-guidance.md', 'commands/level-select.md', 'skills/cmmc-expert/SKILL.md', 'skills/cmmc-assessment-objectives/SKILL.md']) {
    const text = read(path);
    assert.match(text, /Review required/);
    assert.match(text, /qualified CMMC/);
    assert.match(text, /unverified/);
  }
  const level = read('commands/level-select.md');
  assert.match(level, /Level 2 may be self-assessed or C3PAO-assessed/);
  assert.doesNotMatch(level, /CUI \| Prime\/Sub \| Level 2 \| Triennial C3PAO/);
});
