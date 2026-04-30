#!/usr/bin/env node

/**
 * Record automation coverage metrics in grc-data/metrics/.
 *
 * Supports two modes:
 *   1. Single snapshot mode for one framework/provider pair
 *   2. Batch mode from a YAML/JSON config file for scheduler-friendly runs
 *
 * Usage:
 *   node plugins/grc-engineer/scripts/record-automation-metrics.js fedramp-moderate aws --window-label=2026-W16
 *   node plugins/grc-engineer/scripts/record-automation-metrics.js soc2 --controls-total=64 --controls-automated=22 --window-label=2026-W16
 *   node plugins/grc-engineer/scripts/record-automation-metrics.js --config=plugins/grc-engineer/examples/automation-metrics.yaml --window-label=current-week
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { generateFedRAMPBaselineEvidence } from '../src/evidence-collector.js';
import { loadFedRAMP20xKSI } from '../src/config-loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../..');
const DEFAULT_OUT_DIR = path.join(REPO_ROOT, 'grc-data', 'metrics');
const DEFAULT_SOURCE = 'grc-engineer://record-automation-metrics';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function usage() {
  return `Usage:
  node plugins/grc-engineer/scripts/record-automation-metrics.js <framework> [provider] [options]
  node plugins/grc-engineer/scripts/record-automation-metrics.js --config=<path> [options]

Derived mode (FedRAMP only):
  <framework>                      fedramp-low | fedramp-moderate | fedramp-high | fedramp-20x-ksi
  [provider]                       aws | azure | gcp | kubernetes (default: aws)

Manual mode (any framework alias):
  --controls-total=<n>             Total in-scope controls
  --controls-automated=<n>         Controls with automated evidence
  --controls-manual=<n>            Optional manual count (otherwise derived)
  --from-framework-metadata        Derive controls-total from plugin framework_metadata

Shared options:
  --config=<path>                  YAML or JSON batch config
  --recorded-at=<iso8601>          Observation timestamp (default: now)
  --window-start=<iso8601>         Period start
  --window-end=<iso8601>           Period end (default: recorded-at when window used)
  --window-label=<label>           Optional period label like 2026-W16 or current-week
  --source=<string>                Provenance string for metric rows
  --subject-kind=<kind>            Subject kind (default: framework)
  --subject-id=<id>                Subject identifier (default: framework alias)
  --dimension=<key=value>          Extra dimension, may be repeated
  --out-dir=<path>                 Output directory (default: ./grc-data/metrics)
  --dry-run                        Print generated rows without writing files
  --help                           Show this help

Batch config shape:
  defaults:
    window_label: current-week
    out_dir: ./grc-data/metrics
    dimensions:
      audience: ciso-weekly
  entries:
    - framework: fedramp-moderate
      provider: aws
    - framework: soc2
      controls_automated: 22
      from_framework_metadata: true

Examples:
  node plugins/grc-engineer/scripts/record-automation-metrics.js fedramp-moderate aws --window-label=2026-W16
  node plugins/grc-engineer/scripts/record-automation-metrics.js soc2 --controls-total=64 --controls-automated=22 --window-label=2026-W16
  node plugins/grc-engineer/scripts/record-automation-metrics.js soc2 --controls-automated=22 --from-framework-metadata --window-label=2026-W16
  node plugins/grc-engineer/scripts/record-automation-metrics.js --config=plugins/grc-engineer/examples/automation-metrics.yaml --window-label=current-week`;
}

function fail(message) {
  throw new Error(message);
}

function toNumber(value, flagName) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    fail(`${flagName} must be a number`);
  }
  if (parsed < 0) {
    fail(`${flagName} must be >= 0`);
  }
  return parsed;
}

function toIsoString(value, flagName) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    fail(`${flagName} must be a valid ISO 8601 timestamp`);
  }
  return date.toISOString();
}

function normalizeFrameworkAlias(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function detectFedRAMPMode(alias, explicitMode) {
  if (explicitMode) {
    return explicitMode;
  }

  const normalized = normalizeFrameworkAlias(alias);
  const baselineMatch = normalized.match(/^fedramp-(low|moderate|high)$/);
  if (baselineMatch) {
    return { type: 'baseline', baseline: baselineMatch[1] };
  }

  if (normalized === 'fedramp-20x' || normalized === 'fedramp-20x-ksi') {
    return { type: '20x', baseline: '20x-ksi' };
  }

  return null;
}

export function parseArgs(argv) {
  const opts = {
    framework: null,
    provider: null,
    controlsTotal: null,
    controlsAutomated: null,
    controlsManual: null,
    recordedAt: new Date().toISOString(),
    windowStart: null,
    windowEnd: null,
    windowLabel: null,
    source: null,
    subjectKind: 'framework',
    subjectId: null,
    dimensions: {},
    outDir: DEFAULT_OUT_DIR,
    dryRun: false,
    fromFedRAMP: null,
    fromFrameworkMetadata: false,
    configPath: null,
    help: false,
    provided: new Set()
  };

  const provided = opts.provided;
  const positionals = [];

  for (const token of argv) {
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }

    const [rawKey, rawValue] = token.slice(2).split('=');
    const key = rawKey;
    const value = rawValue ?? true;

    switch (key) {
      case 'config':
        opts.configPath = path.resolve(String(value));
        provided.add('configPath');
        break;
      case 'controls-total':
        opts.controlsTotal = toNumber(value, '--controls-total');
        provided.add('controlsTotal');
        break;
      case 'controls-automated':
        opts.controlsAutomated = toNumber(value, '--controls-automated');
        provided.add('controlsAutomated');
        break;
      case 'controls-manual':
        opts.controlsManual = toNumber(value, '--controls-manual');
        provided.add('controlsManual');
        break;
      case 'recorded-at':
        opts.recordedAt = toIsoString(value, '--recorded-at');
        provided.add('recordedAt');
        break;
      case 'window-start':
        opts.windowStart = toIsoString(value, '--window-start');
        provided.add('windowStart');
        break;
      case 'window-end':
        opts.windowEnd = toIsoString(value, '--window-end');
        provided.add('windowEnd');
        break;
      case 'window-label':
        opts.windowLabel = String(value);
        provided.add('windowLabel');
        break;
      case 'source':
        opts.source = String(value);
        provided.add('source');
        break;
      case 'subject-kind':
        opts.subjectKind = String(value);
        provided.add('subjectKind');
        break;
      case 'subject-id':
        opts.subjectId = String(value);
        provided.add('subjectId');
        break;
      case 'dimension': {
        const idx = String(value).indexOf('=');
        if (idx <= 0) {
          fail('--dimension must look like key=value');
        }
        const dimKey = String(value).slice(0, idx).trim();
        const dimValue = String(value).slice(idx + 1).trim();
        if (!dimKey) {
          fail('--dimension key cannot be empty');
        }
        opts.dimensions[dimKey] = dimValue;
        provided.add('dimensions');
        break;
      }
      case 'out-dir':
        opts.outDir = path.resolve(String(value));
        provided.add('outDir');
        break;
      case 'dry-run':
        opts.dryRun = true;
        provided.add('dryRun');
        break;
      case 'from-fedramp-baseline': {
        const baseline = normalizeFrameworkAlias(value);
        if (!['low', 'moderate', 'high', '20x', '20x-ksi'].includes(baseline)) {
          fail('--from-fedramp-baseline must be one of low|moderate|high|20x|20x-ksi');
        }
        opts.fromFedRAMP = baseline === '20x' ? { type: '20x', baseline: '20x-ksi' } : (
          baseline === '20x-ksi'
            ? { type: '20x', baseline: '20x-ksi' }
            : { type: 'baseline', baseline }
        );
        provided.add('fromFedRAMP');
        break;
      }
      case 'from-framework-metadata':
        opts.fromFrameworkMetadata = true;
        provided.add('fromFrameworkMetadata');
        break;
      case 'help':
      case 'h':
        opts.help = true;
        break;
      default:
        fail(`Unknown flag: --${key}`);
    }
  }

  if (positionals[0]) {
    opts.framework = normalizeFrameworkAlias(positionals[0]);
    provided.add('framework');
  }
  if (positionals[1]) {
    opts.provider = normalizeFrameworkAlias(positionals[1]);
    provided.add('provider');
  }

  return opts;
}

async function readJsonFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    if (err instanceof SyntaxError) {
      fail(`Could not parse JSON in ${path.relative(REPO_ROOT, filePath)}: ${err.message}`);
    }
    throw err;
  }
}

async function loadFrameworkMetadata(frameworkAlias) {
  const normalized = normalizeFrameworkAlias(frameworkAlias);
  const marketplacePath = path.join(REPO_ROOT, '.claude-plugin', 'marketplace.json');
  const marketplace = await readJsonFile(marketplacePath);
  const plugins = Array.isArray(marketplace.plugins) ? marketplace.plugins : [];

  for (const entry of plugins) {
    const entryName = normalizeFrameworkAlias(entry.name);
    const source = entry.source ? path.resolve(REPO_ROOT, entry.source) : null;
    if (!source) {
      continue;
    }

    const manifestPath = path.join(source, '.claude-plugin', 'plugin.json');
    let manifest;
    try {
      manifest = await readJsonFile(manifestPath);
    } catch (err) {
      if (err && err.code === 'ENOENT') {
        continue;
      }
      throw err;
    }

    const metadata = manifest.framework_metadata;
    if (!metadata || typeof metadata !== 'object') {
      continue;
    }

    const candidates = [
      entryName,
      normalizeFrameworkAlias(manifest.name),
      normalizeFrameworkAlias(metadata.scf_framework_id),
      normalizeFrameworkAlias(metadata.display_name)
    ].filter(Boolean);

    if (candidates.includes(normalized)) {
      return {
        marketplaceName: entry.name,
        manifestPath,
        metadata
      };
    }
  }

  fail(`No framework plugin metadata found for ${frameworkAlias}`);
}

function getIsoWeekData(isoString) {
  const original = new Date(isoString);
  const date = new Date(Date.UTC(
    original.getUTCFullYear(),
    original.getUTCMonth(),
    original.getUTCDate()
  ));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const isoYear = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil((((date - yearStart) / MS_PER_DAY) + 1) / 7);

  const weekStart = new Date(Date.UTC(
    original.getUTCFullYear(),
    original.getUTCMonth(),
    original.getUTCDate()
  ));
  const weekDay = weekStart.getUTCDay() || 7;
  weekStart.setUTCDate(weekStart.getUTCDate() - weekDay + 1);

  return {
    isoYear,
    week,
    label: `${isoYear}-W${String(week).padStart(2, '0')}`,
    start: weekStart.toISOString()
  };
}

export function buildWindow(opts) {
  if (!opts.windowStart && !opts.windowEnd && !opts.windowLabel) {
    return null;
  }

  const usesCurrentWeek = ['current-week', 'auto-week'].includes(String(opts.windowLabel || '').toLowerCase());
  if (usesCurrentWeek) {
    const weekData = getIsoWeekData(opts.recordedAt);
    return {
      start: opts.windowStart || weekData.start,
      end: opts.windowEnd || opts.recordedAt,
      label: weekData.label
    };
  }

  const end = opts.windowEnd || opts.recordedAt;
  const endDate = new Date(end);
  const start = opts.windowStart || new Date(endDate.getTime() - (7 * MS_PER_DAY)).toISOString();
  const window = { start, end };

  if (opts.windowLabel) {
    window.label = opts.windowLabel;
  }

  return window;
}

function compactTimestamp(iso) {
  return iso.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function safeSlug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function deriveFedRAMP20x(provider) {
  const normalizedProvider = normalizeFrameworkAlias(provider || 'aws');
  const config = await loadFedRAMP20xKSI();
  const controls = Object.values(config.controls || {});
  const automated = controls.filter(control => control.cloud_tests && control.cloud_tests[normalizedProvider]).length;
  const total = controls.length;

  return {
    framework: 'fedramp-20x-ksi',
    provider: normalizedProvider,
    total,
    automated,
    manual: total - automated,
    coveragePercent: total > 0 ? Math.round((automated / total) * 100) : 0,
    measurementScope: 'tooling-capability',
    defaultSource: `${DEFAULT_SOURCE}/capability-baseline`,
    metadata: {
      derivation: 'fedramp-20x-ksi',
      provider: normalizedProvider,
      total_controls: total,
      automated_controls: automated,
      manual_controls: total - automated
    }
  };
}

export async function deriveCounts(opts) {
  const hasManualInputs = opts.controlsAutomated !== null || opts.controlsTotal !== null || opts.controlsManual !== null;
  const fedrampMode = hasManualInputs && !opts.fromFedRAMP
    ? null
    : detectFedRAMPMode(opts.framework, opts.fromFedRAMP);

  if (fedrampMode) {
    if (fedrampMode.type === '20x') {
      return deriveFedRAMP20x(opts.provider || 'aws');
    }

    const derived = await generateFedRAMPBaselineEvidence(fedrampMode.baseline, opts.provider || 'aws');
    return {
      framework: `fedramp-${fedrampMode.baseline}`,
      provider: derived.provider,
      total: derived.metadata.totalControls,
      automated: derived.metadata.automatedControls,
      manual: derived.metadata.manualControls,
      coveragePercent: derived.metadata.coveragePercent,
      measurementScope: 'tooling-capability',
      defaultSource: `${DEFAULT_SOURCE}/capability-baseline`,
      metadata: {
        derivation: 'fedramp-baseline',
        baseline: fedrampMode.baseline,
        provider: derived.provider,
        total_controls: derived.metadata.totalControls,
        automated_controls: derived.metadata.automatedControls,
        manual_controls: derived.metadata.manualControls
      }
    };
  }

  if (!opts.framework) {
    fail('Missing framework alias');
  }
  if (opts.controlsAutomated === null) {
    fail('Manual mode requires --controls-automated=<n>');
  }

  let total = opts.controlsTotal;
  let manual = opts.controlsManual;
  let metadataDerivation = null;

  if (total === null && opts.fromFrameworkMetadata) {
    const framework = await loadFrameworkMetadata(opts.framework);
    const frameworkTotal = Number(framework.metadata.framework_controls_mapped);
    if (!Number.isFinite(frameworkTotal) || !Number.isInteger(frameworkTotal) || frameworkTotal < 0) {
      fail(`framework_metadata.framework_controls_mapped is missing or invalid for ${opts.framework}`);
    }
    total = frameworkTotal;
    metadataDerivation = {
      derivation: 'framework-metadata',
      marketplace_plugin: framework.marketplaceName,
      manifest_path: path.relative(REPO_ROOT, framework.manifestPath),
      scf_framework_id: framework.metadata.scf_framework_id,
      framework_display_name: framework.metadata.display_name,
      framework_controls_mapped: frameworkTotal
    };
  }

  if (total === null && manual === null) {
    fail('Manual mode requires --controls-total=<n>, --controls-manual=<n>, or --from-framework-metadata');
  }
  if (total === null) {
    total = opts.controlsAutomated + manual;
  }
  if (manual === null) {
    manual = total - opts.controlsAutomated;
  }

  if (manual < 0) {
    fail('controls_automated cannot exceed controls_total');
  }
  if (opts.controlsAutomated + manual !== total) {
    fail('--controls-total must equal controls-automated + controls-manual');
  }

  return {
    framework: opts.framework,
    provider: opts.provider || null,
    total,
    automated: opts.controlsAutomated,
    manual,
    coveragePercent: total > 0 ? Math.round((opts.controlsAutomated / total) * 100) : 0,
    measurementScope: 'operator-observed',
    defaultSource: metadataDerivation ? `${DEFAULT_SOURCE}/framework-metadata` : `${DEFAULT_SOURCE}/manual`,
    metadata: {
      derivation: metadataDerivation ? 'operator-observed-with-framework-metadata-total' : 'manual',
      total_controls: total,
      automated_controls: opts.controlsAutomated,
      manual_controls: manual,
      ...(metadataDerivation ? { total_source: metadataDerivation } : {})
    }
  };
}

export function buildRows({ counts, opts, window }) {
  const recordedAt = opts.recordedAt;
  const source = opts.source || counts.defaultSource || DEFAULT_SOURCE;
  const subjectId = opts.subjectId || counts.framework;
  const dimensions = {
    framework: counts.framework,
    measurement_scope: counts.measurementScope,
    ...opts.dimensions
  };

  if (counts.provider) {
    dimensions.provider = counts.provider;
  }

  const baseRow = {
    schema_version: '1.0.0',
    recorded_at: recordedAt,
    source,
    subject: {
      kind: opts.subjectKind,
      id: subjectId
    },
    dimensions,
    metadata: {
      ...counts.metadata
    }
  };

  if (window) {
    baseRow.window = window;
  }

  return [
    {
      ...baseRow,
      metric_id: 'automation.coverage_pct',
      label: 'Automation Coverage',
      description: 'Share of in-scope controls with automated evidence collection for the period.',
      value: counts.coveragePercent,
      unit: '%',
      aggregation: 'percentage'
    },
    {
      ...baseRow,
      metric_id: 'automation.controls_automated',
      label: 'Automated Controls',
      description: 'Count of in-scope controls with automated evidence collection.',
      value: counts.automated,
      unit: 'controls',
      aggregation: 'count'
    },
    {
      ...baseRow,
      metric_id: 'automation.controls_manual',
      label: 'Manual Controls',
      description: 'Count of in-scope controls that still require manual evidence collection.',
      value: counts.manual,
      unit: 'controls',
      aggregation: 'count'
    },
    {
      ...baseRow,
      metric_id: 'automation.controls_total',
      label: 'Total Controls',
      description: 'Count of in-scope controls represented in the automation snapshot.',
      value: counts.total,
      unit: 'controls',
      aggregation: 'count'
    }
  ];
}

export async function writeRows(rows, outDir, counts) {
  await fs.mkdir(outDir, { recursive: true });
  const stamp = compactTimestamp(rows[0].recorded_at);
  const scope = [counts.framework, counts.provider].filter(Boolean).map(safeSlug).join('-');
  const written = [];

  for (const row of rows) {
    const filename = `${stamp}-${scope}-${safeSlug(row.metric_id)}.json`;
    const fullPath = path.join(outDir, filename);
    await fs.writeFile(fullPath, `${JSON.stringify(row, null, 2)}\n`, 'utf8');
    written.push(fullPath);
  }

  return written;
}

function getConfigValue(input, ...keys) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(input, key) && input[key] !== undefined) {
      return input[key];
    }
  }
  return undefined;
}

function resolveConfigPath(baseDir, value, flagName) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const asString = String(value);
  return path.isAbsolute(asString)
    ? asString
    : path.resolve(baseDir, asString);
}

function normalizeFromFedRAMPValue(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const baseline = normalizeFrameworkAlias(value);
  if (!['low', 'moderate', 'high', '20x', '20x-ksi'].includes(baseline)) {
    fail('from_fedramp_baseline must be one of low|moderate|high|20x|20x-ksi');
  }
  return baseline === '20x' || baseline === '20x-ksi'
    ? { type: '20x', baseline: '20x-ksi' }
    : { type: 'baseline', baseline };
}

function normalizeConfigOptions(input, baseDir) {
  const dimensions = getConfigValue(input, 'dimensions') || {};
  if (dimensions && (typeof dimensions !== 'object' || Array.isArray(dimensions))) {
    fail('dimensions in config must be an object');
  }

  const normalized = {
    framework: getConfigValue(input, 'framework', 'framework_alias'),
    provider: getConfigValue(input, 'provider'),
    controlsTotal: getConfigValue(input, 'controlsTotal', 'controls_total'),
    controlsAutomated: getConfigValue(input, 'controlsAutomated', 'controls_automated'),
    controlsManual: getConfigValue(input, 'controlsManual', 'controls_manual'),
    recordedAt: getConfigValue(input, 'recordedAt', 'recorded_at'),
    windowStart: getConfigValue(input, 'windowStart', 'window_start'),
    windowEnd: getConfigValue(input, 'windowEnd', 'window_end'),
    windowLabel: getConfigValue(input, 'windowLabel', 'window_label'),
    source: getConfigValue(input, 'source'),
    subjectKind: getConfigValue(input, 'subjectKind', 'subject_kind'),
    subjectId: getConfigValue(input, 'subjectId', 'subject_id'),
    outDir: resolveConfigPath(baseDir, getConfigValue(input, 'outDir', 'out_dir')),
    dryRun: getConfigValue(input, 'dryRun', 'dry_run'),
    fromFedRAMP: normalizeFromFedRAMPValue(getConfigValue(input, 'fromFedRAMP', 'from_fedramp_baseline')),
    fromFrameworkMetadata: getConfigValue(input, 'fromFrameworkMetadata', 'from_framework_metadata'),
    dimensions: { ...dimensions }
  };

  if (normalized.framework !== undefined) {
    normalized.framework = normalizeFrameworkAlias(normalized.framework);
  }
  if (normalized.provider !== undefined) {
    normalized.provider = normalizeFrameworkAlias(normalized.provider);
  }
  if (normalized.controlsTotal !== undefined) {
    normalized.controlsTotal = toNumber(normalized.controlsTotal, 'controls_total');
  }
  if (normalized.controlsAutomated !== undefined) {
    normalized.controlsAutomated = toNumber(normalized.controlsAutomated, 'controls_automated');
  }
  if (normalized.controlsManual !== undefined) {
    normalized.controlsManual = toNumber(normalized.controlsManual, 'controls_manual');
  }
  if (normalized.recordedAt !== undefined) {
    normalized.recordedAt = toIsoString(normalized.recordedAt, 'recorded_at');
  }
  if (normalized.windowStart !== undefined) {
    normalized.windowStart = toIsoString(normalized.windowStart, 'window_start');
  }
  if (normalized.windowEnd !== undefined) {
    normalized.windowEnd = toIsoString(normalized.windowEnd, 'window_end');
  }
  if (normalized.dryRun !== undefined) {
    normalized.dryRun = Boolean(normalized.dryRun);
  }
  if (normalized.fromFrameworkMetadata !== undefined) {
    normalized.fromFrameworkMetadata = Boolean(normalized.fromFrameworkMetadata);
  }

  return normalized;
}

function mergeOptions(base, overrides) {
  const merged = {
    ...base,
    dimensions: {
      ...(base.dimensions || {})
    }
  };

  for (const [key, value] of Object.entries(overrides || {})) {
    if (key === 'dimensions') {
      continue;
    }
    if (value !== undefined) {
      merged[key] = value;
    }
  }

  merged.dimensions = {
    ...(base.dimensions || {}),
    ...((overrides && overrides.dimensions) || {})
  };

  return merged;
}

function extractCliOverrides(opts) {
  const overrides = {};
  const keys = [
    'provider',
    'controlsTotal',
    'controlsAutomated',
    'controlsManual',
    'recordedAt',
    'windowStart',
    'windowEnd',
    'windowLabel',
    'source',
    'subjectKind',
    'subjectId',
    'outDir',
    'dryRun',
    'fromFedRAMP',
    'fromFrameworkMetadata'
  ];

  for (const key of keys) {
    if (opts.provided.has(key)) {
      overrides[key] = opts[key];
    }
  }
  if (opts.provided.has('dimensions')) {
    overrides.dimensions = { ...opts.dimensions };
  }

  return overrides;
}

async function loadBatchConfig(configPath) {
  const raw = await fs.readFile(configPath, 'utf8');
  const parsed = configPath.endsWith('.json') ? JSON.parse(raw) : yaml.load(raw);

  if (Array.isArray(parsed)) {
    return { defaults: {}, entries: parsed };
  }
  if (!parsed || typeof parsed !== 'object') {
    fail('Batch config must be an object or array');
  }
  if (!Array.isArray(parsed.entries)) {
    fail('Batch config must contain an entries array');
  }

  return {
    defaults: parsed.defaults || {},
    entries: parsed.entries
  };
}

function buildBatchEntries(cliOpts, batchConfig) {
  if (cliOpts.framework || (cliOpts.provided.has('provider') && !cliOpts.configPath)) {
    fail('Do not combine positional framework/provider arguments with --config');
  }

  const baseDir = path.dirname(cliOpts.configPath);
  const defaults = normalizeConfigOptions(batchConfig.defaults || {}, baseDir);
  const cliOverrides = extractCliOverrides(cliOpts);
  const batchRecordedAt = cliOverrides.recordedAt || defaults.recordedAt || new Date().toISOString();

  return batchConfig.entries.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      fail(`Config entry ${index + 1} must be an object`);
    }

    const normalizedEntry = normalizeConfigOptions(entry, baseDir);
    const merged = mergeOptions(
      mergeOptions({
        framework: null,
        provider: null,
        controlsTotal: null,
        controlsAutomated: null,
        controlsManual: null,
        recordedAt: batchRecordedAt,
        windowStart: null,
        windowEnd: null,
        windowLabel: null,
        source: null,
        subjectKind: 'framework',
        subjectId: null,
        dimensions: {},
        outDir: DEFAULT_OUT_DIR,
        dryRun: false,
        fromFedRAMP: null,
        fromFrameworkMetadata: false
      }, defaults),
      normalizedEntry
    );

    return mergeOptions(merged, cliOverrides);
  });
}

export async function runRecordAutomationMetrics(opts) {
  const counts = await deriveCounts(opts);
  const window = buildWindow(opts);
  const rows = buildRows({ counts, opts, window });
  const written = opts.dryRun ? [] : await writeRows(rows, opts.outDir, counts);

  return { counts, window, rows, written, opts };
}

function printSingleResult(result) {
  if (result.opts.dryRun) {
    console.log(JSON.stringify(result.rows, null, 2));
    return;
  }

  console.log(`Wrote ${result.written.length} metric row(s) to ${path.relative(process.cwd(), result.opts.outDir) || '.'}`);
  for (const file of result.written) {
    console.log(`  - ${path.relative(process.cwd(), file)}`);
  }
  console.log(`Coverage: ${result.counts.coveragePercent}% (${result.counts.automated}/${result.counts.total} automated, ${result.counts.manual} manual)`);
  if (result.window) {
    const label = result.window.label ? `${result.window.label} ` : '';
    console.log(`Window: ${label}(${result.window.start} -> ${result.window.end})`);
  }
}

function printBatchResults(results) {
  const anyDryRun = results.some(result => result.opts.dryRun);
  if (anyDryRun) {
    results.forEach((result, index) => {
      if (index > 0) {
        console.log('');
      }
      const scope = [result.counts.framework, result.counts.provider].filter(Boolean).join(' ');
      console.log(`## ${scope}`);
      console.log(JSON.stringify(result.rows, null, 2));
    });
    return;
  }

  const totalRows = results.reduce((sum, result) => sum + result.written.length, 0);
  console.log(`Wrote ${totalRows} metric row(s) across ${results.length} snapshot(s).`);
  for (const result of results) {
    const scope = [result.counts.framework, result.counts.provider].filter(Boolean).join(' ');
    console.log(`- ${scope}: ${result.counts.coveragePercent}% (${result.counts.automated}/${result.counts.total})`);
    for (const file of result.written) {
      console.log(`  ${path.relative(process.cwd(), file)}`);
    }
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    console.log(usage());
    return;
  }

  if (opts.configPath) {
    const batchConfig = await loadBatchConfig(opts.configPath);
    const entries = buildBatchEntries(opts, batchConfig);
    if (!entries.length) {
      fail('Batch config contains no entries');
    }
    const results = [];
    for (const entry of entries) {
      results.push(await runRecordAutomationMetrics(entry));
    }
    printBatchResults(results);
    return;
  }

  if (!opts.framework) {
    console.log(usage());
    process.exit(2);
  }

  const result = await runRecordAutomationMetrics(opts);
  printSingleResult(result);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => {
    console.error(`record-automation-metrics: ${err.message}`);
    if (process.env.DEBUG) {
      console.error(err);
    }
    process.exit(1);
  });
}
