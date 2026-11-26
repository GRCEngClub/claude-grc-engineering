---
description: Essential 8 maturity assessment by target level
---

# Essential 8 Assessment

Evaluates organizational readiness for Australian Cyber Security Centre (ACSC) Essential 8 mitigation strategies.

## Arguments

- Argument 1 - Target maturity level (required: 1, 2, or 3)
- Argument 2 - Assessment scope (optional: full, gap-analysis, specific-strategy)

## Essential 8 Maturity Levels

| Level | Name | Description | Requirements |
|-------|------|-------------|--------------|
| **1** | Maturity Level One | Partly aligned | Minimum implementation, basic hygiene |
| **2** | Maturity Level Two | Mostly aligned | Enhanced security posture |
| **3** | Maturity Level Three | Fully aligned | Advanced security, adversary resilience |

## The 8 Mitigation Strategies

### 1. Application Control

**Purpose**: Prevent execution of unapproved/malicious programs
**ML1**: Application control on workstations
**ML2**: Application control on servers, block drivers/scripts
**ML3**: Hardened configuration, validated software

### 2. Patch Applications

**Purpose**: Remediate vulnerabilities in applications
**ML1**: Patch within one month (extreme risk 48 hours)
**ML2**: Patch within two weeks (extreme risk 48 hours)
**ML3**: Patch within 48 hours (extreme risk 48 hours)

### 3. Configure Microsoft Office Macro Settings

**Purpose**: Prevent malicious macros from executing
**ML1**: Disable macros from internet, block OLE packages
**ML2**: Only macros from trusted locations, AMSI enabled
**ML3**: Validate macro execution, publisher certificates

### 4. User Application Hardening

**Purpose**: Reduce attack surface of applications
**ML1**: Web browser hardening, block Flash/ads
**ML2**: Block web-based Java, disable unneeded features
**ML3**: All hardening applied, validated configuration

### 5. Restrict Administrative Privileges

**Purpose**: Prevent lateral movement and privilege escalation
**ML1**: Remove local admin for standard users
**ML2**: Admin for admin duties only, privileged OS hardening
**ML3**: Admin disabled by default, JIT admin, validated

### 6. Patch Operating Systems

**Purpose**: Remediate OS vulnerabilities
**ML1**: Patch within one month (extreme risk 48 hours)
**ML2**: Patch within two weeks (extreme risk 48 hours)
**ML3**: Patch within 48 hours (extreme risk 48 hours)

### 7. Multi-Factor Authentication (MFA)

**Purpose**: Prevent unauthorized access
**ML1**: MFA for remote access, privileged users, important data
**ML2**: MFA for all users, phishing-resistant preferred
**ML3**: Phishing-resistant MFA required (FIDO2, smart cards)

### 8. Regular Backups

**Purpose**: Recover from cyber security incidents
**ML1**: Daily backups, retention (3 months), test restoration
**ML2**: Backups offline/offsite, process improvements
**ML3**: Hardened backups, 3-2-1 rule, tested recovery

## Assessment Output

1. **Overall Maturity Score**: Percentage compliance by level
2. **Strategy-by-Strategy Status**: Compliance for each of the 8 strategies
3. **Maturity Level Readiness**: Current vs target level gap
4. **Critical Gaps**: High-priority deficiencies
5. **Implementation Roadmap**: Prioritized remediation plan
6. **ACSC Alignment**: Compliance with latest guidance (2024)
7. **Estimated Timeline**: Maturity improvement timeline
8. **Risk Assessment**: Cyber threats mitigated at each level

## ACSC Guidance References

- **Essential Eight Maturity Model** (Latest version)
- **Strategies to Mitigate Cyber Security Incidents**
- **ACSC Cyber Threat Reports**
- **ISM (Information Security Manual)** - Essential Eight sections

## Examples

```bash
# Full Maturity Level 2 assessment
/essential8:assess 2 full

# Gap analysis for Maturity Level 1
/essential8:assess 1 gap-analysis

# Specific strategy assessment
/essential8:assess 3 "Multi-Factor Authentication"
```
