#!/usr/bin/env python3
"""Package a reviewed directory into a GnuPG-encrypted ZIP on a trusted host."""
import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
import zipfile


def package(source, output, fingerprint):
    # Fingerprints must have been independently verified by the operator.
    fingerprint = fingerprint.upper()
    if not re.fullmatch(r'(?:[0-9A-F]{40}|[0-9A-F]{64})', fingerprint):
        raise ValueError('recipient must be a full 40- or 64-digit fingerprint')
    source = Path(source)
    if source.is_symlink():
        raise ValueError('source must not be a symbolic link')
    source = source.resolve(strict=True)
    output = Path(output).absolute()
    if not source.is_dir():
        raise ValueError('source must be a directory')
    if output.parent.resolve(strict=True).is_relative_to(source):
        raise ValueError('output must be outside the evidence directory')
    listing = subprocess.run(['gpg', '--no-options', '--batch', '--with-colons', '--fingerprint', '--list-keys', fingerprint], capture_output=True, check=True, text=True)
    primary = []
    expect_primary = False
    for line in listing.stdout.splitlines():
        fields = line.split(':')
        if fields[0] == 'pub':
            expect_primary = True
        elif fields[0] == 'fpr' and expect_primary:
            primary.append(fields[9].upper())
            expect_primary = False
    if primary != [fingerprint]:
        raise ValueError('fingerprint must identify exactly one primary public key')
    buf = io.BytesIO()
    manifest = []
    with zipfile.ZipFile(buf, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for root, dirs, files in os.walk(source, followlinks=False, onerror=lambda e: (_ for _ in ()).throw(e)):
            dirs.sort()
            files.sort()
            if Path(root) == source and 'MANIFEST.json' in dirs + files:
                raise ValueError('MANIFEST.json is reserved')
            for name in dirs:
                if (Path(root) / name).is_symlink():
                    raise ValueError('symbolic links are not supported')
            for name in files:
                path = Path(root) / name
                relative = path.relative_to(source).as_posix()
                fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
                try:
                    info = os.fstat(fd)
                    if not stat.S_ISREG(info.st_mode):
                        raise ValueError('only regular files are supported')
                    with os.fdopen(fd, 'rb') as f:
                        fd = -1
                        data = f.read()
                finally:
                    if fd != -1:
                        os.close(fd)
                entry = zipfile.ZipInfo.from_file(path, relative)
                entry.compress_type = zipfile.ZIP_DEFLATED
                archive.writestr(entry, data)
                manifest.append({'path': relative, 'sha256': hashlib.sha256(data).hexdigest(), 'size': len(data)})
        archive.writestr('MANIFEST.json', json.dumps({'algorithm': 'sha256', 'files': manifest}, indent=2) + '\n')
    encrypted = subprocess.run(['gpg', '--no-options', '--batch', '--yes', '--no-encrypt-to', '--trust-model', 'always', '--recipient', fingerprint, '--encrypt'], input=buf.getvalue(), capture_output=True, check=True).stdout
    fd = os.open(output, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    try:
        with os.fdopen(fd, 'wb') as f:
            f.write(encrypted)
    except BaseException:
        output.unlink(missing_ok=True)
        raise
    return hashlib.sha256(encrypted).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', help='reviewed evidence directory')
    parser.add_argument('output', help='new encrypted output file outside source')
    parser.add_argument('recipient_fingerprint', help='independently verified full primary-key fingerprint')
    args = parser.parse_args()
    try:
        digest = package(args.source, args.output, args.recipient_fingerprint)
    except (OSError, ValueError, subprocess.CalledProcessError, zipfile.BadZipFile) as exc:
        print(f'Packaging failed: {exc}', file=sys.stderr)
        return 1
    print(f'Encrypted package SHA-256: {digest}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
