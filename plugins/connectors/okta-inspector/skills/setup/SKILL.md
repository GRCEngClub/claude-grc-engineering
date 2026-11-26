---
name: setup
description: Configure the okta-inspector connector — Okta domain and API token. Idempotent.
---

# /okta-inspector:setup

Configures the okta-inspector connector. Verifies an Okta API token works against the given org, writes `~/.config/claude-grc/connectors/okta-inspector.yaml`.

## How to run

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/setup.sh" --domain=<your-org>.okta.com [--token-env=OKTA_API_TOKEN]
```

## Credential sources (in precedence order)

1. `--token=<value>` flag (not recommended — ends up in shell history)
2. `--token-env=<ENV_VAR>` — tells the connector which env var holds the token
3. `OKTA_API_TOKEN` — default env var name

The token must be a **Read-only** API token at minimum, created at `https://<your-org>.okta.com/admin/access/api/tokens`. The connector never writes the token to disk — only the env-var *name*.

## What it does

1. Verify `curl` is available.
2. Read the token from the specified env var.
3. Call `GET /api/v1/users/me` to verify the token resolves to an active admin/user.
4. Fetch org details (`GET /api/v1/org`) to record the org ID and status.
5. Write config:

   ```yaml
   version: 1
   source: okta-inspector
   source_version: "0.1.0"
   domain: "acme.okta.com"
   org_id: "00oab12c3d4E5f6G7h8"
   caller: "security-scanner@acme.com"
   token_env: "OKTA_API_TOKEN"
   defaults:
     include_deactivated_users: false
   ```

## Typical output

```
okta-inspector:setup ✓
  domain:        acme.okta.com
  org id:        00oab12c3d4E5f6G7h8
  caller:        security-scanner@acme.com
  token source:  $OKTA_API_TOKEN
  config:        ~/.config/claude-grc/connectors/okta-inspector.yaml

Next: /okta-inspector:collect
```

## Failure modes

- **curl missing**: exit 5. (Should never happen on a real machine.)
- **Token env var unset**: exit 2. Set `OKTA_API_TOKEN` then re-run.
- **401 Unauthorized**: exit 2. Token invalid or revoked. Create a new one in Okta admin.
- **403 Forbidden**: exit 2. Token lacks read scope on the endpoint. Use at least a Read-only token.
- **Org not found / 404**: exit 2. Domain typo. Should look like `acme.okta.com`, not `https://acme.okta.com`.

## Safe to re-run

Yes. Overwrites the config; the token itself is never stored.
