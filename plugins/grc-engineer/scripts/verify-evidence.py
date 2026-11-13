#!/usr/bin/env python3
"""Check a decrypted evidence ZIP against its manifest without extracting it."""
import argparse
import hashlib
import json
import re
import stat
import sys
import zipfile
import zlib
from pathlib import PurePosixPath

# Bound decompression and manifest parsing on the operator's trusted host.
MAX_TOTAL = 100 * 1024 * 1024
MAX_MANIFEST = 4 * 1024 * 1024
MAX_ENTRIES = 10000


def safe_path(name):
    if (not name or '\\' in name or '\x00' in name or name.startswith('/')
            or re.match(r'^[A-Za-z]:', name)
            or any(part in ('', '.', '..') for part in name.split('/'))):
        raise ValueError('unsafe archive path')
    return name


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('duplicate JSON key')
        result[key] = value
    return result


def verify(path):
    with zipfile.ZipFile(path) as archive:
        infos = archive.infolist()
        if len(infos) > MAX_ENTRIES:
            raise ValueError('too many entries')
        entries = {}
        total = 0
        for info in infos:
            name = safe_path(info.orig_filename)
            if name != info.filename or name in entries:
                raise ValueError('duplicate or invalid archive entry')
            mode = info.external_attr >> 16 if info.create_system == 3 else 0
            if info.is_dir() or (stat.S_IFMT(mode) not in (0, stat.S_IFREG)):
                raise ValueError('only regular files are supported')
            if info.flag_bits & 1:
                raise ValueError('encrypted ZIP entries are not supported')
            total += info.file_size
            if total > MAX_TOTAL:
                raise ValueError('archive exceeds verification size limit')
            entries[name] = info
        if 'MANIFEST.json' not in entries or entries['MANIFEST.json'].file_size > MAX_MANIFEST:
            raise ValueError('missing or oversized manifest')
        actual_total = 0

        def chunks(info, limit):
            nonlocal actual_total
            count = 0
            crc = 0
            if info.compress_type not in (zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED):
                raise ValueError('unsupported compression method')
            decompressor = zlib.decompressobj(-15) if info.compress_type == zipfile.ZIP_DEFLATED else None
            # ZipExtFile truncates output at the untrusted declared size. Read the
            # validated entry's compressed stream directly so extra output cannot
            # be hidden by a forged size and CRC for a prefix.
            with archive.open(info) as source:
                remaining = info.compress_size
                while remaining:
                    compressed = source._fileobj.read(min(65536, remaining))
                    if not compressed:
                        raise ValueError('truncated compressed entry')
                    remaining -= len(compressed)
                    while compressed:
                        if decompressor:
                            chunk = decompressor.decompress(compressed, 65536)
                            compressed = decompressor.unconsumed_tail
                        else:
                            chunk, compressed = compressed, b''
                        count += len(chunk)
                        actual_total += len(chunk)
                        if count > limit or actual_total > MAX_TOTAL:
                            raise ValueError('archive exceeds verification size limit')
                        crc = zlib.crc32(chunk, crc)
                        yield chunk
                if decompressor and (not decompressor.eof or decompressor.unused_data):
                    raise ValueError('invalid compressed entry')
            if count != info.file_size:
                raise ValueError('file size mismatch')
            if crc != info.CRC:
                raise ValueError('file CRC mismatch')

        manifest = json.loads(b''.join(chunks(entries['MANIFEST.json'], MAX_MANIFEST)), object_pairs_hook=unique_object)
        if not isinstance(manifest, dict) or set(manifest) != {'algorithm', 'files'} or manifest['algorithm'] != 'sha256' or not isinstance(manifest['files'], list):
            raise ValueError('invalid manifest')
        expected = {}
        for item in manifest['files']:
            if not isinstance(item, dict) or set(item) != {'path', 'size', 'sha256'}:
                raise ValueError('invalid manifest entry')
            name = item['path']
            if not isinstance(name, str):
                raise ValueError('invalid manifest path')
            safe_path(name)
            if (name == 'MANIFEST.json' or name in expected or type(item['size']) is not int
                    or item['size'] < 0 or not isinstance(item['sha256'], str)
                    or not re.fullmatch(r'[0-9a-f]{64}', item['sha256'])):
                raise ValueError('invalid manifest entry')
            expected[name] = item
        if set(expected) != set(entries) - {'MANIFEST.json'}:
            raise ValueError('manifest and archive entries differ')
        # Reject file/directory prefix collisions even though no extraction occurs.
        for name in entries:
            if any(str(parent) in entries for parent in PurePosixPath(name).parents if str(parent) != '.'):
                raise ValueError('archive path collision')
        for name, item in expected.items():
            info = entries[name]
            if info.file_size != item['size']:
                raise ValueError('file size mismatch')
            digest = hashlib.sha256()
            for chunk in chunks(info, item['size']):
                digest.update(chunk)
            if digest.hexdigest() != item['sha256']:
                raise ValueError('file digest mismatch')
        return len(expected)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive', help='successfully decrypted ZIP in a private workspace')
    args = parser.parse_args()
    try:
        count = verify(args.archive)
    except (OSError, ValueError, TypeError, RuntimeError, EOFError, zipfile.BadZipFile, NotImplementedError, zlib.error) as exc:
        print(f'Verification failed: {exc}', file=sys.stderr)
        return 1
    print(f'Manifest matches {count} files. Sender authenticity is NOT verified.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
