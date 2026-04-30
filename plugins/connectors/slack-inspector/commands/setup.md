# /slack-inspector:setup

Configure `slack-inspector` for a Slack workspace.

```bash
plugins/connectors/slack-inspector/scripts/setup.sh --token=xoxb-...
```

The setup command is idempotent. Re-running it validates the active token with `auth.test` and rewrites the same connector config at:

```text
~/.config/claude-grc/connectors/slack-inspector.yaml
```

## Required token

Use a Slack OAuth bot token with the least privilege scopes available for your plan. The collector can run with partial coverage and marks unavailable admin-only checks as `inconclusive`.

Recommended scopes:

- `team:read`
- `users:read`
- `admin.users.info:read`
- `admin.apps:read`
- `admin.conversations:read`
- `discovery:read`

Enterprise Grid or admin scopes may be required for 2FA, SSO, app approval, retention, and DLP checks.

## Options

- `--token=<xoxb-or-xoxp-token>` Slack OAuth token. If omitted, reads `SLACK_TOKEN`.
- `--workspace=<name>` optional label stored in config.

## Next

```text
/slack-inspector:collect
/slack-inspector:status
```
