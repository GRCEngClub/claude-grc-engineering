---
name: nist-ai-rmf-expert
description: NIST AI 100-1 (AI RMF 1.0) expert. Stub-depth framework plugin that routes to the SCF crosswalk. Level up by adding framework-specific context, assessment workflow, and evidence patterns.
allowed-tools: Read, Glob, Grep
---

# NIST AI 100-1 (AI RMF 1.0) Expert

Stub-depth expertise for **NIST AI 100-1 (AI RMF 1.0)**. This plugin is scaffolded from the SCF crosswalk (158 SCF controls map to 91 framework controls) and defers to `/grc-engineer:gap-assessment` for the actual compliance check.

## Framework identity

- **SCF framework ID**: `general-nist-100-1-ai-rmf`
- **Region**: Global
- **Country**: US
- **Issuing body**: NIST (U.S. National Institute of Standards and Technology); voluntary framework, not enforced
- **Canonical source**: NIST AI 100-1, "Artificial Intelligence Risk Management Framework (AI RMF 1.0)", January 2023

AI RMF is an **outcomes framework**, not a control catalog and not a certification. It organizes outcomes as Function → Category → Subcategory across four functions — **GOVERN**, **MAP**, **MEASURE**, **MANAGE** — applied across the AI system lifecycle. Subcategories describe desired risk-management outcomes; they do not prescribe specific controls. Concrete controls come from the SCF crosswalk: 158 SCF controls map to 91 AI RMF subcategories, referenced by subcategory ID (e.g. `GOVERN 1.1`, `MAP 2.3`), never by paraphrased prose.

Common failure modes when working with this framework: treating AI RMF as a control catalog to "implement", confusing the four functions with maturity levels, and mapping to subcategory prose instead of subcategory IDs.

## Scope and posture (placeholder — fill in when leveling up)

TODO: replace with framework-specific overview. Minimum sections for Reference-depth upgrade:

- Territorial scope (who and where the framework applies)
- Controlled-entity obligations (controller, processor, covered entity, etc.)
- Mandatory timelines (breach notification, assessment cadence)
- Regulator and enforcement mechanism
- Interaction with other frameworks (adequacy decisions, mutual recognition)

## Command routing

All commands in this plugin route through `/grc-engineer:gap-assessment` with framework ID `general-nist-100-1-ai-rmf`. Reference-depth plugins add:

- `evidence-checklist` — framework-native evidence by control family
- `scope` — applicability determination for the organization

Full-depth plugins add framework-specific workflow commands (examples in sibling plugins like `soc2`, `fedramp-rev5`, `pci-dss`).

## Levelling up

See the [Framework Plugin Guide](../../../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) for the Stub → Reference → Full progression checklist.
