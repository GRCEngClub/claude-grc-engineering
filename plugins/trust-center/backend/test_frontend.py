"""Offline frontend configuration regressions; no AWS or network required."""
from pathlib import Path
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


class FrontendTests(unittest.TestCase):
    def test_api_client_demo_is_explicit_and_isolated(self):
        # Import the actual module with Vite's environment replaced by test values.
        script = r'''
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const source = await readFile(process.argv[1], 'utf8');
let calls = [];
globalThis.fetch = async (url) => { calls.push(url); return { ok: true, json: async () => ({requests: []}) }; };
async function load(env) {
  const js = source.replaceAll('import.meta.env', JSON.stringify(env));
  return import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
}
const demo = await load({VITE_DEMO_MODE: 'true', VITE_API_URL: 'https://example.invalid/api'});
await assert.rejects(demo.getRequests('token'), /Demo mode/);
assert.deepEqual(calls, []);
const live = await load({});
await live.getRequests('token');
assert.deepEqual(calls, ['/api/admin/requests']);
'''
        result = subprocess.run(['node', '--input-type=module', '-e', script,
                                 str(ROOT / 'frontend/src/utils/api.js')],
                                capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_dashboard_does_not_initialize_live_records_with_samples(self):
        dashboard = (ROOT / 'frontend/src/pages/AdminDashboard.jsx').read_text()
        self.assertIn("import.meta.env.VITE_DEMO_MODE === 'true'", dashboard)
        self.assertIn('isDemo ? DEMO_REQUESTS : []', dashboard)
        self.assertIn('isDemo ? DEMO_AUDIT : []', dashboard)
        self.assertIn('Changes are simulated locally', dashboard)
        self.assertNotIn('nda_pending', dashboard)
        public = (ROOT / 'frontend/src/pages/TrustCenter.jsx').read_text()
        self.assertIn('No security or compliance claims are made', public)
        self.assertIn('if (DEMO_MODE) return;', public)

    def test_request_row_renders_safe_decisions_and_no_public_download(self):
        script = r'''
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { transformWithOxc } from 'vite';
const dashboard = await readFile('src/pages/AdminDashboard.jsx', 'utf8');
const row = dashboard.slice(dashboard.indexOf('function RequestRow('), dashboard.indexOf('function AuditRow('));
const compiled = await transformWithOxc(row, 'RequestRow.jsx', {jsx: {runtime: 'classic'}});
const p = new Proxy({}, {get: () => '#000'});
const RequestRow = new Function('React', 'p', 'baseFont', 'monoFont', 'StatusBadge', compiled.code + ';return RequestRow')(React, p, '', '', () => null);
const render = (status, version, isDemo = false) => renderToStaticMarkup(React.createElement(RequestRow, {req: {status, version, createdAt: '2026-01-01'}, isDemo}));
assert.match(render('approved', 'v1'), />Revoke</);
assert.doesNotMatch(render('approved', 'v1'), />Approve</);
assert.match(render('denied', 'v2'), />Approve</);
assert.match(render('pending', 'v3'), />Deny</);
assert.match(render('approved', null), /Legacy request/);
assert.doesNotMatch(render('approved', null), />Revoke</);
assert.match(dashboard, /updateRequest\(req.requestId, req.documentId, 'denied', req.version, token\)/);
assert.match(dashboard, /not an authoritative audit trail/);
const publicPage = await readFile('src/pages/TrustCenter.jsx', 'utf8');
assert.match(publicPage, /Downloads unavailable/);
assert.doesNotMatch(publicPage, /onDownload|handleDownload/);
'''
        result = subprocess.run(['node', '--input-type=module', '-e', script], cwd=ROOT / 'frontend', capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == '__main__':
    unittest.main()
