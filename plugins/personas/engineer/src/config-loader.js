import fs from 'fs/promises';
import path from 'path';
import yaml from '../vendor/js-yaml.cjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_DIR = path.join(__dirname, '..', 'config');

const NIST_DIR = path.join(CONFIG_DIR, 'frameworks', 'nist800-53');
const FEDRAMP_DIR = path.join(CONFIG_DIR, 'frameworks', 'fedramp');
const EXPORT_CONTROL_DIR = path.join(CONFIG_DIR, 'frameworks', 'export-control');

const NIST_CONTROL_FAMILIES = {
  'AC': 'ac-access-control',
  'AT': 'at-awareness-training',
  'AU': 'au-audit-accountability',
  'CA': 'ca-assessment-authorization',
  'CM': 'cm-configuration-management',
  'CP': 'cp-contingency-planning',
  'IA': 'ia-identification-authentication',
  'IR': 'ir-incident-response',
  'MA': 'ma-maintenance',
  'MP': 'mp-media-protection',
  'PE': 'pe-physical-environmental',
  'PL': 'pl-planning',
  'PM': 'pm-program-management',
  'PS': 'ps-personnel-security',
  'RA': 'ra-risk-assessment',
  'SA': 'sa-system-acquisition',
  'SC': 'sc-system-communications',
  'SI': 'si-system-information-integrity'
};

const cache = new Map();

/**
 * Load a YAML configuration file
 * @param {string} category - The config category (frameworks, providers, patterns)
 * @param {string} name - The config file name (without .yaml extension)
 * @returns {Promise<Object>} The parsed configuration
 */
export async function loadConfig(category, name) {
  const cacheKey = `${category}/${name}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const filePath = path.join(CONFIG_DIR, category, `${name.toLowerCase()}.yaml`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const config = yaml.load(content);
    cache.set(cacheKey, config);
    return config;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Configuration not found: ${category}/${name}`);
    }
    throw error;
  }
}

/**
 * Load a framework configuration
 * @param {string} name - Framework name (soc2, iso27001, nist800-53)
 * @returns {Promise<Object>} Framework configuration
 */
export async function loadFramework(name) {
  return loadConfig('frameworks', name);
}

/**
 * Load a provider configuration
 * @param {string} name - Provider name (aws, azure, gcp, kubernetes)
 * @returns {Promise<Object>} Provider configuration with templates
 */
export async function loadProvider(name) {
  return loadConfig('providers', name);
}

/**
 * List available configurations in a category
 * @param {string} category - The config category
 * @returns {Promise<string[]>} Array of available config names
 */
export async function listConfigs(category) {
  const dirPath = path.join(CONFIG_DIR, category);

  try {
    const files = await fs.readdir(dirPath);
    return files
      .filter(f => f.endsWith('.yaml'))
      .map(f => f.replace('.yaml', ''));
  } catch (error) {
    return [];
  }
}

/**
 * List available frameworks
 * @returns {Promise<string[]>} Array of framework names
 */
export async function listFrameworks() {
  return listConfigs('frameworks');
}

/**
 * List available providers
 * @returns {Promise<string[]>} Array of provider names
 */
export async function listProviders() {
  return listConfigs('providers');
}

/**
 * Find a matching template in provider config based on keywords
 * @param {string} control - The control requirement string
 * @param {Object} providerConfig - The provider configuration
 * @returns {Object} The matching template or default template
 */
export function findMatchingTemplate(control, providerConfig) {
  const normalizedControl = control.toLowerCase();
  const templates = providerConfig.templates;

  for (const [key, template] of Object.entries(templates)) {
    if (key === 'default') continue;

    const keywords = template.keywords || [];
    const hasMatch = keywords.some(keyword =>
      normalizedControl.includes(keyword.toLowerCase())
    );

    if (hasMatch) {
      return { key, template };
    }
  }

  return { key: 'default', template: templates.default };
}

export function clearCache() {
  cache.clear();
}

/**
 * Get all controls from a framework mapped by category
 * @param {string} frameworkName - Framework name
 * @returns {Promise<Object>} Controls grouped by category
 */
export async function getControlsByCategory(frameworkName) {
  const framework = await loadFramework(frameworkName);
  const byCategory = {};

  for (const [id, control] of Object.entries(framework.controls)) {
    const category = control.category || 'Uncategorized';
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push({ id, ...control });
  }

  return byCategory;
}

/**
 * Load a NIST 800-53 control family
 * @param {string} familyCode - Control family code (AC, AU, SC, etc.)
 * @returns {Promise<Object>} Control family configuration
 */
