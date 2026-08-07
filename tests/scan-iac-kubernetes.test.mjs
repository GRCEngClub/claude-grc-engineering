// Regression tests for the Kubernetes dispatch in scan-iac. Before the fix,
// scanYaml called an undefined scanKubernetesResource inside a broad
// try/catch, so every Kubernetes document was silently skipped and no
// finding was ever produced for k8s manifests.
import test from 'node:test';
import assert from 'node:assert/strict';

import IaCScanner from '../plugins/grc-engineer/scripts/scan-iac.js';

function scanManifest(yamlText) {
  const scanner = new IaCScanner('.', ['SOC2'], {});
  scanner.scanYaml('manifest.yaml', yamlText);
  return scanner;
}

test('kubernetes: a PVC with no encryption indicators produces a finding instead of being silently skipped', () => {
  const scanner = scanManifest([
    'apiVersion: v1',
    'kind: PersistentVolumeClaim',
    'metadata:',
    '  name: data-claim',
    'spec:',
    '  accessModes: [ReadWriteOnce]',
    '  resources:',
    '    requests:',
    '      storage: 10Gi',
  ].join('\n'));

  assert.equal(scanner.violations.length, 1);
  assert.equal(scanner.violations[0].severity, 'MEDIUM');
  assert.equal(scanner.violations[0].resource, 'PersistentVolumeClaim.data-claim');
  assert.match(scanner.violations[0].issue, /does not reference an encrypted StorageClass/);
});

test('kubernetes: a bare storageClassName reference is not accepted as encryption evidence', () => {
  const scanner = scanManifest([
    'apiVersion: v1',
    'kind: PersistentVolumeClaim',
    'metadata:',
    '  name: data-claim',
    'spec:',
    '  storageClassName: gp3',
    '  accessModes: [ReadWriteOnce]',
  ].join('\n'));

  assert.equal(scanner.violations.length, 1);
  assert.match(scanner.violations[0].issue, /cannot resolve.*encryption at rest is unverified/);
});

test('kubernetes: an explicit encryption indicator satisfies the check', () => {
  const scanner = scanManifest([
    'apiVersion: v1',
    'kind: PersistentVolume',
    'metadata:',
    '  name: encrypted-pv',
    'spec:',
    '  csi:',
    '    driver: ebs.csi.aws.com',
    '    volumeAttributes:',
    '      encrypted: "true"',
  ].join('\n'));

  assert.equal(scanner.violations.length, 0);
});

test('kubernetes: kinds outside the rule resource list are ignored', () => {
  const scanner = scanManifest([
    'apiVersion: apps/v1',
    'kind: Deployment',
    'metadata:',
    '  name: web',
  ].join('\n'));

  assert.equal(scanner.violations.length, 0);
});

test('kubernetes: multi-document manifests are each dispatched', () => {
  const scanner = scanManifest([
    'apiVersion: v1',
    'kind: PersistentVolumeClaim',
    'metadata:',
    '  name: claim-a',
    '---',
    'apiVersion: v1',
    'kind: PersistentVolumeClaim',
    'metadata:',
    '  name: claim-b',
  ].join('\n'));

  assert.equal(scanner.violations.length, 2);
});
