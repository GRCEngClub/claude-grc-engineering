# ISO 27001 Evidence Checklist

Generates comprehensive evidence collection checklists for ISO/IEC 27001:2022 Annex A controls, including audit-ready documentation, automated collection examples, retention guidance, and export structures for the current 93-control Annex A catalog.

> **Never commit evidence artifacts to source control.** The outputs below include real usernames, credential reports, MFA device states, and privileged-account inventories. For GDPR workflows, raw exports may carry personal data subject to Art. 5 minimization and storage-limitation rules. Keep only what you need and delete on a retention schedule. `.gitignore` covers `evidence/` by default so `git add -A` will not sweep it up, but durable storage is your responsibility. Use an encrypted, access-controlled evidence locker (encrypted S3 with least-privilege IAM, a GRC platform, or a shared drive with full-disk encryption and MFA-gated access).

## Usage

```bash
/iso:evidence-checklist <control-id|domain> [--export <format>]
```

## Arguments

- `<control-id|domain>`: ISO 27001:2022 Annex A control ID (e.g., `A.5.15`, `A.8.24`) or category (`Organizational`, `People`, `Physical`, `Technological`)
- `--export`: Export format (`markdown`, `json`, `csv`). Default: `markdown`

## Control Category Reference

- `A.5` Organizational controls: governance, policies, supplier relationships, threat intelligence, access management oversight, and incident management coordination
- `A.6` People controls: screening, employment terms, awareness, disciplinary process, confidentiality, and remote working behaviors
- `A.7` Physical controls: secure areas, entry controls, equipment protection, clear desk/screen, cabling, and physical security monitoring
- `A.8` Technological controls: endpoint devices, privileged access, authentication, malware protection, logging, backup, cryptography, secure development, and network security

Use ISO control IDs as references only. Do not paste licensed ISO standard text into generated evidence packs; summarize the implemented intent and point auditors to the organization's licensed ISO 27001:2022 copy for authoritative wording.

## Example: Organizational Control Evidence (A.5.15 Access Control)

```bash
/iso:evidence-checklist A.5.15
```

**Output:**

```markdown
ISO 27001:2022 Evidence Checklist
Control: A.5.15 - Access control
Category: Organizational
Scope: All information systems, SaaS applications, cloud accounts, and repositories in the ISMS boundary
Audit Use: Stage 2 certification audit and surveillance audit sampling

## Control Description (paraphrased)

The organization should define, approve, and maintain rules that ensure access to information and systems is granted only to authorized users based on business and security requirements. See the licensed ISO 27001:2022 standard for authoritative control text.

## Evidence Requirements

### Required Documentation

□ **Access Control Policy**
  - Mapped ISO control IDs: A.5.15, A.5.16, A.5.18, A.8.2, A.8.3, A.8.5
  - Scope: Workforce, contractors, service accounts, privileged users, and external parties
  - Required elements:
    - Access request, approval, modification, and revocation rules
    - Least-privilege and segregation-of-duties expectations
    - Privileged access restrictions and approval thresholds
    - Periodic access review cadence
    - Joiner, mover, leaver process linkage to HR records
  - Update frequency: Annually and after major ISMS scope changes
  - Approver: Information security owner and system owners
  - Evidence: Approved access control policy with version history

□ **Access Request and Approval Records**
  - Mapped ISO control IDs: A.5.15, A.5.16, A.5.18
  - Required sample: 10-25 access requests across high-risk systems
  - Required elements:
    - Requester, target system, role requested, business justification
    - Manager or system-owner approval before access is granted
    - Date granted and implementing administrator
    - Evidence that emergency access is time-bound and reviewed
  - Frequency: Sample every audit period
  - Evidence: Ticket exports, workflow screenshots, or GRC approval records

□ **Periodic Access Review Package**
  - Mapped ISO control IDs: A.5.15, A.5.18, A.8.2
  - Required elements:
    - In-scope user and privileged account inventory
    - System-owner certification of continued business need
    - Exceptions and remediation actions
    - Completion date and accountable reviewer
  - Frequency: Quarterly for privileged/high-risk systems, at least annually for lower-risk systems
  - Evidence: Completed access review report and remediation tracker

□ **Joiner-Mover-Leaver Procedure**
  - Mapped ISO control IDs: A.5.15, A.5.16, A.5.18, A.6.1, A.6.5
  - Required elements:
    - HR trigger source and service-level targets
    - Mover access change workflow
    - Termination and contractor end-date handling
    - Validation that access was removed after departure
  - Frequency: Reviewed annually; tested with samples every audit cycle
  - Evidence: Procedure document plus sampled HR/ticket/system records

### Automated Evidence Collection

✓ **Identity and Access Inventory**
```bash
mkdir -p evidence

