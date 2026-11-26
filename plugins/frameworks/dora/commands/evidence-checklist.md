---
description: "Generates comprehensive evidence collection checklists for EU Digital Operational Resilience Act (DORA) requirements, tailored for financial entities operating in the EU with ICT risk management focus"
---

# DORA Evidence Checklist

Generates comprehensive evidence collection checklists for EU Digital Operational Resilience Act (DORA) requirements, tailored for financial entities operating in the EU with ICT risk management focus.

> **Never commit evidence artifacts to source control.** The outputs below include real usernames, credential reports, MFA device states, and privileged-account inventories. `.gitignore` covers `evidence/` by default so `git add -A` will not sweep it up, but durable storage is your responsibility. Use an encrypted, access-controlled evidence locker (encrypted S3 with least-privilege IAM, a GRC platform, or a shared drive with full-disk encryption and MFA-gated access).

## Usage

```bash
/dora:evidence-checklist <article> [--entity-type <credit|investment|payment>] [--export <format>]
```

## Arguments

- `<article>`: DORA article (e.g., "Article 6", "Article 9", "Article 11") or topic (e.g., "ICT Risk Management", "Incident Reporting", "Testing")
- `--entity-type`: Financial entity type (`credit`, `investment`, `payment`, `crypto`, `insurance`). Default: `credit`
- `--export`: Export format (`json`, `csv`, `markdown`). Default: `markdown`

## Example: ICT Risk Management Framework Evidence

```bash
/dora:evidence-checklist "Article 6" --entity-type credit
```

**Output:**

```markdown
DORA Evidence Checklist
Article: Article 6 - ICT Risk Management Framework
Entity Type: Credit Institution (Bank)
Compliance Deadline: January 17, 2025
Supervision: ECB/National Competent Authority

## Article 6 Requirements

Financial entities shall have a sound, comprehensive and well-documented ICT risk management framework as part of their overall risk management system, which enables them to address ICT risk quickly, efficiently and comprehensively and to ensure a high level of digital operational resilience.

## Key Requirements Summary

1. **ICT Risk Management Framework** documented and approved by management body
2. **ICT Risk Management Strategy** aligned with business strategy
3. **ICT Risk Management Policy** covering all ICT risks
4. **ICT Risk Identification, Classification, Assessment**
5. **ICT Risk Mitigation and Protection**
6. **ICT Risk Detection, Response, Recovery**
7. **ICT Risk Monitoring and Communication**
8. **ICT Risk Testing** (Articles 24-25)

## Evidence Requirements

### Required Documentation (Policy Layer)

□ **ICT Risk Management Framework Document**
  - Scope: All ICT systems and third-party ICT service providers
  - Required components:
    - Governance structure (roles, responsibilities)
    - Risk identification methodology
    - Risk assessment procedures (likelihood, impact)
    - Risk treatment strategies (accept, mitigate, transfer, avoid)
    - Monitoring and reporting mechanisms
    - Integration with overall risk management
  - Update frequency: Annually or when material changes
  - Approver: Management Body (Board of Directors)
  - Evidence: Board-approved ICT Risk Framework v1.x with minutes

□ **ICT Risk Management Strategy**
  - Multi-year ICT strategy (3-5 years)
  - Alignment with business strategy and risk appetite
  - Digital resilience objectives and KPIs
  - Investment plan for ICT resilience
  - Evidence: Board-approved ICT Strategy document

□ **ICT Risk Management Policy**
  - Detailed risk management procedures
  - Risk assessment criteria and methodology
  - Risk tolerance thresholds
  - Escalation procedures
  - Evidence: CISO-approved ICT Risk Policy v1.x

□ **ICT Asset Inventory** (Article 8(2))
  - Complete inventory of all ICT assets
  - Classification by criticality (critical, important, standard)
  - Ownership and dependencies
  - Update frequency: Real-time or monthly
  - Evidence: ICT asset register with classification

□ **ICT Risk Register**
  - Identified ICT risks with ratings (inherent, residual)
  - Risk treatment plans
  - Risk owners
  - Review history (quarterly minimum)
  - Evidence: ICT Risk Register (Excel/GRC tool export)

□ **Business Impact Analysis (BIA) for Critical ICT Services**
  - Identification of critical business functions
  - Maximum tolerable downtime (MTD)
  - Recovery time objectives (RTO)
  - Recovery point objectives (RPO)
  - Evidence: BIA report for all critical services

### Automated Evidence Collection

✓ **ICT Asset Inventory (Cloud Infrastructure)**
```bash
# AWS - Complete infrastructure inventory
aws resourcegroupstaggingapi get-resources \
  --output json > evidence/dora-art6-aws-assets-$(date +%Y%m%d).json

