import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import IaCScanner from '../plugins/grc-engineer/scripts/scan-iac.js';

const INSECURE = `resource "aws_s3_bucket" "data" {
  bucket = "example-data"

  tags = {
    Name = "data"
  }
}

resource "aws_ebs_volume" "scratch" {
  availability_zone = "us-east-1a"
  size              = 40
  encrypted         = false

  tags = {
    encrypted = "no"
  }
}

resource "aws_cloudtrail" "main" {
  name           = "main"
  s3_bucket_name = "\${aws_s3_bucket.data.id}"
}

resource "aws_security_group" "open" {
  ingress {
    from_port   = 22
    to_port     = 22
    cidr_blocks = ["0.0.0.0/0"]
  }
}
`;

async function scan(dir) {
  const scanner = new IaCScanner(dir, ['SOC2', 'PCI-DSS', 'NIST'], {});
  const log = console.log;
  console.log = () => {};
  try {
    await scanner.scan();
  } finally {
    console.log = log;
  }
  return scanner;
}

function workspace(t, content) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scan-iac-fix-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'main.tf');
  fs.writeFileSync(file, content);
  return { dir, file };
}

test('--fix rewrites the file so every auto-fixable violation is gone on rescan', async (t) => {
  const { dir, file } = workspace(t, INSECURE);

  const before = await scan(dir);
  const fixable = before.violations.filter(v => v.autoFixable);
  assert.equal(fixable.length, 6);

  assert.equal(await before.applyFixes(), fixable.length);
  assert.equal(fs.readFileSync(`${file}.backup`, 'utf8'), INSECURE);

  const fixed = fs.readFileSync(file, 'utf8');
  assert.match(fixed, /\n  encrypted         = true\n/);
  assert.match(fixed, /\n    encrypted = "no"\n/, 'nested attributes with the same name are left alone');
  assert.match(fixed, /resource "aws_cloudtrail" "main" \{\n  (is_multi_region_trail|enable_log_file_validation) = true\n/);
  for (const companion of [
    'aws_s3_bucket_server_side_encryption_configuration',
    'aws_s3_bucket_versioning',
    'aws_s3_bucket_public_access_block'
  ]) {
    assert.match(fixed, new RegExp(`resource "${companion}" "data" \\{\\n  bucket = aws_s3_bucket\\.data\\.id\\n`));
  }

  const after = await scan(dir);
  assert.deepEqual(after.violations.filter(v => v.autoFixable), []);
  assert.deepEqual(after.violations.map(v => v.resource), ['aws_security_group.open'], 'manual-review violations are not touched');
});

test('--fix changes nothing and writes no backup when there is nothing to fix', async (t) => {
  const { dir, file } = workspace(t, INSECURE);
  await (await scan(dir)).applyFixes();
  fs.rmSync(`${file}.backup`);
  const fixedOnce = fs.readFileSync(file, 'utf8');

  assert.equal(await (await scan(dir)).applyFixes(), 0);
  assert.equal(fs.readFileSync(file, 'utf8'), fixedOnce);
  assert.equal(fs.existsSync(`${file}.backup`), false);
});

test('a resource is scanned to its real closing brace, past nested blocks', async (t) => {
  const { dir } = workspace(t, `resource "aws_ebs_volume" "v" {
  tags = {
    Name = "v"
  }
  encrypted = true
}
`);
  assert.deepEqual((await scan(dir)).violations, []);
});
