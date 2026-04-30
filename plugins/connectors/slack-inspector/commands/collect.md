# /slack-inspector:collect

Collect Slack workspace posture and write Finding documents to the shared cache:

```text
~/.cache/claude-grc/findings/slack-inspector/<run_id>.json
```

The collector appends a run manifest to:

```text
~/.cache/claude-grc/runs.log
```

## Coverage

- Workspace authentication posture: 2FA and SSO signals
- Session duration policy visibility
- Message/file retention policy visibility
- App install approval workflow visibility
- DLP and discovery visibility

Slack exposes several of these controls only to Enterprise Grid or admin-scoped tokens. Missing privileges are emitted as `inconclusive` evaluations with a clear message.

## Options

- `--output=summary|json|silent` controls stdout. Default: `summary`; `silent` suppresses stdout summary.
- `--quiet` suppresses progress logs on stderr.

## Example

```bash
node plugins/connectors/slack-inspector/scripts/collect.js --output=json
```
