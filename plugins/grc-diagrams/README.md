# GRC Diagrams Plugin

Editable draw.io diagram patterns for GRC professionals.

This plugin adds a general `/grc-diagrams:drawio` command plus focused commands for common GRC diagrams: system boundaries, evidence flows, control maps, risk treatment, audit workflows, framework crosswalks, third-party risk, POA&M, regulated data flows, shared responsibility, RACI, and compliance operating models.

The skills are based on the draw.io CLI workflow from `jgraph/drawio-mcp/skill-cli`: generate native mxGraphModel XML, save `.drawio`, optionally export PNG/SVG/PDF with embedded XML, and preserve editability in draw.io.

## Commands

- `/grc-diagrams:drawio` - generic editable draw.io diagram generation
- `/grc-diagrams:system-boundary` - compliance scope and authorization boundary diagrams
- `/grc-diagrams:evidence-flow` - evidence collection and audit evidence lifecycle diagrams
- `/grc-diagrams:control-map` - control-to-system-owner-evidence maps
- `/grc-diagrams:risk-treatment` - risk intake, scoring, treatment, exception, and monitoring flows
- `/grc-diagrams:audit-workflow` - audit planning through reporting and remediation workflows
- `/grc-diagrams:framework-crosswalk` - framework/control overlap, gap, and conflict diagrams
- `/grc-diagrams:third-party-risk` - vendor intake, tiering, review, contracting, and monitoring workflows
- `/grc-diagrams:poam` - POA&M/finding remediation lifecycle diagrams
- `/grc-diagrams:data-flow` - regulated data flow and classification diagrams
- `/grc-diagrams:shared-responsibility` - cloud/SaaS responsibility split and inherited control diagrams
- `/grc-diagrams:raci` - responsibility assignment diagrams
- `/grc-diagrams:operating-model` - GRC program and continuous compliance operating model diagrams

## Output

Default output is a native `.drawio` file. If the user requests `png`, `svg`, or `pdf`, the draw.io desktop CLI should export with embedded XML so the exported artifact remains editable in draw.io.
