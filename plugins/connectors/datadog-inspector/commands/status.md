# /datadog-inspector:status

Show whether Datadog credentials are configured, whether they validate, and whether cached findings are fresh.

```bash
plugins/connectors/datadog-inspector/scripts/status.sh
```

A cache older than seven days is reported as `stale`.
