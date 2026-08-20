---
name: AWS Secrets Inspector Setup
description: Verify the aws-secrets-inspector connector's prerequisites and write its config. Idempotent.
---

# /aws-secrets-inspector:setup

Prepares the aws-secrets-inspector connector. Confirms `aws` CLI is installed and credentials resolve, writes `~/.config/claude-grc/connectors/aws-secrets-inspector.yaml`, and creates `~/.config/claude-grc/secrets/` (mode 0700) as the destination for `--write-to=` retrievals. Runs a read-only health check.

## How to run

```bash
bash plugins/connectors/aws-secrets-inspector/scripts/setup.sh [--profile=<name>] [--region=<region>]
```

Exits 0 on success, 2 on missing/invalid credentials, 5 on missing `aws` binary.

## Credential precedence

Honors the standard AWS credential chain:

1. `--profile` flag (writes it to config)
2. `AWS_PROFILE` environment variable
3. `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` env vars
4. `~/.aws/credentials` default profile
5. Instance metadata / IRSA / SSO

The setup script runs `aws sts get-caller-identity` to verify credentials resolve *before* writing the config. If none resolve, it fails with actionable remediation.

## What it does

1. Check `aws` CLI is installed (`aws --version`).
2. Resolve credentials (`aws sts get-caller-identity`).
3. Resolve default region (from `--region`, `AWS_REGION`, config, or fall back with a warning).
4. Write config:

   ```yaml
   version: 1
   source: aws-secrets-inspector
   source_version: "0.1.0"
   account_id: "<12-digit>"
   caller_arn: "<arn>"
   profile: "<if set>"
   default_region: "us-east-1"
   defaults:
     regions: ["us-east-1"]
     rotation: true
     kms: customer_managed
   ```

5. Create the cache dir `~/.cache/claude-grc/findings/aws-secrets-inspector/` and ensure `~/.cache/claude-grc/runs.log` exists.
6. Create the secrets dir `~/.config/claude-grc/secrets/` at mode 0700 (operator-only).
7. Warn if the caller ARN has administrative privileges (dogfooding: production scans and retrievals should use a dedicated least-privilege role).

## Typical output

```
aws-secrets-inspector:setup ✓
  aws:            /opt/homebrew/bin/aws 2.15.1
  account:        123456789012
  caller:         arn:aws:iam::123456789012:user/you
  profile:        default
  default region: us-east-1
  config written: /Users/you/.config/claude-grc/connectors/aws-secrets-inspector.yaml
  secrets dir:    /Users/you/.config/claude-grc/secrets (mode 700)

WARNING: caller ARN appears to have administrative privileges. For production
scans and retrieval, prefer a dedicated least-privilege role. Minimum IAM
actions for the aws-secrets-inspector:
  - Inspector mode: secretsmanager:ListSecrets, secretsmanager:DescribeSecret,
                    secretsmanager:GetResourcePolicy
  - Retrieve mode:  + secretsmanager:GetSecretValue, kms:Decrypt

Next:
  /aws-secrets-inspector:collect
  /aws-secrets-inspector:retrieve --retrieve=<secret-name>
```

## Failure modes

- **aws not installed**: exit 5. Install via `brew install awscli` or https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html.
- **NoCredentialProviders**: exit 2. Remediation printed with the specific credential paths tried.
- **InvalidClientTokenId**: exit 2. Credentials are present but rejected. Check `aws configure` or SSO session.
- **Region not set**: warning; defaults to `us-east-1` and notes it in the config.

## Cross-account access

This connector does NOT implement `sts:AssumeRole` itself. For cross-account access, configure the standard AWS CLI profile chain in `~/.aws/config`:

```ini
[profile audit-target]
role_arn = arn:aws:iam::222233334444:role/SecurityAudit
source_profile = default
mfa_serial = arn:aws:iam::111122223333:mfa/you   # optional
```

Then run `/aws-secrets-inspector:setup --profile=audit-target` and the connector will pick up the AssumeRole transparently. See `commands/retrieve.md` for the same pattern applied to retrievals.

## Safe to re-run

Yes. Overwrites the config; preserves cached findings and the existing secrets directory (mode 0700 is preserved).