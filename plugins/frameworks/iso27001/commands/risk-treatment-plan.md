---
description: Generate ISO 27001 Risk Treatment Plan with remediation timelines and ownership
---

# ISO 27001 Risk Treatment Plan Generator

Generates a comprehensive Risk Treatment Plan for identified information security risks, including risk assessment results, treatment options, implementation timelines, ownership assignments, and residual risk acceptance criteria.

## Usage

```bash
/iso:risk-treatment-plan [risk-level] [options]
```

## Arguments

- Argument 1 - Risk level filter (optional): "critical", "high", "medium", "low", or "all" (default: "all")
- Argument 2 - Options (optional): `--format=docx|xlsx|markdown`, `--include-costs`, `--show-residual-only`

## Examples

```bash
# Generate full risk treatment plan
/iso:risk-treatment-plan all

# High and critical risks only
/iso:risk-treatment-plan high

# Export as Excel with cost estimates
/iso:risk-treatment-plan all --format=xlsx --include-costs

# Show residual risks requiring acceptance
/iso:risk-treatment-plan all --show-residual-only
```

## Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ISO 27001:2022 RISK TREATMENT PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Organization: Your Company, Inc.
ISMS Scope: Cloud infrastructure and SaaS application
Risk Assessment Date: 2024-12-15
Plan Version: 2.1
Approved By: CISO, CEO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXECUTIVE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Risks Identified: 47
  🔴 Critical: 2 risks (4%)
  🟠 High: 8 risks (17%)
  🟡 Medium: 22 risks (47%)
  🟢 Low: 15 risks (32%)

Treatment Strategy Distribution:
  ✓ Mitigate: 35 risks (75%)
  ⚠ Accept: 8 risks (17%)
  → Transfer: 3 risks (6%)
  ○ Avoid: 1 risk (2%)

Implementation Status:
  ✓ Completed: 28 risks (80% of mitigation)
  ⏳ In Progress: 5 risks (14%)
  ⏸ Planned: 2 risks (6%)

Total Treatment Cost: \$127,000 (initial) + \$48,000/year (ongoing)
Risk Reduction: 78% (inherent risk → residual risk)

Residual Risk Level: MEDIUM (acceptable per risk appetite)
Management Approval Required: 8 risks (accepted residual risk)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RISK TREATMENT METHODOLOGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Risk Assessment Methodology: ISO 27005:2022
Risk Matrix: 5x5 (Likelihood × Impact)
Risk Appetite: MEDIUM (willing to accept medium residual risks)
Risk Tolerance: No critical or high residual risks accepted

Treatment Options:
  1. MITIGATE: Implement controls to reduce likelihood or impact
  2. ACCEPT: Accept risk if within tolerance (management approval required)
  3. TRANSFER: Transfer risk via insurance, outsourcing, or contracts
  4. AVOID: Eliminate risk by discontinuing risky activity

Review Frequency:
  - Risk Treatment Plan: Quarterly
  - Risk Assessment: Annually or upon significant changes
  - Residual Risk Acceptance: Annually

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RISKS (Immediate Action Required)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RISK-001: Insufficient Disaster Recovery Capabilities
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Inherent Risk Level: 🔴 CRITICAL (Likelihood: 3, Impact: 5) = Risk Score 15

Threat:
  Natural disaster, cyber attack, or infrastructure failure affecting AWS
  us-east-1 region could cause extended service outage.

Vulnerability:
  - Single-region deployment (no cross-region failover)
  - Recovery Time Objective (RTO): 8 hours (target: 4 hours)
  - Recovery Point Objective (RPO): 4 hours (target: 1 hour)
  - No automated failover mechanism

Impact if Realized:
  - Extended service outage (>8 hours)
  - Customer data loss (up to 4 hours)
  - Revenue loss: \$50,000/day
  - Reputation damage
  - SLA breach penalties
  - Regulatory reporting requirements (if >72 hours)

Assets Affected:
  - Production RDS databases
  - Application servers (EC2, ECS)
  - Customer-facing web application
  - 10,000+ active customers

Treatment Option: ✓ MITIGATE

Planned Controls:
  1. Multi-Region Architecture (Primary: us-east-1, DR: us-west-2)
     - RDS cross-region read replicas (real-time replication)
     - S3 cross-region replication
     - Route 53 health checks and automatic failover
     - Infrastructure as Code (Terraform) for DR region

  2. Automated Disaster Recovery Procedures
     - Automated failover scripts (tested quarterly)
     - DR runbook documentation
     - Quarterly DR testing (full failover test)

  3. Enhanced Backup Strategy
     - Continuous backup to DR region
     - 30-day backup retention
     - Automated backup validation

