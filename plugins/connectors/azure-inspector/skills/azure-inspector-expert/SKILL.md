---
name: azure-inspector-expert
description: Expertise in evaluating Azure subscription findings from azure-inspector and mapping them to SCF controls.
---

# azure-inspector expert

Use this skill when interpreting `azure-inspector` findings or explaining Azure control gaps.

## Checks This Connector Runs

**Entra ID**

| SCF | Check | Typical outcome |
|---|---|---|
| IAC-01.1 | MFA posture needs Graph/authentication-method verification | inconclusive when Azure CLI cannot prove coverage |
| IAC-04 | Enabled Conditional Access policies exist | high fail if none found |

**Storage accounts**

| SCF | Check | Severity |
|---|---|---|
| CRY-05 | Blob/file encryption enabled | high if disabled |
| DCH-01.2 | Blob public access disabled | critical if allowed |
| CRY-06 | Minimum TLS version is TLS 1.2 or later | medium |

**Key Vault**

| SCF | Check | Severity |
|---|---|---|
| BCD-11 | Soft delete and purge protection | high/medium |
| IAC-07.2 | Azure RBAC authorization preferred over access policies | medium |

**Monitor + Defender for Cloud**

| SCF | Check | Severity |
|---|---|---|
| MON-02 | Subscription Activity Log diagnostic export configured | high |
| MON-01.2 | Defender for Cloud Standard plan enabled | high |

## Interpretation Rules

- Prefer SCF control IDs already emitted by the connector. Do not remap to Azure-native benchmark IDs unless the user asks for a CIS Azure Benchmark view.
- Treat `inconclusive` as an evidence gap, not a pass. Entra MFA coverage often needs Microsoft Graph permissions beyond basic Azure Reader.
- Treat a subscription-level `not_applicable` document as a scope signal, not a security defect. Example: no Key Vaults found.
- For Key Vault, soft delete and purge protection are recovery controls. They do not prove key rotation.
- For Storage, `allowBlobPublicAccess=true` is a high-risk configuration even when no container is currently public because it permits future public ACLs.

## Common Failure Modes

- `az login` is valid but the principal lacks subscription Reader.
- Conditional Access queries require Microsoft Graph permissions such as `Policy.Read.All`.
- Defender pricing reads require Security Reader or equivalent permissions in some tenants.
- Diagnostic settings can exist at resource scope even if subscription Activity Log export is missing. The connector checks subscription-level export for v0.1.0.

## Remediation Guidance

- Entra ID: baseline Conditional Access for admins, all users MFA, risky sign-ins, and legacy authentication blocking.
- Storage: set `allowBlobPublicAccess=false`, enforce TLS 1.2+, and keep service encryption enabled.
- Key Vault: enable soft delete, enable purge protection for production vaults, and migrate broad access policies to Azure RBAC.
- Monitor: export Activity Logs to Log Analytics, Event Hub, or Storage with retention aligned to the compliance program.
- Defender: enable Standard plans for regulated resource types and verify alert routing into the incident workflow.

## Roadmap Boundaries

v0.1.0 does not inspect network security groups, Azure Policy assignments, VM disk encryption, AKS, SQL, Sentinel analytics, or Defender recommendations. Mark those as future connector coverage unless separate evidence is supplied.
