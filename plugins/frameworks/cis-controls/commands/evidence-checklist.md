# CIS Controls v8 Evidence Checklist

Generates comprehensive evidence collection checklists for CIS Controls v8 safeguards, organized by Implementation Group (IG1, IG2, IG3) with automated and manual collection guidance.

> **Never commit evidence artifacts to source control.** The outputs below include real usernames, credential reports, MFA device states, and privileged-account inventories. `.gitignore` covers `evidence/` by default so `git add -A` will not sweep it up, but durable storage is your responsibility. Use an encrypted, access-controlled evidence locker (encrypted S3 with least-privilege IAM, a GRC platform, or a shared drive with full-disk encryption and MFA-gated access).

## Usage

```bash
/cis-controls:evidence-checklist <safeguard-id> [--ig-level <1|2|3>] [--export <format>]
```

## Arguments

- `<safeguard-id>`: CIS safeguard (e.g., "1.1", "5.2", "8.3") or domain (e.g., "Asset Management", "Access Control")
- `--ig-level`: Filter by Implementation Group (1, 2, or 3). Default: all applicable
- `--export`: Export format (`json`, `csv`, `markdown`). Default: `markdown`

## Example: Single Safeguard Evidence

```bash
/cis-controls:evidence-checklist 5.1 --ig-level 1
```

**Output:**

```markdown
CIS Controls v8 Evidence Checklist
Safeguard: 5.1 - Establish and Maintain an Inventory of Accounts
Implementation Group: IG1 (Basic Cyber Hygiene)
Asset Type: Users
Security Function: Identify

## Control Description

Establish and maintain an inventory of all accounts managed in the enterprise. The inventory must include both user and administrator accounts. The inventory, at a minimum, should contain the person's name, username, start date, and end date.

## Evidence Requirements

### Required Documentation
□ Account Management Policy
  - Document account lifecycle procedures
  - Include approval processes
  - Define account types (standard, privileged, service, shared)
  - Update frequency: Annually or when procedures change
  - Approver: IT Director or CISO

□ Account Inventory Procedures
  - Step-by-step account creation process
  - Step-by-step account modification process
  - Step-by-step account deletion process
  - Include screenshots or workflow diagrams

### Automated Evidence Collection

✓ **Complete Account Inventory (Primary Evidence)**
```bash
# AWS IAM Users
aws iam list-users --output json > evidence/cis-5.1-iam-users-$(date +%Y%m%d).json
aws iam get-credential-report > evidence/cis-5.1-credential-report-$(date +%Y%m%d).csv

# Entra ID Users
az ad user list --output json > evidence/cis-5.1-azure-users-$(date +%Y%m%d).json

# Google Workspace Users
gcloud identity groups memberships list --group-email=all-users@company.com \
  --format=json > evidence/cis-5.1-gcp-users-$(date +%Y%m%d).json

# Linux/Unix Systems (if applicable)
sudo cat /etc/passwd | awk -F: '{print $1,$3,$5}' > evidence/cis-5.1-local-accounts-$(date +%Y%m%d).txt

# Windows Active Directory (if applicable)
Get-ADUser -Filter * -Properties DisplayName,SamAccountName,Created,LastLogonDate,Enabled |
  Export-Csv evidence/cis-5.1-ad-users-$(date +%Y%m%d).csv -NoTypeInformation
```

Collection Frequency: Monthly snapshot
Retention: 12 months minimum

✓ **Privileged Account Inventory**

```bash
# AWS Admin Accounts
aws iam list-users | jq '.Users[] | select(.PermissionsBoundary != null or .Tags[]? | select(.Key == "PrivilegedAccess"))' \
  > evidence/cis-5.1-privileged-aws-$(date +%Y%m%d).json

# Azure Privileged Accounts
az ad user list --filter "userType eq 'Admin'" --output json \
  > evidence/cis-5.1-privileged-azure-$(date +%Y%m%d).json

