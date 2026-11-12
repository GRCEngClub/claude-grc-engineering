# Experimental assessment review draft

This program-neutral prototype advances [#170](https://github.com/GRCEngClub/claude-grc-engineering/issues/170), [#171](https://github.com/GRCEngClub/claude-grc-engineering/issues/171) and [#172](https://github.com/GRCEngClub/claude-grc-engineering/issues/172) without deciding their disputed program or placement. It is **not** an SRTM, RET, SAR, assessment, attestation or authorization and does not close those issues. Its unstable JSON output is a review aid, not a template or interoperability contract.

The [official legacy SAR playbook](https://www.fedramp.gov/legacy/playbook/csp/authorization/sar/) describes traceability between test results, risks, evidence and the report, and the role of the 3PAO. FedRAMP marks that guidance reference-only during the 2026 transition. This tool borrows the idea of tracing supplied observations and weaknesses, not its rules, baseline, template or assessment conclusions. See [research](fedramp-assessment-artifact-research.md) for exact historical template versions and their hashes. Maintainers and authorizing stakeholders must resolve applicable program and template before any compatibility assertion.

## Run

After `npm install` including development dependencies:

```sh
node scripts/assessment-review-draft.mjs tests/fixtures/assessment-observations/synthetic.json > review.json
```

Input is the [experimental observations contract](assessment-observations-proposal.md); output contains one traceability row per observation, one risk-review row per supplied deficiency with reverse links, missing-field warnings, and explicitly unfilled report/attestation placeholders. Unknown controls remain visible; unknown deficiency references and duplicate IDs fail the entire run. Missing links are flagged for review, not assumed to be errors or evidence of no weakness. Supplied risk fields are reproduced as unverified text, never calculated or validated. Counts and absence of rows do not establish baseline coverage or compliance. Both input and output can contain sensitive assessment data; protect files and avoid public fixtures containing real data.

Only JSON is supported. No evidence is resolved, no baseline or template columns are validated, no likelihood/impact methodology is applied, and no corrected/open status reconciliation is performed. Outputs do not implement the separate SRTM/RET interfaces needed for a SAR, nor DOCX, PDF, CSV, XLSX or package assembly. Qualified assessors must independently validate data, risk, findings, conclusions and any attestation; authorizing officials make authorization decisions. This is not deployable as a compliance or certification service.
