---
description: Deep dive analysis of NIST 800-53 control families with implementation guidance
---

# NIST 800-53 Control Family Deep Dive

Provides comprehensive analysis of NIST 800-53 control families, including control overview, common implementations, cloud-specific guidance, and integration patterns for AWS/Azure/GCP.

## Usage

```bash
/nist:family-deep-dive <family> [baseline] [options]
```

## Arguments

- Argument 1 - Control family: "AC", "AU", "SC", "IA", "CM", "CP", "IR", "SI", "RA", etc.
- Argument 2 - Baseline (optional): "low", "moderate", "high" (default: "moderate")
- Argument 3 - Options (optional): `--environment=cloud|hybrid|on-prem`, `--show-controls`, `--implementation-only`

## Examples

```bash
# Deep dive on Access Control family
/nist:family-deep-dive AC moderate

# Deep dive on Audit family for cloud
/nist:family-deep-dive AU moderate --environment=cloud

# Show all controls in family
/nist:family-deep-dive SC moderate --show-controls

# Implementation guidance only (skip theory)
/nist:family-deep-dive IA moderate --implementation-only
```

## Output - Access Control (AC) Family

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NIST 800-53 CONTROL FAMILY DEEP DIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Family: Access Control (AC)
Baseline: Moderate
Environment: Cloud (AWS, Azure, GCP)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FAMILY OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
  The Access Control family addresses the policies, procedures, and technical
  controls to limit information system access to authorized users, processes
  acting on behalf of authorized users, and devices (including other systems).

Core Principles:
  - Least Privilege: Users have minimum access needed
  - Separation of Duties: Critical functions split among multiple users
  - Need-to-Know: Access based on job function requirements
  - Defense in Depth: Multiple layers of access control

Control Count in Moderate Baseline: 25 controls
  - Base controls: 22
  - Enhancements: 3 additional
  - Optional enhancements: 40+ available

Maturity Model:
  Level 1 (Basic): Authentication, authorization, auditing
  Level 2 (Intermediate): RBAC, periodic reviews, automated provisioning
  Level 3 (Advanced): Attribute-based access, real-time analytics, zero trust

Common Failures:
  - Orphaned accounts (users who left but access remains)
  - Excessive privileges (admin access for non-admin tasks)
  - Stale access (permissions granted but no longer needed)
  - Shared accounts (cannot attribute actions to individuals)
  - No access reviews (permissions drift over time)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KEY CONTROLS (Moderate Baseline)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AC-1: Policy and Procedures
  Purpose: Establish governance for access control
  Implementation: Document access control policy, procedures, review annually
  Cloud Pattern: Store in version control (Git), require exec approval
  Effort: 16 hours (initial), 4 hours/year (review)
  Evidence: Policy document, approval memo, annual review log

AC-2: Account Management ⭐ HIGH PRIORITY
  Purpose: Manage system account lifecycle (create, modify, disable, delete)
  Implementation: Automated provisioning via identity provider
  Cloud Pattern: Okta/Entra ID → AWS SSO, automated deprovisioning
  Effort: 40 hours (automation setup), 10 hours/month (reviews)
  Evidence: IAM user lists, quarterly access reviews, termination logs
  Common Gap: Manual deprovisioning leads to orphaned accounts
  Fix: Integrate HR system with IAM for automated lifecycle

AC-3: Access Enforcement
  Purpose: Enforce approved authorizations for system access
  Implementation: RBAC or ABAC policies, deny-by-default
  Cloud Pattern: IAM policies, Security Groups, RBAC
  Effort: 24 hours (initial policy design)
  Evidence: IAM policy documents, access logs showing enforcement
  Common Gap: Overly permissive policies (e.g., AdministratorAccess for all)
  Fix: Implement least privilege via managed policies per role

