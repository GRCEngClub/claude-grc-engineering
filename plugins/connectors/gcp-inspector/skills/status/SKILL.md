---
name: status
description: Report configuration state, credential validity, and last-run freshness for gcp-inspector.
---

# /gcp-inspector:status

Non-destructive health check. Shows whether the connector is configured, whether credentials still work, and when it last produced findings.

## How to run

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/status.sh"
```

## Output

```
gcp-inspector
  status:         ready
  gcloud:         557.0.0
  project:        acme-prod (1234567890)
  caller:         compliance-scanner@acme-prod.iam.gserviceaccount.com
  default region: us-central1
  config:         ~/.config/claude-grc/connectors/gcp-inspector.yaml
  last run:       4h ago (run_id 20260413-a1b2c3d4)
  cached:         18 resources, 64 evaluations
```

## Status values

- `ready` — all systems go
- `not-configured` — setup not run
- `credentials-expired` — `gcloud auth list` shows no active account
- `project-inaccessible` — caller can't describe the configured project
- `stale` — last run > 7 days ago
