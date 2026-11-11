# ISO 27001 Evidence Checklist

Generates an evidence collection checklist for ISO/IEC 27001:2022 Annex A controls, tailored to the organization's ISMS scope and Statement of Applicability (SoA).

> **Never commit evidence artifacts to source control.** The outputs below include real usernames, credential reports, MFA device states, and privileged-account inventories. For GDPR workflows, raw exports may carry personal data subject to Art. 5 minimization and storage-limitation rules. Keep only what you need and delete on a retention schedule. `.gitignore` covers `evidence/` by default so `git add -A` will not sweep it up, but durable storage is your responsibility. Use an encrypted, access-controlled evidence locker (encrypted S3 with least-privilege IAM, a GRC platform, or a shared drive with full-disk encryption and MFA-gated access).

## Usage

```bash
/iso27001:evidence-checklist <control-id|domain> [--export <markdown|json|csv>]
```

## Arguments

- `<control-id|domain>`: A 2022 Annex A control ID (for example, `A.5.15` or `A.8.24`) or category name or ID: `Organizational`/`A.5`, `People`/`A.6`, `Physical`/`A.7`, `Technological`/`A.8`.
- `--export`: `markdown`, `json`, or `csv`; default `markdown`.

## Checklist generation

1. Resolve the requested control against the ISO/IEC 27001:2022 Annex A catalog, not the 2013 catalog: A.5 contains 37 controls, A.6 contains 8, A.7 contains 14, and A.8 contains 34. For a category, enumerate its controls and generate evidence items for each; do not silently omit controls. Reject an unknown ID or category and ask for a valid selection instead of inventing a mapping. Consult the user's licensed standard and SoA when the catalog or applicability is uncertain.
2. Ask for the ISMS boundary, assessment period, SoA and relevant systems if not provided; mark unknowns explicitly. Distinguish controls excluded in the SoA and request their documented rationale rather than asserting they are applicable.
3. For each applicable control propose specific documentation, operational records and where feasible technical configuration or test results. Tag every item with its 2022 control ID, suggested owner, collection frequency, and what the reviewer should verify. Treat frequencies as suggestions, not universal ISO mandates. Mark missing or unverified evidence as outstanding; do not claim certification or effectiveness based on a checklist alone.
4. Explain that control intent is paraphrased; consult the licensed ISO standard for normative requirements. Avoid reproducing ISO text or inventing SCF crosswalks. Restrict collection to authorized users and minimize personal data and secrets.

### Export formats

Return the checklist in the requested format, not a description of the format. Markdown uses checkboxes and the same fields as the examples below. JSON is an array of objects; CSV has a header and one row per item. Both use `control_id`, `item`, `owner`, `frequency`, `verification`, and `status` fields. Default `status` to `outstanding` unless the user supplies verified evidence. Excluded controls should have a separate rationale item marked `excluded` rather than implying implementation.

For spreadsheet-oriented CSV, treat every data cell as untrusted text, including generated and user-supplied values. Before CSV encoding, prefix every data-cell value with a literal ASCII apostrophe (`'`), even if it begins with whitespace, a tab, a carriage return, a newline, `=`, `+`, `-`, or `@`. Do not trim away the prefix. Then encode each field as CSV: quote fields containing commas, double quotes, CR or LF, and double any embedded double quotes. Quoting alone does not prevent formula execution. For example, the data value `=1+1` becomes `'=1+1`; the data value `=1+1, "check"` becomes `"'=1+1, ""check"""` in the CSV. The fixed header need not be prefixed.

This prefix changes the raw CSV values and spreadsheet behavior varies: import all columns explicitly as text, verify the target spreadsheet treats the apostrophe-prefixed cells as literal text, and do not enable formula evaluation for untrusted data. Saving and reopening in a spreadsheet may remove protective characters; reapply protection before any subsequent export. If the target importer cannot guarantee literal-text handling, do not open the CSV there; use JSON for faithful machine-readable values instead.

## Example 1 — Organizational: A.5.15

```bash
/iso27001:evidence-checklist A.5.15
```

**Output:**

```markdown
ISO 27001:2022 Evidence Checklist
Control: A.5.15 (Organizational)
Scope: Example ISMS; confirm boundary and assessment period
Intent (paraphrased): Establish an approach to controlling access that reflects business and security needs.

- [ ] **Access-control policy** — A.5.15
  - Owner: Security governance; suggested frequency: annual and after material change
  - Verify: approved policy defines access principles, ownership and scope.
  - Status: outstanding
- [ ] **Access requirements and role matrix** — A.5.15
  - Owner: Application owners; suggested frequency: annual and after role changes
  - Verify: business and security requirements are documented and mapped to roles for in-scope systems.
  - Status: outstanding
- [ ] **Policy review and exception records** — A.5.15
  - Owner: Risk owner; suggested frequency: quarterly
  - Verify: sampled exceptions have approval, a rationale and an expiry or review date.
  - Status: outstanding
```

## Example 2 — Technological: A.8.24

```bash
/iso27001:evidence-checklist A.8.24
```

**Output:**

```markdown
ISO 27001:2022 Evidence Checklist
Control: A.8.24 (Technological)
Scope: Example ISMS; confirm boundary and assessment period
Intent (paraphrased): Apply cryptography and manage keys in a manner suited to the information and risks.

- [ ] **Cryptography and key-management guidance** — A.8.24
  - Owner: Security architecture; suggested frequency: annual and after material change
  - Verify: approved guidance covers algorithm selection and key lifecycle responsibilities.
  - Status: outstanding
- [ ] **Encryption configuration inventory** — A.8.24
  - Owner: Platform team; suggested frequency: quarterly
  - Verify: sampled systems align with the approved protection requirements for data at rest and in transit.
  - Status: outstanding
- [ ] **Key lifecycle and access review records** — A.8.24
  - Owner: Key custodian; suggested frequency: quarterly
  - Verify: sampled keys have accountable owners, access restrictions and evidence of lifecycle review; do not export secret key material.
  - Status: outstanding
```

A configuration export is a point-in-time observation, not proof that a control operated throughout the assessment period. Supplement it with approved records, interviews and appropriately scoped tests.
