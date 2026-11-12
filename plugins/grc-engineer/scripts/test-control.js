#!/usr/bin/env node

/**
 * Control Testing Framework
 *
 * Automatically tests security control effectiveness:
 * - Configuration tests (properly configured)
 * - Functionality tests (actually working)
 * - Compliance tests (meets framework requirements)
 * - Integration tests (works with other controls)
 */

import { exec } from 'node:child_process';
import util from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import yaml from '../vendor/js-yaml.cjs';

const execPromise = util.promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ControlTester {
  constructor(controlId, cloudProvider = 'aws', options = {}) {
    this.controlId = controlId;
    this.cloudProvider = cloudProvider;
    this.options = options;
    this.results = {
      control_id: controlId,
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        total_tests: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        errors: 0,
        not_implemented: 0,
        assessed: 0,
        pass_rate: null
      }
    };

    // Load control crosswalk
    const crosswalkPath = path.join(__dirname, '../config/control-crosswalk.yaml');
    this.crosswalk = yaml.load(fs.readFileSync(crosswalkPath, 'utf8'));

    // Load control definition
    this.controlDef = Object.hasOwn(this.crosswalk.controls, controlId) ? this.crosswalk.controls[controlId] : null;
    if (!this.controlDef) {
      throw new Error(`Control not found: ${controlId}`);
    }

    this.results.control_name = this.controlDef.name;
    this.results.frameworks = this.extractFrameworks();
  }

  /**
   * Extract frameworks from control definition
   */
  extractFrameworks() {
    const frameworks = [];
    const frameworkKeys = ['nist_800_53', 'iso_27001', 'soc2', 'pci_dss', 'cis_controls'];

    for (const key of frameworkKeys) {
      if (this.controlDef[key]) {
        frameworks.push(key);
      }
    }

    return frameworks;
  }

  /**
   * Run all tests for the control
   */
  async runTests() {
    const startTime = Date.now();

    (this.options.output === 'json' ? console.error : console.log)(`\nTesting Control: ${this.controlDef.name}`);
    (this.options.output === 'json' ? console.error : console.log)(`Frameworks: ${this.results.frameworks.join(', ')}`);
    (this.options.output === 'json' ? console.error : console.log)(`Cloud Provider: ${this.cloudProvider}\n`);

    try {
      if (this.cloudProvider !== 'aws') throw new Error(`Unsupported cloud provider: ${this.cloudProvider}`);
      if (this.controlId !== 'access_control_account_management') throw new Error(`Control testing not implemented: ${this.controlId}`);
      // Run test suites
      await this.runConfigurationTests();
      await this.runFunctionalityTests();
      await this.runComplianceTests();
      await this.runIntegrationTests();

      // Calculate summary
      this.calculateSummary();

      // Determine overall status
      this.results.status = this.determineStatus();

      // Calculate framework compliance
      this.results.framework_compliance = this.calculateFrameworkCompliance();

    } catch (error) {
      console.error(`Error during testing: ${error.message}`);
      this.results.error = error.message;
      this.recordTest({ name: 'Test execution', status: 'ERROR', error: error.message, frameworks: ['All'] });
      this.calculateSummary();
      this.results.status = 'INDETERMINATE';
      this.results.framework_compliance = this.calculateFrameworkCompliance();
    }

    this.results.duration_seconds = (Date.now() - startTime) / 1000;

    return this.results;
  }

  /**
   * Configuration tests
   */
  async runConfigurationTests() {
    (this.options.output === 'json' ? console.error : console.log)('Running configuration tests...');

    if (this.controlId === 'access_control_account_management') {
      await this.testUniqueUserIds();
      await this.testAccessApproval();
      await this.testAccessReviewSchedule();
      await this.testAutomatedProvisioning();
      await this.testLeastPrivilege();
    } else if (this.controlId === 'encryption_at_rest') {
      await this.testS3Encryption();
      await this.testEBSEncryption();
      await this.testRDSEncryption();
      await this.testKMSKeyRotation();
    } else if (this.controlId === 'logging_and_monitoring') {
      await this.testCloudTrailConfiguration();
      await this.testLogRetention();
      await this.testVPCFlowLogs();
      await this.testCloudWatchAlarms();
    }
  }

  /**
   * Functionality tests
   */
  async runFunctionalityTests() {
    (this.options.output === 'json' ? console.error : console.log)('Running functionality tests...');

    if (this.controlId === 'access_control_account_management') {
      await this.testCloudTrailActive();
      await this.testInactiveUserDetection();
      await this.testAccessAnalyzer();
      await this.testMFAEnforcement();
      await this.testAuditTrailIntegrity();
    }
  }

  /**
   * Compliance tests
   */
  async runComplianceTests() {
    (this.options.output === 'json' ? console.error : console.log)('Running compliance tests...');

    if (this.controlId === 'access_control_account_management') {
      await this.testLogRetentionCompliance();
      await this.testSeparationOfDuties();
      await this.testEvidenceAvailability();
      await this.testDocumentation();
    }
  }

  /**
   * Integration tests
   */
  async runIntegrationTests() {
    (this.options.output === 'json' ? console.error : console.log)('Running integration tests...');

    if (this.controlId === 'access_control_account_management') {
      await this.testEndToEndLifecycle();
    }
  }

  // Individual test implementations

  async testUniqueUserIds() {
    const test = {
      id: 'TEST-001',
      name: 'Unique User IDs',
      category: 'configuration',
      requirement: 'All users must have unique identifiers',
      frameworks: ['NIST', 'ISO', 'SOC2', 'PCI']
    };

    test.status = 'NOT_IMPLEMENTED';
    test.message = 'IAM user enumeration alone cannot verify identifiers for all users';

    this.recordTest(test);
  }

  async testAccessReviewSchedule() {
    const test = {
      id: 'TEST-003',
      name: 'Quarterly Access Reviews',
      category: 'configuration',
      requirement: 'Access reviews every 90 days (PCI 8.1.4)',
      frameworks: ['PCI']
    };

    // A schedule alone does not establish when a review was performed.
    test.status = 'NOT_IMPLEMENTED';
    test.message = 'Access review execution evidence is not collected';

    this.recordTest(test);
  }

  async testAccessApproval() {
    const test = {
      id: 'TEST-002',
      name: 'Access Approval Process',
      category: 'configuration',
      requirement: 'Documented approval for all user accounts',
      frameworks: ['NIST', 'SOC2']
    };

    test.status = 'NOT_IMPLEMENTED';
    test.message = 'User tags do not establish documented approval';

    this.recordTest(test);
  }

  async testAutomatedProvisioning() {
    const test = {
      id: 'TEST-004',
      name: 'Automated User Provisioning',
      category: 'configuration',
      requirement: 'Automated account lifecycle management',
      frameworks: ['NIST', 'SOC2']
    };

    test.status = 'NOT_IMPLEMENTED';
    test.message = 'Identity Center existence does not establish automated provisioning or lifecycle management';

    this.recordTest(test);
  }

  async testLeastPrivilege() {
    const test = {
      id: 'TEST-005',
      name: 'Least Privilege Enforcement',
      category: 'configuration',
      requirement: 'Permissions boundaries applied',
      frameworks: ['NIST', 'SOC2']
    };

    test.status = 'NOT_IMPLEMENTED';
    test.message = 'Permissions boundaries alone do not establish least privilege';

    this.recordTest(test);
  }

  async testCloudTrailActive() {
    const test = {
      id: 'TEST-006',
      name: 'CloudTrail Logging Active',
      category: 'functionality',
      requirement: 'All account management events logged',
      frameworks: ['NIST', 'SOC2']
    };

    try {
      const { stdout } = await execPromise('aws cloudtrail describe-trails');
      const trails = JSON.parse(stdout).trailList;
      if (!Array.isArray(trails)) throw new Error('Invalid CloudTrail response');
      const multiRegion = trails.filter(t => t.IsMultiRegionTrail === true);
      test.result = { total_trails: trails.length, multi_region_trails: multiRegion.length };
      // Trail configuration alone establishes neither logging nor event coverage.
      test.status = 'NOT_IMPLEMENTED';
      test.message = `${multiRegion.length} multi-region trail(s) observed; active logging and account management event coverage are not verified`;
    } catch (error) {
      test.status = 'ERROR';
      test.error = error.message;
    }

    this.recordTest(test);
  }

  async testInactiveUserDetection() {
    const test = {
      id: 'TEST-007',
      name: 'Inactive Account Detection',
      category: 'functionality',
      requirement: 'Detect and disable accounts inactive >90 days',
      frameworks: ['PCI']
    };

    test.status = 'NOT_IMPLEMENTED';
    test.message = 'Credential reports alone do not establish detection and disabling of inactive accounts';

    this.recordTest(test);
  }

  async testAccessAnalyzer() {
    const test = {
      id: 'TEST-008',
      name: 'Access Analyzer Enabled',
      category: 'functionality',
      requirement: 'Continuous unused access detection',
      frameworks: ['SOC2', 'NIST']
    };

    test.status = 'NOT_IMPLEMENTED';
    test.message = 'An active analyzer alone does not establish continuous unused access detection';

    this.recordTest(test);
  }

  async testMFAEnforcement() {
    const test = {
      id: 'TEST-009',
      name: 'MFA Enforcement',
      category: 'functionality',
      requirement: 'Multi-factor authentication required',
      frameworks: ['NIST', 'PCI', 'SOC2']
    };

    try {
      const { stdout } = await execPromise('aws iam get-account-summary');
      const summary = JSON.parse(stdout).SummaryMap;
      if (!summary || ![0, 1].includes(summary.AccountMFAEnabled)) throw new Error('Invalid root MFA summary');
      test.result = { root_account_mfa: summary.AccountMFAEnabled === 1 };
      // Enrollment status alone does not establish whether MFA is enforced.
      test.status = 'NOT_IMPLEMENTED';
      test.message = `Root MFA is ${summary.AccountMFAEnabled === 1 ? 'enabled' : 'not enabled'}; MFA enforcement is not verified`;
    } catch (error) {
      test.status = 'ERROR';
      test.error = error.message;
    }

    this.recordTest(test);
  }

  async testAuditTrailIntegrity() {
    const test = {
      id: 'TEST-010',
      name: 'Audit Trail Integrity',
      category: 'functionality',
      requirement: 'Tamper-proof audit logs',
      frameworks: ['NIST', 'SOC2']
    };

    test.status = 'NOT_IMPLEMENTED';
    test.message = 'Log file validation configuration alone does not establish tamper-proof audit logs';

    this.recordTest(test);
  }

  async testLogRetentionCompliance() {
    const test = {
      id: 'TEST-011',
      name: 'Log Retention Period',
      category: 'compliance',
      requirement: '1 year retention (PCI 10.7, SOC2)',
      frameworks: ['PCI', 'SOC2', 'NIST']
    };

    test.status = 'NOT_IMPLEMENTED';
    test.message = 'Evidence collection for this check is not implemented';

    this.recordTest(test);
  }

  async testSeparationOfDuties() {
    const test = {
      id: 'TEST-012',
      name: 'Separation of Duties',
      category: 'compliance',
      requirement: 'Admin privileges separated',
      frameworks: ['NIST', 'SOC2']
    };

    test.status = 'NOT_IMPLEMENTED';
    test.message = 'Evidence collection for this check is not implemented';

    this.recordTest(test);
  }

  async testEvidenceAvailability() {
    const test = {
      id: 'TEST-013',
      name: 'Evidence Availability',
      category: 'compliance',
      requirement: 'Evidence can be collected on demand',
      frameworks: ['All']
    };

    test.status = 'NOT_IMPLEMENTED';
    test.message = 'Evidence collection for this check is not implemented';

    this.recordTest(test);
  }

  async testDocumentation() {
    const test = {
      id: 'TEST-014',
      name: 'Access Review Documentation',
      category: 'compliance',
      requirement: 'Documented access review process',
      frameworks: ['ISO', 'SOC2']
    };

    test.status = 'NOT_IMPLEMENTED';
    test.message = 'Evidence collection for this check is not implemented';

    this.recordTest(test);
  }

  async testEndToEndLifecycle() {
    const test = {
      id: 'TEST-015',
      name: 'End-to-End Account Lifecycle',
      category: 'integration',
      requirement: 'Complete lifecycle automation',
      frameworks: ['All']
    };

    test.status = 'NOT_IMPLEMENTED';
    test.message = 'Lifecycle integration testing is not implemented';

    this.recordTest(test);
  }

  /**
   * Record test result
   */
  recordTest(test) {
    if (!['PASS', 'FAIL', 'WARNING', 'ERROR', 'NOT_IMPLEMENTED'].includes(test.status)) {
      test.status = 'ERROR';
      test.message = 'Test did not produce a valid status';
    }
    this.results.tests.push(test);
    this.results.summary.total_tests++;

    if (test.status === 'PASS') {
      this.results.summary.passed++;
    } else if (test.status === 'FAIL') {
      this.results.summary.failed++;
    } else if (test.status === 'WARNING') {
      this.results.summary.warnings++;
    } else if (test.status === 'ERROR') {
      this.results.summary.errors++;
    } else if (test.status === 'NOT_IMPLEMENTED') {
      this.results.summary.not_implemented++;
    }
  }

  /**
   * Calculate summary statistics
   */
  calculateSummary() {
    const summary = this.results.summary;
    // Warnings are assessed outcomes but are not passes. Unknowns are excluded.
    summary.assessed = summary.passed + summary.failed + summary.warnings;
    summary.pass_rate = summary.assessed > 0 ? summary.passed / summary.assessed : null;
  }

  /**
   * Determine overall control status
   */
  determineStatus() {
    if (!this.results.tests.length || this.results.summary.errors || this.results.summary.not_implemented) return 'INDETERMINATE';
    const passRate = this.results.summary.pass_rate;
    const failed = this.results.summary.failed;

    if (failed === 0 && passRate >= 0.95) {
      return 'FULLY_EFFECTIVE';
    } else if (failed === 0 && passRate >= 0.80) {
      return 'EFFECTIVE';
    } else if (failed <= 2 && passRate >= 0.70) {
      return 'PARTIALLY_EFFECTIVE';
    } else {
      return 'INEFFECTIVE';
    }
  }

  /**
   * Calculate compliance per framework
   */
  calculateFrameworkCompliance() {
    const compliance = {};
    const frameworks = ['NIST', 'ISO', 'SOC2', 'PCI'];

    for (const framework of frameworks) {
      const frameworkTests = this.results.tests.filter(t =>
        t.frameworks && (t.frameworks.includes(framework) || t.frameworks.includes('All'))
      );

      if (frameworkTests.length === 0) continue;

      const passed = frameworkTests.filter(t => t.status === 'PASS').length;
      const assessed = frameworkTests.filter(t => ['PASS', 'FAIL', 'WARNING'].includes(t.status)).length;
      const score = assessed ? passed / assessed : null;

      let status;
      if (score === null || frameworkTests.some(t => t.status === 'ERROR' || t.status === 'NOT_IMPLEMENTED')) status = 'INDETERMINATE';
      else if (score >= 0.95) status = 'COMPLIANT';
      else if (score >= 0.80) status = 'PARTIAL';
      else status = 'NON_COMPLIANT';

      const issues = frameworkTests
        .filter(t => t.status !== 'PASS')
        .map(t => t.name);

      compliance[framework] = {
        status,
        score: score === null ? null : Math.round(score * 100) / 100,
        assessed,
        issues
      };
    }

    return compliance;
  }

  /**
   * Generate detailed report
   */
  generateReport() {
    if (this.options.output === 'json') {
      return JSON.stringify(this.results, null, 2);
    }

    // Text report
    let report = '\n' + '='.repeat(60) + '\n';
    report += 'CONTROL TEST RESULTS\n';
    report += '='.repeat(60) + '\n\n';

    report += `Control: ${this.results.control_name}\n`;
    report += `Frameworks: ${this.results.frameworks.join(', ')}\n`;
    report += `Duration: ${this.results.duration_seconds}s\n\n`;

    report += 'SUMMARY:\n';
    report += `  Total Tests: ${this.results.summary.total_tests}\n`;
    report += `  ✓ Passed: ${this.results.summary.passed}\n`;
    report += `  ✗ Failed: ${this.results.summary.failed}\n`;
    report += `  ⚠ Warnings: ${this.results.summary.warnings}\n`;
    report += `  Errors: ${this.results.summary.errors}\n`;
    report += `  Not implemented: ${this.results.summary.not_implemented}\n`;
    report += `  Assessed: ${this.results.summary.assessed}\n`;
    report += `  Pass Rate (assessed only): ${this.results.summary.pass_rate === null ? 'N/A' : `${Math.round(this.results.summary.pass_rate * 100)}%`}\n\n`;

    report += `Status: ${this.results.status}\n\n`;

    // List failures
    const failures = this.results.tests.filter(t => t.status === 'FAIL');
    if (failures.length > 0) {
      report += 'FAILURES:\n';
      failures.forEach((test, i) => {
        report += `\n[${i + 1}] ${test.name}\n`;
        report += `    ${test.message}\n`;
        if (test.remediation) {
          report += `    Fix: ${test.remediation.command}\n`;
        }
      });
    }

    // Unknown checks are observations, not control verdicts.
    const unknowns = this.results.tests.filter(t => t.status === 'NOT_IMPLEMENTED' || t.status === 'ERROR');
    if (unknowns.length > 0) {
      report += '\nUNASSESSED CHECKS (not control verdicts):\n';
      unknowns.forEach(test => {
        report += `\n[${test.status}] ${test.name}\n`;
        if (test.message) report += `    ${test.message}\n`;
        if (test.error) report += `    Error: ${test.error}\n`;
      });
    }

    return report;
  }
}

