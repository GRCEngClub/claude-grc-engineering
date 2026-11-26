# HITRUST CSF Evidence Checklist

Generates comprehensive evidence collection checklists for HITRUST Common Security Framework (CSF) certification with focus on healthcare and HIPAA alignment (implementation levels 1-3).

> **Never commit evidence artifacts to source control.** The outputs below include real usernames, credential reports, MFA device states, and privileged-account inventories. `.gitignore` covers `evidence/` by default so `git add -A` will not sweep it up, but durable storage is your responsibility. Use an encrypted, access-controlled evidence locker (encrypted S3 with least-privilege IAM, a GRC platform, or a shared drive with full-disk encryption and MFA-gated access).

## Usage

```bash
/hitrust:evidence-checklist <control-id> [--implementation-level <1|2|3>] [--export <format>]
```

## Arguments

- `<control-id>`: HITRUST CSF control (e.g., "01.a", "09.ab", "10.h") or category (e.g., "Access Control", "Encryption")
- `--implementation-level`: Target implementation level (1, 2, or 3). Default: `2` (most common)
- `--export`: Export format (`json`, `csv`, `markdown`). Default: `markdown`

## Example: Access Control Evidence (Level 2 - HIPAA Aligned)

```bash
/hitrust:evidence-checklist "01.a" --implementation-level 2
```

**Output:**

```markdown
HITRUST CSF Evidence Checklist
Control: 01.a - User Registration
Implementation Level: Level 2 (HIPAA-aligned)
Mapped Frameworks: HIPAA §164.312(a)(2)(i), NIST 800-53 AC-2, ISO 27001 A.5.16
Assessment Type: Validated (third-party)
Certification Validity: 2 years

## Control Description (paraphrased)

The organization should operate a formal user onboarding and offboarding process so that access rights are granted, tracked, and revoked consistently. See your licensed HITRUST CSF for the authoritative control text.

## Implementation Level Requirements

### Level 1 (Basic)
- User registration process documented
- Access approval required
- User de-registration process exists

### Level 2 (HIPAA-aligned) - TARGET
- Level 1 + automated user provisioning/de-provisioning
- Access rights based on role
- Quarterly access reviews
- Integration with HR systems

### Level 3 (Advanced)
- Level 2 + real-time provisioning/de-provisioning
- Continuous access monitoring
- Automated access reviews
- Advanced analytics and reporting

## Evidence Requirements (Level 2)

### Required Documentation

□ **Access Control Policy**
  - Scope: All systems processing PHI (Protected Health Information)
  - Required elements:
    - User registration procedures
    - Role-based access control (RBAC) framework
    - Access approval workflow
    - De-registration procedures (within 24 hours of termination)
    - Quarterly access reviews
  - Update frequency: Annually
  - Approver: CISO and Privacy Officer
  - Evidence: Signed Access Control Policy v1.x

□ **Role-Based Access Control (RBAC) Matrix**
  - Definition of all roles (Physician, Nurse, Admin, Billing, etc.)
  - Permissions for each role
  - Systems/applications accessible by role
  - Evidence: RBAC matrix (Excel/documentation)
  - Frequency: Annual review, update when roles change

□ **User Access Request Form/Workflow**
  - Standard request form or ticketing system workflow
  - Required fields: Name, role, manager approval, HR verification
  - Evidence: Sample access request forms (10-25 samples)
  - Frequency: Quarterly review of samples

□ **Quarterly Access Review Procedure**
  - Documented procedure for quarterly access reviews
  - Manager sign-off on continued access need
  - Remediation process for inappropriate access
  - Evidence: Quarterly access review procedure document
  - Frequency: Quarterly execution

### Automated Evidence Collection

✓ **User Access Inventory**
```bash
# AWS IAM users accessing PHI systems
aws iam list-users --output json > evidence/hitrust-01a-iam-users-$(date +%Y%m%d).json

# IAM credential report (shows creation dates, last access)
aws iam generate-credential-report
aws iam get-credential-report --output text | base64 -d \
  > evidence/hitrust-01a-credential-report-$(date +%Y%m%d).csv

