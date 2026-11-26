---
name: generate-tsc-matrix
description: Generate Trust Service Criteria implementation matrix
---

# SOC 2 TSC Matrix Generator

Generates a comprehensive implementation matrix showing which Trust Service Criteria (TSC) controls are implemented, partially implemented, or not applicable, with mapping to infrastructure components.

## Usage

```bash
/soc2:generate-tsc-matrix [criteria] [output-format]
```

## Arguments

- Argument 1 - Criteria (optional): "security", "availability", "confidentiality", "processing-integrity", "privacy", or "all" (default: "security")
- Argument 2 - Output format (optional): "table", "json", "csv", "markdown" (default: "table")

## Examples

```bash
# Generate matrix for Security criteria only
/soc2:generate-tsc-matrix security

# All Trust Service Criteria
/soc2:generate-tsc-matrix all table

# Export as CSV for spreadsheet
/soc2:generate-tsc-matrix all csv > tsc-matrix.csv

# JSON output for automation
/soc2:generate-tsc-matrix security json
```

## Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOC 2 TRUST SERVICE CRITERIA IMPLEMENTATION MATRIX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Organization: [Your Company]
Date: 2025-01-28
Scope: Security (CC1-CC9)
Assessment Type: Type II (12 months)
Period: 2024-01-01 to 2024-12-31

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Controls: 92
✓ Implemented: 78 (85%)
⚠ Partially Implemented: 11 (12%)
✗ Not Implemented: 2 (2%)
○ Not Applicable: 1 (1%)

By Category:
  CC1 (Control Environment):        10/11 controls (91%)  ⚠ 1 partial
  CC2 (Communication & Information):  7/8 controls (88%)  ⚠ 1 partial
  CC3 (Risk Assessment):              9/9 controls (100%) ✓ Complete
  CC4 (Monitoring):                   8/9 controls (89%)  ✗ 1 missing
  CC5 (Control Activities):          10/11 controls (91%) ⚠ 1 partial
  CC6 (Logical Access):              12/15 controls (80%) ⚠ 3 partial
  CC7 (System Operations):           13/16 controls (81%) ✗ 1 missing, ⚠ 2 partial
  CC8 (Change Management):            6/8 controls (75%)  ⚠ 2 partial
  CC9 (Risk Mitigation):              3/5 controls (60%)  ⚠ 1 partial, ○ 1 N/A

Readiness for Audit: 85% (Target: 100% before period start)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CC1: CONTROL ENVIRONMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ CC1.1 - Organization structure demonstrates commitment
  Status: IMPLEMENTED
  Implementation: Organizational chart with defined security roles
  Evidence: ./docs/org-chart-2024.pdf
  Infrastructure: N/A (organizational control)
  Last Review: 2024-01-15
  Notes: CISO reports to CEO, quarterly board reporting

✓ CC1.2 - Board of directors oversight
  Status: IMPLEMENTED
  Implementation: Quarterly security briefings to board
  Evidence: ./evidence/board-minutes-2024-Q*.pdf
  Infrastructure: N/A (organizational control)
  Last Review: 2024-12-10
  Notes: Board reviews SOC 2 report, approves budget

⚠ CC1.3 - Management establishes structures, reporting lines
  Status: PARTIAL
  Implementation: Security team defined, but no dedicated GRC role
  Evidence: ./docs/security-team-charter.pdf
  Infrastructure: N/A (organizational control)
  Gap: No dedicated compliance officer (shared with legal)
  Remediation: Hire GRC analyst or assign dedicated compliance lead
  Target Date: Q1 2025

✓ CC1.4 - Commitment to competence
  Status: IMPLEMENTED
  Implementation: Annual security training + role-based training
  Evidence: ./evidence/training/security-awareness-2024.csv
  Infrastructure: LMS (Learning Management System)
  Last Review: 2024-12-01
  Notes: 98% completion rate, includes phishing simulations

