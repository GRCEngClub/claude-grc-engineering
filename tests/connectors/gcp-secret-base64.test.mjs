import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const script = resolve('plugins/connectors/gcp-secret-metadata/scripts/run.js');
test('accepts canonical base64 variants and suppresses payloads and child output', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gcp-base64-'));
  try {
    writeFileSync(join(dir, 'gcloud'), '#!/usr/bin/env node\nconsole.log(process.env.RESPONSE); console.error("provider-sensitive");\n', { mode: 0o755 });
    const child = join(dir, 'child.cjs');
    writeFileSync(child, 'require("fs").writeFileSync(process.env.RECORD, process.env.GCP_SECRET_VALUE); console.log(process.env.GCP_SECRET_VALUE); console.error(process.env.GCP_SECRET_VALUE);\n');
    const record = join(dir, 'record');
    const run = response => spawnSync(process.execPath, [script, 'project-one', 'synthetic', 'latest', 'GCP_SECRET_VALUE', '--', process.execPath, child], {
      encoding: 'utf8', env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, RESPONSE: response, RECORD: record }, timeout: 5000,
    });
    for (const encoded of ['fn5-Pw==', 'fn5-Pw', 'fn5+Pw==', 'fn5+Pw']) {
      const result = run(encoded);
      assert.equal(result.status, 0, encoded);
      assert.equal(result.stdout + result.stderr, '', encoded);
      assert.deepEqual(readFileSync(record), Buffer.from([0x7e, 0x7e, 0x7e, 0x3f]));
      rmSync(record);
    }
    for (const encoded of ['fn5-Pw=', 'fn5-Pw===', 'fn5-Px==', 'fn5-Px', 'fn5-Pw==A', 'fn5+Pw=', 'fn5-Pw==\nextra', 'AA-_+/', 'A', 'AAAA=', 'ab=c']) {
      const result = run(encoded);
      assert.equal(result.status, 1, encoded);
      assert.equal(result.stdout, '', encoded);
      assert.doesNotMatch(result.stderr, /provider-sensitive|~~~\?|fn5-Pw/, encoded);
      assert.equal(existsSync(record), false, encoded);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
