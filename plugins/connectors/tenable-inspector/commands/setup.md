# /tenable-inspector:setup

Configure `tenable-inspector` for Tenable.io or Tenable.sc.

```bash
plugins/connectors/tenable-inspector/scripts/setup.sh --access-key=<key> --secret-key=<key>
```

Options:

- `--access-key=<key>` or `TENABLE_ACCESS_KEY`
- `--secret-key=<key>` or `TENABLE_SECRET_KEY`
- `--base-url=<url>` defaults to `https://cloud.tenable.com`

Config is written to `~/.config/claude-grc/connectors/tenable-inspector.yaml`; secrets are stored separately with user-only permissions.
