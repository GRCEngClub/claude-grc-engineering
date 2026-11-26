---
description: Deep dive guidance on CSA CCM domains and control objectives
---

# CSA CCM Domain Guidance

Provides detailed implementation guidance for CSA Cloud Controls Matrix domains and their 197 control objectives.

## Arguments

- Argument 1 - Domain abbreviation (required: A&A, AIS, BCR, CCC, CEK, DCS, DSP, GRC, HRS, IAM, IPY, IVS, LOG, SEF, STA, TVM, UEM)
- Argument 2 - Service model context (optional: IaaS, PaaS, SaaS)

## 17 CCM Domains

### A&A - Audit and Assurance

Independent verification of security controls and compliance posture.

**Control Objectives** (6 controls):

- A&A-01: Audit Planning - Scope and objectives defined
- A&A-02: Independent Audits - Third-party assessments
- A&A-03: Information System Regulatory Mapping - Compliance alignment
- A&A-04: Audit Controls Assurance - Evidence collection
- A&A-05: SOC 2 Reporting - AICPA attestation
- A&A-06: Annual Certification - Ongoing compliance validation

**Key Implementation**:

- Engage independent auditors (SOC 2 Type II, ISO 27001)
- Maintain control evidence repository
- Map controls to regulatory requirements
- Conduct annual compliance reviews

### AIS - Application & Interface Security

Secure design, development, and deployment of applications and APIs.

**Control Objectives** (11 controls):

- AIS-01: Application Security - SDLC integration
- AIS-02: Application Security Baseline - Minimum standards
- AIS-03: API Security - Interface protection
- AIS-04: Automated Application Security Testing - SAST/DAST
- AIS-05: Application Vulnerability Remediation - Patch management
- AIS-06: Production Code Changes - Change control
- AIS-07: Unsupported Software - Lifecycle management
- AIS-08: Application Security Training - Developer awareness
- AIS-09: Code Review - Peer/automated review
- AIS-10: Secure Coding - OWASP Top 10 prevention
- AIS-11: Third-Party Software - Vendor assessment

**Key Implementation**:

- OWASP Top 10 mitigation in SDLC
- API authentication (OAuth, API keys, JWT)
- Automated security testing in CI/CD
- Regular vulnerability scanning and remediation

### BCR - Business Continuity & Operational Resilience

Maintaining availability during disruptions and disasters.

**Control Objectives** (11 controls):

- BCR-01: Business Continuity Planning - BCP documentation
- BCR-02: Business Impact Analysis - Critical function identification
- BCR-03: Resilience Architecture - Redundancy and failover
- BCR-04: Disaster Recovery - DR plan and testing
- BCR-05: Equipment Maintenance - Preventive maintenance
- BCR-06: Service Availability - SLA targets (99.9%, 99.99%)
- BCR-07: Backup - Data backup procedures
- BCR-08: Backup Verification - Restore testing
- BCR-09: Business Continuity Testing - Annual BCP/DR tests
- BCR-10: Environmental Risks - Physical threats mitigation
- BCR-11: Power Failures - UPS and generator backup

**Key Implementation**:

- Multi-region deployment for resilience
- Automated backup with 3-2-1 rule
- Annual DR testing and tabletop exercises
- SLA monitoring and incident response

### CCC - Change Control & Configuration Management

Managing changes to systems and maintaining secure configurations.

**Control Objectives** (9 controls):

- CCC-01: New Development/Acquisition - Approval process
- CCC-02: Unauthorized Software - Whitelist/blacklist
- CCC-03: Production Changes - CAB approval
- CCC-04: Change Management - Documented procedures
- CCC-05: Baseline Configuration - Security standards
- CCC-06: Configuration Inventory - Asset tracking
- CCC-07: Quality Testing - Pre-production validation
- CCC-08: Outsourced Development - Vendor oversight
- CCC-09: Change Impact Analysis - Risk assessment

**Key Implementation**:

- Infrastructure as Code (IaC) with version control
- Change Advisory Board (CAB) for production changes
- CIS Benchmarks or vendor hardening guides
- Configuration management tools (Ansible, Puppet, Chef)

### CEK - Cryptography, Encryption & Key Management

Protecting data through cryptographic controls.

**Control Objectives** (15 controls):

- CEK-01: Encryption at Rest - Data protection
- CEK-02: Encryption in Transit - TLS/SSL
- CEK-03: Encryption Algorithm - Strong crypto (AES-256)
- CEK-04: Key Generation - Secure random generation
- CEK-05: Key Management - Lifecycle management
- CEK-06: Key Access - Privileged access control
- CEK-07: Key Storage - Hardware Security Module (HSM)
- CEK-08: Key Rotation - Regular key changes
- CEK-09: Key Destruction - Secure deletion
- CEK-10: Sensitive Data Protection - PII/PHI encryption
- CEK-11: Certificate Management - PKI lifecycle
- CEK-12: Cryptographic Module Validation - FIPS 140-2
- CEK-13: Encryption Policy - Standards documentation
- CEK-14: Quantum-Safe Cryptography - Future-proofing
- CEK-15: Data in Use Encryption - Memory protection

