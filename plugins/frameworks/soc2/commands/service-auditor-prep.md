---
description: Generate complete auditor-ready evidence package for SOC 2
---

# SOC 2 Service Auditor Preparation

Generates a comprehensive, auditor-ready evidence package for SOC 2 Type I or Type II audits, including automated evidence collection, organization by TSC control, PBC (Provided By Client) list generation, and evidence matrix.

## Usage

```bash
/soc2:service-auditor-prep [period] [options]
```

## Arguments

- Argument 1 - Audit period (optional): "2024", "2024-Q1-Q4", or "2024-01-01:2024-12-31" (default: current year)
- Argument 2 - Options (optional): `--type=type1|type2`, `--output-dir=path`, `--controls=CC6,CC7`, `--format=zip|tar`

## Examples

```bash
# Generate full year Type II package
/soc2:service-auditor-prep 2024 --type=type2

# Generate specific quarter Type I
/soc2:service-auditor-prep 2024-Q4 --type=type1

# Specific controls only
/soc2:service-auditor-prep 2024 --controls=CC6,CC7,CC8

# Custom output directory
/soc2:service-auditor-prep 2024 --output-dir=/mnt/secure-drive/soc2-audit

# Generate and compress as zip
/soc2:service-auditor-prep 2024 --format=zip
```

## Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOC 2 SERVICE AUDITOR EVIDENCE PACKAGE GENERATOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Organization: Your Company, Inc.
Audit Period: January 1, 2024 - December 31, 2024 (12 months)
Audit Type: Type II (Period Testing)
Trust Service Criteria: Security (CC1-CC9)
Package Date: 2025-01-28
Auditor: Example Audit LLP

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1: EVIDENCE COLLECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Collecting automated evidence from AWS...

✓ CC6.1 - Access Control
  ✓ IAM users list (Q1 2024)                      → iam-users-2024-Q1.json
  ✓ IAM users list (Q2 2024)                      → iam-users-2024-Q2.json
  ✓ IAM users list (Q3 2024)                      → iam-users-2024-Q3.json
  ✓ IAM users list (Q4 2024)                      → iam-users-2024-Q4.json
  ✓ IAM credential report (quarterly snapshots)   → credential-report-*.csv
  ✓ Access Analyzer findings (full period)        → access-analyzer-2024.json
  ✓ CloudTrail IAM events (full period)           → cloudtrail-iam-2024.json.gz
  ✓ MFA status report (quarterly)                 → mfa-status-*.json
  Total: 16 files, 124 MB

✓ CC6.7 - Encryption at Rest
  ✓ S3 bucket encryption config (all 50 buckets)  → s3-encryption-config.json
  ✓ RDS encryption config (all 12 instances)      → rds-encryption-config.json
  ✓ EBS encryption config (all 89 volumes)        → ebs-encryption-config.json
  ✓ KMS key usage (customer-managed keys)         → kms-keys-config.json
  Total: 4 files, 2.1 MB

✓ CC6.8 - Encryption in Transit
  ✓ ALB listener configuration (HTTPS only)       → alb-https-config.json
  ✓ CloudFront TLS configuration                  → cloudfront-tls-config.json
  ✓ ACM certificate inventory                     → acm-certificates.json
  ✓ SSL Labs scan results (monthly)               → ssl-labs-*.json
  Total: 16 files, 8.4 MB

✓ CC7.1 - System Monitoring
  ✓ CloudWatch alarms configuration               → cloudwatch-alarms.json
  ✓ GuardDuty findings (full period)              → guardduty-findings-2024.json
  ✓ Security Hub compliance status                → security-hub-2024.json
  ✓ SNS notification logs                         → sns-notifications-2024.json
  Total: 4 files, 45 MB

