---
name: overlay-apply
description: Apply NIST 800-53 overlays (FedRAMP, DoD, Privacy, etc.) to existing baselines
---

# NIST 800-53 Overlay Application

Applies overlay requirements from FedRAMP, DoD, Privacy, and other specialized frameworks to NIST 800-53 baselines, identifying additional controls, parameter changes, and implementation guidance.

## FedRAMP today

A control overlay applies only to FedRAMP's legacy Rev5 certification type. FedRAMP 20x measures Key Security Indicators instead, so use the `fedramp-20x` plugin for it. FedRAMP stops accepting new Rev5 applications on 2027-06-11.

Under FedRAMP's Consolidated Rules for 2026 (CR26), which new Rev5 applications may follow now and must follow from 2027-01-01:

- The outcome is a FedRAMP Certification (formerly called a FedRAMP authorization). Agencies still issue their own authorization to operate (ATO).
- Low, Moderate and High are replaced by Certification Class B, C and D. The classes loosely align with the NIST baselines and are not identical to them. The `low`, `moderate` and `high` arguments of this command select Class B, C and D for the `fedramp` overlay.
- Rule `FRC-CSF-BSL` lists the Rev5 controls for each class: 155 for Class B, 322 for Class C, 409 for Class D. Take the control list from that rule, not from the example below.
- FedRAMP no longer sets most parameter values. The provider assigns them, follows FedRAMP's Rev5 control guidance where a control has an entry, and records them in the Security Decision Record (`FRC-CSF-ACP`).
- FedRAMP requires no SSP, SAP, SAR or provider POA&M and publishes no templates. The example's documentation, process and monitoring sections describe what it expects instead.

The example output is illustrative. Its controls were checked against the Class C list, but its rationales, effort and cost figures are not FedRAMP's.

## Usage

```bash
/nist:overlay-apply <overlay-type> <baseline> [options]
```

## Arguments

- Argument 1 - Overlay type: "fedramp", "dod", "privacy", "cmmc", "cjis", "hipaa", "irs-1075"
- Argument 2 - Base baseline: "low", "moderate", "high"
- Argument 3 - Options (optional): `--output=table|ssp-text|yaml`, `--show-only-changes`

## Examples

```bash
# Apply FedRAMP Moderate overlay
/nist:overlay-apply fedramp moderate

# Apply DoD IL4 requirements
/nist:overlay-apply dod moderate

# Apply Privacy overlay
/nist:overlay-apply privacy moderate

# Show only additional requirements
/nist:overlay-apply fedramp moderate --show-only-changes

# Generate SSP-ready text
/nist:overlay-apply fedramp moderate --output=ssp-text
```

## Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NIST 800-53 OVERLAY APPLICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overlay: FedRAMP Rev5, Class C (argument: moderate)
Base Baseline: NIST 800-53 Rev 5 Moderate
Certification Path: Agency (agency ATO, then FedRAMP Certification)
Cloud Service Model: IaaS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FedRAMP Rev5 Class C Controls: 322 (rule FRC-CSF-BSL)
Controls Detailed Below: 20 (examples, not the full list)
Parameters: assigned by the provider (rule FRC-CSF-ACP)

Impact Analysis:
  Effort Increase: +15%
  Cost Increase: +\$35k-\$50k (initial), +\$15k/year (ongoing)
  Timeline Impact: +6-8 weeks (implementation)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEDRAMP REV5 CLASS C CONTROLS TO REVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HIGH PRIORITY (Must Implement Before Assessment):

+ AC-2(12) - Account Monitoring / Atypical Usage
  Requirement: Monitor for atypical account usage
  FedRAMP Rationale: Enhanced threat detection for government data
  Implementation:
    - CloudWatch anomaly detection for IAM activity
    - GuardDuty for threat detection
    - SIEM correlation rules (Splunk, DataDog)
  Effort: 24 hours
  Cost: \$500/month (GuardDuty + CloudWatch)
  Evidence: GuardDuty findings, CloudWatch dashboards

+ AC-6(9) - Auditing Use of Privileged Functions
  Requirement: Log all privileged function execution
  FedRAMP Rationale: Government requires elevated privilege audit trail
  Implementation:
    - CloudTrail logging for all admin API calls
    - Separate log stream for privileged actions
    - Tamper-proof log storage (S3 Object Lock)
  Effort: 8 hours
  Cost: \$50/month (additional CloudTrail storage)
  Evidence: CloudTrail logs showing privileged events

