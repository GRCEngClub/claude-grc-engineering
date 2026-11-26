#!/usr/bin/env node

import { pathToFileURL } from 'node:url';
import { initSCF } from './scf-client.js';
import { frameworkMetadata, listFrameworkPlugins } from '../src/plugin-locator.js';

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    region: null,
    depth: null,
    status: null,
    search: null,
    format: 'text',
    offline: false,
    limit: null,
  };
  for (const a of args) {
    if (a.startsWith('--region=')) opts.region = a.slice('--region='.length).toLowerCase();
    else if (a.startsWith('--depth=')) opts.depth = a.slice('--depth='.length).toLowerCase();
    else if (a.startsWith('--status=')) opts.status = a.slice('--status='.length).toLowerCase();
    else if (a === '--installed') opts.status = 'shipped';
    else if (a === '--not-installed') opts.status = 'not-started';
    else if (a.startsWith('--format=')) opts.format = a.slice('--format='.length).toLowerCase();
    else if (a === '--offline') opts.offline = true;
    else if (a.startsWith('--limit=')) opts.limit = parseInt(a.slice('--limit='.length), 10);
    else if (a.startsWith('--search=')) opts.search = a.slice('--search='.length).toLowerCase();
    else if (a === '--help' || a === '-h') opts.help = true;
  }
  return opts;
}

function usage() {
  return `Usage: node scripts/frameworks.js [options]

List every SCF-mapped framework (249) and show which have a dedicated plugin.

Options:
  --region=americas|apac|emea|global    Filter by SCF region.
  --depth=stub|reference|full|unknown   Filter by plugin depth.
  --status=shipped|not-started          Filter by whether a plugin exists.
  --installed / --not-installed         Shorthand for --status.
  --search=<term>                       Substring match against display name/ID.
  --format=text|json|table              Output format (default: text).
  --limit=N                             Cap the result set.
  --offline                             Use cached SCF data only.

Examples:
  node scripts/frameworks.js                              # all 249, grouped
  node scripts/frameworks.js --region=apac                # APAC only
  node scripts/frameworks.js --not-installed --limit=20   # 20 to pick up
  node scripts/frameworks.js --search=pdpa                # find Singapore PDPA, etc.
  node scripts/frameworks.js --format=json                # machine-readable
`;
}

function regionFromFrameworkId(frameworkId) {
  if (frameworkId.startsWith('americas-') || frameworkId.startsWith('amaericas-') || frameworkId.startsWith('usa-')) return 'americas';
  if (frameworkId.startsWith('apac-')) return 'apac';
  if (frameworkId.startsWith('emea-')) return 'emea';
  if (frameworkId.startsWith('general-')) return 'global';
  return 'global';
}

async function listShippedPlugins() {
  const plugins = [];
  for (const { slug, manifest: meta } of await listFrameworkPlugins()) {
    const fwMeta = frameworkMetadata(meta);
    plugins.push({
      slug,
      display_name: meta.description ? meta.description.split('—')[0].trim().split(' Plugin')[0] : slug,
      scf_framework_id: fwMeta?.scf_framework_id || null,
      depth: fwMeta?.depth || 'unknown',
      region: fwMeta?.region?.toLowerCase() || (fwMeta?.scf_framework_id ? regionFromFrameworkId(fwMeta.scf_framework_id) : null),
    });
  }
  return plugins;
}

function buildCoverageRows(scfFrameworks, shipped) {
  const byScfId = new Map();
  for (const p of shipped) {
    if (p.scf_framework_id) byScfId.set(p.scf_framework_id, p);
  }

  const rows = scfFrameworks.map(f => {
    const plugin = byScfId.get(f.framework_id);
    const region = regionFromFrameworkId(f.framework_id);
    return {
      scf_framework_id: f.framework_id,
      display_name: f.display_name,
      region,
      scf_controls_mapped: f.scf_controls_mapped,
      framework_controls_mapped: f.framework_controls_mapped,
      status: plugin ? 'shipped' : 'not-started',
      plugin_slug: plugin?.slug || null,
      plugin_depth: plugin?.depth || null,
      namespace: plugin ? `/${plugin.slug}:` : null,
    };
  });

  const matchedSlugs = new Set(rows.filter(r => r.plugin_slug).map(r => r.plugin_slug));
  const unmatched = shipped.filter(p => !matchedSlugs.has(p.slug));
  for (const p of unmatched) {
    rows.push({
      scf_framework_id: null,
      display_name: `${p.display_name} (no SCF mapping recorded)`,
      region: null,
      scf_controls_mapped: null,
      framework_controls_mapped: null,
      status: 'shipped',
      plugin_slug: p.slug,
      plugin_depth: p.depth,
      namespace: `/${p.slug}:`,
    });
  }

  return rows;
}