# Filter for PHI system access (based on tags)
aws iam list-users | jq -r '.Users[].UserName' | while read user; do
  tags=$(aws iam list-user-tags --user-name "$user" --query 'Tags[?Key==`PHI-Access`].Value' --output text)
  if [ ! -z "$tags" ]; then
    echo "$user,$tags" >> evidence/hitrust-01a-phi-access-users-$(date +%Y%m%d).csv
  fi
done

# Entra ID users (healthcare organizations)
az ad user list --output json > evidence/hitrust-01a-azure-users-$(date +%Y%m%d).json

# Filter guest users (external access to PHI requires scrutiny)
az ad user list --filter "userType eq 'Guest'" --output json \
  > evidence/hitrust-01a-guest-users-$(date +%Y%m%d).json
```

Collection Frequency: Monthly
Retention: 6 years (HIPAA record retention requirement)
Purpose: User registration inventory per HITRUST 01.a

✓ **User Provisioning/De-provisioning Logs**

```bash
# AWS CloudTrail - User creation events (last 90 days)
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=CreateUser \
  --start-time $(date -u -d '90 days ago' +%Y-%m-%dT%H:%M:%S) \
  --max-items 1000 \
  --output json > evidence/hitrust-01a-user-creation-$(date +%Y%m).json

# User deletion events (last 90 days)
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteUser \
  --start-time $(date -u -d '90 days ago' +%Y-%m-%dT%H:%M:%S) \
  --max-items 1000 \
  --output json > evidence/hitrust-01a-user-deletion-$(date +%Y%m).json

# Permission changes (AttachUserPolicy, DetachUserPolicy)
for event in AttachUserPolicy DetachUserPolicy; do
  aws cloudtrail lookup-events \
    --lookup-attributes AttributeKey=EventName,AttributeValue=$event \
    --start-time $(date -u -d '90 days ago' +%Y-%m-%dT%H:%M:%S) \
    --max-items 1000 \
    --output json >> evidence/hitrust-01a-permission-changes-$(date +%Y%m).json
done

# Entra ID audit logs
az monitor activity-log list \
  --caller 'Microsoft.Authorization' \
  --start-time $(date -u -d '90 days ago' +%Y-%m-%dT%H:%M:%S) \
  --output json > evidence/hitrust-01a-azure-audit-$(date +%Y%m).json
```

Collection Frequency: Monthly
Retention: 6 years
Purpose: Audit trail of user registration/de-registration

✓ **Role Assignments**

```bash
# AWS IAM - Users and their attached policies (roles)
for user in $(aws iam list-users --query 'Users[].UserName' --output text); do
  echo "=== $user ===" >> evidence/hitrust-01a-user-roles-$(date +%Y%m%d).txt
  aws iam list-attached-user-policies --user-name "$user" >> evidence/hitrust-01a-user-roles-$(date +%Y%m%d).txt
  aws iam list-user-policies --user-name "$user" >> evidence/hitrust-01a-user-roles-$(date +%Y%m%d).txt
  aws iam list-groups-for-user --user-name "$user" >> evidence/hitrust-01a-user-roles-$(date +%Y%m%d).txt
done

# AWS SSO permission sets (role assignments)
aws sso-admin list-permission-sets --instance-arn <INSTANCE-ARN> \
  --output json > evidence/hitrust-01a-sso-permission-sets-$(date +%Y%m%d).json

# Entra ID role assignments
az role assignment list --all --output json \
  > evidence/hitrust-01a-azure-role-assignments-$(date +%Y%m%d).json
```

Collection Frequency: Monthly
Retention: 6 years
Purpose: Role-based access control evidence

✓ **Access Review Evidence (Quarterly)**

```bash
# Generate access review report for managers
# This is typically a manual process, but can export current access for review

# Export all users with their roles for quarterly review
aws iam list-users | jq -r '.Users[] | .UserName' | while read user; do
  created=$(aws iam get-user --user-name "$user" --query 'User.CreateDate' --output text)
  groups=$(aws iam list-groups-for-user --user-name "$user" --query 'Groups[].GroupName' --output text)
  echo "$user,$created,$groups" >> evidence/hitrust-01a-access-review-Q$(date +%q)-$(date +%Y).csv
