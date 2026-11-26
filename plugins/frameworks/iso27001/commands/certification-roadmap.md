---
description: Generate ISO 27001 certification roadmap from readiness through surveillance audits
---

# ISO 27001 Certification Roadmap

Generates a comprehensive roadmap for achieving and maintaining ISO 27001:2022 certification, including gap remediation, ISMS documentation, Stage 1 and Stage 2 audits, and ongoing surveillance requirements.

## Usage

```bash
/iso:certification-roadmap [target-date] [options]
```

## Arguments

- Argument 1 - Target certification date (optional): "2025-12-31" or "12-months" (default: "12-months")
- Argument 2 - Options (optional): `--current-maturity=low|medium|high`, `--scope=cloud-only|hybrid`, `--fast-track`

## Examples

```bash
# Standard 12-month roadmap
/iso:certification-roadmap 12-months

# Aggressive 6-month fast-track
/iso:certification-roadmap 6-months --fast-track

# Specific target date with current state
/iso:certification-roadmap 2025-09-30 --current-maturity=medium

# Cloud-only scope (simpler)
/iso:certification-roadmap 12-months --scope=cloud-only
```

## Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ISO 27001:2022 CERTIFICATION ROADMAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Organization: Your Company, Inc.
Start Date: February 2025
Target Certification: January 2026 (12 months)
Scope: Cloud infrastructure and SaaS application
Current Maturity: Medium (some controls implemented)
Certification Body: TBD (select by Month 3)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CERTIFICATION PROCESS OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Timeline: 12 months total
  - Months 1-3:   Gap analysis and planning (Readiness)
  - Months 4-9:   Implementation and ISMS operation (Build & Operate)
  - Month 10:     Stage 1 audit (Document review)
  - Month 11:     Stage 2 audit (On-site assessment)
  - Month 12:     Certification issuance
  - Ongoing:      Annual surveillance audits

Total Estimated Cost: \$95,000 - \$145,000
  - Internal effort: \$55,000 - \$85,000 (550-850 hours @ \$100/hour)
  - External costs: \$40,000 - \$60,000 (certification body, consultants)

Key Milestones:
  ✓ Month 3:  Gap remediation complete, ISMS documented
  ✓ Month 6:  3 months of ISMS operation (minimum required)
  ✓ Month 9:  6 months operation, evidence collected
  ✓ Month 10: Stage 1 audit passed
  ✓ Month 11: Stage 2 audit passed
  ✓ Month 12: Certificate received

Success Factors:
  - Executive management commitment and sponsorship
  - Dedicated ISMS owner (30-50% time commitment)
  - Cross-functional team involvement
  - Budget approved (\$95k-\$145k)
  - Realistic timeline (12+ months for first-time certification)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MONTH 1-2: GAP ANALYSIS & PLANNING (Readiness Assessment)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Objectives:
  - Understand current state vs. ISO 27001 requirements
  - Identify gaps in controls, policies, and procedures
  - Develop remediation plan with priorities
  - Secure budget and resources

Week 1-2: Initial Assessment
  □ Conduct ISO 27001 readiness assessment
    Command: /iso:assess full --output=detailed
    Output: Gap analysis report with 93 Annex A controls

  □ Define ISMS scope
    Questions to answer:
      - What systems and processes are in scope?
      - What data do we protect (customer data, IP, etc.)?
      - What locations (cloud regions, offices)?
      - What organizational boundaries?

    Example Scope Statement:
      "The ISMS covers all systems and processes used to provide the
       [Product Name] SaaS application to customers, including AWS
       infrastructure in us-east-1 and us-west-2 regions, application
       development, and customer support operations. Excluded from scope:
       marketing website (separate infrastructure), mobile app (separate
       audit), corporate office IT (no customer data)."

  □ Identify key stakeholders
    - ISMS Owner: CISO (overall responsibility)
    - Implementation Team: Security, IT, DevOps, Legal, HR
    - Management Rep: CFO or COO (executive sponsor)
    - Internal Auditor: Internal audit or external consultant