function applyFilters(rows, opts) {
  let out = rows;
  if (opts.region) out = out.filter(r => r.region === opts.region);
  if (opts.depth) out = out.filter(r => r.plugin_depth === opts.depth);
  if (opts.status) out = out.filter(r => r.status === opts.status);
  if (opts.search) {
    const term = opts.search;
    out = out.filter(r =>
      (r.display_name || '').toLowerCase().includes(term) ||
      (r.scf_framework_id || '').toLowerCase().includes(term) ||
      (r.plugin_slug || '').toLowerCase().includes(term)
    );
  }
  if (opts.limit && opts.limit > 0) out = out.slice(0, opts.limit);
  return out;
}

function renderText(rows, summary, opts) {
  const lines = [];
  lines.push('');
  lines.push(`SCF coverage: ${summary.total_scf_frameworks} frameworks · ${summary.shipped} shipped · ${summary.not_started} not started`);
  if (summary.unmatched > 0) lines.push(`  (plus ${summary.unmatched} shipped plugins without SCF mapping)`);
  lines.push('');

  const shipped = rows.filter(r => r.status === 'shipped').sort(compareRows);
  const pending = rows.filter(r => r.status === 'not-started').sort(compareRows);

  if (shipped.length > 0) {
    lines.push(`Shipped plugins (${shipped.length}):`);
    for (const r of shipped) {
      const depth = r.plugin_depth ? `[${r.plugin_depth}]`.padEnd(12) : '[unknown]  ';
      const ns = (r.namespace || '').padEnd(22);
      lines.push(`  ✓ ${ns}${depth}${r.display_name}`);
    }
    lines.push('');
  }

  if (pending.length > 0) {
    lines.push(`Not started (${pending.length}) — crosswalk-supported today via /grc-engineer:gap-assessment:`);
    const max = opts.limit ? Math.min(pending.length, opts.limit) : pending.length;
    for (let i = 0; i < max; i++) {
      const r = pending[i];
      const id = (r.scf_framework_id || '').padEnd(50);
      lines.push(`  ○ ${id}${r.display_name}`);
    }
    if (max < pending.length) lines.push(`  ... and ${pending.length - max} more (use --limit=N to control, or --format=json for the full set)`);
    lines.push('');
    lines.push(`To adopt a framework, run: node tools/scaffold-framework.js <scf-framework-id>`);
  }

  return lines.join('\n');
}

function compareRows(a, b) {
  const ra = a.region || 'zzz';
  const rb = b.region || 'zzz';
  if (ra !== rb) return ra.localeCompare(rb);
  return (a.display_name || '').localeCompare(b.display_name || '');
}

function renderTable(rows) {
  const header = ['status', 'depth', 'namespace', 'scf_framework_id', 'display_name'];
  const widths = header.map(h => h.length);
  const data = rows.map(r => [
    r.status,
    r.plugin_depth || '-',
    r.namespace || '-',
    r.scf_framework_id || '-',
    r.display_name,
  ]);
  for (const row of data) row.forEach((cell, i) => { widths[i] = Math.max(widths[i], String(cell).length); });
  const fmt = row => row.map((cell, i) => String(cell).padEnd(widths[i])).join('  ');
  const out = [fmt(header), fmt(widths.map(w => '-'.repeat(w)))];
  for (const row of data) out.push(fmt(row));
  return out.join('\n');
}

async function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    console.log(usage());
    return;
  }

  const scf = await initSCF({ offline: opts.offline });
  const [scfFrameworks, shipped] = await Promise.all([
    scf.frameworks(),
    listShippedPlugins(),
  ]);

  const rows = buildCoverageRows(scfFrameworks, shipped);
  const summary = {
    total_scf_frameworks: scfFrameworks.length,
    shipped: rows.filter(r => r.status === 'shipped' && r.scf_framework_id).length,
    not_started: rows.filter(r => r.status === 'not-started').length,
    unmatched: rows.filter(r => r.status === 'shipped' && !r.scf_framework_id).length,
  };

  const filtered = applyFilters(rows, opts);

  if (opts.format === 'json') {
    console.log(JSON.stringify({ summary, frameworks: filtered }, null, 2));
  } else if (opts.format === 'table') {
    console.log(renderTable(filtered));
  } else {
    console.log(renderText(filtered, summary, opts));
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => {
    console.error('✗ frameworks: ', err.message);
    if (process.env.DEBUG) console.error(err);
    process.exit(1);
  });
}

export { buildCoverageRows, applyFilters };
