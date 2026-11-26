---
description: Track compliance obligations, evidence freshness, and control status across frameworks from Findings and grc-data records
---

# Track Compliance

Builds a compliance status view from what the repo already holds: connector Findings, the obligation register, policy and exception records, and metric history. The question it answers is "what is due, what is stale, and what is failing", per framework. It reads and reports; it changes files only in the obligation register, and only when asked.

## Arguments

Parse `$ARGUMENTS` as `[framework|all] [format] [flags]`.

- Framework (optional, default `all`): a framework key as used elsewhere in the toolkit, such as `soc2`, `iso27001`, `pci-dss`, `nist-800-53`, `hipaa`, `dora`, or `all`.
- Format (optional, default `summary`): `summary`, `detailed`, or `calendar`.
- `--obligations=<file>`: obligation register. Default `./grc-data/obligations.yaml`.
- `--as-of=<YYYY-MM-DD>`: evaluate due dates and freshness as of this date. Default today. Only Findings with `collected_at` on or before this date count; later evidence did not exist yet.
- `--window=<days>`: how far ahead counts as "due soon". Default 60.
- `--record-metrics`: also write metric rows to `./grc-data/metrics/` (see Output).
- `--init`: create a starter obligation register for the chosen framework, then stop.

Reject unknown formats and flags with a usage message.

## Inputs it reads

| Source | Path | Used for |
|---|---|---|
| Connector Findings | `~/.cache/claude-grc/findings/<source>/*.json` (`schemas/finding.schema.json`) | Control pass and fail counts; evidence age from `collected_at`. A file holds one Finding or an array of them |
| Obligation register | `./grc-data/obligations.yaml` | Due dates for audits, renewals, filings, and recurring control activities |
| Policies | `./grc-data/policies/*.json` or `*.yaml` (`schemas/policy.schema.json`) | Overdue policy reviews |
| Exceptions | `./grc-data/exceptions/*.json` or `*.yaml` (`schemas/exception.schema.json`) | Approved exceptions and their expiry |
| Metrics | `./grc-data/metrics/*.json` or `*.yaml` (`schemas/metric.schema.json`) | Trend lines from earlier runs |
| Risks | `./grc-data/risks/*.json` or `*.yaml` | Open risks linked to failing controls |

`docs/GRC-DATA.md` allows YAML for these user-owned records as long as it parses to the same shape as the JSON schema; read both.

Match Findings to the requested framework by each evaluation's `control_framework` (for example `SOC2-TSC-2017` for `soc2`, `ISO-27001-2022` for `iso27001`, `PCI-DSS-4.0` for `pci-dss`). Evaluations recorded against SCF or another framework need the crosswalk. Use `/grc-engineer:gap-assessment <framework>` only for the control mapping, not for state: its `findings.normalized.json` merges every cached run, so an old failure stays a failure after a newer pass, and it drops `collected_at` and run IDs. Take state and freshness from the newest raw Finding for each resource and control (latest `collected_at` on or before `--as-of` wins), and cite that Finding's source and run.

Each source is optional. Name every source that was missing or empty in the report rather than treating silence as compliance. Some connectors (for example `okta-inspector` and `slack-inspector`) save a run as a JSON array. Unwrap arrays and validate each Finding on its own, as `gap-assessment` does; skip only the Findings that fail `schemas/finding.schema.json`, and list them, with file and index, under "Data quality".

## Obligation register

Obligations are dated commitments that no connector can see: audit windows, certificate renewals, regulatory filings, and recurring control activities. One YAML file, reviewed in Git:

```yaml
obligations:
  - id: OBL-001
    title: SOC 2 Type II observation period ends
    framework: soc2
    type: audit            # audit | certification | filing | recurring-control | contract
    due: 2027-03-31
    owner: GRC
    evidence: []           # paths or Findings references that close it
  - id: OBL-002
    title: Quarterly user access review
    framework: soc2
    type: recurring-control
    control_refs: [CC6.2, CC6.3]
    every_days: 90
    last_done: 2026-09-15
    owner: IT Operations
  - id: OBL-003
    title: DORA register of information submission
    framework: dora
    type: filing
    due: 2027-03-20        # confirm against your competent authority's notice
    owner: Vendor Management
```

For `recurring-control` entries, the next due date is `last_done + every_days`. `--init` writes a starter file with the usual items for the chosen framework, with every date left blank for the user to fill in. It never guesses audit dates.

## Evidence freshness

