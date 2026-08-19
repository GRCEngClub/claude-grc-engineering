# NIST 800-53 Evidence Checklist

Generates audit-ready evidence collection checklists for NIST SP 800-53 Rev 5 controls and control families, scoped to a NIST SP 800-53B baseline (Low / Moderate / High). Evidence depth tracks the baseline: higher baselines pull in additional control enhancements and tighter organization-defined parameters, so the checklist grows accordingly.

NIST 800-53 is a control *catalog*, not a regulation. Enforcement comes from the authorizing program that profiles it — FISMA for federal systems, the FedRAMP PMO for cloud services, StateRAMP for state/local, CMMC/NIST 800-171 for the defense industrial base. This command produces the evidence an assessor asks for under any of those programs, organized by the framework's own control families and aligned to the NIST SP 800-53A assessment methods (examine / interview / test).

> **Never commit evidence artifacts to source control.** The outputs below include real usernames, credential reports, MFA device states, and privileged-account inventories. `.gitignore` covers `evidence/` by default so `git add -A` will not sweep it up, but durable storage is your responsibility. Use an encrypted, access-controlled evidence locker (encrypted S3 with least-privilege IAM, a GRC platform, or a shared drive with full-disk encryption and MFA-gated access).

## Usage

```bash
/nist:evidence-checklist <control-id|family> [--baseline <low|moderate|high>] [--export <markdown|json|csv>]
```

## Arguments

- `<control-id|family>`: A single control (e.g., `AC-2`, `AU-3`, `SC-13`) or a whole control family (e.g., `AC`, `AU`, `SC`). A family expands to every control in that family that is **in scope for the selected baseline**.
- `--baseline`: NIST SP 800-53B baseline — `low`, `moderate`, or `high`. Default: `moderate`. Drives which control enhancements and organization-defined parameters appear, and therefore how much evidence the checklist asks for.
- `--export`: Output format — `markdown`, `json`, or `csv`. Default: `markdown`. JSON and CSV emit one row per evidence item for ingestion into a GRC platform or evidence tracker.

## How baseline scoping works

The base control is the floor; **control enhancements** layer on top as the impact level rises. The checklist only asks for evidence that the selected baseline actually requires, so a Low-baseline system is not chased for High-baseline artifacts it never had to implement.

- **`low`** — base control only. Policy, procedures, and a periodic manual review; no enhancement evidence.
- **`moderate`** — base control plus Moderate enhancements. Adds automation logs, automated audit actions, and tightened ODPs (for example, disabling inactive accounts after a defined period).
- **`high`** — base control plus Moderate and High enhancements. Adds continuous or behavioral monitoring, cross-source correlation, and physical/logical correlation evidence.

Organization-defined parameters (ODPs) also tighten with the baseline. Where a FedRAMP profile sets a well-known value (for example, disabling inactive accounts after 90 days), the checklist surfaces it as a parameter to confirm against your SSP rather than asserting a single universal number — always reconcile ODPs to your own authorization boundary.

Baseline allocations follow NIST SP 800-53B. Control intent is paraphrased and referenced by control ID; consult the official NIST catalog for normative text.

## Example 1 — AC-2 Account Management (Moderate baseline)

```bash
/nist:evidence-checklist AC-2 --baseline moderate
```

**Output:**

````markdown
NIST 800-53 Evidence Checklist
Control: AC-2 — Account Management
Family: AC (Access Control)
Baseline: Moderate (per NIST SP 800-53B)
Enhancements in scope (Moderate): AC-2(1), AC-2(2), AC-2(3), AC-2(4), AC-2(5), AC-2(13)
Assessment methods (per SP 800-53A): Examine, Interview, Test

## Control Intent (paraphrased)

Establish, document, and manage system accounts across their full lifecycle:
define account types and assign account managers, require approval before
creation, provision and de-provision per documented conditions, and review
accounts at an organization-defined frequency. At Moderate, much of this is
expected to be automated and audited.

## Evidence Requirements

### Required Documentation

□ **SSP — AC-2 implementation statement**
  - Implementation narrative for AC-2 and each Moderate enhancement in scope
  - Account types defined (user, privileged, service, temporary, emergency)
  - Account manager roles and approval authority
  - Evidence: SSP AC-2 section (and enhancement sub-sections)
  - Frequency: Annual review, or when implementation changes

