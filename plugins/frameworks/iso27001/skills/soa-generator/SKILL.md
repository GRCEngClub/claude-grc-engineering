---
name: soa-generator
description: Generate ISO 27001 Statement of Applicability (SOA) with control selection justifications
---

# ISO 27001 Statement of Applicability Generator

Generates a comprehensive Statement of Applicability (SOA) for ISO 27001 Annex A controls, including applicability decisions, implementation status, justifications, and evidence references required for certification audit.

## Usage

```bash
/iso:soa-generator [scope] [options]
```

## Arguments

- Argument 1 - Scope (optional): "cloud-only", "hybrid", "on-premise", or "full" (default: "full")
- Argument 2 - Options (optional): `--format=docx|xlsx|markdown`, `--include-evidence`, `--show-gaps-only`

## Examples

```bash
# Generate full SOA for all 93 Annex A controls
/iso:soa-generator full

# Cloud-only SOA (excludes physical controls)
/iso:soa-generator cloud-only

# Export as Excel spreadsheet
/iso:soa-generator full --format=xlsx

# Show only gaps (controls not implemented)
/iso:soa-generator full --show-gaps-only

# Include evidence references
/iso:soa-generator full --include-evidence
```

## Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ISO 27001:2022 STATEMENT OF APPLICABILITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Organization: Your Company, Inc.
ISMS Scope: Cloud infrastructure and SaaS application platform
Date: 2025-01-28
Version: 1.0
Prepared By: Information Security Team
Approved By: CISO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXECUTIVE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Annex A Controls: 93
Applicable: 78 (84%)
Not Applicable: 15 (16%)

Implementation Status:
  ✓ Implemented: 62 (79% of applicable)
  ⚠ Partially Implemented: 11 (14% of applicable)
  ✗ Not Implemented: 5 (6% of applicable)
  ○ Not Applicable: 15 (16% of total)

Certification Readiness: 79% (Target: 100% before Stage 2 audit)