✓ CC1.5 - Enforces accountability
  Status: IMPLEMENTED
  Implementation: Code of conduct, performance reviews include security
  Evidence: ./policies/code-of-conduct-v2.1.pdf
  Infrastructure: HRIS (PingHR)
  Last Review: 2024-01-01
  Notes: Annual attestation required

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CC6: LOGICAL AND PHYSICAL ACCESS CONTROLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ CC6.1 - Logical and physical access controls
  Status: IMPLEMENTED
  Implementation: AWS IAM with MFA, quarterly access reviews
  Evidence:
    - ./evidence/iam-users-2024-Q*.json
    - ./evidence/access-reviews/2024-Q*-review.pdf
  Infrastructure:
    - AWS IAM (production account)
    - AWS SSO (workforce identity)
    - Okta (SSO provider)
  Components:
    - IAM users: 47 active
    - IAM roles: 23 (service roles)
    - SSO users: 142 (via Okta federation)
    - MFA enabled: 100%
  Automated Testing: Daily (test-control AC-2)
  Last Review: 2024-12-31
  Notes: Zero shared accounts, automated deprovisioning

✓ CC6.2 - Authorization before access granted
  Status: IMPLEMENTED
  Implementation: Manager approval via Jira Service Desk
  Evidence: ./evidence/access-requests/ (sample 25 tickets)
  Infrastructure:
    - Jira Service Desk (request workflow)
    - AWS IAM (provisioning)
    - Slack (approval notifications)
  Process Flow:
    1. User requests access via Jira
    2. Manager approves (Slack notification)
    3. IT provisions (Terraform apply)
    4. Confirmation sent to user
  Automated Testing: Weekly (test approval workflow)
  Last Review: 2024-12-15
  Notes: Average approval time: 4.2 hours

⚠ CC6.3 - Privileges restricted to authorized users
  Status: PARTIAL
  Implementation: RBAC implemented, but 5 users with overly broad permissions
  Evidence: ./evidence/iam-permissions-audit-2024-12.json
  Infrastructure: AWS IAM
  Gap: 5 users with PowerUserAccess (should use job-specific policies)
  Users Affected:
    - john.doe@company.com (DevOps, needs EC2/RDS only)
    - jane.smith@company.com (Data team, needs S3/Athena only)
    - ... 3 more
  Remediation: Create custom policies, transition users
  Target Date: 2025-02-01
  Risk: Medium (users have more access than needed)

✓ CC6.4 - Removal of access timely
  Status: IMPLEMENTED
  Implementation: Automated deprovisioning within 24 hours
  Evidence: ./evidence/terminations/ (all 12 terminations in 2024)
  Infrastructure:
    - HR system (BambooHR) webhook
    - Lambda function (deprovision-user)
    - SNS notification
  Process:
    1. HR marks employee as terminated
    2. Webhook triggers Lambda
    3. IAM user disabled, MFA devices removed
    4. Access keys deactivated
    5. Notification to IT/Security
  Average Deprovisioning Time: 2.3 hours
  Automated Testing: Monthly (verify terminations)
  Last Review: 2024-12-20
  Notes: 100% compliance (all within 24 hours)

✓ CC6.6 - Authentication credentials protected
  Status: IMPLEMENTED
  Implementation: AWS Secrets Manager + password policy
  Evidence:
    - ./evidence/password-policy.json
    - ./evidence/secrets-manager-audit.json
  Infrastructure:
    - AWS Secrets Manager (app credentials)
    - IAM password policy (complexity requirements)
    - KMS (encryption at rest)
  Password Requirements:
    - Minimum 14 characters
    - Complexity: upper, lower, number, special
    - Password age: 90 days
    - Password history: 24 previous passwords
    - MFA required for all users
  Automated Testing: Daily (check policy compliance)
  Last Review: 2024-11-30
  Notes: Zero credentials in code (CodeGuru checks)

