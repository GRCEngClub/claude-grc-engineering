---
description: Assess compliance with ISO 27001 requirements
---

# ISO 27001 Assessment

Evaluates ISMS compliance against ISO 27001:2022 requirements.

## Arguments

- Argument 1 - Assessment scope (optional: isms, annexa, specific-control)
- Argument 2 - Control domain (optional, for Annex A assessment)

## Assessment Areas

### ISMS Clauses (4-10)

- Clause 4: Context of the Organization
- Clause 5: Leadership
- Clause 6: Planning
- Clause 7: Support
- Clause 8: Operation
- Clause 9: Performance Evaluation
- Clause 10: Improvement

### Annex A Control Domains (2022)

- A.5: Organizational Controls (37 controls)
- A.6: People Controls (8 controls)
- A.7: Physical Controls (14 controls)
- A.8: Technological Controls (34 controls)

## Output

- Compliance status by clause/control
- Gap analysis
- Statement of Applicability guidance
- Certification readiness assessment

## Example

```bash
/iso:assess annexa A.8
```
