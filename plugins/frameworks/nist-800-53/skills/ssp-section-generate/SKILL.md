---
name: ssp-section-generate
description: Generate System Security Plan (SSP) sections for NIST 800-53 controls
---

# NIST 800-53 SSP Section Generator

Generates production-ready System Security Plan (SSP) sections for NIST 800-53 controls, including control statements, implementation details, responsible roles, and evidence references in compliance with FedRAMP and NIST templates.

## Usage

```bash
/nist:ssp-section-generate <control-id> [template] [options]
```

## Arguments

- Argument 1 - Control ID (e.g., "AC-2", "AU-2") or family (e.g., "AC", "AU")
- Argument 2 - Template (optional): "fedramp", "nist", "dod", "custom" (default: "fedramp")
- Argument 3 - Options (optional): `--format=docx|markdown|yaml`, `--include-evidence`

## Examples

```bash
# Generate single control SSP section
/nist:ssp-section-generate AC-2 fedramp

# Generate entire family
/nist:ssp-section-generate AC fedramp

# Export as Word document
/nist:ssp-section-generate AC-2 fedramp --format=docx

# Include evidence references
/nist:ssp-section-generate AC-2 fedramp --include-evidence
```

## Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SSP SECTION: AC-2 - ACCOUNT MANAGEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Template: FedRAMP Rev 5 Moderate
System: Your Company Cloud Platform
Date: 2025-01-28

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTROL SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Control Identifier: AC-2
Control Name: Account Management
Control Family: Access Control (AC)
Baseline: Moderate
Implementation Status: Implemented
Responsible Role: Information Security, IT Operations
Implementation Date: January 2024

