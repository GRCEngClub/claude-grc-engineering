---
description: SOX gap assessment via the SCF crosswalk, framed as ICFR readiness across the four ITGC domains, entity-level controls, and IT-dependent manual controls
---

# SOX Assessment

Runs a gap assessment for the **Sarbanes-Oxley Act of 2002** by delegating to `/grc-engineer:gap-assessment` with the framework's SCF identifier (`usa-federal-law-sox-2002`), then overlays SOX-specific framing — ICFR scope, ITGC domains, deficiency severity, and SOC 1 vendor reliance.

This is a **readiness assessment**, not an external audit. The output identifies gaps an auditor would likely surface; final classification of any gap as a control deficiency, significant deficiency, or material weakness is a judgment call requiring management and the external auditor.

## Usage

```
/us-sox:assess [--scope=<scope>] [--sources=<connector-list>]
```

## Arguments

- `--scope`: narrow the assessment
  - `itgc-access` — IT General Controls, Access to Programs and Data
  - `itgc-change` — IT General Controls, Program Changes
  - `itgc-operations` — IT General Controls, Computer Operations
  - `itgc-development` — IT General Controls, Program Development
  - `itgc-all` — All four ITGC domains
  - `entity-level` — Entity-Level Controls (ELCs)
  - `itdm` — IT-Dependent Manual Controls and report-integrity
  - `vendor-soc1` — Vendor SOC 1 reliance evaluation
  - `certifications` — §302 / §404 / §906 certification readiness
  - Default: full SOX readiness assessment
- `--sources=<connector-list>`: comma-separated connector plugins (e.g., `aws-inspector,okta-inspector,github-inspector`) to pull live evidence into the assessment.

## Pre-assessment confirmation

Before starting, confirm with the user:

1. **SEC-registrant status and filer category** — is the company a §12 registrant or §15(d) filer? Large accelerated, accelerated, non-accelerated, EGC, or SRC? This drives §404(b) exposure. If the user has not yet run scope, route to `/us-sox:scope` first.
2. **Materiality threshold** — has the external auditor set a financial-statement materiality threshold for the period? Without it, scope cannot be set defensibly. Surface as a blocker.
3. **In-scope inventory** — confirm in-scope financial accounts, business processes, applications, supporting infrastructure, and vendor systems with SOC 1 reliance.
4. **Audit history** — any prior-year significant deficiencies, material weaknesses, or auditor management letter comments? Year-over-year remediation status?
5. **Engagement cycle** — interim testing in progress, year-end rollforward, or post-fieldwork remediation?

## What the assessment produces

1. **Readiness score** — overall SOX ICFR readiness percentage, weighted across in-scope controls.
2. **ITGC heatmap** — readiness percentage per ITGC domain (Access, Change, Operations, Development) per in-scope system.
3. **Entity-level control coverage** — presence and operating evidence for the standard ELC set.
4. **IT-dependent manual control inventory** — ITDMs identified, with report-integrity testing status.
5. **Vendor SOC 1 reliance map** — for each in-scope vendor, SOC 1 coverage, exceptions, CUEC status, bridge-letter status.
6. **Gap log** — every identified gap with:
   - Affected control(s) and SOX section / ITGC domain reference
   - Evidence available vs. evidence missing
   - Tentative severity (control deficiency / significant deficiency / material weakness candidate) — with the explicit caveat that final classification belongs to management and the external auditor
   - Remediation recommendation
7. **Certification readiness** — §302 / §404(a) / §906 sign-off basis, with disclosure-committee and sub-certification population status.

## Delegation

Under the hood, the SCF mechanics are handled by the persona plugin:

```
/grc-engineer:gap-assessment "usa-federal-law-sox-2002" [--sources=<connector-list>]
```

The SCF crosswalk expands **4 SCF controls into 17 SOX-relevant controls**. That number is small because SOX itself does not enumerate technical control objectives — the security and IT control catalog flows in from COSO 2013 IC-IF, COBIT, and the AICPA SOC 1 framework rather than from SOX statutory text. This `assess` command therefore wraps the SCF gap-assessment output in ICFR-shaped sections and adds the entity-level / ITDM / vendor-SOC 1 dimensions that SCF alone does not capture.

## Output structure (suggested)

