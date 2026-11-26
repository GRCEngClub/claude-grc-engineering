---
description: Generate implementation code for a security control
---

# Generate Implementation

Generates production-ready implementation code for a security control, including:

- Infrastructure as Code (Terraform)
- Automation scripts (Python, Bash)
- Monitoring dashboards
- Evidence collection scripts
- Documentation templates

## Usage

```bash
/grc-engineer:generate-implementation <control> <cloud-provider> [options]
```

## Arguments

- `$1` - Control ID or name (e.g., "access_control_account_management", "AC-2", "encryption_at_rest")
- `$2` - Cloud provider: `aws`, `azure`, `gcp`, or `kubernetes`
- `$3` - Output directory (optional, defaults to `./generated`)
- `$4` - Options (optional): `--terraform-only`, `--scripts-only`, `--with-tests`

## Examples

```bash
# Generate full implementation for AWS
/grc-engineer:generate-implementation access_control_account_management aws

# Generate for Azure with specific output directory
/grc-engineer:generate-implementation encryption_at_rest azure ./compliance/encryption

# Generate Terraform only for GCP
/grc-engineer:generate-implementation logging_and_monitoring gcp ./terraform --terraform-only

# Generate with tests for Kubernetes
/grc-engineer:generate-implementation network_security kubernetes ./k8s --with-tests
```

## Output Structure

```
generated/
├── terraform/
│   ├── main.tf              # Main Terraform configuration
│   ├── variables.tf         # Input variables
│   ├── outputs.tf           # Output values
│   ├── providers.tf         # Provider configuration
│   └── README.md            # Deployment instructions
├── scripts/
│   ├── deploy.sh            # Deployment automation
│   ├── evidence_collect.py  # Evidence collection
│   ├── compliance_test.py   # Compliance testing
│   └── remediate.py         # Automated remediation
├── monitoring/
│   ├── dashboard.json       # CloudWatch/Azure Monitor dashboard
│   └── alerts.yaml          # Alert configurations
└── docs/
    ├── IMPLEMENTATION.md    # Implementation guide
    ├── EVIDENCE.md          # Evidence collection procedures
    └── FRAMEWORKS.md        # Framework mappings
```

## Example Output

### Command

```bash
/grc-engineer:generate-implementation access_control_account_management aws ./compliance
```

### Generated Files

#### terraform/main.tf

