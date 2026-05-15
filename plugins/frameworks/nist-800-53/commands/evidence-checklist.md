# NIST 800-53 Evidence Checklist

Generates audit-ready evidence collection checklists for NIST SP 800-53 Rev. 5 controls and control families, with baseline-aware depth for Low, Moderate, and High impact systems. This command references control IDs and paraphrases implementation guidance; use the official NIST catalog as the authoritative source.

> **Never commit evidence artifacts to source control.** The outputs below include real usernames, credential reports, MFA device states, and privileged-account inventories. `.gitignore` covers `evidence/` by default so `git add -A` will not sweep it up, but durable storage is your responsibility. Use an encrypted, access-controlled evidence locker (encrypted S3 with least-privilege IAM, a GRC platform, or a shared drive with full-disk encryption and MFA-gated access).

## Usage

```bash
/nist-800-53:evidence-checklist <control-id|family> [--baseline <low|moderate|high>] [--export <format>]
```

## Arguments

- `<control-id|family>`: NIST 800-53 Rev. 5 control ID (for example, `AC-2`, `AU-3`, `SC-13`) or family abbreviation (for example, `AC`, `AU`, `SC`).
- `--baseline`: Target impact baseline (`low`, `moderate`, or `high`). Default: `moderate`.
- `--export`: Export format (`markdown`, `json`, or `csv`). Default: `markdown`.

## Baseline Scoping Rules

Use the baseline to tune evidence depth without changing the underlying control reference:

- **Low**: Policy, procedure, ownership, and a small current-state sample that shows the control is operating.
- **Moderate**: Low evidence plus operating logs, sampled tickets, review records, and cloud or identity exports for the last 30-90 days.
- **High**: Moderate evidence plus continuous monitoring outputs, exception tracking, automated control checks, independent review artifacts, and larger samples that cover privileged and high-risk systems.

When a family is supplied instead of a single control, generate one section per relevant control in that family, prioritize baseline-selected controls, and call out controls that are organizationally defined or inherited from a common control provider.

## Example: AC-2 Account Management Evidence (Moderate Baseline)

```bash
/nist-800-53:evidence-checklist AC-2 --baseline moderate
```

**Output:**

```markdown
NIST 800-53 Evidence Checklist
Control: AC-2 - Account Management
Baseline: Moderate
Family: AC - Access Control
Assessment Objective: Demonstrate that accounts are requested, approved, provisioned, reviewed, modified, disabled, and removed through a repeatable process.
Authoritative Source: NIST SP 800-53 Rev. 5 catalog (reference by ID; control text not reproduced here)

## Implementation Guidance (paraphrased)

The organization should define account types, assign account managers, require approval before account creation, maintain an inventory of active accounts, monitor account use, review access periodically, and disable or remove accounts when no longer needed. For Moderate systems, include evidence that the process operates across normal users, privileged users, service accounts, and external accounts.

## Evidence Requirements

### Required Documentation

□ **Account Management Policy and Procedure**
  - Scope: Workforce, privileged, service, emergency, shared, and external accounts
  - Required elements:
    - Account request and approval workflow
    - Account type definitions and ownership
    - Privileged account controls
    - Service account ownership and rotation expectations
    - Disablement and removal triggers for terminations and role changes
  - Baseline depth: Moderate requires policy plus procedure and role assignment evidence
  - Evidence: Signed policy, procedure, RACI, and review history
  - Frequency: Annual review and when access architecture changes

□ **Authoritative Account Inventory**
  - Include identity provider users, cloud IAM principals, privileged groups, service accounts, and break-glass accounts
  - Required fields: Owner, account type, system, privilege level, approval reference, last activity, review status
  - Baseline depth: Moderate requires current inventory and at least one completed review cycle
  - Evidence: Export from IdP/IAM, CMDB linkage, access review workbook or GRC record
  - Frequency: Monthly export, quarterly certification

□ **Access Request and Approval Samples**
  - Select a representative sample of new accounts, privilege changes, terminations, and service accounts
  - Required elements: Business justification, manager or owner approval, provisioning timestamp, reviewer sign-off
  - Baseline depth: Moderate sample should include normal and privileged accounts from the last 90 days
  - Evidence: Ticket exports from Jira/ServiceNow/Linear or equivalent workflow system
  - Frequency: Quarterly sampling

□ **Dormant and Terminated Account Remediation**
  - Track accounts with no recent activity and accounts owned by departed personnel
  - Required elements: Detection date, owner, remediation action, closure date, exception approval when retained
  - Baseline depth: Moderate requires remediation evidence, not just a point-in-time list
  - Evidence: Dormant account report, HR termination reconciliation, closure tickets
  - Frequency: Monthly

### Automated Evidence Collection

✓ **Identity Provider and Cloud Account Inventory**

```bash
mkdir -p evidence

