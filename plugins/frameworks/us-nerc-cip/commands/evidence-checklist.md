---
description: Evidence checklist for NERC CIP assessments
---

# NERC CIP Evidence Checklist

Baseline evidence checklist for a NERC CIP assessment. The SCF crosswalk maps
122 SCF controls to the 204 NERC CIP controls; this command enumerates what
evidence tends to be expected for each SCF family in scope.

## Usage

```bash
/us-nerc-cip:evidence-checklist [--family=<SCF_family_code>]
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

Collect NERC CIP evidence around the BES Cyber System lifecycle:

- **BES Cyber System categorization**: CIP-002 methodology, impact rating
  rationale, Facility lists, asset inventories, approvals, and review dates.
- **Security management controls**: policies, procedures, responsible owners,
  exception approvals, compliance calendar, and management review evidence.
- **Personnel and training**: role-based training, access authorization,
  personnel risk assessments, revocation records, and visitor controls.
- **Electronic security perimeters**: network diagrams, access point lists,
  firewall rules, remote access controls, MFA, interactive remote access logs,
  and change records.
- **Physical security perimeters**: site diagrams, access control lists, badge
  logs, visitor logs, alarm testing, and physical access review evidence.
- **System security management**: baselines, patch evaluations, vulnerability
  assessments, malicious code prevention, ports/services reviews, and change
  authorization.
- **Incident response and recovery**: response plans, exercises, incident logs,
  reportability analysis, lessons learned, recovery plans, backup evidence, and
  restoration test results.
- **Information protection**: protected cyber asset information handling,
  storage, transmission, disposal, and access evidence.
- **Supply chain risk**: procurement controls, vendor risk assessments, vendor
  remote access, software integrity, notification clauses, and tracking of
  supplier risk issues.

Prefer structured exports from identity, network, physical access, ticketing,
asset management, vulnerability, backup, and GRC systems over screenshots. Where
evidence is narrative, capture the responsible entity, registered function,
asset scope, impact category, approval date, and linked requirement.
