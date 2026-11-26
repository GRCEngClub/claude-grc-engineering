---
description: Verify specific Essential 8 strategy implementation
---

# Strategy Implementation Check

Provides detailed implementation guidance and verification for a specific Essential 8 mitigation strategy.

## Arguments

- Argument 1 - Strategy number (required: 1-8) or name
- Argument 2 - Target maturity level (optional: 1, 2, or 3)

## Strategy Selection

### 1. Application Control

Prevent execution of unapproved/malicious programs

### 2. Patch Applications

Remediate security vulnerabilities in applications

### 3. Configure Microsoft Office Macro Settings

Prevent malicious macros from executing

### 4. User Application Hardening

Reduce attack surface of internet-facing applications

### 5. Restrict Administrative Privileges

Prevent privilege escalation and lateral movement

### 6. Patch Operating Systems

Remediate security vulnerabilities in operating systems

### 7. Multi-Factor Authentication

Prevent unauthorized access using stolen credentials

### 8. Regular Backups

Recover data and system availability after incidents

---

## Strategy 1: Application Control

### Maturity Level 1

**Requirements**:

- Application control implemented on all workstations
- Allowed/blocked execution rules in place
- Microsoft's recommended block rules applied
- Application control events logged

**Implementation Steps**:

1. Choose application control solution (AppLocker, Windows Defender Application Control)
2. Create baseline of approved applications
3. Configure publisher certificate rules
4. Implement path rules for authorized locations
5. Block execution from user-writable directories
6. Deploy to all workstations
7. Enable audit mode first, then enforcement
8. Log all blocked execution attempts

**Validation**:

- Test unapproved application execution (should block)
- Verify approved applications run normally
- Check event logs for blocked attempts

### Maturity Level 2

**Additional Requirements**:

- Application control on all servers
- Drivers/kernel modules controlled
- PowerShell, command line, scripts controlled
- Application control events centrally logged

**Implementation Steps**:

1. Extend controls to all servers
2. Implement driver signature requirements
3. Configure PowerShell Constrained Language Mode
4. Block scripting languages (unless required)
5. Central log collection (SIEM)
6. Regular rule review and updates

**Validation**:

- Test script execution blocking
- Verify driver installation controls
- Confirm central logging operational

### Maturity Level 3

**Additional Requirements**:

- Validation of application control configuration
- Application control event analysis
- Extremely hardened configuration
- Annual penetration testing

**Implementation Steps**:

1. Independent validation of implementation
2. Implement automated rule compliance checking
3. Continuous monitoring and alerting
4. Threat hunting using control events
5. Penetration testing of bypass techniques
6. Annual recertification

**Validation**:

- Third-party assessment of controls
- Penetration test with bypass attempts
- Red team exercises

---

## Strategy 2: Patch Applications

### Maturity Level 1

**Requirements**:

- Security vulnerabilities in applications patched **within one month** of release
- Extreme risk vulnerabilities patched **within 48 hours**
- Patches applied to internet-facing applications first

**Implementation Steps**:

1. Maintain inventory of all applications
2. Subscribe to vendor security advisories
3. Assess vulnerability severity (use CVSS)
4. Prioritize internet-facing and critical apps
5. Test patches in non-production environment
6. Deploy patches according to timeline
7. Verify successful installation
8. Document patching activities

**Extreme Risk Definition**:

- CVSS 9.0-10.0
- Actively exploited in the wild
- No mitigating controls available
- Critical asset exposure

**Validation**:

- Scan for unpatched vulnerabilities
- Review patching logs
- Verify 48-hour extreme risk compliance

### Maturity Level 2

**Additional Requirements**:

- Vulnerabilities patched **within two weeks** of release
- Extreme risk still 48 hours
- Automated patch deployment where possible

**Implementation Steps**:

1. Implement automated patching tools
2. Accelerate testing procedures
3. Staged deployment approach
4. Enhanced monitoring for patch failures
5. Metrics tracking and reporting

### Maturity Level 3

**Additional Requirements**:

- All vulnerabilities patched **within 48 hours**
- Automated deployment and verification
- Comprehensive patch management process

**Implementation Steps**:

