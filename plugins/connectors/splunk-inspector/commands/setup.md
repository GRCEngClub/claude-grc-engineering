# /splunk-inspector:setup

Configure `splunk-inspector` for a Splunk management API endpoint.

```bash
plugins/connectors/splunk-inspector/scripts/setup.sh --base-url=https://splunk.example.com:8089 --token=<token>
```

The setup command validates `/services/server/info` and writes:

```text
~/.config/claude-grc/connectors/splunk-inspector.yaml
```

Secrets are stored separately with user-only file permissions at:

```text
~/.config/claude-grc/connectors/splunk-inspector.env
```

## Auth

Prefer Splunk bearer tokens. Basic auth is supported for local/admin workflows.

Options:

- `--base-url=<url>` Splunk management API base URL, usually port `8089`.
- `--token=<token>` or `SPLUNK_TOKEN`.
- `--username=<user> --password=<password>` or `SPLUNK_USERNAME` / `SPLUNK_PASSWORD`.
- `--insecure` allows self-signed certificates by setting `NODE_TLS_REJECT_UNAUTHORIZED=0`.

## Next

```text
/splunk-inspector:collect
/splunk-inspector:status
```
