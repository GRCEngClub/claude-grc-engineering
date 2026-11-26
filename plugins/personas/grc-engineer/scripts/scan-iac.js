#!/usr/bin/env node

import { realpathSync } from 'node:fs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import yaml from '../vendor/js-yaml.cjs';
import {
  appendResource,
  blockAttributeValues,
  companionCoverage,
  hasBlock,
  resourceAttribute,
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
    this.terraformByDir = new Map();
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
        frameworks: ['SOC2 CC6.7', 'PCI-DSS 3.5.1', 'NIST SC-28', 'ISO A.8.24'],
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
        frameworks: ['SOC2 CC7.2', 'PCI-DSS 10.2.1', 'NIST AU-2', 'ISO A.8.15'],
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
        frameworks: ['PCI-DSS 1.3.1', 'NIST SC-7', 'SOC2 CC6.6', 'ISO A.8.20'],
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
        frameworks: ['NIST AC-2', 'ISO A.5.18', 'SOC2 CC6.1', 'PCI-DSS 8.2.1'],
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
        frameworks: ['PCI-DSS 3.2.1', 'SOC2 CC6.7', 'GDPR Art.32'],
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
    // Progress goes to stderr so `json` and `sarif` output on stdout stays parseable.
    console.error(`Scanning: ${this.directory}`);
    console.error(`Frameworks: ${this.frameworks.join(', ')}\n`);

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
    const moduleContent = [content, ...this.siblingTerraform(filePath)].join('\n');
    for (const resource of terraformResources(content)) {
      for (const [controlId, rule] of Object.entries(this.rules)) {
        for (const check of rule.checks) {
          if (check.type === 'terraform' && check.resources.includes(resource.type)) {
            const result = check.validator(resource.type, resource.name, resource.body, filePath, resource.line, moduleContent, {
              attribute: attribute => resourceAttribute(content, resource, attribute),
              hasBlock: blockName => hasBlock(content, resource, blockName)
            });

            if (result) {
              this.recordFinding(controlId, rule, result, filePath, resource.line, resource.type, resource.name);
            }
          }
        }
      }
    }
  }

  siblingTerraform(filePath) {
    const dir = path.dirname(filePath);
    if (!this.terraformByDir.has(dir)) {
      this.terraformByDir.set(dir, terraformFilesIn(dir));
    }
    return this.terraformByDir.get(dir).filter(f => f.file !== filePath).map(f => f.content);
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

  checkEncryption(resourceType, resourceName, resourceBody, filePath, lineNumber, fileContent = '', own = UNPARSED_RESOURCE) {
    const issues = [];

    if (resourceType === 'aws_s3_bucket' && !own.hasBlock('server_side_encryption_configuration')) {
      const issue = s3ProtectionIssue(fileContent, 'aws_s3_bucket_server_side_encryption_configuration', resourceName);
      if (issue) issues.push(issue);
    }

    if (resourceType === 'aws_ebs_volume') {
      const issue = booleanSettingIssue(own.attribute, 'encrypted', {
        severity: 'HIGH',
        issue: 'EBS volume is not encrypted',
        remediation: 'Set encrypted = true and optionally specify kms_key_id'
      });
      if (issue) issues.push(issue);
    }

    if (resourceType === 'aws_rds_cluster' || resourceType === 'aws_rds_instance') {
      const issue = booleanSettingIssue(own.attribute, 'storage_encrypted', {
        severity: 'HIGH',
        issue: 'RDS database storage is not encrypted',
        remediation: 'Set storage_encrypted = true and specify kms_key_id'
      });
      if (issue) issues.push(issue);
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
          check: 'storage-class-unresolved',
          severity: 'MEDIUM',
          issue: `${resourceType} '${resourceName}' references a StorageClass this scanner cannot resolve; encryption at rest is unverified`,
          remediation: 'Confirm the referenced StorageClass provisions encrypted volumes (e.g. EBS/PD parameters with encrypted: "true"), or add an explicit encryption indicator to the manifest.',
          autoFixable: false
        });
      } else {
        issues.push({
          check: 'storage-class-unencrypted',
          severity: 'MEDIUM',
          issue: `${resourceType} '${resourceName}' does not reference an encrypted StorageClass`,
          remediation: 'Set storageClassName to a StorageClass whose provisioner enables encryption at rest (e.g. an EBS/PD class with encrypted: "true").',
          autoFixable: false
        });
      }
    }

    return issues.length > 0 ? issues : null;
  }

  checkLogging(resourceType, resourceName, resourceBody, filePath, lineNumber, fileContent = '', own = UNPARSED_RESOURCE) {
    const issues = [];

    if (resourceType === 'aws_cloudtrail') {
      const settings = [
        booleanSettingIssue(own.attribute, 'is_multi_region_trail', {
          severity: 'MEDIUM',
          issue: 'CloudTrail is not configured for all regions',
          remediation: 'Set is_multi_region_trail = true'
        }),
        booleanSettingIssue(own.attribute, 'enable_log_file_validation', {
          severity: 'MEDIUM',
          issue: 'CloudTrail log file validation is not enabled',
          remediation: 'Set enable_log_file_validation = true'
        })
      ];
      issues.push(...settings.filter(Boolean));

      issues.push({
        check: 'cloudtrail-retention',
        severity: 'INFO',
        issue: 'Verify CloudTrail logs are retained for 1 year (PCI-DSS 10.5.1)',
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
            check: 'open-ssh',
            severity: 'CRITICAL',
            issue: 'Security group allows unrestricted SSH access (0.0.0.0/0:22)',
            remediation: 'Restrict SSH to specific IP ranges or remove rule entirely',
            autoFixable: false
          });
        }

        if (ingress.includes('from_port   = 3389') || ingress.includes('from_port = 3389')) {
          issues.push({
            check: 'open-rdp',
            severity: 'CRITICAL',
            issue: 'Security group allows unrestricted RDP access (0.0.0.0/0:3389)',
            remediation: 'Restrict RDP to specific IP ranges or remove rule entirely',
            autoFixable: false
          });
        }

        if (ingress.includes('from_port   = 0') || ingress.includes('to_port   = 65535')) {
          issues.push({
            check: 'open-all-ports',
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
          check: 'wildcard-policy',
          severity: 'HIGH',
          issue: 'IAM policy allows full access to all resources (*)',
          remediation: 'Apply least privilege principle - restrict to specific resources',
          autoFixable: false
        });
      }
    }

    return issues.length > 0 ? issues : null;
  }

  checkDataProtection(resourceType, resourceName, resourceBody, filePath, lineNumber, fileContent = '', own = UNPARSED_RESOURCE) {
    const issues = [];

    if (resourceType === 'aws_s3_bucket') {
      const protections = [
        own.hasBlock('versioning') ? null : s3ProtectionIssue(fileContent, 'aws_s3_bucket_versioning', resourceName),
        s3ProtectionIssue(fileContent, 'aws_s3_bucket_public_access_block', resourceName)
      ];
      issues.push(...protections.filter(Boolean));
    }

    return issues.length > 0 ? issues : null;
  }

  recordFinding(controlId, rule, issues, filePath, lineNumber, resourceType, resourceName) {
    for (const issue of issues) {
      const finding = {
        controlId,
        check: issue.check,
        help: issue.help,
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
    // Score by (rule, framework) pair, matching calculateFrameworkCompliance: one
    // finding mapped to three frameworks fails three checks, and ten findings
    // against the same rule still fail that rule only once per framework.
    const failedChecks = new Set();
    for (const v of this.violations) {
      for (const framework of this.frameworks) {
        if (v.frameworks.some(f => f.includes(framework))) failedChecks.add(`${v.controlId}|${framework}`);
      }
    }
    const satisfiedCount = Math.max(0, totalControls - failedChecks.size - this.partial.length);

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

  // SARIF 2.1.0 for GitHub code scanning and other SARIF consumers.
  // Only violations become results; INFO recommendations are left out.
  toSarif(report) {
    const levelFor = { CRITICAL: 'error', HIGH: 'error', MEDIUM: 'warning', LOW: 'note' };
    const securitySeverity = { CRITICAL: '9.5', HIGH: '7.5', MEDIUM: '5.0', LOW: '2.0' };
    const rules = new Map();

    const results = report.violations.map(v => {
      // One SARIF rule per distinct check, so each rule's help and score fit every
      // result filed under it (versioning and public access are different checks
      // under the same data_protection control).
      const ruleId = v.check ? `${v.controlId}/${v.check}` : v.controlId;
      if (!rules.has(ruleId)) {
        rules.set(ruleId, {
          id: ruleId,
          name: v.controlName,
          shortDescription: { text: v.check ? `${v.controlName} (${v.check})` : v.controlName },
          help: { text: v.help || v.remediation || v.controlName },
          properties: {
            tags: ['compliance', ...v.frameworks],
            'security-severity': securitySeverity[v.severity] || '5.0'
          }
        });
      }
      // Repo-relative URIs let GitHub map results onto files; anything outside
      // the working directory falls back to an absolute file:// URI.
      const absolute = path.resolve(v.file);
      const relative = path.relative(process.cwd(), absolute);
      const uri = !relative || relative.startsWith('..') || path.isAbsolute(relative)
        ? pathToFileURL(absolute).href
        : relative.split(path.sep).map(segment => encodeURIComponent(segment)).join('/');
      return {
        ruleId,
        level: levelFor[v.severity] || 'warning',
        message: { text: `${v.resource}: ${v.issue}` },
        locations: [{
          physicalLocation: {
            artifactLocation: { uri },
            region: { startLine: Math.max(1, Number(v.line) || 1) }
          }
        }],
        properties: { severity: v.severity, frameworks: v.frameworks, autoFixable: Boolean(v.autoFixable) }
      };
    });

    return {
      $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
      version: '2.1.0',
      runs: [{
        tool: {
          driver: {
            name: 'grc-engineer scan-iac',
            informationUri: 'https://github.com/GRCEngClub/claude-grc-engineering',
            rules: [...rules.values()]
          }
        },
        results
      }]
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

      const siblings = terraformFilesIn(path.dirname(file)).filter(f => f.file !== file).map(f => f.content);

      for (const fix of fixes) {
        const fixed = applyTerraformFix(content, fix, siblings);
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


function applyTerraformFix(content, fix, siblings) {
  if (fix.attribute) {
    return setTopLevelAttribute(content, fix.resourceType, fix.resourceName, fix.attribute, fix.value);
  }
  const moduleContent = [content, ...siblings].join('\n');
  const coverage = companionCoverage(moduleContent, fix.companion, fix.resourceName);
  if (coverage.resources.length > 0 || coverage.unresolved.length > 0) return content;
  const bucket = terraformResources(content).find(r => r.type === 'aws_s3_bucket' && r.name === fix.resourceName);
  if (!bucket) return content;

  const taken = new Set(terraformResources(moduleContent).filter(r => r.type === fix.companion).map(r => r.name));
  const block = [
    `resource "${fix.companion}" "${unusedLabel(fix.resourceName, taken)}" {`,
    ...bucketReference(content, bucket),
    '',
    ...S3_COMPANION_SETTINGS[fix.companion],
    '}'
  ].join('\n');
  return appendResource(content, block);
}

function bucketReference(content, bucket) {
  if (resourceAttribute(content, bucket, 'for_each') !== null) {
    return [`  for_each = aws_s3_bucket.${bucket.name}`, '  bucket   = each.value.id'];
  }
  if (resourceAttribute(content, bucket, 'count') !== null) {
    return [`  count  = length(aws_s3_bucket.${bucket.name})`, `  bucket = aws_s3_bucket.${bucket.name}[count.index].id`];
  }
  return [`  bucket = aws_s3_bucket.${bucket.name}.id`];
}

function unusedLabel(preferred, taken) {
  if (!taken.has(preferred)) return preferred;
  let suffix = 2;
  while (taken.has(`${preferred}_${suffix}`)) suffix++;
  return `${preferred}_${suffix}`;
}

function terraformFilesIn(dir) {
  return fs.readdirSync(dir)
    .filter(name => name.endsWith('.tf'))
    .map(name => path.join(dir, name))
    .filter(file => fs.statSync(file).isFile())
    .map(file => ({ file, content: fs.readFileSync(file, 'utf8') }));
}

function addresses(resources) {
  return resources.map(r => `${r.type}.${r.name}`).join(', ');
}

function booleanSettingIssue(attributeOf, attribute, { severity, issue, remediation }) {
  const value = withoutWrappingParentheses(attributeOf(attribute));
  if (value === 'true') return null;
  if (value === null || value === 'false') {
    return { check: attribute, severity, issue, remediation, autoFixable: true, fix: { attribute, value: 'true' } };
  }
  return {
    check: `${attribute}-unresolved`,
    severity,
    issue: `${issue}: ${attribute} is set by an expression this scanner cannot resolve`,
    remediation: `Confirm ${attribute} evaluates to true`,
    autoFixable: false
  };
}

function withoutWrappingParentheses(value) {
  let inner = value;
  while (inner !== null && /^\([^()]*\)$/.test(inner)) {
    inner = inner.slice(1, -1).trim();
  }
  return inner;
}

function s3ProtectionIssue(moduleContent, companionType, bucketName) {
  const protection = S3_PROTECTIONS[companionType];
  const { resources, unresolved } = companionCoverage(moduleContent, companionType, bucketName);

  if (resources.some(resource => protection.enabled(moduleContent, resource))) return null;
  const check = companionType.replace(/^aws_s3_bucket_/, '');
  if (resources.length > 0) {
    return {
      check: `${check}-disabled`,
      help: protection.disabledRemediation,
      severity: protection.severity,
      issue: protection.disabledIssue,
      remediation: `${protection.disabledRemediation} in ${addresses(resources)}`,
      autoFixable: false
    };
  }
  if (unresolved.length > 0) {
    return {
      check: `${check}-unresolved`,
      help: 'Confirm the companion resource targets this bucket, or reference the bucket directly',
      severity: protection.severity,
      issue: `${protection.missingIssue}: ${addresses(unresolved)} refers to this bucket through an expression this scanner cannot resolve`,
      remediation: `Confirm ${addresses(unresolved)} targets this bucket, or reference it directly`,
      autoFixable: false
    };
  }
  return {
    check: `${check}-missing`,
    severity: protection.severity,
    issue: protection.missingIssue,
    remediation: protection.missingRemediation,
    autoFixable: true,
    fix: { companion: companionType }
  };
}

const UNPARSED_RESOURCE = { attribute: () => null, hasBlock: () => false };

const PUBLIC_ACCESS_FLAGS = ['block_public_acls', 'block_public_policy', 'ignore_public_acls', 'restrict_public_buckets'];

const S3_PROTECTIONS = {
  aws_s3_bucket_server_side_encryption_configuration: {
    severity: 'HIGH',
    missingIssue: 'S3 bucket does not have server-side encryption enabled',
    missingRemediation: 'Add an aws_s3_bucket_server_side_encryption_configuration resource with AES256 or aws:kms algorithm',
    disabledIssue: 'S3 bucket encryption configuration does not set a recognised sse_algorithm; encryption is unverified',
    disabledRemediation: 'Set sse_algorithm to AES256 or aws:kms',
    enabled: (content, resource) => blockAttributeValues(content, resource, ['rule', 'apply_server_side_encryption_by_default'], 'sse_algorithm')
      .some(value => ['"AES256"', '"aws:kms"', '"aws:kms:dsse"'].includes(value))
  },
  aws_s3_bucket_versioning: {
    severity: 'MEDIUM',
    missingIssue: 'S3 bucket versioning is not enabled',
    missingRemediation: 'Add an aws_s3_bucket_versioning resource for data protection and recovery',
    disabledIssue: 'S3 bucket versioning is configured but its status is not "Enabled"',
    disabledRemediation: 'Set status = "Enabled"',
    enabled: (content, resource) => blockAttributeValues(content, resource, ['versioning_configuration'], 'status')
      .some(value => value === '"Enabled"')
  },
  aws_s3_bucket_public_access_block: {
    severity: 'HIGH',
    missingIssue: 'S3 bucket does not have public access blocks configured',
    missingRemediation: 'Add aws_s3_bucket_public_access_block resource',
    disabledIssue: 'S3 bucket public access block does not set all four flags to true',
    disabledRemediation: `Set ${PUBLIC_ACCESS_FLAGS.join(', ')} to true`,
    enabled: (content, resource) => PUBLIC_ACCESS_FLAGS.every(flag => resourceAttribute(content, resource, flag) === 'true')
  }
};

const S3_COMPANION_SETTINGS = {
  aws_s3_bucket_server_side_encryption_configuration: [
    '  rule {',
    '    apply_server_side_encryption_by_default {',
    '      sse_algorithm = "AES256"',
    '    }',
    '  }'
  ],
  aws_s3_bucket_versioning: [
    '  versioning_configuration {',
    '    status = "Enabled"',
    '  }'
  ],
  aws_s3_bucket_public_access_block: [
    '  block_public_acls       = true',
    '  block_public_policy     = true',
    '  ignore_public_acls      = true',
    '  restrict_public_buckets = true'
  ]
};

// The CLI entry point sits at the bottom of the module so every constant above it
// (S3_PROTECTIONS and friends) is initialized before a scan runs.
// `process.argv[1]` is undefined under `node --eval` and some embedders, where
// pathToFileURL would throw; treat those as non-CLI rather than crashing on import.
if (process.argv[1] !== undefined && import.meta.url === (() => { try { return pathToFileURL(realpathSync(process.argv[1])).href; } catch { return null; } })()) {
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
    } else if (outputFormat === 'sarif') {
      console.log(JSON.stringify(scanner.toSarif(report), null, 2));
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
      // stderr keeps machine-readable stdout clean when --fix is combined with json/sarif.
      console.error('\nApplying auto-fixes...');
      scanner.applyFixes().then(count => {
        console.error(`Applied ${count} fixes. Re-run scan to verify.`);
      });
    }
  });
}

export default IaCScanner;
