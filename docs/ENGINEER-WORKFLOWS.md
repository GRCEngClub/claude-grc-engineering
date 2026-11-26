# engineer workflows

A walkthrough of the `engineer` plugin's main workflows: cross-framework mapping, code generation, IaC scanning, control testing, continuous monitoring, and access review triage. Each command's own file under `plugins/personas/engineer/commands/` is the reference for its options; this page shows how they fit together.

Sample output in this guide is illustrative.

## Cross-Framework Intelligence

The engineer plugin includes advanced cross-framework intelligence capabilities that reduce implementation effort by 56% on average.

### Key Features

**Control Crosswalk Database** (`plugins/personas/engineer/config/control-crosswalk.yaml`):

- Maps 300+ controls across 7+ frameworks (SOC2, PCI-DSS, NIST, ISO, CIS, CMMC, FedRAMP)
- Identifies "implement once, satisfy many" opportunities
- Documents conflicting requirements and resolutions
- Provides multi-cloud implementation patterns

**Cross-Framework Analysis Script** (`plugins/personas/engineer/scripts/cross-framework-analyzer.js`):

- Node.js module for analyzing control overlaps
- Parses YAML crosswalk database
- Calculates optimization tiers (Tier 1: satisfies 4+ frameworks, Tier 2: 3 frameworks, etc.)
- Generates implementation roadmaps with effort estimates

### Commands

1. **`/engineer:map-controls-unified <control>`**
   - Maps a single control across ALL frameworks
   - Shows framework equivalencies (e.g., NIST AC-2 = ISO A.5.16 = SOC2 CC6.1)
   - Identifies conflicts and resolutions
   - Provides cloud implementation patterns

2. **`/engineer:find-conflicts <frameworks> [detail-level]`**
   - Analyzes conflicting requirements across selected frameworks
   - Categorizes by severity (high/medium/low)
   - Provides resolution strategies ("most restrictive wins")
   - Example: `find-conflicts SOC2,PCI-DSS,NIST detailed`

3. **`/engineer:optimize-multi-framework <frameworks> [format]`**
   - Generates optimization roadmap showing effort reduction
   - Categorizes controls into 4 tiers by ROI
   - Provides phased implementation plan
   - Shows quick wins (high value, low effort)
   - Formats: roadmap (default), matrix (CSV), summary
   - Example: `optimize-multi-framework SOC2,PCI-DSS,NIST,ISO`

### Optimization Results

Typical multi-framework optimization (SOC2 + PCI-DSS + NIST + ISO):

- **Without optimization**: 815 controls × 8 hours = 6,520 hours
- **With optimization**: 362 unique controls = 2,896 hours
- **Savings**: 3,624 hours (56%) = ~$543,600 at $150/hour

**Tier Breakdown**:

- Tier 1 (4+ frameworks): 87 controls, 40% coverage, 4× ROI
- Tier 2 (3 frameworks): 124 controls, +35% coverage, 3× ROI
- Tier 3 (2 frameworks): 89 controls, +17% coverage, 2× ROI
- Tier 4 (framework-specific): 62 controls, +8% coverage, 1× ROI

### Example Usage

```bash
# Understand cross-framework control mapping
/engineer:map-controls-unified access_control_account_management

# Identify conflicts between 3 frameworks
/engineer:find-conflicts SOC2,PCI-DSS,NIST

# Generate optimization roadmap for 4 frameworks
/engineer:optimize-multi-framework SOC2,PCI-DSS,NIST,ISO roadmap

# Export control matrix as CSV
/engineer:optimize-multi-framework SOC2,PCI-DSS,NIST matrix

# Generate implementation code
/engineer:generate-implementation access_control_account_management aws

# Scan infrastructure for violations
/engineer:scan-iac ./terraform SOC2,PCI-DSS,NIST detailed --fix

# Test control effectiveness
/engineer:test-control access_control_account_management aws

# Set up continuous monitoring
/engineer:monitor-continuous SOC2,PCI-DSS,NIST daily --slack-webhook=URL
```

### Extending the Crosswalk

To add new controls to the crosswalk database:

1. Edit `plugins/personas/engineer/config/control-crosswalk.yaml`
2. Add control with framework mappings:

```yaml
controls:
  my_new_control:
    name: Descriptive Control Name
    category: Security Category

    nist_800_53: [AC-X, AC-X(1)]
    iso_27001: [A.X.Y.Z]
    soc2: [CC.X]
    pci_dss: [X.Y]

    common_requirements:
      - Requirement 1
      - Requirement 2

    conflicts:
      - name: Conflict Description
        framework1: "Requirement text"
        framework2: "Different requirement text"
        resolution: "How to resolve"

    cloud_implementation:
      aws: |
        Implementation guidance for AWS
      azure: |
        Implementation guidance for Azure
```

3. Test with:

```bash
node plugins/personas/engineer/scripts/cross-framework-analyzer.js map my_new_control
```

## Code Generation & IaC Scanning

The engineer plugin includes production-ready code generation and infrastructure scanning capabilities.

### Code Generation

**Command**: `/engineer:generate-implementation <control> <cloud-provider> [output-dir]`

Generates complete implementation packages including:

- **Terraform modules**: Production-ready IaC with best practices
- **Python scripts**: Evidence collection, compliance testing, automation
- **Monitoring dashboards**: CloudWatch, Azure Monitor, or Google Cloud Monitoring
- **Documentation**: Implementation guides, evidence procedures, framework mappings

**Example Output** (for `access_control_account_management` on AWS):

```
generated/
├── terraform/
│   ├── main.tf (300 lines)       # IAM lifecycle, CloudTrail, Access Analyzer
│   ├── variables.tf               # Configurable parameters
│   ├── outputs.tf                 # Resource outputs
│   └── providers.tf               # AWS provider config
├── scripts/
│   ├── evidence_collect.py        # Automated evidence collection
│   ├── compliance_test.py         # Validation tests
│   └── deploy.sh                  # Deployment automation
├── monitoring/
│   └── dashboard.json             # CloudWatch dashboard
└── docs/
    ├── IMPLEMENTATION.md          # Complete deployment guide
    ├── EVIDENCE.md                # Collection procedures
    └── FRAMEWORKS.md              # Framework requirement mappings
```

**Cloud Provider Support**:

- `aws` - AWS with CloudTrail, IAM, KMS, CloudWatch
- `azure` - Azure with Entra ID, Key Vault, Monitor
- `gcp` - GCP with Cloud IAM, KMS, Logging
- `kubernetes` - K8s with RBAC, NetworkPolicy, Pod Security Admission

**Usage Example**:

```bash
# Generate for AWS
/engineer:generate-implementation encryption_at_rest aws ./compliance

# Output includes:
# - S3 bucket encryption configuration
# - KMS key setup with rotation
# - EBS encryption defaults
# - RDS encryption settings
# - Evidence collection scripts
```

### IaC Scanning

**Command**: `/engineer:scan-iac <directory> <frameworks> [format] [options]`

**Script**: `plugins/personas/engineer/scripts/scan-iac.js`

Scans existing infrastructure code for compliance violations:

**Supported Formats**:

- Terraform (`.tf` files)
- CloudFormation (`.yaml`, `.json`)
- Kubernetes (`.yaml` manifests)
- Azure ARM templates (`.json`)

**Compliance Checks**:

- **Encryption at Rest**: S3, EBS, RDS encryption configuration
- **Logging & Monitoring**: CloudTrail, VPC Flow Logs, retention periods
- **Network Security**: Security groups, overly permissive rules
- **Access Control**: IAM policies, least privilege violations
- **Data Protection**: S3 versioning, public access blocks

**Output Formats**:

- `detailed` - Full analysis with remediation code (default)
- `summary` - Quick compliance score and top issues
- `json` - Machine-readable for CI/CD
- `sarif` - GitHub Security / GitLab integration

**Auto-Fix Mode**:

```bash
/engineer:scan-iac ./terraform SOC2,PCI-DSS --fix
```

Automatically remediates:

