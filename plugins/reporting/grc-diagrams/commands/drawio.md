---
description: Create an editable native draw.io diagram, optionally exported to PNG/SVG/PDF with embedded XML
---

# Draw.io

Create a native editable draw.io diagram from the user's request.

## Arguments

- `$ARGUMENTS` - Diagram request, context, audience, and optional output format (`png`, `svg`, `pdf`, `jpg`, or default `.drawio`).

## Instructions

1. Use the `drawio` skill.
2. If the request is GRC-specific, also use the most relevant GRC diagram companion skill.
3. Generate native mxGraphModel XML and write a `.drawio` file.
4. Validate XML well-formedness.
5. If an export format is requested and the draw.io CLI is available, export with embedded XML for PNG/SVG/PDF.
6. Return the absolute path to the created file.

## Examples

```text
/grc-diagrams:drawio flowchart for access review evidence collection
/grc-diagrams:drawio png SOC 2 system boundary for a SaaS app
/grc-diagrams:drawio svg framework crosswalk for SOC 2, ISO 27001, and NIST CSF
```
