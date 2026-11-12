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

test('provider scoping distinguishes CSP, non-CSP, CUI and SPD', () => {
  const expert = read('skills/cmmc-expert/SKILL.md');
  assert.match(expert, /170\.19\(c\)\(2\)\(i\), Table 4/);
  assert.match(expert, /\| CUI, with or without SPD \| Meet FedRAMP requirements[^\n]+\| Services are in the OSA assessment scope/);
  assert.match(expert, /\| SPD without CUI \| Services are in scope and assessed as Security Protection Assets \| Services are in scope and assessed as Security Protection Assets/);
  assert.match(expert, /\| Neither CUI nor SPD \| Does not meet the CMMC definition of an ESP \| Does not meet the CMMC definition of an ESP/);
  assert.match(expert, /170\.17\(c\)\(5\)/);
  assert.match(expert, /or\*\* meet equivalent security requirements/);
  assert.match(expert, /does \*\*not\*\* automatically exempt services from assessment/);
  assert.doesNotMatch(expert, /Only the enclave is in scope|those systems exit scope|accepted without separate re-assessment|CSP environment itself is verified via FedRAMP/);
});

test('staffing, affirmation and legal risk retain regulatory distinctions', () => {
  const expert = read('skills/cmmc-expert/SKILL.md');
  assert.match(expert, /at least two people: a Lead CCA and at least one other CCA/);
  assert.match(expert, /separate CCA performs quality assurance/);
  assert.match(expert, /170\.9\(b\)\(12\)–\(13\)/);
  assert.match(expert, /affirmation \*\*in SPRS\*\*/);
  assert.match(expert, /upon Conditional status, upon Final status, after POA&M closeout/i);
  assert.match(expert, /annual affirmations of both Level 2 \(C3PAO\) and Level 3 \(DIBCAC\)/);
  assert.match(expert, /170\.22\(a\)\(3\), \(b\)\(1\)–\(4\)/);
  assert.match(expert, /No safe-harbor assurance/);
  assert.match(expert, /do not by themselves establish contract eligibility/);
  assert.match(expert, /DFARS assessment score alone does not establish CMMC Level 2/);
  assert.doesNotMatch(expert, /minimum \*\*3 CCAs\*\*|affirm in SPRS\/eMASS|Safe-harbor posture/);
});


test('Level 1 uses FAR identifiers and preserves mapped Level 2 requirements', () => {
  const domain = read('commands/domain-guidance.md');
  const practice = read('commands/practice-check.md');
  for (const text of [domain, practice]) {
    assert.match(text, /32 CFR 170\.15\(c\)\(1\)\(ii\)/);
    assert.match(text, /AC\.L1-b\.1\.iii[^\n]*3\.1\.20/);
    assert.match(text, /SI\.L1-b\.1\.xiv[^\n]*3\.14\.4/);
    assert.doesNotMatch(text, /(?:AC|IA|MP|PE|SC|SI)\.L1-3\./);
    assert.match(text, /ModelOverviewv2\.pdf/);
    assert.match(text, /32 CFR 170\.14/);
  }
  assert.match(domain, /AC\.L1-b\.1\.iv[^\n]*3\.1\.22/);
  assert.match(domain, /AC\.L2-3\.1\.22/);
  assert.match(practice, /NIST SP 800-172 number with `e` suffix/);
});

test('selection remains contract-qualified and clock synchronization is protocol-neutral', () => {
  const level = read('commands/level-select.md');
  const expert = read('skills/cmmc-expert/SKILL.md');
  const objectives = read('skills/cmmc-assessment-objectives/SKILL.md');
  assert.match(level, /Without the contract, the requirement is unverified/);
  assert.match(level, /commercially available off-the-shelf items/);
  assert.match(level, /not automatic inheritance/);
  assert.match(level, /do not automatically assign a Level 2 status/);
  assert.doesNotMatch(level, /Inherits prime|Level 2\+ typically required|FCI only \| Any \| Level 1/);
  for (const text of [expert, objectives]) {
    assert.doesNotMatch(text, /(?:requires NTP sync|NTP sync is (?:still )?required)/i);
    assert.match(text, /does not prescribe NTP/);
    assert.match(text, /doi\.org\/10\.6028\/NIST\.SP\.800-171r2/);
  }
});


test('FCI and CUI do not categorically determine assessment or level', () => {
  const expert = read('skills/cmmc-expert/SKILL.md');
  assert.match(expert, /FCI alone does not categorically trigger a CMMC assessment/);
  assert.match(expert, /CUI alone does not categorically trigger a CMMC assessment or select its level/);
  assert.match(expert, /FCI and CUI definitions can overlap/);
  assert.match(expert, /section-170\.3/);
  assert.doesNotMatch(expert, /Triggers \*\*CMMC Level [12]\*\*/);
});

test('MFA and account review prompts do not assert unsupported automatic failure', () => {
  const expert = read('skills/cmmc-expert/SKILL.md');
  assert.match(expert, /SMS or push alone is not automatically a failure/);
  assert.match(expert, /Missing periodic account-review records alone do not automatically establish failure/);
  assert.match(expert, /local and network access to privileged accounts and network access to non-privileged accounts/);
  assert.doesNotMatch(expert, /Phishing-resistant MFA expected|Account review records missing/);
});

test('unverified catalogs and mappings are disabled; use official objective source', () => {
  const objectives = read('skills/cmmc-assessment-objectives/SKILL.md');
  const expert = read('skills/cmmc-expert/SKILL.md');
  const checklist = read('commands/evidence-checklist.md');
  for (const text of [objectives, expert]) {
    assert.match(text, /3\.13\.11[^\n]*unlettered/);
    assert.match(text, /doi\.org\/10\.6028\/NIST\.SP\.800-171A/);
    assert.doesNotMatch(text, /3\.13\.11\[a\]|Text below is verbatim|Each 800-171 requirement decomposes into \*\*lettered/);
  }
  assert.match(objectives, /catalog and revision crosswalk have been removed/);
  assert.match(objectives, /if inaccessible, say the objective is unverified/);
  assert.doesNotMatch(objectives, /^- \[a\]/m);
  assert.match(checklist, /identifier, if present/);
  assert.doesNotMatch(checklist, /lettered objectives/);
});
