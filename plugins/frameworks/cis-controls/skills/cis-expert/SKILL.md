---
name: cis-expert
description: CIS Controls v8 expert for baseline security. Deep knowledge of 18 controls, 153 safeguards, Implementation Groups (IG1/IG2/IG3), and practical implementation guidance for organizations of all sizes.
allowed-tools: Read, Glob, Grep, Write
---

# CIS Controls Expert

Deep expertise in CIS Controls v8, the baseline cybersecurity framework developed by the Center for Internet Security.

> **License notice.** This skill incorporates content derived from **CIS Controls v8**, © Center for Internet Security, Inc., used under the [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/) license. This file and other CIS-derived content in `plugins/frameworks/cis-controls/` are licensed under CC BY-SA 4.0 (the rest of the repository is MIT). See [LICENSE-CIS.md](../../LICENSE-CIS.md).

## Expertise Areas

### CIS Controls Overview

**Purpose**: Prioritized set of actions to defend against the most pervasive cyber threats
**Authority**: Center for Internet Security (CIS) - global non-profit
**Current Version**: CIS Controls v8 (May 2021)
**Adoption**: Cross-industry standard, used globally by organizations of all sizes

**Key Principles**:

- Offense informs defense (based on real-world attack data)
- Prioritization (most impactful controls first)
- Measurements and metrics
- Continuous diagnostics and mitigation
- Automation where possible

**Evolution from v7 to v8**:

- Consolidated from 20 to 18 controls
- Better alignment with Implementation Groups
- Enhanced cloud and mobile coverage
- Stronger integration with NIST CSF
- More actionable safeguards (171 to 153 refined)

### Implementation Groups (IG1, IG2, IG3)

The core innovation of CIS Controls: tailored security based on organizational maturity and risk.

#### IG1 - Essential Cyber Hygiene

**Target Audience**:

- Small to medium businesses (typically <100 employees)
- Limited IT security resources (1-2 generalist IT staff)
- Organizations with low attack surface
- Standard business risk profile
- Minimal regulatory requirements

**Characteristics**:

- **Safeguards**: 56 essential controls
- **Resource Model**: Part-time security focus, leveraging generalist IT
- **Budget**: \$10,000 - \$50,000 annually
- **Expertise**: Basic IT competency, limited specialized security knowledge
- **Tools**: Commercial off-the-shelf, small business focused

**Attack Profile IG1 Defends Against**:

- Opportunistic attacks (phishing, commodity ransomware)
- Automated vulnerability scanning and exploitation
- Drive-by malware downloads
- Script kiddies and unsophisticated actors
- Social engineering targeting general workforce

**Example Organizations**:

- Local retail stores
- Small healthcare practices (1-3 doctors)
- Professional services (law firms, accounting)
- Regional nonprofits
- K-12 schools (individual schools, not districts)
- Small manufacturers

**Critical IG1 Safeguards**:

1. Asset and software inventory (1.1, 2.1)
2. Secure configurations (4.1, 4.2)
3. Account management (5.1, 5.3, 5.4)
4. Automated patching (7.3, 7.4)
5. Anti-malware (10.1, 10.2)
6. Backups (11.2, 11.3)
7. Security awareness (14.1)

#### IG2 - Enterprise Security

**Target Audience**:

- Medium to large organizations (100-1,000 employees)
- Dedicated IT team with security responsibilities
- Moderate risk environment
- Customer or patient data handling (PII, PHI)
- Regulatory compliance needs (HIPAA, PCI-DSS)

**Characteristics**:

- **Safeguards**: 128 total (56 from IG1 + 72 additional)
- **Resource Model**: 1-3 dedicated security FTEs, larger IT team
- **Budget**: \$100,000 - \$500,000 annually
- **Expertise**: Security specialists, some advanced training
- **Tools**: Enterprise-grade (SIEM, EDR, vulnerability management)

**Attack Profile IG2 Defends Against**:

- Targeted phishing and spear-phishing campaigns
- Ransomware-as-a-Service (RaaS) operators
- Financially motivated cybercriminal groups
- Business email compromise (BEC)
- Credential stuffing and password spraying
- Industrial espionage (mid-tier)
- Supply chain attacks (lower sophistication)

**Example Organizations**:

- Mid-sized healthcare systems (regional hospitals)
- Community banks and credit unions
- Manufacturing companies (100-500 employees)
- SaaS startups (Series B/C)
- School districts and community colleges
- MSPs and IT service providers

**Critical IG2 Safeguards** (beyond IG1):

1. Multi-factor authentication (5.5)
2. Encryption (3.6, 3.10, 3.11)
3. Centralized logging and SIEM (8.9, 8.11)
4. Vulnerability scanning (7.5, 7.6)
5. Network segmentation (12.2)
6. IDS/IPS (13.2, 13.3)
7. Secure SDLC (16.1, 16.2)
8. Penetration testing (18.1, 18.2)

#### IG3 - Advanced Security

**Target Audience**:

- Large enterprises (1,000+ employees)
- Critical infrastructure organizations
- High-value intellectual property
- Known targets of nation-state actors
- Stringent regulatory environments (CMMC Level 3, NERC CIP)

**Characteristics**:

- **Safeguards**: 153 total (128 from IG2 + 25 additional)
- **Resource Model**: Security Operations Center (SOC), 5+ security FTEs
- **Budget**: \$1,000,000+ annually
- **Expertise**: Highly specialized (threat hunters, forensics, IR specialists)
- **Tools**: Advanced threat detection, threat intelligence, SOAR platforms

**Attack Profile IG3 Defends Against**:

- Advanced Persistent Threats (APTs)
- Nation-state sponsored cyber espionage
- Sophisticated ransomware groups (Conti, REvil successors)
- Zero-day exploit campaigns
- Insider threats (malicious and negligent)
- Supply chain compromise (SolarWinds-level)
- Living-off-the-land (LOTL) techniques
- Multi-stage attacks with custom malware

**Example Organizations**:

- Fortune 500 companies
- Defense industrial base contractors
- Major healthcare systems (multi-state)
- Large financial institutions (national/global banks)
- Energy sector (utilities, pipelines)
- Telecommunications providers
- Federal/state government agencies
- Universities with significant research programs

**Critical IG3 Safeguards** (beyond IG2):

1. Behavioral anti-malware and EDR (10.7)
2. Data loss prevention (3.13)
3. Privileged access workstations (12.8)
4. Application layer filtering / WAF (13.10)
5. Alert tuning and threat hunting (13.11)
6. Application penetration testing (16.13)
7. Internal penetration testing (18.5)
8. Post-incident reviews (17.8)

### The 18 CIS Controls (Detailed)

#### Control 1: Inventory and Control of Enterprise Assets

**Why It Matters**: You can't protect what you don't know exists.

**Asset Types**:

- End-user devices (laptops, desktops, tablets, smartphones)
- Servers (physical, virtual, cloud instances)
- Network infrastructure (routers, switches, firewalls, wireless APs)
- Network-attached storage (NAS)
- IoT and OT devices (printers, cameras, industrial control systems)

