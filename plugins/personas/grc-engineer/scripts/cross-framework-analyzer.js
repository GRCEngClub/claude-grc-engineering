#!/usr/bin/env node

import { realpathSync } from 'node:fs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import yaml from '../vendor/js-yaml.cjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CrossFrameworkAnalyzer {
  constructor() {
    this.crosswalkPath = path.join(__dirname, '../config/control-crosswalk.yaml');
    this.crosswalk = null;
    this.load();
  }

  load() {
    try {
      const fileContents = fs.readFileSync(this.crosswalkPath, 'utf8');
      this.crosswalk = yaml.load(fileContents);
    } catch (err) {
      console.error(`Error loading control crosswalk: ${err.message}`);
      process.exit(1);
    }
  }

  /**
   * Map a single control across all frameworks
   * @param {string} controlQuery - Control name, ID, or search term
   * @returns {object} - Control mapping details
   */
  mapControlUnified(controlQuery) {
    const control = this.findControl(controlQuery);

    if (!control) {
      return {
        error: `Control not found: ${controlQuery}`,
        suggestions: this.suggestControls(controlQuery)
      };
    }

    return {
      name: control.name,
      category: control.category,
      mappings: this.extractFrameworkMappings(control),
      commonRequirements: control.common_requirements || [],
      conflicts: control.conflicts || [],
      cloudImplementation: control.cloud_implementation || {},
      optimizationTier: this.getOptimizationTier(control),
      effortEstimate: this.getEffortEstimate(control)
    };
  }

  /**
   * Find conflicting requirements across selected frameworks
   * @param {array} frameworks - List of framework codes (e.g., ['SOC2', 'PCI-DSS'])
   * @param {string} detailLevel - 'summary' or 'detailed'
   * @returns {object} - Conflict analysis
   */
  findConflicts(frameworks, detailLevel = 'detailed') {
    const normalizedFrameworks = frameworks.map(f => this.normalizeFrameworkCode(f));
    const conflicts = [];

    for (const [controlId, control] of Object.entries(this.crosswalk.controls)) {
      if (!control.conflicts) continue;

      for (const conflict of control.conflicts) {
        const involvedFrameworks = this.getConflictFrameworks(conflict);
        const relevantFrameworks = involvedFrameworks.filter(f =>
          normalizedFrameworks.includes(this.normalizeFrameworkCode(f))
        );

        if (relevantFrameworks.length >= 2) {
          conflicts.push({
            controlId,
            controlName: control.name,
            category: control.category,
            conflict,
            severity: this.assessConflictSeverity(conflict),
            frameworks: relevantFrameworks
          });
        }
      }
    }

    conflicts.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    return {
      frameworks: normalizedFrameworks,
      totalConflicts: conflicts.length,
      conflictsBySeverity: this.groupBySeverity(conflicts),
      conflicts: detailLevel === 'detailed' ? conflicts : conflicts.slice(0, 10),
      summary: this.generateConflictSummary(conflicts)
    };
  }

  /**
   * Optimize implementation across multiple frameworks
   * @param {array} frameworks - List of framework codes
   * @param {string} outputFormat - 'roadmap', 'matrix', or 'summary'
   * @returns {object} - Optimization analysis
   */
  optimizeMultiFramework(frameworks, outputFormat = 'roadmap') {
    const normalizedFrameworks = frameworks.map(f => this.normalizeFrameworkCode(f));

    const tiers = {
      tier1: [],
      tier2: [],
      tier3: [],
      tier4: []
    };

    for (const [controlId, control] of Object.entries(this.crosswalk.controls)) {
      const satisfiedFrameworks = this.countSatisfiedFrameworks(control, normalizedFrameworks);

      if (satisfiedFrameworks >= 4) {
        tiers.tier1.push({ controlId, control, satisfiedFrameworks });
      } else if (satisfiedFrameworks === 3) {
        tiers.tier2.push({ controlId, control, satisfiedFrameworks });
      } else if (satisfiedFrameworks === 2) {
        tiers.tier3.push({ controlId, control, satisfiedFrameworks });
      } else if (satisfiedFrameworks === 1) {
        tiers.tier4.push({ controlId, control, satisfiedFrameworks });
      }
    }

    const optimization = {
      frameworks: normalizedFrameworks,
      tiers,
      effortSavings: this.calculateEffortSavings(tiers, normalizedFrameworks),
      quickWins: this.identifyQuickWins(tiers.tier1),
      roadmap: this.generateRoadmap(tiers),
      coverage: this.calculateCoverageByPhase(tiers)
    };

    if (outputFormat === 'matrix') {
      return this.generateControlMatrix(optimization);
    } else if (outputFormat === 'summary') {
      return this.generateOptimizationSummary(optimization);
    }

    return optimization;
  }

  findControl(query) {
    const lowerQuery = query.toLowerCase();

    for (const [controlId, control] of Object.entries(this.crosswalk.controls)) {
      if (controlId.toLowerCase() === lowerQuery) {
        return control;
      }
    }

    for (const [controlId, control] of Object.entries(this.crosswalk.controls)) {
      for (const framework of Object.keys(control)) {
        if (Array.isArray(control[framework])) {
          for (const id of control[framework]) {
            if (typeof id === 'string' && id.toLowerCase() === lowerQuery) {
              return control;
            }
          }
        }
      }
    }

    for (const [controlId, control] of Object.entries(this.crosswalk.controls)) {
      if (control.name && control.name.toLowerCase().includes(lowerQuery)) {
        return control;
      }
      if (control.category && control.category.toLowerCase().includes(lowerQuery)) {
        return control;
      }
    }

    return null;
  }

  suggestControls(query) {
    const suggestions = [];
    const lowerQuery = query.toLowerCase();

    for (const [controlId, control] of Object.entries(this.crosswalk.controls)) {
      if (control.name && control.name.toLowerCase().includes(lowerQuery)) {
        suggestions.push({ id: controlId, name: control.name });
      }
    }

    return suggestions.slice(0, 5);
  }

  extractFrameworkMappings(control) {
    const mappings = {};
    const frameworkFields = ['nist_800_53', 'iso_27001', 'soc2', 'pci_dss', 'cis_controls', 'cmmc', 'fedramp'];

    for (const framework of frameworkFields) {
      if (control[framework]) {
        mappings[framework] = control[framework];
      }
    }

    return mappings;
  }

  getOptimizationTier(control) {
    const frameworks = this.extractFrameworkMappings(control);
    const count = Object.keys(frameworks).length;

    if (count >= 4) return 'tier1';
    if (count === 3) return 'tier2';
    if (count === 2) return 'tier3';
    return 'tier4';
  }

  getEffortEstimate(control) {
    if (this.crosswalk.effort_estimates) {
      for (const [controlId, estimate] of Object.entries(this.crosswalk.effort_estimates)) {
        if (control.name && control.name.toLowerCase().includes(controlId.toLowerCase())) {
          return estimate;
        }
      }
    }

    return { hours: 8, complexity: 'Medium', dependencies: [] };
  }

  normalizeFrameworkCode(code) {
    const mapping = {
      'soc2': 'SOC2',
      'soc 2': 'SOC2',
      'nist': 'NIST',
      'nist-800-53': 'NIST',
      'nist 800-53': 'NIST',
      'iso': 'ISO',
      'iso-27001': 'ISO',
      'iso 27001': 'ISO',
      'pci': 'PCI-DSS',
      'pci-dss': 'PCI-DSS',
      'pci dss': 'PCI-DSS',
      'cis': 'CIS',
      'cis-controls': 'CIS',
      'cmmc': 'CMMC',
      'fedramp': 'FedRAMP',
      'hitrust': 'HITRUST',
      'gdpr': 'GDPR',
      'hipaa': 'HIPAA'
    };

    return mapping[code.toLowerCase()] || code.toUpperCase();
  }

  getConflictFrameworks(conflict) {
    const frameworks = [];
    for (const key of Object.keys(conflict)) {
      if (key !== 'name' && key !== 'resolution') {
        frameworks.push(key);
      }
    }
    return frameworks;
  }

  assessConflictSeverity(conflict) {
    const conflictStr = JSON.stringify(conflict).toLowerCase();

    if (conflictStr.includes('mandatory') || conflictStr.includes('required')) {
      return 'high';
    }

    if (conflictStr.includes('90 days') || conflictStr.includes('quarterly')) {
      return 'high';
    }

    if (conflictStr.includes('annually') || conflictStr.includes('year')) {
      return 'medium';
    }

    return 'low';
  }

  groupBySeverity(conflicts) {
    return {
      high: conflicts.filter(c => c.severity === 'high').length,
      medium: conflicts.filter(c => c.severity === 'medium').length,
      low: conflicts.filter(c => c.severity === 'low').length
    };
  }

  generateConflictSummary(conflicts) {
    return {
      mostCommon: this.getMostCommonConflict(conflicts),
      totalFrameworks: new Set(conflicts.flatMap(c => c.frameworks)).size,
      avgConflictsPerControl: conflicts.length / new Set(conflicts.map(c => c.controlId)).size
    };
  }

  getMostCommonConflict(conflicts) {
    const types = {};
    for (const conflict of conflicts) {
      const name = conflict.conflict.name || 'Unknown';
      types[name] = (types[name] || 0) + 1;
    }

    const sorted = Object.entries(types).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? sorted[0][0] : 'None';
  }

  countSatisfiedFrameworks(control, selectedFrameworks) {
    const mappings = this.extractFrameworkMappings(control);
    let count = 0;

    for (const framework of selectedFrameworks) {
      const normalized = this.normalizeFrameworkCode(framework);

      for (const key of Object.keys(mappings)) {
        if (this.normalizeFrameworkCode(key) === normalized) {
          count++;
          break;
        }
      }
    }

    return count;
  }

  calculateEffortSavings(tiers, frameworks) {
    const avgControlsPerFramework = 200;
    const hoursPerControl = 8;
    const withoutOptimization = frameworks.length * avgControlsPerFramework * hoursPerControl;

    const withOptimization =
      (tiers.tier1.length * hoursPerControl) +
      (tiers.tier2.length * hoursPerControl) +
      (tiers.tier3.length * hoursPerControl) +
      (tiers.tier4.length * hoursPerControl);

    return {
      withoutOptimization,
      withOptimization,
      savings: withoutOptimization - withOptimization,
      savingsPercent: Math.round(((withoutOptimization - withOptimization) / withoutOptimization) * 100)
    };
  }

  identifyQuickWins(tier1Controls) {
    return tier1Controls
      .filter(c => {
        const estimate = this.getEffortEstimate(c.control);
        return estimate.hours <= 8 && estimate.complexity !== 'High';
      })
      .slice(0, 5);
  }

  generateRoadmap(tiers) {
    const phases = [];

    phases.push({
      name: 'Foundation',
      duration: '8 weeks',
      controls: tiers.tier1.slice(0, 20),
      effort: tiers.tier1.slice(0, 20).reduce((sum, c) => sum + this.getEffortEstimate(c.control).hours, 0)
    });

    phases.push({
      name: 'Core Security',
      duration: '8 weeks',
      controls: [...tiers.tier1.slice(20), ...tiers.tier2.slice(0, 40)],
      effort: 800
    });

    phases.push({
      name: 'Comprehensive',
      duration: '8 weeks',
      controls: [...tiers.tier2.slice(40), ...tiers.tier3],
      effort: 1200
    });

    phases.push({
      name: 'Framework-Specific',
      duration: '6 weeks',
      controls: tiers.tier4,
      effort: 500
    });

    return phases;
  }

  calculateCoverageByPhase(tiers) {
    const totalControls =
      tiers.tier1.length + tiers.tier2.length +
      tiers.tier3.length + tiers.tier4.length;

    return {
      phase1: Math.round((20 / totalControls) * 100),
      phase2: Math.round((tiers.tier1.length / totalControls) * 100),
      phase3: Math.round(((tiers.tier1.length + tiers.tier2.length) / totalControls) * 100),
      phase4: 100
    };
  }

  generateControlMatrix(optimization) {
    const matrix = [];
    matrix.push(['Control', 'Category', ...optimization.frameworks, 'Tier', 'Effort']);

    for (const tier of ['tier1', 'tier2', 'tier3', 'tier4']) {
      for (const item of optimization.tiers[tier]) {
        const row = [
          item.controlId,
          item.control.category || 'N/A',
          ...optimization.frameworks.map(f => this.hasFramework(item.control, f) ? 'X' : ''),
          tier,
          this.getEffortEstimate(item.control).hours
        ];
        matrix.push(row);
      }
    }

    return matrix;
  }

  hasFramework(control, framework) {
    const normalized = this.normalizeFrameworkCode(framework);
    const mappings = this.extractFrameworkMappings(control);

    for (const key of Object.keys(mappings)) {
      if (this.normalizeFrameworkCode(key) === normalized) {
        return true;
      }
    }
    return false;
  }

  generateOptimizationSummary(optimization) {
    return {
      frameworks: optimization.frameworks,
      totalControls: {
        tier1: optimization.tiers.tier1.length,
        tier2: optimization.tiers.tier2.length,
        tier3: optimization.tiers.tier3.length,
        tier4: optimization.tiers.tier4.length,
        total: optimization.tiers.tier1.length + optimization.tiers.tier2.length +
               optimization.tiers.tier3.length + optimization.tiers.tier4.length
      },
      effortSavings: optimization.effortSavings,
      quickWins: optimization.quickWins.length,
      recommendedStart: 'Tier 1 for maximum ROI'
    };
  }
}

