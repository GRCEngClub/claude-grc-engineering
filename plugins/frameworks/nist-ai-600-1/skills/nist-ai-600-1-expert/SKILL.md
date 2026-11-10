---
name: nist-ai-600-1-expert
description: NIST AI 600-1 (Generative AI Profile) expert. Stub-depth framework plugin that routes to the SCF crosswalk. Level up by adding framework-specific context, assessment workflow, and evidence patterns.
allowed-tools: Read, Glob, Grep
---

# NIST AI 600-1 (Generative AI Profile) Expert

Stub-depth expertise for **NIST AI 600-1 (Generative AI Profile)**. This plugin is scaffolded from the SCF crosswalk (139 SCF controls map to 250 distinct profile / suggested-action items) and delegates evidence review to `/grc-engineer:gap-assessment`; it does not establish compliance.

## Framework identity

- **SCF framework ID**: `general-nist-600-1-gen-ai-profile`
- **Region**: Global
- **Country**: US
- **Issuing body**: NIST (U.S. National Institute of Standards and Technology); voluntary framework, not enforced
- **Canonical source**: NIST AI 600-1, "Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile", July 2024

AI 600-1 is a **cross-sectoral profile of AI RMF 1.0**, not a standalone control catalog or certification. It identifies risks that are novel to or exacerbated by generative AI and organizes suggested actions by AI RMF subcategory. The profile and parent framework are voluntary guidance; separate legal or contractual obligations may apply. The crosswalk links 139 SCF controls to 250 distinct profile / suggested-action items. A mapping or connector finding alone does not prove an action is unmet or establish compliance; assess applicability and evidence.

Official source: [NIST AI 600-1](https://doi.org/10.6028/NIST.AI.600-1).

Common failure modes when working with this framework: treating the profile as a framework separate from AI RMF, treating its suggested actions as mandatory controls, and mapping to action prose instead of IDs.

## Scope and posture (placeholder — fill in when leveling up)

TODO: replace with framework-specific overview. Minimum sections for Reference-depth upgrade:

- Territorial scope (who and where the framework applies)
- Controlled-entity obligations (controller, processor, covered entity, etc.)
- Mandatory timelines (breach notification, assessment cadence)
- Regulator and enforcement mechanism
- Interaction with other frameworks (adequacy decisions, mutual recognition)

## Command routing

All commands in this plugin route through `/grc-engineer:gap-assessment` with framework ID `general-nist-600-1-gen-ai-profile`. Reference-depth plugins add:

- `evidence-checklist` — framework-native evidence by control family
- `scope` — applicability determination for the organization

Full-depth plugins add framework-specific workflow commands (examples in sibling plugins like `soc2`, `fedramp-rev5`, `pci-dss`).

## Levelling up

See the [Framework Plugin Guide](../../../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) for the Stub → Reference → Full progression checklist.
