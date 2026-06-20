---
name: AWS Secrets Inspector Retrieve
description: Retrieve a single AWS Secrets Manager secret value to stdout or a 0600-permission file. Opt-in retrieval mode — never writes to the findings cache.
---

# /aws-secrets-inspector:retrieve

Retrieves a single AWS Secrets Manager secret value and returns it to stdout (default) or to a 0600-permission file under `~/.config/claude-grc/secrets/`. This is the **only** path through the connector that produces a secret value; the inspector mode never reads `SecretString` or `SecretBinary`.

## How to run

```bash
node plugins/connectors/aws-secrets-inspector/scripts/collect.js --retrieve=<secret-name> [options]
```

## Arguments

- `--retrieve=<name>` — required; the secret's name or full ARN
- `--version-stage=<stage>` — `AWSCURRENT` (default), `AWSPREVIOUS`, or a custom stage label
- `--version-id=<uuid>` — alternative to `--version-stage`; explicit version UUID
- `--write-to=<path>` — write the JSON to a 0600-permission file at `<path>` (must resolve under `~/.config/claude-grc/secrets/`); confirmation line is printed to stdout
- `--profile=<name>` — override the configured AWS profile
- `--quiet` — no stderr progress

## Output

**Stdout (default).** A single line of JSON:

```json
{"name":"prod-db","arn":"arn:aws:secretsmanager:us-east-1:123456789012:secret:prod-db-AbCdEf","version_id":"a1b2c3d4-...","version_stages":["AWSCURRENT"],"created_at":"2026-04-13T15:10:00Z","secret_string":"<value>"}
```

For binary secrets, `secret_binary` is set to the base64 string returned by AWS (text-safe on stdout); `secret_string` is absent.

**File (`--write-to`).** The same JSON is written to `<path>`, with the file created at mode 0600 and the parent directory at mode 0700. Stdout emits a confirmation:

```
aws-secrets-inspector:retrieve wrote 247 bytes to ~/.config/claude-grc/secrets/prod-db (sha256=...)
```

The confirmation does **not** include the secret value.

## Safety contract

This connector enforces three invariants for retrieval runs:

1. **No findings cache writes.** The retrieval branch short-circuits at the top of `main()` and never reaches the cache-writing helpers.
2. **No value in `runs.log`.** The retrieval manifest records `byte_size` and `sha256` of the artifact, not the value. Operators and auditors can verify *which* artifact was produced without storing the value.
3. **`--write-to` is restricted to `~/.config/claude-grc/secrets/`.** Any path that resolves outside that root — including `../` escapes and absolute paths like `/etc/cron.d/evil` — is rejected with exit 2 and a clear error. The parent directory is created with mode 0700; the destination file is created with mode 0600 (umask 077 enforced during the write).

The retrieval manifest in `runs.log` looks like:

```json
{"source":"aws-secrets-inspector","run_id":"20260620-...","mode":"retrieve","secret_name":"prod-db","version_id":"a1b2c3d4-...","version_stage":"AWSCURRENT","destination":"~/.config/claude-grc/secrets/prod-db","byte_size":247,"sha256":"...","exit_code":0}
```

## Exit codes

- `0` success
- `2` usage error (unknown flag, `--write-to` outside the permitted root)
- `2` auth failure (credentials invalid or expired)
- `3` rate-limited
- `5` config missing — run setup
- `6` secret not found in this account/region (or denied by the resource policy)

## Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": ["secretsmanager:GetSecretValue"], "Resource": "<secret-arn-or-*" /> },
    { "Effect": "Allow", "Action": ["kms:Decrypt"], "Resource": "<kms-key-arn>" }
  ]
}
```

For cross-account access, configure the standard AWS CLI profile chain in `~/.aws/config` and pass `--profile=<name>` (this connector does NOT implement `sts:AssumeRole` itself).

## Examples

```bash
# Default: AWSCURRENT to stdout
/aws-secrets-inspector:retrieve --retrieve=prod-db

# Previous version, captured into a 0600 file
/aws-secrets-inspector:retrieve --retrieve=prod-db --version-stage=AWSPREVIOUS \
  --write-to=~/.config/claude-grc/secrets/prod-db-prev

# Use in a CI step: pipe the JSON into a jq extractor
/aws-secrets-inspector:retrieve --retrieve=prod-db --quiet | jq -r .secret_string

# Cross-account via the profile chain
/aws-secrets-inspector:retrieve --retrieve=prod-db --profile=audit-target
```

## Why this is not a `secret get` replacement

This connector is a thin wrapper around `aws secretsmanager get-secret-value`. It adds two things the raw CLI does not:

- **A safety wrapper** that guarantees no value lands in the findings cache, `runs.log`, or stderr.
- **A restricted `--write-to`** that prevents the operator from accidentally writing the value to a world-readable file.

Operators who prefer the raw `aws` CLI for ad-hoc work can use it directly. Operators who need a CI-friendly secret source should use `/aws-secrets-inspector:retrieve` so the audit trail is consistent.