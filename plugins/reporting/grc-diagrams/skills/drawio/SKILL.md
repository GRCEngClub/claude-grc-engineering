---
name: drawio
description: Always use when the user asks to create, generate, draw, or design a diagram, flowchart, architecture diagram, ER diagram, sequence diagram, class diagram, network diagram, mockup, wireframe, UI sketch, GRC workflow, control map, audit process, risk register flow, compliance architecture, or mentions draw.io, drawio, drawoi, .drawio files, or diagram export to PNG/SVG/PDF.
allowed-tools: Write, Bash, Read, WebFetch
---

# Draw.io Diagram Skill

Generate draw.io diagrams as native `.drawio` files. Optionally export to PNG, SVG, or PDF with the diagram XML embedded so the exported file remains editable in draw.io.

This skill is based on the draw.io CLI workflow from `jgraph/drawio-mcp/skill-cli` and adapted for GRC professionals.

## How to Create a Diagram

1. Generate draw.io XML in mxGraphModel format for the requested diagram.
2. Write the XML to a `.drawio` file in the current working directory using the Write tool.
3. Validate XML well-formedness before claiming the diagram is ready.
4. Post-process edge routing when `npx @drawio/postprocess` is already available. Skip silently if it is unavailable. Do not install it or ask the user about it.
5. If the user requested `png`, `svg`, or `pdf`, locate the draw.io CLI, export with embedded XML, then delete the source `.drawio` file after a successful export.
6. If the CLI is not found, keep the `.drawio` file and tell the user they can install the draw.io desktop app to enable export or open the `.drawio` file directly.
7. Open the result when the environment supports it. If open fails, print the absolute file path.

## Choosing the Output Format

Check the user's request for a format preference.

- `create a flowchart` -> `flowchart.drawio`
- `png flowchart for login` -> `login-flow.drawio.png`
- `svg: ER diagram` -> `er-diagram.drawio.svg`
- `pdf architecture overview` -> `architecture-overview.drawio.pdf`

If no format is mentioned, write the `.drawio` file.

| Format | Embed XML | Notes |
|--------|-----------|-------|
| `drawio` | Native | Editable source file |
| `png` | Yes, `-e` | Viewable everywhere, editable in draw.io |
| `svg` | Yes, `-e` | Scalable, editable in draw.io |
| `pdf` | Yes, `-e` | Printable, editable in draw.io |
| `jpg` | No | Lossy and not editable |

Use double extensions for exported editable files: `name.drawio.png`, `name.drawio.svg`, `name.drawio.pdf`.

## draw.io CLI Location

Try `drawio` on PATH first. Then use platform fallbacks:

- macOS: `/Applications/draw.io.app/Contents/MacOS/draw.io`
- Linux: `drawio`
- Windows: `C:\Program Files\draw.io\draw.io.exe`
- WSL2: `/mnt/c/Program Files/draw.io/draw.io.exe`

Detect WSL2 with:

```bash
grep -qi microsoft /proc/version 2>/dev/null && echo WSL2
```

Export command:

```bash
drawio -x -f <format> -e -b 10 -o <output> <input.drawio>
```

WSL2 example:

```bash
"/mnt/c/Program Files/draw.io/draw.io.exe" -x -f png -e -b 10 -o diagram.drawio.png diagram.drawio
```

Open commands:

- macOS: `open <file>`
- Linux: `xdg-open <file>`
- WSL2: `cmd.exe /c start "" "$(wslpath -w <file>)"`
- Windows: `start <file>`

## XML Format

A `.drawio` file is native mxGraphModel XML. Always generate XML directly. Mermaid and CSV formats require conversion and should not be saved as native `.drawio` files.

Every diagram must have this structure:

```xml
<mxGraphModel adaptiveColors="auto">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
  </root>
</mxGraphModel>
```

Cell `id="0"` is the root layer. Cell `id="1"` is the default parent layer. All diagram elements use `parent="1"` unless the diagram intentionally uses multiple layers.

## XML Reference

For complete draw.io XML guidance, fetch and follow:

https://raw.githubusercontent.com/jgraph/drawio-mcp/main/shared/xml-reference.md

Use it for styles, edge routing, containers, layers, tags, metadata, dark mode colors, and XML well-formedness rules.

## GRC Diagram Conventions

- Include control IDs, frameworks, owners, evidence repositories, systems of record, and review cadence when known.
- Use swimlanes for roles or departments: GRC, Security, Engineering, Legal, Procurement, Vendor, Auditor, Executive.
- Use containers for system boundaries, audit scope, trust zones, cloud accounts, environments, and in-scope/out-of-scope areas.
- Use dashed edges for evidence paths, dotted edges for optional or manual paths, and solid edges for process or system flows.
- Use red/orange accents for risks, findings, exceptions, overdue items, and failed controls.
- Use green/blue accents for implemented controls, automated checks, approvals, and trusted evidence.
- Include a legend when colors or edge styles have compliance meaning.

## CRITICAL: XML Well-Formedness

- NEVER include ANY XML comments (`<!-- -->`) in the output.
- Escape special characters in attribute values: `&amp;`, `&lt;`, `&gt;`, `&quot;`.
- Always use unique `id` values for each `mxCell`.
- Always include root cells `id="0"` and `id="1"`.
- Every edge must have a child geometry element: `<mxGeometry relative="1" as="geometry"/>`.
- Validate XML with a parser before finalizing.