⚠ CC6.7 - Encryption protects data at rest
  Status: PARTIAL
  Implementation: S3/RDS encrypted, but 3 legacy buckets unencrypted
  Evidence: ./evidence/encryption-audit-2024-12.json
  Infrastructure:
    - AWS KMS (customer-managed keys)
    - S3 default encryption
    - RDS encryption at rest
  Encrypted Resources:
    - S3 buckets: 47/50 (94%)
    - RDS instances: 12/12 (100%)
    - EBS volumes: 89/89 (100%)
  Gap: 3 legacy S3 buckets without encryption:
    - legacy-backups-2019 (1.2 TB, low risk data)
    - temp-storage-dev (47 GB, test data)
    - logs-archive-old (890 GB, old logs)
  Remediation: Enable default encryption, migrate data
  Target Date: 2025-01-15
  Risk: Low (no sensitive data, but fails audit requirement)

✓ CC6.8 - Encryption protects data in transit
  Status: IMPLEMENTED
  Implementation: TLS 1.2+ enforced, HSTS enabled
  Evidence:
    - ./evidence/tls-configuration.json
    - ./evidence/alb-listener-config.json
  Infrastructure:
    - ALB (HTTPS listeners only)
    - CloudFront (TLS 1.2 minimum)
    - ACM (certificate management)
  Configuration:
    - TLS versions: 1.2, 1.3 only
    - Cipher suites: Strong ciphers only (AES-GCM)
    - HSTS: max-age=31536000, includeSubDomains
    - Certificate rotation: Automated (ACM)
  Automated Testing: Daily (SSL Labs scan via CI/CD)
  Last Review: 2024-12-10
  Notes: A+ rating on SSL Labs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CC7: SYSTEM OPERATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ CC7.1 - System monitoring detects anomalies
  Status: IMPLEMENTED
  Implementation: CloudWatch + GuardDuty + custom dashboards
  Evidence:
    - ./evidence/cloudwatch-alarms.json
    - ./evidence/guardduty-findings-2024.json
  Infrastructure:
    - CloudWatch (metrics, logs, alarms)
    - GuardDuty (threat detection)
    - SNS (alerting)
    - PagerDuty (on-call escalation)
  Monitored Metrics:
    - CPU utilization (>80% = warning)
    - Error rates (>1% = alert)
    - API latency (>500ms p95 = warning)
    - Failed login attempts (>5 in 5min = alert)
  Automated Testing: Continuous
  Last Review: 2024-12-01
  Notes: 24/7 monitoring, average response time: 8 minutes

✗ CC7.2 - System activities monitored for quality
  Status: NOT IMPLEMENTED
  Implementation: Basic monitoring exists, but no quality metrics
  Evidence: N/A
  Infrastructure: CloudWatch (partial)
  Gap: No SLI/SLO tracking, no quality dashboards
  Remediation:
    1. Define SLIs (availability, latency, error rate)
    2. Set SLOs (99.9% availability, <200ms p50 latency)
    3. Build quality dashboard
    4. Implement error budget tracking
  Target Date: 2025-02-28
  Risk: High (cannot demonstrate quality commitment to customers)

✓ CC7.3 - Evaluates system processing integrity
  Status: IMPLEMENTED
  Implementation: Data validation, reconciliation processes
  Evidence:
    - ./evidence/data-validation-logs-2024.json
    - ./evidence/reconciliation-reports/
  Infrastructure:
    - Lambda (validation functions)
    - Step Functions (reconciliation workflows)
    - S3 (audit trails)
  Validation Checks:
    - Input validation (schema enforcement)
    - Output validation (completeness checks)
    - Daily reconciliation (source vs. processed)
    - Error handling (DLQ for failed messages)
  Automated Testing: Daily (reconciliation checks)
  Last Review: 2024-11-15
  Notes: 99.97% data accuracy (12 errors in 420k records)

