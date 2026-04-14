---
name: AWS Inspector Collect
description: Query AWS for compliance-relevant configuration across IAM, S3, CloudTrail, EBS, and emit findings conforming to the v1 contract.
---

# /aws-inspector:collect

Scans AWS for compliance-relevant resources and configurations. Emits one Finding document per evaluated resource (account-level, per-bucket, per-trail, etc.).

## How to run

```bash
node plugins/connectors/aws-inspector/scripts/collect.js [options]
```

## Arguments

- `--regions=<csv>` — regions to scan (default: the config's `default_region`; IAM + S3 + CloudTrail have global/multi-region considerations)
- `--services=<csv>` — subset of `iam,s3,cloudtrail,ebs` (default: all)
- `--profile=<name>` — override the configured AWS profile
- `--scope-file=<path>` — path to scope YAML file for production filtering (default: `config/scope.yaml` in plugin dir)
- `--tag-filter=<csv>` — inline tag filters as `key=value` pairs, e.g. `--tag-filter=env=production,team=platform`
- `--output=<fmt>` — `silent` | `summary` (default) | `json`
- `--refresh` — ignore cache; re-query AWS
- `--quiet` — no stderr progress

## What it evaluates

**Account-level (IAM)**:
| SCF | Check | Typical severity |
|---|---|---|
| IAC-01.1 | Root account has MFA | critical if missing |
| IAC-02 | Password policy meets baseline | high if missing |
| IAC-15.1 | No IAM users with access keys older than 90d | medium |
| IAC-15.1 | No IAM users with unused keys/passwords (>90d) | low |
| IAC-07.2 | No inline IAM policies on users (least privilege signal) | low |

**Storage (S3)**:
| SCF | Check | Severity |
|---|---|---|
| CRY-05 | Bucket default encryption | high if missing |
| DCH-01.2 | Public access block enforced | critical if missing |
| AST-05 | Versioning enabled on production buckets | medium |
| MON-01.2 | Server access logging enabled | medium |

**Audit (CloudTrail)**:
| SCF | Check | Severity |
|---|---|---|
| MON-02 | At least one multi-region, multi-account trail | high if missing |
| MON-02.1 | Log file validation enabled | medium |
| MON-02.2 | Trail events delivered to a monitored S3 bucket | medium |

**Compute (EBS)**:
| SCF | Check | Severity |
|---|---|---|
| CRY-05 | Default EBS encryption enabled per region | high if missing |

Future: RDS (encryption, backup), VPC flow logs, Security Hub findings, Config conformance packs, Guard​Duty enablement, SSM patch compliance, KMS key rotation.

## Output

- Writes `~/.cache/claude-grc/findings/aws-inspector/<run_id>.json` — array of Findings
- Appends a run manifest to `~/.cache/claude-grc/runs.log`
- One-line summary unless `--quiet`:
  ```
  aws-inspector: 24 resources, 87 evaluations, 9 failing (2 critical, 4 high, 3 medium).
  ```

## Exit codes

- `0` success
- `2` credentials invalid or expired
- `3` rate-limited (AWS throttling; retry later)
- `4` partial (some services inaccessible; report still written)
- `5` config missing — run setup

## Permissions

Minimum IAM policy for a read-only scan:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iam:GetAccountPasswordPolicy", "iam:GetAccountSummary",
        "iam:ListUsers", "iam:ListAccessKeys", "iam:GetLoginProfile", "iam:GetUser", "iam:ListMFADevices", "iam:ListUserPolicies", "iam:ListAttachedUserPolicies",
        "s3:ListAllMyBuckets", "s3:GetBucketEncryption", "s3:GetBucketPublicAccessBlock", "s3:GetBucketVersioning", "s3:GetBucketLogging", "s3:GetBucketLocation", "s3:GetBucketTagging",
        "sts:GetCallerIdentity",
        "cloudtrail:DescribeTrails", "cloudtrail:GetTrailStatus", "cloudtrail:GetEventSelectors",
        "ec2:GetEbsEncryptionByDefault"
      ],
      "Resource": "*"
    }
  ]
}
```

The AWS-managed `SecurityAudit` policy is a superset that also works.

## Examples

```bash
# Default region, all services
/aws-inspector:collect

# Multi-region scan
/aws-inspector:collect --regions=us-east-1,us-west-2,eu-west-1

# Just the storage story
/aws-inspector:collect --services=s3

# Alternate profile
/aws-inspector:collect --profile=audit-role

# Production only (tag filter)
/aws-inspector:collect --tag-filter=env=production

# Production only (scope file)
/aws-inspector:collect --scope-file=config/scope.yaml
```

## Production scoping

To scan only production resources, create or edit `config/scope.yaml` in the plugin directory:

```yaml
# Multi-account: scan dedicated production AWS accounts
profiles:
  - prod-us
  - prod-eu

# Tag filtering: only scan S3 buckets tagged env=production
tag_key: "env"
tag_value: "production"

# Restrict to production regions
regions:
  - us-east-1
  - eu-west-1

# Bucket name patterns (glob)
bucket_patterns:
  - prod-*
  - company-prod-*

# Exclude test buckets
bucket_exclude:
  - prod-test-*
```

```bash
# Use the default scope file
/aws-inspector:collect --scope-file=config/scope.yaml

# Or use inline tag filters without a scope file
/aws-inspector:collect --tag-filter=env=production

# Combine with other flags
/aws-inspector:collect --scope-file=config/scope.yaml --services=s3 --output=json
```

**Notes:**
- Tag filtering applies to S3 buckets only. IAM, EBS, and CloudTrail checks are account-level.
- Multi-profile mode resolves each profile's account ID via `sts:GetCallerIdentity`.
- When no scope file is active and no `--tag-filter` is passed, all resources are scanned (unchanged default).

## CI/CD usage

```bash
aws sso login --profile=audit
AWS_PROFILE=audit node plugins/connectors/aws-inspector/scripts/collect.js --quiet
node plugins/grc-engineer/scripts/gap-assessment.js FedRAMP-Moderate,SOC2 --sources=aws-inspector --output=sarif --quiet > aws-gap.sarif
```
