---
description: Optimize implementation across multiple compliance frameworks
---

# Optimize Multi-Framework

Analyzes multiple compliance frameworks to identify "implement once, satisfy many" opportunities and provides an optimized implementation roadmap.

## Usage

```bash
/engineer:optimize-multi-framework <frameworks> [output-format]
```

## Arguments

- Argument 1 - Comma-separated list of frameworks (e.g., "SOC2,PCI-DSS,NIST,ISO")
- Argument 2 - Output format (optional): "roadmap", "matrix", "summary" (default: "roadmap")

## Framework Codes

- `SOC2` - SOC 2 Trust Service Criteria
- `NIST` - NIST 800-53
- `ISO` - ISO 27001
- `PCI` or `PCI-DSS` - PCI DSS v4.0.1
- `CIS` - CIS Controls v8
- `CMMC` - CMMC 2.0
- `FedRAMP` - FedRAMP (uses NIST 800-53)
- `HITRUST` - HITRUST CSF
- `GDPR` - GDPR
- `HIPAA` - HIPAA

## Examples

```bash
# Optimize for SOC2 + PCI-DSS
/engineer:optimize-multi-framework SOC2,PCI-DSS

# Detailed roadmap for 4 frameworks
/engineer:optimize-multi-framework SOC2,PCI-DSS,NIST,ISO roadmap

# Control implementation matrix
/engineer:optimize-multi-framework SOC2,PCI-DSS,NIST matrix

# Quick summary
/engineer:optimize-multi-framework SOC2,PCI-DSS,NIST summary
```

## Output Formats

### Roadmap (default)

Provides a phased implementation plan prioritized by ROI

### Matrix

Shows control-by-control mapping across all frameworks

### Summary

High-level statistics and optimization potential

## Example Output (Roadmap Format)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MULTI-FRAMEWORK OPTIMIZATION ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Target Frameworks: SOC2, PCI-DSS, NIST 800-53, ISO 27001
Analysis Date: 2025-01-15

FRAMEWORK DETAILS:
  ✓ SOC 2:        68 applicable controls (Trust Service Criteria)
  ✓ PCI-DSS:      329 requirements (v4.0.1)
  ✓ NIST 800-53:  325 controls (Moderate baseline)
  ✓ ISO 27001:    93 controls (Annex A)

Total Controls: 815 (if implemented separately)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPTIMIZATION RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overlapping Controls Identified: 300 (83% of unique controls)
Unique Implementations Required: 362
Framework-Specific Controls: 62 (17%)

EFFORT REDUCTION:
  ❌ Without Optimization: 815 controls × 8 hours = 6,520 hours
  ✅ With Optimization:    362 controls × 8 hours = 2,896 hours

  💰 SAVINGS: 3,624 hours (56% reduction)
             ~\$543,600 at \$150/hour
             ~18 person-months

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIER 1: IMPLEMENT ONCE, SATISFY 4 FRAMEWORKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

87 controls in this tier (40% framework coverage)
Estimated effort: 696 hours (87 × 8 hours)
ROI: 4× (implement 1, satisfy 4)

Priority: HIGHEST - Start here for maximum impact

CONTROL #1: Access Control - Account Management
  Satisfies:
    ✓ NIST AC-2 (Account Management)
    ✓ ISO A.5.16, A.5.18 (Identity management, access rights)
    ✓ SOC2 CC6.1 (Logical access controls)
    ✓ PCI 8.2 (User identification and account management)

  Implementation:
    - AWS IAM with automated lifecycle
    - Quarterly access reviews (90 days)
    - Automated inactive user detection (90 days)
    - Audit logging with CloudTrail

  Effort: 40 hours
  Value: 4 frameworks × 26 total controls = 104 control-implementations

  Next steps:
    /engineer:generate-implementation access_control_account_management aws

