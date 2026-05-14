#!/usr/bin/env node

/**
 * SCF (Secure Controls Framework) API client with local cache.
 *
 * Fetches from https://grcengclub.github.io/scf-api/ on demand; caches under
 * ~/.cache/claude-grc/scf/<version>/. Respects CC BY-ND 4.0 — cached data is
 * preserved verbatim, never modified. This mirror is the right source for
 * this toolkit: it exposes per-framework JSON crosswalks (forward + reverse,
 * pre-indexed) for every framework our plugins target.
 *
 * Public API:
 *   initSCF({ offline, cacheDir, baseUrl }) → SCFClient
 *   SCFClient.version() → string (e.g. "2026.1")
 *   SCFClient.controls() → Array<Control>
 *   SCFClient.control(scfId) → Control | null
 *   SCFClient.frameworks() → Array<FrameworkSummary>
 *   SCFClient.crosswalk(frameworkId) → Crosswalk
 *   SCFClient.resolve(framework, controlId) → Array<ControlEquivalence>
 *       Maps a (framework, control_id) tuple to SCF controls plus all
 *       equivalents in every other framework.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

const DEFAULT_BASE_URL = 'https://grcengclub.github.io/scf-api';
const DEFAULT_CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'scf');
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days — SCF itself updates weekly

export async function initSCF(opts = {}) {
  const baseUrl = (opts.baseUrl || process.env.CLAUDE_GRC_SCF_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
  const cacheDir = opts.cacheDir || process.env.CLAUDE_GRC_SCF_CACHE || DEFAULT_CACHE_DIR;
  const offline = opts.offline ?? (process.env.CLAUDE_GRC_SCF_OFFLINE === '1');

  await fs.mkdir(cacheDir, { recursive: true });
  const summary = await fetchOrLoad('api/summary.json', { baseUrl, cacheDir, offline });
  const version = (summary && (summary.scf_version || summary.version)) || 'unknown';
  const versionDir = path.join(cacheDir, version);
  await fs.mkdir(versionDir, { recursive: true });

  return new SCFClient({ baseUrl, cacheDir, versionDir, offline, version, summary });
}

class SCFClient {
  constructor({ baseUrl, cacheDir, versionDir, offline, version, summary }) {
    this._baseUrl = baseUrl;
    this._cacheDir = cacheDir;
    this._versionDir = versionDir;
    this._offline = offline;
    this._version = version;
    this._summary = summary;
    this._controlsById = null;
    this._frameworks = null;
    this._crosswalks = new Map();        // frameworkId → payload
    this._reverseIndex = null;           // Map<frameworkId, Map<frameworkControlId, Set<scfId>>>
  }

  version() { return this._version; }
  summary() { return this._summary; }

  async controls() {
    if (!this._controlsById) {
      const data = await fetchOrLoad('api/controls.json', this._fetchOpts());
      const items = Array.isArray(data) ? data : Array.isArray(data?.controls) ? data.controls : [];
      this._controlsById = new Map(items.map(c => [c.control_id, c]));
    }
    return [...this._controlsById.values()];
  }

  async control(scfId) {
    if (this._controlsById?.has(scfId)) return this._controlsById.get(scfId);
    try {
      const c = await fetchOrLoad(`api/controls/${encodeURIComponent(scfId)}.json`, this._fetchOpts());
      if (!this._controlsById) this._controlsById = new Map();
      this._controlsById.set(scfId, c);
      return c;
    } catch (err) {
      if (err.code === 'SCF_NOT_FOUND') return null;
      throw err;
    }
  }

  async frameworks() {
    if (!this._frameworks) {
      const idx = await fetchOrLoad('api/crosswalks.json', this._fetchOpts());
      this._frameworks = Array.isArray(idx?.frameworks) ? idx.frameworks : [];
    }
    return this._frameworks;
  }

  async crosswalk(frameworkId) {
    if (this._crosswalks.has(frameworkId)) return this._crosswalks.get(frameworkId);
    const payload = await fetchOrLoad(`api/crosswalks/${encodeURIComponent(frameworkId)}.json`, this._fetchOpts());
    this._crosswalks.set(frameworkId, payload);
    return payload;
  }

  /**
   * Resolve a (framework, control_id) → SCF controls and equivalents.
   * If `framework === "SCF"`, returns a single-control resolution.
   * Otherwise, reverse-maps via the framework's crosswalk.
   *
   * Returns Array<{scf_id, scf_control, equivalents: Array<{framework_id, control_id}>}>
   */
  async resolve(framework, controlId) {
    const fwKey = normalizeFrameworkId(framework);
    if (fwKey === 'scf') {
      const ctrl = await this.control(controlId);
      if (!ctrl) return [];
      return [{ scf_id: ctrl.control_id, scf_control: ctrl, equivalents: [] }];
    }
    // Find the matching SCF framework_id
    const resolvedFwId = await this._matchFrameworkId(fwKey, framework);
    if (!resolvedFwId) return [];
    const cw = await this.crosswalk(resolvedFwId);
    const index = buildReverseIndex(cw);
    const scfIds = index.get(String(controlId)) || new Set();
    const out = [];
    for (const scfId of scfIds) {
      const ctrl = await this.control(scfId);
      out.push({ scf_id: scfId, scf_control: ctrl, equivalents: [] });
    }
    return out;
  }

  /**
   * Expand an SCF control into every requested framework.
   * Returns Map<frameworkId, Array<frameworkControlId>>.
   */
  async expand(scfId, targetFrameworkIds) {
    const out = new Map();
    for (const fw of targetFrameworkIds) {
      const resolvedFwId = await this._matchFrameworkId(normalizeFrameworkId(fw), fw);
      if (!resolvedFwId) { out.set(fw, []); continue; }
      const cw = await this.crosswalk(resolvedFwId);
      const mappings = extractForwardMappings(cw, scfId);
      out.set(fw, mappings);
    }
    return out;
  }

  async _matchFrameworkId(normalizedKey, originalLabel) {
    const frameworks = await this.frameworks();
    // First, try an exact match against framework_id
    const direct = frameworks.find(f => f.framework_id === originalLabel || f.framework_id === normalizedKey);
    if (direct) return direct.framework_id;
    // Match by alias patterns — common labels users actually type
    const aliased = matchByAlias(frameworks, normalizedKey);
    return aliased ? aliased.framework_id : null;
  }

  /**
   * Public: resolve a user label or framework_id into the canonical SCF framework_id.
   * Returns null if no match.
   */
  async resolveFrameworkId(label) {
    return this._matchFrameworkId(normalizeFrameworkId(label), label);
  }

  /**
   * Public: return the SCF crosswalk summary entry for a given label.
   * Includes `framework_controls_mapped` (the framework's total control count in SCF's crosswalk).
   */
  async frameworkSummary(label) {
    const id = await this.resolveFrameworkId(label);
    if (!id) return null;
    const frameworks = await this.frameworks();
    return frameworks.find(f => f.framework_id === id) || null;
  }

  _fetchOpts() {
    return { baseUrl: this._baseUrl, cacheDir: this._cacheDir, offline: this._offline, version: this._version };
  }
}