- ✓ Missing S3 bucket encryption
- ✓ Missing S3 versioning
- ✓ Missing S3 public access blocks
- ✓ Unencrypted EBS volumes and RDS storage
- ✓ CloudTrail multi-region and log file validation
- ✗ S3 protection that exists but is switched off, and settings given as expressions (requires manual review)
- ✗ Security group rules (requires manual review)
- ✗ IAM policies (security sensitive)

**CI/CD Integration**:

GitHub Actions:

```yaml
# The job needs `permissions: { actions: read, contents: read, security-events: write }`; .grc is a checkout of this repo
- name: Scan Infrastructure
  run: node .grc/plugins/personas/engineer/scripts/scan-iac.js ./terraform SOC2,PCI-DSS,NIST sarif > results.sarif

- name: Upload Results
  uses: github/codeql-action/upload-sarif@v4
  with:
    sarif_file: results.sarif
```

The full workflow is in `plugins/personas/engineer/skills/scan-iac/SKILL.md`.

**Severity Levels**:

- 🔴 CRITICAL: Immediate violation, blocks audit
- 🟡 HIGH: Serious gap, fix before audit
- 🟠 MEDIUM: Important improvement
- 🔵 LOW: Best practice recommendation

**Example Scan Output**:

```
Scan Target: ./terraform
Frameworks: SOC2, PCI-DSS, NIST 800-53
Files Scanned: 23

Compliance: 73% (42/57 controls)

Violations:
  🔴 HIGH (3):
    - S3 bucket encryption missing (s3_buckets.tf:12)
    - CloudTrail retention too short (cloudtrail.tf:8)
    - Security group too permissive (security_groups.tf:24)

  🟡 MEDIUM (5):
    - Missing patch management configuration
    - Root account MFA not verified
    ...

Auto-fix available for 8/15 violations
```

### Implementation Workflow

**1. Design Phase**:

```bash
# Understand requirements across frameworks
/engineer:map-controls-unified access_control_account_management

# Identify conflicts
/engineer:find-conflicts SOC2,PCI-DSS,NIST

# Get optimization roadmap
/engineer:optimize-multi-framework SOC2,PCI-DSS,NIST
```

**2. Implementation Phase**:

```bash
# Generate production-ready code
/engineer:generate-implementation access_control_account_management aws ./output

# Review and customize
cd ./output/terraform
terraform init
terraform plan
```

**3. Validation Phase**:

```bash
# Scan for compliance violations
/engineer:scan-iac ./terraform SOC2,PCI-DSS,NIST detailed

# Apply fixes
/engineer:scan-iac ./terraform SOC2,PCI-DSS,NIST --fix

# Verify compliance
/engineer:scan-iac ./terraform SOC2,PCI-DSS,NIST summary
```

**4. Evidence Collection**:

```bash
# Collect compliance evidence
cd ./output/scripts
python evidence_collect.py ./evidence/2025-Q1
```

## Control Testing & Monitoring

The engineer plugin includes automated control testing and continuous monitoring to ensure controls remain effective over time.

### Control Testing

**Command**: `/engineer:test-control <control-id> [cloud-provider] [options]`

**Script**: `plugins/personas/engineer/scripts/test-control.js`

Validates that security controls are properly implemented and effective:

**Test Categories**:

1. **Configuration Tests**: Resources exist and configured correctly
2. **Functionality Tests**: Controls are active and working
3. **Compliance Tests**: Meet framework requirements
4. **Integration Tests**: Work with other controls

**Example Test Run** (`access_control_account_management` on AWS):

```
Total Tests: 15
✓ Passed: 11 (73%)
✗ Failed: 2 (13%)
⚠ Warnings: 2 (13%)

FAILURES:
- Access review overdue (190 days; PCI DSS 7.2.4 requires at least every six months)
- Access review policy documentation outdated

FRAMEWORK COMPLIANCE:
NIST 800-53: ⚠ PARTIALLY COMPLIANT
ISO 27001:   ⚠ PARTIALLY COMPLIANT
SOC2:        ⚠ PARTIALLY COMPLIANT
PCI-DSS:     ✗ NON-COMPLIANT (six-month access review requirement 7.2.4 missed)

Status: PARTIALLY EFFECTIVE
Remediation: Run python scripts/access_review.py --immediate
```

