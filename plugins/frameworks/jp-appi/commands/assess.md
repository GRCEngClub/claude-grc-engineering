---
description: Japan - Act on the Protection of Personal Information (2020) compliance gap assessment
---

# Japan APPI Assessment

Runs a compliance gap assessment against **Japan's Act on the Protection of Personal Information (APPI)** by delegating to `/grc-engineer:gap-assessment` with the framework's SCF identifier, then overlays APPI-specific context and evidence requirements.

## Usage

```
/jp-appi:assess [--scope=<scope>] [--sources=<connector-list>]
```

## Arguments

- `--scope=<scope>` (optional) - narrow the assessment to an APPI workstream such as `purpose-use`, `security-controls`, `third-party-transfer`, `cross-border-transfer`, `breach-response`, `data-subject-rights`, or `entrustee-management`.
- `--sources=<connector-list>` (optional) - comma-separated connector plugins.

## What the assessment produces

1. **Compliance score** - overall APPI readiness percentage, weighted by mapped SCF controls.
2. **Applicable-requirements summary** - which parts of the framework apply to the organization (see `/jp-appi:scope` to narrow this down first).
3. **Control-by-control gap** - all 134 mapped controls, with pass/fail/inconclusive status from connector findings.
4. **Evidence gaps** - controls where no evidence source is configured.
5. **Remediation roadmap** - prioritized by severity and effort.

## Delegation

Under the hood:

```
/grc-engineer:gap-assessment "apac-jpn-ppi-2020" [--sources=<connector-list>]
```

The SCF crosswalk expands 58 SCF controls into the 134 APPI/PPI mapped controls.

## Framework-specific notes

- Start with `/jp-appi:scope` when the organization is outside Japan, because APPI can still apply through Japan-facing goods or services.
- Common assessment scopes are cross-border transfer, breach readiness, vendor/entrustee supervision, privacy notice and purpose-of-use governance, and retained personal data rights handling.
- For GDPR-adjacent programs, verify that EU adequacy analysis does not obscure APPI-specific onward transfer, third-party provision, and affected-person notification requirements.
- There is no APPI certification cycle equivalent to SOC 2 Type II or PCI ROC. Use recurring privacy governance, incident exercises, vendor reviews, and data-flow changes as cadence drivers.
- Treat the SCF ID `apac-jpn-ppi-2020` as canonical for tooling even when stakeholders refer to the law as APPI or Japan PPI.
