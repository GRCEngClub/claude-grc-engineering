---
name: evidence-checklist
description: Generate evidence checklist for SOC 2 controls
---

# SOC 2 Evidence Checklist

Generates detailed evidence collection checklists for SOC 2 Trust Service Criteria with automated and manual collection guidance.

> **Never commit evidence artifacts to source control.** The outputs below include real usernames, credential reports, MFA device states, and privileged-account inventories. `.gitignore` covers `evidence/` by default so `git add -A` will not sweep it up, but durable storage is your responsibility. Use an encrypted, access-controlled evidence locker (encrypted S3 with least-privilege IAM, a GRC platform, or a shared drive with full-disk encryption and MFA-gated access).

## Usage

```bash
/soc2:evidence-checklist <control-id> [audit-type]
```

## Arguments

- Argument 1 - Control ID (e.g., "CC6.1", "CC7.2", "A1.1") or category (e.g., "CC6", "security")
- Argument 2 - Audit type (optional): "type1" (point-in-time) or "type2" (period) - default: "type2"

## Examples

```bash
# Single control evidence requirements
/soc2:evidence-checklist CC6.1

# All access control evidence (CC6 family)
/soc2:evidence-checklist CC6

# Type I audit (point-in-time)
/soc2:evidence-checklist CC7.2 type1

# Full security category
/soc2:evidence-checklist security type2
```

## Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOC 2 EVIDENCE CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Control: CC6.1 - Logical and Physical Access Controls
Category: Common Criteria - Security
Audit Type: Type II (Period Testing: 6-12 months)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUIRED POLICIES & PROCEDURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Access Control Policy
  Status: Required
  Format: PDF, Word
  Requirements:
    - Documented access request/approval process
    - Access review frequency (minimum quarterly)
    - Privileged access management procedures
    - Termination/transfer procedures
  Location: ./policies/access-control-policy.pdf
  Last Updated: Must be within 12 months
  Approval: Requires executive sign-off

□ User Access Provisioning Procedure
  Status: Required
  Format: PDF, Word, Wiki
  Requirements:
    - Step-by-step provisioning workflow
    - Role-based access matrix
    - Approval requirements by access level
    - Documentation requirements
  Location: ./procedures/user-provisioning.md

□ Access Review Procedure
  Status: Required (Type II: 4 instances minimum)
  Format: PDF, Word
  Requirements:
    - Review frequency (quarterly for Type II)
    - Responsible parties
    - Escalation process for violations
    - Documentation requirements

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUTOMATED EVIDENCE COLLECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ IAM User Inventory
  Command: aws iam list-users > evidence/iam-users-$(date +%Y%m%d).json
  Frequency: Quarterly (4 snapshots for Type II)
  Purpose: Demonstrates unique user IDs
  Collection script: ./scripts/collect-iam-users.sh

✓ IAM Credential Report
  Command: aws iam generate-credential-report && \
           aws iam get-credential-report --output text | base64 -d
  Frequency: Quarterly
  Purpose: Shows last login, password age, MFA status
  Evidence: CSV file with all user credentials

✓ Access Analyzer Findings
  Command: aws accessanalyzer list-findings --analyzer-arn <arn>
  Frequency: Monthly
  Purpose: Unused access detection
  Evidence: JSON report of external/unused access

✓ CloudTrail IAM Events
  Command: aws cloudtrail lookup-events \
           --lookup-attributes AttributeKey=ResourceType,AttributeValue=AWS::IAM::User \
           --start-time <date> --end-time <date>
  Frequency: Full audit period
  Purpose: All account management actions logged
  Evidence: JSON file of IAM events (CreateUser, DeleteUser, etc.)

✓ MFA Status Report
  Command: aws iam get-account-summary
  Frequency: Quarterly
  Purpose: MFA enforcement verification
  Evidence: Account summary showing MFA metrics