CONTROL #2: Encryption at Rest
  Satisfies:
    ✓ NIST SC-28 (Protection of information at rest)
    ✓ ISO A.8.24 (Use of cryptography)
    ✓ SOC2 CC6.7 (Encryption)
    ✓ PCI 3.5.1, 3.6 (Render PAN unreadable, protect keys)

  Implementation:
    - AWS KMS customer-managed keys
    - AES-256 encryption
    - FIPS 140-2 Level 3 validation
    - Automated key rotation (annual)

  Effort: 24 hours
  Value: 4 frameworks × 8 controls = 32 control-implementations

  Next steps:
    /engineer:generate-implementation encryption_at_rest aws

CONTROL #3: Security Logging and Monitoring
  Satisfies:
    ✓ NIST AU-2, AU-3, AU-6, AU-11 (Audit logging)
    ✓ ISO A.8.15, A.8.16, A.8.17 (Logging, monitoring activities, clock synchronization)
    ✓ SOC2 CC7.2, CC7.3 (System monitoring)
    ✓ PCI 10.2–10.5 (Audit logs)

  Implementation:
    - CloudTrail (all regions, all accounts)
    - VPC Flow Logs
    - CloudWatch Logs aggregation
    - 6 months online + 6 months archived (1 year total)
    - S3 object lock for tamper-proofing

  Effort: 60 hours
  Value: 4 frameworks × 18 controls = 72 control-implementations

  Next steps:
    /engineer:generate-implementation logging_and_monitoring aws

CONTROL #4: Vulnerability Management
  Satisfies:
    ✓ NIST RA-5, SI-2 (Vulnerability scanning, patching)
    ✓ ISO A.8.8 (Management of technical vulnerabilities)
    ✓ SOC2 CC7.1 (Anomaly detection)
    ✓ PCI 5.2, 6.3.3, 11.3 (Anti-malware, patching, scanning)

  Implementation:
    - AWS Inspector for vulnerability scanning
    - Systems Manager Patch Manager
    - Monthly internal scans
    - Quarterly external scans by ASV (PCI requirement)
    - Critical patches: 15 days, High: 30 days

  Effort: 80 hours
  Value: 4 frameworks × 12 controls = 48 control-implementations

CONTROL #5: Network Security and Segmentation
  Satisfies:
    ✓ NIST SC-7 (Boundary protection)
    ✓ ISO A.8.20-A.8.22 (Network security, network services, segregation)
    ✓ SOC2 CC6.6 (Logical access)
    ✓ PCI 1.2, 1.3, 1.4 (Network security controls, segmentation)

  Implementation:
    - VPC with public/private subnets
    - Security Groups (deny by default)
    - Network ACLs for subnet-level filtering
    - VPC Flow Logs for monitoring
    - Semi-annual firewall rule reviews (PCI requirement)

  Effort: 50 hours
  Value: 4 frameworks × 15 controls = 60 control-implementations

... (82 more Tier 1 controls)

TIER 1 SUMMARY:
  Controls: 87
  Effort: 696 hours
  Value: 348 control-implementations
  ROI: 4.0× (implement once, satisfy 4 frameworks)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIER 2: IMPLEMENT ONCE, SATISFY 3 FRAMEWORKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

124 controls in this tier (35% additional coverage)
Estimated effort: 992 hours (124 × 8 hours)
ROI: 3× (implement 1, satisfy 3)

Priority: HIGH - Implement after Tier 1

Examples:
  ✓ Multi-factor Authentication (MFA)
    - NIST IA-2(1), ISO A.8.5, PCI 8.4.2
    - Effort: 32 hours

  ✓ Change Management
    - NIST CM-3, ISO A.8.32, SOC2 CC8.1
    - Effort: 48 hours

  ✓ Incident Response
    - NIST IR-4, ISO A.5.24, SOC2 CC7.4
    - Effort: 60 hours

  ... (121 more controls)

TIER 2 SUMMARY:
  Controls: 124
  Effort: 992 hours
  Value: 372 control-implementations
  ROI: 3.0×

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIER 3: IMPLEMENT ONCE, SATISFY 2 FRAMEWORKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

89 controls in this tier (17% additional coverage)
Estimated effort: 712 hours (89 × 8 hours)
ROI: 2× (implement 1, satisfy 2)

Priority: MEDIUM - Implement after Tier 2

