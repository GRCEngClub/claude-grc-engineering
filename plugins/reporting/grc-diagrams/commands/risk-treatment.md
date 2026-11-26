---
description: Create an editable draw.io grc risk treatment diagram for GRC professionals
---

# Risk Treatment

Create an editable draw.io diagram for risk intake, scoring, treatment, exception approval, residual risk, and monitoring workflows.

## Arguments

- `$ARGUMENTS` - Scope, framework(s), system(s), audience, and optional export format such as `png`, `svg`, or `pdf`.

## Instructions

1. Use the `grc-risk-treatment-diagram` skill to structure the GRC-specific content.
2. Use the `drawio` skill to generate the native `.drawio` file.
3. Include owners, control IDs, evidence sources, systems, risks, scope boundaries, and decision points when relevant.
4. If the user requested PNG/SVG/PDF, export with embedded diagram XML when the draw.io CLI is available.
5. Return the absolute path to the created file.

## Examples

```text
/grc-diagrams:risk-treatment SOC 2 access controls for AWS, Okta, and GitHub
/grc-diagrams:risk-treatment FedRAMP moderate cloud platform, auditor audience, svg
/grc-diagrams:risk-treatment startup SaaS, executive overview, png
```
