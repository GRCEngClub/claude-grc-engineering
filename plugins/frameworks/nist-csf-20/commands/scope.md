---
description: Determine NIST CSF 2.0 applicability, Profile scope, Tier target, and Function selection for the organization
---

# NIST CSF 2.0 Scope

Determines how **NIST Cybersecurity Framework v2.0** should be applied to the organization. CSF is voluntary and cross-sector — there is no "in scope vs out of scope" determination in the regulatory sense. Instead, this command answers the practitioner questions: *which Functions, which Profile target, which Tier target, which sector overlay?*

## Usage

```
/nist-csf-20:scope
```

## What this produces

- **Applicability rationale** — *why* the organization is using CSF (federal contract, sector regulator alignment, board reporting, internal management), and what that implies for breadth/depth
- **Functions in scope** — typically all six (GV, ID, PR, DE, RS, RC), but a Profile may legitimately defer some Subcategories
- **Tier target** — Tier 1, 2, 3, or 4, with rationale grounded in risk tolerance and resourcing
- **Profile starting point** — build from scratch, adapt a published Community Profile, or migrate from an existing CSF 1.1 Profile
- **Sector overlays** — which sector regulator(s) the CSF Profile must support (HIPAA, GLBA, PCI DSS, NERC CIP, FFIEC, TSA, etc.)
- **Next steps** — whether to proceed with `/nist-csf-20:evidence-checklist` (collection) or `/nist-csf-20:assess` (gap analysis)

## Pre-scope questions

Before producing scope output, confirm with the user:

### 1. Why is the organization using CSF?

Pick the *primary* driver (multiple may apply, but one usually dominates):

- **Federal contract requirement** — solicitation explicitly references CSF or asks for a Profile
- **Sector regulator alignment** — CSF Profile feeds into HIPAA, GLBA, PCI DSS, NERC CIP, FFIEC, TSA, or similar examinations
- **EO 14028 / critical infrastructure** — operator of critical infrastructure adopting the U.S. national cybersecurity baseline
- **SEC cybersecurity disclosure** — public company structuring its Reg S-K Item 106 disclosures around CSF Functions
- **Cyber insurance** — carrier requesting CSF Profile / Tier as part of underwriting
- **Board / audit committee reporting** — CISO needs a stable communication framework for governance reporting
- **Internal program management** — first formal cybersecurity program, building from CSF as the structure
- **State affirmative-defense statute** — qualifying for a state safe-harbor in breach litigation (Connecticut, Ohio, Utah, others)
- **CSF 1.1 → 2.0 migration** — existing CSF 1.1 Profile being upgraded to CSF 2.0

The driver determines the level of evidence rigor and the cadence of reassessment.

### 2. Which version is in play?

- CSF 2.0 (this plugin) — published February 26, 2024
- CSF 1.1 — superseded but still referenced by some contracts and regulators

If existing artifacts reference 1.1, plan a migration. The Govern (GV) Function is new in 2.0; many ID Subcategories from 1.1 (especially supply chain) moved into GV.SC.

### 3. What sector(s) is the organization in?

CSF is cross-sector, but several **Community Profiles** exist for specific sectors. Using a Community Profile as the starting Target Profile is faster and more defensible than building from scratch. Confirm whether one applies:

- Manufacturing (CSF Manufacturing Profile)
- Election infrastructure
- Electric grid / energy sector
- Healthcare
- Telecommunications
- Federal civilian (alongside SP 800-53)
- Smart Grid / OT
- Other published Community Profiles — check the NIST CSF 2.0 Reference Tool

### 4. What other frameworks does the organization already comply with?

This dictates what evidence is reusable. Common combinations:

- **HIPAA Security Rule** — most ePHI controls roll up under PR.DS, PR.AA, DE.CM, RS.MA, RC.RP
- **PCI DSS v4.0.1** — cardholder data controls roll up under PR.DS, PR.AA, DE.CM
- **NIST SP 800-53 Rev. 5** — direct Informative Reference; FedRAMP / federal systems
- **NIST SP 800-171 Rev. 3 / CMMC** — DIB / CUI
- **ISO/IEC 27001:2022** — international ISMS; Annex A is an Informative Reference
- **CIS Controls v8** — community catalog; Informative Reference
- **GLBA Safeguards Rule** — financial institutions
- **SOX ITGCs** — public-company financial-reporting IT controls

Reuse evidence; do not collect twice.

### 5. What's the Tier target?

Refer the user to the SKILL's Tier section. Anchors:

- **Tier 1 (Partial)** — startup with limited cybersecurity capability; CSF being adopted as the structure for building a first program
- **Tier 2 (Risk Informed)** — established cybersecurity practices, but not consistently policy-backed or organization-wide. Common starting point for mid-market.
- **Tier 3 (Repeatable)** — formalized policies, consistent application, integrated supply chain risk management. Common target for regulated mid-market and large enterprise.
- **Tier 4 (Adaptive)** — risk management adapts based on lessons learned and predictive indicators; cybersecurity culturally integrated. High-resource organizations with high risk exposure.

A reasonable default for an organization in the "we should formalize this" stage is **Current Tier 1, Target Tier 3, achievable over 18–24 months** — but the right answer is whatever reflects the organization's actual risk tolerance and resourcing.

### 6. Which Functions are in scope?

The default is all six (GV, ID, PR, DE, RS, RC). Legitimate reasons to narrow:

- Pure design / architecture engagement → GV + ID + PR (defer DE/RS/RC if they're handled by a separate operations team)
- Incident readiness engagement → DE + RS + RC (assume GV/ID/PR baseline established)
- Governance refresh → GV alone (the new 2.0 Function), often done as a discrete project

Document the rationale; partial Function scope tends to surface during board reporting and is worth defending in writing.

## Output format

After collecting the answers above, produce a scope memo with:

```
NIST CSF 2.0 Scope — <Organization Name>

Driver:           <primary driver>
CSF version:      2.0  (migrating from 1.1: yes/no)
Sector(s):        <sectors>
Community Profile: <selected Community Profile or "build from scratch">
Functions in scope: GV, ID, PR, DE, RS, RC  (or narrowed list with rationale)
Tier — current:   <T1 / T2 / T3 / T4>
Tier — target:    <T1 / T2 / T3 / T4>
Reassessment cadence: annual / quarterly / triggered-only
Coexisting frameworks: <HIPAA / PCI DSS / 800-53 / ISO 27001 / etc>
Sector regulator overlays: <FERC/NERC, HHS/HPH, FFIEC, TSA, etc>
Next steps:       /nist-csf-20:evidence-checklist  →  /nist-csf-20:assess
```

## What this command does NOT do

- It does not impose Functions or Tiers — those are organizational decisions informed by risk tolerance and resourcing.
- It does not certify the organization as "CSF compliant" — there is no CSF certification (see SKILL: Common misinterpretations).
- It does not enumerate every Subcategory — that's `/nist-csf-20:assess` (control-by-control gap) and `/nist-csf-20:evidence-checklist` (per-Function evidence patterns).
- It does not replace sector-regulator scoping (HIPAA, PCI DSS, etc.). If the organization is regulated, run the regulator-specific scope command first; CSF scope is an overlay.

## Related commands

- `/nist-csf-20:assess` — run the gap assessment once scope is defined
- `/nist-csf-20:evidence-checklist` — enumerate evidence patterns per Function
- `/grc-engineer:gap-assessment general-nist-csf-2-0` — direct SCF-crosswalk-driven assessment
- `/grc-engineer:optimize-multi-framework` — when CSF is being implemented alongside multiple regulations
