---
description: List applicable CIS Controls v8 safeguards by Implementation Group
---

> _CIS Controls v8 content used under CC BY-SA 4.0 from the Center for Internet Security. This command's CIS-derived content is CC BY-SA 4.0. See [LICENSE-CIS.md](../LICENSE-CIS.md)._

# CIS Controls Safeguard List

Provides comprehensive listing of CIS Controls v8 safeguards organized by Implementation Group (IG1, IG2, IG3).

## Arguments

- Argument 1 - Implementation Group (required: IG1, IG2, or IG3)
- Argument 2 - Control filter (optional: control number 1-18 or "all")

## Safeguard Distribution

| Implementation Group | Total Safeguards | Incremental | Cumulative |
|---------------------|------------------|-------------|------------|
| **IG1** | 56 | 56 new | 56 total |
| **IG2** | 72 additional | 72 new | 128 total |
| **IG3** | 25 additional | 25 new | 153 total |

## IG1 - Essential Cyber Hygiene (56 Safeguards)

### Foundational Controls

These 56 safeguards represent the minimum baseline for cybersecurity. All organizations should implement IG1 regardless of size or industry.

**Controls Introduced at IG1**:

- Control 1: Inventory and Control of Enterprise Assets (5 safeguards)
- Control 2: Inventory and Control of Software Assets (4 safeguards)
- Control 3: Data Protection (3 safeguards)
- Control 4: Secure Configuration (5 safeguards)
- Control 5: Account Management (4 safeguards)
- Control 6: Access Control Management (3 safeguards)
- Control 7: Continuous Vulnerability Management (3 safeguards)
- Control 8: Audit Log Management (5 safeguards)
- Control 9: Email and Web Browser Protections (4 safeguards)
- Control 10: Malware Defenses (2 safeguards)
- Control 11: Data Recovery (4 safeguards)
- Control 14: Security Awareness and Skills Training (3 safeguards)
- Control 15: Service Provider Management (2 safeguards)
- Control 17: Incident Response Management (4 safeguards)

**Key IG1 Safeguards** (High Priority):

**1.1** - Establish and Maintain Detailed Enterprise Asset Inventory

- Track all hardware assets
- Include workstations, servers, network devices, IoT
- Document owner, location, function

**2.1** - Establish and Maintain Software Inventory

- Track all authorized software
- Include applications, operating systems, firmware
- Version tracking and support status

**3.1** - Establish and Maintain Data Management Process

- Data handling procedures
- Classification guidelines
- Retention and disposal

**4.1** - Establish and Maintain Secure Configuration Process

- Configuration baselines
- Hardening standards (CIS Benchmarks)
- Change control

**5.1** - Establish and Maintain Inventory of Accounts

- All user and service accounts
- Privileged account tracking
- Regular review process

**5.3** - Disable Dormant Accounts

- Identify inactive accounts (45-90 days)
- Automated detection
- Disable or delete process

**5.4** - Restrict Administrator Privileges to Dedicated Accounts

- Separate admin and user accounts
- Privileged access management
- Principle of least privilege

**6.1** - Establish Access Granting Process

- Formal access request/approval
- Manager authorization
- Documentation

**6.2** - Establish Access Revoking Process

- Termination procedures
- Role change procedures
- Regular access reviews

**7.1** - Establish and Maintain Vulnerability Management Process

- Scanning schedule
- Prioritization criteria
- Remediation SLAs

**7.3** - Perform Automated Operating System Patch Management

- Automated OS patching
- Critical patches within 30 days
- Regular patch cycles

**8.2** - Collect Audit Logs

- System and application logs
- Authentication events
- Administrative actions

**9.2** - Use DNS Filtering Services

- Block malicious domains
- Threat intelligence feeds
- Real-time protection

**10.1** - Deploy and Maintain Anti-Malware Software

- All endpoints protected
- Real-time scanning
- Centrally managed

**11.2** - Perform Automated Backups

- Automated backup schedule
- Critical data identified
- 3-2-1 backup rule

**11.3** - Protect Recovery Data

- Backup encryption
- Access controls
- Offsite/offline storage

**14.1** - Establish and Maintain Security Awareness Program

- Annual training
- Phishing awareness
- Policy acknowledgment

**17.1** - Designate Personnel to Manage Incident Handling

- Incident response team
- Clear roles and responsibilities
- 24/7 contact information

## IG2 - Enterprise Security (Additional 72 Safeguards, 128 Total)

### Enterprise-Grade Controls

IG2 adds 72 safeguards for organizations with dedicated IT staff and moderate risk profiles.

**New Controls at IG2**:

