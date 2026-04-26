---
description: India DPDPA — applicability, role assignment, SDF trigger walkthrough, sectoral overlay
---

# India DPDPA Scope

Determines whether DPDPA applies, what role the entity holds, whether Significant Data Fiduciary (SDF) thresholds are at risk, and which sectoral regulators overlay obligations on top of DPDPA.

Run this **before** `/ind-dpdpa:assess`. The assessment behaves differently depending on the role and SDF status.

## Usage

```
/ind-dpdpa:scope [--section=applicability|role|sdf|cross-border|sectoral|exemptions]
```

If `--section` is omitted, the command walks the full decision tree.

## 1. Territorial and material applicability (Section 3)

Answer in order. The first **No** to a hard requirement breaks scope.

### 1.1 Is processing of digital personal data involved?

DPDPA covers personal data **in digital form**, or **in non-digital form digitised subsequently**. Purely paper-based processing that is never digitised is out of scope.

- ☐ Personal data is collected, stored, processed in digital form, **OR**
- ☐ Personal data is collected on paper and digitised at some later point.

If neither is true → **out of scope**. Stop here.

### 1.2 Does at least one of the territorial triggers apply?

- ☐ **In-India processing**: any processing within Indian territory, regardless of where the entity is established or headquartered.
- ☐ **Extra-territorial processing in connection with offering goods or services to Data Principals located in India**.

If neither is true → **out of scope**. Stop here.

The extra-territorial trigger is broader than it appears. Indicators that the trigger is engaged for an entity outside India:

- Pricing in INR
- Payment methods that include UPI / RuPay / India-only rails
- Marketing copy targeting Indian users (Hindi or other Indian-language UI; "available in India"; India-specific offers)
- Customer support hours that include India business hours; phone numbers in +91
- App store listings released in India
- T&Cs that include reference to India / Indian law
- Material number of users with Indian IPs / billing addresses

The **monitoring of behaviour** trigger that GDPR has is **not** a standalone DPDPA trigger — DPDPA hooks on offering goods or services. However, monitoring *as a service offered to Indian users* (e.g. an analytics product whose buyers monitor Indian-resident users) is in scope via the offering-of-services route.

### 1.3 Does any Section 17 exemption fully apply?

- ☐ Personal-or-domestic processing by an individual.
- ☐ Personal data made publicly available by the Principal themselves, or by another person under a legal obligation to publish.
- ☐ State processing for sovereign functions (where notified).
- ☐ Research / archiving / statistical processing (subject to safeguards prescribed under the Rules).
- ☐ Prevention / detection / investigation of offences (where notified).
- ☐ Other classes notified under Section 17.

If a full exemption applies, scope ends. Most commercial processing **does not** qualify for any of these exemptions, and the burden is on the Fiduciary to demonstrate it does.

**Output of step 1**: APPLICABLE / NOT APPLICABLE / PARTIALLY EXEMPT (with the exempt subset clearly identified).

## 2. Role assignment

Determine the entity's primary role. Note that an organisation can hold multiple roles for different processing activities.

### 2.1 Data Fiduciary

The entity is a Data Fiduciary if it **decides the purpose and means** of processing — what data, what it's used for, how, with whom shared.

**Indicators**:

- The entity collects personal data directly from Principals or from another Fiduciary.
- The entity decides retention periods, processing purposes, and disclosure recipients.
- The entity owns the customer / user / employee relationship.

### 2.2 Data Processor

The entity is a Data Processor if it processes personal data **on behalf of a Fiduciary under contract**, acting on the Fiduciary's instructions.

**Indicators**:

- Processing is governed by a contract with another organisation (the Fiduciary).
- The entity does not independently decide retention, additional purposes, or disclosure recipients.
- Examples: cloud hosting providers, payroll processors, KYC vendors, analytics partners that operate on the Fiduciary's data.

A Processor that decides to use the data for its own purpose (analytics on aggregated trends, model training, monetisation) **becomes a Fiduciary** for that processing — irrespective of contract wording.

### 2.3 Consent Manager

A registrable entity that manages consents on behalf of Data Principals. Consent Managers register with the Data Protection Board under the DPDP Rules 2025 conditions and are accountable to the Principal, not the Fiduciary.

