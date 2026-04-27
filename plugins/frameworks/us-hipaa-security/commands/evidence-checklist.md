---
description: HIPAA Security Rule evidence checklist organized by safeguard category
---

# HIPAA Security Rule Evidence Checklist

Generate a comprehensive evidence request list for HIPAA Security Rule compliance, organized by safeguard category. Suitable for audits, readiness assessments, or OCR desk audit preparation.

> **Never commit evidence artifacts to source control.** Evidence outputs may include real patient information, access logs, and security configurations that contain or reference ePHI. `.gitignore` covers `evidence/` by default so `git add -A` will not sweep it up, but durable storage is your responsibility. Use an encrypted, access-controlled evidence locker with appropriate safeguards per §164.312(a)(2)(iv).

## Usage

```bash
/us-hipaa-security:evidence-checklist [--category=<cat>] [--format=<fmt>] [--audience=<aud>]
```

## Arguments

- `--category`: Safeguard category to include
  - `admin` - Administrative Safeguards (§164.308)
  - `physical` - Physical Safeguards (§164.310)
  - `technical` - Technical Safeguards (§164.312)
  - `org` - Organizational Requirements (§164.314)
  - `policies` - Policies and Documentation (§164.316)
  - Default: All categories
- `--format`: Output format
  - `table` - Markdown table (default)
  - `markdown` - Detailed Markdown list
  - `csv` - Comma-separated values (for spreadsheets)
- `--audience`: Target audience
  - `auditor` - External auditor or OCR (detailed, with CFR references)
  - `internal` - Internal readiness check (simplified)

## Evidence Checklist

### Administrative Safeguards (§164.308)

| Evidence Item | CFR Reference | Required/Addressable | Common Format | Notes/Gotchas |
|---------------|---------------|---------------------|---------------|---------------|
| **Documented risk analysis covering all ePHI systems** | §164.308(a)(1)(ii)(A) | Required | Risk analysis report, updated within last 12 months | Must be organization-wide, not just certain systems. Most common OCR finding. |
| **Written risk management plan with remediation timelines** | §164.308(a)(1)(ii)(B) | Required | Risk management plan document | Must prioritize high/critical risks and assign owners and due dates |
| **Sanction policy for workforce member security violations** | §164.308(a)(1)(ii)(C) | Required | Written policy signed by management | Must specify sanctions for improper access/disclosure of ePHI |
| **Information system activity review logs and reports** | §164.308(a)(1)(ii)(D) | Required | Audit log review reports, quarterly or more frequent | Must demonstrate regular review of access logs and security events |
| **Assigned security official designation documentation** | §164.308(a)(2) | Required | Organizational chart, job description, delegation of authority | Single point of accountability with authority to implement Security Rule |
| **Workforce clearance procedure records** | §164.308(a)(3)(ii)(B) | Addressable | Background check records, clearance forms | If not implemented, document why it's not reasonable/appropriate |
| **Access authorization policies and approval records** | §164.308(a)(4)(ii)(A) | Required | Access authorization form, approval workflow | Formal process for granting/reviewing access to ePHI |
| **Security awareness training records with completion dates** | §164.308(a)(5)(i) | Required | Training completion report, sign-in sheets | All workforce members with ePHI access must be trained upon hire and periodically thereafter |
| **Malware/phishing awareness training materials** | §164.308(a)(5)(ii)(B) | Addressable | Training presentations, phishing simulation reports | If not implemented, document alternative protection mechanisms |
| **Login monitoring procedures and evidence** | §164.308(a)(5)(ii)(C) | Addressable | Login monitoring policy, anomalous login review logs | May be part of broader SIEM/security monitoring program |
| **Password management policy** | §164.308(a)(5)(ii)(D) | Addressable | Password policy document, MFA configuration evidence | If passwords not used, document alternative authentication method |
| **Security incident response procedure documentation** | §164.308(a)(6)(i) | Required | Incident response plan with roles and responsibilities | Must cover detection, response, reporting, and recovery |
| **Security incident log and documented response records** | §164.308(a)(6)(ii) | Required | Incident log, investigation reports | Log all incidents, even those not requiring breach notification |
| **Contingency/disaster recovery plan, tested within last 12 months** | §164.308(a)(7)(i) | Required | Disaster recovery plan, test report | Testing must include backups and emergency mode operations |
| **Data backup procedures and recent backup test results** | §164.308(a)(7)(ii)(A) | Required | Backup policy, backup verification logs | Backups must be tested periodically to ensure restoration capability |
| **Emergency mode operation plan** | §164.308(a)(7)(ii)(B) | Required | Emergency mode procedures, access documentation | How to access ePHI during emergency (e.g., power outage, natural disaster) |
| **Annual or event-triggered security evaluation report** | §164.308(a)(8) | Required | Security evaluation report, gap analysis | Must evaluate technical and non-technical safeguards |
| **Executed BAAs for all relevant vendors and subcontractors** | §164.308(b)(1) | Required | Signed Business Associate Agreements | Include cloud providers, SaaS vendors, billing companies, IT service providers |

