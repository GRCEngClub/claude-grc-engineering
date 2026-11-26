---
description: Create an editable draw.io grc compliance operating model diagram for GRC professionals
---

# Compliance Operating Model

Create an editable draw.io diagram for high-level GRC program architecture, continuous compliance operating models, three lines of defense, and executive program maps.

## Arguments

- `$ARGUMENTS` - Scope, framework(s), system(s), audience, and optional export format such as `png`, `svg`, or `pdf`.

## Instructions

1. Use the `grc-compliance-operating-model-diagram` skill to structure the GRC-specific content.
2. Use the `drawio` skill to generate the native `.drawio` file.
3. Include owners, control IDs, evidence sources, systems, risks, scope boundaries, and decision points when relevant.
4. If the user requested PNG/SVG/PDF, export with embedded diagram XML when the draw.io CLI is available.
5. Return the absolute path to the created file.

## Examples

```text
/grc-diagrams:operating-model SOC 2 access controls for AWS, Okta, and GitHub
/grc-diagrams:operating-model FedRAMP moderate cloud platform, auditor audience, svg
/grc-diagrams:operating-model startup SaaS, executive overview, png
```
