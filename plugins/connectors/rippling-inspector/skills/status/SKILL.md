---
name: status
description: Report configuration state, token validity and last-run freshness for rippling-inspector.
---

# /rippling-inspector:status

Health check. Shows whether the connector is configured, whether the token still works, and when it last produced findings. It makes one read request (`GET /companies/`) and writes nothing.

## How to run

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/status.sh"
```

## Output

```
rippling-inspector
  company id:    65699281fb7bc7c3510f44a6
  token source:  $RIPPLING_API_TOKEN (valid)
  config:        ~/.config/claude-grc/connectors/rippling-inspector.yaml
  status:        ready
  last run:      5h ago (20261127011211-40f55d7c)
  cached:        14 resources, 22 evaluations
```

## Status values

- `ready`: configured, token accepted, last run within 7 days (or no runs yet)
- `stale`: last run is more than 7 days old
- `not-configured`: setup has not been run
- `token-missing`: the token environment variable is not set in this shell
- `company-mismatch`: the token is valid but belongs to a different company than the one setup recorded. Run setup again with the intended token.
- `token-invalid`: Rippling returned 401. The token is wrong, revoked, unused for more than 30 days, or its owner was offboarded. Create a new one and run `/rippling-inspector:setup` again.
- `network-error`, `api-error`: Rippling could not be reached or returned an unexpected response

Exit code is `0` for `ready` and `stale`, `2` otherwise.
