---
name: map-framework
description: Map CSA CCM controls to other compliance frameworks
---

# CSA CCM Framework Mapping

Maps Cloud Security Alliance Cloud Controls Matrix controls to other major compliance frameworks including ISO 27001, SOC 2, PCI-DSS, NIST, HIPAA, and GDPR.

## Arguments

- Argument 1 - CCM control ID (required, e.g., CEK-01, IAM-06, LOG-08)
- Argument 2 - Target framework (optional: ISO27001, SOC2, PCIDSS, NIST, HIPAA, GDPR, all)

## CCM Control ID Format

**Structure**: `[Domain]-[Number]`

- **Domain**: Three-letter abbreviation (A&A, AIS, BCR, CCC, CEK, DCS, DSP, GRC, HRS, IAM, IPY, IVS, LOG, SEF, STA, TVM, UEM)
- **Number**: Two-digit control number (01-99)

**Examples**:

- `CEK-01`: Cryptography domain, control 01 (Encryption at Rest)
- `IAM-06`: Identity & Access Management, control 06 (Multi-Factor Authentication)
- `LOG-08`: Logging domain, control 08 (SIEM)

## Framework Mapping Overview

CCM v4.0 provides comprehensive mappings to enable multi-framework compliance:

### Supported Framework Mappings

1. **ISO/IEC 27001:2022** - Information Security Management
2. **SOC 2 Type II** - AICPA Trust Services Criteria
3. **PCI DSS v4.0** - Payment Card Industry Data Security Standard
4. **NIST CSF 2.0** - Cybersecurity Framework
5. **NIST 800-53 Rev 5** - Security and Privacy Controls
6. **HIPAA Security Rule** - Healthcare Information Protection
7. **GDPR** - General Data Protection Regulation
8. **FedRAMP** - Federal Risk and Authorization Management Program
9. **COBIT 2019** - IT Governance Framework
10. **CIS Controls v8** - Center for Internet Security

## Common Control Mappings

### Encryption Controls

**CEK-01: Encryption at Rest**

- **ISO 27001**: A.8.24 (Use of cryptography)
- **SOC 2**: CC6.1 (Logical and physical access controls)
- **PCI DSS**: 3.5.1 (Disk encryption to protect PAN)
- **NIST 800-53**: SC-28 (Protection of Information at Rest)
- **HIPAA**: 164.312(a)(2)(iv) (Encryption and decryption)
- **GDPR**: Article 32(1)(a) (Pseudonymisation and encryption)

**CEK-02: Encryption in Transit**

- **ISO 27001**: A.8.24 (Use of cryptography)
- **SOC 2**: CC6.7 (Transmission of data protected)
- **PCI DSS**: 4.2.1 (Strong cryptography for transmission)
- **NIST 800-53**: SC-8 (Transmission Confidentiality and Integrity)
- **HIPAA**: 164.312(e)(1) (Transmission security)
- **GDPR**: Article 32(1)(a) (Encryption of personal data)

**CEK-05: Key Management**

- **ISO 27001**: A.8.24 (Use of cryptography)
- **SOC 2**: CC6.1 (Logical and physical access controls)
- **PCI DSS**: 3.6.1 (Generation of strong cryptographic keys)
- **NIST 800-53**: SC-12 (Cryptographic Key Establishment and Management)
- **HIPAA**: 164.312(a)(2)(iv) (Encryption and decryption)

### Identity & Access Management

**IAM-01: User Access Policy**

- **ISO 27001**: A.5.15 (Access control), A.5.16 (Identity management)
- **SOC 2**: CC6.1 (Logical and physical access controls)
- **PCI DSS**: 7.1.1 (Access limited to least privilege)
- **NIST 800-53**: AC-2 (Account Management)
- **HIPAA**: 164.308(a)(4)(i) (Access authorization)
- **GDPR**: Article 32(1)(b) (Confidentiality of processing systems)

**IAM-06: Multi-Factor Authentication**

- **ISO 27001**: A.5.17 (Authentication information)
- **SOC 2**: CC6.1 (Logical and physical access controls)
- **PCI DSS**: 8.4.2 (MFA for remote access)
- **NIST 800-53**: IA-2(1) (Multi-factor Authentication)
- **HIPAA**: 164.312(d) (Person or entity authentication)
- **GDPR**: Article 32(1)(b) (Ability to ensure confidentiality)

**IAM-03: User Access Reviews**

- **ISO 27001**: A.5.18 (Access rights review)
- **SOC 2**: CC6.2 (Logical and physical access review)
- **PCI DSS**: 7.2.4 (Review user access at least every 6 months)
- **NIST 800-53**: AC-2(7) (Account Management - Privileged User Accounts)
- **HIPAA**: 164.308(a)(4)(ii)(C) (Access establishment and modification)

### Logging & Monitoring

**LOG-01: Audit Logging**

