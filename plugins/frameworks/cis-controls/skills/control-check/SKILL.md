---
name: control-check
description: Verify specific CIS Control implementation from 18 controls
---

> _CIS Controls v8 content used under CC BY-SA 4.0 from the Center for Internet Security. This command's CIS-derived content is CC BY-SA 4.0. See [LICENSE-CIS.md](../../LICENSE-CIS.md)._

# CIS Control Implementation Check

Provides detailed implementation guidance and verification for specific CIS Controls v8 controls.

## Arguments

- Argument 1 - Control number or name (required: 1-18 or control name)
- Argument 2 - Implementation Group level (optional: IG1, IG2, IG3)

## The 18 CIS Controls

### Control 1: Inventory and Control of Enterprise Assets

**IG Level**: IG1 | **Safeguards**: 5 (IG1: 5, IG2: 5, IG3: 5)

**Purpose**: Actively manage all enterprise assets connected to infrastructure

**Key Safeguards**:

- 1.1: Establish and maintain detailed enterprise asset inventory (IG1)
- 1.2: Address unauthorized assets (IG1)
- 1.3: Utilize asset management tool (IG1)
- 1.4: Use Dynamic Host Configuration Protocol (DHCP) logging (IG2)
- 1.5: Use Active Discovery Tools (IG3)

**Implementation**:

- Deploy asset discovery tools (CMDB, network scanner)
- Document all hardware (laptops, servers, network devices, IoT)
- Track location, owner, business purpose
- Automate unauthorized device detection

**Common Tools**: ServiceNow, Lansweeper, Qualys, Nessus

---

### Control 2: Inventory and Control of Software Assets

**IG Level**: IG1 | **Safeguards**: 7 (IG1: 4, IG2: 6, IG3: 7)

**Purpose**: Actively manage all software on the network

**Key Safeguards**:

- 2.1: Establish and maintain software inventory (IG1)
- 2.2: Ensure authorized software is currently supported (IG1)
- 2.3: Address unauthorized software (IG1)
- 2.4: Utilize automated software inventory tools (IG1)
- 2.5: Allowlist authorized software (IG2)
- 2.6: Allowlist authorized libraries (IG2)
- 2.7: Allowlist authorized scripts (IG3)

**Implementation**:

- Software asset management (SAM) tool
- Application whitelisting/allowlisting
- Track version, vendor, support status
- Detect shadow IT

**Common Tools**: Microsoft Endpoint Manager, Flexera, Snow Software

---

### Control 3: Data Protection

**IG Level**: IG1 | **Safeguards**: 14 (IG1: 3, IG2: 11, IG3: 14)

**Purpose**: Protect data at rest and in transit

**Key Safeguards**:

- 3.1: Establish and maintain data management process (IG1)
- 3.2: Establish and maintain data inventory (IG1)
- 3.3: Configure data access control lists (IG1)
- 3.4: Enforce data retention (IG1)
- 3.5: Securely dispose of data (IG1)
- 3.6: Encrypt data on end-user devices (IG2)
- 3.7: Establish and maintain data classification scheme (IG2)
- 3.10: Encrypt sensitive data in transit (IG2)
- 3.11: Encrypt sensitive data at rest (IG2)
- 3.12: Segment data processing and storage (IG2)

**Implementation**:

- Data classification policy
- Encryption (BitLocker, FileVault, TLS 1.2+)
- Data loss prevention (DLP)
- Secure deletion procedures

**Common Tools**: Microsoft Purview, Varonis, Symantec DLP

---

### Control 4: Secure Configuration of Enterprise Assets and Software

**IG Level**: IG1 | **Safeguards**: 12 (IG1: 5, IG2: 10, IG3: 12)

**Purpose**: Establish and maintain secure configurations

**Key Safeguards**:

- 4.1: Establish and maintain secure configuration process (IG1)
- 4.2: Establish and maintain secure configuration baseline (IG1)
- 4.3: Configure automatic session locking (IG1)
- 4.4: Implement and manage firewall (IG1)
- 4.5: Implement and manage DMZ (IG2)
- 4.7: Manage default accounts (IG1)
- 4.8: Uninstall or disable unnecessary services (IG2)

**Implementation**:

- CIS Benchmarks, DISA STIGs
- Configuration management tools
- Hardening scripts
- Regular configuration audits

**Common Tools**: CIS-CAT Pro, Ansible, Puppet, Chef