**Test Types by Control**:

**Access Control** (15 tests):

- ✓ Unique user IDs
- ✓ Access approval process
- ✗ Periodic access reviews (schedule/execution)
- ✓ Automated provisioning
- ✓ Least privilege (permissions boundaries)
- ✓ CloudTrail logging active
- ⚠ Inactive user detection (>90 days)
- ✓ Access Analyzer enabled
- ✓ MFA enforcement
- ✓ Audit trail integrity
- ✓ Log retention period (365 days)
- ✓ Separation of duties
- ✓ Evidence availability
- ✗ Documentation currency
- ✓ End-to-end lifecycle

**Encryption at Rest** (tests):

- S3 bucket encryption
- EBS volume encryption
- RDS database encryption
- KMS key rotation enabled

**Logging & Monitoring** (tests):

- CloudTrail configuration
- VPC Flow Logs
- Log retention compliance
- CloudWatch alarms

**Output Formats**:

- `text` - Detailed human-readable (default)
- `json` - Machine-readable for CI/CD
- `--verbose` - Include all test details
- `--fix-failures` - Auto-remediate where possible

**CI/CD Integration**:

```yaml
- name: Test Access Control
  run: /engineer:test-control access_control_account_management --output=json > results.json

- name: Check Pass Rate
  run: |
    PASS_RATE=$(jq '.summary.pass_rate' results.json)
    if (( $(echo "$PASS_RATE < 0.90" | bc -l) )); then
      exit 1
    fi
```

### Continuous Monitoring

**Command**: `/engineer:monitor-continuous <frameworks> [schedule] [options]`

Establishes continuous compliance monitoring with:

**Features**:

1. **Automated Testing**: Runs control tests on schedule (daily, weekly, hourly)
2. **Trend Analysis**: 30-day compliance trends with degradation detection
3. **Alerting**: Slack, email, or PagerDuty integration
4. **Dashboard**: Real-time compliance status visualization

**Example Monitoring Output**:

```
COMPLIANCE TREND (Last 30 Days):
Jan 1:  95% ████████████████████░
Jan 8:  94% ████████████████████░  ⚠ -1%
Jan 15: 94% ████████████████████░  → Stable
Jan 22: 96% █████████████████████  ✓ +2%
Jan 28: 96% █████████████████████  → Stable

Trend: ↗ IMPROVING (+1% this month)

CURRENT STATUS:
Overall: 96% (144/150 controls)

By Framework:
  SOC2:       98% ████████████████████░
  PCI-DSS:    92% ███████████████████░░
  NIST 800-53: 98% ████████████████████░

RECENT FAILURES:
🔴 HIGH: AU-11 (Audit Retention) - S3 lifecycle misconfigured
🟡 MED: AC-2 (Account Mgmt) - 3 inactive users detected

CONTROL HEALTH:
🟢 HEALTHY: 138 controls (30-day pass rate >95%)
🟡 DEGRADING: SI-2 (Vuln Mgmt) - 93% → 87% (-6%)
🔴 AT RISK: AU-11 (Audit Retention) - 73% pass rate
```

**Alerting Rules**:

- 🚨 **Critical**: Compliance <80%, control fails 2+ days, PCI <90%
- ⚠ **Warning**: Compliance 80-90%, degrading controls (-5% in 7 days)
- ℹ **Info**: Weekly summary, trending analysis

**Setup**:

```yaml
# compliance-monitor.yaml
frameworks: [SOC2, PCI-DSS, NIST-800-53]
schedule:
  full_test: "0 2 * * *"      # Daily 2 AM
  quick_check: "0 */6 * * *"  # Every 6 hours

alerts:
  slack:
    webhook_url: "https://hooks.slack.com/..."
    channel: "#security-alerts"
  email:
    recipients: [security@company.com]

thresholds:
  critical: 0.80  # Alert if <80%
  warning: 0.90   # Warn if <90%
```

**Metrics Tracked**:

- Compliance score (% passing controls)
- Framework scores (individual)
- Control health (30-day pass rate)
- Test execution time
- Failure rate
- Remediation time
- Evidence coverage