1. Fully automated patch testing
2. Rapid deployment capabilities
3. Rollback procedures tested
4. Continuous vulnerability scanning
5. Real-time patch compliance dashboards

---

## Strategy 3: Configure Microsoft Office Macro Settings

### Maturity Level 1

**Requirements**:

- Macros disabled for files from the internet
- Macro antivirus scanning enabled
- Only macros in Trusted Locations allowed to run
- Block OLE package activation

**Implementation Steps**:

1. Configure Group Policy for Office macro settings
2. Enable "Block macros from the internet"
3. Define Trusted Locations (limited, IT-controlled)
4. Enable AMSI (Antimalware Scan Interface)
5. Block embedded OLE packages
6. Educate users on macro risks
7. Monitor macro execution events

**Validation**:

- Test internet-sourced Office files (macros should not run)
- Verify Trusted Location macros work
- Check Group Policy application

### Maturity Level 2

**Additional Requirements**:

- Only macros from Trusted Locations with validation
- AMSI enabled for all Office applications
- Logging of all macro execution attempts

### Maturity Level 3

**Additional Requirements**:

- Validated macro execution only
- Digital signature requirements
- Comprehensive monitoring and alerting

---

## Strategy 4: User Application Hardening

### Maturity Level 1

**Requirements**:

- Web browsers: Block Flash content, block or disable ads, disable Java
- Office: Disable add-ins except as required
- PDF readers: Disable JavaScript, embedded content

**Implementation Steps**:

1. Standardize on supported browser (Edge, Chrome)
2. Deploy hardening settings via Group Policy/MDM
3. Block Adobe Flash (deprecated)
4. Install ad-blocking extensions (enterprise)
5. Disable Java browser plugins
6. Configure PDF reader security settings
7. Remove unnecessary Office add-ins

**Validation**:

- Test Flash content blocking
- Verify Java disabled
- Check PDF JavaScript execution

### Maturity Level 2

**Additional Requirements**:

- Block web-based Java execution
- Disable all unnecessary features
- Centrally managed configuration

### Maturity Level 3

**Additional Requirements**:

- Validated hardened configuration
- Regular recertification
- Advanced exploit protections enabled

---

## Strategy 5: Restrict Administrative Privileges

### Maturity Level 1

**Requirements**:

- Privileged accounts separate from unprivileged accounts
- Privileged access disabled by default
- Standard users not local administrators
- Privileged account usage logged

**Implementation Steps**:

1. Remove local administrator rights from standard users
2. Create separate admin accounts for IT staff
3. Implement privileged access workstations (PAWs)
4. Configure "Run as administrator" prompts
5. Log all administrative actions
6. Regular privilege review

**Validation**:

- Test standard user cannot install software
- Verify admin actions are logged
- Audit privileged account list

### Maturity Level 2

**Additional Requirements**:

- Privileged accounts only for administrative tasks
- Privileged OS hardening
- Privileged access managed and monitored
- Just-in-time (JIT) administration preferred

**Implementation Steps**:

1. Implement Privileged Access Management (PAM) solution
2. Time-limited admin elevation
3. Harden privileged workstations
4. Session recording for admin actions
5. Multi-person authorization for critical changes

### Maturity Level 3

**Additional Requirements**:

- Privileged access disabled by default
- JIT administration required
- Comprehensive validation and monitoring

---

## Strategy 6: Patch Operating Systems

### Maturity Level 1

**Requirements**:

- OS vulnerabilities patched **within one month**
- Extreme risk vulnerabilities patched **within 48 hours**
- Internet-facing systems prioritized

**Implementation Steps**:

1. Maintain inventory of all operating systems
2. Enable automatic Windows Update (or WSUS)
3. Subscribe to vendor advisories (Microsoft, Linux distros)
4. Assess vulnerability severity
5. Test patches before deployment
6. Deploy according to timeline
7. Verify installation success

**Validation**:

- Run vulnerability scans
- Check Windows Update compliance
- Review patching reports

### Maturity Level 2

**Additional Requirements**:

- Vulnerabilities patched **within two weeks**
- Automated patching where possible

### Maturity Level 3

**Additional Requirements**:

- All vulnerabilities patched **within 48 hours**
- Fully automated deployment and verification

---

## Strategy 7: Multi-Factor Authentication