# AWS IAM users and roles in scope
aws iam list-users --output json \
  > evidence/iso27001-a515-iam-users-$(date +%Y%m%d).json
aws iam list-roles --output json \
  > evidence/iso27001-a515-iam-roles-$(date +%Y%m%d).json

# IAM credential report for access review and authentication checks
aws iam generate-credential-report
aws iam get-credential-report --output text | base64 -d \
  > evidence/iso27001-a515-credential-report-$(date +%Y%m%d).csv

# GitHub repository collaborators for sampled critical repositories
gh repo list ORG --limit 200 --json nameWithOwner | jq -r '.[].nameWithOwner' | while read repo; do
  gh api repos/$repo/collaborators --paginate \
    > evidence/iso27001-a515-github-collaborators-$(echo $repo | tr / -)-$(date +%Y%m%d).json
done
```

Collection Frequency: Monthly for identity inventory; quarterly for formal review packs
Retention: Align to the ISMS audit evidence retention schedule, commonly 3 years or the certification cycle plus one year
Purpose: Demonstrates controlled user and privileged access under A.5.15, A.5.18, and A.8.2

✓ **Access Change Audit Trail**
```bash
# AWS CloudTrail access changes in the last 90 days
for event in CreateUser DeleteUser AttachUserPolicy DetachUserPolicy AddUserToGroup RemoveUserFromGroup; do
  aws cloudtrail lookup-events \
    --lookup-attributes AttributeKey=EventName,AttributeValue=$event \
    --start-time $(date -u -d '90 days ago' +%Y-%m-%dT%H:%M:%S) \
    --max-items 1000 \
    --output json > evidence/iso27001-a515-${event}-$(date +%Y%m).json
done

# GitHub organization membership changes
gh api orgs/ORG/audit-log --paginate \
  -f phrase='action:org.add_member action:org.remove_member action:team.add_member action:team.remove_member' \
  > evidence/iso27001-a515-github-access-changes-$(date +%Y%m%d).json
```

Collection Frequency: Monthly or per access review cycle
Retention: Same as audit logs supporting the ISMS
Purpose: Supports A.5.15 access control rules, A.5.16 identity lifecycle, and A.5.18 access rights review

### Manual Evidence Collection

□ **Access Control Design Walkthrough**
- Interview system owners for sampled critical systems
- Confirm that roles map to business responsibilities
- Confirm that access exceptions have risk acceptance or remediation plans
- Evidence: Walkthrough notes, system diagrams, and access model screenshots

□ **Sample Testing Worksheet**
- Select new hires, transfers, terminations, privileged grants, and emergency access cases
- Trace each sample from request to approval to technical implementation
- Record deviations, root cause, owner, and completion date
- Evidence: Auditor-ready worksheet linked to source tickets and system exports

## Export Examples

### JSON

```json
{
  "framework": "ISO 27001:2022",
  "control_id": "A.5.15",
  "category": "Organizational",
  "evidence_items": [
    {
      "name": "Access Control Policy",
      "mapped_controls": ["A.5.15", "A.5.16", "A.5.18", "A.8.2", "A.8.3", "A.8.5"],
      "type": "documentation",
      "frequency": "annual",
      "owner": "information_security_owner"
    },
    {
      "name": "Periodic Access Review Package",
      "mapped_controls": ["A.5.15", "A.5.18", "A.8.2"],
      "type": "review_record",
      "frequency": "quarterly_for_high_risk_systems"
    }
  ]
}
```

### CSV

```csv
control_id,category,evidence_item,type,frequency,owner
A.5.15,Organizational,Access Control Policy,documentation,annual,Information Security Owner
A.5.15,Organizational,Access Request and Approval Records,sample_records,per_audit_period,System Owners
A.5.18,Organizational,Periodic Access Review Package,review_record,quarterly,System Owners
A.8.2,Technological,Privileged Account Inventory,system_export,monthly,Platform Owners
```
```

## Example: Technological Control Evidence (A.8.24 Use of Cryptography)

```bash
/iso:evidence-checklist A.8.24 --export markdown
```

**Output:**

