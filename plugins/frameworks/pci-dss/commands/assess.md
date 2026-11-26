---
description: Assess PCI DSS v4.0.1 compliance readiness
---

# PCI DSS Assessment

Evaluates readiness for PCI DSS v4.0.1 compliance.

## Arguments

- Argument 1 - Assessment type (optional: merchant, service-provider)
- Argument 2 - Merchant level (optional: 1, 2, 3, 4)

## Merchant Levels

| Level | Criteria | Validation |
|-------|----------|------------|
| 1 | >6M transactions/year | Annual ROC by QSA |
| 2 | 1-6M transactions/year | Annual SAQ |
| 3 | 20K-1M e-commerce transactions | Annual SAQ |
| 4 | <20K e-commerce or <1M other | Annual SAQ |

## Service Provider Levels

| Level | Criteria | Validation |
|-------|----------|------------|
| 1 | >300K transactions/year | Annual ROC by QSA |
| 2 | <300K transactions/year | Annual SAQ-D |

## Assessment Output

- Compliance readiness score by requirement (1-12)
- Gap analysis against v4.0.1
- March 2025 mandatory requirement status
- Recommended validation type (ROC vs SAQ)
- Remediation priorities

## Example

```bash
/pci-dss:assess merchant 2
/pci-dss:assess service-provider
```
