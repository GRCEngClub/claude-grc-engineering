---
name: essential8-expert
description: Essential 8 expert for Australian cyber security. Deep knowledge of ACSC Essential Eight mitigation strategies including 8 strategies, 3 maturity levels, implementation guidance, and Australian government requirements.
allowed-tools: Read, Glob, Grep, Write
---

# Essential 8 Expert

Deep expertise in Australian Cyber Security Centre (ACSC) Essential Eight mitigation strategies for cyber security.

## Expertise Areas

### Essential Eight Overview

**Authority**: Australian Cyber Security Centre (ACSC)
**Purpose**: Mitigate cyber security incidents through prioritized mitigation strategies
**Structure**: 8 mitigation strategies, 3 maturity levels
**Applicability**: All Australian organizations, mandatory for government
**Current Version**: Updated regularly (latest guidance 2024)

**Key Principles**:

- Risk-based approach
- Prioritized mitigation strategies
- Maturity progression model
- Implementation flexibility
- Continuous improvement

**Background**:

- Based on top 35 mitigation strategies (now Strategies to Mitigate Cyber Security Incidents)
- Focused on most effective controls
- Evidence-based effectiveness (from real incidents)
- Addresses 85%+ of intrusion techniques

### Maturity Levels

| Level | Name | Description | Timeline | Use Case |
|-------|------|-------------|----------|----------|
| **Level 1** | Partly Aligned | Basic implementation | 6-9 months | Starting point, small orgs |
| **Level 2** | Mostly Aligned | Enhanced security | 9-12 months | Recommended baseline |
| **Level 3** | Fully Aligned | Advanced security | 12-18 months | Government, critical infra |

**Maturity Level 1 (Partly Aligned)**:

- **Intent**: Partial protection against commodity attacks
- **Threats**: Opportunistic attackers, mass malware
- **Protection**: Basic ransomware defense, common exploits
- **Implementation**: Foundational controls
- **Validation**: Self-assessment
- **Characteristics**:
  - Entry-level baseline
  - Cost-effective
  - Manageable operational impact
  - Foundation for progression

**Maturity Level 2 (Mostly Aligned)**:

- **Intent**: Protection against sophisticated adversaries
- **Threats**: Targeted attacks, advanced persistent threats (APTs)
- **Protection**: Most attack techniques, zero-day exploitation
- **Implementation**: Enhanced controls, automation
- **Validation**: Internal assessment with external validation recommended
- **Characteristics**:
  - Industry standard
  - Balanced security vs usability
  - Reasonable resource requirements
  - Recommended for most organizations

**Maturity Level 3 (Fully Aligned)**:

- **Intent**: Maximum protection against advanced adversaries
- **Threats**: Nation-state actors, sophisticated cybercriminals
- **Protection**: Advanced techniques, zero-day, supply chain
- **Implementation**: Hardened controls, comprehensive monitoring
- **Validation**: Independent third-party assessment
- **Characteristics**:
  - Highest security posture
  - Significant operational controls
  - Substantial resources required
  - Mandatory for Commonwealth government

---

## The 8 Mitigation Strategies

### Strategy 1: Application Control

**Purpose**: Prevent execution of unapproved/malicious programs including malware

**Risk Addressed**:

- Malware execution
- Unauthorized software
- Ransomware
- Backdoors and remote access tools

**Implementation Approach**:

- Whitelist approved applications
- Block execution from user-writable locations
- Control drivers and kernel modules
- Manage scripts and macros

#### Maturity Level 1 Requirements

**Workstation Controls**:

- Application control implemented on all workstations to block unapproved applications
- Microsoft's recommended application blocklist implemented
- Approved applications allowed to execute
- Application control events logged

**Technical Implementation**:

- **Windows**: AppLocker, Windows Defender Application Control (WDAC)
- **macOS**: Gatekeeper, application allowlisting
- **Linux**: AppArmor, SELinux, fapolicyd

**Allowed Execution**:

- Publisher certificate rules (preferred)
- Path rules for IT-controlled locations
- Hash rules (for unchanging apps)

**Blocked Execution**:

- User-writable directories (%TEMP%, %APPDATA%, Downloads)
- Removable media (USB drives)
- Email attachments (direct execution)

