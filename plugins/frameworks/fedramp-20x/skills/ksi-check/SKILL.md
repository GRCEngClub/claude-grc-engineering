---
name: ksi-check
description: Check FedRAMP 20X Key Security Indicators compliance
---

# KSI Check

Evaluates compliance with FedRAMP 20X Key Security Indicators.

## Arguments

- Argument 1 - KSI category (optional, defaults to all)
- Argument 2 - Evidence path (optional)

## KSI Categories

| Code | Category | Focus |
|------|----------|-------|
| AFR | Access and Flow Restriction | Network segmentation, access controls |
| CED | Configuration and Event Data | Logging, monitoring, SIEM |
| CMT | Configuration Management and Tracking | Asset inventory, baselines |
| CNA | Cloud Native Architecture | Container security, orchestration |
| IAM | Identity and Access Management | Authentication, authorization |
| INR | Incident Notification and Reporting | Incident response, communication |
| MLA | Malware Analysis | Endpoint protection, threat detection |
| PIY | Physical and Infrastructure Security | Data center, physical controls |

## 20X Approach

FedRAMP 20X emphasizes:

- **Automated validation** over manual assessment
- **Continuous monitoring** over point-in-time audits
- **Machine-readable policies** over PDF documents
- **Evidence automation** over manual collection

## Output

- KSI compliance status by category
- Automation readiness assessment
- Gap analysis against 20X requirements
- Integration recommendations

## Example

```bash
/fedramp-20x:ksi-check IAM
/fedramp-20x:ksi-check all ./evidence/
```