export async function loadNISTFamily(familyCode) {
  const normalizedCode = familyCode.toUpperCase();
  const fileName = NIST_CONTROL_FAMILIES[normalizedCode];

  if (!fileName) {
    throw new Error(`Unknown NIST 800-53 control family: ${familyCode}`);
  }

  const cacheKey = `nist800-53/${fileName}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const filePath = path.join(NIST_DIR, `${fileName}.yaml`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const config = yaml.load(content);
    cache.set(cacheKey, config);
    return config;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`NIST 800-53 family not found: ${familyCode} (${filePath})`);
    }
    throw error;
  }
}

/**
 * Load all NIST 800-53 control families
 * @returns {Promise<Object>} All control families keyed by family code
 */
export async function loadAllNISTFamilies() {
  const families = {};

  for (const [code, fileName] of Object.entries(NIST_CONTROL_FAMILIES)) {
    try {
      families[code] = await loadNISTFamily(code);
    } catch (error) {
      console.warn(`Warning: Could not load NIST family ${code}: ${error.message}`);
    }
  }

  return families;
}

/**
 * Get a specific NIST 800-53 control by ID
 * @param {string} controlId - Control ID (e.g., "AC-2", "AU-6(1)")
 * @returns {Promise<Object>} Control definition with cloud tests
 */
export async function getNISTControl(controlId) {
  const match = controlId.match(/^([A-Z]{2})-/i);
  if (!match) {
    throw new Error(`Invalid NIST 800-53 control ID format: ${controlId}`);
  }

  const familyCode = match[1].toUpperCase();
  const family = await loadNISTFamily(familyCode);

  const normalizedId = controlId.toUpperCase();

  if (family.controls && family.controls[normalizedId]) {
    return {
      id: normalizedId,
      family: familyCode,
      familyName: family.family,
      ...family.controls[normalizedId]
    };
  }

  throw new Error(`Control not found: ${controlId}`);
}

/**
 * List all available NIST 800-53 control families
 * @returns {Object} Map of family codes to file names
 */
export function listNISTFamilies() {
  return { ...NIST_CONTROL_FAMILIES };
}

/**
 * FedRAMP Rev5 Certification Class behind each baseline name this toolkit accepts.
 * FedRAMP's Consolidated Rules for 2026 (CR26) name the Rev5 control lists by class.
 * The class loosely aligns with the former impact level; it is not the same thing.
 */
export const FEDRAMP_REV5_CLASSES = { low: 'B', moderate: 'C', high: 'D' };

/**
 * Describe a baseline name for output, e.g. "Rev5 Class C (fedramp-moderate)"
 * @param {string} baseline - Baseline name (low, moderate, high)
 * @returns {string} Label, or the upper-cased name when it is not a known baseline
 */
export function describeFedRAMPBaseline(baseline) {
  const normalized = String(baseline).toLowerCase();
  const certificationClass = FEDRAMP_REV5_CLASSES[normalized];
  return certificationClass
    ? `Rev5 Class ${certificationClass} (fedramp-${normalized})`
    : String(baseline).toUpperCase();
}

/**
 * Load a FedRAMP Rev5 control list (the official list from rule FRC-CSF-BSL)
 * @param {string} baseline - Baseline name: low (Rev5 Class B), moderate (Class C), high (Class D)
 * @returns {Promise<Object>} Baseline configuration with included files merged into `controls`
 */
export async function loadFedRAMPBaseline(baseline) {
  const normalizedBaseline = baseline.toLowerCase();
  const validBaselines = ['low', 'moderate', 'high'];

  if (!validBaselines.includes(normalizedBaseline)) {
    throw new Error(`Invalid FedRAMP baseline: ${baseline}. Must be one of: ${validBaselines.join(', ')}`);
  }

  const cacheKey = `fedramp/${normalizedBaseline}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const filePath = path.join(FEDRAMP_DIR, `fedramp-${normalizedBaseline}.yaml`);

  try {
    const config = await loadBaselineWithIncludes(filePath);
    cache.set(cacheKey, config);
    return config;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`FedRAMP baseline not found: ${baseline}`);
    }
    throw error;
  }
}

async function loadBaselineWithIncludes(filePath) {
  const { includes = [], ...config } = yaml.load(await fs.readFile(filePath, 'utf-8'));
  const inherited = {};
  for (const included of includes) {
    const parent = await loadBaselineWithIncludes(path.join(path.dirname(filePath), path.basename(included)));
    Object.assign(inherited, parent.controls);
  }
  return { ...config, controls: { ...inherited, ...config.controls } };
}