done

# Add header
sed -i '1i Username,CreatedDate,Groups' evidence/hitrust-01a-access-review-Q$(date +%q)-$(date +%Y).csv
```

Collection Frequency: Quarterly (Q1, Q2, Q3, Q4)
Retention: 6 years
Purpose: Quarterly access review requirement

### Manual Evidence Collection

□ **Quarterly Access Review Reports**

- Complete review of all user access every 90 days
- Required elements:
  - List of all users with PHI access at review start date
  - Manager certification of continued need for access
  - Identified inappropriate access
  - Remediation actions taken (within 30 days)
  - Senior management sign-off
- Evidence: 4 quarterly access review reports per year
- Frequency: Quarterly (Q1, Q2, Q3, Q4)
- **CRITICAL**: HITRUST Level 2 requires 4 consecutive quarters for i1 certification

□ **Access Request Approvals (Sample)**

- Sample size: 25 access requests from last quarter
- Required elements:
  - User name and role requested
  - Business justification
  - Manager approval (email/ticket)
  - HR verification (employee status)
  - Security team approval (for PHI access)
  - Access granted date (within 5 business days of approval)
  - Appropriate role assigned (matches RBAC matrix)
- Evidence: Folder of 25 approval tickets/emails
- Frequency: Quarterly review

□ **Termination Access Revocation (Sample)**

- Sample size: All terminations in last quarter (or 25 if >25)
- Required elements:
  - HR termination notice
  - Access revoked within 24 hours (HIPAA requirement)
  - Confirmation from IT (screenshot/log)
  - No subsequent access after termination (audit logs)
- Evidence: HR notices + revocation tickets + audit logs
- Frequency: Quarterly review

□ **HR System Integration Evidence**

- Integration between HR system (Workday, BambooHR, etc.) and IAM
- Automated provisioning workflow (hire → create account)
- Automated de-provisioning workflow (termination → disable/delete account)
- Evidence: Integration configuration screenshots, workflow diagrams
- Frequency: Annual review

□ **Emergency Access Procedures**

- Break-glass / emergency access procedures for PHI
- Required elements:
  - When emergency access is permitted
  - Approval process (or post-hoc review)
  - Audit logging of emergency access
  - Review frequency (within 24 hours)
- Evidence: Emergency access procedure document + usage logs (if any)
- Frequency: Annual review

## HITRUST Assessment Expectations

HITRUST Validated Assessors will verify:

### Documentation Review

✓ Access control policy comprehensive and approved
✓ RBAC matrix defined and current
✓ User registration procedures documented
✓ De-registration procedures documented (24-hour requirement for PHI)
✓ Quarterly access review procedures documented

### Implementation Review

✓ User provisioning automated (integration with HR)
✓ De-provisioning automated (<24 hours for PHI access)
✓ RBAC implemented (not everyone has admin access)
✓ Access approvals documented (samples reviewed)
✓ Quarterly access reviews performed (4 consecutive quarters)

### Testing Requirements

✓ Sample 25 access requests (test approval process)
✓ Sample 25 terminations (test <24hr revocation)
✓ Review 4 quarterly access review reports
✓ Test emergency access procedures

### Audit Trail

✓ CloudTrail/Entra ID logs show all access changes
✓ Logs retained for 6 years (HIPAA requirement)
✓ Logs centrally stored and protected from tampering

## Common HITRUST Assessment Findings

### Critical (Likely to fail i1 certification)

❌ No access control policy
❌ No quarterly access reviews (must show 4 consecutive quarters)
❌ De-provisioning >24 hours after termination
❌ No approval process for access requests
❌ No RBAC - everyone has same access level
❌ Audit logs not retained for 6 years

### Moderate (Corrective Action Plan required)

⚠️ Access review missing manager sign-offs
⚠️ Access request samples show unapproved access
⚠️ RBAC matrix not current (roles changed, matrix not updated)
⚠️ De-provisioning automated but >24 hours
⚠️ Some access not role-based (ad-hoc permissions)

### Minor (Observations)

⚠️ Access review documentation could be more detailed
⚠️ Emergency access procedures not tested
⚠️ HR integration manual (not automated)

## Remediation Guidance

### If No Quarterly Access Reviews

1. **Immediate (Week 1)**: Export all user access from all PHI systems
2. **Week 2**: Send access lists to managers for validation
3. **Week 3**: Collect manager sign-offs, identify inappropriate access
4. **Week 4**: Remediate identified access issues
5. **Ongoing**: Schedule quarterly (every 90 days) reviews

**Timeline**: Establish process immediately, but need 4 consecutive quarters for certification
**Priority**: 🔴 CRITICAL (required for i1 certification)

### If De-Provisioning >24 Hours

1. **Week 1**: Identify manual steps causing delay
2. **Week 2**: Automate HR → IAM integration (use Workday/BambooHR APIs)
3. **Weeks 3-4**: Test automated de-provisioning in non-prod
4. **Week 5**: Deploy to production
5. **Week 6**: Monitor and validate <24hr revocation

**Timeline**: 6-8 weeks
**Priority**: 🔴 CRITICAL (HIPAA requirement)

### If No RBAC

1. **Week 1**: Define standard roles (Physician, Nurse, Billing, Admin, etc.)
2. **Week 2**: Map current permissions to roles (create RBAC matrix)
3. **Weeks 3-4**: Assign users to roles (remove ad-hoc permissions)
4. **Week 5**: Test role assignments in non-prod
5. **Week 6**: Deploy to production, remove individual permissions

**Timeline**: 6-8 weeks
**Priority**: 🔴 CRITICAL (foundational control)

## Cross-References

### Related HITRUST CSF Controls

- 01.b - Privilege Management
- 01.c - User Password Management
- 01.f - Segregation of Duties
- 01.k - User Identification and Authentication
- 01.m - Teleworking (remote access for PHI)

### Maps to Other Frameworks

- **HIPAA**: §164.312(a)(2)(i) - Unique User Identification, §164.308(a)(3)(i) - Workforce security
- **NIST 800-53**: AC-2 (Account Management), AC-5 (Separation of Duties), AC-6 (Least Privilege)
- **ISO 27001:2022**: A.5.15 (Access control), A.5.16 (Identity management), A.5.18 (Access rights)
- **SOC 2**: CC6.1, CC6.2 (Logical and physical access controls)
- **PCI-DSS**: 8.1, 8.2 (User identification and authentication)

## Cost Estimates

### HITRUST CSF i1 Certification (Level 2, Small-Medium Healthcare Org)

- HITRUST readiness assessment: 80 hours ($8,000)
- Access control implementation (01.a + related): 120 hours ($12,000)
- RBAC matrix development: 40 hours ($4,000)
- HR system integration (automated provisioning): 80 hours ($8,000)
- Quarterly access reviews: 40 hours/quarter ($4,000/quarter)
- Validated assessment (external): $40k-$80k (depends on org size)
- **Total Year 1**: ~$72k-$112k (one-time) + $16k/year (quarterly reviews)

### HITRUST i1 Certification Ongoing

- Annual assessment: $40k-$80k/year
- Quarterly access reviews: $16k/year
- RBAC matrix updates: $2k/year
- **Ongoing**: ~$58k-$98k/year

### Tools

- Identity governance platform: $10k-$50k/year
- HR system integration: $5k-$15k/year
- GRC platform with HITRUST MyCSF: $15k-$40k/year

## Evidence Package Structure

```
evidence/
└── hitrust-csf-01a-access-control/
    ├── policies/
    │   ├── access-control-policy-v1.2-signed.pdf
    │   ├── rbac-matrix-2024.xlsx
    │   └── emergency-access-procedure.pdf
    ├── automated/
    │   ├── 2024-01/
    │   │   ├── iam-users-20240131.json
    │   │   ├── credential-report-20240131.csv
    │   │   ├── role-assignments-20240131.txt
    │   │   └── provision-deprovision-logs-202401.json
    │   └── ... (monthly)
    ├── quarterly-reviews/
    │   ├── Q1-2024-access-review.pdf
    │   ├── Q1-2024-manager-signoffs.pdf
    │   ├── Q2-2024-access-review.pdf
    │   ├── Q2-2024-manager-signoffs.pdf
    │   ├── Q3-2024-access-review.pdf
    │   ├── Q3-2024-manager-signoffs.pdf
    │   ├── Q4-2024-access-review.pdf
    │   └── Q4-2024-manager-signoffs.pdf (4 REQUIRED)
    ├── access-request-samples/
    │   ├── Q1-2024/
    │   │   ├── request-001-dr-smith.pdf
    │   │   ├── request-002-nurse-jones.pdf
    │   │   └── ... (25 samples)
    │   └── ... (quarterly)
    ├── termination-samples/
    │   ├── Q1-2024/
    │   │   ├── termination-001-revocation.pdf
    │   │   └── ... (all terminations)
    │   └── ... (quarterly)
    ├── hr-integration/
    │   ├── integration-architecture-diagram.pdf
    │   ├── provisioning-workflow-screenshots.pdf
    │   └── deprovisioning-workflow-screenshots.pdf
    └── README.md (evidence index, 6-year retention)
