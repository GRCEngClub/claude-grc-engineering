---
description: NIST CSF 2.0 Profile gap assessment via SCF crosswalk
---

# NIST CSF 2.0 Assessment

Runs a Profile gap assessment against **NIST Cybersecurity Framework v2.0** by delegating to `/grc-engineer:gap-assessment` with the framework's SCF identifier, then overlays CSF-specific framing (Function / Category / Subcategory, Current Profile vs Target Profile, Tier rationale).

## Usage

```text
/nist-csf-20:assess [--function=<GV|ID|PR|DE|RS|RC>] [--profile=<current|target|gap>] [--sources=<connector-list>]
```

## Arguments

- `--function=<code>` (optional) — narrow the assessment to a single Function. Codes: `GV` (Govern), `ID` (Identify), `PR` (Protect), `DE` (Detect), `RS` (Respond), `RC` (Recover). Default: all six.
- `--profile=<phase>` (optional) — which Profile phase to produce:
  - `current` — Current Profile only (snapshot of present-state outcomes)
  - `target` — Target Profile only (desired-state outcomes; usually informed by a Community Profile)
  - `gap` (default) — both, with the delta highlighted
- `--sources=<connector-list>` (optional) — comma-separated connector plugins (e.g. `aws-inspector,github-inspector,okta-inspector`).

If `/nist-csf-20:scope` has been run, this command will pick up the recorded Function scope, Tier targets, and Community Profile selection from that session.

## What the assessment produces

1. **Profile snapshot** — Current Profile, Target Profile, or both (per `--profile`), organized by Function → Category → Subcategory.
2. **Subcategory-level status** — for each Subcategory: implemented / partially implemented / not implemented / not applicable, with evidence pointers and gap rationale.
3. **Function-level rollup** — board-readable summary (% Subcategories meeting target, by Function).
4. **Tier rationale** — the practitioner's assessment of organizational Tier (1–4), grounded in observed risk-management practices, not Subcategory counts.
5. **Evidence gaps** — Subcategories where no evidence source is configured (typically Govern outcomes that depend on policy / charter documents not yet linked).
6. **Remediation roadmap** — prioritized initiatives mapped to Subcategories, with effort and impact estimates. Pulls multi-framework optimization data when other frameworks are also being assessed.

## Delegation

Under the hood:

```text
/grc-engineer:gap-assessment "general-nist-csf-2-0" [--sources=<connector-list>]
```

The SCF crosswalk expands 250 SCF controls into the 134 CSF 2.0 Subcategory mappings. This command then re-organizes the SCF-family-grouped output into the CSF Function structure that practitioners and boards expect.

## CSF-specific assessment notes

### Most-requested scope

The most common assessment requests are:

- **Full Profile (all six Functions)** — annual reassessment driver. Default.
- **Govern Function only** — when refreshing the new (CSF 2.0) governance content, often as a discrete project after the migration from CSF 1.1.
- **Detect + Respond + Recover** — incident-readiness assessment, often triggered by a near-miss or a peer breach.
- **Protect** — technical hardening assessment, often before or after a major architecture change.
- **Single Subcategory (advanced)** — typically used when a regulator has flagged a specific outcome.

### Sibling-framework interactions

CSF assessments are rarely run in isolation. Common combined assessments:

- **CSF + NIST SP 800-53 Rev. 5** — federal contractors / FedRAMP workloads. CSF assessment rolls up 800-53 control evidence into Subcategory-level Profile statements.
- **CSF + ISO/IEC 27001:2022** — international organizations. ISO certification work feeds CSF Subcategories via Annex A Informative References.
- **CSF + HIPAA Security Rule** — healthcare. CSF Profile becomes the umbrella; HIPAA Security Rule controls feed PR/DE/RS/RC Subcategories.
- **CSF + PCI DSS v4.0.1** — anyone handling cardholder data. PCI DSS controls feed PR.DS, PR.AA, DE.CM Subcategories within CDE scope.
- **CSF + CMMC** — defense contractors. CSF Profile is a useful pre-assessment sanity check before C3PAO engagement.
- **CSF + NIS2** — EU operations. CSF can serve as the internal cybersecurity management framework demonstrating NIS2-required risk-management measures.

For multi-framework optimization, see `/grc-engineer:optimize-multi-framework` and `/grc-engineer:map-controls-unified`.

### Cadence