**Key Implementation**:

- Cloud provider key management (AWS KMS, Azure Key Vault)
- TLS 1.2+ for all communications
- Automated certificate rotation
- HSM for key storage (FIPS 140-2 Level 2+)

### DCS - Data Security & Privacy Lifecycle Management

Managing data throughout its lifecycle from creation to disposal.

**Control Objectives** (12 controls):

- DCS-01: Classification - Data categorization
- DCS-02: Secure Disposal - Sanitization and destruction
- DCS-03: Handling/Labeling/Security Policy - Data marking
- DCS-04: Nonproduction Data - Test data protection
- DCS-05: Data Retention - Policy enforcement
- DCS-06: Data Loss Prevention - DLP tools
- DCS-07: Data Inventory - Data mapping
- DCS-08: Data Flow Documentation - System diagrams
- DCS-09: Data Ownership - Accountability
- DCS-10: Data Minimization - Collect only necessary data
- DCS-11: eDiscovery - Legal hold procedures
- DCS-12: Data Anonymization - De-identification techniques

**Key Implementation**:

- Data classification scheme (Public, Internal, Confidential, Restricted)
- DLP policies for sensitive data exfiltration prevention
- Retention schedules aligned to regulations
- Secure data disposal (crypto erase, shredding)

### DSP - Data Security & Privacy

Privacy-specific controls for personal data protection.

**Control Objectives** (13 controls):

- DSP-01: Privacy Impact Assessment - DPIA for high-risk processing
- DSP-02: Data Privacy Notice - Transparency
- DSP-03: Data Subject Rights - Access, erasure, portability
- DSP-04: Consent Management - Opt-in/opt-out
- DSP-05: Privacy by Design - Proactive privacy
- DSP-06: Data Processing Agreement - Third-party contracts
- DSP-07: Cross-Border Data Transfer - Adequacy/SCCs
- DSP-08: Data Breach Notification - 72-hour reporting
- DSP-09: Children's Privacy - COPPA compliance
- DSP-10: Marketing Communications - CAN-SPAM
- DSP-11: Cookies and Tracking - Consent mechanisms
- DSP-12: Automated Decision-Making - GDPR Article 22
- DSP-13: Data Protection Officer - Privacy governance

**Key Implementation**:

- GDPR/CCPA compliance programs
- Privacy-enhancing technologies (PETs)
- Consent management platforms
- Data subject request portal

### GRC - Governance, Risk & Compliance

Establishing security governance and managing organizational risk.

**Control Objectives** (14 controls):

- GRC-01: Governance Program - Security framework
- GRC-02: Risk Management Framework - ISO 31000 alignment
- GRC-03: Risk Assessment - Annual/ad-hoc assessments
- GRC-04: Risk Treatment - Mitigation strategies
- GRC-05: Policy Management - Documentation and review
- GRC-06: Compliance Monitoring - Continuous compliance
- GRC-07: Security Metrics - KPIs and KRIs
- GRC-08: Executive Reporting - Board/C-level dashboards
- GRC-09: Internal Audit - Audit program
- GRC-10: Regulatory Intelligence - Law/regulation tracking
- GRC-11: Legal and Regulatory Compliance - Multi-jurisdiction
- GRC-12: Contracts and Agreements - Security terms
- GRC-13: Data Protection Authority - DPA registration
- GRC-14: Security Strategy - Multi-year roadmap

**Key Implementation**:

- GRC platform (ServiceNow, Archer, OneTrust)
- Risk register with heat maps
- Quarterly board reporting on security posture
- Policy review cycle (annual minimum)

### HRS - Human Resources

Personnel security from hiring through termination.

**Control Objectives** (10 controls):

- HRS-01: Background Screening - Pre-employment checks
- HRS-02: Employment Agreements - Confidentiality clauses
- HRS-03: Roles and Responsibilities - Job descriptions
- HRS-04: Security Awareness Training - Annual training
- HRS-05: Role-Based Training - Specialized training
- HRS-06: Disciplinary Process - Policy violations
- HRS-07: Return of Assets - Termination procedures
- HRS-08: Access Revocation - Immediate termination of access
- HRS-09: Contractors and Third Parties - Non-employee security
- HRS-10: Training Records - Documentation

**Key Implementation**:

