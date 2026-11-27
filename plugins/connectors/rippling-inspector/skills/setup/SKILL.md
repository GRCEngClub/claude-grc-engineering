---
name: setup
description: Configure rippling-inspector with a read-only Rippling API token held in an environment variable.
---

# /rippling-inspector:setup

Validates a Rippling API token and writes the connector's config. The token is read from an environment variable. Never ask the user to paste it into the conversation, and never print it.

## Before running

Tell the user to do these steps themselves:

1. In Rippling, open **Developer > API credentials > New API token** (`https://app.rippling.com/api-tokens/tokens`). The person creating it needs the "Create and manage API Tokens" permission.
2. Select read scopes only:
   - `companies.read`, `workers.read`, `users.read` for the offboarding and reporting-line checks
   - `devices.read` for the device checks
   - `app-users.read` for app accounts of terminated workers
   - `activity-log.read` for the activity-log check
3. Leave these off. The connector does not need them and they return sensitive data: `compensations.read`, `workers.sensitive.personal.read`, `workers.custom-fields.read`, `activity-log.sensitive-data.read`.
4. Copy the token (Rippling shows it once) and export it in their own terminal:

   ```bash
   export RIPPLING_API_TOKEN=<token>
   ```

5. Start Claude Code from that same terminal. A session that was already running does not see a variable exported afterwards, and setup will report the token as missing.

## How to run

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/setup.js" [--token-env=<NAME>]
```

- `--token-env=<NAME>`: read the token from a different environment variable (default `RIPPLING_API_TOKEN`).

Setup makes one request, `GET /companies/`, and writes `~/.config/claude-grc/connectors/rippling-inspector.yaml` with the company ID and the variable's name. The token itself is not stored.

## Things to tell the user

- **A token sees only what its creator can see.** A token created by a manager returns only that manager's reports, with HTTP 200 and no warning. For company-wide results the creator must be a full admin.
- **Tokens expire quietly.** Rippling revokes a token that is unused for 30 days or whose owner is offboarded. A quarterly run will usually need a new token.
- **Check your Rippling agreement.** Rippling's developer terms restrict letting third-party systems, including AI agents, use an API key. This connector keeps the token in your shell environment and out of the conversation, but whether your agreement allows this use is your call. Rippling does not endorse this connector.
- The Rippling API itself may need to be enabled for the company (the "Rippling API" product, and Rippling IT products for device and app data). A `403` naming entitlements means it is not.

## Exit codes

- `0`: configured
- `1`: network error
- `2`: token missing or rejected, or bad arguments
