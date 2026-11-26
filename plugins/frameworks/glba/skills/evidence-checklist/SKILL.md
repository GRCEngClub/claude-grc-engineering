---
name: evidence-checklist
description: "Generates comprehensive evidence collection checklists for Gramm-Leach-Bliley Act (GLBA) Safeguards Rule and Privacy Rule compliance for financial institutions"
---

# GLBA Evidence Checklist

Generates comprehensive evidence collection checklists for Gramm-Leach-Bliley Act (GLBA) Safeguards Rule and Privacy Rule compliance for financial institutions.

> **Never commit evidence artifacts to source control.** The outputs below include real usernames, credential reports, MFA device states, and privileged-account inventories. `.gitignore` covers `evidence/` by default so `git add -A` will not sweep it up, but durable storage is your responsibility. Use an encrypted, access-controlled evidence locker (encrypted S3 with least-privilege IAM, a GRC platform, or a shared drive with full-disk encryption and MFA-gated access).

## Usage

```bash
/glba:evidence-checklist <rule-section> [--institution-type <bank|broker|insurer>] [--export <format>]
```

## Arguments

- `<rule-section>`: GLBA section (e.g., "Safeguards Rule", "Privacy Rule", "§314.4(b)") or topic (e.g., "Information Security Program", "Customer Privacy Notices")
- `--institution-type`: Type of financial institution (`bank`, `broker`, `insurer`, `other`). Default: `bank`
- `--export`: Export format (`json`, `csv`, `markdown`). Default: `markdown`

## Example: Safeguards Rule - Information Security Program Evidence

```bash
/glba:evidence-checklist "Safeguards Rule" --institution-type bank
```

**Output:**

