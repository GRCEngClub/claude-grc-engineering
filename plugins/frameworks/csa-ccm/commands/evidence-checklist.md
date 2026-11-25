# CSA Cloud Controls Matrix (CCM) Evidence Checklist

Generates comprehensive evidence collection checklists for CSA CCM v4 controls, optimized for cloud-native environments (AWS, Azure, GCP) with STAR attestation guidance.

> **Never commit evidence artifacts to source control.** The outputs below include real usernames, credential reports, MFA device states, and privileged-account inventories. `.gitignore` covers `evidence/` by default so `git add -A` will not sweep it up, but durable storage is your responsibility. Use an encrypted, access-controlled evidence locker (encrypted S3 with least-privilege IAM, a GRC platform, or a shared drive with full-disk encryption and MFA-gated access).

## Usage

```bash
/csa-ccm:evidence-checklist <control-id> [--cloud-provider <aws|azure|gcp>] [--export <format>]
```

## Arguments

- `<control-id>`: CSA CCM control (e.g., "IAM-02", "DSP-04", "IVS-01") or domain (e.g., "Identity & Access Management", "Data Security & Privacy")
- `--cloud-provider`: Target cloud platform (`aws`, `azure`, `gcp`, or `multi`). Default: `aws`
- `--export`: Export format (`json`, `csv`, `markdown`). Default: `markdown`

## Example: Identity & Access Management Evidence

```bash
/csa-ccm:evidence-checklist IAM-02 --cloud-provider aws
```

**Output:**

```markdown
CSA Cloud Controls Matrix v4 Evidence Checklist
Control: IAM-02 - Credential Lifecycle / Provision Management
Domain: Identity & Access Management (IAM)
Cloud Provider: AWS
STAR Level: Level 1 (Self-Assessment) / Level 2 (Third-Party Audit)

## Control Specification

Applications and systems are able to uniquely identify and authenticate users accessing cloud services. Cloud service provider shall use secure, industry-recognized processes for identity and access management.

## Cloud Implementation Notes

For AWS environments, this control requires:
- IAM user lifecycle management (creation, modification, deletion)
- Automated provisioning via Identity Center (SSO) or third-party IdP
- Service account management (IAM roles, service principals)
- Credential rotation policies
- Least privilege enforcement

## Evidence Requirements

### Required Documentation

□ **Identity and Access Management Policy**
  - Scope: All cloud platforms (AWS, Azure, GCP)
  - Required elements:
    - Credential lifecycle procedures
    - Identity proofing requirements
    - Automated provisioning integration (SCIM, SAML)
    - Credential rotation schedules
    - Privileged access management
    - Service account governance
  - Update frequency: Annually
  - Approver: CISO or Cloud Security lead
  - Evidence: Signed IAM policy v1.x

□ **Cloud Identity Architecture Diagram**
  - Show: IdP integration (Okta, Entra ID, etc.) → AWS SSO/Entra ID/GCP Workforce Identity
  - Include: User authentication flow, federated access, MFA enforcement points
  - Format: Visio, Lucidchart, or draw.io diagram
  - Update frequency: When architecture changes
  - Evidence: Architecture diagram v1.x + narrative description

□ **Provisioning/Deprovisioning Procedures**
  - Step-by-step user onboarding to cloud platforms
  - Step-by-step user offboarding process
  - Automated SCIM provisioning configuration
  - Emergency access procedures
  - Evidence: SOP document with screenshots

### Automated Evidence Collection (AWS)

✓ **IAM User Inventory**
```bash
# Complete IAM user list
aws iam list-users --output json > evidence/ccm-iam-02-users-$(date +%Y%m%d).json

# IAM credential report (shows password age, MFA status, access key age)
aws iam generate-credential-report
aws iam get-credential-report --output text | base64 -d \
  > evidence/ccm-iam-02-credential-report-$(date +%Y%m%d).csv

