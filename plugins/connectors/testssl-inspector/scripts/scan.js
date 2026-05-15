#!/usr/bin/env node

/**
 * testssl-inspector:scan
 *
 * Wraps testssl.sh and emits findings conforming to schemas/finding.schema.json v1.
 *
 * Resource type is `tls_endpoint`. Each testssl finding is mapped first to one
 * or more SCF (Secure Controls Framework) control IDs, then fanned out to
 * SOC 2 / NIST 800-53 r5 / PCI DSS 4.0.1 / ISO 27002:2022 via the SCF
 * crosswalk at https://grcengclub.github.io/scf-api/. If the crosswalk is
 * unreachable, the script falls back to a curated hardcoded mapping table
 * (the same controls the v0 of this connector emitted directly).
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const CONFIG_DIR = process.env.CLAUDE_GRC_CONFIG_DIR || path.join(os.homedir(), '.config', 'claude-grc');
const CONFIG_FILE = path.join(CONFIG_DIR, 'connectors', 'testssl-inspector.yaml');
const CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'findings', 'testssl-inspector');
const SCF_CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'scf');
const RUNS_LOG = path.join(os.homedir(), '.cache', 'claude-grc', 'runs.log');
const SOURCE = 'testssl-inspector';
const SOURCE_VERSION = '0.1.0';
const SCF_BASE_URL = process.env.CLAUDE_GRC_SCF_BASE_URL || 'https://grcengclub.github.io/scf-api';
const SCF_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const EXIT = { OK: 0, USAGE: 2, TOOL_UNAVAILABLE: 3, PARTIAL: 4, NOT_CONFIGURED: 5 };

async function main(argv) {
  const args = parseArgs(argv);
  const log = args.quiet ? () => {} : (m) => process.stderr.write(`[${SOURCE}] ${m}\n`);

  let config = {};
  try { config = parseYaml(await fs.readFile(CONFIG_FILE, 'utf8')); }
  catch { /* config is optional; targets can come from CLI */ }

  const targets = args.targets.length ? args.targets : (config.targets || []);
  if (!targets.length) {
    fail(EXIT.USAGE, 'no targets. Pass --target=host[:port] (repeatable) or list them in config (run /testssl-inspector:setup).');
  }

  const mode = args.fast ? 'fast' : 'full';
  const useDocker = args.docker ?? (config.use_docker === true);
  const runner = await resolveRunner({ useDocker, configBinary: config.testssl_path });
  log(`runner=${runner.label} mode=${mode} targets=${targets.length}`);

  // Pre-fetch SCF crosswalks for the frameworks we expand to. Done once per run.
  // If --scf-only is passed, or fetching fails, we skip expansion.
  let expansion = null;
  if (!args.scfOnly) {
    try {
      expansion = await loadCrosswalkExpansion(uniqueScfIds(FAMILY_TO_SCF), { offline: args.offline, log });
      log(`scf expansion: ${expansion.scfVersion || 'unknown'} (${expansion.frameworkCount} frameworks)`);
    } catch (err) {
      log(`scf expansion unavailable (${err.message}); using hardcoded framework fallback`);
      expansion = null;
    }
  } else {
    log('scf expansion skipped (--scf-only)');
  }

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const runId = makeRunId();
  const startedAt = Date.now();
  const findings = [];
  const errors = [];

  for (const target of targets) {
    try {
      const raw = await runTestssl(runner, target, mode, log);
      const doc = normalizeTargetFindings(raw, target, runId, runner.version, expansion);
      findings.push(doc);
    } catch (err) {
      errors.push({ target, error: err.message });
      log(`${target} scan failed: ${err.message}`);
    }
  }

  const cachePath = path.join(CACHE_DIR, `${runId}.json`);
  await fs.writeFile(cachePath, JSON.stringify(findings, null, 2));

  const counters = { pass: 0, fail: 0, inconclusive: 0, not_applicable: 0, skipped: 0 };
  const sev = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const d of findings) for (const e of d.evaluations) {
    counters[e.status] = (counters[e.status] || 0) + 1;
    if (e.severity) sev[e.severity] = (sev[e.severity] || 0) + 1;
  }

  await appendRunLog({
    source: SOURCE, run_id: runId, started_at: new Date(startedAt).toISOString(),
    duration_ms: Date.now() - startedAt,
    targets: targets.length, errors: errors.length,
    scf_expansion: expansion ? { scf_version: expansion.scfVersion, frameworks: expansion.frameworkCount } : null,
    counters, severities: sev, cache_path: cachePath,
  });

  if (args.output === 'json') {
    process.stdout.write(JSON.stringify({ run_id: runId, cache_path: cachePath, counters, severities: sev, errors }, null, 2) + '\n');
  } else if (args.output !== 'silent') {
    const failingSev = `${sev.critical} critical, ${sev.high} high, ${sev.medium} medium, ${sev.low} low`;
    process.stdout.write(
      `${SOURCE}: ${targets.length} target${targets.length === 1 ? '' : 's'}, ` +
      `${findings.length} resource${findings.length === 1 ? '' : 's'}, ` +
      `${counters.fail + counters.pass + counters.inconclusive} evaluations, ` +
      `${counters.fail} failing (${failingSev}). ` +
      `${errors.length ? `${errors.length} scan errors. ` : ''}` +
      `${expansion ? '' : '(scf expansion unavailable; framework fallback used) '}` +
      `→ ${cachePath}\n`
    );
  }

  if (errors.length && findings.length === 0) process.exit(EXIT.TOOL_UNAVAILABLE);
  if (errors.length) process.exit(EXIT.PARTIAL);
  process.exit(EXIT.OK);
}