✓ CC7.2 - Audit Logging
  ✓ CloudTrail configuration                      → cloudtrail-config.json
  ✓ CloudWatch Logs retention policy              → logs-retention-config.json
  ✓ S3 access logs (full period)                  → s3-access-logs-2024.tar.gz
  ✓ VPC Flow Logs (samples from each quarter)     → vpc-flow-logs-*.json
  Total: 8 files, 2.4 GB

✓ CC7.5 - Backup and Recovery
  ✓ RDS backup configuration                      → rds-backups-config.json
  ✓ S3 versioning configuration                   → s3-versioning-config.json
  ✓ AMI backup inventory                          → ami-backups-2024.json
  ✓ DR test results (quarterly)                   → dr-test-*.pdf
  Total: 8 files, 124 MB

✓ CC8.1 - Change Management
  ✓ Terraform state changes (full period)         → terraform-changes-2024.json
  ✓ AWS Config change history                     → config-changes-2024.json
  ✓ GitHub commit history                         → github-commits-2024.json
  ✓ Jira change tickets (all approved changes)    → jira-changes-2024.csv
  Total: 4 files, 89 MB

Automated Evidence Summary:
  Total Files: 64
  Total Size: 2.8 GB
  Collection Time: 14 minutes
  Missing: 0 files (100% complete)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2: MANUAL EVIDENCE ORGANIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please provide the following manual evidence:

Required Policies (11 documents):
□ Information Security Policy (v2.1 or later, signed)
  → Copy to: ./evidence/policies/information-security-policy.pdf

□ Access Control Policy (v1.8 or later, signed)
  → Copy to: ./evidence/policies/access-control-policy.pdf

□ Change Management Policy (v1.4 or later, signed)
  → Copy to: ./evidence/policies/change-management-policy.pdf

□ Incident Response Policy (v2.0 or later, signed)
  → Copy to: ./evidence/policies/incident-response-policy.pdf

□ Disaster Recovery Plan (v3.2 or later, signed)
  → Copy to: ./evidence/policies/disaster-recovery-plan.pdf

□ Acceptable Use Policy (v1.6 or later, signed)
  → Copy to: ./evidence/policies/acceptable-use-policy.pdf

□ Data Classification Policy (v1.2 or later, signed)
  → Copy to: ./evidence/policies/data-classification-policy.pdf

□ Encryption Policy (v1.5 or later, signed)
  → Copy to: ./evidence/policies/encryption-policy.pdf

□ Vendor Management Policy (v1.3 or later, signed)
  → Copy to: ./evidence/policies/vendor-management-policy.pdf

□ Business Continuity Plan (v2.8 or later, signed)
  → Copy to: ./evidence/policies/business-continuity-plan.pdf

□ Risk Management Policy (v1.9 or later, signed)
  → Copy to: ./evidence/policies/risk-management-policy.pdf

Required Procedures (8 documents):
□ User Provisioning Procedure
  → Copy to: ./evidence/procedures/user-provisioning.pdf

□ User Deprovisioning Procedure
  → Copy to: ./evidence/procedures/user-deprovisioning.pdf

□ Access Review Procedure
  → Copy to: ./evidence/procedures/access-review.pdf

□ Vulnerability Management Procedure
  → Copy to: ./evidence/procedures/vulnerability-management.pdf

□ Patch Management Procedure
  → Copy to: ./evidence/procedures/patch-management.pdf

□ Incident Response Runbook
  → Copy to: ./evidence/procedures/incident-response-runbook.pdf

□ Change Management Procedure
  → Copy to: ./evidence/procedures/change-management.pdf

□ Backup and Restore Procedure
  → Copy to: ./evidence/procedures/backup-restore.pdf

Required Samples (Type II):
□ Access Request Tickets (25 samples across 12 months)
  → Export from Jira to: ./evidence/samples/access-requests/

□ Termination Evidence (all 12 terminations in 2024)
  → Gather documents to: ./evidence/samples/terminations/

□ Change Tickets (25 samples of approved changes)
  → Export from Jira to: ./evidence/samples/changes/

