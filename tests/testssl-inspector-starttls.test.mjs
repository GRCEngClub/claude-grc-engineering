import test from 'node:test';
import assert from 'node:assert/strict';

import {
  STARTTLS_PORTS,
  normalizeTargetFindings,
  testsslArgs,
  withDefaultStarttlsPort,
} from '../plugins/connectors/testssl-inspector/scripts/scan.js';

test('STARTTLS protocol allowlist excludes implicit TLS services', () => {
  assert.deepEqual(Object.keys(STARTTLS_PORTS), [
    'smtp',
    'imap',
    'pop3',
    'ftp',
    'ldap',
    'postgres',
    'mysql',
  ]);
  assert.equal(Object.hasOwn(STARTTLS_PORTS, 'smtps'), false);
});

test('STARTTLS default ports preserve explicit ports and handle bracketed IPv6', () => {
  assert.equal(withDefaultStarttlsPort('mail.example.com', 'smtp'), 'mail.example.com:25');
  assert.equal(withDefaultStarttlsPort('mail.example.com:587', 'smtp'), 'mail.example.com:587');
  assert.equal(withDefaultStarttlsPort('[2001:db8::1]', 'smtp'), '[2001:db8::1]:25');
  assert.equal(withDefaultStarttlsPort('[2001:db8::1]:587', 'smtp'), '[2001:db8::1]:587');
});

test('testssl args include --starttls only for explicit STARTTLS scans', () => {
  const starttlsArgs = testsslArgs('mail.example.com:25', 'full', 'smtp');
  const starttlsIndex = starttlsArgs.indexOf('--starttls');
  assert.notEqual(starttlsIndex, -1);
  assert.equal(starttlsArgs[starttlsIndex + 1], 'smtp');

  const implicitTlsArgs = testsslArgs('mail.example.com:465', 'full', null);
  assert.equal(implicitTlsArgs.includes('--starttls'), false);
});

test('docker testssl args write inside the container but read from host cache', () => {
  const args = testsslArgs('mail.example.com:25', 'full', 'smtp', '/tmp/scan-out', '/host/cache');
  const jsonArgIndex = args.indexOf('--jsonfile-pretty');

  assert.notEqual(jsonArgIndex, -1);
  assert.match(args[jsonArgIndex + 1], /^\/tmp\/scan-out\/testssl-raw-.*\.json$/);
  assert.match(args.__jsonPath, /^\/host\/cache\/testssl-raw-.*\.json$/);
});

test('STARTTLS findings use protocol-specific resource URIs', () => {
  const finding = normalizeTargetFindings([], 'mail.example.com:25', 'run-1', 'unknown', null, 'smtp', 'mail.example.com');
  assert.equal(finding.resource.uri, 'starttls+smtp://mail.example.com:25/');
  assert.equal(finding.metadata.target, 'mail.example.com');
  assert.equal(finding.metadata.effective_target, 'mail.example.com:25');
  assert.equal(finding.metadata.starttls, 'smtp');
});

test('STARTTLS resource URIs preserve bracketed IPv6 literals', () => {
  const finding = normalizeTargetFindings([], '[2001:db8::1]:25', 'run-1', 'unknown', null, 'smtp');
  assert.equal(finding.resource.id, '[2001:db8::1]:25');
  assert.equal(finding.resource.uri, 'starttls+smtp://[2001:db8::1]:25/');
  assert.equal(finding.metadata.host, '[2001:db8::1]');
  assert.equal(finding.metadata.port, 25);
});
