---
name: ind-dpdpa-expert
description: India DPDPA expert for the Digital Personal Data Protection Act 2023 and the DPDP Rules 2025. Covers Data Fiduciary obligations, Data Principal rights, Significant Data Fiduciary regime, Consent Manager, breach notification (72-hour), cross-border transfer regime, children's data, sectoral overlap with RBI / SEBI / IRDAI / TRAI / CERT-In / ABDM, and Data Protection Board enforcement.
allowed-tools: Read, Glob, Grep, Write
---

# India DPDPA Expert

Deep working knowledge of the **Digital Personal Data Protection Act, 2023** (DPDPA) and the **Digital Personal Data Protection Rules, 2025** (DPDP Rules), as enforced by the **Data Protection Board of India** (DPB) under the Ministry of Electronics and Information Technology (MeitY).

This skill is engineering and assessment guidance for CISOs, DPOs, GRC engineers, and platform teams. It is **not** legal advice. Binding interpretations come from DPB orders, MeitY notifications, and the courts.

## When to invoke this skill

Invoke when the user is:

- Mapping a system, product, or third-party vendor to DPDPA obligations
- Determining whether DPDPA applies (territorial, material, role)
- Assessing Significant Data Fiduciary (SDF) exposure
- Drafting or auditing privacy notices, consent flows, or rights-fulfilment workflows
- Building or stress-testing a personal-data-breach playbook (with DPDPA's 72-hour clock and the parallel sectoral clocks)
- Preparing for a DPB enquiry or compiling penalty-mitigation evidence
- Deciding cross-border transfer postures or evaluating a Consent Manager partner
- Comparing DPDPA to GDPR / Singapore PDPA / other regimes for a multi-jurisdictional product

## Framework identity

| Field | Value |
|---|---|
| Statute | Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023) |
| Operational rules | Digital Personal Data Protection Rules, 2025 (notified November 2025) |
| Regulator | Data Protection Board of India (DPB) under MeitY |
| Territorial scope | Processing within India; processing outside India in connection with offering goods or services to Data Principals located in India |
| Material scope | Digital personal data — personal data in digital form, or in non-digital form digitised subsequently |
| SCF framework ID | `apac-ind-dpdpa-2023` |
| SCF coverage | 41 SCF controls map to 96 DPDPA control identifiers |
| Status (as of 2026) | Act in force; Rules notified November 2025 with phased operational dates |

The Act and the Rules **must be read together**. The Act sets substantive obligations; the Rules set the operational detail — timelines, formats, registration mechanisms, and procedures. Gaps in either side are gaps in compliance.

## Roles and definitions

