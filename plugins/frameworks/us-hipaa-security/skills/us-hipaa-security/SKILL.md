---
name: us-hipaa-security
description: HIPAA Security Rule expert for US healthcare compliance. Deep knowledge of 45 CFR Part 164 Subpart C, Administrative/Physical/Technical Safeguards, Required vs Addressable specifications, Risk Analysis, Business Associate Agreements, and HHS OCR enforcement.
allowed-tools: Read, Glob, Grep, Write
---

# HIPAA Security Rule Expert

Deep expertise in the Health Insurance Portability and Accountability Act (HIPAA) Security Rule - the U.S. federal regulation governing the protection of electronic Protected Health Information (ePHI).

## Expertise Areas

### HIPAA Security Rule Overview

**Regulatory Citation**: 45 CFR Part 164, Subpart C (Security Standards for the Protection of Electronic Protected Health Information)
**Effective Date**: April 21, 2003 (Compliance Date: April 20, 2005)
**Enforcement**: U.S. Department of Health and Human Services (HHS) - Office for Civil Rights (OCR)
**Guidance Document**: NIST SP 800-66 Rev. 2 (An Introductory Resource Guide for Implementing the HIPAA Security Rule)

**Scope**:

- Applies to **electronic** PHI (ePHI) only - not paper records or oral communications
- **Covered Entities (CEs)**: Healthcare providers, health plans, healthcare clearinghouses that transmit ePHI
- **Business Associates (BAs)**: Vendors/contractors who create, receive, maintain, or transmit ePHI on behalf of CEs (e.g., cloud providers, EHR vendors, billing companies, data analytics firms)
- **Subcontractors**: BAs must have contracts with their own subcontractors

**What is ePHI?**

- Individually identifiable health information in electronic form
- Includes any demographic information collected from an individual that:
  - Relates to physical/mental health condition
  - Relates to provision of healthcare
  - Relates to payment for healthcare
- 18 HIPAA identifiers (names, dates, medical record numbers, etc.) + health information

### Enforcement and Penalties

**OCR Enforcement Triggers**:

1. **Breach Reports**: Unsecured ePHI affecting 500+ individuals (must report to OCR within 60 days)
2. **Complaints**: Patients/employees filing complaints with OCR
3. **Desk Audits**: OCR requests documentation remotely
4. **On-Site Audits**: Comprehensive compliance reviews
5. **Media Reports**: News of breaches or violations

**Penalty Tiers (per violation category per year)**:

- **Tier 1**: Lack of knowledge (reasonable diligence would not have known) - Minimum $100 per violation, max $25,000
- **Tier 2**: Reasonable cause (not willful neglect) - Minimum $1,000 per violation, max $100,000
- **Tier 3**: Willful neglect corrected within 30 days - Minimum $10,000 per violation, max $250,000
- **Tier 4**: Willful neglect not corrected - Minimum $50,000 per violation, max $1.9 million

**Note**: "Per violation category" means penalties are capped annually, not per individual breach event.

### The Five Safeguard Categories

#### 1. Administrative Safeguards (45 CFR §164.308)

**What It Governs**: Administrative actions, policies, and procedures to manage the selection, development, implementation, and maintenance of security measures.

**Key Standards/Implementation Specifications**:

- **Security Management Process** (§164.308(a)(1)): Risk analysis, risk management, sanction policy, information system activity review
- **Assigned Security Responsibility** (§164.308(a)(2)): Designated security official with authority and responsibility
- **Workforce Security** (§164.308(a)(3)): Clearance procedures, termination procedures
- **Information Access Management** (§164.308(a)(4)): Access authorization, access establishment/modification, access termination/suspension
- **Security Awareness and Training** (§164.308(a)(5)): Reminders, protection from malicious software, login monitoring, password management
- **Security Incident Procedures** (§164.308(a)(6)): Response and reporting, documented incident responses
- **Contingency Plan** (§164.308(a)(7)): Data backup, disaster recovery, emergency mode operation, testing and revision
- **Evaluation** (§164.308(a)(8)): Periodic technical and non-technical evaluation
- **Business Associate Contracts and Other Arrangements** (§164.308(b)(1)): Written contracts or other arrangements with BAs

**Typical Evidence**: Security policies, risk analysis documentation, training records, incident response logs, disaster recovery plans, BAAs

#### 2. Physical Safeguards (45 CFR §164.310)

**What It Governs**: Physical measures to protect electronic information systems and related buildings and equipment from natural and environmental hazards, and unauthorized intrusion.

**Key Standards/Implementation Specifications**:

- **Facility Access Controls** (§164.310(a)(1)): Contingency operations, facility security plan, access control and validation, maintenance records
- **Workstation Use** (§164.310(b)): Policies specifying proper workstation use for ePHI
- **Workstation Security** (§164.310(c)): Physical safeguards for workstations that access ePHI
- **Device and Media Controls** (§164.310(d)(1)): Disposal, media re-use, accountability, data backup and storage

**Typical Evidence**: Facility access logs, visitor logs, workstation security policies, media disposal records, backup storage documentation

#### 3. Technical Safeguards (45 CFR §164.312)

**What It Governs**: Technology and related policies/procedures that protect ePHI and control access to it.

**Key Standards/Implementation Specifications**:

- **Access Control** (§164.312(a)(1)): Unique user identification, emergency access procedure, automatic logoff, encryption and decryption
- **Audit Controls** (§164.312(b)): Hardware/software/ procedural mechanisms that record and examine activity in information systems
- **Integrity** (§164.312(c)(1)): Mechanisms to protect ePHI from improper alteration or destruction
- **Person or Entity Authentication** (§164.312(d)): Verify identity of person/entity seeking access to ePHI
- **Transmission Security** (§164.312(e)(1)): Encryption of ePHI whenever appropriate over electronic networks

**Typical Evidence**: Access control logs, audit logs/reports, encryption configuration evidence, authentication documentation

#### 4. Organizational Requirements (45 CFR §164.314)

**What It Governs**: Business Associate Agreements and group health plan requirements.

**Key Standards/Implementation Specifications**:

- **Business Associate Agreements** (§164.314(a)(1)): Written contract between CE and BA specifying permitted/required uses, safeguards, reporting, and BA obligations to subcontractors
- **Business Associate Agreements - Group Health Plans** (§164.314(b)(1)): Plan documents must provide that the plan sponsor will adequately safeguard ePHI

**Typical Evidence**: Executed BAAs, BAA templates, subcontractor agreements

#### 5. Policies, Procedures, and Documentation (45 CFR §164.316)

**What It Governs**: Reasonable and appropriate policies, procedures, and documentation to comply with the Security Rule.

**Key Standards/Implementation Specifications**:

- **Policies and Procedures** (§164.316(a)(1)): Comply with standards, implementation specifications, and other requirements
- **Documentation** (§164.316(b)(1)-(2)): Maintain policies and procedures for 6 years from date of creation or last effective date, whichever is later

**Typical Evidence**: Written security policies, policy review/approval records, documentation retention evidence

### Required vs. Addressable Implementation Specifications

**Understanding the Distinction**:

HIPAA Security Rule implementation specifications are categorized as either **Required** or **Addressable**. This distinction is critical for compliance.

**Required Specifications**:

- Must be implemented exactly as stated in the regulation
- No alternative options available
- Non-compliance is a direct violation

**Addressable Specifications**:

- Must implement **UNLESS**:
  1. The specification is not reasonable and appropriate for your organization, AND
  2. You document why it is not reasonable and appropriate, AND
  3. You implement an equivalent alternative measure, OR
  4. Document why nothing is appropriate and implement nothing

**Important**: "Addressable" does NOT mean "optional." It means you must assess whether it applies and justify your decision.

**Examples of Addressable Specifications**:

1. **Encryption/Decryption of ePHI at Rest** (§164.312(a)(2)(iv))
   - Why addressable: Legacy systems may not support encryption
   - Alternative: Compensating controls like strong access controls, physical security, or network segmentation
   - Documentation must explain why encryption is not reasonable/appropriate

2. **Automatic Logoff** (§164.312(a)(2)(iii))
   - Why addressable: May interfere with clinical workflows
   - Alternative: Manual session timeout policies, physical workstation controls
   - Documentation must explain why automatic logoff disrupts operations

3. **Encryption in Transmission** (§164.312(e)(2)(ii))
   - Why addressable: Some legacy healthcare systems don't support TLS
   - Alternative: VPN tunnels, dedicated circuits, or network segmentation
   - Documentation must explain why transmission encryption is not feasible

4. **Workstation Security** (§164.310(c))
   - Why addressable: Some clinical areas require mobile workstations
   - Alternative: Privacy screens, workstation positioning policies, cable locks
   - Documentation must explain environmental constraints

5. **Media Disposal** (§164.310(d)(2)(i))
   - Why addressable: Some media cannot be destroyed (e.g., records on legal hold)
   - Alternative: Purging/sanitization (NIST SP 800-88 guidelines), secure storage
   - Documentation must explain why destruction is not appropriate

6. **Password Management** (§164.308(a)(5)(ii)(D))
   - Why addressable: Some organizations use alternative authentication
   - Alternative: Biometrics, smart cards, certificates, or other multi-factor methods
   - Documentation must explain why passwords are not used

