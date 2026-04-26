# ind-dpdpa — India DPDPA (2023) + DPDP Rules (2025)

Reference-depth framework plugin for India's **Digital Personal Data Protection Act, 2023** and its operational rules **DPDP Rules, 2025**. Built for CISOs, DPOs, GRC engineers, and platform teams operating in India or offering goods and services to Data Principals located in India.

```bash
# Install
/plugin install ind-dpdpa@grc-engineering-suite

# Use
/ind-dpdpa:scope                  # confirm applicability + role + SDF triggers
/ind-dpdpa:evidence-checklist     # collect evidence by Act theme
/ind-dpdpa:breach-process         # walk through the 72-hour notification timeline
/ind-dpdpa:assess                 # run the gap assessment
```

## What this plugin covers

DPDPA + DPDP Rules together regulate **digital personal data processing** in India and by entities outside India that offer goods or services to Data Principals located in India. This plugin treats the two as one body of law:

| Layer | What it sets | Status |
|---|---|---|
| **DPDPA 2023** (the Act) | Substantive obligations on Data Fiduciaries; rights of Data Principals; penalty schedule; Data Protection Board structure | Enacted 2023 |
| **DPDP Rules 2025** | Operational detail — breach notification timelines, Consent Manager registration, exemption procedures, SDF-related thresholds | Notified November 2025 |
| **Data Protection Board (DPB) orders** | Binding interpretations through enforcement actions | Emerging |

The plugin maps to the **SCF crosswalk** for `apac-ind-dpdpa-2023`: 41 SCF controls cover the 96 mapped DPDPA control identifiers (Act sections + Rules clauses).

## Roles

| Role | DPDPA term | What it means in practice |
|---|---|---|
| Determines purpose and means of processing | **Data Fiduciary** | A bank, e-commerce platform, SaaS vendor, healthcare provider, government body — anyone who decides what to do with personal data |
| Processes on behalf of a Fiduciary under contract | **Data Processor** | Cloud providers, payroll vendors, KYC vendors, analytics partners |
| Whose data is processed | **Data Principal** | The natural person; if a child, the parent/guardian acts |
| Manages consents on behalf of Data Principals | **Consent Manager** | A Board-registered entity that brokers, withdraws, and produces evidence of consents |
| Notified by the Central Government for higher-risk processing | **Significant Data Fiduciary (SDF)** | Subset of Fiduciaries — additional obligations: appointed DPO based in India, periodic DPIA, periodic audit |

`/ind-dpdpa:scope` walks through the SDF triggers (volume of data, sensitivity, sovereignty / electoral / public-order risk).

## Commands

| Command | Purpose |
|---|---|
| `/ind-dpdpa:scope` | Determine applicability, role assignment, and whether SDF criteria apply. Run this first. |
| `/ind-dpdpa:assess` | Compliance gap assessment via SCF crosswalk. Supports `--scope=`, `--role=`, `--sources=`. |
| `/ind-dpdpa:evidence-checklist` | Evidence patterns grouped by DPDPA theme — Notice, Consent, Purpose Limitation, Retention, Rights, Security, Breach, Cross-border, Children, SDF obligations. |
| `/ind-dpdpa:breach-process` | DPDP Rules 2025 R7 — the 72-hour breach notification timeline, parallel sectoral clocks (RBI 6-hour, CERT-In 6-hour), notice content, and Board-side procedure. |

## Sectoral overlap

DPDPA does **not** displace sectoral data and security rules — they stack. A Data Fiduciary that is also a regulated entity must comply with both. The plugin flags overlaps in assessment output but does not enforce sectoral rules itself; for those, install the sector-specific plugin (when available) or refer to the org's sectoral playbook.

| Sector | Regulator | Key overlap |
|---|---|---|
| **Banking, NBFCs, payment systems** | RBI | Master Direction on Information Technology Governance, Risk, Controls and Assurance Practices (2023); Cyber Security Framework for Banks; 6-hour incident reporting on cyber events. RBI's incident clock runs in parallel with DPDPA's 72-hour breach clock. |
| **Capital markets** | SEBI | Cyber Security and Cyber Resilience Framework (CSCRF); 6-hour reporting for cyber incidents at MIIs and intermediaries. |
| **Insurance** | IRDAI | Information and Cyber Security Guidelines (2023); breach reporting timelines per IRDAI directives. |
| **Telecom / DPI** | DoT, TRAI | Indian Telecommunications Act 2023 user-data rules; Telecom Cyber Security Rules 2024 incident reporting. |
| **Digital health** | NHA / MoH&FW | Ayushman Bharat Digital Mission (ABDM) data policy; Health Data Management Policy. Children's-data rules under DPDPA Section 9 interact with parental consent for ABDM accounts. |
| **All sectors (cyber)** | CERT-In | Direction No. 20(3)/2022 — 6-hour reporting of cyber incidents (broader than DPDPA's data-breach scope; both can apply). |

## Penalty exposure (Schedule to the Act)

Penalties are imposed by the Data Protection Board after inquiry. Headline bands (per breach):

- Up to **₹250 crore** — failure to take reasonable security safeguards (Section 8(5)) leading to a personal data breach
- Up to **₹200 crore** — failure to fulfil obligations relating to children (Section 9)
- Up to **₹150 crore** — failure to fulfil additional obligations of an SDF (Section 10)
- Up to **₹50 crore** — failure to notify the Board / affected Principals of a breach (Section 8(6))

Use these to prioritise remediation in `/ind-dpdpa:assess` output.

## What this plugin does **not** claim

- **Not legal advice.** DPDPA enforcement and binding interpretation come from the Data Protection Board of India, MeitY notifications, and the courts — not this plugin. Confirm postures with qualified counsel.
- **Not a Consent Manager.** Consent Managers are Board-registered entities; this plugin is GRC tooling.
- **Not a substitute for the Act or Rules.** The plugin paraphrases obligations and references sections by number. The licensed text of the Act and the gazette notifications of the Rules are the source of truth.
- **No restricted-territories list.** Section 16 cross-border transfer restrictions are governed by lists notified by the Central Government. Those lists change. This plugin does not vendor a copy.

## Metadata

| | |
|---|---|
| SCF framework ID | `apac-ind-dpdpa-2023` |
| Region | APAC |
| Country | IN |
| SCF controls mapped | 41 |
| Framework controls mapped | 96 |
| Depth | Reference |
| Regulator | Data Protection Board of India (DPB) under MeitY |
| Plugin author | [Devam Shah](https://github.com/DevamShah) |

## References

- [Secure Controls Framework](https://securecontrolsframework.com) — crosswalk source (CC BY-ND 4.0)
- [SCF API entry](https://grcengclub.github.io/scf-api/api/crosswalks/apac-ind-dpdpa-2023.json) — 41 SCF → 96 DPDPA mappings
- [Framework Plugin Guide](../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) — depth tiers and level-up checklist
- DPDPA 2023 — text published in the Gazette of India, August 2023
- DPDP Rules 2025 — text published in the Gazette of India, November 2025
