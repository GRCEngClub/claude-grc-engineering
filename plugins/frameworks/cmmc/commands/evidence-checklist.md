---
description: Prepare a source-linked CMMC Level 2 evidence review worksheet
---

# CMMC Level 2 Evidence Review Worksheet

Use `/cmmc:evidence-checklist <practice-id>` to prepare a **draft**, not an assessment or certification. If the request is for Level 1 or 3, stop and consult the applicable official guide; do not apply this Level 2 worksheet as though it covered those levels.

## Sources and boundaries

- [NIST SP 800-171 Rev. 2](https://doi.org/10.6028/NIST.SP.800-171r2), requirements, and [NIST SP 800-171A](https://doi.org/10.6028/NIST.SP.800-171A), assessment procedures. Check the edition required by the applicable program and contract; do not silently substitute Rev. 3.
- [32 CFR Part 170](https://www.ecfr.gov/current/title-32/part-170) and the current [DoD CMMC resources](https://dowcio.war.gov/cmmc/Resources-Documentation/). Confirm current program guidance and contractual requirements with the responsible assessor or counsel.
- The former checklist asserted universal quarterly reviews, four consecutive quarters, three-year retention and fixed sample sizes. Do **not** treat those assertions as CMMC requirements. Establish any such requirement from an applicable authoritative source or contract; otherwise label it as a local choice.

## Workflow

1. Ask for the assessment type, applicable contract and requirements edition, assessment boundary, practice ID, and intended review period. Mark unknowns **not provided**; do not infer scope or assessment outcomes.
2. Look up the exact practice and its assessment objective and determination statements in the applicable official assessment source. List each source-verified objective or determination statement identifier, if present and cite the source and version. Use the existing `cmmc-assessment-objectives` skill as a navigation aid, not a substitute for the source.
3. For each objective, identify candidate examine, interview, and test activities appropriate to the boundary. Identify artifact owners and a secure evidence reference. Suggestions are not mandatory evidence or a universal sampling rule.
4. Record observed evidence, gaps, limitations, and a human review decision separately. Do not mark an objective met without supporting evidence and authorized assessor review. Do not generate or infer a compliance percentage or certification.
5. Store evidence and the completed worksheet only in approved, access-controlled storage. Never commit actual evidence, credentials, CUI, personal data, or sensitive links to source control. Determine retention, transmission and access rules with the data owner.

## Worksheet template

```markdown
# Level 2 practice evidence review — DRAFT
Assessment type / contract / source edition: [not provided]
Boundary and review period: [not provided]
Practice and source URL: [not provided]
Assessor / reviewer: [not provided]

| Objective ID and source | Candidate E/I/T activity | Evidence reference / owner | Observation and limitation | Human review status |
|---|---|---|---|---|
| [ID] | [activity] | [secure reference] | [observed facts or not provided] | [not reviewed] |

Open questions / gaps: [not provided]
Next action and owner: [not provided]
```

## Synthetic walkthrough

For `/cmmc:evidence-checklist AC.L2-3.1.1`, first verify the source edition and objective wording and any identifiers in the official assessment source. If no boundary or evidence is supplied, the worksheet must leave those fields **not provided**, list no invented observations, and leave human review **not reviewed**. An access inventory could be a candidate for examination, subject to the assessor's scoping decision; it alone is not proof that the practice is met.
