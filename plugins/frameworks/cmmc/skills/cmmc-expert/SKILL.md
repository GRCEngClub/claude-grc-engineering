---
name: cmmc-expert
description: "CMMC v2.0 expert for DoD contractors. Covers NIST 800-171 Rev 2 (14 families, 110 controls), SPRS scoring, POA&M rules, 32 CFR Part 170, DFARS clauses, scoping, ESP/CSP, C3PAO assessment lifecycle, and Rev 2 → Rev 3 transition."
allowed-tools: Read, Glob, Grep, Write
---

# CMMC Expert

Deep, practitioner-grade expertise in the Cybersecurity Maturity Model Certification (CMMC) v2.0 for Department of Defense contractors. Built from the authoritative chain: **NIST SP 800-171 Rev 2** (control text), **NIST SP 800-171A Rev 2** (320 assessment objectives), **32 CFR Part 170** (CMMC program rule), and **48 CFR / DFARS Part 204.75** (acquisition rule).

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
- NIST SP 800-171A Rev 2 — assessment procedures, 320 objectives.
- CMMC Assessment Guide L2 (current version on dodcio.defense.gov).
- CMMC Scoping Guide L2.
- CMMC Scoring Methodology.
- 32 CFR Part 170 (89 FR 83214, Oct. 15, 2024).

### Four-Phase Implementation Timeline

All dates keyed to **November 10, 2025** (DFARS rule effective date).

| Phase | Window | What's in contracts |
|---|---|---|
| **Phase 1** | 2025-11-10 → 2026-11-09 | L1 (Self), L2 (Self); L2 (C3PAO) at DoD discretion |
| **Phase 2** | 2026-11-10 → 2027-11-09 | + L2 (C3PAO) as routine contractual requirement |
| **Phase 3** | 2027-11-10 → 2028-11-09 | + L3 (DIBCAC) for high-sensitivity programs |
| **Phase 4** | 2028-11-10 and beyond | All applicable solicitations require appropriate CMMC level |

