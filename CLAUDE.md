# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the official open-source Claude Code plugin marketplace of the [GRC Engineering Club](https://grcengclub.com) for Governance, Risk, and Compliance (GRC) professionals. The repository provides 30 specialized plugins organized into:

- **4 persona-based plugins** (grc-engineer, grc-auditor, grc-internal, grc-tprm)
- **21 framework-specific plugins** (soc2, nist-800-53, iso27001, fedramp-rev5, fedramp-20x, pci-dss, cmmc, hitrust, cis-controls, gdpr, csa-ccm, nydfs, dora, stateramp, essential8, glba, us-export, pbmm, ismap, irap)
- **4 Tier-1 connector plugins** (aws-inspector, gcp-inspector, github-inspector, okta-inspector) that emit findings matching `schemas/finding.schema.json`
- **OSCAL tooling plugins** (oscal, fedramp-ssp) wrapping external upstream projects

Each plugin contains commands (user-facing) and skills (AI agents that implement functionality).

## Architecture

### Plugin Structure

All plugins follow this structure:

```
plugins/{plugin-name}/
├── .claude-plugin/
│   └── plugin.json              # Plugin metadata (name, version, author)
├── commands/                    # User-facing commands (markdown files)
│   └── {command-name}.md        # Command documentation and instructions
├── skills/                      # AI agents that implement functionality
│   └── {skill-name}/
│       └── SKILL.md            # Skill prompt and behavior definition
├── config/                      # Configuration files (grc-engineer only)
│   ├── frameworks/             # Framework control mappings (YAML)
│   └── providers/              # Cloud provider templates (AWS, Azure, GCP, K8s)
└── scripts/                     # Node.js implementation scripts (grc-engineer only)
    └── {command-name}.js       # Command logic
```

### Two Plugin Patterns

**1. Persona Plugins (grc-engineer, grc-auditor, grc-internal, grc-tprm)**

- Include `scripts/` directory with Node.js implementations
- Include `config/` directory with YAML configurations
- Commands invoke scripts: `node scripts/map-control.js $ARGUMENTS`

**2. Framework Plugins (soc2, nist-800-53, iso27001, etc.)**

- Command files are self-contained with embedded instructions
- No scripts or config directories
- Skills contain framework expertise as prompts

### Key Directories

- `.claude-plugin/marketplace.json` - Marketplace configuration listing all plugins
- `plugins/grc-engineer/config/frameworks/` - Framework control definitions (SOC2, ISO27001, NIST 800-53, etc.)
- `plugins/grc-engineer/config/providers/` - Cloud provider evidence collection templates (aws.yaml, azure.yaml, gcp.yaml, kubernetes.yaml)
- `docs/ENTERPRISE-DEPLOYMENT.md` - AWS Bedrock and Google Vertex AI configuration

## Plugin Development

### Adding a New Framework Plugin

Framework plugins are lightweight and follow this pattern:

1. Create directory: `plugins/frameworks/{framework-name}/`
2. Add plugin.json with metadata
3. Create commands as markdown files with instructions
4. Create skills with framework expertise
5. Register in `.claude-plugin/marketplace.json`

Example: See `plugins/frameworks/soc2/` or `plugins/frameworks/pci-dss/`

### Adding a New Command to grc-engineer

1. Create command file: `plugins/grc-engineer/commands/{command}.md`
2. Create script: `plugins/grc-engineer/scripts/{command}.js`
3. If needed, add framework config: `plugins/grc-engineer/config/frameworks/{framework}.yaml`
4. Create skill: `plugins/grc-engineer/skills/{skill-name}/SKILL.md`

### Configuration File Patterns

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

## Testing Plugins

### Local Testing

```bash
# Clone and run with local plugins
git clone https://github.com/GRCEngClub/claude-grc-engineering.git
claude --plugin-dir ./claude-grc-engineering
```

### Testing Specific Commands

