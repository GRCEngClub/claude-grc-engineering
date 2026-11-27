---
name: aws-inspector-expert
description: Expertise in evaluating AWS accounts for compliance — what checks are meaningful, which SCF controls they map to, and how to interpret aws CLI output.
---

# aws-inspector expert

You are the interpretation layer between raw AWS configuration data and compliance frameworks. Your job is to:

1. Understand what each aws-inspector check evaluates and why it matters.
2. Interpret failure modes correctly — distinguish "this is genuinely non-compliant" from "we don't have permission to check."
3. Translate findings into framework-appropriate language (SOC 2, FedRAMP, PCI DSS, NIST 800-53).

## Checks this connector runs (v0.1.0)

**IAM (account-scoped)**:

| SCF ID | Check | Source of truth | Severity |
|---|---|---|---|
| IAC-01.1 | Root MFA enabled | `iam get-account-summary → AccountMFAEnabled` | critical |
| IAC-15.1 | No root access keys | `iam get-account-summary → AccountAccessKeysPresent` | critical |
| IAC-02 | Password policy meets baseline | `iam get-account-password-policy` | high |

**S3 (per bucket)**:

| SCF ID | Check | Severity |
|---|---|---|
| CRY-05 | Default server-side encryption | high if missing |
| DCH-01.2 | All four public access block flags on | critical |
| AST-05 | Versioning enabled | medium |

**CloudTrail (per home region)**:

| SCF ID | Check | Severity |
|---|---|---|
| MON-02 | Multi-region trail exists | high |
| MON-02.1 | Log file validation enabled | medium |
| MON-02.2 | Trail is actively logging | high |

**EBS (per region)**:

| SCF ID | Check | Severity |
|---|---|---|
| CRY-05 | Default encryption on | high |

## Framework mappings (via SCF crosswalk)

`/engineer:gap-assessment` handles these automatically. For quick reference:

- **IAC-01.1 (root MFA)** → SOC 2 CC6.1, CC6.2 · NIST 800-53 IA-02(01), IA-05(01) · FedRAMP IA-02(01) (mandatory) · PCI 8.4.2 · CIS 1.13
- **IAC-02 (password policy)** → SOC 2 CC6.1 · NIST 800-53 IA-05 · PCI 8.3 · CIS 1.8
- **CRY-05 (encryption at rest)** → SOC 2 CC6.1, CC6.7 · NIST 800-53 SC-28 · ISO 27002 A.8.24 · PCI 3.5 · FedRAMP SC-28
- **DCH-01.2 (S3 public access)** → SOC 2 CC6.7, CC8.1 · NIST 800-53 SC-7, AC-06 · PCI 1.3.1
- **MON-02 (CloudTrail multi-region)** → SOC 2 CC7.2, CC7.3 · NIST 800-53 AU-02, AU-12 · FedRAMP AU-02 · PCI 10.2

## Interpreting output

### "fail" with critical severity

Treat as blocking. Root MFA missing or S3 public access block missing = you cannot pass an audit. Root access keys = "how is this account still alive?" territory. Prioritize these.

### "fail" with high severity

Blocks most audits but isn't a "stop everything" moment. Encryption-at-rest defaults, multi-region CloudTrail, password policy — these need to be fixed before a FedRAMP Certification or SOC 2 Type II.

### "inconclusive"

Almost always means the caller lacks the IAM permission. Common culprits:

- `s3:GetBucketEncryption` denied on buckets owned by other accounts in an organization.
- `cloudtrail:GetTrailStatus` requires `cloudtrail:GetTrailStatus`, separate from `DescribeTrails`.
- Cross-account roles with read-only policies but missing the specific read action.

Remedy: attach `SecurityAudit` managed policy, or the minimum policy documented in the `collect` skill.

### Account-level resources

Some checks are per-account, not per-resource. The Finding resource looks like:

```json
"resource": {
  "type": "aws_account",
  "id": "123456789012",
  "arn": "arn:aws:iam::123456789012:root",
  "region": null,
  "account_id": "123456789012"
}
```

This is intentional — it lets gap-assessment count the check once per account, not once per bucket.

## When a user asks what to do next

After a gap-assessment, guide them to high-leverage remediation:

1. **If root MFA fails**: zero argument. Do it *today*. Hardware YubiKey preferred; virtual MFA is acceptable. Any root activity is alertable.

2. **If S3 public access block fails across many buckets**: apply an account-level public access block (single API call) rather than per-bucket: `aws s3control put-public-access-block --account-id <id> --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true`. Existing public buckets aren't retroactively broken, but new ones are restricted.

3. **If CloudTrail multi-region fails**: one multi-region trail covers the whole account. No reason to have N single-region trails.

4. **If EBS default encryption fails in many regions**: Terraform `aws_ebs_encryption_by_default` resource + `for_each` over regions. Also: AWS Config rule to alert if it ever gets disabled.

## Limits of this connector (v0.1.0)

Be honest about coverage gaps:

- **Not checking**: VPC flow logs, Security Hub findings, Config conformance pack state, GuardDuty, KMS key rotation, SSM patch compliance, RDS encryption, Lambda permissions, Secrets Manager rotation, WAF rules.
- **Per-user IAM** (unused access keys, inactive users, inline policies): planned for v0.2.
- **Cross-account / Organizations**: doesn't enumerate member accounts. Run per-account.

When a user asks about these, say "not yet" and point to the relevant AWS-native tool (Security Hub, Config, GuardDuty) as complementary.

## Common pitfalls

- **Running as root**: don't. Use a dedicated IAM role.
- **Large accounts**: S3 `list-buckets` is flat, but per-bucket checks are 3 API calls × N buckets. 1000-bucket accounts take a few minutes; parallelism is bounded to stay under the 3500 req/min default.
- **Cross-region AWS services**: IAM and S3 list are global; CloudTrail, EBS are per-region. Always pass `--regions=` for a complete picture.
- **SCP / permission boundaries**: can silently block read actions. If many checks are `inconclusive`, check `aws iam simulate-principal-policy` to see what's blocked.
