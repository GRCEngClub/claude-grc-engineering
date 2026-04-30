---
description: Evidence checklist for APRA CPS 234 assessments
---

# APRA CPS 234 Evidence Checklist

Baseline evidence checklist for an APRA CPS 234 assessment. The SCF crosswalk
maps 52 SCF controls to the 38 CPS 234 controls; this command enumerates what
evidence tends to be expected for each SCF family in scope.

## Usage

```bash
/au-apra-cps-234:evidence-checklist [--family=<SCF_family_code>]
```

## Arguments

- `--family=<SCF_family_code>` (optional) - restrict to a single SCF family
  such as `IAC`, `CRY`, `AST`, or `BCD`. Defaults to all families mapped for
  this framework.

## Output

Markdown checklist grouped by SCF family with:

- SCF control ID to framework-native control ID(s) from the crosswalk.
- Evidence types typically expected.
- Which connector plugins can collect each type automatically.
- Which items require manual upload or narrative.

## Framework-specific evidence

Collect CPS 234 evidence around information assets and operating control
effectiveness:

- **Governance and accountability**: information security policy, board and
  senior management reporting, risk appetite, risk acceptance records, and
  control ownership evidence.
- **Information asset inventory**: asset owners, sensitivity and criticality
  ratings, data flows, business services supported, third-party dependencies,
  and hosting locations.
- **Information security capability**: threat and vulnerability monitoring,
  security standards, architecture controls, awareness, staffing, tooling, and
  capability reviews.
- **Control implementation**: access controls, logging, encryption,
  vulnerability management, change management, backup and recovery, endpoint and
  network controls, and secure configuration evidence.
- **Control testing**: testing strategy, testing frequency rationale, test
  plans, penetration tests, control self-assessments, independent assurance,
  failed-test remediation, and retest results.
- **Third-party and related-party reliance**: contracts, assurance reports,
  control test results, service provider risk assessments, cloud evidence, and
  monitoring of outsourced control operation.
- **Incident management**: incident response plan, materiality criteria,
  escalation records, APRA notification analysis, post-incident reviews, and
  corrective action tracking.
- **Weakness management**: material control weakness register, remediation
  plans, risk acceptance, APRA notification analysis, and board reporting.

Prefer structured exports from identity, ticketing, cloud, vulnerability
management, SIEM, GRC, and vendor-risk systems over screenshots. Where evidence
is narrative, capture the owner, approval date, asset scope, materiality
assessment, and link to the underlying operating record.