**Logging**:

- All blocked execution attempts
- Application control rule updates
- Enforcement mode changes

#### Maturity Level 2 Requirements

**Server Controls**:

- Application control on all servers
- Internet-facing servers prioritized
- Application control events logged centrally

**Driver/Script Controls**:

- Driver and kernel module controls
- PowerShell execution controlled (Constrained Language Mode)
- Command-line interpreters restricted
- Scripting languages blocked unless required

**Technical Additions**:

- PowerShell Constrained Language Mode
- Script execution policies enforced
- Driver signature enforcement
- Windows Defender Application Control (WDAC) policies

**Centralization**:

- Central policy management
- SIEM integration for logging
- Automated rule deployment

#### Maturity Level 3 Requirements

**Validation and Hardening**:

- Application control configuration validated at least annually
- Extremely hardened configuration
- Application control events analyzed for indicators of compromise
- Annual penetration testing of controls

**Advanced Capabilities**:

- Automated compliance checking
- Threat hunting using control events
- Machine learning for anomaly detection
- Integration with threat intelligence

**Testing**:

- Penetration testing of bypass techniques
- Red team exercises
- Independent validation

---

### Strategy 2: Patch Applications

**Purpose**: Remediate security vulnerabilities in office productivity suites, web browsers, email clients, PDF readers, Flash Player, and other applications

**Risk Addressed**:

- Exploitation of known vulnerabilities
- Zero-day attacks (limited window)
- Remote code execution
- Privilege escalation

**Critical Applications** (Prioritize):

- Web browsers (Chrome, Edge, Firefox, Safari)
- Office productivity (Microsoft Office, LibreOffice)
- PDF readers (Adobe Acrobat, alternative readers)
- Email clients
- Java (if required)
- Adobe Flash Player (deprecated, remove)
- Media players
- Compression tools

#### Maturity Level 1 Requirements

**Patching Timeline**:

- Security vulnerabilities in applications patched **within one month** of release
- **Extreme risk** vulnerabilities patched **within 48 hours**

**Extreme Risk Definition**:

- CVSS base score 9.0-10.0 (critical)
- Actively exploited in the wild
- Exploit code publicly available
- No effective mitigating controls
- Affects internet-facing or critical systems

**Prioritization**:

1. Internet-facing applications
2. Applications processing untrusted data
3. Privileged applications
4. All other applications

**Process**:

- Maintain application inventory
- Subscribe to vendor security advisories
- Assess vulnerability severity (CVSS scoring)
- Test patches in non-production
- Deploy patches within timeline
- Verify successful installation
- Document exceptions and risk acceptance

#### Maturity Level 2 Requirements

**Accelerated Timeline**:

- Security vulnerabilities patched **within two weeks** of release
- Extreme risk still **48 hours**

**Automation**:

- Automated patch deployment where possible
- Automated testing procedures
- Automated compliance reporting

**Enhancements**:

- Reduced testing cycle
- Staged deployment
- Enhanced monitoring for failures
- Metrics tracking (mean time to patch)

#### Maturity Level 3 Requirements

**Rapid Timeline**:

- All vulnerabilities patched **within 48 hours** of release

**Comprehensive Automation**:

- Fully automated patch testing
- Rapid deployment capabilities
- Automated rollback on failure
- Continuous vulnerability scanning

**Advanced Capabilities**:

- Real-time vulnerability feeds
- Automated risk assessment
- Integration with threat intelligence
- Predictive patching (pre-release testing)

---

### Strategy 3: Configure Microsoft Office Macro Settings

**Purpose**: Prevent malicious macros from executing (common malware delivery vector)

**Risk Addressed**:

- Macro-based malware (Emotet, Qbot, etc.)
- Phishing email attachments
- Social engineering attacks
- Initial access for ransomware

**Context**:

- Macros are a primary malware delivery mechanism
- Often delivered via email attachments
- Social engineering convinces users to enable
- Can disable security controls, download payloads

#### Maturity Level 1 Requirements

**Macro Restrictions**:

- Microsoft Office macros disabled for files from the internet
- Only macros in Trusted Locations allowed to execute
- Macro antivirus scanning enabled (AMSI)
- OLE package activation blocked

