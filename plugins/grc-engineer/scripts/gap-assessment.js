#!/usr/bin/env node

/**
 * /grc-engineer:gap-assessment
 *
 * Aggregates findings from connector plugins, maps to the requested frameworks
 * via SCF crosswalks, and emits a prioritized gap report.
 *
 * Pipeline:
 *   1. Load cached findings from ~/.cache/claude-grc/findings/<source>/*.json
 *   2. Validate each against schemas/finding.schema.json (v1)
 *   3. For each evaluation, resolve to SCF control(s) and expand to requested frameworks
 *   4. Aggregate coverage, failures, severities, tiers
 *   5. Emit in the requested format: markdown | json | sarif | oscal-ar
 *
 * Usage:
 *   node scripts/gap-assessment.js <frameworks> [options]
 *   node scripts/gap-assessment.js SOC2,FedRAMP-Moderate --sources=aws-inspector,github-inspector
 *
 * Options:
 *   --sources=<csv>          Connectors to include (default: all with cached findings)
 *   --refresh                Skip cache; re-collect each source (emits guidance; this script does not re-run connectors)
 *   --output=<fmt>           markdown (default) | json | sarif | oscal-ar
 *   --cache-dir=<path>       Override ~/.cache/claude-grc/findings
 *   --report-dir=<path>      Where to write the report bundle (default: ./gap-assessment-<date>/)
 *   --offline                Use cached SCF data only
 *   --quiet                  Suppress progress output
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { initSCF } from './scf-client.js';

const FINDINGS_CACHE = path.join(os.homedir(), '.cache', 'claude-grc', 'findings');
const SCHEMA_PATH = path.resolve(new URL('../../../schemas/finding.schema.json', import.meta.url).pathname);

const EXIT = { OK: 0, USAGE: 2, NO_SOURCES: 3, NO_FRAMEWORKS: 4, SCF_UNAVAILABLE: 5, VALIDATION: 6 };

async function main(argv) {
  const args = parseArgs(argv);
  if (!args.frameworks.length) {
    fail(EXIT.NO_FRAMEWORKS, 'Missing frameworks. Example: gap-assessment SOC2,FedRAMP-Moderate');
  }

  const cacheDir = args.cacheDir || FINDINGS_CACHE;
  const sources = args.sources.length ? args.sources : await discoverSources(cacheDir);
  if (!sources.length) {
    fail(EXIT.NO_SOURCES, `No cached findings under ${cacheDir}. Run /<tool>:collect first.`);
  }

  const log = args.quiet ? () => {} : (msg) => process.stderr.write(`[gap-assessment] ${msg}\n`);
  log(`frameworks: ${args.frameworks.join(', ')}`);
  log(`sources:    ${sources.join(', ')}`);

  const scf = await initSCF({ offline: args.offline }).catch(err => {
    fail(EXIT.SCF_UNAVAILABLE, `SCF client init failed: ${err.message}`);
  });
  log(`SCF v${scf.version()} loaded`);

  const { findings, errors: loadErrors } = await loadFindings(cacheDir, sources);
  log(`findings:   ${findings.length} documents across ${sources.length} sources`);
  if (loadErrors.length) log(`  (${loadErrors.length} invalid — see report)`);

  const runId = makeRunId();
  const report = await buildReport({
    runId,
    frameworks: args.frameworks,
    sources,
    findings,
    scf,
    loadErrors,
    log
  });

  const bundleDir = args.reportDir || path.resolve(`./gap-assessment-${runId}`);
  await fs.mkdir(bundleDir, { recursive: true });
  const raw = path.join(bundleDir, 'findings.normalized.json');
  await fs.writeFile(raw, JSON.stringify(report.normalized, null, 2));

  let rendered;
  switch (args.output) {
    case 'json':     rendered = JSON.stringify(report.summary, null, 2); break;
    case 'sarif':    rendered = JSON.stringify(toSarif(report), null, 2); break;
    case 'oscal-ar': rendered = JSON.stringify(toOscalAssessmentResults(report), null, 2); break;
    case 'markdown':
    default:         rendered = renderMarkdown(report);
  }
  const reportPath = path.join(bundleDir, `gap-report.${args.output === 'markdown' ? 'md' : args.output}`);
  await fs.writeFile(reportPath, rendered);

  if (!args.quiet) {
    process.stderr.write(`\nReport bundle: ${bundleDir}\n`);
  }
  process.stdout.write(rendered);
  if (!rendered.endsWith('\n')) process.stdout.write('\n');
}

function parseArgs(argv) {
  const out = {
    frameworks: [],
    sources: [],
    output: 'markdown',
    cacheDir: null,
    reportDir: null,
    refresh: false,
    offline: false,
    quiet: false
  };
  let positional = null;
  for (const tok of argv) {
    if (tok.startsWith('--')) {
      const [rawKey, rawVal] = tok.slice(2).split('=');
      const key = rawKey;
      const val = rawVal ?? true;
      switch (key) {
        case 'sources':    out.sources = String(val).split(',').map(s => s.trim()).filter(Boolean); break;
        case 'output':     out.output = String(val); break;
        case 'cache-dir':  out.cacheDir = String(val); break;
        case 'report-dir': out.reportDir = String(val); break;
        case 'refresh':    out.refresh = true; break;
        case 'offline':    out.offline = true; break;
        case 'quiet':      out.quiet = true; break;
        default:
          fail(EXIT.USAGE, `Unknown flag: --${key}`);
      }
    } else if (positional === null) {
      positional = tok;
    }
  }
  if (positional) {
    out.frameworks = positional.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (!['markdown', 'json', 'sarif', 'oscal-ar'].includes(out.output)) {
    fail(EXIT.USAGE, `--output must be one of markdown|json|sarif|oscal-ar`);
  }
  return out;
}

async function discoverSources(cacheDir) {
  try {
    const entries = await fs.readdir(cacheDir, { withFileTypes: true });
    return entries.filter(e => e.isDirectory()).map(e => e.name);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function loadFindings(cacheDir, sources) {
  const findings = [];
  const errors = [];
  for (const source of sources) {
    const srcDir = path.join(cacheDir, source);
    let files;
    try {
      files = await fs.readdir(srcDir);
    } catch (err) {
      if (err.code === 'ENOENT') {
        errors.push({ source, kind: 'no-cache', message: `No findings cached under ${srcDir}` });
        continue;
      }
      throw err;
    }
    for (const f of files.filter(n => n.endsWith('.json'))) {
      const full = path.join(srcDir, f);
      let doc;
      try {
        doc = JSON.parse(await fs.readFile(full, 'utf8'));
      } catch (err) {
        errors.push({ source, file: f, kind: 'invalid-json', message: err.message });
        continue;
      }
      // Single-document or array shape
      const docs = Array.isArray(doc) ? doc : [doc];
      for (const d of docs) {
        const errs = validateFinding(d);
        if (errs.length) {
          errors.push({ source, file: f, kind: 'schema-violation', violations: errs });
          continue;
        }
        findings.push(d);
      }
    }
  }
  return { findings, errors };
}

function validateFinding(d) {
  const errs = [];
  const required = ['schema_version', 'source', 'source_version', 'run_id', 'collected_at', 'resource', 'evaluations'];
  for (const k of required) if (!(k in d)) errs.push(`missing ${k}`);
  if (d.schema_version && !/^1\./.test(String(d.schema_version))) {
    errs.push(`unsupported schema_version ${d.schema_version} (need 1.x)`);
  }
  if (!d.resource?.type || !d.resource?.id) errs.push('resource must include type and id');
  if (!Array.isArray(d.evaluations) || !d.evaluations.length) errs.push('evaluations must be a non-empty array');
  else {
    d.evaluations.forEach((e, i) => {
      if (!e.control_framework) errs.push(`evaluations[${i}].control_framework missing`);
      if (!e.control_id)        errs.push(`evaluations[${i}].control_id missing`);
      if (!['pass','fail','not_applicable','inconclusive','skipped'].includes(e.status)) {
        errs.push(`evaluations[${i}].status invalid: ${e.status}`);
      }
      if (e.severity && !['critical','high','medium','low','info'].includes(e.severity)) {
        errs.push(`evaluations[${i}].severity invalid: ${e.severity}`);
      }
      if (e.status === 'fail' && (!e.severity || !e.message)) {
        errs.push(`evaluations[${i}] status=fail requires severity and message`);
      }
    });
  }
  return errs;
}

async function buildReport({ runId, frameworks, sources, findings, scf, loadErrors, log }) {
  // Normalize every evaluation into (scfId, frameworkProjection) rows.
  // We anchor on SCF controls; non-SCF evaluations are reverse-mapped.
  const scfHits = new Map();  // scfId → { control, evaluations: [{source, resource, evaluation}] }
  const resolveCache = new Map(); // "fw:id" → Array<{scf_id, scf_control}>

  for (const doc of findings) {
    for (const ev of doc.evaluations) {
      const key = `${ev.control_framework}:${ev.control_id}`;
      let resolutions = resolveCache.get(key);
      if (resolutions === undefined) {
        try {
          resolutions = await scf.resolve(ev.control_framework, ev.control_id);
        } catch (err) {
          log(`resolve failed for ${key}: ${err.message}`);
          resolutions = [];
        }
        resolveCache.set(key, resolutions);
      }
      if (!resolutions.length) continue;
      for (const r of resolutions) {
        if (!scfHits.has(r.scf_id)) {
          scfHits.set(r.scf_id, { control: r.scf_control, evaluations: [] });
        }
        scfHits.get(r.scf_id).evaluations.push({
          source: doc.source,
          source_version: doc.source_version,
          resource: doc.resource,
          run_id: doc.run_id,
          collected_at: doc.collected_at,
          evaluation: ev
        });
      }
    }
  }

  // Expand every SCF hit into each requested framework.
  const expansionCache = new Map();  // scfId → Map<frameworkLabel, Array<controlId>>
  for (const scfId of scfHits.keys()) {
    try {
      expansionCache.set(scfId, await scf.expand(scfId, frameworks));
    } catch (err) {
      log(`expand failed for ${scfId}: ${err.message}`);
      expansionCache.set(scfId, new Map(frameworks.map(f => [f, []])));
    }
  }

  // Compute per-framework coverage.
  const frameworkStats = frameworks.map(fw => ({
    framework: fw,
    total_controls: 0,
    evaluated: 0,
    passing: 0,
    failing: 0,
    failing_critical: 0,
    failing_high: 0,
    failing_medium: 0,
    failing_low: 0,
    inconclusive: 0
  }));

  // Gap tiers
  const tier1 = []; // blocks cert (critical + high failing, or PCI/FedRAMP-mandatory failing)
  const tier2 = []; // audit finding (medium)
  const tier3 = []; // recommendation (low)
  const passes = [];
  const inconclusive = [];

  for (const [scfId, entry] of scfHits) {
    const control = entry.control;
    const expansions = expansionCache.get(scfId) || new Map();
    const worstStatus = worstOf(entry.evaluations.map(e => e.evaluation.status));
    const worstSeverity = worstSeverityOf(entry.evaluations.map(e => e.evaluation.severity).filter(Boolean));

    const perFrameworkControlIds = {};
    let anyMapped = false;
    for (const fw of frameworks) {
      const controlIds = expansions.get(fw) || [];
      if (controlIds.length) anyMapped = true;
      perFrameworkControlIds[fw] = controlIds;
    }
    if (!anyMapped) continue;  // SCF control doesn't map to any requested framework; skip

    // Update stats: count this SCF control as "evaluated" in each framework it maps to.
    for (const stat of frameworkStats) {
      const controlIds = perFrameworkControlIds[stat.framework] || [];
      if (!controlIds.length) continue;
      stat.evaluated += controlIds.length;
      if (worstStatus === 'pass') stat.passing += controlIds.length;
      else if (worstStatus === 'fail') {
        stat.failing += controlIds.length;
        const sev = worstSeverity || 'medium';
        stat[`failing_${sev}`] = (stat[`failing_${sev}`] || 0) + controlIds.length;
      }
      else if (worstStatus === 'inconclusive') stat.inconclusive += controlIds.length;
    }

    const item = {
      scf_id: scfId,
      title: control?.title || scfId,
      family: control?.family || '',
      status: worstStatus,
      severity: worstSeverity,
      frameworks: perFrameworkControlIds,
      failing_resources: entry.evaluations.filter(e => e.evaluation.status === 'fail').map(e => ({
        source: e.source,
        resource_id: e.resource.id,
        resource_type: e.resource.type,
        message: e.evaluation.message,
        remediation: e.evaluation.remediation || null
      })),
      passing_resources_count: entry.evaluations.filter(e => e.evaluation.status === 'pass').length,
      inconclusive_resources_count: entry.evaluations.filter(e => e.evaluation.status === 'inconclusive').length,
      total_resources_evaluated: entry.evaluations.length
    };

    if (worstStatus === 'fail') {
      if (worstSeverity === 'critical' || worstSeverity === 'high') tier1.push(item);
      else if (worstSeverity === 'medium') tier2.push(item);
      else tier3.push(item);
    } else if (worstStatus === 'inconclusive') {
      inconclusive.push(item);
    } else if (worstStatus === 'pass') {
      passes.push(item);
    }
  }

  // Compute per-framework totals using the SCF summary (authoritative control count).
  for (const stat of frameworkStats) {
    const fwSummary = await scf.frameworkSummary(stat.framework);
    if (fwSummary) {
      stat.resolved_framework_id = fwSummary.framework_id;
      stat.display_name = fwSummary.display_name;
      stat.total_controls = fwSummary.framework_controls_mapped || 0;
    } else {
      stat.resolved_framework_id = null;
      stat.display_name = stat.framework;
      stat.total_controls = stat.evaluated;
    }
    stat.coverage_pct = stat.total_controls > 0 ? Math.round((stat.evaluated / stat.total_controls) * 100) : 0;
    stat.pass_rate_pct = stat.evaluated > 0 ? Math.round((stat.passing / stat.evaluated) * 100) : 0;
  }

  return {
    runId,
    generated_at: new Date().toISOString(),
    scf_version: scf.version(),
    frameworks,
    sources,
    load_errors: loadErrors,
    stats: frameworkStats,
    tiers: { tier1, tier2, tier3, passes, inconclusive },
    totals: {
      scf_controls_hit: scfHits.size,
      tier1_blockers: tier1.length,
      tier2_findings: tier2.length,
      tier3_recommendations: tier3.length,
      passes: passes.length,
      inconclusive: inconclusive.length
    },
    summary: {
      generated_at: new Date().toISOString(),
      run_id: runId,
      scf_version: scf.version(),
      frameworks,
      sources,
      stats: frameworkStats,
      totals: {
        tier1: tier1.length, tier2: tier2.length, tier3: tier3.length,
        passes: passes.length, inconclusive: inconclusive.length
      }
    },
    normalized: {
      run_id: runId,
      tier1, tier2, tier3, passes, inconclusive
    }
  };
}

function worstOf(statuses) {
  // Rank: fail > inconclusive > skipped > not_applicable > pass
  const rank = { fail: 5, inconclusive: 4, skipped: 3, not_applicable: 2, pass: 1 };
  let worst = 'pass';
  for (const s of statuses) {
    if ((rank[s] || 0) > (rank[worst] || 0)) worst = s;
  }
  return worst;
}

function worstSeverityOf(sevs) {
  const rank = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };
  let worst = null;
  for (const s of sevs) {
    if (!worst || (rank[s] || 0) > (rank[worst] || 0)) worst = s;
  }
  return worst;
}

function renderMarkdown(r) {
  const date = r.generated_at.slice(0, 10);
  const out = [];
  out.push(`# Gap Assessment — ${date}`);
  out.push('');
  out.push(`Run ID: \`${r.runId}\``);
  out.push(`Frameworks: ${r.frameworks.join(', ')}`);
  out.push(`Sources: ${r.sources.join(', ')}`);
  out.push(`Crosswalk: SCF v${r.scf_version} (via https://grcengclub.github.io/scf-api/)`);
  out.push('');

  out.push('## Coverage');
  out.push('');
  out.push('| Framework | Evaluated | Passing | Failing | Inconclusive | Pass rate |');
  out.push('|---|---:|---:|---:|---:|---:|');
  for (const s of r.stats) {
    out.push(`| ${s.framework} | ${s.evaluated}/${s.total_controls || '?'} (${s.coverage_pct}%) | ${s.passing} | ${s.failing} | ${s.inconclusive} | ${s.pass_rate_pct}% |`);
  }
  out.push('');

  out.push(`## Tier 1 blockers (${r.tiers.tier1.length}) — critical or high-severity failures`);
  out.push('');
  if (!r.tiers.tier1.length) out.push('_None. 🎉_');
  else {
    out.push('| SCF | Title | Family | Severity | Failing resources | Frameworks |');
    out.push('|---|---|---|---|---:|---|');
    for (const t of r.tiers.tier1) {
      const fwList = r.frameworks.map(fw => (t.frameworks[fw] || []).join('|')).filter(Boolean).join('; ');
      out.push(`| ${t.scf_id} | ${escapeMd(t.title)} | ${t.family} | ${t.severity} | ${t.failing_resources.length} | ${escapeMd(fwList)} |`);
    }
  }
  out.push('');

  out.push(`## Tier 2 findings (${r.tiers.tier2.length})`);
  out.push('');
  if (!r.tiers.tier2.length) out.push('_None._');
  else {
    for (const t of r.tiers.tier2) {
      out.push(`- **${t.scf_id}** ${escapeMd(t.title)} — ${t.failing_resources.length} failing resources`);
    }
  }
  out.push('');

  out.push(`## Tier 3 recommendations (${r.tiers.tier3.length})`);
  out.push('');
  if (!r.tiers.tier3.length) out.push('_None._');
  else {
    for (const t of r.tiers.tier3) {
      out.push(`- ${t.scf_id} — ${escapeMd(t.title)}`);
    }
  }
  out.push('');

  if (r.tiers.inconclusive.length) {
    out.push(`## Inconclusive (${r.tiers.inconclusive.length}) — re-run recommended`);
    out.push('');
    for (const t of r.tiers.inconclusive) {
      out.push(`- ${t.scf_id} ${escapeMd(t.title)}`);
    }
    out.push('');
  }

  out.push('## Remediation detail');
  out.push('');
  for (const t of r.tiers.tier1) {
    out.push(`### ${t.scf_id} — ${escapeMd(t.title)}`);
    out.push('');
    out.push(`Family: ${t.family} · Severity: ${t.severity}`);
    out.push('');
    out.push('Failing resources:');
    out.push('');
    for (const fr of t.failing_resources) {
      out.push(`- \`${fr.source}:${fr.resource_type}:${fr.resource_id}\` — ${escapeMd(fr.message || '')}`);
      if (fr.remediation?.ref) out.push(`  - Remediation: \`${fr.remediation.ref}\` (${fr.remediation.automation || 'manual'}, ~${fr.remediation.effort_hours ?? '?'}h)`);
    }
    out.push('');
  }

  if (r.load_errors.length) {
    out.push('## Data quality warnings');
    out.push('');
    for (const e of r.load_errors) {
      if (e.violations) {
        out.push(`- \`${e.source}/${e.file}\`: ${e.violations.join('; ')}`);
      } else {
        out.push(`- \`${e.source}${e.file ? '/' + e.file : ''}\`: ${e.kind} — ${e.message}`);
      }
    }
    out.push('');
  }

  out.push('---');
  out.push('Control mappings provided by the Secure Controls Framework (https://securecontrolsframework.com), licensed under CC BY-ND 4.0.');
  return out.join('\n');
}

function escapeMd(s) { return String(s || '').replace(/\|/g, '\\|').replace(/\n/g, ' '); }

function toSarif(r) {
  const results = [];
  for (const t of [...r.tiers.tier1, ...r.tiers.tier2, ...r.tiers.tier3]) {
    for (const fr of t.failing_resources) {
      results.push({
        ruleId: t.scf_id,
        level: severityToSarifLevel(t.severity),
        message: { text: `${t.title}: ${fr.message || ''}` },
        locations: [{ physicalLocation: { artifactLocation: { uri: `${fr.source}://${fr.resource_type}/${fr.resource_id}` } } }],
        properties: { frameworks: t.frameworks, scf_family: t.family, severity: t.severity }
      });
    }
  }
  return {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [{
      tool: { driver: { name: 'claude-grc-engineering', version: '0.1.0', informationUri: 'https://github.com/GRCEngClub/claude-grc-engineering' } },
      invocations: [{ startTimeUtc: r.generated_at, endTimeUtc: r.generated_at }],
      results
    }]
  };
}

function severityToSarifLevel(sev) {
  if (sev === 'critical' || sev === 'high') return 'error';
  if (sev === 'medium') return 'warning';
  return 'note';
}

function toOscalAssessmentResults(r) {
  // Minimal OSCAL 1.2.0 Assessment Results skeleton. Full SAR construction
  // lives in the `oscal` plugin; this is the gap-assessment export.
  return {
    'assessment-results': {
      uuid: r.runId,
      metadata: {
        title: `Gap Assessment — ${r.generated_at.slice(0, 10)}`,
        'last-modified': r.generated_at,
        version: '1.0.0',
        'oscal-version': '1.2.0'
      },
      'import-ap': { href: '' },
      results: [{
        uuid: r.runId,
        title: `Gap Assessment ${r.runId}`,
        description: `Frameworks: ${r.frameworks.join(', ')}`,
        start: r.generated_at,
        findings: [...r.tiers.tier1, ...r.tiers.tier2, ...r.tiers.tier3].map(t => ({
          uuid: `${r.runId}-${t.scf_id}`,
          title: t.title,
          description: t.failing_resources.map(fr => `${fr.source}:${fr.resource_id} — ${fr.message}`).join('\n'),
          'related-observations': [],
          target: {
            type: 'statement-id',
            'target-id': t.scf_id,
            status: { state: 'not-satisfied' }
          }
        }))
      }]
    }
  };
}

function makeRunId() {
  // Sortable, unique enough, short. Date + random.
  const d = new Date();
  const date = d.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const rand = crypto.randomBytes(4).toString('hex');
  return `${date}-${rand}`;
}

function fail(code, msg) {
  process.stderr.write(`[gap-assessment] ${msg}\n`);
  process.exit(code);
}

const invokedFromCLI = import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedFromCLI) {
  main(process.argv.slice(2)).catch(err => {
    process.stderr.write(`[gap-assessment] unexpected error: ${err.stack || err.message}\n`);
    process.exit(1);
  });
}

export { main };