```markdown
GLBA Evidence Checklist
Regulation: Safeguards Rule (16 CFR Part 314)
Institution Type: Bank / Credit Union
Regulator: FTC (Federal Trade Commission) / FDIC / OCC / NCUA (depending on charter)
Effective Date: December 9, 2022 (amended rule)
Penalties: Up to \$46,517 per violation per day

## Safeguards Rule Requirements

The Safeguards Rule requires financial institutions to develop, implement, and maintain a comprehensive information security program that contains administrative, technical, and physical safeguards to protect customer information.

### Core Requirements (§314.4)

1. **Qualified Individual** - Designate qualified individual to oversee information security program
2. **Risk Assessment** - Conduct periodic risk assessments
3. **Safeguards Design** - Design and implement safeguards to control identified risks
4. **Monitoring and Testing** - Regular monitoring and testing of safeguards
5. **Training** - Security awareness training for personnel
6. **Service Provider Oversight** - Due diligence and contractual protections for service providers
7. **Change Management** - Evaluate and adjust program based on monitoring, testing, changes
8. **Incident Response** - Written incident response plan
9. **Reporting to Board** - Annual report to board of directors or equivalent

## Evidence Requirements

### Required Documentation

□ **Written Information Security Program (WISP)**
  - Comprehensive documentation of information security program
  - Required elements per §314.4(a):
    - Designated Qualified Individual
    - Risk assessment procedures
    - Safeguards to control risks
    - Monitoring and testing program
    - Personnel training program
    - Service provider oversight
    - Change management procedures
    - Incident response plan
  - Update frequency: Annually or when material changes
  - Approver: Board of Directors or Senior Officer
  - Evidence: Board-approved WISP v1.x with meeting minutes

□ **Qualified Individual Designation**
  - Written designation of Qualified Individual (§314.4(a))
  - Name, title, qualifications
  - Responsibilities and authority
  - Evidence: Designation letter, organizational chart
  - Frequency: Annual review

□ **Risk Assessment (Annual)**
  - Comprehensive assessment of risks to customer information (§314.4(b))
  - Required elements:
    - Criteria for evaluating and categorizing identified security risks or threats
    - Criteria for assessing confidentiality, integrity, availability of customer information
    - Requirements describing how identified risks will be mitigated or accepted
    - Periodic risk assessments (at least annually)
  - Evidence: Annual Risk Assessment Report (signed by Qualified Individual)
  - Frequency: Annually minimum

□ **Safeguards Documentation (§314.4(c))**
  - Access controls (user authentication, access rights)
  - Encryption of customer information at rest (if feasible)
  - Encryption of customer information in transit
  - Secure development practices
  - Multi-factor authentication (MFA) for accessing customer information
  - Disposal procedures for customer information
  - Change management procedures
  - Evidence: Technical safeguards documentation, policies

□ **Monitoring and Testing Program (§314.4(d))**
  - Continuous monitoring or periodic penetration testing
  - Periodic vulnerability assessments (at least annually)
  - Annual penetration testing
  - Evidence: Monitoring dashboards, vulnerability scan reports, penetration test reports
  - Frequency: Continuous (monitoring), annually (vulnerability assessments + penetration tests)

□ **Personnel Training Program (§314.4(e))**
  - Security awareness training for all personnel
  - Required topics: Safeguards Rule requirements, customer information handling, incident reporting
  - Evidence: Training materials, completion records, attendance logs
  - Frequency: Annually, on hire for new employees

□ **Service Provider Oversight (§314.4(f))**
  - Due diligence before engaging service provider
  - Contracts requiring safeguards for customer information
  - Periodic assessments of service providers
  - Evidence: Service provider inventory, due diligence reports, contracts with security clauses
  - Frequency: Before engagement, annual review

□ **Incident Response Plan (§314.4(h))**
  - Written plan for responding to security events
  - Required elements:
    - Goals of incident response plan
    - Internal processes for responding to incidents
    - Clear roles, responsibilities, decision-making authority
    - External and internal communications and information sharing
    - Incident containment and mitigation
    - Documentation and reporting requirements
    - Evaluation and revision following incidents
  - Evidence: Incident Response Plan v1.x
  - Frequency: Annual review, update after incidents

□ **Annual Report to Board of Directors (§314.4(i))**
  - Written report to board (or equivalent) at least annually
  - Required content:
    - Overall status of information security program
    - Compliance with Safeguards Rule
    - Material matters related to program (risk assessment, assessments, incidents)
  - Evidence: Annual Board Report, Board meeting minutes acknowledging report
  - Frequency: Annually

### Automated Evidence Collection

✓ **Encryption at Rest Evidence (§314.4(c)(3))**
```bash
# AWS - S3 bucket encryption (customer data)
aws s3api list-buckets --output json | jq -r '.Buckets[].Name' | while read bucket; do
  encryption=$(aws s3api get-bucket-encryption --bucket "$bucket" 2>&1)
  if echo "$encryption" | grep -q "ServerSideEncryptionConfigurationNotFoundError"; then
    echo "$bucket,NOT ENCRYPTED" >> evidence/glba-s3-encryption-$(date +%Y%m%d).csv
  else
    echo "$bucket,ENCRYPTED" >> evidence/glba-s3-encryption-$(date +%Y%m%d).csv
  fi
done

# RDS encryption
aws rds describe-db-instances \
  --query 'DBInstances[].[DBInstanceIdentifier,StorageEncrypted,KmsKeyId]' \
  --output json > evidence/glba-rds-encryption-$(date +%Y%m%d).json

# EBS volumes (ensure customer data volumes encrypted)
aws ec2 describe-volumes \
  --filters "Name=tag:DataClassification,Values=CustomerInformation" \
  --query 'Volumes[].[VolumeId,Encrypted,KmsKeyId]' \
  --output json > evidence/glba-ebs-encryption-$(date +%Y%m%d).json
```

Collection Frequency: Monthly
Retention: 5 years (typical financial services record retention)
Purpose: Demonstrates encryption at rest per §314.4(c)(3)

✓ **Encryption in Transit Evidence (§314.4(c)(4))**

```bash
# Application Load Balancer - HTTPS enforcement
aws elbv2 describe-load-balancers --output json | \
  jq '.LoadBalancers[] | {Name: .LoadBalancerName, Scheme: .Scheme}' \
  > evidence/glba-alb-$(date +%Y%m%d).json

