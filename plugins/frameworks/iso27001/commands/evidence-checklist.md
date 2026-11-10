# ISO 27001:2022 Evidence Checklist

Generates audit-ready evidence collection checklists for ISO/IEC 27001:2022 Annex A controls. Accepts an individual control ID or a control domain, and provides markdown, JSON, or CSV output guidance. Control descriptions are paraphrased; this command does not reproduce copyrighted ISO standard text.

> **Never commit evidence artifacts to source control.** The outputs below include real usernames, credential reports, MFA device states, and privileged-account inventories. For GDPR workflows, raw exports may carry personal data subject to Art. 5 minimization and storage-limitation rules. Keep only what you need and delete on a retention schedule. `.gitignore` covers `evidence/` by default so `git add -A` will not sweep it up, but durable storage is your responsibility. Use an encrypted, access-controlled evidence locker (encrypted S3 with least-privilege IAM, a GRC platform, or a shared drive with full-disk encryption and MFA-gated access).

## Usage

```bash
/iso:evidence-checklist <control-id|domain> [--export <format>]
```

## Arguments

- `<control-id|domain>`: ISO 27001:2022 Annex A control, such as `A.5.15` or `A.8.24`, or domain name: `Organizational`, `People`, `Physical`, or `Technological`. Also accept domain identifiers `A.5`, `A.6`, `A.7`, and `A.8`.
- `--export`: Output format: `markdown` (default), `json`, or `csv`.

## Control Selection and Validation

1. Normalize whitespace and case in domain names; normalize control IDs to uppercase `A.` notation.
2. Use only the ISO/IEC 27001:2022 Annex A catalog: 93 controls in four domains: A.5 Organizational (37), A.6 People (8), A.7 Physical (14), and A.8 Technological (34).
3. For a single control, verify that its identifier belongs to the 2022 catalog. Do not silently map an obsolete 2013 control number.
4. For a domain, include each applicable 2022 control in that domain. Use the repository's authoritative framework references where available.
5. For an unknown identifier, explain that it is unsupported and show valid example identifiers and domain names; do not invent a control.
6. Use concise, original descriptions of the security objective. Do not quote ISO control text.
7. Use a consistent evidence record for each checklist item: `control_id`, `domain`, `evidence_item`, `collection_method`, `owner`, `frequency`, `review_criteria`, `status`, and `storage_reference`.
8. Use `Not collected`, `Collected`, `Needs review`, or `Not applicable` for status. Never mark evidence collected without verification.

## Evidence Requirements

### Required Documentation

For each selected control, identify the relevant policy or procedure, accountable owner, approval or review date, scope, and evidence of implementation. Tailor the requested documents to the organization and its Statement of Applicability (SoA).

### Automated Evidence Collection

Where a technical system supports it, propose read-only inventory or configuration exports. Specify the tool, required access, review criteria, and collection frequency. Do not assume that an export alone proves the control operates effectively.

### Manual Evidence Collection

Include interviews, approved policies, review records, tickets, meeting minutes, sampled approvals, and other artifacts that cannot reliably be established by automated collection.

### Evidence Handling

- Collect only evidence needed to support the control assessment.
- Redact secrets, tokens, personal data, and unnecessary identifiers.
- Store artifacts outside source control in an access-controlled evidence repository.
- Record collection date, system or process scope, evidence owner, and reviewer.
- Apply the organization's approved retention and disposal schedule; ISO 27001 does not impose one universal evidence retention period.
- Link to protected storage references instead of embedding sensitive evidence in the checklist.

## Example 1: Organizational Control A.5.15

```bash
/iso:evidence-checklist A.5.15
```

**Output (markdown):**

```markdown
# ISO 27001:2022 Evidence Checklist
Control: A.5.15
Domain: Organizational (A.5)
Focus: Access control governance
Status: Not collected

## Required Documentation
- [ ] Access control policy
  Owner: Information Security
  Collection method: Obtain approved policy from document repository
  Review criteria: Defines access authorization, least privilege, and review responsibilities
  Frequency: At policy review or material change
  Storage reference: [protected evidence location]

- [ ] Role and access entitlement matrix
  Owner: Identity and Access Management
  Collection method: Export approved role definitions and entitlement mappings
  Review criteria: Access is associated with documented job responsibilities
  Frequency: Quarterly or according to the approved review schedule
  Storage reference: [protected evidence location]

## Automated Evidence Collection
- [ ] Identity provider role and group inventory
  Owner: IAM Operations
  Collection method: Read-only export from the identity provider
  Review criteria: Identify privileged and unexpected entitlements for review
  Frequency: Quarterly
  Storage reference: [protected evidence location]

## Manual Evidence Collection
- [ ] Sample access request and approval tickets
  Owner: Application Owners
  Collection method: Select a documented sample of recent access grants
  Review criteria: Requests show appropriate authorization and business justification
  Frequency: Quarterly
  Storage reference: [protected evidence location]

## Assessment Notes
Compare collected records against the approved policy and Statement of Applicability.
Escalate exceptions; do not infer compliance solely from the existence of documents.
```