/**
 * Get the controls in a FedRAMP Rev5 control list.
 *
 * Membership comes from the official list in fedramp-<baseline>.yaml. Where this
 * toolkit has a definition for a control in its NIST 800-53 family files, the
 * title, description and cloud_tests from that definition are added. Controls
 * the toolkit has no definition for are still returned, without cloud_tests.
 * @param {string} baseline - Baseline name: low (Rev5 Class B), moderate (Class C), high (Class D)
 * @returns {Promise<Object[]>} Every control in the list, in list order
 */
export async function getControlsByFedRAMPBaseline(baseline) {
  const config = await loadFedRAMPBaseline(baseline);
  const allFamilies = await loadAllNISTFamilies();
  const controls = [];

  for (const [controlId, entry] of Object.entries(config.controls || {})) {
    const familyCode = controlId.split('-')[0];
    const family = allFamilies[familyCode];
    const definition = family && family.controls ? family.controls[controlId] : null;

    controls.push({
      id: controlId,
      family: familyCode,
      familyName: family ? family.family : familyCode,
      title: entry && entry.notes ? entry.notes : controlId,
      ...definition
    });
  }

  return controls;
}

/**
 * Load FedRAMP 20x Key Security Indicators (KSIs).
 * The file is generated from FedRAMP's Consolidated Rules for 2026 dataset
 * (https://github.com/FedRAMP/rules); `version` is the dataset version.
 * @returns {Promise<Object>} FedRAMP 20x KSI configuration
 */
export async function loadFedRAMP20xKSI() {
  const cacheKey = 'fedramp/20x-ksi';
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const filePath = path.join(FEDRAMP_DIR, 'fedramp-20x-ksi.yaml');

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const config = yaml.load(content);
    cache.set(cacheKey, config);
    return config;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('FedRAMP 20x KSI configuration not found');
    }
    throw error;
  }
}

/**
 * Get FedRAMP 20x KSIs filtered by category (FedRAMP calls a category a theme)
 * @param {string} category - KSI theme code (CED, CMT, CNA, IAM, INR, MLA, PIY, RPL, SCR, SVC).
 *   The valid codes are read from the KSI file, so they follow the dataset.
 * @returns {Promise<Object[]>} Array of KSIs in the specified category
 */
export async function getKSIsByCategory(category) {
  const normalizedCategory = String(category).toUpperCase().replace(/^KSI-/, '');
  const ksiConfig = await loadFedRAMP20xKSI();
  const validCategories = Object.keys(ksiConfig.categories || {});

  if (!validCategories.includes(normalizedCategory)) {
    throw new Error(`Unknown KSI category: ${category}. Must be one of: ${validCategories.join(', ')}`);
  }

  const ksis = [];

  if (ksiConfig.controls) {
    for (const [controlId, control] of Object.entries(ksiConfig.controls)) {
      if (control.category === normalizedCategory || controlId.startsWith(`KSI-${normalizedCategory}-`)) {
        ksis.push({
          id: controlId,
          ...control
        });
      }
    }
  }

  return ksis;
}

/**
 * Get all FedRAMP 20x KSIs organized by category
 * @returns {Promise<Object>} KSIs grouped by category
 */
export async function getAllKSIsByCategory() {
  const ksiConfig = await loadFedRAMP20xKSI();
  const byCategory = {};

  if (ksiConfig.categories) {
    for (const [code, info] of Object.entries(ksiConfig.categories)) {
      byCategory[code] = {
        name: info.name,
        description: info.description,
        controls: []
      };
    }
  }

  if (ksiConfig.controls) {
    for (const [controlId, control] of Object.entries(ksiConfig.controls)) {
      const categoryCode = control.category || controlId.split('-')[1];
      if (byCategory[categoryCode]) {
        byCategory[categoryCode].controls.push({
          id: controlId,
          ...control
        });
      }
    }
  }

  return byCategory;
}

/**
 * Get FedRAMP 20x KSIs that apply to a 20x Certification Class
 * @param {string} certificationClass - A, B or C. FedRAMP has not defined the KSIs for 20x Class D yet.
 * @returns {Promise<Object[]>} KSIs for the class. Class A returns the KSIs named in rule
 *   FRC-CLA-MFR. Class B and C return every KSI; each carries `optional`, true where
 *   FedRAMP marks the KSI Optional for that class.
 */