```bash
# Test grc-engineer command
/grc-engineer:map-control main.tf SOC2

# Test framework command
/soc2:assess detailed

# Test evidence collection
/grc-engineer:collect-evidence CC6.1 AWS python
```

## Enterprise Deployment

This repository supports enterprise deployments via AWS Bedrock and Google Vertex AI. See `docs/ENTERPRISE-DEPLOYMENT.md` for:

- AWS Bedrock configuration (FedRAMP High in GovCloud)
- Google Vertex AI configuration (FedRAMP High as of October 2025)
- IAM permissions and authentication
- Compliance certifications (HIPAA, SOC 2)

Configuration via environment variables:

```bash
# AWS Bedrock
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1

# Google Vertex AI
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=us-east5
export ANTHROPIC_VERTEX_PROJECT_ID=your-project-id
```

## Marketplace Installation

Users install plugins via:

```bash
# Add marketplace (one-time)
/plugin marketplace add GRCEngClub/claude-grc-engineering

# Install specific plugins
/plugin install grc-engineer@grc-engineering-suite
/plugin install soc2@grc-engineering-suite
```

## Plugin Namespaces

Each plugin has a unique namespace for commands:

- `/grc-engineer:` - Technical compliance automation
- `/grc-auditor:` - Audit and assessment tools
- `/grc-internal:` - Internal GRC team tools
- `/grc-tprm:` - Third-party risk management
- `/soc2:` - SOC 2 expertise
- `/nist:` - NIST 800-53 controls
- `/iso:` - ISO 27001 ISMS
- `/fedramp-rev5:` - Traditional FedRAMP
- `/fedramp-20x:` - Modern FedRAMP with auto-sync
- `/pci-dss:` - PCI DSS v4.0.1
- `/us-export:` - US Export Controls (ITAR + EAR)
- `/pbmm:` - Canadian Protected B cloud
- `/ismap:` - Japanese government cloud
- `/irap:` - Australian government cloud
- (and 11 more framework plugins)

## Cross-Framework Intelligence (NEW)

The grc-engineer plugin now includes advanced cross-framework intelligence capabilities that reduce implementation effort by 56% on average.

### Key Features

**Control Crosswalk Database** (`plugins/grc-engineer/config/control-crosswalk.yaml`):

- Maps 300+ controls across 7+ frameworks (SOC2, PCI-DSS, NIST, ISO, CIS, CMMC, FedRAMP)
- Identifies "implement once, satisfy many" opportunities
- Documents conflicting requirements and resolutions
- Provides multi-cloud implementation patterns

**Cross-Framework Analysis Script** (`plugins/grc-engineer/scripts/cross-framework-analyzer.js`):

- Node.js module for analyzing control overlaps
- Parses YAML crosswalk database
- Calculates optimization tiers (Tier 1: satisfies 4+ frameworks, Tier 2: 3 frameworks, etc.)
- Generates implementation roadmaps with effort estimates

### New Commands

1. **`/grc-engineer:map-controls-unified <control>`**
   - Maps a single control across ALL frameworks
   - Shows framework equivalencies (e.g., NIST AC-2 = ISO A.9.2 = SOC2 CC6.1)
   - Identifies conflicts and resolutions
   - Provides cloud implementation patterns

2. **`/grc-engineer:find-conflicts <frameworks> [detail-level]`**
   - Analyzes conflicting requirements across selected frameworks
   - Categorizes by severity (high/medium/low)
   - Provides resolution strategies ("most restrictive wins")
   - Example: `find-conflicts SOC2,PCI-DSS,NIST detailed`

3. **`/grc-engineer:optimize-multi-framework <frameworks> [format]`**
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
/grc-engineer:map-controls-unified access_control_account_management

# Identify conflicts between 3 frameworks
/grc-engineer:find-conflicts SOC2,PCI-DSS,NIST

# Generate optimization roadmap for 4 frameworks
/grc-engineer:optimize-multi-framework SOC2,PCI-DSS,NIST,ISO roadmap

