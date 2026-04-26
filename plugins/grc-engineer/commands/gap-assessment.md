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
  - Aliases: `SOC2`, `ISO-27001-2022`, `NIST-800-53-r5`, `PCI-DSS-4`, `FedRAMP-Moderate`, `FedRAMP-High`, `CMMC-2`, `HITRUST-CSF`, `CIS-v8`, `HIPAA`, `GDPR`, `NYDFS`, `DORA`, `Essential-8`, `IRAP`, `ISMAP`, `PBMM`, `GLBA`
  - Or: any SCF framework_id (see `curl https://grcengclub.github.io/scf-api/api/crosswalks.json | jq '.frameworks[].framework_id'`)

**Options**:

- `--sources=<csv>` — restrict to specific connectors (e.g. `aws-inspector,github-inspector`). Default: all connectors with cached findings.
- `--output=<fmt>` — `markdown` (default), `json`, `sarif`, `oscal-ar`
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
6. **Emit report**: markdown by default; JSON, SARIF, or OSCAL Assessment Results available via `--output`.

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

## Prerequisites

- At least one connector plugin configured and collected. Without cached findings, this command has nothing to assess. Run `/<tool>:setup` followed by `/<tool>:collect` first.
- Network access for the first run (SCF data is fetched and cached). Subsequent runs work offline for ~7 days before refresh, or indefinitely with `--offline`.

## Related commands

- `/grc-engineer:pipeline-status` — which connectors are configured, last-run, cache freshness
- `/grc-engineer:map-controls-unified` — one control across every framework
- `/grc-engineer:optimize-multi-framework` — "implement once, satisfy many" ROI analysis
- `/grc-engineer:generate-implementation` — produce remediation code for a control
- `/grc-engineer:monitor-continuous` — schedule recurring gap assessments with alerting