+ AU-3(1) - Full-Text Recording of Privileged Commands
  Requirement: Record full command text for privileged operations
  FedRAMP Rationale: Forensic analysis of admin actions
  Implementation:
    - CloudTrail records full API request/response
    - Session Manager logging for SSH/RDP sessions
    - S3 bucket for long-term storage (1 year)
  Effort: 12 hours
  Cost: \$100/month (storage)
  Evidence: Session logs, API call records

+ CP-9(8) - Cryptographic Protection (Backups)
  Requirement: Encrypt backups with cryptographic mechanisms
  FedRAMP Rationale: Protect backup data confidentiality
  Implementation:
    - S3 default encryption (AES-256 or KMS)
    - RDS automated backups encrypted
    - EBS snapshot encryption enabled
  Effort: 4 hours (configuration only)
  Cost: \$0 (encryption is free)
  Evidence: S3/RDS/EBS encryption configs

+ IA-2(1) - Multi-Factor Authentication (Network Access)
  Requirement: MFA for all network access
  FedRAMP Rationale: Stronger authentication for government systems
  Implementation:
    - Okta MFA for all users (TOTP or Push)
    - AWS SSO MFA enforcement
    - Disable password-only access
  Effort: 8 hours
  Cost: \$3/user/month (Okta MFA)
  Evidence: Okta MFA enrollment reports, IAM MFA status

+ IA-2(2) - Multi-Factor Authentication (Non-Privileged Access)
  Requirement: MFA for non-privileged accounts too
  FedRAMP Rationale: FedRAMP requires MFA for ALL accounts
  Implementation:
    - Same as IA-2(1) - applies to all users
  Effort: Included in IA-2(1)
  Cost: Included
  Evidence: MFA enforcement policy + enrollment data

+ IA-2(8) - Access to Accounts – Replay Resistant
  Requirement: Prevent replay attacks on authentication
  FedRAMP Rationale: Protect against authentication token theft
  Implementation:
    - OAuth/OIDC with short-lived tokens (Okta)
    - Session tokens with nonce
    - TLS 1.2+ for all authentication traffic
  Effort: 4 hours (verify existing implementation)
  Cost: \$0 (Okta handles this)
  Evidence: Okta OAuth configuration

+ IA-2(12) - Acceptance of PIV Credentials
  Requirement: Accept PIV/CAC cards (government smart cards)
  FedRAMP Rationale: Required for government user access
  Implementation:
    - Okta PKI integration for PIV/CAC
    - Certificate trust chain configuration
    - Fallback to MFA if no PIV card
  Effort: 40 hours (complex integration)
  Cost: \$5,000 (Okta PKI add-on)
  Evidence: PIV authentication logs

+ IA-5(1) - Password-Based Authentication (Complexity)
  Requirement: Enhanced password requirements
  FedRAMP Parameters:
    - No FedRAMP-set length, history or age. The provider assigns them
    - Authenticators must meet NIST Digital Identity Guidelines level 2
      for Class C (FedRAMP IA-5 guidance)
  Implementation:
    - Okta password policy update
    - IAM password policy (for emergency accounts)
  Effort: 2 hours
  Cost: \$0
  Evidence: Password policy screenshots

+ IR-5 - Incident Monitoring
  Requirement: Real-time incident tracking and reporting
  FedRAMP Rationale: Incident Evaluation and Communication (IEC) rules.
    Class C: Initial Incident Report within 1 hour for N3 to N5 incidents
  Implementation:
    - PagerDuty integration for critical alerts
    - Automated incident ticket creation (Jira)
    - Notification to fedramp_security@fedramp.gov and affected agencies
  Effort: 16 hours
  Cost: \$200/month (PagerDuty)
  Evidence: Incident response runbook, PagerDuty logs

+ IR-6(1) - Automated Reporting
  Requirement: Automate incident reporting
  FedRAMP Rationale: Timely reporting to FedRAMP
  Implementation:
    - GuardDuty → EventBridge → Lambda → Email/Jira
    - Automated FedRAMP incident notification
    - Slack integration for team awareness
  Effort: 12 hours
  Cost: \$50/month (Lambda)
  Evidence: Lambda function code, sample incident reports

+ RA-5(5) - Privileged Access for Vulnerability Scanning
  Requirement: Credentialed vulnerability scans
  FedRAMP Rationale: More thorough vulnerability detection
  Implementation:
    - Amazon Inspector (agent-based, credentialed)
    - Tenable.io or Qualys integration (if your assessor requires)
    - Weekly credentialed scans
  Effort: 16 hours
  Cost: \$500/month (Inspector + optional Tenable)
  Evidence: Scan reports showing credentialed scans