AC-4: Information Flow Enforcement
  Purpose: Control information flow between systems and networks
  Implementation: Network segmentation, data loss prevention
  Cloud Pattern: VPCs, subnets, NACLs, Security Groups, VPC endpoints
  Effort: 32 hours (network design)
  Evidence: Network diagram, security group rules, flow logs
  Common Gap: Flat network (all systems can communicate)
  Fix: Segment by environment (dev/stage/prod) and tier (web/app/data)

AC-5: Separation of Duties
  Purpose: Divide critical functions among different individuals
  Implementation: Dual approval for sensitive actions, role segregation
  Cloud Pattern: IAM policies prevent single user from both create + approve
  Effort: 16 hours (policy design)
  Evidence: IAM policies showing separation, audit logs
  Example: Developers can create resources, but can't deploy to production

AC-6: Least Privilege ⭐ HIGH PRIORITY
  Purpose: Grant only minimum necessary permissions
  Implementation: Role-based policies, periodic permission reviews
  Cloud Pattern: Managed policies (AWS), Azure RBAC, GCP IAM
  Effort: 40 hours (initial), ongoing refinement
  Evidence: Permission analysis, unused permission reports
  Common Gap: Over-permissioning (easier to give broad access)
  Fix: Start with read-only, add permissions as needed with justification

AC-7: Unsuccessful Login Attempts
  Purpose: Lock accounts after failed login attempts
  Implementation: Failed login threshold (e.g., 5 attempts), lockout duration
  Cloud Pattern: Okta/Entra ID account lockout policy
  Effort: 2 hours (configuration)
  Evidence: Account lockout policy screenshot, lockout event logs
  Best Practice: 5 attempts, 30-minute lockout

AC-8: System Use Notification
  Purpose: Display warning banner before login
  Implementation: Login page banner, SSH banner
  Cloud Pattern: CloudFront → S3 static page with banner, SSH config
  Effort: 4 hours
  Evidence: Screenshot of banner, SSH config file
  Required Text: "Authorized use only. Activity monitored and logged."

AC-11: Session Lock
  Purpose: Lock session after period of inactivity
  Implementation: Auto-logout after inactivity
  Cloud Pattern: Okta/AWS SSO session timeout (15 minutes)
  Effort: 2 hours
  Evidence: Session policy configuration
  Best Practice: 15 minutes for general, 5 minutes for privileged

AC-14: Permitted Actions Without Identification
  Purpose: Identify actions allowed before authentication
  Implementation: Document unauthenticated endpoints (health checks, etc.)
  Cloud Pattern: ALB health check endpoint (no auth required)
  Effort: 4 hours (documentation)
  Evidence: List of public endpoints with justification

AC-17: Remote Access
  Purpose: Control remote access to systems
  Implementation: VPN, bastion hosts, MFA for remote access
  Cloud Pattern: AWS Session Manager, Azure Bastion, GCP IAP
  Effort: 24 hours
  Evidence: VPN config, bastion host logs, MFA enrollment
  Best Practice: No direct SSH, use Session Manager with MFA

AC-18: Wireless Access
  Purpose: Control wireless network access
  Implementation: WPA3 encryption, 802.1X authentication
  Cloud Pattern: N/A for cloud-only (office network if hybrid)
  Effort: 16 hours (if applicable)
  Evidence: Wireless config, authentication logs

AC-19: Access Control for Mobile Devices
  Purpose: Control mobile device access to systems
  Implementation: MDM, device enrollment, remote wipe
  Cloud Pattern: Okta Verify (mobile MFA), conditional access
  Effort: 20 hours
  Evidence: MDM enrollment list, mobile access logs
  Best Practice: Require MDM enrollment for corporate data access

AC-20: Use of External Information Systems
  Purpose: Control access via external systems
  Implementation: Approved vendor list, security requirements
  Cloud Pattern: VPN to partner networks, API authentication
  Effort: 12 hours (per external system)
  Evidence: Vendor agreements, security assessments
  Example: Allow Salesforce to access customer data via API (approved)

