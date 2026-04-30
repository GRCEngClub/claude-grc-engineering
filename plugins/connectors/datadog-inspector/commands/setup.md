# /datadog-inspector:setup

Configure `datadog-inspector` with a Datadog API key and application key.

```bash
plugins/connectors/datadog-inspector/scripts/setup.sh --api-key=<key> --app-key=<key>
```

The setup command validates credentials against the Datadog API and writes:

```text
~/.config/claude-grc/connectors/datadog-inspector.yaml
```

Secrets are stored separately with user-only file permissions at:

```text
~/.config/claude-grc/connectors/datadog-inspector.env
```

## Options

- `--api-key=<key>` or `DD_API_KEY`
- `--app-key=<key>` or `DD_APP_KEY`
- `--site=<site>` defaults to `datadoghq.com`

## Next

```text
/datadog-inspector:collect
/datadog-inspector:status
```