function normalizeFrameworkId(label) {
  return String(label).toLowerCase().replace(/[\s._]+/g, '-');
}

// Concrete alias → SCF framework_id. Verified against SCF v2026.1 crosswalks index.
// User-friendly names on the left; the exact framework_id SCF publishes on the right.
const FRAMEWORK_ALIASES = {
  // AICPA / SOC 2
  'soc2':                         'general-aicpa-tsc-2017',
  'soc-2':                        'general-aicpa-tsc-2017',
  'soc2-tsc':                     'general-aicpa-tsc-2017',
  'tsc':                          'general-aicpa-tsc-2017',
  'aicpa-tsc':                    'general-aicpa-tsc-2017',
  'aicpa-pmf':                    'general-aicpa-pmf-2020',

  // NIST 800-53
  'nist-800-53':                  'general-nist-800-53-r5-2',
  'nist-800-53-r5':               'general-nist-800-53-r5-2',
  'nist-800-53-r4':               'general-nist-800-53-r4',
  'nist-800-53-low':              'general-nist-800-53-r5-2-low',
  'nist-800-53-mod':              'general-nist-800-53-r5-2-mod',
  'nist-800-53-moderate':         'general-nist-800-53-r5-2-mod',
  'nist-800-53-high':             'general-nist-800-53-r5-2-high',

  // NIST 800-171
  'nist-800-171':                 'general-nist-800-171-r3',
  'nist-800-171-r2':              'general-nist-800-171-r2',
  'nist-800-171-r3':              'general-nist-800-171-r3',

  // NIST CSF
  'nist-csf':                     'general-nist-csf-2-0',
  'nist-csf-2':                   'general-nist-csf-2-0',
  'cybersecurity-framework':      'general-nist-csf-2-0',

  // ISO
  // Note: ISO 27001 is the ISMS management standard (51 SCF mappings, mostly governance).
  // ISO 27002 is the Annex A control catalog (316 SCF mappings, technical depth).
  // In practice "ISO 27001 compliance" requires both; users can request either or both.
  'iso-27001':                    'general-iso-27001-2022',
  'iso-27001-2022':               'general-iso-27001-2022',
  'iso27001':                     'general-iso-27001-2022',
  'iso-27002':                    'general-iso-27002-2022',
  'iso-27002-2022':               'general-iso-27002-2022',
  'iso-annex-a':                  'general-iso-27002-2022',
  'iso-27017':                    'general-iso-27017-2015',
  'iso-27018':                    'general-iso-27018-2025',

  // PCI
  'pci-dss':                      'general-pci-dss-4-0-1',
  'pci-dss-4':                    'general-pci-dss-4-0-1',
  'pci-dss-4-0-1':                'general-pci-dss-4-0-1',
  'pci-dss-saq-a':                'general-pci-dss-4-0-1-saq-a',
  'pci-dss-saq-a-ep':             'general-pci-dss-4-0-1-saq-a-ep',
  'pci-dss-saq-b':                'general-pci-dss-4-0-1-saq-b',

  // FedRAMP
  'fedramp':                      'usa-federal-gsa-fedramp-5-mod',
  'fedramp-low':                  'usa-federal-gsa-fedramp-5-low',
  'fedramp-moderate':             'usa-federal-gsa-fedramp-5-mod',
  'fedramp-mod':                  'usa-federal-gsa-fedramp-5-mod',
  'fedramp-high':                 'usa-federal-gsa-fedramp-5-high',
  'fedramp-li-saas':              'usa-federal-gsa-fedramp-5-li-saas',

  // HIPAA
  'hipaa':                        'usa-federal-law-hipaa-security-rule-2013',
  'hipaa-security':               'usa-federal-law-hipaa-security-rule-2013',

  // CMMC
  'cmmc':                         'usa-federal-dow-cmmc-2-level-2',
  'cmmc-2':                       'usa-federal-dow-cmmc-2-level-2',
  'cmmc-level-1':                 'usa-federal-dow-cmmc-2-level-1',
  'cmmc-level-2':                 'usa-federal-dow-cmmc-2-level-2',
  'cmmc-level-3':                 'usa-federal-dow-cmmc-2-level-3',

  // CIS
  'cis':                          'general-cis-csc-8-1',
  'cis-v8':                       'general-cis-csc-8-1',
  'cis-controls':                 'general-cis-csc-8-1',
  'cis-ig1':                      'general-cis-csc-8-1-ig1',
  'cis-ig2':                      'general-cis-csc-8-1-ig2',
  'cis-ig3':                      'general-cis-csc-8-1-ig3',

  // Privacy / regional
  'gdpr':                         'emea-eu-gdpr-2016',
  'dora':                         'emea-eu-dora-2023',

  // US state / sector
  'nydfs':                        'usa-state-ny-dfs-23-nycrr500-2023-amd2',
  '23-nycrr-500':                 'usa-state-ny-dfs-23-nycrr500-2023-amd2',
  'glba':                         'usa-federal-law-glba-cfr-314-2023',

  // APAC / LATAM
  'essential-8':                  'apac-aus-essential-8-2024',
  'essential8':                   'apac-aus-essential-8-2024',
  'irap':                         'apac-aus-ism-2024-june',
  'ism':                          'apac-aus-ism-2024-june',
  'ismap':                        'apac-jpn-ismap',
};

