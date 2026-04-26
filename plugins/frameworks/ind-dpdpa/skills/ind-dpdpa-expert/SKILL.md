---
name: ind-dpdpa-expert
description: India DPDPA (2023) + DPDP Rules (2025) expert. Stub-depth framework plugin that routes to the SCF crosswalk. Level up by adding framework-specific context, assessment workflow, and evidence patterns.
allowed-tools: Read, Glob, Grep, Write
---

# India DPDPA (2023) + DPDP Rules (2025) Expert

Stub-depth expertise for **India DPDPA (2023) + DPDP Rules (2025)**. This plugin is scaffolded from the SCF crosswalk (41 SCF controls map to 96 framework controls) and defers to `/grc-engineer:gap-assessment` for the actual compliance check.

## Framework identity

- **SCF framework ID**: `apac-ind-dpdpa-2023` (references the Act year)
- **Region**: APAC
- **Country**: IN
- **Regulator**: Ministry of Electronics and Information Technology (MeitY)
- **Enforceable framework**: DPDPA Act (2023) + DPDP Rules (finalized November 2025)

## Scope and posture (placeholder — fill in when leveling up)

**Framework composition**: The enforceable framework comprises the DPDPA Act (2023) and the DPDP Rules (finalized November 2025). When leveling up to Reference depth, the evidence checklist must cover both:

**Act obligations** (statutory requirements):

- Territorial scope (who and where the framework applies)
- Data Principal rights (correction, erasure, grievance redressal)
- Data Fiduciary obligations (controller-like responsibilities)
- Significant Data Fiduciary designation and heightened obligations
- Cross-border transfer allowlist model
- Children's data protection (verifiable parental consent, no behavioral advertising)

**Rules operational requirements** (November 2025):

- 72-hour breach notification timeline
- Consent manager registration by November 2026
- Specific consent recording and management standards
- Data transfer mechanisms and allowlist countries
- Grievance redressal officer requirements

TODO: add framework-specific sections for Reference-depth upgrade:

- Territorial scope (extraterritorial application, thresholds)
- Controlled-entity obligations (Data Fiduciary, Consent Manager, Significant Data Fiduciary)
- Mandatory timelines (breach notification: 72 hours; consent manager registration: November 2026)
- Regulator and enforcement mechanism (MeitY, Data Protection Board of India, penalties)
- Interaction with other frameworks (GDPR adequacy decisions, mutual recognition)

## Command routing

All commands in this plugin route through `/grc-engineer:gap-assessment` with framework ID `apac-ind-dpdpa-2023`. Reference-depth plugins add:

- `evidence-checklist` — framework-native evidence by control family
- `scope` — applicability determination for the organization

Full-depth plugins add framework-specific workflow commands (examples in sibling plugins like `soc2`, `fedramp-rev5`, `pci-dss`).

## Levelling up

See the [Framework Plugin Guide](../../../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) for the Stub → Reference → Full progression checklist.
