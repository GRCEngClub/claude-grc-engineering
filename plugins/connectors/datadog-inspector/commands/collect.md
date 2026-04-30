# /datadog-inspector:collect

Collect Datadog organization posture and write Finding documents to:

```text
~/.cache/claude-grc/findings/datadog-inspector/<run_id>.json
```

The collector appends a run manifest to:

```text
~/.cache/claude-grc/runs.log
```

## Coverage

- Log index retention and audit log visibility
- Monitor coverage for critical resources
- SSO enforcement visibility
- RBAC role inventory visibility

Unavailable API surfaces are emitted as `inconclusive` evaluations instead of silently passing.

## Options

- `--output=summary|json|silent` controls stdout. Default: `summary`; `silent` suppresses stdout summary.
- `--quiet` suppresses progress logs on stderr.
