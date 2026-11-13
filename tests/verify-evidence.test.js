import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

// Python creates adversarial ZIPs and exercises the public verifier CLI.
test('offline verifier rejects malformed and unsafe archives without extraction', () => {
  const fixture = String.raw`
import hashlib, json, os, stat, struct, subprocess, sys, tempfile, warnings, zipfile, zlib
script = sys.argv[1]
data = b'evidence'
entry = {'path':'proof.txt', 'size':len(data), 'sha256':hashlib.sha256(data).hexdigest()}
def manifest(files): return json.dumps({'algorithm':'sha256','files':files})
def check(members, ok=False, message=None, compression=zipfile.ZIP_STORED):
 with tempfile.TemporaryDirectory() as d:
  path = os.path.join(d, 'input.zip')
  with warnings.catch_warnings():
   warnings.simplefilter('ignore')
   with zipfile.ZipFile(path, 'w', compression=compression) as z:
    for name, value in members: z.writestr(name, value)
  result = subprocess.run([sys.executable, script, path], capture_output=True)
  assert (result.returncode == 0) == ok, (members, result.stderr)
  if message: assert message.encode() in result.stderr, result.stderr
  assert os.listdir(d) == ['input.zip']
valid = [('proof.txt',data),('MANIFEST.json',manifest([entry]))]
check(valid, True)
large = b'x' * 200000
check([('proof.txt',large),('MANIFEST.json',manifest([{**entry,'size':len(large),'sha256':hashlib.sha256(large).hexdigest()}]))], True, compression=zipfile.ZIP_DEFLATED)
check([('proof.txt',b'tampered'),('MANIFEST.json',manifest([entry]))])
check([('proof.txt',data),('extra',b'x'),('MANIFEST.json',manifest([entry]))])
check([('MANIFEST.json',manifest([entry]))])
check(valid + [('proof.txt',data)])
check([('../outside',data),('MANIFEST.json',manifest([]))])
check([('a/../outside',data),('MANIFEST.json',manifest([]))])
check([('C:/outside',data),('MANIFEST.json',manifest([]))])
check([('a\\b',data),('MANIFEST.json',manifest([]))])
check([('a',data),('a/b',data),('MANIFEST.json',manifest([{**entry,'path':'a'},{**entry,'path':'a/b'}]))], message='archive path collision')
link_data = b'target'
link_entry = {'path':'link', 'size':len(link_data), 'sha256':hashlib.sha256(link_data).hexdigest()}
check([('link',link_data),('MANIFEST.json',manifest([link_entry]))], True)
link = zipfile.ZipInfo('link'); link.create_system=3; link.external_attr=(stat.S_IFLNK | 0o777)<<16
check([(link,link_data),('MANIFEST.json',manifest([link_entry]))], message='only regular files are supported')
check([('MANIFEST.json','{"algorithm":"sha256","algorithm":"sha256","files":[]}')])
check([('MANIFEST.json',manifest([entry,entry]))])
check([('proof.txt',data),('MANIFEST.json',manifest([{**entry, 'size':True}]))])
check([('MANIFEST.json',b'not json')])
# Forge both size headers, with a matching manifest and CRC, to test the
# actual decompressed stream on either side of the declared size.
for declared in (len(data)-1, len(data)+1):
 with tempfile.TemporaryDirectory() as d:
  path = os.path.join(d, 'forged.zip')
  forged = {**entry, 'size':declared, 'sha256':hashlib.sha256(data[:declared]).hexdigest()}
  with zipfile.ZipFile(path, 'w', compression=zipfile.ZIP_DEFLATED) as z:
   z.writestr('proof.txt',data); z.writestr('MANIFEST.json',manifest([forged]))
  raw = bytearray(open(path,'rb').read())
  central = raw.index(b'PK\x01\x02')
  crc = zlib.crc32(data[:declared])
  for offset in (0, central):
   struct.pack_into('<I',raw,offset + (14 if offset == 0 else 16),crc)
   struct.pack_into('<I',raw,offset + (22 if offset == 0 else 24),declared)
  open(path,'wb').write(raw)
  result = subprocess.run([sys.executable,script,path],capture_output=True)
  assert result.returncode != 0 and (b'size' in result.stderr), result.stderr
`;
  const run = spawnSync('python3', ['-c', fixture, resolve('plugins/grc-engineer/scripts/verify-evidence.py')], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});
