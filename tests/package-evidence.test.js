import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync, symlinkSync, rmSync, utimesSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const script = resolve('plugins/grc-engineer/scripts/package-evidence.py');
test('encrypts real evidence to verified GPG key and rejects unsafe inputs', () => {
  const dir = mkdtempSync(join(tmpdir(), 'evidence-test-'));
  const home = join(dir, 'gnupg'); mkdirSync(home, { mode: 0o700 });
  const env = { ...process.env, GNUPGHOME: home, TZ: 'UTC' };
  const run = (cmd, args, extra = {}) => spawnSync(cmd, args, { env, encoding: 'utf8', ...extra });
  try {
    const key = run('gpg', ['--batch', '--passphrase', '', '--quick-generate-key', 'Test Recipient <test@example.invalid>', 'rsa2048', 'encrypt', '0']);
    assert.equal(key.status, 0, key.stderr);
    const listing = run('gpg', ['--batch', '--with-colons', '--fingerprint', '--list-keys']);
    const fingerprint = listing.stdout.split('\n').find(x => x.startsWith('fpr:')).split(':')[9];
    const second = run('gpg', ['--batch', '--passphrase', '', '--quick-generate-key', 'Other Recipient <other@example.invalid>', 'rsa2048', 'encrypt', '0']);
    assert.equal(second.status, 0, second.stderr);
    const secondListing = run('gpg', ['--batch', '--with-colons', '--fingerprint', '--list-keys', 'other@example.invalid']);
    const secondFingerprint = secondListing.stdout.split('\n').find(x => x.startsWith('fpr:')).split(':')[9];
    writeFileSync(join(home, 'gpg.conf'), `encrypt-to ${secondFingerprint}\n`);
    const source = join(dir, 'evidence'); mkdirSync(source); mkdirSync(join(source, 'nested'));
    writeFileSync(join(source, 'nested', 'proof.txt'), 'test evidence\n');
    writeFileSync(join(source, 'nested', 'MANIFEST.json'), 'nested evidence\n');
    for (const [name, seconds] of [['old.txt', 0], ['future.txt', 4354819200], ['normal.txt', 946684801]]) {
      const path = join(source, 'nested', name);
      writeFileSync(path, `${name} evidence\n`);
      utimesSync(path, seconds, seconds);
      assert.equal(statSync(path).mtimeMs / 1000, seconds, `filesystem must support ${name} timestamp`);
    }
    const output = join(dir, 'package.gpg');
    const result = run('python3', [script, source, output, fingerprint]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Encrypted package SHA-256: [0-9a-f]{64}/);
    assert.equal(readFileSync(output).includes(Buffer.from('test evidence')), false);
    const packets = run('gpg', ['--no-options', '--batch', '--list-packets', output]);
    assert.equal((packets.stdout.match(/:pubkey enc packet:/g) || []).length, 1);
    assert.ok(packets.stdout.toUpperCase().includes(fingerprint.slice(-16)));
    const digest = run('python3', ['-c', 'import hashlib,sys; print(hashlib.sha256(open(sys.argv[1], "rb").read()).hexdigest())', output]);
    assert.ok(result.stdout.includes(digest.stdout.trim()));
    const tampered = readFileSync(output); tampered[Math.floor(tampered.length / 2)] ^= 1;
    const tamperedPath = join(dir, 'tampered.gpg'); writeFileSync(tamperedPath, tampered);
    assert.notEqual(run('gpg', ['--batch', '--decrypt', tamperedPath]).status, 0);
    const zip = join(dir, 'decrypted.zip');
    const decrypt = run('gpg', ['--batch', '--output', zip, '--decrypt', output]);
    assert.equal(decrypt.status, 0, decrypt.stderr);
    const extracted = join(dir, 'extracted');
    const validate = run('python3', ['-c', `import hashlib,json,pathlib,sys,zipfile
with zipfile.ZipFile(sys.argv[1]) as z:
 m=json.loads(z.read('MANIFEST.json'))
 assert z.read('nested/proof.txt') == b'test evidence\\n'
 for name, timestamp in [('old.txt', (1980,1,1,0,0,0)), ('future.txt', (2107,12,31,23,59,58)), ('normal.txt', (2000,1,1,0,0,0))]:
  assert z.getinfo('nested/' + name).date_time == timestamp
  assert z.read('nested/' + name) == (name + ' evidence\\n').encode()
 z.extractall(sys.argv[2])
 for entry in m['files']:
  data=(pathlib.Path(sys.argv[2])/entry['path']).read_bytes()
  assert entry['sha256'] == hashlib.sha256(data).hexdigest()
  assert entry['size'] == len(data)
 assert (pathlib.Path(sys.argv[2])/'nested'/'MANIFEST.json').read_text() == 'nested evidence\\n'
`, zip, extracted]);
    assert.equal(validate.status, 0, validate.stderr);
    for (const kind of ['file', 'empty-directory', 'nonempty-directory']) {
      const reserved = join(source, 'MANIFEST.json');
      if (kind === 'file') writeFileSync(reserved, 'collision');
      else {
        mkdirSync(reserved);
        if (kind === 'nonempty-directory') writeFileSync(join(reserved, 'proof.txt'), 'collision');
      }
      const collisionOutput = join(dir, `${kind}.gpg`);
      const collision = run('python3', [script, source, collisionOutput, fingerprint]);
      assert.notEqual(collision.status, 0, kind);
      assert.match(collision.stderr, /MANIFEST\.json is reserved/);
      assert.equal(existsSync(collisionOutput), false);
      rmSync(reserved, { recursive: true, force: true });
    }
    assert.notEqual(run('python3', [script, source, output, fingerprint]).status, 0);
    assert.notEqual(run('python3', [script, source, join(source, 'inside.gpg'), fingerprint]).status, 0);
    assert.notEqual(run('python3', [script, source, join(dir, 'short.gpg'), fingerprint.slice(-16)]).status, 0);
    symlinkSync(join(source, 'nested', 'proof.txt'), join(source, 'link'));
    assert.notEqual(run('python3', [script, source, join(dir, 'link.gpg'), fingerprint]).status, 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
