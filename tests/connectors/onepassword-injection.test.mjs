import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const script = resolve('plugins/connectors/onepassword-connector/scripts/run.js');
test('mock provider injects into a child without forwarding its output', () => {
  const dir = mkdtempSync(join(tmpdir(), 'op-inject-'));
  try {
    const op = `#!/usr/bin/env node\nconst {spawnSync}=require('child_process');\nconst r=spawnSync(process.argv[4], process.argv.slice(5), {stdio:'inherit',env:{...process.env,TOKEN:'fake-injected-secret'}});\nprocess.exit(r.status ?? 1);\n`;
    const child = `require('fs').writeFileSync(process.env.RECORD, process.env.TOKEN === 'fake-injected-secret' ? 'ok' : 'bad'); console.log(process.env.TOKEN); console.error(process.env.TOKEN);`;
    writeFileSync(join(dir, 'op'), op, { mode: 0o755 });
    writeFileSync(join(dir, 'child.cjs'), child);
    const result = spawnSync(process.execPath, [script, '--', process.execPath, join(dir, 'child.cjs')], {
      encoding: 'utf8', env: { PATH: `${dir}:${process.env.PATH}`, TOKEN: 'op://vault/item/field', RECORD: join(dir, 'result') },
    });
    assert.equal(result.status, 0);
    assert.equal(readFileSync(join(dir, 'result'), 'utf8'), 'ok');
    assert.equal(result.stdout + result.stderr, '');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