**Most organisations are not Consent Managers** — this role is specific.

### 2.4 Mixed roles

Common pattern: an organisation is a Fiduciary for its own customers, a Processor for a partner's data flowing through its systems, and engages many Processors. Each role-relationship is governed independently.

**Output of step 2**: per processing activity, the entity is `Fiduciary` / `Processor` / `Consent Manager` / `Joint`.

## 3. Significant Data Fiduciary (SDF) trigger assessment (Section 10)

The Central Government may notify a Fiduciary as an SDF based on these factors. Even before designation, prudent organisations assess proximity to the triggers and prepare proportionally.

### 3.1 Volume of personal data processed

- ☐ Tens of millions of Indian Data Principals' records processed routinely.
- ☐ National-scale platforms (e-commerce marketplaces, super-apps, large social platforms, large telecom providers, large banks).

### 3.2 Sensitivity of personal data

- ☐ Health data at scale.
- ☐ Financial / credit data at scale.
- ☐ Biometric data (face, fingerprint, voice) processed for identification or unique recognition.
- ☐ Location data continuously collected.
- ☐ Children's personal data at scale (independent of Section 9 obligations).

### 3.3 Risk to rights of Data Principals

- ☐ Processing that supports automated decisions materially affecting Principals (credit scoring, hiring, pricing, content amplification, eligibility decisions).
- ☐ Processing that involves profiling for advertising or recommendation.
- ☐ Processing that creates risk of identity theft, financial harm, or reputational harm at scale.

### 3.4 Risk to sovereignty, integrity, electoral integrity, public order

- ☐ Operating critical information infrastructure (CII) under NCIIPC.
- ☐ Operating digital public infrastructure (DPI) at national scale.
- ☐ Influence on public discourse / elections (large-reach platforms, news aggregators, recommendation systems with national reach).
- ☐ Aggregating data that could reveal patterns of public order significance.

### 3.5 Likely-SDF candidates today

Organisations in this typical zone start SDF preparation now, not after notification:

- Tier-1 banks, payment systems operators, large NBFCs.
- National-scale telecom providers.
- Large consumer internet platforms (e-commerce, social, ride-hailing, food, edtech).
- National digital health platforms, ABDM custodians.
- Cloud / hyperscaler infrastructure providers with material Indian data exposure.
- Identity / KYC / Aadhaar-linked service providers.

### 3.6 SDF additional obligations to plan for

If proximate to SDF triggers, plan for:

- **DPO (Indian-resident, accountable to Board)** — name, role, reporting line, budget, escalation path.
- **DPIA framework** — when to trigger, methodology, sign-off, register, periodic review.
- **Periodic independent audit** — auditor selection, scope, cadence, remediation pipeline.
- **Algorithmic / automated-decision risk assessment** where decisions materially affect Principals.

**Output of step 3**: SDF status `notified` / `likely candidate` / `not proximate` / `unclear — re-assess`.

## 4. Cross-border posture (Section 16)

DPDPA's default is **permissive** — transfer outside India is allowed unless the Central Government has notified the destination as restricted.

### 4.1 Transfer inventory

- ☐ Where do production data flows go? (Cloud regions, SaaS vendor regions, partner regions.)
- ☐ Where do analytical / backup / DR copies go?
- ☐ Where does support staff access from?

For each destination, record the destination country and the data category transferred.

### 4.2 Restricted-territory check

- ☐ Has the Central Government notified any of those destinations as restricted under Section 16?

The list is published by the Central Government and updated by gazette notification. **Query the latest gazette / MeitY notification at posture-determination time**. The plugin does not vendor the list.

### 4.3 Sectoral localisation overlay

Even when DPDPA permits the transfer, sectoral rules may require domestic storage:

- **RBI**: Storage of Payment System Data (April 2018) — payment-system data must be stored only in India (offshore copy permitted for certain processing, then must return). Master Direction on IT Governance (2023) overlays additional storage / segregation rules.
- **SEBI**: CSCRF storage and incident-handling rules for securities-market participants.
- **IRDAI**: Information and Cyber Security Guidelines (2023) — insurer data handling.
- **DoT/TRAI**: Indian Telecommunications Act 2023 / Telecom Cyber Security Rules 2024 — traffic and subscriber data retention India-side.
- **CERT-In Direction 20(3)/2022**: 180-day log retention India-side; 5-year KYC retention for VPN / cloud / data-centre service providers.

