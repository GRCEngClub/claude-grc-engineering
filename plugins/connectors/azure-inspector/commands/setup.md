---
name: Azure Inspector Setup
description: Verify the azure-inspector connector's prerequisites and write its config. Idempotent.
---

# /azure-inspector:setup

Prepares the azure-inspector connector. Confirms `az` CLI is installed and authenticated, writes `~/.config/claude-grc/connectors/azure-inspector.yaml`, and runs a read-only subscription health check.

## How to run

```bash
bash plugins/connectors/azure-inspector/scripts/setup.sh [--subscription=<id>] [--tenant=<id>]
```

Exits 0 on success, 2 on missing/invalid credentials, 5 on missing `az` binary.

## Credential precedence

Honors the standard Azure CLI credential chain:

1. `--subscription` / `--tenant` flags
2. `AZURE_SUBSCRIPTION_ID` environment variable for collection
3. Active `az account show` context
4. Managed identity after `az login --identity`

The setup script verifies `az account show --subscription <id>` before writing config.

## Config written

```yaml
version: 1
source: azure-inspector
source_version: "0.1.0"
subscription_id: "<subscription-id>"
subscription_name: "<name>"
tenant_id: "<tenant-id>"
caller: "<user-or-service-principal>"
defaults:
  services: ["entra", "storage", "keyvault", "monitor", "defender"]
```

## Failure modes

- **az not installed**: exit 5. Install Azure CLI.
- **No active account**: exit 2. Run `az login` or `az login --identity`.
- **Subscription inaccessible**: exit 2. Grant Reader on the subscription; add Security Reader and Microsoft Graph Policy.Read.All for fuller coverage.

## Safe to re-run

Yes. Re-running verifies the current account and overwrites config without deleting cached findings.