# User creation dates (for lifecycle tracking)
aws iam list-users | jq -r '.Users[] | [.UserName, .CreateDate] | @csv' \
  > evidence/ccm-iam-02-user-creation-dates-$(date +%Y%m%d).csv
```

Collection Frequency: Monthly
Retention: 12 months minimum
Purpose: Demonstrates user inventory and credential age

✓ **IAM Identity Center (SSO) Users**

```bash
# If using AWS SSO/Identity Center
aws identitystore list-users --identity-store-id <IDENTITY-STORE-ID> \
  --output json > evidence/ccm-iam-02-sso-users-$(date +%Y%m%d).json

# Permission sets assigned
aws sso-admin list-permission-sets --instance-arn <INSTANCE-ARN> \
  --output json > evidence/ccm-iam-02-permission-sets-$(date +%Y%m%d).json

# Account assignments (who has access to which AWS accounts)
for account in $(aws organizations list-accounts --query 'Accounts[].Id' --output text); do
  aws sso-admin list-account-assignments \
    --instance-arn <INSTANCE-ARN> \
    --account-id "$account" \
    --permission-set-arn <PERMISSION-SET-ARN> \
    --output json >> evidence/ccm-iam-02-sso-assignments-$(date +%Y%m%d).json
done
```

Collection Frequency: Monthly
Retention: 12 months
Purpose: Cloud-native federated identity evidence

✓ **Service Account / IAM Role Inventory**

```bash
# IAM roles (service accounts)
aws iam list-roles --output json > evidence/ccm-iam-02-roles-$(date +%Y%m%d).json

# Service-linked roles (AWS-managed)
aws iam list-roles | jq '.Roles[] | select(.Path | startswith("/aws-service-role/"))' \
  > evidence/ccm-iam-02-service-linked-roles-$(date +%Y%m%d).json

# Customer-managed roles (applications)
aws iam list-roles | jq '.Roles[] | select(.Path == "/" and (.RoleName | startswith("AWSServiceRole") | not))' \
  > evidence/ccm-iam-02-app-roles-$(date +%Y%m%d).json

# Role trust policies (who can assume roles)
for role in $(aws iam list-roles --query 'Roles[].RoleName' --output text); do
  echo "=== $role ===" >> evidence/ccm-iam-02-role-trusts-$(date +%Y%m%d).txt
  aws iam get-role --role-name "$role" --query 'Role.AssumeRolePolicyDocument' \
    >> evidence/ccm-iam-02-role-trusts-$(date +%Y%m%d).txt
done
```

Collection Frequency: Monthly
Retention: 12 months
Purpose: Non-human identity inventory

✓ **Credential Rotation Evidence**

```bash
# Access keys older than 90 days (non-compliant)
aws iam get-credential-report --output text | base64 -d | \
  awk -F',' '$10 == "true" {split($11,a,"T"); if ((systime() - mktime(gensub(/[-:]/," ","g",a[1]" "substr(a[2],1,8)))) > 90*86400) print $1, $11}' \
  > evidence/ccm-iam-02-old-access-keys-$(date +%Y%m%d).txt

# Passwords older than 90 days
aws iam get-credential-report --output text | base64 -d | \
  awk -F',' '$4 == "true" {split($5,a,"T"); if ((systime() - mktime(gensub(/[-:]/," ","g",a[1]" "substr(a[2],1,8)))) > 90*86400) print $1, $5}' \
  > evidence/ccm-iam-02-old-passwords-$(date +%Y%m%d).txt

# Users without MFA (non-compliant)
aws iam get-credential-report --output text | base64 -d | \
  awk -F',' '$4 == "true" && $8 == "false" {print $1}' \
  > evidence/ccm-iam-02-no-mfa-$(date +%Y%m%d).txt
```

Collection Frequency: Weekly
Retention: 12 months
Purpose: Credential hygiene monitoring

✓ **Provisioning/Deprovisioning Audit Trail**

```bash
# User creation events (last 30 days)
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=CreateUser \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --max-items 1000 \
  --output json > evidence/ccm-iam-02-user-creation-$(date +%Y%m).json

