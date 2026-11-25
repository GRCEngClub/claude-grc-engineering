---
description: Scan Infrastructure as Code for compliance violations
---

# Scan IaC

Scans Infrastructure as Code (Terraform, CloudFormation, Kubernetes) for compliance violations and provides automated remediation suggestions.

## Usage

```bash
/grc-engineer:scan-iac <directory> <frameworks> [options]
```

## Arguments

- `$1` - Directory to scan (e.g., `./terraform`, `./k8s`)
- `$2` - Comma-separated frameworks (e.g., `SOC2,PCI-DSS,NIST`)
- `$3` - Output format (optional): `detailed`, `summary`, `json`, `sarif` (default: `detailed`)
- `$4` - Options (optional): `--fix`, `--severity=high`, `--exclude=test/`

## Supported IaC Formats

- **Terraform** (`.tf` files)
- **CloudFormation** (`.yaml`, `.json` templates)
- **Kubernetes** (`.yaml` manifests)
- **Azure ARM** (`.json` templates)
- **Pulumi** (`.yaml` stack files)

## Examples

```bash
# Scan Terraform directory for multiple frameworks
/grc-engineer:scan-iac ./terraform SOC2,PCI-DSS,NIST detailed

# Quick summary scan
/grc-engineer:scan-iac ./infrastructure ISO,GDPR summary

# Scan with auto-fix
/grc-engineer:scan-iac ./terraform PCI-DSS detailed --fix

# High severity issues only
/grc-engineer:scan-iac ./k8s SOC2,NIST summary --severity=high

# Export SARIF for CI/CD integration
/grc-engineer:scan-iac ./terraform SOC2,PCI-DSS sarif
```

## Output Format

### Detailed Mode

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IAC COMPLIANCE SCAN RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Scan Target: ./terraform
Frameworks: SOC2, PCI-DSS, NIST 800-53
Files Scanned: 23 (15 .tf, 5 .yaml, 3 .json)
Scan Duration: 4.2s

SUMMARY:
  ✓ Satisfied: 42 controls (73%)
  ✗ Violations: 8 controls (14%)
  ⚠ Partial: 7 controls (12%)
  ℹ Recommendations: 12

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIOLATIONS (8)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 HIGH SEVERITY (3)

[1] Encryption at Rest - Missing S3 Bucket Encryption
    Frameworks: SOC2 CC6.7, PCI-DSS 3.4, NIST SC-28
    File: terraform/s3_buckets.tf:12
    Resource: aws_s3_bucket.data

    Issue:
    S3 bucket does not have server-side encryption enabled.
    This violates encryption at rest requirements for all
    three frameworks.

    Current Configuration:
    ```hcl
    resource "aws_s3_bucket" "data" {
      bucket = "customer-data-bucket"

      # Missing encryption configuration
    }
    ```

    ✓ Remediation:
    Add server-side encryption configuration:

    ```hcl
    resource "aws_s3_bucket" "data" {
      bucket = "customer-data-bucket"

      # Required for SOC2 CC6.7, PCI 3.4, NIST SC-28
      server_side_encryption_configuration {
        rule {
          apply_server_side_encryption_by_default {
            sse_algorithm = "AES256"  # or "aws:kms" for PCI
          }
        }
      }
    }
    ```

    Auto-fix available: Run with --fix flag

[2] Audit Logging - CloudTrail Retention Too Short
    Frameworks: SOC2 CC7.3, PCI-DSS 10.7, NIST AU-11
    File: terraform/cloudtrail.tf:8
    Resource: aws_cloudtrail.audit

    Issue:
    CloudTrail log retention is set to 90 days, but PCI-DSS
    requires 1 year minimum (365 days).

    Current Configuration:
    ```hcl
    resource "aws_cloudtrail" "audit" {
      name           = "audit-trail"
      s3_bucket_name = aws_s3_bucket.logs.id

      # Retention too short
      event_selector {
        ...
      }
    }

    resource "aws_s3_bucket_lifecycle_configuration" "logs" {
      rule {
        expiration {
          days = 90  # ✗ TOO SHORT
        }
      }
    }
    ```

    ✓ Remediation:
    Update lifecycle rule to 365 days:

    ```hcl
    resource "aws_s3_bucket_lifecycle_configuration" "logs" {
      bucket = aws_s3_bucket.logs.id

      rule {
        id     = "retention"
        status = "Enabled"

        # Keep online for 6 months
        transition {
          days          = 180
          storage_class = "GLACIER"
        }

        # Total retention: 1 year (PCI/SOC2 requirement)
        expiration {
          days = 365  # ✓ COMPLIANT
        }
      }
    }
    ```