- Background checks for all employees
- Annual security awareness training (phishing, data handling)
- Automated deprovisioning on termination
- Contractor security acknowledgments

### IAM - Identity & Access Management

Controlling who has access to what resources.

**Control Objectives** (16 controls):

- IAM-01: User Access Policy - Least privilege principle
- IAM-02: User Access Provisioning - Joiner/mover/leaver
- IAM-03: User Access Reviews - Periodic recertification
- IAM-04: User Access Revocation - Timely deprovisioning
- IAM-05: Privileged Access Management - Admin controls
- IAM-06: Multi-Factor Authentication - MFA for all users
- IAM-07: Password Policy - Complexity and rotation
- IAM-08: Single Sign-On - Centralized authentication
- IAM-09: Identity Federation - SAML/OAuth
- IAM-10: Service Accounts - Non-human identity management
- IAM-11: Just-in-Time Access - Temporary elevation
- IAM-12: Segregation of Duties - Conflict prevention
- IAM-13: Account Lockout - Brute force protection
- IAM-14: Session Management - Timeout and termination
- IAM-15: Biometric Authentication - Advanced authentication
- IAM-16: Identity Governance - IAM program oversight

**Key Implementation**:

- SSO with SAML/OIDC (Okta, Entra ID, Auth0)
- MFA for all accounts (hardware tokens, authenticator apps)
- Privileged Access Management (PAM) solution
- Quarterly access reviews and recertification

### IPY - Interoperability & Portability

Preventing vendor lock-in and enabling data portability.

**Control Objectives** (5 controls):

- IPY-01: Data Portability - Customer data export
- IPY-02: Standard Formats - Open/standardized formats
- IPY-03: API Interoperability - Standard APIs
- IPY-04: Vendor Lock-In Prevention - Exit planning
- IPY-05: Service Migration - Transition assistance

**Key Implementation**:

- Data export APIs and tools
- Support for industry-standard formats (JSON, CSV, XML)
- Documented exit procedures
- No proprietary data formats

### IVS - Infrastructure & Virtualization Security

Securing cloud infrastructure, hypervisors, and containers.

**Control Objectives** (13 controls):

- IVS-01: Network Security - Segmentation and firewalls
- IVS-02: Network Intrusion Detection - IDS/IPS
- IVS-03: Hypervisor Hardening - Virtualization security
- IVS-04: OS Hardening - Secure baselines
- IVS-05: Container Security - Docker/Kubernetes
- IVS-06: VM Isolation - Multi-tenancy controls
- IVS-07: Clock Synchronization - NTP
- IVS-08: Wireless Security - WiFi encryption
- IVS-09: Bring Your Own Device - BYOD policy
- IVS-10: Mobile Device Management - MDM solution
- IVS-11: Production/Non-Production Separation - Environment isolation
- IVS-12: Network Architecture - Defense in depth
- IVS-13: Secure Remote Access - VPN/bastion hosts

**Key Implementation**:

- Network segmentation (VPCs, subnets, security groups)
- CIS Benchmarks for OS hardening
- Container scanning (Aqua, Twistlock, Prisma Cloud)
- Zero Trust network architecture

### LOG - Logging & Monitoring

Comprehensive security event logging and real-time monitoring.

**Control Objectives** (13 controls):

- LOG-01: Audit Logging - Event capture
- LOG-02: Security Event Logging - Security-relevant events
- LOG-03: Log Integrity - Tamper protection
- LOG-04: Log Retention - Compliance-driven retention
- LOG-05: Clock Synchronization - Time accuracy (NTP)
- LOG-06: Log Review and Analysis - Automated/manual review
- LOG-07: Security Monitoring - Real-time alerting
- LOG-08: SIEM - Centralized log aggregation
- LOG-09: Alerting and Notification - Incident alerting
- LOG-10: User Activity Monitoring - Privileged user tracking
- LOG-11: Log Access Control - Restricted access
- LOG-12: Audit Log Backup - Offline copies
- LOG-13: Performance Monitoring - System health

**Key Implementation**:

- SIEM solution (Splunk, ELK, Azure Sentinel)
- Log retention: 1 year minimum (varies by regulation)
- Real-time alerting for critical security events
- Immutable log storage (WORM, S3 Object Lock)

### SEF - Security Incident Management

Detecting, responding to, and recovering from security incidents.

**Control Objectives** (10 controls):

- SEF-01: Incident Response Plan - Documented procedures
- SEF-02: Incident Response Team - CSIRT/SOC
- SEF-03: Incident Classification - Severity levels
- SEF-04: Incident Reporting - Internal/external reporting
- SEF-05: Incident Response Testing - Annual tabletops
- SEF-06: Forensics - Evidence collection
- SEF-07: Post-Incident Review - Lessons learned
- SEF-08: Threat Intelligence - IOC sharing
- SEF-09: Security Operations Center - 24/7 monitoring
- SEF-10: Incident Metrics - MTTD/MTTR tracking

