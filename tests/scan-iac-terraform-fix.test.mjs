import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import IaCScanner from '../plugins/personas/engineer/scripts/scan-iac.js';

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

const BUCKET = `resource "aws_s3_bucket" "data" {
  bucket = "example-data"
}
`;

const ENCRYPTED = `
resource "aws_s3_bucket_server_side_encryption_configuration" "data" {
  bucket = aws_s3_bucket.data.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
`;

const VERSIONED = `
resource "aws_s3_bucket_versioning" "data" {
  bucket = aws_s3_bucket.data.id

  versioning_configuration {
    status = "Enabled"
  }
}
`;

const BLOCKED = `
resource "aws_s3_bucket_public_access_block" "data" {
  bucket = aws_s3_bucket.data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
`;

function issuesFor(scanner, resource) {
  return scanner.violations.filter(v => v.resource === resource).map(v => v.issue);
}

async function fixAndRescan(dir) {
  await (await scan(dir)).applyFixes();
  return scan(dir);
}

test('a fully protected bucket has no violations', async (t) => {
  const { dir } = workspace(t, BUCKET + ENCRYPTED + VERSIONED + BLOCKED);
  assert.deepEqual((await scan(dir)).violations, []);
});

test('a companion that is present but switched off is reported, not auto-fixed', async (t) => {
  const { dir, file } = workspace(t, BUCKET + ENCRYPTED
    + VERSIONED.replace('"Enabled"', '"Suspended"')
    + BLOCKED.replace('ignore_public_acls      = true', 'ignore_public_acls      = false'));
  const original = fs.readFileSync(file, 'utf8');

  const scanner = await scan(dir);
  assert.deepEqual(issuesFor(scanner, 'aws_s3_bucket.data').sort(), [
    'S3 bucket public access block does not set all four flags to true',
    'S3 bucket versioning is configured but its status is not "Enabled"'
  ]);
  assert.deepEqual(scanner.violations.filter(v => v.autoFixable), []);
  assert.equal(await scanner.applyFixes(), 0);
  assert.equal(fs.readFileSync(file, 'utf8'), original);
});

test('a setting that only appears in a comment does not count as enabled', async (t) => {
  const { dir } = workspace(t, BUCKET + ENCRYPTED + BLOCKED
    + VERSIONED.replace('status = "Enabled"', 'status = "Suspended" # status = "Enabled"'));
  assert.deepEqual(issuesFor(await scan(dir), 'aws_s3_bucket.data'), [
    'S3 bucket versioning is configured but its status is not "Enabled"'
  ]);
});

