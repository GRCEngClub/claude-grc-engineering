---
description: Generate complete ISO 27001 ISMS documentation pack including mandatory and supporting documents
---

# ISO 27001 ISMS Documentation Pack Generator

Generates the complete set of ISO 27001:2022 Information Security Management System (ISMS) documentation, including all mandatory documents required by the standard and comprehensive supporting policies and procedures.

## Usage

```bash
/iso:isms-documentation-pack [package-type] [options]
```

## Arguments

- `$1` - Package type (optional): "mandatory-only", "full", "policies-only" (default: "full")
- `$2` - Options (optional): `--format=docx|markdown|pdf`, `--organization=name`, `--scope="cloud infrastructure"`

## Examples

```bash
# Generate full ISMS documentation pack
/iso:isms-documentation-pack full

# Mandatory documents only (6 core documents)
/iso:isms-documentation-pack mandatory-only

# Export as Word documents
/iso:isms-documentation-pack full --format=docx

# Customize for organization
/iso:isms-documentation-pack full --organization="Acme Corp" --scope="AWS cloud platform"
```

## Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ISO 27001:2022 ISMS DOCUMENTATION PACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Organization: Your Company, Inc.
Generation Date: 2025-01-28
ISO Version: ISO/IEC 27001:2022
Package Type: Full (mandatory + supporting)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PACKAGE CONTENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mandatory Documents (6): Required by ISO 27001 standard
Supporting Policies (15): Core security policies
Supporting Procedures (25): Operational procedures
Total Documents: 46

Output Directory: ./isms-documentation/
Format: Markdown (convertible to Word/PDF)
Customization: Templates with [PLACEHOLDERS] to fill in

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1: MANDATORY ISMS DOCUMENTS (ISO Required)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These 6 documents are explicitly required by ISO 27001:2022.

