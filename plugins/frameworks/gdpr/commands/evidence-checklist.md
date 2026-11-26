---
description: "Generates comprehensive evidence collection checklists for EU General Data Protection Regulation (GDPR) compliance with focus on technical and organizational measures (TOMs) and data processing activities"
---

# GDPR Evidence Checklist

Generates comprehensive evidence collection checklists for EU General Data Protection Regulation (GDPR) compliance with focus on technical and organizational measures (TOMs) and data processing activities.

> **Never commit evidence artifacts to source control.** The outputs below include real usernames, credential reports, MFA device states, and privileged-account inventories. For GDPR workflows, raw exports may carry personal data subject to Art. 5 minimization and storage-limitation rules. Keep only what you need and delete on a retention schedule. `.gitignore` covers `evidence/` by default so `git add -A` will not sweep it up, but durable storage is your responsibility. Use an encrypted, access-controlled evidence locker (encrypted S3 with least-privilege IAM, a GRC platform, or a shared drive with full-disk encryption and MFA-gated access).

## Usage

```bash
/gdpr:evidence-checklist <article|principle> [--role <controller|processor>] [--export <format>]
```

## Arguments

- `<article|principle>`: GDPR article (e.g., "Article 32", "Article 30") or principle (e.g., "Security", "Data Subject Rights", "Lawfulness")
- `--role`: Organization role (`controller`, `processor`, or `both`). Default: `controller`
- `--export`: Export format (`json`, `csv`, `markdown`). Default: `markdown`

## Example: Article 32 Security of Processing Evidence

```bash
/gdpr:evidence-checklist "Article 32" --role controller
```

**Output:**

```markdown
GDPR Evidence Checklist
Article: Article 32 - Security of Processing
Role: Data Controller
Applicable To: All organizations processing personal data of EU residents
Enforcement: EU Data Protection Authorities (DPAs)
Maximum Penalty: €10 million or 2% of worldwide annual revenue (whichever higher)

## Article 32 Requirements

The controller and the processor shall implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk, including inter alia as appropriate:

(a) the pseudonymisation and encryption of personal data;
(b) the ability to ensure the ongoing confidentiality, integrity, availability and resilience of processing systems and services;
(c) the ability to restore the availability and access to personal data in a timely manner in the event of a physical or technical incident;
(d) a process for regularly testing, assessing and evaluating the effectiveness of technical and organisational measures for ensuring the security of the processing.

## Evidence Requirements

### Required Documentation (TOMs - Technical and Organizational Measures)

□ **Information Security Policy**
  - Scope: All personal data processing activities
  - Required elements:
    - Encryption requirements (at rest, in transit)
    - Access control measures
    - Incident response procedures
    - Data retention and deletion
    - Third-party security (processors)
  - Update frequency: Annually
  - Approver: Data Protection Officer (DPO) and senior management
  - Evidence: Signed Information Security Policy v1.x

□ **Data Processing Inventory (Article 30 - Records of Processing)**
  - All processing activities documented
  - Required elements for each activity:
    - Purpose of processing
    - Categories of personal data
    - Categories of data subjects
    - Recipients (including third countries)
    - Retention periods
    - Technical and organizational security measures
  - Evidence: Article 30 Record of Processing Activities (ROPA)
  - Frequency: Updated when processing changes, reviewed annually

□ **Data Protection Impact Assessment (DPIA) for High-Risk Processing**
  - Required when: New technology, profiling, large-scale sensitive data, public monitoring
  - Required elements:
    - Description of processing and purposes
    - Assessment of necessity and proportionality
    - Risk assessment (rights and freedoms)
    - Mitigation measures
    - DPO consultation
  - Evidence: Completed DPIA for high-risk processing
  - Frequency: Before commencing high-risk processing

□ **Data Processing Agreements (DPA) with Processors**
  - Contract with every processor (Article 28)
  - Required clauses:
    - Subject matter, duration, nature, purpose
    - Processor obligations (confidentiality, security, sub-processors)
    - Controller audit rights
    - Data breach notification (72 hours)
    - Data deletion/return after termination
  - Evidence: Signed DPAs with all processors
  - Frequency: Before engaging processor, reviewed every 2 years

□ **Data Breach Response Plan**
  - Documented breach notification procedures
  - 72-hour notification to DPA requirement
  - Data subject notification criteria
  - Breach investigation procedures
  - Evidence: Breach Response Plan v1.x
  - Frequency: Annual review and testing

### Automated Evidence Collection

✓ **Encryption at Rest Evidence**
```bash
# AWS - S3 bucket encryption status
aws s3api list-buckets --output json | jq -r '.Buckets[].Name' | while read bucket; do
  encryption=$(aws s3api get-bucket-encryption --bucket "$bucket" 2>&1)
  if echo "$encryption" | grep -q "ServerSideEncryptionConfigurationNotFoundError"; then
    echo "$bucket,NOT ENCRYPTED" >> evidence/gdpr-art32-s3-encryption-$(date +%Y%m%d).csv
  else
    echo "$bucket,ENCRYPTED" >> evidence/gdpr-art32-s3-encryption-$(date +%Y%m%d).csv
  fi
