---
name: cmmc-expert
description: "CMMC v2.0 expert for DoD contractors. Covers NIST 800-171 Rev 2 (14 families, 110 controls), SPRS scoring, POA&M rules, 32 CFR Part 170, DFARS clauses, scoping, ESP/CSP, C3PAO assessment lifecycle, and Rev 2 → Rev 3 transition."
allowed-tools: Read, Glob, Grep, Write
---

# CMMC Expert

> **Review required:** This material is an unverified working aid, not an authoritative assessment or legal determination. Verify every control, objective, scope, assessment type, scoring and contractual claim against current official sources and obtain qualified CMMC and contracting review before use. If a source or contract is unavailable, mark the conclusion unverified; do not infer compliance.

Deep, practitioner-grade expertise in the Cybersecurity Maturity Model Certification (CMMC) v2.0 for Department of Defense contractors. Built from the authoritative chain: **NIST SP 800-171 Rev 2** (control text), **NIST SP 800-171A (June 2018)** (assessment procedures), **32 CFR Part 170** (CMMC program rule), and **48 CFR / DFARS Part 204.75** (acquisition rule).

## 1. Program Overview & Authority

**Purpose:** Standardize verification of NIST SP 800-171 cybersecurity controls across the Defense Industrial Base (DIB) protecting Controlled Unclassified Information (CUI) and Federal Contract Information (FCI).

**Authority chain:**

- **32 CFR Part 170** — CMMC program rule. Effective **December 16, 2024**.
- **48 CFR / DFARS Part 204.75** — Acquisition rule that puts CMMC into contracts. Effective **November 10, 2025**.
- **DFARS 252.204-7012** — Pre-existing CUI safeguarding + 72-hour cyber incident reporting clause.
- **DFARS 252.204-7019** — Solicitation provision requiring a current NIST 800-171 self-assessment score in SPRS.
- **DFARS 252.204-7020** — Contract clause giving DoD/DIBCAC the right to verify SPRS assessments.
- **DFARS 252.204-7021** — The primary CMMC certification requirement clause.
- **DFARS 252.204-7025** — Solicitation provision identifying the required CMMC level for a given procurement.

**Authoritative sources to cite in deliverables:**

- NIST SP 800-171 Rev 2 — https://doi.org/10.6028/NIST.SP.800-171r2 (Final, including updates as of 01-28-2021; withdrawn May 14, 2024 but remains operative for CMMC).
- NIST SP 800-171A (June 2018) — assessment procedures, 320 objectives.
- CMMC Assessment Guide L2 (current version on dodcio.defense.gov).
- CMMC Scoping Guide L2.
- CMMC Scoring Methodology.
- 32 CFR Part 170 (89 FR 83214, Oct. 15, 2024).

### Implementation status requires current verification

