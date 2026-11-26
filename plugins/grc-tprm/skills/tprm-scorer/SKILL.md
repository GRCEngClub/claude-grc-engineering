---
name: tprm-scorer
description: Rates vendor residual risk from the inherent tier and evidence-based control strength across seven domains, using a fixed matrix so ratings are repeatable. Applies profile checks for PCI DSS, DORA, and HIPAA scope; recommends treatment and reassessment timing. Used by /grc-tprm:score-risk.
allowed-tools: Read, Write, Glob
---

# TPRM Scorer

Produces a residual risk rating that is explainable in one table. Weighted point scores tend to produce false precision ("63.5") and hide the one failure that matters, so this model rates each control domain Strong, Adequate, or Weak from evidence and reads the result off a matrix.

## Inputs

- Tier from the vendor record (`./grc-data/vendors/<vendor-id>.json`) or the assessment. The tier is inherent risk.
- Findings, questionnaire analysis, and SOC report review from the assessment folder.

No reviewed evidence, no score. Return "Insufficient evidence" and the list of what is missing.

## Domains

Independent assurance; identity and access; data protection; vulnerability management; incident response; resilience; fourth parties. The Strong, Adequate, and Weak definitions are in `/grc-tprm:score-risk`. Rate from evidence; where only a questionnaire answer exists, the domain is at most Adequate.

## Combining

- Control strength is Strong (no Weak domains, at least half Strong), Adequate (at most one Weak domain, not assurance or identity for critical or high tiers), Weak, or Insufficient evidence.
- Residual rating comes from the tier × control strength matrix.
- Profile checks (PCI DSS AOC and responsibility split; DORA Article 30 contract provisions for critical or important functions; a HIPAA business associate agreement before PHI is shared) raise the rating one level when they fail.

## Treatment and timing

| Rating | Treatment | Reassess |
|---|---|---|
| Critical | Do not proceed, or executive risk acceptance with a dated plan | Within 3 months, or when the plan completes |
| High | Approve with conditions; risk register entry | 6 to 12 months |
| Medium | Approve; track findings | Per tier cadence |
| Low | Approve | Per tier cadence |

Tier cadence: critical and high every 12 months, medium every 24, low at renewal (at most 36). PCI DSS in-scope providers are checked at least every 12 months regardless (12.8.4).

## Reporting

Show the tier and its reason, each domain's rating with the evidence behind it, control strength, residual rating, profile checks, treatment, and next reassessment date. With `--compare`, list vendors of the same tier or service and their ratings, so inconsistent ratings stand out.

## Framework references

- ISO/IEC 27001:2022 A.5.19 and A.5.22
- SOC 2 CC9.2
- NIST CSF 2.0 GV.SC-04 and GV.SC-07
- DORA Articles 28 and 30
- PCI DSS v4.0.1 12.8.4 and 12.8.5