```
SOX READINESS ASSESSMENT
========================

Period:               [fiscal year / quarter]
Filer category:       [Large accelerated / Accelerated / Non-accelerated / EGC / SRC]
§404(b) applicable:   [Yes / No / EGC-exempt until <date>]
External auditor:     [firm — engagement type]

Overall readiness:    [N]% (control-weighted)

ITGC HEATMAP (per in-scope system)
----------------------------------
System              Access     Change    Operations  Development
[App 1]             [%]        [%]       [%]         [%]
[App 2]             [%]        [%]       [%]         [%]
...

ENTITY-LEVEL CONTROLS
---------------------
[ELC]                              [Status]    [Evidence]
Audit committee oversight          [PRESENT]   [charter + minutes]
Code of conduct                    [PRESENT]   [policy + ack population]
Whistleblower hotline              [PRESENT]   [hotline summary]
Fraud risk assessment              [PRESENT]   [annual FRA]
Period-end close controls          [PARTIAL]   [JE review log incomplete]
Disclosure committee               [PRESENT]   [charter + Q-end packs]
...

IT-DEPENDENT MANUAL CONTROLS
----------------------------
ITDM                                          Report-integrity   Manual control
[control 1]                                   [TESTED]           [SIGNED]
[control 2]                                   [NOT TESTED]       [SIGNED]
...

VENDOR SOC 1 RELIANCE
---------------------
Vendor       SOC 1 Type II   Period covered   CUECs operating   Bridge letter
[vendor 1]   [YES]           [start - end]    [YES]             [YES]
[vendor 2]   [SOC 2 only]    [n/a]            [n/a]             [n/a — direct testing]
...

GAP LOG
-------
🔴 MATERIAL-WEAKNESS CANDIDATE (n):
  - [gap] (system / domain / SOX section)
    Recommendation: [...]

🟡 SIGNIFICANT-DEFICIENCY CANDIDATE (n):
  - [gap] (system / domain / SOX section)
    Recommendation: [...]

🟠 CONTROL DEFICIENCY (n):
  - [gap] (system / domain / SOX section)
    Recommendation: [...]

🔵 OBSERVATION (n):
  - [gap] (process improvement)

CERTIFICATION READINESS
-----------------------
§302 disclosure-controls basis:  [READY / GAPS — see deficiency log]
§404(a) management assessment:   [READY / GAPS]
§404(b) auditor attestation:     [N/A — non-accelerated / EGC-exempt / coordinated with [firm]]
§906 criminal certification:     [READY / GAPS]
Sub-certification population:    [N collected / M outstanding]

OPEN BLOCKERS
-------------
- [list — e.g., materiality threshold not set, prior-year material weakness not remediated]

NEXT STEPS
----------
- /us-sox:evidence-checklist for collection planning
- Specific remediation items per gap log
```

## Severity classification — caveat

PCAOB AS 2201 defines three levels (paraphrased):

- **Control deficiency** — control design or operation does not allow management or employees to prevent or detect misstatements on a timely basis in the normal course of operations.
- **Significant deficiency** — less severe than a material weakness, but important enough to merit attention by those charged with governance.
- **Material weakness** — a deficiency, or combination, such that there is a reasonable possibility a material misstatement will not be prevented or detected on a timely basis.

This `assess` command can identify *candidate* severity tiers based on magnitude (relative to the auditor's materiality threshold) and likelihood (qualitative judgment based on the nature of the control, history, and compensating controls). **Final classification is a judgment call requiring management and the external auditor — not an automated output.** Material weakness has public-disclosure implications; do not represent automated severity tags as authoritative.

## Common assessment scopes

Frequently-requested scopes in practice:

- **Year 1 SOX program** — full assessment with emphasis on scoping, walkthroughs, and ITGC baseline establishment. Expect heavy gaps in Access (privileged access reviews), Change (change-completeness reconciliation), and vendor SOC 1 reliance.
- **Pre-IPO (S-1 readiness)** — full assessment 12–24 months pre-IPO. Output drives the IPO ICFR build plan.
- **Post-acquisition integration** — scope limited to the acquired entity, with a one-year integration runway.
- **Quarterly §302 readiness** — narrower scope, focused on disclosure-controls and material-change identification.
- **Year-end rollforward** — re-tests interim-tested controls for the rollforward period (Q3 close → year-end).
- **Material-weakness remediation validation** — narrow scope on the specific deficiency, with sample-size and operating-period considerations driven by the auditor.

## Interactions with sibling frameworks

- **SOC 2** — overlapping content (logical access, change management) but a different audit objective (Trust Services Criteria, not ICFR). Useful supplementary evidence; does not satisfy SOX vendor reliance on its own.
- **SOC 1 Type II** — the canonical vendor-reliance evidence for SOX. Always preferred over SOC 2 for in-scope vendor systems.
- **NYDFS 23 NYCRR 500, ISO 27001, NIST CSF / 800-53** — many engineering teams structure ITGC tooling so the same underlying controls (access reviews, change tickets, deployment logs, log retention) generate evidence usable across SOX and these adjacent frameworks. See `/grc-engineer:optimize-multi-framework` for cross-framework optimization.
- **HIPAA Security Rule** — for healthcare-sector public companies, the same change-management and logical-access tooling typically supports both HIPAA Technical Safeguards and SOX ITGCs.
- **PCI DSS** — separate scope, but for retailers and card-handling public companies the same change-management discipline often covers both.

## Cadence

- **Annual** — full §404(a) management assessment in the 10-K; full §404(b) auditor attestation (accelerated filers).
- **Quarterly** — §302 disclosure-controls certification in each 10-K and 10-Q; assessment of any material changes to ICFR for the quarter.
- **Per material event** — 8-K within 4 business days under §409.
- **Continuous** — deficiency logging and remediation tracking; ongoing user access reviews (often quarterly for privileged access); vendor SOC 1 collection on the vendor's cycle.

## Common misinterpretations corrected

- **"SOX is a security regulation."** It is a financial-reporting accountability statute. Cybersecurity work supports SOX only through ICFR over in-scope financial systems.
- **"§404(b) applies to everyone."** Non-accelerated filers and EGCs (for up to 5 years) are exempt.
- **"A SOC 2 satisfies SOX."** No — SOC 1 Type II is the appropriate evidence of vendor ITGCs for SOX.
- **"Material weakness equals a breach."** Material weakness is an ICFR control condition, not a security incident.

---

**Statute**: Public Law 107-204; 15 U.S.C. §§ 7201 et seq.
**Regulators**: SEC, PCAOB, DOJ
**Depth**: Reference (tier 2 of 3)
**Related commands**: `/us-sox:scope`, `/us-sox:evidence-checklist`, `/grc-engineer:gap-assessment`