// Frameworks not in SCF (proprietary / no public crosswalk). Used to give a clear error.
const FRAMEWORKS_WITHOUT_SCF_CROSSWALK = {
  'hitrust':     'HITRUST CSF is proprietary; SCF does not publish a public crosswalk. Use the `hitrust` plugin directly.',
  'hitrust-csf': 'HITRUST CSF is proprietary; SCF does not publish a public crosswalk. Use the `hitrust` plugin directly.',
  'stateramp':   'StateRAMP has no SCF crosswalk; it mirrors NIST 800-53. Use FedRAMP-Moderate or NIST-800-53 as a proxy.',
  'pbmm':        'PBMM (ITSG-33) has no direct SCF crosswalk; use NIST-800-53 as a close proxy.',
  'us-export':   'US Export Controls (ITAR/EAR) are not a security controls framework and have no SCF mapping.',
  'csa-ccm':     'CSA CCM v4 is not in the current SCF crosswalk index; use ISO 27001 or NIST 800-53 as a proxy.',
};

function matchByAlias(frameworks, key) {
  const aliased = FRAMEWORK_ALIASES[key];
  if (!aliased) return null;
  return frameworks.find(f => f.framework_id === aliased) || null;
}

export function frameworkWithoutCrosswalk(label) {
  return FRAMEWORKS_WITHOUT_SCF_CROSSWALK[normalizeFrameworkId(label)] || null;
}

