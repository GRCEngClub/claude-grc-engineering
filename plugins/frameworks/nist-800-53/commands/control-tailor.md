---
description: Interactive NIST 800-53 control tailoring for specific baselines and environments
---

# NIST 800-53 Control Tailoring

Provides interactive control tailoring guidance for NIST 800-53 baselines, helping organizations customize controls based on risk assessment, operational requirements, and technology constraints while maintaining compliance.

## Usage

```bash
/nist:control-tailor <control-id> <baseline> [options]
```

## Arguments

- `$1` - Control ID (e.g., "AC-2", "AU-2", "SC-7") or family (e.g., "AC", "AU")
- `$2` - Baseline: "low", "moderate", "high", "privacy"
- `$3` - Options (optional): `--environment=cloud|hybrid|on-prem`, `--output=guidance|ssp-text|yaml`

## Examples

```bash
# Tailor single control for moderate baseline
/nist:control-tailor AC-2 moderate

# Tailor control for cloud environment
/nist:control-tailor AC-2 moderate --environment=cloud

# Tailor entire control family
/nist:control-tailor AC moderate

# Generate SSP-ready text
/nist:control-tailor SC-7 high --output=ssp-text

# Export tailoring decisions as YAML
/nist:control-tailor AC-2 moderate --output=yaml
```

## Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NIST 800-53 CONTROL TAILORING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Control: AC-2 - Account Management
Baseline: Moderate
Environment: Cloud (AWS)
Organization: Your Company

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BASELINE CONTROL STATEMENT (Rev 5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AC-2: Account Management

The organization:
  a. Identifies and selects the following types of information system accounts
     to support organizational missions/business functions: [Assignment: organization-
     defined information system account types];

  b. Assigns account managers for information system accounts;

  c. Establishes conditions for group and role membership;

  d. Specifies authorized users of the information system, group and role membership,
     and access authorizations (i.e., privileges) and other attributes (as required)
     for each account;

  e. Requires approvals by [Assignment: organization-defined personnel or roles]
     for requests to create information system accounts;

  f. Creates, enables, modifies, disables, and removes information system accounts
     in accordance with [Assignment: organization-defined procedures or conditions];

  g. Monitors the use of information system accounts;

  h. Notifies account managers when accounts are no longer required or when users
     are terminated or transferred;

  i. Authorizes access to the information system based on a valid access authorization,
     intended system usage, and other attributes as required;

  j. Reviews accounts for compliance with account management requirements
     [Assignment: organization-defined frequency]; and

  k. Establishes a process for reissuing shared/group account credentials when
     individuals are removed from the group.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTROL ENHANCEMENTS (Select for Moderate Baseline)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Baseline Includes:
✓ AC-2(1) - Automated System Account Management
✓ AC-2(2) - Removal of Temporary / Emergency Accounts
✓ AC-2(3) - Disable Inactive Accounts
✓ AC-2(4) - Automated Audit Actions
✓ AC-2(5) - Inactivity Logout
✓ AC-2(13) - Disable Accounts for High-Risk Individuals

Additional Enhancements Available (Optional):
□ AC-2(6) - Dynamic Privilege Management
□ AC-2(7) - Privileged User Accounts
□ AC-2(8) - Dynamic Account Creation
□ AC-2(9) - Restrictions on Use of Shared Groups / Accounts
□ AC-2(11) - Usage Conditions
□ AC-2(12) - Account Monitoring / Atypical Usage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDED ENHANCEMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on: Cloud environment, Financial services sector, PCI-DSS overlap

STRONGLY RECOMMENDED (High ROI):

✓ AC-2(1) - Automated System Account Management
  Impact: HIGH
  Cost: MEDIUM
  Justification:
    - Reduces manual errors in provisioning/deprovisioning
    - Ensures timely access removal (compliance requirement)
    - Provides audit trail for all account changes
  Cloud Implementation:
    - AWS: IAM + Identity Center + Lambda for automation
    - Azure: Azure AD + PIM + Logic Apps
    - GCP: Cloud Identity + Workflows
  Effort: 40 hours (initial setup), 2 hours/month (maintenance)
  Satisfies: SOC2 CC6.1, PCI 8.1.4, ISO 27001 A.9.2

✓ AC-2(2) - Removal of Temporary / Emergency Accounts
  Impact: HIGH
  Cost: LOW
  Justification:
    - Prevents forgotten emergency accounts from becoming security risk
    - Required for high-sensitivity environments
    - Easy to implement with automation
  Cloud Implementation:
    - EventBridge rule to check account age
    - Lambda to disable accounts older than 72 hours
    - SNS notification before auto-disable
  Effort: 8 hours (one-time setup)
  Satisfies: ISO 27001 A.9.2.6

✓ AC-2(3) - Disable Inactive Accounts
  Impact: HIGH
  Cost: LOW
  Justification:
    - Reduces attack surface (inactive accounts = security risk)
    - Required for PCI-DSS compliance (90 days)
    - Aligns with SOC 2 best practices
  Cloud Implementation:
    - IAM credential report analysis
    - Automated disable after 90 days inactivity
    - Manager notification before disable
  Effort: 12 hours
  Satisfies: PCI 8.1.4, SOC2 CC6.1

✓ AC-2(4) - Automated Audit Actions
  Impact: HIGH
  Cost: MEDIUM
  Justification:
    - Creates audit trail for all account management
    - Enables security analytics and threat detection
    - Required for forensics and incident response
  Cloud Implementation:
    - CloudTrail for all IAM API calls
    - CloudWatch Logs with 1-year retention
    - GuardDuty for anomaly detection
  Effort: 16 hours
  Satisfies: SOC2 CC7.2, PCI 10.2

RECOMMENDED (Good Value):

⊕ AC-2(9) - Restrictions on Use of Shared Groups / Accounts
  Impact: MEDIUM
  Cost: LOW
  Justification:
    - Improves accountability (no shared accounts)
    - Best practice for access control
    - Easy to implement in cloud (IAM users are naturally unique)
  Cloud Implementation:
    - Policy: Prohibit shared IAM users
    - Service accounts documented and approved
    - Automated check via Config rule
  Effort: 4 hours
  Satisfies: PCI 8.1, SOC2 CC6.1

⊕ AC-2(12) - Account Monitoring / Atypical Usage
  Impact: MEDIUM
  Cost: MEDIUM
  Justification:
    - Detects compromised accounts
    - Enables proactive security response
    - Complements existing monitoring
  Cloud Implementation:
    - GuardDuty for anomaly detection
    - CloudWatch anomaly detection
    - SIEM integration (Splunk, DataDog)
  Effort: 24 hours
  Satisfies: NIST IR family

OPTIONAL (Consider for High Baseline Only):

○ AC-2(6) - Dynamic Privilege Management
  Impact: LOW
  Cost: HIGH
  Justification:
    - Complex to implement and maintain
    - Benefits limited unless handling very sensitive data
    - Better suited for zero-trust architectures
  Cloud Implementation: Difficult (requires custom PAM solution)
  Effort: 200+ hours
  Skip unless: Handling classified data, DoD requirements

○ AC-2(7) - Privileged User Accounts
  Impact: MEDIUM
  Cost: MEDIUM
  Justification:
    - Adds overhead (separate privileged accounts)
    - Cloud IAM roles provide similar separation
    - Not required for moderate baseline
  Cloud Implementation: Separate admin IAM users (not federated)
  Effort: 16 hours
  Consider if: Banking/finance, healthcare PHI

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAILORING DECISIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Organization-Defined Parameters:

[Assignment: organization-defined information system account types]
TAILORED TO:
  - Individual user accounts (workforce - federated via Okta)
  - Service accounts (applications - IAM roles)
  - Emergency access accounts (break-glass - max 72 hours)
  - Contractor accounts (temporary - max 6 months)

JUSTIFICATION: Cloud-only environment uses federated SSO for workforce
              and IAM roles for services, reducing account sprawl.

[Assignment: organization-defined personnel or roles]
TAILORED TO:
  - Standard accounts: Direct manager approval
  - Privileged accounts: CISO approval + manager approval
  - Service accounts: Application owner + Security team approval
  - Emergency accounts: CISO approval only

JUSTIFICATION: Aligns with organizational structure and risk tolerance.

[Assignment: organization-defined procedures or conditions]
TAILORED TO:
  - Automated provisioning via Okta/AWS SSO upon manager approval
  - Automated deprovisioning within 4 hours of HR termination
  - Quarterly access reviews by resource owners
  - Immediate disable for high-risk terminations (security incidents)

JUSTIFICATION: Automation reduces errors, improves timeliness.

[Assignment: organization-defined frequency]
TAILORED TO:
  - Quarterly reviews for all accounts (PCI requirement)
  - Monthly reviews for privileged accounts
  - Daily automated checks for inactive accounts (>90 days)

JUSTIFICATION: More restrictive than annual baseline requirement due to
              PCI-DSS overlap and cloud environment rapid changes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPLEMENTATION GUIDANCE (Cloud-Specific)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AWS Implementation:

Account Types:
  ✓ Individual: AWS SSO federated users (via Okta)
  ✓ Service: IAM roles (for EC2, Lambda, ECS)
  ✓ Emergency: IAM users with MFA (disabled by default)

Automated Management (AC-2(1)):
  - Lambda function: sync-okta-to-sso
    Trigger: Okta webhook on user create/update/delete
    Action: Provision/update/deprovision AWS SSO user
    Evidence: CloudTrail logs of IAM::CreateUser events

Temporary Account Removal (AC-2(2)):
  - EventBridge rule: check-emergency-accounts
    Schedule: Daily at 9 AM UTC
    Action: Disable accounts with tag "Type=Emergency" older than 72h
    Evidence: Lambda execution logs

Inactive Account Detection (AC-2(3)):
  - Lambda function: check-inactive-accounts
    Schedule: Daily
    Logic: IAM credential report, last login > 90 days
    Action: Send warning email, disable after 7 days
    Evidence: S3 bucket with credential reports

Audit Logging (AC-2(4)):
  - CloudTrail: All IAM API calls
  - CloudWatch Logs: 365-day retention
  - S3: Long-term archive (3 years)
  - GuardDuty: Anomaly detection
  Evidence: CloudTrail event history

Azure Implementation:

Account Types:
  ✓ Individual: Azure AD users (federated via Okta)
  ✓ Service: Managed identities
  ✓ Emergency: Break-glass accounts (cloud-only, PIM)

Automated Management (AC-2(1)):
  - Logic Apps: Sync Okta to Azure AD
  - PIM: Just-in-time privileged access
  - Lifecycle workflows: Automated provisioning/deprovisioning

GCP Implementation:

Account Types:
  ✓ Individual: Cloud Identity (federated)
  ✓ Service: Service accounts
  ✓ Emergency: Break-glass accounts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAILORED CONTROL STATEMENT (SSP-Ready)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What Responsible: Information Security, IT Operations
What Implemented: January 2024

AC-2: Account Management

Your Company manages information system accounts through automated provisioning
integrated with our HR system (BambooHR) and identity provider (Okta). The
organization maintains the following account types:

  a. Account Types:
     - Workforce accounts (federated via Okta to AWS SSO)
     - Service accounts (AWS IAM roles for applications)
     - Emergency access accounts (break-glass, disabled by default, max 72 hours)
     - Contractor accounts (temporary, max 6 months)

  b. Account managers are assigned based on organizational structure:
     - IT Operations manages workforce accounts
     - Application teams manage service accounts
     - CISO manages emergency access accounts

  c. Group and role membership is established based on job function using role-based
     access control (RBAC). Roles are documented in the Access Control Policy v1.8.

  d. Authorized users, group membership, and privileges are specified in Okta and
     automatically synchronized to AWS SSO. Access authorizations are documented
     in access request tickets (Jira Service Desk).

  e. Account creation approvals:
     - Standard accounts: Direct manager approval via Jira
     - Privileged accounts: Manager + CISO approval
     - Service accounts: Application owner + Security team approval

  f. Account lifecycle is managed through automated workflows:
     - Creation: Okta webhook triggers AWS SSO provisioning
     - Modification: Jira approval workflow + automated update
     - Disable: Automated within 4 hours of HR termination event
     - Removal: 90 days after disable (after verification)

  g. Account usage is monitored through:
     - CloudTrail (all IAM API activity)
     - GuardDuty (anomaly detection)
     - Daily credential report analysis (inactive accounts)

  h. Account managers are notified automatically:
     - HR termination event triggers immediate Slack/email notification
     - Quarterly access review lists include account manager
     - Inactive account warnings sent to managers 7 days before disable

  i. Access authorization is based on:
     - Valid Jira approval ticket
     - HR system confirmation of active employment
     - Okta group membership (synchronized from HR)
     - Least privilege principle (minimum necessary access)

  j. Accounts are reviewed quarterly (every 90 days) by resource owners and
     managers. Privileged accounts are reviewed monthly. Reviews are documented
     and stored in the compliance evidence repository.

  k. Service accounts (shared by nature) have credentials rotated when team
     membership changes. Credentials are stored in AWS Secrets Manager with
     automatic rotation enabled.

Control Enhancements Implemented:
  - AC-2(1): Automated provisioning/deprovisioning via Okta + Lambda
  - AC-2(2): Automatic disable of emergency accounts after 72 hours
  - AC-2(3): Automated disable of inactive accounts after 90 days
  - AC-2(4): CloudTrail logging of all account management actions
  - AC-2(9): Prohibition of shared user accounts (policy enforced)

Evidence:
  - Access Control Policy v1.8 (approved 2024-01-15)
  - Okta to AWS SSO integration documentation
  - Lambda function: sync-okta-to-sso (source code + logs)
  - Quarterly access review reports (2024-Q1 through Q4)
  - CloudTrail logs (full year, 365-day retention)
  - Jira access request tickets (sample 25)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TESTING AND VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Control Effectiveness Testing:

✓ Design Testing (Point-in-Time):
  - Review Access Control Policy for completeness
  - Verify automated provisioning workflow exists
  - Validate approval matrix (manager, CISO, security)
  - Confirm CloudTrail logging enabled

✓ Operating Effectiveness Testing (Period):
  - Sample 25 access requests: verify approval before access
  - Sample 25 terminations: verify timely deprovisioning (<4 hours)
  - Sample 4 quarterly reviews: verify completeness and sign-off
  - Review CloudTrail logs for unauthorized account changes
  - Test emergency account auto-disable (create test account)
  - Test inactive account detection (check credential report)

Test Commands:
```bash
# Test automated provisioning
/grc-engineer:test-control AC-2

# Validate CloudTrail logging
aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=CreateUser

# Check inactive accounts
aws iam generate-credential-report
aws iam get-credential-report

# Verify access reviews exist
ls -l ./evidence/access-reviews/2024-Q*
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPENSATING CONTROLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If Unable to Implement Enhancement:

Cannot implement AC-2(1) - Automated Account Management:
  Compensating Control:
    - Daily manual review of pending access requests
    - HR sends termination list to IT daily (not real-time)
    - Weekly manual review of all active accounts
  Risk Acceptance:
    - Higher risk of delayed deprovisioning
    - Increased manual effort and potential errors
  Approval Required: CISO + Risk Committee

Cannot implement AC-2(3) - Disable Inactive Accounts:
  Compensating Control:
    - Monthly manual review of IAM credential report
    - Manager attestation for inactive accounts (justification)
    - Quarterly verification that attested accounts still need access
  Risk Acceptance:
    - Inactive accounts remain enabled longer
    - Increased attack surface
  Approval Required: CISO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Immediate Actions:

1. Implement AC-2(1), AC-2(2), AC-2(3), AC-2(4) (core enhancements)
2. Generate IaC for implementation: /soc2:gap-to-code gaps.json aws
3. Document tailoring decisions in SSP
4. Update Access Control Policy with tailored parameters

Within 3 Months:

1. Consider AC-2(9) if shared accounts still exist
2. Evaluate AC-2(12) for enhanced monitoring
3. Review if AC-2(7) needed (separate privileged accounts)

Continuous:

1. Test control effectiveness: /grc-engineer:test-control AC-2
2. Review tailoring decisions annually
3. Update as cloud environment evolves

```

## YAML Export

```yaml
control: AC-2
baseline: moderate
environment: cloud
tailoring_date: 2025-01-28
organization: Your Company

enhancements_selected:
  - id: AC-2(1)
    name: Automated System Account Management
    selected: true
    justification: "Reduces manual errors, required for timely terminations"
    implementation: "Okta webhook + AWS Lambda + SSO"

  - id: AC-2(2)
    name: Removal of Temporary / Emergency Accounts
    selected: true
    justification: "Prevents forgotten emergency accounts"
    implementation: "EventBridge + Lambda (72-hour expiry)"

  - id: AC-2(3)
    name: Disable Inactive Accounts
    selected: true
    justification: "PCI-DSS requirement (90 days)"
    implementation: "Daily Lambda checks IAM credential report"

  - id: AC-2(4)
    name: Automated Audit Actions
    selected: true
    justification: "Audit trail required for compliance"
    implementation: "CloudTrail + CloudWatch Logs (365 days)"

  - id: AC-2(9)
    name: Restrictions on Use of Shared Groups / Accounts
    selected: true
    justification: "Best practice, improves accountability"
    implementation: "Policy + AWS Config rule check"

parameters:
  account_types:
    - Workforce (federated via Okta)
    - Service accounts (IAM roles)
    - Emergency access (break-glass, 72h max)
    - Contractors (max 6 months)

  approval_roles:
    standard: "Direct manager"
    privileged: "Manager + CISO"
    service: "App owner + Security"
    emergency: "CISO only"

  review_frequency:
    standard: "Quarterly (90 days)"
    privileged: "Monthly (30 days)"
    automated: "Daily (inactive check)"

  procedures:
    provisioning: "Automated via Okta webhook"
    deprovisioning: "Automated within 4 hours"
    modification: "Jira approval + automated update"
```

## Related Commands

- `/nist:select-baseline` - Select appropriate NIST baseline
- `/nist:overlay-apply` - Apply FedRAMP, DoD, or privacy overlays
- `/nist:ssp-section-generate` - Generate SSP text from tailoring
- `/grc-engineer:generate-implementation` - Generate IaC for controls
- `/grc-engineer:test-control` - Test control effectiveness
- `/soc2:gap-to-code` - Generate cloud infrastructure for gaps