# Check for HTTP listeners (should redirect to HTTPS)
aws elbv2 describe-listeners --load-balancer-arn <ARN> | \
  jq '.Listeners[] | select(.Protocol == "HTTP" and .DefaultActions[].Type != "redirect")' \
  > evidence/glba-http-non-redirect-$(date +%Y%m%d).json

# CloudFront TLS versions (must be TLS 1.2+)
aws cloudfront list-distributions \
  --query 'DistributionList.Items[].[Id,ViewerCertificate.MinimumProtocolVersion]' \
  --output json > evidence/glba-cloudfront-tls-$(date +%Y%m%d).json
```

Collection Frequency: Monthly
Retention: 5 years
Purpose: Demonstrates encryption in transit per §314.4(c)(4)

✓ **Multi-Factor Authentication Evidence (§314.4(c)(6))**

```bash
# IAM Credential Report - MFA status
aws iam generate-credential-report
aws iam get-credential-report --output text | base64 -d \
  > evidence/glba-iam-credential-report-$(date +%Y%m%d).csv

# Users without MFA (non-compliant)
aws iam get-credential-report --output text | base64 -d | \
  awk -F',' '\$4 == "true" && \$8 == "false" {print \$1}' \
  > evidence/glba-no-mfa-$(date +%Y%m%d).txt

# Count MFA compliance
total_users=$(aws iam get-credential-report --output text | base64 -d | tail -n +2 | wc -l)
mfa_users=$(aws iam get-credential-report --output text | base64 -d | awk -F',' '\$8 == "true"' | wc -l)
echo "MFA Compliance: $mfa_users / $total_users users" > evidence/glba-mfa-summary-$(date +%Y%m%d).txt
```

Collection Frequency: Weekly
Retention: 5 years
Purpose: MFA requirement per §314.4(c)(6)

✓ **Access Controls Evidence (§314.4(c)(1-2))**

```bash
# IAM policies - least privilege review
aws iam list-policies --scope Local --output json \
  > evidence/glba-iam-policies-$(date +%Y%m%d).json

# Users with AdministratorAccess (should be minimal)
for user in $(aws iam list-users --query 'Users[].UserName' --output text); do
  policies=$(aws iam list-attached-user-policies --user-name "$user" --query 'AttachedPolicies[?PolicyName==`AdministratorAccess`]')
  if [ "$policies" != "[]" ]; then
    echo "$user has AdministratorAccess" >> evidence/glba-admin-users-$(date +%Y%m%d).txt
  fi
done

# Security groups allowing 0.0.0.0/0 access (potential risk)
aws ec2 describe-security-groups \
  --filters "Name=ip-permission.cidr,Values=0.0.0.0/0" \
  --query 'SecurityGroups[].[GroupId,GroupName,IpPermissions[?IpRanges[?CidrIp==`0.0.0.0/0`]]]' \
  --output json > evidence/glba-open-security-groups-$(date +%Y%m%d).json
```

Collection Frequency: Monthly
Retention: 5 years
Purpose: Access controls per §314.4(c)(1-2)

✓ **Vulnerability Assessment Evidence (§314.4(d)(2))**

```bash
# AWS Inspector findings
aws inspector2 list-findings \
  --filter-criteria '{"severity":[{"comparison":"EQUALS","value":"CRITICAL"},{"comparison":"EQUALS","value":"HIGH"}]}' \
  --max-results 1000 \
  --output json > evidence/glba-inspector-findings-$(date +%Y%m%d).json

# Security Hub findings
aws securityhub get-findings \
  --filters '{"SeverityLabel":[{"Value":"CRITICAL","Comparison":"EQUALS"},{"Value":"HIGH","Comparison":"EQUALS"}],"RecordState":[{"Value":"ACTIVE","Comparison":"EQUALS"}]}' \
  --max-results 100 \
  --output json > evidence/glba-securityhub-findings-$(date +%Y%m%d).json