```markdown
ISO 27001:2022 Evidence Checklist
Control: A.8.24 - Use of cryptography
Category: Technological
Scope: Production data stores, backups, network channels, secrets, certificates, and key-management services in the ISMS boundary
Audit Use: Certification audit evidence for cryptographic control design and operating effectiveness

## Control Description (paraphrased)

The organization should define and apply cryptographic rules that protect confidentiality, authenticity, and integrity according to business, legal, contractual, and risk requirements. See the licensed ISO 27001:2022 standard for authoritative control text.

## Evidence Requirements

### Required Documentation

□ **Cryptography and Key Management Standard**
  - Mapped ISO control IDs: A.8.24, A.5.31, A.5.33, A.8.11, A.8.12
  - Scope: Data at rest, data in transit, backups, secrets, code signing, and certificate management
  - Required elements:
    - Approved algorithms and minimum protocol versions
    - Key generation, rotation, revocation, backup, and destruction rules
    - Ownership of keys and separation of duties for administrators
    - Exceptions process for legacy systems
    - Legal, regulatory, and contractual encryption requirements
  - Update frequency: Annually and after material crypto or regulatory changes
  - Approver: Security architecture owner and risk owner
  - Evidence: Approved cryptography standard and exception register

□ **Encryption Coverage Register**
  - Mapped ISO control IDs: A.8.24, A.8.13, A.8.20, A.8.22
  - Required elements:
    - Critical data stores and backup locations
    - Encryption-at-rest status and key owner
    - Network paths requiring encryption in transit
    - Certificate expiry dates and renewal owner
  - Frequency: Monthly update for cloud-native environments; quarterly minimum for stable environments
  - Evidence: Register export or architecture inventory linked to automated scans

□ **Key Management Evidence**
  - Mapped ISO control IDs: A.8.24, A.8.2, A.8.15
  - Required elements:
    - KMS/HSM key inventory
    - Rotation settings or compensating controls
    - Access policies for key administrators and key users
    - Key-use audit logs
  - Frequency: Monthly review for production keys
  - Evidence: KMS exports, access review records, and log samples

### Automated Evidence Collection

✓ **Cloud Encryption at Rest**
```bash
mkdir -p evidence

# AWS S3 bucket encryption
aws s3api list-buckets --output json | jq -r '.Buckets[].Name' | while read bucket; do
  aws s3api get-bucket-encryption --bucket "$bucket" \
    > evidence/iso27001-a824-s3-${bucket}-encryption-$(date +%Y%m%d).json 2>&1 || true
done

# AWS RDS encryption status
aws rds describe-db-instances \
  --query 'DBInstances[].{DBInstanceIdentifier:DBInstanceIdentifier,StorageEncrypted:StorageEncrypted,KmsKeyId:KmsKeyId}' \
  --output json > evidence/iso27001-a824-rds-encryption-$(date +%Y%m%d).json

# AWS EBS volume encryption
aws ec2 describe-volumes \
  --query 'Volumes[].{VolumeId:VolumeId,Encrypted:Encrypted,KmsKeyId:KmsKeyId}' \
  --output json > evidence/iso27001-a824-ebs-encryption-$(date +%Y%m%d).json
```

Collection Frequency: Monthly
Retention: Align to ISMS certification evidence retention, commonly 3 years or the certification cycle plus one year
Purpose: Demonstrates cryptographic protection for stored information under A.8.24 and related backup/data-protection controls

✓ **TLS and Certificate Posture**
```bash
# AWS CloudFront minimum TLS versions
aws cloudfront list-distributions \
  --query 'DistributionList.Items[].{Id:Id,Domain:DomainName,TLS:ViewerCertificate.MinimumProtocolVersion}' \
  --output json > evidence/iso27001-a824-cloudfront-tls-$(date +%Y%m%d).json

# Application Load Balancer HTTPS listeners
aws elbv2 describe-load-balancers --query 'LoadBalancers[].LoadBalancerArn' --output text | tr '\t' '\n' | while read lb; do
  aws elbv2 describe-listeners --load-balancer-arn "$lb" \
    --query 'Listeners[].{Protocol:Protocol,Port:Port,SslPolicy:SslPolicy,Certificates:Certificates}' \
    --output json >> evidence/iso27001-a824-alb-listeners-$(date +%Y%m%d).json
done

# ACM certificate inventory
aws acm list-certificates --output json \
  > evidence/iso27001-a824-acm-certificates-$(date +%Y%m%d).json
