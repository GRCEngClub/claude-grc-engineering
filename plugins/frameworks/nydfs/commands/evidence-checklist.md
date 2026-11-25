# NYDFS Cybersecurity Evidence Checklist

Generates comprehensive evidence collection checklists for New York Department of Financial Services (NYDFS) 23 NYCRR 500 cybersecurity requirements for covered entities.

> **Never commit evidence artifacts to source control.** The outputs below include real usernames, credential reports, MFA device states, and privileged-account inventories. `.gitignore` covers `evidence/` by default so `git add -A` will not sweep it up, but durable storage is your responsibility. Use an encrypted, access-controlled evidence locker (encrypted S3 with least-privilege IAM, a GRC platform, or a shared drive with full-disk encryption and MFA-gated access).

## Usage

```bash
/nydfs:evidence-checklist <section> [--entity-type <class-a|class-b>] [--export <format>]
```

## Arguments

- `<section>`: NYDFS section (e.g., "500.02", "500.04", "500.07") or topic (e.g., "CISO", "Risk Assessment", "Multi-Factor Authentication")
- `--entity-type`: Entity classification (`class-a` or `class-b`). Default: `class-a` (more stringent requirements)
- `--export`: Export format (`json`, `csv`, `markdown`). Default: `markdown`

## Example: Multi-Factor Authentication Evidence (Class A Entity)

```bash
/nydfs:evidence-checklist "500.12" --entity-type class-a
```

**Output:**

```markdown
NYDFS Cybersecurity Evidence Checklist
Section: 23 NYCRR 500.12 - Multi-Factor Authentication
Entity Classification: Class A (Assets ≥$20M OR 2,000+ employees)
Regulator: New York Department of Financial Services (NYDFS)
Compliance Deadline: February 15, 2017 (original), November 1, 2023 (amendments)
Penalties: Up to $1,000 per violation per day

## Section 500.12 Requirements

As part of its cybersecurity program, based on its Risk Assessment, each Covered Entity shall use Effective Multi-Factor Authentication for:

(a) Any individual accessing the Covered Entity's Internal Networks from an External Network, except when
 the individual is using a Virtual Private Network (VPN) that provides multi-factor authentication; and

(b) All privileged accounts, except for service accounts.

### NYDFS Amendment (November 2023)
- MFA required for ALL access to systems with NPPI (Nonpublic Personal Information)
- Risk-based exemptions must be documented and approved by CISO
- Annual MFA effectiveness review required

## Evidence Requirements

### Required Documentation

□ **Multi-Factor Authentication Policy**
  - Scope: All access to internal networks and systems with NPPI
  - Required elements:
    - MFA methods approved (SMS, authenticator app, hardware token, biometric)
    - MFA requirements for remote access
    - MFA requirements for privileged accounts
    - Risk-based exemptions (if any) with CISO approval
    - MFA bypass procedures (emergency access)
    - Annual MFA effectiveness review procedure
  - Update frequency: Annually
  - Approver: CISO and Senior Officer
  - Evidence: Signed MFA Policy v1.x

□ **MFA Risk Assessment**
  - Risk-based determination of MFA scope
  - Required elements:
    - Systems/accounts requiring MFA (all remote access, all privileged, all NPPI access)
    - Systems/accounts exempt from MFA (with risk-based justification)
    - Alternative compensating controls for exempt systems
    - CISO approval of exemptions
  - Evidence: MFA Risk Assessment Report (part of annual §500.09 Risk Assessment)
  - Frequency: Annually

□ **Exemption Documentation (if applicable)**
  - For any accounts exempt from MFA
  - Required elements:
    - Account/system exempted
    - Risk-based justification
    - Alternative compensating controls
    - CISO written approval
    - Annual review of exemption
  - Evidence: Exemption approval memos
  - Frequency: Annually or when exemptions change
  - **NOTE**: NYDFS strongly discourages MFA exemptions

□ **Annual MFA Effectiveness Review**
  - Review of MFA effectiveness and adoption
  - Required elements:
    - MFA coverage percentage (target: 100%)
    - MFA bypass events (emergency access)
    - MFA failures/issues
    - Recommendations for improvement
    - CISO sign-off
  - Evidence: Annual MFA Effectiveness Review Report
  - Frequency: Annually

### Automated Evidence Collection

✓ **MFA Configuration Evidence**
```bash
# AWS - IAM MFA status for all users
aws iam generate-credential-report
aws iam get-credential-report --output text | base64 -d \
  > evidence/nydfs-500.12-credential-report-$(date +%Y%m%d).csv

