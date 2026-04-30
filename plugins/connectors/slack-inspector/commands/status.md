# /slack-inspector:status

Show whether `slack-inspector` is configured, whether the token is still valid, and the freshness of the latest cached run.

```bash
plugins/connectors/slack-inspector/scripts/status.sh
```

Output includes:

- top-level status: `ready`, `stale`, `not-configured`, or `credentials-expired`
- Slack team id and team name from `auth.test`
- config path
- latest cache file age and evaluation count

A cache older than seven days is reported as `stale`.
