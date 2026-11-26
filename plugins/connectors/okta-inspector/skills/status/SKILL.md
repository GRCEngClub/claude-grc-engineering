---
name: status
description: Report configuration state, token validity, and last-run freshness for okta-inspector.
---

# /okta-inspector:status

Non-destructive health check. Shows whether the connector is configured, whether the token still works, and when it last produced findings.

## How to run

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/status.sh"
```

## Output

```
okta-inspector
  status:         ready
  domain:         acme.okta.com
  org id:         00oab12c3d4E5f6G7h8
  token source:   $OKTA_API_TOKEN (valid)
  caller:         security-scanner@acme.com
  config:         ~/.config/claude-grc/connectors/okta-inspector.yaml
  last run:       5h ago (run_id 20260413-a1b2c3d4)
  cached:         12 resources, 38 evaluations
```

## Status values

- `ready` — all systems go
- `not-configured` — setup not run
- `token-missing` — token env var unset
- `token-invalid` — Okta returned 401 on `/users/me`
- `stale` — last run > 7 days
