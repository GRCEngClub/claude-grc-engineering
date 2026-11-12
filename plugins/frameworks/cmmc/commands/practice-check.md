---
description: Verify specific CMMC practice implementation
---

# CMMC Practice Check

> **Review required:** This material is an unverified working aid, not an authoritative assessment or legal determination. Verify every control, objective, scope, assessment type, scoring and contractual claim against current official sources and obtain qualified CMMC and contracting review before use. If a source or contract is unavailable, mark the conclusion unverified; do not infer compliance.

Validates implementation of specific CMMC v2.0 practices and provides evidence guidance.

## Arguments

- `$1` - Practice ID (required, e.g., AC.L2-3.1.1, IA.L2-3.5.7)
- `$2` - Check type (optional: implementation, evidence, gaps)

## Practice ID Format

**Structure**: `[DOMAIN].[LEVEL]-[NIST-ID]`

- **Domain**: Two-letter abbreviation (AC, IA, SI, etc.)
- **Level**: L1, L2, or L3
- **NIST ID**: Corresponding NIST 800-171 control number

**Examples**:

- `AC.L1-3.1.1` - Access Control, Level 1, NIST 3.1.1
- `IA.L2-3.5.7` - Identification & Authentication, Level 2, NIST 3.5.7 (password complexity and change of characters)
- `AU.L2-3.3.1` - Audit & Accountability, Level 2, NIST 3.3.1 (Audit records)

## Check Types

### Implementation Check

Validates that the practice is properly implemented:

- Technical controls in place
- Processes documented
- Responsibilities assigned
- Operating effectiveness

### Evidence Check

Reviews evidence artifacts for C3PAO assessment:

- Documentation completeness
- Evidence currency (recent)
- Artifact authenticity
- Coverage of practice requirements

### Gap Analysis

Identifies deficiencies in current state:

- Missing controls
- Partial implementations
- Documentation gaps
- Remediation priorities

See the [DoD CMMC model](https://dodcio.defense.gov/Portals/0/Documents/CMMC/ModelOverview_V2.0_FINAL2_20211202_508.pdf) for authoritative practice identifiers and text.

## Common Practices

### Access Control

- **AC.L1-3.1.1**: Limit system access to authorized users, processes, devices
- **AC.L1-3.1.2**: Limit system access to types of transactions/functions
- **AC.L2-3.1.20**: Verify and control external network connections

### Identification & Authentication

- **IA.L1-3.5.1**: Identify information system users
- **IA.L1-3.5.2**: Authenticate (or verify) identities
- **IA.L2-3.5.3**: MFA for local and network access to privileged accounts and network access to non-privileged accounts
- **IA.L2-3.5.7**: Password complexity and change of characters
- **IA.L2-3.5.8**: Prohibit password reuse for a specified number of generations
- **IA.L2-3.5.10**: Store and transmit only cryptographically-protected passwords

### Incident Response

- **IR.L2-3.6.1**: Establish incident handling capability
- **IR.L2-3.6.2**: Track, document, and report incidents

### System Integrity

- **SI.L1-3.14.1**: Identify, report, and correct information system flaws
- **SI.L1-3.14.2**: Provide protection from malicious code
- **SI.L2-3.14.4**: Update malicious code protection mechanisms

## Output

1. **Practice Definition**: What the practice requires
2. **Implementation Guidance**: How to satisfy the practice
3. **Evidence Examples**: What artifacts to provide
   - Policies and procedures
   - Screenshots/configurations
   - Logs and reports
   - Test results
4. **Common Deficiencies**: What C3PAOs flag
5. **Pass/Fail Criteria**: Assessment thresholds
6. **Remediation Steps**: If gaps identified

## Examples

```bash
# Check MFA implementation for Level 2
/cmmc:practice-check IA.L2-3.5.3 implementation

# Review evidence for access control
/cmmc:practice-check AC.L1-3.1.1 evidence

# Gap analysis for incident response
/cmmc:practice-check IR.L2-3.6.1 gaps

# Verify audit logging implementation
/cmmc:practice-check AU.L2-3.3.1
```