function buildReverseIndex(crosswalkPayload) {
  // SCF v2026.1 shape:
  //   framework_to_scf: { total_mappings, mappings: { [framework_control_id]: [scf_id, ...] } }
  // Returns Map<frameworkControlId, Set<scfId>>.
  const idx = new Map();
  const raw = crosswalkPayload?.framework_to_scf?.mappings
           || crosswalkPayload?.mappings
           || {};
  if (Array.isArray(raw)) {
    // Legacy/alt shape: array of {framework_control_id, scf_controls|scf_ids}
    for (const m of raw) {
      const fwCtrl = String(m.framework_control_id ?? m.control_id ?? '');
      const scfIds = m.scf_controls ?? m.scf_ids ?? [];
      for (const scfRef of scfIds) {
        const scfId = typeof scfRef === 'string' ? scfRef : (scfRef?.scf_id || scfRef?.control_id);
        if (!scfId) continue;
        if (!idx.has(fwCtrl)) idx.set(fwCtrl, new Set());
        idx.get(fwCtrl).add(scfId);
      }
    }
  } else {
    for (const [fwCtrl, scfIds] of Object.entries(raw)) {
      const set = new Set();
      for (const scfRef of scfIds) {
        const scfId = typeof scfRef === 'string' ? scfRef : (scfRef?.scf_id || scfRef?.control_id);
        if (scfId) set.add(scfId);
      }
      if (set.size) idx.set(String(fwCtrl), set);
    }
  }
  return idx;
}