Automated Script:
```bash
./scripts/soc2-cc6-1-evidence.sh --period 2024-Q4
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANUAL EVIDENCE COLLECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Access Request Tickets
  Status: Required
  Sample Size: 25 samples (or 100% if <25 total)
  Evidence:
    - Jira/ServiceNow tickets showing access requests
    - Approval from manager
    - Access granted matches request
    - Ticket closed after provisioning
  Sampling Period: Full audit period (6-12 months)
  Location: Export from ticketing system
  Format: Screenshots or PDF exports

□ Quarterly Access Reviews
  Status: Required (Type II: 4 reviews minimum)
  Evidence:
    - Access review reports showing all users
    - Review performed by authorized personnel
    - Exceptions documented and remediated
    - Management approval of review results
  Dates Required (for 2024): Q1 (Mar), Q2 (Jun), Q3 (Sep), Q4 (Dec)
  Location: ./evidence/access-reviews/2024-Q*-review.pdf

□ Termination Evidence
  Status: Required
  Sample Size: All terminations during period
  Evidence:
    - HR termination notice/date
    - IT ticket showing access removal
    - IAM user deactivation timestamp
    - Verification that access was removed same-day
  Purpose: Demonstrates timely access removal
  Location: ./evidence/terminations/

□ Privileged Access Justifications
  Status: Required for admin users
  Sample Size: All privileged users (typically 5-15)
  Evidence:
    - Business justification for admin access
    - Manager approval
    - Quarterly re-certification
    - Enhanced monitoring logs
  Location: ./evidence/privileged-access/

□ Physical Access Logs (if applicable)
  Status: Required if on-premise infrastructure
  Evidence:
    - Badge swipe logs for data center
    - Visitor logs
    - Access approval for contractors
  Period: Full audit period
  Note: Not required for cloud-only environments

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTROL TESTING EVIDENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Automated Control Tests
  Command: /engineer:test-control access_control_account_management
  Frequency: Daily (automated)
  Purpose: Continuous validation of control effectiveness
  Evidence: test-results-*.json files

□ Auditor Testing Workpapers
  Status: Provided by auditor
  Evidence:
    - Sample selection methodology
    - Test procedures performed
    - Exceptions noted
    - Conclusion on control effectiveness
  Note: Auditor generates this, you provide source data

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SAMPLING REQUIREMENTS (Type II)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Population: All access requests during audit period
Sampling Method: Random or systematic
Sample Size:

- If population < 25: 100% testing (all items)
- If population 25-100: Minimum 25 samples
- If population > 100: Minimum 25 samples + judgment sampling

Quarterly Coverage: Each quarter must have samples
  Q1: Minimum 6 samples (25% of year)
  Q2: Minimum 6 samples
  Q3: Minimum 6 samples
  Q4: Minimum 7 samples
  Total: 25 samples minimum

Example for 200 total requests:

- 25 random samples (12.5%)
- Distributed across 12 months
- Additional 5 judgmental samples (high-risk access)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADEQUACY CRITERIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Policy Requirements:
✓ Policy document exists and is current (<12 months)
✓ Policy approved by executive management
✓ Policy communicated to relevant personnel
✓ Policy addresses all key control points

Process Requirements:
✓ Access provisioning follows documented procedure
✓ Access requires approval before granting
✓ Access reviews performed at stated frequency (quarterly)
✓ Terminations processed same-day or next business day

Technical Requirements:
✓ All users have unique identifiers (no shared accounts)
✓ Privileged access separated from normal access
✓ MFA enabled for remote/privileged access (if in policy)
✓ All access changes logged in CloudTrail/audit log
✓ Audit logs retained for minimum 1 year

Exception Handling:
⚠ Zero unresolved Access Analyzer findings
⚠ All access review exceptions documented and approved
⚠ No unauthorized access detected in testing
⚠ All termination access removed within 24 hours

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMON DEFICIENCIES TO AVOID
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Access review not performed for all 4 quarters
   Impact: Control deficiency, qualification in report
   Fix: Ensure reviews scheduled quarterly, not "as needed"

❌ No approval documentation for access requests
   Impact: Cannot demonstrate proper authorization
   Fix: Require tickets for all access (even verbal requests)

❌ Terminations not processed timely (>24 hours)
   Impact: Security risk, control deficiency
   Fix: Automated deprovisioning on HR system update

❌ Shared administrator accounts
   Impact: Cannot attribute actions to individuals
   Fix: Unique admin accounts per person

❌ Access reviews incomplete (missing users)
   Impact: Control not operating effectively
   Fix: Automated user export, checklist validation

❌ Policy not updated annually
   Impact: Documentation deficiency
   Fix: Annual review process with calendar reminder

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TYPE I vs TYPE II DIFFERENCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Type I (Point-in-Time):

- Single snapshot on specific date
- Policy must be in effect on exam date
- Sample size: 1-5 samples for design effectiveness
- Access review: Only need current review
- Duration: Typically 1-2 weeks

Type II (Period Testing):

- Minimum 6 months, typically 12 months
- Policy must be in effect entire period
- Sample size: 25+ samples across entire period
- Access reviews: 2 minimum (6 months) or 4 (12 months)
- Duration: Typically 2-4 weeks of audit work

Recommendation: Type II provides more value and market trust

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EVIDENCE PACKAGE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

evidence/
├── CC6.1-access-control/
│   ├── policies/
│   │   ├── access-control-policy-v2.1.pdf
│   │   └── policy-approval-memo.pdf
│   ├── procedures/
│   │   ├── user-provisioning-procedure.pdf
│   │   └── access-review-procedure.pdf
│   ├── automated/
│   │   ├── 2024-Q1-iam-users.json
│   │   ├── 2024-Q2-iam-users.json
│   │   ├── 2024-Q3-iam-users.json
│   │   ├── 2024-Q4-iam-users.json
│   │   ├── credential-reports/ (quarterly)
│   │   └── cloudtrail-iam-events-full-period.json
│   ├── manual/
│   │   ├── access-requests/ (25 samples)
│   │   ├── access-reviews/ (4 quarterly reviews)
│   │   ├── terminations/ (all during period)
│   │   └── privileged-access/ (justifications)
│   └── testing/
│       ├── control-test-results-*.json
│       └── evidence-checklist-completed.pdf

Total Evidence Files: ~50-75 files
Total Size: ~100-500 MB
Ready for Auditor: Yes (organized by control)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUTOMATED EVIDENCE COLLECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate complete evidence package:

```bash
/soc2:service-auditor-prep CC6.1 --period 2024 --output ./evidence
```

This will:
✓ Collect all automated evidence (IAM, CloudTrail, etc.)
✓ Generate evidence checklist with gaps identified
✓ Create folder structure for manual evidence
✓ Produce evidence matrix spreadsheet
✓ Generate draft PBC (Provided By Client) list

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Review checklist and identify gaps
2. Collect automated evidence using provided scripts
3. Gather manual evidence (tickets, reviews, etc.)
4. Organize evidence in recommended structure
5. Run /soc2:service-auditor-prep to package for auditor
6. Review with audit team before providing to auditor

```

## Related Commands

- `/soc2:assess` - SOC 2 readiness assessment
- `/soc2:type-ii-planner` - Plan Type II period testing
- `/soc2:service-auditor-prep` - Generate auditor-ready package
- `/engineer:test-control` - Automated control testing
- `/engineer:collect-evidence` - General evidence collection