export async function getKSIsByClass(certificationClass) {
  const normalizedClass = String(certificationClass).toLowerCase();
  const validClasses = ['a', 'b', 'c'];

  if (!validClasses.includes(normalizedClass)) {
    throw new Error(`Unknown or undefined FedRAMP 20x class for KSIs: ${certificationClass}. Must be one of: A, B, C`);
  }

  const ksiConfig = await loadFedRAMP20xKSI();
  const ksis = [];

  for (const [controlId, control] of Object.entries(ksiConfig.controls || {})) {
    const applicability = control.classes ? control.classes[normalizedClass] : undefined;
    if (!applicability || applicability === 'not_named') continue;
    ksis.push({
      id: controlId,
      optional: applicability === 'optional',
      ...control
    });
  }

  return ksis;
}

/**
 * Get this toolkit's illustrative cloud CLI commands for a FedRAMP 20x KSI.
 * FedRAMP defines no commands or pass criteria for KSIs; these are starting points.
 * @param {string} ksiId - KSI ID (e.g., "KSI-IAM-APM")
 * @param {string} provider - Cloud provider (aws, azure, gcp, kubernetes)
 * @returns {Promise<Object>} CLI commands for the KSI
 */
export async function getKSICloudCommands(ksiId, provider) {
  const normalizedProvider = provider.toLowerCase();
  const validProviders = ['aws', 'azure', 'gcp', 'kubernetes'];

  if (!validProviders.includes(normalizedProvider)) {
    throw new Error(`Unknown cloud provider: ${provider}. Must be one of: ${validProviders.join(', ')}`);
  }

  const ksiConfig = await loadFedRAMP20xKSI();
  const normalizedId = ksiId.toUpperCase();

  if (!ksiConfig.controls || !ksiConfig.controls[normalizedId]) {
    throw new Error(`KSI not found: ${ksiId}`);
  }

  const ksi = ksiConfig.controls[normalizedId];

  if (!ksi.cloud_tests || !ksi.cloud_tests[normalizedProvider]) {
    return {
      ksiId: normalizedId,
      provider: normalizedProvider,
      commands: [],
      evidence_script: null,
      message: `No ${normalizedProvider} commands defined for ${normalizedId}`
    };
  }

  const providerTests = ksi.cloud_tests[normalizedProvider];

  return {
    ksiId: normalizedId,
    ksiTitle: ksi.title,
    ksiDescription: ksi.description,
    category: ksi.category,
    nist_mapping: ksi.nist_mapping || [],
    provider: normalizedProvider,
    commands: providerTests.commands || [],
    evidence_script: providerTests.evidence_script || null
  };
}

/**
 * Load an export control framework
 * @param {string} framework - Framework name (itar, irap, ismap, pbmm)
 * @returns {Promise<Object>} Export control framework configuration
 */
export async function loadExportControlFramework(framework) {
  const normalizedFramework = framework.toLowerCase();
  const validFrameworks = ['itar', 'irap', 'ismap', 'pbmm'];

  if (!validFrameworks.includes(normalizedFramework)) {
    throw new Error(`Unknown export control framework: ${framework}. Must be one of: ${validFrameworks.join(', ')}`);
  }

  const cacheKey = `export-control/${normalizedFramework}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const filePath = path.join(EXPORT_CONTROL_DIR, `${normalizedFramework}.yaml`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const config = yaml.load(content);
    cache.set(cacheKey, config);
    return config;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Export control framework not found: ${framework}`);
    }
    throw error;
  }
}

/**
 * List all available export control frameworks
 * @returns {Promise<string[]>} Array of available framework names
 */
export async function listExportControlFrameworks() {
  try {
    const files = await fs.readdir(EXPORT_CONTROL_DIR);
    return files
      .filter(f => f.endsWith('.yaml'))
      .map(f => f.replace('.yaml', ''));
  } catch (error) {
    return [];
  }
}

/**
 * Get cloud CLI commands for a specific control
 * @param {string} controlId - Control ID (e.g., "AC-2")
 * @param {string} provider - Cloud provider (aws, azure, gcp, kubernetes)
 * @returns {Promise<Object>} CLI commands and evidence scripts for the control
 */
export async function getCloudCommands(controlId, provider) {
  const normalizedProvider = provider.toLowerCase();
  const validProviders = ['aws', 'azure', 'gcp', 'kubernetes'];

  if (!validProviders.includes(normalizedProvider)) {
    throw new Error(`Unknown cloud provider: ${provider}. Must be one of: ${validProviders.join(', ')}`);
  }

  const control = await getNISTControl(controlId);

  if (!control.cloud_tests || !control.cloud_tests[normalizedProvider]) {
    return {
      controlId,
      provider: normalizedProvider,
      commands: [],
      evidence_script: null,
      message: `No ${normalizedProvider} commands defined for ${controlId}`
    };
  }

  const providerTests = control.cloud_tests[normalizedProvider];

  return {
    controlId,
    controlTitle: control.title,
    controlDescription: control.description,
    provider: normalizedProvider,
    commands: providerTests.commands || [],
    evidence_script: providerTests.evidence_script || null
  };
}

