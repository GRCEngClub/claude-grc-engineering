---
name: AWS Inspector Status
description: Report configuration state, credential validity, and last-run freshness for aws-inspector.
---

# /aws-inspector:status

Non-destructive health check. Shows whether the connector is configured, whether credentials still work, and when it last produced findings.

## How to run

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/status.sh"
```

## Output

```
aws-inspector
  status:         ready
  aws:            /opt/homebrew/bin/aws 2.15.1
  account:        123456789012
  caller:         arn:aws:iam::123456789012:role/SecurityAudit
  profile:        audit
  default region: us-east-1
  config:         ~/.config/claude-grc/connectors/aws-inspector.yaml
  last run:       3h ago (run_id 20260413-a1b2c3d4)
  cached:         24 resources, 87 evaluations
```

## Status values

- `ready` — all systems go
- `not-configured` — setup not run
- `credentials-expired` — STS call fails; refresh SSO or rotate keys
- `stale` — last run > 7 days
- `no-cache` — configured but no runs yet