# User deletion events (last 30 days)
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteUser \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --max-items 1000 \
  --output json > evidence/ccm-iam-02-user-deletion-$(date +%Y%m).json

# Permission changes (last 30 days)
for event in AttachUserPolicy DetachUserPolicy PutUserPolicy DeleteUserPolicy; do
  aws cloudtrail lookup-events \
    --lookup-attributes AttributeKey=EventName,AttributeValue=$event \
    --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
    --max-items 1000 \
    --output json >> evidence/ccm-iam-02-permission-changes-$(date +%Y%m).json
done
```

Collection Frequency: Monthly
Retention: 12 months
Purpose: Lifecycle audit trail

### Automated Evidence Collection (Azure)

✓ **Entra ID User Inventory**

```bash
# All Entra ID users
az ad user list --output json > evidence/ccm-iam-02-azure-users-$(date +%Y%m%d).json

# Guest users (external identities)
az ad user list --filter "userType eq 'Guest'" --output json \
  > evidence/ccm-iam-02-azure-guests-$(date +%Y%m%d).json

# Service principals (application identities)
az ad sp list --all --output json > evidence/ccm-iam-02-azure-sp-$(date +%Y%m%d).json

# Managed identities (for Azure resources)
az identity list --output json > evidence/ccm-iam-02-managed-identities-$(date +%Y%m%d).json
```

Collection Frequency: Monthly
Retention: 12 months

✓ **Entra ID Sign-in Logs**

```bash
# Sign-in activity (last 30 days)
az monitor activity-log list \
  --caller 'Microsoft.Azure.ActiveDirectory' \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --output json > evidence/ccm-iam-02-azure-signins-$(date +%Y%m).json

# Failed sign-ins (potential unauthorized access)
az monitor activity-log list \
  --caller 'Microsoft.Azure.ActiveDirectory' \
  --status Failed \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --output json > evidence/ccm-iam-02-azure-failed-signins-$(date +%Y%m).json
```

Collection Frequency: Monthly
Retention: 12 months

### Automated Evidence Collection (GCP)

✓ **GCP IAM User Inventory**

```bash
# Workforce identity users (if using Workforce Identity Federation)
gcloud identity groups memberships list \
  --group-email=all-users@company.com \
  --format=json > evidence/ccm-iam-02-gcp-users-$(date +%Y%m%d).json

# Service accounts
gcloud iam service-accounts list --format=json \
  > evidence/ccm-iam-02-gcp-service-accounts-$(date +%Y%m%d).json

# Service account keys (check for rotation)
for sa in $(gcloud iam service-accounts list --format='value(email)'); do
  echo "=== $sa ===" >> evidence/ccm-iam-02-gcp-sa-keys-$(date +%Y%m%d).txt
  gcloud iam service-accounts keys list --iam-account="$sa" --format=json \
    >> evidence/ccm-iam-02-gcp-sa-keys-$(date +%Y%m%d).txt