**Technical Implementation**:

- Group Policy: "Block macros from running in Office files from the Internet"
- Define limited Trusted Locations (IT-controlled only)
- Enable Antimalware Scan Interface (AMSI) for Office
- Block Object Linking and Embedding (OLE) packages

**Trusted Locations**:

- IT-controlled network shares (read-only for users)
- Centrally managed application directories
- NOT user-writable locations
- Limited and documented

**User Education**:

- Why macros are blocked
- How to request macro-enabled document approval
- Recognizing malicious macro prompts
- Reporting suspicious emails

#### Maturity Level 2 Requirements

**Enhanced Validation**:

- Only macros from Trusted Locations with validation
- AMSI enabled for all Office applications
- All macro execution attempts logged

**Technical Additions**:

- Macro validation before execution
- Central logging of macro events
- Regular review of Trusted Locations
- Attestation process for macro requirements

#### Maturity Level 3 Requirements

**Comprehensive Controls**:

- Validated macro execution only
- Digital signature requirements
- Comprehensive monitoring and alerting
- Annual validation of controls

**Advanced Protection**:

- Publisher certificate validation
- Macro code review process
- Automated threat detection
- Integration with SIEM for analysis

---

### Strategy 4: User Application Hardening

**Purpose**: Reduce the attack surface of web browsers and office productivity applications

**Risk Addressed**:

- Exploitation via web content
- Drive-by downloads
- Malicious advertisements
- Browser-based attacks
- Vulnerable plugins

**Applications in Scope**:

- Web browsers (all)
- Microsoft Office suite
- PDF readers
- Email clients
- Other productivity applications

#### Maturity Level 1 Requirements

**Web Browser Hardening**:

- Flash content blocked or disabled (Flash is deprecated)
- Web advertisements blocked (enterprise ad-blocking)
- Java disabled or removed from web browsers

**PDF Reader Hardening**:

- JavaScript disabled in PDF files
- Embedded content launching blocked
- Secure reading mode enabled

**Office Application Hardening**:

- Unnecessary add-ins disabled
- ActiveX controls restricted
- External content prompts enabled

**Technical Implementation**:

- Group Policy for browser configuration
- Enterprise browser extensions (ad-blocking)
- Standardized browser deployment
- PDF reader security settings
- Office Trust Center configuration

**Recommended Browsers**:

- Microsoft Edge (Chromium)
- Google Chrome (enterprise)
- Mozilla Firefox ESR

**Deprecated/Removed**:

- Internet Explorer (unsupported)
- Adobe Flash Player (end-of-life 2020)
- Java browser plugins

#### Maturity Level 2 Requirements

**Enhanced Hardening**:

- Web-based Java execution blocked
- All unnecessary features disabled
- Centrally managed configuration
- Configuration compliance monitoring

**Additional Controls**:

- Safe Browsing enabled
- Password managers (enterprise)
- Credential Guard enabled
- Application Guard (where applicable)

#### Maturity Level 3 Requirements

**Comprehensive Validation**:

- Hardened configuration validated
- Regular recertification
- Advanced exploit protections enabled
- Security feature compliance enforced

**Advanced Protections**:

- Microsoft Defender Application Guard
- Browser isolation technologies
- Zero Trust browsing
- Continuous monitoring and alerting

---

### Strategy 5: Restrict Administrative Privileges

**Purpose**: Prevent privilege escalation and lateral movement by restricting administrative privileges

**Risk Addressed**:

- Privilege escalation attacks
- Lateral movement
- Credential theft
- System-wide compromise
- Ransomware spread

**Context**:

- Most users don't need admin rights
- Admin credentials are high-value targets
- Malware with admin rights can disable security
- Lateral movement requires privileged access

#### Maturity Level 1 Requirements

**Privilege Separation**:

- Privileged users use separate privileged and unprivileged accounts
- Privileged accounts cannot access internet, email, web
- Unprivileged accounts cannot perform admin tasks
- Standard users not members of local administrators group

**Technical Implementation**:

- Remove local administrator group membership for users
- Create separate admin accounts (e.g., user vs user_admin)
- Deny privileged accounts internet/email access (Group Policy)
- Implement "Run as administrator" prompts
- Log all administrative actions