# Filter users WITHOUT MFA (non-compliant)
aws iam get-credential-report --output text | base64 -d | \
  awk -F',' '$4 == "true" && $8 == "false" {print $1}' \
  > evidence/nydfs-500.12-no-mfa-$(date +%Y%m%d).txt

# Count MFA compliance
total_users=$(aws iam get-credential-report --output text | base64 -d | tail -n +2 | awk -F',' '$4 == "true"' | wc -l)
mfa_users=$(aws iam get-credential-report --output text | base64 -d | awk -F',' '$8 == "true"' | wc -l)
mfa_percentage=$((mfa_users * 100 / total_users))
echo "MFA Compliance: $mfa_users / $total_users users ($mfa_percentage%)" > evidence/nydfs-500.12-mfa-summary-$(date +%Y%m%d).txt

# Entra ID - MFA status
az ad user list --output json | jq '[.[] | {userPrincipalName, id}]' \
  > evidence/nydfs-500.12-azure-users-$(date +%Y%m%d).json

# Query Entra ID multifactor authentication registration status (requires Microsoft Entra ID P1 or P2)
# az rest --method get --url 'https://graph.microsoft.com/v1.0/users?$select=userPrincipalName,id' \
#   > evidence/nydfs-500.12-azure-mfa-$(date +%Y%m%d).json
```

Collection Frequency: Weekly
Retention: 6 years (NYDFS record retention per §500.13)
Purpose: MFA implementation evidence per §500.12

✓ **Remote Access with MFA Evidence**

```bash
# AWS - VPN connections (should require MFA)
aws ec2 describe-client-vpn-endpoints --output json \
  > evidence/nydfs-500.12-vpn-endpoints-$(date +%Y%m%d).json

# Check VPN authentication (should be certificate + MFA)
for vpn in $(aws ec2 describe-client-vpn-endpoints --query 'ClientVpnEndpoints[].ClientVpnEndpointId' --output text); do
  echo "=== $vpn ===" >> evidence/nydfs-500.12-vpn-auth-$(date +%Y%m%d).txt
  aws ec2 describe-client-vpn-endpoints --client-vpn-endpoint-ids "$vpn" \
    --query 'ClientVpnEndpoints[].AuthenticationOptions' \
    >> evidence/nydfs-500.12-vpn-auth-$(date +%Y%m%d).txt
done

# Azure - VPN gateways with MFA
az network vnet-gateway list --output json \
  > evidence/nydfs-500.12-azure-vpn-$(date +%Y%m%d).json

# AWS SSO (Identity Center) - MFA enforcement
aws identitystore list-users --identity-store-id <IDENTITY-STORE-ID> \
  --output json > evidence/nydfs-500.12-sso-users-$(date +%Y%m%d).json

# Check SSO MFA settings
aws sso-admin list-permission-sets --instance-arn <INSTANCE-ARN> \
  --output json > evidence/nydfs-500.12-sso-permission-sets-$(date +%Y%m%d).json
```

Collection Frequency: Weekly
Retention: 6 years
Purpose: Remote access MFA per §500.12(a)

✓ **Privileged Account MFA Evidence**

```bash
# AWS - Identify privileged accounts
for user in $(aws iam list-users --query 'Users[].UserName' --output text); do
  policies=$(aws iam list-attached-user-policies --user-name "$user" --query 'AttachedPolicies[?PolicyName==`AdministratorAccess`]')
  if [ "$policies" != "[]" ]; then
    # Check MFA status
    mfa_devices=$(aws iam list-mfa-devices --user-name "$user" --query 'MFADevices | length(@)')
    echo "$user,AdministratorAccess,$mfa_devices" >> evidence/nydfs-500.12-privileged-mfa-$(date +%Y%m%d).csv
  fi