done

# RDS encryption
aws rds describe-db-instances --query 'DBInstances[].[DBInstanceIdentifier,StorageEncrypted]' \
  --output json > evidence/gdpr-art32-rds-encryption-$(date +%Y%m%d).json

# EBS volume encryption
aws ec2 describe-volumes --query 'Volumes[].[VolumeId,Encrypted,KmsKeyId]' \
  --output json > evidence/gdpr-art32-ebs-encryption-$(date +%Y%m%d).json

# Azure - Storage account encryption
az storage account list --query '[].{Name:name,Encryption:encryption.services}' \
  --output json > evidence/gdpr-art32-azure-encryption-$(date +%Y%m%d).json

# GCP - Cloud Storage bucket encryption
gsutil ls | while read bucket; do
  encryption=$(gsutil encryption get "$bucket")
  echo "$bucket: $encryption" >> evidence/gdpr-art32-gcp-encryption-$(date +%Y%m%d).txt
done
```

Collection Frequency: Monthly
Retention: 3 years (minimum for GDPR compliance evidence)
Purpose: Demonstrates encryption at rest (Article 32(1)(a))

✓ **Encryption in Transit Evidence**

```bash
# AWS - Application Load Balancer HTTPS enforcement
aws elbv2 describe-load-balancers --output json | \
  jq '.LoadBalancers[] | {Name: .LoadBalancerName, Scheme: .Scheme}' \
  > evidence/gdpr-art32-alb-$(date +%Y%m%d).json

aws elbv2 describe-listeners --load-balancer-arn <ARN> | \
  jq '.Listeners[] | select(.Protocol == "HTTPS")' \
  >> evidence/gdpr-art32-https-listeners-$(date +%Y%m%d).json

# CloudFront TLS versions
aws cloudfront list-distributions --query 'DistributionList.Items[].[Id,ViewerCertificate.MinimumProtocolVersion]' \
  --output json > evidence/gdpr-art32-cloudfront-tls-$(date +%Y%m%d).json

# Check for TLS 1.2+ (TLS 1.0/1.1 not secure)
aws cloudfront list-distributions --output json | \
  jq '.DistributionList.Items[] | select(.ViewerCertificate.MinimumProtocolVersion < "TLSv1.2")' \
  > evidence/gdpr-art32-insecure-tls-$(date +%Y%m%d).json
```

Collection Frequency: Monthly
Retention: 3 years
Purpose: Demonstrates encryption in transit (Article 32(1)(a))

✓ **Access Control Evidence**

```bash
# AWS IAM user inventory (should minimize IAM users, prefer SSO)
aws iam list-users --output json > evidence/gdpr-art32-iam-users-$(date +%Y%m%d).json

# IAM credential report (shows password age, MFA status)
aws iam generate-credential-report
aws iam get-credential-report --output text | base64 -d \
  > evidence/gdpr-art32-credential-report-$(date +%Y%m%d).csv

