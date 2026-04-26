---
name: us-finra-expert
description: FINRA Broker-Dealer Cybersecurity Guidance expert. Stub-depth framework plugin that routes to the SCF crosswalk. Level up by adding framework-specific context, assessment workflow, and evidence patterns.
allowed-tools: Read, Glob, Grep
---

# FINRA Broker-Dealer Cybersecurity Guidance Expert

Stub-depth expertise for **FINRA Cybersecurity Rules** (builds on SEC Reg S-P and SEC 17a-4). This plugin is scaffolded from the SCF crosswalk (17 SCF controls map to 39 framework controls) and defers to `/grc-engineer:gap-assessment` for the actual compliance check.

## Framework identity

- **SCF framework ID**: `usa-federal-sro-finra`
- **Region**: Americas
- **Country**: US
- **Regulator**: FINRA (Financial Industry Regulatory Authority)
- **Canonical source**: FINRA cybersecurity guidance for broker-dealers

## Scope and posture (placeholder — fill in when leveling up)

TODO: replace with framework-specific overview. Minimum sections for Reference-depth upgrade:

- Territorial scope (who and where the framework applies)
- Controlled-entity obligations (controller, processor, covered entity, etc.)
- Mandatory timelines (breach notification, assessment cadence)
- Regulator and enforcement mechanism
- Interaction with other frameworks (adequacy decisions, mutual recognition)

## Command routing

All commands in this plugin route through `/grc-engineer:gap-assessment` with framework ID `usa-federal-sro-finra`. Reference-depth plugins add:

- `evidence-checklist` — framework-native evidence by control family
- `scope` — applicability determination for the organization

Full-depth plugins add framework-specific workflow commands (examples in sibling plugins like `soc2`, `fedramp-rev5`, `pci-dss`).

## Levelling up

See the [Framework Plugin Guide](../../../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) for the Stub → Reference → Full progression checklist.