□ **Account Management Policy and Procedures (ties to AC-1)**
  - Approval workflow, conditions for role/group membership, review cadence
  - Least-privilege and separation-of-duties references (AC-5 / AC-6)
  - Evidence: Signed policy + procedure, reviewed at the org-defined frequency
  - Frequency: At least annually

□ **Access authorization records**
  - Account request → approval → provisioning records (AC-2a–c)
  - Evidence: Sample of approved account requests from the assessment period
  - Frequency: Ongoing; sampled at assessment

### Automated Evidence Collection

✓ **Account inventory and credential state** — AC-2(1) automated management

```bash
# IAM principals (users, roles, groups)
aws iam list-users  --output json > evidence/nist-ac2-iam-users-$(date +%Y%m%d).json
aws iam list-roles  --output json > evidence/nist-ac2-iam-roles-$(date +%Y%m%d).json
aws iam list-groups --output json > evidence/nist-ac2-iam-groups-$(date +%Y%m%d).json

# Credential report: password age, MFA, access-key age/last-use.
# generate-credential-report is asynchronous — it returns STARTED/INPROGRESS and
# builds in the background, so poll for COMPLETE before fetching. Reading too
# early errors out and leaves you with no artifact.
#
# Bound the loop and check the AWS call's own exit status. Piping straight into
# grep hides a failure: a denied iam:GenerateCredentialReport makes grep return
# non-zero every pass, so an unbounded `until` turns a permissions error into a
# silent hang instead of an error you can act on.
state=""
for _ in $(seq 1 12); do
  if ! state=$(aws iam generate-credential-report --query State --output text); then
    echo "ERROR: generate-credential-report failed — check iam:GenerateCredentialReport." >&2
    exit 1
  fi
  [ "$state" = "COMPLETE" ] && break
  sleep 5
done
if [ "$state" != "COMPLETE" ]; then
  echo "ERROR: credential report still '$state' after 60s — rerun once it finishes." >&2
  exit 1
fi
aws iam get-credential-report --query Content --output text | base64 -d \
  > evidence/nist-ac2-credential-report-$(date +%Y%m%d).csv
```

✓ **Account lifecycle audit trail** — AC-2(4) automated audit actions

```bash
# Account create/modify/delete events from CloudTrail (last 30 days)
for ev in CreateUser DeleteUser AttachUserPolicy DetachUserPolicy; do
  aws cloudtrail lookup-events \
    --lookup-attributes AttributeKey=EventName,AttributeValue="$ev" \
    --start-time "$(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S)" \
    --output json > "evidence/nist-ac2-lifecycle-$ev-$(date +%Y%m%d).json"
done
```

✓ **Privileged account inventory** — base AC-2 (privileged is an identified account type warranting extra scrutiny); the dedicated privileged-account review control at Moderate+ is AC-6(5)

```bash
# Principals carrying AdministratorAccess (adjust for your privileged policy set)
for u in $(aws iam list-users --query 'Users[].UserName' --output text); do
  aws iam list-attached-user-policies --user-name "$u" \
    --query 'AttachedPolicies[?PolicyName==`AdministratorAccess`].PolicyName' \
    --output text | grep -q AdministratorAccess && \
    echo "$u,AdministratorAccess" >> evidence/nist-ac2-privileged-$(date +%Y%m%d).csv
done
```

✓ **Inactive account detection** — AC-2(3) disable accounts (confirm the inactivity ODP, e.g., 90 days)

```bash
# Password-enabled accounts unused beyond the org-defined inactivity window
aws iam get-credential-report --query Content --output text | base64 -d \
  > evidence/nist-ac2-inactive-review-$(date +%Y%m%d).csv
# Review password_last_used against your ODP; flag and disable stale accounts.
# This file carries usernames, MFA state, and key ages — treat it as evidence,
# not scratch: keep it in the encrypted locker, never in /tmp or a shared path.
```

Collection frequency: monthly inventory, weekly for privileged and inactive checks.
Retention: per the authorizing program (commonly multi-year for federal systems).
Purpose: demonstrate automated, audited account management at Moderate.

### Manual Evidence Collection

□ **Periodic account review records (AC-2 review requirement)**
  - Account list reviewed at the org-defined frequency, with manager certification
  - Inappropriate access identified and remediated within the defined window
  - Approving official sign-off
  - Evidence: Completed account review packages for the period
  - Frequency: Org-defined (commonly quarterly for Moderate)

