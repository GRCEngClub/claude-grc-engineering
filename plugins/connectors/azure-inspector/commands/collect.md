---
name: Azure Inspector Collect
description: Query Azure for compliance-relevant configuration across Entra ID, Storage, Key Vault, Monitor, and Defender for Cloud; emit findings conforming to the v1 contract.
---

# /azure-inspector:collect

Scans an Azure subscription for compliance-relevant resources and configurations.

## How to run

```bash
node plugins/connectors/azure-inspector/scripts/collect.js [options]
```

## Arguments

- `--subscription=<id>` - override the configured subscription
- `--tenant=<id>` - override the configured tenant
- `--services=<csv>` - subset of `entra,storage,keyvault,monitor,defender` (default: all)
- `--output=<fmt>` - `silent` | `summary` (default) | `json`
- `--quiet` - no stderr progress

## What it evaluates

**Entra ID**:

| SCF | Check | Severity |
|---|---|---|
| IAC-01.1 | MFA posture requires Graph/authentication-method verification | inconclusive if CLI cannot determine |
| IAC-04 | Conditional Access policies enabled | high if absent |

**Storage accounts**:

| SCF | Check | Severity |
|---|---|---|
| CRY-05 | Blob/file service encryption enabled | high if disabled |
| DCH-01.2 | Blob public access disabled | critical if allowed |
| CRY-06 | Minimum TLS version is TLS 1.2 or later | medium |

**Key Vault**:

| SCF | Check | Severity |
|---|---|---|
| BCD-11 | Soft delete and purge protection | high/medium if disabled |
| IAC-07.2 | Azure RBAC authorization preferred over access policies | medium |

**Monitor + Defender for Cloud**:

| SCF | Check | Severity |
|---|---|---|
| MON-02 | Subscription Activity Log diagnostic export configured | high |
| MON-01.2 | Defender for Cloud Standard plan enabled | high |

## Output

- `~/.cache/claude-grc/findings/azure-inspector/<run_id>.json` - array of Findings
- `~/.cache/claude-grc/runs.log` - run manifest appended
- stdout summary unless `--quiet`:

  ```
  azure-inspector: 18 resources, 64 evaluations, 7 failing (1 critical, 3 high, 3 medium).
  ```

## Exit codes

- `0` success
- `2` credentials invalid or subscription inaccessible
- `3` rate-limited (Azure quota exhausted)
- `4` partial (some services inaccessible; report still written)
- `5` config missing - run setup

## Minimum Azure role/API access

```
Reader on the subscription
Security Reader for Defender for Cloud posture
Microsoft Graph Policy.Read.All for Conditional Access reads
```

Managed identity works when the identity has equivalent role assignments.

## Examples

```bash
# Current subscription, all services
/azure-inspector:collect

# Multiple subscriptions
for s in sub-prod sub-stage; do
  /azure-inspector:collect --subscription=$s
done

# Storage only
/azure-inspector:collect --services=storage
```

## CI/CD usage

```bash
az login --identity
node plugins/connectors/azure-inspector/scripts/collect.js --quiet
node plugins/grc-engineer/scripts/gap-assessment.js FedRAMP-Moderate --sources=azure-inspector --output=sarif --quiet > azure-gap.sarif
```