# Export control matrix as CSV
/grc-engineer:optimize-multi-framework SOC2,PCI-DSS,NIST matrix

# Generate implementation code
/grc-engineer:generate-implementation access_control_account_management aws

# Scan infrastructure for violations
/grc-engineer:scan-iac ./terraform SOC2,PCI-DSS,NIST detailed --fix

# Test control effectiveness
/grc-engineer:test-control access_control_account_management aws

# Set up continuous monitoring
/grc-engineer:monitor-continuous SOC2,PCI-DSS,NIST daily --slack-webhook=URL
```

### Extending the Crosswalk

To add new controls to the crosswalk database:

1. Edit `plugins/grc-engineer/config/control-crosswalk.yaml`
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
node plugins/grc-engineer/scripts/cross-framework-analyzer.js map my_new_control
```

## Code Generation & IaC Scanning (NEW - Phase 2)

The grc-engineer plugin now includes production-ready code generation and infrastructure scanning capabilities.

### Code Generation

**Command**: `/grc-engineer:generate-implementation <control> <cloud-provider> [output-dir]`

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
- `azure` - Azure with Azure AD, Key Vault, Monitor
- `gcp` - GCP with Cloud IAM, KMS, Logging
- `kubernetes` - K8s with RBAC, NetworkPolicy, PodSecurityPolicy

**Usage Example**:

```bash
# Generate for AWS
/grc-engineer:generate-implementation encryption_at_rest aws ./compliance

# Output includes:
# - S3 bucket encryption configuration
# - KMS key setup with rotation
# - EBS encryption defaults
# - RDS encryption settings
# - Evidence collection scripts
```

### IaC Scanning

**Command**: `/grc-engineer:scan-iac <directory> <frameworks> [format] [options]`

**Script**: `plugins/grc-engineer/scripts/scan-iac.js`

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
/grc-engineer:scan-iac ./terraform SOC2,PCI-DSS --fix
```

Automatically remediates:

- ✓ Missing S3 bucket encryption
- ✓ Disabled S3 versioning
- ✓ Missing S3 public access blocks
- ✓ Disabled KMS key rotation
- ✓ Short log retention periods
- ✗ Security group rules (requires manual review)
- ✗ IAM policies (security sensitive)

**CI/CD Integration**:

GitHub Actions:

```yaml
- name: Scan Infrastructure
  run: /grc-engineer:scan-iac ./terraform SOC2,PCI-DSS,NIST sarif > results.sarif

- name: Upload Results
  uses: github/codeql-action/upload-sarif@v2
  with:
    sarif_file: results.sarif
```

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
/grc-engineer:map-controls-unified access_control_account_management

# Identify conflicts
/grc-engineer:find-conflicts SOC2,PCI-DSS,NIST

# Get optimization roadmap
/grc-engineer:optimize-multi-framework SOC2,PCI-DSS,NIST
```

**2. Implementation Phase**:

```bash
# Generate production-ready code
/grc-engineer:generate-implementation access_control_account_management aws ./output

# Review and customize
cd ./output/terraform
terraform init
terraform plan
```

**3. Validation Phase**:

```bash
# Scan for compliance violations
/grc-engineer:scan-iac ./terraform SOC2,PCI-DSS,NIST detailed

# Apply fixes
/grc-engineer:scan-iac ./terraform SOC2,PCI-DSS,NIST --fix

# Verify compliance
/grc-engineer:scan-iac ./terraform SOC2,PCI-DSS,NIST summary
```

**4. Evidence Collection**:

```bash
# Collect compliance evidence
cd ./output/scripts
python evidence_collect.py ./evidence/2025-Q1
```

## Control Testing & Monitoring (NEW - Phase 3)

The grc-engineer plugin now includes automated control testing and continuous monitoring to ensure controls remain effective over time.

### Control Testing

**Command**: `/grc-engineer:test-control <control-id> [cloud-provider] [options]`