⚠ CC7.4 - Availability monitoring
  Status: PARTIAL
  Implementation: Uptime monitoring via CloudWatch, but no external monitoring
  Evidence: ./evidence/uptime-reports-2024.json
  Infrastructure: CloudWatch, Route 53 Health Checks
  Current Monitoring:
    - Internal: CloudWatch synthetic canaries
    - DNS: Route 53 health checks
    - Missing: External third-party monitoring
  Gap: No external validation of availability
  Remediation: Implement Pingdom or UptimeRobot
  Target Date: 2025-01-30
  Risk: Low (internal monitoring sufficient, but external is best practice)

✓ CC7.5 - Recovery and continuity procedures
  Status: IMPLEMENTED
  Implementation: RTO/RPO defined, quarterly DR testing
  Evidence:
    - ./docs/disaster-recovery-plan-v3.2.pdf
    - ./evidence/dr-test-2024-Q*.pdf
  Infrastructure:
    - Multi-AZ RDS (automatic failover)
    - S3 versioning + cross-region replication
    - AMI backups (daily)
    - Terraform state backup
  Recovery Objectives:
    - RTO: 4 hours (measured)
    - RPO: 1 hour (measured)
    - Backup retention: 30 days
    - DR test frequency: Quarterly
  Last DR Test: 2024-12-05 (successful, RTO: 2.1 hours)
  Last Review: 2024-12-05
  Notes: Exceeds RTO/RPO targets

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INFRASTRUCTURE COMPONENT MAPPING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AWS Services (Primary Infrastructure):
┌────────────────────┬──────────────┬────────────────────────────┐
│ Service            │ TSC Controls │ Purpose                    │
├────────────────────┼──────────────┼────────────────────────────┤
│ IAM                │ CC6.1-6.6    │ Access control, AuthN/AuthZ│
│ KMS                │ CC6.7        │ Encryption key management  │
│ CloudTrail         │ CC7.1, CC8.1 │ Audit logging              │
│ GuardDuty          │ CC7.1        │ Threat detection           │
│ Config             │ CC7.1, CC8.1 │ Configuration tracking     │
│ CloudWatch         │ CC7.1-7.4    │ Monitoring, alerting       │
│ Secrets Manager    │ CC6.6        │ Credential management      │
│ ACM                │ CC6.8        │ Certificate management     │
│ S3                 │ CC6.7, CC7.5 │ Data storage, backups      │
│ RDS                │ CC6.7, CC7.5 │ Database (Multi-AZ)        │
│ Lambda             │ CC6.4, CC7.3 │ Automation, validation     │
└────────────────────┴──────────────┴────────────────────────────┘

Third-Party Services:
┌────────────────────┬──────────────┬────────────────────────────┐
│ Service            │ TSC Controls │ Purpose                    │
├────────────────────┼──────────────┼────────────────────────────┤
│ Okta               │ CC6.1, CC6.2 │ SSO, workforce identity    │
│ PagerDuty          │ CC7.1        │ Incident alerting          │
│ Jira               │ CC6.2, CC8.1 │ Access requests, changes   │
│ GitHub             │ CC8.1        │ Source control             │
│ Datadog            │ CC7.1, CC7.4 │ APM, logging               │
│ BambooHR           │ CC6.4        │ HR system (terminations)   │
└────────────────────┴──────────────┴────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GAPS AND REMEDIATION ROADMAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HIGH PRIORITY (Complete before audit period):

1. CC7.2 - System quality monitoring (NOT IMPLEMENTED)
   Impact: Cannot demonstrate quality commitment
   Effort: 40 hours
   Tasks:
     □ Define SLIs/SLOs (8 hours)
     □ Build quality dashboard (16 hours)
     □ Implement error budget tracking (12 hours)
     □ Document quality review process (4 hours)
   Owner: Engineering Lead
   Target: 2025-02-28