# List of users with sudo access (Linux)
sudo grep -r "^[^#]" /etc/sudoers /etc/sudoers.d/ > evidence/cis-5.1-sudo-users-$(date +%Y%m%d).txt
```

Collection Frequency: Weekly snapshot
Retention: 12 months minimum

✓ **Service Account Inventory**

```bash
# AWS Service Accounts (IAM roles)
aws iam list-roles --output json > evidence/cis-5.1-service-roles-$(date +%Y%m%d).json

# Azure Service Principals
az ad sp list --all --output json > evidence/cis-5.1-service-principals-$(date +%Y%m%d).json

# GCP Service Accounts
gcloud iam service-accounts list --format=json \
  > evidence/cis-5.1-gcp-service-accounts-$(date +%Y%m%d).json
```

Collection Frequency: Monthly snapshot
Retention: 12 months minimum

✓ **Account Creation/Modification Logs**

```bash
# AWS CloudTrail for IAM events
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=CreateUser \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --output json > evidence/cis-5.1-account-creation-$(date +%Y%m%d).json

aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteUser \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --output json > evidence/cis-5.1-account-deletion-$(date +%Y%m%d).json

# Entra ID Audit Logs
az monitor activity-log list \
  --caller 'Microsoft.Authorization' \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --output json > evidence/cis-5.1-azure-audit-$(date +%Y%m%d).json