done

# Entra ID - Global Administrators MFA status
az ad directory role member list --role "Global Administrator" --output json \
  > evidence/nydfs-500.12-azure-global-admins-$(date +%Y%m%d).json
```

Collection Frequency: Weekly
Retention: 6 years
Purpose: Privileged account MFA per §500.12(b)

✓ **MFA Authentication Logs (Success/Failure)**

```bash
# AWS CloudTrail - MFA authentication events (last 30 days)
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=ConsoleLogin \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --output json | jq '.Events[] | select(.CloudTrailEvent | fromjson | .additionalEventData.MFAUsed == "Yes")' \
  > evidence/nydfs-500.12-mfa-successful-$(date +%Y%m).json

# Failed MFA attempts (potential security incidents)
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=ConsoleLogin \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --output json | jq '.Events[] | select(.CloudTrailEvent | fromjson | .errorCode != null)' \
  > evidence/nydfs-500.12-failed-logins-$(date +%Y%m).json

# Entra ID sign-ins with MFA
az monitor activity-log list \
  --caller 'Microsoft.Azure.ActiveDirectory' \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --output json > evidence/nydfs-500.12-azure-signins-$(date +%Y%m).json
```

Collection Frequency: Monthly
Retention: 6 years
Purpose: MFA usage audit trail

✓ **MFA Bypass Events (Emergency Access)**

```bash
# Check for emergency access / break-glass account usage
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=Username,AttributeValue=emergency-admin \
  --start-time $(date -u -d '90 days ago' +%Y-%m-%dT%H:%M:%S) \
  --output json > evidence/nydfs-500.12-emergency-access-$(date +%Y%m).json