[3] Network Security - Security Group Too Permissive
    Frameworks: PCI-DSS 1.2, NIST SC-7, SOC2 CC6.6
    File: terraform/security_groups.tf:24
    Resource: aws_security_group.web

    Issue:
    Security group allows unrestricted SSH access (0.0.0.0/0:22).
    Violates least privilege and network segmentation requirements.

    Current Configuration:
    ```hcl
    resource "aws_security_group" "web" {
      ingress {
        from_port   = 22
        to_port     = 22
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]  # ✗ TOO PERMISSIVE
      }
    }
    ```

    ✓ Remediation:
    Restrict SSH to specific IP ranges:

    ```hcl
    resource "aws_security_group" "web" {
      ingress {
        description = "SSH from corporate VPN only"
        from_port   = 22
        to_port     = 22
        protocol    = "tcp"
        cidr_blocks = ["10.0.0.0/8"]  # ✓ RESTRICTED
      }
    }
    ```

    Or remove SSH entirely and use AWS Systems Manager Session Manager.

🟡 MEDIUM SEVERITY (5)

[4] Vulnerability Management - Missing Patch Management
    Frameworks: NIST SI-2, PCI-DSS 6.2
    File: terraform/ec2_instances.tf:45

    Issue: No AWS Systems Manager Patch Manager configuration detected.

    ✓ Remediation:
    Add patch baseline and maintenance window:
    ```hcl
    resource "aws_ssm_patch_baseline" "compliance" {
      name             = "compliance-baseline"
      operating_system = "AMAZON_LINUX_2"

      approval_rule {
        approve_after_days = 7
        compliance_level   = "CRITICAL"
        patch_filter {
          key    = "CLASSIFICATION"
          values = ["Security"]
        }
      }
    }

    resource "aws_ssm_maintenance_window" "patching" {
      name     = "critical-patching"
      schedule = "cron(0 2 ? * SUN *)"  # Weekly
      duration = 3
      cutoff   = 1
    }
    ```

[5] Access Control - Missing MFA for Root Account
    Frameworks: NIST IA-2(1), PCI-DSS 8.3, SOC2 CC6.1

    Issue: No evidence of MFA enforcement for root account.

    ✓ Remediation:
    Enable MFA manually (cannot be automated via Terraform):
    1. Log in to AWS Console as root
    2. Navigate to IAM > Security Credentials
    3. Activate MFA

    Verify with:
    ```bash
    aws iam get-account-summary | jq '.SummaryMap.AccountMFAEnabled'
    ```

... (3 more medium severity violations)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTIAL COMPLIANCE (7)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠ [8] Encryption at Rest - KMS Rotation Not Enabled
   Frameworks: NIST SC-12, PCI-DSS 3.6
   File: terraform/kms.tf:5

   Status: Partial
   Current: KMS key exists but rotation disabled
   Required: Annual key rotation enabled

   ✓ Fix:
   ```hcl
   resource "aws_kms_key" "compliance" {
     description             = "Compliance encryption key"
     enable_key_rotation     = true  # ✓ Add this
   }
   ```