# AWS Config - Configuration snapshots
aws configservice describe-configuration-recorders \
  --output json > evidence/dora-art6-config-recorders-$(date +%Y%m%d).json

# List all EC2 instances with tags (criticality classification)
aws ec2 describe-instances \
  --filters "Name=tag-key,Values=Criticality" \
  --query 'Reservations[].Instances[].[InstanceId, Tags[?Key==`Criticality`].Value | [0], State.Name]' \
  --output json > evidence/dora-art6-ec2-criticality-$(date +%Y%m%d).json

# RDS databases (critical data assets)
aws rds describe-db-instances --output json \
  > evidence/dora-art6-rds-databases-$(date +%Y%m%d).json

# Azure - Resource inventory
az resource list --output json > evidence/dora-art6-azure-assets-$(date +%Y%m%d).json

# GCP - Asset inventory
gcloud asset search-all-resources --format=json \
  > evidence/dora-art6-gcp-assets-$(date +%Y%m%d).json
```

Collection Frequency: Monthly (minimum), real-time preferred
Retention: 5 years (DORA requirement)
Purpose: Complete ICT asset inventory per Article 8(2)

✓ **Configuration Management Evidence**

```bash
# AWS Config - Configuration compliance
aws configservice describe-compliance-by-config-rule \
  --output json > evidence/dora-art6-config-compliance-$(date +%Y%m%d).json

# Get non-compliant resources
aws configservice describe-compliance-by-resource \
  --compliance-types NON_COMPLIANT \
  --output json > evidence/dora-art6-non-compliant-resources-$(date +%Y%m%d).json

# Azure Policy compliance
az policy state list --resource-type "Microsoft.Compute/virtualMachines" \
  --filter "complianceState eq 'NonCompliant'" \
  --output json > evidence/dora-art6-azure-policy-violations-$(date +%Y%m%d).json

# GCP Policy Intelligence
gcloud asset search-all-resources \
  --asset-types='compute.googleapis.com/Instance' \
  --format=json > evidence/dora-art6-gcp-policy-compliance-$(date +%Y%m%d).json
```

Collection Frequency: Daily
Retention: 5 years
Purpose: ICT system configuration monitoring

✓ **Vulnerability Management Evidence**

```bash
# AWS Inspector - Vulnerability findings
aws inspector2 list-findings \
  --filter-criteria '{"severity":[{"comparison":"EQUALS","value":"CRITICAL"},{"comparison":"EQUALS","value":"HIGH"}]}' \
  --output json > evidence/dora-art6-vulnerabilities-$(date +%Y%m%d).json

# AWS Security Hub - Security findings
aws securityhub get-findings \
  --filters '{"SeverityLabel":[{"Value":"CRITICAL","Comparison":"EQUALS"},{"Value":"HIGH","Comparison":"EQUALS"}],"RecordState":[{"Value":"ACTIVE","Comparison":"EQUALS"}]}' \
  --output json > evidence/dora-art6-security-findings-$(date +%Y%m%d).json

# Azure Security Center - Recommendations
az security assessment list --output json \
  > evidence/dora-art6-azure-security-$(date +%Y%m%d).json