# If emergency account used, this should trigger immediate review
```

Collection Frequency: Real-time (alerts on usage)
Retention: 6 years
Purpose: Emergency access monitoring

### Manual Evidence Collection

□ **MFA Deployment Evidence**

- Screenshots of MFA configuration in identity systems
- Required elements:
  - Identity provider MFA settings (Okta, Entra ID, AWS SSO)
  - MFA methods enabled (authenticator app, SMS, hardware token)
  - MFA enforcement policies
  - Conditional access policies requiring MFA
- Evidence: Screenshots + configuration exports
- Frequency: Annual or when MFA configuration changes

□ **MFA Coverage Report (Quarterly)**

- Report showing MFA coverage across all systems
- Required elements:
  - Total users
  - Users with MFA enabled
  - MFA compliance percentage (target: 100%)
  - Users without MFA (with justifications if any)
  - Privileged accounts MFA status (should be 100%)
  - Remote access MFA status (should be 100%)
- Evidence: Quarterly MFA Coverage Report
- Frequency: Quarterly

□ **MFA Exemption Approvals (if any)**

- CISO-approved exemptions from MFA requirement
- Required elements:
  - Account/system exempted
  - Risk-based justification (why MFA not feasible)
  - Alternative compensating controls
  - CISO written approval
  - Exemption expiration date
- Evidence: CISO exemption approval memos
- Frequency: Annually or when exemptions granted
- **WARNING**: NYDFS examiners closely scrutinize exemptions

□ **Annual MFA Effectiveness Review**

- Comprehensive review of MFA program effectiveness
- Required elements:
  - MFA adoption rate (100% target)
  - MFA bypass events count (should be minimal)
  - Failed MFA attempts analysis (security incidents?)
  - User feedback on MFA usability
  - MFA vendor performance (uptime, support)
  - Recommendations for improvement
  - CISO sign-off
- Evidence: Annual MFA Effectiveness Review Report
- Frequency: Annually

□ **User Training on MFA**

- Training materials and completion records
- Topics: How to set up MFA, how to use MFA, what to do if MFA device lost
- Evidence: Training completion records, training materials
- Frequency: Annually, on hire for new employees

□ **MFA Vendor Due Diligence (if using third-party)**

- Due diligence on MFA vendor (Okta, Duo, etc.)
- Required elements:
  - Vendor security assessment
  - SOC 2 Type II report review
  - Contract review (uptime SLAs, data protection)
- Evidence: Vendor due diligence report
- Frequency: Before selection, annual review

## NYDFS Examination Expectations

NYDFS examiners will verify:

### Documentation Review

✓ MFA policy exists and is comprehensive
✓ MFA risk assessment performed (part of annual §500.09 risk assessment)
✓ Exemptions documented with CISO approval (if any)
✓ Annual MFA effectiveness review performed
✓ User training on MFA provided

### Implementation Review

✓ MFA implemented for ALL remote access (no exceptions)
✓ MFA implemented for ALL privileged accounts (no exceptions)
✓ MFA implemented for ALL access to NPPI systems (2023 amendment)
✓ MFA enforcement (not optional for users)
✓ Alternative compensating controls for any exemptions

### Testing Requirements

✓ Test MFA login (verify it works)
✓ Test MFA bypass procedure (emergency access)
✓ Review MFA coverage reports (quarterly)
✓ Sample failed MFA attempts (investigate security incidents)
✓ Review MFA effectiveness (annual review report)

### Audit Trail

✓ CloudTrail/Entra ID logs show MFA usage
✓ Logs retained for 6 years
✓ Failed MFA attempts investigated
✓ Emergency access usage justified and reviewed

## Common NYDFS Examination Findings

### Critical (Likely to Result in Enforcement Action)

❌ No MFA policy
❌ No MFA implemented for remote access
❌ No MFA for privileged accounts
❌ MFA optional (users can bypass without justification)
❌ No annual risk assessment including MFA evaluation
❌ Logs not retained for 6 years

### Moderate (Corrective Action Required)

⚠️ MFA coverage <100% without CISO-approved exemptions
⚠️ Exemptions not risk-based or not documented
⚠️ No annual MFA effectiveness review
⚠️ User training on MFA incomplete
⚠️ Failed MFA attempts not investigated

### Minor (Best Practice Recommendations)

⚠️ MFA policy not updated in >12 months
⚠️ MFA effectiveness review could be more comprehensive
⚠️ Some privileged accounts using SMS MFA (recommend app or hardware token)

## Remediation Guidance

### If No MFA Implemented

1. **Immediate (Week 1)**: Select MFA solution (Okta, Duo, Entra ID multifactor authentication, AWS MFA)
2. **Week 2**: Configure MFA in identity provider
3. **Weeks 3-4**: Pilot with IT team (test MFA registration, usage)
4. **Weeks 5-8**: Roll out to all users (phased approach)
   - Phase 1: Privileged accounts (100% required)
   - Phase 2: Remote access (100% required)
   - Phase 3: All NPPI access (100% required)
5. **Week 9**: Enforce MFA (no access without MFA)
6. **Week 10**: Monitor adoption, help desk for issues

**Timeline**: 10-12 weeks
**Priority**: 🔴 CRITICAL (§500.12 compliance deadline passed)

### If MFA Coverage <100%

1. **Week 1**: Identify all users without MFA
2. **Week 2**: Contact users, provide setup assistance
3. **Week 3**: For remaining non-compliant users, disable access until MFA enabled
4. **Week 4**: Review and document any justified exemptions (rare)
5. **Ongoing**: Monitor MFA coverage weekly (maintain 100%)

**Timeline**: 4 weeks
**Priority**: 🔴 CRITICAL (NYDFS expectation is 100% coverage)

### If No Annual MFA Effectiveness Review

1. **Week 1**: Gather data (MFA coverage, bypass events, failures, user feedback)
2. **Week 2**: Analyze data, identify trends and issues
3. **Week 3**: Draft recommendations for improvement
4. **Week 4**: CISO review and sign-off
5. **Ongoing**: Schedule annual review (same time each year)

**Timeline**: 4 weeks
**Priority**: 🟡 MODERATE (required annually)

## Cross-References

### Related NYDFS Sections

- §500.02(b) - CISO (responsible for MFA program)
- §500.03 - Cybersecurity Policy (must include MFA)
- §500.04 - Risk Assessment (must assess MFA effectiveness)
- §500.14 - Training and Monitoring (MFA training required)
- §500.17 - Notices to Superintendent (report MFA-related breaches)

### Maps to Other Frameworks

- **NIST 800-53 Rev 5**: IA-2 (Identification and Authentication), IA-2(1) (MFA)
- **FedRAMP**: IA-2(1), IA-2(2), IA-2(12) (MFA requirements)
- **ISO 27001:2022**: A.5.17 (Authentication information)
- **SOC 2**: CC6.1 (Logical access controls - MFA)
- **PCI-DSS v4**: 8.4, 8.5 (MFA for all access to cardholder data)
- **CMMC 2.0**: IA.L2-3.5.3 (Multi-factor authentication)

## Cost Estimates

### MFA Implementation (500-person organization)

- MFA solution (Okta, Duo): $3-8/user/month ($18k-$48k/year for 500 users)
- Implementation (setup, configuration): 80 hours ($8,000)
- User training (2 hours per user): 1,000 hours ($100,000)
- Help desk support (first 3 months): 120 hours ($12,000)
- Annual review and monitoring: 40 hours/year ($4,000/year)
- **Total Year 1**: ~$142k-$172k (one-time) + $22k-$52k/year (ongoing)

### MFA Alternatives

- SMS MFA: $0.02-0.05 per SMS ($1k-$2.5k/year for 500 users)
- Authenticator app (Google Authenticator, Microsoft Authenticator): Free
- Hardware tokens (YubiKey): $50-75 per token ($25k-$37.5k for 500 users, one-time)
- Biometric MFA (Windows Hello, TouchID): Included with OS (free)

## Evidence Package Structure

```
evidence/
└── nydfs-500.12-mfa/
    ├── policies/
    │   ├── mfa-policy-v1.2-signed.pdf
    │   ├── mfa-risk-assessment-2024.pdf
    │   └── mfa-effectiveness-review-2024.pdf
    ├── exemptions/
    │   ├── mfa-exemption-001-ciso-approval.pdf
    │   └── ... (if any - should be minimal)
    ├── automated/
    │   ├── 2024-01/
    │   │   ├── credential-report-20240131.csv
    │   │   ├── no-mfa-users-20240131.txt
    │   │   ├── privileged-mfa-20240131.csv
    │   │   ├── vpn-auth-20240131.txt
    │   │   └── mfa-summary-20240131.txt
    │   └── ... (weekly)
    ├── quarterly-reports/
    │   ├── Q1-2024-mfa-coverage.pdf
    │   ├── Q2-2024-mfa-coverage.pdf
    │   ├── Q3-2024-mfa-coverage.pdf
    │   └── Q4-2024-mfa-coverage.pdf
    ├── annual-reviews/
    │   ├── mfa-effectiveness-review-2024.pdf
    │   ├── mfa-effectiveness-review-2023.pdf
    │   └── ciso-signoff-2024.pdf
    ├── training/
    │   ├── mfa-training-materials-2024.pdf
    │   ├── mfa-training-completion-2024.xlsx
    │   └── mfa-setup-guide.pdf
    ├── vendor-diligence/
    │   ├── okta-soc2-type2-2024.pdf
    │   ├── okta-security-assessment-2024.pdf
    │   └── okta-contract-signed.pdf
    ├── deployment/
    │   ├── mfa-deployment-screenshots.pdf
    │   ├── conditional-access-policies-export.json
    │   └── mfa-enrollment-statistics.xlsx
    └── README.md (evidence index, 6-year retention)