□ Incident Tickets (all 8 incidents in 2024)
  → Export from Jira to: ./evidence/samples/incidents/

Required Reviews (Type II - 4 quarterly):
□ Quarterly Access Review Q1 2024 (March 2024)
  → Copy to: ./evidence/reviews/access/2024-Q1-access-review.pdf

□ Quarterly Access Review Q2 2024 (June 2024)
  → Copy to: ./evidence/reviews/access/2024-Q2-access-review.pdf

□ Quarterly Access Review Q3 2024 (September 2024)
  → Copy to: ./evidence/reviews/access/2024-Q3-access-review.pdf

□ Quarterly Access Review Q4 2024 (December 2024)
  → Copy to: ./evidence/reviews/access/2024-Q4-access-review.pdf

□ Management Review Q1 2024
  → Copy to: ./evidence/reviews/management/2024-Q1-mgmt-review.pdf

□ Management Review Q2 2024
  → Copy to: ./evidence/reviews/management/2024-Q2-mgmt-review.pdf

□ Management Review Q3 2024
  → Copy to: ./evidence/reviews/management/2024-Q3-mgmt-review.pdf

□ Management Review Q4 2024
  → Copy to: ./evidence/reviews/management/2024-Q4-mgmt-review.pdf

Required Testing Evidence:
□ Penetration Test Report (annual, 2024)
  → Copy to: ./evidence/testing/penetration-test-2024.pdf

□ Vulnerability Scan Results (quarterly)
  → Copy to: ./evidence/testing/vulnerability-scans/

□ Disaster Recovery Test Results (quarterly)
  → Already collected in automated phase ✓

□ Business Continuity Test Results (annual)
  → Copy to: ./evidence/testing/bc-test-2024.pdf

Organizational Documents:
□ Organizational Chart (current, with security roles)
  → Copy to: ./evidence/organizational/org-chart-2024.pdf

□ Board Meeting Minutes (security-related discussions)
  → Copy to: ./evidence/organizational/board-minutes-2024-*.pdf

□ Security Team Charter
  → Copy to: ./evidence/organizational/security-charter.pdf

□ Employee Training Records (security awareness)
  → Copy to: ./evidence/organizational/training-records-2024.csv

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3: EVIDENCE ORGANIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Organizing evidence by TSC control...

✓ Created directory structure
✓ Mapped evidence to controls
✓ Generated evidence index

Directory Structure:
evidence/
├── README.md (package overview)
├── EVIDENCE_INDEX.xlsx (master evidence matrix)
├── PBC_LIST.xlsx (Provided By Client list)
├── policies/ (11 policy documents)
├── procedures/ (8 procedure documents)
├── organizational/ (4 org documents)
├── CC1-control-environment/
│   ├── policies/
│   ├── organizational/
│   └── evidence-checklist.pdf
├── CC2-communication/
│   ├── policies/
│   ├── training-records/
│   └── evidence-checklist.pdf
├── CC3-risk-assessment/
│   ├── risk-assessments/
│   ├── threat-models/
│   └── evidence-checklist.pdf
├── CC6-logical-access/
│   ├── policies/
│   ├── procedures/
│   ├── automated/
│   │   ├── iam-users-*.json
│   │   ├── credential-reports-*.csv
│   │   └── cloudtrail-iam-*.json.gz
│   ├── samples/
│   │   ├── access-requests/ (25 tickets)
│   │   └── terminations/ (12 all terminations)
│   ├── reviews/
│   │   └── quarterly-access-reviews/ (Q1-Q4)
│   └── evidence-checklist.pdf
├── CC7-system-operations/
│   ├── policies/
│   ├── procedures/
│   ├── automated/
│   │   ├── cloudwatch-*.json
│   │   ├── guardduty-*.json
│   │   └── cloudtrail-*.json.gz
│   ├── testing/
│   │   ├── dr-tests/ (Q1-Q4)
│   │   └── bc-test/
│   └── evidence-checklist.pdf
├── CC8-change-management/
│   ├── policies/
│   ├── procedures/
│   ├── automated/
│   │   ├── terraform-changes-*.json
│   │   ├── config-changes-*.json
│   │   └── github-commits-*.json
│   ├── samples/
│   │   └── change-tickets/ (25 approved changes)
│   └── evidence-checklist.pdf
└── CC9-risk-mitigation/
    ├── policies/
    ├── vendor-assessments/
    ├── testing/
    │   └── penetration-test-2024.pdf
    └── evidence-checklist.pdf

