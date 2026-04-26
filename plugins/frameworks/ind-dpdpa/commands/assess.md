---
description: India DPDPA 2023 + DPDP Rules 2025 compliance gap assessment
---

# India DPDPA Assessment

Runs a compliance gap assessment against the **Digital Personal Data Protection Act, 2023 (DPDPA)** together with the operational obligations notified under the **Digital Personal Data Protection Rules, 2025 (DPDP Rules)**, by delegating to `/grc-engineer:gap-assessment` with the SCF crosswalk and overlaying India-specific context.

## Usage

```
/ind-dpdpa:assess [--scope=<scope>] [--sources=<connector-list>] [--role=<fiduciary|processor|consent-manager>]
```

## Arguments

- `--scope=<scope>` (optional) — narrow the assessment. Valid values:
  - `full` (default) — every applicable obligation
  - `notice-and-consent` — Sections 5–7 (notice, consent, legitimate uses)
  - `principal-rights` — Sections 11–14 (access, correction, erasure, grievance, nomination)
  - `fiduciary-obligations` — Section 8 (accuracy, security, breach, retention)
  - `sdf` — Significant Data Fiduciary obligations (Section 10 + Rules)
  - `cross-border` — Section 16 + restricted-territories rule
  - `children` — Section 9 (verifiable parental consent)
  - `breach-readiness` — Section 8(6) + DPDP Rules 2025 R7 (72-hour timeline)
- `--sources=<connector-list>` (optional) — comma-separated connector plugins (`aws-inspector`, `gcp-inspector`, `okta-inspector`, `github-inspector`, etc.).
- `--role=<role>` (optional) — `fiduciary` (controller-equivalent), `processor`, or `consent-manager`. Defaults to `fiduciary`. Determines which obligation set is assessed.

## Applicability

DPDPA applies to processing of digital personal data:

- **Within India**, regardless of where the Data Fiduciary is established; **and**
- **Outside India**, where the processing is in connection with offering goods or services to Data Principals located in India (Section 3).

It does **not** apply to:

- Personal data processed by a Data Principal for personal/domestic purposes
- Personal data made publicly available by the Data Principal themselves, or by a person under a legal obligation
- Certain notified exemptions for research, statistical, archival processing; instrumentalities of the State for sovereign functions; and prevention/detection of offences (Section 17)

Use `/ind-dpdpa:scope` to walk through these triggers in detail before running an assessment.

## Roles under DPDPA

| Role | DPDPA term | GDPR analogue |
|---|---|---|
| The party that determines purpose and means of processing | **Data Fiduciary** | Controller |
| The party that processes on behalf of a Fiduciary under contract | **Data Processor** | Processor |
| The natural person whose data is processed | **Data Principal** | Data Subject |
| A registrable entity that manages consents on behalf of Principals | **Consent Manager** | (no direct analogue) |
| A Fiduciary the Central Government notifies as having higher-risk processing | **Significant Data Fiduciary (SDF)** | (broader than GDPR's "large-scale" qualifier) |

Significant Data Fiduciary status carries additional obligations (DPO, DPIA, periodic audits) — see `/ind-dpdpa:scope` for the designation criteria.

## What the assessment produces

1. **Compliance score** — overall DPDPA readiness, weighted by the 41 SCF controls mapped to DPDPA in the SCF crosswalk.
2. **Applicable-obligations summary** — which Act sections and Rules apply given the supplied `--role` and `--scope`.
3. **Control-by-control gap** — for each of the 96 mapped DPDPA control identifiers (e.g. `8(6)`, `10(2)(a)`, `27(1)(a)`), pass/fail/inconclusive status from connector findings.
4. **Evidence gaps** — obligations where no connector source is configured. Use `/ind-dpdpa:evidence-checklist` to list what to collect manually.
5. **Cross-border posture** — flags processing into restricted territories (Section 16). The list is published by the Central Government; this plugin does not maintain it locally.
6. **Breach-readiness check** — whether the organisation can meet the DPDP Rules 2025 R7 timeline (72-hour notification to the Data Protection Board and to affected Data Principals). See `/ind-dpdpa:breach-process`.
7. **Sectoral-overlap notes** — where DPDPA obligations stack on top of RBI / SEBI / IRDAI / TRAI / NHA rules (banking, securities, insurance, telecom, healthcare). These are flagged, not enforced — sectoral rules are separate plugins or out of scope.
8. **Remediation roadmap** — prioritised by penalty exposure (Schedule of penalties: up to ₹250 crore per breach class).

## Delegation

Under the hood:

```
/grc-engineer:gap-assessment "apac-ind-dpdpa-2023" [--sources=<connector-list>]
```

The SCF crosswalk expands the 41 mapped SCF controls into the 96 DPDPA control identifiers. DPDPA control IDs follow the Act's section numbering, e.g. `8(6)` = Section 8, sub-section (6); `27(1)(a)` = Section 27, sub-section (1), clause (a).

## Framework-specific notes

- **Act + Rules read together.** The Act establishes obligations; the DPDP Rules 2025 (notified November 2025) set the operational timelines and procedural detail. Treat them as one body of law for assessment purposes — gaps in either side count.
- **No registration of Data Fiduciaries.** Unlike some regimes, DPDPA does not require general registration. Only Consent Managers register with the Data Protection Board.
- **Verifiable parental consent.** Section 9 prohibits behavioural tracking and targeted advertising directed at children, and requires verifiable parental consent for processing children's data. This is a distinct posture check, not just a sub-case of consent.
- **Cross-border default-allow-with-blocklist.** Section 16 permits transfer outside India unless the Central Government notifies a restricted territory. This is the inverse of GDPR's default-restrict approach. The blocklist is a separate compliance lookup; see `/ind-dpdpa:scope --section=cross-border`.
- **Penalty exposure differs by obligation.** The Schedule attached to the Act sets penalty bands (up to ₹250 crore for breach-of-security-safeguards failures; up to ₹200 crore for failure to fulfil obligations to children). Prioritise remediation by exposure.
- **Sectoral overlay.** Where the Data Fiduciary is also regulated by RBI (banks, NBFCs, payment systems), SEBI (capital markets), IRDAI (insurance), TRAI/DoT (telecom) or governed by ABDM (digital health), those sectoral rules may impose stricter or earlier-deadline obligations (e.g. RBI's 6-hour cyber-incident reporting under the Cyber Security Framework runs in parallel with DPDPA's 72-hour breach notification — both clocks must run). This plugin flags overlaps; the relevant sectoral plugin (or the org's own sectoral playbook) handles those rules.

## Disclaimer

This plugin provides **engineering and assessment guidance only**. It is not legal advice. DPDPA enforcement is by the Data Protection Board of India and binding interpretations come from the Board's orders and notifications by MeitY. Confirm postures with qualified counsel before treating any output as compliant.
