---
name: testssl-inspector status
description: Show configured testssl runner, version, target count, and recent scans on disk.
---

# /testssl-inspector:status

Quick health check.

## How to run

```bash
bash plugins/connectors/testssl-inspector/scripts/status.sh
```

## What it shows

- Runner (`native` vs `docker`) and the binary path if native
- testssl.sh version captured at setup
- Config file path
- Configured target count
- Cache directory + number of scans on disk
- Filename of the latest scan, if any

## Exit codes

- `0` configured and reachable
- `5` not configured — run `/testssl-inspector:setup` first