### Physical Safeguards (§164.310)

| Evidence Item | CFR Reference | Required/Addressable | Common Format | Notes/Gotchas |
|---------------|---------------|---------------------|---------------|---------------|
| **Facility access control policy and physical access logs** | §164.310(a)(1) | Required | Access control policy, badge access logs | Must restrict unauthorized physical access to ePHI systems |
| **Contingency operations plan for facility emergencies** | §164.310(a)(2)(i) | Addressable | Emergency access procedures | How to access ePHI during facility emergency (fire, flood, etc.) |
| **Facility security plan** | §164.310(a)(2)(ii) | Addressable | Security plan document, security guard procedures | Must address facility access controls |
| **Access control and validation procedures** | §164.310(a)(2)(iii) | Addressable | Visitor log, badge issuance procedures | Visitors must be escorted and access logged |
| **Maintenance records for physical safeguards** | §164.310(a)(2)(iv) | Addressable | Maintenance logs for security systems | Document maintenance of locks, alarms, badge readers |
| **Workstation use policy specifying acceptable ePHI handling** | §164.310(b) | Required | Workstation use policy, signed acknowledgments | Covers acceptable use, locking screens, no eating/drinking near computers |
| **Physical workstation security controls** | §164.310(c) | Addressable | Screen locks, cable locks, privacy screens, positioning | May include workstation placement away from public areas |
| **Media disposal and destruction records for drives containing ePHI** | §164.310(d)(2)(i) | Addressable | Disposal log, certificate of destruction | Must follow NIST SP 800-88 guidelines for sanitization |
| **Media re-use and sanitization records before reuse** | §164.310(d)(2)(ii) | Addressable | Sanitization log, sanitization procedure documentation | Must verify no ePHI remains before reusing media |
| **Hardware and media movement/transfer tracking log** | §164.310(d)(2)(iii) | Addressable | Media transfer log, chain of custody form | Track movement of ePHI-containing media between locations |
| **Data backup and storage documentation** | §164.310(d)(2)(iv) | Addressable | Backup storage location, access controls | Backup media must be securely stored |
| **Hardware/electronics disposal records** | §164.310(d)(2)(i) | Addressable | Equipment disposal log, destruction certificate | Must ensure ePHI cannot be recovered |

### Technical Safeguards (§164.312)

