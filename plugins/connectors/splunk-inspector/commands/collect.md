# /splunk-inspector:collect

Collect Splunk security posture and write Finding documents to:

```text
~/.cache/claude-grc/findings/splunk-inspector/<run_id>.json
```

The collector appends a run manifest to:

```text
~/.cache/claude-grc/runs.log
```

## Coverage

- Index retention
- RBAC roles and broad admin capabilities
- Audit-source coverage
- Saved-search ACL sharing
- User authentication method visibility

Unavailable API surfaces are emitted as `inconclusive` evaluations rather than silently passing.

## Options

- `--output=summary|json|silent` controls stdout. Default: `summary`.
- `--quiet` suppresses progress logs on stderr.
- `--min-retention-days=<n>` minimum acceptable retention for indexes. Default: `30`.
