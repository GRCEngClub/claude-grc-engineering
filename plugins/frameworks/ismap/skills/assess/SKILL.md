---
name: assess
description: Assess ISMAP compliance readiness for Japanese government cloud
---

# ISMAP Assessment

Evaluates readiness for Information System Security Management and Assessment Program (ISMAP) compliance for Japanese government cloud services.

## Arguments

- Argument 1 - Assessment scope (optional: full, iso-mapping, readiness) - defaults to "full"

## ISMAP Overview

**Authority**: Japanese Government Digital Agency
**Base Standards**: ISO/IEC 27001:2013 structure (current control criteria; a draft revision adopts ISO/IEC 27001:2022), ISO/IEC 27017:2015, ISO/IEC 27018:2019
**Scope**: Cloud service providers for Japanese government agencies

## ISO Standard Mapping

| Standard | Focus | Controls |
|----------|-------|----------|
| **ISO 27001** | Information Security Management System | 114 controls (Annex A) |
| **ISO 27017** | Cloud-specific security | Additional cloud controls (CLD prefix) |
| **ISO 27018** | PII protection in cloud | Privacy controls for personal data |

## 12 Core Control Areas

1. **Organization of Information Security** (A.5, A.6)
2. **Human Resource Security** (A.7)
3. **Asset Management** (A.8)
4. **Access Control** (A.9)
5. **Cryptography** (A.10)
6. **Physical and Environmental Security** (A.11)
7. **Operations Security** (A.12)
8. **Communications Security** (A.13)
9. **Supplier Relationships** (A.15)
10. **Incident Management** (A.16)
11. **Business Continuity** (A.17)
12. **Compliance** (A.18)

## Japanese Data Residency

**Regions Required**: ap-northeast-1 (Tokyo), ap-northeast-3 (Osaka)

## Examples

```bash
/ismap:assess full
/ismap:assess iso-mapping
```