□ **Temporary / emergency account handling — AC-2(2)**
  - Evidence that temporary and emergency accounts auto-expire or are removed
  - Evidence: Account TTL configuration + a sample of expired temp/emergency accounts

□ **Shared / group account credential management — base AC-2**
  - Process to change shared/group authenticators when a member leaves the group (a base AC-2 requirement), plus justification and approval for any shared accounts
  - Evidence: The credential-change procedure and shared-account approval records

□ **Disable accounts of high-risk individuals — AC-2(13)**
  - Coordinate with incident-response / insider-threat processes to disable a flagged individual's accounts within the org-defined window (this enhancement enters at Moderate, not High)
  - Evidence: Disablement records tied to a documented risk determination

## Baseline Depth — AC-2 across Low / Moderate / High

- **Low** — Base AC-2 only. Inventory, policy/procedures, account approvals, and a manual periodic review. No enhancement evidence required.
- **Moderate** — Adds AC-2(1)(2)(3)(4)(5)(13): automated account management, automated temporary/emergency account handling, automated disabling of inactive accounts, automated audit actions, inactivity logout, and disabling accounts of high-risk individuals.
- **High** — Adds AC-2(11)(12): enforced usage conditions and account monitoring for atypical usage (behavioral analytics / alerting). AC-2(13) already enters at Moderate.

## Assessment Methods (per SP 800-53A)

- **Examine** — account management policy/procedures, the SSP AC-2 section, account lists, and completed review records.
- **Interview** — account managers, system/network administrators, and the ISSO.
- **Test** — the automated mechanisms for provisioning, disabling, and audit-action generation (for example, trigger a deprovision and confirm the audit event and access removal).
````

## Example 2 — AU-6 Audit Record Review, Analysis, and Reporting (High baseline)

```bash
/nist:evidence-checklist AU-6 --baseline high
```

**Output:**

````markdown
NIST 800-53 Evidence Checklist
Control: AU-6 — Audit Record Review, Analysis, and Reporting
Family: AU (Audit and Accountability)
Baseline: High (per NIST SP 800-53B)
Enhancements in scope (High): AU-6(1), AU-6(3), AU-6(5), AU-6(6)
Assessment methods (per SP 800-53A): Examine, Interview, Test

## Control Intent (paraphrased)

Review and analyze system audit records at an organization-defined frequency
for indications of inappropriate or unusual activity, report findings to
defined roles, and adjust the level of review based on risk and threat
information. At High, review is automated, correlated across repositories, and
integrated with non-audit data sources including physical access monitoring.

## Evidence Requirements

### Required Documentation

□ **SSP — AU-6 implementation statement**
  - Narrative for AU-6 and each High enhancement in scope
  - Defined review frequency, responsible roles, and escalation paths
  - Working definition of "inappropriate or unusual activity"
  - Evidence: SSP AU-6 section (and enhancement sub-sections)
  - Frequency: Annual review, or when implementation changes

□ **Audit review, analysis, and reporting procedures (ties to AU-1)**
  - Who reviews, how often, what triggers escalation, and to whom findings go
  - Evidence: Signed procedure document
  - Frequency: At least annually

### Automated Evidence Collection

✓ **Automated review integration** — AU-6(1) integrate with a SIEM/analysis capability

```bash
# Proof that audit records flow into a centralized analysis pipeline
aws logs describe-subscription-filters \
  --log-group-name "<your-audit-log-group>" \
  --output json > evidence/nist-au6-siem-subscriptions-$(date +%Y%m%d).json
```

✓ **Cross-repository correlation** — AU-6(3) correlate audit record repositories

```bash
# Evidence that multiple audit sources are aggregated for correlation
aws securityhub get-enabled-standards \
  --output json > evidence/nist-au6-securityhub-standards-$(date +%Y%m%d).json
aws guardduty list-detectors \
  --output json > evidence/nist-au6-guardduty-detectors-$(date +%Y%m%d).json
```

✓ **Integrated analysis across data sources** — AU-6(5) combine audit with scan/performance data