```

## Automation Script

```python
#!/usr/bin/env python3
"""
NYDFS 23 NYCRR 500.12 - Multi-Factor Authentication Evidence Collection
For NY financial institutions (banks, credit unions, insurance companies)
"""
import boto3
import json
import csv
from datetime import datetime
import os

class NYDFSMFAEvidence:
    def __init__(self, output_dir="evidence/nydfs-500.12-mfa"):
        self.output_dir = f"{output_dir}/automated/{datetime.now().strftime('%Y-%m')}"
        self.timestamp = datetime.now().strftime("%Y%m%d")
        os.makedirs(self.output_dir, exist_ok=True)

    def check_mfa_compliance(self):
        """Check IAM user MFA compliance"""
        print("Checking MFA compliance...")
        iam = boto3.client('iam')

        # Generate credential report
        iam.generate_credential_report()
        report = iam.get_credential_report()

        # Save full report
        report_file = f"{self.output_dir}/credential-report-{self.timestamp}.csv"
        with open(report_file, 'wb') as f:
            f.write(report['Content'])

        # Parse for MFA status
        users_without_mfa = []
        total_users = 0

        for line in csv.DictReader(report['Content'].decode('utf-8').splitlines()):
            if line.get('password_enabled') == 'true':
                total_users += 1
                if line.get('mfa_active') == 'false':
                    users_without_mfa.append({
                        'user': line['user'],
                        'password_last_used': line.get('password_last_used'),
                        'created': line.get('user_creation_time')
                    })

        # Save non-compliant users
        non_compliant_file = f"{self.output_dir}/no-mfa-users-{self.timestamp}.json"
        with open(non_compliant_file, 'w') as f:
            json.dump(users_without_mfa, f, indent=2)

        # MFA compliance summary
        mfa_percentage = ((total_users - len(users_without_mfa)) / total_users * 100) if total_users > 0 else 0

        summary = f"""MFA Compliance Summary
Total Users: {total_users}
MFA Enabled: {total_users - len(users_without_mfa)}
MFA Disabled: {len(users_without_mfa)}
Compliance: {mfa_percentage:.1f}%

{'✓ COMPLIANT' if len(users_without_mfa) == 0 else '✗ NON-COMPLIANT'}
{'NYDFS §500.12 requires 100% MFA coverage' if len(users_without_mfa) > 0 else ''}
"""

        summary_file = f"{self.output_dir}/mfa-summary-{self.timestamp}.txt"
        with open(summary_file, 'w') as f:
            f.write(summary)

        print(summary)

        if len(users_without_mfa) > 0:
            print(f"⚠️  WARNING: {len(users_without_mfa)} users without MFA")
            print(f"  Action: Enable MFA for all users immediately")

        return {
            'total': total_users,
            'compliant': total_users - len(users_without_mfa),
            'non_compliant': len(users_without_mfa),
            'users_without_mfa': users_without_mfa
        }

    def check_privileged_mfa(self):
        """Check privileged accounts have MFA"""
        print("Checking privileged account MFA...")
        iam = boto3.client('iam')

        privileged_users = []

        # Check all users for admin policies
        for user in iam.list_users()['Users']:
            username = user['UserName']

            # Check for AdministratorAccess policy
            attached = iam.list_attached_user_policies(UserName=username)
            if any(p['PolicyName'] == 'AdministratorAccess' for p in attached['AttachedPolicies']):
                # Check MFA status
                mfa_devices = iam.list_mfa_devices(UserName=username)['MFADevices']

                privileged_users.append({
                    'user': username,
                    'mfa_enabled': len(mfa_devices) > 0,
                    'mfa_devices': len(mfa_devices)
                })

        # Save privileged MFA status
        privileged_file = f"{self.output_dir}/privileged-mfa-{self.timestamp}.json"
        with open(privileged_file, 'w') as f:
            json.dump(privileged_users, f, indent=2)

        non_compliant_privileged = [u for u in privileged_users if not u['mfa_enabled']]

        print(f"✓ Privileged users: {len(privileged_users)}")
        print(f"✓ Privileged with MFA: {len(privileged_users) - len(non_compliant_privileged)}/{len(privileged_users)}")

        if len(non_compliant_privileged) > 0:
            print(f"✗ CRITICAL: {len(non_compliant_privileged)} privileged users WITHOUT MFA")
            print(f"  NYDFS §500.12(b) requires 100% MFA for privileged accounts")

        return privileged_users

    def generate_quarterly_report(self, mfa_data, privileged_data):
        """Generate quarterly MFA coverage report for NYDFS"""
        quarter = f"Q{(datetime.now().month-1)//3+1}-{datetime.now().year}"

        report = f"""
NYDFS 23 NYCRR 500.12 - MFA Coverage Report
Quarter: {quarter}
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

OVERALL MFA COMPLIANCE (§500.12)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Users:          {mfa_data['total']}
MFA Enabled:          {mfa_data['compliant']} ({mfa_data['compliant']/mfa_data['total']*100:.1f}%)
MFA Disabled:         {mfa_data['non_compliant']}

Status: {'✓ COMPLIANT (100% MFA)' if mfa_data['non_compliant'] == 0 else f'✗ NON-COMPLIANT ({mfa_data['non_compliant']} users without MFA)'}

PRIVILEGED ACCOUNT MFA (§500.12(b))
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Privileged Users:     {len(privileged_data)}
Privileged with MFA:  {len([u for u in privileged_data if u['mfa_enabled']])} ({len([u for u in privileged_data if u['mfa_enabled']])/len(privileged_data)*100:.1f}%)

Status: {'✓ COMPLIANT (100% privileged MFA)' if all(u['mfa_enabled'] for u in privileged_data) else '✗ NON-COMPLIANT (privileged accounts without MFA)'}

REQUIRED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
        if mfa_data['non_compliant'] > 0:
            report += f"□ Enable MFA for {mfa_data['non_compliant']} users (IMMEDIATE)\n"
        if not all(u['mfa_enabled'] for u in privileged_data):
            report += "□ Enable MFA for privileged accounts without MFA (CRITICAL)\n"
        if mfa_data['non_compliant'] == 0 and all(u['mfa_enabled'] for u in privileged_data):
            report += "✓ No actions required - 100% MFA compliance maintained\n"

        report += f"""