# Summarize vulnerability count
critical_count=$(aws inspector2 list-findings --filter-criteria '{"severity":[{"comparison":"EQUALS","value":"CRITICAL"}]}' --query 'findings | length(@)')
high_count=$(aws inspector2 list-findings --filter-criteria '{"severity":[{"comparison":"EQUALS","value":"HIGH"}]}' --query 'findings | length(@)')
echo "Critical: $critical_count, High: $high_count" > evidence/glba-vulnerability-summary-$(date +%Y%m%d).txt
```

Collection Frequency: Weekly
Retention: 5 years
Purpose: Vulnerability assessments per §314.4(d)(2)

✓ **Monitoring Evidence (§314.4(d)(1))**

```bash
# CloudWatch alarms configured (continuous monitoring)
aws cloudwatch describe-alarms --output json \
  > evidence/glba-cloudwatch-alarms-$(date +%Y%m%d).json

# GuardDuty findings (threat detection)
aws guardduty list-findings \
  --detector-id $(aws guardduty list-detectors --query 'DetectorIds[0]' --output text) \
  --finding-criteria '{"Criterion":{"severity":{"Gte":7}}}' \
  --output json > evidence/glba-guardduty-findings-$(date +%Y%m%d).json

# CloudTrail enabled (audit logging)
aws cloudtrail describe-trails --output json \
  > evidence/glba-cloudtrail-status-$(date +%Y%m%d).json
```

Collection Frequency: Monthly summary
Retention: 5 years
Purpose: Continuous monitoring per §314.4(d)(1)

✓ **Secure Disposal Evidence (§314.4(c)(7))**

```bash
# S3 lifecycle policies (automated deletion)
aws s3api list-buckets --output json | jq -r '.Buckets[].Name' | while read bucket; do
  lifecycle=$(aws s3api get-bucket-lifecycle-configuration --bucket "$bucket" 2>&1)
  if echo "$lifecycle" | grep -q "NoSuchLifecycleConfiguration"; then
    echo "$bucket,NO LIFECYCLE POLICY" >> evidence/glba-lifecycle-policies-$(date +%Y%m%d).csv
  else
    echo "$bucket,HAS LIFECYCLE POLICY" >> evidence/glba-lifecycle-policies-$(date +%Y%m%d).csv
  fi
