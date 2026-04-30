---
description: NIST CSF 2.0 Profile gap assessment via SCF crosswalk
---

# NIST CSF 2.0 Assessment

Runs a Profile gap assessment against **NIST Cybersecurity Framework v2.0** by delegating to `/grc-engineer:gap-assessment` with the framework's SCF identifier, then overlays CSF-specific framing (Function / Category / Subcategory, Current Profile vs Target Profile, Tier rationale).

## Usage

```
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

```
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

```
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

## Related commands

- `/nist-csf-20:scope` — define Profile scope, Tier target, sector overlays before assessment
- `/nist-csf-20:evidence-checklist` — enumerate evidence per Function before / during assessment
- `/grc-engineer:gap-assessment general-nist-csf-2-0` — direct SCF-crosswalk-driven assessment
- `/grc-engineer:optimize-multi-framework` — when CSF is being assessed alongside multiple frameworks

---

**Framework**: NIST Cybersecurity Framework v2.0 (final, February 26, 2024)
**SCF ID**: `general-nist-csf-2-0`
**Status**: Voluntary; widely adopted as a U.S. and international cybersecurity baseline
