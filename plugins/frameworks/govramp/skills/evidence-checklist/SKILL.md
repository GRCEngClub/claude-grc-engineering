---
name: evidence-checklist
description: "Builds an evidence checklist for one NIST SP 800-53 Rev. 5 control or control family, scoped to a GovRAMP verification status"
---

# GovRAMP Evidence Checklist

Builds an evidence checklist for one NIST SP 800-53 Rev. 5 control or control family, scoped to a GovRAMP verification status. GovRAMP was called StateRAMP until February 2025.

> **Never commit evidence artifacts to source control.** The outputs below include real usernames, credential reports, MFA device states, and privileged-account inventories. `.gitignore` covers `evidence/` by default so `git add -A` will not sweep it up, but durable storage is your responsibility. Use an encrypted, access-controlled evidence locker (encrypted S3 with least-privilege IAM, a GRC platform, or a shared drive with full-disk encryption and MFA-gated access).

## Usage

```bash
/govramp:evidence-checklist <control-or-family> [--status <core|ready|authorized>] [--baseline <low|moderate|high>] [--export <format>]
```

- `<control-or-family>`: a control such as `AC-2` or a family such as `AC`
- `--status`: target verification status. Default: `core`
- `--baseline`: impact level for Ready and Authorized. Default: `moderate`. Core aligns with Moderate.
- `--export`: `markdown` (default), `json`, or `csv`

## Scoping by status