**Required Information**:

- Hardware make/model, serial number
- Network address (IP, MAC)
- Purpose/function
- Owner/custodian
- Physical/logical location
- Software/OS version
- Support status (vendor-supported, EOL)

**Implementation Approaches**:

- **Passive Discovery**: DHCP logs, network flow analysis, SPAN port monitoring
- **Active Scanning**: Nmap, Qualys, Rapid7, Lansweeper
- **Agent-Based**: Endpoint agents reporting to CMDB
- **Cloud**: AWS Config, Azure Resource Graph, GCP Asset Inventory
- **Manual**: Spreadsheets (only for very small orgs, IG1)

**Common Challenges**:

- Shadow IT (unapproved devices)
- BYOD (personal devices accessing corporate resources)
- Transient devices (visitor laptops, contractors)
- IoT proliferation (smart TVs, voice assistants, smart building tech)
- Cloud resource sprawl (forgotten EC2 instances)

---

#### Control 2: Inventory and Control of Software Assets

**Why It Matters**: Unauthorized software = unpatched vulnerabilities and compliance gaps.

**Software Categories**:

- Operating systems and firmware
- Business applications (ERP, CRM, productivity suites)
- Development tools and runtime environments
- Security tools
- Third-party libraries and dependencies
- Browser extensions and plugins

**Safeguard Highlights**:

- **2.1**: Software inventory (name, version, publisher, install date)
- **2.2**: Ensure software is vendor-supported (no EOL software)
- **2.3**: Address unauthorized software (removal or approval)
- **2.4**: Automated inventory tools (SCCM, Jamf, Ivanti)
- **2.5 (IG2)**: Application allowlisting (only approved software runs)
- **2.6 (IG2)**: Library allowlisting (approved DLLs, shared libraries)
- **2.7 (IG3)**: Script allowlisting (PowerShell, Python, Bash restrictions)

**Implementation Approaches**:

- **Endpoint agents**: Report installed software to central repository
- **Package managers**: Track software deployment (SCCM, Ansible, Puppet)
- **Application control**: AppLocker, Windows Defender Application Control, macOS Gatekeeper
- **Container registries**: Docker Hub controls, approved base images
- **SaaS discovery**: Cloud Access Security Broker (CASB) for shadow SaaS

**Common Challenges**:

- Developer workstations (require flexibility for tools)
- Open-source software tracking
- Software sprawl (users installing unauthorized apps)
- Legacy software (unsupported but business-critical)
- Cloud applications (SaaS discovery and control)

---

#### Control 3: Data Protection

**Why It Matters**: Data is the crown jewels. Protect it or lose competitive advantage, customer trust, and regulatory compliance.

**Data Lifecycle**:

1. **Creation**: How data enters the organization
2. **Storage**: Where data resides (databases, file shares, cloud)
3. **Use**: How data is accessed and processed
4. **Sharing**: Internal and external data transmission
5. **Archive**: Long-term retention
6. **Destruction**: Secure disposal

**Key Safeguards**:

- **3.1**: Data management process
- **3.2**: Data inventory (what sensitive data exists, where)
- **3.3**: Data access control lists (least privilege)
- **3.4**: Data retention policy and enforcement
- **3.5**: Secure data disposal (wiping, destruction)
- **3.6 (IG2)**: Encrypt data on end-user devices (full disk encryption)
- **3.7 (IG2)**: Data classification scheme (public, internal, confidential, restricted)
- **3.10 (IG2)**: Encrypt sensitive data in transit (TLS 1.2+)
- **3.11 (IG2)**: Encrypt sensitive data at rest (database encryption, file encryption)
- **3.12 (IG2)**: Segment data by sensitivity (network/storage isolation)
- **3.13 (IG3)**: Deploy DLP solution (prevent exfiltration)
- **3.14 (IG3)**: Log sensitive data access (who accessed what, when)

**Data Classification Examples**:

- **Public**: Marketing materials, public-facing website content
- **Internal**: Internal memos, policies, general business data
- **Confidential**: Customer PII, employee records, financial data
- **Restricted**: Trade secrets, M&A data, regulated data (HIPAA, ITAR)

**Encryption Standards**:

- **At Rest**: AES-256, database TDE (Transparent Data Encryption)
- **In Transit**: TLS 1.2+ (prefer TLS 1.3), VPN (IPsec, WireGuard)
- **Email**: S/MIME, PGP for highly sensitive
- **Cloud**: CSP-managed keys (AWS KMS, Azure Key Vault) or customer-managed (BYOK)

**Data Disposal Methods**:

- **Physical media**: Shredding (hard drives), degaussing, incineration
- **Digital**: Multi-pass overwrite (DoD 5220.22-M), cryptographic erasure
- **Cloud**: Delete + verify (ensure backups and snapshots deleted)
- **Certificates of destruction**: For regulated industries

---

#### Control 4: Secure Configuration of Enterprise Assets and Software

**Why It Matters**: Default configurations are insecure. Attackers exploit well-known weaknesses.

**Configuration Management Principles**:

1. **Least Functionality**: Disable unnecessary services, features, protocols
2. **Secure Defaults**: Harden before deployment (not after)
3. **Consistency**: Standard baselines for asset types
4. **Automation**: Configuration-as-code (Infrastructure as Code)
5. **Validation**: Regular audits and drift detection

**Key Safeguards**:

- **4.1**: Secure configuration process (baseline creation, approval, deployment)
- **4.2**: Secure configuration baselines (documented standards)
- **4.3**: Automatic session locking (screen lock after inactivity)
- **4.4**: Implement and manage firewalls (host-based firewalls enabled)
- **4.5 (IG2)**: Implement DMZ (demilitarized zone for internet-facing systems)
- **4.7**: Manage default accounts (disable or rename, change passwords)
- **4.8 (IG2)**: Uninstall or disable unnecessary services (reduce attack surface)

**Hardening Resources**:

- **CIS Benchmarks**: Free, consensus-developed standards (150+ benchmarks)
  - Operating systems (Windows, Linux, macOS)
  - Cloud platforms (AWS, Azure, GCP)
  - Applications (web servers, databases, containers)
  - Network devices (Cisco, Palo Alto)
- **DISA STIGs**: Security Technical Implementation Guides (DoD standard)
- **Vendor Hardening Guides**: Microsoft Security Baselines, Red Hat Security Guide
- **NIST Guidelines**: NIST 800-123 (general server security)

**Configuration Management Tools**:

- **Assessment**: CIS-CAT Pro, OpenSCAP, Nessus compliance checks
- **Enforcement**: Ansible, Puppet, Chef, SaltStack, PowerShell DSC
- **Cloud**: AWS Config, Azure Policy, GCP Security Command Center
- **Containers**: Docker Bench, Kubernetes CIS Benchmark

**Common Hardening Actions**:

- Disable unnecessary services (Telnet, FTP, SMBv1)
- Enable host firewall (Windows Firewall, iptables, pf)
- Configure session timeouts (15 minutes idle)
- Disable USB auto-run
- Set BIOS/UEFI passwords
- Enable Secure Boot
- Configure audit logging
- Disable guest accounts
- Rename or disable default admin accounts