The strictest binding rule wins.

**Output of step 4**: per data flow, posture `compliant` / `requires sectoral approval` / `prohibited under sectoral rule` / `prohibited under DPDPA notification`.

## 5. Sectoral overlay assessment

Identify which sectoral regulators apply to the entity. Each adds parallel obligations.

| Sector trigger | Regulator | Add to compliance map |
|---|---|---|
| ☐ Operates as a bank, NBFC, payment system operator, account aggregator | RBI | IT Governance MD 2023; Cyber Security Framework; 6-hour incident reporting; payment-system data localisation |
| ☐ Operates as a stock exchange, broker, investment advisor, MII, mutual fund, AIF | SEBI | CSCRF; 6-hour incident reporting; resilience standards |
| ☐ Operates as an insurer, broker, web aggregator | IRDAI | Information and Cyber Security Guidelines 2023; incident reporting per current circulars |
| ☐ Operates a telecom network, ISP, OTT-comms-as-a-service | DoT, TRAI | Indian Telecommunications Act 2023; Telecom Cyber Security Rules 2024; lawful interception; subscriber data |
| ☐ Operates digital health services, ABDM-linked services, hospital information system at scale | NHA, MoH&FW | ABDM data policy; Health Data Management Policy; ABHA consent flows |
| ☐ Operates Critical Information Infrastructure | NCIIPC | CII directions; incident reporting to NCIIPC |
| ☐ Operates VPN, cloud, data centre services at scale | CERT-In, MeitY | Direction 20(3)/2022 — KYC retention 5 years, log retention 180 days India-side, 6-hour incident reporting |
| ☐ Cross-listed or operates in EU / UK / Singapore / California | GDPR / UK GDPR / PDPA / CCPA | Build the multi-jurisdiction stricter-of matrix |

**Output of step 5**: sectoral matrix listing each regulator that applies and the operating-rule that binds.

## 6. Children's data trigger

- ☐ Does the service or product accept users under 18?
- ☐ Does the service have any feature that could be used by under-18s in practice (regardless of stated age limit)?
- ☐ Is there any behavioural tracking, profiling, or recommendation that could reach a child user?
- ☐ Is there any advertising experience that could target a child user?

If yes to any, Section 9 obligations apply: verifiable parental consent, no behavioural tracking of children, no targeted advertising at children. Penalty exposure up to ₹200 crore.

If the service is "not for children" but in practice reachable by them, design the verifiable-parental-consent flow as a default — not as an edge case.

## 7. Output: scope summary

Produce a structured summary covering:

| Field | Value |
|---|---|
| Entity | <name> |
| Applicability | APPLICABLE / NOT APPLICABLE / PARTIALLY EXEMPT |
| Role(s) per processing activity | Fiduciary / Processor / Consent Manager / Joint |
| SDF status | Notified / likely candidate / not proximate / unclear |
| Children's data exposure | Yes / No (default-assume Yes if reachable) |
| Cross-border destinations | <list> |
| Restricted-territory issues | None / <list> |
| Sectoral regulators in play | None / RBI / SEBI / IRDAI / DoT / NHA / NCIIPC / CERT-In / multi |
| Highest-stakes obligation theme | Security / Children / SDF / Breach / Cross-border / Notice-Consent |
| Recommended next command | `/ind-dpdpa:assess --scope=<theme> --role=<role>` |

This summary feeds `/ind-dpdpa:assess` and `/ind-dpdpa:evidence-checklist`. Re-run scope when:

- The Central Government notifies a new restricted territory under Section 16.
- The entity's user base materially crosses an SDF-proximate threshold.
- A new sectoral regulator is added to the entity's footprint.
- A new processing activity is launched that materially changes the data inventory.

## Disclaimer

This is engineering and assessment guidance only. **Not legal advice.** Confirm scope determinations with qualified counsel before treating any output as definitive.