done
```

Collection Frequency: Quarterly
Retention: 5 years
Purpose: Disposal procedures per §314.4(c)(7)

### Manual Evidence Collection

□ **Annual Risk Assessment**

- Comprehensive risk assessment performed annually (minimum)
- Required elements per §314.4(b):
  - Identify reasonably foreseeable internal and external threats
  - Assess likelihood and potential damage of threats
  - Assess sufficiency of current safeguards
  - Identify gaps and prioritize remediation
- Evidence: Annual Risk Assessment Report (signed by Qualified Individual, reviewed by Board)
- Frequency: Annually minimum

□ **Annual Penetration Test (§314.4(d)(3))**

- Full penetration test of systems storing/processing customer information
- Scope: External and internal tests
- Required elements:
  - Test methodology and scope
  - Findings (vulnerabilities, exploits successful)
  - Risk ratings (critical, high, medium, low)
  - Remediation recommendations
  - Retest results (for critical/high findings)
- Evidence: Penetration test report + remediation tracker
- Frequency: Annually minimum

□ **Security Awareness Training Records**

- All personnel complete annual security training
- Topics: Safeguards Rule requirements, customer information handling, phishing awareness, incident reporting
- Evidence: Training completion records (100% of employees), training materials, quiz scores
- Frequency: Annually, on hire for new employees

□ **Service Provider Due Diligence (§314.4(f))**

- Due diligence before selecting service provider
- Required elements:
  - Service provider security posture assessment
  - SOC 2 Type II report review (if available)
  - Questionnaire responses
  - Contract review (security requirements)
  - Ongoing monitoring plan
- Evidence: Due diligence reports (one per service provider), contracts with security clauses
- Frequency: Before engagement, annual review

□ **Service Provider Contracts**

- Written contracts with all service providers (§314.4(f)(2))
- Required clauses:
  - Implement and maintain appropriate safeguards
  - Protect confidentiality and security of customer information
  - Restrict use of customer information to purposes specified
  - Disposal requirements
  - Incident notification (prompt notification to institution)
- Evidence: Signed contracts with security clauses
- Frequency: Before engagement, review every 2-3 years

□ **Annual Board Report (§314.4(i))**

- Written report to Board of Directors (or equivalent governing body)
- Required content:
  - Overall status of information security program
  - Compliance with Safeguards Rule requirements
  - Material matters (risk assessment results, incidents, service provider issues, testing results)
  - Recommended changes or improvements
- Evidence: Annual Board Report + Board meeting minutes acknowledging report
- Frequency: Annually

□ **Incident Log**

- Log of all security incidents (breaches, near-misses)
- Required elements:
  - Date/time of incident
  - Type of incident
  - Systems/data affected
  - Root cause analysis
  - Containment and remediation actions
  - Lessons learned
  - Notification to customers (if applicable per state law)
- Evidence: Incident register + investigation reports
- Frequency: Ongoing

## Safeguards Rule Compliance Assessment

Regulators (FTC, FDIC, OCC, NCUA) will verify:

### Documentation Review

✓ Written Information Security Program (WISP) exists and is comprehensive
✓ Qualified Individual designated in writing
✓ Annual risk assessments performed (documented)
✓ Safeguards documented for all identified risks
✓ Monitoring and testing program documented
✓ Training program documented
✓ Service provider oversight documented
✓ Incident response plan documented
✓ Annual Board reports submitted and reviewed

### Implementation Review

✓ Encryption at rest for customer information
✓ Encryption in transit (TLS 1.2+ for all customer data transmission)
✓ MFA implemented for accessing customer information
✓ Access controls (least privilege, user authentication)
✓ Secure disposal procedures
✓ Change management process
✓ Service provider contracts include required security clauses

### Testing and Validation

✓ Annual penetration testing performed
✓ Vulnerability assessments performed (at least annually)
✓ Continuous monitoring or periodic testing in place
✓ Incident response plan tested
✓ Training completion records (100% of staff)

## Common Regulatory Findings

### Critical (Likely to Result in Enforcement Action)

❌ No Written Information Security Program (WISP)
❌ No Qualified Individual designated
❌ No annual risk assessment performed
❌ No encryption of customer information at rest or in transit
❌ No multi-factor authentication for accessing customer information
❌ No annual penetration testing
❌ No annual Board report

### Moderate (Requires Remediation)

⚠️ WISP incomplete (missing required elements)
⚠️ Risk assessment not performed annually
⚠️ Some customer information not encrypted
⚠️ MFA not enforced for all access to customer information
⚠️ Service provider contracts missing required security clauses
⚠️ Penetration test >12 months old
⚠️ Incident response plan not tested

### Minor (Best Practice Recommendations)

⚠️ WISP not reviewed in last 12 months
⚠️ Training completion not 100%
⚠️ Service provider assessments not performed annually
⚠️ Monitoring dashboards incomplete

## Remediation Guidance

### If No WISP Exists

1. **Week 1**: Download FTC WISP template and customize
2. **Weeks 2-4**: Document all required elements (risk assessment process, safeguards, monitoring, training, service providers, incident response)
3. **Week 5**: Review with Qualified Individual and legal counsel
4. **Week 6**: Present to Board for approval
5. **Week 7**: Distribute to organization and begin implementation

**Timeline**: 6-8 weeks
**Priority**: 🔴 CRITICAL (foundational requirement)

### If No MFA Implemented

1. **Week 1**: Inventory all systems accessing customer information
2. **Week 2**: Select MFA solution (AWS IAM MFA, Okta, Duo, etc.)
3. **Weeks 3-4**: Pilot MFA with IT team
4. **Weeks 5-8**: Roll out to all users accessing customer information
5. **Week 9**: Enforce MFA (no access without MFA)

**Timeline**: 8-10 weeks
**Priority**: 🔴 CRITICAL (§314.4(c)(6) requirement)

### If No Annual Penetration Test

1. **Week 1**: Select penetration testing vendor
2. **Week 2**: Define scope (external + internal tests, systems with customer information)
3. **Weeks 3-6**: Execute penetration test
4. **Week 7**: Receive report and findings
5. **Weeks 8-12**: Remediate critical and high findings
6. **Week 13**: Retest critical/high findings

**Timeline**: 12-14 weeks
**Priority**: 🔴 CRITICAL (§314.4(d)(3) requirement)

## Cross-References

### Related GLBA Rules

- Privacy Rule (16 CFR Part 313) - Privacy notices to customers
- Pretexting Rule (16 CFR Part 517) - Protection against pretexting

### Maps to Other Frameworks

- **NIST 800-53**: All families (GLBA aligns closely with NIST)
- **NIST Cybersecurity Framework**: All 5 functions
- **ISO 27001:2022**: Annex A controls
- **SOC 2**: All Trust Service Criteria
- **FFIEC Cybersecurity Assessment Tool**: All domains

## Cost Estimates

### GLBA Safeguards Rule Compliance (Small Financial Institution)

- WISP development: 80 hours (\$8,000)
- Annual risk assessment: 60 hours (\$6,000/year)
- Penetration testing: \$15k-\$30k/year
- Vulnerability scanning: \$5k-\$10k/year
- MFA implementation: 40 hours + \$5k software (\$9,000 one-time, \$2k/year ongoing)
- Security awareness training: 16 hours development + 2 hours per employee (\$2,000 + \$100/person)
- Service provider due diligence: 40 hours (\$4,000/year)
- Incident response plan: 40 hours (\$4,000)
- **Total Year 1**: ~\$48k-\$63k (one-time) + \$28k-\$38k (ongoing)
- **Ongoing**: ~\$28k-\$38k/year

### Qualified Individual

- Dedicated CISO (if hired): \$120k-\$200k/year + benefits
- Virtual CISO (outsourced): \$5k-\$15k/month (\$60k-\$180k/year)
- Existing IT Director (additional responsibilities): +\$10k-\$30k/year

### Tools

- GRC platform: \$15k-\$50k/year
- SIEM: \$20k-\$100k/year
- Vulnerability management: \$5k-\$15k/year
- MFA solution: \$3-10/user/month

## Evidence Package Structure

```
evidence/
└── glba-safeguards-rule/
    ├── wisp/
    │   ├── wisp-v1.2-board-approved.pdf
    │   ├── qualified-individual-designation.pdf
    │   └── board-approval-minutes-2024-01-15.pdf
    ├── risk-assessments/
    │   ├── risk-assessment-2024.pdf
    │   ├── risk-assessment-2023.pdf
    │   └── risk-register-master.xlsx
    ├── safeguards/
    │   ├── encryption-at-rest-policy.pdf
    │   ├── encryption-in-transit-policy.pdf
    │   ├── mfa-policy.pdf
    │   ├── access-control-policy.pdf
    │   └── evidence/ (automated monthly evidence)
    ├── monitoring-testing/
    │   ├── penetration-test-2024.pdf
    │   ├── vulnerability-scans/ (monthly)
    │   ├── monitoring-dashboards-screenshots.pdf
    │   └── remediation-tracker.xlsx
    ├── training/
    │   ├── training-materials-2024.pdf
    │   ├── completion-records-2024.xlsx
    │   └── attendance-registers/
    ├── service-providers/
    │   ├── service-provider-inventory.xlsx
    │   ├── due-diligence-reports/
    │   ├── contracts/
    │   └── annual-assessments/
    ├── incident-response/
    │   ├── incident-response-plan-v1.1.pdf
    │   ├── incident-log-master.xlsx
    │   └── incident-investigations/
    ├── board-reports/
    │   ├── annual-board-report-2024.pdf
    │   ├── board-minutes-2024-12-15.pdf
    │   └── ... (annual reports + minutes)
    └── README.md (evidence index, 5-year retention)
