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

For a reproducible single-control map, Python 3.9 or newer can generate the same four-node pattern without a draw.io installation. Supply a UTF-8 JSON object containing five required nonempty strings: `control`, `owner`, `evidence`, `cadence`, and `reviewer`. The generator escapes labels as plain text, draws control → owner → evidence → reviewer, and places cadence on the evidence-production edge. Unknown details should be explicitly labeled `unknown`, not invented. For example, from the repository root:

```bash
python3 plugins/grc-diagrams/scripts/control-evidence.py \
  plugins/grc-diagrams/examples/control-evidence-input.json my-evidence-flow.drawio
```

To map several controls in one diagram, supply an array of 1–10 objects with the same five fields. Each becomes an independent row in input order; repeated owners or evidence are not merged and cross-row relationships are not inferred. For example:

```bash
python3 plugins/grc-diagrams/scripts/control-evidence.py \
  plugins/grc-diagrams/examples/multi-control-evidence-input.json multi-control.drawio
```

Optionally, add `review_outcome` to any row as either `pending` or `changes requested`; this adds an editable outcome node connected to the reviewer. Omit it if unknown; no outcome is inferred. Other values are rejected, including approval claims. This is a user-supplied label, not proof of review or control effectiveness. For a fictional example:

```bash
python3 plugins/grc-diagrams/scripts/control-evidence.py \
  plugins/grc-diagrams/examples/control-evidence-review-input.json review-flow.drawio
```

Open and edit the resulting native, uncompressed XML file in draw.io. The output must not already exist; invalid input or an existing output returns an error. The input and output are local files: do not put secrets, actual evidence, sensitive paths, or identifying details in them without authorization. The generator does not scan for secrets, verify control effectiveness, export images, or model exceptions, retention, or access controls. Long labels may need manual layout adjustment. Inspect the layout in draw.io and adapt it to the engagement before sharing. The original hand-authored example remains available in `examples/control-evidence-flow.drawio`.

Run generator tests with `node --test tests/control-evidence-generator.test.js tests/control-evidence-multi.test.js tests/control-evidence-outcome.test.js`; the root unit suite also picks them up.

The separate `examples/validate-control-evidence.py` checks specific properties of the hand-authored example, including its edge identities and directions. It rejects DTDs and entity declarations, but is not a general draw.io validator or a security boundary for untrusted XML. It is not intended to validate arbitrary diagrams or generator output.