done
```

Collection Frequency: Monthly
Retention: 12 months

### Manual Evidence Collection

□ **Identity Provider (IdP) Integration Configuration**

- Screenshots of SAML/SCIM configuration in IdP (Okta, Entra ID, etc.)
- Screenshots of AWS SSO/Entra ID/GCP federation setup
- Attribute mapping configuration (email → username, groups → roles)
- Evidence: Screenshots + configuration export (sanitized)
- Frequency: When configuration changes, annual review

□ **Automated Provisioning Evidence (Sample)**

- Sample size: 10 users provisioned in last quarter
- Required elements:
  - User created in IdP (Okta/Entra ID)
  - SCIM sync log showing user pushed to AWS/Azure/GCP
  - User appears in cloud platform within 15 minutes
  - Correct permission set/role assigned based on group membership
- Evidence: SCIM logs + before/after screenshots
- Frequency: Quarterly review

□ **Deprovisioning Evidence (Sample)**

- Sample size: All user departures in last quarter (or 10 if >10)
- Required elements:
  - User disabled in IdP
  - User access to cloud revoked within 24 hours
  - No subsequent login attempts after deprovisioning
- Evidence: IdP audit logs + CloudTrail/Entra ID logs
- Frequency: Quarterly review

□ **Credential Rotation Policy Enforcement**

- Document rotation schedules:
  - User passwords: 90 days maximum
  - Access keys: 90 days maximum
  - Service account keys: 90 days maximum (GCP), use IAM roles instead (AWS/Azure)
- Show enforcement mechanism (IAM password policy, automated alerts)
- Evidence: IAM password policy screenshot + rotation reports
- Frequency: Annual review

□ **Privileged Account Governance**

- Inventory of break-glass / emergency accounts
- Usage logs for break-glass accounts (should be rare)
- Justification for service accounts with privileged access
- Evidence: Privileged account register + usage logs
- Frequency: Quarterly review

## CSA STAR Attestation Requirements

For CSA STAR Level 2 (Third-Party Audit), auditor will verify:

### Documentation Requirements

✓ IAM policy approved by senior management
✓ Cloud architecture diagram showing identity flows
✓ Provisioning/deprovisioning procedures documented
✓ Integration with corporate IdP (single source of truth)

### Implementation Requirements

✓ Automated provisioning (SCIM or equivalent)
✓ Automated deprovisioning (<24 hours from termination)
✓ Credential rotation enforced (technical controls, not just policy)
✓ Least privilege access (no standing admin access)
✓ MFA enforced for all human access

### Testing Requirements

✓ Sample 25 user creation events (show approval + provisioning)
✓ Sample 25 user termination events (show <24hr revocation)
✓ Demonstrate credential rotation (no credentials >90 days)
✓ Show orphaned account detection and remediation

## Common STAR Assessment Findings

### Critical Findings (Likely to fail STAR Level 2)

❌ No automated provisioning (manual account creation)
❌ No automated deprovisioning (terminated users retain access >24hrs)
❌ No credential rotation enforcement (passwords/keys >1 year old)
❌ No MFA for privileged access
❌ Shared credentials (multiple people using same account)

### Moderate Findings

⚠️ Deprovisioning >24 hours but <72 hours
⚠️ Some credentials not rotated (>90 days but <180 days)
⚠️ IdP integration incomplete (some platforms manual)
⚠️ Service account proliferation without governance

### Minor Findings

⚠️ Documentation incomplete (missing architecture diagrams)
⚠️ Orphaned accounts exist but detected and remediated
⚠️ Evidence retention <12 months

## Remediation Guidance

### If No Automated Provisioning

1. **Select Identity Provider** (if none exists)
   - Small orgs: Okta Workforce Identity ($2-8/user/month)
   - Microsoft shops: Microsoft Entra ID P1 ($6/user/month)
   - Google Workspace: Cloud Identity Premium ($6/user/month)

2. **Configure SAML/SCIM Integration**
   - AWS: AWS IAM Identity Center (free with AWS account)
   - Azure: Native Entra ID integration
   - GCP: Workforce Identity Federation

3. **Implement Automated Lifecycle**
   - HR system → IdP (Workday/BambooHR/ADP integration)
   - IdP → Cloud (SCIM provisioning)
   - Termination in HR = automatic cloud access revocation

**Timeline**: 4-8 weeks implementation

### If Credential Rotation Not Enforced

1. **Enable IAM Password Policy** (AWS)

```bash
aws iam update-account-password-policy \
  --max-password-age 90 \
  --minimum-password-length 14 \
  --require-symbols \
  --require-numbers \
  --require-uppercase-characters \
  --require-lowercase-characters \
  --password-reuse-prevention 24
```

2. **Implement Access Key Rotation Automation**

```python
# Lambda function to alert on old access keys
import boto3
from datetime import datetime, timedelta

