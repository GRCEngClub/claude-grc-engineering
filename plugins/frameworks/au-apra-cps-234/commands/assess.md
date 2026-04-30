---
description: APRA CPS 234 compliance gap assessment
---

# APRA CPS 234 Assessment

Runs a compliance gap assessment against APRA Prudential Standard CPS 234
Information Security by delegating to `/grc-engineer:gap-assessment` with the
framework's SCF identifier, then overlays CPS 234-specific context and evidence
requirements.

## Usage

```bash
/au-apra-cps-234:assess [--scope=<scope>] [--sources=<connector-list>]
```

## Arguments

- `--scope=<scope>` (optional) - narrow the assessment to a CPS 234 workstream
  such as `asset-ownership`, `information-security-capability`,
  `control-testing`, `incident-management`, `third-party-reliance`, or
  `board-reporting`.
- `--sources=<connector-list>` (optional) - comma-separated connector plugins.

## What the assessment produces

1. **Compliance score** - overall CPS 234 readiness percentage, weighted by
   mapped SCF controls.
2. **Applicable-requirements summary** - which CPS 234 expectations apply to
   the organization.
3. **Control-by-control gap** - all 38 mapped controls, with
   pass/fail/inconclusive status from connector findings.
4. **Evidence gaps** - controls where no evidence source is configured.
5. **Remediation roadmap** - prioritized by severity and effort.

## Delegation

Under the hood:

```bash
/grc-engineer:gap-assessment "apac-aus-ps-cps-234-2019" [--sources=<connector-list>]
```

The SCF crosswalk expands 52 SCF controls into the 38 CPS 234 mapped controls.

## Framework-specific notes

- Start with `/au-apra-cps-234:scope` to identify whether the entity is
  APRA-regulated and which information assets are managed directly, by related
  parties, or by third parties.
- Common assessment scopes are information asset ownership, control design,
  control testing, material incident readiness, third-party assurance, and
  board or senior management reporting.
- For ISO 27001, SOC 2, or Essential Eight programs, verify that evidence maps
  to CPS 234's prudential language: capability, threats, vulnerabilities,
  criticality, sensitivity, testing, and APRA notification.
- Treat third-party and cloud evidence as in scope when those providers manage
  information assets for the regulated entity.
