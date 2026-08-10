// Regression tests for connector evaluation defects that produced wrong
// compliance verdicts rather than errors. Each case below failed against the
// pre-fix code, so a false pass cannot quietly come back.
import test from 'node:test';
import assert from 'node:assert/strict';

import { mostPermissiveSessionValue, sessionEvaluation } from '../plugins/connectors/okta-inspector/scripts/collect.js';
import { indexFinding } from '../plugins/connectors/splunk-inspector/scripts/collect.js';
import { isCriticalMonitor } from '../plugins/connectors/datadog-inspector/scripts/collect.js';
import { ageDays, parseYaml as parseTenableYaml } from '../plugins/connectors/tenable-inspector/scripts/collect.js';
import { parseYaml as parseCrowdstrikeYaml } from '../plugins/connectors/crowdstrike-inspector/scripts/collect.js';

const sessionRule = (key, value) => ({ actions: { signon: { session: { [key]: value } } } });

test('okta: unlimited session lifetime (0) is not discarded as falsy', () => {
  const rules = [sessionRule('maxSessionLifetimeMinutes', 0)];
  assert.equal(mostPermissiveSessionValue(rules, 'maxSessionLifetimeMinutes'), 0);
});

test('okta: unlimited outranks a bounded lifetime rather than losing to Math.max', () => {
  const rules = [
    sessionRule('maxSessionLifetimeMinutes', 60),
    sessionRule('maxSessionLifetimeMinutes', 0)
  ];
  assert.equal(mostPermissiveSessionValue(rules, 'maxSessionLifetimeMinutes'), 0);
});

test('okta: an unlimited session policy fails IAC-15', () => {
  const evaluation = sessionEvaluation({
    controlId: 'IAC-15',
    policyName: 'Default',
    value: 0,
    baselineMinutes: 720,
    label: 'session lifetime',
    baselineLabel: '>720min/12h baseline',
    remediationSummary: 'Cap it.',
    missingMessage: 'missing'
  });
  assert.equal(evaluation.status, 'fail');
  assert.match(evaluation.message, /unlimited/);
});

test('okta: a policy declaring no session setting is inconclusive, not pass', () => {
  assert.equal(mostPermissiveSessionValue([{ actions: {} }], 'maxSessionIdleMinutes'), null);
  const evaluation = sessionEvaluation({
    controlId: 'IAC-15.1',
    policyName: 'Default',
    value: null,
    baselineMinutes: 15,
    label: 'idle timeout',
    baselineLabel: '>15min baseline',
    remediationSummary: 'Cap it.',
    missingMessage: 'no rule declares maxSessionIdleMinutes'
  });
  assert.equal(evaluation.status, 'inconclusive');
});

test('okta: a compliant lifetime still passes', () => {
  const rules = [sessionRule('maxSessionLifetimeMinutes', 480)];
  const value = mostPermissiveSessionValue(rules, 'maxSessionLifetimeMinutes');
  const evaluation = sessionEvaluation({
    controlId: 'IAC-15',
    policyName: 'Default',
    value,
    baselineMinutes: 720,
    label: 'session lifetime',
    baselineLabel: '>720min/12h baseline',
    remediationSummary: 'Cap it.',
    missingMessage: 'missing'
  });
  assert.equal(evaluation.status, 'pass');
});

test('splunk: a size cap is not reinterpreted as a retention window', () => {
  const ctx = { runId: 'r', collectedAt: '2026-01-01T00:00:00Z', baseUrl: 'https://splunk.example.com', minRetentionDays: 365 };
  const doc = indexFinding({ name: 'main', content: { maxGlobalDataSizeMB: 500000 } }, ctx);
  assert.equal(doc.evaluations[0].status, 'inconclusive');
  assert.equal(doc.metadata.retention_days, null);
});

test('splunk: a real retention window is still evaluated', () => {
  const ctx = { runId: 'r', collectedAt: '2026-01-01T00:00:00Z', baseUrl: 'https://splunk.example.com', minRetentionDays: 365 };
  const compliant = indexFinding({ name: 'main', content: { frozenTimePeriodInSecs: 400 * 86400 } }, ctx);
  assert.equal(compliant.evaluations[0].status, 'pass');
  assert.equal(compliant.metadata.retention_days, 400);

  const short = indexFinding({ name: 'main', content: { frozenTimePeriodInSecs: 30 * 86400 } }, ctx);
  assert.equal(short.evaluations[0].status, 'fail');
});

test('datadog: integer priority 1 marks a monitor critical', () => {
  assert.equal(isCriticalMonitor({ priority: 1, name: 'checkout latency' }), true);
  assert.equal(isCriticalMonitor({ priority: 4, name: 'checkout latency' }), false);
  assert.equal(isCriticalMonitor({ priority: 4, name: 'prod checkout' }), true);
});

test('tenable: an unparseable last-seen date reports unknown age, not zero', () => {
  assert.equal(ageDays(undefined), null);
  assert.equal(ageDays('not-a-date'), null);
  assert.ok(ageDays(new Date(Date.now() - 10 * 86400000).toISOString()) > 9);
});

for (const [label, parse] of [['tenable', parseTenableYaml], ['crowdstrike', parseCrowdstrikeYaml]]) {
  test(`${label}: nested config defaults survive parsing`, () => {
    const config = parse([
      'version: 1',
      'source: inspector',
      'base_url: "https://example.com"',
      'defaults:',
      '  limit: 250',
      '  max_vulnerability_age_days: 7',
      ''
    ].join('\n'));
    assert.equal(config.base_url, 'https://example.com');
    assert.equal(config.defaults.limit, 250);
    assert.equal(config.defaults.max_vulnerability_age_days, 7);
  });

  test(`${label}: single-quoted scalars and inline comments parse cleanly`, () => {
    const config = parse([
      "base_url: 'https://cloud.example.com'",
      'quoted_with_comment: "value" # trailing note',
      'max_vulnerability_age_days: 30 # policy default',
      'verify_tls: true # keep on',
      'defaults: # section comment',
      '  limit: 100',
      ''
    ].join('\n'));
    assert.equal(config.base_url, 'https://cloud.example.com');
    assert.equal(config.quoted_with_comment, 'value');
    assert.equal(config.max_vulnerability_age_days, 30);
    assert.equal(config.verify_tls, true);
    assert.equal(config.defaults.limit, 100);
  });
}

test('datadog: names containing prod only as a substring are not critical', () => {
  assert.equal(isCriticalMonitor({ priority: 3, name: 'product catalog latency' }), false);
  assert.equal(isCriticalMonitor({ priority: 3, name: 'reproduction steps tracker' }), false);
  assert.equal(isCriticalMonitor({ priority: 3, name: 'Production checkout' }), true);
  assert.equal(isCriticalMonitor({ priority: 3, name: 'critical: db replica lag' }), true);
});
