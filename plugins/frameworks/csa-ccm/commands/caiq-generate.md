---
description: Generate CAIQ (Consensus Assessments Initiative Questionnaire) responses
---

# CSA CAIQ Generator

Generates responses for the Cloud Security Alliance Consensus Assessments Initiative Questionnaire (CAIQ), a standardized self-assessment tool for cloud service providers.

## Arguments

- `$1` - CAIQ version (required: v4.0, lite)
- `$2` - Output format (optional: markdown, json, excel, csv)
- `$3` - Response mode (optional: full, draft, template)

## CAIQ Overview

**Purpose**: Standardized cloud security questionnaire
**Audience**: Cloud service providers, customers conducting vendor due diligence
**Structure**: 197 yes/no questions aligned to CCM v4.0
**Use Cases**:

- Vendor security assessments
- RFP responses
- Customer due diligence
- Publicly shareable security posture
- CSA STAR Level 1 self-assessment

## CAIQ Versions

### CAIQ v4.0 (Full)

- **Questions**: 197 aligned to CCM v4.0
- **Response Format**: Yes/No + Evidence
- **Domains**: All 17 CCM domains
- **Effort**: 40-80 hours to complete
- **Use Case**: Comprehensive cloud security assessment

### CAIQ Lite

- **Questions**: Reduced subset (~50 questions)
- **Response Format**: Yes/No
- **Domains**: Core security domains only
- **Effort**: 10-20 hours to complete
- **Use Case**: Quick vendor assessments, initial due diligence

## CAIQ Question Structure

Each CAIQ question follows this format:

**Control ID**: CCM domain and control number (e.g., CEK-01)

**Question**: Yes/No question about control implementation

**Response Options**:

- **Yes**: Control is fully implemented
- **No**: Control is not implemented or partially implemented

**Evidence**: Description of how control is implemented, including:

- Policies and procedures
- Technical implementations
- Third-party certifications
- Audit reports
- Responsible party

## 17 Domain Breakdown

### A&A - Audit and Assurance (6 questions)

Example questions:

- Do you conduct annual independent audits or assessments?
- Do you have SOC 2 Type II certification?
- Are third-party audit reports available to customers?

**Key Evidence**:

- SOC 2 Type II reports
- ISO 27001 certificates
- Penetration test reports
- CAIQ self-assessment

### AIS - Application & Interface Security (11 questions)

Example questions:

- Do you follow a secure software development lifecycle (SDLC)?
- Are APIs protected with authentication and authorization?
- Do you perform automated application security testing (SAST/DAST)?

**Key Evidence**:

- SDLC documentation
- OWASP Top 10 mitigation
- API authentication mechanisms (OAuth, API keys)
- SAST/DAST tool reports

### BCR - Business Continuity & Operational Resilience (11 questions)

Example questions:

- Do you have a documented business continuity plan (BCP)?
- Do you test disaster recovery procedures annually?
- Are SLA targets defined and monitored (e.g., 99.9% uptime)?

**Key Evidence**:

- BCP/DR documentation
- DR test results
- SLA metrics and uptime reports
- Redundancy architecture

### CCC - Change Control & Configuration Management (9 questions)

Example questions:

- Do you have a formal change management process?
- Are baseline configurations defined and enforced?
- Is configuration management automated (IaC)?

**Key Evidence**:

- Change Advisory Board (CAB) procedures
- CIS Benchmarks or hardening guides
- Infrastructure as Code (Terraform, CloudFormation)
- Configuration management tools

### CEK - Cryptography, Encryption & Key Management (15 questions)

Example questions:

- Is data encrypted at rest?
- Is data encrypted in transit (TLS 1.2+)?
- Are encryption keys managed in a Hardware Security Module (HSM)?
- Is key rotation automated?

**Key Evidence**:

- Encryption policies
- TLS/SSL configuration
- AWS KMS, Azure Key Vault, or HSM usage
- Key rotation procedures
- FIPS 140-2 compliance

### DCS - Data Security & Privacy Lifecycle Management (12 questions)

Example questions:

- Is data classified according to sensitivity?
- Are data retention policies defined and enforced?
- Is Data Loss Prevention (DLP) implemented?
- Are test environments using anonymized data?

**Key Evidence**:

- Data classification scheme
- Retention schedules
- DLP tool implementation
- Data anonymization procedures

### DSP - Data Security & Privacy (13 questions)

Example questions:

- Do you conduct Data Protection Impact Assessments (DPIAs)?
- Can customers exercise data subject rights (access, deletion, portability)?
- Is consent management implemented?
- Are data breaches reported within 72 hours?