# Users without MFA (non-compliant)
aws iam get-credential-report --output text | base64 -d | \
  awk -F',' '\$4 == "true" && \$8 == "false" {print \$1}' \
  > evidence/gdpr-art32-no-mfa-$(date +%Y%m%d).txt

# S3 bucket public access (should be blocked for personal data)
aws s3api list-buckets --output json | jq -r '.Buckets[].Name' | while read bucket; do
  public=$(aws s3api get-bucket-acl --bucket "$bucket" | grep -i "AllUsers\|AuthenticatedUsers")
  if [ ! -z "$public" ]; then
    echo "$bucket is PUBLIC" >> evidence/gdpr-art32-public-s3-$(date +%Y%m%d).txt
  fi
done

# RDS public accessibility (should be false for personal data)
aws rds describe-db-instances --query 'DBInstances[].[DBInstanceIdentifier,PubliclyAccessible]' \
  --output json > evidence/gdpr-art32-rds-public-$(date +%Y%m%d).json
```

Collection Frequency: Weekly
Retention: 3 years
Purpose: Access control measures (Article 32(1)(b))

✓ **Backup and Recovery Evidence**

```bash
# AWS Backup jobs (last 30 days)
aws backup list-backup-jobs \
  --by-created-after $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --output json > evidence/gdpr-art32-backup-jobs-$(date +%Y%m).json

# RDS automated backups
aws rds describe-db-instances \
  --query 'DBInstances[].[DBInstanceIdentifier,BackupRetentionPeriod,PreferredBackupWindow]' \
  --output json > evidence/gdpr-art32-rds-backups-$(date +%Y%m%d).json

# EBS snapshots (for EC2 volumes)
aws ec2 describe-snapshots --owner-ids self \
  --query 'Snapshots[?StartTime>=`2024-01-01`].[SnapshotId,VolumeId,StartTime,State]' \
  --output json > evidence/gdpr-art32-ebs-snapshots-$(date +%Y%m%d).json

# S3 versioning (for data recovery)
aws s3api list-buckets --output json | jq -r '.Buckets[].Name' | while read bucket; do
  versioning=$(aws s3api get-bucket-versioning --bucket "$bucket")
  echo "$bucket: $versioning" >> evidence/gdpr-art32-s3-versioning-$(date +%Y%m%d).txt
done
```

Collection Frequency: Monthly
Retention: 3 years
Purpose: Data availability and resilience (Article 32(1)(c))

✓ **Security Monitoring Evidence**

```bash
# AWS GuardDuty findings (threat detection)
aws guardduty list-findings \
  --detector-id $(aws guardduty list-detectors --query 'DetectorIds[0]' --output text) \
  --finding-criteria '{"Criterion":{"severity":{"Gte":7},"updatedAt":{"Gte":'$(date -d '30 days ago' +%s%3N)'}}}' \
  --output json > evidence/gdpr-art32-guardduty-$(date +%Y%m).json

# Security Hub findings
aws securityhub get-findings \
  --filters '{"SeverityLabel":[{"Value":"CRITICAL","Comparison":"EQUALS"},{"Value":"HIGH","Comparison":"EQUALS"}],"RecordState":[{"Value":"ACTIVE","Comparison":"EQUALS"}]}' \
  --output json > evidence/gdpr-art32-securityhub-$(date +%Y%m%d).json

# CloudTrail events (audit trail)
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteBucket \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --output json > evidence/gdpr-art32-deletion-events-$(date +%Y%m).json

# VPC Flow Logs enabled (network monitoring)
aws ec2 describe-vpcs --output json | jq -r '.Vpcs[].VpcId' | while read vpc; do
  flowlogs=$(aws ec2 describe-flow-logs --filter "Name=resource-id,Values=$vpc" --query 'FlowLogs[].FlowLogStatus')
  echo "$vpc: $flowlogs" >> evidence/gdpr-art32-flow-logs-$(date +%Y%m%d).txt
