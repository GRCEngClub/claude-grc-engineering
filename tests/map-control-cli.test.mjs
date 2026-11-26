import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../plugins/grc-engineer/scripts/map-control.js', import.meta.url));

function run(...args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
}

function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'map-control-'));
  const file = path.join(dir, 'main.tf');
  fs.writeFileSync(file, 'resource "aws_ebs_volume" "v" {\n  encrypted = true\n}\n');
  return { dir, file };
}

test('map-control: each documented framework maps a Terraform file', () => {
  for (const framework of ['soc2', 'iso27001', 'nist800-53', 'NIST80053']) {
    const { file } = fixture();
    const result = run(file, framework);
    assert.equal(result.status, 0, `${framework}: ${result.stderr}`);
    assert.match(result.stdout, /Mappings found: [1-9]/);
  }
});

test('map-control: an unsupported framework fails with the supported list', () => {
  const { file } = fixture();
  const result = run(file, 'pcidss');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unsupported framework: pcidss\. Use: soc2, iso27001, nist800-53/);
});

test('map-control: a directory gets a clear error pointing at scan-iac', () => {
  const { dir } = fixture();
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /is a directory.*scan-iac/);
});