Total: 147 files across 9 control categories

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 4: PBC LIST GENERATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated: ./evidence/PBC_LIST.xlsx

PBC (Provided By Client) List Summary:

┌────────┬───────────────────────────────────┬──────────┬──────────────┐
│ Item # │ Description                       │ Control  │ Status       │
├────────┼───────────────────────────────────┼──────────┼──────────────┤
│ 1      │ Information Security Policy       │ CC1.1    │ ✓ Ready      │
│ 2      │ Organizational Chart              │ CC1.1    │ ✓ Ready      │
│ 3      │ Board Meeting Minutes (2024)      │ CC1.2    │ ✓ Ready      │
│ 4      │ Security Team Charter             │ CC1.3    │ ✓ Ready      │
│ 5      │ Employee Training Records         │ CC1.4    │ ✓ Ready      │
│ 6      │ Code of Conduct                   │ CC1.5    │ ✓ Ready      │
│ ...    │ ...                               │ ...      │ ...          │
│ 47     │ IAM Users List (Q1-Q4)            │ CC6.1    │ ✓ Ready      │
│ 48     │ IAM Credential Reports (Q1-Q4)    │ CC6.1    │ ✓ Ready      │
│ 49     │ Access Request Samples (25)       │ CC6.1    │ ✓ Ready      │
│ 50     │ Quarterly Access Reviews (Q1-Q4)  │ CC6.1    │ ✓ Ready      │
│ 51     │ Termination Evidence (12)         │ CC6.1    │ ✓ Ready      │
│ ...    │ ...                               │ ...      │ ...          │
│ 142    │ Change Tickets (25 samples)       │ CC8.1    │ ✓ Ready      │
│ 143    │ GitHub Commit History             │ CC8.1    │ ✓ Ready      │
│ 144    │ Terraform Change Log              │ CC8.1    │ ✓ Ready      │
│ 145    │ Vendor Risk Assessments           │ CC9.1    │ ⚠ Pending    │
│ 146    │ Penetration Test Report           │ CC9.2    │ ✓ Ready      │
│ 147    │ Incident Response Drill Results   │ CC9.3    │ ✓ Ready      │
└────────┴───────────────────────────────────┴──────────┴──────────────┘

Total Items: 147
Ready: 145 (99%)
Pending: 2 (1%)

Pending Items:
⚠ Item 145: Vendor Risk Assessments (2 vendors missing)
  → Action: Complete assessments for AWS Marketplace vendors
  → Due: Before audit fieldwork

⚠ Item 87: CC4.2 Management Review Q4 Minutes
  → Action: Obtain signed meeting minutes from CISO
  → Due: Immediate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 5: EVIDENCE MATRIX GENERATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated: ./evidence/EVIDENCE_INDEX.xlsx

Evidence Matrix Structure:
  Sheet 1: Summary (compliance overview)
  Sheet 2: Control Mapping (TSC → Evidence)
  Sheet 3: Evidence Inventory (all files)
  Sheet 4: Sampling Details (sample selection methodology)
  Sheet 5: Gaps and Exceptions (2 items)

