---
description: Deep dive guidance on CMMC v2.0 domains and practices
---

# CMMC Domain Guidance

> **Review required:** This material is an unverified working aid, not an authoritative assessment or legal determination. Verify every control, objective, scope, assessment type, scoring and contractual claim against current official sources and obtain qualified CMMC and contracting review before use. If a source or contract is unavailable, mark the conclusion unverified; do not infer compliance.

Provides detailed implementation guidance for CMMC v2.0 domains and their associated practices.

## Arguments

- `$1` - Domain abbreviation (required: AC, AT, AU, CM, IA, IR, MA, MP, PS, PE, RA, CA, SC, SI)
- `$2` - CMMC level (optional: 1, 2, 3 - shows practices for that level)

See the [DoD CMMC model](https://dodcio.defense.gov/Portals/0/Documents/CMMC/ModelOverview_V2.0_FINAL2_20211202_508.pdf) for the 14 domains and authoritative practice text.

## 14 CMMC Domains

### Access Control (AC)

Controls who can access systems and data based on approved authorizations.

**Key practices**:

- AC.L1-3.1.1: Limit access to authorized users
- AC.L1-3.1.2: Limit access to transaction types
- AC.L2-3.1.20: External connections control
- AC.L2-3.1.22: Control public information

### Audit and Accountability (AU)

Maintains audit logs to detect and respond to cyber incidents.

**Key practices**:

- AU.L2-3.3.1: Create/protect audit records
- AU.L2-3.3.2: Ensure actions traced to users
- AU.L2-3.3.8: Protect audit information

### Awareness and Training (AT)

Ensures personnel are trained in cybersecurity.

**Key practices**:

- AT.L2-3.2.1: Security awareness training
- AT.L2-3.2.2: Personnel training for security roles
- AT.L2-3.2.3: Recognize and report insider threat indicators

### Configuration Management (CM)

Establishes and maintains baseline configurations.

**Key practices**:

- CM.L2-3.4.1: Baseline configurations
- CM.L2-3.4.2: Security configuration settings
- CM.L2-3.4.7: Least functionality principle

### Identification and Authentication (IA)

Verifies identities of users and devices.

**Key practices**:

- IA.L1-3.5.1: Identify users/devices
- IA.L1-3.5.2: Authenticate users/devices
- IA.L2-3.5.3: Multi-factor authentication (MFA)
- IA.L2-3.5.7: Password complexity and change of characters
- IA.L2-3.5.10: Store/transmit passwords encrypted

### Incident Response (IR)

Detects and responds to cybersecurity incidents.

**Key practices**:

- IR.L2-3.6.1: Incident handling capability
- IR.L2-3.6.2: Track/document/report incidents
- IR.L2-3.6.3: Test incident response capability

### Maintenance (MA)

Manages system maintenance and repair.

**Key practices**:

- MA.L2-3.7.1: Perform scheduled maintenance
- MA.L2-3.7.2: Control tools, techniques, mechanisms and personnel used to conduct maintenance
- MA.L2-3.7.5: Multifactor authentication for nonlocal maintenance

### Media Protection (MP)

Protects digital and non-digital media.

**Key practices**:

- MP.L1-3.8.3: Sanitize/destroy media
- MP.L2-3.8.1: Protect/control media
- MP.L2-3.8.2: Limit access to CUI on media

### Personnel Security (PS)

Screens and monitors personnel.

**Key practices**:

- PS.L2-3.9.1: Screen personnel
- PS.L2-3.9.2: Protect CUI during personnel actions

### Physical Protection (PE)

Limits physical access to systems and facilities.

**Key practices**:

- PE.L1-3.10.1: Limit physical access
- PE.L1-3.10.3: Escort visitors
- PE.L1-3.10.4: Maintain physical access logs

### Risk Assessment (RA)

Manages organizational risk to operations and assets.

**Key practices**:

- RA.L2-3.11.1: Periodic risk assessments
- RA.L2-3.11.2: Scan for vulnerabilities
- RA.L2-3.11.3: Remediate vulnerabilities

### Security Assessment (CA)

Develops and implements activities to assess security effectiveness.

**Key practices**:

- CA.L2-3.12.1: Periodic security assessments
- CA.L2-3.12.2: Develop and implement plans of action
- CA.L2-3.12.4: System security plans

### System and Communications Protection (SC)

Monitors and controls communications at system boundaries.

**Key practices**:

- SC.L1-3.13.1: Boundary protection
- SC.L2-3.13.8: Transmission confidentiality/integrity
- SC.L2-3.13.11: Cryptographic protection

### System and Information Integrity (SI)

Identifies and manages information system flaws.

**Key practices**:

- SI.L1-3.14.1: Identify/report/correct flaws
- SI.L1-3.14.2: Malicious code protection
- SI.L2-3.14.4: Update malicious code protection

## Output

1. **Domain Overview**: Purpose and objectives
2. **Practice List**: All practices in domain by level
3. **Implementation Guidance**: How to satisfy each practice
4. **Common Gaps**: Typical deficiencies found
5. **Evidence Requirements**: What C3PAOs look for
6. **NIST Mapping**: Correlation to NIST 800-171

## Examples

```bash
# Get guidance for Access Control domain
/cmmc:domain-guidance AC

# See Level 2 practices for Incident Response
/cmmc:domain-guidance IR 2

# Review Audit and Accountability requirements
/cmmc:domain-guidance AU
```