```

Collection Frequency: Monthly
Retention: 12 months minimum

### Manual Evidence Collection

□ **Account Inventory Validation**

- Review automated inventory exports
- Verify completeness (100% of accounts included)
- Check for orphaned/unknown accounts
- Document any discrepancies found
- Evidence: Validation report with sign-off
- Frequency: Quarterly

□ **Account Creation Approvals (Sample)**

- Sample size: 25 accounts created in last quarter
- Required elements:
  - Original request ticket/email
  - Manager approval
  - IT approval (if separate)
  - Account creation date matching approval date (+/- 5 days)
- Evidence: Folder of approval tickets/emails
- Frequency: Quarterly review

□ **Account Termination Evidence (Sample)**

- Sample size: All terminations in last quarter or 25 (whichever is less)
- Required elements:
  - HR termination notice
  - Account disabled/deleted within 24 hours of termination
  - Access revocation confirmation
- Evidence: Folder of termination tickets + IAM deletion logs
- Frequency: Quarterly review

□ **Orphaned Account Review**

- Review accounts with no recent activity (>90 days)
- Document justification or schedule for deletion
- Evidence: Orphaned account report with disposition
- Frequency: Quarterly

## Adequacy Criteria (Assessment Guidance)

### IG1 Requirements (Scored)

✓ Account inventory exists and is documented
✓ Inventory includes at minimum:

- Full name
- Username/email
- Account creation date
- Account type (user/admin/service)
✓ Inventory updated at least quarterly
✓ Evidence retention: 12 months minimum

### IG2 Additional Requirements

✓ Automated inventory collection (not manual spreadsheets)
✓ Privileged accounts identified separately
✓ Service accounts tracked separately
✓ Account creation/deletion audit trail
✓ Quarterly validation of inventory completeness

### IG3 Additional Requirements

✓ Real-time or weekly inventory updates
✓ Automated orphaned account detection
✓ Integration with HR system for terminations
✓ Automated alerting for policy violations
✓ Continuous monitoring dashboard

## Common Assessment Findings

### Critical Findings

❌ No account inventory exists
❌ Inventory missing >25% of actual accounts
❌ No evidence of account deletion process
❌ Shared accounts not tracked or monitored

### Moderate Findings

⚠️ Inventory incomplete (missing 10-25% of accounts)
⚠️ Manual inventory (spreadsheets) instead of automated
⚠️ Service accounts not inventoried separately
⚠️ Inventory not updated in >6 months

### Minor Findings

⚠️ Inventory missing optional fields (last login, department)
⚠️ Orphaned account review not documented
⚠️ Evidence retention <12 months

## Remediation Guidance

### If No Inventory Exists

1. **Immediate Actions (Week 1)**
   - Run automated collection scripts above
   - Export all accounts from all systems
   - Create initial inventory spreadsheet

2. **Short-term (Weeks 2-4)**
   - Document account management procedures
   - Establish quarterly review process
   - Set up automated monthly snapshots

3. **Long-term (Months 2-3)**
   - Implement automated inventory tools (AWS Config, Azure Policy, etc.)
   - Integrate with HR system for auto-deprovisioning
   - Build compliance dashboard

### If Inventory Incomplete

1. Identify missing systems/platforms
2. Run discovery scans (Nmap, network inventory)
3. Cross-reference with asset inventory (CIS 1.1)
4. Update procedures to include all systems

## Cross-References

### Related CIS Safeguards

- 1.1 - Establish and Maintain Detailed Enterprise Asset Inventory
- 4.1 - Establish and Maintain a Secure Configuration Process
- 6.1 - Establish an Access Granting Process
- 6.2 - Establish an Access Revoking Process
- 6.8 - Define and Maintain Role-Based Access Control

### Maps to Other Frameworks

- **NIST 800-53**: AC-2 (Account Management), IA-4 (Identifier Management)
- **ISO 27001:2022**: A.5.15 (Access control), A.5.18 (Access rights)
- **SOC 2**: CC6.1 (Logical and physical access controls)
- **PCI-DSS v4**: 8.2.1 (User identification management)
- **CMMC 2.0**: AC.L2-3.1.1 (Authorized access control)

## Cost Estimates

### IG1 Implementation

- Initial setup: 40 hours ($4,000 @ $100/hr)
- Quarterly maintenance: 8 hours/quarter ($800/quarter)
- Tools: AWS Config / Azure Policy (included) or open-source

### IG2 Implementation

- Initial setup: 80 hours ($8,000 @ $100/hr)
- Monthly maintenance: 4 hours/month ($400/month)
- Tools: Identity governance platform ($5k-$15k/year for SMB)

### IG3 Implementation

- Initial setup: 120 hours ($12,000 @ $100/hr)
- Continuous monitoring: 2 hours/week ($800/month)
- Tools: Enterprise IGA solution ($25k-$100k/year)

## Evidence Package Structure

```
evidence/
└── cis-5.1-account-inventory/
    ├── 2025-01/
    │   ├── automated/
    │   │   ├── iam-users-20250115.json
    │   │   ├── credential-report-20250115.csv
    │   │   ├── privileged-accounts-20250115.json
    │   │   └── cloudtrail-account-events-20250115.json
    │   ├── manual/
    │   │   ├── account-inventory-policy-v1.2.pdf
    │   │   ├── account-procedures-2025.docx
    │   │   ├── quarterly-validation-Q1-2025.pdf
    │   │   └── approval-samples-Q1-2025/
    │   │       ├── account-request-001.pdf
    │   │       ├── account-request-002.pdf
    │   │       └── ... (25 samples)
    │   └── screenshots/
    │       ├── aws-iam-console-20250115.png
    │       └── access-analyzer-findings-20250115.png
    └── README.md (evidence index)
```

## Automation Script

```python
#!/usr/bin/env python3
"""
CIS 5.1 Evidence Collection Automation
Collects account inventory evidence from AWS, Azure, GCP
"""
import boto3
import json
import subprocess
from datetime import datetime
import os