function parseArgs(argv) {
  const args = { targets: [], fast: false, docker: undefined, quiet: false, output: 'summary', scfOnly: false, offline: false };
  for (const a of argv) {
    if (a === '--fast') args.fast = true;
    else if (a === '--full') args.fast = false;
    else if (a === '--docker') args.docker = true;
    else if (a === '--no-docker') args.docker = false;
    else if (a === '--quiet') args.quiet = true;
    else if (a === '--scf-only') args.scfOnly = true;
    else if (a === '--offline') args.offline = true;
    else if (a.startsWith('--target=')) args.targets.push(a.slice(9));
    else if (a.startsWith('--output=')) args.output = a.slice(9);
    else if (a === '-h' || a === '--help') {
      process.stdout.write(
        `Usage: scan.js --target=host[:port] [--target=...] [--fast|--full] [--docker] [--scf-only] [--offline] [--output=summary|silent|json] [--quiet]\n`
      );
      process.exit(0);
    } else if (!a.startsWith('-')) args.targets.push(a);
    else fail(EXIT.USAGE, `unknown flag: ${a}`);
  }
  return args;
}

/** Resolve which testssl invocation we'll use. */
async function resolveRunner({ useDocker, configBinary }) {
  if (useDocker) {
    if (!await commandExists('docker')) fail(EXIT.TOOL_UNAVAILABLE, 'docker not on PATH — drop --docker or install Docker.');
    return {
      label: 'docker drwetter/testssl.sh',
      version: await dockerImageVersion(),
      argv: (target, mode) => [
        'run', '--rm', '--network', 'host',
        '-v', `${CACHE_DIR}:/tmp/scan-out`,
        'drwetter/testssl.sh:latest',
        ...testsslArgs(target, mode, '/tmp/scan-out'),
      ],
      cmd: 'docker',
    };
  }
  const binary = configBinary || await whichTestssl();
  if (!binary) {
    fail(EXIT.TOOL_UNAVAILABLE,
      'testssl.sh not on PATH. Install via: brew install testssl (macOS), apt install testssl.sh (Debian/Ubuntu), or ' +
      'git clone https://github.com/testssl/testssl.sh ~/.local/share/testssl.sh && ' +
      `export PATH="$HOME/.local/share/testssl.sh:$PATH". Or rerun with --docker.`);
  }
  const version = await runCapture(binary, ['--version']).then(parseTestsslVersion).catch(() => 'unknown');
  return {
    label: binary,
    version,
    cmd: binary,
    argv: (target, mode) => testsslArgs(target, mode),
  };
}

