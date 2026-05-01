---
name: grc-control-map-diagram
description: Use when creating a draw.io diagram for controls mapped across frameworks, systems, owners, risks, and evidence sources in a GRC, security, audit, compliance, privacy, cloud, or risk context.
allowed-tools: Write, Bash, Read, WebFetch
---

# GRC control map diagram

Use this skill to structure the GRC content and visual pattern for controls mapped across frameworks, systems, owners, risks, and evidence sources. Then use the `drawio` skill to generate the native editable `.drawio` file and optional PNG/SVG/PDF export.

## Common Requests

- SOC 2 CC6.1 to AWS IAM/Okta/GitHub
- NIST AC to ISO Annex A
- common control implementation

## Recommended Elements

Include these when relevant:

- controls
- frameworks
- systems
- owners
- evidence
- risks
- inherited controls
- implementation status

## Recommended Output Pattern

Produce a Hub-and-spoke control map or control coverage diagram. Choose a layout that matches the audience:

- Executive: compact lifecycle/capability view with business impact labels.
- Auditor/assessor: explicit evidence, owner, control, cadence, and scope labels.
- Practitioner/engineering: operational systems, data paths, automation, failure/exception paths, and implementation detail.

## draw.io Instructions

1. Load and follow the `drawio` skill.
2. Generate native mxGraphModel XML directly. Do not generate Mermaid as the final artifact.
3. Use descriptive lowercase hyphenated filenames.
4. Include a legend when colors, edge styles, or containers have compliance meaning.
5. Validate XML well-formedness before finalizing.
6. If PNG/SVG/PDF is requested, export with embedded diagram XML when the draw.io CLI is available.

## Visual Conventions

- Blue: systems, platforms, services, and automated collectors.
- Green: implemented controls, approvals, validated evidence, and compliant outcomes.
- Orange/red: risks, findings, exceptions, overdue items, gaps, and failed controls.
- Gray: manual tasks, external parties, optional steps, and out-of-scope areas.
- Dashed containers: audit scope, trust boundaries, authorization boundary, or responsibility boundary.
- Solid edges: primary process or system flow.
- Dashed edges: evidence or attestation flow.
- Dotted edges: optional, manual, exception, or escalation flow.

## Quality Bar

- Make ownership explicit.
- Label regulated data, control IDs, frameworks, and evidence repositories when known.
- Show decision criteria where the process branches.
- Avoid generic boxes like "Compliance" without a role, system, artifact, or action.
- Prefer editable source of truth over screenshots.
