#!/usr/bin/env node

/**
 * Scaffold a new framework plugin from the SCF crosswalk.
 *
 * Usage:
 *   node scripts/scaffold-framework.js <scf-framework-id-or-label> [options]
 *
 * Options:
 *   --depth=stub|reference     Template depth. Default: stub.
 *   --slug=<name>              Override auto-derived plugin slug (directory name).
 *   --no-register              Skip writing to marketplace.json.
 *   --force                    Overwrite an existing plugin directory.
 *   --offline                  Use cached SCF data only (fail if cache miss).
 *   --dry-run                  Print what would happen; don't touch the filesystem.
 *
 * Examples:
 *   node scripts/scaffold-framework.js apac-sgp-pdpa-2012
 *   node scripts/scaffold-framework.js "Singapore PDPA" --depth=reference
 *   node scripts/scaffold-framework.js americas-bra-lgpd-2018 --slug=brazil-lgpd
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { initSCF } from './scf-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../..');
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates', 'framework-plugin');
const PLUGINS_DIR = path.join(REPO_ROOT, 'plugins', 'frameworks');
const MARKETPLACE_FILE = path.join(REPO_ROOT, '.claude-plugin', 'marketplace.json');

const REGION_NAMES = {
  americas: 'Americas',
  apac: 'APAC',
  emea: 'EMEA',
  general: 'Global',
};

const COUNTRY_CODES_3_TO_2 = {
  usa: 'US', can: 'CA', mex: 'MX', bra: 'BR', arg: 'AR', chl: 'CL', col: 'CO',
  gbr: 'GB', deu: 'DE', fra: 'FR', ita: 'IT', esp: 'ES', nld: 'NL', che: 'CH',
  irl: 'IE', bel: 'BE', aut: 'AT', swe: 'SE', nor: 'NO', dnk: 'DK', fin: 'FI',
  pol: 'PL', cze: 'CZ', hun: 'HU', rou: 'RO', bgr: 'BG', grc: 'GR', prt: 'PT',
  jpn: 'JP', kor: 'KR', chn: 'CN', twn: 'TW', hkg: 'HK', sgp: 'SG', ind: 'IN',
  idn: 'ID', tha: 'TH', vnm: 'VN', phl: 'PH', mys: 'MY', aus: 'AU', nzl: 'NZ',
  isr: 'IL', are: 'AE', sau: 'SA', qat: 'QA', kwt: 'KW', bhr: 'BH', omn: 'OM',
  zaf: 'ZA', egy: 'EG', nga: 'NG', ken: 'KE',
  bhs: 'BS', bmu: 'BM', cym: 'KY', bra: 'BR',
};

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    depth: 'stub',
    slug: null,
    register: true,
    force: false,
    offline: false,
    dryRun: false,
    positional: [],
  };
  for (const a of args) {
    if (a === '--no-register') opts.register = false;
    else if (a === '--force') opts.force = true;
    else if (a === '--offline') opts.offline = true;
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a.startsWith('--depth=')) opts.depth = a.slice('--depth='.length).toLowerCase();
    else if (a.startsWith('--slug=')) opts.slug = a.slice('--slug='.length);
    else if (a.startsWith('--help') || a === '-h') opts.help = true;
    else opts.positional.push(a);
  }
  return opts;
}

function usage() {
  return `Usage: node scripts/scaffold-framework.js <scf-framework-id-or-label> [options]

Generate a new framework plugin stub from the SCF crosswalk.

Options:
  --depth=stub|reference     Template depth. Default: stub.
  --slug=<name>              Override auto-derived plugin slug.
  --no-register              Skip writing to marketplace.json.
  --force                    Overwrite existing plugin directory.
  --offline                  Use cached SCF data only.
  --dry-run                  Print actions without touching the filesystem.

Examples:
  node scripts/scaffold-framework.js apac-sgp-pdpa-2012
  node scripts/scaffold-framework.js "Singapore PDPA" --depth=reference
`;
}

/**
 * Derive a human-friendly plugin slug from the SCF framework_id.
 * SCF IDs look like "americas-bra-lgpd-2018" or "apac-sgp-pdpa-2012" —
 * we strip the region prefix and trailing year to get "bra-lgpd" / "sgp-pdpa".
 * Caller can override with --slug.
 */
function deriveSlug(frameworkId) {
  let slug = frameworkId.toLowerCase();
  // Drop known region prefixes
  slug = slug.replace(/^(americas|apac|emea|general)-/, '');
  // Drop trailing -YYYY (year)
  slug = slug.replace(/-\d{4}$/, '');
  // Collapse duplicate dashes just in case
  slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '');
  return slug;
}