async function whichTestssl() {
  for (const candidate of ['testssl.sh', 'testssl']) {
    if (await commandExists(candidate)) return candidate;
  }
  for (const candidate of [
    path.join(os.homedir(), '.local/share/testssl.sh/testssl.sh'),
    '/opt/testssl.sh/testssl.sh',
    '/usr/local/bin/testssl.sh',
  ]) {
    try { await fs.access(candidate); return candidate; } catch {}
  }
  return null;
}

async function dockerImageVersion() {
  try {
    const out = await runCapture('docker', ['run', '--rm', 'drwetter/testssl.sh:latest', '--version']);
    return parseTestsslVersion(out);
  } catch { return 'unknown'; }
}

function parseTestsslVersion(text) {
  const m = String(text).match(/testssl\.sh\s+([0-9][^\s,]+)/i);
  return m ? m[1] : 'unknown';
}

function testsslArgs(target, mode, outDir = null) {
  const out = outDir || CACHE_DIR;
  const jsonPath = path.join(out, `testssl-raw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`);
  const base = [
    '--quiet', '--warnings', 'off', '--color', '0',
    '--jsonfile-pretty', jsonPath,
  ];
  if (mode === 'fast') base.push('--fast');
  base.push(target);
  base.__jsonPath = jsonPath;
  return base;
}

async function runTestssl(runner, target, mode, log) {
  const argv = runner.argv(target, mode);
  const jsonPath = argv.__jsonPath;
  log(`scanning ${target}`);
  await runCapture(runner.cmd, argv, { allowNonZero: true }); // testssl exits non-zero when it finds issues
  let raw;
  try { raw = JSON.parse(await fs.readFile(jsonPath, 'utf8')); }
  catch (err) { throw new Error(`testssl produced no parseable JSON at ${jsonPath}: ${err.message}`); }
  fs.rm(jsonPath, { force: true }).catch(() => {}); // best-effort cleanup
  return raw;
}

function runCapture(cmd, argv, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, argv, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', d => { stdout += d; });
    child.stderr.on('data', d => { stderr += d; });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0 || opts.allowNonZero) resolve(stdout);
      else reject(new Error(`${cmd} exited ${code}: ${stderr.trim().slice(0, 500)}`));
    });
  });
}

function commandExists(cmd) {
  return runCapture(process.platform === 'win32' ? 'where' : 'which', [cmd])
    .then(() => true).catch(() => false);
}

/** ---- SCF crosswalk expansion ----
 *
 * Maps testssl finding families to SCF control IDs (FAMILY_TO_SCF), then at
 * scan-startup time fetches per-framework crosswalk JSON from the SCF mirror
 * and builds a lookup: scf_id -> { framework_label: [framework_control_ids] }.
 *
 * Cache: ~/.cache/claude-grc/scf/<version>/api/crosswalks/<framework-id>.json
 * Shared with grc-engineer's scf-client.js cache layout.
 */

// ISO 27002:2022 is used rather than 27001:2022 because the latter (the ISMS
// management standard) is mapped sparsely in SCF's public crosswalk and
// covers almost none of the technical anchors we care about. 27002:2022 holds
// the Annex A control catalog — same control numbering in 27001:2022 Annex A,
// just published as its own framework in SCF's catalog.
const EXPAND_FRAMEWORKS = [
  { id: 'general-nist-800-53-r5-2', label: 'NIST-800-53-r5' },
  { id: 'general-aicpa-tsc-2017',   label: 'SOC2-TSC-2017' },
  { id: 'general-pci-dss-4-0-1',    label: 'PCI-DSS-4.0' },
  { id: 'general-iso-27002-2022',   label: 'ISO-27002-2022' },
];