AC-22: Publicly Accessible Content
  Purpose: Control publicly posted information
  Implementation: Content approval process, review before publish
  Cloud Pattern: S3 bucket policies (deny public by default)
  Effort: 8 hours
  Evidence: S3 bucket policies, content approval workflow
  Common Gap: Accidentally public S3 buckets
  Fix: Enable S3 Block Public Access at account level

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLOUD IMPLEMENTATION PATTERNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AWS Implementation:

Identity and Access Management:
  ✓ AWS IAM Identity Center (formerly AWS SSO)
    - Federate with Okta/Entra ID
    - Centralized access management
    - Multi-account support via Organizations

  ✓ IAM Policies
    - Managed policies for common roles
    - Inline policies for exceptions
    - Permission boundaries to limit max privileges

  ✓ IAM Roles (not users)
    - Service roles for applications (EC2, Lambda, ECS)
    - Cross-account roles for partner access
    - Temporary credentials (STS)

Account Management Automation:
  ✓ Okta → AWS SSO (SCIM provisioning)
  ✓ Lambda function: sync-users-to-sso
  ✓ Lambda function: deprovision-user-on-termination
  ✓ EventBridge: quarterly-access-review trigger

Network Access Control:
  ✓ VPC architecture (isolated networks)
  ✓ Security Groups (stateful firewall)
  ✓ Network ACLs (stateless firewall)
  ✓ AWS PrivateLink (private connectivity to services)
  ✓ VPC Endpoints (no internet routing for AWS services)

Remote Access:
  ✓ AWS Session Manager (no SSH keys, MFA enforced)
  ✓ AWS Systems Manager (port forwarding)
  ✓ Client VPN (if needed, with MFA)

Access Monitoring:
  ✓ CloudTrail (all API calls)
  ✓ GuardDuty (anomaly detection)
  ✓ Access Analyzer (detect overly broad permissions)
  ✓ CloudWatch (metrics and alarms)

Azure Implementation:

Identity and Access Management:
  ✓ Microsoft Entra ID
    - Conditional access policies
    - Privileged Identity Management (PIM)
    - Identity Protection

  ✓ Azure RBAC
    - Built-in roles (Owner, Contributor, Reader)
    - Custom roles for specific permissions
    - Management group hierarchy

Account Management:
  ✓ Entra ID lifecycle workflows
  ✓ Automated provisioning/deprovisioning
  ✓ Guest user management (B2B)

Network Access Control:
  ✓ Virtual Networks (VNets)
  ✓ Network Security Groups (NSGs)
  ✓ Azure Firewall
  ✓ Private Link

Remote Access:
  ✓ Azure Bastion (browser-based RDP/SSH)
  ✓ Just-In-Time VM access
  ✓ Point-to-Site VPN

GCP Implementation:

Identity and Access Management:
  ✓ Cloud Identity
  ✓ Workforce Identity Federation
  ✓ IAM & Admin

  ✓ IAM Roles
    - Basic roles (Owner, Editor, Viewer)
    - Predefined roles (service-specific)
    - Custom roles

Account Management:
  ✓ Cloud Identity user lifecycle
  ✓ Google Workspace integration
  ✓ Automated provisioning via SCIM

Network Access Control:
  ✓ VPC networks
  ✓ Firewall rules
  ✓ Cloud NAT

Remote Access:
  ✓ Identity-Aware Proxy (IAP)
  ✓ OS Login (SSH key management)
  ✓ Cloud VPN

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPLEMENTATION ROADMAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 1: Foundation (Weeks 1-4)
  Priority: HIGH
  Controls: AC-1, AC-2, AC-3, AC-6

  Week 1:
    □ Document Access Control Policy (AC-1)
    □ Inventory all existing accounts
    □ Set up Okta tenant (or Entra ID)

  Week 2:
    □ Configure Okta → AWS SSO integration
    □ Migrate users to federated access
    □ Disable direct IAM users

  Week 3:
    □ Design RBAC matrix (roles and permissions)
    □ Create IAM policies for each role
    □ Test access enforcement (AC-3)

  Week 4:
    □ Implement least privilege policies (AC-6)
    □ Remove excessive permissions
    □ Test user workflows

  Effort: 160 hours
  Cost: \$5,000 (Okta licenses)