Sample - Sheet 2 (Control Mapping):
┌──────────┬────────────────────────────┬─────────────────────┬──────────────┐
│ Control  │ Control Description        │ Evidence Files      │ Completeness │
├──────────┼────────────────────────────┼─────────────────────┼──────────────┤
│ CC6.1    │ Logical/Physical Access    │ 18 files            │ 100%         │
│          │                            │ - Access policy     │              │
│          │                            │ - IAM configs (4)   │              │
│          │                            │ - Access reviews(4) │              │
│          │                            │ - Samples (25)      │              │
│          │                            │ - Terminations (12) │              │
├──────────┼────────────────────────────┼─────────────────────┼──────────────┤
│ CC6.7    │ Encryption at Rest         │ 5 files             │ 100%         │
│          │                            │ - Encryption policy │              │
│          │                            │ - S3 config         │              │
│          │                            │ - RDS config        │              │
│          │                            │ - EBS config        │              │
│          │                            │ - KMS config        │              │
├──────────┼────────────────────────────┼─────────────────────┼──────────────┤
│ CC7.2    │ Audit Logging & Retention  │ 8 files             │ 100%         │
│          │                            │ - Logging policy    │              │
│          │                            │ - CloudTrail config │              │
│          │                            │ - CW Logs retention │              │
│          │                            │ - S3 access logs    │              │
│          │                            │ - VPC flow logs     │              │
└──────────┴────────────────────────────┴─────────────────────┴──────────────┘

Overall Evidence Completeness: 99% (145/147 items)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 6: SYSTEM DESCRIPTION GENERATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated: ./evidence/SYSTEM_DESCRIPTION.pdf (draft)

System Description includes:
✓ Section 1: Company Overview
  - Business model (SaaS application)
  - Services provided
  - Geographic locations

✓ Section 2: System Components
  - AWS infrastructure diagram
  - Network architecture
  - Data flows
  - Third-party integrations (Okta, GitHub, etc.)

✓ Section 3: Trust Service Criteria
  - CC1-CC9 control descriptions
  - Implementation details
  - Evidence references

✓ Section 4: Boundaries
  - In-scope: AWS production environment
  - Out-of-scope: Marketing website (separate hosting)
  - Carve-outs: Mobile app (separate audit)

✓ Section 5: Changes During Period
  - Migration to AWS Organization (Q2 2024)
  - GuardDuty enablement (Q1 2024)
  - Okta SSO implementation (Q3 2024)

✓ Section 6: Complementary User Entity Controls (CUECs)
  - Customer responsibilities
  - Shared responsibility model

⚠ DRAFT - Requires management review and approval

Action Required:
1. Review system description for accuracy
2. Update infrastructure diagrams if needed
3. Obtain executive sign-off
4. Provide final version to auditor

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 7: PACKAGE FINALIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Creating auditor-ready package...

✓ Evidence organized by control
✓ PBC list generated (147 items)
✓ Evidence matrix created
✓ System description drafted
✓ Evidence checklists per control
✓ Sampling methodology documented
✓ README with navigation guide
✓ Gaps and exceptions documented

Package Statistics:
  Total Files: 147
  Total Size: 3.2 GB (compressed: 890 MB)
  Completeness: 99%
  Organization: By TSC control

Package Location: ./evidence/
Compressed: ./soc2-audit-evidence-2024.zip

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before providing package to auditor:

✓ Automated evidence collected (64 files)
⚠ Manual evidence provided (83/85 files - 2 pending)
✓ Evidence organized by control
✓ PBC list generated and reviewed
✓ Evidence matrix created
⚠ System description drafted (needs approval)
✓ Sampling methodology documented
✓ Gaps documented (2 items)

Outstanding Items (Complete Before Audit):
□ Vendor risk assessments (2 vendors)
□ Q4 management review minutes
□ System description approval

Estimated Time to Complete: 4 hours

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before Audit Kickoff:
1. Complete 2 pending evidence items (vendor assessments, Q4 minutes)
2. Get system description approved by executive team
3. Review evidence package with internal team
4. Prepare for auditor questions (create FAQ)
5. Designate evidence point-of-contact for auditor requests