## Example 2: Technological Control A.8.24

```bash
/iso:evidence-checklist A.8.24 --export json
```

**Output (JSON):**

```json
{
  "framework": "ISO/IEC 27001:2022",
  "control_id": "A.8.24",
  "domain": "Technological",
  "focus": "Use of cryptography",
  "status": "Not collected",
  "evidence": [
    {
      "evidence_item": "Approved cryptography and key management policy",
      "collection_method": "Review approved policy and key lifecycle procedures",
      "owner": "Information Security",
      "frequency": "Annually and after material changes",
      "review_criteria": "Defines encryption use, key ownership, rotation, and revocation",
      "status": "Not collected",
      "storage_reference": null
    },
    {
      "evidence_item": "Encryption configuration inventory",
      "collection_method": "Read-only export of storage and transport encryption settings",
      "owner": "Cloud or Platform Operations",
      "frequency": "Monthly",
      "review_criteria": "Compare enabled encryption and approved algorithms with policy",
      "status": "Not collected",
      "storage_reference": null
    },
    {
      "evidence_item": "Key management access review",
      "collection_method": "Review KMS role assignments and access approval records",
      "owner": "IAM and Key Management",
      "frequency": "Quarterly",
      "review_criteria": "Key administration access is limited and appropriately approved",
      "status": "Not collected",
      "storage_reference": null
    }
  ]
}
```

## CSV Export

```bash
/iso:evidence-checklist A.8.24 --export csv
```

Use one row per evidence item with a stable header:

```csv
control_id,domain,evidence_item,collection_method,owner,frequency,review_criteria,status,storage_reference
A.8.24,Technological,Approved cryptography and key management policy,Review approved policy and key lifecycle procedures,Information Security,Annually and after material changes,Defines encryption use and key lifecycle responsibilities,Not collected,
A.8.24,Technological,Encryption configuration inventory,Read-only export of encryption settings,Cloud or Platform Operations,Monthly,Compare settings with approved policy,Not collected,
```

## Domain-Level Example

```bash
/iso:evidence-checklist Technological --export markdown
```

Generate a checklist grouped by each applicable A.8 control in the 2022 catalog, with the same evidence fields and review criteria. Do not substitute the older 2013 catalog.

## Compliance Assessment

For each selected control, report:

- **Collected:** Evidence exists and is accessible to authorized reviewers.
- **Needs review:** Evidence is incomplete, outdated, or inconsistent with the documented control.
- **Not collected:** Evidence has not yet been supplied.
- **Not applicable:** Exclusion is supported by the approved Statement of Applicability.

Collection status is not itself a certification or compliance determination.

## Remediation Guidance

1. Identify missing or insufficient evidence.
2. Assign an accountable control owner.
3. Record the corrective action and target date.
4. Collect replacement evidence after remediation.
5. Have an independent reviewer verify closure.

## Cross-References

- ISO/IEC 27001:2022 Annex A: 93 controls across A.5, A.6, A.7, and A.8.
- ISO/IEC 27001:2022 Statement of Applicability: organization-specific control applicability and justification.
- ISO/IEC 27002:2022: implementation guidance, subject to applicable licensing.
- Related repository commands: `/iso:assess`, `/iso:gap-analysis`, and `/iso:soa-generator`.

## Evidence Package Structure

```text
evidence/
└── iso27001/
    ├── organizational/
    │   └── A.5.15/
    │       ├── access-policy-reference.md
    │       └── access-review-index.csv
    ├── technological/
    │   └── A.8.24/
    │       ├── encryption-inventory-reference.json
    │       └── key-review-index.csv
    └── evidence-index.csv
```

The structure above is illustrative. Keep actual evidence in protected storage, not in the Git repository.
