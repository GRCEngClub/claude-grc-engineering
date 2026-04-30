# /wiz-inspector:setup

Configure Wiz GraphQL API credentials for local evidence collection.

```bash
plugins/connectors/wiz-inspector/scripts/setup.sh \
  --client-id="$WIZ_CLIENT_ID" \
  --client-secret="$WIZ_CLIENT_SECRET" \
  --api-url="$WIZ_API_URL"
```

Optional flags: `--auth-url=...`, `--project-id=...`, and `--limit=...`.
