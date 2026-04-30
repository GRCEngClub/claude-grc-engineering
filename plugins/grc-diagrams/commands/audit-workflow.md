---
description: Create an editable draw.io grc audit workflow diagram for GRC professionals
---

# Audit Workflow

Create an editable draw.io diagram for audit planning, request lists, evidence, testing, exceptions, remediation, and reporting.

## Arguments

- `$ARGUMENTS` - Scope, framework(s), system(s), audience, and optional export format such as `png`, `svg`, or `pdf`.

## Instructions

1. Use the `grc-audit-workflow-diagram` skill to structure the GRC-specific content.
2. Use the `drawio` skill to generate the native `.drawio` file.
3. Include owners, control IDs, evidence sources, systems, risks, scope boundaries, and decision points when relevant.
4. If the user requested PNG/SVG/PDF, export with embedded diagram XML when the draw.io CLI is available.
5. Return the absolute path to the created file.

## Examples

```text
/grc-diagrams:audit-workflow SOC 2 access controls for AWS, Okta, and GitHub
/grc-diagrams:audit-workflow FedRAMP moderate cloud platform, auditor audience, svg
/grc-diagrams:audit-workflow startup SaaS, executive overview, png
```