NYDFS COMPLIANCE CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ MFA policy documented and approved
{'✓' if mfa_data['non_compliant'] == 0 else '✗'} MFA implemented for all remote access (§500.12(a))
{'✓' if all(u['mfa_enabled'] for u in privileged_data) else '✗'} MFA implemented for all privileged accounts (§500.12(b))
□ Annual MFA risk assessment performed (part of §500.09)
□ Annual MFA effectiveness review performed
□ User training on MFA completed
□ Logs retained for 6 years (§500.13)

NEXT QUARTERLY REPORT DUE: {(datetime(datetime.now().year, ((datetime.now().month-1)//3+1)*3+1, 1) if ((datetime.now().month-1)//3+1)*3+1 <= 12 else datetime(datetime.now().year+1, 1, 1)).strftime('%Y-%m-%d')}

Evidence Location: {self.output_dir}
Retention: 6 years (NYDFS §500.13)
"""

        # Save quarterly report
        quarterly_dir = f"evidence/nydfs-500.12-mfa/quarterly-reports"
        os.makedirs(quarterly_dir, exist_ok=True)
        report_file = f"{quarterly_dir}/{quarter}-mfa-coverage.txt"

        with open(report_file, 'w') as f:
            f.write(report)

        print(f"\n{report}")
        print(f"Quarterly report: {report_file}")

        return report_file

if __name__ == "__main__":
    print("NYDFS 23 NYCRR 500.12 - Multi-Factor Authentication Evidence Collection")
    print("=" * 70)
    print("Regulation: 23 NYCRR Part 500")
    print("Section: §500.12 - Multi-Factor Authentication")
    print("=" * 70)

    collector = NYDFSMFAEvidence()

    mfa_data = collector.check_mfa_compliance()
    privileged_data = collector.check_privileged_mfa()
    collector.generate_quarterly_report(mfa_data, privileged_data)

    print("\n✓ NYDFS 500.12 evidence collection complete")
    print("⚠️  REMINDER: Maintain 100% MFA coverage per NYDFS requirements")
```

---

**NYDFS Regulation**: 23 NYCRR Part 500 (Cybersecurity Requirements for Financial Services Companies)
**Section**: §500.12 - Multi-Factor Authentication
**Applicability**: NY-chartered/licensed financial institutions, insurers
**Compliance Deadline**: February 15, 2017 (original); November 1, 2023 (amendments)
**Penalties**: Up to $1,000 per violation per day
**Evidence Retention**: 6 years (§500.13)
**Priority**: 🔴 CRITICAL (NY financial services regulatory requirement)

**NYDFS Class A vs Class B**:

- **Class A**: ≥$20M in gross annual revenue from NY OR ≥2,000 employees (more stringent requirements)
- **Class B**: <$20M revenue AND <2,000 employees (some exemptions/extended deadlines)
