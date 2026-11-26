---
name: policy-lifecycle
description: Manages security policies from draft to retirement. Reviews policy text against framework requirements and testability rules, drafts redlines, applies MAJOR.MINOR versioning with a change log, records approvals and review dates in ./grc-data/policies/, and tracks staff attestation. Used by /internal:update-policy.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Policy Lifecycle

Keeps policy documents current, approved, and provable to an auditor. Two artifacts move together: the document itself (wherever the organization stores it) and its lifecycle record in `./grc-data/policies/<policy-id>.json` (`schemas/policy.schema.json`).

## Lifecycle states

| Record `status` | Meaning | Moves to |
|---|---|---|
| `draft` | Being written or revised | `in_review` when the author asks for review |
| `in_review` | With reviewers or the approver | `approved` with a named approver and date; back to `draft` if changes are requested |
| `approved` | In force from `effective_at` | `in_review` at the next revision; `retired` when superseded |
| `retired` | No longer in force | Terminal. Keep the file and the document for the retention period |

Publishing and attestation happen after approval and are tracked in `metadata` (`published_at`, `attestation_required`, `attestation_deadline`).

## Versioning

- `MAJOR.MINOR`. Major: any change to what people must do (new or removed requirement, changed frequency, threshold, or scope). Minor: wording, clarification, contacts, formatting.
- Major changes need approval and fresh attestation. Minor changes need owner sign-off.
- Each version adds a change log line to the document: version, date, author, summary, approver. The record's `version` must equal the latest change log entry.

## Review triggers

Scheduled: `next_review_at`, default 365 days after `effective_at`. Unscheduled: a new regulation or contract in scope, an audit finding or incident involving the policy, a reorganization that changes owners, or a new system the policy should cover. A review with no changes is still recorded.

## Review checklist

1. **Structure**: purpose, scope, roles, policy statements, exceptions process, enforcement, related documents, approval history.
2. **Framework coverage**: for each framework passed with `--frameworks`, or the record's `framework_refs` when the flag is absent, quote the text that meets each relevant requirement or mark a gap. Use current versions: ISO/IEC 27001:2022 Annex A IDs, PCI DSS v4.0.1, NIST CSF 2.0, SOC 2 TSC (2017, with 2022 revised points of focus).
3. **Testability**: each statement names who does what, how often, and what record it leaves. Replace "regularly", "as needed", "appropriate" with a frequency or a decision rule.
4. **Consistency**: no conflicts with other policies, standards, or the obligation register.
5. **Currency**: no withdrawn standards, departed owners, or retired systems.

## Writing redlines

- Change only what the gap requires. Keep the organization's voice and numbering.
- For each change: the requirement or driver, the old text, the new text, and whether it makes the next version major or minor.
- Never edit the document until the user confirms the redline.
- Editing an `approved` policy: bump the version, add the change log entry, and move the record to `in_review` before writing the document, so the approved status never covers changed text.

## Common policy set and primary mappings

| Policy | ISO/IEC 27001:2022 | SOC 2 |
|---|---|---|
| Information security policy | Clause 5.2, A.5.1 | CC1.1, CC5.3 |
| Access control | A.5.15-A.5.18, A.8.2-A.8.5 | CC6.1-CC6.3 |
| Acceptable use | A.5.10 | CC2.2 |
| Data classification and handling | A.5.12, A.5.13 | CC6.1, C1.1 |
| Incident response | A.5.24-A.5.28 | CC7.3-CC7.5 |
| Business continuity | A.5.29, A.5.30 | A1.2, A1.3 |
| Change management | A.8.32 | CC8.1 |
| Supplier security | A.5.19-A.5.23 | CC9.2 |
| Logging and monitoring | A.8.15, A.8.16 | CC7.2 |
| Cryptography | A.8.24 | CC6.1, CC6.7 |

## Attestation

Track who must acknowledge which version, when they were asked, and when they acknowledged. Report completion by team and list anyone past the deadline. Do not send messages; produce the list for the user's own tooling.

## Framework references

- ISO/IEC 27001:2022 clause 5.2 (policy), clause 7.5 (documented information), A.5.1 (policies for information security), A.6.3 (awareness)
- SOC 2 CC5.3 (policies and procedures), CC2.2 (internal communication)
- NIST CSF 2.0 GV.PO-01 and GV.PO-02