```terraform
# Generated for: Access Control - Account Management
# Frameworks: NIST AC-2, ISO A.5.16, SOC2 CC6.1, PCI 8.2
# Cloud Provider: AWS
# Generated: 2025-01-15

# IAM Account Lifecycle Management
module "account_lifecycle" {
  source = "terraform-aws-modules/iam/aws//modules/iam-account"

  # Quarterly access reviews (exceeds the six-month minimum in PCI DSS 7.2.4)
  access_review_schedule = "rate(90 days)"

  # Automated detection of inactive users (90-day threshold)
  inactive_user_threshold_days = 90

  # Automated user deprovisioning
  auto_disable_inactive_users = true

  # Least privilege enforcement
  default_permissions_boundary = aws_iam_policy.least_privilege.arn

  # Audit logging
  enable_cloudtrail_logging = true
  cloudtrail_retention_days = 365  # 1 year for SOC2/PCI compliance

  tags = {
    Compliance = "SOC2,PCI-DSS,NIST-800-53,ISO-27001"
    Control    = "access_control_account_management"
    ManagedBy  = "Terraform"
  }
}

# IAM Access Analyzer for unused access detection
resource "aws_accessanalyzer_analyzer" "compliance" {
  analyzer_name = "compliance-access-analyzer"
  type          = "ACCOUNT"

  tags = {
    Compliance = "SOC2,NIST-800-53"
    Control    = "AC-2"
  }
}

# EventBridge rule for quarterly access reviews
resource "aws_cloudwatch_event_rule" "access_review" {
  name                = "quarterly-access-review"
  description         = "Trigger quarterly access review (PCI DSS 7.2.4 minimum: every six months)"
  schedule_expression = "rate(90 days)"

  tags = {
    Compliance = "PCI-DSS"
    Requirement = "8.1.4"
  }
}

resource "aws_cloudwatch_event_target" "access_review" {
  rule      = aws_cloudwatch_event_rule.access_review.name
  target_id = "AccessReviewLambda"
  arn       = aws_lambda_function.access_review.arn
}

# Lambda function for automated access reviews
resource "aws_lambda_function" "access_review" {
  filename      = "access_review.zip"
  function_name = "quarterly-access-review"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "access_review.handler"
  runtime       = "python3.11"
  timeout       = 300

  environment {
    variables = {
      SNS_TOPIC_ARN = aws_sns_topic.compliance_alerts.arn
      INACTIVE_DAYS = "90"
    }
  }

  tags = {
    Compliance = "SOC2,PCI-DSS,NIST-800-53"
  }
}

# SNS topic for compliance notifications
resource "aws_sns_topic" "compliance_alerts" {
  name = "compliance-alerts"

  tags = {
    Purpose = "Compliance notifications"
  }
}

# CloudTrail for audit logging
resource "aws_cloudtrail" "audit" {
  name                          = "compliance-audit-trail"
  s3_bucket_name               = aws_s3_bucket.audit_logs.id
  include_global_service_events = true
  is_multi_region_trail        = true
  enable_log_file_validation   = true

  event_selector {
    read_write_type           = "All"
    include_management_events = true
  }

  tags = {
    Compliance = "NIST-800-53,SOC2,PCI-DSS"
    Control    = "AU-2,AU-3"
  }
}

# S3 bucket for audit logs (1 year retention)
resource "aws_s3_bucket" "audit_logs" {
  bucket = "compliance-audit-logs-${data.aws_caller_identity.current.account_id}"

  tags = {
    Compliance = "PCI-DSS,SOC2"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "audit_logs" {
  bucket = aws_s3_bucket.audit_logs.id

  rule {
    id     = "retention"
    status = "Enabled"

    # Keep online for 6 months (exceeds PCI 3-month requirement)
    transition {
      days          = 180
      storage_class = "GLACIER"
    }

    # Total retention: 1 year (PCI/SOC2 requirement)
    expiration {
      days = 365
    }
  }
}

# S3 bucket encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "audit_logs" {
  bucket = aws_s3_bucket.audit_logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "audit_logs" {
  bucket = aws_s3_bucket.audit_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

data "aws_caller_identity" "current" {}
```

#### scripts/evidence_collect.py