function deriveNamespace(slug) {
  // Namespace = slug. Claude Code command namespace is the plugin name.
  return slug;
}

function deriveRegion(frameworkId) {
  const m = frameworkId.match(/^(americas|apac|emea|general)-/);
  if (!m) return { slug: 'general', display: 'Global' };
  return { slug: m[1], display: REGION_NAMES[m[1]] };
}

function deriveCountry(frameworkId) {
  // After region, the next segment is typically a 3-letter ISO-3166-1 alpha-3 code.
  const parts = frameworkId.toLowerCase().split('-');
  if (parts.length < 2) return '';
  const candidate = parts[1];
  if (candidate.length !== 3) return '';
  return COUNTRY_CODES_3_TO_2[candidate] || candidate.toUpperCase();
}

async function loadTemplate(depth, relativePath) {
  const filePath = path.join(TEMPLATES_DIR, depth, relativePath);
  return fs.readFile(filePath, 'utf8');
}

function fillTemplate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key in vars) return vars[key];
    throw new Error(`Template referenced unknown variable: {{${key}}}`);
  });
}

async function walkTemplate(depth) {
  // Return a list of relative paths of all *.tmpl files in the template dir.
  const root = path.join(TEMPLATES_DIR, depth);
  const out = [];
  async function walk(dir, prefix) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const rel = path.join(prefix, e.name);
      if (e.isDirectory()) await walk(path.join(dir, e.name), rel);
      else if (e.name.endsWith('.tmpl')) out.push(rel);
    }
  }
  await walk(root, '');
  return out;
}

/** Map a template path → output path inside the plugin directory. */
function targetForTemplate(tmplRelPath, slug) {
  // Strip .tmpl suffix. SKILL.md.tmpl lives under skills/; it becomes skills/<slug>-expert/SKILL.md.
  const withoutTmpl = tmplRelPath.replace(/\.tmpl$/, '');
  const parts = withoutTmpl.split(path.sep);
  if (parts[0] === 'skills' && parts[parts.length - 1] === 'SKILL.md') {
    return path.join('skills', `${slug}-expert`, 'SKILL.md');
  }
  return withoutTmpl;
}

async function registerInMarketplace({ slug, description, source }) {
  const raw = await fs.readFile(MARKETPLACE_FILE, 'utf8');
  const mp = JSON.parse(raw);
  if (!Array.isArray(mp.plugins)) {
    throw new Error('marketplace.json missing plugins array');
  }
  if (mp.plugins.some(p => p.name === slug)) {
    return { alreadyRegistered: true };
  }
  mp.plugins.push({ name: slug, source, description, version: '0.1.0' });
  await fs.writeFile(MARKETPLACE_FILE, JSON.stringify(mp, null, 2) + '\n');
  return { alreadyRegistered: false };
}