+ SC-7(4) - Boundary Protection - External Telecommunications
  Requirement: Managed interfaces for external systems
  FedRAMP Rationale: Control all external connections
  Implementation:
    - VPC endpoints for AWS services (no internet)
    - Private NAT for outbound (controlled egress)
    - Transit Gateway for partner connections
  Effort: 24 hours
  Cost: \$300/month (Transit Gateway)
  Evidence: VPC flow logs, network diagram

+ SC-7(5) - Boundary Protection - Deny by Default
  Requirement: Default deny for network traffic
  FedRAMP Rationale: Zero trust network architecture
  Implementation:
    - Security groups: default deny all inbound
    - NACLs: explicit allow only
    - WAF: deny all, allow specific
  Effort: 8 hours
  Cost: \$50/month (WAF)
  Evidence: Security group configs showing default deny

+ SC-13 - Cryptographic Protection
  Requirement: Follow FedRAMP's Cryptographic Module Use rules
  FedRAMP Parameters: Document each module and its NIST CMVP validation
    status. Validated modules: SHOULD for Class C, MUST for Class D
  Implementation:
    - KMS uses FIPS 140-2 validated modules
    - TLS 1.2+ only (no TLS 1.0/1.1)
    - S3/RDS encryption uses AES-256
  Effort: 4 hours (verify, document)
  Cost: \$0
  Evidence: FIPS validation certificates

+ SC-28(1) - Cryptographic Protection of Information at Rest
  Requirement: Encrypt all data at rest
  FedRAMP Rationale: Protect government data confidentiality
  Implementation:
    - S3 default encryption (AES-256)
    - RDS encryption at rest
    - EBS volume encryption
    - Secrets Manager encryption
  Effort: 8 hours
  Cost: \$0 (encryption is free)
  Evidence: Encryption configuration screenshots

+ SI-2(2) - Automated Flaw Remediation Status
  Requirement: Automate tracking of patch status
  FedRAMP Rationale: Demonstrate timely patching
  Implementation:
    - AWS Systems Manager Patch Manager
    - Automated compliance reporting
    - Dashboard showing patch compliance %
  Effort: 16 hours
  Cost: \$100/month (SSM)
  Evidence: Patch compliance reports

+ SI-4(2) - Automated Tools for Real-Time Analysis
  Requirement: Real-time security event analysis
  FedRAMP Rationale: Rapid threat detection and response
  Implementation:
    - GuardDuty (real-time analysis)
    - CloudWatch Logs Insights (real-time queries)
    - SIEM correlation (Splunk, real-time)
  Effort: 32 hours
  Cost: \$1,500/month (SIEM)
  Evidence: Real-time alerting examples

+ SI-4(5) - System-Generated Alerts
  Requirement: Automated security alerts
  FedRAMP Rationale: Timely notification of security events
  Implementation:
    - CloudWatch alarms → SNS → Slack/PagerDuty
    - GuardDuty findings → EventBridge → Lambda
    - Security Hub aggregation
  Effort: 12 hours
  Cost: \$200/month (PagerDuty)
  Evidence: Alert examples, PagerDuty integration