---

### Control 5: Account Management

**IG Level**: IG1 | **Safeguards**: 6 (IG1: 4, IG2: 6, IG3: 6)

**Purpose**: Manage lifecycle of system and application accounts

**Key Safeguards**:

- 5.1: Establish and maintain inventory of accounts (IG1)
- 5.2: Use unique passwords (IG1)
- 5.3: Disable dormant accounts (IG1)
- 5.4: Restrict administrator privileges (IG1)
- 5.5: Establish and maintain MFA (IG2)
- 5.6: Centralize account management (IG2)

**Implementation**:

- Identity and Access Management (IAM)
- Multi-factor authentication (MFA)
- Privileged Access Management (PAM)
- Regular access reviews

**Common Tools**: Active Directory, Okta, Duo, CyberArk

---

### Control 6: Access Control Management

**IG Level**: IG1 | **Safeguards**: 8 (IG1: 3, IG2: 6, IG3: 8)

**Purpose**: Apply the principle of least privilege

**Key Safeguards**:

- 6.1: Establish access granting process (IG1)
- 6.2: Establish access revoking process (IG1)
- 6.3: Require MFA for externally-exposed applications (IG1)
- 6.4: Require MFA for remote access (IG1)
- 6.5: Require MFA for administrative access (IG2)
- 6.7: Centralize access control (IG2)
- 6.8: Define and maintain role-based access control (IG2)

**Implementation**:

- Role-based access control (RBAC)
- Just-in-time access
- Separation of duties
- Automated provisioning/deprovisioning

**Common Tools**: SailPoint, Saviynt, Entra ID

---

### Control 7: Continuous Vulnerability Management

**IG Level**: IG1 | **Safeguards**: 7 (IG1: 3, IG2: 6, IG3: 7)

**Purpose**: Develop process to continuously identify and remediate vulnerabilities

**Key Safeguards**:

- 7.1: Establish and maintain vulnerability management process (IG1)
- 7.2: Establish and maintain remediation process (IG1)
- 7.3: Perform automated operating system patch management (IG1)
- 7.4: Perform automated application patch management (IG1)
- 7.5: Perform automated vulnerability scans (IG2)
- 7.6: Perform automated vulnerability scans of internal networks (IG2)
- 7.7: Remediate detected vulnerabilities (IG2)

**Implementation**:

- Vulnerability scanning (authenticated, unauthenticated)
- Patch management automation
- Risk-based prioritization
- SLA-based remediation

**Common Tools**: Qualys VMDR, Tenable.io, Rapid7 InsightVM

---

### Control 8: Audit Log Management

**IG Level**: IG1 | **Safeguards**: 12 (IG1: 5, IG2: 10, IG3: 12)

**Purpose**: Collect, alert, review, and retain audit logs

**Key Safeguards**:

- 8.1: Establish and maintain audit log management process (IG1)
- 8.2: Collect audit logs (IG1)
- 8.3: Ensure adequate audit log storage (IG1)
- 8.5: Collect detailed audit logs (IG2)
- 8.6: Collect DNS query audit logs (IG2)
- 8.9: Centralize audit logs (IG2)
- 8.10: Retain audit logs (IG2)
- 8.11: Conduct audit log reviews (IG2)

**Implementation**:

- Centralized logging (SIEM)
- Log retention (1 year minimum)
- Automated alerting
- Regular log review

**Common Tools**: Splunk, Elastic Stack, Microsoft Sentinel

---

### Control 9: Email and Web Browser Protections

**IG Level**: IG1 | **Safeguards**: 7 (IG1: 4, IG2: 6, IG3: 7)

**Purpose**: Protect against attacks via email and web browsers

**Key Safeguards**:

- 9.1: Ensure use of only fully supported browsers and email clients (IG1)
- 9.2: Use DNS filtering services (IG1)
- 9.3: Maintain and enforce network-based URL filters (IG1)
- 9.4: Restrict unnecessary browser and email client extensions (IG1)
- 9.5: Implement DMARC (IG2)
- 9.6: Block unnecessary file types (IG2)
- 9.7: Deploy and maintain email server anti-malware (IG2)

**Implementation**:

- Email security gateway
- Web content filtering
- DMARC, SPF, DKIM
- Browser isolation

**Common Tools**: Proofpoint, Mimecast, Cisco Umbrella, Zscaler