```bash
# Aggregated findings that fuse audit data with vulnerability and config signals.
# No --max-items here on purpose: the CLI auto-paginates, and a capped artifact
# would silently stop mid-population while still looking complete to a reader.
aws securityhub get-findings \
  --filters '{"RecordState":[{"Value":"ACTIVE","Comparison":"EQUALS"}]}' \
  --output json > evidence/nist-au6-integrated-findings-$(date +%Y%m%d).json
```

If the finding volume makes a full pull impractical, narrow the population with
an explicit, defensible filter (an assessment-period date range, a severity
floor, a specific product ARN) and record that filter alongside the artifact. A
scope you can state and justify is evidence; an arbitrary row cap is a truncated
population an assessor will treat as incomplete.

Collection frequency: continuous ingestion; review at the org-defined cadence.
Retention: per the authorizing program's audit-retention parameter (see AU-11).
Purpose: demonstrate automated, correlated, integrated review at High.

### Manual Evidence Collection

□ **Audit review records and findings reports**
  - Dated review sign-offs at the org-defined frequency
  - Findings escalated to the ISSO / authorizing official with disposition
  - Evidence: Review minutes + findings reports for the period

□ **Physical/logical correlation — AU-6(6)**
  - Evidence that logical audit findings are correlated with physical access
    monitoring (PACS / badge logs) during investigations
  - Evidence: A worked example correlating a system event with physical entry data

□ **Review-level adjustment**
  - Evidence that review scope/frequency was adjusted in response to threat
    intelligence or law-enforcement information
  - Evidence: Tuning records tied to a threat trigger

## Baseline Depth — AU-6 across Low / Moderate / High

- **Low** — Base AU-6. Manual or periodic review of audit records, documented findings, and reporting to defined roles. No enhancement evidence required.
- **Moderate** — Adds AU-6(1) automated review integration (SIEM/monitoring tooling) and AU-6(3) correlation across audit repositories for situational awareness.
- **High** — Adds AU-6(5) integrated analysis that fuses audit records with vulnerability/performance/other data, and AU-6(6) correlation with physical access monitoring.

## Assessment Methods (per SP 800-53A)

- **Examine** — audit review/analysis/reporting policy, the SSP AU-6 section, review records, and findings reports.
- **Interview** — audit reviewers, SOC analysts, and the ISSO.
- **Test** — the automated review, correlation, and analysis mechanisms (for example, inject a benign anomalous event and confirm it surfaces, correlates, and alerts).
````

## Family-level usage

Passing a family instead of a single control expands the checklist to every control in that family that is in scope for the selected baseline:

```bash
/nist:evidence-checklist AU --baseline high
```

This produces a checklist covering AU-2, AU-3, AU-6, AU-11, AU-12, and the other AU controls allocated to High, each with its own documentation / automated / manual evidence breakdown. Use a single control ID when you want depth; use a family when you want coverage.

## Export formats

The default `markdown` output is the human-readable checklist above. `json` and `csv` flatten the same content to one row per evidence item for ingestion into a GRC platform or evidence tracker.

```json
[
  {
    "control_id": "AC-2",
    "enhancement": "AC-2(3)",
    "family": "AC",
    "baseline": "moderate",
    "evidence_type": "automated",
    "artifact": "Inactive-account report from IAM credential report",
    "method": "test",
    "frequency": "weekly",
    "odp_note": "Confirm inactivity window against SSP (FedRAMP commonly 90 days)"
  }
]
```

CSV emits the same fields as a header row plus one line per item:

```text
control_id,enhancement,family,baseline,evidence_type,artifact,method,frequency,odp_note
AC-2,AC-2(3),AC,moderate,automated,Inactive-account report from IAM credential report,test,weekly,Confirm inactivity window against SSP
```

## Cross-References

### Related controls

- **AC-2** ties to AC-1 (policy), AC-3 (enforcement), AC-5 (separation of duties), AC-6 (least privilege), AU-2 (auditable events), and IA-2 / IA-4 / IA-5 (identification and authenticator management).
- **AU-6** ties to AU-2 (event selection), AU-3 (record content), AU-7 (reduction/reporting), AU-11 (retention), AU-12 (generation), IR-4 / IR-5 (incident handling and monitoring), and SI-4 (system monitoring).

### Maps to other frameworks

These are representative crosswalks; confirm exact mappings with `/grc-engineer:map-controls-unified` (the SCF crosswalk is the canonical source).

**AC-2 (Account Management):**