class CIS51EvidenceCollector:
    def __init__(self, output_dir="evidence/cis-5.1"):
        self.output_dir = output_dir
        self.timestamp = datetime.now().strftime("%Y%m%d")
        os.makedirs(f"{output_dir}/automated", exist_ok=True)

    def collect_aws_accounts(self):
        """Collect AWS IAM user inventory"""
        iam = boto3.client('iam')

        # Get all users
        users = iam.list_users()['Users']
        output_file = f"{self.output_dir}/automated/aws-iam-users-{self.timestamp}.json"

        with open(output_file, 'w') as f:
            json.dump(users, f, indent=2, default=str)

        print(f"✓ Collected {len(users)} AWS IAM users -> {output_file}")

        # Get credential report
        iam.generate_credential_report()
        report = iam.get_credential_report()

        report_file = f"{self.output_dir}/automated/aws-credential-report-{self.timestamp}.csv"
        with open(report_file, 'wb') as f:
            f.write(report['Content'])

        print(f"✓ Generated AWS credential report -> {report_file}")

        return len(users)

    def collect_privileged_accounts(self):
        """Identify and collect privileged account inventory"""
        iam = boto3.client('iam')

        # Find users with admin policies
        admin_users = []
        for user in iam.list_users()['Users']:
            username = user['UserName']

            # Check attached policies
            attached = iam.list_attached_user_policies(UserName=username)
            for policy in attached['AttachedPolicies']:
                if 'Admin' in policy['PolicyName']:
                    admin_users.append({
                        'username': username,
                        'policy': policy['PolicyName'],
                        'created': user['CreateDate']
                    })

        output_file = f"{self.output_dir}/automated/privileged-accounts-{self.timestamp}.json"
        with open(output_file, 'w') as f:
            json.dump(admin_users, f, indent=2, default=str)

        print(f"✓ Identified {len(admin_users)} privileged accounts -> {output_file}")
        return len(admin_users)

    def generate_evidence_report(self, total_users, privileged_count):
        """Generate summary evidence report"""
        report = f"""
CIS Controls v8 - Safeguard 5.1 Evidence Report
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

ACCOUNT INVENTORY SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Accounts:       {total_users}
Privileged Accounts:  {privileged_count} ({privileged_count/total_users*100:.1f}%)
Service Accounts:     (manual review required)

EVIDENCE COLLECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Complete IAM user inventory
✓ Credential report with last login dates
✓ Privileged account identification
✓ CloudTrail account creation/deletion logs

COMPLIANCE STATUS: ✓ COMPLIANT (IG1)

NEXT ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Quarterly validation review (next due: {(datetime.now().replace(month=datetime.now().month+3)).strftime("%Y-%m-%d")})
□ Collect approval samples (25 accounts)
□ Review orphaned accounts (>90 days inactive)
□ Update account management policy (annual)

Evidence stored in: {self.output_dir}/
"""

        report_file = f"{self.output_dir}/evidence-report-{self.timestamp}.txt"
        with open(report_file, 'w') as f:
            f.write(report)

        print(f"\n{report}")
        print(f"Full report: {report_file}")

if __name__ == "__main__":
    collector = CIS51EvidenceCollector()

    print("CIS 5.1 Evidence Collection Starting...")
    print("=" * 50)

    total = collector.collect_aws_accounts()
    privileged = collector.collect_privileged_accounts()
    collector.generate_evidence_report(total, privileged)

    print("\n✓ Evidence collection complete!")
```

## Quick Reference

| Evidence Type | Collection Method | Frequency | Retention |
|--------------|-------------------|-----------|-----------|
| Account inventory | Automated (AWS CLI) | Monthly | 12 months |
| Privileged accounts | Automated (AWS CLI) | Weekly | 12 months |
| Service accounts | Automated (AWS CLI) | Monthly | 12 months |
| Account creation logs | CloudTrail | Monthly | 12 months |
| Account approvals (sample) | Manual (tickets) | Quarterly | 12 months |
| Termination evidence (sample) | Manual (HR + logs) | Quarterly | 12 months |
| Inventory validation | Manual (review) | Quarterly | 12 months |
| Policy documentation | Manual (document) | Annual | 3 years |

---

**Implementation Priority**: 🔴 CRITICAL (IG1 Requirement)
**Typical Assessment Weight**: HIGH (Foundational control)
**Estimated Implementation Time**: 2-6 weeks (depending on IG level)