| Evidence Item | CFR Reference | Required/Addressable | Common Format | Notes/Gotchas |
|---------------|---------------|---------------------|---------------|---------------|
| **Unique user ID assignment policy and provisioning evidence** | §164.312(a)(2)(i) | Required | Account management policy, user provisioning logs | No shared accounts allowed for ePHI access |
| **Emergency access procedure documentation** | §164.312(a)(2)(ii) | Required | Emergency access procedures, access logs | How to access ePHI during emergency when normal authentication unavailable |
| **Automatic logoff configuration evidence (or documented alternative)** | §164.312(a)(2)(iii) | Addressable | Session timeout policy, screen lock settings | If not implemented, document why it's not reasonable (e.g., clinical workflow) |
| **Encryption/decryption of ePHI at rest — implementation evidence or documented rationale** | §164.312(a)(2)(iv) | Addressable | Encryption configuration, or documented alternative | Most common addressable spec. If not encrypted, document compensating controls |
| **Audit log configuration and sample audit logs from ePHI systems** | §164.312(b) | Required | Audit log configuration report, sample logs | Must record accesses, disclosures, modifications, deletions |
| **Audit log review procedures and evidence of regular review** | §164.312(b) | Required | Audit review schedule, review sign-off logs | Logs must be reviewed regularly (quarterly or more frequent) |
| **Data integrity controls evidence** | §164.312(c)(1) | Addressable | Checksum verification, hash validation, digital signatures | Protect ePHI from improper alteration or destruction |
| **Authentication mechanism documentation (MFA evidence preferred)** | §164.312(d) | Required | Authentication policy, MFA configuration | Verify identity of persons/entities accessing ePHI |
| **Encryption in transit for ePHI — TLS configuration evidence or documented alternative** | §164.312(e)(2)(ii) | Addressable | TLS configuration, network encryption evidence | All external ePHI transmissions should be encrypted |
| **Authentication for ePHI transmission** | §164.312(e)(1) | Required | Authentication policy for network access | Verify identity of entities receiving ePHI electronically |

### Organizational Requirements (§164.314)

| Evidence Item | CFR Reference | Required/Addressable | Common Format | Notes/Gotchas |
|---------------|---------------|---------------------|---------------|---------------|
| **BAA template with required contractual provisions checklist** | §164.314(a)(1) | Required | BAA template document, provisions checklist | Must include all required provisions per §164.314(a)(2)(i) |
| **Executed BAAs for all Business Associates** | §164.314(a)(1) | Required | Signed BAAs, BAA tracking log | Include subcontractor BAAs |
| **BAA subcontractor agreement evidence** | §164.314(a)(2)(ii) | Required | Subcontractor BAAs, BAA amendment notices | BAs must require subcontractors to comply with same restrictions |
| **Group health plan amendment documentation** | §164.314(b)(1) | Required (if applicable) | Plan document amendment, sponsor certification | Required only if organization is a group health plan with plan sponsor |
| **Plan sponsor certification of ePHI safeguards** | §164.314(b)(2)(iii) | Required (if applicable) | Sponsor certification, compliance statement | Plan sponsor must certify compliance with Security Rule |
| **Restriction on uses/disclosures by plan sponsor** | §164.314(b)(2)(iv) | Required (if applicable) | Plan document restrictions, disclosure logs | Plan sponsor cannot use/disclosed ePHI beyond plan administration |

### Policies, Procedures, and Documentation (§164.316)

| Evidence Item | CFR Reference | Required/Addressable | Common Format | Notes/Gotchas |
|---------------|---------------|---------------------|---------------|---------------|
| **Written policies and procedures for Security Rule compliance** | §164.316(a) | Required | Complete set of security policies and procedures | Must be reasonable and appropriate for organization's size and complexity |
| **Policy version history and review/update dates** | §164.316(b)(1) | Required | Policy version control, review log, approval signatures | Policies must be reviewed and updated periodically |
| **Documentation retention evidence demonstrating 6-year retention** | §164.316(b)(2) | Required | Document retention schedule, archive access logs | Policies must be retained 6 years from creation or last effective date |
| **Security policy documentation for all required implementation specifications** | §164.316(a) | Required | Policy manual covering all applicable safeguards | Must address each required and implemented addressable specification |
| **Written procedures for addressable specification decisions** | §164.316(a) | Required | Addressable spec assessment documentation | Must document rationale for each addressable spec decision |

## Evidence Collection by Format

### For Auditors (External/OCR)

Provide organized evidence package with:

1. **Cover Letter**: Organization overview, assessment scope, point of contact
2. **Table of Contents**: Evidence index with CFR references
3. **Executive Summary**: Security Rule compliance status, key gaps, remediation timeline
4. **Detailed Evidence Sections**: Grouped by safeguard category
5. **Gap Analysis**: Findings with CFR section, severity, remediation plan
6. **Attachments**: All supporting documentation

### For Internal Readiness

Simplified checklist format:

- [ ] Risk analysis completed and updated
- [ ] All BAAs signed and current
- [ ] Security training current for all staff
- [ ] Access controls implemented (unique IDs, least privilege)
- [ ] Audit logging enabled and reviewed regularly
- [ ] Contingency plan tested in last 12 months
- [ ] Encryption implemented where addressable and reasonable
- [ ] Policies reviewed and updated
- [ ] Incident response procedures documented
- [ ] Physical security controls in place