```python
#!/usr/bin/env python3
"""
Evidence Collection: Access Control - Account Management
Frameworks: NIST AC-2, ISO A.5.16, SOC2 CC6.1, PCI 8.2
Generated: 2025-01-15
"""

import boto3
import json
from datetime import datetime, timedelta
import csv

class AccessControlEvidenceCollector:
    def __init__(self, output_dir='./evidence'):
        self.iam = boto3.client('iam')
        self.accessanalyzer = boto3.client('accessanalyzer')
        self.cloudtrail = boto3.client('cloudtrail')
        self.output_dir = output_dir
        self.timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

    def collect_all_evidence(self):
        """Collect all evidence artifacts"""
        print("Collecting Access Control Evidence...")

        evidence = {
            'timestamp': self.timestamp,
            'control': 'access_control_account_management',
            'frameworks': ['NIST AC-2', 'ISO A.5.16', 'SOC2 CC6.1', 'PCI 8.2'],
            'artifacts': []
        }

        # 1. IAM User Inventory
        users = self.collect_iam_users()
        evidence['artifacts'].append({
            'name': 'iam_users_inventory.json',
            'type': 'inventory',
            'count': len(users),
            'requirement': 'Unique user IDs (all frameworks)'
        })

        # 2. Credential Report
        cred_report = self.collect_credential_report()
        evidence['artifacts'].append({
            'name': 'iam_credential_report.csv',
            'type': 'credential_status',
            'requirement': 'Inactive account detection (PCI 8.2.6)'
        })

        # 3. Access Analyzer Findings
        findings = self.collect_access_analyzer_findings()
        evidence['artifacts'].append({
            'name': 'access_analyzer_findings.json',
            'type': 'unused_access',
            'count': len(findings),
            'requirement': 'Least privilege (SOC2 CC6.1)'
        })

        # 4. CloudTrail Account Activity
        activity = self.collect_account_activity()
        evidence['artifacts'].append({
            'name': 'cloudtrail_account_activity.json',
            'type': 'audit_trail',
            'requirement': 'Account management audit (NIST AU-2)'
        })

        # 5. Access Review Report
        review = self.generate_access_review_report(users, cred_report)
        evidence['artifacts'].append({
            'name': 'access_review_report.json',
            'type': 'access_review',
            'requirement': 'Access reviews at least every six months (PCI 7.2.4)'
        })

        # Save evidence manifest
        self.save_evidence_manifest(evidence)

        print(f"\nEvidence collection complete!")
        print(f"Artifacts: {len(evidence['artifacts'])}")
        print(f"Output: {self.output_dir}/")

        return evidence

    def collect_iam_users(self):
        """Collect IAM user inventory"""
        print("  - Collecting IAM users...")

        users = []
        paginator = self.iam.get_paginator('list_users')

        for page in paginator.paginate():
            for user in page['Users']:
                user_detail = {
                    'UserName': user['UserName'],
                    'UserId': user['UserId'],
                    'CreateDate': user['CreateDate'].isoformat(),
                    'Arn': user['Arn']
                }

                # Get user tags
                tags_response = self.iam.list_user_tags(UserName=user['UserName'])
                user_detail['Tags'] = tags_response.get('Tags', [])

                # Get attached policies
                policies = self.iam.list_attached_user_policies(UserName=user['UserName'])
                user_detail['AttachedPolicies'] = [
                    p['PolicyArn'] for p in policies['AttachedPolicies']
                ]

                # Get group memberships
                groups = self.iam.list_groups_for_user(UserName=user['UserName'])
                user_detail['Groups'] = [g['GroupName'] for g in groups['Groups']]

                users.append(user_detail)

        # Save to file
        filename = f"{self.output_dir}/iam_users_inventory_{self.timestamp}.json"
        with open(filename, 'w') as f:
            json.dump(users, f, indent=2)

        return users

    def collect_credential_report(self):
        """Generate and collect credential report"""
        print("  - Generating credential report...")

        # Generate report (may take up to 4 hours for first generation)
        self.iam.generate_credential_report()

        # Get report
        response = self.iam.get_credential_report()
        report_csv = response['Content'].decode('utf-8')

        # Save to file
        filename = f"{self.output_dir}/iam_credential_report_{self.timestamp}.csv"
        with open(filename, 'w') as f:
            f.write(report_csv)

        # Parse CSV for analysis
        import io
        reader = csv.DictReader(io.StringIO(report_csv))
        credentials = list(reader)

        return credentials

    def collect_access_analyzer_findings(self):
        """Collect Access Analyzer findings for unused access"""
        print("  - Collecting Access Analyzer findings...")

        findings = []

        # List analyzers
        analyzers = self.accessanalyzer.list_analyzers()

        for analyzer in analyzers['analyzers']:
            # Get findings
            paginator = self.accessanalyzer.get_paginator('list_findings')

            for page in paginator.paginate(analyzerArn=analyzer['arn']):
                findings.extend(page['findings'])

        # Save to file
        filename = f"{self.output_dir}/access_analyzer_findings_{self.timestamp}.json"
        with open(filename, 'w') as f:
            json.dump(findings, f, indent=2)

        return findings

    def collect_account_activity(self):
        """Collect CloudTrail events for account management"""
        print("  - Collecting CloudTrail account activity...")

        # Look back 90 days
        end_time = datetime.now()
        start_time = end_time - timedelta(days=90)

        events = []
        paginator = self.cloudtrail.get_paginator('lookup_events')

        # Filter for IAM account management events
        for page in paginator.paginate(
            LookupAttributes=[
                {'AttributeKey': 'ResourceType', 'AttributeValue': 'AWS::IAM::User'}
            ],
            StartTime=start_time,
            EndTime=end_time
        ):
            events.extend(page['Events'])

        # Save to file
        filename = f"{self.output_dir}/cloudtrail_account_activity_{self.timestamp}.json"
        with open(filename, 'w') as f:
            json.dump(events, f, indent=2, default=str)

        return events

    def generate_access_review_report(self, users, credentials):
        """Generate quarterly access review report"""
        print("  - Generating access review report...")

        report = {
            'review_date': datetime.now().isoformat(),
            'total_users': len(users),
            'inactive_users': [],
            'privileged_users': [],
            'compliance_issues': []
        }

        # Identify inactive users (90+ days)
        for cred in credentials:
            if cred['password_last_used'] != 'N/A':
                last_used = datetime.fromisoformat(cred['password_last_used'].replace('Z', '+00:00'))
                days_inactive = (datetime.now(last_used.tzinfo) - last_used).days

                if days_inactive > 90:
                    report['inactive_users'].append({
                        'username': cred['user'],
                        'days_inactive': days_inactive,
                        'action_required': 'Disable or justify retention'
                    })

        # Identify privileged users
        for user in users:
            for policy_arn in user.get('AttachedPolicies', []):
                if 'AdministratorAccess' in policy_arn:
                    report['privileged_users'].append(user['UserName'])

        # Compliance checks
        if report['inactive_users']:
            report['compliance_issues'].append({
                'severity': 'HIGH',
                'issue': f"{len(report['inactive_users'])} users inactive >90 days",
                'requirement': 'PCI-DSS 8.2.6',
                'action': 'Disable inactive accounts'
            })

        # Save to file
        filename = f"{self.output_dir}/access_review_report_{self.timestamp}.json"
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)

        return report

    def save_evidence_manifest(self, evidence):
        """Save evidence collection manifest"""
        filename = f"{self.output_dir}/evidence_manifest_{self.timestamp}.json"
        with open(filename, 'w') as f:
            json.dump(evidence, f, indent=2)

if __name__ == '__main__':
    import os
    import sys

    output_dir = sys.argv[1] if len(sys.argv) > 1 else './evidence'
    os.makedirs(output_dir, exist_ok=True)

    collector = AccessControlEvidenceCollector(output_dir)
    collector.collect_all_evidence()
```

