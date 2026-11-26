---
description: Apply NIST 800-53 overlays (FedRAMP, DoD, Privacy, etc.) to existing baselines
---

# NIST 800-53 Overlay Application

Applies overlay requirements from FedRAMP, DoD, Privacy, and other specialized frameworks to NIST 800-53 baselines, identifying additional controls, parameter changes, and implementation guidance.

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

Overlay: FedRAMP Moderate
Base Baseline: NIST 800-53 Rev 5 Moderate
Authorization Type: Agency ATO (initial)
Cloud Service Model: IaaS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Baseline Controls: 325 controls
FedRAMP Additions: 28 controls
FedRAMP Removals: 0 controls (none)
Parameter Changes: 47 parameters
Total Required: 353 controls

Categorization:
  Low Impact: 0 controls (not applicable for Moderate)
  Moderate Impact: 353 controls
  High Impact: 0 controls (can optionally implement)

Impact Analysis:
  Effort Increase: +15% (28 additional controls)
  Cost Increase: +\$35k-\$50k (initial), +\$15k/year (ongoing)
  Timeline Impact: +6-8 weeks (implementation)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEDRAMP-SPECIFIC ADDITIONS
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

+ AU-4(1) - Transfer to Alternate Storage
  Requirement: Transfer audit logs to alternate/independent storage
  FedRAMP Rationale: Prevent log tampering by admins
  Implementation:
    - Cross-region CloudTrail replication
    - Separate AWS account for log aggregation
    - S3 Object Lock (compliance mode, 1 year)
  Effort: 16 hours
  Cost: \$200/month (cross-region transfer + storage)
  Evidence: S3 replication configuration, Object Lock proof

+ CA-7(3) - Trend Analyses
  Requirement: Perform security trend analysis
  FedRAMP Rationale: Proactive threat identification
  Implementation:
    - CloudWatch Insights queries (weekly)
    - GuardDuty trend reports (monthly)
    - Security dashboard with 30-day trends
  Effort: 32 hours
  Cost: \$300/month (CloudWatch Insights)
  Evidence: Trend analysis reports, dashboards

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
    - Minimum 15 characters (NIST baseline: 14)
    - Password history: 24 (NIST baseline: flexible)
    - Maximum age: 60 days (NIST removed this, but FedRAMP kept it)
  Implementation:
    - Okta password policy update
    - IAM password policy (for emergency accounts)
  Effort: 2 hours
  Cost: \$0
  Evidence: Password policy screenshots

+ IR-5 - Incident Monitoring
  Requirement: Real-time incident tracking and reporting
  FedRAMP Rationale: Report incidents to FedRAMP within 1 hour
  Implementation:
    - PagerDuty integration for critical alerts
    - Automated incident ticket creation (Jira)
    - Notification to FedRAMP PMO (automated email)
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

+ PE-3(1) - Information System Access - Video Surveillance
  Requirement: Video surveillance of physical facilities
  FedRAMP Rationale: Physical security for government data
  Implementation: N/A (cloud-only, AWS handles physical security)
  Cloud Provider: AWS physical security attestation
  Inherited: Yes (from AWS FedRAMP package)
  Evidence: AWS FedRAMP authorization letter

+ RA-5(5) - Privileged Access for Vulnerability Scanning
  Requirement: Credentialed vulnerability scans
  FedRAMP Rationale: More thorough vulnerability detection
  Implementation:
    - Amazon Inspector (agent-based, credentialed)
    - Tenable.io or Qualys integration (if 3PAO requires)
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

+ SC-12(1) - Cryptographic Key Availability
  Requirement: Ensure cryptographic keys available when needed
  FedRAMP Rationale: Prevent data loss due to key unavailability
  Implementation:
    - KMS multi-region keys
    - Key backup to separate region
    - Documented key recovery process
  Effort: 12 hours
  Cost: \$50/month (additional KMS keys)
  Evidence: KMS key policies, backup documentation

+ SC-13 - Cryptographic Protection (FedRAMP Approved Algorithms)
  Requirement: Use only FIPS 140-2 validated cryptography
  FedRAMP Parameters: AES-256, RSA-2048+, SHA-256+
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

+ SI-3(1) - Central Management (Malware)
  Requirement: Centrally manage malware detection
  FedRAMP Rationale: Consistent protection across systems
  Implementation:
    - GuardDuty (AWS-native, auto-enabled)
    - CrowdStrike or Trend Micro (if EC2 workloads)
    - Central dashboard for all alerts
  Effort: 20 hours
  Cost: \$1,000/month (3rd party AV)
  Evidence: GuardDuty + AV console screenshots

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
PARAMETER CHANGES (FedRAMP vs NIST Baseline)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

More Restrictive Parameters:

