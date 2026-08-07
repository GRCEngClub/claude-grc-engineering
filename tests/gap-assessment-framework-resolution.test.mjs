import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveRequestedFrameworks, EXIT } from '../plugins/grc-engineer/scripts/gap-assessment.js';

// Stub SCF client: only HIPAA and SOC2 resolve, everything else returns null,
// mirroring frameworkSummary() behaviour for labels absent from the crosswalk.
const stubScf = {
  async frameworkSummary(label) {
    const known = {
      'HIPAA': { framework_id: 'usa-federal-hipaa-security-rule', display_name: 'HIPAA Security Rule' },
      'SOC2': { framework_id: 'general-aicpa-tsc-2017', display_name: 'AICPA TSC (SOC 2)' },
    };
    return known[label] || null;
  }
};

test('exit code for unresolved frameworks is distinct and non-zero', () => {
  assert.equal(EXIT.UNRESOLVED_FRAMEWORK, 7);
  assert.notEqual(EXIT.UNRESOLVED_FRAMEWORK, EXIT.OK);
});

test('frameworks present in the crosswalk resolve with their canonical id', async () => {
  const { resolved, unresolved } = await resolveRequestedFrameworks(stubScf, ['HIPAA', 'SOC2']);
  assert.equal(unresolved.length, 0);
  assert.deepEqual(resolved.map(r => r.framework_id), [
    'usa-federal-hipaa-security-rule',
    'general-aicpa-tsc-2017',
  ]);
});

test('an unknown framework label is reported as unresolved, never silently dropped', async () => {
  const { resolved, unresolved } = await resolveRequestedFrameworks(stubScf, ['NOT-A-REAL-FRAMEWORK']);
  assert.equal(resolved.length, 0);
  assert.equal(unresolved.length, 1);
  assert.equal(unresolved[0].label, 'NOT-A-REAL-FRAMEWORK');
  assert.match(unresolved[0].reason, /no match in the SCF crosswalk/i);
});

test('HITRUST-CSF gets the specific no-public-crosswalk explanation', async () => {
  const { unresolved } = await resolveRequestedFrameworks(stubScf, ['HITRUST-CSF']);
  assert.equal(unresolved.length, 1);
  assert.match(unresolved[0].reason, /proprietary/i);
  assert.match(unresolved[0].reason, /crosswalk/i);
});

test('a mixed request separates resolved from unresolved instead of averaging them away', async () => {
  const { resolved, unresolved } = await resolveRequestedFrameworks(stubScf, ['HIPAA', 'HITRUST-CSF', 'garbage']);
  assert.deepEqual(resolved.map(r => r.label), ['HIPAA']);
  assert.deepEqual(unresolved.map(u => u.label), ['HITRUST-CSF', 'garbage']);
});