#### docs/IMPLEMENTATION.md

```markdown
# Implementation Guide: Access Control - Account Management

**Control ID:** access_control_account_management
**Category:** Access Control
**Generated:** 2025-01-15

## Framework Compliance

This implementation satisfies requirements from:

- **NIST 800-53**: AC-2 (Account Management), AC-2(1-4)
- **ISO 27001**: A.5.16, A.5.18, A.8.2
- **SOC 2**: CC6.1, CC6.2, CC6.3
- **PCI-DSS**: 8.1, 8.1.1, 8.1.3, 8.1.4

## Architecture

### Components

1. **IAM Account Lifecycle Module**
   - Automated user provisioning/deprovisioning
   - Least privilege enforcement via permissions boundaries
   - Quarterly access reviews (90-day schedule)

2. **Access Analyzer**
   - Continuous detection of unused access
   - External access identification
   - Policy validation

3. **CloudTrail Audit Logging**
   - All account management events logged
   - 1-year retention (6 months online, 6 months archived)
   - Tamper-proof storage with S3 object lock

4. **Automated Access Reviews**
   - Lambda function triggered quarterly
   - Identifies inactive users (90+ days)
   - Generates compliance reports

## Deployment

### Prerequisites

- AWS CLI configured with appropriate credentials
- Terraform >= 1.0
- Python 3.11+

### Steps

1. **Initialize Terraform**
   ```bash
   cd terraform/
   terraform init
   ```

2. **Review Plan**

   ```bash
   terraform plan -out=tfplan
   ```

3. **Apply Configuration**

   ```bash
   terraform apply tfplan
   ```

4. **Deploy Lambda Functions**

   ```bash
   cd ../scripts/
   ./deploy.sh
   ```

5. **Verify Deployment**

   ```bash
   python compliance_test.py
   ```

## Configuration

### Terraform Variables

Edit `terraform/terraform.tfvars`:

```hcl
# Customize these values
access_review_schedule       = "rate(90 days)"  # PCI requirement
inactive_user_threshold_days = 90                # PCI 8.2.6
cloudtrail_retention_days    = 365               # 1 year for SOC2/PCI
```

### Conflict Resolutions

**Access Review Frequency:**

- SOC2: Risk-based (flexible)
- PCI-DSS: At least every six months (7.2.4)
- NIST: Annually minimum
- **Implementation:** Quarterly (90 days), which meets or exceeds every framework's minimum

**Inactive Account Threshold:**

- PCI-DSS: 90 days (mandatory)
- NIST: Organization-defined
- **Implementation:** 90 days to satisfy PCI

## Evidence Collection

Run automated evidence collection:

```bash
python scripts/evidence_collect.py ./evidence/2025-Q1
```

**Artifacts Generated:**

- IAM user inventory
- Credential report
- Access Analyzer findings
- CloudTrail account activity
- Quarterly access review report

## Compliance Testing

```bash
python scripts/compliance_test.py
```

**Tests:**

- ✓ Unique user IDs present
- ✓ Quarterly access reviews scheduled
- ✓ Inactive account detection enabled
- ✓ CloudTrail logging active
- ✓ Audit log retention = 365 days

## Maintenance

### Quarterly Tasks

1. Review access review reports
2. Disable/remove inactive accounts
3. Validate Access Analyzer findings
4. Update documentation

### Annual Tasks

1. Review and update IAM policies
2. Validate permissions boundaries
3. Update Terraform configurations
4. Renew auditor attestations

## Cost Estimate

- CloudTrail: ~$2/month
- S3 Storage (1 year): ~$5/month
- Lambda (quarterly): ~$0.20/month
- Access Analyzer: ~$0/month (free tier)

**Total:** ~$7.20/month

## Support

For issues or questions:

- Review logs: `aws logs tail /aws/lambda/quarterly-access-review`
- Check CloudTrail: CloudWatch Insights
- Contact: security-team@example.com

```