2. CC6.7 - Encrypt 3 legacy S3 buckets (PARTIAL)
   Impact: Fails encryption at rest requirement
   Effort: 8 hours
   Tasks:
     □ Enable default encryption on buckets (2 hours)
     □ Copy data to new encrypted buckets (4 hours)
     □ Validate data integrity (1 hour)
     □ Delete old buckets (1 hour)
   Owner: DevOps
   Target: 2025-01-15

MEDIUM PRIORITY (Can complete during audit period):

3. CC6.3 - Restrict overly broad permissions (PARTIAL)
   Impact: Least privilege violation
   Effort: 16 hours
   Tasks:
     □ Analyze actual usage (AWS Access Analyzer) (4 hours)
     □ Create custom least-privilege policies (8 hours)
     □ Test policies in staging (2 hours)
     □ Transition users to new policies (2 hours)
   Owner: Security Team
   Target: 2025-02-01

4. CC7.4 - Add external availability monitoring (PARTIAL)
   Impact: Best practice, external validation
   Effort: 4 hours
   Tasks:
     □ Select vendor (Pingdom recommended) (1 hour)
     □ Configure monitoring (2 hours)
     □ Set up alerting (1 hour)
   Owner: SRE
   Target: 2025-01-30

5. CC1.3 - Hire dedicated GRC resource (PARTIAL)
   Impact: Organizational structure improvement
   Effort: Ongoing (recruiting)
   Tasks:
     □ Write job description (done)
     □ Post job listing (in progress)
     □ Interview candidates (ongoing)
     □ Make offer (target: Feb 2025)
   Owner: CISO
   Target: Q1 2025

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EVIDENCE COMPLETENESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

By Control Category:
  CC1: 10/11 controls have complete evidence (91%)
  CC2:  7/8 controls have complete evidence (88%)
  CC3:  9/9 controls have complete evidence (100%)
  CC4:  7/9 controls have complete evidence (78%)
  CC5: 10/11 controls have complete evidence (91%)
  CC6: 12/15 controls have complete evidence (80%)
  CC7: 11/16 controls have complete evidence (69%)
  CC8:  6/8 controls have complete evidence (75%)
  CC9:  3/5 controls have complete evidence (60%)

Overall Evidence Completeness: 82%

Missing Evidence (must collect before audit):
□ CC4.2 - Management review meeting notes (Q4 2024)
□ CC6.3 - Least privilege policy justifications
□ CC7.2 - Quality metrics dashboard (not implemented yet)
□ CC7.4 - External uptime reports (not implemented yet)
□ CC8.1 - Change advisory board minutes (Dec 2024)
□ CC9.1 - Vendor risk assessments (2 vendors pending)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUTOMATED TESTING STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Controls with Automated Testing: 47/92 (51%)
Test Frequency:
  - Continuous: 12 controls (GuardDuty, Config)
  - Daily: 28 controls (IAM, encryption, network)
  - Weekly: 5 controls (access workflows)
  - Monthly: 2 controls (terminations, reconciliation)

Test Pass Rate (Last 30 Days):
  ✓ Passing: 44/47 controls (94%)
  ⚠ Intermittent: 2/47 controls (4%)
  ✗ Failing: 1/47 control (2%)

Failing Control:
  CC6.7 - Encryption at rest (3 unencrypted buckets)
  → Remediation in progress (target: 2025-01-15)

Intermittent Failures:
  CC6.3 - Least privilege (5 users with broad permissions)
  CC7.4 - Availability (no external monitoring yet)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before Audit Period Starts:
1. Complete CC7.2 (quality monitoring) - HIGH PRIORITY
2. Encrypt 3 legacy S3 buckets (CC6.7) - HIGH PRIORITY
3. Collect missing evidence (6 items listed above)
4. Achieve 100% implementation (currently 85%)

During Audit Period:
1. Maintain quarterly access reviews (CC6.1)
2. Conduct quarterly management reviews (CC4.2)
3. Continue automated control testing
4. Document any control changes or exceptions

Pre-Audit Preparation:
1. Run final evidence completeness check
2. Organize evidence by TSC control
3. Generate auditor-ready package: /soc2:service-auditor-prep
4. Schedule pre-audit meeting with service auditor

