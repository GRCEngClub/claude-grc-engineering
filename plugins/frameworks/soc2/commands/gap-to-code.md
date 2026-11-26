---
description: Convert SOC 2 gap analysis findings to Infrastructure as Code fixes
---

# SOC 2 Gap-to-Code Generator

Analyzes SOC 2 gap assessment results and generates production-ready Infrastructure as Code (Terraform, CloudFormation, Kubernetes) to remediate identified gaps automatically.

## Usage

```bash
/soc2:gap-to-code <gap-file> <cloud-provider> [options]
```

## Arguments

- `$1` - Gap analysis file (JSON output from `/soc2:assess`)
- `$2` - Cloud provider: "aws", "azure", "gcp", "kubernetes", or "multi-cloud"
- `$3` - Options (optional): `--output-dir=path`, `--format=terraform|cloudformation`, `--apply`

## Examples

```bash
# Generate Terraform for AWS gaps
/soc2:assess security type2 --output=json > gaps.json
/soc2:gap-to-code gaps.json aws --output-dir=./remediation

# Generate CloudFormation
/soc2:gap-to-code gaps.json aws --format=cloudformation

# Multi-cloud remediation
/soc2:gap-to-code gaps.json multi-cloud --output-dir=./iac

# Dry-run mode (default)
/soc2:gap-to-code gaps.json aws

# Actually apply fixes (DANGEROUS - review first!)
/soc2:gap-to-code gaps.json aws --apply
```

## Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOC 2 GAP-TO-CODE REMEDIATION GENERATOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Input: gaps.json
Cloud Provider: AWS
Output Format: Terraform
Output Directory: ./remediation
Mode: DRY RUN (review before applying)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GAP ANALYSIS SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Gaps: 12
  🔴 High Severity: 3 (remediable via IaC)
  🟡 Medium Severity: 5 (remediable via IaC)
  🔵 Low Severity: 2 (remediable via IaC)
  ⚠ Manual: 2 (require policy/process changes)

Automated Remediation: 10/12 gaps (83%)
Estimated Time to Fix: 2.5 hours (manual review + terraform apply)
Estimated Cost Impact: +$45/month (additional AWS resources)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GENERATED INFRASTRUCTURE AS CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Files Created:
✓ ./remediation/main.tf (450 lines)
✓ ./remediation/variables.tf (85 lines)
✓ ./remediation/outputs.tf (42 lines)
✓ ./remediation/versions.tf (12 lines)
✓ ./remediation/README.md (comprehensive deployment guide)
✓ ./remediation/test_plan.md (validation steps)

Modules Created:
✓ ./remediation/modules/encryption/
✓ ./remediation/modules/logging/
✓ ./remediation/modules/access_control/
✓ ./remediation/modules/monitoring/