function extractForwardMappings(crosswalkPayload, scfId) {
  // SCF v2026.1 shape: scf_to_framework.mappings is { [scf_id]: [framework_control_id, ...] }
  const raw = crosswalkPayload?.scf_to_framework?.mappings
           || crosswalkPayload?.mappings
           || {};
  if (Array.isArray(raw)) {
    const out = [];
    for (const m of raw) {
      const scfIds = m.scf_controls ?? m.scf_ids ?? [];
      const hit = scfIds.some(ref => {
        const id = typeof ref === 'string' ? ref : (ref?.scf_id || ref?.control_id);
        return id === scfId;
      });
      if (hit) out.push(String(m.framework_control_id ?? m.control_id ?? ''));
    }
    return out;
  }
  const direct = raw[scfId];
  if (Array.isArray(direct)) return direct.map(String);
  return [];
}

async function fetchOrLoad(relativePath, { baseUrl, cacheDir, offline, version }) {
  const cachePath = path.join(cacheDir, version || '_unknown', relativePath);
  // Try cache
  try {
    const stat = await fs.stat(cachePath);
    const fresh = Date.now() - stat.mtimeMs < CACHE_TTL_MS;
    if (fresh || offline) {
      return JSON.parse(await fs.readFile(cachePath, 'utf8'));
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    if (offline) {
      const e = new Error(`SCF cache miss and offline mode is on: ${relativePath}`);
      e.code = 'SCF_OFFLINE_MISS';
      throw e;
    }
  }
  // Fetch fresh
  const url = `${baseUrl}/${relativePath}`;
  let res;
  try {
    res = await fetch(url, { headers: { 'accept': 'application/json', 'user-agent': 'claude-grc-engineering/0.1' } });
  } catch (networkErr) {
    // Fall back to stale cache if it exists
    try {
      return JSON.parse(await fs.readFile(cachePath, 'utf8'));
    } catch {
      const e = new Error(`SCF fetch failed and no cached copy: ${url} (${networkErr.message})`);
      e.code = 'SCF_FETCH_FAILED';
      throw e;
    }
  }
  if (res.status === 404) {
    const e = new Error(`SCF resource not found: ${relativePath}`);
    e.code = 'SCF_NOT_FOUND';
    throw e;
  }
  if (!res.ok) {
    const e = new Error(`SCF fetch error ${res.status} for ${relativePath}`);
    e.code = 'SCF_HTTP_ERROR';
    throw e;
  }
  const body = await res.text();
  await fs.mkdir(path.dirname(cachePath), { recursive: true });
  await fs.writeFile(cachePath, body);
  try {
    return JSON.parse(body);
  } catch (parseErr) {
    const e = new Error(`SCF invalid JSON at ${relativePath}: ${parseErr.message}`);
    e.code = 'SCF_BAD_JSON';
    throw e;
  }
}

// CLI usage: `node scripts/scf-client.js <command> [args...]`
const invokedFromCLI = import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedFromCLI) {
  const [, , cmd, ...args] = process.argv;
  const client = await initSCF();
  const emit = (o) => console.log(JSON.stringify(o, null, 2));
  try {
    switch (cmd) {
      case 'version':       emit({ version: client.version() }); break;
      case 'summary':       emit(client.summary()); break;
      case 'control':       emit(await client.control(args[0])); break;
      case 'frameworks':    emit(await client.frameworks()); break;
      case 'crosswalk':     emit(await client.crosswalk(args[0])); break;
      case 'resolve':       emit(await client.resolve(args[0], args[1])); break;
      case 'expand':        emit(Object.fromEntries(await client.expand(args[0], args.slice(1)))); break;
      default:
        console.error('Usage: scf-client.js <version|summary|control|frameworks|crosswalk|resolve|expand> [args...]');
        process.exit(2);
    }
  } catch (err) {
    console.error(`[scf-client] ${err.code || 'ERROR'}: ${err.message}`);
    process.exit(1);
  }
}