Control Enhancements:
  ✓ AC-2(1) - Automated System Account Management
  ✓ AC-2(2) - Removal of Temporary / Emergency Accounts
  ✓ AC-2(3) - Disable Inactive Accounts
  ✓ AC-2(4) - Automated Audit Actions
  ✓ AC-2(9) - Restrictions on Use of Shared Groups / Accounts
  ✓ AC-2(12) - Account Monitoring / Atypical Usage (FedRAMP)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART A: CONTROL REQUIREMENT (FEDRAMP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AC-2: Account Management

The organization:

a. Identifies and selects the following types of information system accounts
   to support organizational missions/business functions: [Assignment:
   organization-defined information system account types];

b. Assigns account managers for information system accounts;

c. Establishes conditions for group and role membership;

d. Specifies authorized users of the information system, group and role
   membership, and access authorizations (i.e., privileges) and other
   attributes (as required) for each account;

e. Requires approvals by [Assignment: organization-defined personnel or roles]
   for requests to create information system accounts;

f. Creates, enables, modifies, disables, and removes information system
   accounts in accordance with [Assignment: organization-defined procedures
   or conditions];

g. Monitors the use of information system accounts;

h. Notifies account managers:
    1. When accounts are no longer required;
    2. When users are terminated or transferred; and
    3. When individual information system usage or need-to-know changes;

i. Authorizes access to the information system based on:
    1. A valid access authorization;
    2. Intended system usage; and
    3. Other attributes as required by the organization or associated missions/
       business functions;

j. Reviews accounts for compliance with account management requirements
   [Assignment: organization-defined frequency]; and

k. Establishes a process for reissuing shared/group account credentials
   (if deployed) when individuals are removed from the group.

Control Enhancements:

AC-2(1): The organization employs automated mechanisms to support the management
         of information system accounts.

AC-2(2): The information system automatically [Selection: removes; disables]
         temporary and emergency accounts after [Assignment: organization-
         defined time period for each type of account].

AC-2(3): The information system automatically disables inactive accounts after
         [Assignment: organization-defined time period].

AC-2(4): The information system automatically audits account creation,
         modification, enabling, disabling, and removal actions, and notifies
         [Assignment: organization-defined personnel or roles].

AC-2(9): The organization only permits the use of shared/group accounts that
         meet [Assignment: organization-defined conditions for establishing
         shared/group accounts].

AC-2(12): The organization: (a) Monitors information system accounts for
          [Assignment: organization-defined atypical use]; and (b) Reports
          atypical usage of information system accounts to [Assignment:
          organization-defined personnel or roles].

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART B: CONTROL IMPLEMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AC-2: Account Management

Your Company manages information system accounts for the [System Name] through
automated provisioning integrated with our authoritative HR system (BambooHR)
and enterprise identity provider (Okta). This control ensures that access to
organizational information systems is appropriately authorized, monitored, and
reviewed.

AC-2(a) - Account Types

Your Company maintains the following account types to support organizational
missions and business functions:

  1. Workforce Accounts (Individual User Accounts)
     - Purpose: Daily operational access for employees and contractors
     - Authentication: Federated via Okta SSO to AWS IAM Identity Center
     - Lifecycle: Created upon hire, disabled upon termination
     - Count: Approximately 142 active users (as of December 2024)
     - Naming Convention: firstname.lastname@company.com

  2. Service Accounts (Application Accounts)
     - Purpose: Automated system-to-system communication
     - Implementation: AWS IAM roles (not user accounts)
     - Examples: Lambda execution roles, ECS task roles, EC2 instance profiles
     - Count: 23 active service roles
     - Naming Convention: service-[app-name]-[environment]

  3. Emergency Access Accounts (Break-Glass Accounts)
     - Purpose: Emergency access when SSO unavailable
     - Implementation: IAM users with MFA, normally disabled
     - Approval: CISO approval required for creation and use
     - Expiration: Automatically disabled after 72 hours
     - Count: 2 accounts (root alternative, emergency admin)

  4. Contractor Accounts (Temporary Accounts)
     - Purpose: Short-term access for consultants and vendors
     - Authentication: Federated via Okta (same as workforce)
     - Expiration: Maximum 6-month duration, extended only with approval
     - Count: Variable (5-10 active at any time)

AC-2(b) - Account Managers

Account managers are assigned based on organizational structure and account type:

  - Workforce Accounts: Managed by IT Operations team
    Contact: it-ops@company.com
    Responsibilities: Provisioning, access reviews, compliance monitoring

  - Service Accounts: Managed by application development teams
    Contact: Application owners (documented in Jira)
    Responsibilities: Role creation, permission assignment, quarterly review

  - Emergency Access Accounts: Managed by CISO
    Contact: ciso@company.com
    Responsibilities: Creation approval, usage monitoring, incident review

  - Contractor Accounts: Managed by hiring manager + IT Operations
    Contact: Manager who requested access
    Responsibilities: Approval, access review, termination notification

AC-2(c) - Group and Role Membership

Group and role membership is established using role-based access control (RBAC)
aligned with job functions. Groups are defined in Okta and synchronized to AWS
IAM Identity Center permission sets.

  Standard Roles:
    - Developer: Read/write access to dev environment, read-only to prod
    - QA Engineer: Read/write access to QA environment, read-only to dev/prod
    - DevOps Engineer: Full access to all environments (with approval)
    - Data Analyst: Read-only access to analytics databases
    - Support Engineer: Read-only access to production logs and metrics

  Privileged Roles (require additional approval):
    - Administrator: Full access to AWS management console
    - Security Analyst: Access to security tooling (GuardDuty, Security Hub)
    - Database Administrator: Write access to production databases

  Group membership conditions are documented in the Access Control Policy v1.8,
  section 4.2 "Role-Based Access Control Matrix."

AC-2(d) - Authorized Users and Privileges

Authorized users of the information system, their group/role membership, and
access authorizations are specified and documented in Okta as the authoritative
source of identity. Access privileges are mapped to AWS IAM Identity Center
permission sets.

  Process:
    1. User identity established in BambooHR (upon hire)
    2. Manager specifies required access via Jira Service Desk ticket
    3. IT Operations validates against RBAC matrix
    4. Access provisioned in Okta (synchronized to AWS within 15 minutes)
    5. User receives welcome email with MFA enrollment instructions

  Attributes maintained for each account:
    - Full name, email address, employee ID
    - Department, manager, job title
    - Group memberships (Okta groups)
    - Permission sets (AWS IAM Identity Center)
    - Account status (active, suspended, disabled)
    - MFA enrollment status
    - Last login date

AC-2(e) - Approval Requirements

Requests to create information system accounts require approval based on the
following matrix:

  Standard User Accounts:
    - Approval Required: Direct manager
    - Method: Jira Service Desk ticket with manager approval
    - SLA: 4 business hours

  Privileged User Accounts:
    - Approval Required: Direct manager + CISO
    - Method: Jira ticket + email to ciso@company.com
    - Justification: Business need documented in ticket
    - SLA: 24 business hours

  Service Accounts (IAM Roles):
    - Approval Required: Application owner + Security team
    - Method: Terraform pull request with approvers
    - Review: Security team reviews IAM permissions for least privilege
    - SLA: 48 business hours

  Emergency Access Accounts:
    - Approval Required: CISO only
    - Method: Email request with justification
    - Review: Incident post-mortem required after use
    - SLA: 1 business hour (emergency only)

AC-2(f) - Account Lifecycle Procedures

Information system accounts are created, enabled, modified, disabled, and
removed in accordance with the following automated procedures:

  Account Creation:
    1. HR creates employee record in BambooHR
    2. Manager submits access request via Jira Service Desk
    3. Automated workflow validates approval
    4. Okta account provisioned automatically (via BambooHR integration)
    5. AWS SSO account created (via Okta SCIM integration)
    6. User receives welcome email with MFA enrollment link
    7. Ticket closed automatically after successful provisioning
    Evidence: Jira ticket, Okta audit log, CloudTrail IAM events

  Account Modification:
    1. Manager submits modification request via Jira
    2. IT Operations reviews and approves
    3. Okta group membership updated manually or via API
    4. AWS permission sets updated automatically (SCIM sync)
    5. User notified of access change via email
    Evidence: Jira ticket, Okta audit log

  Account Disable (Termination):
    1. HR marks employee as terminated in BambooHR
    2. BambooHR webhook triggers automated workflow (n8n)
    3. Okta account disabled within 4 hours (Lambda function)
    4. AWS SSO access revoked automatically (SCIM sync)
    5. Notification sent to IT Operations and manager
    6. Access keys rotated for any services the user had access to
    Evidence: BambooHR termination date, Okta audit log, CloudTrail

  Account Removal:
    1. Disabled accounts reviewed after 90 days
    2. If no reactivation needed, account deleted from Okta
    3. AWS SSO account removed (SCIM sync)
    4. Final backup of user's data (if applicable)
    Evidence: Quarterly cleanup reports

AC-2(g) - Account Usage Monitoring

The use of information system accounts is monitored through multiple mechanisms:

  Real-Time Monitoring:
    - AWS CloudTrail: All IAM and AWS API activity logged
    - Amazon GuardDuty: Threat detection and anomaly analysis
    - Okta System Log: All authentication and authorization events

  Daily Monitoring:
    - IAM credential report generated daily (last login dates)
    - Inactive account detection (>90 days no login)
    - Failed login attempt analysis (brute force detection)

  Monthly Monitoring:
    - Privileged access usage review (administrator actions)
    - Excessive permission usage (unused IAM permissions)

  Automated Alerts:
    - Unusual login location or time (GuardDuty finding)
    - Privilege escalation attempts (CloudTrail alarm)
    - Multiple failed login attempts (Okta alert)
    - Dormant account reactivation (after 60+ days inactive)

AC-2(h) - Account Manager Notifications

Account managers are notified automatically in the following scenarios:

  When accounts are no longer required:
    - Quarterly access review report lists all accounts under their purview
    - Manager must attest that each account is still needed
    - Unattested accounts flagged for review

  When users are terminated or transferred:
    - Immediate Slack notification to manager and IT Operations
    - Email summary of access removed
    - Confirmation that all access was revoked within SLA

  When usage or need-to-know changes:
    - Role change detected in BambooHR triggers access review
    - Manager receives email to re-certify required access
    - Automated comparison of new role vs. current permissions

AC-2(i) - Access Authorization Criteria

Access to the information system is authorized based on:

  Valid Access Authorization:
    - Approved Jira Service Desk ticket
    - Manager approval documented
    - Security team approval (if privileged access)

  Intended System Usage:
    - Job function documented in BambooHR
    - Business need articulated in access request
    - Alignment with RBAC matrix

  Other Attributes:
    - Active employment status (verified via BambooHR)
    - MFA enrollment completed
    - Security awareness training completed (annual requirement)
    - Background check completed (for privileged access only)

AC-2(j) - Account Review Frequency

Accounts are reviewed for compliance with account management requirements on
the following schedule:

  Quarterly Reviews (every 90 days):
    - All workforce accounts reviewed by managers
    - Service accounts reviewed by application owners
    - Attestation that access is still required and appropriate
    - Removal of unnecessary access
    - Documentation: Quarterly access review reports

  Monthly Reviews (every 30 days):
    - Privileged accounts (administrators, database admins)
    - Reviewed by CISO
    - Verification of continued business need
    - Documentation: Monthly privileged access review

  Daily Automated Checks:
    - Inactive accounts (>90 days no login)
    - Emergency accounts (>72 hours enabled)
    - Accounts without MFA enrollment
    - Documentation: Daily automated reports

AC-2(k) - Shared Account Credential Reissuance

Your Company policy prohibits shared user accounts. Service accounts (AWS IAM
roles) are used where multiple systems need equivalent access, but these do not
use static credentials.

  For the limited cases where service account credentials exist:
    - Stored in AWS Secrets Manager
    - Automatic rotation enabled (30-day rotation)
    - Manual rotation triggered when team membership changes
    - Notification sent to all users with access after rotation
    - Audit trail maintained in Secrets Manager

  Process:
    1. Team membership change detected (user added or removed from group)
    2. EventBridge rule triggers Lambda function
    3. Secrets Manager automatic rotation initiated
    4. New credentials propagated to services
    5. Old credentials invalidated
    6. Notification sent to application owner
    Evidence: Secrets Manager rotation logs

Control Enhancement Implementations:

AC-2(1) - Automated System Account Management

Your Company employs the following automated mechanisms to support account
management:

  Provisioning Automation:
    - Okta provisioning API (SCIM 2.0 to AWS IAM Identity Center)
    - BambooHR to Okta integration (user lifecycle)
    - Terraform for IAM role creation and management

  Deprovisioning Automation:
    - Lambda function: deprovision-user (triggered by BambooHR webhook)
    - Executes within 4 hours of termination event
    - Disables Okta account, revokes AWS sessions, deactivates access keys

  Monitoring Automation:
    - Lambda function: check-inactive-accounts (daily execution)
    - EventBridge rule: detect emergency account age >72 hours
    - AWS Config rule: detect IAM users without MFA

  Evidence: Lambda function source code, CloudTrail execution logs

AC-2(2) - Removal of Temporary / Emergency Accounts

The information system automatically disables temporary and emergency accounts
after the following time periods:

  Emergency Access Accounts:
    - Time Period: 72 hours
    - Implementation: EventBridge rule triggers Lambda daily
    - Action: Disable IAM user, send notification to CISO
    - Override: CISO can extend for additional 72 hours (documented)

  Contractor Accounts:
    - Time Period: 6 months (180 days)
    - Implementation: Okta user object has expiration date attribute
    - Action: Okta lifecycle policy auto-disables on expiration
    - Extension: Manager can request extension via Jira (requires justification)

  Evidence: Lambda function logs, Okta lifecycle policy configuration

AC-2(3) - Disable Inactive Accounts

The information system automatically disables inactive accounts after 90 days
of inactivity.

  Implementation:
    - Daily Lambda function: check-inactive-accounts
    - Data source: IAM credential report (last login date)
    - Warning: Email to user and manager after 75 days inactive
    - Action: Disable account after 90 days
    - Notification: Email to manager confirming disable
    - Reactivation: User can request reactivation via Jira

  Exceptions:
    - Service accounts (IAM roles) excluded (no interactive login)
    - Emergency accounts already covered by AC-2(2)

  Evidence: IAM credential reports (daily), disable action logs

AC-2(4) - Automated Audit Actions

The information system automatically audits all account management actions and
notifies designated personnel:

  Audit Logging:
    - AWS CloudTrail logs all IAM API calls
    - Okta System Log records all account changes
    - Logs retained for 365 days online, 3 years total

  Notification Recipients:
    - Account creation: IT Operations (Slack notification)
    - Account deletion: CISO + IT Operations (email)
    - Privilege escalation: CISO + Security team (PagerDuty alert)
    - Failed login attempts (>5): User + manager (email)

  Automated Notifications:
    - EventBridge rule filters CloudTrail for IAM events
    - Lambda function formats notification
    - SNS topic publishes to Slack + email

  Evidence: CloudTrail logs, SNS delivery logs, Slack message archive

AC-2(9) - Restrictions on Use of Shared/Group Accounts

Your Company only permits the use of shared/group accounts under the following
conditions:

  Conditions for Shared Accounts:
    1. Service accounts only (not for human users)
    2. Implemented as AWS IAM roles (temporary credentials)
    3. Approved by Security team
    4. Documented in service account registry
    5. Credentials stored in AWS Secrets Manager
    6. Automatic rotation enabled

  Prohibited:
    - Shared human user accounts (enforce unique accounts for all personnel)
    - Generic accounts (admin, root, etc.)
    - Group accounts without audit trail

  Enforcement:
    - Okta policy prohibits account sharing
    - AWS Config rule detects IAM users with shared access keys
    - Automated alert if policy violation detected

  Evidence: Access Control Policy (section 3.4), Config rule results

AC-2(12) - Account Monitoring / Atypical Usage (FedRAMP Addition)

Your Company monitors information system accounts for the following atypical
usage scenarios and reports to designated personnel:

  Atypical Usage Scenarios Monitored:
    - Login from unusual geographic location (outside US)
    - Login at unusual time (outside business hours)
    - Excessive API calls (rate limiting)
    - Privilege escalation attempts
    - Access to data outside normal scope
    - Use of emergency accounts (always atypical)

  Monitoring Mechanisms:
    - Amazon GuardDuty: Anomaly-based threat detection
    - Okta ThreatInsight: IP reputation and anomaly detection
    - CloudWatch Anomaly Detection: API call volume analysis
    - Custom Lambda: Detect after-hours privileged access

  Reporting:
    - Real-time: GuardDuty findings → EventBridge → PagerDuty (P1/P2 findings)
    - Daily: Summary email to Security team (all findings)
    - Weekly: Trend analysis report to CISO
    - Monthly: Metrics dashboard for management review

  Response Process:
    1. Alert generated by monitoring system
    2. Security team investigates (within 15 minutes for high severity)
    3. User contacted if needed
    4. Account disabled if confirmed malicious activity
    5. Incident ticket created
    6. Root cause analysis performed

  Evidence: GuardDuty findings, PagerDuty incident logs, investigation tickets

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART C: RESPONSIBLE ROLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Implementation:
  - Information Security (CISO, Security Analysts)
  - IT Operations (Identity & Access Management team)
  - Engineering (DevOps, Platform Engineering)

Oversight:
  - CISO
  - VP Engineering

Assessment:
  - Internal Audit
  - Third Party Assessor (3PAO)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART D: IMPLEMENTATION EVIDENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Policy and Procedures:
  - Access Control Policy v1.8 (approved 2024-01-15)
  - User Provisioning Procedure v1.2 (approved 2024-01-10)
  - User Deprovisioning Procedure v1.3 (approved 2024-01-10)
  - Access Review Procedure v1.1 (approved 2024-01-05)

Configuration Evidence:
  - Okta to AWS SSO integration configuration
  - BambooHR to Okta integration documentation
  - Lambda function: deprovision-user (source code)
  - Lambda function: check-inactive-accounts (source code)
  - EventBridge rules: emergency-account-age-check
  - AWS Config rules: iam-user-mfa-enabled

Testing Evidence:
  - Automated control tests: /engineer:test-control AC-2
    - Test results from 2024-12-28: 14/15 tests passed (93%)
  - Quarterly access reviews (2024 Q1-Q4)
  - Monthly privileged access reviews (2024)

Operational Evidence:
  - IAM user list (quarterly snapshots): 2024-Q1 through Q4
  - IAM credential reports (monthly): January 2024 - December 2024
  - CloudTrail logs (full year): 2024-01-01 to 2024-12-31
  - Jira access request tickets (sample 25 from 2024)
  - Termination evidence (all 12 terminations in 2024)
  - GuardDuty findings (2024 full year)

Audit Evidence:
  - Annual penetration test (2024-11-15)
  - Quarterly vulnerability scans (2024 Q1-Q4)
  - Control effectiveness testing results (from 3PAO assessment)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART E: CUSTOMER RESPONSIBILITIES (CRMs)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Customer Responsibilities:

If your organization uses our service, you are responsible for:

1. Managing your application-level user accounts
2. Implementing appropriate access controls within your applications
3. Reviewing application user access periodically
4. Notifying us of terminated users who should lose access
5. Monitoring your users' activities within the application

Your Company provides:
  - API for user management
  - Audit logs of user activities
  - Documentation for implementing access controls
```

## Related Commands

- `/nist:control-tailor` - Customize control implementation
- `/nist:overlay-apply` - Apply FedRAMP or other overlays
- `/nist:family-deep-dive` - Detailed guidance on AC family
- `/soc2:evidence-checklist` - Collect required evidence
- `/engineer:test-control` - Test control effectiveness