Implementation Timeline:
  Phase 1 (Weeks 1-4): DR region infrastructure deployment
  Phase 2 (Weeks 5-8): Data replication setup and testing
  Phase 3 (Weeks 9-12): Automated failover implementation
  Phase 4 (Week 13): First DR test

  Target Completion: March 31, 2025

Responsibility:
  Owner: VP Engineering
  Implementer: DevOps Team
  Reviewer: CISO

Budget:
  Initial: \$35,000 (DR infrastructure setup, testing)
  Ongoing: \$12,000/year (DR region running costs)

Expected Residual Risk:
  Level: 🟡 MEDIUM (Likelihood: 2, Impact: 3) = Risk Score 6
  Justification: Multi-region architecture reduces likelihood and limits impact
  Acceptance: Residual risk within tolerance (no further action required)

Evidence:
  - DR architecture diagram (to be created)
  - Terraform DR configuration (to be created)
  - DR test results (quarterly, starting Q2 2025)
  - RTO/RPO metrics (monitored post-implementation)

Related ISO 27001 Controls:
  - A.5.29: Information security during disruption
  - A.5.30: ICT readiness for business continuity
  - A.8.13: Information backup
  - A.8.14: Redundancy of information processing facilities

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RISK-002: Inadequate Vendor Risk Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Inherent Risk Level: 🔴 CRITICAL (Likelihood: 4, Impact: 4) = Risk Score 16

Threat:
  Third-party vendor security breach leads to compromise of customer data
  or service disruption. Recent supply chain attacks (SolarWinds, MOVEit)
  demonstrate this threat is actively exploited.

Vulnerability:
  - 47 third-party vendors with access to systems/data
  - Only 12/47 vendors have completed security assessments (26%)
  - No continuous monitoring of vendor security posture
  - No vendor incident response integration
  - Vendor offboarding process incomplete (orphaned access)

Impact if Realized:
  - Customer data breach via vendor compromise
  - Regulatory fines (GDPR: up to 4% of revenue)
  - Customer notification requirements
  - Reputational damage
  - Loss of customer trust

Assets Affected:
  - Customer data (PII, payment information)
  - Internal systems accessed by vendors
  - Shared infrastructure (Okta, AWS, GitHub)

Treatment Option: ✓ MITIGATE

Planned Controls:
  1. Vendor Risk Assessment Program
     - Risk assessment for all vendors (prioritize by data access)
     - Annual reassessment (high-risk vendors: quarterly)
     - Security questionnaire (SOC 2, ISO 27001, insurance)
     - Risk scoring (critical/high/medium/low)

  2. Vendor Contract Requirements
     - Data protection clauses (GDPR Article 28 compliant)
     - Right to audit clause
     - Breach notification requirements (24 hours)
     - Cyber insurance requirements (\$5M minimum for high-risk vendors)

  3. Continuous Vendor Monitoring
     - SecurityScorecard or BitSight ratings (automated)
     - Breach monitoring (have vendors been compromised?)
     - SOC 2 report review (annually)

  4. Vendor Access Management
     - Least privilege access (minimum necessary)
     - Quarterly vendor access reviews
     - Automated offboarding when contract ends

Implementation Timeline:
  Phase 1 (Weeks 1-2): Vendor inventory and categorization
  Phase 2 (Weeks 3-6): Risk assessments (prioritize high-risk first)
  Phase 3 (Weeks 7-10): Contract reviews and amendments
  Phase 4 (Weeks 11-12): Continuous monitoring setup

  Target Completion: April 30, 2025

Responsibility:
  Owner: CISO
  Implementers: Security Team, Legal, Procurement
  Reviewer: Risk Committee

Budget:
  Initial: \$18,000 (SecurityScorecard subscription, assessments)
  Ongoing: \$15,000/year (monitoring platform, annual reassessments)

Expected Residual Risk:
  Level: 🟡 MEDIUM (Likelihood: 2, Impact: 3) = Risk Score 6
  Justification: Vendor assessments and monitoring reduce likelihood;
                contracts limit impact via insurance and liability
  Acceptance: Residual risk within tolerance

Evidence:
  - Vendor Risk Management Policy v1.0 (to be created)
  - Vendor risk assessment reports (47 vendors)
  - Vendor contracts with security clauses (all new/renewed contracts)
  - SecurityScorecard dashboards
  - Quarterly vendor access review results

Related ISO 27001 Controls:
  - A.5.19: Information security in supplier relationships
  - A.5.20: Addressing information security within supplier agreements
  - A.5.21: Managing information security in the ICT supply chain
  - A.5.22: Monitoring, review and change management of supplier services

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HIGH RISKS (Priority Action Required)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RISK-008: Insufficient Security Awareness Training
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Inherent Risk Level: 🟠 HIGH (Likelihood: 4, Impact: 3) = Risk Score 12