```

## Automation Script

```python
#!/usr/bin/env python3
"""
GLBA Safeguards Rule Evidence Collection
For financial institutions subject to FTC Safeguards Rule
"""
import boto3
import json
import csv
from datetime import datetime
import os

class GLBASafeguardsEvidence:
    def __init__(self, output_dir="evidence/glba-safeguards-rule"):
        self.output_dir = output_dir
        self.timestamp = datetime.now().strftime("%Y%m%d")
        os.makedirs(f"{output_dir}/safeguards/evidence", exist_ok=True)

    def check_encryption_at_rest(self):
        """Check encryption at rest (§314.4(c)(3))"""
        print("Checking encryption at rest compliance...")
        s3 = boto3.client('s3')
        rds = boto3.client('rds')

        # S3 encryption
        buckets = s3.list_buckets()['Buckets']
        s3_results = []
        for bucket in buckets:
            bucket_name = bucket['Name']
            try:
                encryption = s3.get_bucket_encryption(Bucket=bucket_name)
                s3_results.append({'bucket': bucket_name, 'encrypted': True})
            except:
                s3_results.append({'bucket': bucket_name, 'encrypted': False})

        # RDS encryption
        rds_instances = rds.describe_db_instances()['DBInstances']
        rds_results = []
        for instance in rds_instances:
            rds_results.append({
                'instance': instance['DBInstanceIdentifier'],
                'encrypted': instance.get('StorageEncrypted', False)
            })

        # Save evidence
        with open(f"{self.output_dir}/safeguards/evidence/s3-encryption-{self.timestamp}.json", 'w') as f:
            json.dump(s3_results, f, indent=2)

        with open(f"{self.output_dir}/safeguards/evidence/rds-encryption-{self.timestamp}.json", 'w') as f:
            json.dump(rds_results, f, indent=2)

        s3_encrypted = len([r for r in s3_results if r['encrypted']])
        rds_encrypted = len([r for r in rds_results if r['encrypted']])

        print(f"✓ S3 buckets: {s3_encrypted}/{len(s3_results)} encrypted")
        print(f"✓ RDS instances: {rds_encrypted}/{len(rds_instances)} encrypted")

        return {'s3': s3_results, 'rds': rds_results}

    def check_mfa_compliance(self):
        """Check MFA enforcement (§314.4(c)(6))"""
        print("Checking MFA compliance...")
        iam = boto3.client('iam')

        # Generate credential report
        iam.generate_credential_report()
        report = iam.get_credential_report()

        # Parse for MFA status
        users_without_mfa = []
        total_users = 0

        for line in csv.DictReader(report['Content'].decode('utf-8').splitlines()):
            if line.get('password_enabled') == 'true':
                total_users += 1
                if line.get('mfa_active') == 'false':
                    users_without_mfa.append({
                        'user': line['user'],
                        'password_last_used': line.get('password_last_used')
                    })

        # Save evidence
        with open(f"{self.output_dir}/safeguards/evidence/mfa-compliance-{self.timestamp}.json", 'w') as f:
            json.dump({
                'total_users': total_users,
                'mfa_enabled': total_users - len(users_without_mfa),
                'mfa_disabled': len(users_without_mfa),
                'compliance_percentage': (total_users - len(users_without_mfa)) / total_users * 100 if total_users > 0 else 0,
                'users_without_mfa': users_without_mfa
            }, f, indent=2)

        print(f"✓ MFA compliance: {total_users - len(users_without_mfa)}/{total_users} users ({(total_users - len(users_without_mfa)) / total_users * 100:.1f}%)")

        if len(users_without_mfa) > 0:
            print(f"⚠️  WARNING: {len(users_without_mfa)} users without MFA (§314.4(c)(6) non-compliant)")

        return users_without_mfa

    def check_vulnerability_findings(self):
        """Check vulnerability assessment results (§314.4(d)(2))"""
        print("Checking vulnerability assessment compliance...")
        inspector = boto3.client('inspector2')

        # Get critical and high findings
        findings = inspector.list_findings(
            filterCriteria={
                'severity': [
                    {'comparison': 'EQUALS', 'value': 'CRITICAL'},
                    {'comparison': 'EQUALS', 'value': 'HIGH'}
                ]
            },
            maxResults=1000
        )

        # Save evidence
        with open(f"{self.output_dir}/safeguards/evidence/vulnerability-findings-{self.timestamp}.json", 'w') as f:
            json.dump(findings, f, indent=2, default=str)

        finding_count = len(findings.get('findings', []))
        print(f"✓ Critical/High vulnerabilities: {finding_count}")

        if finding_count > 0:
            print(f"⚠️  ACTION REQUIRED: Remediate {finding_count} critical/high vulnerabilities")

        return finding_count

    def generate_compliance_report(self, encryption_results, mfa_results, vuln_count):
        """Generate GLBA Safeguards Rule compliance summary"""
        s3_compliant = all(r['encrypted'] for r in encryption_results['s3'])
        rds_compliant = all(r['encrypted'] for r in encryption_results['rds'])
        mfa_compliant = len(mfa_results) == 0

        report = f"""
GLBA Safeguards Rule Compliance Report
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
Regulation: 16 CFR Part 314

ENCRYPTION AT REST (§314.4(c)(3))
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
S3 Buckets:       {len([r for r in encryption_results['s3'] if r['encrypted']])}/{len(encryption_results['s3'])} encrypted {'✓ COMPLIANT' if s3_compliant else '✗ NON-COMPLIANT'}
RDS Databases:    {len([r for r in encryption_results['rds'] if r['encrypted']])}/{len(encryption_results['rds'])} encrypted {'✓ COMPLIANT' if rds_compliant else '✗ NON-COMPLIANT'}

MULTI-FACTOR AUTHENTICATION (§314.4(c)(6))
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MFA Compliance:   {'✓ COMPLIANT - All users have MFA' if mfa_compliant else f'✗ NON-COMPLIANT - {len(mfa_results)} users without MFA'}

VULNERABILITY ASSESSMENTS (§314.4(d)(2))
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Critical/High:    {vuln_count} findings {'⚠️  Remediation required' if vuln_count > 0 else '✓ No critical/high findings'}

OVERALL COMPLIANCE STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{'✓ COMPLIANT' if s3_compliant and rds_compliant and mfa_compliant and vuln_count == 0 else '✗ NON-COMPLIANT - Remediation Required'}

REQUIRED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
        if not s3_compliant:
            report += "□ Enable S3 encryption for all buckets with customer information\n"
        if not rds_compliant:
            report += "□ Enable RDS encryption for all databases with customer information\n"
        if not mfa_compliant:
            report += f"□ Enable MFA for {len(mfa_results)} IAM users\n"
        if vuln_count > 0:
            report += f"□ Remediate {vuln_count} critical/high vulnerabilities\n"

        report += """
