"""Offline guardrail tests; these do not verify AWS deployment behavior."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class DeploymentBlockTests(unittest.TestCase):
    def test_scripts_stop_before_external_commands_even_with_skip_flags(self):
        scripts = [ROOT / 'deploy.sh', ROOT / 'skills/trust-center/references/deploy-script.sh']
        with tempfile.TemporaryDirectory() as tmp:
            marker = Path(tmp) / 'called'
            for name in ('aws', 'node', 'python3', 'npm', 'zip'):
                fake = Path(tmp) / name
                fake.write_text('#!/bin/sh\nprintf called > "$MARKER"\n')
                fake.chmod(0o755)
            env = {**os.environ, 'PATH': tmp, 'MARKER': str(marker)}
            for script in scripts:
                for args in ([], ['--email', 'test@example.invalid', '--skip-infra', '--skip-frontend'], ['--help']):
                    result = subprocess.run(['/bin/bash', str(script), *args], env=env, capture_output=True, text=True)
                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn('STOP', result.stderr)
                    self.assertFalse(marker.exists(), str(script))

    def test_cloudformation_rules_match_and_are_unconditionally_false(self):
        # Static text check only: not an AWS CloudFormation integration test.
        templates = [ROOT / 'infrastructure/template.yaml', ROOT / 'skills/trust-center/references/infrastructure-template.yaml']
        self.assertEqual(templates[0].read_bytes(), templates[1].read_bytes())
        rule = 'Rules:\n  DeploymentBlocked:\n    Assertions:\n      - Assert: !Equals ["blocked", "permitted"]'
        self.assertIn(rule, templates[0].read_text())

    def test_seed_refuses_before_table_access(self):
        import importlib.util
        from unittest.mock import MagicMock, patch
        import sys
        boto = MagicMock()
        with patch.dict(sys.modules, {'boto3': boto}):
            spec = importlib.util.spec_from_file_location('seed_data_test', ROOT / 'backend/seed_data.py')
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            with self.assertRaisesRegex(RuntimeError, 'STOP'):
                module.seed('table', 'bucket')
            boto.resource.assert_not_called()


if __name__ == '__main__':
    unittest.main()