During Audit:
1. Provide evidence package via secure file share
2. Grant auditor read-only AWS access (if requested)
3. Schedule control walkthroughs
4. Be available for follow-up questions
5. Respond to additional evidence requests within 24 hours

Post-Audit:
1. Address any identified deficiencies
2. Collect evidence of remediation
3. Update controls for next audit period
4. Schedule post-audit debrief with auditor

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PACKAGE ACCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Evidence Package: ./evidence/
Compressed Archive: ./soc2-audit-evidence-2024.zip (890 MB)
PBC List: ./evidence/PBC_LIST.xlsx
Evidence Matrix: ./evidence/EVIDENCE_INDEX.xlsx
System Description: ./evidence/SYSTEM_DESCRIPTION.pdf

To provide to auditor:
1. Upload to secure file share (ShareFile, Dropbox Business, etc.)
2. Grant auditor access
3. Provide PBC list first (allows auditor to plan)
4. Evidence package second (organized for easy navigation)

Security Note:
  Evidence contains sensitive information (IAM configs, logs, etc.)
  Use encrypted file transfer only
  Do not email evidence package
  Revoke auditor access after audit completion
```

## Package Contents

### Generated Files

1. **README.md** - Package overview and navigation guide
2. **PBC_LIST.xlsx** - Provided By Client list (147 items)
3. **EVIDENCE_INDEX.xlsx** - Master evidence matrix with control mapping
4. **SYSTEM_DESCRIPTION.pdf** - Draft system description (needs approval)
5. **GAPS_AND_EXCEPTIONS.pdf** - Documented gaps and mitigation plans

### Evidence Directories

```
evidence/
├── README.md
├── PBC_LIST.xlsx
├── EVIDENCE_INDEX.xlsx
├── SYSTEM_DESCRIPTION.pdf
├── GAPS_AND_EXCEPTIONS.pdf
│
├── policies/
│   ├── information-security-policy.pdf
│   ├── access-control-policy.pdf
│   ├── change-management-policy.pdf
│   └── ... (11 total)
│
├── procedures/
│   ├── user-provisioning.pdf
│   ├── access-review.pdf
│   └── ... (8 total)
│
├── organizational/
│   ├── org-chart-2024.pdf
│   ├── board-minutes-2024-*.pdf
│   └── security-charter.pdf
│
├── CC1-control-environment/ (11 files)
├── CC2-communication/ (8 files)
├── CC3-risk-assessment/ (9 files)
├── CC4-monitoring/ (7 files)
├── CC5-control-activities/ (10 files)
├── CC6-logical-access/ (18 files)
├── CC7-system-operations/ (32 files)
├── CC8-change-management/ (14 files)
└── CC9-risk-mitigation/ (12 files)
```

## Automation Details

### Automated Evidence Collection

The tool automatically collects:

**AWS IAM (CC6.1-CC6.6)**:

```bash
# Quarterly snapshots
aws iam list-users > iam-users-2024-Q*.json
aws iam generate-credential-report && aws iam get-credential-report
aws accessanalyzer list-findings
aws iam get-account-summary  # MFA status
```

**AWS Encryption (CC6.7-CC6.8)**:

```bash
# S3 encryption config
aws s3api list-buckets --query 'Buckets[*].Name' | xargs -I {} \
  aws s3api get-bucket-encryption --bucket {}

# RDS encryption
aws rds describe-db-instances --query 'DBInstances[*].[DBInstanceIdentifier,StorageEncrypted]'

# ALB HTTPS config
aws elbv2 describe-load-balancers
aws elbv2 describe-listeners
```

**AWS Logging (CC7.2-CC7.3)**:

```bash
# CloudTrail configuration
aws cloudtrail describe-trails
aws cloudtrail get-trail-status

# CloudWatch Logs retention
aws logs describe-log-groups --query 'logGroups[*].[logGroupName,retentionInDays]'

# VPC Flow Logs
aws ec2 describe-flow-logs
```

**AWS Monitoring (CC7.1)**:

```bash
# CloudWatch alarms
aws cloudwatch describe-alarms

