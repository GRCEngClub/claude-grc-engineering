import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
const script=resolve('plugins/connectors/onepassword-connector/scripts/run.js');
test('rejects references outside allowlisted complete environment values before launching op',()=>{
  const dir=mkdtempSync(join(tmpdir(),'op-guard-'));
  try {
    const marker=join(dir,'called');
    writeFileSync(join(dir,'op'), `#!/usr/bin/env node\nrequire('fs').writeFileSync(process.env.MARKER,'called');`,{mode:0o755});
    for (const extra of [{PYTHONPATH:'op://v/i/f'}, {OTHER:'prefix op://v/i/f'}, {TOKEN:'prefix op://v/i/f'}, {OTHER:'op://v/i/f',TOKEN:'op://v/i/f'}]) {
      const r=spawnSync(process.execPath,[script,'--','cmd'],{encoding:'utf8',env:{PATH:`${dir}:${process.env.PATH}`,MARKER:marker,...extra}});
      assert.equal(r.status,2); assert.equal(existsSync(marker),false); assert.doesNotMatch(r.stderr,/op:\/\/v\/i\/f/);
    }
  } finally {rmSync(dir,{recursive:true,force:true});}
});