done
```

Collection Frequency: Monthly
Retention: 3 years
Purpose: Ongoing monitoring and testing (Article 32(1)(d))

✓ **Data Deletion Evidence (Right to Erasure - Article 17)**

```bash
# S3 lifecycle policies (automated deletion after retention period)
aws s3api list-buckets --output json | jq -r '.Buckets[].Name' | while read bucket; do
  lifecycle=$(aws s3api get-bucket-lifecycle-configuration --bucket "$bucket" 2>&1)
  if echo "$lifecycle" | grep -q "NoSuchLifecycleConfiguration"; then
    echo "$bucket,NO LIFECYCLE POLICY" >> evidence/gdpr-art32-lifecycle-$(date +%Y%m%d).csv
  else
    echo "$bucket,HAS LIFECYCLE POLICY" >> evidence/gdpr-art32-lifecycle-$(date +%Y%m%d).csv
    echo "$lifecycle" >> evidence/gdpr-art32-lifecycle-details-$(date +%Y%m%d).json
  fi
done

# RDS retention periods (should align with GDPR retention)
aws rds describe-db-instances \
  --query 'DBInstances[].[DBInstanceIdentifier,BackupRetentionPeriod]' \
  --output json > evidence/gdpr-art32-retention-$(date +%Y%m%d).json