Continuous Improvement:
1. Increase automated testing coverage (target: 75%)
2. Implement CC7.2 quality monitoring
3. Add external availability monitoring (CC7.4)
4. Hire dedicated GRC analyst (CC1.3)
```

## Export Formats

### CSV Export

```bash
/soc2:generate-tsc-matrix all csv

# Output: Control,Category,Status,Implementation,Evidence,Infrastructure,LastReview
# CC1.1,Control Environment,Implemented,Org chart with security roles,./docs/org-chart-2024.pdf,N/A,2024-01-15
# CC6.1,Logical Access,Implemented,AWS IAM + MFA + quarterly reviews,./evidence/iam-users-*.json,AWS IAM + Okta,2024-12-31
# ...
```

### JSON Export

```bash
/soc2:generate-tsc-matrix all json

# Output:
{
  "organization": "Your Company",
  "date": "2025-01-28",
  "scope": "Security (CC1-CC9)",
  "summary": {
    "total_controls": 92,
    "implemented": 78,
    "partial": 11,
    "not_implemented": 2,
    "not_applicable": 1,
    "implementation_percentage": 0.85
  },
  "controls": [
    {
      "id": "CC6.1",
      "category": "Logical and Physical Access",
      "status": "implemented",
      "implementation": "AWS IAM with MFA, quarterly access reviews",
      "evidence": [
        "./evidence/iam-users-2024-Q*.json",
        "./evidence/access-reviews/2024-Q*-review.pdf"
      ],
      "infrastructure": ["AWS IAM", "AWS SSO", "Okta"],
      "automated_testing": "daily",
      "last_review": "2024-12-31"
    }
  ],
  "gaps": [...],
  "recommendations": [...]
}
```

## Integration with Other Commands

### 1. Gap Analysis → TSC Matrix

```bash
# First, run assessment
/soc2:assess security type2

# Then generate matrix to see implementation status
/soc2:generate-tsc-matrix security
```

### 2. TSC Matrix → Code Generation

```bash
# Generate matrix to identify gaps
/soc2:generate-tsc-matrix all json > gaps.json

# Generate implementation for missing controls
/engineer:generate-implementation CC7.2 aws
```

### 3. TSC Matrix → Evidence Collection

```bash
# Identify controls missing evidence
/soc2:generate-tsc-matrix security table | grep "Missing evidence"

# Generate evidence checklist for that control
/soc2:evidence-checklist CC6.7
```

## Use Cases

### Use Case 1: Readiness Assessment

```bash
# 3 months before audit period
/soc2:generate-tsc-matrix all table

# Review summary section
# Identify "NOT IMPLEMENTED" and "PARTIAL" controls
# Prioritize remediation based on risk
```

### Use Case 2: Board Reporting

```bash
# Generate executive summary
/soc2:generate-tsc-matrix all csv > soc2-status.csv

# Import to spreadsheet
# Add to board deck showing 85% implementation
```

### Use Case 3: Continuous Monitoring

```bash
# Monthly during audit period
/soc2:generate-tsc-matrix security json > tsc-$(date +%Y%m).json

# Track implementation percentage over time
# Detect control degradation
```

### Use Case 4: Auditor Preparation

```bash
# 2 weeks before audit
/soc2:generate-tsc-matrix all table > tsc-matrix.txt

# Review evidence completeness
# Ensure all "Implemented" controls have evidence
# Package evidence by control ID
```

## Related Commands

- `/soc2:assess` - Gap analysis and readiness assessment
- `/soc2:evidence-checklist` - Detailed evidence requirements per control
- `/soc2:type-ii-planner` - Plan Type II audit period timeline
- `/soc2:service-auditor-prep` - Generate auditor-ready evidence package
- `/engineer:test-control` - Automated control testing
- `/engineer:generate-implementation` - Generate code for missing controls