- **FedRAMP**: AC-2 (same control, profiled)
- **SOC 2**: CC6.1, CC6.2, CC6.3
- **ISO 27001:2022**: A.5.15, A.5.16, A.5.18
- **CMMC L2 / NIST 800-171**: 3.1.1, 3.1.2

**AU-6 (Audit Record Review, Analysis, and Reporting):**

- **FedRAMP**: AU-6 (same control, profiled)
- **SOC 2**: CC7.2, CC7.3
- **ISO 27001:2022**: A.8.15, A.8.16
- **CMMC L2 / NIST 800-171**: 3.3.3, 3.3.5

## Evidence Package Structure

```text
evidence/
└── nist-800-53/
    ├── ac-2-account-management/
    │   ├── ssp/ssp-ac2-vX.docx
    │   ├── policy/account-management-policy-signed.pdf
    │   ├── automated/
    │   │   ├── 2026-01/iam-users-20260131.json
    │   │   ├── 2026-01/credential-report-20260131.csv
    │   │   ├── 2026-01/lifecycle-202601.json
    │   │   └── 2026-01/privileged-20260131.csv
    │   └── reviews/Q1-2026-account-review-signed.pdf
    ├── au-6-audit-review/
    │   ├── ssp/ssp-au6-vX.docx
    │   ├── procedures/audit-review-procedure.pdf
    │   ├── automated/
    │   │   ├── siem-subscriptions-20260131.json
    │   │   └── integrated-findings-20260131.json
    │   └── reviews/2026-01-audit-review-minutes.pdf
    └── README.md  (evidence index + retention schedule)
```

## Automation Script

A baseline-aware AC-2 collector. The `baseline` argument gates which checks run, so a Low-baseline run does not produce enhancement evidence it does not need.