**Key Implementation**:

- NIST 800-61 incident response framework
- Security Operations Center (SOC) 24/7
- Incident response playbooks
- Forensics tools and chain of custody procedures

### STA - Supply Chain Management, Transparency & Accountability

Managing third-party and supply chain security risks.

**Control Objectives** (11 controls):

- STA-01: Third-Party Assessment - Vendor due diligence
- STA-02: Vendor Risk Management - Ongoing monitoring
- STA-03: Vendor Contracts - Security requirements
- STA-04: Supply Chain Transparency - Visibility
- STA-05: Outsourced Services - Managed service oversight
- STA-06: Cloud Service Providers - Sub-processor management
- STA-07: Data Processing Agreements - GDPR DPAs
- STA-08: Right to Audit - Contractual audit rights
- STA-09: Vendor Termination - Offboarding procedures
- STA-10: Supply Chain Incident Response - Coordinated response
- STA-11: Software Supply Chain - SBOM management

**Key Implementation**:

- Vendor security questionnaires (SIG, CAIQ)
- Third-party risk management platform
- Annual vendor assessments
- Software Bill of Materials (SBOM) for dependencies

### TVM - Threat & Vulnerability Management

Identifying and remediating security vulnerabilities.

**Control Objectives** (13 controls):

- TVM-01: Vulnerability Scanning - Automated scanning
- TVM-02: Vulnerability Remediation - SLA-based patching
- TVM-03: Penetration Testing - Annual pentests
- TVM-04: Red Team Exercises - Advanced threat simulation
- TVM-05: Threat Intelligence - IOCs and TTPs
- TVM-06: Security Testing - SAST/DAST integration
- TVM-07: Patch Management - Timely updates
- TVM-08: Critical Patch SLA - Emergency patching
- TVM-09: Vulnerability Disclosure Program - Responsible disclosure
- TVM-10: Bug Bounty - Crowdsourced security testing
- TVM-11: Security Advisories - Vendor notifications
- TVM-12: Asset Discovery - Shadow IT identification
- TVM-13: Attack Surface Management - External exposure

**Key Implementation**:

- Vulnerability scanning (Nessus, Qualys, Rapid7)
- Patch management: Critical (7 days), High (30 days), Medium (90 days)
- Annual penetration testing
- Bug bounty program (HackerOne, Bugcrowd)

### UEM - Universal Endpoint Management

Securing all endpoint devices accessing cloud services.

**Control Objectives** (7 controls):

- UEM-01: Endpoint Security Policy - Standards
- UEM-02: Endpoint Protection - Antivirus/EDR
- UEM-03: Endpoint Encryption - Full disk encryption
- UEM-04: Mobile Device Management - MDM/MAM
- UEM-05: BYOD Security - Personal device controls
- UEM-06: Remote Wipe - Lost/stolen device protection
- UEM-07: Endpoint Compliance - Configuration enforcement

**Key Implementation**:

- Endpoint Detection and Response (EDR) solution
- MDM for corporate/BYOD devices (Intune, Jamf, MobileIron)
- Full disk encryption (BitLocker, FileVault)
- Conditional access policies

## Output

1. **Domain Overview**: Purpose, objectives, and cloud relevance
2. **Control Objective List**: All controls within domain
3. **Implementation Guidance**: Technical and procedural requirements
4. **Cloud Service Model Considerations**: IaaS/PaaS/SaaS variations
5. **Common Gaps**: Typical deficiencies in cloud environments
6. **Evidence Requirements**: What auditors look for
7. **Framework Mappings**: ISO 27001, SOC 2, NIST alignment
8. **Tool Recommendations**: Cloud-native and third-party solutions

## Examples

```bash
# Get detailed guidance for Encryption domain
/ccm:domain-guidance CEK

# Review IAM requirements for SaaS context
/ccm:domain-guidance IAM SaaS

# Understand logging requirements for IaaS
/ccm:domain-guidance LOG IaaS

# Deep dive into incident management
/ccm:domain-guidance SEF
```

## Cloud-Specific Considerations

### IaaS Focus Domains

- **IVS**: Infrastructure & Virtualization Security
- **CCC**: Change Control & Configuration Management
- **LOG**: Logging & Monitoring

### PaaS Focus Domains

- **AIS**: Application & Interface Security
- **CEK**: Cryptography, Encryption & Key Management
- **DCS**: Data Security & Privacy Lifecycle

### SaaS Focus Domains

- **IAM**: Identity & Access Management
- **DSP**: Data Security & Privacy
- **A&A**: Audit and Assurance
