# /vanta-bridge:sync

Normalize Vanta MCP/plugin output into Finding schema v1 documents.

```bash
node plugins/bridges/vanta-bridge/scripts/sync.js --input=vanta-output.json
```

Output is written to:

```text
~/.cache/claude-grc/findings/vanta-bridge/<run_id>.json
```

The bridge accepts JSON that contains any of these top-level collections:

- `tests`
- `test_entities`
- `controls`
- `control_tests`
- `control_documents`
- `vulnerabilities`

It preserves Vanta IDs and URLs in `raw_attributes`, `metadata`, and `evidence_refs`.

## Options

- `--input=<path>` Vanta MCP/export JSON. If omitted, uses configured default input path.
- `--output=summary|json|silent` controls stdout. Default: `summary`.
- `--quiet` suppresses stderr progress logs.