Examples:
  ✓ Configuration Management
    - NIST CM-2, ISO A.8.9
    - Effort: 40 hours

  ✓ Media Protection
    - NIST MP-6, PCI 9.4.7
    - Effort: 24 hours

  ... (87 more controls)

TIER 3 SUMMARY:
  Controls: 89
  Effort: 712 hours
  Value: 178 control-implementations
  ROI: 2.0×

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIER 4: FRAMEWORK-SPECIFIC CONTROLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

62 controls in this tier (8% additional coverage)
Estimated effort: 496 hours (62 × 8 hours)
ROI: 1× (no overlap)

Priority: LOW - Implement only if framework required

PCI-DSS Specific (18 controls):
  ⚠ Quarterly ASV scans (Requirement 11.3.2)
  ⚠ Compensating controls documentation (12.3)
  ⚠ Service provider requirements (12.8)
  ⚠ PCI DSS Attestation of Compliance
  ... 14 more

SOC2 Specific (12 controls):
  ⚠ Vendor management for TSC
  ⚠ Service Organization Controls disclosure
  ⚠ Trust Services Criteria specific evidence
  ... 9 more

NIST Specific (15 controls):
  ⚠ Security authorization (CA-6)
  ⚠ System and Services Acquisition (SA family)
  ⚠ Planning controls (PL family)
  ... 12 more

ISO 27001 Specific (17 controls):
  ⚠ Management review of ISMS (9.3)
  ⚠ Internal audit of ISMS (9.2)
  ⚠ Context of the organization (4.1)
  ... 14 more

TIER 4 SUMMARY:
  Controls: 62
  Effort: 496 hours
  Value: 62 control-implementations
  ROI: 1.0×

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDED IMPLEMENTATION ROADMAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 1: Foundation (Weeks 1-8)
  Focus: Tier 1 high-impact controls (top 20)
  Effort: 400 hours
  Coverage: 25% (all 4 frameworks)

  Controls:
    1. Account Management (40h)
    2. Encryption at Rest (24h)
    3. Logging and Monitoring (60h)
    4. Vulnerability Management (80h)
    5. Network Security (50h)
    6. MFA Implementation (32h)
    7. Backup and Recovery (40h)
    8. Access Control Policies (24h)
    ... 12 more

PHASE 2: Core Security (Weeks 9-16)
  Focus: Remaining Tier 1 + High-priority Tier 2
  Effort: 800 hours
  Coverage: 60% (all 4 frameworks)

  Controls:
    - Remaining 67 Tier 1 controls
    - Top 40 Tier 2 controls

PHASE 3: Comprehensive (Weeks 17-24)
  Focus: Tier 2 + Tier 3
  Effort: 1,200 hours
  Coverage: 92% (all 4 frameworks)

  Controls:
    - Remaining 84 Tier 2 controls
    - All 89 Tier 3 controls

PHASE 4: Framework-Specific (Weeks 25-30)
  Focus: Tier 4 only-if-needed controls
  Effort: 496 hours
  Coverage: 100% (all 4 frameworks)

  Controls:
    - 62 framework-specific requirements

TOTAL IMPLEMENTATION:
  Duration: 30 weeks (~7.5 months)
  Effort: 2,896 hours
  Team size: 3-4 engineers
  Cost: ~\$434,400 at \$150/hour

ALTERNATIVE (separate implementations):
  Duration: 60+ weeks (~15 months)
  Effort: 6,520 hours
  Team size: 6-8 engineers
  Cost: ~\$978,000 at \$150/hour

OPTIMIZATION BENEFIT:
  💰 Cost savings: \$543,600 (56%)
  ⏱ Time savings: 7.5 months
  👥 Resource savings: 50% fewer engineers

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUICK WINS (Start This Week)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These controls provide immediate value with minimal effort:

1. Enable CloudTrail (All Regions)
   Effort: 2 hours
   Satisfies: NIST AU-2, ISO A.8.15, SOC2 CC7.2, PCI 10.2.1
   Command: /engineer:generate-implementation cloudtrail_enable aws