// CLI Interface
// `process.argv[1]` is undefined under `node --eval` and some embedders, where
// pathToFileURL would throw; treat those as non-CLI rather than crashing on import.
if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log('Usage: node test-control.js <control-id> [cloud-provider] [--output=json]');
    console.log('Example: node test-control.js access_control_account_management aws');
    process.exit(1);
  }

  const controlId = args[0];
  const cloudProvider = args[1] && !args[1].startsWith('--') ? args[1] : 'aws';
  const options = {
    output: args.find(a => a.startsWith('--output='))?.split('=')[1] || 'text',
    verbose: args.includes('--verbose'),
    fixFailures: args.includes('--fix-failures')
  };

  let tester;
  Promise.resolve().then(() => {
    tester = new ControlTester(controlId, cloudProvider, options);
    return tester.runTests();
  }).then(results => {
    console.log(tester.generateReport());

    // Exit with error code if tests failed
    if (results.error || results.summary.failed > 0 || results.summary.errors > 0 || results.summary.not_implemented > 0 || results.summary.warnings > 0) {
      process.exitCode = 1;
    }
  }).catch(error => {
    console.error('Test execution failed:', error.message);
    const result = {
      control_id: controlId,
      timestamp: new Date().toISOString(),
      status: 'INDETERMINATE',
      error: error.message,
      tests: [{ name: 'Test execution', status: 'ERROR', error: error.message, frameworks: ['All'] }],
      summary: { total_tests: 1, passed: 0, failed: 0, warnings: 0, errors: 1, not_implemented: 0, assessed: 0, pass_rate: null },
      framework_compliance: {}
    };
    console.log(options.output === 'json' ? JSON.stringify(result, null, 2) : `Status: INDETERMINATE\nError: ${error.message}`);
    process.exitCode = 1;
  });
}

export default ControlTester;
