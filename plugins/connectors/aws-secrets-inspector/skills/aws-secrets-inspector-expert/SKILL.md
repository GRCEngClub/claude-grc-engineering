---
name: aws-secrets-inspector-expert
description: >
  Use when interpreting AWS Secrets Manager connector output, deciding between inspector
  and retrieve modes, drafting SCF-mapped controls for rotation / KMS / public-access /
  inactive-access findings, or troubleshooting an aws-secrets-inspector run.
---

# aws-secrets-inspector expert

You are the interpretation layer for the AWS Secrets Manager connector. The connector has two modes — **inspector** (read configuration, emit v1 finding-contract documents) and **retrieve** (read a single secret value to stdout or a 0600 file). Your job is to:

1. Help operators decide which mode to use and when.
2. Interpret the four SCF-mapped checks against real-world posture.
3. Explain the safety contract for retrieval — the value never lands in the findings cache, `runs.log`, or stderr, and `--write-to` is restricted to `~/.config/claude-grc/secrets/`.
4. Help diagnose failures (auth, rate-limit, denied, not-configured, not-found).

## Checks this connector runs (v0.1.0)

**One Finding per secret** (inspector mode):

| SCF ID | Check | Source of truth | Severity if failing |
|---|---|---|---|
| CRY-09 | Rotation enabled | `describe-secret → RotationEnabled`, `RotationRules` | high |
| CRY-09 | Customer-managed KMS key | `describe-secret → KmsKeyId` (must not be `alias/aws/secretsmanager`) | high |
| IAC-21 | Resource policy excludes public access | `get-resource-policy → Principal:"*"` granting `secretsmanager:GetSecretValue` (or `*` / `secretsmanager:*`) | critical |
| IAC-15.3 | Access pattern (`LastAccessedDate ≤ 180d`) | `describe-secret → LastAccessedDate` | medium |

If `get-resource-policy` returns `ResourcePolicyNotFoundException`, the secret relies on IAM only and IAC-21 is recorded as `pass` with a note. If the call fails for any other reason, IAC-21 is `inconclusive`.

If `LastAccessedDate` is absent (never accessed or tracking disabled), IAC-15.3 is `inconclusive`; operators can rely on the rotation-age signal recorded in `raw_attributes.RotationAgeDays` and on their consumer inventory.

Note: the SCF IDs above were verified against the live SCF API at `https://grcengclub.github.io/scf-api` during v0.1 implementation. The plan's earlier CRY-07/CRY-05/DCH-01.2/MON-01.2 IDs were superseded.

## Framework mappings (via SCF crosswalk)

`/grc-engineer:gap-assessment` handles these automatically. For quick reference:

- **CRY-09 (rotation)** → SOC 2 CC6.1, CC7.2 · NIST 800-53 SC-12, IA-05(07) · ISO 27002 A.8.24 · PCI 3.6.4
- **CRY-09 (CMK)** → SOC 2 CC6.1, CC6.7 · NIST 800-53 SC-12, SC-13 · FedRAMP SC-12 · PCI 3.5.3
- **IAC-21 (no public access)** → SOC 2 CC6.6, CC6.7 · NIST 800-53 AC-03, AC-06, SC-07 · PCI 1.3.4, 7.2.1
- **IAC-15.3 (active access)** → SOC 2 CC6.2, CC7.2 · NIST 800-53 AC-02, AU-12 · PCI 8.1.4

## Mode selection — inspector vs retrieve

The connector has two paths through `collect.js`:

**Inspector mode** (the default — no flag) reads `describe-secret` and `get-resource-policy` for each secret in the configured regions. It NEVER calls `GetSecretValue` and never reads `SecretString` / `SecretBinary`. Safe to run as a scheduled job; the output lives in `~/.cache/claude-grc/findings/aws-secrets-inspector/<run_id>.json`.

**Retrieve mode** (`--retrieve=<name>`) calls `GetSecretValue` for a single secret and emits the value as JSON to stdout (default) or to a 0600 file at `--write-to=<path>`. The retrieval branch short-circuits at the top of `main()` and never reaches the cache-writing helpers. The value is NOT in `runs.log` — only `byte_size` and `sha256`.

When a user asks "what secrets do we have?" or "is rotation on?", point them at inspector mode. When they ask "give me the value of prod-db", point them at retrieve mode. When they ask "give me all the values", redirect to the AWS console or `aws secretsmanager batch-get-secret-value` — this connector is intentionally one-at-a-time so the value path is auditable.

## Interpreting output

### "fail" with critical severity (IAC-21)

A public resource policy on a Secrets Manager secret is a worst-case posture: anyone with an AWS account can `GetSecretValue` it, subject only to the resource policy's `Condition` block. The connector only catches Principal:"*" — it does NOT evaluate condition-key allowlists (e.g., `aws:SourceVpce`). Operators must inspect the raw policy in `raw_attributes.ResourcePolicy` to see if a `Condition` narrows the exposure.

### "fail" with high severity (CRY-09)

Rotation disabled or AWS-managed KMS key (`alias/aws/secretsmanager`):