Threat:
  Employees fall victim to phishing attacks, leading to credential compromise,
  malware infection, or unauthorized data access.

Vulnerability:
  - Annual security training only (not frequent enough)
  - No phishing simulation testing
  - Training completion: 98% (2 employees overdue)
  - Training is generic (not role-specific)

Impact if Realized:
  - Credential compromise leading to unauthorized access
  - Malware infection (ransomware, data exfiltration)
  - Business email compromise (BEC) financial fraud
  - Customer data breach

Assets Affected:
  - Employee credentials (142 users)
  - Email system (Office 365)
  - Internal systems (AWS, GitHub, Jira)

Treatment Option: ✓ MITIGATE

Planned Controls:
  1. Enhanced Security Awareness Program
     - Quarterly security training (instead of annual)
     - Role-based training (developers, IT, general staff)
     - Microlearning modules (5-10 minutes monthly)

  2. Phishing Simulation Testing
     - Monthly simulated phishing campaigns
     - Immediate training for users who click
     - Tracking and metrics (click rate, reporting rate)
     - Target: <5% click rate, >50% reporting rate

  3. Security Champions Program
     - Designate security champions in each team
     - Monthly security updates and discussions
     - Incident response training

Implementation Timeline:
  Immediate: Q1 2025
  Ongoing: Monthly phishing tests, quarterly training

Responsibility:
  Owner: CISO
  Implementer: Security Team
  Training Provider: KnowBe4 or similar

Budget:
  Initial: \$8,000 (platform setup, initial content)
  Ongoing: \$12,000/year (\$7/user/month for 142 users)

Expected Residual Risk:
  Level: 🟢 LOW (Likelihood: 2, Impact: 2) = Risk Score 4
  Justification: Training reduces likelihood; other controls (MFA, email
                filtering) limit impact
  Acceptance: Residual risk acceptable

Evidence:
  - Security Awareness Training Policy v1.1
  - Training completion reports (quarterly)
  - Phishing simulation results (monthly)
  - Click rate trends (target: improving)

Related ISO 27001 Controls:
  - A.6.3: Information security awareness, education, and training

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MEDIUM RISKS (Managed Risk)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RISK-014: Inadequate Patch Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Inherent Risk Level: 🟡 MEDIUM (Likelihood: 3, Impact: 3) = Risk Score 9

Threat:
  Unpatched systems exploited by attackers using known vulnerabilities.

Vulnerability:
  - Patch deployment average: 45 days (target: 30 days)
  - No automated patching for production systems
  - Testing before patching causes delays

Treatment Option: ✓ MITIGATE

Planned Controls:
  1. Automated Patch Management
     - AWS Systems Manager Patch Manager
     - Automated testing in dev environment
     - Automated deployment to staging (7 days after release)
     - Automated deployment to production (14 days after release)
     - Emergency patch process (critical CVEs within 7 days)

  2. Vulnerability Scanning
     - Weekly vulnerability scans (Amazon Inspector)
     - Prioritization based on CVSS score and exploitability

Implementation Timeline: Q1 2025 (12 weeks)

Responsibility:
  Owner: VP Engineering
  Implementer: DevOps Team

Budget:
  Initial: \$5,000 (SSM setup, testing automation)
  Ongoing: \$2,000/year (Inspector costs)

Expected Residual Risk:
  Level: 🟢 LOW (Likelihood: 1, Impact: 3) = Risk Score 3

Evidence:
  - Patch Management Policy v1.3
  - SSM Patch Manager configuration
  - Weekly vulnerability scan results
  - Patch compliance reports (target: >95%)

Related ISO 27001 Controls:
  - A.8.8: Management of technical vulnerabilities

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RISKS ACCEPTED (Management Approval Required)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RISK-023: Limited Threat Intelligence Capabilities
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Inherent Risk Level: 🟡 MEDIUM (Likelihood: 3, Impact: 2) = Risk Score 6

Threat:
  Inability to proactively identify emerging threats relevant to our industry
  and technology stack.

Vulnerability:
  - No formal threat intelligence platform
  - Limited industry threat sharing
  - Reactive security posture

Treatment Option: ⚠ ACCEPT (for now)

Justification for Acceptance:
  - Cost of threat intelligence platform (\$15,000/year) outweighs immediate
    benefit given current threat landscape
  - Compensating controls provide adequate protection:
    * AWS GuardDuty for anomaly detection
    * Regular review of CISA alerts
    * GitHub security advisories for dependencies
  - Risk level (MEDIUM) is within risk tolerance
  - Will revisit decision if threat landscape changes or organization grows

Residual Risk: 🟡 MEDIUM (Likelihood: 3, Impact: 2) = Risk Score 6