# Tenable/Qualys vulnerability scan results (if using third-party)
# Export via API or manual download
# evidence/dora-art6-vulnerability-scan-$(date +%Y%m%d).csv
```

Collection Frequency: Weekly (scans), Monthly (reports)
Retention: 5 years
Purpose: ICT vulnerability management per Article 9(4)

✓ **Patch Management Evidence**

```bash
# AWS Systems Manager - Patch compliance
aws ssm describe-instance-patch-states \
  --output json > evidence/dora-art6-patch-compliance-$(date +%Y%m%d).json

# Azure Update Management
az vm assess-patches --ids $(az vm list --query '[].id' -o tsv) \
  --output json > evidence/dora-art6-azure-patches-$(date +%Y%m%d).json

# List instances with missing critical patches
aws ssm describe-instance-patch-states \
  --output json | jq '.InstancePatchStates[] | select(.CriticalNonCompliantCount > 0 or .SecurityNonCompliantCount > 0)' \
  > evidence/dora-art6-missing-patches-$(date +%Y%m%d).json
```

Collection Frequency: Weekly
Retention: 5 years
Purpose: Patch management process evidence

✓ **Backup and Recovery Evidence**

```bash
# AWS Backup - Backup job status
aws backup list-backup-jobs \
  --by-created-after $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --output json > evidence/dora-art6-backup-jobs-$(date +%Y%m).json

# RDS automated backups
aws rds describe-db-snapshots \
  --snapshot-type automated \
  --output json > evidence/dora-art6-rds-backups-$(date +%Y%m%d).json

# S3 versioning status (for data recovery)
for bucket in $(aws s3api list-buckets --query 'Buckets[].Name' --output text); do
  echo "=== $bucket ===" >> evidence/dora-art6-s3-versioning-$(date +%Y%m%d).txt
  aws s3api get-bucket-versioning --bucket "$bucket" >> evidence/dora-art6-s3-versioning-$(date +%Y%m%d).txt
done

# Azure - Recovery Services vaults
az backup vault list --output json > evidence/dora-art6-azure-vaults-$(date +%Y%m%d).json
```

Collection Frequency: Monthly
Retention: 5 years
Purpose: Backup and recovery capabilities per Article 11

✓ **Monitoring and Logging Evidence**

```bash
# AWS CloudTrail - Audit trail
aws cloudtrail describe-trails --output json \
  > evidence/dora-art6-cloudtrail-config-$(date +%Y%m%d).json

# CloudWatch alarms (monitoring setup)
aws cloudwatch describe-alarms --output json \
  > evidence/dora-art6-cloudwatch-alarms-$(date +%Y%m%d).json

# GuardDuty findings (threat detection)
aws guardduty list-findings \
  --detector-id $(aws guardduty list-detectors --query 'DetectorIds[0]' --output text) \
  --finding-criteria '{"Criterion":{"severity":{"Gte":7}}}' \
  --output json > evidence/dora-art6-guardduty-findings-$(date +%Y%m%d).json