test('a companion of another bucket that merely mentions this one does not cover it', async (t) => {
  const other = `
resource "aws_s3_bucket" "other" {
  bucket = "example-other"
}

resource "aws_s3_bucket_versioning" "other" {
  bucket     = aws_s3_bucket.other.id
  depends_on = [aws_s3_bucket.data]

  # see aws_s3_bucket.data.id
  versioning_configuration {
    status = "Enabled"
  }
}
`;
  const { dir, file } = workspace(t, BUCKET + ENCRYPTED + BLOCKED + other);

  assert.ok(issuesFor(await scan(dir), 'aws_s3_bucket.data').includes('S3 bucket versioning is not enabled'));

  const after = await fixAndRescan(dir);
  assert.deepEqual(issuesFor(after, 'aws_s3_bucket.data'), []);
  assert.match(fs.readFileSync(file, 'utf8'), /resource "aws_s3_bucket_versioning" "data" \{\n  bucket = aws_s3_bucket\.data\.id\n/);
});

test('a generated companion takes an unused label when the bucket name is already taken', async (t) => {
  const squatter = `
resource "aws_s3_bucket" "other" {
  bucket = "example-other"
}

resource "aws_s3_bucket_versioning" "data" {
  bucket = aws_s3_bucket.other.id

  versioning_configuration {
    status = "Enabled"
  }
}
`;
  const { dir, file } = workspace(t, BUCKET + ENCRYPTED + BLOCKED + squatter);

  const after = await fixAndRescan(dir);
  const fixed = fs.readFileSync(file, 'utf8');
  assert.equal(fixed.match(/resource "aws_s3_bucket_versioning" "data" \{/g).length, 1);
  assert.match(fixed, /resource "aws_s3_bucket_versioning" "data_2" \{\n  bucket = aws_s3_bucket\.data\.id\n/);
  assert.deepEqual(issuesFor(after, 'aws_s3_bucket.data'), []);
});

test('companions for count and for_each buckets carry the instance key', async (t) => {
  const { dir, file } = workspace(t, `resource "aws_s3_bucket" "counted" {
  count  = 2
  bucket = "example-\${count.index}"
}

resource "aws_s3_bucket" "keyed" {
  for_each = toset(["a", "b"])
  bucket   = "example-\${each.key}"
}
`);

  const after = await fixAndRescan(dir);
  const fixed = fs.readFileSync(file, 'utf8');
  assert.doesNotMatch(fixed, /aws_s3_bucket\.(counted|keyed)\.id/);
  assert.equal(fixed.match(/\n  count  = length\(aws_s3_bucket\.counted\)\n  bucket = aws_s3_bucket\.counted\[count\.index\]\.id\n/g).length, 3);
  assert.equal(fixed.match(/\n  for_each = aws_s3_bucket\.keyed\n  bucket   = each\.value\.id\n/g).length, 3);
  assert.deepEqual(after.violations, []);

  assert.equal(await after.applyFixes(), 0);
  assert.equal(fs.readFileSync(file, 'utf8'), fixed);
});

test('a multi-line value is replaced whole, and a trailing comment is kept', async (t) => {
  const { dir, file } = workspace(t, `resource "aws_cloudtrail" "main" {
  name = "main"
  is_multi_region_trail = (
    false
  )
  enable_log_file_validation = true
}

resource "aws_ebs_volume" "scratch" {
  size      = 40
  encrypted = false # temporary
}
`);

  const after = await fixAndRescan(dir);
  assert.equal(fs.readFileSync(file, 'utf8'), `resource "aws_cloudtrail" "main" {
  name = "main"
  is_multi_region_trail = true
  enable_log_file_validation = true
}

resource "aws_ebs_volume" "scratch" {
  size      = 40
  encrypted = true # temporary
}
`);
  assert.deepEqual(after.violations, []);
});

test('resource headers inside comments and heredocs are not resources', async (t) => {
  const content = `/*
resource "aws_s3_bucket" "commented" {
  bucket = "example"
}
*/

# resource "aws_ebs_volume" "hashed" {

resource "aws_ssm_document" "docs" {
  name    = "docs"
  content = <<EOT
resource "aws_s3_bucket" "example" {
  bucket = "example"
}

resource "aws_ebs_volume" "example" {
  encrypted = false
}
EOT
}
`;
  const { dir, file } = workspace(t, content);

  const scanner = await scan(dir);
  assert.deepEqual(scanner.violations, []);
  assert.equal(await scanner.applyFixes(), 0);
  assert.equal(fs.readFileSync(file, 'utf8'), content);
});

test('a companion in a sibling file of the same module covers the bucket', async (t) => {
  const { dir, file } = workspace(t, BUCKET);
  fs.writeFileSync(path.join(dir, 'protection.tf'), ENCRYPTED + VERSIONED + BLOCKED);

  const scanner = await scan(dir);
  assert.deepEqual(scanner.violations, []);
  assert.equal(await scanner.applyFixes(), 0);
  assert.equal(fs.readFileSync(file, 'utf8'), BUCKET);
});

test('a value that only starts with an enabled literal is not treated as enabled', async (t) => {
  const { dir } = workspace(t, BUCKET
    + ENCRYPTED.replace('"AES256"', 'var.kms ? "aws:kms" : "AES256"')
    + VERSIONED.replace('"Enabled"', '"Enabled" == "Enabled" ? "Suspended" : "Enabled"')
    + BLOCKED.replace('block_public_acls       = true', 'block_public_acls       = true && var.block_public_acls'));

  const scanner = await scan(dir);
  assert.deepEqual(issuesFor(scanner, 'aws_s3_bucket.data').sort(), [
    'S3 bucket encryption configuration does not set a recognised sse_algorithm; encryption is unverified',
    'S3 bucket public access block does not set all four flags to true',
    'S3 bucket versioning is configured but its status is not "Enabled"'
  ]);
  assert.equal(await scanner.applyFixes(), 0);
});

test('a bucket reference in a block comment or an unused branch does not cover the bucket', async (t) => {
  const others = `
resource "aws_s3_bucket" "other" {
  bucket = "example-other"
}

resource "aws_s3_bucket_versioning" "other" {
  bucket = aws_s3_bucket.other.id /* replaces aws_s3_bucket.data.id */

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "either" {
  bucket = var.primary ? aws_s3_bucket.data.id : aws_s3_bucket.other.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
`;
  const { dir, file } = workspace(t, BUCKET + ENCRYPTED + others);

  const scanner = await scan(dir);
  const data = scanner.violations.filter(v => v.resource === 'aws_s3_bucket.data');
  assert.deepEqual(data.map(v => [v.issue, v.autoFixable]).sort(), [
    ['S3 bucket does not have public access blocks configured: aws_s3_bucket_public_access_block.either refers to this bucket through an expression this scanner cannot resolve', false],
    ['S3 bucket versioning is not enabled', true]
  ]);

  await scanner.applyFixes();
  const fixed = fs.readFileSync(file, 'utf8');
  assert.match(fixed, /resource "aws_s3_bucket_versioning" "data" \{/);
  assert.equal(fixed.match(/resource "aws_s3_bucket_public_access_block"/g).length, 1);
});

test('each.key is not accepted as the identity of a for_each bucket', async (t) => {
  const { dir } = workspace(t, `resource "aws_s3_bucket" "keyed" {
  for_each = toset(["a"])
  bucket   = each.key
}

resource "aws_s3_bucket_versioning" "keyed" {
  for_each = aws_s3_bucket.keyed
  bucket   = each.key

  versioning_configuration {
    status = "Enabled"
  }
}
`);
  const issues = issuesFor(await scan(dir), 'aws_s3_bucket.keyed');
  assert.ok(issues.some(issue => issue.startsWith('S3 bucket versioning is not enabled: aws_s3_bucket_versioning.keyed refers to this bucket through an expression')));
});

test('attributes after a block comment are still seen', async (t) => {
  const { dir, file } = workspace(t, `resource "aws_s3_bucket" "counted" {
  /* optional bucket */ count = var.create_bucket ? 1 : 0
  bucket = "example"
}

resource "aws_ebs_volume" "scratch" {
  size = 40
  /* temporary */ encrypted = false
}
`);

  const after = await fixAndRescan(dir);
  const fixed = fs.readFileSync(file, 'utf8');
  assert.doesNotMatch(fixed, /aws_s3_bucket\.counted\.id/);
  assert.equal(fixed.match(/bucket = aws_s3_bucket\.counted\[count\.index\]\.id/g).length, 3);
  assert.match(fixed, /\n  \/\* temporary \*\/ encrypted = true\n/);
  assert.deepEqual(after.violations, []);
});

test('a setting given as an expression is reported but never overwritten', async (t) => {
  const content = `resource "aws_cloudtrail" "main" {
  name                       = "main"
  is_multi_region_trail      = var.multi_region
  enable_log_file_validation = false
}
`;
  const { dir, file } = workspace(t, content);

  const scanner = await scan(dir);
  assert.deepEqual(scanner.violations.map(v => [v.issue, v.autoFixable]).sort(), [
    ['CloudTrail is not configured for all regions: is_multi_region_trail is set by an expression this scanner cannot resolve', false],
    ['CloudTrail log file validation is not enabled', true]
  ]);
  assert.equal(await scanner.applyFixes(), 1);
  assert.equal(fs.readFileSync(file, 'utf8'), content.replace('= false', '= true'));
});

test('single-line blocks and comments between tokens are read as written', async (t) => {
  const { dir, file } = workspace(t, `resource "aws_s3_bucket" "data" {
  bucket = "example-data"
  tags   = { versioning = "managed", server_side_encryption_configuration = "see below" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data" {
  bucket = aws_s3_bucket /* identity */ .data.id
  rule { apply_server_side_encryption_by_default { sse_algorithm = "AES256" } }
}

resource "aws_s3_bucket_versioning" "data" {
  bucket = aws_s3_bucket.data.id
  versioning_configuration { status = "Enabled" }
}
${BLOCKED}
resource "aws_ebs_volume" "scratch" {
  size = 40
  encrypted /* note */ = true
}
`);
  const original = fs.readFileSync(file, 'utf8');

  const scanner = await scan(dir);
  assert.deepEqual(scanner.violations, []);
  assert.equal(await scanner.applyFixes(), 0);
  assert.equal(fs.readFileSync(file, 'utf8'), original);
});

test('an enabled setting inside a heredoc does not count', async (t) => {
  const { dir } = workspace(t, BUCKET + ENCRYPTED + BLOCKED + `
resource "aws_s3_bucket_versioning" "data" {
  bucket = aws_s3_bucket.data.id

  versioning_configuration {
    status = "Suspended"
  }

  lifecycle {
    precondition {
      condition     = true
      error_message = <<EOT
  status = "Enabled"
EOT
    }
  }
}
`);
  assert.deepEqual(issuesFor(await scan(dir), 'aws_s3_bucket.data'), [
    'S3 bucket versioning is configured but its status is not "Enabled"'
  ]);
});

test('a companion that covers one instance, or may have none, is unresolved rather than coverage', async (t) => {
  const content = `resource "aws_s3_bucket" "counted" {
  count  = 2
  bucket = "example-\${count.index}"
}

resource "aws_s3_bucket_versioning" "first_only" {
  bucket = aws_s3_bucket.counted[0].id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket" "data" {
  bucket = "example-data"
}

resource "aws_s3_bucket_versioning" "maybe" {
  count  = 0
  bucket = aws_s3_bucket.data.id
  versioning_configuration { status = "Enabled" }
}
`;
  const { dir, file } = workspace(t, content);

  const scanner = await scan(dir);
  for (const [bucket, companion] of [['counted', 'first_only'], ['data', 'maybe']]) {
    const versioning = scanner.violations.filter(v => v.resource === `aws_s3_bucket.${bucket}` && v.issue.includes('versioning'));
    assert.deepEqual(versioning.map(v => [v.issue, v.autoFixable]), [
      [`S3 bucket versioning is not enabled: aws_s3_bucket_versioning.${companion} refers to this bucket through an expression this scanner cannot resolve`, false]
    ]);
  }

  await scanner.applyFixes();
  assert.equal(fs.readFileSync(file, 'utf8').match(/resource "aws_s3_bucket_versioning"/g).length, 2);
});

test('dynamic inline blocks count as inline configuration and get no competing resource', async (t) => {
  const content = `resource "aws_s3_bucket" "data" {
  bucket = "example-data"

  dynamic "versioning" {
    for_each = var.versioned ? [1] : []
    content {
      enabled = true
    }
  }

  dynamic "server_side_encryption_configuration" {
    for_each = [1]
    content {
      rule {
        apply_server_side_encryption_by_default {
          sse_algorithm = "AES256"
        }
      }
    }
  }
}
${BLOCKED}`;
  const { dir, file } = workspace(t, content);

  const scanner = await scan(dir);
  assert.deepEqual(scanner.violations, []);
  assert.equal(await scanner.applyFixes(), 0);
  assert.equal(fs.readFileSync(file, 'utf8'), content);
});
