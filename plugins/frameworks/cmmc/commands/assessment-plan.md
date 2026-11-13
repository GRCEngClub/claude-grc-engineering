---
description: Draft a source-linked CMMC Level 2 assessment plan
---

# CMMC Level 2 assessment plan — draft aid

Use `/cmmc:assessment-plan [scope]` to prepare an editable planning aid for a Level 2 readiness review, self-assessment, or C3PAO assessment. This is not an official C3PAO form, assessment, certification, or determination of CMMC status. A qualified CMMC assessor and the organization must review the plan; their actual procedures and current contract govern. For Level 1 or Level 3, stop and use level-specific official sources instead. Do not infer the assessment type from CUI alone.

## Source checks

- Check the contract, current program guidance and [32 CFR 170.14](https://www.ecfr.gov/current/title-32/section-170.14), [170.16](https://www.ecfr.gov/current/title-32/section-170.16), [170.17](https://www.ecfr.gov/current/title-32/section-170.17), and [170.19](https://www.ecfr.gov/current/title-32/section-170.19) for model, self-assessment, certification and scope respectively. Check the [DoD CMMC resources](https://dowcio.war.gov/cmmc/Resources-Documentation/) and current program status.
- Level 2 currently uses [NIST SP 800-171 Rev. 2](https://doi.org/10.6028/NIST.SP.800-171r2) requirements and [NIST SP 800-171A June 2018](https://doi.org/10.6028/NIST.SP.800-171A) assessment procedures under Part 170. Verify applicability and editions before use; do not substitute Rev. 3. If a source cannot be checked, record it as unverified.
- For scoring and any conditional status or POA&M, consult [170.24](https://www.ecfr.gov/current/title-32/section-170.24) and [170.21](https://www.ecfr.gov/current/title-32/section-170.21); the plan itself does not decide eligibility or calculate a score.

## Instructions

1. Ask for contract and assessment type (Self, C3PAO, or readiness), scope and boundary, source editions, review period, contacts, SSP and inventory references. Keep absent inputs **[not provided]**; do not invent scope, evidence, results, approval, or status. If the contract or assessment type is unknown, keep it unverified and do not select a submission path.
2. Record a proposed boundary, CUI flows, asset categories, external providers and responsibility references. Identify exclusions and their rationale as proposals for human review, not automatic scope decisions. Check the SSP, network diagram, inventory and provider treatment against section 170.19.
3. Identify the applicable requirements and source-verified assessment objectives. Plan appropriate examine, interview and test activities, evidence references, owners and proposed timing. Sampling and candidate artifacts are planning decisions, not universal mandated samples. Use `/cmmc:evidence-checklist <practice-id>` for objective-level worksheets.
4. Separate pending activities from observations. All requirements without sufficient evidence and human review remain **not assessed**. Record limitations and open decisions. Have the organization and qualified reviewer resolve scope and methods before execution; this plan does not authorize submission.
5. Keep completed plans, CUI and evidence in approved access-controlled storage; use secure references rather than embedding sensitive materials. Never commit actual evidence, credentials, CUI, personal data or sensitive links to source control. Confirm handling, sharing and retention with the data owner and applicable requirements.

## Copyable plan template

```markdown
# Level 2 assessment plan — DRAFT / NOT AN ASSESSMENT
- Organization and authorized contact: [not provided]
- Contract / applicable clauses and assessment type (Self / C3PAO / readiness): [not provided]
- Source editions, URLs, verification date and program applicability: [not provided]
- Proposed assessment dates and review period: [not provided]
- Proposed boundary, locations, systems and CUI flows: [not provided]
- Asset categories, proposed exclusions and rationale: [not provided]
- Providers, services, responsibilities and customer responsibility matrix references: [not provided]
- SSP name, version and date; inventory and network diagram references: [not provided]
- Assessment team / roles, organization contact and reviewer: [not provided]

| Requirement / objective and source | Proposed examine / interview / test | Secure evidence reference and owner | Timing | Status / limitations |
|---|---|---|---|---|
| [not provided] | [not provided] | [not provided] | [not provided] | not assessed |

- Scope, source or access questions and dependencies: [not provided]
- Proposed milestones and responsible owners: [not provided]
- Human review / approval, reviewer and date: [not provided]
- Changes and disposition of open questions: [not provided]
```

## Synthetic walkthrough

Request: `/cmmc:assessment-plan` with no contract, scope, or evidence. Return the copyable template with those fields **[not provided]**, status **not assessed**, and questions asking for assessment type, boundary, applicable contract and sources. Do not choose Self or C3PAO, claim a finding, invent evidence, or present the draft as approved. Once a source-verified objective is supplied, an interview or document examination can be proposed for reviewer approval; it is not proof of implementation.
