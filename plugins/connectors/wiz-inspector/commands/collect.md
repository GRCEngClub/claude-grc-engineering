# /wiz-inspector:collect

Query Wiz GraphQL resources and write Finding documents to:

```text
~/.cache/claude-grc/findings/wiz-inspector/<run_id>.json
```

Coverage includes configuration findings, Wiz issues, vulnerabilities, and cloud resource inventory.

The collector uses cursor pagination for each Wiz GraphQL resource, preserves project/cloud account/region metadata, and emits partial `inconclusive` Findings when one query fails but other resource types can still be collected.

```bash
plugins/connectors/wiz-inspector/scripts/collect.js --project-id="<project-id>" --output=json
```

For fixture-backed validation, set `WIZ_FIXTURE_DIR` or pass `--fixture-dir=<path>` to read redacted Wiz GraphQL response samples instead of calling the live API.