- **Core** covers 60 controls, **Ready** 80, and **Authorized/Provisional** the full Low, Moderate, or High baseline. First check whether the requested control is in the target set, using GovRAMP's current package. If it isn't, say so and list it as preparation for the next status.
- For Core, GovRAMP publishes an evidence collection package with examples and a folder for each of the 60 controls ([govramp.org/core](https://govramp.org/core)). Use its folder layout and naming so the PMO finds what it expects.
- Core evidence is reviewed by the PMO. Ready and Authorized evidence is tested by a GovRAMP 3PAO, which samples records, so keep complete populations as well as the samples.
- Contract clauses from the buying government (data location, personnel screening, notification timing) are not GovRAMP controls. List them separately and cite the clause. See `/govramp:state-specific`.

## Example: AC-2 Account Management

AC-2 requires managing system accounts through their lifecycle: defining types, approving, creating, modifying, reviewing, disabling, and removing them.

### Documentation

- [ ] **SSP AC-2 implementation statement**: account types (user, privileged, service, temporary, emergency), how each is requested, approved, created, changed, reviewed, and removed, and who is responsible (provider, customer, or shared)
- [ ] **Account management policy and procedure**: approval, least privilege, review cadence, inactivity disabling, emergency accounts. It needs a named owner, a version, and a review date within the last year.
- [ ] **Organization-defined parameters**: the values you chose for AC-2 parameters, such as the review frequency and the inactivity period. These must match the GovRAMP template's required values where it sets them.

### Automated collection

**Account Inventory**
```bash
# AWS IAM users (cloud service provider perspective)
aws iam list-users --output json > evidence/govramp-ac2-iam-users-$(date +%Y%m%d).json

# IAM credential report
aws iam generate-credential-report
aws iam get-credential-report --output text | base64 -d \
  > evidence/govramp-ac2-credential-report-$(date +%Y%m%d).csv

# Filter for state government users (by tags or OU)
aws organizations list-accounts-for-parent --parent-id <STATE-OU-ID> \
  --output json > evidence/govramp-ac2-state-accounts-$(date +%Y%m%d).json

# Microsoft Entra ID users (if using Azure)
az ad user list --output json > evidence/govramp-ac2-azure-users-$(date +%Y%m%d).json

# GCP users (if using GCP)
gcloud identity groups memberships list --group-email=state-users@agency.gov \
  --format=json > evidence/govramp-ac2-gcp-users-$(date +%Y%m%d).json
```

Collection Frequency: Monthly (feeds ConMon reporting)
Retention: Per the contract and the state records schedule
Purpose: Account inventory per AC-2(1)

**Account Creation/Modification/Deletion Logs**

```bash
# AWS CloudTrail - Account lifecycle events (last 30 days)
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=CreateUser \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --max-items 1000 \
  --output json > evidence/govramp-ac2-user-creation-$(date +%Y%m).json

aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteUser \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --max-items 1000 \
  --output json > evidence/govramp-ac2-user-deletion-$(date +%Y%m).json

for event in AttachUserPolicy DetachUserPolicy PutUserPolicy DeleteUserPolicy; do
  aws cloudtrail lookup-events \
    --lookup-attributes AttributeKey=EventName,AttributeValue=$event \
    --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
    --max-items 1000 \
    --output json >> evidence/govramp-ac2-policy-changes-$(date +%Y%m).json
done

# Azure activity log (role and authorization changes)
az monitor activity-log list \
  --caller 'Microsoft.Authorization' \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --output json > evidence/govramp-ac2-azure-audit-$(date +%Y%m).json
```

Collection Frequency: Monthly
Retention: Per the contract and the state records schedule
Purpose: Account lifecycle audit trail per AC-2(4)

**Privileged Account Inventory**

```bash
# AWS - Users with AdministratorAccess
for user in $(aws iam list-users --query 'Users[].UserName' --output text); do
  policies=$(aws iam list-attached-user-policies --user-name "$user" --query 'AttachedPolicies[?PolicyName==`AdministratorAccess`]')
  if [ "$policies" != "[]" ]; then
    echo "$user,AdministratorAccess,$(date +%Y-%m-%d)" >> evidence/govramp-ac2-privileged-users-$(date +%Y%m%d).csv
  fi
done

# IAM roles with admin privileges
aws iam list-roles | jq -r '.Roles[].RoleName' | while read role; do
  policies=$(aws iam list-attached-role-policies --role-name "$role" --query 'AttachedPolicies[?PolicyName==`AdministratorAccess`]')
  if [ "$policies" != "[]" ]; then
    echo "$role,AdministratorAccess,$(date +%Y-%m-%d)" >> evidence/govramp-ac2-privileged-roles-$(date +%Y%m%d).csv
  fi
done
```

Collection Frequency: Weekly
Retention: Per the contract and the state records schedule
Purpose: Privileged account monitoring per AC-2(7)

**Automated Account Disabling Evidence**

```bash
# Check for inactive accounts (no access in 90 days)
aws iam get-credential-report --output text | base64 -d | \
  awk -F',' '\$4 == "true" {
    split(\$5,a,"T");
    if ((systime() - mktime(gensub(/[-:]/," ","g",a[1]" "substr(a[2],1,8)))) > 90*86400)
      print \$1","\$5",INACTIVE_90_DAYS"
  }' > evidence/govramp-ac2-inactive-accounts-$(date +%Y%m%d).csv

# Check for unused IAM access keys (>90 days)
aws iam get-credential-report --output text | base64 -d | \
  awk -F',' '\$10 == "true" && \$12 == "N/A" {print \$1",access_key_1,NEVER_USED"}' \
  >> evidence/govramp-ac2-unused-keys-$(date +%Y%m%d).csv
```

Collection Frequency: Weekly
Retention: Per the contract and the state records schedule
Purpose: Inactive account detection per AC-2(3)

**Data Residency Evidence**

```bash
# AWS - List US regions for comparison
aws ec2 describe-regions --all-regions --output json | \
  jq '.Regions[] | select(.RegionName | startswith("us-"))' \
  > evidence/govramp-ac2-us-regions-$(date +%Y%m%d).json

# S3 buckets location verification
aws s3api list-buckets --output json | jq -r '.Buckets[].Name' | while read bucket; do
  location=$(aws s3api get-bucket-location --bucket "$bucket" --output text)
  echo "$bucket,$location" >> evidence/govramp-ac2-s3-locations-$(date +%Y%m%d).csv
done

# Non-US buckets, to review against any data location clause
cat evidence/govramp-ac2-s3-locations-$(date +%Y%m%d).csv | \
  grep -v "us-" | grep -v "None" > evidence/govramp-ac2-non-us-buckets-$(date +%Y%m%d).csv

# RDS instances location verification
aws rds describe-db-instances \
  --query 'DBInstances[].[DBInstanceIdentifier,AvailabilityZone]' \
  --output json > evidence/govramp-ac2-rds-locations-$(date +%Y%m%d).json
```

Collection Frequency: Monthly
Retention: Per the contract and the state records schedule
Purpose: Supports a data location clause in the solicitation or contract, where one applies

### Records the reviewer will sample

- [ ] **Account approvals**: request, approver, and grant date for accounts created in the period. Include customer-side approval where the SSP says customers approve their own users.
- [ ] **Terminations**: HR termination dates matched against account disable dates, showing removal within the period your SSP states.
- [ ] **Access reviews**: each review in the period, with the population reviewed, reviewer sign-off, what was found, and the remediation tickets.
- [ ] **Emergency and break-glass use**: every use, with the justification, what was done, and the after-action review.
- [ ] **Inactive accounts**: the inactivity report and evidence that flagged accounts were disabled.

### Continuous monitoring

- Core: quarterly ConMon to the PMO. Ready and Authorized: monthly.
- Keep open AC-2 issues on the POA&M with owners and dates. Take remediation deadlines from GovRAMP's [Continuous Monitoring Guide and Escalation Process](https://govramp.org/hubfs/Continuous%20Monitoring%20Guide%20and%20Escalation%20Process.pdf).

### Common findings

- SSP describes a process the records don't show, such as quarterly reviews with only two on file.
- Terminated users still active, or service accounts with no owner.
- Shared admin accounts with no individual attribution.
- Parameter values in the SSP that don't match the policy or the template.

### Related controls

AC-1, AC-3, AC-6, IA-2, IA-4, IA-5, AU-2, PS-4, PS-5

### Maps to other frameworks

- **NIST SP 800-53 Rev. 5**: AC-2 (GovRAMP baselines are built on Rev. 5)
- **FedRAMP**: see the `fedramp-20x` plugin; FedRAMP 20x measures this through Key Security Indicators rather than an SSP control narrative
- **ISO/IEC 27001:2022**: A.5.15, A.5.16, A.5.18
- **SOC 2**: CC6.1, CC6.2, CC6.3

## Evidence folder layout

```text
evidence/
└── govramp-ac2-account-management/
    ├── documentation/    # SSP excerpt, policy, procedure, parameter table
    ├── automated/        # outputs from the commands above, dated
    ├── samples/          # approvals, terminations, access reviews, break-glass log
    └── conmon/           # POA&M entries and ConMon submissions for AC-2
```

Use the GovRAMP Core package's folder names instead when the target is Core.