... (6 more partial compliance issues)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SATISFIED CONTROLS (42)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ SOC2 CC6.1 - IAM users configured with unique IDs
✓ PCI-DSS 8.1.1 - Unique user IDs enforced
✓ NIST AC-2 - Account management automated
✓ SOC2 CC7.2 - CloudWatch Logs enabled
✓ PCI-DSS 10.2 - Audit trails configured
✓ NIST SC-7 - VPC boundary protection in place
✓ SOC2 CC6.6 - Network segmentation implemented
... (35 more)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDATIONS (12)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ Consider enabling AWS Config for continuous compliance monitoring
ℹ Add AWS GuardDuty for threat detection (SOC2 CC7.1)
ℹ Implement AWS Security Hub for centralized findings
ℹ Enable VPC Flow Logs for network monitoring (NIST AU-2)
ℹ Add resource tagging for better compliance tracking
... (7 more)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLIANCE SCORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall: 73% ████████████████████░░░░░░

By Framework:
  SOC2:       78% ████████████████████░░░░
  PCI-DSS:    65% ████████████████░░░░░░░░
  NIST 800-53: 76% ███████████████████░░░░

Critical Issues: 3 (MUST FIX for compliance)
High Priority:   5 (SHOULD FIX before audit)
Medium Priority: 7 (GOOD TO FIX)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Fix critical issues (3):
   - Add S3 bucket encryption
   - Extend CloudTrail retention to 365 days
   - Restrict security group rules

2. Apply automated fixes:
   /grc-engineer:scan-iac ./terraform SOC2,PCI-DSS,NIST detailed --fix

3. Validate fixes:
   /grc-engineer:scan-iac ./terraform SOC2,PCI-DSS,NIST summary

4. Generate compliance report:
   /grc-engineer:scan-iac ./terraform SOC2,PCI-DSS,NIST json > report.json

5. Collect evidence after remediation:
   /grc-engineer:collect-evidence <control-id> <provider>

```

### Summary Mode

```

IaC Compliance Scan: ./terraform
Frameworks: SOC2, PCI-DSS, NIST 800-53

Compliance: 73% (42/57 controls)

Issues:
  🔴 High:   3 (CRITICAL)
  🟡 Medium: 5
  ⚠ Partial: 7
  ✓ Passing: 42

Top Issues:

1. S3 encryption missing (affects 3 frameworks)
2. Log retention too short (PCI-DSS violation)
3. Security groups too permissive (network security)

Run with 'detailed' for full analysis.

```

### JSON Output (for CI/CD)

Progress lines go to stderr, so stdout holds only the report:

```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "directory": "./terraform",
  "frameworks": ["SOC2", "PCI-DSS", "NIST"],
  "filesScanned": 23,
  "summary": {
    "totalControls": 15,
    "satisfied": 11,
    "violations": 3,
    "partial": 1,
    "compliancePercentage": 73
  },
  "violations": [
    {
      "controlId": "encryption_at_rest",
      "controlName": "Encryption at Rest",
      "frameworks": ["SOC2 CC6.7", "PCI-DSS 3.4", "NIST SC-28"],
      "severity": "HIGH",
      "file": "terraform/s3_buckets.tf",
      "line": 12,
      "resource": "aws_s3_bucket.data",
      "issue": "S3 bucket does not have server-side encryption enabled",
      "remediation": "Add an aws_s3_bucket_server_side_encryption_configuration resource",
      "autoFixable": true
    }
  ],
  "recommendations": [],
  "complianceByFramework": {
    "SOC2": 0.8,
    "PCI-DSS": 0.6,
    "NIST": 0.8
  }
}
```

### SARIF Output (for GitHub code scanning)

Writes SARIF 2.1.0 with one result per violation. CRITICAL and HIGH map to `error`, MEDIUM to `warning`, and LOW to `note`; each distinct check gets its own rule (for example `data_protection/versioning-missing`) with its own help text and a `security-severity` score so GitHub can rank alerts. File paths are relative to the directory you run the scan from, so run it from the repository root.

```bash
/grc-engineer:scan-iac ./terraform SOC2,PCI-DSS sarif > results.sarif
```

## Auto-Fix Mode

```bash
/grc-engineer:scan-iac ./terraform SOC2,PCI-DSS detailed --fix
```

**Auto-fixes:**

- ✓ Add missing S3 bucket encryption
- ✓ Add missing S3 versioning
- ✓ Add missing S3 public access blocks
- ✓ Enable EBS volume encryption
- ✓ Enable RDS storage encryption
- ✓ Enable CloudTrail multi-region and log file validation
- ✗ Cannot auto-fix: S3 protection that exists but is switched off, such as suspended versioning (requires manual review)
- ✗ Cannot auto-fix: Settings given as expressions rather than literals, such as `encrypted = var.encrypt` (requires manual review)
- ✗ Cannot auto-fix: Security group rules (requires manual review)
- ✗ Cannot auto-fix: IAM policies (security sensitive)

Auto-fix applies to Terraform only. Generated S3 resources follow the bucket's `count` or `for_each`.

**Backup:** Creates `.tf.backup` files before modifications

## CI/CD Integration

### GitHub Actions

Slash commands only run inside Claude Code, so CI calls the scanner script directly from a checkout of this repository:

```yaml
name: IaC Compliance Scan