# GuardDuty findings
aws guardduty list-detectors
aws guardduty list-findings --detector-id <id>

# Security Hub
aws securityhub get-findings
```

**AWS Change Management (CC8.1)**:

```bash
# AWS Config changes
aws configservice describe-configuration-recorders
aws configservice get-compliance-details-by-config-rule

# CloudFormation/Terraform state
terraform state pull > terraform-state-2024.json
```

### Manual Evidence Guidance

For each manual evidence item, the tool provides:

- Specific file location to copy to
- Required format (PDF, CSV, etc.)
- Minimum requirements (e.g., "signed by executive")
- Sample size (e.g., "25 samples across 12 months")
- Evidence adequacy criteria

## Integration with Other Commands

### Complete Audit Preparation Workflow

```bash
# Step 1: Assess readiness
/soc2:assess security type2 --output=json > gaps.json

# Step 2: Generate TSC matrix to verify 100% implementation
/soc2:generate-tsc-matrix security table

# Step 3: Fix any gaps
/soc2:gap-to-code gaps.json aws --output-dir=./remediation
cd remediation && terraform apply

# Step 4: Test all controls
/engineer:test-control ALL

# Step 5: Generate timeline
/soc2:type-ii-planner 2024-01-01 2024-12-31

# Step 6: Review evidence requirements
/soc2:evidence-checklist CC6.1
/soc2:evidence-checklist CC7.2
# ... for each control

# Step 7: Generate auditor package
/soc2:service-auditor-prep 2024 --type=type2 --output-dir=/secure-drive/audit

# Step 8: Verify completeness
cat /secure-drive/audit/evidence/EVIDENCE_INDEX.xlsx
cat /secure-drive/audit/evidence/PBC_LIST.xlsx
```

## Advanced Options

### Filtering by Control

```bash
# Only CC6 (access control) evidence
/soc2:service-auditor-prep 2024 --controls=CC6

# Multiple control families
/soc2:service-auditor-prep 2024 --controls=CC6,CC7,CC8
```

### Custom Output Formats

```bash
# Generate as TAR archive
/soc2:service-auditor-prep 2024 --format=tar

# Uncompressed directory
/soc2:service-auditor-prep 2024 --format=directory

# Encrypted ZIP (password-protected)
/soc2:service-auditor-prep 2024 --format=encrypted-zip --password=SecurePass123
```

### Partial Period

```bash
# Q4 only (Type I audit)
/soc2:service-auditor-prep 2024-Q4 --type=type1

# 6-month period (minimum for Type II)
/soc2:service-auditor-prep 2024-07-01:2024-12-31 --type=type2
```

## Validation and Quality Checks

The tool performs automatic validation:

✓ **Completeness Checks**:

- All required policies present
- All quarterly reviews present (Type II)
- Sample sizes meet minimum requirements
- Evidence files are readable (not corrupted)

✓ **Date Validation**:

- Policies dated before audit period start
- Evidence spans entire audit period
- Quarterly reviews evenly distributed
- No gaps in continuous evidence (CloudTrail)

✓ **Format Validation**:

- PDFs are valid and not password-protected
- JSON files are well-formed
- CSVs have correct headers
- File sizes are reasonable (not empty)

✓ **Control Mapping**:

- All TSC controls have evidence
- No orphaned evidence (unmapped files)
- Evidence adequacy per AICPA standards
- Sampling methodology documented

## Related Commands

- `/soc2:assess` - Gap analysis to identify missing evidence
- `/soc2:generate-tsc-matrix` - Implementation status matrix
- `/soc2:evidence-checklist` - Detailed requirements per control
- `/soc2:type-ii-planner` - Audit period timeline planning
- `/soc2:gap-to-code` - Generate IaC to fix control gaps
- `/engineer:collect-evidence` - General evidence collection
- `/engineer:test-control` - Validate control effectiveness
