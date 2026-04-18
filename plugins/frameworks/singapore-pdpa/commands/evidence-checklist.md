---
description: Evidence checklist for Singapore - Personal Data Protection Ac (PDPA) (2012), organized by control family
---

# Singapore - Personal Data Protection Ac (PDPA) (2012) Evidence Checklist

Baseline evidence checklist for a Singapore - Personal Data Protection Ac (PDPA) (2012) assessment. The SCF crosswalk maps 30 SCF controls to the 14 Singapore - Personal Data Protection Ac (PDPA) (2012) controls; this command enumerates what evidence tends to be expected for each SCF family that's in scope.

## Usage

```
/singapore-pdpa:evidence-checklist [--family=<SCF_family_code>]
```

## Arguments

- `--family=<SCF_family_code>` (optional) — restrict to a single SCF family (e.g. `IAC`, `CRY`, `AST`, `BCD`). Defaults to all families mapped for this framework.

## Output

Markdown checklist grouped by SCF family with:

- SCF control ID → framework-native control ID(s) (from crosswalk)
- Evidence types typically expected (logs, configs, policy documents, tickets, training records)
- Which connector plugins can collect each type automatically
- Which items require manual upload / narrative

## Framework-specific evidence

TODO: at Reference depth, replace this section with framework-specific evidence patterns. Items worth capturing:

- Mandatory artifacts unique to Singapore - Personal Data Protection Ac (PDPA) (2012) (e.g. DPIA for GDPR, ROC for PCI DSS, SSP for FedRAMP)
- Assessor expectations per control family
- Retention periods required by the regulator
- Artifacts auditors request repeatedly across engagements