# AWS IAM users, groups, roles, and credential report
aws iam list-users --output json > evidence/nist-ac-2-iam-users-$(date +%Y%m%d).json
aws iam list-roles --output json > evidence/nist-ac-2-iam-roles-$(date +%Y%m%d).json
aws iam list-groups --output json > evidence/nist-ac-2-iam-groups-$(date +%Y%m%d).json
aws iam generate-credential-report
aws iam get-credential-report --output text | base64 -d \
  > evidence/nist-ac-2-credential-report-$(date +%Y%m%d).csv

# Azure Entra ID users and privileged role assignments
az ad user list --output json > evidence/nist-ac-2-entra-users-$(date +%Y%m%d).json
az role assignment list --all --output json \
  > evidence/nist-ac-2-azure-role-assignments-$(date +%Y%m%d).json

# Google Cloud IAM policy bindings at project scope
gcloud projects get-iam-policy <PROJECT_ID> --format=json \
  > evidence/nist-ac-2-gcp-iam-policy-$(date +%Y%m%d).json
```

Collection Frequency: Monthly for Moderate; weekly or continuous for High
Retention: Match SSP and assessment evidence retention requirements
Purpose: Supports AC-2 account inventory, account type tracking, and review scope definition

✓ **Dormant and Non-MFA Account Review**

```bash
# AWS credential report fields include password and access key last-use timestamps
aws iam get-credential-report --output text | base64 -d \
  > evidence/nist-ac-2-credential-report-$(date +%Y%m%d).csv

# Users with console passwords but no MFA should be reviewed for AC-2/IA alignment
awk -F',' 'NR==1 || ($4 == "true" && $8 == "false") {print}' \
  evidence/nist-ac-2-credential-report-$(date +%Y%m%d).csv \
  > evidence/nist-ac-2-console-without-mfa-$(date +%Y%m%d).csv

# Accounts inactive for local threshold; tune threshold to the SSP-defined value
python3 - <<'PY'
import csv, datetime, pathlib
src = pathlib.Path('evidence/nist-ac-2-credential-report-' + datetime.datetime.utcnow().strftime('%Y%m%d') + '.csv')
out = pathlib.Path('evidence/nist-ac-2-dormant-candidates-' + datetime.datetime.utcnow().strftime('%Y%m%d') + '.csv')
threshold_days = 90
now = datetime.datetime.now(datetime.timezone.utc)
with src.open(newline='') as f, out.open('w', newline='') as g:
    reader = csv.DictReader(f)
    writer = csv.DictWriter(g, fieldnames=reader.fieldnames)
    writer.writeheader()
    for row in reader:
        last = row.get('password_last_used') or row.get('access_key_1_last_used_date') or row.get('access_key_2_last_used_date')
        if not last or last in ('N/A', 'no_information'):
            writer.writerow(row)
            continue
        try:
            dt = datetime.datetime.fromisoformat(last.replace('Z', '+00:00'))
        except ValueError:
            continue
        if (now - dt).days >= threshold_days:
            writer.writerow(row)
