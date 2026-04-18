---
description: Singapore - Personal Data Protection Ac (PDPA) (2012) compliance gap assessment
---

# Singapore - Personal Data Protection Ac (PDPA) (2012) Assessment

Runs a compliance gap assessment against **Singapore - Personal Data Protection Ac (PDPA) (2012)** by delegating to `/grc-engineer:gap-assessment` with the framework's SCF identifier, then overlays framework-specific context and evidence requirements.

## Usage

```
/singapore-pdpa:assess [--scope=<scope>] [--sources=<connector-list>]
```

## Arguments

- `--scope=<scope>` (optional) — narrow the assessment to a specific part of the framework. Valid scopes depend on the framework; TODO: enumerate the standard sections/articles of Singapore - Personal Data Protection Ac (PDPA) (2012) here.
- `--sources=<connector-list>` (optional) — comma-separated connector plugins.

## What the assessment produces

1. **Compliance score** — overall Singapore - Personal Data Protection Ac (PDPA) (2012) readiness percentage, weighted by mapped SCF controls.
2. **Applicable-requirements summary** — which parts of the framework apply to the organization (see `/singapore-pdpa:scope` to narrow this down first).
3. **Control-by-control gap** — every 14 mapped control, with pass/fail/inconclusive status from connector findings.
4. **Evidence gaps** — controls where no evidence source is configured.
5. **Remediation roadmap** — prioritized by severity and effort.

## Delegation

Under the hood:

```
/grc-engineer:gap-assessment "apac-sgp-pdpa-2012" [--sources=<connector-list>]
```

The SCF crosswalk expands 30 SCF controls into the 14 Singapore - Personal Data Protection Ac (PDPA) (2012) controls.

## Framework-specific notes

TODO: replace this section with framework-specific assessment guidance. At Reference depth, include at minimum:

- Which assessment scope is most commonly requested
- Known interactions with sibling frameworks (e.g. GDPR + UK DPA, or CMMC + NIST 800-171)
- Any mandatory cadence (annual self-attestation, biennial external audit, etc.)
- Common misinterpretations in community guidance that this plugin corrects