/**
 * Get all cloud commands for a control across all providers
 * @param {string} controlId - Control ID
 * @returns {Promise<Object>} Commands organized by provider
 */
export async function getAllCloudCommands(controlId) {
  const control = await getNISTControl(controlId);
  const result = {
    controlId,
    controlTitle: control.title,
    controlDescription: control.description,
    providers: {}
  };

  const providers = ['aws', 'azure', 'gcp', 'kubernetes'];

  for (const provider of providers) {
    if (control.cloud_tests && control.cloud_tests[provider]) {
      result.providers[provider] = control.cloud_tests[provider];
    }
  }

  return result;
}

/**
 * Generate an evidence collection script for a FedRAMP Rev5 control list
 * @param {string} baseline - Baseline name: low (Rev5 Class B), moderate (Class C), high (Class D)
 * @param {string} provider - Cloud provider
 * @returns {Promise<string>} Combined bash script for evidence collection
 */
export async function generateEvidenceScript(baseline, provider) {
  const controls = await getControlsByFedRAMPBaseline(baseline);
  const normalizedProvider = provider.toLowerCase();
  const baselineLabel = describeFedRAMPBaseline(baseline);

  let script = `#!/bin/bash
# FedRAMP ${baselineLabel} Evidence Collection
# Provider: ${normalizedProvider.toUpperCase()}
# Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)

set -e

echo "============================================"
echo "FedRAMP ${baselineLabel} Evidence Collection"
echo "Provider: ${normalizedProvider.toUpperCase()}"
echo "Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "============================================"
echo ""
`;

  for (const control of controls) {
    if (control.cloud_tests && control.cloud_tests[normalizedProvider]) {
      const providerTests = control.cloud_tests[normalizedProvider];

      if (providerTests.evidence_script) {
        script += `
# ============================================
# ${control.id}: ${control.title}
# ============================================
${providerTests.evidence_script}
`;
      } else if (providerTests.commands && providerTests.commands.length > 0) {
        script += `
# ============================================
# ${control.id}: ${control.title}
# ============================================
echo "=== ${control.id}: ${control.title} ==="
`;
        for (const cmd of providerTests.commands) {
          script += `echo ">> ${cmd.description}"\n`;
          script += `${cmd.cmd} || echo "Command failed or not applicable"\n`;
          script += `echo ""\n`;
        }
      }
    }
  }

  script += `
echo "============================================"
echo "Evidence Collection Complete"
echo "============================================"
`;

  return script;
}

/**
 * Get export control commands for a framework and provider
 * @param {string} framework - Export control framework (itar, irap, ismap)
 * @param {string} provider - Cloud provider
 * @returns {Promise<Object>} Commands for export control verification
 */
export async function getExportControlCommands(framework, provider) {
  const config = await loadExportControlFramework(framework);
  const normalizedProvider = provider.toLowerCase();

  const controls = [];

  if (config.controls) {
    for (const [controlId, control] of Object.entries(config.controls)) {
      if (control.cloud_tests && control.cloud_tests[normalizedProvider]) {
        controls.push({
          id: controlId,
          title: control.title,
          description: control.description,
          ...control.cloud_tests[normalizedProvider]
        });
      }
    }
  }

  return {
    framework: config.name,
    version: config.version,
    provider: normalizedProvider,
    controls
  };
}

export default {
  loadConfig,
  loadFramework,
  loadProvider,
  listConfigs,
  listFrameworks,
  listProviders,
  findMatchingTemplate,
  clearCache,
  getControlsByCategory,

  loadNISTFamily,
  loadAllNISTFamilies,
  getNISTControl,
  listNISTFamilies,

  FEDRAMP_REV5_CLASSES,
  describeFedRAMPBaseline,
  loadFedRAMPBaseline,
  getControlsByFedRAMPBaseline,

  loadFedRAMP20xKSI,
  getKSIsByCategory,
  getAllKSIsByCategory,
  getKSIsByClass,
  getKSICloudCommands,

  loadExportControlFramework,
  listExportControlFrameworks,

  getCloudCommands,
  getAllCloudCommands,
  generateEvidenceScript,
  getExportControlCommands,

  NIST_CONTROL_FAMILIES
};