2. Enable S3 Bucket Encryption
   Effort: 4 hours
   Satisfies: NIST SC-28, ISO A.8.24, SOC2 CC6.7, PCI 3.5.1
   Command: /engineer:generate-implementation s3_encryption aws

3. Enable MFA for Root Account
   Effort: 1 hour
   Satisfies: NIST IA-2(1), ISO A.8.5, SOC2 CC6.1, PCI 8.4.2
   Command: /engineer:generate-implementation root_mfa aws

4. Enable VPC Flow Logs
   Effort: 2 hours
   Satisfies: NIST AU-2, ISO A.8.15, SOC2 CC7.2, PCI 10.2.1
   Command: /engineer:generate-implementation vpc_flow_logs aws

5. Deploy AWS Config
   Effort: 8 hours
   Satisfies: NIST CM-2, ISO A.8.9, SOC2 CC8.1, PCI 2.2.1
   Command: /engineer:generate-implementation aws_config aws

QUICK WINS TOTAL:
  Effort: 17 hours
  Controls satisfied: 40+ across 4 frameworks
  ROI: 235% (40 controls / 17 hours)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Review and approve this optimization roadmap
2. Start with Quick Wins (17 hours, massive impact)
3. Begin Phase 1 Tier 1 implementations
4. Use these commands for each control:

   /engineer:map-controls-unified <control>
   └─ Understand cross-framework mappings

   /engineer:generate-implementation <control> <cloud>
   └─ Generate Terraform, scripts, docs

   /engineer:scan-iac <directory> <frameworks>
   └─ Validate current state

   /engineer:test-control <control>
   └─ Verify implementation

5. Track progress with compliance dashboard
6. Document resolutions for auditors

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FRAMEWORK COVERAGE BY PHASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After Phase 1 (8 weeks):
  SOC2:     25% ████████░░░░░░░░░░░░░░░░
  PCI-DSS:  25% ████████░░░░░░░░░░░░░░░░
  NIST:     25% ████████░░░░░░░░░░░░░░░░
  ISO:      25% ████████░░░░░░░░░░░░░░░░

After Phase 2 (16 weeks):
  SOC2:     60% ███████████████████░░░░░
  PCI-DSS:  60% ███████████████████░░░░░
  NIST:     60% ███████████████████░░░░░
  ISO:      60% ███████████████████░░░░░

After Phase 3 (24 weeks):
  SOC2:     95% ███████████████████████░
  PCI-DSS:  92% ██████████████████████░░
  NIST:     90% ██████████████████████░░
  ISO:      93% ███████████████████████░

After Phase 4 (30 weeks):
  SOC2:    100% ████████████████████████
  PCI-DSS: 100% ████████████████████████
  NIST:    100% ████████████████████████
  ISO:     100% ████████████████████████
```

## Matrix Format Output

```bash
/engineer:optimize-multi-framework SOC2,PCI-DSS,NIST,ISO matrix
```

Produces a spreadsheet-style control mapping matrix (CSV format).

## Summary Format Output

```bash
/engineer:optimize-multi-framework SOC2,PCI-DSS,NIST,ISO summary
```

```
Multi-Framework Optimization Summary

Frameworks: SOC2, PCI-DSS, NIST 800-53, ISO 27001
Total Controls (separate): 815
Optimized Controls: 362
Reduction: 56%

Effort Savings: 3,624 hours (\$543,600)
Time Savings: 7.5 months

Tier 1 (4 frameworks): 87 controls (40% coverage)
Tier 2 (3 frameworks): 124 controls (75% cumulative)
Tier 3 (2 frameworks): 89 controls (92% cumulative)
Tier 4 (1 framework): 62 controls (100% cumulative)

Quick Wins Available: 5 controls, 17 hours, 40+ control-implementations

Recommended: Start with Tier 1 for maximum ROI
```

## Related Commands

- `/engineer:map-controls-unified` - Map individual controls across frameworks
- `/engineer:find-conflicts` - Identify conflicting requirements
- `/engineer:generate-implementation` - Generate code for controls
- `/engineer:scan-iac` - Scan infrastructure for compliance
