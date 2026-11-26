---
name: AWS Inspector Setup
description: Verify the aws-inspector connector's prerequisites and write its config. Idempotent.
---

# /aws-inspector:setup

Prepares the aws-inspector connector. Confirms `aws` CLI is installed and credentials resolve, writes `~/.config/claude-grc/connectors/aws-inspector.yaml`, and runs a read-only health check.

## How to run

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/setup.sh" [--profile=<name>] [--region=<region>]
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
   source: aws-inspector
   source_version: "0.1.0"
   account_id: "<12-digit>"
   caller_arn: "<arn>"
   profile: "<if set>"
   default_region: "us-east-1"
   defaults:
     regions: ["us-east-1"]    # add more with /aws-inspector:collect --regions=...
     services: ["iam", "s3", "cloudtrail", "ebs"]
   ```

5. Warn if the caller ARN has administrative privileges (dogfooding: production scans should use a dedicated read-only IAM role like `SecurityAudit`).

## Typical output

```
aws-inspector:setup ✓
  aws:            /opt/homebrew/bin/aws 2.15.1
  account:        123456789012
  caller:         arn:aws:iam::123456789012:user/you
  profile:        default
  default region: us-east-1

WARNING: Caller appears to have admin privileges. For production, use a
dedicated read-only role (e.g., AWS-managed SecurityAudit policy).

Next: /aws-inspector:collect
```

## Failure modes

- **aws not installed**: exit 5. Install via `brew install awscli` or https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html.
- **NoCredentialProviders**: exit 2. Remediation printed with the specific credential paths tried.
- **InvalidClientTokenId**: exit 2. Credentials are present but rejected. Check `aws configure` or SSO session.
- **Region not set**: warning; defaults to `us-east-1` and notes it in the config.

## Safe to re-run

Yes. Overwrites the config; preserves cached findings.
