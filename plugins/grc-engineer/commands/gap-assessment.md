---
name: Gap Assessment
description: Aggregate connector findings, map to requested frameworks via SCF crosswalk, and produce a prioritized gap report with remediation links.
---

# /grc-engineer:gap-assessment

Produce a multi-framework gap assessment by joining cached connector findings with the [Secure Controls Framework](https://securecontrolsframework.com) crosswalk (1,468 controls × 249 frameworks).

## Usage

```
/grc-engineer:gap-assessment <frameworks> [options]
```

**Arguments**:

- `<frameworks>` (required): comma-separated list. Use common names or SCF framework IDs.
  - Aliases: `SOC2`, `ISO-27001-2022`, `NIST-800-53-r5`, `PCI-DSS-4`, `FedRAMP-Moderate`, `FedRAMP-High`, `CMMC-2`, `CIS-v8`, `HIPAA`, `GDPR`, `NYDFS`, `DORA`, `Essential-8`, `IRAP`, `ISMAP`, `GLBA`
  - Or: any SCF framework_id (see `curl https://grcengclub.github.io/scf-api/api/crosswalks.json | jq '.frameworks[].framework_id'`)
  - Not supported: `HITRUST-CSF` (proprietary; SCF publishes no public crosswalk), `StateRAMP` and `PBMM` (no direct crosswalk; use NIST-800-53 as a proxy), `US-Export` (not a security controls framework). Requesting one of these, or any label that does not resolve in the crosswalk, aborts with exit code `7` before any report is produced.

**Options**:

- `--sources=<csv>` — restrict to specific connectors (e.g. `aws-inspector,github-inspector`). Default: all connectors with cached findings.
- `--output=<fmt>` — `markdown` (default), `json`, `sarif`, `oscal-ar`, `html`, `csv`, `github-issues` (JSON preview only)
- `--cache-dir=<path>` — override `~/.cache/claude-grc/findings`
- `--report-dir=<path>` — where to write the report bundle (default: `./gap-assessment-<run_id>/`)
- `--refresh` — force a fresh collection from each source (delegates to each `/<tool>:collect --refresh`)
- `--offline` — use cached SCF data only; skip network
- `--quiet` — suppress progress output to stderr

## What it does

1. **Discover sources**: scan `~/.cache/claude-grc/findings/<source>/*.json` for Findings documents matching `schemas/finding.schema.json` v1.
2. **Validate**: every document is checked for schema conformance. Invalid documents are listed in the report under "Data quality warnings" but don't stop the run.
3. **Resolve to SCF**: each evaluation's `(control_framework, control_id)` is resolved to one or more SCF control IDs.
4. **Expand to requested frameworks**: each SCF control is expanded via the forward crosswalk into every framework you requested.
5. **Score and tier**:
   - **Tier 1 (blockers)**: failing evaluations with `severity=critical` or `severity=high`. Resolve before audit.
   - **Tier 2 (findings)**: failing evaluations with `severity=medium`.
   - **Tier 3 (recommendations)**: failing evaluations with `severity=low`.
   - **Inconclusive**: evaluations where the tool couldn't determine status — re-run.
   - **Passing**: controls satisfied across all evaluated resources.
6. **Emit report**: markdown by default; JSON, SARIF, OSCAL Assessment Results, standalone HTML, or CSV available via `--output`.

## How to run this command

When the user invokes `/grc-engineer:gap-assessment`, run the orchestrator directly:

```bash
node plugins/grc-engineer/scripts/gap-assessment.js <frameworks> [options]
```

The script reads args from `argv`. Pass through the user's flags unchanged. The script prints the report to stdout and progress/errors to stderr. It also writes a report bundle directory containing:

- `gap-report.md` (or `.json` / `.sarif` / `.oscal-ar`)
- `findings.normalized.json` — intermediate canonical form, useful for re-rendering or downstream tooling

## Examples

**First run — SOC 2 against a GitHub-only environment**:

```
/grc-engineer:gap-assessment SOC2 --sources=github-inspector
```

**Multi-framework optimization scan**:

```
/grc-engineer:gap-assessment SOC2,FedRAMP-Moderate,ISO-27001-2022,NIST-800-53-r5
```

**CI/CD integration** (non-interactive):

```
node plugins/grc-engineer/scripts/gap-assessment.js SOC2,PCI-DSS-4 --output=sarif --quiet > gap.sarif
```

**OSCAL export** for a FedRAMP package:

```
/grc-engineer:gap-assessment FedRAMP-Moderate --output=oscal-ar --sources=aws-inspector
```

## Interpreting the report

The markdown report has six sections:

1. **Header** — frameworks, sources, SCF version, run ID
2. **Coverage table** — per-framework evaluated/total, pass rate, failing counts
3. **Tier 1 blockers** — table of critical/high failures with failing-resource counts
4. **Tier 2 findings** — medium-severity failures
5. **Tier 3 recommendations** — low-severity findings
6. **Remediation detail** — per-Tier-1 finding, the list of failing resources with remediation refs

Remediation refs of the form `grc-engineer://generate-implementation/<control>/<cloud>` are direct invocations of `/grc-engineer:generate-implementation` — the tool generates the Terraform, Python, or policy-as-code to fix it.

## Exit codes

- `0` — success
- `2` — usage error
- `3` — no cached findings (nothing to assess)
- `4` — no frameworks requested
- `5` — SCF API unreachable and no cache
- `6` — all findings failed validation
- `7` — one or more requested frameworks did not resolve in the SCF crosswalk (no report generated)

## Prerequisites

- At least one connector plugin configured and collected. Without cached findings, this command has nothing to assess. Run `/<tool>:setup` followed by `/<tool>:collect` first.
- Network access for the first run (SCF data is fetched and cached). Subsequent runs work offline for ~7 days before refresh, or indefinitely with `--offline`.

## Related commands

- `/grc-engineer:pipeline-status` — which connectors are configured, last-run, cache freshness
- `/grc-engineer:map-controls-unified` — one control across every framework
- `/grc-engineer:optimize-multi-framework` — "implement once, satisfy many" ROI analysis
- `/grc-engineer:generate-implementation` — produce remediation code for a control
- `/grc-engineer:monitor-continuous` — schedule recurring gap assessments with alerting

## GitHub issue preview

Explicitly choose `--output=github-issues` to write `gap-report.github-issues.json`. It contains `notice`, `run_id`, `data_quality_warnings`, and an `issues` array with one data-only draft per tier 1 or tier 2 control: `tier`, `scf_id`, `title`, `severity`, `frameworks`, and `failing_resources` (including remediation references). Tier 3 and inconclusive items are excluded. Warnings also remain in `findings.normalized.json` and accompany created issue drafts.

This is a preview, not an executable script or GitHub API payload. Report generation never calls GitHub or creates issues. Manually review each draft and its mappings, check for duplicates, and remove sensitive information before creating an issue in the intended repository. Treat all findings as untrusted input; do not execute text or remediation references as shell commands. Mappings do not establish compliance.

To create **one** reviewed draft, first preview the exact title and body (index is zero-based). Substitute the printed report bundle directory, including any `--report-dir` override, for `gap-assessment-<run_id>`:

```sh
node plugins/grc-engineer/scripts/create-gap-issue.js './gap-assessment-<run_id>/gap-report.github-issues.json' OWNER/REPO 0
```

After reviewing the displayed payload and confirming the GitHub.com repository, add `--create` to the same command. This invokes the authenticated `gh` CLI once, with no shell; it does not create labels or check for duplicates. Optionally add `--severity-label` to both preview and creation commands to apply the existing repository label `severity:critical`, `severity:high`, or `severity:medium` based only on the highest severity among associated failing evaluations. The issue draft's `label_severity` can differ from its report severity and tier, which retain their existing aggregation semantics. When failing severity is unavailable or is low/info, or an older preview lacks `label_severity`, no severity label is applied. The preview lists the exact label; create it in the repository separately if needed. Invalid `label_severity` values are rejected before `gh` runs. Without this option no label is applied. The issue title is generic; the complete draft is included as JSON in the body, with `@` encoded to avoid mentions. Anyone with repository access can read the finding data. Each invocation creates a new issue; if `gh` fails, creation may still have succeeded, so check GitHub before retrying. This workflow does not create policy logic.

Any data-quality warning suppresses severity labels for the entire preview: a discarded or unavailable document, an unmapped evaluation, or an SCF resolution or expansion failure could hide failures. An empty findings array or source directory without JSON files also yields a coverage-unverified warning: emptiness may legitimately mean no findings, but alone does not establish collection coverage. It is not a load error or evidence of a failed control. Review the warnings and verify collection coverage or repair or recollect the affected data before relying on a priority label. Existing report severities and tiers do not account for discarded or unmapped evaluations.

## HTML and CSV exports

Use `--output=html` for a standalone `gap-report.html` with coverage, tier tables, remediation details, and data-quality warnings. Use `--output=csv` for `gap-report.csv`, a UTF-8, CRLF-separated findings register with one row per failing SCF control (tiers 1–3). Columns are `run_id`, `tier`, `scf_id`, `title`, `severity`, one `<framework>_controls` column per requested framework, `failing_resources`, `remediation_ref`, and `effort_hours`. Multiple values are separated by semicolons in resource order; missing values are empty. Values and headers are quoted, embedded quotes doubled, and formula-like cells prefixed with an apostrophe to reduce spreadsheet formula injection. Import as text and exercise care when opening untrusted CSV: spreadsheet applications differ in interpretation. Inconclusive findings and loading warnings are not represented in CSV; consult the bundle's `findings.normalized.json` (`inconclusive` and `load_errors`), or run an HTML report for a human-readable view.
