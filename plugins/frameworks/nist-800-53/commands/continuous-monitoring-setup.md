---
description: Set up NIST 800-53 continuous monitoring per RA-5, SI-4, and CA-7
---

# NIST 800-53 Continuous Monitoring Setup

Establishes comprehensive continuous monitoring program compliant with NIST 800-53 requirements (RA-5, SI-4, CA-7), including vulnerability scanning, security event monitoring, configuration management, and automated reporting for FedRAMP and other authorizations.

## Usage

```bash
/nist:continuous-monitoring-setup [program-type] [options]
```

## Arguments

- Argument 1 - Program type (optional): "fedramp", "fisma", "standard" (default: "standard")
- Argument 2 - Options (optional): `--environment=cloud|hybrid`, `--auto-deploy`, `--skip-fedramp-reports`

## Examples

```bash
# Set up standard NIST 800-53 continuous monitoring
/nist:continuous-monitoring-setup standard

# Set up FedRAMP continuous monitoring (monthly reports)
/nist:continuous-monitoring-setup fedramp

# Auto-deploy monitoring stack
/nist:continuous-monitoring-setup fedramp --auto-deploy

# Cloud-only monitoring (skip on-prem tools)
/nist:continuous-monitoring-setup standard --environment=cloud
```

## Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NIST 800-53 CONTINUOUS MONITORING SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Program Type: FedRAMP Continuous Monitoring
Environment: Cloud (AWS)
Compliance Requirements:
  - NIST 800-53 Rev 5
  - FedRAMP Moderate Baseline
  - Monthly deliverables to FedRAMP PMO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1: VULNERABILITY SCANNING (RA-5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NIST Requirement:
  RA-5: The organization scans for vulnerabilities in the information system
        and hosted applications [Assignment: organization-defined frequency
        and/or randomly in accordance with organization-defined process].

  RA-5(1): Employ vulnerability scanning tools that include the capability to
           readily update the list of information system vulnerabilities.

  RA-5(2): Update the list of information system vulnerabilities scanned prior
           to a new scan.

  RA-5(5): Implement privileged access authorization to [Assignment:
           organization-defined information system components] for selected
           vulnerability scanning activities.

FedRAMP Requirement:
  - Monthly vulnerability scans (authenticated/credentialed)
  - All assets must be scanned
  - Report submitted to FedRAMP within 30 days
  - POA&M for any findings >30 days old

Implementation:

Step 1: Deploy Vulnerability Scanning Tool

  Option A: Amazon Inspector (AWS Native - RECOMMENDED)
    ✓ Pros: Native integration, agent-based, continuous scanning
    ✓ Cons: AWS-only, requires SSM agent

    Deployment:
    ```bash
    # Enable Inspector in all regions
    aws inspector2 enable --resource-types EC2 ECR LAMBDA

    # Deploy SSM agent to EC2 instances
    aws ssm create-association \
      --name "AWS-ConfigureAWSPackage" \
      --targets "Key=instanceids,Values=*" \
      --parameters '{"action":["Install"],"name":["AmazonInspector"]}'

    # Configure automated findings export
    aws inspector2 create-findings-report \
      --report-format JSON \
      --s3-destination bucketName=compliance-reports
    ```

    Cost: \$0.09/instance/month + \$0.01/scan for Lambda

  Option B: Tenable.io (Industry Standard)
    ✓ Pros: FedRAMP authorized, comprehensive coverage, widely accepted by 3PAOs
    ✓ Cons: Additional cost, requires credential management

    Deployment:
    ```bash
    # Deploy Tenable Cloud Connector
    # (Terraform module provided)
    terraform apply -target=module.tenable_connector
    ```

    Cost: \$2,500/year (up to 65 assets)

  Option C: Qualys VMDR
    ✓ Pros: FedRAMP authorized, cloud agent-based, dashboard
    ✓ Cons: Cost

    Cost: \$1,995/year (up to 100 assets)

  RECOMMENDATION: Use Inspector for continuous scanning + Tenable for monthly
                  FedRAMP scans (3PAO accepts Tenable reports)

Step 2: Configure Authenticated Scanning (RA-5(5))

  AWS Inspector:
    - Uses SSM agent (already has credentialed access)
    - Automatically scans packages, network reachability, CVEs
    - No additional credential configuration needed

  Tenable:
    - Create read-only IAM user: tenable-scanner
    - Grant permissions: ec2:Describe*, ssm:Describe*, rds:Describe*
    - Store credentials in Tenable Cloud

    ```bash
    # Create scanner IAM user
    aws iam create-user --user-name tenable-scanner
    aws iam attach-user-policy --user-name tenable-scanner \
      --policy-arn arn:aws:iam::aws:policy/SecurityAudit

    # Create access key (store securely in Tenable)
    aws iam create-access-key --user-name tenable-scanner
    ```

Step 3: Schedule Monthly Scans (FedRAMP Requirement)

  EventBridge Rule: monthly-vulnerability-scan
    - Schedule: First Monday of each month, 2 AM UTC
    - Target: Lambda function → trigger Tenable scan
    - Notification: Email to security team when scan starts

    ```bash
    aws events put-rule \
      --name monthly-vulnerability-scan \
      --schedule-expression "cron(0 2 ? * 2#1 *)" \
      --description "Monthly FedRAMP vuln scan"

    aws events put-targets \
      --rule monthly-vulnerability-scan \
      --targets "Id"="1","Arn"="<lambda-arn>"
    ```

Step 4: Automated Vulnerability Remediation

  Critical/High Vulnerabilities:
    - Automated patching via SSM Patch Manager
    - Patch within 30 days (FedRAMP requirement)
    - Exceptions documented in POA&M

    ```bash
    # Create patch baseline
    aws ssm create-patch-baseline \
      --name "FedRAMP-Patch-Baseline" \
      --approval-rules "PatchRules=[{PatchFilterGroup={PatchFilters=[{Key=CLASSIFICATION,Values=[Security]}]},ApproveAfterDays=7}]"

    # Schedule automated patching (weekly)
    aws ssm create-maintenance-window \
      --name "Weekly-Security-Patching" \
      --schedule "cron(0 3 ? * SUN *)" \
      --duration 4 \
      --cutoff 1
    ```

Step 5: Vulnerability Reporting

  Monthly FedRAMP Deliverable:
    - Scan report (all findings)
    - Remediation summary
    - POA&M for open items >30 days

    Generated automatically:
    ```bash
    # Lambda function: generate-fedramp-vuln-report
    # Triggers: 5th of each month
    # Outputs: PDF report to S3, email to FedRAMP PMO
    ```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2: SECURITY EVENT MONITORING (SI-4)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NIST Requirement:
  SI-4: The organization monitors the information system to detect attacks
        and indicators of potential attacks in accordance with [Assignment:
        organization-defined monitoring objectives]; and unauthorized local,
        network, and remote connections.

  SI-4(2): Employ automated tools to support near real-time analysis of events.

  SI-4(4): Monitor inbound and outbound communications traffic continuously for
           unusual or unauthorized activities or conditions.

  SI-4(5): Alert [Assignment: organization-defined personnel or roles] when
           indications of compromises or potential compromises occur.

FedRAMP Requirement:
  - 24/7 continuous monitoring
  - Incident reporting to FedRAMP within 1 hour (high severity)
  - Monthly security metrics

Implementation:

Step 1: Enable Core Monitoring Services

  AWS GuardDuty (Threat Detection):
    ```bash
    # Enable GuardDuty in all regions
    aws guardduty create-detector --enable

    # Enable S3 protection
    aws guardduty update-detector \
      --detector-id <detector-id> \
      --data-sources '{"S3Logs":{"Enable":true}}'

    # Export findings to S3 for long-term retention
    aws guardduty create-publishing-destination \
      --detector-id <detector-id> \
      --destination-type S3 \
      --destination-properties DestinationArn=arn:aws:s3:::security-findings
    ```

    Cost: \$4.50/month per AWS account + \$1.00/GB traffic analyzed

  AWS Security Hub (Aggregation):
    ```bash
    # Enable Security Hub
    aws securityhub enable-security-hub

    # Enable standards
    aws securityhub batch-enable-standards \
      --standards-subscription-requests \
        StandardsArn="arn:aws:securityhub:us-east-1::standards/aws-foundational-security-best-practices/v/1.0.0" \
        StandardsArn="arn:aws:securityhub:us-east-1::standards/cis-aws-foundations-benchmark/v/1.2.0"

    # Aggregate findings from Inspector, GuardDuty, Macie, Config
    ```

    Cost: \$0.0010 per security check per region per month

  AWS CloudWatch (Metrics & Logs):
    ```bash
    # Create log groups for application logs
    aws logs create-log-group --log-group-name /aws/lambda/app
    aws logs put-retention-policy --log-group-name /aws/lambda/app --retention-in-days 365

    # Create metric filters for security events
    aws logs put-metric-filter \
      --log-group-name /aws/cloudtrail \
      --filter-name "UnauthorizedAPICalls" \
      --filter-pattern '[... , eventName, errorCode=*UnauthorizedOperation||errorCode=AccessDenied*]' \
      --metric-transformations \
        metricName=UnauthorizedAPICalls,metricNamespace=CloudTrailMetrics,metricValue=1
    ```

Step 2: Configure Real-Time Alerting (SI-4(5))

  Critical Alerts (PagerDuty Integration):
    - GuardDuty HIGH severity findings
    - Unauthorized API calls (multiple in 5 minutes)
    - Root account usage
    - Security group changes allowing 0.0.0.0/0
    - IAM policy changes (administrative actions)

    ```bash
    # EventBridge rule for GuardDuty high findings
    aws events put-rule \
      --name guardduty-high-severity \
      --event-pattern '{
        "source": ["aws.guardduty"],
        "detail-type": ["GuardDuty Finding"],
        "detail": {
          "severity": [7, 7.9, 8, 8.9]
        }
      }'

    # Target: Lambda → PagerDuty API
    aws events put-targets \
      --rule guardduty-high-severity \
      --targets "Id"="1","Arn"="<pagerduty-lambda-arn>"
    ```

  Medium Alerts (Slack Notification):
    - GuardDuty MEDIUM findings
    - Config compliance changes
    - Unusual API activity

    ```bash
    # EventBridge rule for medium findings
    # Target: SNS → Slack webhook
    ```

  Low/Info (Email Digest):
    - Daily summary of all findings
    - Weekly trend analysis
    - Monthly security metrics

Step 3: Network Traffic Monitoring (SI-4(4))

  VPC Flow Logs:
    ```bash
    # Enable flow logs for all VPCs
    aws ec2 create-flow-logs \
      --resource-type VPC \
      --resource-ids <vpc-id> \
      --traffic-type ALL \
      --log-destination-type s3 \
      --log-destination arn:aws:s3:::vpc-flow-logs \
      --max-aggregation-interval 60

    # Analyze flow logs for anomalies
    # (Athena queries or GuardDuty VPC flow log analysis)
    ```

  Network Intrusion Detection (optional):
    - Deploy AWS Network Firewall with IDS/IPS
    - Or use third-party NIDS (Suricata, Zeek)

    Cost: \$0.395/hour per endpoint (~\$285/month)

Step 4: Centralized SIEM (Optional but Recommended)

  Option A: Splunk Cloud (FedRAMP Authorized)
    - Ingests CloudTrail, GuardDuty, flow logs, application logs
    - Correlation rules for advanced threat detection
    - FedRAMP reporting dashboards

    Cost: \$150-\$300/GB ingested per month
    Typical: 50 GB/month = \$7,500-\$15,000/month

  Option B: Datadog Security Monitoring
    - Native AWS integration
    - Real-time threat detection
    - Compliance dashboards

    Cost: \$15/host/month + \$0.10/GB logs

  Option C: AWS-Native Stack (Cost-Effective)
    - CloudWatch Logs Insights for queries
    - Athena for analysis of S3-stored logs
    - QuickSight for dashboards

    Cost: \$100-\$500/month

  RECOMMENDATION: AWS-native for small deployments, Splunk for FedRAMP

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3: CONFIGURATION MANAGEMENT (CM-3, CM-6)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NIST Requirement:
  CM-3: The organization tracks, reviews, approves/disapproves, and audits
        changes to the information system.

  CM-6: The organization establishes and documents mandatory configuration
        settings for information technology products employed.

FedRAMP Requirement:
  - Monthly change report to FedRAMP PMO
  - Significant changes require pre-approval

Implementation:

Step 1: Enable AWS Config

  ```bash
  # Create Config recorder
  aws configservice put-configuration-recorder \
    --configuration-recorder name=default,roleARN=<config-role-arn>

  # Create delivery channel
  aws configservice put-delivery-channel \
    --delivery-channel name=default,s3BucketName=config-logs

  # Start recording
  aws configservice start-configuration-recorder --configuration-recorder-name default
  ```

Step 2: Deploy Compliance Rules

  FedRAMP-Required Config Rules:
    - iam-user-mfa-enabled
    - root-account-mfa-enabled
    - s3-bucket-public-read-prohibited
    - s3-bucket-public-write-prohibited
    - encrypted-volumes
    - rds-encryption-enabled
    - cloudtrail-enabled
    - multi-region-cloudtrail-enabled
    - access-keys-rotated (90 days)

    ```bash
    # Deploy conformance pack (bundle of rules)
    aws configservice put-conformance-pack \
      --conformance-pack-name "FedRAMP-Moderate" \
      --template-s3-uri s3://config-templates/fedramp-moderate.yaml
    ```

Step 3: Change Tracking and Approval

  Infrastructure Changes (Terraform):
    - All changes via pull request
    - Terraform plan reviewed by security team
    - Approved changes merged to main
    - CI/CD applies changes automatically

    Evidence: GitHub pull request history, Terraform Cloud run logs

  Configuration Changes (AWS Console):
    - Detected by Config
    - EventBridge rule triggers notification
    - Security team reviews change
    - Unapproved changes rolled back automatically

    ```bash
    # Detect manual console changes
    aws events put-rule \
      --name detect-manual-changes \
      --event-pattern '{
        "source": ["aws.config"],
        "detail-type": ["Config Configuration Item Change"],
        "detail": {
          "configurationItemDiff": {
            "changeType": ["CREATE", "UPDATE"]
          }
        }
      }'
    ```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 4: CONTINUOUS MONITORING METRICS (CA-7)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NIST Requirement:
  CA-7: The organization develops a continuous monitoring strategy and implements
        a continuous monitoring program that includes metrics, assessments, and
        ongoing authorizations.

  CA-7(1): Employ independent assessors or assessment teams to monitor the
           security controls in the information system on an ongoing basis.

  CA-7(3): Employ trend analyses to determine if security control implementations,
           the frequency of continuous monitoring activities, and/or the types of
           activities used in the continuous monitoring process need to be modified
           based on empirical data.

FedRAMP Requirement:

- Monthly deliverables (vulnerability scan, POA&M, change log, incidents)
- Annual assessment by 3PAO
- Quarterly self-assessment

Implementation:

Monthly FedRAMP Deliverables:

1. Vulnerability Scan Report
   - Generated: 5th of each month
   - Source: Tenable/Inspector
   - Format: PDF + CSV
   - Upload: FedRAMP Secure Repository (FSR)

2. Plan of Action & Milestones (POA&M)
   - All open findings
   - Status updates
   - Remediation timeline
   - Risk ratings

3. Incident Summary
   - All P1/P2 incidents
   - Root cause analysis
   - Remediation actions
   - Lessons learned

4. Change Log
   - All significant changes (architecture, new services)
   - Change approval evidence
   - Rollback plans

5. Inventory Updates
   - New/decommissioned assets
   - Software updates
   - Third-party integrations

Automated Report Generation:

  ```bash
  # Lambda function: generate-monthly-fedramp-package
  # Schedule: 1st of each month
  # Actions:
  #   1. Collect vulnerability scan results
  #   2. Export POA&M from Jira
  #   3. Export incident summary from PagerDuty
  #   4. Export change log from GitHub + Terraform Cloud
  #   5. Export asset inventory from Config
  #   6. Generate PDF package
  #   7. Upload to FSR
  #   8. Email confirmation to FedRAMP PMO
  ```

Continuous Monitoring Dashboard:

  CloudWatch Dashboard: fedramp-continuous-monitoring

  Widgets:
    - Vulnerability Count (by severity)
    - GuardDuty Findings (30-day trend)
    - Config Compliance Score (%)
    - Patch Compliance (%)
    - Mean Time to Remediate (days)
    - Incident Count (by month)
    - Change Frequency (changes per month)

  ```bash
  # Create dashboard
  aws cloudwatch put-dashboard \
    --dashboard-name fedramp-continuous-monitoring \
    --dashboard-body file://dashboard.json
  ```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEPLOYMENT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Automated Deployment:

```bash
# Clone monitoring templates
git clone https://github.com/your-org/continuous-monitoring-iac
cd continuous-monitoring-iac

# Configure environment
cp .env.example .env
# Edit .env with your AWS account, FedRAMP details

# Deploy infrastructure
terraform init
terraform plan
terraform apply

# Verify deployment
./scripts/verify-monitoring.sh
```

What Gets Deployed:

✓ Vulnerability Scanning:

- Amazon Inspector (continuous)
- Tenable Cloud Connector (monthly)
- SSM Patch Manager (automated patching)
- EventBridge rules (scan scheduling)

✓ Security Monitoring:

- GuardDuty (threat detection)
- Security Hub (aggregation)
- CloudWatch Logs (365-day retention)
- VPC Flow Logs
- CloudTrail (multi-region)

✓ Configuration Management:

- AWS Config (all regions)
- FedRAMP compliance rules (20+ rules)
- Change detection and alerting

✓ Alerting and Reporting:

- PagerDuty integration (critical alerts)
- Slack webhooks (medium alerts)
- Email notifications (daily digest)
- Monthly FedRAMP report automation

✓ Dashboards:

- CloudWatch dashboard (real-time metrics)
- QuickSight dashboard (trend analysis, optional)

Deployment Time: 2-3 hours (automated), 1 day (manual)
Cost: \$500-\$2,000/month (depending on data volume, SIEM choice)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POST-DEPLOYMENT CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Verify all monitoring services enabled (Inspector, GuardDuty, Config)
□ Confirm SSM agents deployed to all EC2 instances
□ Test vulnerability scan (run manual scan, verify results)
□ Validate alerts (trigger test alert, confirm PagerDuty/Slack notification)
□ Review GuardDuty findings (address any immediate issues)
□ Configure FedRAMP report automation (set up FSR upload)
□ Schedule first monthly report (mark calendar)
□ Document monitoring procedures (runbooks for alerts)
□ Train security team (how to respond to alerts)
□ Schedule quarterly self-assessment
□ Schedule annual 3PAO assessment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Monthly Recurring Costs:

Vulnerability Scanning:
  Amazon Inspector:              \$50-\$200 (depends on instances)
  Tenable.io:                   \$200 (~\$2,400/year)

Security Monitoring:
  GuardDuty:                    \$300-\$500 (depends on traffic)
  Security Hub:                  \$50
  CloudWatch Logs:              \$100-\$300 (depends on volume)
  VPC Flow Logs storage:         \$50

Optional SIEM:
  Splunk Cloud:                 \$7,500-\$15,000
  Datadog:                      \$1,500-\$3,000
  AWS-native (CloudWatch):       \$200-\$500

Alerting:
  PagerDuty:                    \$200

Configuration Management:
  AWS Config:                    \$100-\$200

Total (Basic):                  \$1,000-\$1,500/month
Total (with SIEM):              \$8,500-\$16,500/month

Recommended: Start with AWS-native (\$1,000/month), upgrade to SIEM if needed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLIANCE VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test Continuous Monitoring:

```bash
# Test vulnerability scanning
/engineer:test-control RA-5

# Test security monitoring
/engineer:test-control SI-4

# Test configuration management
/engineer:test-control CM-3

# Test continuous monitoring program
/engineer:test-control CA-7
```

Expected Results:
  ✓ RA-5: Vulnerability scans scheduled monthly, last scan <30 days
  ✓ SI-4: GuardDuty enabled, findings exported, alerts configured
  ✓ CM-3: Config enabled, change detection working, manual changes detected
  ✓ CA-7: Metrics collected, dashboards functioning, reports generated

```

## Related Commands

- `/nist:control-tailor` - Tailor monitoring controls
- `/nist:overlay-apply` - Apply FedRAMP overlay
- `/engineer:test-control` - Test monitoring effectiveness
- `/engineer:monitor-continuous` - General continuous monitoring