Week 3-4: Planning & Prioritization
  □ Analyze gap assessment results
    - Categorize gaps: Critical, High, Medium, Low
    - Estimate effort and cost per gap
    - Identify dependencies

  □ Create implementation roadmap
    Command: Generate remediation plan from gaps
    Output: Prioritized list of controls to implement

  □ Define success criteria
    - 100% of applicable Annex A controls implemented
    - All mandatory ISMS documentation complete
    - 3+ months of evidence collection
    - Zero critical findings in Stage 1 audit

  □ Select certification body (start RFP process)
    Top Certification Bodies:
      - BSI Group (British Standards Institution)
      - NQA (National Quality Assurance)
      - LRQA (Lloyd's Register Quality Assurance)
      - DQS Inc
      - SGS

    Selection Criteria:
      - Accreditation (ANAB, UKAS, etc.)
      - Experience with cloud/SaaS companies
      - Geographic coverage
      - Cost (\$25k-\$40k for initial certification)
      - Timeline (can they meet your target date?)

    RFP Questions:
      - What is your audit process and timeline?
      - How many audit days required? (Typically 3-5 days Stage 2)
      - Do you charge for travel/expenses?
      - What is included in surveillance audits?
      - References from similar clients?

Deliverables:
  ✓ Gap analysis report (detailed findings)
  ✓ ISMS scope statement (approved by management)
  ✓ Implementation roadmap (12-month plan)
  ✓ Budget approval (\$95k-\$145k)
  ✓ Certification body RFP (responses due Month 3)

Effort: 120 hours (2-3 people full-time for 1 month)
Cost: \$12,000 internal + \$5,000 external (optional consultant)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MONTH 3-4: POLICY DEVELOPMENT & DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Objectives:
  - Create all mandatory ISMS documentation
  - Develop policies and procedures
  - Obtain management approval

Required ISMS Documentation (Clause 7.5):

1. ISMS Scope Statement
   Status: ✓ Completed in Month 1
   Owner: CISO
   Approval: Executive management

2. Information Security Policy (Clause 5.2)
   Content:
     - Management commitment to ISMS
     - Information security objectives
     - Roles and responsibilities
     - Approach to risk management
     - Commitment to continual improvement

   Template: Use /iso:isms-documentation-pack to generate
   Approval Required: CEO or Board of Directors
   Review Frequency: Annually

3. Risk Assessment Methodology (Clause 6.1.2)
   Content:
     - Risk identification process
     - Risk analysis method (qualitative/quantitative)
     - Risk evaluation criteria (5x5 matrix)
     - Risk acceptance criteria

   Tool: ISO 27005 risk assessment framework
   Output: Risk assessment methodology document

4. Statement of Applicability (SOA) (Clause 6.1.3d)
   Command: /iso:soa-generator full --include-evidence
   Content:
     - All 93 Annex A controls
     - Applicability decision (applicable vs. not applicable)
     - Justification for each decision
     - Implementation status
     - Control owners

   Approval: CISO + Management

5. Risk Treatment Plan (Clause 6.1.3e, 6.2)
   Command: /iso:risk-treatment-plan all --include-costs
   Content:
     - All identified risks
     - Treatment option (mitigate, accept, transfer, avoid)
     - Planned controls
     - Responsibility and timeline
     - Residual risk acceptance

   Approval: CISO + CEO (for risk acceptance)

6. Risk Assessment Report (Clause 8.2)
   Content:
     - Assets identified
     - Threats and vulnerabilities
     - Inherent risk scores
     - Existing controls
     - Residual risk scores
     - Decisions (accept or treat)

   Frequency: Annually (initial + annual reviews)

Supporting Policies and Procedures (40-50 documents typical):

  Access Control:
    □ Access Control Policy
    □ Password Policy
    □ Privileged Access Management Procedure
    □ User Provisioning/Deprovisioning Procedure
    □ Access Review Procedure

  Asset Management:
    □ Asset Management Policy
    □ Asset Inventory Procedure
    □ Acceptable Use Policy

  Cryptography:
    □ Cryptography Policy
    □ Key Management Procedure

  Operations Security:
    □ Change Management Policy
    □ Backup and Recovery Procedure
    □ Capacity Management Procedure
    □ Malware Protection Procedure

  Communications Security:
    □ Network Security Policy
    □ Remote Access Policy

  System Acquisition, Development, Maintenance:
    □ Secure Development Policy
    □ Testing Procedure

  Supplier Relationships:
    □ Vendor Risk Management Policy
    □ Vendor Security Assessment Procedure

  Incident Management:
    □ Incident Response Policy
    □ Incident Response Procedure/Runbook

  Business Continuity:
    □ Business Continuity Policy
    □ Disaster Recovery Plan
    □ Crisis Communication Plan

  Compliance:
    □ Compliance Monitoring Procedure
    □ Internal Audit Procedure

Policy Development Tips:
  - Use templates (save time, ensure completeness)
  - Tailor to your organization (don't copy-paste)
  - Keep policies high-level, procedures detailed
  - Version control all documents
  - Require management approval for policies
  - Set review frequency (annually minimum)

Deliverables:
  ✓ All mandatory ISMS documents (6 core documents)
  ✓ 40-50 supporting policies and procedures
  ✓ Management approval for all policies
  ✓ Document control system (version control, approval workflow)

Effort: 200 hours (CISO 50%, Security team 50%, Legal review)
Cost: \$20,000 internal + \$8,000 external (legal review, templates)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MONTH 5-6: CONTROL IMPLEMENTATION (Build Phase)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Objectives:
  - Implement missing controls (highest priority first)
  - Configure technical controls
  - Train personnel
  - Begin evidence collection

Priority 1: Critical Controls (Must implement first)
  □ Access Control (A.5.15, A.5.16, A.5.17, A.8.2, A.8.3, A.8.5)
    - MFA for all users (100% enrollment)
    - Privileged access management
    - Quarterly access reviews
    Effort: 60 hours
    Cost: \$10,000 (Okta licenses, implementation)

  □ Cryptography (A.8.24)
    - Encrypt all data at rest (S3, RDS, EBS)
    - TLS 1.2+ for all data in transit
    - KMS key management
    Effort: 24 hours
    Cost: \$2,000 (KMS, implementation)

  □ Logging and Monitoring (A.8.15, A.8.16)
    - CloudTrail multi-region enabled
    - 1-year log retention
    - GuardDuty threat detection
    Effort: 32 hours
    Cost: \$6,000/year (storage, GuardDuty)

  □ Configuration Management (A.8.9)
    - Infrastructure as Code (Terraform)
    - AWS Config compliance monitoring
    - Change management process
    Effort: 80 hours
    Cost: \$8,000 (Config, implementation)

  □ Backup and Recovery (A.8.13)
    - Automated backups (RDS, S3 versioning)
    - Cross-region replication
    - Quarterly recovery testing
    Effort: 40 hours
    Cost: \$12,000/year (DR infrastructure)

Priority 2: High-Priority Controls
  □ Vulnerability Management (A.8.8)
    - Weekly vulnerability scans (Amazon Inspector)
    - 30-day patching SLA
    - Automated patch management
    Effort: 40 hours
    Cost: \$3,000/year

  □ Incident Management (A.5.24, A.5.25, A.5.26)
    - Incident response procedure
    - PagerDuty alerting
    - Quarterly incident response drills
    Effort: 32 hours
    Cost: \$3,000/year (PagerDuty)

  □ Endpoint Security (A.8.1)
    - MDM (Jamf Pro)
    - Endpoint protection (CrowdStrike)
    - Full disk encryption (100%)
    Effort: 24 hours
    Cost: \$8,000/year

Training and Awareness:
  □ Security awareness training (A.6.3)
    - All employees complete training
    - Quarterly refresher training
    - Phishing simulation testing
    Platform: KnowBe4 or similar
    Cost: \$12,000/year

  □ Role-specific training
    - Developers: Secure coding training
    - IT/DevOps: Incident response training
    - Managers: ISMS awareness

Deliverables:
  ✓ All Priority 1 controls implemented and operating
  ✓ All Priority 2 controls implemented
  ✓ Staff training completion (100%)
  ✓ Evidence collection process established

Effort: 350 hours (multiple teams in parallel)
Cost: \$35,000 internal + \$64,000/year (tools and services)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MONTH 7-9: ISMS OPERATION & EVIDENCE COLLECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Objectives:
  - Operate ISMS for minimum 3 months (ISO requirement)
  - Collect evidence of control effectiveness
  - Conduct internal audit
  - Perform management review

ISO Requirement:
  The ISMS must be operating for a minimum period before certification.
  Most certification bodies require 3-6 months of operation, with
  evidence demonstrating controls are working effectively over time.

Month 7-9 Activities:

Ongoing Operations:
  □ Quarterly access review (complete by end of Month 7)
    - Review all user access
    - Remove unnecessary access
    - Document review results
    Evidence: Access review report, approval sign-off

  □ Monthly vulnerability scans
    - Run scans 1st of each month
    - Remediate critical/high findings within 30 days
    - Document exceptions and risk acceptance
    Evidence: Scan reports (Months 7, 8, 9)

  □ Security awareness training ongoing
    - Track completion rates (target: 100%)
    - Run monthly phishing simulations
    - Document results and remedial training
    Evidence: Training completion reports, phishing results

  □ Incident management
    - Log all security incidents (even minor)
    - Conduct post-incident reviews
    - Update incident response procedure as needed
    Evidence: Incident log, post-incident review reports

  □ Change management
    - Document all infrastructure changes
    - Obtain approvals before changes
    - Test changes in dev/staging first
    Evidence: Change tickets, approval records, Terraform logs

  □ Continuous monitoring
    - GuardDuty findings reviewed daily
    - CloudWatch alarms configured and tested
    - Security Hub compliance dashboard
    Evidence: Monitoring dashboards, alert response logs

Internal Audit (Month 8 - Critical for Stage 1):
  ISO requires at least one internal audit before certification.

  Scope: All ISMS processes and controls
  Method: ISO 19011 audit methodology
  Auditor: Independent (external consultant or trained internal)

  Audit Process:
    Week 1: Audit planning
      - Develop audit checklist (93 Annex A controls)
      - Schedule interviews
      - Request evidence from control owners

    Week 2-3: Audit execution
      - Interview control owners
      - Review evidence
      - Test control effectiveness (sample testing)
      - Identify findings (non-conformities, observations)

    Week 4: Audit reporting
      - Audit report with findings
      - Present to management
      - Create corrective action plan
      - Set remediation deadlines

  Expected Findings:
    - 0-5 minor non-conformities (acceptable)
    - 0 major non-conformities (must be fixed before certification)

  Deliverable: Internal audit report with findings and corrective actions

Management Review (Month 9 - Mandatory):
  ISO requires management to review the ISMS at planned intervals.

  Agenda:
    1. Status of actions from previous management reviews
    2. Changes in external/internal issues relevant to ISMS
    3. Feedback on information security performance:
       - Non-conformities and corrective actions
       - Monitoring and measurement results
       - Audit results (internal and external)
       - Fulfillment of information security objectives
    4. Feedback from interested parties
    5. Results of risk assessment and status of risk treatment plan
    6. Opportunities for continual improvement

  Attendees:
    - CEO (or designated management representative)
    - CISO (ISMS owner)
    - IT/Security leadership
    - Legal/Compliance
    - Internal auditor

  Output:
    - Management review meeting minutes
    - Decisions on continual improvement
    - Decisions on resource needs
    - Approval to proceed with certification audit

  Deliverable: Management review minutes (signed by CEO)

Evidence Collection Checklist:
  □ Policies and procedures (all current, approved)
  □ Risk assessment and treatment plan (current)
  □ Statement of Applicability (current)
  □ Access reviews (at least 1 completed)
  □ Vulnerability scans (at least 3 months)
  □ Security training records (100% completion)
  □ Incident log (all incidents, even if zero)
  □ Change records (sample of approved changes)
  □ Internal audit report (with corrective actions)
  □ Management review minutes
  □ System configuration exports (CloudTrail, AWS Config)
  □ Log samples (demonstrating 1-year retention)

Deliverables:
  ✓ 3+ months of ISMS operation
  ✓ Evidence collected for all applicable controls
  ✓ Internal audit completed (findings remediated)
  ✓ Management review completed
  ✓ Corrective actions from internal audit closed

Effort: 120 hours (ongoing operations + internal audit)
Cost: \$12,000 internal + \$10,000 (external internal auditor)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MONTH 10: STAGE 1 AUDIT (Documentation Review)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
  Stage 1 audit is a document review to verify that ISMS documentation is
  complete and meets ISO 27001 requirements. No on-site inspection of
  controls; focus is on readiness for Stage 2.

Duration: 1-2 days (remote or on-site)
Participants: CISO, ISMS team, control owners

Auditor Will Review:
  ✓ ISMS Scope Statement
  ✓ Information Security Policy
  ✓ Risk Assessment Methodology and Report
  ✓ Risk Treatment Plan
  ✓ Statement of Applicability
  ✓ Mandatory procedures (incident management, internal audit, management review)
  ✓ Supporting policies and procedures (40-50 documents)
  ✓ Internal audit report
  ✓ Management review minutes

Auditor Will Check:
  - Is documentation complete? (all required documents present)
  - Is documentation current? (approved within last 12 months)
  - Is documentation consistent? (no contradictions)
  - Is ISMS operating? (evidence of at least 3 months operation)
  - Is organization ready for Stage 2? (controls implemented)

Common Stage 1 Findings:
  ⚠ Policy not approved by management (missing signatures)
  ⚠ Risk assessment incomplete (not all assets identified)
  ⚠ SOA missing justifications (why controls not applicable)
  ⚠ Internal audit not completed
  ⚠ Management review not conducted
  ⚠ Insufficient evidence of ISMS operation (<3 months)

Preparation Checklist:
  □ All documents uploaded to secure file share
  □ Documents organized by ISO clause (easy navigation)
  □ Version control evident (version numbers, dates)
  □ Approvals documented (signatures or email approvals)
  □ Evidence index created (control → evidence mapping)
  □ Presentation prepared (ISMS overview for auditor)

Stage 1 Outcome:
  ✓ PASS: Minor findings, cleared for Stage 2 (typical)
  ⚠ CONDITIONAL PASS: Findings must be addressed before Stage 2
  ✗ FAIL: Major gaps, not ready for Stage 2 (rare if well-prepared)

Post-Stage 1 Actions:
  1. Review auditor findings
  2. Address all findings (2-4 weeks)
  3. Provide evidence of corrective actions
  4. Schedule Stage 2 audit (1-2 months after Stage 1)

Deliverable: Stage 1 audit report (from certification body)

Effort: 40 hours (preparation + audit participation)
Cost: Included in certification body fee (\$25k-\$40k total)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MONTH 11: STAGE 2 AUDIT (On-Site Assessment)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
  Stage 2 audit is a comprehensive on-site assessment to verify that controls
  are implemented and operating effectively. Auditor will interview staff,
  observe processes, and test controls.

Duration: 3-5 days (depends on organization size and complexity)
Location: On-site or remote (many done remotely post-COVID)
Team Size: 1-2 lead auditors + technical experts (if needed)

Audit Methodology:
  - Interviews with control owners (planned in advance)
  - Process observation (watch controls in action)
  - Document review (policies, procedures, evidence)
  - Technical testing (sample testing of controls)
  - System inspection (view configurations, logs, access controls)

Day-by-Day Schedule (Example):

  Day 1 - Opening Meeting & Management Systems
    - 9:00 AM: Opening meeting (audit plan, logistics)
    - 10:00 AM: Management interview (CISO, CEO)
    - 11:00 AM: ISMS documentation review (scope, policies)
    - 1:00 PM: Risk management (risk assessment, treatment plan)
    - 3:00 PM: Internal audit and management review
    - 5:00 PM: Day 1 wrap-up

  Day 2 - Organizational & People Controls
    - 9:00 AM: Information security roles (HR, Security team)
    - 10:30 AM: Security awareness training
    - 1:00 PM: Screening and termination procedures
    - 3:00 PM: Supplier management
    - 5:00 PM: Day 2 wrap-up

  Day 3 - Technological Controls (Part 1)
    - 9:00 AM: Access control (IAM, MFA)
    - 11:00 AM: Cryptography (encryption at rest/transit)
    - 1:00 PM: Configuration management (IaC, AWS Config)
    - 3:00 PM: Logging and monitoring
    - 5:00 PM: Day 3 wrap-up

  Day 4 - Technological Controls (Part 2)
    - 9:00 AM: Vulnerability management (patching, scanning)
    - 11:00 AM: Backup and recovery (DR testing)
    - 1:00 PM: Incident management (process, drills)
    - 3:00 PM: Change management (approval process)
    - 5:00 PM: Day 4 wrap-up

  Day 5 - Final Testing & Closing Meeting
    - 9:00 AM: Sample testing (access requests, changes, incidents)
    - 11:00 AM: Technical inspection (AWS console, CloudTrail)
    - 1:00 PM: Auditor deliberation (findings discussion)
    - 3:00 PM: Closing meeting (present findings)

Sample Testing Examples:
  - Select 10 access requests → verify approval before access granted
  - Select 5 terminations → verify access removed within 24 hours
  - Select 10 changes → verify change approval and testing
  - Review 3 incidents → verify followed incident response procedure
  - Inspect CloudTrail logs → verify 1-year retention
  - Check encryption status → verify all S3 buckets encrypted

Interview Questions (Examples):
  "How do you ensure that access is approved before being granted?"
  "What is the process for responding to a security incident?"
  "How often do you review user access rights?"
  "How do you ensure backups can be restored?"
  "What happens if a vulnerability is discovered?"

Findings Types:
  - Major Non-Conformity: Serious gap, control not implemented
    → Must be fixed before certification issued
  - Minor Non-Conformity: Control implemented but evidence of occasional lapse
    → Must be fixed within defined timeframe (typically 90 days)
  - Observation: Opportunity for improvement, not a failure
    → Optional to address

Typical Findings (Even in Well-Prepared Organizations):
  ⚠ Minor: One quarterly access review missed due to scheduling
  ⚠ Minor: Backup restoration not tested in Q4 (only tested Q1-Q3)
  ⚠ Observation: Consider implementing SIEM for enhanced monitoring

Stage 2 Outcome:
  ✓ RECOMMENDED FOR CERTIFICATION: Zero major findings, minors acceptable
  ⚠ CONDITIONAL: Major finding(s) must be remediated
  ✗ NOT RECOMMENDED: Multiple major findings (rare)

Post-Stage 2 Actions:
  1. Review Stage 2 audit report
  2. Address all findings (typically 30-90 days)
  3. Provide evidence of corrective actions to auditor
  4. Auditor reviews corrective actions
  5. Certification decision made

Deliverable: Stage 2 audit report with recommendation

Effort: 100 hours (preparation + audit participation + corrective actions)
Cost: Included in certification body fee

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MONTH 12: CERTIFICATION ISSUANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Actions:
  □ Close all findings from Stage 2 audit
  □ Submit evidence of corrective actions
  □ Auditor verifies corrective actions (desk review)
  □ Certification body makes certification decision
  □ Certificate issued!

Certificate Details:
  - Valid for: 3 years
  - Scope: [Your ISMS scope statement]
  - Standards: ISO/IEC 27001:2022
  - Certification body accreditation mark

Certificate Usage:
  ✓ Display on website
  ✓ Include in sales proposals
  ✓ Reference in contracts
  ✓ Marketing materials
  ✓ Customer questionnaires (RFPs)

Announcement:
  - Press release (optional)
  - LinkedIn announcement
  - Customer notification
  - Internal celebration!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ONGOING: SURVEILLANCE AUDITS (Years 2-3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ISO 27001 certification requires annual surveillance audits to maintain
certification for the 3-year certificate validity period.

Schedule:
  - Year 1: Certification audit (Stage 1 + Stage 2)
  - Year 2: Surveillance audit (1-2 days)
  - Year 3: Surveillance audit (1-2 days)
  - Year 4: Recertification audit (full audit, similar to initial)

Surveillance Audit Scope:
  - Review of management system changes
  - Sample testing of controls (not all controls)
  - Review of internal audit and management review
  - Investigation of complaints or incidents
  - Verification of previous findings corrected

Typical Duration: 1-2 days (less than Stage 2)
Cost: \$8,000 - \$15,000 per year

Annual ISMS Activities:
  □ Quarterly access reviews (4 per year)
  □ Monthly vulnerability scans (12 per year)
  □ Quarterly management reviews (4 per year)
  □ Annual internal audit (1 per year)
  □ Annual risk assessment review
  □ Annual policy review (all policies)
  □ Security awareness training (all employees)
  □ Incident response drills (at least 1 per year)
  □ DR testing (at least 1 per year)

Ongoing Effort: 200-300 hours/year
Ongoing Cost: \$20,000 - \$30,000/year (internal) + \$8,000-\$15,000 (surveillance)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL COST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Year 1 (Certification):
  Internal Effort:
    Gap analysis & planning:          \$12,000 (120 hours)
    Policy development:                \$20,000 (200 hours)
    Control implementation:            \$35,000 (350 hours)
    ISMS operation & evidence:         \$12,000 (120 hours)
    Internal audit:                    \$10,000 (external auditor)
    Stage 1 & 2 preparation:           \$14,000 (140 hours)
    Corrective actions:                 \$8,000 (80 hours)
    ──────────────────────────────────────────────
    Total Internal: \$111,000

  External Costs:
    Certification body fee:            \$32,000 (BSI, average)
    Consultant (optional):              \$8,000 (policy review, gap analysis)
    ──────────────────────────────────────────────
    Total External: \$40,000

  Technology Costs (Annual):
    Okta (MFA, SSO):                    \$7,000
    Endpoint protection:                \$7,100
    AWS Config:                         \$2,400
    Logging & monitoring:               \$6,000
    Encryption (KMS):                     \$120
    Backup & DR:                       \$12,000
    Vulnerability scanning:             \$2,400
    Security training:                 \$12,000
    Other tools:                        \$5,000
    ──────────────────────────────────────────────
    Total Technology: \$54,020

  Year 1 Total: \$205,020

Year 2-3 (Maintenance):
  Internal Effort:                    \$25,000/year (250 hours)
  Surveillance Audit:                 \$12,000/year
  Technology Costs:                   \$54,020/year
  ──────────────────────────────────────────────
  Annual Total: \$91,020/year

3-Year Total Cost of Ownership: \$387,060

ROI Justification:
  - Customer requirements (enables \$2M+ in contracts)
  - Competitive differentiation
  - Reduced security risk
  - Operational efficiency (mature processes)
  - Compliance with regulations (GDPR, etc.)
```

## Related Commands

- `/iso:assess` - Initial gap analysis
- `/iso:soa-generator` - Generate Statement of Applicability
- `/iso:risk-treatment-plan` - Create risk treatment plan
- `/iso:annex-a-deep-dive` - Deep dive on controls
- `/iso:isms-documentation-pack` - Generate ISMS documents
- `/engineer:generate-implementation` - Generate IaC for controls