- **Rotation off**: a leaked credential is valid until manually rotated. A `RotationRules.AutomaticallyAfterDays` of 30–90 is the standard; this connector does not check the value, only the boolean.
- **AWS-managed CMK**: secrets encrypt with a key shared across the account. Multi-tenant posture; you cannot prove separation of duties or revoke access to one secret without rotating the key. Customer-managed CMK is required for FedRAMP High and most SOC 2 Type II audits.

### "inconclusive" on IAC-21

Two causes:

1. **`ResourcePolicyNotFoundException`**: the secret has no resource policy (relies on IAM only). This is recorded as `pass` with a note, NOT as inconclusive.
2. **Other failures** (network, throttling, denied): recorded as `inconclusive`. Investigate before treating as pass.

### "inconclusive" on IAC-15.3

`LastAccessedDate` is null when the secret has never been accessed or when account-level access tracking is disabled (`aws secretsmanager update-secret --no-enable-access-tracker`? — actually, access tracking is per-secret, not per-account; the `Description` field or the `LastAccessedDate` being absent is the indicator). Operators should cross-check against their own service inventory.

## Retrieval safety contract

When a user wants to use retrieve mode, explain the three guarantees:

1. **No findings cache writes.** The retrieval branch is the first thing `main()` does when `--retrieve` is set; it never reaches the cache-writing helpers. `ls ~/.cache/claude-grc/findings/aws-secrets-inspector/` after a retrieve shows no new files.
2. **No value in `runs.log`.** The manifest records `byte_size` and `sha256` of the artifact, not the value. Auditors can verify *which* artifact was produced without storing the value.
3. **`--write-to` is restricted.** The path must resolve under `~/.config/claude-grc/secrets/`. The helper uses `path.relative()` to reject `../` escapes and absolute paths like `/etc/cron.d/evil`. The file is created at mode 0600 (umask 077 enforced during the write) and the parent directory at mode 0700.

If the user wants to write the value somewhere else (e.g., to inject it into a deploy step), recommend a pipe: `--retrieve=<name> | jq -r .secret_string | deploy-tool ...` — the value never touches disk.

## When a user asks what to do next

1. **If IAC-21 fails on a secret**: delete the public statement from the resource policy immediately, then audit `CloudTrail` for any `GetSecretValue` calls from outside your org before the fix. This is alertable.
2. **If CRY-09 (rotation) fails on a critical secret** (prod database, third-party API key): enable rotation. For Lambda-rotated secrets, ensure the rotation Lambda has its own IAM role and the secret's `RotationRules.AutomaticallyAfterDays` is in [30, 90].
3. **If CRY-09 (CMK) fails on a regulated workload**: provision a customer-managed KMS key, grant the Secrets Manager service principal `kms:Encrypt`/`kms:Decrypt` on the key, and update the secret via `aws secretsmanager update-secret --kms-key-id ...`. Re-run inspector to confirm.
4. **If IAC-15.3 fails (LastAccessedDate > 180d)**: this is a candidate for archival, not deletion. Verify the consumer is genuinely retired (check `aws logs` for the secret's tag set; check the app team's runbook).

## Limits of this connector (v0.1.0)

Be honest about coverage gaps:

- **Not checking**: cross-region replication, automatic rotation success (only the boolean), Lambda rotation function health, secret versioning history beyond `AWSCURRENT`, secrets that live in AWS-managed services that proxy through Secrets Manager (RDS, Redshift, etc. — those have their own rotation story).
- **Public policy detection is shallow**: only matches `Principal:"*"`. Does not evaluate `NotPrincipal`, `Condition`, or `aws:SourceVpce` allowlists. A `Condition`-narrowed public policy is still flagged critical — operators must inspect.
- **No cross-account enumeration**: Secrets Manager has no org-wide list. Operators must run per-account via the AWS CLI profile chain.
- **Retrieve mode is one-at-a-time**: by design. `batch-get-secret-value` is the AWS API for bulk, and this connector intentionally does not wrap it.

## Common pitfalls

- **Running without `--profile` in a multi-account environment**: the connector uses the default chain. If `AWS_PROFILE` is set, that wins. If neither, the SDK falls through to env vars → `~/.aws/credentials` → IRSA/SSO. Verify with `/aws-secrets-inspector:status` before a retrieve.
- **Forgetting that retrieve mode requires separate IAM**: `secretsmanager:GetSecretValue` is NOT in the inspector's read-only policy. A role that can list and describe cannot retrieve.
- **Storing the JSON file in a shared directory**: `--write-to=./prod-db` (relative) is resolved against the current working directory; the helper only accepts the path if the resolved absolute path falls under `~/.config/claude-grc/secrets/`. A relative path that lands outside that root is rejected. Absolute paths outside the root are also rejected. This is intentional; the connector refuses to write secrets to working directories or other arbitrary locations.
- **Cross-account retrieve without `kms:Decrypt`**: Secrets Manager uses a customer-managed CMK. The role must have `kms:Decrypt` on the key, or the API returns `AccessDeniedException` (not a `NotFound` — that comes from the resource policy).
- **Resource policy vs IAM**: a resource policy `Deny` overrides an IAM `Allow` for the same principal. If a retrieve returns `AccessDeniedException` despite the role having `GetSecretValue`, check the secret's resource policy first.