PY
```

Collection Frequency: Monthly for Moderate; weekly for High privileged accounts
Retention: Keep final reports and remediation tickets, not raw exports longer than necessary
Purpose: Supports account monitoring, stale account handling, and reviewer follow-up

### Baseline-Specific Additions

- **Low**: One current account inventory, documented owner for each account type, and a small approval sample.
- **Moderate**: Low plus quarterly access review evidence, dormant account remediation, privileged account samples, and 90-day change logs.
- **High**: Moderate plus continuous detection rules, emergency account use reports, automated reconciliation with HR, and independent validation of high-risk account closures.

### Completion Criteria

- Account inventory reconciles with IdP, cloud IAM, and system owner records.
- Sampled accounts have approval, business justification, and evidence of timely removal when no longer needed.
- Exceptions have owners, expiration dates, and compensating controls.
- Raw evidence is stored outside source control in an encrypted evidence repository.
```

## Example: AU Family Audit and Accountability Evidence (High Baseline)

```bash
/nist-800-53:evidence-checklist AU --baseline high --export markdown
```

**Output:**

```markdown
NIST 800-53 Evidence Checklist
Control Family: AU - Audit and Accountability
Baseline: High
Assessment Objective: Demonstrate that the system generates useful audit records, protects those records, reviews them, and retains them for investigations and oversight.
Authoritative Source: NIST SP 800-53 Rev. 5 catalog (reference by ID; control text not reproduced here)

## Family Scope

Prioritize audit event definition, event content, review and analysis, audit record protection, time synchronization, and retention. For High systems, include continuous monitoring outputs and evidence that privileged activity, security-relevant events, and cross-boundary events are captured and reviewed.

## Evidence Requirements

### Required Documentation

□ **Audit and Logging Standard**
  - Scope: Operating systems, applications, databases, cloud control planes, network devices, security tools, and identity services
  - Required elements:
    - Event categories to capture
    - Required fields such as actor, action, object, source, timestamp, and outcome
    - Log protection and access restrictions
    - Retention period and storage location
    - Review cadence and escalation workflow
  - Baseline depth: High requires documented tuning for privileged events, administrator actions, and security-significant failures
  - Evidence: Approved logging standard, SIEM onboarding matrix, retention policy
  - Frequency: Annual review and after major architecture changes

□ **Audit Event Selection and Rationale**
  - Map systems to the AU controls in scope and identify event sources for each platform
  - Required elements: Event source, owner, control objective, collection method, retention target, alerting rule linkage
  - Baseline depth: High requires coverage for critical systems and documented compensating controls for gaps
  - Evidence: Event source inventory, SIEM parser list, data flow diagram, exception register
  - Frequency: Quarterly review

□ **Audit Review and Escalation Records**
  - Include daily or continuous alert triage, periodic log review, and incident escalation evidence
  - Required elements: Reviewer, date, query or alert, disposition, linked incident or false-positive rationale
  - Baseline depth: High requires evidence of recurring review and supervisor or independent quality checks
  - Evidence: SIEM cases, SOC tickets, weekly review sign-offs, incident links
  - Frequency: Continuous triage with periodic management review

□ **Audit Record Protection Evidence**
  - Show logs are protected from unauthorized modification and deletion
  - Required elements: Write-once or immutable storage where used, restricted admin roles, encryption, integrity checks, backup configuration
  - Baseline depth: High requires stronger separation of duties and monitored changes to logging configuration
  - Evidence: Storage policy export, IAM policy, SIEM role export, KMS configuration, change tickets
  - Frequency: Monthly validation

### Automated Evidence Collection

✓ **Cloud Audit Source Inventory**

```bash
mkdir -p evidence

# AWS CloudTrail trails, event selectors, and retention-related bucket settings
aws cloudtrail describe-trails --include-shadow-trails --output json \
  > evidence/nist-au-cloudtrail-trails-$(date +%Y%m%d).json
aws cloudtrail get-event-selectors --trail-name <TRAIL_NAME> --output json \
  > evidence/nist-au-cloudtrail-event-selectors-$(date +%Y%m%d).json
aws s3api get-bucket-versioning --bucket <LOG_BUCKET> --output json \
  > evidence/nist-au-log-bucket-versioning-$(date +%Y%m%d).json
aws s3api get-bucket-encryption --bucket <LOG_BUCKET> --output json \
  > evidence/nist-au-log-bucket-encryption-$(date +%Y%m%d).json

