import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

// Python creates adversarial ZIPs and exercises the public verifier CLI.
test('offline verifier rejects malformed and unsafe archives without extraction', () => {
  const fixture = String.raw`
import hashlib, json, os, stat, subprocess, sys, tempfile, warnings, zipfile
script = sys.argv[1]
data = b'evidence'
entry = {'path':'proof.txt', 'size':len(data), 'sha256':hashlib.sha256(data).hexdigest()}
def manifest(files): return json.dumps({'algorithm':'sha256','files':files})
def check(members, ok=False):
 with tempfile.TemporaryDirectory() as d:
  path = os.path.join(d, 'input.zip')
  with warnings.catch_warnings():
   warnings.simplefilter('ignore')
   with zipfile.ZipFile(path, 'w') as z:
    for name, value in members: z.writestr(name, value)
  result = subprocess.run([sys.executable, script, path], capture_output=True)
  assert (result.returncode == 0) == ok, (members, result.stderr)
  assert os.listdir(d) == ['input.zip']
valid = [('proof.txt',data),('MANIFEST.json',manifest([entry]))]
check(valid, True)
check([('proof.txt',b'tampered'),('MANIFEST.json',manifest([entry]))])
check([('proof.txt',data),('extra',b'x'),('MANIFEST.json',manifest([entry]))])
check([('MANIFEST.json',manifest([entry]))])
check(valid + [('proof.txt',data)])
check([('../outside',data),('MANIFEST.json',manifest([]))])
check([('a/../outside',data),('MANIFEST.json',manifest([]))])
check([('C:/outside',data),('MANIFEST.json',manifest([]))])
check([('a\\b',data),('MANIFEST.json',manifest([]))])
check([('a',data),('a/b',data),('MANIFEST.json',manifest([]))])
link = zipfile.ZipInfo('link'); link.create_system=3; link.external_attr=(stat.S_IFLNK | 0o777)<<16
check([(link,b'target'),('MANIFEST.json',manifest([]))])
check([('MANIFEST.json','{"algorithm":"sha256","algorithm":"sha256","files":[]}')])
check([('MANIFEST.json',manifest([entry,entry]))])
check([('proof.txt',data),('MANIFEST.json',manifest([{**entry, 'size':True}]))])
check([('MANIFEST.json',b'not json')])
`;
  const run = spawnSync('python3', ['-c', fixture, resolve('plugins/grc-engineer/scripts/verify-evidence.py')], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});