Triennial re-assessment + annual affirmation throughout the certification cycle.

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
- **CCA** — Certified CMMC Assessor (must hold Tier 3 background investigation).
- **CCP** — Certified CMMC Professional (support role).
- **DIBCAC** — **Defense Industrial Base Cybersecurity Assessment Center** (DCMA's assessment arm; conducts L3 assessments and high-water-mark L2 verifications).
- **DC3** — DoD Cyber Crime Center (recipient of malware samples under DFARS 7012).
- **eMASS** — Enterprise Mission Assurance Support Service (DoD system where C3PAO assessment results are posted).
- **SPRS** — Supplier Performance Risk System (where self-assessment scores and CMMC Status live).

**Who needs what:**

- Handles FCI only → L1.
- Handles CUI → L2 (Self) or L2 (C3PAO) per the contract.
- Sensitive national-security CUI → L3.

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

## 4. 320 Assessment Objectives (NIST SP 800-171A Rev 2)

Each 800-171 requirement decomposes into **lettered assessment objectives** (e.g., 3.1.1[a]–[f]). All objectives within a practice must be satisfied for the practice to be **Met** in a C3PAO assessment.

| Family | Controls | Assessment Objectives |
|---|---|---|
| 3.1 Access Control | 22 | **70** |
| 3.2 Awareness & Training | 3 | 9 |
| 3.3 Audit & Accountability | 9 | 29 |
| 3.4 Configuration Management | 9 | **44** |
| 3.5 Identification & Authentication | 11 | 25 |
| 3.6 Incident Response | 3 | 14 |
| 3.7 Maintenance | 6 | 10 |
| 3.8 Media Protection | 9 | 15 |
| 3.9 Personnel Security | 2 | 4 |
| 3.10 Physical Protection | 6 | 16 |
| 3.11 Risk Assessment | 3 | 9 |
| 3.12 Security Assessment | 4 | 14 |
| 3.13 System & Comms Protection | 16 | **41** |
| 3.14 System & Info Integrity | 7 | 20 |
| **TOTAL** | **110** | **320** |

### High-Complexity Controls (5+ Objectives)

These drive the bulk of assessment effort and evidence burden:

| Control | Objectives | Evidence focus |
|---|---|---|
| 3.4.7 | **15** | Port/protocol/service documentation (most objectives of any control) |
| 3.13.1 | 8 | Network boundary definition + monitoring/control/protection |
| 3.4.5 | 8 | Change control access restrictions (physical AND logical) |
| 3.12.4 | 8 | SSP completeness (boundary, environment, connections, update freq) |
| 3.6.1 | 7 | IRP covering all incident response phases |
| 3.6.2 | 6 | Incident reporting chain (internal + external) |
| 3.1.1 | 6 | User/device/process inventory + access restrictions |
| 3.1.20 | 6 | External system agreements + connection controls |
| 3.3.1 | 6 | Audit log configuration + retention policy |
| 3.3.8 | 6 | Log protection controls |
| 3.4.1 | 6 | Baseline config + asset inventory |
| 3.13.2 | 6 | Secure architecture documentation |
| 3.14.1 | 6 | Flaw ID/report/correct with defined timeframes |
| 3.1.3 | 5 | Data flow diagrams + flow enforcement |
| 3.1.22 | 5 | Public web content review process |

---

## 5. Assessment Methods — Examine / Interview / Test

Per **NIST SP 800-171A Rev 2**, assessors use exactly **three** methods (not four). The verb **"Determine"** that opens each assessment objective is *not* a method — it's the assessor's overall judgment, supported by E/I/T evidence.

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

**Practitioner rule of thumb:** For each AO, the OSC should be able to produce (1) the document/specification, (2) the technical artifact or screenshot showing the mechanism is configured, and (3) at least one person who can speak to operating the control.

---

## 6. CUI & FCI — Definitions, Marking, Boundary

### FCI — Federal Contract Information

- Information **provided by or generated for** the Government under a contract.
- Not intended for public release.
- Not classified, not CUI.
- Triggers **CMMC Level 1** safeguarding (FAR 52.204-21).
- Examples: pricing, delivery schedules, contract-related correspondence.

### CUI — Controlled Unclassified Information

- Information **requiring safeguarding or dissemination controls** per law, regulation, or government-wide policy.
- Governed by **32 CFR Part 2002** and the **CUI Registry** at `cui.archives.gov`.
- The CUI Registry contains the authoritative list of CUI categories (organized under ~20 organizational index groupings), each with its own marking and handling rules.
- Triggers **CMMC Level 2** (or L3 for sensitive programs).
- Practical rule: **If DFARS 252.204-7012 is in your contract, you have CUI. Full stop.**

**Two flavors:**

- **CUI Basic** — default safeguarding standard; 800-171 applies.
- **CUI Specified** — additional handling requirements per the CUI category (e.g., ITAR, EAR, Privacy, Critical Infrastructure).

**Confidentiality impact value:** No less than FIPS 199 **moderate**.

**Boundary scope rule (key to scoping):** 800-171 requirements apply only to components that **process, store, or transmit CUI**, or that **provide protection** for such components.

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
| **Contractor Risk Managed Assets (CRMA)** | Can technically reach CUI Assets but aren't required to process CUI (jump hosts, admin workstations) | Contractor-developed risk-based approach, documented |
| **Specialized Assets** | OT/ICS, IoT, Government Furnished Equipment | Tailored — document applicability and any compensating controls in the SSP |
| **Out-of-Scope Assets** | Isolated; no connection path to CUI systems | **Not** subject to CMMC — but isolation must be **technically demonstrated**, not merely asserted |

### Scope-Reduction Plays

1. **CMMC enclave** — isolate CUI into a dedicated environment (separate network segment, separate AD tenant, separate cloud tenant). Only the enclave is in scope.
2. **Remove CUI from systems** that don't need it; document the removal; those systems exit scope.
3. **FedRAMP-authorized CSP** — offload controls to the CSP for the cloud portion.
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

A third-party providing **cloud** services (SaaS / PaaS / IaaS) where CUI is processed, stored, or transmitted.

- **FedRAMP Moderate authorization required**, per DFARS 252.204-7012 and 252.239-7010.
- **Equivalency option** exists ("equivalent to FedRAMP Moderate" via a DoD-approved process) but is complex and rarely used.
- The OSA's on-premises infrastructure **connecting** to the CSP **is** in scope. The CSP environment itself is verified via FedRAMP, not as part of the CMMC assessment.
- The CSP must provide a **Customer Responsibility Matrix (CRM)** showing which controls are the CSP's vs. the customer's. The OSC's SSP documents customer-side implementation of shared controls.

**Common CSP options for CUI:**

| Platform | FedRAMP | Notes |
|---|---|---|
| Microsoft 365 GCC High | High | Suitable for most DoD CUI, including ITAR |
| Microsoft Azure Government | High | |
| AWS GovCloud | High | |
| Microsoft 365 GCC | Moderate | Limited CUI types; **not** suitable for ITAR/EAR |
| Google Workspace Enterprise | Moderate (some configurations) | Validate per use case |

**ITAR/EAR caution:** A CSP can be FedRAMP-authorized **and** technically eligible — but still ineligible to process specific CUI categories due to export-control restrictions on foreign-national access. Evaluate CUI category restrictions independently of FedRAMP authorization.

### External Service Provider (ESP)

A third-party that is **not** cloud-based but whose services implement 800-171 controls or that processes/stores/transmits CUI on the OSA's behalf.

**Common ESPs:** MSSPs (SOC, SIEM), MSPs (patching, endpoint management), outsourced IT/AD admins, physical security monitoring vendors.

**Rules (32 CFR 170.19 / 170.16):**

1. **ESP services are not exempt from assessment.** If an ESP implements CMMC controls for the OSA, those services are within the assessment scope.
2. The ESP's role and services must be **documented in the OSC's SSP** along with a CRM.
3. **ESP CMMC certification (optional, strongly recommended):** if the ESP holds a valid CMMC certification covering the services provided, those services may be accepted without separate re-assessment. If the ESP is **not** CMMC-certified, the C3PAO must assess them as part of the OSC's assessment — significantly expanding scope and cost.

**Decision tree:**

```
Is the third-party service cloud-based?
├── YES → CSP → FedRAMP Moderate (or higher) authorization required
└── NO  → ESP → Include in scope OR get ESP CMMC-certified
```

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

**Practical advisory:** Primes should build supplier cybersecurity verification into procurement processes now. Waiting until Phase 2/4 to verify subs will create supply chain disruptions.

---

## 10. SPRS Scoring Mechanics

### Score vs. Status — Two Different Things

| Concept | What it is | Where it lives |
|---|---|---|
| **SPRS Score** | Numerical (e.g., 98/110) from DoD Assessment Methodology self-assessment | SPRS (contractor-submitted) |
| **CMMC Status** | Categorical (Conditional L2 / Final L2 / etc.) from a CMMC assessment under 32 CFR 170 | SPRS (self) or eMASS (C3PAO) |

During Phase 1, a current SPRS score from a valid self-assessment **is** the CMMC L2 (Self) status.

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
- **Deduction:** full point value if Not Met; partial credit at assessor discretion for partially implemented controls.
- **Conditional pass threshold:** **≥ 88** (i.e., ≥ 80% of 110).
- **Final status:** **110/110** with all practices Met (no open POA&Ms).
- Score can go negative (theoretical floor around −203).

### High-Impact (5-Point) Practices

A single Not-Implemented finding on any of these costs 5 points and — for most of them — is **not** POA&M-eligible. Verify against the current CMMC Scoring Methodology before client-facing work.

- **AC.L2-3.1.1** — System access authorization
- **IA.L2-3.5.3** — Multifactor authentication
- **IA.L2-3.5.10** — Cryptographic password storage
- **IR.L2-3.6.1** — Incident response capability
- **IR.L2-3.6.2** — Incident tracking/reporting
- **MA.L2-3.7.5** — Remote maintenance MFA
- **RA.L2-3.11.2** — Vulnerability scanning
- **SC.L2-3.13.8** — CUI encryption in transit
- **SC.L2-3.13.10** — Cryptographic key management
- **SC.L2-3.13.11** — FIPS-validated cryptography *(special POA&M exception — see §11)*
- **SC.L2-3.13.16** — CUI encryption at rest
- **SI.L2-3.14.1** — Flaw remediation
- **SI.L2-3.14.2** — Malicious code protection
- **SI.L2-3.14.6** — System monitoring for attacks
- **CA.L2-3.12.4** — System Security Plan

---

## 11. POA&M Rules — Critical Section

A Plan of Action & Milestones is a time-bound documented plan to remediate identified deficiencies. Under CMMC, POA&Ms are **not** a general remediation tool — they are tightly restricted.

### The Three Golden Rules

**Rule 1 — Level 1 = NO POA&Ms ever.** Per 32 CFR 170.21(a)(1). All 15 FAR 52.204-21 practices must be fully implemented at time of self-assessment submission. No exceptions.

**Rule 2 — Level 2 POA&Ms require a passing score of ≥ 80%.** Per 32 CFR 170.21(a)(2)(i). Assessment score ÷ 110 must be ≥ 0.8 → **≥ 88 of 110 practices must be MET** before any POA&M is allowed.

**Rule 3 — Only 1-point practices on POA&M, with one exception.** Per 32 CFR 170.21(a)(2)(ii). No practice on a POA&M may have a point value greater than 1. The single exception: **SC.L2-3.13.11 (FIPS-validated cryptography)** may be on a POA&M at its **3-point** value **only if encryption is in use but not yet FIPS-validated**. If encryption is not employed at all, 3.13.11 carries its full 5-point weight and is not POA&M-eligible.

### The FIPS Exception — Three Scenarios

| Scenario | Encryption posture | Deduction | POA&M eligible? |
|---|---|---|---|
| A | None | 5 pts | **No** — assessment fails |
| B | In use, not FIPS-validated | 3 pts | **Yes** |
| C | FIPS-validated in use | 0 pts | n/a — fully Met |

**Practitioner play:** Before assessment, get clients to implement encryption (even if not yet FIPS-validated) — converts a disqualifying 5-point hit into a POA&M-eligible 3-point hit.

### Controls That CANNOT Be on a POA&M

Per 32 CFR 170.21(a)(2)(iii), the following are explicitly ineligible regardless of point value:

- **AC.L2-3.1.1** — Account management
- **AC.L2-3.1.2** — Access enforcement
- **AC.L2-3.1.20** — External system connections
- **AC.L2-3.1.22** — CUI on publicly accessible systems
- All 5-point practices (effectively, by Rule 3)
- Verify the full list against current 32 CFR 170.21 before client deliverables.

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
3. Post updated results: SPRS for Self, eMASS for C3PAO.
4. Status upgrades **Conditional → Final**.

### If POA&M Not Closed in 180 Days

- Conditional CMMC Status **expires**.
- Contractor is immediately ineligible for new awards requiring that level.
- Mid-performance contracts: standard contractual remedies apply.
- New assessment from scratch required to regain status.
- **No extension** — the 180 days is firm per regulation.

### Operational POA&M vs. CMMC POA&M

Operational POA&Ms (continuous improvement tracking under normal NIST practice) are separate from CMMC assessment POA&Ms (formal regulatory constructs with 180-day clocks). Don't conflate them.

---

## 12. Findings Language

At the **assessment objective** level, each AO produces one of:

- **Satisfied** — the objective is met based on evidence collected.
- **Other Than Satisfied (OTS)** — the objective is not met.

At the **practice** level, the rollup is:

- **MET** — *all* AOs within the practice are Satisfied.
- **NOT MET** — one or more AOs are Other Than Satisfied (and the practice is not eligible for partial credit).
- **PARTIAL** — some AOs Satisfied, others not, where partial credit applies under the Scoring Methodology.
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
2. **Team composition** — minimum **3 CCAs** on the assessment team.
3. **Assessment activities** — Examine / Interview / Test against every applicable AO.
4. **Scoring** — each practice MET or NOT MET per its AOs.
5. **POA&M determination** — which gaps qualify for POA&M.

### Post-Assessment

1. C3PAO posts results to **CMMC-eMASS**; CMMC Status (Conditional or Final) appears in SPRS.
2. **Certificate of CMMC Status** issued.
3. **Evidence retention:** artifacts hashed (NIST-approved algorithm) and retained for **6 years** from CMMC Status Date.
4. C3PAO uploads artifact names, hash values, and algorithm identifiers to eMASS.

### C3PAO Rules (32 CFR 170.10 / 170.11)

- Accredited by the Cyber AB.
- CCAs must hold a Tier 3 background investigation (national security eligibility, not a clearance).
- Must use only their own accredited IT for assessments.
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

After initial CMMC Status, a **senior company official** must affirm in SPRS/eMASS each year that:

- The organization continues to implement all required practices.
- No material changes have occurred that affect CMMC compliance.
- All information-system changes are reflected in the SSP.

Frequency: within one year of initial CMMC Status Date, then annually for the 3-year cycle. Material changes may trigger re-assessment.

### False Claims Act Exposure

CMMC creates real FCA exposure — context every client conversation should include:

- **FCA liability:** Up to **3× government damages** + per-claim penalties for knowingly false certifications.
- **DOJ Cyber-Fraud Initiative** has been pursuing cybersecurity false certifications since 2019.
- **Recent precedent:** Multiple multi-million-dollar settlements against defense contractors that falsely certified cybersecurity compliance.
- **Personal liability:** The signing senior official is personally certifying.

**What creates exposure:**

1. Submitting an inflated SPRS score.
2. Knowingly false annual affirmation.
3. Certifying a bid as CMMC-compliant when the OSC knows it isn't.
4. Prime contractor knowingly ignoring sub's false claims.

**Safe-harbor posture:** an honest, low SPRS score plus a credible POA&M is defensible. An inflated score is not. **Accurate reporting + credible remediation = manageable risk; inflated reporting = potential criminal exposure.**

---

## 15. Rev 2 → Rev 3 Crosswalk + ODPs

CMMC is **currently** based on **800-171 Rev 2** only. Rev 3 (May 2024) is the forward horizon — not operative for CMMC until DoD adopts it (no announced date).

### Structural Changes

| Metric | Rev 2 | Rev 3 |
|---|---|---|
| Control families | 14 | **17** (adds PL, SA, SR) |
| Total requirements | 110 | ~97 (net — many consolidations) |
| Numbering | `3.X.Y` | `03.X.Y` (leading zeros) |
| Basic/Derived distinction | Yes | Eliminated |
| ODPs | None | **Introduced** |
| Family renames | — | CA → "Security Assessment and Monitoring" |

### Key Consolidations

- 3.1.12 + 3.1.14 + 3.1.15 → 03.01.12 (Remote Access)
- 3.1.16 + 3.1.17 → 03.01.16 (Wireless)
- 3.1.18 + 3.1.19 → 03.01.18 (Mobile Devices)
- 3.1.20 + 3.1.21 → 03.01.20 (External Systems)
- 3.2.1 + 3.2.3 → 03.02.01 (Literacy Training)
- 3.5.4 + 3.5.6 + 3.5.8 + 3.5.9 + 3.5.10 + 3.5.11 → 03.05.03 / 03.05.07 (MFA, Password Mgmt)
- 3.1.13 + 3.8.6 + 3.13.8 → 03.13.08 (Cryptographic Protection)
- 3.12.4 (SSP) → 03.15.02 (relocated to new PL family)

### ODPs — Organization-Defined Parameters

Introduced in Rev 3. Select requirements contain `[Assignment: organization-defined X]` values that must be defined by either the contracting federal agency or the contractor. Once defined, they become **assessable scope**.

ODP categories:

- **Time periods** — inactivity timeouts, audit failure response windows, scan frequency.
- **Roles/personnel** — who is authorized for privileged accounts, who responds to logon-attempt thresholds.
- **Technical parameters** — number of invalid logon attempts allowed, configuration settings, types of cryptography.
- **Security requirements** — requirements imposed on external systems, prohibited services/ports/protocols.

ODP planning for clients pre-adoption:

1. Stand up an ODP register (separate doc or SSP appendix).
2. Have management approve each value.
3. Implement controls using those defined values.
4. Be ready to be assessed against your own stated values — they become binding.

### Why You Can't "Just Use Rev 3"

Some clients have implemented Rev 3-style controls and believe they're covered. Rev 2 has specific requirements that Rev 3 softened with ODPs — for current CMMC assessments, the **Rev 2** language governs:

- **3.3.7 (clock sync)** — Rev 2 requires NTP sync with an authoritative source; Rev 3 softened.
- **3.4.8 (allow/deny software)** — Rev 2 requires an explicit policy choice and implementation.
- **3.5.3 (MFA)** — Rev 2 requires MFA for *network access to non-privileged accounts*; no ODP wiggle room.
- **3.13.11 (FIPS crypto)** — Rev 2 says "FIPS-validated", flat. Rev 3 uses ODP. For CMMC, FIPS validation is mandatory.

---

## 16. Common L2 Implementation Gaps (with AO citations)

Replaces the loose gap list with practitioner-confirmed patterns mapped to specific assessment objectives.

| Gap | Practices / AOs | Why it fails |
|---|---|---|
| **MFA partial** — admins only, not all network users | IA.L2-3.5.3 (all AOs); related 3.1.12 | Rev 2 requires MFA for network access to non-privileged accounts; "admins only" does not satisfy |
| **SMS or push-only MFA** | IA.L2-3.5.3 | Phishing-resistant MFA expected; SMS increasingly called out |
| **Account review records missing** | AC.L2-3.1.1[d–f]; 3.1.5[a–d] | Policy exists but no documented periodic review evidence |
| **Asset inventory incomplete / no network diagram** | CM.L2-3.4.1[a–f]; CA.L2-3.12.4 | Baseline configuration cannot be asserted without inventory |
| **Audit log retention without review** | AU.L2-3.3.1[e–f]; 3.3.5 | Logs generated but never analyzed — fails Examine + Interview |
| **IR plan untested or no 72-hour reporting process** | IR.L2-3.6.1[a–g]; 3.6.3; DFARS 7012 | Plan exists but exercises absent; DIBNet reporting workflow undocumented |
| **No baseline configurations / informal change control** | CM.L2-3.4.1; 3.4.3; 3.4.5[a–h] | Required artifacts (baselines, change records) cannot be produced |
| **Allow/deny software policy missing** | CM.L2-3.4.8 | Policy-only without enforcement evidence; technical control required |
| **FIPS-validated crypto unconfirmed** | SC.L2-3.13.11; 3.13.8; 3.13.16 | Encryption in use but not via CMVP-validated module — 3-pt POA&M if encryption present, 5-pt fail if not |
| **No documented deny-by-default boundary rule** | SC.L2-3.13.6 | Implicit allow rules undermine flow control |
| **CUI at rest not encrypted** | SC.L2-3.13.16 | Common on endpoints; full-disk encryption alone may not satisfy if CUI is in cloud sync folders |
| **SSP not current** | CA.L2-3.12.4[a–h] | SSP exists but stale; assessor wants current state |
| **Patch SLAs without evidence** | SI.L2-3.14.1; RA.L2-3.11.3 | Policy says "30 days" but no records demonstrate it |
| **AV not auto-updating** | SI.L2-3.14.4; 3.14.5 | Signatures stale; tool report shows last update |
| **Vulnerability scanning gap** | RA.L2-3.11.2; 3.11.3 | Authenticated scans not configured; remediation cadence undocumented |
| **External system connections unmanaged** | AC.L2-3.1.20; 3.1.21 | No agreements with external systems; portable storage uncontrolled |
| **Public-facing system content control** | AC.L2-3.1.22 | No review process for what posts publicly |

### Controls Where "Policy Only" Always Fails

These require technical implementation evidence, not just a policy document:

- 3.1.8 (logon attempt limits)
- 3.1.10 (screen lock)
- 3.4.8 (allow/deny software policy)
- 3.5.3 (MFA)
- 3.13.8 (CUI in transit)
- 3.13.11 (FIPS-validated cryptography)
- 3.13.16 (CUI at rest)
- 3.14.2 (malicious code protection)

---

## 17. Authoritative Sources

### Primary

- **NIST SP 800-171 Rev 2** — https://doi.org/10.6028/NIST.SP.800-171r2
- **NIST SP 800-171A Rev 2** — assessment procedures (320 objectives)
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