| DPDPA term | Meaning | GDPR analogue |
|---|---|---|
| **Data Fiduciary** | Determines the purpose and means of processing personal data. The controller-equivalent. | Controller |
| **Data Processor** | Processes personal data on behalf of a Fiduciary under contract. | Processor |
| **Data Principal** | The natural person whose personal data is processed. For a child, the parent or lawful guardian; for a person with a disability, the lawful guardian. | Data Subject |
| **Significant Data Fiduciary (SDF)** | A class of Data Fiduciary notified by the Central Government as having higher-risk processing. Carries additional obligations. | (Broader and stricter than GDPR's "large-scale" qualifier) |
| **Consent Manager** | A registrable entity that manages consents on behalf of Data Principals — gives, manages, reviews, withdraws consent across multiple Fiduciaries. | (No direct GDPR analogue) |
| **Personal data** | Any data about an individual who is identifiable by or in relation to such data. | Personal data (Article 4(1)) |
| **Processing** | Wholly or partly automated operation/s on personal data — collection, storage, use, sharing, disclosure, erasure, destruction. | Processing |
| **Personal data breach** | Any unauthorised processing or accidental disclosure, acquisition, sharing, use, alteration, destruction or loss of access to personal data, that compromises its confidentiality, integrity, or availability. | Personal data breach |

DPDPA does **not** define "sensitive personal data" as a separate category (unlike GDPR Article 9 or India's earlier SPDI Rules 2011). All personal data is governed by the same baseline obligations, with intensified obligations for children's data (Section 9) and SDF processing (Section 10).

## Territorial and material applicability (Section 3)

DPDPA applies to processing of **digital personal data**:

1. **Within India** — processing of digital personal data, regardless of where the Data Fiduciary is established; **and**
2. **Outside India** — processing of digital personal data outside India, where the processing is in connection with **offering goods or services** to Data Principals located in India.

Personal data in non-digital form falls within scope only if **digitised subsequently** (Section 3(b)).

DPDPA does **not** apply to:

- Personal data processed by an individual for **personal or domestic purposes**.
- Personal data **made publicly available** by the Data Principal themselves, or by another person under a legal obligation.
- Specific exemptions notified under **Section 17** — including processing necessary for research, archival, statistical purposes (subject to safeguards), processing by the State for sovereign functions, prevention/detection/investigation of offences, and certain other notified contexts.

When determining applicability, use `/ind-dpdpa:scope` — it walks the decision tree.

## Data Fiduciary obligations (Section 8)

Every Data Fiduciary, whether SDF or not, owes the following baseline obligations:

| Obligation | Section | What it requires |
|---|---|---|
| Accuracy | 8(3) | Make reasonable efforts to ensure personal data is accurate and complete when used to make a decision affecting the Principal or shared with another Fiduciary. |
| Security safeguards | 8(5) | Protect personal data in possession or control by taking **reasonable security safeguards** to prevent personal data breaches. (The Schedule attaches up to ₹250 crore penalty for failure here — the largest band.) |
| Breach notification | 8(6) | On becoming aware of a personal data breach, give intimation in such form and manner as may be prescribed to (a) the Board and (b) each affected Data Principal. The DPDP Rules 2025 (R7) prescribe the timeline (72 hours) and content. |
| Erasure on completion | 8(7) | Erase personal data when the Principal withdraws consent, or as soon as it is reasonable to assume the specified purpose is no longer being served — unless retention is required by law. Cause processors to do the same. |
| Cause of processor compliance | 8(2) | Engage a Processor only under a valid contract; remain accountable for processing the Processor performs. |
| Grievance and Principal-rights operation | 8(10), 13 | Publish business contact information of a person able to answer questions about processing; respond to Principals exercising their rights within prescribed timelines. |

**"Reasonable security safeguards"** is not a checklist in the Act. The DPDP Rules 2025 elaborate technical and organisational measures — encryption, access control, logging and monitoring, backup and recovery, incident response capability, periodic review. In practice, alignment with ISO 27001 / NIST CSF / SCF baseline plus the relevant sectoral overlay (e.g. RBI Cyber Security Framework for banks) is what regulators expect of mature Fiduciaries.

## Notice, consent, legitimate uses (Sections 5 – 7)

### Notice (Section 5)

Before processing, the Data Fiduciary gives the Principal a notice that:

- Describes the personal data and the **purpose of processing**.
- States the **manner** in which the Principal may exercise rights (Section 11–14).
- States the **manner** of making a complaint to the DPB.
- Is in **English or any of the languages specified in the Eighth Schedule** of the Constitution, at the option of the Principal.
- For consents already obtained before the Act, requires the Fiduciary to give the notice **as soon as reasonably practicable**.

### Consent (Section 6)

Consent must be:

- **Free** — no coercion, no leverage of power asymmetry.
- **Specific** — limited to the purpose described in the notice.
- **Informed** — preceded by the Section 5 notice.
- **Unconditional** — not bundled with services where the data is not necessary for the service.
- **Unambiguous, with clear affirmative action** — opt-in. Pre-ticked boxes, default-on toggles, and inferred consent do not satisfy.
- **Withdrawable** — with the same ease as it was given. On withdrawal, processing for the purpose ceases, and the Fiduciary causes its Processors to cease likewise (Section 6(6)).

The validity of consent does not depend on the Fiduciary's business model — bundling unrelated processing into the consent flow invalidates the consent for those unrelated purposes.

### Legitimate uses (Section 7)

Section 7 enumerates uses for which consent is **not required**. These are narrow and exhaustive — they do not create general "legitimate interest" latitude as GDPR does. The categories include:

- Where the Principal has voluntarily provided personal data and has not indicated objection to its use for a specified purpose.
- Performance of any function of the State authorised by law (subject to conditions).
- Compliance with any judgment, decree, or order of a court / tribunal.
- Responding to a medical emergency involving threat to life or immediate threat to the health of the Principal or any other person.
- Taking measures to provide medical treatment or health services during an epidemic, outbreak, or threat to public health.
- Disaster response and ensuring safety / providing assistance during disaster, breakdown of public order.
- Employment-related purposes, including prevention of corporate espionage, maintenance of confidentiality of trade secrets, intellectual property, classified information, services / benefits sought by employee, verifications.

When relying on Section 7 instead of consent, the burden is on the Fiduciary to fit the processing strictly within the named legitimate use. Drift outside the named purpose collapses the lawful basis.

## Data Principal rights (Sections 11 – 14)

| Right | Section | What the Principal can ask |
|---|---|---|
| Right to access information | 11 | A summary of personal data processed, the processing activities, the identities of other Fiduciaries / Processors with whom the data has been shared, and any other information prescribed. |
| Right to correction, completion, updation, erasure | 12 | Correct inaccurate or misleading data, complete incomplete data, update outdated data, or erase data no longer necessary for the specified purpose (subject to retention exceptions). |
| Right of grievance redressal | 13 | Use a readily available means of grievance redressal provided by the Fiduciary or Consent Manager. The Principal must exhaust this before approaching the DPB. |
| Right to nominate | 14 | Nominate another individual to exercise the rights of the Principal in the event of death or incapacity. |

The Fiduciary must respond within timelines prescribed under the DPDP Rules 2025. Free of charge for first request; reasonable fees may apply for repeated, manifestly unfounded, or excessive requests.

The right to **erasure** is qualified — retention required by law (e.g. tax records, audit trails, KYC records under PMLA / RBI rules) overrides the request. The Fiduciary should document the retention basis when refusing erasure.

DPDPA does **not** include a portability right (unlike GDPR Article 20) or an explicit right to object to automated decision-making (unlike GDPR Article 22). However, the obligation to respond to grievances and the Section 11 access right indirectly cover much of the same territory.

## Children's data (Section 9)

For Data Principals who are **children** (under 18, per DPDPA's reading) or **persons with disability who have a lawful guardian**:

- Processing requires **verifiable parental consent / guardian consent**.
- The Fiduciary must **not undertake any tracking or behavioural monitoring of children**.
- The Fiduciary must **not target advertising directed at children**.
- These prohibitions apply to all Fiduciaries — not just SDFs. Penalty exposure is up to **₹200 crore** for failure to fulfil obligations relating to children.

The Central Government may exempt classes of Fiduciary or notify a lower threshold age for specific purposes (e.g. educational platforms, health services). Until exempted, the default 18-year threshold applies.

"Verifiable parental consent" is not yet operationally specified by the Rules in granular detail. In practice, Fiduciaries rely on a combination of: (a) credit-card or banking-instrument transaction by an adult, (b) Aadhaar-based parent verification (where applicable and lawful), (c) signed declaration with identification, (d) Consent Manager flow where the Consent Manager performs the parent verification.

## Significant Data Fiduciary regime (Section 10)

The Central Government may notify any Data Fiduciary or class as an SDF, considering:

- Volume and sensitivity of personal data processed.
- Risk to the rights of Data Principals.
- Potential impact on the sovereignty and integrity of India.
- Risk to electoral democracy.
- Security of the State.
- Public order.

An SDF has the baseline obligations **plus** the following:

| Obligation | Detail |
|---|---|
| Data Protection Officer (DPO) | An individual based in India, accountable to the Board of Directors, the point of contact for grievances and DPB communications. |
| Independent data auditor | A qualified, independent auditor must perform periodic audits of the SDF's compliance posture. |
| Periodic Data Protection Impact Assessment (DPIA) | Conducted at the cadence and form prescribed under the Rules. Records risk assessment, mitigation measures, and consultation outcomes. |
| Periodic compliance audit | Independent audit of compliance with DPDPA — separate from the SDF's own internal audit programme. |
| Other measures | Such other measures as may be prescribed (e.g. specific algorithmic transparency or risk-mitigation measures for AI / profiling). |

SDF designation is by notification and not automatic. However, prudent organisations that exceed implicit volume thresholds (typically very large consumer platforms, financial sector players with national reach, telecom / digital infrastructure providers) prepare for SDF posture in advance — designation can come at short notice.

Penalty exposure for SDF-specific failures: up to **₹150 crore**.

## Cross-border transfers (Section 16)

DPDPA's cross-border posture is the **inverse** of GDPR:

- The **default is permissive**: a Data Fiduciary may transfer personal data outside India.
- The Central Government may, by notification, **restrict transfer to specified territories**. Until a territory is notified as restricted, transfer is allowed.

Important interactions:

- Section 16 does **not displace sectoral data localisation rules**. Where RBI Master Directions require payment-system data to be stored only in India, that requirement applies independent of DPDPA. Same for SEBI's CSCRF storage requirements, IRDAI guidance on insurance data, and any sector-specific localisation directive.
- The list of restricted territories is published by the Central Government and changes over time. **This plugin does not vendor the list**; query the latest gazette notification at posture-determination time.
- Cross-border processing also remains subject to the underlying lawfulness — purpose, consent, security — at every step.

The practical posture for most Data Fiduciaries today is: transfer is allowed; the friction is sectoral localisation rules and contractual obligations to data principals (e.g. retention, deletion-on-withdrawal cascading across sub-processors).

## Personal data breach response (Section 8(6) + DPDP Rules 2025 R7)

A **personal data breach** under DPDPA is broader than a security incident — any compromise of confidentiality, integrity, or availability of personal data, including accidental disclosure, loss of access, or unauthorised processing.

The Section 8(6) obligation requires the Fiduciary to give **intimation of such breach** to:

1. The **Data Protection Board of India**, **and**
2. **Each affected Data Principal**.

The DPDP Rules 2025 prescribe the timeline (72 hours from awareness, with extensions on application showing reasonable cause) and the form/content of the notification.

**Notification content (Rules 2025-aligned baseline)**:

- Description of the breach — nature, timing, geographical extent.
- Categories and approximate number of Principals affected.
- Categories and approximate volume of personal data records affected.
- Likely consequences for affected Principals.
- Measures taken or proposed to mitigate adverse effects.
- Contact point for follow-up.

**Sectoral parallel clocks** — these run in addition to, not in place of, the DPDPA clock:

| Source | Trigger | Timeline |
|---|---|---|
| **CERT-In Direction 20(3)/2022** | Cyber incidents (broader scope than personal-data breach) | **6 hours** |
| **RBI Cyber Security Framework** | Cyber incidents at scheduled commercial banks, urban cooperative banks, NBFCs | **6 hours** to RBI / IDRBT CSITE Cell |
| **SEBI CSCRF** | Cyber incidents at MIIs and SEBI-regulated intermediaries | **6 hours** to SEBI / NCIIPC |
| **IRDAI cyber-security guidelines** | Cyber incidents at insurers and intermediaries | Per IRDAI direction (typically rapid; check current circulars) |
| **DoT / TRAI Telecom Cyber Security Rules 2024** | Cyber-security incidents in telecom networks | Per the Rules' reporting matrix |
| **DPDPA 8(6) + DPDP Rules 2025 R7** | Personal data breach | **72 hours** to DPB and affected Principals |

The **first thing the breach playbook does** is identify which clocks are running. A bank suffering a ransomware incident affecting customer data has at least three clocks: CERT-In 6-hour, RBI 6-hour, DPDPA 72-hour. Missing the fastest clock is the typical failure mode.

Penalty exposure for failure to notify: up to **₹50 crore** for the notification failure itself; the underlying security failure continues to expose up to ₹250 crore separately.

## Consent Manager

A Consent Manager is a Board-registered entity that:

- Is **accountable to the Data Principal** (not to the Fiduciary).
- Provides Principals an interoperable platform to **give, manage, review, and withdraw consents** across multiple Fiduciaries.
- Is registered with the DPB under conditions prescribed in the DPDP Rules 2025.
- Cannot itself process the personal data for any purpose other than consent management.

Consent Managers are still emerging as of 2026; their role is critical for high-volume sectors where Principals deal with many Fiduciaries (financial services, healthcare). Account Aggregators in the financial sector are an early Consent Manager analogue regulated by RBI.

For a Fiduciary that integrates a Consent Manager:

- Consent provenance (who, when, what scope, what version of notice) flows from the Consent Manager into the Fiduciary's system.
- Withdrawal events flow back from the Consent Manager and trigger deletion / processing-cessation cascade.
- Record-keeping obligations remain with the Fiduciary; the Consent Manager's records are corroborative, not substitutive.

## Sectoral overlay

DPDPA does **not displace** sectoral data and security rules. They stack. A Fiduciary that is also a regulated entity must comply with both — and the stricter or earlier-deadline rule binds.

| Sector | Regulator | Key rules that interact with DPDPA |
|---|---|---|
| Banking / NBFC / Payment systems | RBI | Master Direction on IT Governance, Risk, Controls and Assurance Practices (Nov 2023); Cyber Security Framework for Banks; Storage of Payment System Data (April 2018); Account Aggregator framework. 6-hour incident reporting. |
| Capital markets | SEBI | Cyber Security and Cyber Resilience Framework (CSCRF) for SEBI-regulated entities; 6-hour incident reporting; MII-grade resilience standards. |
| Insurance | IRDAI | Information and Cyber Security Guidelines (2023); incident reporting timelines per current IRDAI directives. |
| Telecom / DPI | DoT, TRAI | Indian Telecommunications Act 2023 user-data provisions; Telecom Cyber Security Rules 2024 incident reporting and traffic-data retention. |
| Digital health | NHA, MoH&FW | Ayushman Bharat Digital Mission (ABDM) data policy; Health Data Management Policy; consent flows tied to ABHA accounts. |
| All sectors (cyber) | CERT-In | Direction No. 20(3)/2022 — 6-hour reporting of cyber incidents (broader than personal-data breach); log retention obligations (180 days India-side); KYC retention for VPN / cloud / data-centre service providers. |
| All sectors (information security) | MeitY | IT Act 2000 + SPDI Rules 2011 (still in force for issues outside DPDPA's digital-personal-data scope); CERT-In and NCIIPC directives for critical information infrastructure. |

When assessing a regulated Fiduciary, **build a regulator matrix first**. For each obligation theme (notice, consent, retention, breach, cross-border, audit), record (a) DPDPA position, (b) sectoral position, (c) which is stricter, (d) which clock starts first. The strictest binding rule is the operating obligation.

## GDPR comparison (most-asked)

| Theme | GDPR | DPDPA |
|---|---|---|
| Lawful bases | 6 (consent, contract, legal obligation, vital interests, public task, legitimate interests) — Article 6 | Consent (Sec 6) + enumerated **legitimate uses** (Sec 7). No general "legitimate interest" basis. |
| Sensitive / special data | Article 9 — separate stricter regime | Not separately defined; children's data and SDF have intensified obligations. |
| Right to portability | Article 20 — explicit | Not provided. |
| Right to object to automated decision-making | Article 22 — explicit | Not provided as a standalone right. |
| Cross-border default | Restrict-by-default; need adequacy / SCCs / BCRs | Allow-by-default; restrict only to notified territories. |
| DPO requirement | When core activities require regular and systematic monitoring on a large scale, or processing of special categories on a large scale | Only for SDFs. |
| Breach notification | 72 hours to supervisory authority; high-risk breaches to data subjects | 72 hours (per Rules 2025) to DPB **and** to each affected Principal. |
| Penalty bands | Up to €20m or 4% global turnover | Up to ₹250 crore per breach class (no turnover-percentage formulation). |
| Children threshold | 16 (with member-state derogation to 13) | 18 (with potential Government notification of lower thresholds for specified purposes). |
| Record-keeping | Article 30 ROPA | Records of processing implied by Section 8 obligations + Rules; SDF audit obligations. |

Most multi-jurisdictional product programs converge on **the stricter of GDPR and DPDPA per theme** as the operating posture, except for cross-border (where the regimes don't overlap — both must be satisfied independently for the relevant data flows).

## Common implementation pitfalls

1. **Treating Rules 2025 as advisory.** The Rules give the Act its operational teeth (timelines, formats, registration). Compliance posture without reference to the Rules is incomplete.
2. **Confusing notice with consent.** A privacy policy posted on a website is not consent. Consent requires a **clear affirmative action** by the Principal, post-notice.
3. **Bundling unrelated processing into one consent.** Section 6 invalidates consent for any processing beyond what is necessary for the service the Principal sought. Granular per-purpose consent is the safe posture.
4. **Missing the withdrawal cascade.** When consent is withdrawn, processing must cease and Processors must be caused to cease. Many implementations stop at the Fiduciary's own systems and forget the sub-processor / vendor chain.
5. **Applying GDPR's "legitimate interest" framing to DPDPA.** DPDPA has no equivalent. Section 7 legitimate uses are exhaustive.
6. **Children-by-default missing.** Sites that don't ask age, or ask but don't enforce verifiable parental consent on positive-age signals, fail Section 9.
7. **Breach clock collision.** Running only DPDPA's 72-hour clock and missing the parallel CERT-In / RBI / SEBI 6-hour clocks. This is the single most common breach-response failure for regulated Fiduciaries.
8. **Cross-border misreading.** Assuming Section 16 has a GDPR-style restrictive default; or assuming sectoral localisation rules disappear under DPDPA. Both are wrong.
9. **SDF posture only after notification.** SDF designation can come fast; preparing only after notification leaves a 90-day scramble.
10. **Vendor compliance gaps.** Processors operating without DPDPA-aligned contracts. The Fiduciary remains accountable.
11. **Consent vintage.** Treating pre-Act consents as automatically valid under DPDPA. Section 5(2) requires fresh notice, and consents must satisfy Section 6 going forward.

## Evidence patterns by obligation

For each Section 8 obligation theme, the typical evidence the DPB or an independent auditor will expect:

| Theme | Evidence |
|---|---|
| Notice (Sec 5) | Versioned notice templates per language, change log, samples of as-served notices, evidence of language coverage. |
| Consent (Sec 6) | Consent records with timestamp, purpose, scope, version of notice, mode (clickwrap, in-app, Consent Manager). Withdrawal events and downstream cessation records. |
| Legitimate use (Sec 7) | Documented determination per processing activity, mapping each processing activity to the specific legitimate use category. |
| Purpose limitation | Purpose register; data flow diagrams; system entitlement reviews showing data accessed only for the registered purpose. |
| Accuracy (Sec 8(3)) | Correction-request logs with response timelines; data quality controls. |
| Security safeguards (Sec 8(5)) | ISMS evidence (ISO 27001, NIST CSF, sectoral framework); risk register; pen-test reports; vulnerability management records; access-control reviews; encryption inventory; logging and monitoring evidence. |
| Breach notification (Sec 8(6)) | Incident response plan with DPDPA-specific clauses; tabletop exercise records; sample DPB notification template; sample Principal notification template; clock matrix per applicable regulator. |
| Retention / erasure (Sec 8(7)) | Retention schedule by data category and purpose; deletion job logs; legal-hold register for data preserved beyond default retention. |
| Principal-rights (Sec 11–14) | Rights-request intake records; SLA evidence; refusal records with documented retention basis. |
| Children (Sec 9) | Age-gating mechanism design; parental-consent verification artefacts; targeted-advertising suppression configuration; behavioural-tracking suppression configuration. |
| SDF (Sec 10) | DPO appointment record; DPIA report; independent audit report; algorithmic / model risk register where applicable. |
| Cross-border (Sec 16) | Transfer register (where data flows); restricted-territories check at posture-determination time; sectoral-localisation conformance evidence. |
| Consent Manager integration | Integration design; consent receipt format; withdrawal-event handling; reconciliation reports. |

The `/ind-dpdpa:evidence-checklist` command renders the live checklist with collection guidance per evidence type.

## DPDP Rules 2025 — operational themes

The Rules notified in November 2025 give DPDPA its day-to-day shape. Headline themes:

| Theme | Rule cluster (paraphrased) |
|---|---|
| Notice content and language | Detailed content requirements, language coverage, accessibility for the visually impaired. |
| Consent format and management | Specifications for consent receipts; record retention; integration with Consent Managers. |
| Consent Manager registration | Capital and governance criteria, technical interoperability standards, supervisory expectations. |
| Breach notification | 72-hour timeline; format and content of notice to the DPB and affected Principals; mechanism for receipt; extension procedures on reasonable cause. |
| Children's data | Operational means of verifiable parental consent; mechanisms for age determination; permissible exemptions for educational and health services. |
| SDF obligations | DPIA cadence and form; periodic audit cadence and qualification of auditors; DPO scope. |
| Exemptions | Procedures for invoking research / archival / statistical exemptions; safeguards required. |
| DPB procedure | Inquiry process; timelines; written statements; orders; appeal route to the Telecom Disputes Settlement and Appellate Tribunal (TDSAT). |
| Cross-border restrictions | Mechanism for the Central Government to notify restricted territories. |

When a precise Rule number is needed for an assessment artefact, **read the gazette notification of the DPDP Rules 2025 directly** — that is the authoritative numbering.

## Penalty exposure (Schedule)

Penalties are imposed by the DPB after inquiry. Bands (per breach class):

- Up to **₹250 crore** — failure to take reasonable security safeguards (Section 8(5)) leading to a personal data breach
- Up to **₹200 crore** — failure to fulfil obligations relating to children (Section 9)
- Up to **₹150 crore** — failure to fulfil additional obligations of an SDF (Section 10)
- Up to **₹50 crore** — failure to inform the Board / affected Principal of a breach (Section 8(6))
- Up to **₹50 crore** — failure of a Data Principal to comply with Section 15 duties

The DPB considers nature, gravity, duration, type and nature of personal data, repetitive conduct, mitigation, and benefit gained / loss avoided in determining the actual penalty. Recidivism is treated as an aggravating factor.

## Implementation roadmap (mature programme)

For a Fiduciary starting an end-to-end DPDPA programme:

**Day 0 — Determine**
- Run `/ind-dpdpa:scope` for territorial / material applicability and role assignment.
- Build the regulator matrix (DPDPA + sectoral overlays).
- Inventory in-scope systems and data flows. Identify Processors.

**Phase 1 — Foundations (0–90 days)**
- Notice templates per language, per processing activity. Versioned.
- Consent capture redesign: opt-in, granular, withdrawable, recorded.
- Rights workflow: intake, triage, response SLAs, refusal logging.
- Breach playbook: parallel-clock matrix, notification templates (DPB + Principals), tabletop drill.
- Vendor / processor contract uplift: DPDPA addendum, security safeguards, breach-cooperation, deletion cascade.

**Phase 2 — SDF preparation (where applicable, 90–180 days)**
- DPO appointment (India-resident, accountable to Board).
- DPIA framework: trigger criteria, methodology, register.
- Independent auditor selection and first audit.
- Algorithmic risk inventory for model-driven decisions affecting Principals.

**Phase 3 — Continuous compliance (180+ days)**
- Evidence automation: consent receipts, deletion jobs, audit logs flow into the GRC platform automatically.
- Quarterly internal reviews; annual independent review.
- Regulator matrix maintenance: sectoral rule changes, restricted-territory list checks.
- DPB filing register (any inquiry, notice, or order).
- Lessons-learned from sector incidents fed back into the breach playbook.

## Plugin commands

When the user invokes any of these, this skill provides the framework knowledge:

- `/ind-dpdpa:scope` — applicability and SDF-trigger walkthrough
- `/ind-dpdpa:assess` — gap assessment via SCF crosswalk
- `/ind-dpdpa:evidence-checklist` — evidence-by-theme list
- `/ind-dpdpa:breach-process` — 72-hour timeline and parallel sectoral clocks

## Caveats

- This skill paraphrases statutory obligations; the gazette text of the Act and Rules is authoritative.
- Rule numbering for the DPDP Rules 2025 referenced here is illustrative — confirm specific rule numbers against the gazette notification when authoring compliance artefacts.
- Sectoral references (RBI, SEBI, IRDAI, TRAI, NHA, CERT-In) are provided so the engineering posture accounts for parallel obligations; the authoritative source for each is the regulator's own circulars and directions, not this skill.
- Penalty bands are from the Schedule attached to the Act. Actual penalty in any matter is determined by the DPB on the merits.
- This is engineering and assessment guidance, **not legal advice**. Confirm postures with qualified counsel before treating any output as compliant.