**Key Evidence**:

- DPIA documentation
- Data subject request portal
- Consent management platform
- Breach notification procedures
- GDPR/CCPA compliance programs

### GRC - Governance, Risk & Compliance (14 questions)

Example questions:

- Is there an information security governance framework?
- Are risk assessments conducted annually?
- Are security policies reviewed and updated regularly?
- Is there executive-level security oversight (CISO, security committee)?

**Key Evidence**:

- Security governance framework
- Risk assessment reports
- Policy management system
- Board/executive reporting
- CISO role definition

### HRS - Human Resources (10 questions)

Example questions:

- Are background checks conducted on employees?
- Is annual security awareness training mandatory?
- Are access rights revoked immediately upon termination?

**Key Evidence**:

- Background check procedures
- Training completion records
- Deprovisioning workflows
- Contractor security agreements

### IAM - Identity & Access Management (16 questions)

Example questions:

- Is multi-factor authentication (MFA) required for all users?
- Are privileged accounts managed separately?
- Are access reviews conducted quarterly?
- Is Single Sign-On (SSO) implemented?

**Key Evidence**:

- SSO implementation (Okta, Entra ID)
- MFA enforcement policies
- Privileged Access Management (PAM) solution
- Access review logs

### IPY - Interoperability & Portability (5 questions)

Example questions:

- Can customers export their data in standard formats?
- Are APIs based on industry standards?
- Is there a documented exit/offboarding process?

**Key Evidence**:

- Data export tools/APIs
- Standard data formats (JSON, CSV, XML)
- Customer offboarding documentation

### IVS - Infrastructure & Virtualization Security (13 questions)

Example questions:

- Is network segmentation implemented?
- Are hypervisors hardened and patched?
- Is container security scanning performed?
- Are production and non-production environments separated?

**Key Evidence**:

- Network architecture diagrams
- CIS Benchmarks compliance
- Container scanning tools (Aqua, Prisma Cloud)
- Environment isolation policies

### LOG - Logging & Monitoring (13 questions)

Example questions:

- Are security events logged centrally (SIEM)?
- Are audit logs retained for at least 1 year?
- Is real-time security monitoring implemented?
- Are logs protected from tampering (immutable storage)?

**Key Evidence**:

- SIEM solution (Splunk, ELK, Sentinel)
- Log retention policies
- Real-time alerting configuration
- Immutable log storage (WORM, S3 Object Lock)

### SEF - Security Incident Management (10 questions)

Example questions:

- Is there a documented incident response plan?
- Is there a 24/7 Security Operations Center (SOC)?
- Are incident response procedures tested annually?
- Is there a threat intelligence program?

**Key Evidence**:

- Incident response plan (NIST 800-61)
- SOC operations documentation
- Incident response test results
- Threat intelligence sources

### STA - Supply Chain Management, Transparency & Accountability (11 questions)

Example questions:

- Are third-party vendors assessed for security risks?
- Are Data Processing Agreements (DPAs) in place for sub-processors?
- Do vendor contracts include right-to-audit clauses?
- Is Software Bill of Materials (SBOM) maintained?

**Key Evidence**:

- Vendor risk assessment process
- Third-party security questionnaires
- DPAs with sub-processors
- SBOM for software dependencies

### TVM - Threat & Vulnerability Management (13 questions)

Example questions:

- Is vulnerability scanning performed regularly?
- Are critical vulnerabilities patched within 7 days?
- Is annual penetration testing conducted?
- Is there a vulnerability disclosure/bug bounty program?

**Key Evidence**:

- Vulnerability scanning tools (Nessus, Qualys)
- Patch management SLAs
- Penetration test reports
- Bug bounty program (HackerOne)

### UEM - Universal Endpoint Management (7 questions)

Example questions:

- Is Endpoint Detection and Response (EDR) deployed?
- Is full disk encryption required on all endpoints?
- Are mobile devices managed through MDM?
- Can lost/stolen devices be remotely wiped?

**Key Evidence**:

- EDR solution deployment
- Encryption policies (BitLocker, FileVault)
- MDM platform (Intune, Jamf)
- Remote wipe capabilities

## Response Best Practices

### Complete Evidence Requirements

**For "Yes" Responses**:

1. **Policy Reference**: Name of policy/procedure
2. **Implementation Details**: How control is technically implemented
3. **Responsible Party**: Team/role accountable
4. **Supporting Evidence**: Certifications, audit reports, tool screenshots
5. **Frequency**: How often control is performed/reviewed