**Best Practice for Addressable Specs**:

- Conduct an organization-wide assessment
- For each addressable spec, document:
  - Whether you implement it as-is
  - If not, why it is not reasonable/appropriate (cost, technical feasibility, operational impact)
  - What alternative you implemented instead
  - How the alternative provides equivalent protection
- Review annually as technology and operations evolve

### Risk Analysis (§164.308(a)(1)(ii)(A)) - The Linchpin

**Why It's Critical**:

The risk analysis is the foundation of every HIPAA Security Rule compliance program. It is the most frequently cited requirement in OCR Resolution Agreements and enforcement actions.

**What a Defensible Risk Analysis Includes**:

1. **ePHI Scope and Data Flow Inventory**:
   - Map all systems that create, receive, maintain, or transmit ePHI
   - Document data flows between systems
   - Identify all external connections (internet-facing systems, VPNs, BAs)
   - Catalog storage locations (databases, file servers, cloud storage, mobile devices)

2. **Threat and Vulnerability Identification**:
   - External threats (hackers, malware, ransomware)
   - Internal threats (insider misuse, accidental disclosure)
   - Environmental threats (natural disasters, power outages)
   - System vulnerabilities (unpatched software, weak configurations)

3. **Likelihood and Impact Assessment**:
   - Rate likelihood of each threat materializing (high/medium/low)
   - Assess potential impact (e.g., number of patients affected, clinical disruption, financial harm)
   - Combine to determine risk level (critical/high/medium/low)

4. **Current Control Evaluation**:
   - Document existing safeguards for each identified risk
   - Assess whether controls are adequate or need improvement
   - Identify gaps where controls are missing or insufficient

5. **Risk Level Determination**:
   - Assign final risk ratings based on likelihood × impact × existing controls
   - Prioritize risks for remediation

6. **Risk Management/Mitigation Plan**:
   - Document remediation actions for high/critical risks
   - Assign timelines, owners, and resources
   - Implement mitigation measures
   - Reassess residual risk after mitigation

**Common OCR Findings**:

- **"Failure to conduct an adequate risk analysis"** - Most common enforcement finding
- Risk analysis limited to certain systems or locations (not "organization-wide")
- Risk analysis not updated after significant changes (new systems, mergers, breaches)
- Risk analysis not documented or lacks specificity
- Risk analysis does not address all threats to ePHI

**Best Practices**:

- Use NIST SP 800-30 (Risk Assessment) as a methodology guide
- Update annually or after significant changes
- Maintain documentation for 6 years
- Obtain senior management sign-off
- Use risk analysis results to inform security policies and budget

### Business Associate Agreements (BAAs)

**When a BAA is Required**:

A BAA is required when a **Covered Entity** or **Business Associate**:
- Creates, receives, maintains, or transmits ePHI **on behalf of** another CE or BA
- Provides services that involve access to ePHI

**Common Examples Requiring BAAs**:

- Cloud service providers (AWS, Azure, GCP, Salesforce, etc.)
- EHR/EMR software vendors (Epic, Cerner, etc.)
- Medical billing/claims clearinghouses
- Data analytics firms
- IT managed service providers
- Shredding/document disposal companies
- Email/calendar/office productivity services (Microsoft 365, Google Workspace)
- Fax/telecommunications services
- Transcription/medical scribe services
- Health information exchanges

**What a BAA Must Obligate the BA to Do** (§164.314(a)(2)(i)):

1. **Implement Appropriate Safeguards**: Ensure ePHI is protected per Security Rule requirements
2. **Report Breaches**: Notify CE of any security incident or breach (within 60 days for 500+ individuals)
3. **Report Security Violations**: Inform CE of any Security Rule violations by subcontractors
4. **Authorize CE Access**: Allow CE or OCR to access BAA and related records
5. **Ensure Subcontractor Compliance**: Require subcontractors to agree to same restrictions (via BAAs)

**Common BAA Failure Modes**:

1. **Missing BAAs**: Cloud services or SaaS vendors used without signed BAAs
2. **Incomplete BAAs**: BAA lacks required provisions or is outdated
3. **Subcontractor Chains**: BA's subcontractors don't have their own BAAs
4. **Oral Agreements**: BAAs must be in writing
5. **Vendor-Provided Templates**: Using vendor templates that don't meet HIPAA requirements

**BAA vs. Other Agreements**:

- **Data Use Agreement (DUA)**: Often separate from BAA, covers specific research uses
- **Non-Disclosure Agreement (NDA)**: Not sufficient - does not cover HIPAA Security Rule requirements
- **Service Level Agreement (SLA)**: Covers uptime/performance, not ePHI protection