```

Collection Frequency: Monthly and after major network changes
Retention: Same as security configuration evidence for the ISMS
Purpose: Supports cryptographic protection of data in transit under A.8.24 and network security expectations under A.8.20/A.8.22

✓ **Key Inventory and Access Logs**
```bash
# AWS KMS key inventory
aws kms list-keys --output json > evidence/iso27001-a824-kms-keys-$(date +%Y%m%d).json

# AWS KMS aliases for ownership review
aws kms list-aliases --output json > evidence/iso27001-a824-kms-aliases-$(date +%Y%m%d).json

# KMS key policy samples for critical keys
for key in $(aws kms list-keys --query 'Keys[].KeyId' --output text); do
  aws kms get-key-policy --key-id "$key" --policy-name default \
    > evidence/iso27001-a824-kms-policy-${key}-$(date +%Y%m%d).json 2>/dev/null || true
done

# CloudTrail KMS usage activity in the last 30 days
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventSource,AttributeValue=kms.amazonaws.com \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --max-items 1000 \
  --output json > evidence/iso27001-a824-kms-events-$(date +%Y%m%d).json
```

Collection Frequency: Monthly
Retention: Same as audit log retention for production security events
Purpose: Demonstrates key inventory, access restriction, and traceability for A.8.24

### Manual Evidence Collection

□ **Cryptographic Exception Review**
- Identify systems using unsupported protocols, weak ciphers, unmanaged keys, or unencrypted storage
- Confirm risk acceptance, migration plan, owner, and target remediation date
- Evidence: Exception register and remediation tickets

□ **Certificate and Key Lifecycle Walkthrough**
- Select a sample of recently issued, rotated, revoked, and expired certificates/keys
- Trace approvals, implementation records, and monitoring alerts
- Evidence: Ticket samples, KMS logs, certificate inventory, and operational runbooks

□ **Supplier and SaaS Encryption Confirmation**
- Collect SOC 2/ISO reports, security whitepapers, or contractual encryption commitments from key suppliers
- Map supplier encryption evidence to outsourced processing and supplier relationship controls
- Evidence: Supplier assurance files mapped to A.5.19-A.5.23 and A.8.24

## Export Examples

### JSON

```json
{
  "framework": "ISO 27001:2022",
  "control_id": "A.8.24",
  "category": "Technological",
  "evidence_items": [
    {
      "name": "Cryptography and Key Management Standard",
      "mapped_controls": ["A.8.24", "A.5.31", "A.5.33", "A.8.11", "A.8.12"],
      "type": "documentation",
      "frequency": "annual"
    },
    {
      "name": "KMS Key Inventory",
      "mapped_controls": ["A.8.24", "A.8.2", "A.8.15"],
      "type": "system_export",
      "frequency": "monthly"
    }
  ]
}
```

### CSV

```csv
control_id,category,evidence_item,type,frequency,owner
A.8.24,Technological,Cryptography and Key Management Standard,documentation,annual,Security Architecture
A.8.24,Technological,Encryption Coverage Register,inventory,monthly,Platform Owners
A.8.24,Technological,KMS Key Inventory,system_export,monthly,Cloud Platform Team
A.8.24,Technological,TLS and Certificate Posture,system_export,monthly,Network Engineering
```
```

## Domain-Level Requests

When the input is a domain instead of a single control, generate a consolidated checklist across that category and group evidence by control families:

- `Organizational` or `A.5`: policies, risk ownership, threat intelligence, supplier controls, incident coordination, business continuity, privacy, and access governance
- `People` or `A.6`: screening, employment terms, awareness, confidentiality, disciplinary process, and remote work practices
- `Physical` or `A.7`: facilities, entry control, secure offices, equipment siting, storage media handling, and physical monitoring
- `Technological` or `A.8`: endpoints, privileged access, authentication, malware, vulnerability management, configuration, backup, logging, network controls, cryptography, and secure development

For domain outputs, include:

1. A summary table with each applicable 2022 Annex A control ID in the selected category
2. Shared evidence items that satisfy multiple controls
3. Control-specific sample tests for high-risk controls
4. Export blocks in the requested `markdown`, `json`, or `csv` format
5. A reminder to keep evidence artifacts outside source control and in an encrypted evidence locker

## Evidence Quality Checklist

Before sharing an evidence pack with auditors, verify that every item has:

- Clear mapping to one or more ISO 27001:2022 control IDs from the current Annex A catalog
- Evidence owner and collection date
- Source system or authoritative record location
- Review/approval trail where human judgment is required
- Exceptions documented with risk owner, due date, and remediation status
- Sensitive data minimized or redacted where practical
- Storage location outside source control with appropriate encryption and access restrictions