- Control 12: Network Infrastructure Management (6 safeguards at IG2)
- Control 13: Network Monitoring and Defense (8 safeguards at IG2)
- Control 16: Application Software Security (10 safeguards at IG2)
- Control 18: Penetration Testing (3 safeguards at IG2)

**Expanded Controls at IG2**:

- Control 2: +2 safeguards (software allowlisting)
- Control 3: +8 safeguards (encryption, classification)
- Control 4: +5 safeguards (DMZ, hardening)
- Control 5: +2 safeguards (MFA, centralized management)
- Control 6: +3 safeguards (RBAC, centralized access)
- Control 7: +3 safeguards (automated scanning, remediation)
- Control 8: +5 safeguards (centralized logs, retention)
- Control 9: +2 safeguards (DMARC, file blocking)
- Control 10: +3 safeguards (centralized AV, anti-exploit)
- Control 11: +1 safeguard (backup testing)
- Control 14: +4 safeguards (advanced training)
- Control 15: +3 safeguards (vendor assessments)
- Control 17: +3 safeguards (IR exercises, playbooks)

**Key IG2 Safeguards** (High Value):

**3.6** - Encrypt Data on End-User Devices

- Full disk encryption (BitLocker, FileVault)
- Mobile device encryption
- Encryption key management

**3.10** - Encrypt Sensitive Data in Transit

- TLS 1.2+ for web traffic
- VPN for remote access
- Email encryption (S/MIME, PGP)

**3.11** - Encrypt Sensitive Data at Rest

- Database encryption
- File/folder encryption
- Cloud storage encryption

**5.5** - Establish and Maintain MFA

- MFA for all users (phishing-resistant preferred)
- Admin access requires MFA
- Remote access requires MFA

**5.6** - Centralize Account Management

- Single sign-on (SSO)
- Identity provider (IdP)
- Directory services integration

**7.5** - Perform Automated Vulnerability Scans of Internal Enterprise Assets

- Weekly authenticated scans
- Network and host-based
- Credentialed scanning

**8.9** - Centralize Audit Logs

- SIEM or log aggregation
- Minimum 90-day retention
- Correlation and alerting

**8.11** - Conduct Audit Log Reviews

- Regular log review (weekly/monthly)
- Anomaly detection
- Incident investigation

**12.2** - Establish and Maintain Secure Network Architecture

- Network segmentation
- DMZ for internet-facing systems
- VLANs for asset separation

**12.4** - Establish and Maintain Network Architecture Diagram

- Current network topology
- Security zones documented
- Data flows mapped

**13.1** - Centralize Security Event Alerting

- SIEM alerting
- SOC or monitoring service
- Incident escalation

**13.2** - Deploy Network-Based IDS

- Intrusion detection system
- Signature and anomaly-based
- Critical network segments

**13.3** - Deploy Network-Based IPS

- Intrusion prevention system
- Inline blocking
- Tuned to environment

**16.1** - Establish and Maintain Secure Application Development Process

- Secure SDLC
- Security requirements
- Code review process

**16.2** - Establish and Maintain Secure Software Development Practices

- Secure coding standards (OWASP)
- Developer training
- Security testing integration

**16.6** - Establish and Maintain SBOM

- Software bill of materials
- Dependency tracking
- Vulnerability monitoring

**18.1** - Establish and Maintain Penetration Testing Program

- Annual external pentest
- Qualified testers
- Remediation tracking

**18.2** - Perform Periodic External Penetration Tests

- Annual minimum
- Scope: internet-facing assets
- Realistic attack simulation

## IG3 - Advanced Security (Additional 25 Safeguards, 153 Total)

### Advanced Threat Defense

IG3 adds 25 safeguards for organizations facing sophisticated adversaries and managing high-value assets.

**Expanded Controls at IG3**:

- Control 1: +0 safeguards (same as IG2)
- Control 2: +1 safeguard (script allowlisting)
- Control 3: +3 safeguards (advanced data controls)
- Control 4: +2 safeguards (secure admin workstations)
- Control 7: +1 safeguard (advanced remediation)
- Control 8: +2 safeguards (advanced logging)
- Control 9: +1 safeguard (advanced email protection)
- Control 10: +2 safeguards (behavioral analysis)
- Control 12: +2 safeguards (dedicated admin systems)
- Control 13: +3 safeguards (advanced monitoring)
- Control 14: +2 safeguards (role-specific training)
- Control 15: +2 safeguards (vendor decommissioning)
- Control 16: +4 safeguards (advanced AppSec)
- Control 17: +2 safeguards (advanced IR)
- Control 18: +2 safeguards (internal pentesting)

**Key IG3 Safeguards** (Advanced Capabilities):

**2.7** - Allowlist Authorized Scripts

- PowerShell, Python, Bash script control
- Code signing requirements
- Script execution policies

