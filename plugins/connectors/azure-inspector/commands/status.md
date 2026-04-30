---
name: Azure Inspector Status
description: Report configuration state, credential validity, and last-run freshness for azure-inspector.
---

# /azure-inspector:status

Non-destructive health check. Shows whether the connector is configured, whether Azure credentials still work, and when it last produced findings.

## How to run

```bash
bash plugins/connectors/azure-inspector/scripts/status.sh
```

## Output

```text
azure-inspector
  status:        ready
  az:            2.72.0
  subscription:  Prod (00000000-0000-0000-0000-000000000000)
  tenant:        11111111-1111-1111-1111-111111111111
  caller:        scanner@example.com
  config:        ~/.config/claude-grc/connectors/azure-inspector.yaml
  cache:         ready
  last run:      4h ago (20260430121212-a1b2c3d4)
  cached:        18 resources, 64 evaluations
```

## Status values

- `ready` - config exists and Azure CLI can read the subscription
- `not-configured` - setup has not run
- `credentials-expired-or-subscription-inaccessible` - `az account show` failed for the configured subscription
- `stale` - last run is older than 7 days