def lambda_handler(event, context):
    iam = boto3.client('iam')
    sns = boto3.client('sns')

    # Get credential report
    iam.generate_credential_report()
    report = iam.get_credential_report()

    # Parse CSV and find old keys
    old_keys = []
    for line in report['Content'].decode('utf-8').split('\n')[1:]:
        fields = line.split(',')
        if len(fields) > 11 and fields[10] == 'true':  # Key 1 active
            key_age = (datetime.now() - datetime.fromisoformat(fields[11].replace('Z', '+00:00'))).days
            if key_age > 90:
                old_keys.append({'user': fields[0], 'age': key_age})

    # Send alert
    if old_keys:
        sns.publish(
            TopicArn='arn:aws:sns:us-east-1:123456789012:security-alerts',
            Subject='IAM Access Keys Require Rotation',
            Message=f"Found {len(old_keys)} access keys older than 90 days:\n" +
                    '\n'.join([f"{k['user']}: {k['age']} days" for k in old_keys])
        )
```

**Timeline**: 1-2 weeks implementation

## Cross-References

### Related CSA CCM Controls

- IAM-01 - Audit Tools Access
- IAM-03 - Diagnostic / Configuration Ports Access
- IAM-07 - User Access Policy
- IAM-12 - Secure / Private Authentication
- CCC-01 - Cloud Change Control and Configuration Management

### Maps to Other Frameworks

- **NIST 800-53**: AC-2 (Account Management), IA-4 (Identifier Management), IA-5 (Authenticator Management)
- **ISO 27001:2022**: A.5.15 (Access control), A.5.17 (Authentication), A.5.18 (Access rights)
- **SOC 2**: CC6.1, CC6.2 (Access controls, authentication)
- **CMMC 2.0**: IA.L2-3.5.1, IA.L2-3.5.2 (Identification and authentication)
- **PCI-DSS v4**: 8.2 (User identification and authentication)

## Cost Estimates

### Identity Platform (Annual)

- Okta Workforce: $6-10/user/month ($1,200-2,000/yr for 20 users)
- Microsoft Entra ID P1: $6/user/month ($1,440/yr for 20 users)
- Google Cloud Identity Premium: $6/user/month ($1,440/yr for 20 users)

### Implementation (One-Time)

- IdP setup and SCIM integration: 80 hours ($8,000)
- Automated credential rotation: 40 hours ($4,000)
- Evidence collection automation: 24 hours ($2,400)

### CSA STAR Assessment (If pursuing certification)

- Level 1 (Self-Assessment): Free
- Level 2 (Third-Party Audit): $25k-$75k (varies by organization size)
- Annual surveillance: $15k-$30k/year

## Automation Script

```python
#!/usr/bin/env python3
"""
CSA CCM IAM-02 Evidence Collection (Multi-Cloud)
Supports AWS, Azure, GCP
"""
import boto3
import subprocess
import json
import csv
from datetime import datetime
import os