**For "No" Responses**:

1. **Explanation**: Why control is not implemented
2. **Compensating Controls**: Alternative measures in place
3. **Roadmap**: Plans to implement (if applicable)
4. **Risk Acceptance**: Documented decision not to implement (if applicable)

### Example Response (CEK-01: Encryption at Rest)

**Question**: Is data encrypted at rest using industry-standard encryption algorithms?

**Answer**: Yes

**Evidence**:
"All customer data is encrypted at rest using AES-256 encryption. Encryption is implemented using AWS Key Management Service (KMS) with customer-managed keys (CMKs). Database encryption uses Transparent Data Encryption (TDE) on Amazon RDS. File storage in S3 uses server-side encryption (SSE-KMS). Encryption is enforced through AWS Service Control Policies (SCPs) preventing unencrypted resource creation. This control is documented in our Cryptography Policy (v2.1) and verified in our annual SOC 2 Type II audit. Responsible party: Security Engineering team."

## Output Formats

### Markdown Format

- Human-readable
- Easy to review and edit
- Suitable for internal documentation
- GitHub/Confluence compatible

### JSON Format

- Machine-readable
- API integration
- Automated processing
- Version control friendly

### Excel Format

- Spreadsheet for collaborative editing
- CSA STAR Registry compatible
- Filter and sort capabilities
- Conditional formatting for completeness

### CSV Format

- Simple import/export
- Database integration
- Lightweight format
- Universal compatibility

## Response Modes

### Full Mode

- Complete CAIQ with all 197 questions
- Detailed evidence for each "Yes" response
- Explanation for each "No" response
- Ready for CSA STAR submission

### Draft Mode

- Placeholder responses based on common implementations
- Requires customization with organization-specific details
- Highlights areas needing evidence collection
- Starting point for completion

### Template Mode

- Empty CAIQ structure
- Question list without responses
- Evidence guidance for each question
- Self-completion format

## CSA STAR Registry

**CAIQ Use in STAR**:

1. **Level 1 (Self-Assessment)**: Submit completed CAIQ
2. **Level 2 (Certification)**: CAIQ + third-party audit (ISO 27001, SOC 2)
3. **Level 3 (Continuous Monitoring)**: CAIQ + ongoing monitoring

**Public Visibility**: STAR Level 1 and 2 published in CSA STAR Registry for customer transparency

## CAIQ Completion Workflow

1. **Information Gathering** (Week 1-2)
   - Collect policies, procedures, architecture diagrams
   - Identify control owners across teams
   - Gather audit reports and certifications

2. **Response Drafting** (Week 3-5)
   - Answer yes/no questions
   - Draft evidence descriptions
   - Document compensating controls

3. **Internal Review** (Week 6)
   - Legal review (privacy, contracts)
   - Security team validation
   - Executive approval for public disclosure

4. **Finalization** (Week 7-8)
   - Format for chosen output
   - CSA STAR submission (if applicable)
   - Customer distribution

## Common Challenges

1. **Evidence Collection**: Gathering artifacts from multiple teams
2. **Consistency**: Ensuring responses align with audit reports
3. **Public Disclosure**: Balancing transparency with security through obscurity
4. **Maintenance**: Keeping CAIQ current as controls change
5. **Shared Responsibility**: Articulating cloud provider vs. customer responsibilities

## Examples

```bash
# Generate full CAIQ v4.0 in markdown format with draft responses
/ccm:caiq-generate v4.0 markdown draft

# Create CAIQ Lite template in Excel
/ccm:caiq-generate lite excel template

# Generate complete CAIQ in JSON for API integration
/ccm:caiq-generate v4.0 json full

# Create markdown template for manual completion
/ccm:caiq-generate v4.0 markdown template
```

## Benefits of CAIQ

### For Cloud Service Providers

- Standardized way to communicate security posture
- Reduce repetitive customer questionnaires
- Demonstrate transparency and accountability
- Marketing differentiator (CSA STAR)
- Efficient RFP response process

### For Cloud Customers

- Consistent vendor assessment format
- Alignment to CCM and other frameworks
- Comparable security evaluations
- Reduced due diligence time
- Trust through CSA validation

## Integration with Other Assessments

**CAIQ Complements**:

- **SOC 2 Type II**: CAIQ references SOC 2 controls
- **ISO 27001**: Evidence overlap with ISO certification
- **Vendor Questionnaires**: Maps to SIG, VSAQ, custom questionnaires
- **Contract Requirements**: Security exhibits and DPAs
- **Internal Audits**: Control testing and validation