**Script**: `plugins/grc-engineer/scripts/test-control.js`

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
- Quarterly access review overdue (92 days, PCI requires 90)
- Access review policy documentation outdated

FRAMEWORK COMPLIANCE:
NIST 800-53: ⚠ PARTIALLY COMPLIANT
ISO 27001:   ⚠ PARTIALLY COMPLIANT
SOC2:        ⚠ PARTIALLY COMPLIANT
PCI-DSS:     ✗ NON-COMPLIANT (quarterly review requirement violated)

Status: PARTIALLY EFFECTIVE
Remediation: Run python scripts/access_review.py --immediate
```

**Test Types by Control**:

**Access Control** (15 tests):

- ✓ Unique user IDs
- ✓ Access approval process
- ✗ Quarterly access reviews (schedule/execution)
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
  run: /grc-engineer:test-control access_control_account_management --output=json > results.json

- name: Check Pass Rate
  run: |
    PASS_RATE=$(jq '.summary.pass_rate' results.json)
    if (( $(echo "$PASS_RATE < 0.90" | bc -l) )); then
      exit 1
    fi
```

### Continuous Monitoring

**Command**: `/grc-engineer:monitor-continuous <frameworks> [schedule] [options]`

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
/grc-engineer:map-controls-unified access_control_account_management
/grc-engineer:find-conflicts SOC2,PCI-DSS,NIST
/grc-engineer:optimize-multi-framework SOC2,PCI-DSS,NIST,ISO
```

**Phase 2 - Implement**:

```bash
/grc-engineer:generate-implementation access_control_account_management aws
cd generated/terraform && terraform apply
/grc-engineer:scan-iac ./terraform SOC2,PCI-DSS,NIST --fix
```

**Phase 3 - Validate & Monitor**:

```bash
/grc-engineer:test-control access_control_account_management aws
/grc-engineer:monitor-continuous SOC2,PCI-DSS,NIST daily
```

This provides end-to-end compliance automation:

1. **Understand** requirements across frameworks (crosswalk)
2. **Optimize** implementation (56% effort reduction)
3. **Generate** production code (Terraform, scripts)
4. **Scan** existing infrastructure (violations + fixes)
5. **Test** control effectiveness (config, functionality, compliance)
6. **Monitor** continuously (trends, alerts, dashboard)

## Multi-Cloud Support

The grc-engineer plugin supports evidence collection across:

- **AWS**: boto3, aws CLI (IAM, S3, CloudTrail)
- **Azure**: azure-* SDKs, az CLI (AD, Storage, Monitor)
- **GCP**: google-cloud-* SDKs, gcloud CLI (IAM, Storage, Logging)
- **Kubernetes**: kubectl, kubernetes SDK

## Issue tracking (Linear)

This repo ships a **project-scoped** Linear MCP server in `.mcp.json` named `linear-grc-club`, pointing at `https://mcp.linear.app/mcp`. It loads only when Claude Code starts in this directory and does not affect MCP configuration in any other repo.

**First-time setup per machine:**

1. Start a Claude Code session in this directory.
2. Run `/mcp` and authenticate `linear-grc-club` via OAuth.
3. **Select the GRC Engineering Club workspace** at the consent screen (not a personal Linear). OAuth tokens are stored in the user's Claude config, not in the repo.

Linear operations from this repo should target the GRC Engineering Club workspace through the `linear-grc-club` MCP. If a global `claude.ai Linear` MCP is also active in the session (authenticated to a different workspace), prefer the project-scoped tools so issues land in the right workspace. The team/project IDs for the club workspace will be recorded here once an authenticated maintainer captures them via `linear-grc-club`'s `list_teams` / `list_projects`.

## Important Notes

- All plugins use MIT license
- Plugin versions are synchronized at 0.1.0
- Framework control mappings are in YAML for easy extension
- Node.js scripts are only in persona plugins (grc-engineer, etc.)
- Framework plugins are pure markdown/prompt-based