class CCMIAMEvidence:
    def __init__(self, output_dir="evidence/ccm-iam-02"):
        self.output_dir = output_dir
        self.timestamp = datetime.now().strftime("%Y%m%d")
        os.makedirs(output_dir, exist_ok=True)

    def collect_aws(self):
        """Collect AWS IAM evidence"""
        print("Collecting AWS IAM evidence...")
        iam = boto3.client('iam')

        # User inventory
        users = iam.list_users()['Users']
        with open(f"{self.output_dir}/aws-iam-users-{self.timestamp}.json", 'w') as f:
            json.dump(users, f, indent=2, default=str)

        # Credential report
        iam.generate_credential_report()
        report = iam.get_credential_report()
        with open(f"{self.output_dir}/aws-credential-report-{self.timestamp}.csv", 'wb') as f:
            f.write(report['Content'])

        # Analyze credential age
        old_credentials = []
        for line in csv.DictReader(report['Content'].decode('utf-8').splitlines()):
            if line.get('access_key_1_active') == 'true':
                key_age = (datetime.now() - datetime.fromisoformat(line['access_key_1_last_rotated'].replace('Z', '+00:00'))).days
                if key_age > 90:
                    old_credentials.append({
                        'user': line['user'],
                        'credential_type': 'access_key_1',
                        'age_days': key_age
                    })

        with open(f"{self.output_dir}/aws-old-credentials-{self.timestamp}.json", 'w') as f:
            json.dump(old_credentials, f, indent=2)

        print(f"✓ AWS: {len(users)} users, {len(old_credentials)} credentials >90 days")
        return {'users': len(users), 'old_credentials': len(old_credentials)}

    def collect_azure(self):
        """Collect Entra ID evidence"""
        print("Collecting Entra ID evidence...")

        # Azure CLI commands
        try:
            users = subprocess.check_output(['az', 'ad', 'user', 'list', '--output', 'json'])
            with open(f"{self.output_dir}/azure-users-{self.timestamp}.json", 'wb') as f:
                f.write(users)

            user_count = len(json.loads(users))
            print(f"✓ Azure: {user_count} users")
            return {'users': user_count}

        except subprocess.CalledProcessError as e:
            print(f"⚠️  Azure collection failed (az CLI not configured?): {e}")
            return {'users': 0}

    def collect_gcp(self):
        """Collect GCP IAM evidence"""
        print("Collecting GCP evidence...")

        try:
            sa_list = subprocess.check_output(['gcloud', 'iam', 'service-accounts', 'list', '--format=json'])
            with open(f"{self.output_dir}/gcp-service-accounts-{self.timestamp}.json", 'wb') as f:
                f.write(sa_list)

            sa_count = len(json.loads(sa_list))
            print(f"✓ GCP: {sa_count} service accounts")
            return {'service_accounts': sa_count}

        except subprocess.CalledProcessError as e:
            print(f"⚠️  GCP collection failed (gcloud not configured?): {e}")
            return {'service_accounts': 0}

    def generate_report(self, aws_data, azure_data, gcp_data):
        """Generate summary report"""
        report = f"""
CSA CCM v4 - IAM-02 Evidence Report
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

MULTI-CLOUD IDENTITY INVENTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AWS IAM Users:          {aws_data.get('users', 0)}
AWS Old Credentials:    {aws_data.get('old_credentials', 0)} (>90 days)
Entra ID Users:         {azure_data.get('users', 0)}
GCP Service Accounts:   {gcp_data.get('service_accounts', 0)}

COMPLIANCE STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{'✓ COMPLIANT' if aws_data.get('old_credentials', 0) == 0 else '✗ NON-COMPLIANT'} - Credential rotation (0 credentials >90 days required)

RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
        if aws_data.get('old_credentials', 0) > 0:
            report += f"□ Rotate {aws_data['old_credentials']} AWS access keys immediately\n"
        report += "□ Review user inventory for orphaned accounts\n"
        report += "□ Validate IdP SCIM integration is active\n"
        report += f"\nEvidence stored in: {self.output_dir}/\n"

        print(report)

        with open(f"{self.output_dir}/summary-report-{self.timestamp}.txt", 'w') as f:
            f.write(report)

if __name__ == "__main__":
    print("CSA CCM IAM-02 Evidence Collection (Multi-Cloud)")
    print("=" * 60)

    collector = CCMIAMEvidence()

    aws_data = collector.collect_aws()
    azure_data = collector.collect_azure()
    gcp_data = collector.collect_gcp()

    collector.generate_report(aws_data, azure_data, gcp_data)

    print("\n✓ Multi-cloud evidence collection complete")
```

---

**CSA STAR Level**: Level 1 (Self) / Level 2 (Third-Party)
**Implementation Priority**: 🔴 CRITICAL (Core identity control)
**Cloud-Native**: YES (designed for cloud environments)
**Estimated Implementation Time**: 6-12 weeks (with IdP integration)