# Azure Monitor activity logs
az monitor activity-log list \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --output json > evidence/dora-art6-azure-activity-$(date +%Y%m).json
```

Collection Frequency: Daily (critical alerts), Monthly (summaries)
Retention: 5 years
Purpose: Continuous monitoring per Article 17

### Manual Evidence Collection

□ **Management Body Approval Evidence**

- Board meeting minutes approving ICT Risk Framework
- Board resolution on ICT strategy
- Evidence: Board minutes (sanitized), resolution document
- Frequency: Annual (or when framework updated)
- **CRITICAL**: DORA requires explicit management body oversight

□ **Quarterly ICT Risk Committee Meetings**

- ICT Risk Committee charter
- Meeting minutes (quarterly minimum)
- Risk review and approval decisions
- Escalation of critical risks to Board
- Evidence: 4 quarterly meeting minutes per year
- Frequency: Quarterly

□ **ICT Risk Assessment Reports (Quarterly)**

- Comprehensive ICT risk assessment
- Changes in risk profile since last review
- New risks identified
- Risk mitigation progress
- Evidence: Quarterly risk assessment report signed by CISO
- Frequency: Quarterly (minimum)

□ **Annual ICT Risk Management Report to Board**

- Summary of ICT risks and mitigations
- Key performance indicators (KPIs) for ICT resilience
- Incidents and near-misses
- Testing results (penetration tests, DR tests)
- Third-party ICT provider risks
- Investment recommendations
- Evidence: Annual report to Board with Board acknowledgment
- Frequency: Annual (minimum)

□ **Business Impact Analysis (BIA) Review**

- Critical business functions identified
- RTOs/RPOs documented for each critical function
- Dependencies mapped (internal, third-party)
- Annual review and update
- Evidence: BIA report v1.x with sign-off
- Frequency: Annual review

□ **Third-Party ICT Risk Assessments** (Article 28)

- Risk assessment for each critical ICT third-party provider
- Contractual arrangements review (Articles 29-30)
- Concentration risk analysis
- Evidence: Third-party risk register + assessments
- Frequency: Annual (minimum), before onboarding new providers

□ **ICT Incident Log** (Article 17)

- All ICT incidents logged (major and non-major)
- Root cause analysis for major incidents
- Lessons learned documentation
- Evidence: Incident register + RCA reports
- Frequency: Ongoing (log all incidents)

□ **Business Continuity and Disaster Recovery Plan**

- Documented BC/DR procedures
- Recovery strategies for critical ICT services
- Crisis management procedures
- Evidence: BC/DR plan v1.x approved by senior management
- Frequency: Annual update, tested semi-annually

□ **DR Test Results** (Article 11(6))

- At least annual full DR test
- Test scenarios, results, and lessons learned
- Remediation of gaps identified
- Evidence: DR test report with sign-off
- Frequency: Annual (full test), quarterly (component tests recommended)

## DORA Supervisory Expectations

National competent authorities (NCAs) will expect:

### Documentation Requirements

✓ ICT Risk Framework formally approved by management body
✓ Framework reviewed and updated annually (at minimum)
✓ Quarterly risk reporting to senior management
✓ Annual comprehensive report to Board
✓ Policies aligned with EBA/ESMA/EIOPA guidelines

### Implementation Requirements

✓ All ICT assets inventoried and classified by criticality
✓ Risk assessments cover all ICT systems (including third-party)
✓ Risk treatment plans for all material ICT risks
✓ Continuous monitoring and detection capabilities
✓ Incident response procedures tested
✓ BC/DR plans tested annually

### Testing and Validation

✓ Annual DR test (full scenario)
✓ Threat-led penetration testing (TLPT) for significant entities
✓ Vulnerability scanning (at least quarterly)
✓ Patch management procedures enforced
✓ Third-party ICT provider audits/assessments

### Reporting to Supervisors

✓ Major ICT incidents reported within 4 hours (initial), 24 hours (intermediate), <1 month (final)
✓ Annual DORA compliance attestation (expected from NCAs)
✓ On-demand reporting for supervisory reviews

## Common DORA Assessment Findings

### Critical (Non-Compliance)

❌ No documented ICT Risk Framework
❌ Framework not approved by management body
❌ No ICT asset inventory or incomplete inventory
❌ No business impact analysis for critical services
❌ No annual DR testing
❌ Major incidents not reported to NCA within timeframes

### Moderate (Gaps requiring remediation)

⚠️ ICT Risk Framework not reviewed annually
⚠️ Quarterly risk reporting to Board incomplete
⚠️ Some ICT assets not classified by criticality
⚠️ Third-party ICT risk assessments incomplete
⚠️ Vulnerability management process gaps
⚠️ Patch SLAs not defined or enforced

### Minor (Best practice recommendations)

⚠️ Risk register not updated quarterly
⚠️ Monitoring dashboards incomplete
⚠️ DR test scenarios limited (need more comprehensive tests)
⚠️ Evidence retention <5 years

## Remediation Guidance

### If No ICT Risk Framework Exists

1. **Immediate (Weeks 1-4)**: Draft ICT Risk Framework
   - Use EBA Guidelines on ICT Risk (EBA/GL/2019/04) as template
   - Adapt to organization size and complexity
   - Include all 7 required components (governance, ID, protect, detect, respond, recover, testing)

2. **Weeks 5-8**: Board Approval Process
   - Present framework to ICT Risk Committee
   - Revise based on feedback
   - Present to Board for approval
   - Document approval in Board minutes

3. **Weeks 9-12**: Implementation Planning
   - Develop detailed policies and procedures
   - Assign roles and responsibilities
   - Implement risk assessment process
   - Launch asset inventory project

**Timeline**: 3-4 months minimum before DORA deadline

### If Asset Inventory Incomplete

1. **Use automated discovery** (AWS Config, Azure Resource Graph, etc.)
2. **Classify assets by criticality** (align with BIA)
3. **Document asset owners** (business + technical owners)
4. **Implement continuous asset tracking** (not one-time snapshot)

**Timeline**: 4-8 weeks depending on estate size

### If DR Testing Not Performed

1. **Schedule annual DR test** (before DORA deadline)
2. **Define test scenarios** (loss of primary data center, ransomware, etc.)
3. **Involve all critical stakeholders**
4. **Document results and lessons learned**
5. **Remediate gaps within 90 days**

**Timeline**: 2-3 months (planning + execution + remediation)

## Cross-References

### Related DORA Articles

- Article 5 - Governance and organization
- Article 8 - Identification (asset inventory, dependencies)
- Article 9 - Protection and prevention (ICT security, change management)
- Article 11 - Business continuity (BC/DR, backup)
- Article 17 - Detection (monitoring, logging)
- Article 28-30 - Third-party ICT risk management

### Maps to Other Frameworks

- **ISO 27001:2022**: Annex A (all controls), clause 6 (risk management)
- **NIST Cybersecurity Framework**: All 5 functions (Identify, Protect, Detect, Respond, Recover)
- **NIST 800-53**: All families (especially RA, CA, CP, IR, SI)
- **SOC 2**: CC3 (Risk assessment), CC7 (System monitoring), CC9 (Risk mitigation)
- **EBA Guidelines**: EBA/GL/2019/04 (ICT Risk), EBA/GL/2019/02 (Outsourcing)

## Cost Estimates

### ICT Risk Framework Implementation (For Medium Bank)

- Framework development and approval: 200 hours (\$20,000)
- Asset inventory and classification: 160 hours (\$16,000)
- Risk assessment process: 120 hours (\$12,000)
- Policy and procedure documentation: 200 hours (\$20,000)
- GRC tool implementation: 160 hours + \$50k software (\$66,000)
- **Total Year 1**: ~\$134k

### Ongoing Compliance (Annual)

- Quarterly risk assessments: 160 hours/year (\$16,000)
- Annual Board reporting: 40 hours (\$4,000)
- DR testing: 80 hours (\$8,000)
- Vulnerability management: 240 hours/year (\$24,000)
- Incident management: 120 hours/year (\$12,000)
- **Total Ongoing**: ~\$64k/year

### Tools/Services

- GRC platform: \$50k-\$150k/year (medium org)
- Vulnerability scanning: \$10k-\$30k/year
- SIEM/monitoring: \$50k-\$200k/year
- Third-party audit (ISO 27001): \$30k-\$80k
- TLPT testing (significant entities): \$100k-\$300k (every 3 years)

## Evidence Package Structure

```
evidence/
└── dora-article-6-ict-risk-framework/
    ├── framework/
    │   ├── ict-risk-framework-v1.2-board-approved.pdf
    │   ├── board-minutes-approval-2024-03-15.pdf
    │   ├── ict-risk-strategy-2024-2027.pdf
    │   ├── ict-risk-policy-v1.1.pdf
    │   └── governance-structure-diagram.pdf
    ├── asset-inventory/
    │   ├── 2024-Q1/
    │   │   ├── aws-assets-20240331.json
    │   │   ├── azure-assets-20240331.json
    │   │   └── asset-register-criticality-20240331.xlsx
    │   ├── 2024-Q2/
    │   ├── 2024-Q3/
    │   └── 2024-Q4/
    ├── risk-assessments/
    │   ├── Q1-2024-ict-risk-assessment.pdf
    │   ├── Q2-2024-ict-risk-assessment.pdf
    │   ├── Q3-2024-ict-risk-assessment.pdf
    │   ├── Q4-2024-ict-risk-assessment.pdf
    │   └── ict-risk-register-master.xlsx
    ├── bia/
    │   ├── business-impact-analysis-2024.pdf
    │   ├── critical-services-rto-rpo.xlsx
    │   └── dependency-mapping.pdf
    ├── monitoring/
    │   ├── 2024-01/
    │   │   ├── vulnerabilities-202401.json
    │   │   ├── security-findings-202401.json
    │   │   └── patch-compliance-202401.json
    │   └── ... (monthly)
    ├── dr-testing/
    │   ├── dr-test-2024-annual.pdf
    │   ├── test-scenarios-2024.docx
    │   └── remediation-plan-2024.xlsx
    ├── board-reporting/
    │   ├── Q1-2024-board-report.pdf
    │   ├── Q2-2024-board-report.pdf
    │   ├── Q3-2024-board-report.pdf
    │   ├── Q4-2024-board-report.pdf
    │   └── annual-ict-risk-report-2024.pdf
    └── README.md (evidence index, 5-year retention)