# Azure activity log diagnostic settings
az monitor diagnostic-settings list --resource <RESOURCE_ID> --output json \
  > evidence/nist-au-azure-diagnostic-settings-$(date +%Y%m%d).json

# Google Cloud audit logging configuration
for project in $(gcloud projects list --format='value(projectId)'); do
  gcloud projects get-iam-policy "$project" --format=json \
    > evidence/nist-au-gcp-iam-policy-$project-$(date +%Y%m%d).json
  gcloud logging sinks list --project "$project" --format=json \
    > evidence/nist-au-gcp-sinks-$project-$(date +%Y%m%d).json
done
```

Collection Frequency: Weekly for High
Retention: Follow SSP-defined retention and legal hold requirements
Purpose: Supports AU family evidence for event capture, audit source coverage, and record protection

✓ **Audit Review and Alert Disposition Samples**

```bash
# AWS security-relevant control plane events for review sampling
aws cloudtrail lookup-events \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%S) \
  --max-items 1000 \
  --output json > evidence/nist-au-cloudtrail-sample-$(date +%Y%m%d).json

# Example Splunk export for privileged activity review; replace index and sourcetype with local values
splunk search 'index=security (action=login OR action=modify OR action=delete) user_role=privileged earliest=-7d' \
  -output json > evidence/nist-au-privileged-review-sample-$(date +%Y%m%d).json

# Example Elastic query export for failed authentication trends
curl -s -H "Content-Type: application/json" \
  -X POST "$ELASTIC_URL/security-*/_search" \
  -d '{"query":{"range":{"@timestamp":{"gte":"now-7d"}}},"size":1000}' \
  > evidence/nist-au-elastic-review-sample-$(date +%Y%m%d).json
```

Collection Frequency: Daily or continuous for High; retain reviewer sign-off summaries
Retention: Store summarized review packages in the evidence locker
Purpose: Supports audit review, analysis, and investigation readiness

### Baseline-Specific Additions

- **Low**: Document what events are logged, retain representative logs, and show one review sample.
- **Moderate**: Low plus centralized collection, periodic review records, audit storage access controls, and selected alert dispositions.
- **High**: Moderate plus continuous review coverage, immutable or tamper-evident storage, monitored logging configuration changes, independent QA of review outcomes, and exception tracking for missing sources.

### Completion Criteria

- Critical systems have mapped audit sources and assigned owners.
- Audit records include enough context to support investigations without relying on undocumented tribal knowledge.
- Review evidence shows actual disposition, not only that logs exist.
- Log access and retention controls are validated and exceptions are tracked to closure.
- Raw logs and exports are stored outside source control in an encrypted evidence repository.
```

## Export Format Guidance

### Markdown

Use Markdown for assessor-facing packages and SSP attachment drafts. Include narrative context, collection commands, sample criteria, reviewer sign-offs, and exception notes.

### JSON

Use JSON when feeding an evidence catalog or GRC platform. Recommended fields:

```json
{
  "framework": "NIST SP 800-53 Rev. 5",
  "target": "AC-2",
  "baseline": "moderate",
  "evidence_items": [
    {
      "name": "Account inventory export",
      "type": "automated_export",
      "owner": "Identity Engineering",
      "frequency": "monthly",
      "storage": "encrypted evidence locker",
      "control_refs": ["AC-2"]
    }
  ]
}
```

### CSV

Use CSV for sampling trackers and assessor request lists. Recommended columns:

```csv
control_id,baseline,evidence_name,owner,frequency,source_system,retention,collection_status,exception_id
AC-2,moderate,Account inventory export,Identity Engineering,monthly,IdP and cloud IAM,SSP-defined,pending,
```

## Guardrails

- Do not paste official NIST catalog text into the generated checklist; reference control IDs and paraphrase implementation expectations.
- Separate raw evidence from assessor-ready summaries.
- Redact secrets, tokens, private keys, session cookies, and unnecessary personal data before packaging evidence.
- Prefer current exports plus signed review records over screenshots alone.
- Mark inherited controls and common-control-provider evidence clearly so the system owner does not recollect evidence already maintained elsewhere.