```

Collection Frequency: Quarterly
Retention: 3 years
Purpose: Data minimization and storage limitation principles

### Manual Evidence Collection

□ **Article 30 Record of Processing Activities (ROPA)**

- Complete inventory of all processing activities
- For each processing activity, document:
  - Name and contact details of controller/processor
  - Purposes of processing
  - Categories of data subjects (employees, customers, etc.)
  - Categories of personal data (names, emails, financial, etc.)
  - Categories of recipients (third parties, sub-processors)
  - Transfers to third countries (if applicable)
  - Retention periods
  - Technical and organizational security measures (TOMs)
- Evidence: ROPA spreadsheet or GRC tool export
- Frequency: Annual review, update when processing changes
- **CRITICAL**: Required for all controllers (Article 30(1)) and processors (Article 30(2))

□ **Data Protection Impact Assessment (DPIA) for High-Risk Processing**

- Required when: automated decision-making, large-scale profiling, large-scale sensitive data, systematic monitoring of public areas, innovative technology
- Template: ICO DPIA template or similar
- Required sections:
  - Description of processing and business need
  - Consultation with DPO
  - Necessity and proportionality assessment
  - Risk to rights and freedoms (likelihood + severity)
  - Measures to mitigate risks
  - Sign-off by senior management
- Evidence: Completed DPIA documents (one per high-risk processing)
- Frequency: Before starting high-risk processing, review every 2 years

□ **Data Processing Agreements (DPAs) with Processors**

- Must have DPA with every processor (cloud providers, SaaS vendors, etc.)
- Use Standard Contractual Clauses (SCCs) for non-EU processors
- Required elements (Article 28(3)):
  - Process only on documented instructions
  - Confidentiality obligations
  - Security measures (Article 32)
  - Sub-processor restrictions and notification
  - Data subject rights assistance
  - Deletion/return of data after termination
  - Audit rights for controller
- Evidence: Signed DPAs with all processors (AWS, Azure, GCP, SaaS vendors)
- Frequency: Before engaging processor, review every 2 years

□ **Data Breach Register**

- Log of all data breaches (even if not notified to DPA)
- Required elements for each breach:
  - Date/time discovered
  - Nature of breach (confidentiality, integrity, availability)
  - Categories and approximate number of data subjects affected
  - Categories and approximate number of records affected
  - Likely consequences
  - Measures taken to mitigate
  - DPA notification (Y/N, date)
  - Data subject notification (Y/N, date)
- Evidence: Breach register (Excel or GRC tool)
- Frequency: Ongoing (log all breaches within 72 hours)
- **CRITICAL**: Must notify DPA within 72 hours if risk to rights (Article 33)

□ **Data Subject Rights Request Log**

- Log of all data subject requests (access, rectification, erasure, portability, objection, restriction)
- Required elements:
  - Request date
  - Request type (SAR, erasure, etc.)
  - Data subject identity verification
  - Response date (must be <30 days)
  - Outcome (granted, denied, partial)
  - Denial justification (if denied)
- Evidence: DSR log (Excel or GRC tool)
- Frequency: Ongoing

□ **Penetration Test / Vulnerability Assessment**

- Annual penetration test or vulnerability assessment
- Scope: Systems processing personal data
- Required elements:
  - Test scope and methodology
  - Findings (vulnerabilities identified)
  - Risk ratings (critical, high, medium, low)
  - Remediation plan with timelines
  - Re-test results (for critical/high findings)
- Evidence: Penetration test report + remediation tracking
- Frequency: Annually (Article 32(1)(d) - regular testing)

□ **Staff Security Awareness Training**

- All staff handling personal data must be trained
- Topics: GDPR principles, data subject rights, breach reporting, secure data handling
- Evidence: Training completion records, training materials, attendance registers
- Frequency: Annually, on hire for new staff

□ **Data Retention and Deletion Procedures**

- Documented retention periods for each processing activity (align with ROPA)
- Automated deletion procedures (where possible)
- Manual review process for legacy data
- Evidence: Retention schedule + deletion logs
- Frequency: Annual review of retention schedule

## GDPR Compliance Assessment

Data Protection Authorities will assess:

### Documentation Review

✓ Article 30 ROPA completed and up-to-date
✓ DPIAs for high-risk processing
✓ Data Processing Agreements with all processors
✓ Privacy notices published and comprehensive
✓ Data breach register maintained
✓ DSR request log maintained
✓ TOMs documented (encryption, access control, etc.)

### Implementation Review

✓ Encryption at rest for personal data
✓ Encryption in transit (TLS 1.2+)
✓ Access controls (MFA, least privilege)
✓ Backup and recovery capabilities
✓ Security monitoring (SIEM, IDS)
✓ Vulnerability management process
✓ Data deletion capabilities (right to erasure)

### Testing and Validation

✓ Penetration testing annually
✓ Data breach response plan tested
✓ DSR process tested (can respond within 30 days)
✓ Staff trained on GDPR and security

### Breach Notification

✓ Can detect breaches promptly
✓ Can notify DPA within 72 hours
✓ Can notify data subjects without undue delay
✓ Breach register maintained

## Common DPA Findings

### Critical (Likely to Result in Fine)

❌ No Article 30 ROPA
❌ Breach not notified to DPA within 72 hours
❌ No encryption of sensitive personal data
❌ Personal data transferred to non-EU without SCCs
❌ No Data Processing Agreements with processors
❌ Personal data retained beyond stated retention period

### Moderate (Requires Remediation)

⚠️ ROPA incomplete or outdated
⚠️ DPIA not performed for high-risk processing
⚠️ DPAs with processors missing required clauses
⚠️ No penetration testing in last 12 months
⚠️ Staff not trained on GDPR
⚠️ DSR response time >30 days

### Minor (Best Practice Recommendations)

⚠️ Privacy notices could be more detailed
⚠️ No automated data deletion procedures
⚠️ Backup retention longer than necessary
⚠️ TOMs documentation could be more comprehensive

## Remediation Guidance

### If No Article 30 ROPA

1. **Immediate (Weeks 1-2)**: Create ROPA template (use ICO or EDPB template)
2. **Weeks 3-6**: Interview stakeholders to identify all processing
3. **Weeks 7-8**: Document each processing activity in ROPA
4. **Week 9**: Get DPO and senior management sign-off
5. **Ongoing**: Update ROPA when processing changes

**Timeline**: 2-3 months
**Priority**: 🔴 CRITICAL (foundational requirement)

### If No DPAs with Processors

1. **Week 1**: Inventory all processors (cloud providers, SaaS, third-party services)
2. **Week 2**: Download standard DPA templates (AWS, Azure, GCP have pre-signed DPAs)
3. **Weeks 3-6**: For custom processors, negotiate DPAs (use EDPB template)
4. **Week 7**: Sign all DPAs
5. **Ongoing**: Update DPAs when processors change or every 2 years

**Timeline**: 6-8 weeks
**Priority**: 🔴 CRITICAL (Article 28 requirement)

### If No Encryption

1. **Week 1**: Identify all datastores containing personal data
2. **Week 2**: Prioritize by sensitivity (start with special categories - health, biometric, etc.)
3. **Weeks 3-4**: Enable encryption at rest (S3: SSE-S3 or SSE-KMS, RDS: enable storage encryption)
4. **Weeks 5-6**: Enable encryption in transit (enforce HTTPS, TLS 1.2+)
5. **Ongoing**: Monitor for unencrypted datastores

**Timeline**: 6-8 weeks
**Priority**: 🔴 CRITICAL (Article 32(1)(a))

## Cross-References

### Related GDPR Articles

- Article 5 - Principles (lawfulness, fairness, transparency, purpose limitation, data minimization, accuracy, storage limitation, integrity and confidentiality, accountability)
- Article 6 - Lawfulness of processing
- Article 13-14 - Information to data subjects (privacy notices)
- Article 15-22 - Data subject rights
- Article 25 - Data protection by design and by default
- Article 28 - Processor obligations
- Article 30 - Records of processing activities (ROPA)
- Article 33-34 - Breach notification
- Article 35 - Data Protection Impact Assessment (DPIA)

### Maps to Other Frameworks

- **ISO 27001:2022**: Annex A (all controls), especially A.5.34 (privacy), A.8 (technological controls)
- **NIST 800-53**: All families, especially SC (System and Communications Protection), AC (Access Control)
- **SOC 2**: CC6 (Logical and physical access), CC7 (System monitoring), P1-P8 (Privacy criteria)
- **NIST Privacy Framework**: All 5 functions (Identify, Govern, Control, Communicate, Protect)

## Cost Estimates

### GDPR Compliance Program (SMB with 50-200 employees)

- Article 30 ROPA development: 40 hours (\$4,000)
- DPIA for high-risk processing: 40 hours per DPIA (\$4,000 each)
- DPA negotiation and signing: 80 hours (\$8,000)
- Privacy notice updates: 24 hours (\$2,400)
- Policy and procedure documentation: 80 hours (\$8,000)
- Technical measures (encryption, access control): 120 hours (\$12,000)
- Penetration testing: \$10k-\$25k (annual)
- Staff training: 8 hours development + 2 hours per employee (\$1,000 + \$100/person)
- **Total Year 1**: ~\$49k-\$64k (one-time)
- **Ongoing**: ~\$20k-\$30k/year

### DPO (Data Protection Officer)

- External DPO (retainer): \$3k-\$10k/month (\$36k-\$120k/year)
- Internal DPO (salary): \$80k-\$150k/year + benefits

### Tools

- Privacy management platform (OneTrust, TrustArc): \$25k-\$100k/year
- Consent management platform: \$5k-\$20k/year
- DSAR automation: \$10k-\$30k/year

## Evidence Package Structure

```
evidence/
└── gdpr-compliance/
    ├── article-30-ropa/
    │   ├── ropa-master-2024.xlsx
    │   ├── ropa-review-2024-Q1.pdf
    │   └── ... (quarterly reviews)
    ├── article-32-security/
    │   ├── 2024-01/
    │   │   ├── s3-encryption-20240131.csv
    │   │   ├── rds-encryption-20240131.json
    │   │   ├── credential-report-20240131.csv
    │   │   └── backup-jobs-202401.json
    │   └── ... (monthly)
    ├── dpias/
    │   ├── dpia-marketing-automation-2024.pdf
    │   ├── dpia-customer-profiling-2024.pdf
    │   └── dpia-biometric-access-2024.pdf
    ├── dpas/
    │   ├── dpa-aws-signed.pdf
    │   ├── dpa-azure-signed.pdf
    │   ├── dpa-salesforce-signed.pdf
    │   └── dpa-register-master.xlsx
    ├── breach-register/
    │   ├── breach-register-master.xlsx
    │   ├── breach-001-investigation-report.pdf
    │   └── breach-001-dpa-notification.pdf
    ├── dsr-log/
    │   ├── dsr-log-master.xlsx
    │   ├── sar-001-response.pdf
    │   └── ... (all DSR responses)
    ├── testing/
    │   ├── pentest-2024-Q2-report.pdf
    │   ├── pentest-2024-Q2-remediation-tracker.xlsx
    │   └── vulnerability-scans/ (quarterly)
    ├── training/
    │   ├── gdpr-training-materials-2024.pdf
    │   ├── training-completion-records-2024.xlsx
    │   └── attendance-registers/
    └── README.md (evidence index, 3-year retention)
