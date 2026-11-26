---
description: Create an editable draw.io grc poa&m lifecycle diagram for GRC professionals
---

# Poa&M Lifecycle

Create an editable draw.io diagram for POA&M items, audit findings, remediation milestones, validation, closure, and escalation paths.

## Arguments

- `$ARGUMENTS` - Scope, framework(s), system(s), audience, and optional export format such as `png`, `svg`, or `pdf`.

## Instructions

1. Use the `grc-poam-diagram` skill to structure the GRC-specific content.
2. Use the `drawio` skill to generate the native `.drawio` file.
3. Include owners, control IDs, evidence sources, systems, risks, scope boundaries, and decision points when relevant.
4. If the user requested PNG/SVG/PDF, export with embedded diagram XML when the draw.io CLI is available.
5. Return the absolute path to the created file.

## Examples

```text
/grc-diagrams:poam SOC 2 access controls for AWS, Okta, and GitHub
/grc-diagrams:poam FedRAMP moderate cloud platform, auditor audience, svg
/grc-diagrams:poam startup SaaS, executive overview, png
```