function suggestClosest(label, frameworks) {
  const needle = label.toLowerCase();
  const scored = frameworks.map(f => {
    const hay = (f.display_name + ' ' + f.framework_id).toLowerCase();
    let score = 0;
    if (hay.includes(needle)) score += 100;
    for (const token of needle.split(/[\s-_]+/).filter(Boolean)) {
      if (hay.includes(token)) score += 10;
    }
    return { f, score };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, 5).filter(x => x.score > 0).map(x => x.f);
}

async function main() {
  const opts = parseArgs(process.argv);
  if (opts.help || opts.positional.length === 0) {
    console.log(usage());
    process.exit(opts.help ? 0 : 1);
  }
  if (!['stub', 'reference'].includes(opts.depth)) {
    console.error(`Unknown depth: ${opts.depth}. Use --depth=stub or --depth=reference.`);
    process.exit(1);
  }

  const rawLabel = opts.positional[0];

  // 1) Resolve the label to a real SCF framework_id.
  const scf = await initSCF({ offline: opts.offline });
  const frameworks = await scf.frameworks();
  let resolvedId = frameworks.find(f => f.framework_id === rawLabel)?.framework_id;
  if (!resolvedId) {
    resolvedId = await scf.resolveFrameworkId(rawLabel);
  }
  if (!resolvedId) {
    console.error(`✗ No SCF framework matched "${rawLabel}".`);
    const matches = suggestClosest(rawLabel, frameworks);
    if (matches.length > 0) {
      console.error('Closest matches:');
      for (const m of matches) {
        console.error(`  - ${m.framework_id}  ${m.display_name}`);
      }
    }
    process.exit(2);
  }

  const summary = frameworks.find(f => f.framework_id === resolvedId);

  // 2) Derive slug, namespace, region, country.
  const slug = (opts.slug || deriveSlug(resolvedId));
  if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
    console.error(`✗ Derived slug "${slug}" is invalid. Use --slug=<name> to override.`);
    process.exit(1);
  }
  const namespace = deriveNamespace(slug);
  const region = deriveRegion(resolvedId);
  const country = deriveCountry(resolvedId);
  const pluginDir = path.join(PLUGINS_DIR, slug);
  const marketplaceSource = `./plugins/frameworks/${slug}`;

  // 3) Check for collisions.
  let alreadyExists = false;
  try {
    await fs.access(pluginDir);
    alreadyExists = true;
  } catch { /* doesn't exist, good */ }
  if (alreadyExists && !opts.force) {
    console.error(`✗ Plugin directory already exists: ${path.relative(REPO_ROOT, pluginDir)}`);
    console.error('  Use --force to overwrite, or --slug=<other> to pick a different name.');
    process.exit(3);
  }

  // 4) Build template variables.
  const vars = {
    SLUG: slug,
    NAMESPACE: namespace,
    DISPLAY_NAME: summary.display_name,
    SCF_FRAMEWORK_ID: resolvedId,
    SCF_CONTROLS_MAPPED: String(summary.scf_controls_mapped ?? 0),
    FRAMEWORK_CONTROLS_MAPPED: String(summary.framework_controls_mapped ?? 0),
    REGION: region.display,
    COUNTRY: country || 'TBD',
  };

  // 5) Enumerate templates.
  const templateFiles = await walkTemplate(opts.depth);

  // 6) Plan output.
  console.log(`Scaffolding framework plugin "${slug}" at ${opts.depth} depth`);
  console.log(`  SCF framework:   ${resolvedId}`);
  console.log(`  Display name:    ${summary.display_name}`);
  console.log(`  Region/country:  ${region.display} / ${country || '?'}`);
  console.log(`  SCF controls:    ${summary.scf_controls_mapped} mapped to ${summary.framework_controls_mapped} framework controls`);
  console.log(`  Plugin dir:      ${path.relative(REPO_ROOT, pluginDir)}`);
  console.log('');

  if (opts.dryRun) {
    console.log('[dry-run] Would create:');
    for (const tmpl of templateFiles) {
      const target = targetForTemplate(tmpl, slug);
      const targetFull = (target === 'plugin.json')
        ? path.join(pluginDir, '.claude-plugin', target)
        : path.join(pluginDir, target);
      console.log(`  ${path.relative(REPO_ROOT, targetFull)}`);
    }
    if (opts.register) console.log('[dry-run] Would register in .claude-plugin/marketplace.json');
    return;
  }

  // 7) Render and write.
  await fs.mkdir(pluginDir, { recursive: true });
  const written = [];
  for (const tmpl of templateFiles) {
    const raw = await loadTemplate(opts.depth, tmpl);
    const rendered = fillTemplate(raw, vars);
    const target = targetForTemplate(tmpl, slug);
    const targetFull = (target === 'plugin.json')
      ? path.join(pluginDir, '.claude-plugin', target)
      : path.join(pluginDir, target);
    await fs.mkdir(path.dirname(targetFull), { recursive: true });
    await fs.writeFile(targetFull, rendered);
    written.push(path.relative(REPO_ROOT, targetFull));
  }

  for (const w of written) console.log(`  ✓ ${w}`);

  // 8) Register in marketplace.json.
  if (opts.register) {
    const description = `${summary.display_name} — ${opts.depth}-depth plugin backed by the SCF crosswalk (${summary.scf_controls_mapped} SCF → ${summary.framework_controls_mapped} framework controls).`;
    const { alreadyRegistered } = await registerInMarketplace({ slug, description, source: marketplaceSource });
    console.log(`  ${alreadyRegistered ? '=' : '✓'} marketplace.json ${alreadyRegistered ? 'entry already present' : 'registered'}`);
  }

  console.log('');
  console.log(`Done. Next:`);
  console.log(`  - Edit plugins/frameworks/${slug}/skills/${slug}-expert/SKILL.md and fill in the TODO sections.`);
  if (opts.depth === 'reference') {
    console.log(`  - Edit plugins/frameworks/${slug}/commands/*.md for framework-specific assessment and evidence guidance.`);
  }
  console.log(`  - Commit and open a PR; CI will validate markdown and CODEOWNERS will route review.`);
}

// Only run main when invoked directly (not when imported).
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => {
    console.error('✗ scaffold-framework failed:', err.message);
    if (process.env.DEBUG) console.error(err);
    process.exit(1);
  });
}