1. ISMS Scope Statement (Clause 4.3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File: 01-ISMS-Scope-Statement.md
Purpose: Define the boundaries and applicability of the ISMS
Required By: Clause 4.3 - Determining the scope of the ISMS

Content:
```markdown
# ISO 27001:2022 ISMS Scope Statement

Organization: [Your Company, Inc.]
Version: 1.0
Date: [2025-01-28]
Approved By: [CEO Name], Chief Executive Officer

## 1. Scope Definition

The Information Security Management System (ISMS) of [Your Company] covers:

### 1.1 Organizational Boundaries
- [Your Company, Inc.] (legal entity)
- Locations:
  - Corporate Headquarters: [123 Main St, City, State, ZIP]
  - AWS Cloud Infrastructure: us-east-1, us-west-2 regions
  - Remote workforce (142 employees across [states/countries])

### 1.2 Systems and Processes In Scope

Information Systems:
- Production infrastructure (AWS)
  - Application servers (ECS, EC2)
  - Databases (RDS PostgreSQL)
  - Object storage (S3)
  - Networking (VPC, CloudFront, Route 53)
- Identity and access management (Okta, AWS IAM)
- Development infrastructure (GitHub, CI/CD)
- Monitoring and logging (CloudWatch, GuardDuty)
- Business applications (Jira, Slack, Office 365)

Business Processes:
- Software development (SDLC)
- Cloud infrastructure operations
- Customer onboarding and support
- Incident response
- Change management
- Vendor management

Data Types:
- Customer data (PII, business data)
- Application source code
- System configuration data
- Security logs and monitoring data

### 1.3 Out of Scope (Exclusions)

The following are explicitly excluded from the ISMS scope:

- Marketing website (hosted separately by [vendor name])
- Mobile application infrastructure (separate ISMS/audit)
- Corporate office IT infrastructure (no customer data processing)
- [Company] subsidiary operations (separate legal entity)

Justification for Exclusions:
- Marketing website: Separate infrastructure, no customer data, managed by external vendor
- Mobile app: Covered under separate security assessment
- Office IT: No processing of customer data, no sensitive systems

### 1.4 Services Provided to Customers

Within the scope of this ISMS:
- [Product Name] SaaS Application
- Cloud-based data processing and storage
- Application programming interfaces (APIs)
- 24/7 customer support (email, chat)

### 1.5 Geographic Coverage
- Primary data centers: AWS us-east-1 (Virginia), us-west-2 (Oregon)
- Service availability: Global (all countries except [embargoed countries])
- Data residency: United States only

### 1.6 Interested Parties

Internal:
- Employees (142 FTE)
- Contractors (5-10 on average)
- Board of Directors
- Shareholders

External:
- Customers (10,000+ active users)
- Regulatory authorities (FTC, state data protection authorities)
- Cloud service providers (AWS, Okta, GitHub)
- Certification body ([BSI, NQA, etc.])

## 2. External and Internal Issues

External Issues:
- Increasing cyber threats (ransomware, data breaches)
- Regulatory requirements (GDPR, CCPA, state privacy laws)
- Customer security expectations (ISO 27001, SOC 2)
- Cloud provider security (shared responsibility model)

Internal Issues:
- Remote workforce security (BYOD, home networks)
- Rapid growth (scaling security controls)
- Limited security staffing (3 FTE security team)
- Cloud-native architecture (traditional controls don't apply)

## 3. Information Security Requirements

Legal/Regulatory:
- GDPR (EU customers)
- CCPA (California customers)
- GLBA (if applicable)
- Contract obligations (customer DPAs)

Business:
- Protect customer data confidentiality, integrity, availability
- Maintain service availability (99.9% SLA)
- Respond to security incidents within defined timeframes
- Demonstrate compliance to customers

## 4. Scope Review

Review Frequency: Annually or upon significant changes
Next Review: [Date 1 year from approval]
Review Triggers:
- New services or products launched
- Significant infrastructure changes
- Regulatory changes
- Major organizational changes (M&A, restructuring)

## Approval

This ISMS scope statement has been reviewed and approved by:

Name: [CEO Name]
Title: Chief Executive Officer
Date: [Approval Date]
Signature: _________________________

Name: [CISO Name]
Title: Chief Information Security Officer
Date: [Approval Date]
Signature: _________________________
```

Customization Notes:

- Fill in [PLACEHOLDERS] with your organization details
- Adjust services, systems, and data types to match your environment
- Ensure exclusions are justified
- Update interested parties list

2. Information Security Policy (Clause 5.2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File: 02-Information-Security-Policy.md
Purpose: Top-level security policy demonstrating management commitment
Required By: Clause 5.2 - Policy

Content:

```markdown
# Information Security Policy

Organization: [Your Company, Inc.]
Version: 2.1
Effective Date: [2025-01-01]
Review Date: [2026-01-01]
Owner: CISO
Approved By: CEO

## 1. Purpose

This Information Security Policy establishes the framework for protecting
information assets of [Your Company] and demonstrates management's commitment
to information security.

## 2. Scope

This policy applies to:
- All employees, contractors, and third parties with access to [Company] systems
- All information systems within the ISMS scope
- All customer data and company confidential information

## 3. Management Commitment

[Your Company]'s executive management is committed to:
- Protecting the confidentiality, integrity, and availability of information
- Meeting customer, legal, and regulatory requirements
- Continual improvement of the ISMS
- Providing adequate resources for information security
- Holding individuals accountable for security responsibilities

## 4. Information Security Objectives

Our information security objectives are to:

a) Protect customer data from unauthorized access, disclosure, or loss
b) Maintain service availability of 99.9% or higher
c) Detect and respond to security incidents within 1 hour (critical)
d) Comply with all applicable laws and regulations (GDPR, CCPA, etc.)
e) Achieve and maintain ISO 27001 certification
f) Conduct annual security risk assessments
g) Train 100% of employees on security awareness annually

## 5. Information Security Framework

### 5.1 Information Security Management System (ISMS)

[Company] has established an ISMS based on ISO 27001:2022 to:
- Systematically manage information security risks
- Implement appropriate security controls
- Monitor and improve security performance

### 5.2 Roles and Responsibilities

Executive Management:
- Overall accountability for ISMS
- Approve security policies and significant security decisions
- Provide resources for ISMS implementation and maintenance

CISO (Chief Information Security Officer):
- Lead the ISMS program
- Manage security risk
- Report security performance to executive management
- Coordinate security incident response

All Employees:
- Follow security policies and procedures
- Protect information assets
- Report security incidents and concerns
- Complete mandatory security training

### 5.3 Risk Management

[Company] manages information security risks by:
- Conducting annual risk assessments (ISO 27005)
- Implementing controls to reduce risks to acceptable levels
- Monitoring control effectiveness
- Accepting residual risks with management approval

Risk Appetite: MEDIUM
- Critical risks: Must be mitigated (not accepted)
- High risks: Must be mitigated or transferred (insurance)
- Medium risks: May be accepted with CISO approval
- Low risks: May be accepted

## 6. Security Controls

[Company] implements security controls across:
- Access control (least privilege, MFA)
- Cryptography (encryption at rest and in transit)
- Physical security (inherited from cloud providers)
- Operations security (change management, patching)
- Communications security (network segmentation, firewalls)
- System development (secure coding, testing)
- Supplier relationships (vendor risk assessments)
- Incident management (detection, response, recovery)
- Business continuity (DR, backups)

Detailed controls are documented in the Statement of Applicability.

## 7. Compliance

[Company] is committed to compliance with:
- ISO 27001:2022 requirements
- Legal and regulatory requirements (GDPR, CCPA, etc.)
- Contractual obligations (customer DPAs, SLAs)
- Industry best practices (OWASP, CIS, NIST)

## 8. Continual Improvement

[Company] continually improves the ISMS through:
- Quarterly management reviews
- Annual internal audits
- Annual external audits (surveillance or recertification)
- Lessons learned from incidents
- Security metrics and trending

## 9. Non-Compliance

Violations of this policy may result in:
- Verbal or written warning
- Suspension of access to systems
- Termination of employment or contract
- Legal action (if criminal activity)

## 10. Policy Review

This policy is reviewed annually and updated as needed to reflect:
- Changes in business requirements
- Changes in the threat landscape
- Lessons learned from incidents
- Audit findings or regulatory changes

## 11. Related Documents

- ISMS Scope Statement
- Risk Assessment Methodology
- Statement of Applicability
- All supporting security policies and procedures

## Approval

This policy has been reviewed and approved by:

Name: [CEO Name]
Title: Chief Executive Officer
Date: [Approval Date]
Signature: _________________________
```

3. Risk Assessment Methodology (Clause 6.1.2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File: 03-Risk-Assessment-Methodology.md
Purpose: Document how information security risks are assessed
Required By: Clause 6.1.2c - Risk assessment process

[Content template included - defines risk identification, analysis, evaluation methods, risk matrix 5x5, risk acceptance criteria, assessment frequency]

4. Statement of Applicability (Clause 6.1.3d)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File: 04-Statement-of-Applicability.md
Purpose: Document all Annex A control decisions
Required By: Clause 6.1.3d
Note: Generate using /iso:soa-generator for complete, customized SOA

5. Risk Treatment Plan (Clause 6.1.3e, 6.2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File: 05-Risk-Treatment-Plan.md
Purpose: Document how identified risks will be treated
Required By: Clause 6.1.3e, Clause 6.2
Note: Generate using /iso:risk-treatment-plan for comprehensive plan

6. Risk Assessment Report (Clause 8.2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File: 06-Risk-Assessment-Report.md
Purpose: Document results of risk assessment
Required By: Clause 8.2
Note: Generated annually as output of risk assessment process

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2: SUPPORTING POLICIES (15 policies)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. Access Control Policy (Supports A.5.15-5.18, A.8.2-8.6)
8. Acceptable Use Policy (Supports A.5.10)
9. Asset Management Policy (Supports A.5.9, A.5.11)
10. Cryptography Policy (Supports A.8.24)
11. Change Management Policy (Supports A.8.32)
12. Data Classification Policy (Supports A.5.12)
13. Incident Response Policy (Supports A.5.24-5.27)
14. Business Continuity Policy (Supports A.5.29-5.30)
15. Network Security Policy (Supports A.8.20-8.23)
16. Physical Security Policy (Supports A.7.1-7.14, if applicable)
17. Remote Access Policy (Supports A.6.7)
18. Secure Development Policy (Supports A.8.25-8.31)
19. Vendor Risk Management Policy (Supports A.5.19-5.23)
20. Password Policy (Supports A.8.5)
21. Data Retention and Disposal Policy (Supports A.8.10)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3: SUPPORTING PROCEDURES (25 procedures)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

22. User Provisioning Procedure
23. User Deprovisioning Procedure
24. Access Review Procedure
25. Privileged Access Management Procedure
26. Backup and Recovery Procedure
27. Disaster Recovery Procedure
28. Incident Response Procedure/Runbook
29. Vulnerability Management Procedure
30. Patch Management Procedure
31. Configuration Management Procedure
32. Change Management Procedure
33. Vendor Security Assessment Procedure
34. Internal Audit Procedure
35. Management Review Procedure
36. Security Awareness Training Procedure
37. Secure Code Review Procedure
38. Security Testing Procedure
39. Log Management Procedure
40. Monitoring and Alerting Procedure
41. Cryptographic Key Management Procedure
42. Data Masking Procedure
43. Capacity Management Procedure
44. Media Handling Procedure
45. Equipment Disposal Procedure
46. Business Continuity Testing Procedure

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCUMENT MANAGEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All documents include:
  ✓ Document ID and version number
  ✓ Effective date and review date
  ✓ Document owner
  ✓ Approval signature block
  ✓ Revision history table

Document Control System:

- Version control: Git repository
- Approval workflow: Pull request + management sign-off
- Distribution: Confluence/SharePoint (all employees)
- Review frequency: Annually (or upon significant changes)

File Naming Convention:
  [ID]-[Document-Name]-v[Version].md
  Example: 01-ISMS-Scope-Statement-v1.0.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CUSTOMIZATION GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Global Find and Replace
  Search: [Your Company]
  Replace: Acme Corporation

  Search: [CISO Name]
  Replace: Jane Doe

  Search: [CEO Name]
  Replace: John Smith

Step 2: Update Organization-Specific Details

- ISMS scope (systems, locations, services)
- Organizational structure (roles, reporting)
- Risk appetite and tolerance levels
- Specific technologies and tools used
- Compliance requirements (industry-specific)

Step 3: Technical Implementation Details

- Cloud providers (AWS, Azure, GCP)
- Identity provider (Okta, Entra ID)
- Monitoring tools (CloudWatch, Datadog, Splunk)
- Endpoint protection (CrowdStrike, Carbon Black)
- Backup solutions and retention periods

Step 4: Review and Approval

- Legal review (data protection, contracts)
- Technical review (architecture, controls)
- Management review (objectives, resources)
- Approval signatures

Step 5: Distribution and Training

- Publish to document management system
- Notify all employees
- Conduct training on key policies
- Track acknowledgment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETION CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mandatory Documents:
  □ ISMS Scope Statement (customized and approved)
  □ Information Security Policy (customized and approved)
  □ Risk Assessment Methodology (customized)
  □ Statement of Applicability (generated via /iso:soa-generator)
  □ Risk Treatment Plan (generated via /iso:risk-treatment-plan)
  □ Risk Assessment Report (conducted and documented)

Supporting Policies (Minimum Required):
  □ Access Control Policy
  □ Acceptable Use Policy
  □ Incident Response Policy
  □ Business Continuity Policy
  □ Vendor Risk Management Policy

Supporting Procedures (Minimum Required):
  □ Internal Audit Procedure
  □ Management Review Procedure
  □ Incident Response Procedure
  □ Change Management Procedure
  □ Access Review Procedure

Document Management:
  □ Version control system established
  □ Approval workflow defined
  □ Distribution mechanism in place
  □ Annual review schedule set
  □ Document ownership assigned

Audit Readiness:
  □ All documents current (<12 months old)
  □ All documents approved (signatures/emails)
  □ No contradictions between documents
  □ Evidence of document distribution
  □ Employees trained on applicable policies

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Customize all templates with your organization details
2. Review with legal, technical, and management stakeholders
3. Obtain management approval (signatures)
4. Publish to document management system
5. Conduct training for employees
6. Begin ISMS operation (collect evidence)
7. Schedule internal audit (after 3+ months operation)
8. Schedule Stage 1 audit with certification body

```

## Additional Documentation Templates

The full package includes detailed templates for all 46 documents. Access via:

```bash
# Generate individual policy template
/iso:isms-documentation-pack policies-only --policy="Access Control Policy"

# Generate all procedures
/iso:isms-documentation-pack procedures-only

# Export to Word format for easy editing
/iso:isms-documentation-pack full --format=docx
```

## Related Commands

- `/iso:soa-generator` - Generate Statement of Applicability
- `/iso:risk-treatment-plan` - Create risk treatment plan
- `/iso:annex-a-deep-dive` - Control implementation guidance
- `/iso:certification-roadmap` - Certification process timeline
- `/iso:assess` - Gap analysis