**Dashboard Features**:

- Real-time compliance status
- 30-day trend visualization
- Control health indicators (green/yellow/red)
- Framework comparison
- Recent failures with remediation
- Alert history

### Complete Workflow (All 3 Phases)

**Phase 1 - Design**:

```bash
/engineer:map-controls-unified access_control_account_management
/engineer:find-conflicts SOC2,PCI-DSS,NIST
/engineer:optimize-multi-framework SOC2,PCI-DSS,NIST,ISO
```

**Phase 2 - Implement**:

```bash
/engineer:generate-implementation access_control_account_management aws
cd generated/terraform && terraform apply
/engineer:scan-iac ./terraform SOC2,PCI-DSS,NIST --fix
```

**Phase 3 - Validate & Monitor**:

```bash
/engineer:test-control access_control_account_management aws
/engineer:monitor-continuous SOC2,PCI-DSS,NIST daily
```

This provides end-to-end compliance automation:

1. **Understand** requirements across frameworks (crosswalk)
2. **Optimize** implementation (56% effort reduction)
3. **Generate** production code (Terraform, scripts)
4. **Scan** existing infrastructure (violations + fixes)
5. **Test** control effectiveness (config, functionality, compliance)
6. **Monitor** continuously (trends, alerts, dashboard)

## Access Review Triage

The engineer plugin includes an `access-review-triage` skill for teams running quarterly user access reviews (UARs) out of spreadsheets — the common shape for orgs without a dedicated IGA tool (Sailpoint, Saviynt, Okta Access Certifications).

Lives at `plugins/personas/engineer/skills/access-review-triage/SKILL.md`. The skill takes a CSV or JSON access export (Okta, Entra ID, AWS IAM, GitHub, or generic) plus optional HR list, SoD config, and prior-cycle decisions, then walks 10 ordered decision rules to tag each row:

- Rule 1: terminated user with active access → Investigate (P0)
- Rule 2: separation-of-duty conflict → Investigate (P0)
- Rule 3: dormant admin (last_login > 90 days) → Investigate (P1)
- Rule 4: dormant non-privileged user → Revoke (suggested)
- Rule 5: service / shared account in human review → Investigate (P1)
- Rule 6: role-vs-title mismatch → Manager confirm
- Rule 7: new since last cycle → Manager confirm
- Rule 8: privileged role (catch-all) → Manager confirm
- Rule 9: unchanged since last cycle → Auto-certify
- Rule 10: default → Manager confirm

Output is four artifacts in `~/.cache/claude-grc/access-reviews/<system>-<YYYY-QN>/`: `triage.md` (human-readable report), `decisions.csv` (machine-readable per-row recommendations), `manager-emails/<manager>.md` (drafted confirmation emails), and `evidence.json` (audit-binder packet with control mappings to SOC 2 CC6.1/CC6.2, PCI 7-8, ISO A.5.15, A.5.16, A.5.18, A.8.2, and A.5.3 for separation-of-duty conflicts, NIST AC-2).

The skill never auto-revokes — every recommendation is a draft for human review. It refuses to run for orgs that already have an IGA tool unless `--force` is passed.

## Multi-Cloud Support

The engineer plugin supports evidence collection across:

- **AWS**: boto3, aws CLI (IAM, S3, CloudTrail)
- **Azure**: azure-* SDKs, az CLI (AD, Storage, Monitor)
- **GCP**: google-cloud-* SDKs, gcloud CLI (IAM, Storage, Logging)
- **Kubernetes**: kubectl, kubernetes SDK

## Configuration file patterns

Framework and provider configuration for `engineer` lives in `plugins/personas/engineer/config/`.

**Framework configs** (`config/frameworks/*.yaml`):

```yaml
controls:
  CC6.1:
    title: Logical and Physical Access Controls
    keywords: [iam, access control, authentication]
```

**Provider templates** (`config/providers/*.yaml`):

```yaml
templates:
  mfa_root:
    keywords: [mfa, root]
    formats:
      python: |
        import boto3
        # Evidence collection script
      bash: |
        aws iam get-account-summary
```