on: [pull_request]

permissions:
  contents: read
  security-events: write  # required by upload-sarif

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/checkout@v4
        with:
          repository: GRCEngClub/claude-grc-engineering
          path: .grc

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install scanner dependencies
        run: npm ci --prefix .grc --omit=dev

      - name: Scan Infrastructure
        run: |
          node .grc/plugins/grc-engineer/scripts/scan-iac.js ./terraform SOC2,PCI-DSS,NIST sarif > results.sarif
          node .grc/plugins/grc-engineer/scripts/scan-iac.js ./terraform SOC2,PCI-DSS,NIST json > scan-results.json

      - name: Upload Results
        uses: github/codeql-action/upload-sarif@v4
        with:
          sarif_file: results.sarif

      - name: Check Compliance Threshold
        run: |
          COMPLIANCE=$(jq '.summary.compliancePercentage' scan-results.json)
          if [ "$COMPLIANCE" -lt 90 ]; then
            echo "Compliance below 90%: $COMPLIANCE%"
            exit 1
          fi
```

### GitLab CI

GitLab's SAST report format is not SARIF, so keep the JSON report as a plain artifact and gate on its score:

```yaml
compliance_scan:
  stage: test
  image: node:22
  script:
    - git clone --depth 1 https://github.com/GRCEngClub/claude-grc-engineering.git .grc
    - npm ci --prefix .grc --omit=dev
    - node .grc/plugins/grc-engineer/scripts/scan-iac.js ./terraform SOC2,PCI-DSS,NIST json > scan-results.json
    - |
      node -e 'const r=require("./scan-results.json"); if (r.summary.compliancePercentage < 90) { console.error(`Compliance below 90%: ${r.summary.compliancePercentage}%`); process.exit(1); }'
  artifacts:
    when: always
    paths:
      - scan-results.json
```

## Severity Levels

- **🔴 CRITICAL**: Immediate compliance violation, blocks audit
- **🟡 HIGH**: Serious gap, should fix before audit
- **🟠 MEDIUM**: Important improvement, fix when possible
- **🔵 LOW**: Best practice recommendation
- **ℹ INFO**: Informational, no action required

## Supported Checks

### Encryption

- S3 bucket encryption
- EBS volume encryption
- RDS encryption at rest
- KMS key rotation
- TLS/SSL enforcement

### Access Control

- IAM policies (overly permissive)
- Security group rules
- S3 bucket policies
- Resource-based policies

### Logging & Monitoring

- CloudTrail configuration
- VPC Flow Logs
- Log retention periods
- CloudWatch alarms

### Network Security

- Security group egress/ingress
- Network ACLs
- VPC configuration
- Public exposure

### Data Protection

- S3 versioning
- Backup configurations
- Deletion protection
- Public access blocks

## Related Commands

- `/grc-engineer:generate-implementation` - Generate compliant IaC
- `/grc-engineer:map-controls-unified` - Understand framework requirements
- `/grc-engineer:find-conflicts` - Identify conflicting requirements
- `/grc-engineer:collect-evidence` - Collect compliance evidence
