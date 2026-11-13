---
description: Prepare a CMMC readiness assessment by level
---

# CMMC Assessment

Use `/cmmc:assess <level> [scope]` for a preliminary readiness review, not an official assessment or certification. Ask for the applicable contract, assessment type, boundary, review period, and authoritative source edition. Record unknowns rather than guessing. Verify current requirements and program status before advising.

The existing `cmmc-expert` and `cmmc-assessment-objectives` skills provide background and source-based objective navigation. For a Level 2 practice, use `/cmmc:evidence-checklist <practice-id>` to create an evidence review worksheet. Level 1 and Level 3 require separate source- and contract-specific review; do not extrapolate the Level 2 workflow to them.

For a Level 2 planning aid, use `/cmmc:assessment-plan [scope]`; it is a draft for qualified review, not an assessment or certification.

For each in-scope requirement, provide its source and version, evidence references, observed gaps, limitations, reviewer, and next actions. Mark items without sufficient evidence **not assessed**. Do not claim certification, invent a readiness percentage, or assume a third-party assessment is required for every Level 2 contract. Any final assessment outcome requires authorized human review.

## Sources

- [32 CFR Part 170](https://www.ecfr.gov/current/title-32/part-170) and [current DoD CMMC resources](https://dowcio.war.gov/cmmc/Resources-Documentation/).
- [NIST SP 800-171 Rev. 2](https://doi.org/10.6028/NIST.SP.800-171r2) and [NIST SP 800-171A](https://doi.org/10.6028/NIST.SP.800-171A). Confirm the applicable editions.
- [July 2026 DoD announcement](https://business.defense.gov/cmmc/) regarding suspension of Phase II and its program review. Check for later updates and assess the particular contract rather than assuming the previously published phase schedule is in effect.

## Example

```text
/cmmc:assess 2 "Access Control"
```

When no scope or evidence is provided, output questions and unassessed items, not findings or a passing score.