Phase 2: Automation (Weeks 5-8)
  Priority: HIGH
  Controls: AC-2(1), AC-2(2), AC-2(3), AC-2(4)

  Week 5:
    □ Integrate BambooHR with Okta
    □ Set up SCIM provisioning
    □ Test automated account creation

  Week 6:
    □ Build Lambda: deprovision-user
    □ Integrate with BambooHR webhook
    □ Test automated deprovisioning

  Week 7:
    □ Build Lambda: check-inactive-accounts
    □ Set up daily EventBridge trigger
    □ Configure notifications

  Week 8:
    □ Configure CloudTrail for IAM events
    □ Set up GuardDuty
    □ Test anomaly detection

  Effort: 120 hours
  Cost: \$2,000 (development)

Phase 3: Network Controls (Weeks 9-12)
  Priority: MEDIUM
  Controls: AC-4, AC-17, AC-20

  Week 9:
    □ Design VPC architecture (dev/stage/prod)
    □ Create security groups
    □ Configure NACLs

  Week 10:
    □ Implement VPC endpoints
    □ Remove internet gateways where possible
    □ Test connectivity

  Week 11:
    □ Set up AWS Session Manager
    □ Disable SSH key-based access
    □ Configure audit logging

  Week 12:
    □ Document external system connections
    □ Create VPN/PrivateLink for partners
    □ Test access controls

  Effort: 80 hours
  Cost: \$500/month (VPN, Transit Gateway)

Phase 4: Review and Monitoring (Ongoing)
  Priority: MEDIUM
  Controls: AC-2(j), AC-6(9)

  Setup:
    □ Quarterly access review process
    □ Access review automation (reports)
    □ Dashboard for access metrics

  Ongoing:
    □ Quarterly access reviews (90 days)
    □ Monthly privileged access reviews
    □ Annual policy review

  Effort: 20 hours/quarter
  Cost: \$0 (internal)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TESTING AND VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Automated Testing:
```bash
# Test all AC family controls
/grc-engineer:test-control AC

# Test specific controls
/grc-engineer:test-control AC-2
/grc-engineer:test-control AC-6
```

Manual Testing Scenarios:

Test 1: Account Provisioning (AC-2)

  1. Create test user in BambooHR
  2. Verify Okta account created within 15 minutes
  3. Verify AWS SSO access granted
  4. Verify email notification sent to user
  Expected Result: Automated provisioning successful

Test 2: Account Termination (AC-2)

  1. Mark test user as terminated in BambooHR
  2. Verify Okta account disabled within 4 hours
  3. Verify AWS SSO access revoked
  4. Verify CloudTrail logs termination event
  Expected Result: Automated deprovisioning successful

Test 3: Access Enforcement (AC-3)

  1. Attempt to access resource without permission
  2. Verify access denied
  3. Verify denial logged in CloudTrail
  Expected Result: Access denied, audit trail created

Test 4: Least Privilege (AC-6)

  1. Review IAM policies for overly broad permissions
  2. Run Access Analyzer to detect unused permissions
  3. Verify no users have AdministratorAccess (except break-glass)
  Expected Result: All users follow least privilege

Test 5: Session Lock (AC-11)

  1. Log in to AWS console
  2. Wait 15 minutes without activity
  3. Attempt to perform action
  Expected Result: Session expired, re-authentication required

Test 6: Remote Access (AC-17)

  1. Attempt direct SSH to EC2 instance
  2. Verify SSH blocked (no public IPs, no key-based auth)
  3. Use Session Manager to connect
  4. Verify MFA required for Session Manager
  Expected Result: Session Manager works, direct SSH blocked

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMON PITFALLS AND SOLUTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pitfall 1: Orphaned Accounts
  Problem: Users leave, accounts remain active
  Impact: Security risk, compliance violation
  Solution: Integrate HR system with IAM, automated deprovisioning
  Detection: Daily credential report, inactive account check
  Fix: /grc-engineer:generate-implementation AC-2 aws