### SCF Crosswalk Context

**Framework Mapping**: This HIPAA Security Rule plugin maps to SCF ID `US-HIPAA-Security`.

The `/grc-engineer:gap-assessment` command supports this framework via SCF crosswalk.

**Key SCF Domain Overlaps**:

- **PRI (Data Privacy)**: ePHI handling, minimum necessary, disclosure prohibitions
- **IAC (Identity and Access Control)**: Unique user IDs, access authorization, least privilege
- **IRO (Incident Response Operations)**: Security incident procedures, breach notification
- **CPL (Contingency Planning)**: Data backup, disaster recovery, emergency mode operation
- **RSK (Risk Management)**: Risk analysis, risk management, evaluation
- **CFG (Configuration Management)**: System configuration, change management, security settings
- **PES (Physical Environment Security)**: Facility access controls, workstation security, media controls

**When Using /grc-engineer:gap-assessment**:

```text
/grc-engineer:gap-assessment HIPAA
```

This will map HIPAA Security Rule requirements to SCF controls and generate findings grouped by safeguard category.

### Assessment Approach Guidance

When performing a HIPAA Security Rule assessment:

**a. Confirm Entity Type**:

- **Covered Entity**: Healthcare provider, health plan, or healthcare clearinghouse
- **Business Associate**: Vendor that handles ePHI on behalf of a CE
- **Hybrid Organization**: Single legal entity that is both a CE and a BA (must designate which components are which)
- **Associate Subcontractor**: BA's subcontractor handling ePHI

**b. Confirm ePHI Systems in Scope**:

- **Clinical Systems**: EHR/EMR, electronic prescribing, telehealth platforms
- **Administrative Systems**: Claims processing, billing, revenue cycle management
- **Patient-Facing Systems**: Patient portals, mobile health apps, remote monitoring devices
- **Data Platforms**: Data warehouses, health information exchanges, analytics platforms
- **Infrastructure**: Cloud storage (S3, Azure Blob, GCS), databases, file servers
- **Endpoints**: Workstations, laptops, mobile devices, tablets
- **Communication**: Email systems, fax servers, secure messaging platforms

**c. Ask for Recent Risk Analysis**:

- Date of last organization-wide risk analysis
- Whether it covers all ePHI systems and locations
- Whether it's been updated since major changes (new systems, mergers, breaches)
- Whether senior management has approved it
- Whether high/critical risks have been addressed

**d. Identify Breach History or OCR Investigations**:

- Any past ePHI breaches (investigation findings, remediation completed)
- Any OCR complaints or investigations (findings, corrective action plans)
- Any state attorney general actions
- Lessons learned and improvements implemented

**e. Surface Addressable Specification Implementation Status**:

- For each addressable spec, check:
  - Is it implemented as-is?
  - If not, is there documented rationale explaining why it's not reasonable/appropriate?
  - Is there an equivalent alternative measure?
  - Is the documentation up-to-date and signed off?

**Common Addressable Spec Gaps**:

- Encryption at rest not enabled for databases or cloud storage
- Automatic logoff not configured for workstations
- Encryption in transit not enforced for all external connections
- Media disposal procedures not documented or followed
- Password management not formalized (written policy)

**f. Flag Missing Business Associate Agreements**:

- Cloud providers (AWS, Azure, GCP) - check for BAA addendum
- SaaS applications (Office 365, Google Workspace, Salesforce, etc.)
- EHR/EMR vendors
- IT service providers (MSPs, managed security, help desk)
- Billing/clearinghouse services
- Data analytics/analytics vendors
- Email/fax/telecommunication services
- Shredding/disposal vendors
- Health information exchanges
- Mobile app/telehealth platforms

**Note**: Even vendors that claim HIPAA compliance often require you to execute their BAA separately - check each vendor's process.

## Capabilities

- HIPAA Security Rule gap assessments and analysis
- Risk analysis evaluation (§164.308(a)(1)(ii)(A))
- Required vs. addressable specification assessment
- Administrative, Physical, and Technical Safeguard evaluation
- Business Associate Agreement readiness review
- ePHI system scope identification
- Security incident and breach response evaluation
- Contingency plan review (backup/disaster recovery)
- Security awareness and training assessment
- Access control and authentication evaluation
- Encryption at rest and in transit review
- Audit control implementation validation
- Physical security measures assessment
- Policy and procedure documentation review
- OCR enforcement and penalty guidance
- HHS OCR audit preparation
- NIST SP 800-66 implementation guidance
- SCF crosswalk mapping (US-HIPAA-Security)
- Multi-framework compliance analysis (HIPAA + PCI-DSS, NIST, etc.)