## Automated Evidence Collection

### Cloud Infrastructure Evidence

**AWS - S3 Bucket Encryption Check**:
```bash
# Check if S3 buckets containing ePHI have encryption enabled
aws s3api list-buckets --output json | jq -r '.Buckets[].Name' | while read bucket; do
  encryption=$(aws s3api get-bucket-encryption --bucket "$bucket" 2>&1)
  if echo "$encryption" | grep -q "ServerSideEncryptionConfigurationNotFoundError"; then
    echo "$bucket,NOT ENCRYPTED" >> evidence/hipaa-s3-encryption-$(date +%Y%m%d).csv
  else
    echo "$bucket,ENCRYPTED" >> evidence/hipaa-s3-encryption-$(date +%Y%m%d).csv
  fi
done
```

**AWS - RDS Encryption Check**:
```bash
# Check if RDS databases containing ePHI are encrypted
aws rds describe-db-instances --query 'DBInstances[].[DBInstanceIdentifier,StorageEncrypted]' \
  --output json > evidence/hipaa-rds-encryption-$(date +%Y%m%d).json
```

**AWS - CloudTrail Logging Check**:
```bash
# Verify CloudTrail is logging ePHI-affecting AWS account activity
aws cloudtrail describe-trails --query 'trailList[?IsMultiRegionTrail==`true`]' \
  --output json > evidence/hipaa-cloudtrail-$(date +%Y%m%d).json
```

### On-Premises Evidence

**Active Directory - User Account Review**:
```powershell
# Export Active Directory users with ePHI system access
Get-ADUser -Filter * -Properties LastLogonDate,Enabled |
  Where-Object {$_.MemberOf -like "*ePHI-Access*"} |
  Select-Object Name,Enabled,LastLogonDate |
  Export-Csv -Path "evidence/hipaa-ad-users-$(Get-Date -Format yyyyMMdd).csv" -NoTypeInformation
```

**SQL Server - Audit Log Export**:
```sql
-- Export audit logs from SQL Server databases containing ePHI
SELECT * FROM sys.dm_audit_log
WHERE event_time > DATEADD(day, -90, GETDATE())
ORDER BY event_time DESC;
```

## Evidence Retention Requirements

**6-Year Retention** (§164.316(b)(2)):

- Retain from date of creation OR date last in effect (whichever is later)
- Applies to all Security Rule policies and procedures
- Includes risk analyses, BAAs, incident logs, training records, evaluation reports
- Must be accessible for OCR reviews

**Recommended Evidence Archive Structure**:
```text
evidence/
└── hipaa-security/
    ├── administrative/
    │   ├── risk-analysis/
    │   ├── training-records/
    │   ├── incident-logs/
    │   └── policies/
    ├── physical/
    │   ├── facility-access-logs/
    │   ├── workstation-security/
    │   └── media-disposal/
    ├── technical/
    │   ├── access-control/
    │   ├── audit-logs/
    │   └── encryption-evidence/
    ├── organizational/
    │   └── baas/
    └── policies/
        ├── security-policies/
        └── procedures/
```

## Examples

```bash
# Generate full evidence checklist (all categories)
/us-hipaa-security:evidence-checklist

# Generate Administrative Safeguards checklist only
/us-hipaa-security:evidence-checklist --category=admin

# Generate checklist in CSV format for spreadsheet import
/us-hipaa-security:evidence-checklist --format=csv

# Generate simplified internal readiness checklist
/us-hipaa-security:evidence-checklist --audience=internal
```

## Related Commands

- `/us-hipaa-security:assess` - Run gap assessment before collecting evidence
- `/grc-engineer:gap-assessment --framework=US-HIPAA-Security` - Direct SCF crosswalk assessment

---

**Applicability**: Covered Entities and Business Associates
**Citation**: 45 CFR Part 164, Subpart C
**Enforcement**: US HHS Office for Civil Rights (OCR)
**Evidence Retention**: 6 years (§164.316(b)(2))
