#!/usr/bin/env python3
"""Exercise documented collectors with mocked AWS and a permissive umask."""
import os
import re
import stat
import subprocess
import sys
import tempfile
import types
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'plugins/frameworks/nist-800-53/commands/evidence-checklist.md'
text = DOC.read_text()
blocks = re.findall(r'```bash\n(.*?)\n```', text, re.S)
collectors = [b for b in blocks if 'aws ' in b]
assert len(collectors) == 7, len(collectors)
with tempfile.TemporaryDirectory() as temp:
    root = Path(temp)
    bindir = root / 'bin'
    bindir.mkdir()
    aws = bindir / 'aws'
    aws.write_text('''#!/bin/bash
if [ -n "${FAIL_MATCH:-}" ] && [[ "$*" == *"$FAIL_MATCH"* ]]; then
  printf 'partial output before failure\\n'
  exit 42
fi
case "$*" in
  *generate-credential-report*) printf 'COMPLETE\\n' ;;
  *get-credential-report*) if [ "${FAIL_FETCH:-0}" = 1 ]; then exit 42; fi; printf 'dXNlcixwYXNzd29yZAphbGljZSxuZXZlcg==\\n' ;;
  *list-users*--query*) printf 'alice\\n' ;;
  *list-attached-user-policies*) printf 'AdministratorAccess\\n' ;;
  *) printf '{}\\n' ;;
esac
''')
    aws.chmod(0o755)
    env = dict(os.environ, PATH=f'{bindir}:' + os.environ['PATH'])
    for block in collectors:
        for attempt in range(2):
            subprocess.run(['bash', '-c', 'umask 000;\n' + block], cwd=root, env=env, check=True)
            directory = root / 'evidence'
            assert stat.S_IMODE(directory.stat().st_mode) == 0o700
            files = list(directory.iterdir())
            assert files
            for f in files:
                assert stat.S_IMODE(f.stat().st_mode) == 0o600, f
                if f.name.startswith('nist-ac2-privileged-'):
                    assert f.read_text().splitlines() == ['alice,AdministratorAccess']
                f.chmod(0o666)  # Simulate a loose artifact from a previous run.
            directory.chmod(0o777)
            # Other collectors' artifacts are not touched; remove them between runs.
            if attempt == 0:
                previous = {f.name for f in files}
            else:
                for f in files:
                    f.unlink()

    # Fail every AWS operation, including early and late operations in each
    # multi-file collector, after first creating same-day artifacts.
    failures = [
        ['iam list-users', 'iam list-roles', 'iam list-groups',
         'iam generate-credential-report', 'iam get-credential-report'],
        ['AttributeValue=CreateUser', 'AttributeValue=DeleteUser',
         'AttributeValue=AttachUserPolicy', 'AttributeValue=DetachUserPolicy'],
        ['iam list-users', 'iam list-attached-user-policies'],
        ['iam get-credential-report'],
        ['logs describe-subscription-filters'],
        ['securityhub get-enabled-standards', 'guardduty list-detectors'],
        ['securityhub get-findings'],
    ]
    for block, matches in zip(collectors, failures, strict=True):
        for match in matches:
            subprocess.run(['bash', '-c', block], cwd=root, env=env, check=True)
            directory = root / 'evidence'
            before = {f.name: f.read_bytes() for f in directory.iterdir()}
            assert before
            result = subprocess.run(['bash', '-c', block], cwd=root,
                                    env=dict(env, FAIL_MATCH=match), capture_output=True)
            assert result.returncode != 0, f'{match} must fail the collector'
            after = {f.name: f.read_bytes() for f in directory.iterdir()}
            assert after == before, f'{match} changed or left artifacts after failure'
            for f in directory.iterdir():
                f.unlink()

    report_collectors = [b for b in collectors if 'aws iam get-credential-report' in b]
    assert len(report_collectors) == 2
    for block in report_collectors:
        result = subprocess.run(['bash', '-c', block], cwd=root,
                                env=dict(env, FAIL_FETCH='1'), capture_output=True)
        assert result.returncode != 0, 'failed AWS fetch must fail the collector'

source = re.search(r'```python\n(.*?)\n```', text, re.S).group(1)
compile(source, str(DOC), 'exec')
sys.modules['boto3'] = types.SimpleNamespace(client=lambda _: None)
namespace = {'__name__': 'collector_test'}
exec(source, namespace)
with tempfile.TemporaryDirectory() as temp:
    previous = os.umask(0)
    try:
        c = namespace['AC2Evidence']('moderate', 90, temp)
        calls = []
        def paginate(operation, key, **kwargs):
            calls.append((operation, kwargs))
            if operation == 'list_groups_for_user':
                return [{'GroupName': 'shared'}]
            if operation == 'list_attached_group_policies':
                return [{'PolicyName': 'AdministratorAccess', 'PolicyArn': 'arn:admin'}]
            if operation == 'list_group_policies':
                return ['inline']
            return []
        c._paginate = paginate
        for _ in range(2):
            users = c.privileged_inventory([{'UserName': 'alice'}, {'UserName': 'bob'}])
            assert len(users) == 2 and all(u['group_inline_policies_for_manual_review'] == ['inline (via group shared)'] for u in users)
            assert sum(op == 'list_group_policies' for op, _ in calls) == _ + 1
            path = next(Path(c.out_dir).glob('privileged*.json'))
            assert stat.S_IMODE(path.stat().st_mode) == 0o600
            path.chmod(0o666)
        assert stat.S_IMODE(Path(c.out_dir).stat().st_mode) == 0o700
        c._write_csv('credential-report', 'private')
        csv = next(Path(c.out_dir).glob('credential-report*.csv'))
        assert stat.S_IMODE(csv.stat().st_mode) == 0o600
        csv.chmod(0o666)
        c._write_csv('credential-report', 'private again')
        assert stat.S_IMODE(csv.stat().st_mode) == 0o600
    finally:
        os.umask(previous)
print('All seven shell collectors and Python permissions/cache checks passed.')
