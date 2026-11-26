---
description: Assess compliance with NIST 800-53 controls
---

# NIST 800-53 Assessment

Evaluates compliance against NIST 800-53 control families.

## Arguments

- Argument 1 - Control family or baseline (required: AC, AT, AU, etc. or low, moderate, high)
- Argument 2 - Revision (optional: r4, r5, defaults to r5)

## Control Families

| ID | Family |
|----|--------|
| AC | Access Control |
| AT | Awareness and Training |
| AU | Audit and Accountability |
| CA | Assessment, Authorization, and Monitoring |
| CM | Configuration Management |
| CP | Contingency Planning |
| IA | Identification and Authentication |
| IR | Incident Response |
| MA | Maintenance |
| MP | Media Protection |
| PE | Physical and Environmental Protection |
| PL | Planning |
| PM | Program Management |
| PS | Personnel Security |
| PT | PII Processing and Transparency |
| RA | Risk Assessment |
| SA | System and Services Acquisition |
| SC | System and Communications Protection |
| SI | System and Information Integrity |
| SR | Supply Chain Risk Management |

## Example

```bash
/nist:assess moderate
/nist:assess AC r5
```