async function loadCrosswalkExpansion(scfIds, { offline, log }) {
  // First: load the SCF summary to discover the current version (for the cache dir).
  const summary = await fetchScfFile('api/summary.json', { offline });
  const scfVersion = (summary && (summary.scf_version || summary.version)) || 'unknown';

  // Fetch crosswalks in parallel.
  const crosswalks = await Promise.all(
    EXPAND_FRAMEWORKS.map(async fw => {
      try {
        const cw = await fetchScfFile(`api/crosswalks/${encodeURIComponent(fw.id)}.json`, { offline, scfVersion });
        return { fw, cw };
      } catch (err) {
        log(`crosswalk for ${fw.label} unavailable: ${err.message}`);
        return { fw, cw: null };
      }
    })
  );

  // Build: scf_id -> { framework_label: [framework_control_ids] }
  const scfIdSet = new Set(scfIds);
  const lookup = new Map();
  let frameworkCount = 0;
  for (const { fw, cw } of crosswalks) {
    if (!cw) continue;
    frameworkCount += 1;
    const mappings = cw?.scf_to_framework?.mappings || {};
    for (const scfId of scfIdSet) {
      const targets = mappings[scfId];
      if (!Array.isArray(targets) || targets.length === 0) continue;
      if (!lookup.has(scfId)) lookup.set(scfId, {});
      lookup.get(scfId)[fw.label] = targets.slice();
    }
  }

  return { scfVersion, frameworkCount, lookup };
}