```

## Automation Script

```python
#!/usr/bin/env python3
"""
DORA Article 6 Evidence Collection Automation
Collects ICT risk management evidence for EU financial entities
"""
import boto3
import json
import os
from datetime import datetime, timedelta

class DORAEvidenceCollector:
    def __init__(self, output_dir="evidence/dora-article-6"):
        self.output_dir = output_dir
        self.timestamp = datetime.now().strftime("%Y%m%d")
        self.quarter = f"{datetime.now().year}-Q{(datetime.now().month-1)//3+1}"
        os.makedirs(f"{output_dir}/asset-inventory/{self.quarter}", exist_ok=True)
        os.makedirs(f"{output_dir}/monitoring/{datetime.now().strftime('%Y-%m')}", exist_ok=True)

    def collect_asset_inventory(self):
        """Collect complete ICT asset inventory (Article 8 requirement)"""
        print("Collecting ICT asset inventory...")

        # AWS - All resources
        resource_groups = boto3.client('resourcegroupstaggingapi')
        paginator = resource_groups.get_paginator('get_resources')

        all_resources = []
        for page in paginator.paginate():
            all_resources.extend(page['ResourceTagMappingList'])

        output_file = f"{self.output_dir}/asset-inventory/{self.quarter}/aws-all-resources-{self.timestamp}.json"
        with open(output_file, 'w') as f:
            json.dump(all_resources, f, indent=2)

        # Classify by criticality (based on tags)
        critical_assets = [r for r in all_resources if any(t.get('Key') == 'Criticality' and t.get('Value') == 'Critical' for t in r.get('Tags', []))]

        print(f"✓ Total assets: {len(all_resources)}")
        print(f"✓ Critical assets: {len(critical_assets)}")

        return {'total': len(all_resources), 'critical': len(critical_assets)}

    def collect_vulnerability_findings(self):
        """Collect vulnerability scan results (Article 9 requirement)"""
        print("Collecting vulnerability findings...")

        inspector = boto3.client('inspector2')
        security_hub = boto3.client('securityhub')

        # Inspector findings (critical/high only)
        inspector_findings = inspector.list_findings(
            filterCriteria={
                'severity': [
                    {'comparison': 'EQUALS', 'value': 'CRITICAL'},
                    {'comparison': 'EQUALS', 'value': 'HIGH'}
                ]
            },
            maxResults=1000
        )

        month = datetime.now().strftime("%Y-%m")
        output_file = f"{self.output_dir}/monitoring/{month}/vulnerabilities-{self.timestamp}.json"
        with open(output_file, 'w') as f:
            json.dump(inspector_findings, f, indent=2, default=str)

        finding_count = len(inspector_findings.get('findings', []))
        print(f"✓ Vulnerability findings (Critical/High): {finding_count}")

        return finding_count

    def collect_backup_evidence(self):
        """Collect backup and recovery evidence (Article 11 requirement)"""
        print("Collecting backup evidence...")

        backup = boto3.client('backup')

        # Backup jobs in last 30 days
        start_date = datetime.now() - timedelta(days=30)
        backup_jobs = backup.list_backup_jobs(
            ByCreatedAfter=start_date
        )

        month = datetime.now().strftime("%Y-%m")
        output_file = f"{self.output_dir}/monitoring/{month}/backup-jobs-{self.timestamp}.json"
        with open(output_file, 'w') as f:
            json.dump(backup_jobs, f, indent=2, default=str)

        # Check backup success rate
        total_jobs = len(backup_jobs.get('BackupJobs', []))
        completed_jobs = len([j for j in backup_jobs.get('BackupJobs', []) if j.get('State') == 'COMPLETED'])

        print(f"✓ Backup jobs (30 days): {total_jobs}")
        print(f"✓ Successful backups: {completed_jobs}/{total_jobs} ({completed_jobs/total_jobs*100:.1f}%)")

        return {'total': total_jobs, 'completed': completed_jobs}

    def generate_quarterly_report(self, asset_data, vuln_count, backup_data):
        """Generate quarterly ICT risk management summary for Board"""
        report = f"""
DORA Article 6 - ICT Risk Management Evidence Summary
Quarter: {self.quarter}
Generated: {datetime.now().strftime("%Y-%m-%d")}

ICT ASSET INVENTORY (Article 8)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total ICT Assets:      {asset_data['total']}
Critical ICT Assets:   {asset_data['critical']} ({asset_data['critical']/asset_data['total']*100:.1f}%)

VULNERABILITY MANAGEMENT (Article 9)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Critical/High Findings: {vuln_count}
{'✓ GOOD' if vuln_count < 10 else '⚠️  REQUIRES ATTENTION' if vuln_count < 50 else '✗ CRITICAL - IMMEDIATE ACTION REQUIRED'}

BACKUP & RECOVERY (Article 11)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Backup Jobs (30 days):  {backup_data['total']}
Success Rate:           {backup_data['completed']/backup_data['total']*100:.1f}%
{'✓ COMPLIANT' if backup_data['completed']/backup_data['total'] >= 0.95 else '✗ BELOW TARGET (95%)'}

REQUIRED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Quarterly ICT Risk Committee meeting (present these findings)
□ Update ICT risk register with new/changed risks
□ Escalate critical vulnerabilities to CISO
□ Complete quarterly access review
□ Prepare summary for Board report

NEXT QUARTERLY EVIDENCE COLLECTION: {(datetime.now() + timedelta(days=90)).strftime('%Y-%m-%d')}

Evidence Location: {self.output_dir}/
Retention: 5 years (DORA Article 10(1))
"""

        report_file = f"{self.output_dir}/quarterly-summary-{self.quarter}.txt"
        with open(report_file, 'w') as f:
            f.write(report)

        print(f"\n{report}")
        print(f"Summary report: {report_file}")

if __name__ == "__main__":
    print("DORA Article 6 - ICT Risk Management Evidence Collection")
    print("=" * 70)
    print(f"Compliance Deadline: January 17, 2025")
    print("=" * 70)

    collector = DORAEvidenceCollector()

    asset_data = collector.collect_asset_inventory()
    vuln_count = collector.collect_vulnerability_findings()
    backup_data = collector.collect_backup_evidence()

    collector.generate_quarterly_report(asset_data, vuln_count, backup_data)

    print("\n✓ DORA evidence collection complete")
    print("⚠️  REMINDER: Ensure Management Body reviews ICT Risk Framework annually")
```

---

**DORA Compliance Deadline**: January 17, 2025
**Supervision**: ECB (credit institutions), ESMA (investment firms), EIOPA (insurance)
**Implementation Priority**: 🔴 CRITICAL (EU regulatory requirement)
**Penalties**: Up to 2% of annual worldwide turnover or €10 million (whichever higher)
**Evidence Retention**: 5 years minimum (Article 10)