AC-2(j) - Account Review Frequency
  NIST Moderate: "Organization-defined frequency"
  FedRAMP: "At least annually"
  RECOMMENDED: Quarterly (exceeds FedRAMP and PCI DSS 7.2.4's six-month minimum)

AU-11 - Audit Record Retention
  NIST Moderate: "Organization-defined time period"
  FedRAMP: "At least 90 days online, 1 year total"
  RECOMMENDED: 365 days online (easier compliance)

IA-5(1) - Password Requirements
  NIST Moderate: 14 characters minimum
  FedRAMP: 15 characters minimum + 60-day max age
  IMPLEMENTATION: 15 chars, 90-day age (balanced)

SC-28 - Data at Rest Encryption
  NIST Moderate: "Organization-defined information at rest"
  FedRAMP: "ALL data at rest must be encrypted"
  IMPLEMENTATION: Default encryption on all storage

SI-2 - Flaw Remediation Timeline
  NIST Moderate: "Organization-defined time period"
  FedRAMP: "Within 30 days (high), 60 days (moderate)"
  IMPLEMENTATION: 30 days for all (best practice)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEDRAMP DOCUMENTATION REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Required Deliverables:

1. System Security Plan (SSP)
   - FedRAMP template (300+ pages typical)
   - All 353 controls documented
   - Control implementation details
   - Evidence attachments
   Tool: /nist:ssp-section-generate

2. Security Assessment Plan (SAP)
   - Provided by 3PAO (Third Party Assessment Organization)
   - Review and approve
   - Identify testable assertions

3. Security Assessment Report (SAR)
   - Created by 3PAO after testing
   - Documents findings (open, risk-adjusted)
   - Remediation plans

4. Plan of Action & Milestones (POA&M)
   - All open findings
   - Remediation timeline
   - Risk ratings
   - Monthly updates required

5. Incident Response Plan
   - FedRAMP-specific requirements
   - 1-hour notification to FedRAMP PMO
   - Templates provided by FedRAMP

6. Configuration Management Plan
   - Baseline configurations
   - Change management process
   - Version control

7. Continuous Monitoring Plan
   - Monthly vulnerability scans (required)
   - Annual penetration test
   - Monthly security metrics to FedRAMP

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEDRAMP AUTHORIZATION PROCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Readiness Assessment (2-3 months, \$75k-\$150k)
  - Self-assessment against FedRAMP controls
  - Gap remediation
  - Documentation preparation
  - Pre-assessment by 3PAO (optional, recommended)

Step 2: 3PAO Assessment (3-4 months, \$150k-\$300k)
  - Kickoff and planning
  - Documentation review
  - Testing (design + operating effectiveness)
  - SAR creation

Step 3: Agency ATO (1-3 months, varies)
  - Submit package to agency
  - Agency review and acceptance
  - ConMon agreement
  - ATO issuance

Total Timeline: 6-10 months
Total Cost: \$225k-\$450k (initial), \$100k-\$200k/year (ConMon)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INHERITED CONTROLS (from AWS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FedRAMP allows inheritance from AWS (already FedRAMP authorized):

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

Evidence: AWS FedRAMP authorization package (publicly available)
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
CONTINUOUS MONITORING REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Monthly Deliverables to FedRAMP:

1. Vulnerability Scan Results
   - Authenticated scans (all assets)
   - Credentialed scans required
   - POA&M for findings >30 days old

2. POA&M Updates
   - All open findings
   - Status updates
   - Risk ratings

3. Incident Summary
   - All security incidents
   - Root cause analysis for P1/P2
   - Remediation status

4. Change Requests
   - Significant changes require approval
   - Examples: new services, architecture changes
   - Submit via FedRAMP portal

Annual Requirements:

1. Security Assessment
   - Full re-assessment every 3 years
   - Annual self-assessment in between
   - Penetration test

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
  3PAO Assessment:             \$150,000 - \$300,000
  Documentation (internal):     \$40,000 (400 hours @ \$100/hr)
  Misc (tools, training):       \$10,000
  TOTAL INITIAL:               \$300,000 - \$550,000

Ongoing (Annual):
  3PAO Annual Assessment:       \$75,000 - \$125,000
  Monthly ConMon:               \$15,000 - \$30,000
  Vuln Scanning (monthly):      \$12,000
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
2. Complete gap remediation for 28 additional controls
3. Select and engage 3PAO (get quotes from 3+)
4. Budget appropriately (\$300k-\$550k initial)
5. Allocate internal resources (400-800 hours)

Quick Wins (Implement First):

1. SC-28(1) - Data at rest encryption (\$0 cost, 8 hours)
2. IA-5(1) - Update password policy (\$0 cost, 2 hours)
3. SI-2(2) - Patch Manager (\$100/month, 16 hours)
4. AU-4(1) - Cross-region log replication (\$200/month, 16 hours)

High Impact:

1. IA-2(12) - PIV/CAC support (\$5k, 40 hours) - REQUIRED for gov users
2. CA-7(3) - Trend analysis (\$300/month, 32 hours)
3. RA-5(5) - Credentialed scanning (\$500/month, 16 hours)

Generate Implementation Code:

```bash
# Identify gaps
/nist:overlay-apply fedramp moderate --show-only-changes > gaps.txt

# Generate IaC to fix
/grc-engineer:generate-implementation AC-2 aws
/grc-engineer:generate-implementation AU-4 aws
# ... for each gap

# Or use SOC2 gap-to-code
/soc2:gap-to-code gaps.json aws --output-dir=./fedramp-remediation
```

```

## Other Overlays

### DoD Impact Level 4 (IL4)

Similar to FedRAMP High, with additional DoD-specific requirements:
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
- `/fedramp:assess` - FedRAMP-specific assessment
- `/grc-engineer:generate-implementation` - Generate IaC for gaps
