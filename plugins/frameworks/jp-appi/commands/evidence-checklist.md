---
description: Evidence checklist for Japan - Act on the Protection of Personal Information (2020), organized by control family
---

# Japan APPI Evidence Checklist

Baseline evidence checklist for a Japan APPI assessment. The SCF crosswalk maps 58 SCF controls to the 134 APPI/PPI controls; this command enumerates what evidence tends to be expected for each SCF family that's in scope.

## Usage

```
/jp-appi:evidence-checklist [--family=<SCF_family_code>]
```

## Arguments

- `--family=<SCF_family_code>` (optional) - restrict to a single SCF family (e.g. `IAC`, `CRY`, `AST`, `BCD`). Defaults to all families mapped for this framework.

## Output

Markdown checklist grouped by SCF family with:

- SCF control ID -> framework-native control ID(s) (from crosswalk)
- Evidence types typically expected (logs, configs, policy documents, tickets, training records)
- Which connector plugins can collect each type automatically
- Which items require manual upload / narrative

## Framework-specific evidence

Collect APPI evidence around the actual Japanese personal-data lifecycle:

- **Purpose of use and notices**: published privacy notices, internal purpose-of-use register, collection forms, consent language, and change approvals.
- **Data inventory and retained personal data**: systems holding Japanese personal data, data categories, retention/deletion rules, and request-handling logs for disclosure, correction, suspension of use, or deletion.
- **Third-party provision**: recipient lists, legal basis/consent or opt-out records, joint-use notices, transfer logs, and approval records.
- **Cross-border transfer**: destination countries, recipient safeguards, consent/disclosure records, equivalent-measures monitoring, and onward-transfer review.
- **Security controls**: access reviews, encryption/key management, logging, vulnerability management, endpoint controls, and incident response evidence for personal-data systems.
- **Entrustee supervision**: processor/entrustee contracts, due diligence, security questionnaires, sub-entrustee approvals, and periodic oversight results.
- **Breach response**: incident intake, triage criteria, PPC reporting analysis, notification records, final incident report, and lessons learned.
- **Pseudonymously or anonymously processed information**: generation rules, separation of re-identification keys, access controls, use restrictions, and disclosure controls.

Prefer structured exports from identity, ticketing, DLP, logging, vendor-management, and data-inventory systems over screenshots. Where evidence is narrative, capture the owner, approval date, scope, and affected processing activity.
