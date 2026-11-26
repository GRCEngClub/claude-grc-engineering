---
name: status
description: "Show whether Datadog credentials are configured, whether they validate, and whether cached findings are fresh"
---

# /datadog-inspector:status

Show whether Datadog credentials are configured, whether they validate, and whether cached findings are fresh.

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/status.sh"
```

A cache older than seven days is reported as `stale`.
