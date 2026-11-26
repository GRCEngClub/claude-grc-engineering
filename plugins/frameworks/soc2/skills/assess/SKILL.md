---
name: assess
description: Assess readiness for SOC 2 audit
---

# SOC 2 Assessment

Evaluates organizational readiness for SOC 2 Type I or Type II audit.

## Arguments

- Argument 1 - Assessment scope (optional: security, availability, confidentiality, processing-integrity, privacy)
- Argument 2 - Audit type (optional: type1, type2)

## Trust Service Criteria

- **Security (CC)** - Common Criteria (always in scope)
- **Availability (A)** - System availability commitments
- **Confidentiality (C)** - Protection of confidential information
- **Processing Integrity (PI)** - Accurate and complete processing
- **Privacy (P)** - Personal information handling

## Assessment Output

- Readiness score by Trust Service Category
- Control gaps identified
- Evidence requirements
- Remediation recommendations
- Timeline to audit readiness

## Example

```bash
/soc2:assess security type2
```