### Maturity Level 1

**Requirements**:

- MFA for access to important data repositories
- MFA for all privileged users
- MFA for all remote access

**Implementation Steps**:

1. Identify important data repositories
2. Deploy MFA solution (Entra ID, Duo, etc.)
3. Enroll all privileged users
4. Require MFA for VPN/remote access
5. Configure conditional access policies
6. User training on MFA

**MFA Methods Accepted**:

- Authenticator apps (Microsoft Authenticator, Google Authenticator)
- Hardware tokens (YubiKey, RSA)
- SMS/phone call (less secure, use sparingly)

**Validation**:

- Test access without MFA (should fail)
- Verify all privileged accounts enrolled
- Check remote access MFA enforcement

### Maturity Level 2

**Additional Requirements**:

- MFA for all users
- Phishing-resistant MFA preferred
- MFA for access to important data by all users

**Implementation Steps**:

1. Roll out MFA to all standard users
2. Implement FIDO2 security keys where possible
3. Disable legacy authentication protocols
4. Conditional access based on risk signals
5. MFA exception tracking and review

### Maturity Level 3

**Additional Requirements**:

- Phishing-resistant MFA required for all users
- No exceptions without compensating controls
- Comprehensive monitoring

**Phishing-Resistant MFA**:

- FIDO2 security keys (YubiKey, etc.)
- Smart cards (PIV, CAC)
- Windows Hello for Business
- Certificate-based authentication

**Not Phishing-Resistant**:

- SMS codes
- Voice calls
- Email codes
- Push notifications (can be phishing-prone)

**Implementation Steps**:

1. Deploy FIDO2 security keys to all users
2. Disable non-phishing-resistant methods
3. Implement fallback processes (lost key)
4. Monitor for MFA bypass attempts

---

## Strategy 8: Regular Backups

### Maturity Level 1

**Requirements**:

- Backups of important data daily (minimum weekly)
- Retention: at least 3 months
- Backups tested for restoration quarterly
- Backups stored offline or offsite

**Implementation Steps**:

1. Identify important data to back up
2. Implement backup solution (Veeam, Azure Backup, etc.)
3. Configure daily backup schedule
4. Store backups offline or in separate environment
5. Test restoration quarterly
6. Document backup/recovery procedures
7. Retain backups for 3+ months

**3-2-1 Backup Rule**:

- **3** copies of data
- **2** different media types
- **1** copy offsite/offline

**Validation**:

- Perform test restoration
- Verify backup completion logs
- Confirm offline/offsite storage

### Maturity Level 2

**Additional Requirements**:

- Backups disconnected from network (air-gapped)
- Backup processes improved
- More frequent testing

**Implementation Steps**:

1. Implement immutable backups
2. Network segmentation for backup infrastructure
3. Privileged access controls for backup systems
4. Monthly restoration testing
5. Backup integrity monitoring

### Maturity Level 3

**Additional Requirements**:

- Hardened backup infrastructure
- Comprehensive testing (full disaster recovery)
- Automated validation

**Implementation Steps**:

1. Fully hardened backup environment
2. Automated backup verification
3. Quarterly full disaster recovery test
4. Backup infrastructure monitoring
5. Incident response integration

---

## Examples

```bash
# Check Application Control implementation at ML2
/essential8:strategy-check 1 2

# Verify MFA strategy at ML3
/essential8:strategy-check "Multi-Factor Authentication" 3

# Assess Patch Applications maturity
/essential8:strategy-check 2

# Review Regular Backups implementation
/essential8:strategy-check 8 1
```

## Common Pitfalls

1. **Application Control**: Allowing execution from user-writable locations
2. **Patching**: Not treating extreme risk as truly urgent (48 hours)
3. **Office Macros**: Trusting macros from email attachments
4. **Hardening**: Not keeping pace with application updates
5. **Admin Privileges**: Shared admin accounts, no logging
6. **OS Patching**: Skipping testing, causing production issues
7. **MFA**: SMS-based MFA at ML3 (not phishing-resistant)
8. **Backups**: Not testing restoration, backups accessible to malware

## References

- **ACSC Essential Eight Maturity Model**
- **Strategies to Mitigate Cyber Security Incidents**
- **ACSC Publications Library**
