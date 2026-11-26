---
name: poam
description: Use when creating a draw.io diagram for POA&M items, audit findings, remediation milestones, validation, closure, and escalation paths in a GRC, security, audit, compliance, privacy, cloud, or risk context.
allowed-tools: Write, Bash, Read, WebFetch
---

# GRC POA&M lifecycle diagram

Use this skill to structure the GRC content and visual pattern for POA&M items, audit findings, remediation milestones, validation, closure, and escalation paths. Then use the `drawio` skill to generate the native editable `.drawio` file and optional PNG/SVG/PDF export.

## Common Requests

- FedRAMP POA&M lifecycle
- audit finding remediation
- vulnerability exception to POA&M
- corrective action tracking

## Recommended Elements

Include these when relevant:

- finding
- POA&M item
- owner
- severity
- milestone
- due date
- validation
- closure
- risk acceptance

## Recommended Output Pattern

Produce a State machine, remediation workflow, or milestone timeline. Choose a layout that matches the audience:

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

## When invoked as `/diagrams:poam`

- `$ARGUMENTS` - Scope, framework(s), system(s), audience, and optional export format such as `png`, `svg`, or `pdf`.

1. Use the `drawio` skill to generate the native `.drawio` file.
2. Include owners, control IDs, evidence sources, systems, risks, scope boundaries, and decision points when relevant.
3. If the user requested PNG/SVG/PDF, export with embedded diagram XML when the draw.io CLI is available.
4. Return the absolute path to the created file.

### Examples

```text
/diagrams:poam SOC 2 access controls for AWS, Okta, and GitHub
/diagrams:poam FedRAMP moderate cloud platform, auditor audience, svg
/diagrams:poam startup SaaS, executive overview, png
```
