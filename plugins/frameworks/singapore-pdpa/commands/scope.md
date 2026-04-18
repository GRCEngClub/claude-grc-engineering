---
description: Determine which parts of Singapore - Personal Data Protection Ac (PDPA) (2012) apply to the organization
---

# Singapore - Personal Data Protection Ac (PDPA) (2012) Scope

Determines whether and how **Singapore - Personal Data Protection Ac (PDPA) (2012)** applies to the organization. Reference-depth scope is a decision-tree prompt; Full-depth plugins extend this with jurisdiction-aware logic.

## Usage

```
/singapore-pdpa:scope
```

## What this produces

- **Applicability verdict**: In-scope / out-of-scope / partially in-scope, with the triggers that led there
- **In-scope entity types**: (controller, processor, covered entity, critical-entity operator, etc. — framework-dependent)
- **In-scope data/systems**: what the framework's definitions pull in
- **Jurisdiction reach**: where operations must comply (single country, EU member states, EEA, etc.)
- **Carve-outs**: exemptions the organization can claim
- **Next steps**: whether to proceed with `/singapore-pdpa:assess` or `/singapore-pdpa:evidence-checklist`

## Framework-specific scope triggers

TODO: replace with framework-specific triggers. Singapore - Personal Data Protection Ac (PDPA) (2012) scope depends on (at minimum):

- Territorial reach — where operations happen and where customers/subjects are
- Entity classification — how the framework defines in-scope actors
- Sector/industry fit — financial, healthcare, critical infrastructure, government
- Thresholds — revenue, headcount, user base, transaction volume

This scope command should ask only the questions that actually matter for this framework, then output the applicability verdict without asking the user to search through the whole regulation.
