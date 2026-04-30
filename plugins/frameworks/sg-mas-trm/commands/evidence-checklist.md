---
description: Evidence checklist for Singapore MAS TRM assessments
---

# Singapore MAS TRM Evidence Checklist

Baseline evidence checklist for a Singapore MAS TRM assessment. The SCF
crosswalk maps 214 SCF controls to the 280 MAS TRM controls; this command
enumerates what evidence tends to be expected for each SCF family in scope.

## Usage

```bash
/sg-mas-trm:evidence-checklist [--family=<SCF_family_code>]
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

Collect MAS TRM evidence around the actual technology risk lifecycle:

- **Governance and accountability**: board and senior management reporting,
  technology risk appetite, risk acceptance records, policies, committee
  minutes, and independent assurance reports.
- **Critical system inventory**: system criticality ratings, owners,
  dependencies, data classifications, RTO/RPO targets, architecture diagrams,
  and resilience requirements.
- **Cyber security operations**: logging, monitoring, alert triage, threat
  intelligence, vulnerability management, penetration testing, red-team or
  exercise reports, and remediation tracking.
- **Identity and privileged access**: joiner/mover/leaver evidence, MFA,
  privileged account approvals, periodic access reviews, session logging, and
  emergency access records.
- **Secure development and change**: SDLC standards, threat models, code review,
  dependency scanning, release approvals, segregation of duties, rollback
  plans, and production change records.
- **Outsourcing and cloud**: due diligence, risk assessments, contractual
  controls, concentration-risk analysis, monitoring reports, exit plans, and
  evidence from material service providers.
- **Business continuity and disaster recovery**: BCP/DR plans, test results,
  lessons learned, backup and restore evidence, failover exercises, and
  recovery gap remediation.
- **Incident response**: incident procedures, severity criteria, escalation
  logs, post-incident reports, customer and regulator notification analysis,
  and corrective-action tracking.

Prefer structured exports from identity, ticketing, cloud, CI/CD, vulnerability
management, SIEM, and vendor-risk systems over screenshots. Where evidence is
narrative, capture the owner, approval date, scope, affected systems, and link
to the underlying operating record.