**Privileged Account Usage**:

- Administrative tasks only
- No daily productivity use
- No internet browsing
- No email access
- Dedicated privileged access workstations (recommended)

**Logging**:

- All privileged account logons
- Administrative action audit logs
- Privileged account usage monitoring

#### Maturity Level 2 Requirements

**Enhanced Controls**:

- Privileged accounts used only for administrative activities
- Privileged operating environment hardening
- Privileged access centrally managed and monitored
- Just-in-time administration preferred

**Technical Additions**:

- Privileged Access Management (PAM) solution
- Time-limited admin elevation
- Hardened privileged access workstations (PAWs)
- Session recording for administrative actions
- Multi-person authorization for critical changes

**PAM Solutions**:

- Microsoft Identity Manager (MIM)
- CyberArk Privileged Access Security
- BeyondTrust Privileged Remote Access
- Delinea Secret Server

**Privileged Workstation Hardening**:

- Dedicated hardware or VMs
- No internet/email access
- Enhanced monitoring
- Limited software installation
- Multi-factor authentication required

#### Maturity Level 3 Requirements

**Maximum Restriction**:

- Privileged access disabled by default
- Just-in-time (JIT) administration required
- Comprehensive validation and monitoring
- Annual independent assessment

**Advanced Capabilities**:

- Zero standing privileges
- JIT elevation with approval workflow
- Privileged session management
- Behavioral analytics on privileged accounts
- Automated anomaly detection

**JIT Implementation**:

- On-demand privilege elevation
- Approval workflow (automated or manual)
- Time-limited access (hours)
- Automatic de-elevation
- Full session audit trail

---

### Strategy 6: Patch Operating Systems

**Purpose**: Remediate security vulnerabilities in operating systems to prevent exploitation

**Risk Addressed**:

- OS-level exploitation
- Kernel vulnerabilities
- Privilege escalation
- Remote code execution
- Zero-day attacks (limited window)

**Operating Systems in Scope**:

- Windows (Desktop, Server)
- Linux (all distributions)
- macOS
- Mobile operating systems (iOS, Android)
- Network device firmware
- Hypervisors

#### Maturity Level 1 Requirements

**Patching Timeline**:

- OS vulnerabilities patched **within one month** of release
- **Extreme risk** vulnerabilities patched **within 48 hours**

**Prioritization**:

1. Internet-facing systems
2. Critical infrastructure
3. Servers
4. Workstations
5. Network devices

**Process**:

- Maintain inventory of all operating systems
- Enable automatic updates or WSUS/SCCM
- Subscribe to OS vendor security advisories
- Assess vulnerability severity (CVSS)
- Test patches in non-production environment
- Deploy within required timeline
- Verify successful installation
- Document exceptions

**Vendor Advisories**:

- Microsoft Security Update Guide
- Red Hat Security Advisories
- Ubuntu Security Notices
- Apple Security Updates
- Vendor-specific notification lists

**Unsupported OS**:

- Windows 7, Server 2008 (end-of-life)
- Plan migration to supported versions
- Isolate if migration not possible
- Compensating controls required

#### Maturity Level 2 Requirements

**Accelerated Timeline**:

- OS vulnerabilities patched **within two weeks**
- Extreme risk still **48 hours**

**Automation**:

- Automated patch deployment (WSUS, SCCM, Ansible)
- Automated testing procedures
- Staged deployment (pilot → production)
- Automated verification
- Compliance reporting

**Enhancements**:

- Reduced testing window
- Pre-approved maintenance windows
- Enhanced rollback procedures
- Metrics and KPIs (MTTP - Mean Time To Patch)

#### Maturity Level 3 Requirements

**Rapid Timeline**:

- All OS vulnerabilities patched **within 48 hours**

**Comprehensive Automation**:

- Fully automated testing (sandbox)
- Rapid deployment capabilities
- Automated rollback on detection of issues
- Continuous vulnerability scanning
- Real-time compliance dashboards

**Advanced Capabilities**:

- Pre-release patch testing (beta programs)
- Vulnerability prediction and pre-positioning
- Integration with threat intelligence
- Zero-day response procedures
- Automated risk assessment