This is the one freshness rule; `compliance-tracker` uses the same values. Evidence is stale when it is older than its window, measured back from `--as-of`:

| Evidence | Fresh if collected within |
|---|---|
| Connector Findings (automated) | 7 days, whatever the control's cadence |
| Manual or obligation evidence, daily or weekly cadence | 30 days |
| Manual or obligation evidence, monthly | 45 days |
| Manual or obligation evidence, quarterly | 100 days |
| Manual or obligation evidence, annual | 13 months |

For manual and obligation evidence, the cadence comes from the obligation's `every_days`. A connector re-runs on a schedule, so a Finding older than 7 days means the connector stopped running, even for a quarterly control.

## Status rules

For each control referenced by Findings or obligations:

A control is in exactly one state, checked in this order:

1. **Stale**: the newest evidence is older than its freshness window. A stale `fail` is Stale, not Failing: the report cannot say whether it still fails.
2. **Failing**: a fresh evaluation has `status: fail` and no approved, unexpired exception covers it.
3. **Excepted**: a fresh `fail` covered by an approved, unexpired exception. Show the expiry.
4. **Inconclusive**: the newest fresh evaluations are `inconclusive`. Usually a permissions problem; re-run the connector.
5. **Skipped**: the newest fresh evaluations are `skipped`, so the control was not evaluated. Not passing. `vdr-automation` emits `skipped` for accepted vulnerabilities; link those to their exception record where one exists, and report a skipped evaluation with no exception as needing one.
6. **Passing**: fresh evidence, and every evaluation is `pass` or `not_applicable`.
7. **No evidence**: referenced by an obligation or the framework scope, but nothing collected.

Framework status is a count of controls in each state. Do not roll it up into one compliance percentage unless the user asks; a percentage hides which controls matter. If they ask, compute it as passing ÷ (all controls with evidence), and say how many controls had no evidence at all.

## Output

Written to `~/.cache/claude-grc/reports/grc-internal/compliance-<framework>-<YYYY-MM-DD>/`:

- `status.md`: the report
- `controls.csv`: control, framework, state, newest evidence date, source, exception ID, linked risk
- `calendar.md` (format `calendar`): obligations by due date over the window

With `--record-metrics`, write one metric object per file, because `schemas/metric.schema.json` validates a single object per document. Name each file `<UTC timestamp>-<framework>-<metric_id>.json` under `./grc-data/metrics/`, as `/grc-engineer:record-automation-metrics` does. Use the metric IDs from `docs/GRC-DATA.md` where they fit (`findings.open_critical`, `findings.open_high`, `policy.review_overdue`) and set `dimensions.framework` to the framework.

`summary` example:

```markdown
# Compliance status: SOC 2 — as of 2026-11-26

| State | Controls |
|---|---|
| Passing | 41 |
| Failing | 3 |
| Excepted | 1 (expires 2027-01-31) |
| Stale | 6 |
| Inconclusive | 2 |
| Skipped | 1 |
| No evidence | 11 |

## Due in the next 60 days
- 2026-12-14 · OBL-002 Quarterly user access review (IT Operations): last done 2026-09-15
- 2027-01-10 · POL-004 Acceptable Use Policy annual review: overdue in 45 days

## Failing
- CC6.1 · github-inspector: 2 repositories allow force-push to the default branch (run 20261125-…)
- CC7.2 · aws-inspector: CloudTrail not multi-region in account 1234… (run 20261124-…)

## Data quality
- okta-inspector: newest run is 19 days old (stale)
- No Findings from any endpoint or HR connector; CC6.2 and CC6.3 rely on obligations only
```

## Framework mapping

| Requirement | What this command supports |
|---|---|
| ISO/IEC 27001:2022 clause 9.1 | Monitoring and measuring what needs to be measured, and when |
| ISO/IEC 27001:2022 clause 9.3 | Input to management review: status of actions, nonconformities, monitoring results |
| ISO/IEC 27001:2022 A.5.36 | Compliance with policies, rules, and standards |
| SOC 2 CC4.1 and CC4.2 | Ongoing evaluations, and deficiencies communicated to those responsible |
| NIST CSF 2.0 GV.OV | Oversight of risk management strategy outcomes |
| NIST CSF 2.0 ID.IM | Improvements identified from evaluations |

## Examples

```bash
/grc-internal:track-compliance soc2 summary
/grc-internal:track-compliance all calendar --window=90
/grc-internal:track-compliance iso27001 detailed --record-metrics
/grc-internal:track-compliance dora --init
```
