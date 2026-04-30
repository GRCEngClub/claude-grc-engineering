---
description: Singapore MAS TRM compliance gap assessment
---

# Singapore MAS TRM Assessment

Runs a compliance gap assessment against the Monetary Authority of Singapore
(MAS) Technology Risk Management Guidelines by delegating to
`/grc-engineer:gap-assessment` with the framework's SCF identifier, then
overlays MAS TRM-specific context and evidence requirements.

## Usage

```bash
/sg-mas-trm:assess [--scope=<scope>] [--sources=<connector-list>]
```

## Arguments

- `--scope=<scope>` (optional) - narrow the assessment to a MAS TRM workstream
  such as `governance`, `critical-systems`, `cyber-security`,
  `secure-development`, `outsourcing-cloud`, `incident-response`, or
  `business-continuity`.
- `--sources=<connector-list>` (optional) - comma-separated connector plugins.

## What the assessment produces

1. **Compliance score** - overall MAS TRM readiness percentage, weighted by
   mapped SCF controls.
2. **Applicable-requirements summary** - which MAS TRM expectations apply to
   the organization.
3. **Control-by-control gap** - all 280 mapped controls, with
   pass/fail/inconclusive status from connector findings.
4. **Evidence gaps** - controls where no evidence source is configured.
5. **Remediation roadmap** - prioritized by severity and effort.

## Delegation

Under the hood:

```bash
/grc-engineer:gap-assessment "apac-sgp-mas-trm-2021" [--sources=<connector-list>]
```

The SCF crosswalk expands 214 SCF controls into the 280 MAS TRM mapped controls.

## Framework-specific notes

- Start with `/sg-mas-trm:scope` to identify whether the entity is MAS-regulated
  and which technology services support Singapore financial services.
- Common assessment scopes are board and senior management governance, critical
  system resilience, cyber operations, secure SDLC, outsourcing, cloud, and
  incident response.
- For ISO 27001 or SOC 2 programs, verify that generic security evidence is
  translated into MAS TRM governance, critical-system, and financial-sector risk
  language.
- Treat cloud and outsourced technology as in scope when they support regulated
  financial services; vendor certifications do not replace the institution's
  accountability.
