# Experimental assessment review draft

This program-neutral prototype advances [#170](https://github.com/GRCEngClub/claude-grc-engineering/issues/170), [#171](https://github.com/GRCEngClub/claude-grc-engineering/issues/171) and [#172](https://github.com/GRCEngClub/claude-grc-engineering/issues/172) without deciding their disputed program or placement. It is **not** an SRTM, RET, SAR, assessment, attestation or authorization and does not close those issues. Its unstable JSON output is a review aid, not a template or interoperability contract.

The [official legacy SAR playbook](https://www.fedramp.gov/legacy/playbook/csp/authorization/sar/) describes traceability between test results, risks, evidence and the report, and the role of the 3PAO. FedRAMP marks that guidance reference-only during the 2026 transition. This tool borrows the idea of tracing supplied observations and weaknesses, not its rules, baseline, template or assessment conclusions. See [research](fedramp-assessment-artifact-research.md) for exact historical template versions and their hashes. Maintainers and authorizing stakeholders must resolve applicable program and template before any compatibility assertion.

## Run

After `npm install` including development dependencies:

```sh
node scripts/assessment-review-draft.mjs tests/fixtures/assessment-observations/synthetic.json review.json
```

The optional output path must not already exist. The CLI validates and renders the draft before exclusively creating the file with restrictive permissions (subject to umask); existing files and symlinks are not overwritten. Use a trusted, private output directory: parent-directory symlinks are followed, and a user able to change directory entries can redirect, replace, or remove the output. Exclusive creation depends on filesystem support and does not provide atomic publication; readers can see an incomplete file. A write failure can leave a partial new file, which must be removed before retrying. Mode 0600 is a POSIX permission request, not a guarantee against privileged access, ACLs, or non-POSIX filesystem behavior. Omitting the output path retains JSON on stdout for existing integrations; shell redirection can truncate an existing file before validation and may create a more broadly readable file. Protect stdout and any redirected output as sensitive data.

Input is the [experimental observations contract](assessment-observations-proposal.md); output contains one traceability row per observation, one risk-review row per supplied deficiency with reverse links, missing-field warnings, and explicitly unfilled report/attestation placeholders. Unknown controls remain visible; unknown deficiency references and duplicate IDs fail the entire run. Missing links are flagged for review, not assumed to be errors or evidence of no weakness. Supplied risk fields are reproduced as unverified text, never calculated or validated. Counts and absence of rows do not establish baseline coverage or compliance. Both input and output can contain sensitive assessment data; protect files and avoid public fixtures containing real data.

## Optional assessment context

The optional `assessment_context` object accepts `scope`, `process`, `procedures` and `methodology` as nonblank supplied text, plus arrays `corrected_deficiency_refs` and `remaining_deficiency_refs` containing supplied deficiency IDs. See `tests/fixtures/assessment-observations/synthetic-context.json` for a synthetic example. Missing fields become `null` and generate warnings; an explicitly supplied empty array remains empty. Each unclassified deficiency is listed and warned about. Unknown IDs, duplicate IDs within a list, and classifications in both lists are rejected; no data is emitted on validation failure. These are prototype intake rules, not official FedRAMP requirements. Classifications are unverified assertions, not evidence of remediation or closure, and do not determine risk ratings or authorization.

The [official legacy Rev. 5 annual-assessment guidance](https://www.fedramp.gov/legacy/playbook/csp/continuous-monitoring/annual-assessment/#conduct-the-security-assessment-and-develop-sar) says the SAR documents actual assessment processes, procedures, methodologies, results, and risks corrected during testing or remaining at its conclusion. This motivates collecting context and preserving supplied classifications for human review; it does not define this prototype's schema or establish template conformance. The page is reference-only during the transition to the 2026 consolidated rules; no equivalence with 20x is implied.

## Experimental comparison

```sh
node scripts/assessment-review-comparison.mjs before.json after.json comparison.json
```

This program-neutral review aid compares two valid inputs with the same assessment ID. It reports added and removed IDs, changed field names, source changes, and the review warnings for each input. IDs and field names are sorted; reference list ordering is ignored. Missing optional fields differ from supplied empty lists. An absent context and an empty context are equivalent. It does not show old or new values; inspect the inputs for details. Identical IDs are only a matching convention, not proof the snapshots describe the same real assessment. Changes, removals and corrected classifications do **not** establish remediation, closure, coverage, risk, assessment or authorization. Results and warnings may contain sensitive identifiers.

Both inputs are validated before an output is created. The required output path is exclusively created with the same filesystem limitations, permissions and trusted-directory requirements described above for the draft. This comparison is not an official template, stable contract, or a substitute for independent review. It does not resolve the applicable FedRAMP program or the outstanding decisions for #170, #171 and #172.

## Experimental CSV exports

```sh
node scripts/assessment-review-csv.mjs traceability tests/fixtures/assessment-observations/synthetic.json traceability.csv
node scripts/assessment-review-csv.mjs risks input.json risks.csv
```

The CSVs are program-neutral review aids, not official templates. They repeat a draft notice and carry references as JSON arrays in cells. As a conservative prototype restriction, either export refuses empty observations or deficiencies, observations without evidence or deficiency links, and deficiencies without linked observations. This is a tool limitation, **not** a requirement that every observation has a deficiency. Risk export also refuses missing risk-review fields; it does not validate their substance. The bundled fixture intentionally lacks risk fields, so the risks example needs a complete synthetic input.

The output path is required and must not exist: the program validates and renders the entire input before exclusively creating the file, refusing to overwrite existing paths (including symlinks). New files are created with restrictive permissions, subject to the system umask. Do not use shell output redirection to name the CSV: the shell can truncate files before validation. An I/O failure while writing can leave a partial new file; remove it before retrying. Successful exports report all input/review warnings on stderr, not in the CSV; in particular, traceability can succeed with missing risk fields, so retain and review those warnings separately. The programmatic `generateReviewCsvWithWarnings` returns both `csv` and `warnings`; `generateReviewCsv` returns only CSV. Protect warnings as sensitive assessment data too.

CSV cells starting with formula characters, including after whitespace, are prefixed with an apostrophe; tabs and line breaks at the start are also prefixed. Spreadsheet behavior varies: import all columns as text and verify handling; use JSON if literal-text handling cannot be guaranteed. Prefixes alter raw values. Never open untrusted exports in a spreadsheet without appropriate precautions.

No evidence is resolved, no baseline or template columns are validated, no likelihood/impact methodology is applied, and no independent status reconciliation is performed. Outputs do not implement the separate SRTM/RET interfaces needed for a SAR, nor DOCX, PDF, XLSX or package assembly. Qualified assessors must independently validate data, risk, findings, conclusions and any attestation; authorizing officials make authorization decisions. This is not deployable as a compliance or certification service.
