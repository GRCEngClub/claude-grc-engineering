---
description: Review and validate evidence artifacts against control requirements
---

# Review Evidence

Reviews evidence artifacts to validate they satisfy control requirements.

## Arguments

- Argument 1 - Evidence file or directory path (required)
- Argument 2 - Control ID or framework (optional)

## Instructions

1. Analyze the provided evidence artifacts for:
   - Completeness (does it cover the control requirement?)
   - Timeliness (is the evidence current?)
   - Relevance (does it actually demonstrate the control?)
   - Authenticity (are there signs of tampering or inconsistency?)

2. Generate an evidence review report including:
   - Evidence summary
   - Control mapping
   - Gaps identified
   - Recommendations

## Examples

```bash
# Review SOC 2 evidence
/auditor:review-evidence ./evidence/access-reviews.pdf CC6.1

# Review PCI-DSS evidence
/auditor:review-evidence ./evidence/mfa-logs.pdf 8.4.2

# Review ISO 27001 evidence
/auditor:review-evidence ./evidence/backup-policy.pdf A.8.13
```