```python
#!/usr/bin/env python3
"""NIST 800-53 AC-2 Account Management evidence collection (baseline-aware)."""
import argparse
import csv
import io
import json
import os
import time
from datetime import datetime, timezone

import boto3

# Which AC-2 enhancements each baseline pulls in (per NIST SP 800-53B).
BASELINE_ENHANCEMENTS = {
    "low": [],
    "moderate": ["AC-2(1)", "AC-2(2)", "AC-2(3)", "AC-2(4)", "AC-2(5)", "AC-2(13)"],
    "high": ["AC-2(1)", "AC-2(2)", "AC-2(3)", "AC-2(4)", "AC-2(5)",
             "AC-2(11)", "AC-2(12)", "AC-2(13)"],
}

# Managed policies treated as admin-equivalent. Extend with your own
# customer-managed admin policy names — this list is a starting point, not a
# complete definition of "privileged" for your environment.
ADMIN_POLICIES = {"AdministratorAccess", "PowerUserAccess", "IAMFullAccess"}


class AC2Evidence:
    """Collects AC-2 account-management evidence scoped to a baseline."""

    def __init__(self, baseline, inactivity_days, out_dir="evidence/nist-800-53/ac-2-account-management"):
        self.baseline = baseline
        self.enhancements = BASELINE_ENHANCEMENTS[baseline]
        self.inactivity_days = inactivity_days
        self.stamp = datetime.now(timezone.utc).strftime("%Y%m%d")
        self.out_dir = os.path.join(out_dir, "automated", datetime.now(timezone.utc).strftime("%Y-%m"))
        # 0700/0600: this directory fills with usernames, MFA state, and key ages.
        # makedirs' mode only applies when it creates the directory, so chmod the
        # existing case too — a rerun into an already-loose directory is the
        # common path, not the rare one.
        os.makedirs(self.out_dir, mode=0o700, exist_ok=True)
        os.chmod(self.out_dir, 0o700)
        self.iam = boto3.client("iam")

    def _write(self, name, payload):
        path = os.path.join(self.out_dir, f"{name}-{self.stamp}.json")
        with self._open_private(path) as fh:
            json.dump(payload, fh, indent=2, default=str)
        return path

    def _open_private(self, path):
        """Open a file for writing that is 0600 from the moment it exists.

        The builtin open() has no mode parameter, so it creates at the umask
        default and needs a follow-up chmod. That chmod does not run if the
        write raises — leaving a half-written credential report readable by
        every account on the host until somebody notices. os.open maps onto the
        open(2) syscall, which does take a mode, so the file is never wrong even
        mid-write. It returns a file descriptor rather than a file object, and
        os.fdopen wraps that descriptor back into one.
        """
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        return os.fdopen(fd, "w", encoding="utf-8")

    def _write_csv(self, name, content):
        """Persist a raw CSV artifact (the credential report) beside the JSON.

        The parsed rows are derived evidence; the report AWS handed back is the
        primary artifact an assessor asks for. Writing only the derived file
        leaves the evidence package missing the source it was built from.
        """
        path = os.path.join(self.out_dir, f"{name}-{self.stamp}.csv")
        with self._open_private(path) as fh:
            fh.write(content)
        return path

    def _paginate(self, operation, key, **kwargs):
        """Collect every page of a paginated IAM call into one list.

        The bare list_* calls cap at 100 items and set IsTruncated. A short list
        is not a cosmetic bug here: these lists are the AC-2 account population
        an assessor tests for completeness, so silently dropping user 101 makes
        the evidence wrong rather than merely partial.
        """
        items = []
        for page in self.iam.get_paginator(operation).paginate(**kwargs):
            items.extend(page[key])
        return items

    def _credential_report(self):
        """Return the IAM credential report as parsed CSV rows.

        botocore already base64-decodes the blob, so Content is raw CSV bytes
        (the AWS CLI path differs — there you must pipe through `base64 -d`).

        generate_credential_report is asynchronous: it returns State STARTED or
        INPROGRESS and builds the report in the background. Fetching immediately
        raises CredentialReportNotReady, which would abort the run after the
        inventory was already written — leaving a half-filled evidence directory
        that looks like a finished collection. So poll until COMPLETE.
        """
        state = self.iam.generate_credential_report()["State"]
        waited = 0
        while state != "COMPLETE" and waited < 60:
            time.sleep(5)
            waited += 5
            state = self.iam.generate_credential_report()["State"]
        if state != "COMPLETE":
            raise RuntimeError(
                f"IAM credential report still {state} after {waited}s — rerun once it finishes."
            )
        content = self.iam.get_credential_report()["Content"].decode("utf-8")
        self._write_csv("credential-report", content)
        return list(csv.DictReader(io.StringIO(content)))

    def account_inventory(self):
        """Base AC-2: enumerate principals. Always runs."""
        users = self._paginate("list_users", "Users")
        self._write("iam-users", users)
        print(f"[base] account inventory: {len(users)} users")
        return users

    def inactive_accounts(self, rows):
        """AC-2(3): flag accounts idle beyond the inactivity ODP. Moderate+ only.

        Two sentinels in the credential report mean opposite things to a naive
        filter. "no_information" on password_last_used means the password has
        never been used; "N/A" means the credential does not exist. Skipping
        "no_information" drops every never-signed-in account — the most stale
        population in the report — out of the AC-2(3) artifact.

        Console activity alone is also the wrong population. A user with no
        password but a two-year-old access key is an inactive account. So take
        the most recent activity across the password and both access keys, and
        treat an account with no activity at all as inactive rather than exempt.
        """
        if "AC-2(3)" not in self.enhancements:
            print("[skip] AC-2(3) not in scope for baseline 'low'")
            return []

        # "not_supported" shows up on root and on credential types an account
        # cannot use; like "N/A" it means no timestamp exists, not recent use.
        no_timestamp = ("N/A", "no_information", "not_supported", "")
        activity_fields = [
            "password_last_used",
            "access_key_1_last_used_date",
            "access_key_2_last_used_date",
        ]

        stale = []
        for row in rows:
            # Root has no lifecycle to review under AC-2(3), and an unused root
            # is the desired state — flagging it would invert the finding.
            if row.get("user") == "<root_account>":
                continue

            timestamps = []
            for field in activity_fields:
                value = row.get(field, "N/A")
                if value not in no_timestamp:
                    timestamps.append(datetime.fromisoformat(value.replace("Z", "+00:00")))

            if timestamps:
                last_active = max(timestamps)
                idle_days = (datetime.now(timezone.utc) - last_active).days
                last_seen = last_active.isoformat()
            else:
                # No usable timestamp on any credential: the account has never
                # been used. Age it from creation rather than flagging outright —
                # a user provisioned yesterday has not yet had time to be
                # inactive, and reporting it as over a 90-day threshold is a
                # false positive an assessor will use to discount the artifact.
                created = row.get("user_creation_time", "")
                if not created:
                    continue
                created_at = datetime.fromisoformat(created.replace("Z", "+00:00"))
                idle_days = (datetime.now(timezone.utc) - created_at).days
                last_seen = "never used"

            if idle_days > self.inactivity_days:
                stale.append({
                    "user": row["user"],
                    "last_activity": last_seen,
                    "idle_days": idle_days,
                    "user_creation_time": row.get("user_creation_time", ""),
                })
        self._write("inactive-accounts", stale)
        flag = "OK" if not stale else f"{len(stale)} OVER {self.inactivity_days}d — disable per AC-2(3)"
        print(f"[AC-2(3)] inactive accounts: {flag}")
        return stale

    def privileged_inventory(self, users):
        """Privileged-principal inventory across IAM users. Runs at every baseline.

        Base AC-2 requires privileged accounts to be identified as an account
        type, so this inventory is base evidence rather than an enhancement — it
        runs at Low too. Only the dedicated privileged-account *review* control,
        AC-6(5), is Moderate+, and that changes the label on the artifact, not
        whether it gets collected.

        Admin reaches a user three ways: a directly attached managed policy, a
        managed policy inherited from a group, or an inline policy. Checking only
        the first misses group-based admin — the pattern AWS actually recommends —
        and reports real administrators as unprivileged. An understated privileged
        population is the finding an assessor writes up, so check all three.

        Scope is IAM users. Privileged roles and group inline policies are a
        separate population — collect them before claiming full AC-2 coverage.
        """
        privileged = []
        for user in users:
            name = user["UserName"]
            matched = []

            for policy in self._paginate("list_attached_user_policies",
                                         "AttachedPolicies", UserName=name):
                if policy["PolicyName"] in ADMIN_POLICIES:
                    matched.append(policy["PolicyName"])

            for group in self._paginate("list_groups_for_user", "Groups", UserName=name):
                group_name = group["GroupName"]
                for policy in self._paginate("list_attached_group_policies",
                                             "AttachedPolicies", GroupName=group_name):
                    if policy["PolicyName"] in ADMIN_POLICIES:
                        matched.append(f"{policy['PolicyName']} (via group {group_name})")

            # Inline policy names are arbitrary, so they cannot be matched against
            # ADMIN_POLICIES. Surface them for manual review rather than guessing.
            inline = self._paginate("list_user_policies", "PolicyNames", UserName=name)

            if matched or inline:
                privileged.append({
                    "user": name,
                    "admin_policies": sorted(set(matched)),
                    "inline_policies_for_manual_review": inline,
                })
        self._write("privileged", privileged)
        label = "base AC-2" if self.baseline == "low" else "AC-6(5)"
        print(f"[{label}] privileged principals: {len(privileged)} "
              f"(inline-policy holders included, flagged for manual review)")
        return privileged

    def run(self):
        print(f"AC-2 evidence collection — baseline={self.baseline}, "
              f"enhancements in scope: {self.enhancements or 'none (base control only)'}")
        users = self.account_inventory()
        # The credential report exists here to serve AC-2(3). Gate the call, not
        # just the consumer: at Low it is an API call the baseline puts out of
        # scope, and it would write a sensitive artifact the checklist then
        # declares irrelevant.
        if "AC-2(3)" in self.enhancements:
            self.inactive_accounts(self._credential_report())
        else:
            print("[skip] credential report not collected — AC-2(3) out of scope at 'low'")
        self.privileged_inventory(users)
        print(f"Evidence written to {self.out_dir}/  —  do not commit this directory.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Collect NIST 800-53 AC-2 evidence.")
    parser.add_argument("--baseline", choices=["low", "moderate", "high"], default="moderate")
    parser.add_argument("--inactivity-days", type=int, default=90,
                        help="Inactivity ODP; reconcile to your SSP (FedRAMP commonly 90).")
    args = parser.parse_args()
    AC2Evidence(args.baseline, args.inactivity_days).run()
```

---

**Catalog**: NIST SP 800-53 Rev 5
**Baselines**: NIST SP 800-53B (Low / Moderate / High)
**Assessment procedures**: NIST SP 800-53A Rev 5 (examine / interview / test)
**Profiled by**: FedRAMP, StateRAMP, CMMC / NIST 800-171, agency FISMA programs
**Evidence retention**: per the authorizing program (see AU-11 for the audit-retention parameter)