async function fetchScfFile(relativePath, { offline = false, scfVersion = null } = {}) {
  const versionDir = scfVersion || 'unknown';
  const cachePath = path.join(SCF_CACHE_DIR, versionDir, relativePath);

  try {
    const stat = await fs.stat(cachePath);
    const fresh = Date.now() - stat.mtimeMs < SCF_CACHE_TTL_MS;
    if (fresh || offline) return JSON.parse(await fs.readFile(cachePath, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    if (offline) throw new Error(`SCF cache miss and --offline set: ${relativePath}`);
  }

  const url = `${SCF_BASE_URL.replace(/\/$/, '')}/${relativePath}`;
  let res;
  try {
    res = await fetch(url, { headers: { 'accept': 'application/json', 'user-agent': 'claude-grc-engineering/0.1' } });
  } catch (networkErr) {
    // Fall back to stale cache if it exists.
    try { return JSON.parse(await fs.readFile(cachePath, 'utf8')); }
    catch { throw new Error(`SCF fetch failed for ${relativePath}: ${networkErr.message}`); }
  }
  if (!res.ok) throw new Error(`SCF fetch returned HTTP ${res.status} for ${relativePath}`);
  const body = await res.text();
  await fs.mkdir(path.dirname(cachePath), { recursive: true });
  await fs.writeFile(cachePath, body);
  return JSON.parse(body);
}

/** ---- Mapping tables ---- */

/**
 * testssl finding family → SCF control IDs.
 * Each family represents a class of TLS posture issues; the SCF controls are
 * chosen as the canonical anchors that fan out to the relevant downstream
 * framework controls via SCF crosswalks. Spot-verified against
 * grcengclub.github.io/scf-api crosswalks for NIST 800-53 r5 v2026.1.
 */
const FAMILY_TO_SCF = {
  protocolWeak: ['CRY-01', 'CRY-03', 'NET-09'],
  cipherWeak:   ['CRY-01.2', 'CRY-05'],
  certificate:  ['CRY-08'],
  cve:          ['VPM-01', 'VPM-06'],
  headers:      ['CRY-03', 'WEB-03', 'NET-09'],
};

/**
 * testssl finding id (exact or prefix) → family name.
 * Longest prefix wins for ambiguous ids.
 */
const TESTSSL_ID_TO_FAMILY = {
  // protocols
  'SSLv2': 'protocolWeak', 'SSLv3': 'protocolWeak',
  'TLS1': 'protocolWeak', 'TLS1_1': 'protocolWeak',
  'TLS1_2': 'protocolWeak', 'TLS1_3': 'protocolWeak',
  // ciphers
  'cipher_negotiated': 'cipherWeak', 'cipher_order': 'cipherWeak',
  'cipherlist_': 'cipherWeak',
  'std_NULL': 'cipherWeak', 'std_aNULL': 'cipherWeak',
  'std_EXPORT': 'cipherWeak', 'std_LOW': 'cipherWeak',
  'std_3DES_IDEA': 'cipherWeak', 'std_OBSOLETED': 'cipherWeak',
  'std_STRONG_NOFS': 'cipherWeak', 'std_STRONG_FS': 'cipherWeak',
  // certificate
  'cert_': 'certificate', 'OCSP_': 'certificate',
  'CT': 'certificate', 'DNS_CAArecord': 'certificate',
  // known CVEs
  'heartbleed': 'cve', 'CCS': 'cve', 'ticketbleed': 'cve',
  'ROBOT': 'cve', 'secure_renego': 'cve', 'secure_client_renego': 'cve',
  'CRIME_TLS': 'cve', 'BREACH': 'cve', 'POODLE_SSL': 'cve',
  'fallback_SCSV': 'cve', 'SWEET32': 'cve', 'FREAK': 'cve', 'DROWN': 'cve',
  'LOGJAM': 'cve', 'LOGJAM-common_primes': 'cve',
  'BEAST_CBC_TLS1': 'cve', 'BEAST': 'cve', 'LUCKY13': 'cve',
  'winshock': 'cve', 'RC4': 'cve',
  // headers
  'HSTS': 'headers', 'HSTS_preload': 'headers', 'HSTS_time': 'headers',
  'HPKP': 'headers', 'cookie_secure': 'headers', 'cookie_httponly': 'headers',
  'banner_server': 'headers', 'banner_application': 'headers',
  'security_headers': 'headers',
};

/**
 * Hardcoded fallback used when the SCF mirror is unreachable. Same shape and
 * intent as the v0 of this connector — one curated control per framework
 * per family. Less rich than the SCF-driven expansion but enough to keep
 * the gap-assessment story coherent offline.
 */
const FALLBACK_FRAMEWORKS = {
  protocolWeak: [
    { framework: 'SOC2-TSC-2017',  control_id: 'CC6.7' },
    { framework: 'NIST-800-53-r5', control_id: 'SC-8' },
    { framework: 'NIST-800-53-r5', control_id: 'SC-13' },
    { framework: 'PCI-DSS-4.0',    control_id: '4.2.1' },
    { framework: 'ISO-27002-2022', control_id: '8.24' },
  ],
  cipherWeak: [
    { framework: 'SOC2-TSC-2017',  control_id: 'CC6.7' },
    { framework: 'NIST-800-53-r5', control_id: 'SC-13' },
    { framework: 'PCI-DSS-4.0',    control_id: '4.2.1.1' },
    { framework: 'ISO-27002-2022', control_id: '8.24' },
  ],
  certificate: [
    { framework: 'SOC2-TSC-2017',  control_id: 'CC6.1' },
    { framework: 'NIST-800-53-r5', control_id: 'SC-17' },
    { framework: 'PCI-DSS-4.0',    control_id: '4.2.1' },
    { framework: 'ISO-27002-2022', control_id: '8.24' },
  ],
  cve: [
    { framework: 'SOC2-TSC-2017',  control_id: 'CC6.6' },
    { framework: 'NIST-800-53-r5', control_id: 'RA-5' },
    { framework: 'NIST-800-53-r5', control_id: 'SI-2' },
    { framework: 'PCI-DSS-4.0',    control_id: '6.3.3' },
    { framework: 'ISO-27002-2022', control_id: '8.8' },
  ],
  headers: [
    { framework: 'SOC2-TSC-2017',  control_id: 'CC6.7' },
    { framework: 'NIST-800-53-r5', control_id: 'SC-8' },
    { framework: 'ISO-27002-2022', control_id: '8.20' },
  ],
};

function uniqueScfIds(table) {
  const out = new Set();
  for (const arr of Object.values(table)) for (const id of arr) out.add(id);
  return [...out];
}

function familyForTestsslId(id) {
  if (!id) return null;
  if (TESTSSL_ID_TO_FAMILY[id]) return TESTSSL_ID_TO_FAMILY[id];
  let bestKey = null;
  for (const key of Object.keys(TESTSSL_ID_TO_FAMILY)) {
    if (id.startsWith(key) && (bestKey === null || key.length > bestKey.length)) {
      bestKey = key;
    }
  }
  return bestKey ? TESTSSL_ID_TO_FAMILY[bestKey] : null;
}

/** ---- Normalization: testssl JSON → v1 Finding doc ---- */

function normalizeTargetFindings(raw, target, runId, sourceVersion, expansion) {
  const entries = extractEntries(raw);
  const { host, port } = parseTarget(target);
  const collectedAt = new Date().toISOString();

  const evaluations = [];
  const narrative = [];
  const seen = new Set();

  for (const entry of entries) {
    const id = String(entry.id || '');
    const family = familyForTestsslId(id);
    if (!family) continue;

    const status = entrySeverityToStatus(entry);
    const severity = entrySeverityToOurSeverity(entry);
    const message = (status === 'fail' || status === 'inconclusive') ? formatMessage(entry, id) : undefined;
    const scfIds = FAMILY_TO_SCF[family] || [];

    // Always emit one SCF evaluation per (scf_id, finding-id) tuple.
    for (const scfId of scfIds) {
      addEvaluation(evaluations, seen, {
        framework: 'SCF', control_id: scfId, status, severity, message,
        dedupKey: `SCF::${scfId}::${id}::${status}`,
      });
    }

    // Fan out to other frameworks: either via SCF crosswalk expansion, or via
    // the hardcoded fallback when no expansion is available.
    if (expansion && expansion.lookup) {
      for (const scfId of scfIds) {
        const perFw = expansion.lookup.get(scfId) || {};
        for (const [fwLabel, controlIds] of Object.entries(perFw)) {
          for (const controlId of controlIds) {
            addEvaluation(evaluations, seen, {
              framework: fwLabel, control_id: controlId, status, severity, message,
              dedupKey: `${fwLabel}::${controlId}::${id}::${status}`,
            });
          }
        }
      }
    } else {
      for (const m of (FALLBACK_FRAMEWORKS[family] || [])) {
        addEvaluation(evaluations, seen, {
          framework: m.framework, control_id: m.control_id, status, severity, message,
          dedupKey: `${m.framework}::${m.control_id}::${id}::${status}`,
        });
      }
    }

    if (entry.cve || (status === 'fail' && severity === 'critical')) {
      narrative.push({
        id: `${SOURCE}-${id}`,
        title: `${id} — ${truncate(entry.finding || '', 100)}`,
        severity,
        description: formatMessage(entry, id),
        related_control_ids: scfIds.map(scfId => `SCF:${scfId}`),
      });
    }
  }

  if (evaluations.length === 0) {
    evaluations.push({
      control_framework: 'SCF',
      control_id: 'CRY-03',
      status: 'inconclusive',
      severity: 'info',
      message: 'testssl.sh produced no recognized TLS findings for this endpoint. Either the target is not exposing TLS, the scan was blocked, or all checked tests fell outside the mapping table.',
    });
  }

  return {
    schema_version: '1.0.0',
    source: SOURCE,
    source_version: `${SOURCE_VERSION}+testssl-${sourceVersion}`,
    run_id: runId,
    collected_at: collectedAt,
    resource: {
      type: 'tls_endpoint',
      id: `${host}:${port}`,
      uri: `https://${host}:${port}/`,
      region: null,
      account_id: null,
    },
    evaluations,
    findings: narrative.slice(0, 50),
    metadata: {
      target,
      host,
      port,
      scf_expansion: expansion ? { scf_version: expansion.scfVersion, frameworks: expansion.frameworkCount } : null,
    },
  };
}

function addEvaluation(evaluations, seen, { framework, control_id, status, severity, message, dedupKey }) {
  if (seen.has(dedupKey)) return;
  seen.add(dedupKey);
  const ev = { control_framework: framework, control_id, status, severity };
  if (message) ev.message = message;
  evaluations.push(ev);
}

function extractEntries(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.scanResult)) {
    const out = [];
    for (const target of raw.scanResult) {
      for (const k of Object.keys(target)) {
        const v = target[k];
        if (Array.isArray(v)) out.push(...v);
      }
    }
    return out;
  }
  return [];
}

