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

## Generate a control-to-evidence flow

For a reproducible single-control map, Python 3 can generate the same four-node pattern without a draw.io installation. Supply a UTF-8 JSON object containing exactly five nonempty strings: `control`, `owner`, `evidence`, `cadence`, and `reviewer`. The generator escapes labels as plain text, draws control → owner → evidence → reviewer, and places cadence on the evidence-production edge. Unknown details should be explicitly labeled `unknown`, not invented. For example, from the repository root:

```bash
python3 plugins/grc-diagrams/scripts/control-evidence.py \
  plugins/grc-diagrams/examples/control-evidence-input.json my-evidence-flow.drawio
```

Open and edit the resulting native, uncompressed XML file in draw.io. The output must not already exist; invalid input or an existing output returns an error. The input and output are local files: do not put secrets, actual evidence, sensitive paths, or identifying details in them without authorization. The generator does not scan for secrets, verify control effectiveness, export images, or model exceptions, retention, access controls, or multiple controls. Inspect the layout in draw.io and adapt it to the engagement before sharing. The original hand-authored example remains available in `examples/control-evidence-flow.drawio`.

Run generator tests with `node --test tests/control-evidence-generator.test.js`; the root unit suite also picks them up.