- **ISO 27001**: A.8.15 (Logging)
- **SOC 2**: CC7.2 (System monitoring)
- **PCI DSS**: 10.2.1 (Audit logs for user actions)
- **NIST 800-53**: AU-2 (Event Logging)
- **HIPAA**: 164.312(b) (Audit controls)
- **GDPR**: Article 32(1)(d) (Monitoring effectiveness)

**LOG-08: SIEM**

- **ISO 27001**: A.8.16 (Monitoring activities)
- **SOC 2**: CC7.2 (System monitoring tools)
- **PCI DSS**: 10.6.1 (Review logs daily)
- **NIST 800-53**: AU-6 (Audit Review, Analysis, and Reporting)
- **HIPAA**: 164.308(a)(1)(ii)(D) (Information system activity review)

**LOG-04: Log Retention**

- **ISO 27001**: A.8.15 (Logging)
- **SOC 2**: CC7.2 (System monitoring)
- **PCI DSS**: 10.5.1 (Retain audit logs at least 1 year)
- **NIST 800-53**: AU-11 (Audit Record Retention)
- **HIPAA**: 164.316(b)(2)(i) (Retain documentation 6 years)

### Incident Management

**SEF-01: Incident Response Plan**

- **ISO 27001**: A.5.24 (Information security incident management planning)
- **SOC 2**: CC7.3 (Security incidents evaluated and responded to)
- **PCI DSS**: 12.10.1 (Incident response plan)
- **NIST 800-53**: IR-8 (Incident Response Plan)
- **HIPAA**: 164.308(a)(6)(i) (Security incident procedures)
- **GDPR**: Article 33 (Notification of a personal data breach)

**SEF-04: Incident Reporting**

- **ISO 27001**: A.5.25 (Assessment and decision on information security events)
- **SOC 2**: CC7.4 (Communication of security events)
- **PCI DSS**: 12.10.6 (Incident response procedures)
- **NIST 800-53**: IR-6 (Incident Reporting)
- **HIPAA**: 164.308(a)(6)(ii) (Identify and respond to suspected security incidents)
- **GDPR**: Article 33 (72-hour breach notification)

### Data Privacy

**DSP-01: Privacy Impact Assessment**

- **ISO 27001**: A.5.36 (Compliance with policies and standards for information security)
- **GDPR**: Article 35 (Data Protection Impact Assessment)
- **NIST 800-53**: RA-8 (Privacy Impact Assessments)

**DSP-03: Data Subject Rights**

- **ISO 27001**: A.5.34 (Privacy and protection of PII)
- **GDPR**: Articles 15-22 (Rights of the data subject)
- **HIPAA**: 164.524 (Access of individuals to PHI)

**DSP-08: Data Breach Notification**

- **ISO 27001**: A.5.26 (Response to information security incidents)
- **GDPR**: Article 33 (72-hour notification to authority)
- **HIPAA**: 164.410 (Breach notification - 60 days)
- **PCI DSS**: 12.10.4 (Incident response communications)

### Vulnerability Management

**TVM-01: Vulnerability Scanning**

- **ISO 27001**: A.8.8 (Management of technical vulnerabilities)
- **SOC 2**: CC7.1 (Security threats detected and mitigated)
- **PCI DSS**: 11.3.1 (Internal vulnerability scans quarterly)
- **NIST 800-53**: RA-5 (Vulnerability Monitoring and Scanning)
- **HIPAA**: 164.308(a)(8) (Evaluation of security measures)

**TVM-03: Penetration Testing**

- **ISO 27001**: A.8.8 (Management of technical vulnerabilities)
- **SOC 2**: CC7.1 (Security threats detected)
- **PCI DSS**: 11.4.1 (Penetration testing annually)
- **NIST 800-53**: CA-8 (Penetration Testing)
- **HIPAA**: 164.308(a)(8) (Evaluation)

**TVM-07: Patch Management**

- **ISO 27001**: A.8.19 (Installation of software on operational systems)
- **SOC 2**: CC7.1 (Security threats detected and mitigated)
- **PCI DSS**: 6.3.3 (Security patches installed within 30 days)
- **NIST 800-53**: SI-2 (Flaw Remediation)
- **HIPAA**: 164.308(a)(5)(ii)(B) (Protection from malicious software)

### Business Continuity

**BCR-04: Disaster Recovery**

- **ISO 27001**: A.5.29 (Information security during disruption)
- **SOC 2**: A1.2 (Business continuity and disaster recovery)
- **NIST 800-53**: CP-10 (System Recovery and Reconstitution)
- **HIPAA**: 164.308(a)(7)(ii)(B) (Disaster recovery plan)

**BCR-07: Backup**

- **ISO 27001**: A.8.13 (Information backup)
- **SOC 2**: A1.2 (Data backup and recovery)
- **PCI DSS**: 12.9.1 (Document backup procedures)
- **NIST 800-53**: CP-9 (System Backup)
- **HIPAA**: 164.308(a)(7)(ii)(A) (Data backup plan)

