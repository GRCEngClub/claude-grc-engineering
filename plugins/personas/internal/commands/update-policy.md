---
description: Review, revise, version, and track approval and attestation for a policy document and its ./grc-data/policies/ record
---

# Update Policy

Moves a policy document through review, revision, approval, and publication, and keeps its lifecycle record in `./grc-data/policies/` (`schemas/policy.schema.json`) in step. The policy text lives wherever the organization keeps it (for example `policies/*.md`); the record holds the metadata: version, owner, approvers, effective date, and next review.

This command drafts. A person approves. It never sets `status: approved` without a named approver and an approval date supplied by the user.

## Arguments

Parse `$ARGUMENTS` as `<policy> [action] [flags]`.

- Policy (required): a path to the policy document, a policy ID from `./grc-data/policies/` (for example `POL-001`), or `all` with the `status` action.
- Action (optional, default `review`):

| Action | What it does |
|---|---|
| `review` | Checks the document against the mapped framework requirements and house rules; lists gaps |
| `update` | Drafts redlined changes for the gaps the user accepts, or for a stated driver (new regulation, audit finding, org change) |
| `version` | Bumps the version, writes a change log entry, and moves the record to `in_review` |
| `approve` | Records an approval the user reports and sets the effective and next-review dates |
| `attest` | Builds or updates the acknowledgement tracker for people who must read the policy |
| `status` | Lists every policy record with its state, version, and review due date |

Flags:

- `--frameworks=<list>`: frameworks to check against, such as `iso27001,soc2`. Default: the record's `framework_refs`.
- `--driver="<text>"`: why the update is happening. Required for `update` when there is no `review` output to work from.
- `--approver="<name>"` and `--approved-at=<YYYY-MM-DD>`: required for `approve`.
- `--major`: for `version`, bump the major number instead of the minor.
- `--audience=<file>`: for `attest`, a CSV of people (`name,email,team`) who must acknowledge.

Reject missing paths, unknown IDs, and `approve` without both approver flags.

## Versioning rules

- Versions are `MAJOR.MINOR`. A minor bump covers wording, clarifications, owner or contact changes, and formatting. A major bump covers any change to what people must do: a new requirement, a removed exception, a changed frequency or threshold, or a new scope. A major change needs re-approval and re-attestation; a minor change needs owner sign-off only, unless the organization's policy on policies says otherwise.
- Every version gets a change log entry at the end of the document: version, date, author, summary, approver.
- The record's `version` must match the document's change log. If they disagree, `review` reports it before anything else.
- An approved status never covers edited text. When `update` is about to change the document of an `approved` policy, it first bumps the version (minor or major, per the rules above, chosen from the confirmed redline), adds the change log entry, and moves the record to `in_review`, all shown in the same confirmation as the redline. Then it edits the document. The previous approved version stays in the change log and in Git history until the new version is approved.

## Review cadence

- Default interval: 365 days (`review_interval_days`), counted from `effective_at`.
- Shorten it when a framework or contract requires it, or when the policy covers a fast-moving area. Record the reason in `metadata.review_interval_reason`.
- Review is also due, regardless of date, after a significant change: a new regulation in scope, an audit finding against the policy, an incident that showed the policy did not work, a reorganization that changes owners, or a new system that the policy should cover. `review` asks about these triggers.
- A review that changes nothing still counts. Record it by setting `metadata.last_reviewed_at` and moving `next_review_at` forward, and add a change log line "Reviewed, no changes".

## What `review` checks

1. **Structure**: purpose, scope, roles and responsibilities, policy statements, exceptions process, enforcement, related documents, review and approval history.
2. **Framework coverage**: for each framework in scope, whether the policy addresses the requirements that call for it. For example, an access control policy mapped to ISO/IEC 27001:2022 should cover A.5.15 to A.5.18 and A.8.2 to A.8.5; one mapped to SOC 2 should support CC6.1 to CC6.3. Quote the policy text that meets each requirement, or mark it as a gap.
3. **Testability**: statements an auditor could test ("reviewed quarterly by the system owner") rather than intentions ("access is reviewed regularly"). Flag every "should", "as appropriate", or "periodically" that leaves the obligation undefined.
4. **Consistency**: frequencies and thresholds that conflict with other policies or with the obligation register in `./grc-data/obligations.yaml`.
5. **Currency**: references to withdrawn standards or old versions (for example ISO/IEC 27001:2013 or PCI DSS v3.2.1), departed owners, or retired systems.

## Output

Written to `~/.cache/claude-grc/reports/internal/policy-<policy-id>-<YYYY-MM-DD>/`:

- `review.md`: gaps with the requirement, the current text, and a suggested fix
- `redline.md` (for `update`): proposed changes as a diff against the current document, each with its reason
- `attestation.csv` (for `attest`): `name,email,team,version,assigned_at,acknowledged_at`

Record changes are written to `./grc-data/policies/<policy-id>.json`; document changes are made only to the path the user gave, and only after the user confirms the redline.

Example record after `approve`:

```json
{
  "schema_version": "1.0.0",
  "policy_id": "POL-001",
  "title": "Access Control Policy",
  "status": "approved",
  "version": "4.0",
  "owner": { "team": "Security Governance" },
  "approvers": [{ "name": "Taylor Brooks", "email": "taylor@example.com" }],
  "document_path": "policies/access-control-policy.md",
  "effective_at": "2026-12-01T00:00:00Z",
  "next_review_at": "2027-12-01T00:00:00Z",
  "review_interval_days": 365,
  "framework_refs": ["iso27001", "soc2"],
  "control_refs": ["A.5.15", "A.5.18", "A.8.2", "CC6.1"],
  "metadata": {
    "approved_at": "2026-11-26",
    "change_type": "major",
    "attestation_required": true
  }
}
```

## Attestation tracking

`attest` produces the list of people who must acknowledge the current version and, given an updated CSV with `acknowledged_at` filled in, reports completion: total, acknowledged, outstanding by team, and anyone outstanding past the deadline the user sets. It does not send messages. Store the tracker as evidence; auditors commonly sample acknowledgements for SOC 2 CC2.2 and ISO/IEC 27001:2022 A.6.3.

## Framework mapping

| Requirement | What this command supports |
|---|---|
| ISO/IEC 27001:2022 clause 5.2 | Information security policy approved by top management |
| ISO/IEC 27001:2022 clause 7.5 | Documented information: identification, review, approval, version control |
| ISO/IEC 27001:2022 A.5.1 | Policies defined, approved, published, communicated, acknowledged, and reviewed at planned intervals or after significant change |
| SOC 2 CC5.3 | Policies that establish what is expected, and procedures that put them into action |
| SOC 2 CC2.2 | Communication of responsibilities to staff |
| NIST CSF 2.0 GV.PO-01 and GV.PO-02 | Policy established from context and strategy; reviewed, updated, communicated, and enforced |

## Examples

```bash
/internal:update-policy policies/access-control-policy.md review --frameworks=iso27001,soc2
/internal:update-policy POL-001 update --driver="PCI DSS v4.0.1 8.4.2: MFA for all non-console access into the CDE"
/internal:update-policy POL-001 version --major
/internal:update-policy POL-001 approve --approver="Taylor Brooks" --approved-at=2026-11-26
/internal:update-policy POL-001 attest --audience=./people/engineering.csv
/internal:update-policy all status
```