```

## Automation Script

```python
#!/usr/bin/env python3
"""
HITRUST CSF 01.a - User Registration Evidence Collection
For healthcare organizations pursuing HITRUST i1 certification
"""
import boto3
import json
import csv
from datetime import datetime
import os

class HITRUSTAccessControlEvidence:
    def __init__(self, output_dir="evidence/hitrust-csf-01a-access-control"):
        self.output_dir = f"{output_dir}/automated/{datetime.now().strftime('%Y-%m')}"
        self.timestamp = datetime.now().strftime("%Y%m%d")
        self.quarter = f"Q{(datetime.now().month-1)//3+1}-{datetime.now().year}"
        os.makedirs(self.output_dir, exist_ok=True)

    def collect_user_inventory(self):
        """Collect IAM user inventory"""
        print("Collecting user inventory (PHI access)...")
        iam = boto3.client('iam')

        users = iam.list_users()['Users']

        # Filter for PHI access (based on tags)
        phi_users = []
        for user in users:
            username = user['UserName']
            tags = iam.list_user_tags(UserName=username).get('Tags', [])
            if any(tag.get('Key') == 'PHI-Access' and tag.get('Value') == 'true' for tag in tags):
                phi_users.append({
                    'username': username,
                    'created': user['CreateDate'].isoformat(),
                    'arn': user['Arn'],
                    'tags': tags
                })

        # Save evidence
        output_file = f"{self.output_dir}/phi-access-users-{self.timestamp}.json"
        with open(output_file, 'w') as f:
            json.dump(phi_users, f, indent=2)

        print(f"✓ Total IAM users: {len(users)}")
        print(f"✓ PHI access users: {len(phi_users)}")

        return phi_users

    def collect_access_changes(self):
        """Collect user creation/deletion logs (last 90 days)"""
        print("Collecting access change logs (last 90 days)...")
        cloudtrail = boto3.client('cloudtrail')

        from datetime import datetime, timedelta
        start_time = datetime.now() - timedelta(days=90)
        end_time = datetime.now()

        # Track user lifecycle events
        events = ['CreateUser', 'DeleteUser', 'AttachUserPolicy', 'DetachUserPolicy']

        all_events = []
        for event_name in events:
            response = cloudtrail.lookup_events(
                LookupAttributes=[{
                    'AttributeKey': 'EventName',
                    'AttributeValue': event_name
                }],
                StartTime=start_time,
                EndTime=end_time,
                MaxResults=1000
            )
            all_events.extend(response.get('Events', []))

        # Save evidence
        output_file = f"{self.output_dir}/access-changes-{self.timestamp}.json"
        with open(output_file, 'w') as f:
            json.dump(all_events, f, indent=2, default=str)

        print(f"✓ Access change events: {len(all_events)}")

        return all_events

    def generate_quarterly_review_template(self, phi_users):
        """Generate template for quarterly access review"""
        review_file = f"evidence/hitrust-csf-01a-access-control/quarterly-reviews/{self.quarter}-access-review-template.txt"
        os.makedirs(os.path.dirname(review_file), exist_ok=True)

        template = f"""
HITRUST CSF 01.a - Quarterly Access Review
Review Period: {self.quarter}
Review Date: {datetime.now().strftime("%Y-%m-%d")}
Reviewer: [Name/Title of Qualified Individual]

INSTRUCTIONS FOR MANAGERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Review each user with PHI access and certify:
1. User still requires access to PHI for job duties
2. Access level is appropriate (least privilege)
3. User has completed annual HIPAA training

For each user, mark:
  ✓ = Access approved (continue)
  ✗ = Access should be revoked
  ↓ = Access should be reduced

USERS WITH PHI ACCESS ({len(phi_users)} total)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"""
        for idx, user in enumerate(phi_users, 1):
            template += f"""
{idx}. {user['username']}
   Created: {user['created']}
   Role/Tags: {', '.join(tag['Value'] for tag in user.get('tags', []))}

   Manager Decision: [ ] ✓ Approve  [ ] ✗ Revoke  [ ] ↓ Reduce
   Manager Name: _________________ Date: ___/___/___

"""

        template += """
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUMMARY
Total Users Reviewed: ______
Approved: ______
Revoked: ______
Reduced: ______

Qualified Individual Sign-Off:

Name: _________________________ Title: _________________

Signature: _____________________ Date: ___/___/___

Actions Required:
□ Revoke access for users marked ✗ (within 30 days)
□ Reduce access for users marked ↓ (within 30 days)
□ File this review in evidence folder (retain 6 years per HIPAA)
"""

        with open(review_file, 'w') as f:
            f.write(template)

        print(f"✓ Quarterly review template generated: {review_file}")
        print(f"  ACTION REQUIRED: Complete manager reviews for {self.quarter}")

        return review_file

    def generate_compliance_report(self, phi_users, access_changes):
        """Generate HITRUST 01.a compliance summary"""
        report = f"""
HITRUST CSF 01.a - User Registration Evidence Summary
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
Implementation Level: Level 2 (HIPAA-aligned)

USER INVENTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Users with PHI Access: {len(phi_users)}

ACCESS CHANGES (Last 90 days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Access Changes:   {len(access_changes)}

QUARTERLY ACCESS REVIEW STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current Quarter: {self.quarter}
Template Generated: ✓
Manager Reviews: ⏳ PENDING
Required for i1: 4 consecutive quarterly reviews

REQUIRED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Complete manager reviews for {self.quarter} (within 15 days)
□ Remediate inappropriate access (within 30 days)
□ Obtain Qualified Individual sign-off
□ File completed review (6-year retention)

Evidence Location: {self.output_dir}
Retention: 6 years (HIPAA §164.316(b)(2))
"""

        report_file = f"{self.output_dir}/compliance-summary-{self.timestamp}.txt"
        with open(report_file, 'w') as f:
            f.write(report)

        print(f"\n{report}")
        return report_file

if __name__ == "__main__":
    print("HITRUST CSF 01.a - User Registration Evidence Collection")
    print("=" * 70)
    print("Implementation Level: Level 2 (HIPAA-aligned)")
    print("=" * 70)

    collector = HITRUSTAccessControlEvidence()

    phi_users = collector.collect_user_inventory()
    access_changes = collector.collect_access_changes()
    collector.generate_quarterly_review_template(phi_users)
    collector.generate_compliance_report(phi_users, access_changes)

    print("\n✓ HITRUST 01.a evidence collection complete")
    print("⚠️  CRITICAL: Complete quarterly access review for certification")
```

---

**HITRUST CSF Version**: v11 (current)
**Implementation Level**: Level 2 (HIPAA-aligned) - Most common
**Certification Type**: i1 (Interim), r2 (Validated)
**Certification Validity**: 2 years
**Evidence Retention**: 6 years (HIPAA requirement)
**Priority**: 🔴 CRITICAL (Healthcare industry standard)
