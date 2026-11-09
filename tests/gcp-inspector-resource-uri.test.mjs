import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const collector = fileURLToPath(new URL('../plugins/connectors/gcp-inspector/scripts/collect.js', import.meta.url));
const project = 'example-project';
const ring = `projects/${project}/locations/global/keyRings/ring`;
const key = `${ring}/cryptoKeys/key`;

function collect(mode) {
  const dir = mkdtempSync(path.join(tmpdir(), 'gcp-uri-test-'));
  try {
    const bin = path.join(dir, 'bin');
    const config = path.join(dir, 'config', 'connectors');
    mkdirSync(bin, { recursive: true });
    mkdirSync(config, { recursive: true });
    writeFileSync(path.join(config, 'gcp-inspector.yaml'), `project_id: ${project}\n`);
    writeFileSync(path.join(bin, 'gcloud'), `#!/bin/sh
case "$*" in
  "projects get-iam-policy"*) echo '{"bindings":[]}' ;;
  "iam service-accounts list"*) echo '[]' ;;
  "storage buckets list"*) if [ "$MODE" = errors ]; then echo denied >&2; exit 1; else echo '[{"name":"example-bucket"}]'; fi ;;
  "logging sinks list"*) echo '[]' ;;
  "compute project-info describe"*) echo '{}' ;;
  "kms keyrings list"*--location=global*) if [ "$MODE" = empty ]; then echo '[]'; else echo '[{"name":"${ring}"}]'; fi ;;
  "kms keyrings list"*) echo '[]' ;;
  "kms keys list"*) if [ "$MODE" = errors ]; then echo denied >&2; exit 1; else echo '[{"name":"${key}","purpose":"ENCRYPT_DECRYPT"}]'; fi ;;
  *) exit 1 ;;
esac
`, { mode: 0o755 });
    const result = spawnSync(process.execPath, [collector, '--output=json'], {
      encoding: 'utf8', env: { ...process.env, HOME: dir, CLAUDE_GRC_CONFIG_DIR: path.join(dir, 'config'), PATH: `${bin}:${process.env.PATH}`, MODE: mode }
    });
    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(result.stdout);
    return JSON.parse(readFileSync(output.cache_path, 'utf8'));
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

test('all normal resources emit service-prefixed resource URIs', () => {
  const docs = collect('normal');
  assert.deepEqual(Object.fromEntries(docs.map(d => [d.resource.type, d.resource.uri])), {
    gcp_project_iam: `//cloudresourcemanager.googleapis.com/projects/${project}`,
    gcp_storage_bucket: '//storage.googleapis.com/example-bucket',
    gcp_logging: `//logging.googleapis.com/projects/${project}`,
    gcp_kms_key: `//cloudkms.googleapis.com/${key}`,
    gcp_compute_project: `//compute.googleapis.com/projects/${project}`
  });
});

test('error and empty KMS findings also have resource URIs', () => {
  const errors = Object.fromEntries(collect('errors').map(d => [d.resource.type, d.resource.uri]));
  assert.equal(errors.gcp_storage_project, `//cloudresourcemanager.googleapis.com/projects/${project}`);
  assert.equal(errors.gcp_kms_keyring, `//cloudkms.googleapis.com/${ring}`);
  const empty = collect('empty').find(d => d.resource.type === 'gcp_kms');
  assert.equal(empty.resource.uri, `//cloudresourcemanager.googleapis.com/projects/${project}`);
});
