# /wiz-inspector:setup

Configure Wiz GraphQL API credentials for local evidence collection.

```bash
export WIZ_CLIENT_ID="..."
export WIZ_CLIENT_SECRET="..."
export WIZ_API_URL="https://api.<region>.app.wiz.io/graphql"

plugins/connectors/wiz-inspector/scripts/setup.sh \
  --api-url="$WIZ_API_URL" \
  --project-id="<optional-project-id>"
```

Required Wiz service-account scopes for the MVP collector:

- `read:projects`
- `read:issues`
- `read:vulnerabilities`
- `read:inventory`

Optional flags:

- `--auth-url=...` for non-standard or GovCloud tenants.
- `--client-id-env=...` and `--client-secret-env=...` when credentials use non-default env var names.
- `--project-id=...` to constrain collection to one Wiz project.
- `--limit=...` to set the GraphQL page size.

The setup check validates the credentials but persists only config and env-var names, not the client secret.
