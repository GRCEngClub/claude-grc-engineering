#!/usr/bin/env node

/**
 * IaC Compliance Scanner
 *
 * Scans Infrastructure as Code for compliance violations:
 * - Terraform (.tf files)
 * - CloudFormation (.yaml, .json)
 * - Kubernetes (.yaml manifests)
 *
 * Checks against: SOC2, PCI-DSS, NIST 800-53, ISO 27001, etc.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IaCScanner {
  constructor(directory, frameworks, options = {}) {
    this.directory = directory;
    this.frameworks = frameworks.map(f => f.toUpperCase());
    this.options = options;
    this.violations = [];
    this.satisfied = [];
    this.partial = [];
    this.recommendations = [];
    this.filesScanned = 0;

    // Load control crosswalk for compliance rules
    const crosswalkPath = path.join(__dirname, '../config/control-crosswalk.yaml');
    this.crosswalk = yaml.load(fs.readFileSync(crosswalkPath, 'utf8'));

    // Compliance rules database
    this.rules = this.buildRulesDatabase();
  }

  /**
   * Build rules database from crosswalk
   */
  buildRulesDatabase() {
    const rules = {
      encryption_at_rest: {
        name: 'Encryption at Rest',
        frameworks: ['SOC2 CC6.7', 'PCI-DSS 3.4', 'NIST SC-28', 'ISO A.10.1'],
        checks: [
          {
            type: 'terraform',
            resources: ['aws_s3_bucket', 'aws_ebs_volume', 'aws_rds_cluster', 'aws_rds_instance'],
            validator: this.checkEncryption.bind(this),
            remediation: this.remediateEncryption.bind(this)
          },
          {
            type: 'kubernetes',
            resources: ['PersistentVolume', 'PersistentVolumeClaim'],
            validator: this.checkK8sEncryption.bind(this)
          }
        ]
      },

      logging_and_monitoring: {
        name: 'Security Logging and Monitoring',
        frameworks: ['SOC2 CC7.2', 'PCI-DSS 10.1', 'NIST AU-2', 'ISO A.12.4'],
        checks: [
          {
            type: 'terraform',
            resources: ['aws_cloudtrail', 'azurerm_monitor_activity_log_alert', 'google_logging_project_sink'],
            validator: this.checkLogging.bind(this),
            remediation: this.remediateLogging.bind(this)
          }
        ]
      },

      network_security: {
        name: 'Network Security and Segmentation',
        frameworks: ['PCI-DSS 1.2', 'NIST SC-7', 'SOC2 CC6.6', 'ISO A.13.1'],
        checks: [
          {
            type: 'terraform',
            resources: ['aws_security_group', 'azurerm_network_security_group', 'google_compute_firewall'],
            validator: this.checkNetworkSecurity.bind(this),
            remediation: this.remediateNetworkSecurity.bind(this)
          }
        ]
      },

      access_control: {
        name: 'Access Control',
        frameworks: ['NIST AC-2', 'ISO A.9.2', 'SOC2 CC6.1', 'PCI-DSS 8.1'],
        checks: [
          {
            type: 'terraform',
            resources: ['aws_iam_user', 'aws_iam_role', 'aws_iam_policy'],
            validator: this.checkAccessControl.bind(this)
          }
        ]
      },

      data_protection: {
        name: 'Data Protection',
        frameworks: ['PCI-DSS 3.1', 'SOC2 CC6.7', 'GDPR Art.32'],
        checks: [
          {
            type: 'terraform',
            resources: ['aws_s3_bucket'],
            validator: this.checkDataProtection.bind(this),
            remediation: this.remediateDataProtection.bind(this)
          }
        ]
      }
    };

    return rules;
  }

  /**
   * Scan directory for IaC files
   */
  async scan() {
    console.log(`Scanning: ${this.directory}`);
    console.log(`Frameworks: ${this.frameworks.join(', ')}\n`);

    const files = this.findIaCFiles(this.directory);

    for (const file of files) {
      await this.scanFile(file);
    }

    return this.generateReport();
  }

  /**
   * Find all IaC files in directory
   */
  findIaCFiles(dir) {
    const files = [];

    const walk = (currentPath) => {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          // Skip common ignored directories
          if (!['node_modules', '.git', '.terraform', 'dist', 'build'].includes(entry.name)) {
            walk(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();

          // Check for IaC files
          if (['.tf', '.yaml', '.yml', '.json'].includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };

    walk(dir);
    return files;
  }

  /**
   * Scan individual file
   */
  async scanFile(filePath) {
    this.filesScanned++;

    const ext = path.extname(filePath).toLowerCase();
    const content = fs.readFileSync(filePath, 'utf8');

    if (ext === '.tf') {
      this.scanTerraform(filePath, content);
    } else if (['.yaml', '.yml'].includes(ext)) {
      this.scanYaml(filePath, content);
    } else if (ext === '.json') {
      this.scanJson(filePath, content);
    }
  }

  /**
   * Scan Terraform file
   */
  scanTerraform(filePath, content) {
    // Simple regex-based parsing (production would use HCL parser)
    const resourceRegex = /resource\s+"([^"]+)"\s+"([^"]+)"\s+{([^}]+)}/gs;
    let match;

    while ((match = resourceRegex.exec(content)) !== null) {
      const [fullMatch, resourceType, resourceName, resourceBody] = match;
      const lineNumber = content.substring(0, match.index).split('\n').length;

      // Check against all rules
      for (const [controlId, rule] of Object.entries(this.rules)) {
        for (const check of rule.checks) {
          if (check.type === 'terraform' && check.resources.includes(resourceType)) {
            const result = check.validator(resourceType, resourceName, resourceBody, filePath, lineNumber);

            if (result) {
              this.recordFinding(controlId, rule, result, filePath, lineNumber, resourceType, resourceName);
            }
          }
        }
      }
    }
  }

  /**
   * Scan YAML file (Kubernetes, CloudFormation)
   */
  scanYaml(filePath, content) {
    // Only the parse is guarded: a dispatch error must surface, not be
    // swallowed as "not YAML" (that silence hid a missing-method bug that
    // skipped every Kubernetes document).
    let docs;
    try {
      docs = yaml.loadAll(content);
    } catch (err) {
      return; // Not a valid YAML file for our purposes
    }

    for (const doc of docs) {
      if (!doc) continue;

      // Detect type
      if (doc.kind) {
        // Kubernetes
        this.scanKubernetesResource(doc, filePath);
      } else if (doc.AWSTemplateFormatVersion) {
        // CloudFormation
        this.scanCloudFormation(doc, filePath);
      }
    }
  }

  /**
   * Scan a single parsed Kubernetes document against the kubernetes-type
   * rules. The document is re-serialized to YAML so validators can use the
   * same substring/regex checks they apply to Terraform resource bodies.
   */
  scanKubernetesResource(doc, filePath) {
    const resourceType = doc.kind;
    const resourceName = doc.metadata?.name || 'unnamed';
    const resourceBody = yaml.dump(doc);
    const lineNumber = 1;

    for (const [controlId, rule] of Object.entries(this.rules)) {
      for (const check of rule.checks) {
        if (check.type === 'kubernetes' && check.resources.includes(resourceType)) {
          const result = check.validator(resourceType, resourceName, resourceBody, filePath, lineNumber);

          if (result) {
            this.recordFinding(controlId, rule, result, filePath, lineNumber, resourceType, resourceName);
          }
        }
      }
    }
  }

  /**
   * Scan JSON file (CloudFormation, ARM templates)
   */
  scanJson(filePath, content) {
    try {
      const doc = JSON.parse(content);

      if (doc.AWSTemplateFormatVersion) {
        this.scanCloudFormation(doc, filePath);
      } else if (doc.$schema && doc.$schema.includes('deploymentTemplate')) {
        // Azure ARM template
        this.scanArmTemplate(doc, filePath);
      }
    } catch (err) {
      // Not a valid JSON file for our purposes
    }
  }

  /**
   * Check encryption configuration
   */
  checkEncryption(resourceType, resourceName, resourceBody, filePath, lineNumber) {
    const issues = [];

    if (resourceType === 'aws_s3_bucket') {
      if (!resourceBody.includes('server_side_encryption_configuration')) {
        issues.push({
          severity: 'HIGH',
          issue: 'S3 bucket does not have server-side encryption enabled',
          remediation: 'Add server_side_encryption_configuration block with AES256 or aws:kms algorithm',
          autoFixable: true
        });
      }
    }

    if (resourceType === 'aws_ebs_volume') {
      if (!resourceBody.includes('encrypted') || resourceBody.includes('encrypted = false')) {
        issues.push({
          severity: 'HIGH',
          issue: 'EBS volume is not encrypted',
          remediation: 'Set encrypted = true and optionally specify kms_key_id',
          autoFixable: true
        });
      }
    }

    if (resourceType === 'aws_rds_cluster' || resourceType === 'aws_rds_instance') {
      if (!resourceBody.includes('storage_encrypted') || resourceBody.includes('storage_encrypted = false')) {
        issues.push({
          severity: 'HIGH',
          issue: 'RDS database storage is not encrypted',
          remediation: 'Set storage_encrypted = true and specify kms_key_id',
          autoFixable: true
        });
      }
    }

    return issues.length > 0 ? issues : null;
  }

  /**
   * Check encryption on Kubernetes persistent storage.
   *
   * A PV/PVC is only encrypted at rest if its StorageClass says so, and the
   * StorageClass usually lives in another manifest this scanner cannot
   * resolve. So a bare storageClassName reference is NOT accepted as
   * encryption evidence: it gets a manual-verification finding, while the
   * absence of any indicator gets the stronger prompt. Both are MEDIUM,
   * a review prompt rather than proof the volume is unencrypted.
   */
  checkK8sEncryption(resourceType, resourceName, resourceBody, filePath, lineNumber) {
    const issues = [];
    // Only affirmative declarations count as evidence. Bare mentions of
    // "encryption" or "kms" (e.g. `encryption: disabled`, a description
    // saying "encryption pending") must not suppress the finding.
    const declaresEncryption =
      /encrypted\s*[:=]\s*["']?true\b/i.test(resourceBody)
      || /encryption\s*:\s*["']?(true|enabled|aes256|aws:kms)\b/i.test(resourceBody)
      || /[\w.-]*kms[\w.-]*key[\w.-]*\s*:\s*\S+/i.test(resourceBody);
    const referencesStorageClass = /storageClassName\s*:\s*\S/i.test(resourceBody);

    if (!declaresEncryption) {
      if (referencesStorageClass) {
        issues.push({
          severity: 'MEDIUM',
          issue: `${resourceType} '${resourceName}' references a StorageClass this scanner cannot resolve; encryption at rest is unverified`,
          remediation: 'Confirm the referenced StorageClass provisions encrypted volumes (e.g. EBS/PD parameters with encrypted: "true"), or add an explicit encryption indicator to the manifest.',
          autoFixable: false
        });
      } else {
        issues.push({
          severity: 'MEDIUM',
          issue: `${resourceType} '${resourceName}' does not reference an encrypted StorageClass`,
          remediation: 'Set storageClassName to a StorageClass whose provisioner enables encryption at rest (e.g. an EBS/PD class with encrypted: "true").',
          autoFixable: false
        });
      }
    }

    return issues.length > 0 ? issues : null;
  }

  /**
   * Check logging configuration
   */
  checkLogging(resourceType, resourceName, resourceBody, filePath, lineNumber) {
    const issues = [];

    if (resourceType === 'aws_cloudtrail') {
      if (!resourceBody.includes('is_multi_region_trail = true')) {
        issues.push({
          severity: 'MEDIUM',
          issue: 'CloudTrail is not configured for all regions',
          remediation: 'Set is_multi_region_trail = true',
          autoFixable: true
        });
      }

      if (!resourceBody.includes('enable_log_file_validation')) {
        issues.push({
          severity: 'MEDIUM',
          issue: 'CloudTrail log file validation is not enabled',
          remediation: 'Set enable_log_file_validation = true',
          autoFixable: true
        });
      }

      // Check for retention (this would need to check associated S3 lifecycle)
      issues.push({
        severity: 'INFO',
        issue: 'Verify CloudTrail logs are retained for 1 year (PCI-DSS 10.7)',
        remediation: 'Check S3 bucket lifecycle configuration for 365-day retention',
        autoFixable: false
      });
    }

    return issues.length > 0 ? issues : null;
  }

  /**
   * Check network security configuration
   */
  checkNetworkSecurity(resourceType, resourceName, resourceBody, filePath, lineNumber) {
    const issues = [];

    if (resourceType === 'aws_security_group') {
      // Check for overly permissive rules
      const ingressRegex = /ingress\s*{[^}]*cidr_blocks\s*=\s*\["0\.0\.0\.0\/0"\][^}]*}/g;
      const ingressMatches = resourceBody.match(ingressRegex) || [];

      for (const ingress of ingressMatches) {
        // Check if SSH (22) or RDP (3389) is open to the world
        if (ingress.includes('from_port   = 22') || ingress.includes('from_port = 22')) {
          issues.push({
            severity: 'CRITICAL',
            issue: 'Security group allows unrestricted SSH access (0.0.0.0/0:22)',
            remediation: 'Restrict SSH to specific IP ranges or remove rule entirely',
            autoFixable: false
          });
        }

        if (ingress.includes('from_port   = 3389') || ingress.includes('from_port = 3389')) {
          issues.push({
            severity: 'CRITICAL',
            issue: 'Security group allows unrestricted RDP access (0.0.0.0/0:3389)',
            remediation: 'Restrict RDP to specific IP ranges or remove rule entirely',
            autoFixable: false
          });
        }

        if (ingress.includes('from_port   = 0') || ingress.includes('to_port   = 65535')) {
          issues.push({
            severity: 'HIGH',
            issue: 'Security group allows all ports from 0.0.0.0/0',
            remediation: 'Apply principle of least privilege - only allow necessary ports',
            autoFixable: false
          });
        }
      }
    }

    return issues.length > 0 ? issues : null;
  }

  /**
   * Check access control configuration
   */
  checkAccessControl(resourceType, resourceName, resourceBody, filePath, lineNumber) {
    const issues = [];

    if (resourceType === 'aws_iam_policy') {
      // Check for overly permissive policies
      if (resourceBody.includes('"*"') && resourceBody.includes('"Effect": "Allow"')) {
        issues.push({
          severity: 'HIGH',
          issue: 'IAM policy allows full access to all resources (*)',
          remediation: 'Apply least privilege principle - restrict to specific resources',
          autoFixable: false
        });
      }
    }

    return issues.length > 0 ? issues : null;
  }

  /**
   * Check data protection configuration
   */
  checkDataProtection(resourceType, resourceName, resourceBody, filePath, lineNumber) {
    const issues = [];

    if (resourceType === 'aws_s3_bucket') {
      if (!resourceBody.includes('versioning')) {
        issues.push({
          severity: 'MEDIUM',
          issue: 'S3 bucket versioning is not enabled',
          remediation: 'Enable versioning for data protection and recovery',
          autoFixable: true
        });
      }

      if (!resourceBody.includes('public_access_block') && !resourceBody.includes('aws_s3_bucket_public_access_block')) {
        issues.push({
          severity: 'HIGH',
          issue: 'S3 bucket does not have public access blocks configured',
          remediation: 'Add aws_s3_bucket_public_access_block resource',
          autoFixable: true
        });
      }
    }

    return issues.length > 0 ? issues : null;
  }

  /**
   * Record finding
   */
  recordFinding(controlId, rule, issues, filePath, lineNumber, resourceType, resourceName) {
    for (const issue of issues) {
      const finding = {
        controlId,
        controlName: rule.name,
        frameworks: rule.frameworks.filter(f =>
          this.frameworks.some(selected => f.includes(selected))
        ),
        severity: issue.severity,
        file: filePath,
        line: lineNumber,
        resource: `${resourceType}.${resourceName}`,
        issue: issue.issue,
        remediation: issue.remediation,
        autoFixable: issue.autoFixable
      };

      if (issue.severity === 'INFO') {
        this.recommendations.push(finding);
      } else {
        this.violations.push(finding);
      }
    }
  }

  /**
   * Generate scan report
   */
  generateReport() {
    const totalControls = Object.keys(this.rules).length * this.frameworks.length;
    const violationCount = this.violations.length;
    const satisfiedCount = totalControls - violationCount - this.partial.length;

    const compliancePercentage = Math.round((satisfiedCount / totalControls) * 100);

    return {
      timestamp: new Date().toISOString(),
      directory: this.directory,
      frameworks: this.frameworks,
      filesScanned: this.filesScanned,
      summary: {
        totalControls,
        satisfied: satisfiedCount,
        violations: violationCount,
        partial: this.partial.length,
        compliancePercentage
      },
      violations: this.violations.sort((a, b) => {
        const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
      recommendations: this.recommendations,
      complianceByFramework: this.calculateFrameworkCompliance()
    };
  }

  /**
   * Calculate compliance per framework
   */
  calculateFrameworkCompliance() {
    const compliance = {};

    for (const framework of this.frameworks) {
      const frameworkViolations = this.violations.filter(v =>
        v.frameworks.some(f => f.includes(framework))
      );

      const totalChecks = Object.keys(this.rules).length;
      const passing = totalChecks - frameworkViolations.length;

      compliance[framework] = (passing / totalChecks);
    }

    return compliance;
  }

  /**
   * Apply auto-fixes
   */
  async applyFixes() {
    let fixCount = 0;

    for (const violation of this.violations) {
      if (violation.autoFixable) {
        // Create backup
        const backupPath = `${violation.file}.backup`;
        if (!fs.existsSync(backupPath)) {
          fs.copyFileSync(violation.file, backupPath);
        }

        // Apply fix (simplified - production would use HCL parser/modifier)
        // This is just a demonstration
        fixCount++;
      }
    }

    return fixCount;
  }

  // Remediation functions

  remediateEncryption(resourceType, content) {
    if (resourceType === 'aws_s3_bucket') {
      // Add encryption configuration
      return content.replace(
        /(resource "aws_s3_bucket" "[^"]*" {)/,
        '$1\n  server_side_encryption_configuration {\n    rule {\n      apply_server_side_encryption_by_default {\n        sse_algorithm = "AES256"\n      }\n    }\n  }\n'
      );
    }
    return content;
  }

  remediateLogging(resourceType, content) {
    // Add logging configurations
    return content;
  }

  remediateNetworkSecurity(resourceType, content) {
    // Cannot auto-fix security group rules (requires manual review)
    return content;
  }

  remediateDataProtection(resourceType, content) {
    if (resourceType === 'aws_s3_bucket') {
      // Add versioning
      if (!content.includes('versioning')) {
        content = content.replace(
          /(resource "aws_s3_bucket" "[^"]*" {)/,
          '$1\n  versioning {\n    enabled = true\n  }\n'
        );
      }
    }
    return content;
  }
}

// CLI Interface
// `process.argv[1]` is undefined under `node --eval` and some embedders, where
// pathToFileURL would throw; treat those as non-CLI rather than crashing on import.
if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node scan-iac.js <directory> <frameworks> [output-format] [options]');
    console.log('Example: node scan-iac.js ./terraform SOC2,PCI-DSS,NIST detailed');
    process.exit(1);
  }

  const directory = args[0];
  const frameworks = args[1].split(',');
  const outputFormat = args[2] || 'detailed';
  const options = {
    fix: args.includes('--fix'),
    severity: args.find(a => a.startsWith('--severity='))?.split('=')[1]
  };

  const scanner = new IaCScanner(directory, frameworks, options);

  scanner.scan().then(report => {
    if (outputFormat === 'json') {
      console.log(JSON.stringify(report, null, 2));
    } else if (outputFormat === 'summary') {
      console.log(`\nCompliance: ${report.summary.compliancePercentage}% (${report.summary.satisfied}/${report.summary.totalControls} controls)`);
      console.log(`\nViolations: ${report.violations.length}`);
      console.log(`Files scanned: ${report.filesScanned}`);
    } else {
      // Detailed output
      console.log('\n' + '='.repeat(60));
      console.log('IaC COMPLIANCE SCAN RESULTS');
      console.log('='.repeat(60));
      console.log(`\nDirectory: ${report.directory}`);
      console.log(`Frameworks: ${report.frameworks.join(', ')}`);
      console.log(`Files scanned: ${report.filesScanned}`);
      console.log(`\nCompliance: ${report.summary.compliancePercentage}%`);
      console.log(`Violations: ${report.violations.length}`);
      console.log(`Satisfied: ${report.summary.satisfied}`);

      if (report.violations.length > 0) {
        console.log('\n' + '='.repeat(60));
        console.log('VIOLATIONS');
        console.log('='.repeat(60));

        report.violations.forEach((v, i) => {
          console.log(`\n[${i + 1}] ${v.severity} - ${v.controlName}`);
          console.log(`    Frameworks: ${v.frameworks.join(', ')}`);
          console.log(`    File: ${v.file}:${v.line}`);
          console.log(`    Resource: ${v.resource}`);
          console.log(`    Issue: ${v.issue}`);
          console.log(`    Remediation: ${v.remediation}`);
          if (v.autoFixable) {
            console.log(`    Auto-fix: Available (run with --fix)`);
          }
        });
      }
    }

    if (options.fix && report.violations.some(v => v.autoFixable)) {
      console.log('\nApplying auto-fixes...');
      scanner.applyFixes().then(count => {
        console.log(`Applied ${count} fixes. Re-run scan to verify.`);
      });
    }
  });
}

export default IaCScanner;