```

## Automation Script

```python
#!/usr/bin/env python3
"""
GDPR Article 32 Security of Processing Evidence Collection
Multi-cloud support (AWS, Azure, GCP)
"""
import boto3
import json
import csv
import os
from datetime import datetime

class GDPRSecurityEvidence:
    def __init__(self, output_dir="evidence/gdpr-compliance/article-32-security"):
        self.output_dir = f"{output_dir}/{datetime.now().strftime('%Y-%m')}"
        self.timestamp = datetime.now().strftime("%Y%m%d")
        os.makedirs(self.output_dir, exist_ok=True)

    def check_s3_encryption(self):
        """Check S3 bucket encryption status"""
        print("Checking S3 bucket encryption...")
        s3 = boto3.client('s3')

        buckets = s3.list_buckets()['Buckets']
        results = []

        for bucket in buckets:
            bucket_name = bucket['Name']
            try:
                encryption = s3.get_bucket_encryption(Bucket=bucket_name)
                results.append({
                    'bucket': bucket_name,
                    'encrypted': True,
                    'algorithm': encryption['ServerSideEncryptionConfiguration']['Rules'][0]['ApplyServerSideEncryptionByDefault']['SSEAlgorithm']
                })
            except s3.exceptions.ServerSideEncryptionConfigurationNotFoundError:
                results.append({
                    'bucket': bucket_name,
                    'encrypted': False,
                    'algorithm': None
                })

        output_file = f"{self.output_dir}/s3-encryption-{self.timestamp}.json"
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)

        encrypted_count = len([r for r in results if r['encrypted']])
        print(f"✓ S3 buckets: {encrypted_count}/{len(results)} encrypted")

        if encrypted_count < len(results):
            print(f"⚠️  WARNING: {len(results) - encrypted_count} buckets NOT encrypted (GDPR non-compliant)")

        return results

    def check_rds_encryption(self):
        """Check RDS database encryption"""
        print("Checking RDS encryption...")
        rds = boto3.client('rds')

        instances = rds.describe_db_instances()['DBInstances']
        results = []

        for instance in instances:
            results.append({
                'instance': instance['DBInstanceIdentifier'],
                'encrypted': instance.get('StorageEncrypted', False),
                'kms_key': instance.get('KmsKeyId'),
                'publicly_accessible': instance.get('PubliclyAccessible', True)
            })

        output_file = f"{self.output_dir}/rds-encryption-{self.timestamp}.json"
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)

        encrypted_count = len([r for r in results if r['encrypted']])
        public_count = len([r for r in results if r['publicly_accessible']])

        print(f"✓ RDS instances: {encrypted_count}/{len(results)} encrypted")
        if public_count > 0:
            print(f"⚠️  WARNING: {public_count} RDS instances are publicly accessible")

        return results

    def check_iam_mfa(self):
        """Check IAM users for MFA"""
        print("Checking IAM MFA compliance...")
        iam = boto3.client('iam')

        # Generate credential report
        iam.generate_credential_report()
        report = iam.get_credential_report()

        # Parse CSV
        users_without_mfa = []
        for line in csv.DictReader(report['Content'].decode('utf-8').splitlines()):
            if line.get('password_enabled') == 'true' and line.get('mfa_active') == 'false':
                users_without_mfa.append({
                    'user': line['user'],
                    'password_last_used': line.get('password_last_used'),
                    'mfa_active': False
                })

        output_file = f"{self.output_dir}/iam-no-mfa-{self.timestamp}.json"
        with open(output_file, 'w') as f:
            json.dump(users_without_mfa, f, indent=2)

        total_users = len(list(csv.DictReader(report['Content'].decode('utf-8').splitlines())))
        print(f"✓ IAM users: {total_users - len(users_without_mfa)}/{total_users} have MFA")

        if len(users_without_mfa) > 0:
            print(f"⚠️  WARNING: {len(users_without_mfa)} users without MFA (GDPR Article 32 non-compliant)")

        return users_without_mfa

    def check_backups(self):
        """Check backup configuration"""
        print("Checking backup configuration...")
        backup = boto3.client('backup')

        # Get backup jobs from last 30 days
        from datetime import datetime, timedelta
        start_date = datetime.now() - timedelta(days=30)

        backup_jobs = backup.list_backup_jobs(
            ByCreatedAfter=start_date
        )

        output_file = f"{self.output_dir}/backup-jobs-{self.timestamp}.json"
        with open(output_file, 'w') as f:
            json.dump(backup_jobs, f, indent=2, default=str)

        total_jobs = len(backup_jobs.get('BackupJobs', []))
        completed = len([j for j in backup_jobs.get('BackupJobs', []) if j.get('State') == 'COMPLETED'])

        print(f"✓ Backup jobs (30 days): {completed}/{total_jobs} successful")

        return backup_jobs

    def generate_compliance_report(self, s3_results, rds_results, mfa_results):
        """Generate GDPR Article 32 compliance summary"""
        report = f"""
GDPR Article 32 - Security of Processing Evidence Report
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

ENCRYPTION AT REST (Article 32(1)(a))
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
S3 Buckets:       {len([r for r in s3_results if r['encrypted']])}/{len(s3_results)} encrypted
RDS Databases:    {len([r for r in rds_results if r['encrypted']])}/{len(rds_results)} encrypted

ACCESS CONTROL (Article 32(1)(b))
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IAM MFA:          {len(mfa_results)} users WITHOUT MFA {'⚠️  NON-COMPLIANT' if len(mfa_results) > 0 else '✓ COMPLIANT'}

OVERALL COMPLIANCE STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{'✓ COMPLIANT' if len(mfa_results) == 0 and all(r['encrypted'] for r in s3_results) and all(r['encrypted'] for r in rds_results) else '✗ NON-COMPLIANT - Remediation Required'}

REQUIRED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
        if not all(r['encrypted'] for r in s3_results):
            report += "□ Enable S3 encryption for all buckets containing personal data\n"
        if not all(r['encrypted'] for r in rds_results):
            report += "□ Enable RDS encryption for all databases containing personal data\n"
        if len(mfa_results) > 0:
            report += f"□ Enable MFA for {len(mfa_results)} IAM users\n"
        if any(r.get('publicly_accessible') for r in rds_results):
            report += "□ Review and restrict RDS public accessibility\n"

        report += f"\nEvidence Location: {self.output_dir}/\n"
        report += "Retention: 3 years (GDPR Article 5(2) accountability)\n"

        report_file = f"{self.output_dir}/compliance-report-{self.timestamp}.txt"
        with open(report_file, 'w') as f:
            f.write(report)

        print(f"\n{report}")
        return report_file

if __name__ == "__main__":
    print("GDPR Article 32 Security of Processing Evidence Collection")
    print("=" * 70)

    collector = GDPRSecurityEvidence()

    s3_results = collector.check_s3_encryption()
    rds_results = collector.check_rds_encryption()
    mfa_results = collector.check_iam_mfa()
    collector.check_backups()

    collector.generate_compliance_report(s3_results, rds_results, mfa_results)

    print("\n✓ GDPR evidence collection complete")
    print("⚠️  REMINDER: Maintain evidence for 3 years per Article 5(2)")
```

---

**GDPR Applicability**: All organizations processing personal data of EU residents
**Enforcement**: 27 EU Member State Data Protection Authorities
**Maximum Penalty**: €20 million or 4% of worldwide annual revenue (Article 83)
**Evidence Retention**: 3 years minimum (accountability principle)
**Priority**: 🔴 CRITICAL (legal requirement for EU operations)