function parseTarget(target) {
  const [host, portRaw] = target.split(':');
  const port = portRaw && /^\d+$/.test(portRaw) ? Number(portRaw) : 443;
  return { host, port };
}

function entrySeverityToStatus(entry) {
  const s = String(entry.severity || '').toUpperCase();
  if (s === 'OK' || s === 'INFO') return 'pass';
  if (s === 'LOW' || s === 'MEDIUM' || s === 'HIGH' || s === 'CRITICAL' || s === 'WARN' || s === 'FATAL') return 'fail';
  if (s === 'DEBUG') return 'pass';
  return 'inconclusive';
}

function entrySeverityToOurSeverity(entry) {
  const s = String(entry.severity || '').toUpperCase();
  if (s === 'CRITICAL' || s === 'FATAL') return 'critical';
  if (s === 'HIGH') return 'high';
  if (s === 'MEDIUM' || s === 'WARN') return 'medium';
  if (s === 'LOW') return 'low';
  return 'info';
}

function formatMessage(entry, id) {
  const parts = [];
  if (entry.finding) parts.push(entry.finding);
  if (entry.cve) parts.push(`CVE: ${entry.cve}`);
  if (entry.cwe) parts.push(`CWE: ${entry.cwe}`);
  return parts.join(' — ') || `testssl.sh ${id}: ${entry.severity || 'no detail'}`;
}