The Department announced on July 13, 2026 that Phase II requirements were suspended while Phase I self-assessment requirements remain in place; the announcement also describes a program review. See the [official announcement and current resource links](https://business.defense.gov/cmmc/). Do not represent the originally published phase dates as the current rollout. Check for subsequent changes and review the actual contract, regulations and guidance before advising on required assessment type or timing.

---

## 2. CMMC Levels (L1 / L2 / L3)

| Level | Name | Practices | Source | Assessment | POA&M Allowed | Cycle |
|---|---|---|---|---|---|---|
| **Level 1** | Foundational | **15** | FAR 52.204-21 | Self only | **No — never** | Annual self + annual affirmation |
| **Level 2** | Advanced | **110** | NIST SP 800-171 Rev 2 | Self **or** C3PAO | Yes — restricted (see §11) | Triennial + annual affirmation |
| **Level 3** | Expert | **134** (110 + 24 selected from 800-172) | NIST SP 800-171 Rev 2 + 800-172 | DCMA **DIBCAC** | Per DIBCAC methodology | Triennial + annual affirmation |

**Acronyms used here (correctly):**

- **OSA** — Organization Seeking Assessment.
- **OSC** — Organization Seeking Certification (used specifically in C3PAO context; OSA/OSC are largely interchangeable in practice).
- **C3PAO** — Certified Third-Party Assessor Organization. Accredited by the Cyber AB.
- **CCA** — Certified CMMC Assessor. Assessment personnel must meet the applicable Tier 3 investigation or equivalence requirements in [32 CFR 170.9(b)(3)–(4)](https://www.ecfr.gov/current/title-32/section-170.9#p-170.9(b)(3)).
- **CCP** — Certified CMMC Professional (support role).
- **DIBCAC** — **Defense Industrial Base Cybersecurity Assessment Center** (DCMA's assessment arm; conducts L3 assessments and high-water-mark L2 verifications).
- **DC3** — DoD Cyber Crime Center (recipient of malware samples under DFARS 7012).
- **eMASS** — Enterprise Mission Assurance Support Service (DoD system where C3PAO assessment results are posted).
- **SPRS** — Supplier Performance Risk System (where self-assessment scores and CMMC Status live).

**Who needs what:**

- Verify the solicitation or contract and applicable clauses before assigning a status; if unavailable, leave it unverified.
- FCI-only subcontracts subject to [32 CFR 170.23](https://www.ecfr.gov/current/title-32/section-170.23) require L1 (Self); CUI subcontract minimums depend on the prime requirement. The [DFARS 252.204-7021(f)](https://www.acquisition.gov/dfars/252.204-7021-contractor-compliance-cybersecurity-maturity-model-certification-level-requirements.) flow-down excludes commercially available off-the-shelf items.
- The contract specifies the required CMMC level and assessment type, including any Level 3 requirement.

---

## 3. NIST 800-171 Rev 2 — 14 Families, 110 Controls

**These are the only 14 families in Rev 2.** Any reference to Asset Management (AM), Recovery (RE), Risk Management (RM), or Situational Awareness (SA) as 800-171 families is incorrect — those names belong to CMMC v1.0 or to other catalogs.

| # | ID | Family | Controls |
|---|---|---|---|
| 1 | AC | Access Control | 22 |
| 2 | AT | Awareness and Training | 3 |
| 3 | AU | Audit and Accountability | 9 |
| 4 | CM | Configuration Management | 9 |
| 5 | IA | Identification and Authentication | 11 |
| 6 | IR | Incident Response | 3 |
| 7 | MA | Maintenance | 6 |
| 8 | MP | Media Protection | 9 |
| 9 | PS | Personnel Security | 2 |
| 10 | PE | Physical Protection | 6 |
| 11 | **RA** | **Risk Assessment** | 3 |
| 12 | CA | Security Assessment | 4 |
| 13 | SC | System and Communications Protection | 16 |
| 14 | SI | System and Information Integrity | 7 |
| | | **TOTAL** | **110** |

**Numbering scheme:** `Chapter.Family.Requirement` (e.g., 3.1.1 = Chapter 3, AC family, Requirement 1). Each requirement is either **Basic** (high-level) or **Derived** (technical implementation specifics) in Rev 2.

---

## 4. Assessment objectives

Consult [NIST SP 800-171A (June 2018)](https://doi.org/10.6028/NIST.SP.800-171A) directly for the applicable assessment objective and determination statements. Some statements are lettered; others, including 3.13.11, are unlettered. Verify labels and wording in the source; do not invent letter suffixes.

## 5. Assessment Methods — Examine / Interview / Test

Per **NIST SP 800-171A (June 2018)**, assessors use exactly **three** methods (not four). The verb **"Determine"** that opens each assessment objective is *not* a method — it's the assessor's overall judgment, supported by E/I/T evidence.

| Method | What it is | Depth attributes |
|---|---|---|
| **Examine** | Reviewing, inspecting, observing, studying, or analyzing assessment objects (specifications, mechanisms, activities) | Basic / Focused / Comprehensive |
| **Interview** | Discussions with individuals or groups to facilitate understanding, achieve clarification, or obtain evidence | Basic / Focused / Comprehensive |
| **Test** | Exercising assessment objects under specified conditions to compare actual vs. expected behavior | Basic (black box) / Focused (gray box) / Comprehensive (white box) |

**Assessment objects** assessors examine or test:

- **Specifications** — policies, procedures, plans, SSP, designs, requirements.
- **Mechanisms** — hardware, software, firmware controls.
- **Activities** — operations, exercises, backup runs.
- **Individuals** — system owners, admins, security personnel, users.

**Evidence planning:** Documents, technical artifacts, and interviews are possible assessment inputs; select methods and objects appropriate to the requirement, assessment scope, and official assessment guidance. No universal three-item evidence requirement is implied.

---

## 6. CUI & FCI — Definitions, Marking, Boundary

### FCI — Federal Contract Information

- Information **provided by or generated for** the Government under a contract.
- Not intended for public release.
- FCI and CUI definitions can overlap; identify each under its applicable definition.
- FCI alone does not categorically trigger a CMMC assessment. Check [32 CFR 170.3](https://www.ecfr.gov/current/title-32/section-170.3), the solicitation or contract, applicable phase-in and exceptions, and the required status.
- Examples: pricing, delivery schedules, contract-related correspondence.

### CUI — Controlled Unclassified Information

- Information **requiring safeguarding or dissemination controls** per law, regulation, or government-wide policy.
- Governed by **32 CFR Part 2002** and the **CUI Registry** at `cui.archives.gov`.
- The CUI Registry contains the authoritative list of CUI categories (organized under ~20 organizational index groupings), each with its own marking and handling rules.
- CUI alone does not categorically trigger a CMMC assessment or select its level. Check [32 CFR 170.3](https://www.ecfr.gov/current/title-32/section-170.3), the solicitation or contract, applicable phase-in and exceptions, and the required status.
- DFARS 252.204-7012 alone does not establish that a contractor possesses CUI. Examine contract information, markings and flows; consult the contracting officer when uncertain. See [48 CFR 252.204-7012](https://www.ecfr.gov/current/title-48/section-252.204-7012).

**Two flavors:**

- **CUI Basic** — review the applicable CUI safeguarding rules and contractual requirements, including when 800-171 applies.
- **CUI Specified** — the underlying authority specifies particular safeguarding or dissemination requirements; consult the relevant CUI Registry category.

**Confidentiality impact value:** No less than FIPS 199 **moderate**.

**Boundary scoping:** Assess the relevant system and asset categories under [32 CFR 170.19](https://www.ecfr.gov/current/title-32/section-170.19); do not assume that only assets directly handling CUI are relevant.

**Marking expectations:**

- Banner markings on the document.
- Category identification (e.g., `CUI//SP-PRVCY`).
- Dissemination controls if applicable.

---

## 7. CMMC Scoping Guide — Asset Categories

Per **32 CFR 170.19** and the CMMC L2 Scoping Guide, each asset falls into one of five categories. Proper categorization can dramatically reduce assessment burden and cost.

| Category | What it is | CMMC treatment |
|---|---|---|
| **CUI Assets** | Process, store, or transmit CUI | **All 110 controls apply** |
| **Security Protection Assets** | Provide security services to CUI Assets (firewalls, IDS/IPS, SIEM, VPN, MDM, patch mgmt, AD/LDAP) — may not touch CUI directly | Applicable security requirements apply |
| **Contractor Risk Managed Assets (CRMA)** | Can, but are not intended to, process, store, or transmit CUI because of policies, procedures and practices | SSP review; limited checks may be warranted under Table 3 |
| **Specialized Assets** | Can process, store, or transmit CUI but cannot be fully secured, including certain OT, IoT and GFE | Document and manage using risk-based policies; SSP review, not other CMMC security requirements at Level 2 |
| **Out-of-Scope Assets** | Cannot process, store, or transmit CUI, do not protect CUI assets, and are physically or logically separated | Prepare to justify inability to process, store or transmit CUI; in-scope categories cannot be out of scope |

### Scope-Reduction Plays

1. **CMMC enclave** — isolate CUI into a dedicated environment; assess all applicable asset categories, including security protection assets outside the enclave.
2. **Remove CUI from systems** that don't need it; reassess their asset category rather than assuming they exit scope.
3. **FedRAMP-authorized CSP** — document shared responsibilities; authorization does not eliminate customer-side obligations.
4. **Genuinely isolated systems** — air-gapped test networks with no path to CUI.

### CUI Identification — Required Before Scoping

1. Map every contract containing DFARS 252.204-7012 or 7021.
2. Identify what data Government provides or contractor generates that qualifies as CUI.
3. Trace CUI flow — email, file shares, cloud, mobile, backups, vendors.
4. Document in SSP, including **data flow diagrams** (C3PAOs expect these).

---

## 8. ESP / CSP Rules

The most commonly misunderstood area of CMMC. ESPs and CSPs follow **different** rules.

### Cloud Service Provider (CSP)

A CSP is a cloud service provider; a CSP may also be an ESP, including when it processes, stores, or transmits Security Protection Data (SPD) without CUI.

- For an external cloud service provider handling covered defense information under DFARS 7012, the clause requires security requirements equivalent to the FedRAMP Moderate baseline and specified incident-related obligations; review the contract and applicable clause. See [48 CFR 252.204-7012(b)(2)(ii)(D)](https://www.ecfr.gov/current/title-48/section-252.204-7012).
- For Level 2 certification, the cloud offering processing CUI must be FedRAMP Moderate (or higher) authorized **or** meet equivalent security requirements in accordance with DoD policy; the on-premises infrastructure connecting to it is in scope. CRM security requirements must be documented or referenced in the SSP. See [32 CFR 170.17(c)(5)](https://www.ecfr.gov/current/title-32/section-170.17#p-170.17(c)(5)).
- Do not assume every CSP is outside assessment scope: see the SPD-only row below. FedRAMP authorization alone does not resolve customer responsibilities.

**Common CSP options for CUI:**

Verify the exact offering and authorization boundary in the [FedRAMP Marketplace](https://marketplace.fedramp.gov/) and applicable DoD policy; platform names alone do not establish authorization, equivalence, or suitability for specific data.

**ITAR/EAR caution:** A CSP can be FedRAMP-authorized **and** technically eligible — but still ineligible to process specific CUI categories due to export-control restrictions on foreign-national access. Evaluate CUI category restrictions independently of FedRAMP authorization.

### External Service Provider (ESP)

An ESP can be a CSP or a non-CSP. Classify the service using what it processes, stores, or transmits, not merely whether it is cloud-based.

**Common ESPs:** MSSPs (SOC, SIEM), MSPs (patching, endpoint management), outsourced IT/AD admins, physical security monitoring vendors.

**Level 2 scoping:** [32 CFR 170.19(c)(2)(i), Table 4](https://www.ecfr.gov/current/title-32/section-170.19#p-170.19(c)(2)(i)) distinguishes:

| Data handled | CSP | Non-CSP ESP |
|---|---|---|
| CUI, with or without SPD | Meet FedRAMP requirements in 48 CFR 252.204-7012 | Services are in the OSA assessment scope and assessed as part of that assessment |
| SPD without CUI | Services are in scope and assessed as Security Protection Assets | Services are in scope and assessed as Security Protection Assets |
| Neither CUI nor SPD | Does not meet the CMMC definition of an ESP | Does not meet the CMMC definition of an ESP |

Under [170.19(c)(2)(ii)](https://www.ecfr.gov/current/title-32/section-170.19#p-170.19(c)(2)(ii)), document the ESP, relationship and services in the SSP, and describe them in the service description and CRM. Voluntary ESP certification may reduce the ESP's effort during the OSA assessment; it does **not** automatically exempt services from assessment. For non-CSP ESPs handling CUI, [170.17(c)(6)](https://www.ecfr.gov/current/title-32/section-170.17#p-170.17(c)(6)) addresses Level 2 certification, including assessment of services used to meet OSA requirements against all Level 2 requirements. Level 3 has a separate [Table 6](https://www.ecfr.gov/current/title-32/section-170.19#p-170.19(d)(2)(i)); Level 1 scoping differs.

---

## 9. Subcontractor Flow-Down (32 CFR 170.23)

Per the regulation (unless DoD specifies otherwise), the **prime contractor** determines the CMMC level required for each subcontractor based on the data the sub will handle.

| Prime's requirement | Sub handling FCI only | Sub handling CUI |
|---|---|---|
| L2 (Self) | L1 minimum | L2 (Self) minimum |
| L2 (C3PAO) | L1 minimum | **L2 (C3PAO) minimum** |
| L3 (DIBCAC) | L1 minimum | L2 (C3PAO) minimum (unless DoD specifies higher) |

**Prime obligations:**

- Verify subcontractor CMMC compliance **at time of award**, not just at solicitation response.
- Verify via SPRS (sub's CMMC Status should be visible — access mechanics still maturing).
- Include DFARS 252.204-7021 flow-down clause in subcontracts.

**Practical advisory:** Build supplier cybersecurity verification into procurement processes; check current phase-in and applicable contract requirements.

---

## 10. SPRS Scoring Mechanics

### Score vs. Status — Two Different Things

| Concept | What it is | Where it lives |
|---|---|---|
| **SPRS Score** | Numerical (e.g., 98/110) from DoD Assessment Methodology self-assessment | SPRS (contractor-submitted) |
| **CMMC Status** | Categorical (Conditional L2 / Final L2 / etc.) from a CMMC assessment under 32 CFR 170 | SPRS (self) or eMASS (C3PAO) |

A DFARS assessment score alone does not establish CMMC Level 2 (Self) status; consult [32 CFR 170.16](https://www.ecfr.gov/current/title-32/section-170.16) for assessment, status, and affirmation requirements.

### DoD Assessment Methodology — Three Tiers

Under DFARS 252.204-7019/7020:

| Tier | Conducted by | Rigor | SPRS effect |
|---|---|---|---|
| Basic | Contractor self | Low (honor system) | Contractor submits score |
| Medium | DoD records/interview review | Medium | DoD adjusts score if gaps found |
| High | **DIBCAC** on-site | High | DIBCAC score supersedes contractor's |

### Scoring Formula

```
SPRS = 110 − Σ (deductions for not-implemented or partially-implemented controls)
```

- **Starting score:** 110.
- **Point weights per practice:** **5 (High criticality), 3 (Medium), 1 (Low)** — set by the CMMC Scoring Methodology.
- **Deduction:** Apply the specified scoring methodology, not discretionary partial credit. [32 CFR 170.24](https://www.ecfr.gov/current/title-32/section-170.24) specifies adjusted deductions for IA.L2-3.5.3 and SC.L2-3.13.11 in particular circumstances; the requirements remain NOT MET when not fully implemented.
- **Conditional Level 2:** assessment score divided by the total number of Level 2 requirements must be ≥ 0.8, alongside all other POA&M conditions. This is a weighted score, not a count of MET practices. See [32 CFR 170.21(a)(2)](https://www.ecfr.gov/current/title-32/section-170.21).
- **Final status:** **110/110** with all practices Met (no open POA&Ms).
- Score can go negative (theoretical floor around −203).

### Practice Weights

Consult the enumerated weights and exceptions in [32 CFR 170.24](https://www.ecfr.gov/current/title-32/section-170.24); do not infer a weight from a practice name.

---

## 11. POA&M Rules — Critical Section

A Plan of Action & Milestones is a time-bound documented plan to remediate identified deficiencies. Under CMMC, POA&Ms are **not** a general remediation tool — they are tightly restricted.

### The Three Golden Rules

**Rule 1 — Level 1 = NO POA&Ms ever.** Per 32 CFR 170.21(a)(1). All 15 FAR 52.204-21 practices must be fully implemented at time of self-assessment submission. No exceptions.

**Rule 2 — Level 2 POA&Ms require a passing score of ≥ 80%.** Per 32 CFR 170.21(a)(2)(i). Assessment score ÷ total number of Level 2 requirements must be ≥ 0.8, and the other conditions in [32 CFR 170.21(a)(2)](https://www.ecfr.gov/current/title-32/section-170.21) must also be met. This is not a count of MET practices.

**Rule 3 — Only 1-point practices on POA&M, with one exception.** Per 32 CFR 170.21(a)(2)(ii). No practice on a POA&M may have a point value greater than 1. The single exception: **SC.L2-3.13.11 (FIPS-validated cryptography)** may be on a POA&M at its **3-point** value **only if encryption is in use but not yet FIPS-validated**. If encryption is not employed at all, 3.13.11 carries its full 5-point weight and is not POA&M-eligible.

### FIPS encryption and conditional status

Under [32 CFR 170.24](https://www.ecfr.gov/current/title-32/section-170.24), the deduction is 3 points if encryption is employed but not FIPS-validated, and 5 if encryption is not employed. The former may be included on a Level 2 POA&M only when all applicable conditions in [32 CFR 170.21](https://www.ecfr.gov/current/title-32/section-170.21) are satisfied. Encryption alone does not establish eligibility or that the requirement is MET.

### Controls That CANNOT Be on a POA&M

Per [32 CFR 170.21(a)(2)(iii)](https://www.ecfr.gov/current/title-32/section-170.21), the following are explicitly ineligible regardless of point value:

- AC.L2-3.1.20 and AC.L2-3.1.22 (CUI data)
- CA.L2-3.12.4 (system security plan)
- PE.L2-3.10.3, PE.L2-3.10.4 and PE.L2-3.10.5 (CUI data)

The point-value restriction and encryption exception in Rule 3 also apply. Verify all conditions against the current regulation.

### Valid POA&M Entry — Required Fields

1. **Description** of the deficiency (specific practice + why not met).
2. **Responsible party** (named individual, not "IT department").
3. **Resource requirements** (budget, personnel, tooling).
4. **Specific milestone dates** (not "TBD" or "within 6 months").
5. **Estimated completion date** within the **180-day** conditional window.
6. **Current status**, updated as remediation progresses.

### Closeout Process

1. Remediate within **180 days**.
2. Conduct closeout assessment (self or C3PAO — matching original assessment type).
3. Post results in the applicable system and verify that all conditions for Final status have been met.
4. Confirm the resulting status; do not assume an automatic upgrade.

### If POA&M Not Closed in 180 Days

- Conditional CMMC Status **expires**.
- Review award eligibility, contractual obligations and the path to a current status with the contracting officer and qualified counsel; do not assume consequences or a particular reassessment path.

### Operational POA&M vs. CMMC POA&M

Operational POA&Ms (continuous improvement tracking under normal NIST practice) are separate from CMMC assessment POA&Ms (formal regulatory constructs with 180-day clocks). Don't conflate them.

---

## 12. Findings Language

At the **assessment objective** level, each AO produces one of:

- **Satisfied** — the objective is met based on evidence collected.
- **Other Than Satisfied (OTS)** — the objective is not met.

At the **practice** level, the rollup is:

- **MET** — *all* AOs within the practice are Satisfied.
- **NOT MET** — one or more AOs are Other Than Satisfied. Applicable adjusted deductions under [32 CFR 170.24](https://www.ecfr.gov/current/title-32/section-170.24) do not create a PARTIAL practice status.
- **NOT APPLICABLE** — control does not apply to the assessed scope (must be justified and documented in the SSP).

Findings language convention in deliverables:

- State the AO citation (e.g., `3.1.1[a]`).
- State the method that produced the finding (Examine / Interview / Test).
- State the artifact or response that demonstrates the gap.
- Map to the SPRS point impact (1 / 3 / 5).
- Identify POA&M eligibility status.

---

## 13. C3PAO Assessment Lifecycle

### Pre-Assessment

1. **OSC selects C3PAO** from the Cyber AB marketplace.
2. **Scope determination** under 32 CFR 170.19 — asset categorization, CUI boundary.
3. **Documentation review** — C3PAO reviews SSP, policies, procedures before going on-site.
4. **Readiness/gap assessment** (optional but strongly recommended). **A C3PAO cannot both consult and certify** the same OSC — readiness reviews must come from a different C3PAO or independent consultant.
5. **Artifact preparation** — evidence packages mapped to 800-171A objectives.

### Assessment

1. **Initiation** — CMMC UID assigned (10-character identifier).
2. **Team composition** — at least two people: a Lead CCA and at least one other CCA; additional CCAs and CCPs may participate. A separate CCA performs quality assurance and cannot be a member of the team for that assessment. See [32 CFR 170.9(b)(12)–(13)](https://www.ecfr.gov/current/title-32/section-170.9#p-170.9(b)(12)).
3. **Assessment activities** — Examine / Interview / Test against every applicable AO.
4. **Scoring** — each practice MET or NOT MET per its AOs.
5. **POA&M determination** — which gaps qualify for POA&M.

### Post-Assessment

1. C3PAO posts results to **CMMC-eMASS**; CMMC Status (Conditional or Final) appears in SPRS.
2. **Certificate of CMMC Status** issued.
3. **Evidence retention:** artifacts hashed (NIST-approved algorithm) and retained for **6 years** from CMMC Status Date.
4. C3PAO uploads artifact names, hash values, and algorithm identifiers to eMASS.

### C3PAO Rules (32 CFR 170.9 / 170.11)

- Accredited by the Cyber AB.
- Assessment personnel must meet Tier 3 investigation or applicable equivalence requirements under 170.9(b)(3)–(4).
- Level 2 certification assessment activities must be performed on the information system within the assessment scope under [170.9(b)(15)](https://www.ecfr.gov/current/title-32/section-170.9#p-170.9(b)(15)).
- **Prohibited** from providing consulting/implementation services to OSCs they certify.
- Assessment information is strictly confidential.

### L2 (Self) — Non-C3PAO Process

1. Self-assess against 800-171A objectives.
2. Apply 32 CFR 170.19 scoping.
3. Score per 32 CFR 170.24.
4. Upload to SPRS.
5. Senior official affirms per 32 CFR 170.22.
6. CMMC Status posted in SPRS.

---

## 14. Annual Affirmation & False Claims Act Risk

### Annual Affirmation (32 CFR 170.22)

Under [32 CFR 170.22(a)–(b)](https://www.ecfr.gov/current/title-32/section-170.22), each OSA's authorized senior-level Affirming Official submits the affirmation **in SPRS**, attesting that all applicable requirements for the status are implemented and will remain implemented for all systems within the relevant assessment scope. The regulation does not prescribe a blanket attestation that no material changes have occurred.

Submit upon Conditional status, upon Final status, after POA&M closeout where applicable, and annually following a Final status date; Level 1 is at completion and annually thereafter. Level 3 requires annual affirmations of both Level 2 (C3PAO) and Level 3 (DIBCAC) status. See [170.22(a)(3), (b)(1)–(4)](https://www.ecfr.gov/current/title-32/section-170.22#p-170.22(a)(3)).

### False Claims Act Exposure

CMMC creates real FCA exposure — context every client conversation should include:

- **FCA liability:** Up to **3× government damages** + per-claim penalties for knowingly false certifications.
- **DOJ Civil Cyber-Fraud Initiative** addresses certain cybersecurity-related false claims; consult current DOJ guidance and counsel.
- **Recent precedent:** Multiple multi-million-dollar settlements against defense contractors that falsely certified cybersecurity compliance.
- **Personal liability:** The signing senior official is personally certifying.

**What creates exposure:**

1. Submitting an inflated SPRS score.
2. Knowingly false annual affirmation.
3. Certifying a bid as CMMC-compliant when the OSC knows it isn't.
4. Prime contractor knowingly ignoring sub's false claims.

**No safe-harbor assurance:** accurate reporting and remediation do not by themselves establish contract eligibility, satisfy all obligations, or insulate an organization or individual from liability. CMMC conditional status has specific eligibility and closeout rules in [32 CFR 170.21](https://www.ecfr.gov/current/title-32/section-170.21). Consult qualified legal counsel about the facts and applicable obligations.

---

## 15. Revision transition

For applicable CMMC requirements, consult [32 CFR 170.14](https://www.ecfr.gov/current/title-32/section-170.14) and the contract to identify the incorporated edition. Do not substitute NIST SP 800-171 Rev 3 for an applicable Rev 2 requirement. For transition planning, use NIST's [Rev 2 to Rev 3 comparison resources](https://csrc.nist.gov/projects/protecting-controlled-unclassified-information) and verify individual mappings; a crosswalk does not establish compliance. Rev 2 requirement 3.3.7 does not prescribe NTP; consult [NIST SP 800-171 Rev 2](https://doi.org/10.6028/NIST.SP.800-171r2).

## 16. Candidate Level 2 review topics

These are prompts for evidence review, not automatic failures. Determine applicability, examine the relevant source and actual implementation, and obtain qualified assessor review before making a finding.

- **MFA:** Review coverage of local and network access to privileged accounts and network access to non-privileged accounts under 3.5.3. SMS or push alone is not automatically a failure of that requirement; check the applicable contract and any additional requirements separately.
- **Access authorization:** Review authorized users, processes and devices, access restrictions, and least privilege under 3.1.1 and 3.1.5. Missing periodic account-review records alone do not automatically establish failure of those requirements; investigate other relevant evidence and requirements.
- **Other topics:** Review configuration baselines, incident response, security logging, cryptographic protection, vulnerability scanning, and system security plans against the applicable requirement and evidence. Missing or incomplete evidence warrants investigation, not an invented outcome.

---

## 17. Authoritative Sources

### Primary

- **NIST SP 800-171 Rev 2** — https://doi.org/10.6028/NIST.SP.800-171r2
- **NIST SP 800-171A (June 2018)** — [assessment procedures](https://doi.org/10.6028/NIST.SP.800-171A)
- **NIST SP 800-172** — Enhanced Security Requirements (L3 source)
- **32 CFR Part 170** — CMMC program rule (89 FR 83214, Oct. 15, 2024; effective Dec. 16, 2024)
- **48 CFR Part 204.75 (DFARS)** — CMMC acquisition rule (effective Nov. 10, 2025)
- **DFARS 252.204-7012 / -7019 / -7020 / -7021 / -7025**
- **FAR 52.204-21** — Basic Safeguarding (CMMC L1 source)
- **32 CFR Part 2002** — CUI program rule
- **CUI Registry** — `cui.archives.gov`

### CMMC Program Documents

- **CMMC Model v2.0**
- **CMMC Assessment Guide — Level 1**
- **CMMC Assessment Guide — Level 2**
- **CMMC Assessment Guide — Level 3**
- **CMMC Scoping Guide — Level 1**
- **CMMC Scoping Guide — Level 2**
- **CMMC Scoring Methodology**
- **DoD Assessment Methodology** (basis for SPRS scoring)

Authoritative locations: `dodcio.defense.gov/CMMC/`, `cyber.mil`, `cyberab.org`, `sprs.csd.disa.mil`, `dibnet.dod.mil` (incident reporting).

---

## Capabilities

This skill supports:

- CMMC level selection and CUI boundary scoping
- Per-control (and per-AO) implementation guidance for all 110 800-171 Rev 2 practices
- SSP development, review, and gap mapping
- Assessment objective-level evidence planning
- C3PAO assessment readiness preparation
- POA&M development with eligibility validation against 32 CFR 170.21
- SPRS score calculation against the CMMC Scoring Methodology
- ESP/CSP scoping decisions and FedRAMP equivalency analysis
- Subcontractor flow-down planning
- Annual affirmation workflow and FCA-risk advisory
- Rev 2 → Rev 3 crosswalk and ODP planning
- DFARS clause interpretation across 7012, 7019, 7020, 7021, 7025
