---
name: nist-csf-20-expert
description: NIST Cybersecurity Framework v2.0 expert. Reference-depth knowledge of the six Functions (Govern, Identify, Protect, Detect, Respond, Recover), Categories and Subcategories, Profiles (Current vs Target), Tiers, Implementation Examples, and the practitioner workflow of using CSF as a board-readable cybersecurity outcomes language. Backed by the SCF crosswalk for control-by-control mechanics.
allowed-tools: Read, Glob, Grep, Write
---

# NIST Cybersecurity Framework (v2.0) Expert

Reference-depth expertise for **NIST Cybersecurity Framework v2.0** — the cross-sector outcomes-based framework published by the U.S. National Institute of Standards and Technology. CSF 2.0 is the most widely adopted cybersecurity framework in the United States and is increasingly used worldwide as a common vocabulary for board-level and regulator-facing cybersecurity discussions.

This plugin bundles the SCF crosswalk (250 SCF controls → 134 CSF Subcategories) with framework-specific scope, assessment, and evidence guidance.

## Framework identity

- **SCF framework ID**: `general-nist-csf-2-0`
- **Publisher**: NIST (National Institute of Standards and Technology), U.S. Department of Commerce
- **Version**: 2.0 (final)
- **Released**: February 26, 2024 (supersedes CSF 1.1, April 2018)
- **Region**: Global (U.S.-published, used internationally)
- **Country origin**: United States
- **Status**: Voluntary — not a regulation, but referenced by U.S. federal contracts, sector regulators (FERC/NERC, FFIEC, HHS/HPH), and Executive Orders (notably EO 14028 on improving the nation's cybersecurity)
- **Cost**: Free of charge; CSF Core, Quick Start Guides, and Implementation Examples are public-domain U.S. government works
- **Successor relationship**: CSF 2.0 supersedes CSF 1.1, but transition is not mandated — many organizations and contracts still reference 1.1 in 2026

## Framework in plain language

CSF 2.0 is a cybersecurity outcomes framework, not a control catalog. Its job is to give an organization a small, common vocabulary it can use to (a) describe what cybersecurity outcomes it currently achieves, (b) describe what it wants to achieve, and (c) plan the gap between the two. The framework deliberately avoids prescribing *how* to achieve outcomes — that's what control catalogs like NIST SP 800-53, ISO 27001 Annex A, and CIS Controls are for. CSF cites those catalogs as **Informative References**.

The headline change in CSF 2.0 is the addition of the **Govern (GV)** Function. CSF 1.1 had five Functions — Identify, Protect, Detect, Respond, Recover — which describe the lifecycle of a cybersecurity event. CSF 2.0 adds Govern as a cross-cutting Function that holds the board, executives, and risk-management processes accountable for the cybersecurity program itself, not just for responding to events. This change reflects what regulators, boards, and the SEC's 2023 cybersecurity disclosure rule have been pushing for years.

## Territorial scope and applicability

CSF is **voluntary** and **cross-sector**. It does not impose territorial obligations on its own. Practical sweet spots where it's the right framework to reach for:

- **U.S. federal contractors** before they're mature enough for full NIST SP 800-53 compliance — CSF gives them a defensible structure and a glide path
- **Critical infrastructure operators** under EO 14028 and sector-specific guidance (energy, water, transportation, healthcare, financial services) — CSF is the U.S. government's preferred shared vocabulary
- **Healthcare and finance** organizations that already comply with HIPAA, GLBA, or PCI DSS and want a board-readable summary that maps cleanly to those underlying frameworks
- **Mid-market organizations** building a first formal cybersecurity program — CSF Tier 1 → Tier 2 → Tier 3 progression scales gracefully
- **International organizations** using CSF as a U.S.-aligned reference alongside ISO/IEC 27001 (Informative References include ISO 27001:2022 mappings)
- **Private-sector boards and audit committees** who want a single page of "what we do for cybersecurity" that is not a 1,200-control spreadsheet

CSF is **not** a substitute for sectoral regulation. A hospital still owes HIPAA Security Rule compliance regardless of its CSF posture; a bank still owes GLBA Safeguards Rule; a defense contractor still owes CMMC. CSF sits *above* those — it's the shared language a CISO uses to explain the program to a board that doesn't read CFR citations.

## The CSF Core: Functions, Categories, Subcategories

CSF is organized hierarchically. The Core has three layers:

### 1. Functions (6)

The Functions are the highest-level grouping and the single most important thing to memorize. CSF 2.0 has six:

| Code | Function | What it covers |
|---|---|---|
| **GV** | **Govern** | Cybersecurity strategy, expectations, policy, roles, risk tolerance, supply chain risk management, oversight. New in 2.0. |
| **ID** | **Identify** | Asset management, business environment, risk assessment, improvement. Understand your context. |
| **PR** | **Protect** | Identity management and access control, awareness and training, data security, platform security, technology infrastructure resilience. |
| **DE** | **Detect** | Continuous monitoring, adverse event analysis. |
| **RS** | **Respond** | Incident management, analysis, response reporting and communication, mitigation. |
| **RC** | **Recover** | Incident recovery plan execution, recovery communication. |

The mnemonic the community uses is **GIPDRR** (or **G + IPDRR**, since IPDRR was the CSF 1.x ordering). Note that **Govern is not the first Function executed during an incident** — it's the wrapper around all the others. In Profile work and assessments, Govern outcomes are typically written and approved *before* the Identify/Protect/Detect/Respond/Recover capabilities are stood up, but in continuous operation Govern runs in parallel with everything else.

### 2. Categories

Each Function decomposes into **Categories**. Categories are coded as `<Function>.<Category>`. Examples that come up constantly in practice:

- **GV.OC** — Organizational Context (mission, stakeholder expectations, legal/regulatory requirements, threat landscape)
- **GV.RM** — Risk Management Strategy (risk tolerance, risk appetite statements, integration with enterprise risk)
- **GV.RR** — Roles, Responsibilities, and Authorities (RACI for cybersecurity decisions)
- **GV.PO** — Policy
- **GV.OV** — Oversight (board reporting, independent review)
- **GV.SC** — Cybersecurity Supply Chain Risk Management (C-SCRM, expanded substantially from CSF 1.1's ID.SC)
- **ID.AM** — Asset Management
- **ID.RA** — Risk Assessment
- **ID.IM** — Improvement (lessons learned, continuous improvement)
- **PR.AA** — Identity Management, Authentication, and Access Control
- **PR.AT** — Awareness and Training
- **PR.DS** — Data Security
- **PR.PS** — Platform Security
- **PR.IR** — Technology Infrastructure Resilience
- **DE.CM** — Continuous Monitoring
- **DE.AE** — Adverse Event Analysis
- **RS.MA** — Incident Management
- **RS.AN** — Incident Analysis
- **RS.CO** — Incident Response Reporting and Communication
- **RS.MI** — Incident Mitigation
- **RC.RP** — Incident Recovery Plan Execution
- **RC.CO** — Incident Recovery Communication

Total Categories in CSF 2.0: 22 (compared to 23 in CSF 1.1 — the structure was rebalanced as part of the Govern restructuring).

### 3. Subcategories

Subcategories are the leaf nodes — concrete cybersecurity outcomes phrased as statements (not directives). CSF 2.0 has roughly 106 Subcategories. They're coded as `<Function>.<Category>-<Number>`. Examples:

- **GV.OC-01** — The organizational mission is understood and informs cybersecurity risk management
- **PR.AA-01** — Identities and credentials for authorized users, services, and hardware are managed by the organization
- **DE.CM-01** — Networks and network services are monitored to find potentially adverse events
- **RS.MA-01** — The incident response plan is executed in coordination with relevant third parties once an incident is declared

Subcategories are the **assessment unit**. When practitioners say "we're at Partial on PR.AA-01 and Repeatable on DE.CM-01," they're scoring at the Subcategory level. This plugin's `evidence-checklist` command is organized by Function → Category → representative Subcategories.

## Implementation Examples (new in 2.0)

CSF 2.0 introduced **Implementation Examples** — short, concrete actions an organization can take to achieve a Subcategory's outcome. These are intentionally not exhaustive and not prescriptive; they're a starting point. They are published in the NIST CSF 2.0 Reference Tool alongside each Subcategory.

Implementation Examples are not the same as **Informative References**. References point to *other catalogs* (NIST SP 800-53, ISO 27001:2022, CIS Controls v8, etc.); Examples describe *actions* an organization can take directly. Cite Implementation Examples by Subcategory ID and the example's enumeration in the published CSF 2.0 Reference Tool — do not paste the Example text verbatim into customer-facing artifacts.

## Profiles: the primary practitioner workflow

The Profile is where CSF stops being theoretical and starts being useful. A Profile is just a list of Subcategories with annotations. The practitioner workflow:

1. **Current Profile** — Walk every (in-scope) Subcategory. For each, document:
   - Which controls / processes / tools currently meet the outcome
   - The maturity / completeness of that implementation (often expressed via Tier or a custom rubric)
   - Evidence that demonstrates it (logs, configs, policies, tickets)
   - Gaps and blockers
2. **Target Profile** — Decide which Subcategories the organization wants to achieve, and to what degree. Targets are informed by:
   - Mission, business objectives, threat landscape (GV.OC outcomes)
   - Risk tolerance and appetite (GV.RM outcomes)
   - Legal and regulatory obligations (GV.OC-03)
   - Cost / benefit, capacity to execute
3. **Gap analysis** — The delta between Current and Target. This becomes the prioritized backlog for the next fiscal year (or whatever planning cycle the organization uses).
4. **Action plan / roadmap** — Initiatives with owners, milestones, budget asks, and Subcategory-level success criteria.
5. **Reassessment cadence** — Most organizations reassess the Current Profile annually, with quarterly or monthly check-ins on initiatives in flight.

CSF 2.0 publishes **Community Profiles** for specific contexts (e.g., manufacturing, election security, electric grid). Community Profiles are pre-built Target Profiles maintained by NIST or industry working groups; using one short-circuits a lot of the "what should our Target Profile look like?" debate. Always check whether a Community Profile exists for the organization's sector before building one from scratch.

## Tiers (1–4): rigor of risk management practices, NOT maturity

This is the single most-misunderstood part of CSF. The Tiers describe **how rigorous and integrated the organization's cybersecurity risk management practices are** — not how many controls it has, not how technically mature its security tooling is.

| Tier | Name | Plain-language description |
|---|---|---|
| **1** | Partial | Risk management is ad hoc, reactive, often informal. Awareness limited. Governance and supply chain risk practices not formalized. |
| **2** | Risk Informed | Risk management practices are approved by management but not established as organization-wide policy. Some prioritization happens. Governance present but inconsistent. |
| **3** | Repeatable | Risk management practices are formally approved, expressed as policy, applied consistently. Governance is regular. Supply chain risk management is integrated. Continuous awareness. |
| **4** | Adaptive | Risk management practices adapt to changing threats based on lessons learned and predictive indicators. Cybersecurity risk is integrated into enterprise risk culture. Continuous improvement. |

Two critical points:

1. **Tier 4 is not the goal for every organization.** A Tier 2 posture may be entirely appropriate for a small business with low risk exposure. Pushing a Tier 1 organization to Tier 4 in one cycle is unrealistic and usually counterproductive.
2. **Tiers are not assigned per Subcategory** — they characterize the *organization's overall risk-management practice*. Subcategory implementations are scored separately (typically against a custom rubric in the Current/Target Profile work).

## Informative References

CSF 2.0 Subcategories map to other widely-used catalogs through **Informative References**. These are maintained in the NIST CSF 2.0 Reference Tool and updated periodically. The official mappings include (non-exhaustive):

- **NIST SP 800-53 Rev. 5** — controls catalog used by U.S. federal systems and FedRAMP
- **NIST SP 800-171 Rev. 3** — controls for protecting CUI in non-federal systems (relevant to CMMC)
- **NIST SP 800-221A** — enterprise risk management for cybersecurity
- **ISO/IEC 27001:2022** — Annex A controls
- **CIS Controls v8** — community-curated control set
- **COBIT 2019** — IT governance framework

Treat Informative References as a starting point, not a substitute for the underlying frameworks. If an organization is implementing controls to satisfy ISO 27001:2022 certification, the ISO standard's normative text governs — CSF references it, but auditors against ISO 27001 will assess against the ISO text directly.

## Cadence and timelines

CSF itself doesn't impose timelines (it's voluntary), but practitioners should plan around:

- **Annual Profile reassessment** — refresh Current Profile, validate Target Profile, recompute gap. Common alignment with fiscal year for budget asks.
- **Quarterly initiative review** — review the action plan, update Subcategory status for items in flight.
- **Triggered reassessment** — material changes (new business line, M&A, major incident, new regulation, significant supply chain shift) should trigger a partial reassessment of affected Functions.
- **Board reporting cadence** — most CISOs report Function-level summary metrics to the board quarterly or semi-annually. CSF's Function structure gives the board a stable mental model that doesn't change every quarter.

For organizations using CSF to support sector regulation (e.g., NERC CIP audits, HIPAA risk analyses, PCI DSS Reports on Compliance), the *regulator's* cadence governs — CSF assessment work is usually scheduled to feed into those external assessments rather than the other way around.

## Regulator and enforcement

CSF is **voluntary**. NIST is a measurement and standards body, not a regulator, and does not enforce CSF. There are no fines, no mandatory audits, no certification body for CSF itself.

What CSF posture *does* affect:

- **Federal contracts** — solicitations increasingly request a "CSF Profile" or "CSF Tier" as an attachment. Misrepresentation here can become a False Claims Act issue.
- **Sector regulator examinations** — FERC/NERC (energy), FFIEC (banking), HHS/HPH (healthcare), TSA (transportation/pipeline) reference CSF or align their examination programs with it. A weak CSF posture often correlates with weak findings in those examinations.
- **State law** — a few U.S. states (e.g., Connecticut, Ohio, Utah) provide affirmative defense or safe harbor in data breach litigation if the defendant followed a recognized framework like CSF. This is a litigation defense lever, not regulatory enforcement.
- **Cyber insurance underwriting** — carriers increasingly use CSF Function maturity as an underwriting input.
- **SEC cybersecurity disclosure (Item 106 of Reg S-K)** — public companies must describe their cybersecurity risk management, strategy, and governance. CSF's Govern Function gives a clean structure for that disclosure.

There is **no CSF certification**. Vendors offering "CSF certified" products or assessors are using the term loosely; NIST does not accredit or certify against CSF.

## Interaction with other frameworks

CSF is designed to play well with others. Common interactions:

- **CSF + NIST SP 800-53** — CSF Subcategories cite 800-53 controls as Informative References. A federal system using 800-53 baseline controls can roll those up into CSF Subcategory status. This is the canonical pairing for federal contractors.
- **CSF + ISO/IEC 27001:2022** — CSF Subcategories cite ISO Annex A. Many international organizations use ISO 27001 for the certifiable ISMS and CSF as the U.S.-aligned reporting layer above it.
- **CSF + CIS Controls v8** — CIS Controls are a more prescriptive, action-oriented set. Organizations often start with CIS for technical hardening and use CSF Profiles to communicate program maturity upward.
- **CSF + CMMC** — CMMC Levels 1/2/3 build on NIST SP 800-171/172. CSF doesn't replace CMMC, but CSF Profile work is a useful pre-engagement sanity check before a C3PAO assessment.
- **CSF + HIPAA Security Rule** — HHS OCR audit protocols map to CSF. Many healthcare organizations use the CSF as the umbrella and HIPAA Security Rule controls as the implementation evidence under PR/DE/RS/RC Functions.
- **CSF + PCI DSS v4.0.1** — CSF doesn't satisfy PCI DSS, but PCI DSS controls map cleanly into PR.DS (data security), PR.AA (access control), DE.CM (monitoring) Subcategories.
- **CSF + NIS2 (EU)** — both are outcomes-oriented. NIS2 imposes obligations on essential and important entities operating in the EU; CSF can be used as the internal cybersecurity management framework that demonstrates NIS2-required risk management measures.

For multi-framework optimization and crosswalk-driven implementation work, see `/grc-engineer:optimize-multi-framework` and `/grc-engineer:map-controls-unified`.

## Common misinterpretations

Reference-depth practitioners should be ready to correct these in conversations with engineers, executives, and auditors:

1. **"CSF tells us *what controls to implement*."** No. CSF describes outcomes (Subcategories). Controls live in 800-53, ISO 27001 Annex A, CIS Controls v8, etc. Use CSF to organize and communicate; use a control catalog to actually implement.
2. **"We need to be Tier 4."** Tier 4 is not the universal target. Tier 4 is appropriate for organizations with high risk exposure, mature operations, and the resources to sustain adaptive practices. Many organizations are appropriately at Tier 2 or Tier 3.
3. **"Tiers describe maturity per control."** Tiers describe the *organization's overall risk-management practice* — not per-Subcategory implementation maturity. Subcategory status is scored separately.
4. **"CSF 2.0 is mandatory for federal contractors."** Not directly. Specific contracts may require it; FAR/DFARS reference NIST SP 800-171 and (increasingly) CMMC, not CSF directly. CSF is often used in early stages of a contractor's compliance journey or as an internal management tool.
5. **"Govern is just policy."** Govern (GV) covers strategy, expectations, policy, roles, oversight, risk management, *and* C-SCRM (supply chain risk). It's substantially broader than "writing policy documents."
6. **"CSF replaces our existing framework."** It does not. CSF is a layer above existing frameworks. Most organizations keep their existing control work (ISO 27001, 800-53, HIPAA, PCI DSS, etc.) and use CSF as the communication and prioritization layer.
7. **"There's a CSF certification."** There is not. Beware vendors marketing "CSF certified" products or services.
8. **"CSF 1.1 is end-of-life."** CSF 2.0 supersedes 1.1, but NIST has not set a sunset date for 1.1 references. Many existing contracts, regulations, and assessment programs still reference 1.1. Plan a migration; do not panic.

## Mandatory artifacts

Because CSF is voluntary and outcomes-based, there are no NIST-mandated artifacts. However, practitioner experience consistently produces (and assessors / regulators / boards consistently expect) the following deliverables when an organization claims a CSF posture:

- **Current Profile** — Subcategory-by-Subcategory snapshot of present-state outcomes, with evidence pointers.
- **Target Profile** — Subcategory-by-Subcategory desired-state outcomes, often informed by a Community Profile.
- **Gap analysis** — explicit delta between Current and Target, with severity / effort scoring.
- **Action plan** — initiatives mapped to Subcategories, with owners, milestones, budget asks.
- **Tier statement** — organization's self-assessed Tier (1–4) with rationale and the Tier the organization is targeting.
- **Govern outputs** — board-approved cybersecurity strategy, written cybersecurity policies, RACI for cybersecurity decisions, supply chain risk management process documentation.

Federal contractors and regulated entities should additionally produce mappings from their CSF Profile to the underlying regulation's control catalog (800-53, 800-171, HIPAA, PCI DSS, etc.) so that CSF artifacts can be reused as evidence across multiple compliance regimes.

## Assessment workflow (what this plugin produces)

When using this plugin, the typical workflow is:

```
1. /nist-csf-20:scope             # decide what's in scope, pick or build a Target Profile
2. /nist-csf-20:assess            # run the gap assessment via SCF crosswalk
3. /nist-csf-20:evidence-checklist # enumerate evidence per Function/Category
```

Underneath, all three commands delegate the control-by-control mechanics to `/grc-engineer:gap-assessment` with SCF framework ID `general-nist-csf-2-0`. This plugin contributes:

- The CSF-specific scope decision tree (Functions in scope, Tier target, Community Profile selection)
- CSF-specific framing of the gap assessment output (organized by Function and Category, not by SCF family)
- Evidence patterns organized by Function with representative Subcategories per Function

For citation purposes, refer to the **NIST CSF 2.0 Quick Start Guides** (NIST SP 1300 series — `1300`, `1301`, etc., each addressing a specific audience or topic) and the public NIST CSF 2.0 Reference Tool. Cite by document ID and section number; do not paste their prose verbatim.

## Cloud-agnostic baseline

CSF is technology-neutral. Implementation Examples are written without naming vendors. When this plugin's evidence checklist suggests artifacts (e.g., "IAM configuration export for PR.AA-01"), treat the artifact as cloud-agnostic — equivalent evidence exists in AWS IAM, Azure AD/Entra ID, GCP IAM, on-prem Active Directory, Kubernetes RBAC, or any combination. Optional vendor-specific examples may be added in a future Full-depth plugin, but Reference depth deliberately does not lock to a single cloud.

## Capabilities

- CSF 2.0 scope determination (Functions in scope, Tier targeting, Community Profile selection)
- Current Profile and Target Profile authoring guidance
- Gap analysis across all six Functions and 22 Categories
- Subcategory-level evidence checklist generation
- Tier (1–4) assessment guidance for organizational risk-management practices
- Implementation Example interpretation and adaptation
- Mapping CSF Subcategories to NIST SP 800-53 / ISO 27001:2022 / CIS Controls v8 via Informative References
- Coexistence guidance with HIPAA, PCI DSS, GLBA, CMMC, NIS2, and other regulations
- Board-readable reporting structure aligned with CSF Functions
- SEC cybersecurity disclosure (Reg S-K Item 106) alignment via Govern Function
- C-SCRM (cybersecurity supply chain risk management) under GV.SC
- Multi-framework optimization via `/grc-engineer:optimize-multi-framework`
- SCF crosswalk navigation (general-nist-csf-2-0 → 250 SCF controls → 134 CSF Subcategories)

## Levelling up to Full

A Full-depth `nist-csf-20` plugin would add framework-native workflow commands tied to how CSF is actually consumed in practice. Candidates worth considering:

- `/nist-csf-20:profile-build` — interactive Current/Target Profile authoring with Subcategory-level scoring rubric
- `/nist-csf-20:tier-assessment` — guided Tier 1–4 evaluation across the four characteristic dimensions (risk management process, integrated risk management program, external participation, supply chain risk)
- `/nist-csf-20:community-profile` — search and apply published Community Profiles (manufacturing, election infrastructure, electric grid, etc.) as a starting Target Profile
- `/nist-csf-20:board-report` — generate a Function-level executive summary suitable for board / audit committee distribution
- `/nist-csf-20:csf1-to-csf2` — migrate an existing CSF 1.1 Profile to the CSF 2.0 structure, accounting for the new Govern Function and rebalanced Categories
- `/nist-csf-20:sec-disclosure-prep` — map Govern Function outcomes to SEC Reg S-K Item 106 disclosure requirements

Contributors with practitioner experience in any of these workflows are encouraged to open a level-up PR.

## Command routing

- `/nist-csf-20:scope` — determine applicability and Profile/Tier targeting
- `/nist-csf-20:assess` — run a gap assessment via SCF crosswalk
- `/nist-csf-20:evidence-checklist` — enumerate evidence per Function and representative Subcategories

All three delegate to `/grc-engineer:gap-assessment` with SCF framework ID `general-nist-csf-2-0` for the control-by-control mechanics, and wrap the results in CSF 2.0 vocabulary (Function / Category / Subcategory / Profile / Tier).

## References

- [Secure Controls Framework](https://securecontrolsframework.com) — crosswalk source
- [SCF API entry for `general-nist-csf-2-0`](https://grcengclub.github.io/scf-api/api/crosswalks/general-nist-csf-2-0.json)
- NIST CSF 2.0 (final, February 26, 2024) — published at `nist.gov/cyberframework`
- NIST CSF 2.0 Quick Start Guides (SP 1300 series) — audience-specific guidance from NIST
- NIST CSF 2.0 Reference Tool — interactive Subcategory browser with Implementation Examples and Informative References
- NIST SP 800-53 Rev. 5, NIST SP 800-171 Rev. 3 — control catalogs cited as Informative References
- ISO/IEC 27001:2022 Annex A, CIS Controls v8 — non-NIST catalogs cited as Informative References
