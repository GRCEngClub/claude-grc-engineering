import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const collector = resolve('plugins/connectors/gcp-inspector/scripts/collect.js');
function run(mode, args = ['--services=secret-manager'], config = 'project_id: project-one\n') {
  const dir = mkdtempSync(join(tmpdir(), 'inspector-secret-'));
  try {
    mkdirSync(join(dir, 'bin')); mkdirSync(join(dir, 'config', 'connectors'), { recursive: true });
    writeFileSync(join(dir, 'config', 'connectors', 'gcp-inspector.yaml'), config);
    writeFileSync(join(dir, 'bin', 'gcloud'), `#!/usr/bin/env node
const fs=require('fs'), a=process.argv.slice(2), mode=process.env.MODE;
fs.appendFileSync(process.env.RECORD, JSON.stringify(a)+'\\n');
if(mode==='deny' && a[1]==='versions') { console.error('provider-sensitive'); process.exit(1); }
if(a[0]==='projects') { console.log(JSON.stringify({projectId:'project-one',projectNumber:'12345'})); process.exit(); }
if(a[0]!=='secrets') { console.log('[]'); process.exit(); }
const project=mode==='foreign'?'other-project':mode==='numeric'?'12345':'project-one';
const name=id=>\`projects/\${project}/secrets/\${id}\`;
if(a[1]==='list') console.log(JSON.stringify(mode==='empty'?[]:[{name:name('one'),payload:'sentinel'}, {name:name('two')}]));
else if(a[1]==='describe') console.log(JSON.stringify({name:name(a[2]),rotation:{rotationPeriod:'86400s'},labels:{hidden:'sentinel'}}));
else if(a[1]==='versions') console.log(JSON.stringify([{name:name(a[3])+'/versions/1',state:'ENABLED',payload:'sentinel'},{name:name(a[3])+'/versions/2',state:'DISABLED'}]));
else process.exit(1);
`, { mode: 0o755 });
    const record = join(dir, 'record');
    const r = spawnSync(process.execPath, [collector, ...args, '--output=json'], { encoding: 'utf8', env: { ...process.env, HOME: dir, CLAUDE_GRC_CONFIG_DIR: join(dir, 'config'), PATH: `${join(dir, 'bin')}:${process.env.PATH}`, RECORD: record, MODE: mode } });
    const calls = existsSync(record) ? readFileSync(record, 'utf8').trim().split('\n').map(JSON.parse) : [];
    const out = r.stdout ? JSON.parse(r.stdout) : null;
    const evidencePath = out?.summary?.secret_manager_evidence_path;
    const evidence = evidencePath ? JSON.parse(readFileSync(evidencePath, 'utf8')) : null;
    const findings = out ? JSON.parse(readFileSync(out.cache_path, 'utf8')) : null;
    const evidenceDir = join(dir, '.cache', 'claude-grc', 'evidence', 'gcp-inspector');
    return { r, calls, out, evidence, findings, modeBits: evidencePath ? statSync(evidencePath).mode & 0o777 : null, files: existsSync(evidenceDir) ? readdirSync(evidenceDir) : [] };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

test('opt-in metadata evidence spans all returned inventory and versions without payloads or conclusions', () => {
  const x = run('normal');
  assert.equal(x.r.status, 0, x.r.stderr); assert.equal(x.evidence.project_id, 'project-one');
  assert.equal(x.evidence.secrets.length, 2); assert.equal(x.evidence.secrets[0].versions.length, 2);
  assert.deepEqual(x.findings, []); assert.equal(x.out.summary.evaluations, 0); assert.equal(x.modeBits, 0o600);
  assert.doesNotMatch(JSON.stringify(x.evidence) + x.r.stdout + x.r.stderr, /sentinel|provider-sensitive/);
  assert.ok(x.calls.every(a => !a.includes('access') && !a.some(v => v.startsWith('--limit') || v.startsWith('--page-size'))));
  assert.ok(x.calls.every(a => a.includes('--project=project-one')));
});

test('empty inventory is evidence, permissions and out-of-scope results fail closed', () => {
  assert.deepEqual(run('empty').evidence.secrets, []);
  assert.equal(run('numeric').r.status, 0);
  for (const mode of ['deny', 'foreign']) {
    const x = run(mode); assert.equal(x.r.status, 4); assert.equal(x.evidence, null); assert.deepEqual(x.files, []);
    assert.equal(x.out.summary.errors, 1); assert.doesNotMatch(x.r.stdout + x.r.stderr, /provider-sensitive|other-project/);
  }
});

test('disabled by default, including config defaults', () => {
  const x = run('normal', [], 'project_id: project-one\ndefaults:\n  services: [logging]\n');
  assert.equal(x.r.status, 0); assert.ok(x.calls.every(a => a[0] !== 'secrets'));
  const y = run('normal', [], 'project_id: project-one\ndefaults:\n  services: [secret-manager]\n');
  assert.equal(y.r.status, 2); assert.deepEqual(y.calls, []);
});