function truncate(s, n) {
  return s.length <= n ? s : s.slice(0, n - 1) + '…';
}

/** ---- Utils ---- */

function makeRunId() {
  return `tssl-${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}-${crypto.randomBytes(3).toString('hex')}`;
}

async function appendRunLog(record) {
  const line = JSON.stringify(record) + '\n';
  try { await fs.appendFile(RUNS_LOG, line); } catch {}
}

function fail(code, msg) {
  process.stderr.write(`[${SOURCE}] ${msg}\n`);
  process.exit(code);
}

function parseYaml(text) {
  const out = {};
  let listKey = null;
  for (const line of text.split('\n')) {
    const trimmed = line.replace(/#.*$/, '').replace(/\s+$/, '');
    if (!trimmed) continue;
    if (/^\s+- /.test(trimmed) && listKey) {
      out[listKey].push(trimmed.replace(/^\s+- /, '').replace(/^["']|["']$/g, ''));
      continue;
    }
    const m = /^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/.exec(trimmed);
    if (!m) continue;
    const [, k, v] = m;
    if (v === '') { out[k] = []; listKey = k; continue; }
    listKey = null;
    if (v === 'true') out[k] = true;
    else if (v === 'false') out[k] = false;
    else if (/^[0-9]+$/.test(v)) out[k] = Number(v);
    else out[k] = v.replace(/^["']|["']$/g, '');
  }
  return out;
}

const invokedFromCLI = import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedFromCLI) {
  main(process.argv.slice(2)).catch(err => { fail(1, err.stack || err.message); });
}
