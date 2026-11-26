---
name: status
description: Report configuration state, auth validity, and last-run freshness for the github-inspector connector.
---

# /github-inspector:status

Non-destructive health check. Shows whether the connector is configured, whether credentials still work, and when it last produced findings.

## How to run

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/status.sh"
```

## Output

```
github-inspector
  status:         ready
  gh:             /usr/local/bin/gh v2.59.0
  auth:           valid (octocat, scopes: repo,read:org)
  config:         ~/.config/claude-grc/connectors/github-inspector.yaml
  scope:          @me
  last run:       2 hours ago (run_id 20260413-a1b2c3d4)
  cached findings: 127 resources, 512 evaluations
  rate limit:     4,872/5000 remaining
```

## Status values

- `ready` — all systems go
- `not-configured` — `setup` has not been run
- `auth-expired` — `gh` token revoked or expired
- `stale` — last run > 7 days ago; consider refreshing
- `no-cache` — configured but never run

## Exit codes

- `0` — ready or stale
- `2` — auth-expired or not-configured