---

### Strategy 7: Multi-Factor Authentication

**Purpose**: Prevent unauthorized access using compromised credentials

**Risk Addressed**:

- Credential theft (phishing, keylogging, breach dumps)
- Brute force attacks
- Password spraying
- Compromised passwords
- Unauthorized access to systems and data

**Context**:

- Passwords alone are insufficient
- Phishing is extremely effective
- Credential stuffing attacks common
- MFA significantly reduces risk

#### Maturity Level 1 Requirements

**MFA Scope**:

- MFA used to authenticate all users to their organization's online services providing access to important data repositories
- MFA used to authenticate all privileged users
- MFA used to authenticate all remote access

**Important Data Repositories**:

- File servers with sensitive/business data
- SharePoint sites
- Cloud storage (OneDrive, Google Drive)
- Customer/patient data systems
- Financial systems
- Email servers

**Privileged Users**:

- Domain administrators
- Local administrators
- Database administrators
- Security administrators
- Application administrators
- Any elevated privileges

**Remote Access**:

- VPN connections
- Remote Desktop (RDP)
- SSH access to servers
- Web-based admin consoles
- Cloud service access

**Acceptable MFA Methods**:

- Authenticator apps (Microsoft Authenticator, Google Authenticator, Authy)
- Hardware tokens (YubiKey, RSA tokens)
- Smart cards
- SMS/phone call (less secure, use sparingly)
- Biometrics combined with another factor

**Technical Implementation**:

- Entra ID multifactor authentication (Microsoft 365)
- Duo Security
- Okta Verify
- RSA SecurID
- Google Authenticator
- FIDO2 security keys

**User Enrollment**:

- Mandatory MFA enrollment
- Multiple backup methods
- Self-service enrollment portals
- Help desk support for issues
- User training on MFA

#### Maturity Level 2 Requirements

**Extended Scope**:

- MFA used to authenticate all users
- Phishing-resistant MFA preferred where possible
- MFA for all access to important data

**All Users**:

- Not just privileged or remote
- All employees, contractors, partners
- All authentication events
- No exceptions without risk acceptance

**Phishing-Resistant MFA (Preferred)**:

- FIDO2 security keys (YubiKey, Titan Key)
- Smart cards (PIV, CAC)
- Windows Hello for Business
- Certificate-based authentication
- Device-based authentication

**Technical Enhancements**:

- Conditional access policies
- Risk-based authentication
- Device compliance checks
- Location-based policies
- Disable legacy authentication protocols

**Exception Management**:

- Documented exceptions
- Risk acceptance by management
- Compensating controls
- Regular review of exceptions

#### Maturity Level 3 Requirements

**Mandatory Phishing-Resistant MFA**:

- Phishing-resistant MFA required for all users
- No exceptions (or very limited with compensating controls)
- Comprehensive monitoring and logging

**Phishing-Resistant Only**:

- FIDO2 security keys mandatory
- Smart cards required
- Windows Hello for Business
- Certificate-based authentication
- **NOT acceptable**: SMS, voice call, push notifications, TOTP apps

**Rationale for Phishing-Resistant**:

- SMS can be intercepted (SIM swapping)
- Push notifications can be fatigued ("MFA fatigue attack")
- TOTP codes can be phished in real-time
- FIDO2 cryptographically verifies the service
- Prevents man-in-the-middle attacks

**Implementation Considerations**:

- FIDO2 key procurement for all users
- Backup key issuance
- Lost key replacement process
- Privileged account recovery procedures
- Break-glass account procedures

**Advanced Capabilities**:

- Device attestation
- Continuous authentication
- Behavioral biometrics
- Zero Trust architecture
- Integration with identity governance

---

### Strategy 8: Regular Backups

**Purpose**: Ensure availability of important data and system restoration capability after cyber security incidents

**Risk Addressed**:

- Ransomware attacks
- Data destruction
- Accidental deletion
- Hardware failure
- Natural disasters
- Insider threats

**Context**:

- Backups are the last line of defense
- Ransomware specifically targets backups
- Recovery depends on backup integrity
- Testing is critical - untested backups fail

#### Maturity Level 1 Requirements

**Backup Scope**:

- Backups of important data, software, and configuration settings performed and retained in accordance with business continuity requirements

**Minimum Requirements**:

- Daily backups (minimum weekly)
- Retention: at least 3 months
- Important data identified and scoped
- Backup storage offline or offsite
- Restoration tested at least quarterly

**Important Data Definition**:

- Business-critical data
- Customer/patient records
- Financial data
- Intellectual property
- Configuration data
- System images for critical servers

**3-2-1 Backup Rule**:

- **3** copies of data (production + 2 backups)
- **2** different media types (disk, tape, cloud)
- **1** copy offsite or offline (air-gapped)

**Offline/Offsite Storage**:

- Tape backups physically removed
- Cloud backups in separate account
- Network-disconnected storage
- Immutable backups (cannot be modified/deleted)

**Restoration Testing**:

- Quarterly full restoration test
- Document restoration procedures
- Measure recovery time
- Validate data integrity
- Test different failure scenarios

**Technical Implementation**:

- Veeam Backup & Replication
- Azure Backup
- AWS Backup
- Acronis Cyber Backup
- Commvault
- Native tools (Windows Backup, Time Machine)

#### Maturity Level 2 Requirements

**Enhanced Protection**:

- Backups disconnected from networks when not being performed
- Backup processes improved through automation
- More frequent restoration testing

**Air-Gapped Backups**:

- Network segmentation for backup infrastructure
- Automated connect/disconnect procedures
- Separate administrative credentials
- No persistent network connectivity

**Immutable Backups**:

- Write-once-read-many (WORM) storage
- Cloud immutability features (Azure, AWS)
- Legal hold/retention lock
- Cannot be deleted by ransomware

**Automation**:

- Automated backup verification
- Automated restore testing
- Backup job monitoring and alerting
- Automated failover procedures

**Testing Frequency**:

- Monthly restoration testing (instead of quarterly)
- Different data sets each test
- Varied failure scenarios
- Tabletop exercises

**Privileged Access Controls**:

- Separate admin accounts for backups
- MFA for backup administration
- Logging of all backup access
- Least privilege access model

#### Maturity Level 3 Requirements

**Comprehensive Protection**:

- Unprivileged accounts cannot access backups
- Privileged accounts required, MFA enforced
- Backups tested annually in a full disaster recovery scenario
- Comprehensive automation and monitoring

**Hardened Backup Environment**:

- Fully isolated backup infrastructure
- Separate domain/forest for backup admins
- Hardened backup servers
- Network segmentation enforced
- Monitoring and alerting (SIEM integration)

**Full Disaster Recovery Testing**:

- Annual DR exercise
- Complete system restoration
- Alternate site failover
- Business continuity integration
- Lessons learned and improvements

**Advanced Capabilities**:

- Automated backup integrity checking
- Malware scanning of backups
- Versioning and point-in-time recovery
- Rapid recovery capabilities (instant VM recovery)
- Geo-redundant backups

**Backup Security**:

- Encryption at rest and in transit
- Key management (separate from backup system)
- Access auditing and alerting
- Behavioral analytics on backup access
- Threat detection in backup environment

---

## Australian Government Requirements

### Non-Corporate Commonwealth Entities (NCEs)

**Mandatory Requirements**:

- Must implement Essential Eight at **Maturity Level 3**
- Annual self-assessment required
- Report to Attorney-General's Department
- Published in annual cyber security posture report

**Entities Included**:

- Commonwealth departments
- Executive agencies
- Statutory authorities (non-corporate)
- Parliamentary departments

**Compliance**:

- Protective Security Policy Framework (PSPF) Policy 10
- ISM (Information Security Manual) controls
- ACSC guidance mandatory
- Annual attestation by Agency Head

### Corporate Commonwealth Entities (CCEs)

**Requirements**:

- Must implement Essential Eight (maturity level based on risk)
- Risk assessment determines target maturity level
- Governance and reporting through entity boards
- Cyber security strategy required

**Risk-Based Approach**:

- Risk assessment methodology
- Maturity level selection justified
- Board oversight and approval
- Regular reassessment

### State and Territory Government

**Variability**:

- Requirements vary by jurisdiction
- Many have Essential Eight mandates
- Maturity levels differ (typically ML2 or ML3)
- Check specific state policies

**Examples**:

- **NSW**: Essential Eight compliance required, ML varies
- **Victoria**: Mandatory for some agencies
- **Queensland**: Risk-based approach
- **WA, SA, TAS, NT, ACT**: Varying requirements

### Critical Infrastructure

**Security of Critical Infrastructure (SOCI) Act 2018**:

- Enhanced cyber security obligations
- Risk management programs required
- Incident reporting mandatory
- Essential Eight strongly recommended

**Critical Infrastructure Sectors**:

1. Communications
2. Financial services and markets
3. Data storage or processing
4. Defense industry
5. Higher education and research
6. Energy
7. Food and grocery
8. Health care
9. Space technology
10. Transport
11. Water and sewerage

**Cyber Security Obligations**:

- Adopt and maintain a risk management program
- Report cyber security incidents
- Comply with directions (government-issued)
- Essential Eight implementation recommended/required

---

## Implementation Guidance

### Assessment Process

**Step 1: Current State Assessment**

- Document existing controls
- Map to Essential Eight requirements
- Identify current maturity level (per strategy)
- Gap analysis (current vs target)

**Step 2: Prioritization**

- Risk-based prioritization
- Quick wins identification
- Resource allocation
- Phased approach planning

**Step 3: Remediation Planning**

- Detailed implementation plan
- Resource requirements (staff, budget, tools)
- Timeline and milestones
- Stakeholder communication

**Step 4: Implementation**

- Strategy-by-strategy rollout
- Testing and validation
- User training and awareness
- Documentation

**Step 5: Validation**

- Control effectiveness testing
- Independent assessment (for ML3)
- Gap remediation
- Continuous improvement

**Step 6: Reporting**

- Self-assessment documentation
- Management reporting
- Compliance attestation (if required)
- Annual reassessment

### Common Challenges

1. **Application Control Complexity**
   - Most difficult to implement
   - Application inventory challenges
   - Legacy application issues
   - User resistance
   - **Mitigation**: Start in audit mode, gradual enforcement, user engagement

2. **Patching Windows (48 hours at ML3)**
   - Testing time constraints
   - Production change windows
   - Rollback concerns
   - **Mitigation**: Automation, pre-approved processes, robust testing

3. **MFA User Experience**
   - User friction and resistance
   - Legacy application compatibility
   - Helpdesk burden
   - **Mitigation**: User training, phased rollout, modern authentication

4. **Privileged Access Restrictions**
   - Operational efficiency concerns
   - Admin resistance
   - Help desk implications
   - **Mitigation**: PAM solutions, JIT administration, clear policy

5. **Resource Constraints**
   - Budget limitations
   - Staff expertise
   - Competing priorities
   - **Mitigation**: Phased approach, MSPs, automation, executive support

### Tools and Technologies

**Application Control**:

- Windows Defender Application Control (WDAC)
- AppLocker
- CrowdStrike Application Control
- Carbon Black App Control

**Patching**:

- Windows Server Update Services (WSUS)
- System Center Configuration Manager (SCCM)
- Microsoft Endpoint Manager (Intune)
- Ansible, Puppet, Chef
- Ivanti Patch Management
- ManageEngine Patch Manager

**MFA**:

- Microsoft Entra multifactor authentication
- Duo Security
- Okta
- Ping Identity
- YubiKey (FIDO2)
- RSA SecurID

**PAM (Privileged Access Management)**:

- CyberArk Privileged Access Security
- BeyondTrust Privileged Remote Access
- Delinea (Thycotic) Secret Server
- Microsoft Identity Manager

**Backup**:

- Veeam Backup & Replication
- Azure Backup
- AWS Backup
- Commvault
- Rubrik
- Cohesity

**SIEM/Logging**:

- Microsoft Sentinel
- Splunk
- IBM QRadar
- LogRhythm
- Elastic Stack

**Vulnerability Management**:

- Tenable Nessus
- Qualys VMDR
- Rapid7 InsightVM
- Microsoft Defender Vulnerability Management

### Cost Estimates

**Maturity Level 1**:

- Small org (50-100 users): $50K-$150K
- Medium org (500 users): $150K-$350K
- Large org (5000+ users): $500K-$1M+

**Maturity Level 2**:

- Small org: $100K-$300K
- Medium org: $300K-$700K
- Large org: $1M-$3M+

**Maturity Level 3**:

- Small org: $200K-$500K
- Medium org: $500K-$1.5M
- Large org: $2M-$5M+

*Costs include tools, consulting, labor, training, ongoing operations*

---

## Threat Landscape Context

### Threats Mitigated

**Ransomware** (Primary Focus):

- 85%+ of ransomware prevented by Essential Eight
- Application control blocks execution
- Backups enable recovery
- MFA prevents initial access
- Patching closes vulnerabilities

**Examples**: LockBit, ALPHV/BlackCat, Cl0p, Royal, Play

**Phishing and Credential Theft**:

- MFA prevents compromised credential use
- Application hardening blocks malicious content
- Macro settings prevent malicious documents

**Malware Delivery**:

- Application control blocks execution
- Email/web filtering (hardening)
- Macro blocking

**Examples**: Emotet, Qbot, IcedID, Dridex

**Web-Based Exploits**:

- Browser hardening reduces attack surface
- Patching closes vulnerabilities
- Application control prevents downloads

**Exploitation of Vulnerabilities**:

- Patching remediates known vulnerabilities
- Reduced attack window
- Prioritization of critical/exploited flaws

**Privilege Escalation**:

- Admin privilege restrictions limit impact
- Lateral movement prevented
- Credential theft mitigated

**Insider Threats**:

- Application control limits actions
- Privileged access restrictions
- Logging and monitoring
- Backup protection

### Recent Threat Examples

**Medibank Breach (2022)**:

- Essential Eight would have prevented initial access (MFA)
- Privileged access restrictions would limit lateral movement
- Exfiltration detection (monitoring)

**Australian Organizations Ransomware (Ongoing)**:

- Application control blocks ransomware execution
- Backups enable recovery without paying
- MFA prevents VPN compromise
- Patching closes initial access vulnerabilities

**Business Email Compromise (BEC)**:

- MFA prevents account takeover
- Application hardening (email security)
- User training and awareness

---

## Relationship to Other Frameworks

### ISM (Information Security Manual)

**Integration**:

- Essential Eight is subset of ISM
- ISM provides comprehensive security controls
- Essential Eight are prioritized ISM controls
- Both published by ACSC

**Relationship**:

- Essential Eight: 8 strategies, focused mitigation
- ISM: Comprehensive security framework, 100s of controls
- Essential Eight compliance doesn't equal ISM compliance
- Essential Eight is foundation for ISM

### NIST Cybersecurity Framework

**Alignment**:

- Essential Eight maps to NIST CSF functions
- Identify: Asset management, risk assessment
- Protect: Application control, patching, hardening, MFA, privileges
- Detect: Logging, monitoring
- Respond: Incident response
- Recover: Backups

### ISO 27001

**Mapping**:

- Essential Eight controls map to ISO 27001:2022 Annex A
- A.8.2 Privileged access rights, A.8.5 Secure authentication → Restrict Admin Privileges, MFA
- A.8.8 Management of technical vulnerabilities → Patch Applications, Patch Operating Systems
- A.8.19 Installation of software on operational systems → Application Control
- A.8.9 Configuration management → User Application Hardening, Restrict Microsoft Office Macros
- A.8.13 Information backup → Regular Backups

### CIS Controls

**Alignment**:

- Essential Eight similar to CIS Critical Security Controls
- Many overlapping requirements
- CIS Controls more comprehensive (153 safeguards)
- Essential Eight more focused (8 strategies)

---

## Capabilities

- Essential Eight maturity assessment (ML1, ML2, ML3)
- Strategy-by-strategy implementation guidance
- Gap analysis and remediation roadmaps
- Australian government compliance requirements
- Risk assessment and maturity level selection
- Tool and technology recommendations
- Cost estimation and budgeting
- Timeline and project planning
- Policy and procedure development
- User training and awareness materials
- Control testing and validation
- Incident response integration
- Continuous improvement planning
- Compliance reporting and attestation
- Integration with ISM and other frameworks