**3.12** - Segment Data Processing and Storage Based on Sensitivity

- Data segmentation by classification
- Network isolation for sensitive data
- Access restrictions by segment

**3.13** - Deploy a Data Loss Prevention Solution

- DLP for email, web, endpoints
- Data exfiltration prevention
- Policy-based blocking

**3.14** - Log Sensitive Data Access

- Access logging for sensitive data
- User activity monitoring
- Privilege escalation detection

**4.11** - Enforce Remote Access Using Multi-Factor Authentication

- Hardware tokens or biometrics
- FIDO2/WebAuthn preferred
- Phishing-resistant MFA

**7.7** - Remediate Detected Vulnerabilities

- Risk-based prioritization (CVSS, EPSS)
- Critical: 15 days, High: 30 days
- Compensating controls documented

**8.12** - Collect Service Provider Logs

- Cloud provider logs (AWS CloudTrail, Azure Monitor)
- SaaS application logs
- Integration with SIEM

**10.7** - Use Behavior-Based Anti-Malware Software

- EDR with behavioral analysis
- Machine learning detection
- Automated response

**12.8** - Establish and Maintain Dedicated Computing Resources for Admins

- Privileged Access Workstations (PAWs)
- Jump boxes for administration
- Isolated from general network

**13.10** - Perform Application Layer Filtering

- Web application firewall (WAF)
- API gateway security
- OWASP Top 10 protection

**13.11** - Tune Security Event Alerting Thresholds

- Alert tuning to reduce false positives
- Continuous improvement
- Threat hunting integration

**14.9** - Conduct Role-Specific Security Training

- Developer secure coding
- Admin hardening training
- Executive awareness

**16.11** - Leverage Vetted Modules or Services for Application Security

- Proven security libraries
- Vendor security assessments
- Supply chain security

**16.13** - Conduct Application Penetration Testing

- Annual application pentesting
- Pre-production security testing
- Remediation before deployment

**16.14** - Conduct Threat Modeling

- Architecture risk analysis
- Attack surface mapping
- Design phase security review

**17.8** - Conduct Post-Incident Reviews

- Lessons learned sessions
- Root cause analysis
- Process improvements

**17.9** - Establish and Maintain Security Incident Thresholds

- Incident severity ratings
- Escalation criteria
- Response time SLAs

**18.4** - Validate Security Measures

- Adversary emulation
- Purple team exercises
- Control validation

**18.5** - Perform Periodic Internal Penetration Tests

- Annual internal pentesting
- Assume breach scenarios
- Lateral movement testing

## Safeguard Prioritization

### Quick Wins (High Impact, Low Effort)

- 1.1: Asset inventory
- 2.1: Software inventory
- 5.3: Disable dormant accounts
- 7.3: Automated OS patching
- 10.1: Anti-malware deployment
- 14.1: Security awareness training

### Foundational (Critical Infrastructure)

- 4.1: Secure configurations
- 5.1: Account inventory
- 6.1/6.2: Access processes
- 8.2: Audit logging
- 11.2/11.3: Backups and protection
- 17.1: Incident response team

### Advanced (Risk Reduction)

- 5.5: Multi-factor authentication
- 7.5: Vulnerability scanning
- 8.9: Centralized logging
- 12.2: Network segmentation
- 13.2/13.3: IDS/IPS
- 16.1: Secure SDLC

### Specialized (Threat Defense)

- 10.7: Behavioral anti-malware
- 13.11: Alert tuning
- 16.13: Application pentesting
- 18.5: Internal pentesting

## Implementation Timeline by IG

**IG1 Timeline** (56 safeguards):

- Months 1-3: Inventory, backups, basic protections
- Months 4-6: Access controls, patching, awareness
- Months 7-9: Logging, configuration management
- Months 10-12: Refinement, documentation, testing

**IG2 Timeline** (additional 72 safeguards):

- Months 1-6: Encryption, MFA, centralized management
- Months 7-12: SIEM, IDS/IPS, network architecture
- Months 13-18: Vulnerability management, secure development
- Months 19-24: Penetration testing, continuous improvement

**IG3 Timeline** (additional 25 safeguards):

- Months 1-6: Behavioral detection, DLP, advanced monitoring
- Months 7-12: PAWs, advanced testing, threat modeling
- Months 13-18: Purple team, incident maturity
- Months 19-24+: Continuous optimization, threat hunting

## Examples

```bash
# List all IG1 safeguards (56 total)
/cis:safeguard-list IG1

# Show IG2 safeguards for Control 8 (Audit Logs)
/cis:safeguard-list IG2 8

# Display all IG3 safeguards (153 total)
/cis:safeguard-list IG3 all

# Review IG2 safeguards for Account Management
/cis:safeguard-list IG2 5
```
