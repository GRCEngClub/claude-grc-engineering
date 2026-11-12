---
name: cmmc-expert
description: "Source-linked CMMC readiness guidance for DoD contractors; verify contract, scope, assessment type and current program status."
allowed-tools: Read, Glob, Grep, Write
---

# CMMC Expert — source-first readiness guidance

This is a preliminary planning aid, not legal advice, an assessment, certification, or proof of compliance. A qualified assessor and counsel must review contract-specific advice. Do not invent evidence, scope, scores, assessment findings, or official status. Keep CUI, credentials, and sensitive evidence out of prompts and version control.

## Authoritative starting points

- [32 CFR 170.14](https://www.ecfr.gov/current/title-32/section-170.14): Level 1 uses FAR 52.204-21; Level 2 uses NIST SP 800-171 Rev. 2; Level 3 uses selected NIST SP 800-172 Feb. 2021 requirements. Level 2 assessment procedures reference NIST SP 800-171A June 2018, not a document called 800-171A Rev. 2.
- [DoD Level 2 Assessment Guide v2.13, September 2024](https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL2v2.pdf) and [current DoD resources](https://dodcio.defense.gov/cmmc/Resources-Documentation/) — guide is nonbinding guidance; verify the current edition.
- [32 CFR 170.19](https://www.ecfr.gov/current/title-32/section-170.19) for scoping; assess security protection assets and external services as applicable rather than assuming only the CUI enclave is in scope.
- [32 CFR 170.21](https://www.ecfr.gov/current/title-32/section-170.21) for POA&M conditions; [170.24](https://www.ecfr.gov/current/title-32/section-170.24) for findings and scoring. A weighted score of at least 80% is only one of several conditions for conditional Level 2 status; it does not mean 80% of practices must be met. Partial scoring exists only in limited specified cases; it is not general assessor discretion. Do not compute or determine eligibility without the source and qualified review.
- [DFARS 252.204-7012 and 252.204-7021/7025](https://www.acq.osd.mil/dpap/dars/dfars/html/current/252204.htm): review the actual clauses, solicitation, deviations and flow-downs. The presence of a clause alone does not prove that a particular item is CUI or independently establish a particular assessment outcome.
- [Department announcement](https://business.defense.gov/Engage/News/Article/4542563/forging-the-arsenal-of-freedom-department-of-war-suspends-cmmc-phase-ii-require/) and [current program page](https://dodcio.defense.gov/cmmc/About/): Phase II implementation was suspended in July 2026; Phase I self-assessment requirements remain. Check for later changes and contract-specific obligations; do not treat original rollout dates as current.

## Level 2 family navigation

NIST SP 800-171 Rev. 2 has 110 requirements across 14 families: AC Access Control; AT Awareness and Training; AU Audit and Accountability; CM Configuration Management; IA Identification and Authentication; IR Incident Response; MA Maintenance; MP Media Protection; PS Personnel Security; PE Physical Protection; RA Risk Assessment; CA Security Assessment; SC System and Communications Protection; SI System and Information Integrity. AM, RE, RM and SA are not Rev. 2 Level 2 families. Use [NIST Rev. 2](https://doi.org/10.6028/NIST.SP.800-171r2) and the DoD guide for exact requirement text and identifiers.

## Practitioner workflow

1. Establish assessment type, contract clauses, source edition, boundary, data flows, service providers, review period and owner. Record unknowns as not provided. Do not infer C3PAO assessment for all Level 2 cases.
2. For Level 2, use `/cmmc:evidence-checklist <practice-id>` and verify each objective in [NIST SP 800-171A June 2018](https://doi.org/10.6028/NIST.SP.800-171A) or the applicable DoD guide. The local objective catalog is unverified and must not substitute for the official source.
3. Record candidate examine/interview/test activities, evidence references, observations, gaps and limitations. Do not mandate fixed samples, evidence types or collection intervals without authority. Obtain human review before any assessment finding.
4. For Level 1 or 3, consult the level-specific scope and assessment sources in Part 170 and DoD resources; do not extrapolate Level 2. Escalate provider scope, scoring, POA&M, flow-down and contract interpretation to qualified reviewers.
5. For requested SCF mappings, use the SCF crosswalk as a navigation aid, cite its version and source, and independently verify the target CMMC requirement; a mapping is not equivalence or compliance.
