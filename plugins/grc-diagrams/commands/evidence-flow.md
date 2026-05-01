---
description: Create an editable draw.io grc evidence flow diagram for GRC professionals
---

# Evidence Flow

Create an editable draw.io diagram for evidence collection, evidence lifecycle, audit evidence pipelines, and systems of record.

## Arguments

- `$ARGUMENTS` - Scope, framework(s), system(s), audience, and optional export format such as `png`, `svg`, or `pdf`.

## Instructions

1. Use the `grc-evidence-flow-diagram` skill to structure the GRC-specific content.
2. Use the `drawio` skill to generate the native `.drawio` file.
3. Include owners, control IDs, evidence sources, systems, risks, scope boundaries, and decision points when relevant.
4. If the user requested PNG/SVG/PDF, export with embedded diagram XML when the draw.io CLI is available.
5. Return the absolute path to the created file.

## Examples

```text
/grc-diagrams:evidence-flow SOC 2 access controls for AWS, Okta, and GitHub
/grc-diagrams:evidence-flow FedRAMP moderate cloud platform, auditor audience, svg
/grc-diagrams:evidence-flow startup SaaS, executive overview, png
```