Compensating Controls:
  ✓ AWS GuardDuty enabled (threat detection)
  ✓ Monthly CISA alert review
  ✓ GitHub Dependabot (dependency vulnerabilities)
  ✓ Security news monitoring (manual)

Review Date: Q3 2025 (or upon significant threat landscape change)

Approved By:
  Name: John Doe, CISO
  Date: 2025-01-15
  Signature: _________________________

  Name: Sarah Johnson, CEO
  Date: 2025-01-15
  Signature: _________________________

Evidence:
  - Risk acceptance form (signed)
  - Cost-benefit analysis
  - Compensating controls verification

Related ISO 27001 Controls:
  - A.5.7: Threat intelligence

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RISKS TRANSFERRED (Insurance/Contracts)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RISK-029: Third-Party Data Breach
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Inherent Risk Level: 🟠 HIGH (Likelihood: 3, Impact: 4) = Risk Score 12

Threat:
  Critical vendor (Okta, AWS, GitHub) suffers data breach affecting our data.

Treatment Option: → TRANSFER (via insurance and contracts)

Transfer Mechanisms:
  1. Cyber Insurance Policy
     - Coverage: \$5M per incident, \$10M aggregate
     - Deductible: \$100,000
     - Covers: Data breach response, notification, legal fees, fines
     - Premium: \$25,000/year
     - Carrier: Marsh (A-rated)

  2. Vendor Contracts
     - Indemnification clauses in vendor agreements
     - Vendor cyber insurance requirements (\$5M minimum)
     - Liability caps negotiated

  3. Mitigation Controls (to reduce insurance premium):
     - Multi-factor authentication
     - Encryption at rest and in transit
     - Regular security assessments
     - Incident response plan

Residual Risk: 🟡 MEDIUM (Likelihood: 2, Impact: 2) = Risk Score 4
  (Financial impact transferred; operational impact remains)

Cost:
  Cyber Insurance: \$25,000/year
  Legal review of vendor contracts: \$10,000 (one-time)

Evidence:
  - Cyber insurance policy document
  - Vendor contracts with indemnification clauses
  - Insurance coverage certificate

Approved By: CFO + CISO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RISK TREATMENT IMPLEMENTATION ROADMAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q1 2025 (Jan-Mar):
  🔴 RISK-001: Multi-region DR architecture
  🔴 RISK-002: Vendor risk assessment program
  🟠 RISK-008: Enhanced security training + phishing tests
  🟡 RISK-014: Automated patch management

Q2 2025 (Apr-Jun):
  🟠 RISK-011: Implement SIEM (Splunk Cloud)
  🟡 RISK-018: Enhanced logging and monitoring
  🟡 RISK-022: Improved change management

Q3 2025 (Jul-Sep):
  🟡 RISK-024: Network segmentation improvements
  🟡 RISK-027: Enhanced backup verification
  ⚠ Review accepted risks (quarterly review)

Q4 2025 (Oct-Dec):
  🟡 RISK-033: Improved incident response capabilities
  📊 Annual risk assessment
  📊 Risk treatment plan review

Ongoing:
  - Quarterly risk review meetings
  - Monthly risk dashboard updates
  - Continuous monitoring of control effectiveness

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
METRICS AND MONITORING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Risk Treatment KPIs:
  - Mitigation on schedule: 80% (target: >90%)
  - Average risk score reduction: 78%
  - Critical/High residual risks: 0 (target: 0)
  - Budget variance: +8% over plan (acceptable)

Risk Metrics Dashboard:
  - Total risk exposure (inherent vs residual)
  - Risks by treatment option (pie chart)
  - Implementation progress (Gantt chart)
  - Risk score trend (30-day rolling)

Monthly Risk Committee Report:
  - New risks identified
  - Treatment progress updates
  - Budget/timeline variances
  - Residual risk changes
  - Upcoming risk reviews

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPROVAL SIGNATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Risk Treatment Plan Approved:

CISO:
  Name: John Doe
  Date: 2025-01-28
  Signature: _________________________

CEO:
  Name: Sarah Johnson
  Date: 2025-01-28
  Signature: _________________________

CFO (Budget Approval):
  Name: Michael Chen
  Date: 2025-01-28
  Signature: _________________________

Risk Committee Chair:
  Name: David Williams
  Date: 2025-01-28
  Signature: _________________________

Next Review: April 2025 (Quarterly)
```

## Related Commands

- `/iso:assess` - Conduct risk assessment to identify risks
- `/iso:soa-generator` - Generate Statement of Applicability
- `/iso:annex-a-deep-dive` - Deep dive on controls
- `/iso:certification-roadmap` - Plan certification process
- `/grc-engineer:generate-implementation` - Generate IaC for mitigations