+ SI-4(23) - Host-Based Devices
  Requirement: Host-based monitoring on systems
  FedRAMP Rationale: Endpoint visibility
  Implementation:
    - CloudWatch agent on all EC2 instances
    - SSM agent for inventory
    - Optional: CrowdStrike EDR
  Effort: 16 hours
  Cost: \$500/month (CrowdStrike)
  Evidence: Agent deployment status

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARAMETER ASSIGNMENTS (FedRAMP Rev5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The provider assigns each organization-defined parameter and records it
in the Security Decision Record (rule FRC-CSF-ACP). FedRAMP's Rev5
control guidance sets a value or gives direction for some controls only.

AC-2(j) - Account Review Frequency
  NIST Moderate: "Organization-defined frequency"
  FedRAMP: no value set, provider-assigned
  RECOMMENDED: Quarterly (exceeds PCI DSS 7.2.4's six-month minimum)

AU-11 - Audit Record Retention
  NIST Moderate: "Organization-defined time period"
  FedRAMP: no value set, provider-assigned
  RECOMMENDED: 365 days online

IA-5(1) - Password Requirements
  FedRAMP: no value set, provider-assigned (see IA-5(1) above)
  IMPLEMENTATION: 15 chars (example assignment)

SC-28 - Data at Rest Encryption
  NIST Moderate: "Organization-defined information at rest"
  FedRAMP: no value set, provider-assigned
  IMPLEMENTATION: Default encryption on all storage

SI-2 - Flaw Remediation Timeline
  NIST Moderate: "Organization-defined time period"
  FedRAMP: follow the VDR and VER rules. Timeframes depend on class,
    N-rating, likely exploitability and internet reachability, counted
    from evaluation (rule VDR-TFR-PVR)
  IMPLEMENTATION: Track each vulnerability against its VDR timeframe

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEDRAMP DOCUMENTATION REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FedRAMP Certification Package (human-readable and JSON, no templates):

1. Certification Package Overview
   - Short overview of the offering: services, information flows,
     third-party resources, cryptographic modules, policy index
   - Includes the assessor's overall summary

2. Security Decision Record (SDR)
   - Replaces the System Security Plan
   - One entry per applicable FedRAMP rule and per Rev5 control:
     parameters, implementation status, verification, validation
   - Holds the assessor's summaries. There is no SAP or SAR

3. Ongoing Certification Report
   - A real or example report with the initial package
   - Then every 3 months

4. Accepted Vulnerabilities List
   - Replaces the provider POA&M
   - Part of vulnerability reporting under the VER rules

5. Secure Configuration Guide
   - How customers securely set up and run top-level admin accounts

Also Expected:

6. Incident Response Plan
   - Reports follow the IEC rules (timeframes by class and N-rating)
   - Sent to fedramp_security@fedramp.gov and affected agencies

7. Configuration Management Plan
   - Baseline configurations
   - Change management process
   - Version control

Legacy Documents (SSP, SAP, SAR, POA&M):
   - Only when a sponsoring agency asks for them for its own ATO on
     the Rev5 Agency path, or for a NIST system outside FedRAMP
   Tool: /nist:ssp-section-generate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEDRAMP CERTIFICATION PROCESS (Rev5, Agency path)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Preparation (2-3 months, \$75k-\$150k)
  - Self-assessment against the Class C controls and FedRAMP rules
  - Gap remediation
  - Certification Package Overview and Security Decision Record
  - FedRAMP Marketplace listing (Initial Implementation Phase),
    required before applying
  - FedRAMP Ready and the Readiness Assessment Report are retired

Step 2: FedRAMP Independent Assessment (3-4 months, \$150k-\$300k)
  - By a FedRAMP Recognized independent assessment service
    (formerly called a 3PAO)
  - Verification and validation of the real implementation
  - Assessor summaries go into the SDR and the overview. No SAR

Step 3: Agency ATO and FedRAMP Certification (1-3 months, varies)
  - Agency reviews the package, issues its ATO and sponsors
  - The provider applies to FedRAMP itself
  - FedRAMP reviews and grants the FedRAMP Certification

Total Timeline: 6-10 months
Total Cost: \$225k-\$450k (initial), \$100k-\$200k/year (ongoing)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INHERITED CONTROLS (from AWS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FedRAMP allows inheritance from AWS (already FedRAMP Certified):

Physical Controls (fully inherited):
  - PE-2: Physical Access Authorizations
  - PE-3: Physical Access Control
  - PE-6: Monitoring Physical Access
  - PE-8: Visitor Access Records
  - PE-13: Fire Protection
  - PE-14: Temperature and Humidity Controls
  - PE-15: Water Damage Protection

Environmental Controls:
  - PE-9: Power Equipment and Cabling
  - PE-10: Emergency Shutoff
  - PE-11: Emergency Power
  - PE-12: Emergency Lighting

Evidence: AWS FedRAMP Certification Package
Your Responsibility: Reference AWS package, include inheritance table

Shared Controls (partial inheritance):
  - CA-3: System Interconnections (AWS provides infrastructure, you document)
  - CM-2: Baseline Configuration (AWS + your application)
  - RA-2: Security Categorization (AWS + your data)
  - SA-9: External Information Systems (AWS + your 3rd parties)

Customer Responsibility (no inheritance):
  - AC-*: Access Control (your application users)
  - AU-*: Audit Logging (your application logs)
  - IA-*: Identification and Authentication (your users)
  - SC-7: Boundary Protection (your VPC configuration)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ONGOING CERTIFICATION REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reports go to all necessary parties (FedRAMP and every agency customer)
through the provider's trust center. The monthly ConMon deliverable
and the POA&M are gone.

Every 3 Months:

1. Ongoing Certification Report
   - Changes to certification data, accepted vulnerabilities,
     transformative changes, reportable incidents or a statement of none
   - Quarterly Review meeting 3 to 10 business days later
     (MUST for Class C and D)

Monthly:

2. Vulnerability Activity Report (human-readable)
   - Each vulnerability with its N-rating, reachability, exploitability
     and status
   - Anything not resolved within 192 days of evaluation is listed as
     an accepted vulnerability

Per Event:

3. Incident Reports
   - Initial, ongoing and final reports under the IEC rules

4. Significant Change Notifications
   - No advance approval by default
   - Adaptive changes: notify within 10 business days after
   - Transformative changes: notify 30 and 10 business days before

Annual Requirements:

1. FedRAMP Independent Assessment
   - At least once a year, by a FedRAMP Recognized assessor
   - A listed core set of Rev5 controls every year
   - Every applicable control at least once every 3 years

2. ISSO Review
   - Information System Security Officer
   - Annual review of all controls
   - Sign-off on continued effectiveness

Automation:
```bash
# Set up continuous monitoring
/nist:continuous-monitoring-setup fedramp
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Initial Authorization:
  Readiness Assessment:        \$75,000 - \$150,000
  Gap Remediation (IaC):        \$25,000 - \$50,000
  Independent Assessment:      \$150,000 - \$300,000
  Documentation (internal):     \$40,000 (400 hours @ \$100/hr)
  Misc (tools, training):       \$10,000
  TOTAL INITIAL:               \$300,000 - \$550,000

Ongoing (Annual):
  Annual Independent Assessment: \$75,000 - \$125,000
  Ongoing Certification Reports: \$15,000 - \$30,000
  Vulnerability Detection:      \$12,000
  Incident Response (retainer): \$10,000
  TOTAL ANNUAL:                \$112,000 - \$177,000

Technology Costs (Annual):
  GuardDuty:                    \$6,000
  Inspector:                    \$6,000
  CloudWatch (enhanced):        \$3,600
  PagerDuty:                    \$2,400
  Okta PKI (PIV):               \$5,000
  SIEM (Splunk/DataDog):       \$18,000
  TOTAL TECH:                  \$41,000/year

GRAND TOTAL: \$300k-\$550k (initial) + \$153k-\$218k/year (ongoing)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before Starting FedRAMP:

1. Ensure NIST 800-53 Moderate compliance (baseline)
2. Complete gap remediation against the Class C control list
3. Select a FedRAMP Recognized assessor (get quotes from 3+)
4. Budget appropriately (\$300k-\$550k initial)
5. Allocate internal resources (400-800 hours)

Quick Wins (Implement First):

1. SC-28(1) - Data at rest encryption (\$0 cost, 8 hours)
2. IA-5(1) - Update password policy (\$0 cost, 2 hours)
3. SI-2(2) - Patch Manager (\$100/month, 16 hours)

High Impact:

1. IA-2(12) - PIV/CAC support (\$5k, 40 hours) - REQUIRED for gov users
2. RA-5(5) - Credentialed scanning (\$500/month, 16 hours)

Generate Implementation Code:

```bash
# Identify gaps
/nist:overlay-apply fedramp moderate --show-only-changes > gaps.txt

# Generate IaC to fix
/engineer:generate-implementation AC-2 aws
/engineer:generate-implementation AU-4 aws
# ... for each gap

# Or use SOC2 gap-to-code
/soc2:gap-to-code gaps.json aws --output-dir=./fedramp-remediation
```

```

## Other Overlays

### DoD Impact Level 4 (IL4)

Similar to FedRAMP Rev5 Class D (the High-aligned class), with additional DoD-specific requirements:
- DISA STIGs compliance
- DoD-approved cryptography only
- Additional logging requirements
- Cleared personnel requirements

### Privacy Overlay

Adds privacy-specific controls:
- AP-1: Authority to Collect PII
- AP-2: Purpose Specification
- AR-*: Accountability, Audit, and Risk Management family
- DI-*: Data Quality and Integrity family
- IP-*: Individual Participation family

### CMMC (Cybersecurity Maturity Model Certification)

Maps NIST 800-53 to CMMC levels:
- Level 1: Basic Cyber Hygiene (17 practices)
- Level 2: Intermediate (110 practices, aligns with NIST 800-171)
- Level 3: Good Cyber Hygiene (130 practices, subset of NIST 800-53)

## Related Commands

- `/nist:control-tailor` - Tailor individual controls
- `/nist:select-baseline` - Select appropriate baseline
- `/nist:ssp-section-generate` - Generate SSP text
- The `fedramp-20x` plugin - FedRAMP 20x and the Consolidated Rules for 2026
- `/engineer:generate-implementation` - Generate IaC for gaps