Pitfall 2: Excessive Permissions
  Problem: Users have admin access when not needed
  Impact: Increased blast radius of compromise
  Solution: Implement least privilege, regular permission reviews
  Detection: AWS Access Analyzer, unused permission report
  Fix: Remove broad policies, create role-specific policies

Pitfall 3: No Access Reviews
  Problem: Permissions drift over time, never reviewed
  Impact: Users accumulate unnecessary access
  Solution: Automated quarterly access reviews
  Detection: Compare current access vs. required access
  Fix: EventBridge + Lambda to generate review reports

Pitfall 4: Shared Accounts
  Problem: Multiple users share one account
  Impact: Cannot attribute actions, accountability lost
  Solution: Unique accounts for all users, use roles for services
  Detection: Check for shared access keys (Access Analyzer)
  Fix: Disable shared accounts, create individual accounts

Pitfall 5: Weak Remote Access
  Problem: Direct SSH with password authentication
  Impact: Brute force attacks, credential theft
  Solution: Session Manager (no SSH keys), MFA required
  Detection: Review security group rules for port 22/3389
  Fix: Disable public access, enable Session Manager

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
METRICS AND DASHBOARDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Key Metrics to Track:

Access Management:

- Total active accounts
- Orphaned accounts detected (last 30 days)
- Average deprovisioning time (target: <4 hours)
- Access requests processed (monthly)
- Access review completion rate (target: 100%)

Least Privilege:

- Users with admin access (minimize)
- Unused IAM permissions detected (Access Analyzer)
- Overly permissive security groups (0.0.0.0/0)
- Policies with wildcard actions (avoid)

Authentication:

- MFA enrollment rate (target: 100%)
- Failed login attempts (monthly trend)
- Account lockouts (investigate spikes)
- Password changes (compliance with policy)

Activity Monitoring:

- Privileged access usage (admin console logins)
- After-hours access (flag for review)
- Unusual geographic access (GuardDuty findings)
- API call volume anomalies

Dashboard Example (CloudWatch):

- Widget 1: Active accounts (line chart, 30 days)
- Widget 2: MFA enrollment % (gauge, target 100%)
- Widget 3: Orphaned accounts (number, alert if >0)
- Widget 4: Access review status (pie chart)
- Widget 5: GuardDuty findings (bar chart by severity)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COST ESTIMATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Technology Costs (Annual):
  Okta (SSO + MFA):                  \$3/user/month = \$5,100/year (142 users)
  AWS IAM Identity Center:            Free
  GuardDuty:                         \$500/month = \$6,000/year
  Access Analyzer:                    Free
  CloudTrail:                        \$200/month = \$2,400/year
  Session Manager:                    Free
  Total Technology:                  \$13,500/year

Implementation Costs (One-Time):
  Policy documentation:               40 hours = \$6,000
  IAM setup and configuration:        80 hours = \$12,000
  Automation development:            120 hours = \$18,000
  Network architecture:               80 hours = \$12,000
  Testing and validation:             40 hours = \$6,000
  Total Implementation:              \$54,000

Ongoing Costs (Annual):
  Quarterly access reviews:           80 hours = \$12,000
  Monthly privileged reviews:         48 hours = \$7,200
  Annual policy review:                8 hours = \$1,200
  Incident investigation:             40 hours = \$6,000
  Total Ongoing:                     \$26,400/year

Grand Total: \$54,000 (one-time) + \$39,900/year (technology + ongoing)

```

## Related Commands

- `/nist:control-tailor` - Customize specific controls
- `/nist:select-baseline` - Choose appropriate baseline
- `/nist:overlay-apply` - Apply FedRAMP or other overlays
- `/nist:ssp-section-generate` - Generate SSP documentation
- `/grc-engineer:generate-implementation` - Generate IaC for controls
- `/grc-engineer:test-control` - Test control effectiveness