### Third-Party Management

**STA-01: Third-Party Assessment**

- **ISO 27001**: A.5.19 (Information security in supplier relationships)
- **SOC 2**: CC9.2 (Vendor management)
- **PCI DSS**: 12.8.2 (Service provider compliance monitoring)
- **NIST 800-53**: SA-9 (External System Services)
- **HIPAA**: 164.314(a)(1) (Business associate contracts)
- **GDPR**: Article 28 (Processor obligations)

## Framework-Specific Views

### ISO 27001:2022 Mapping

CCM provides comprehensive coverage of ISO 27001 Annex A controls (93 controls across 4 themes):

- **Organizational controls** (37 controls)
- **People controls** (8 controls)
- **Physical controls** (14 controls)
- **Technological controls** (34 controls)

**CCM Coverage**: 197 controls map to all 93 ISO 27001 Annex A controls with additional depth.

### SOC 2 Type II Mapping

CCM aligns to AICPA Trust Services Criteria:

- **CC** (Common Criteria): Control environment, communication, risk assessment, monitoring
- **A** (Availability): System availability and business continuity
- **C** (Confidentiality): Protection of confidential information
- **P** (Processing Integrity): Complete, valid, accurate, timely processing
- **PI** (Privacy): Collection, use, retention, disclosure of personal information

**CCM Coverage**: All SOC 2 criteria mapped with cloud-specific enhancements.

### PCI DSS v4.0 Mapping

CCM covers all 12 PCI DSS requirements:

1. Install and maintain network security controls
2. Apply secure configurations
3. Protect stored account data
4. Protect cardholder data with strong cryptography
5. Protect all systems and networks from malicious software
6. Develop and maintain secure systems and software
7. Restrict access to system components and cardholder data
8. Identify users and authenticate access
9. Restrict physical access to cardholder data
10. Log and monitor all access
11. Test security of systems and networks regularly
12. Support information security with policies and programs

**CCM Coverage**: Cloud-native controls exceed PCI DSS requirements.

### NIST CSF 2.0 Mapping

CCM aligns to all 6 NIST CSF functions:

- **Govern** (GV): Organizational context and cybersecurity strategy
- **Identify** (ID): Asset management and risk assessment
- **Protect** (PR): Access control, awareness, data security
- **Detect** (DE): Continuous monitoring and detection
- **Respond** (RS): Incident response and communication
- **Recover** (RC): Recovery planning and improvements

**CCM Coverage**: All CSF categories and subcategories mapped.

## Output

1. **Control Definition**: CCM control objective and requirements
2. **Framework Mappings**: Specific control mappings to:
   - ISO 27001 Annex A controls
   - SOC 2 Trust Services Criteria
   - PCI DSS requirements
   - NIST 800-53 controls
   - HIPAA Security Rule standards
   - GDPR articles
3. **Implementation Guidance**: How to satisfy CCM and mapped controls
4. **Evidence Overlap**: Artifacts satisfying multiple frameworks
5. **Gap Analysis**: Where CCM exceeds other frameworks
6. **Multi-Framework Benefits**: Efficiency gains from CCM implementation

## Multi-Framework Compliance Benefits

### Single Assessment, Multiple Certifications

- Implement CCM controls once
- Leverage evidence for ISO 27001, SOC 2, PCI DSS simultaneously
- Reduce audit fatigue and costs
- Streamline compliance programs

### Cloud-First Advantage

CCM provides cloud-specific depth beyond traditional frameworks:

- Container security (Kubernetes, Docker)
- Serverless security
- Cloud-native IAM (SAML, OAuth, OIDC)
- Multi-cloud and hybrid architectures
- API security
- DevSecOps integration

## Examples

```bash
# Map encryption control to all frameworks
/ccm:map-framework CEK-01 all

# Show MFA alignment with NIST
/ccm:map-framework IAM-06 NIST

# View incident response ISO 27001 mapping
/ccm:map-framework SEF-01 ISO27001

# Check GDPR alignment for privacy controls
/ccm:map-framework DSP-03 GDPR

# Map logging to PCI DSS requirements
/ccm:map-framework LOG-01 PCIDSS

# View SOC 2 mapping for backup controls
/ccm:map-framework BCR-07 SOC2
```

## Reverse Mapping

Can also map from other frameworks to CCM:

- **ISO 27001 A.8.24** → CEK-01, CEK-02, CEK-03, CEK-05, CEK-07
- **PCI DSS 8.4.2** → IAM-06 (Multi-Factor Authentication)
- **NIST 800-53 AU-2** → LOG-01 (Audit Logging)
- **GDPR Article 33** → SEF-04, DSP-08 (Breach Notification)
- **SOC 2 CC6.1** → IAM-01, IAM-05, CEK-01 (Access Controls)

This enables organizations already compliant with other frameworks to identify CCM control gaps efficiently.