---

#### Control 5: Account Management

**Why It Matters**: Accounts are the keys to the kingdom. Poor account hygiene = easy lateral movement for attackers.

**Account Types**:

- **Standard User Accounts**: Day-to-day work, limited privileges
- **Privileged Accounts**: Administrator, root, domain admin
- **Service Accounts**: Application/service authentication
- **Shared Accounts**: (Avoid! If necessary, tightly control and log)
- **Emergency Access Accounts**: Break-glass for emergencies

**Key Safeguards**:

- **5.1**: Account inventory (all user, admin, service accounts)
- **5.2**: Use unique passwords (no shared passwords)
- **5.3**: Disable dormant accounts (inactive 45-90 days)
- **5.4**: Restrict administrator privileges to dedicated accounts (separate admin and user accounts)
- **5.5 (IG2)**: Establish and maintain MFA (all users, especially admins)
- **5.6 (IG2)**: Centralize account management (SSO, directory services)

**Privileged Account Best Practices**:

- **Separate Accounts**: User account for email/browsing, admin account for administration
- **Just-in-Time (JIT) Access**: Temporary privilege elevation, time-boxed
- **Privileged Access Workstations (PAWs)**: Dedicated hardened systems for admin tasks (IG3)
- **Session Recording**: Record admin sessions for audit
- **Password Vaulting**: Store privileged credentials in vault (CyberArk, HashiCorp Vault, Keeper)

**Service Account Management**:

- Least privilege (only permissions needed)
- Unique per service (not shared across apps)
- Strong, randomly generated passwords (32+ characters)
- Regular password rotation (90-180 days, or eliminate with Managed Service Identities)
- Avoid interactive login rights

**Dormant Account Detection**:

- Last login date tracking
- Automated alerts after 30 days inactive
- Disable after 45-60 days inactive
- Delete after 90-120 days (or per retention policy)

**Multi-Factor Authentication (MFA)**:

- **Something you know**: Password, PIN
- **Something you have**: Hardware token (YubiKey, RSA SecurID), mobile app (Duo, Authenticator)
- **Something you are**: Biometrics (fingerprint, face, iris)

**MFA Strength Hierarchy** (strongest to weakest):

1. **FIDO2/WebAuthn** (hardware security keys, phishing-resistant)
2. **Certificate-based authentication** (PIV/CAC smart cards)
3. **Authenticator app with push notification** (Duo, Microsoft Authenticator)
4. **Time-based one-time password (TOTP)** (Google Authenticator, Authy)
5. **SMS/voice call** (weak, susceptible to SIM swapping - avoid if possible)

**Account Lifecycle**:

1. **Provisioning**: Manager request, HR approval, role-based access
2. **Modification**: Role changes, promotions, transfers
3. **Review**: Quarterly access reviews, recertification
4. **Deprovisioning**: Immediate upon termination, documented process

---

#### Control 6: Access Control Management

**Why It Matters**: Principle of least privilege prevents lateral movement and limits blast radius.

**Access Control Models**:

- **Role-Based Access Control (RBAC)**: Access based on job function
- **Attribute-Based Access Control (ABAC)**: Access based on attributes (department, clearance, location)
- **Mandatory Access Control (MAC)**: System-enforced, label-based (government/military)
- **Discretionary Access Control (DAC)**: Owner controls access (traditional file permissions)

**Key Safeguards**:

- **6.1**: Access granting process (documented, approved)
- **6.2**: Access revoking process (terminations, role changes)
- **6.3**: Require MFA for externally-exposed applications
- **6.4**: Require MFA for remote access
- **6.5 (IG2)**: Require MFA for administrative access
- **6.7 (IG2)**: Centralize access control (single authoritative source)
- **6.8 (IG2)**: Define and maintain RBAC (standardized roles)

**RBAC Implementation**:

- Define roles based on job functions (not individuals)
- Group permissions into roles (Finance-User, HR-Admin, Developer)
- Assign users to roles (not direct permissions)
- Regular role reviews and updates

**Least Privilege Principles**:

- Default deny (no access unless explicitly granted)
- Need-to-know basis
- Time-limited access (expire elevated access)
- Minimal effective permissions
- Separation of duties (no single person has end-to-end control)

**Remote Access Security**:

- VPN required (no direct internet exposure of internal resources)
- MFA for VPN access
- Split-tunnel vs full-tunnel (consider data sensitivity)
- Device posture checking (Endpoint compliance before access)
- Zero Trust Network Access (ZTNA) for modern approach

**Access Review Process**:

- Quarterly manager reviews of team access
- Annual comprehensive access recertification
- Automated alerts for dormant permissions
- Immediate revocation upon termination
- Audit trail of access changes

---

#### Control 7: Continuous Vulnerability Management

**Why It Matters**: Unpatched vulnerabilities are the #1 attack vector. Speed matters.

**Vulnerability Management Lifecycle**:

1. **Discovery**: Identify assets and vulnerabilities
2. **Prioritization**: Risk-based ranking (not just CVSS)
3. **Remediation**: Patch, mitigate, or accept risk
4. **Verification**: Confirm vulnerability closed
5. **Reporting**: Metrics and trends

**Key Safeguards**:

- **7.1**: Vulnerability management process
- **7.2**: Remediation process (SLAs by severity)
- **7.3**: Automated OS patch management
- **7.4**: Automated application patch management
- **7.5 (IG2)**: Automated vulnerability scans of internal assets
- **7.6 (IG2)**: Automated vulnerability scans of externally-facing assets
- **7.7 (IG3)**: Remediate detected vulnerabilities (risk-based SLAs)

**Vulnerability Scanning**:

- **Frequency**: Weekly internal, monthly external (minimum)
- **Scope**: All internet-facing, all critical internal assets
- **Scan Types**:
  - **Unauthenticated**: External attacker perspective
  - **Authenticated/Credentialed**: Deeper visibility, detect missing patches
  - **Agent-based**: Continuous assessment
- **Tools**: Qualys VMDR, Tenable.io, Rapid7 InsightVM, Nessus

**Patch Management**:

- **Critical Patches**: 15 days (CISA: 15 days for KEV)
- **High Patches**: 30 days
- **Medium Patches**: 60-90 days
- **Low Patches**: Next maintenance window
- **Exceptions**: Document compensating controls, business justification, executive approval

**Prioritization Factors** (beyond CVSS):

- **Exploit availability**: Is there a public exploit? (CISA KEV, Metasploit)
- **Asset criticality**: Production vs dev, customer-facing vs internal
- **Exposure**: Internet-facing vs internal
- **Compensating controls**: Firewall rules, WAF, IPS signatures
- **EPSS Score**: Exploit Prediction Scoring System (probability of exploit)

**Common Challenges**:

- Legacy systems (can't patch without breaking)
- Change control bureaucracy
- Patching windows (maintenance downtime)
- Testing requirements (QA before production)
- Third-party/vendor software (delayed patches)
- Cloud and container patching (immutable infrastructure, redeploy)

---

#### Control 8: Audit Log Management

**Why It Matters**: Logs are the evidence. No logs = no incident detection, no forensics, no compliance.

**What to Log**:

- **Authentication events**: Successful/failed logins, logouts, privilege escalation
- **Account changes**: Creation, deletion, privilege modifications
- **System changes**: Configuration changes, software installation
- **File access**: Sensitive data access (read, write, delete)
- **Network connections**: Firewall logs, VPN, proxy
- **Security events**: AV detections, IDS/IPS alerts, DLP violations

**Key Safeguards**:

- **8.1**: Audit log management process
- **8.2**: Collect audit logs (all critical systems)
- **8.3**: Ensure adequate log storage (capacity planning)
- **8.5 (IG2)**: Collect detailed audit logs (enable verbose logging)
- **8.6 (IG2)**: Collect DNS query logs (detect C2, exfiltration)
- **8.9 (IG2)**: Centralize audit logs (SIEM, log aggregator)
- **8.10 (IG2)**: Retain audit logs (minimum 90 days, prefer 1 year)
- **8.11 (IG2)**: Conduct audit log reviews (manual or automated)
- **8.12 (IG3)**: Collect service provider logs (SaaS, IaaS, PaaS)

**Log Sources**:

- Operating systems (Windows Event Log, syslog)
- Applications (web servers, databases, business apps)
- Security tools (firewall, IDS/IPS, AV, DLP)
- Network devices (routers, switches, wireless)
- Cloud platforms (AWS CloudTrail, Azure Monitor, GCP Cloud Logging)
- Identity providers (Active Directory, Okta, Entra ID)

**Centralized Logging (SIEM)**:

- **Purpose**: Aggregate, correlate, alert, investigate
- **Tools**: Splunk, Elastic Stack (ELK), Microsoft Sentinel, IBM QRadar, Sumo Logic
- **Benefits**: Single pane of glass, correlation, long-term retention, compliance reporting

**Log Retention Requirements**:

- **CIS Baseline**: 90 days minimum (IG2), 1 year recommended
- **PCI DSS**: 1 year (3 months immediately available)
- **HIPAA**: 6 years
- **SOX**: 7 years
- **State breach laws**: Varies (typically 1-2 years)

**Log Review**:

- **Automated Alerting**: High-priority events trigger immediate alerts
- **Daily Review**: Security team reviews critical alerts
- **Weekly Review**: Trend analysis, anomaly detection
- **Monthly Reports**: Executive dashboards, compliance metrics

**Common Log Analysis Use Cases**:

- Failed login attempts (brute force detection)
- Privilege escalation
- After-hours access
- Geographically impossible travel
- Data exfiltration (large outbound transfers)
- Malware execution
- Policy violations

---

#### Control 9: Email and Web Browser Protections

**Why It Matters**: Email and web are the primary attack vectors (90%+ of breaches start with phishing).

**Email Threats**:

- Phishing (credential theft)
- Spear-phishing (targeted)
- Business email compromise (BEC)
- Malware attachments (ransomware, trojans)
- Link-based attacks (malicious URLs)

**Web Threats**:

- Drive-by downloads
- Malicious advertisements (malvertising)
- Exploit kits
- Watering hole attacks
- Compromised websites

**Key Safeguards**:

- **9.1**: Ensure use of fully supported browsers and email clients (no EOL)
- **9.2**: Use DNS filtering services (block malicious domains)
- **9.3**: Maintain network-based URL filters (web proxy, secure web gateway)
- **9.4**: Restrict unnecessary browser and email extensions
- **9.5 (IG2)**: Implement DMARC (email authentication)
- **9.6 (IG2)**: Block unnecessary file types (executables, scripts in email)
- **9.7 (IG2)**: Deploy email server anti-malware

**Email Security Stack**:

1. **Email Gateway**: Mimecast, Proofpoint, Cisco ESA, Microsoft Defender for Office 365
   - Anti-spam, anti-malware, anti-phishing
   - URL rewriting (time-of-click protection)
   - Attachment sandboxing
2. **DMARC/SPF/DKIM**: Email authentication
   - SPF: Sender Policy Framework (authorized sending IPs)
   - DKIM: DomainKeys Identified Mail (cryptographic signing)
   - DMARC: Domain-based Message Authentication, Reporting & Conformance (policy enforcement)
3. **User Reporting**: Phish Alert Button (let users report suspicious emails)
4. **Email Encryption**: S/MIME, PGP for sensitive communications

**DMARC Implementation**:

- Start with monitoring mode (p=none)
- Analyze reports, fix legitimate mail flows
- Move to quarantine (p=quarantine)
- Eventually reject (p=reject) unauthorized email

**Web Filtering**:

- **DNS Filtering**: Cisco Umbrella, Quad9, Cloudflare Gateway (lightweight)
- **Secure Web Gateway (SWG)**: Zscaler, Palo Alto Prisma Access, Menlo Security (deep inspection)
- **Categories to Block**: Malware, phishing, adult content, gambling, anonymizers/proxies

**Browser Security**:

- **Keep Updated**: Auto-update enabled (Chrome, Edge, Firefox)
- **Extension Control**: Allowlist approved extensions, block others
- **Isolation**: Browser isolation for high-risk browsing (Menlo, Ericom)
- **Configuration**: Disable Java, Flash (deprecated), restrict file downloads

---

#### Control 10: Malware Defenses

**Why It Matters**: Malware is pervasive. Defense-in-depth is essential.

**Malware Types**:

- **Ransomware**: Encrypts data, demands payment (REvil, Conti, LockBit)
- **Trojans**: Masquerades as legitimate software (remote access trojans - RATs)
- **Worms**: Self-propagating (WannaCry, NotPetya)
- **Spyware**: Steals information (keyloggers, infostealers)
- **Rootkits**: Hides presence, maintains persistence
- **Cryptominers**: Uses resources to mine cryptocurrency

**Key Safeguards**:

- **10.1**: Deploy anti-malware software (all endpoints)
- **10.2**: Configure automatic signature updates (daily or more)
- **10.3**: Disable autorun and autoplay (USB, CD/DVD)
- **10.4**: Configure automatic anti-malware scanning (real-time + scheduled)
- **10.5 (IG2)**: Enable anti-exploitation features (DEP, ASLR, EMET)
- **10.6 (IG2)**: Centrally manage anti-malware (console, reporting)
- **10.7 (IG3)**: Use behavioral anti-malware (EDR, machine learning)

**Endpoint Protection Evolution**:

1. **Traditional Antivirus (AV)**: Signature-based detection (legacy)
2. **Anti-Malware**: Enhanced AV with heuristics
3. **Endpoint Protection Platform (EPP)**: AV + firewall + device control
4. **Endpoint Detection and Response (EDR)**: Behavioral analysis, threat hunting, forensics
5. **Extended Detection and Response (XDR)**: EDR + network + email + cloud

**Leading Solutions**:

- **Next-Gen AV/EDR**: CrowdStrike Falcon, SentinelOne, Microsoft Defender for Endpoint, Carbon Black
- **Traditional**: Symantec Endpoint Protection, Trend Micro, Sophos

**Detection Methods**:

- **Signature-based**: Known malware patterns (fast, but misses new threats)
- **Heuristic**: Behavioral analysis (catches variants)
- **Sandboxing**: Execute in isolated environment, observe behavior
- **Machine Learning**: AI-based anomaly detection
- **Indicators of Attack (IoA)**: Detect tactics, techniques, procedures (TTPs)

**Anti-Exploitation Techniques**:

- **DEP (Data Execution Prevention)**: Prevent code execution in data regions
- **ASLR (Address Space Layout Randomization)**: Randomize memory addresses
- **Control Flow Guard (CFG)**: Validate indirect calls
- **Application Guard**: Isolate risky applications (Windows Defender Application Guard)

**Malware Response**:

1. **Isolate**: Quarantine infected endpoint (network isolation)
2. **Investigate**: Determine scope, root cause, lateral movement
3. **Eradicate**: Remove malware, rebuild if necessary
4. **Recover**: Restore from clean backup
5. **Lessons Learned**: Update defenses, user training

---

#### Control 11: Data Recovery

**Why It Matters**: Ransomware, hardware failure, disasters happen. Backups are your insurance policy.

**3-2-1 Backup Rule**:

- **3** copies of data (primary + 2 backups)
- **2** different media types (disk + tape/cloud)
- **1** copy offsite (protect against local disaster)

**Modern Update: 3-2-1-1-0**:

- **3-2-1** (as above)
- **1** immutable/air-gapped copy (ransomware protection)
- **0** errors in backup validation (test restores)

**Key Safeguards**:

- **11.1**: Data recovery process (documented procedures)
- **11.2**: Perform automated backups (scheduled, no manual intervention)
- **11.3**: Protect recovery data (encryption, access control, offsite)
- **11.4**: Establish isolated instance of recovery data (air-gapped, immutable)
- **11.5 (IG2)**: Test data recovery (quarterly or semi-annual restore tests)

**Backup Scope**:

- **Critical Systems**: ERP, CRM, databases, file servers, email
- **User Data**: Home directories, shared drives
- **System State**: OS configurations, Active Directory, certificates
- **Applications**: Application data, configurations

**Backup Types**:

- **Full**: Complete copy of all data (slow, storage-intensive, but fastest restore)
- **Incremental**: Changes since last backup (fast, efficient, slower restore)
- **Differential**: Changes since last full backup (middle ground)
- **Synthetic Full**: Combines full + incrementals to create new full

**Backup Frequency**:

- **Critical systems**: Daily or continuous (CDP - Continuous Data Protection)
- **User data**: Daily
- **Databases**: Transaction log backups (every 15-60 minutes) + daily full
- **Offsite sync**: Daily or weekly

**Backup Testing**:

- **Restore Drills**: Quarterly test restore of random data sets
- **Disaster Recovery Exercises**: Annual full DR test
- **Validation**: Automated backup verification (integrity checks)
- **Documentation**: Maintain restore runbooks

**Ransomware-Resilient Backups**:

- **Immutability**: Write-once-read-many (WORM), object lock (S3 Object Lock)
- **Air-Gap**: Physically or logically isolated (tape in safe, offline disk)
- **Separate Credentials**: Different admin accounts for backup systems
- **Network Segmentation**: Backups on separate VLAN, restricted access

**Backup Solutions**:

- **Traditional**: Veeam, Commvault, Veritas NetBackup, IBM Spectrum Protect
- **Cloud-Native**: AWS Backup, Azure Backup, GCP Cloud Backup
- **SaaS Backup**: Spanning, Veeam for M365 (for Office 365, Google Workspace)
- **Ransomware-Focused**: Rubrik, Cohesity (immutable, zero-trust)

---

#### Control 12: Network Infrastructure Management (IG2)

**Why It Matters**: Network is the highway for data and attacks. Secure the roads.

**Key Safeguards**:

- **12.1**: Ensure network infrastructure is up-to-date (patch routers, switches, firewalls)
- **12.2**: Establish secure network architecture (segmentation, DMZ)
- **12.3**: Securely manage network infrastructure (dedicated admin VLANs, out-of-band)
- **12.4**: Maintain network architecture diagram (current topology)
- **12.6**: Use secure network management protocols (SSH, SNMPv3, no Telnet)
- **12.7**: Ensure remote devices use VPN (encrypt remote access)
- **12.8 (IG3)**: Dedicated computing resources for admins (jump boxes, PAWs)

**Network Segmentation**:

- **Purpose**: Limit lateral movement, isolate critical assets
- **Approaches**:
  - **VLANs**: Virtual LANs (Layer 2 separation)
  - **Subnets**: IP addressing (Layer 3 separation)
  - **Firewalls**: Zone-based firewalls (enforce policy between segments)
  - **Micro-segmentation**: Software-defined, workload-level (zero trust)

**Network Zones**:

- **External/Internet**: Untrusted
- **DMZ (Perimeter Network)**: Internet-facing services (web servers, email gateways)
- **Internal/Corporate**: Workstations, internal applications
- **Restricted/Secure**: High-value assets (databases, HR systems)
- **Management**: Network and security device management (out-of-band)

**DMZ Architecture**:

- **Purpose**: Buffer between internet and internal network
- **Placement**: Dual firewall (external and internal) or screened subnet
- **Assets**: Web servers, mail relays, DNS, reverse proxies
- **Rules**: Strictly limited inbound, no direct access to internal

**Secure Management**:

- **Protocols**: SSH (not Telnet), HTTPS (not HTTP), SNMPv3 (not v1/v2c)
- **Access**: Management VLAN, out-of-band network, jump box
- **Authentication**: Strong passwords, MFA, certificate-based
- **Monitoring**: Log all admin access, session recording

**Network Diagram**:

- **Information**: Devices, IP addresses, VLANs, security zones, data flows
- **Format**: Visio, Draw.io, Lucidchart (keep current, version control)
- **Frequency**: Update quarterly or after major changes

---

#### Control 13: Network Monitoring and Defense (IG2)

**Why It Matters**: Visibility is security. You can't defend against what you can't see.

**Key Safeguards**:

- **13.1**: Centralize security event alerting (SIEM)
- **13.2**: Deploy network-based IDS (intrusion detection)
- **13.3**: Deploy network-based IPS (intrusion prevention)
- **13.4**: Perform traffic filtering (block known-bad IPs, domains)
- **13.6**: Collect network traffic flow logs (NetFlow, IPFIX)
- **13.8**: Deploy network-based anti-malware
- **13.10 (IG3)**: Perform application layer filtering (WAF)
- **13.11 (IG3)**: Tune security event alerting thresholds

**IDS vs IPS**:

- **IDS (Intrusion Detection System)**: Passive monitoring, alerts on threats (Suricata, Snort, Zeek)
- **IPS (Intrusion Prevention System)**: Active blocking, inline (Snort IPS, Palo Alto Threat Prevention)

**Detection Methods**:

- **Signature-based**: Match known attack patterns (Snort rules)
- **Anomaly-based**: Baseline normal traffic, alert on deviations
- **Heuristic**: Behavioral analysis
- **Threat Intelligence**: IP/domain reputation feeds

**Network Traffic Analysis (NTA)**:

- **Tools**: Darktrace, ExtraHop, Vectra AI, Corelight (Zeek-based)
- **Capabilities**:
  - Baseline normal network behavior
  - Detect anomalies (data exfiltration, lateral movement, C2 beaconing)
  - Machine learning-based detection
  - East-west traffic visibility (internal lateral movement)

**NetFlow/IPFIX**:

- **Purpose**: Metadata about network traffic (who, what, when, how much)
- **Data**: Source/dest IP, ports, protocol, bytes transferred, timestamps
- **Tools**: SolarWinds NTA, Plixer Scrutinizer, ManageEngine NetFlow Analyzer
- **Use Cases**: Capacity planning, security investigation, compliance

**Web Application Firewall (WAF)**:

- **Purpose**: Protect web applications from OWASP Top 10
- **Placement**: In front of web servers (cloud or on-prem)
- **Detection**: SQL injection, XSS, CSRF, file inclusion
- **Solutions**: F5 WAF, Imperva, Cloudflare WAF, AWS WAF, Azure WAF

**Alert Tuning (IG3)**:

- **Problem**: Alert fatigue (too many false positives)
- **Solution**: Iterative tuning
  - Baseline environment
  - Disable low-value signatures
  - Whitelist known-good traffic
  - Adjust thresholds
  - Prioritize critical alerts
- **Goal**: High-fidelity alerts that warrant investigation

---

#### Control 14: Security Awareness and Skills Training

**Why It Matters**: Users are the weakest link AND the strongest defense (if trained).

**Key Safeguards**:

- **14.1**: Security awareness program (annual training, all workforce)
- **14.2**: Train on secure authentication (password hygiene, MFA)
- **14.3**: Train on data handling (classification, encryption, disposal)
- **14.4**: Train on identifying social engineering (phishing, vishing, smishing)
- **14.5 (IG2)**: Train on authentication best practices (passphrase, password managers)
- **14.6 (IG2)**: Train on identifying and reporting incidents (when and how to report)
- **14.9 (IG3)**: Conduct role-specific training (developers, admins, executives)

**Awareness Training Program**:

- **Frequency**: Annual mandatory training, quarterly refreshers
- **Topics**:
  - Phishing and social engineering
  - Password security (unique, complex, MFA)
  - Data classification and handling
  - Physical security (tailgating, clean desk)
  - Incident reporting
  - Acceptable use policy
- **Format**: Online modules, videos, quizzes, in-person sessions

**Phishing Simulation**:

- **Purpose**: Test user awareness, identify high-risk users
- **Frequency**: Monthly or quarterly
- **Escalation**: Users who fail multiple times receive additional training
- **Tools**: KnowBe4, Proofpoint Security Awareness, Cofense PhishMe, SANS Securing The Human

**Role-Specific Training (IG3)**:

- **Developers**: Secure coding (OWASP Top 10, input validation, authentication)
- **System Administrators**: Hardening, least privilege, secure remote access
- **Executives**: Business email compromise, social engineering targeting leadership
- **HR/Finance**: W-2 phishing, wire transfer fraud
- **Security Team**: Advanced training (SANS, Offensive Security, certifications)

**Security Culture**:

- **Security Champions**: Ambassadors in each department
- **Gamification**: Rewards for reporting phishing, security wins
- **Communication**: Regular security tips, newsletters, posters
- **Executive Support**: C-suite visibly supports security initiatives

**Measurement**:

- Phishing click rate (goal: <5%)
- Training completion rate (goal: 100%)
- Incident reporting rate (upward trend is good - users reporting more)
- Time to report phishing (faster is better)

---

#### Control 15: Service Provider Management

**Why It Matters**: Third-party risk is your risk. Supply chain attacks are on the rise.

**Key Safeguards**:

- **15.1**: Inventory of service providers (cloud, SaaS, MSPs, vendors)
- **15.2**: Service provider management policy (risk assessment, contracts)
- **15.3 (IG2)**: Classify service providers (by criticality, data access)
- **15.4 (IG2)**: Ensure contracts include security requirements (SLAs, audit rights)
- **15.5 (IG2)**: Assess service providers (questionnaires, certifications)
- **15.6 (IG2)**: Monitor service providers (ongoing, not just initial)
- **15.7 (IG3)**: Securely decommission service providers (data return, deletion)

**Service Provider Types**:

- **Cloud IaaS**: AWS, Azure, GCP (infrastructure)
- **SaaS**: Salesforce, Office 365, Workday (applications)
- **Managed Services**: MSP, MSSP, SOC-as-a-Service
- **Professional Services**: Consultants, auditors, pen testers
- **Business Partners**: Integrations, data sharing

**Risk Classification**:

- **Critical**: Access to sensitive data, single point of failure (e.g., email provider)
- **High**: Access to internal systems, PII (e.g., HR SaaS)
- **Medium**: Limited data access (e.g., marketing platform)
- **Low**: No data access (e.g., office supplies)

**Vendor Assessment Methods**:

- **Security Questionnaires**: SIG (Standard Information Gathering), CAIQ, custom
- **Certifications**: SOC 2, ISO 27001, HITRUST, PCI-DSS (request reports)
- **Penetration Tests**: Request recent pentest results (executive summary)
- **On-Site Audits**: For critical vendors (right-to-audit clause)
- **Continuous Monitoring**: SecurityScorecard, BitSight, UpGuard (external ratings)

**Contract Security Clauses**:

- **Data protection**: Encryption, access control, data location
- **Incident notification**: Timeframe (e.g., 24-72 hours)
- **Right to audit**: Annual or on-demand audits
- **Data ownership**: Customer owns data
- **Data return/deletion**: Upon termination, certificated deletion
- **Subcontractor approval**: Notify of subcontractor changes
- **Insurance**: Cyber liability insurance requirements
- **Compliance**: HIPAA BAA, GDPR DPA, etc.

**Ongoing Monitoring**:

- **Quarterly reviews**: Security posture, incidents, changes
- **Annual recertification**: Review SOC 2, ISO, pentest reports
- **News monitoring**: Breaches, M&A, financial stability
- **Scorecard tracking**: Trend analysis (improving or declining)

**Offboarding**:

- **Data return**: Request all data in usable format
- **Data deletion**: Certified destruction (certificate of deletion)
- **Access revocation**: Disable integrations, API keys, accounts
- **Contractual obligations**: Ensure terms survive termination (confidentiality)

---

#### Control 16: Application Software Security (IG2)

**Why It Matters**: Custom applications are unique attack surfaces. Secure code is foundational.

**Key Safeguards**:

- **16.1**: Secure application development process (SDLC)
- **16.2**: Secure software development practices (OWASP, standards)
- **16.3**: Root cause analysis on security vulnerabilities
- **16.5**: Use up-to-date and trusted third-party components
- **16.6**: Establish and maintain SBOM (Software Bill of Materials)
- **16.7**: Use standard hardening configuration templates
- **16.11 (IG3)**: Leverage vetted modules or services (proven libraries)
- **16.13 (IG3)**: Conduct application penetration testing
- **16.14 (IG3)**: Conduct threat modeling

**Secure SDLC Phases**:

1. **Requirements**: Security requirements defined
2. **Design**: Threat modeling, architecture review
3. **Development**: Secure coding, code review, SAST
4. **Testing**: DAST, penetration testing, security QA
5. **Deployment**: Hardening, secure configuration
6. **Maintenance**: Patch management, vulnerability monitoring

**OWASP Top 10 (2021)**:

1. Broken Access Control
2. Cryptographic Failures
3. Injection (SQL, OS, LDAP)
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable and Outdated Components
7. Identification and Authentication Failures
8. Software and Data Integrity Failures
9. Security Logging and Monitoring Failures
10. Server-Side Request Forgery (SSRF)

**Application Security Testing**:

- **SAST (Static Application Security Testing)**: Source code analysis (Checkmarx, Veracode, SonarQube)
- **DAST (Dynamic Application Security Testing)**: Running app testing (Burp Suite, OWASP ZAP, Acunetix)
- **IAST (Interactive AST)**: Hybrid approach, runtime instrumentation
- **SCA (Software Composition Analysis)**: Third-party library vulnerabilities (Snyk, WhiteSource, Black Duck)
- **Penetration Testing**: Manual testing by security experts

**Software Bill of Materials (SBOM)**:

- **Purpose**: Inventory of application components (libraries, frameworks, dependencies)
- **Format**: SPDX, CycloneDX
- **Use Cases**: Vulnerability tracking (Log4Shell), license compliance, supply chain security
- **Tools**: Syft, Tern, SBOM generators in build pipelines

**Secure Coding Practices**:

- Input validation (whitelist, never trust user input)
- Output encoding (prevent XSS)
- Parameterized queries (prevent SQL injection)
- Least privilege (application runs with minimal permissions)
- Error handling (don't leak sensitive info in errors)
- Logging (security events, not sensitive data)
- Authentication and session management (secure cookies, timeouts)

**Threat Modeling (IG3)**:

- **Methodologies**: STRIDE (Microsoft), PASTA, OCTAVE
- **Process**:
  1. Identify assets (data, systems)
  2. Create architecture diagram (data flows)
  3. Identify threats (STRIDE: Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation)
  4. Rank risks
  5. Mitigate (design changes, controls)
- **When**: Design phase (before coding)

---

#### Control 17: Incident Response Management

**Why It Matters**: Breaches happen. Preparation determines damage.

**Key Safeguards**:

- **17.1**: Designate personnel to manage incident handling (CSIRT, SOC)
- **17.2**: Establish and maintain contact information (24/7 escalation)
- **17.3**: Establish enterprise process for reporting incidents (how users report)
- **17.4**: Establish incident response process (documented plan)
- **17.5 (IG2)**: Assign key roles and responsibilities (incident commander, comms, legal)
- **17.6 (IG2)**: Define communication mechanisms (war room, Slack channel, bridge)
- **17.7 (IG2)**: Conduct routine incident response exercises (tabletops, simulations)
- **17.8 (IG3)**: Conduct post-incident reviews (lessons learned)
- **17.9 (IG3)**: Establish security incident thresholds (severity ratings, escalation)

**Incident Response Lifecycle (NIST SP 800-61)**:

1. **Preparation**: Plans, tools, training
2. **Detection and Analysis**: Identify and scope incident
3. **Containment, Eradication, Recovery**: Stop spread, remove threat, restore
4. **Post-Incident Activity**: Lessons learned, improvements

**Incident Response Team Roles**:

- **Incident Commander**: Leads response, decision authority
- **Technical Lead**: Deep-dive analysis, forensics, remediation
- **Communications**: Internal and external communications, PR
- **Legal**: Legal implications, regulatory notification, law enforcement
- **HR**: Insider threats, employee notifications
- **Executive Sponsor**: C-suite oversight, resource allocation

**Incident Severity Ratings**:

- **Critical/P1**: Active breach, data exfiltration, ransomware, mission-critical system down
- **High/P2**: Confirmed compromise, malware detected, significant impact
- **Medium/P3**: Suspicious activity, potential compromise, limited impact
- **Low/P4**: Policy violations, informational alerts

**Incident Response Playbooks**:

- **Ransomware**: Isolation, backup recovery, decryption (if possible), law enforcement
- **Phishing**: Email recall, user notification, credential reset, malware scan
- **Data Breach**: Scope determination, notification (legal), forensics, remediation
- **DDoS**: Traffic filtering, CDN mitigation, ISP coordination
- **Insider Threat**: HR coordination, account disable, forensic imaging, investigation

**Communication Plan**:

- **Internal**: Incident status updates, executive briefings, workforce notifications
- **External**: Customers, partners, regulators, law enforcement, media (if necessary)
- **Templates**: Pre-drafted communications (reduce response time)

**Tabletop Exercises**:

- **Frequency**: Semi-annual or annual
- **Scenarios**: Ransomware, data breach, DDoS, insider threat
- **Participants**: IR team, executives, legal, HR, PR
- **Objectives**: Test plan, identify gaps, improve coordination

**Post-Incident Review**:

- **What happened**: Timeline of events
- **What went well**: Effective actions, successful containment
- **What went poorly**: Gaps, delays, miscommunications
- **Action items**: Process improvements, tool enhancements, training needs
- **Documentation**: Update runbooks, lessons learned database

---

#### Control 18: Penetration Testing (IG2)

**Why It Matters**: Validate defenses with real-world attack simulation.

**Key Safeguards**:

- **18.1**: Penetration testing program (annual or after major changes)
- **18.2**: Perform periodic external penetration tests (annual minimum)
- **18.3**: Remediate penetration test findings (prioritized action plan)
- **18.4**: Validate security measures (confirm controls effective)
- **18.5 (IG3)**: Perform periodic internal penetration tests (assume breach)

**Penetration Testing Types**:

- **External**: Internet-facing assets (websites, VPNs, email)
- **Internal**: Inside the network (lateral movement, privilege escalation)
- **Web Application**: OWASP Top 10, business logic flaws
- **Wireless**: WiFi security (WPA2/3, rogue APs)
- **Physical**: Facility access, tailgating, badge cloning
- **Social Engineering**: Phishing, vishing, pretexting

**Testing Methodologies**:

- **Black Box**: No prior knowledge (external attacker perspective)
- **Gray Box**: Partial knowledge (compromised user scenario)
- **White Box**: Full knowledge (comprehensive assessment)

**Scope Considerations**:

- **In-Scope**: Systems approved for testing (documented)
- **Out-of-Scope**: Production databases (read-only), third-party systems without approval
- **Rules of Engagement**: Testing hours, communication protocols, stop conditions

**Testing Phases**:

1. **Reconnaissance**: Information gathering (passive and active)
2. **Scanning**: Port scans, vulnerability scans, enumeration
3. **Exploitation**: Gain access (proof-of-concept or full exploitation)
4. **Post-Exploitation**: Lateral movement, privilege escalation, data exfiltration simulation
5. **Reporting**: Findings, risk ratings, remediation recommendations

**Deliverables**:

- **Executive Summary**: Business-level overview, risk summary
- **Technical Report**: Detailed findings, step-by-step reproduction, evidence (screenshots)
- **Remediation Guidance**: Prioritized fixes, compensating controls
- **Retest**: Validate fixes after remediation

**Purple Team Exercises (IG3)**:

- **Concept**: Red team (attackers) and Blue team (defenders) collaborate
- **Goal**: Improve detection and response (not just find vulnerabilities)
- **Process**: Red team executes TTPs, Blue team detects, both discuss gaps
- **Outcome**: Enhanced visibility, tuned alerts, improved runbooks

**Red Team vs Penetration Test**:

- **Penetration Test**: Find and report vulnerabilities, time-boxed (2-4 weeks)
- **Red Team**: Simulate APT, test detection/response, adversary emulation, longer duration (weeks to months)

**Compliance Requirements**:

- **PCI DSS**: Annual external pentest, internal if significant changes
- **FedRAMP**: Annual external, pre-authorization
- **HIPAA**: Not required but recommended (especially for BAs)
- **CMMC**: Level 2+ requires periodic assessments

---

## Implementation Guidance

### Starting Your CIS Controls Journey

**Step 1: Assess Current State** (Week 1-2)

- Determine which IG level is appropriate (IG1, IG2, IG3)
- Conduct gap assessment against target IG safeguards
- Identify existing controls and gaps

**Step 2: Prioritize Quick Wins** (Month 1-3)

- Focus on foundational IG1 safeguards:
  - 1.1, 2.1: Asset and software inventory
  - 10.1, 10.2: Anti-malware deployment
  - 11.2, 11.3: Automated backups
  - 7.3: Automated OS patching
  - 14.1: Security awareness training
- These provide immediate risk reduction with moderate effort

**Step 3: Build Foundation** (Month 4-9)

- Implement remaining IG1 safeguards
- Establish governance (policies, procedures, roles)
- Deploy foundational tools (asset management, patch management, backup)
- Document configurations and processes

**Step 4: Advance to IG2** (If applicable, Month 10-24)

- Implement IG2 safeguards:
  - 5.5: Multi-factor authentication
  - 8.9, 8.11: Centralized logging and SIEM
  - 12.2: Network segmentation
  - 13.2, 13.3: IDS/IPS
  - 16.1, 16.2: Secure SDLC
  - 18.1, 18.2: Penetration testing
- Focus on enterprise scalability and automation

**Step 5: Mature to IG3** (If applicable, Year 2-3)

- Implement IG3 safeguards:
  - 10.7: Behavioral anti-malware (EDR)
  - 13.11: Alert tuning and threat hunting
  - 16.13: Application penetration testing
  - 18.5: Internal penetration testing
- Build advanced capabilities (SOC, threat intelligence, purple team)

**Step 6: Continuous Improvement** (Ongoing)

- Regular assessments (annual or semi-annual)
- Metrics and reporting (dashboard, KPIs)
- Adapt to new threats
- Stay current with CIS Controls updates

### Measurement and Metrics

**Control Implementation Metrics**:

- Percentage of safeguards implemented (by IG level)
- Safeguards in progress vs completed
- Time to implement safeguards (track delays)

**Operational Metrics**:

- **Control 1**: % of assets in inventory (goal: >95%)
- **Control 7**: Mean time to patch (MTTP) - Critical: <15 days, High: <30 days
- **Control 8**: Log coverage (% of critical assets sending logs)
- **Control 10**: Malware detection rate, dwell time
- **Control 11**: Backup success rate (goal: >99%), restore test pass rate
- **Control 14**: Phishing click rate (goal: <5%), training completion (goal: 100%)
- **Control 17**: Mean time to detect (MTTD), mean time to respond (MTTR)

**Risk Metrics**:

- Open vulnerabilities by severity (trend down over time)
- Security incidents (volume, severity, trend)
- Compliance score (overall IG compliance %)
- Third-party risk score

### Tools and Technology

**Essential Tools for IG1**:

- Asset Management: Lansweeper, Spiceworks (free tier)
- Endpoint Protection: Microsoft Defender, Sophos
- Backup: Veeam Community Edition, Windows Backup
- Patch Management: WSUS, SCCM, ManageEngine Patch Manager
- Awareness Training: KnowBe4 (small business tier)

**Enterprise Tools for IG2**:

- SIEM: Splunk, Elastic Stack, Microsoft Sentinel
- Vulnerability Management: Qualys, Tenable, Rapid7
- EDR: CrowdStrike, SentinelOne, Microsoft Defender for Endpoint
- IDS/IPS: Suricata, Snort, Palo Alto Threat Prevention
- SAST/DAST: Veracode, Checkmarx, OWASP ZAP

**Advanced Tools for IG3**:

- Threat Intelligence: Recorded Future, Anomali
- SOAR: Splunk Phantom, Palo Alto Cortex XSOAR
- NTA: Darktrace, ExtraHop, Vectra
- Deception: Attivo, TrapX
- Threat Hunting Platform: Sophos MDR, Red Canary

### CIS Controls Alignment with Other Frameworks

**NIST Cybersecurity Framework (CSF)**:

- CIS Controls map to all 5 CSF functions (Identify, Protect, Detect, Respond, Recover)
- CIS Controls are more prescriptive (how) vs NIST CSF (what)

**NIST 800-53 / 800-171**:

- Strong overlap with NIST security controls
- CIS Controls provide implementation guidance for NIST requirements
- IG2/IG3 aligns well with NIST 800-171 for CUI protection

**ISO 27001/27002**:

- CIS Controls can support ISO 27001 ISMS
- Many safeguards directly map to ISO 27002 controls
- More actionable than ISO (which is principle-based)

**PCI DSS**:

- CIS Controls IG2 covers most PCI DSS requirements
- Specific gaps: PCI DSS cardholder data environment (CDE) scoping
- CIS provides broader security beyond just payment data

**CMMC**:

- IG1 ≈ CMMC Level 1 (basic cyber hygiene)
- IG2 ≈ CMMC Level 2 (NIST 800-171, 110 practices)
- IG3 includes additional practices beyond CMMC

**HIPAA Security Rule**:

- CIS Controls IG2 addresses most HIPAA requirements
- Additional considerations: HIPAA-specific (BAAs, minimum necessary)

## Capabilities

- CIS Controls v8 implementation planning and roadmapping
- Implementation Group selection (IG1, IG2, IG3) based on organizational profile
- Gap assessments and compliance scoring
- Safeguard-by-safeguard implementation guidance (all 153 safeguards)
- Control-level deep dives (all 18 controls)
- Tool selection and evaluation
- Metrics and measurement programs
- Framework alignment (NIST, ISO, PCI-DSS, CMMC, HIPAA)
- Continuous improvement and maturity advancement
- Executive reporting and risk communication
- Resource and budget planning
- Vendor and MSSP engagement support