ANNUAL REQUIREMENTS REMINDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Annual risk assessment (§314.4(b))
□ Annual penetration test (§314.4(d)(3))
□ Annual vulnerability assessment (§314.4(d)(2))
□ Annual Board report (§314.4(i))
□ Annual security awareness training (§314.4(e))

Evidence Location: {self.output_dir}/safeguards/evidence/
Retention: 5 years (financial services standard)
"""

        report_file = f"{self.output_dir}/compliance-report-{self.timestamp}.txt"
        with open(report_file, 'w') as f:
            f.write(report)

        print(f"\n{report}")
        return report_file

if __name__ == "__main__":
    print("GLBA Safeguards Rule Evidence Collection")
    print("=" * 70)
    print("Regulation: 16 CFR Part 314 (Amended December 9, 2022)")
    print("=" * 70)

    collector = GLBASafeguardsEvidence()

    encryption_results = collector.check_encryption_at_rest()
    mfa_results = collector.check_mfa_compliance()
    vuln_count = collector.check_vulnerability_findings()

    collector.generate_compliance_report(encryption_results, mfa_results, vuln_count)

    print("\n✓ GLBA evidence collection complete")
    print("⚠️  REMINDER: Annual penetration test and Board report required")
```

---

**GLBA Regulation**: 16 CFR Part 314 (Safeguards Rule)
**Regulator**: FTC, FDIC, OCC, NCUA, SEC (depending on institution type)
**Effective Date**: December 9, 2022 (amended rule)
**Penalties**: Up to \$46,517 per violation per day
**Evidence Retention**: 5 years (financial services standard)
**Priority**: 🔴 CRITICAL (US financial institutions)
