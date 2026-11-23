#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import yaml from 'js-yaml';
import {
  appendResource,
  hasCompanionResource,
  setTopLevelAttribute,
  terraformResources
} from '../src/terraform-blocks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IaCScanner {
  constructor(directory, frameworks, options = {}) {
    this.directory = directory;
    this.frameworks = frameworks.map(f => f.toUpperCase());
    this.options = options;
    this.violations = [];
    this.pendingFixes = [];
    this.satisfied = [];
    this.partial = [];
    this.recommendations = [];
    this.filesScanned = 0;

    const crosswalkPath = path.join(__dirname, '../config/control-crosswalk.yaml');
    this.crosswalk = yaml.load(fs.readFileSync(crosswalkPath, 'utf8'));

    this.rules = this.buildRulesDatabase();
  }

  buildRulesDatabase() {
    const rules = {
      encryption_at_rest: {
        name: 'Encryption at Rest',
        frameworks: ['SOC2 CC6.7', 'PCI-DSS 3.4', 'NIST SC-28', 'ISO A.10.1'],
        checks: [
          {
            type: 'terraform',
            resources: ['aws_s3_bucket', 'aws_ebs_volume', 'aws_rds_cluster', 'aws_rds_instance'],
            validator: this.checkEncryption.bind(this)
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
            validator: this.checkLogging.bind(this)
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
            validator: this.checkNetworkSecurity.bind(this)
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
            validator: this.checkDataProtection.bind(this)
          }
        ]
      }
    };

    return rules;
  }

  async scan() {
    console.log(`Scanning: ${this.directory}`);
    console.log(`Frameworks: ${this.frameworks.join(', ')}\n`);

    const files = this.findIaCFiles(this.directory);

    for (const file of files) {
      await this.scanFile(file);
    }

    return this.generateReport();
  }

  findIaCFiles(dir) {
    const files = [];

    const walk = (currentPath) => {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          if (!['node_modules', '.git', '.terraform', 'dist', 'build'].includes(entry.name)) {
            walk(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();

          if (['.tf', '.yaml', '.yml', '.json'].includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };

    walk(dir);
    return files;
  }

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

  scanTerraform(filePath, content) {
    for (const resource of terraformResources(content)) {
      for (const [controlId, rule] of Object.entries(this.rules)) {
        for (const check of rule.checks) {
          if (check.type === 'terraform' && check.resources.includes(resource.type)) {
            const result = check.validator(resource.type, resource.name, resource.body, filePath, resource.line, content);

            if (result) {
              this.recordFinding(controlId, rule, result, filePath, resource.line, resource.type, resource.name);
            }
          }
        }
      }
    }
  }

  scanYaml(filePath, content) {
    let docs;
    try {
      docs = yaml.loadAll(content);
    } catch (err) {
      return;
    }

    for (const doc of docs) {
      if (!doc) continue;

      if (doc.kind) {
        this.scanKubernetesResource(doc, filePath);
      } else if (doc.AWSTemplateFormatVersion) {
        this.scanCloudFormation(doc, filePath);
      }
    }
  }

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

  scanJson(filePath, content) {
    try {
      const doc = JSON.parse(content);

      if (doc.AWSTemplateFormatVersion) {
        this.scanCloudFormation(doc, filePath);
      } else if (doc.$schema && doc.$schema.includes('deploymentTemplate')) {
        this.scanArmTemplate(doc, filePath);
      }
    } catch (err) {
    }
  }

  checkEncryption(resourceType, resourceName, resourceBody, filePath, lineNumber, fileContent = '') {
    const issues = [];

    if (resourceType === 'aws_s3_bucket') {
      if (!resourceBody.includes('server_side_encryption_configuration')
        && !hasCompanionResource(fileContent, 'aws_s3_bucket_server_side_encryption_configuration', resourceName)) {
        issues.push({
          severity: 'HIGH',
          issue: 'S3 bucket does not have server-side encryption enabled',
          remediation: 'Add an aws_s3_bucket_server_side_encryption_configuration resource with AES256 or aws:kms algorithm',
          autoFixable: true,
          fix: { companion: 'aws_s3_bucket_server_side_encryption_configuration' }
        });
      }
    }

    if (resourceType === 'aws_ebs_volume') {
      if (!resourceBody.includes('encrypted') || /\bencrypted\s*=\s*false\b/.test(resourceBody)) {
        issues.push({
          severity: 'HIGH',
          issue: 'EBS volume is not encrypted',
          remediation: 'Set encrypted = true and optionally specify kms_key_id',
          autoFixable: true,
          fix: { attribute: 'encrypted', value: 'true' }
        });
      }
    }

    if (resourceType === 'aws_rds_cluster' || resourceType === 'aws_rds_instance') {
      if (!resourceBody.includes('storage_encrypted') || /\bstorage_encrypted\s*=\s*false\b/.test(resourceBody)) {
        issues.push({
          severity: 'HIGH',
          issue: 'RDS database storage is not encrypted',
          remediation: 'Set storage_encrypted = true and specify kms_key_id',
          autoFixable: true,
          fix: { attribute: 'storage_encrypted', value: 'true' }
        });
      }
    }

    return issues.length > 0 ? issues : null;
  }

  checkK8sEncryption(resourceType, resourceName, resourceBody, filePath, lineNumber) {
    const issues = [];
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

  checkLogging(resourceType, resourceName, resourceBody, filePath, lineNumber) {
    const issues = [];

    if (resourceType === 'aws_cloudtrail') {
      if (!/\bis_multi_region_trail\s*=\s*true\b/.test(resourceBody)) {
        issues.push({
          severity: 'MEDIUM',
          issue: 'CloudTrail is not configured for all regions',
          remediation: 'Set is_multi_region_trail = true',
          autoFixable: true,
          fix: { attribute: 'is_multi_region_trail', value: 'true' }
        });
      }

      if (!resourceBody.includes('enable_log_file_validation')) {
        issues.push({
          severity: 'MEDIUM',
          issue: 'CloudTrail log file validation is not enabled',
          remediation: 'Set enable_log_file_validation = true',
          autoFixable: true,
          fix: { attribute: 'enable_log_file_validation', value: 'true' }
        });
      }

      issues.push({
        severity: 'INFO',
        issue: 'Verify CloudTrail logs are retained for 1 year (PCI-DSS 10.7)',
        remediation: 'Check S3 bucket lifecycle configuration for 365-day retention',
        autoFixable: false
      });
    }

    return issues.length > 0 ? issues : null;
  }

  checkNetworkSecurity(resourceType, resourceName, resourceBody, filePath, lineNumber) {
    const issues = [];

    if (resourceType === 'aws_security_group') {
      const ingressRegex = /ingress\s*{[^}]*cidr_blocks\s*=\s*\["0\.0\.0\.0\/0"\][^}]*}/g;
      const ingressMatches = resourceBody.match(ingressRegex) || [];

      for (const ingress of ingressMatches) {
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

  checkAccessControl(resourceType, resourceName, resourceBody, filePath, lineNumber) {
    const issues = [];

    if (resourceType === 'aws_iam_policy') {
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

  checkDataProtection(resourceType, resourceName, resourceBody, filePath, lineNumber, fileContent = '') {
    const issues = [];

    if (resourceType === 'aws_s3_bucket') {
      if (!resourceBody.includes('versioning')
        && !hasCompanionResource(fileContent, 'aws_s3_bucket_versioning', resourceName)) {
        issues.push({
          severity: 'MEDIUM',
          issue: 'S3 bucket versioning is not enabled',
          remediation: 'Add an aws_s3_bucket_versioning resource for data protection and recovery',
          autoFixable: true,
          fix: { companion: 'aws_s3_bucket_versioning' }
        });
      }

      if (!hasCompanionResource(fileContent, 'aws_s3_bucket_public_access_block', resourceName)) {
        issues.push({
          severity: 'HIGH',
          issue: 'S3 bucket does not have public access blocks configured',
          remediation: 'Add aws_s3_bucket_public_access_block resource',
          autoFixable: true,
          fix: { companion: 'aws_s3_bucket_public_access_block' }
        });
      }
    }

    return issues.length > 0 ? issues : null;
  }

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

      if (issue.fix) {
        this.pendingFixes.push({ file: filePath, resourceType, resourceName, ...issue.fix });
      }

      if (issue.severity === 'INFO') {
        this.recommendations.push(finding);
      } else {
        this.violations.push(finding);
      }
    }
  }

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

  async applyFixes() {
    const fixesByFile = new Map();
    for (const fix of this.pendingFixes) {
      fixesByFile.set(fix.file, [...(fixesByFile.get(fix.file) ?? []), fix]);
    }
    let fixCount = 0;

    for (const [file, fixes] of fixesByFile) {
      const original = fs.readFileSync(file, 'utf8');
      let content = original;

      for (const fix of fixes) {
        const fixed = applyTerraformFix(content, fix);
        if (fixed !== content) fixCount++;
        content = fixed;
      }

      if (content !== original) {
        const backupPath = `${file}.backup`;
        if (!fs.existsSync(backupPath)) {
          fs.writeFileSync(backupPath, original);
        }
        fs.writeFileSync(file, content);
      }
    }

    return fixCount;
  }
}

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

function applyTerraformFix(content, fix) {
  if (fix.attribute) {
    return setTopLevelAttribute(content, fix.resourceType, fix.resourceName, fix.attribute, fix.value);
  }
  if (hasCompanionResource(content, fix.companion, fix.resourceName)) return content;
  return appendResource(content, S3_COMPANION_RESOURCES[fix.companion](fix.resourceName));
}

const S3_COMPANION_RESOURCES = {
  aws_s3_bucket_server_side_encryption_configuration: name => `resource "aws_s3_bucket_server_side_encryption_configuration" "${name}" {
  bucket = aws_s3_bucket.${name}.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}`,
  aws_s3_bucket_versioning: name => `resource "aws_s3_bucket_versioning" "${name}" {
  bucket = aws_s3_bucket.${name}.id

  versioning_configuration {
    status = "Enabled"
  }
}`,
  aws_s3_bucket_public_access_block: name => `resource "aws_s3_bucket_public_access_block" "${name}" {
  bucket = aws_s3_bucket.${name}.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}`
};

export default IaCScanner;