## Generated Output Summary

```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPLEMENTATION GENERATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Control: Access Control - Account Management
Cloud Provider: AWS
Output Directory: ./generated

FILES CREATED:

terraform/
  ✓ main.tf (300 lines) - Complete Terraform configuration
  ✓ variables.tf - Input variables
  ✓ outputs.tf - Output values
  ✓ providers.tf - AWS provider setup

scripts/
  ✓ evidence_collect.py (250 lines) - Automated evidence collection
  ✓ compliance_test.py - Compliance testing
  ✓ deploy.sh - Deployment automation

docs/
  ✓ IMPLEMENTATION.md - Complete implementation guide
  ✓ EVIDENCE.md - Evidence collection procedures
  ✓ FRAMEWORKS.md - Framework requirement mappings

FRAMEWORKS SATISFIED:
  ✓ NIST 800-53: AC-2, AC-2(1-4)
  ✓ ISO 27001: A.5.16, A.5.18, A.8.2
  ✓ SOC 2: CC6.1, CC6.2, CC6.3
  ✓ PCI-DSS: 7.2.4, 8.2.1, 8.2.5, 8.2.6

NEXT STEPS:

  1. Review generated code: cd ./generated
  2. Customize variables: edit terraform/terraform.tfvars
  3. Deploy: terraform init && terraform apply
  4. Collect evidence: python scripts/evidence_collect.py
  5. Run tests: python scripts/compliance_test.py

```

## Related Commands

- `/grc-engineer:map-controls-unified` - Understand cross-framework mappings
- `/grc-engineer:scan-iac` - Scan existing infrastructure
- `/grc-engineer:collect-evidence` - Manual evidence collection
- `/grc-engineer:optimize-multi-framework` - Optimization roadmap
