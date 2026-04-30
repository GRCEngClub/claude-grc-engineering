---
description: NERC CIP compliance gap assessment
---

# NERC CIP Assessment

Runs a compliance gap assessment against NERC Critical Infrastructure Protection
(CIP) Reliability Standards by delegating to `/grc-engineer:gap-assessment`
with the framework's SCF identifier, then overlays NERC CIP-specific context and
evidence requirements.

## Usage

```bash
/us-nerc-cip:assess [--scope=<scope>] [--sources=<connector-list>]
```

## Arguments

- `--scope=<scope>` (optional) - narrow the assessment to a NERC CIP workstream
  such as `bes-cyber-system-categorization`, `electronic-security-perimeter`,
  `physical-security`, `personnel-training`, `system-security-management`,
  `incident-response`, `recovery-planning`, or `supply-chain-risk`.
- `--sources=<connector-list>` (optional) - comma-separated connector plugins.

## What the assessment produces

1. **Compliance score** - overall NERC CIP readiness percentage, weighted by
   mapped SCF controls.
2. **Applicable-requirements summary** - which NERC CIP expectations apply to
   the entity and asset population.
3. **Control-by-control gap** - all 204 mapped controls, with
   pass/fail/inconclusive status from connector findings.
4. **Evidence gaps** - controls where no evidence source is configured.
5. **Remediation roadmap** - prioritized by severity and effort.

## Delegation

Under the hood:

```bash
/grc-engineer:gap-assessment "usa-federal-nerc-cip-2024" [--sources=<connector-list>]
```

The SCF crosswalk expands 122 SCF controls into the 204 NERC CIP mapped controls.

## Framework-specific notes

- Start with `/us-nerc-cip:scope` to identify registered functions, Facilities,
  BES Cyber Systems, impact ratings, Electronic Security Perimeters, and
  Physical Security Perimeters.
- Common assessment scopes are CIP-002 categorization, access authorization,
  electronic access controls, physical access controls, system hardening,
  vulnerability management, incident response, recovery planning, and supply
  chain risk.
- For NIST or ISO programs, verify that generic control evidence is traceable to
  NERC CIP requirement structure, responsible entity context, dated approvals,
  and asset scope.
- Treat vendor access and supply chain records as in scope when they affect BES
  Cyber Systems or associated protected information.