// `process.argv[1]` is undefined under `node --eval` and some embedders, where
// pathToFileURL would throw; treat those as non-CLI rather than crashing on import.
if (process.argv[1] !== undefined && import.meta.url === (() => { try { return pathToFileURL(realpathSync(process.argv[1])).href; } catch { return null; } })()) {
  const analyzer = new CrossFrameworkAnalyzer();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'map':
      const mapResult = analyzer.mapControlUnified(args[0]);
      console.log(JSON.stringify(mapResult, null, 2));
      break;

    case 'conflicts':
      const frameworks = args[0] ? args[0].split(',') : [];
      const detailLevel = args[1] || 'detailed';
      const conflictResult = analyzer.findConflicts(frameworks, detailLevel);
      console.log(JSON.stringify(conflictResult, null, 2));
      break;

    case 'optimize':
      const optFrameworks = args[0] ? args[0].split(',') : [];
      const format = args[1] || 'roadmap';
      const optResult = analyzer.optimizeMultiFramework(optFrameworks, format);
      console.log(JSON.stringify(optResult, null, 2));
      break;

    default:
      console.log('Usage:');
      console.log('  node cross-framework-analyzer.js map <control-query>');
      console.log('  node cross-framework-analyzer.js conflicts <frameworks> [detail-level]');
      console.log('  node cross-framework-analyzer.js optimize <frameworks> [format]');
      process.exit(1);
  }
}

export default CrossFrameworkAnalyzer;