---

### Control 10: Malware Defenses

**IG Level**: IG1 | **Safeguards**: 7 (IG1: 2, IG2: 5, IG3: 7)

**Purpose**: Prevent and control malware installation and execution

**Key Safeguards**:

- 10.1: Deploy and maintain anti-malware software (IG1)
- 10.2: Configure automatic anti-malware signature updates (IG1)
- 10.3: Disable autorun and autoplay (IG1)
- 10.4: Configure automatic anti-malware scanning (IG1)
- 10.5: Enable anti-exploitation features (IG2)
- 10.6: Centrally manage anti-malware software (IG2)
- 10.7: Use behavior-based anti-malware software (IG3)

**Implementation**:

- Endpoint protection platform (EPP)
- Endpoint detection and response (EDR)
- Application control
- Behavioral analysis

**Common Tools**: CrowdStrike Falcon, Microsoft Defender, SentinelOne

---

### Control 11: Data Recovery

**IG Level**: IG1 | **Safeguards**: 5 (IG1: 4, IG2: 5, IG3: 5)

**Purpose**: Establish and maintain data recovery practices

**Key Safeguards**:

- 11.1: Establish and maintain data recovery process (IG1)
- 11.2: Perform automated backups (IG1)
- 11.3: Protect recovery data (IG1)
- 11.4: Establish and maintain isolated instance of recovery data (IG1)
- 11.5: Test data recovery (IG2)

**Implementation**:

- Automated backup solution (3-2-1 rule)
- Immutable/air-gapped backups
- Regular restore testing
- Ransomware-resilient backups

**Common Tools**: Veeam, Commvault, Rubrik, AWS Backup

---

### Control 12: Network Infrastructure Management

**IG Level**: IG2 | **Safeguards**: 8 (IG1: 0, IG2: 6, IG3: 8)

**Purpose**: Establish, implement, and actively manage network devices

**Key Safeguards**:

- 12.1: Ensure network infrastructure is up-to-date (IG2)
- 12.2: Establish and maintain secure network architecture (IG2)
- 12.3: Securely manage network infrastructure (IG2)
- 12.4: Establish and maintain network architecture diagram (IG2)
- 12.6: Use secure network management protocols (IG2)
- 12.7: Ensure remote devices use VPN (IG2)
- 12.8: Establish and maintain dedicated computing for admin (IG3)

**Implementation**:

- Network segmentation (VLANs)
- Secure protocols (SSH, SNMPv3)
- Network diagram documentation
- Jump boxes for administration

**Common Tools**: Cisco ISE, Palo Alto Networks, Fortinet

---

### Control 13: Network Monitoring and Defense

**IG Level**: IG2 | **Safeguards**: 11 (IG1: 0, IG2: 8, IG3: 11)

**Purpose**: Operate processes and tooling to detect and prevent network-based attacks

**Key Safeguards**:

- 13.1: Centralize security event alerting (IG2)
- 13.2: Deploy network-based IDS (IG2)
- 13.3: Deploy network-based IPS (IG2)
- 13.4: Perform traffic filtering (IG2)
- 13.6: Collect network traffic flow logs (IG2)
- 13.8: Deploy network-based anti-malware (IG2)
- 13.10: Perform application layer filtering (IG3)
- 13.11: Tune security event alerting thresholds (IG3)

**Implementation**:

- Intrusion detection/prevention (IDS/IPS)
- Network traffic analysis (NTA)
- Next-gen firewall (NGFW)
- Security orchestration (SOAR)

**Common Tools**: Darktrace, ExtraHop, Palo Alto NGFW

---

### Control 14: Security Awareness and Skills Training

**IG Level**: IG1 | **Safeguards**: 9 (IG1: 3, IG2: 7, IG3: 9)

**Purpose**: Establish security awareness training program

**Key Safeguards**:

- 14.1: Establish and maintain security awareness program (IG1)
- 14.2: Train workforce members on secure authentication (IG1)
- 14.3: Train workforce on data handling (IG1)
- 14.4: Train workforce on identifying social engineering attacks (IG1)
- 14.5: Train workforce on authentication best practices (IG2)
- 14.6: Train workforce on identifying and reporting incidents (IG2)
- 14.9: Conduct role-specific security training (IG3)

**Implementation**:

- Annual security awareness training
- Phishing simulation campaigns
- Role-based training (developers, admins)
- Security champions program