Scripts Created:
✓ ./remediation/scripts/validate_remediation.sh
✓ ./remediation/scripts/collect_evidence.sh
✓ ./remediation/scripts/rollback.sh

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REMEDIATIONS BY CONTROL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1] CC6.7 - Encryption at Rest (HIGH PRIORITY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gap Description:
  3 S3 buckets lack encryption at rest
  Buckets: legacy-backups-2019, temp-storage-dev, logs-archive-old
  Risk: Data exposure if bucket accessed without authorization
  SOC 2 Requirement: CC6.7 (encryption protects data)

Remediation Type: AUTOMATED
Effort: 5 minutes (terraform apply)
Cost Impact: $0/month (S3 encryption is free)

Generated Code: ./remediation/modules/encryption/s3_encryption.tf
```terraform
# Remediation for CC6.7 - S3 Encryption at Rest
# Satisfies: SOC 2 CC6.7, PCI-DSS 3.5.1, NIST SC-28

resource "aws_s3_bucket_server_side_encryption_configuration" "legacy_backups" {
  bucket = "legacy-backups-2019"

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "AES256"
      # Alternative: Use KMS for customer-managed keys
      # sse_algorithm     = "aws:kms"
      # kms_master_key_id = aws_kms_key.s3_encryption.arn
    }
    bucket_key_enabled = true  # Reduces KMS costs
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "temp_storage" {
  bucket = "temp-storage-dev"

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "logs_archive" {
  bucket = "logs-archive-old"

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# Optional: Enforce encryption via bucket policy
resource "aws_s3_bucket_policy" "enforce_encryption" {
  for_each = toset([
    "legacy-backups-2019",
    "temp-storage-dev",
    "logs-archive-old"
  ])

  bucket = each.value

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "DenyUnencryptedObjectUploads"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:PutObject"
        Resource  = "arn:aws:s3:::${each.value}/*"
        Condition = {
          StringNotEquals = {
            "s3:x-amz-server-side-encryption" = "AES256"
          }
        }
      }
    ]
  })
}
```

Validation Steps:

```bash
# After applying, verify encryption
aws s3api get-bucket-encryption --bucket legacy-backups-2019
aws s3api get-bucket-encryption --bucket temp-storage-dev
aws s3api get-bucket-encryption --bucket logs-archive-old

# Expected output: "AES256" encryption enabled
```

Evidence Collection:

```bash
# Collect evidence for auditor
aws s3api get-bucket-encryption --bucket legacy-backups-2019 > evidence/cc6-7-encryption.json
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2] CC7.2 - Audit Log Retention (HIGH PRIORITY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gap Description:
  CloudTrail logs retained for 90 days (should be 365 days)
  Current retention: 90 days
  Required: 1 year (SOC 2, PCI-DSS)
  Risk: Cannot investigate incidents >90 days old

Remediation Type: AUTOMATED
Effort: 2 minutes (terraform apply)
Cost Impact: +$12/month (additional S3 storage + Glacier)

Generated Code: ./remediation/modules/logging/cloudtrail_retention.tf

```terraform
# Remediation for CC7.2 - Audit Log Retention
# Satisfies: SOC 2 CC7.2/CC7.3, PCI-DSS 10.5.1, NIST AU-11

# Update CloudWatch Logs retention
resource "aws_cloudwatch_log_group" "cloudtrail" {
  name              = "/aws/cloudtrail/organization-trail"
  retention_in_days = 365  # Changed from 90 to 365 days

  kms_key_id = aws_kms_key.cloudwatch_encryption.arn

  tags = {
    Compliance = "SOC2-CC7.2,PCI-10.7,NIST-AU-11"
    Purpose    = "Audit trail retention"
  }
}

# S3 bucket lifecycle for long-term archival
resource "aws_s3_bucket_lifecycle_configuration" "cloudtrail_archive" {
  bucket = "cloudtrail-logs-production"

  rule {
    id     = "audit_log_retention"
    status = "Enabled"

    # Transition to cheaper storage after 90 days
    transition {
      days          = 90
      storage_class = "STANDARD_IA"  # Infrequent Access
    }

    # Move to Glacier after 180 days (rarely accessed)
    transition {
      days          = 180
      storage_class = "GLACIER"
    }

    # Delete after 2 years (retain 1 year + 1 year buffer)
    expiration {
      days = 730
    }
  }

  rule {
    id     = "incomplete_multipart_upload_cleanup"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# Enable S3 Object Lock for compliance (prevents deletion)
resource "aws_s3_bucket_object_lock_configuration" "cloudtrail_lock" {
  bucket = "cloudtrail-logs-production"

  rule {
    default_retention {
      mode = "GOVERNANCE"  # Allows deletion with special permissions
      days = 365
    }
  }
}
```

Validation Steps:

```bash
# Verify CloudWatch retention
aws logs describe-log-groups --log-group-name-prefix "/aws/cloudtrail" \
  --query 'logGroups[*].[logGroupName,retentionInDays]'

# Verify S3 lifecycle policy
aws s3api get-bucket-lifecycle-configuration --bucket cloudtrail-logs-production

# Check Object Lock configuration
aws s3api get-object-lock-configuration --bucket cloudtrail-logs-production
```

Evidence Collection:

```bash
# Collect retention configuration evidence
aws logs describe-log-groups --log-group-name-prefix "/aws/cloudtrail" > evidence/cc7-2-retention.json
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[3] CC6.1 - Automated Access Reviews (MEDIUM PRIORITY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gap Description:
  Access reviews performed manually (should be automated)
  Current: Manual quarterly reviews via spreadsheet
  Required: Automated access review workflow
  Risk: Human error, incomplete reviews

Remediation Type: AUTOMATED
Effort: 15 minutes (deploy Lambda + EventBridge)
Cost Impact: +$2/month (Lambda executions)

Generated Code: ./remediation/modules/access_control/automated_access_review.tf

```terraform
# Remediation for CC6.1 - Automated Access Reviews
# Satisfies: SOC 2 CC6.1, PCI-DSS 7.2.4, NIST AC-2

# Lambda function for automated access reviews
resource "aws_lambda_function" "access_review" {
  filename      = "access_review.zip"
  function_name = "soc2-quarterly-access-review"
  role          = aws_iam_role.access_review_lambda.arn
  handler       = "index.handler"
  runtime       = "python3.11"
  timeout       = 300  # 5 minutes

  environment {
    variables = {
      REVIEW_OUTPUT_BUCKET = aws_s3_bucket.compliance_evidence.id
      SLACK_WEBHOOK_URL    = var.slack_webhook_url
      REVIEW_SCHEDULE      = "QUARTERLY"
    }
  }

  tags = {
    Compliance = "SOC2-CC6.1,PCI-8.1.4"
  }
}

# EventBridge rule for quarterly execution
resource "aws_cloudwatch_event_rule" "quarterly_access_review" {
  name                = "soc2-quarterly-access-review"
  description         = "Trigger quarterly access review (SOC 2 CC6.1)"
  schedule_expression = "cron(0 9 1 */3 *)"  # 9 AM on 1st day of Jan, Apr, Jul, Oct

  tags = {
    Compliance = "SOC2-CC6.1"
  }
}

resource "aws_cloudwatch_event_target" "trigger_access_review" {
  rule      = aws_cloudwatch_event_rule.quarterly_access_review.name
  target_id = "AccessReviewLambda"
  arn       = aws_lambda_function.access_review.arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.access_review.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.quarterly_access_review.arn
}

# IAM role for Lambda
resource "aws_iam_role" "access_review_lambda" {
  name = "soc2-access-review-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy for access review
resource "aws_iam_role_policy" "access_review_policy" {
  name = "access-review-permissions"
  role = aws_iam_role.access_review_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "iam:ListUsers",
          "iam:ListGroups",
          "iam:ListRoles",
          "iam:GetUser",
          "iam:GetLoginProfile",
          "iam:ListAccessKeys",
          "iam:ListMFADevices",
          "iam:GetCredentialReport",
          "iam:GenerateCredentialReport"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl"
        ]
        Resource = "${aws_s3_bucket.compliance_evidence.arn}/access-reviews/*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# S3 bucket for evidence storage
resource "aws_s3_bucket" "compliance_evidence" {
  bucket = "soc2-compliance-evidence-${data.aws_caller_identity.current.account_id}"

  tags = {
    Compliance = "SOC2-Evidence-Storage"
  }
}

resource "aws_s3_bucket_versioning" "evidence_versioning" {
  bucket = aws_s3_bucket.compliance_evidence.id

  versioning_configuration {
    status = "Enabled"
  }
}
```

Lambda Code: ./remediation/modules/access_control/access_review.py

```python
import boto3
import json
import csv
from datetime import datetime, timedelta
from io import StringIO
import urllib3

def handler(event, context):
    """
    Automated quarterly access review for SOC 2 CC6.1

    Generates:
    - List of all IAM users
    - Last login dates
    - MFA status
    - Inactive users (>90 days)
    - Users with admin privileges
    """
    iam = boto3.client('iam')
    s3 = boto3.client('s3')

    # Generate credential report
    iam.generate_credential_report()

    # Wait for report (usually <10 seconds)
    import time
    time.sleep(10)

    # Get credential report
    response = iam.get_credential_report()
    report_csv = response['Content'].decode('utf-8')

    # Parse CSV
    csv_reader = csv.DictReader(StringIO(report_csv))
    users = list(csv_reader)

    # Analyze users
    inactive_users = []
    no_mfa_users = []
    admin_users = []

    for user in users:
        username = user['user']

        # Check last login
        last_login = user.get('password_last_used', 'N/A')
        if last_login != 'N/A' and last_login != 'no_information':
            last_login_date = datetime.strptime(last_login, '%Y-%m-%dT%H:%M:%S+00:00')
            if datetime.now() - last_login_date > timedelta(days=90):
                inactive_users.append({
                    'username': username,
                    'last_login': last_login,
                    'days_inactive': (datetime.now() - last_login_date).days
                })

        # Check MFA
        if user['mfa_active'] == 'false':
            no_mfa_users.append(username)

    # Generate report
    report = {
        'review_date': datetime.now().isoformat(),
        'quarter': f"{datetime.now().year}-Q{(datetime.now().month-1)//3 + 1}",
        'total_users': len(users),
        'inactive_users': len(inactive_users),
        'no_mfa_users': len(no_mfa_users),
        'compliance_status': 'PASS' if len(inactive_users) == 0 and len(no_mfa_users) == 0 else 'FAIL',
        'details': {
            'inactive_users_list': inactive_users,
            'no_mfa_users_list': no_mfa_users
        }
    }

    # Save to S3
    bucket = os.environ['REVIEW_OUTPUT_BUCKET']
    key = f"access-reviews/{datetime.now().year}/Q{(datetime.now().month-1)//3 + 1}-access-review.json"

    s3.put_object(
        Bucket=bucket,
        Key=key,
        Body=json.dumps(report, indent=2),
        ContentType='application/json'
    )

    # Send Slack notification
    slack_webhook = os.environ.get('SLACK_WEBHOOK_URL')
    if slack_webhook:
        http = urllib3.PoolManager()
        slack_message = {
            'text': f"📋 Quarterly Access Review Complete\\n"
                   f"Total Users: {len(users)}\\n"
                   f"Inactive (>90 days): {len(inactive_users)}\\n"
                   f"Missing MFA: {len(no_mfa_users)}\\n"
                   f"Status: {report['compliance_status']}"
        }
        http.request('POST', slack_webhook,
                    body=json.dumps(slack_message),
                    headers={'Content-Type': 'application/json'})

    return {
        'statusCode': 200,
        'body': json.dumps(report)
    }
```

Deployment Steps:

```bash
# Package Lambda function
cd remediation/modules/access_control
zip access_review.zip access_review.py

# Apply Terraform
terraform init
terraform plan
terraform apply

# Test Lambda manually
aws lambda invoke --function-name soc2-quarterly-access-review response.json
cat response.json
```

Validation Steps:

```bash
# Verify EventBridge rule
aws events describe-rule --name soc2-quarterly-access-review

# Verify Lambda permissions
aws lambda get-policy --function-name soc2-quarterly-access-review

# Check S3 evidence bucket
aws s3 ls s3://soc2-compliance-evidence-*/access-reviews/
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANUAL REMEDIATIONS (NOT AUTOMATABLE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[11] CC1.3 - Dedicated GRC Resource (MANUAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gap: No dedicated GRC/compliance resource
Action Required:
  □ Write job description
  □ Post job listing
  □ Interview candidates
  □ Make offer

Timeline: Q1 2025
Owner: CISO

[12] CC4.2 - Management Review Process (MANUAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gap: Management reviews not documented
Action Required:
  □ Schedule quarterly management review meetings
  □ Create review agenda template
  □ Document review process
  □ Collect meeting minutes as evidence

Timeline: Immediate (before Q1 2025 review)
Owner: CISO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEPLOYMENT PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 1: High Priority (Deploy This Week)
□ CC6.7 - S3 encryption (5 minutes)
□ CC7.2 - Audit log retention (2 minutes)
□ Test and validate

Phase 2: Medium Priority (Deploy Within 2 Weeks)
□ CC6.1 - Automated access reviews (15 minutes)
□ CC7.1 - GuardDuty enablement (10 minutes)
□ CC7.4 - CloudWatch alarms (20 minutes)

Phase 3: Low Priority (Deploy Within 1 Month)
□ CC8.1 - Change management automation
□ CC6.6 - Password policy enforcement
□ CC9.1 - Vendor risk automation

Phase 4: Validation (After All Deployments)
□ Run automated control tests: /grc-engineer:test-control ALL
□ Generate new TSC matrix: /soc2:generate-tsc-matrix all
□ Verify 100% implementation
□ Collect evidence

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROLLBACK PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All remediations are implemented via Terraform, making rollback simple:

```bash
# View changes before applying
terraform plan

# Apply changes
terraform apply

# If issues occur, rollback
terraform destroy -target=module.encryption
terraform destroy -target=module.logging
terraform destroy -target=module.access_control

# Or rollback entire remediation
cd remediation
terraform destroy
```

Terraform state is backed up to S3 with versioning enabled.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COST ESTIMATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Monthly Recurring Costs:
  S3 additional storage (log retention):     $12/month
  Lambda executions (access reviews):         $2/month
  CloudWatch Logs retention:                  $8/month
  KMS key usage:                              $1/month
  GuardDuty (if not enabled):               $30/month (varies)

Total Estimated Increase: $45-75/month

One-Time Costs:
  Engineering time (deployment):         4 hours ($600)
  Testing and validation:                2 hours ($300)

Total One-Time: $900

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Review generated Terraform code
2. Customize variables (bucket names, retention periods, etc.)
3. Run terraform plan to preview changes
4. Deploy Phase 1 (high priority) remediations
5. Validate using /grc-engineer:test-control
6. Generate updated TSC matrix: /soc2:generate-tsc-matrix
7. Collect evidence for remediated controls
8. Continue with Phase 2 and 3 deployments

```

## Integration Workflow

### Complete Remediation Workflow
```bash
# Step 1: Assess current state
/soc2:assess security type2 --output=json > gaps.json

# Step 2: Generate remediation code
/soc2:gap-to-code gaps.json aws --output-dir=./remediation

# Step 3: Review generated code
cd remediation
cat README.md
terraform plan

# Step 4: Apply fixes
terraform apply

# Step 5: Test controls
/grc-engineer:test-control ALL

# Step 6: Generate updated matrix
/soc2:generate-tsc-matrix security table

# Step 7: Collect evidence
/soc2:evidence-checklist CC6.7
/grc-engineer:collect-evidence CC6.7 ./evidence
```

## Cloud Provider Support

### AWS (Primary)

- Terraform modules for IAM, S3, CloudTrail, CloudWatch, Lambda
- AWS CLI commands for validation
- boto3 Python scripts for automation

### Azure (Supported)

- Terraform azurerm provider
- Entra ID, Key Vault, Monitor, Storage
- az-cli validation commands

### GCP (Supported)

- Terraform google provider
- Cloud IAM, Cloud Storage, Cloud Logging
- gcloud validation commands

### Multi-Cloud (Advanced)

- Generates IaC for all providers simultaneously
- Cross-cloud control mapping
- Unified evidence collection

## Related Commands

- `/soc2:assess` - Identify gaps requiring remediation
- `/soc2:generate-tsc-matrix` - See implementation status before/after
- `/soc2:evidence-checklist` - Evidence requirements for remediated controls
- `/grc-engineer:test-control` - Validate remediation effectiveness
- `/grc-engineer:generate-implementation` - More detailed code generation
- `/grc-engineer:scan-iac` - Scan for compliance violations