Risk Summary:
  - 5 controls not implemented represent MEDIUM risk
  - 11 partially implemented controls under remediation
  - Target completion date: Q2 2025

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A.5 ORGANIZATIONAL CONTROLS (37 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A.5.1 - Policies for information security
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: ✓ APPLICABLE - IMPLEMENTED
Implementation Date: January 2024
Last Review: December 2024

Control Objective:
  To provide management direction and support for information security in
  accordance with business requirements and relevant laws and regulations.

Justification for Applicability:
  As a SaaS provider handling customer data, we require comprehensive
  information security policies to govern our operations, meet regulatory
  requirements (SOC 2, GDPR), and demonstrate commitment to security.

Implementation Description:
  Your Company maintains a comprehensive Information Security Policy (v2.1)
  approved by executive management and reviewed annually. The policy covers:
  - Information security objectives and strategy
  - Roles and responsibilities
  - Risk management approach
  - Asset classification and handling
  - Access control principles
  - Incident management
  - Business continuity

  Policy is communicated to all employees during onboarding and annually
  thereafter through mandatory security awareness training.

Evidence:
  - Information Security Policy v2.1 (approved 2024-01-15)
  - Executive management approval memo
  - Policy acknowledgment records (98% employee completion)
  - Annual policy review meeting minutes (2024-12-10)
  - Security awareness training completion records

Control Owner: CISO
Implementation Cost: \$8,000 (initial policy development)
Annual Review: December (annually)

Cross-Reference:
  - NIST 800-53: PL-1, PM-1
  - SOC 2: CC1.1, CC1.2
  - GDPR: Article 24 (Security measures)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A.5.2 - Information security roles and responsibilities
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: ✓ APPLICABLE - IMPLEMENTED
Implementation Date: January 2024

Control Objective:
  To ensure that information security responsibilities are defined and assigned.

Justification for Applicability:
  Clear definition of security roles ensures accountability and effective
  security management across the organization.

Implementation Description:
  Security roles and responsibilities are documented in:
  1. Organizational chart showing security reporting structure
  2. Job descriptions including security responsibilities
  3. RACI matrix for security processes

  Key Roles:
    - CISO: Overall security strategy and program management
    - Security Engineers: Technical security implementation and monitoring
    - IT Operations: Day-to-day security operations
    - Development Teams: Secure coding practices, security testing
    - All Employees: Following security policies, reporting incidents

  Responsibilities are reviewed during annual performance reviews and updated
  when organizational changes occur.

Evidence:
  - Organizational chart (updated 2024-11-01)
  - Job descriptions with security responsibilities
  - RACI matrix for ISMS processes
  - Performance review templates including security criteria
  - Security team charter (approved 2024-01-20)

Control Owner: CISO
Cross-Reference: NIST 800-53: PM-2; SOC 2: CC1.3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A.5.7 - Threat intelligence
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: ✓ APPLICABLE - PARTIALLY IMPLEMENTED
Implementation Date: March 2024 (in progress)
Target Completion: February 2025

Control Objective:
  To ensure that information related to information security threats is
  collected and analyzed to produce threat intelligence.

Justification for Applicability:
  As a cloud service provider, understanding the threat landscape is critical
  for proactive security measures and risk management.

Implementation Description:
  Current Implementation:
    ✓ AWS GuardDuty enabled (threat detection for AWS environment)
    ✓ Subscription to AWS Security Bulletins
    ✓ Monthly review of CISA alerts
    ✓ GitHub security advisories for dependencies

  Gaps:
    ✗ No formal threat intelligence platform
    ✗ Limited industry-specific threat intelligence
    ✗ No automated threat feed integration

  Planned Remediation:
    1. Implement threat intelligence platform (Q1 2025)
       - Evaluate: Recorded Future, ThreatConnect, or CrowdStrike Threat Graph
       - Budget: \$15,000/year
    2. Subscribe to FS-ISAC (Financial Services threat intelligence)
    3. Integrate threat feeds with SIEM

Evidence:
  - GuardDuty configuration and findings
  - CISA alert review log (monthly)
  - GitHub Dependabot alerts and remediation
  - Threat intelligence platform RFP (in progress)

Control Owner: Security Team
Risk Level (current gap): MEDIUM
Compensating Control: Enhanced monitoring via GuardDuty + manual review

Cross-Reference: NIST 800-53: PM-16; SOC 2: CC7.1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A.5.10 - Acceptable use of information and other associated assets
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: ✓ APPLICABLE - IMPLEMENTED
Implementation Date: January 2024

Control Objective:
  To ensure that personnel and other interested parties use information and
  other associated assets in accordance with acceptable use policies.

Implementation Description:
  Acceptable Use Policy (AUP) v1.6 defines permitted and prohibited uses of:
  - IT systems and networks
  - Email and communication tools
  - Cloud resources (AWS, GitHub, etc.)
  - Customer data
  - Company devices (laptops, mobile devices)

  Key provisions:
    - No personal use of customer data
    - No sharing of access credentials
    - No installation of unauthorized software
    - No use of personal cloud storage for company data
    - Monitoring and logging of system usage

  Policy enforced through:
    - Annual acknowledgment required (100% compliance)
    - Technical controls (DLP, endpoint protection)
    - Monitoring and auditing
    - Disciplinary action for violations

Evidence:
  - Acceptable Use Policy v1.6
  - Annual AUP acknowledgment (142/142 employees)
  - DLP policies blocking unauthorized cloud storage
  - USB device restrictions (enforced via MDM)
  - Policy violation incidents (2 in 2024, both resolved)

Control Owner: IT Operations
Cross-Reference: NIST 800-53: AC-20, PS-6; SOC 2: CC6.1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A.5.23 - Information security for use of cloud services
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: ✓ APPLICABLE - IMPLEMENTED
Implementation Date: January 2024

Control Objective:
  To establish processes for the acquisition, use, management, and exit from
  cloud services in accordance with the organization's information security
  requirements.

Implementation Description:
  Cloud Service Management Process covers:

  Acquisition:
    - Vendor risk assessment required (all new cloud services)
    - Security review of cloud provider's certifications (SOC 2, ISO 27001)
    - Contract review including data protection clauses
    - Budget approval process

  Use:
    - Configuration standards (CIS benchmarks)
    - Security baselines (encryption, logging, access control)
    - Monitoring and alerting
    - Regular security assessments

  Management:
    - Asset inventory (AWS Config, Terraform state)
    - Configuration management (Infrastructure as Code)
    - Quarterly vendor reviews
    - Annual risk reassessment

  Exit:
    - Data extraction procedures
    - Secure data deletion requirements
    - Service transition plan
    - Post-exit verification

  Primary Cloud Providers:
    ✓ AWS (production infrastructure) - SOC 2, ISO 27001, FedRAMP
    ✓ Okta (identity management) - SOC 2, ISO 27001
    ✓ GitHub (source code) - SOC 2
    ✓ Datadog (monitoring) - SOC 2

Evidence:
  - Cloud Service Management Procedure v1.2
  - Vendor risk assessments (4 primary vendors)
  - Vendor SOC 2 reports (reviewed annually)
  - Cloud configuration standards documentation
  - Terraform IaC for AWS infrastructure
  - Quarterly vendor review meeting minutes

Control Owner: CISO
Cross-Reference: NIST 800-53: SA-9; SOC 2: CC9.1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A.6 PEOPLE CONTROLS (8 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A.6.1 - Screening
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: ✓ APPLICABLE - IMPLEMENTED
Implementation Date: January 2024

Control Objective:
  To ensure that personnel are suitable for their roles and understand their
  responsibilities.

Implementation Description:
  Background screening process for all new hires:

  Standard Positions:
    - Identity verification
    - Employment history verification (7 years)
    - Education verification
    - Criminal background check (county, state, federal)
    - Reference checks (minimum 2 professional references)

  Privileged Positions (Security, IT, DevOps):
    - All standard checks plus:
    - Credit check (for financial access roles)
    - Drug screening
    - Enhanced background check (10 years)

  Contractors and Vendors:
    - Background screening required for onsite access
    - NDA signed before access to systems/data
    - Access limited to minimum necessary

  Process:
    - Screening initiated by HR upon offer acceptance
    - Results reviewed before start date
    - Adverse findings reviewed by HR + hiring manager
    - Re-screening every 3 years for privileged positions

Evidence:
  - Background Screening Policy v1.1
  - Screening results (stored securely in BambooHR)
  - Vendor screening records (for contractors)
  - Re-screening schedule and completion log

Control Owner: Human Resources
Cost: \$150/employee (standard), \$300 (privileged)
Cross-Reference: NIST 800-53: PS-3; SOC 2: CC1.4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A.6.5 - Responsibilities after termination or change of employment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: ✓ APPLICABLE - IMPLEMENTED
Implementation Date: January 2024

Control Objective:
  To protect the organization's interests as part of the process of changing
  or terminating employment.

Implementation Description:
  Termination/Transfer Procedure:

  Immediate Actions (within 4 hours):
    ✓ Disable all system accounts (Okta, AWS, GitHub, etc.)
    ✓ Revoke VPN access
    ✓ Deactivate physical access badges
    ✓ Remote wipe company devices (if not returned)
    ✓ Revoke access keys and API tokens

  Within 24 Hours:
    ✓ Collect company property (laptop, phone, badge)
    ✓ Conduct exit interview (security reminders)
    ✓ NDA and confidentiality reminder
    ✓ Return of company data verification

  Post-Termination:
    ✓ Email forwarding (30 days to manager)
    ✓ Knowledge transfer (if planned departure)
    ✓ Final access review (verify all access removed)
    ✓ Update asset inventory

  Automation:
    - HR termination in BambooHR triggers webhook
    - Lambda function disables Okta account
    - AWS SSO access auto-revoked (SCIM sync)
    - Slack notification to IT/Security teams

Evidence:
  - Termination Procedure v1.3
  - Termination checklist (all 12 terminations in 2024)
  - Automated deprovisioning logs
  - Exit interview documentation
  - Property return receipts

Control Owner: HR + IT Operations
Average Deprovisioning Time: 2.3 hours
Cross-Reference: NIST 800-53: PS-4; SOC 2: CC6.1, CC6.4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A.7 PHYSICAL CONTROLS (14 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A.7.1 - Physical security perimeters
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: ○ NOT APPLICABLE
Justification Date: January 2024

Control Objective:
  To prevent unauthorized physical access, damage, and interference to the
  organization's information and other associated assets.

Justification for Non-Applicability:
  Your Company operates a cloud-only infrastructure with no owned or leased
  data centers. All production infrastructure is hosted on AWS, which maintains
  physical security controls and provides ISO 27001 and SOC 2 attestations.

  Office Locations:
    - Corporate office (50 employees): Shared office space with landlord-
      managed physical security (badge access, security cameras, reception)
    - Remote workforce (92 employees): Home offices, no company-controlled
      physical security

  Physical security for AWS infrastructure is inherited from AWS. Evidence:
    - AWS ISO 27001 certificate (Annex A.7.1 covered)
    - AWS SOC 2 Type II report (physical security controls tested)
    - Shared Responsibility Matrix documents customer vs AWS responsibilities

  Corporate office physical security managed by building management, not in
  scope for ISMS (no customer data processed or stored in office).

Alternative Controls:
  - All customer data encrypted at rest (AWS infrastructure)
  - No local data storage policies (data must remain in cloud)
  - Device encryption required (corporate laptops)
  - Remote wipe capability (all company devices)

Evidence:
  - AWS compliance documents (ISO 27001, SOC 2)
  - Cloud-only architecture documentation
  - No Local Data Storage policy
  - Device encryption enforcement (MDM reports)

Risk Assessment:
  - Risk of physical breach: LOW (no data centers, cloud-only)
  - Residual risk from AWS: ACCEPTED (AWS maintains physical controls)

Approved By: CISO
Review Frequency: Annually (or if infrastructure changes)

Cross-Reference:
  - AWS responsibility: Physical and environmental security
  - Customer responsibility: Data encryption, access management

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A.8 TECHNOLOGICAL CONTROLS (34 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A.8.1 - User endpoint devices
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: ✓ APPLICABLE - IMPLEMENTED
Implementation Date: February 2024

Control Objective:
  To ensure security of user endpoint devices.

Implementation Description:
  Endpoint Device Security Program:

  Corporate Laptops (MacBook Pro, standard issue):
    ✓ Full disk encryption (FileVault) - enforced
    ✓ Automatic updates enabled
    ✓ Endpoint protection (CrowdStrike Falcon)
    ✓ MDM enrollment required (Jamf Pro)
    ✓ Screen lock after 5 minutes idle
    ✓ Password requirements (14+ chars, complexity)
    ✓ Remote wipe capability

  Mobile Devices (BYOD policy):
    ✓ Okta Verify app required for MFA
    ✓ Conditional access (compliant devices only)
    ✓ Company data containerized (work profile)
    ✓ Remote wipe for work data

  Technical Controls:
    - Jamf Pro MDM manages laptop configuration
    - CrowdStrike Falcon for endpoint protection
    - AWS Systems Manager for cloud-based management
    - Automated compliance checks (daily)

  Non-Compliance Handling:
    - Devices failing compliance checks blocked from network
    - User notified with remediation steps
    - IT support available for assistance
    - Escalation to manager after 48 hours

Evidence:
  - Endpoint Security Policy v1.4
  - MDM enrollment report (142/142 devices enrolled)
  - Encryption compliance report (100%)
  - CrowdStrike deployment status (100% coverage)
  - Compliance check results (daily)

Control Owner: IT Operations
Cost: \$50/device/month (MDM + endpoint protection)
Cross-Reference: NIST 800-53: AC-19, MP-2; SOC 2: CC6.6, CC6.7

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A.8.9 - Configuration management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: ✓ APPLICABLE - IMPLEMENTED
Implementation Date: January 2024

Control Objective:
  To establish and maintain configurations, including security configurations,
  of hardware, software, services, and networks.

Implementation Description:
  Configuration Management via Infrastructure as Code:

  Infrastructure:
    ✓ All AWS infrastructure defined in Terraform
    ✓ Version controlled in GitHub (main branch protected)
    ✓ Configuration baselines (CIS AWS Foundations Benchmark)
    ✓ Automated compliance scanning (AWS Config)

  Process:
    1. All changes via pull request (Terraform)
    2. Automated terraform plan in CI/CD
    3. Security team review required for approval
    4. Changes applied via Terraform Cloud
    5. AWS Config detects drift from baseline
    6. Manual changes trigger alerts → auto-remediation

  Security Baselines:
    - EC2: Amazon Linux 2023, SSM agent, encrypted EBS
    - S3: Default encryption, versioning, public access blocked
    - RDS: Encryption at rest, automated backups, Multi-AZ
    - VPC: Private subnets, NAT gateway, VPC endpoints
    - IAM: MFA required, password policy, no root usage

  Configuration Documentation:
    - Terraform modules (version controlled)
    - Architecture diagrams (updated quarterly)
    - Configuration baseline documentation
    - Change log (Git history + Terraform Cloud)

Evidence:
  - Terraform configuration files (GitHub repository)
  - CIS AWS Foundations Benchmark compliance report
  - AWS Config compliance dashboard
  - Terraform Cloud run logs (all changes)
  - Manual change detection alerts and remediation

Control Owner: DevOps Team
Cross-Reference: NIST 800-53: CM-2, CM-3, CM-6; SOC 2: CC8.1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A.8.24 - Use of cryptography
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: ✓ APPLICABLE - IMPLEMENTED
Implementation Date: January 2024

Control Objective:
  To ensure proper and effective use of cryptography to protect the
  confidentiality, authenticity and/or integrity of information.

Implementation Description:
  Cryptography Policy and Standards:

  Data at Rest:
    ✓ S3 buckets: AES-256 encryption (default enabled)
    ✓ RDS databases: AES-256 encryption
    ✓ EBS volumes: AES-256 encryption
    ✓ Secrets Manager: Encrypted with KMS
    ✓ Backups: Encrypted

  Data in Transit:
    ✓ TLS 1.2+ only (TLS 1.0/1.1 disabled)
    ✓ Strong cipher suites (AES-GCM preferred)
    ✓ HSTS enforced (max-age=31536000)
    ✓ Certificate management via ACM (auto-renewal)

  Key Management:
    ✓ AWS KMS for encryption keys
    ✓ Customer-managed keys (CMK) for sensitive data
    ✓ Automatic key rotation (annually)
    ✓ Key access logged in CloudTrail
    ✓ Key policies enforce least privilege

  Cryptographic Standards:
    - Encryption: AES-256 (symmetric), RSA-2048+ (asymmetric)
    - Hashing: SHA-256 or stronger
    - TLS: Version 1.2 or 1.3 only
    - Certificates: 2048-bit RSA minimum, 1-year validity

  Prohibited:
    ✗ DES, 3DES, RC4 (weak algorithms)
    ✗ MD5, SHA-1 (weak hashing)
    ✗ Self-signed certificates in production
    ✗ Hardcoded encryption keys

Evidence:
  - Encryption Policy v1.5
  - KMS key configuration and rotation schedule
  - S3 encryption configuration (all buckets)
  - TLS configuration (ALB, CloudFront)
  - SSL Labs scan results (A+ rating)
  - Certificate inventory (ACM)

Control Owner: Security Team
Cross-Reference: NIST 800-53: SC-12, SC-13, SC-28; SOC 2: CC6.7, CC6.8

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTROLS NOT IMPLEMENTED (RISK ACCEPTED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A.5.7 - Threat Intelligence (Partially Implemented)
  Status: Under implementation (Q1 2025)
  Risk Level: MEDIUM
  Gap: No formal threat intelligence platform
  Compensating Control: Enhanced monitoring via GuardDuty
  Remediation Plan: Implement threat intelligence platform by Q1 2025
  Budget Allocated: \$15,000/year
  Approval: CISO (accepted residual risk until implementation)

A.8.16 - Monitoring activities (Partially Implemented)
  Status: Under implementation (Q1 2025)
  Risk Level: MEDIUM
  Gap: No centralized SIEM for log correlation
  Compensating Control: CloudWatch Logs + GuardDuty + manual analysis
  Remediation Plan: Implement Splunk Cloud or similar SIEM by Q2 2025
  Budget Allocated: \$100,000/year
  Approval: CFO + CISO (cost-benefit analysis in progress)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPROVAL AND REVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prepared By:
  Name: Jane Smith, Security Engineer
  Date: 2025-01-28
  Signature: _________________________

Reviewed By:
  Name: John Doe, CISO
  Date: 2025-01-28
  Signature: _________________________

Approved By:
  Name: Sarah Johnson, CEO
  Date: 2025-01-28
  Signature: _________________________

Next Review Date: January 2026 (or upon significant ISMS changes)

Changes Since Last Version:
  - v1.0 (2025-01-28): Initial SOA for ISO 27001:2022 certification
```

## Excel Export Format

```
Column A: Control ID
Column B: Control Name
Column C: Applicability (Applicable/Not Applicable)
Column D: Implementation Status (Implemented/Partial/Not Implemented)
Column E: Justification
Column F: Evidence Reference
Column G: Control Owner
Column H: Implementation Date
Column I: Next Review Date
Column J: Cross-References (NIST, SOC 2, etc.)

Example rows:
A.5.1 | Policies for information security | Applicable | Implemented | Required for business operations | InfoSec Policy v2.1 | CISO | 2024-01-15 | 2025-01-15 | NIST PL-1, SOC2 CC1.1
A.7.1 | Physical security perimeters | Not Applicable | N/A | Cloud-only, no data centers | AWS compliance docs | CISO | 2024-01-15 | 2025-01-15 | Inherited from AWS
```

## Related Commands

- `/iso:assess` - Gap analysis to identify controls needing work
- `/iso:risk-treatment-plan` - Create risk treatment plan for gaps
- `/iso:annex-a-deep-dive` - Deep dive on specific Annex A domain
- `/iso:certification-roadmap` - Plan certification process
- `/iso:isms-documentation-pack` - Generate all required ISMS documents