CSF imposes no mandatory cadence (it's voluntary), but a defensible practitioner cadence is:

- **Annual full-Profile reassessment** — aligned with fiscal year budgeting
- **Quarterly Function-level review** — initiative tracking, board reporting
- **Triggered partial reassessment** — material change (M&A, major incident, new business line, new regulation, significant supply chain shift) triggers reassessment of affected Functions
- **CSF 1.1 → 2.0 migration** — one-time exercise; plan around the new Govern Function and rebalanced Categories

If the assessment is feeding into a regulator's examination cycle (HIPAA risk analysis, PCI DSS ROC, NERC CIP audit, etc.), align CSF cadence with the regulator's cadence so artifacts can be reused.

### Common misinterpretations to correct during assessment

- **"This Subcategory is N/A because we use a SaaS vendor."** Outcomes may shift to the vendor, but the *outcome itself* still applies; document the vendor's evidence (e.g. their SOC 2 report, their CSF Profile if they publish one) rather than marking N/A.
- **"We're at Tier 4 because we have lots of tools."** Tooling does not equal Tier. Tier characterizes risk-management practice rigor and adaptiveness, not technology stack depth.
- **"Govern is just policy documents."** Govern includes strategy, oversight, risk tolerance, RACI, and cybersecurity supply chain risk management (GV.SC). Do not collapse it to policy.
- **"Implementation Examples are mandatory."** They are not. Examples are non-prescriptive starting points; the Subcategory outcome is what's being assessed.
- **"CSF gives us a compliance certification."** It does not. There is no CSF certification. Assessment outputs are Profiles and Tier statements, not certifications.

### Output formats

- `text` (default) — full markdown gap analysis report
- `json` — machine-readable, suitable for downstream tooling and CI/CD gating
- `csv` — Subcategory-by-Subcategory matrix for spreadsheet import (common ask from boards and program managers)

Specify via `--format=<text|json|csv>`.

## Examples

```bash
# Full Profile gap assessment (all six Functions, current vs target)
/nist-csf-20:assess

# Govern Function only — board reporting prep
/nist-csf-20:assess --function=GV

# Detect/Respond/Recover for IR readiness review
/nist-csf-20:assess --function=DE
/nist-csf-20:assess --function=RS
/nist-csf-20:assess --function=RC

# Current Profile snapshot only (no Target comparison yet)
/nist-csf-20:assess --profile=current

# Pull connector evidence
/nist-csf-20:assess --sources=aws-inspector,github-inspector,okta-inspector
```

## Profile examples

These are illustrative Current → Target Profile snapshots for three common scenarios. Use them as a calibration reference when authoring or reviewing Profiles — not as defaults to copy verbatim, since risk tolerance and resourcing vary.

### Scenario 1: Mid-market company building its first formal program

**Context**: 300-person SaaS company, no prior formal cybersecurity program, no mandatory regulation (not HIPAA/PCI), cyber insurance renewal driving the engagement.
**Tier — Current**: 1 (Partial) | **Tier — Target**: 3 (Repeatable), 18–24 month horizon

| Function | Subcategory | Current state | Target state |
| --- | --- | --- | --- |
| GV | GV.OC-01 | Not implemented — no written cybersecurity strategy | Implemented — cybersecurity strategy approved by CEO, reviewed annually |
| GV | GV.RM-02 | Not implemented — no risk appetite statement | Implemented — board-approved risk appetite statement in place |
| GV | GV.RR-02 | Partially implemented — CISO role exists but RACI informal | Implemented — formal RACI, CISO charter, board oversight charter |
| ID | ID.AM-01 | Partially implemented — spreadsheet, not automated | Implemented — CMDB with automated discovery, reconciled quarterly |
| ID | ID.RA-01 | Not implemented — no formal vulnerability scanning | Implemented — authenticated scans monthly, critical vulns remediated within SLA |
| PR | PR.AA-03 | Partially implemented — MFA on email only | Implemented — MFA enforced on all user-facing systems and privileged access |
| PR | PR.DS-01 | Not implemented — S3 buckets unencrypted in some environments | Implemented — encryption at rest enforced by policy across all storage |
| DE | DE.CM-01 | Not implemented — no centralized logging | Implemented — SIEM ingesting all critical log sources, 90-day retention |
| RS | RS.MA-01 | Not implemented — no written IR plan | Implemented — IR plan written, tabletop exercised annually |
| RC | RC.RP-01 | Not implemented — no BCDR plan | Implemented — BCDR plan tested, RTO/RPO defined and met in last test |

**Quick wins (high ROI, low effort)**: GV.PO-01 (write policies), PR.AA-03 (expand MFA), ID.AM-01 (automate asset inventory), RS.MA-01 (document IR plan).

---

### Scenario 2: Federal contractor preparing for a CSF-aligned solicitation

**Context**: 1,200-person defense services firm, existing NIST SP 800-171 / CMMC Level 2 work underway. A new civilian agency contract requires a CSF Profile submission.
**Tier — Current**: 2 (Risk Informed) | **Tier — Target**: 3 (Repeatable), aligned with existing CMMC timeline

| Function | Subcategory | Current state | Target state |
| --- | --- | --- | --- |
| GV | GV.OC-03 | Implemented — regulatory register maintained (DFARS, CMMC, FAR) | Implemented — expand to cover new civilian agency requirements |
| GV | GV.SC-04 | Partially implemented — critical subcontractors identified informally | Implemented — tiered supplier inventory with criticality scores, reviewed annually |
| GV | GV.SC-07 | Not implemented — no ongoing vendor risk monitoring cadence | Implemented — annual supplier reassessment for Tier 1 vendors, quarterly for critical |
| ID | ID.RA-09 | Partially implemented — software SCA in CI/CD, hardware not covered | Implemented — hardware provenance checks in procurement; SBOM produced for all deliverables |
| PR | PR.AA-05 | Implemented — RBAC defined in 800-171 SSP | Implemented — reuse 800-171 evidence wholesale via Informative Reference |
| PR | PR.PS-06 | Partially implemented — SAST in pipeline, no DAST | Implemented — SAST + DAST in CI/CD, results reviewed before release |
| DE | DE.CM-09 | Implemented — EDR deployed on all endpoints | Implemented — extend to cover OT/ICS assets in scope |
| RS | RS.AN-07 | Not implemented — no formal forensic evidence handling procedure | Implemented — forensic evidence collection procedure with chain-of-custody records and integrity hashing in place |

**Note**: Most 800-53 Rev. 5 control evidence maps directly to CSF Subcategories via Informative References. Reuse existing SSP and POA&M artifacts; avoid re-collecting evidence already gathered for 800-171/CMMC work.

---

### Scenario 3: Healthcare organization using CSF as the umbrella above HIPAA

**Context**: Regional health system, 4,500 employees, subject to HIPAA Security Rule. Using CSF to give the board a single-page cybersecurity view and to structure the annual HIPAA Security Risk Analysis.
**Tier — Current**: 2 (Risk Informed) | **Tier — Target**: 3 (Repeatable), driven by HHS OCR audit preparation

| Function | Subcategory | Current state | Target state | HIPAA mapping |
| --- | --- | --- | --- | --- |
| GV | GV.OC-03 | Implemented — HIPAA regulatory register maintained | Implemented — expand to cover state breach notification laws and 42 CFR Part 2 | 45 CFR §164.306 |
| GV | GV.RM-01 | Partially implemented — risk analysis done, but not tied to formal risk appetite | Implemented — risk appetite statement board-approved, SRA output feeds risk register | 45 CFR §164.308(a)(1) |
| ID | ID.RA-01 | Implemented — vulnerability scans quarterly on ePHI systems | Implemented — extend to medical devices and OT systems | 45 CFR §164.308(a)(1) |
| ID | ID.AM-03 | Partially implemented — data flows documented for primary EHR, not all integrations | Implemented — full ePHI data flow map updated annually and on architecture change | 45 CFR §164.308(a)(1) |
| PR | PR.DS-01 | Partially implemented — EHR encrypted; medical devices and PACS not consistently | Implemented — encryption enforced or compensating controls documented for all ePHI at rest | 45 CFR §164.312(a)(2)(iv) |
| PR | PR.AT-01 | Implemented — annual HIPAA training | Implemented — role-based training for clinical, administrative, and IT staff | 45 CFR §164.308(a)(5) |
| DE | DE.CM-03 | Partially implemented — audit logging on EHR, no UEBA | Implemented — UEBA or equivalent anomalous-access detection on all ePHI systems | 45 CFR §164.312(b) |
| RS | RS.CO-02 | Implemented — breach notification process for HHS/OCR | Implemented — expand to cover state AG notifications and media where required | 45 CFR §§164.404–410 |

**Reuse guidance**: HIPAA Security Rule audit evidence (risk analyses, training records, BAAs, access logs, encryption configurations) counts directly as CSF evidence for the corresponding Subcategories. Do not collect twice.

---

## Related commands

- `/nist-csf-20:scope` — define Profile scope, Tier target, sector overlays before assessment
- `/nist-csf-20:evidence-checklist` — enumerate evidence per Function before / during assessment
- `/grc-engineer:gap-assessment general-nist-csf-2-0` — direct SCF-crosswalk-driven assessment
- `/grc-engineer:optimize-multi-framework` — when CSF is being assessed alongside multiple frameworks

---

**Framework**: NIST Cybersecurity Framework v2.0 (final, February 26, 2024)
**SCF ID**: `general-nist-csf-2-0`
**Status**: Voluntary; widely adopted as a U.S. and international cybersecurity baseline