**Common Tools**: KnowBe4, Proofpoint Security Awareness, SANS Securing The Human

---

### Control 15: Service Provider Management

**IG Level**: IG1 | **Safeguards**: 7 (IG1: 2, IG2: 5, IG3: 7)

**Purpose**: Manage security risks from service providers

**Key Safeguards**:

- 15.1: Establish and maintain inventory of service providers (IG1)
- 15.2: Establish and maintain service provider management policy (IG1)
- 15.3: Classify service providers (IG2)
- 15.4: Ensure service provider contracts include security requirements (IG2)
- 15.5: Assess service providers (IG2)
- 15.6: Monitor service providers (IG2)
- 15.7: Securely decommission service providers (IG3)

**Implementation**:

- Vendor risk management program
- Security questionnaires
- Right-to-audit clauses
- Regular vendor assessments

**Common Tools**: OneTrust, ServiceNow VRM, BitSight, SecurityScorecard

---

### Control 16: Application Software Security

**IG Level**: IG2 | **Safeguards**: 14 (IG1: 0, IG2: 10, IG3: 14)

**Purpose**: Manage security lifecycle of in-house developed and acquired software

**Key Safeguards**:

- 16.1: Establish and maintain secure application development process (IG2)
- 16.2: Establish and maintain secure software development practices (IG2)
- 16.3: Perform root cause analysis on security vulnerabilities (IG2)
- 16.5: Use up-to-date and trusted third-party components (IG2)
- 16.6: Establish and maintain SBOM (IG2)
- 16.7: Use standard hardening configuration templates (IG2)
- 16.11: Leverage vetted modules or services (IG3)
- 16.13: Conduct application penetration testing (IG3)

**Implementation**:

- Secure SDLC
- Static/dynamic application security testing (SAST/DAST)
- Software composition analysis (SCA)
- Code review and penetration testing

**Common Tools**: Veracode, Checkmarx, Snyk, OWASP ZAP

---

### Control 17: Incident Response Management

**IG Level**: IG1 | **Safeguards**: 9 (IG1: 4, IG2: 7, IG3: 9)

**Purpose**: Establish process to detect and respond to cybersecurity incidents

**Key Safeguards**:

- 17.1: Designate personnel to manage incident handling (IG1)
- 17.2: Establish and maintain contact information (IG1)
- 17.3: Establish and maintain enterprise process for reporting incidents (IG1)
- 17.4: Establish and maintain incident response process (IG1)
- 17.5: Assign key roles and responsibilities (IG2)
- 17.6: Define mechanisms for communicating during incident response (IG2)
- 17.7: Conduct routine incident response exercises (IG2)
- 17.9: Establish and maintain security incident thresholds (IG3)

**Implementation**:

- Incident response plan
- IR team (CSIRT/SOC)
- Tabletop exercises
- Playbooks for common scenarios

**Common Tools**: TheHive, Cortex XSOAR, PagerDuty, Jira

---

### Control 18: Penetration Testing

**IG Level**: IG2 | **Safeguards**: 5 (IG1: 0, IG2: 3, IG3: 5)

**Purpose**: Test security of enterprise assets through real-world attack techniques

**Key Safeguards**:

- 18.1: Establish and maintain penetration testing program (IG2)
- 18.2: Perform periodic external penetration tests (IG2)
- 18.3: Remediate penetration test findings (IG2)
- 18.4: Validate security measures (IG2)
- 18.5: Perform periodic internal penetration tests (IG3)

**Implementation**:

- Annual penetration testing (external/internal)
- Red team exercises
- Purple team exercises
- Remediation tracking

**Common Tools**: Metasploit, Cobalt Strike, Burp Suite, Core Impact

---

## Verification Checklist

For each control, verify:

1. **Policy Documentation**: Written policies and procedures exist
2. **Implementation**: Technical controls are configured and operational
3. **Evidence**: Artifacts demonstrate control effectiveness
4. **Testing**: Controls are regularly validated
5. **Metrics**: Measurement and reporting in place

## Examples

```bash
# Check Account Management (Control 5) implementation
/cis:control-check 5

# Verify Data Protection (Control 3) for IG2
/cis:control-check "Data Protection" IG2

# Assess Incident Response Management
/cis:control-check 17 IG1

# Review all Malware Defenses safeguards
/cis:control-check "Malware Defenses" IG3
```
