---
name: AWS Secrets Inspector Collect
description: Query AWS Secrets Manager for compliance-relevant configuration (rotation, KMS, resource policy, access patterns) and emit findings conforming to the v1 contract.
---

# /aws-secrets-inspector:collect

Scans AWS Secrets Manager for compliance-relevant configuration. Emits one Finding document per secret. Inspector mode is the default path of `aws-secrets-inspector`. For value retrieval, use `/aws-secrets-inspector:retrieve` instead.

## How to run

```bash
node plugins/connectors/aws-secrets-inspector/scripts/collect.js [options]
```

## Arguments

- `--regions=<csv>` — regions to scan (default: the config's `default_region` or `defaults.regions`)
- `--profile=<name>` — override the configured AWS profile
- `--output=<fmt>` — `silent` | `summary` (default) | `json`
- `--refresh` — ignore cache; re-query AWS (always refreshes for now)
- `--quiet` — no stderr progress

## What it evaluates

One Finding per secret, with four SCF-mapped evaluations. The SCF IDs were verified against the live SCF API at `https://grcengclub.github.io/scf-api` during implementation (the implementation plan's prior guesses were superseded).

| SCF | Check | Severity if failing | Source of truth |
|---|---|---|---|
| CRY-09 | Rotation enabled | high | `describe-secret` → `RotationEnabled`, `RotationRules` |
| CRY-09 | Customer-managed KMS key | high | `describe-secret` → `KmsKeyId` (must not be `alias/aws/secretsmanager`) |
| IAC-21 | Resource policy excludes public access | critical | `get-resource-policy` → policy statements with `Principal: "*"` granting `secretsmanager:GetSecretValue` (or `secretsmanager:*` / `*`) |
| IAC-15.3 | Access pattern (LastAccessedDate ≤ 180d) | medium | `describe-secret` → `LastAccessedDate` |

If a `get-resource-policy` call returns `ResourcePolicyNotFoundException`, the secret relies on IAM only and IAC-21 is recorded as `pass` with a note. If the call fails for any other reason, IAC-21 is `inconclusive`.

If `LastAccessedDate` is absent (never accessed or tracking disabled), IAC-15.3 is `inconclusive`; the operator can rely on the rotation-age signal recorded in `raw_attributes.RotationAgeDays` and on their consumer inventory.

## Output

- Writes `~/.cache/claude-grc/findings/aws-secrets-inspector/<run_id>.json` — array of Findings
- Appends a run manifest to `~/.cache/claude-grc/runs.log`
- One-line summary unless `--quiet` or `--output=json`:

  ```
  aws-secrets-inspector: 12 resources, 48 evaluations, 7 failing (1 critical, 4 high, 2 medium).
  ```

The `raw_attributes` block on each Finding carries everything needed for downstream triage without a re-query: `Name`, `ARN`, `RotationEnabled`, `RotationRules`, `LastRotatedDate`, `LastChangedDate`, `LastAccessedDate`, `KmsKeyId`, `OwningService`, `PrimaryRegion`, `Description`, `InactiveDays`, `RotationAgeDays`. `resource.tags` carries the secret's tag set.

## Exit codes

- `0` success
- `2` credentials invalid or expired; or `--retrieve` not yet implemented (U4 follow-up)
- `3` rate-limited (AWS throttling; retry later)
- `4` partial (some regions inaccessible; report still written)
- `5` config missing — run setup
- `6` retrieval mode: secret not found (U4)

## Permissions

Minimum IAM policy for inspector mode (read-only):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:ListSecrets",
        "secretsmanager:DescribeSecret",
        "secretsmanager:GetResourcePolicy"
      ],
      "Resource": "*"
    }
  ]
}
```

For retrieve mode (U4), additionally: `secretsmanager:GetSecretValue`, `kms:Decrypt`.

The AWS-managed `ReadOnlyAccess` policy is a superset that also works.

## Examples

```bash
# Default region, all secrets
/aws-secrets-inspector:collect

# Multi-region scan
/aws-secrets-inspector:collect --regions=us-east-1,us-west-2,eu-west-1

# Alternate profile (e.g., for cross-account via the AWS CLI profile chain)
/aws-secrets-inspector:collect --profile=audit-target

# CI/CD-friendly
node plugins/connectors/aws-secrets-inspector/scripts/collect.js --quiet --output=json
```

## Cross-account access

This connector does NOT implement `sts:AssumeRole` itself. For cross-account access, configure the standard AWS CLI profile chain in `~/.aws/config` and pass `--profile=<name>`:

```ini
[profile audit-target]
role_arn = arn:aws:iam::222233334444:role/SecurityAudit
source_profile = default
mfa_serial = arn:aws:iam::111122223333:mfa/you   # optional
```

The AWS SDK performs the `AssumeRole` transparently; this connector sees the resolved credentials. See `commands/setup.md` and `commands/retrieve.md` for the same pattern applied to setup and retrieval.