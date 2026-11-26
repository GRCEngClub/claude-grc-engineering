import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { initSCF, frameworkWithoutCrosswalk } from '../../plugins/personas/engineer/scripts/scf-client.js';

const GOVRAMP_IDS = [
  'general-govramp',
  'general-govramp-core',
  'general-govramp-low',
  'general-govramp-low-plus',
  'general-govramp-mod',
  'general-govramp-high',
];

async function offlineClient() {
  const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scf-govramp-'));
  const write = (rel, body) => {
    const file = path.join(cacheDir, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(body));
  };
  write('_unknown/api/summary.json', { scf_version: 'test' });
  write('test/api/crosswalks.json', {
    frameworks: GOVRAMP_IDS.map(id => ({ framework_id: id, display_name: id })),
  });
  return initSCF({ cacheDir, offline: true });
}

test('GovRAMP labels resolve to the SCF GovRAMP crosswalks', async () => {
  const scf = await offlineClient();
  assert.equal(await scf.resolveFrameworkId('GovRAMP'), 'general-govramp-mod');
  assert.equal(await scf.resolveFrameworkId('GovRAMP-Core'), 'general-govramp-core');
  assert.equal(await scf.resolveFrameworkId('GovRAMP-Low'), 'general-govramp-low');
  assert.equal(await scf.resolveFrameworkId('GovRAMP-Moderate'), 'general-govramp-mod');
  assert.equal(await scf.resolveFrameworkId('GovRAMP-High'), 'general-govramp-high');
});

test('the pre-2025 StateRAMP name still resolves, to the same crosswalk as GovRAMP', async () => {
  const scf = await offlineClient();
  assert.equal(await scf.resolveFrameworkId('StateRAMP'), 'general-govramp-mod');
  assert.equal(frameworkWithoutCrosswalk('StateRAMP'), null);
  assert.equal(frameworkWithoutCrosswalk('GovRAMP'), null);
});
