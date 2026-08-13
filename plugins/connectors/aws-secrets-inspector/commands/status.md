---
name: AWS Secrets Inspector Status
description: Report configuration state, credential validity, and last-run freshness for aws-secrets-inspector.
---

# /aws-secrets-inspector:status

Non-destructive health check. Shows whether the connector is configured, whether credentials still work, whether `secretsmanager:ListSecrets` resolves, whether the secrets directory is at mode 0700, and when the connector last produced findings.

## How to run

```bash
bash plugins/connectors/aws-secrets-inspector/scripts/status.sh
```

## Output

```
aws-secrets-inspector
  aws:             /opt/homebrew/bin/aws 2.15.1
  account:         123456789012
  caller:          arn:aws:iam::123456789012:role/SecurityAudit
  default region:  us-east-1
  profile:         audit
  config:          ~/.config/claude-grc/connectors/aws-secrets-inspector.yaml
  secrets dir:     ~/.config/claude-grc/secrets (mode 700)
  list-secrets:    ok (sample 1 secret(s) visible)
  status:          ready
  last run:        3h ago (run_id 20260413-a1b2c3d4)
  cached:          12 resources, 48 evaluations
```

## Status values

- `ready` — all systems go; credentials resolve, list-secrets resolves, cache is fresh (< 7 days)
- `not-configured` — setup not run
- `credentials-expired` — STS call fails; refresh SSO or rotate keys
- `stale` — last run > 7 days
- `no-cache` — configured but no runs yet
- `aws-not-installed` — the `aws` CLI is missing

## What the `list-secrets` line means

`/aws-secrets-inspector:status` runs `aws secretsmanager list-secrets --max-results 1` to confirm the IAM action resolves. If it returns `denied`, the line says so and notes that **retrieve mode may still work** if the role has `secretsmanager:GetSecretValue` but lacks `ListSecrets` — a common least-privilege split. The connector does NOT fail on this line; it surfaces the gap for the operator to act on.

The secrets directory mode is reported from `stat` output. If the mode is anything other than `700` (or `0700` octal), the operator should run `/aws-secrets-inspector:setup` again to restore it.