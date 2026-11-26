---
name: compliance-tracker
description: Tracks compliance status per framework from connector Findings, an obligation register, policy and exception records, and metric history. Reports failing, excepted, stale, inconclusive, and passing controls, and due dates for audits, renewals, filings, and recurring control activities. Used by /grc-internal:track-compliance.
allowed-tools: Read, Write, Glob, Grep
---

# Compliance Tracker

Answers three questions for an internal GRC team: which controls are failing right now, which evidence is too old to rely on, and what is due soon. It works from files already in the toolkit's conventions rather than from a separate database.

## Sources and how to read them

1. **Findings**: `~/.cache/claude-grc/findings/<source>/*.json`, written by connector plugins and validated by `schemas/finding.schema.json`. Each document has `collected_at`, a `resource`, and `evaluations[]` with `control_framework`, `control_id`, `status`, and `severity`. Use the newest run per source per resource; older runs are history.
2. **Obligations**: `./grc-data/obligations.yaml`, a user-maintained list of dated commitments (audit windows, certificate renewals, regulatory filings, recurring control activities). See `/grc-internal:track-compliance` for the format.
3. **Policies**: `./grc-data/policies/*.json`. A policy is overdue when `next_review_at` has passed.
4. **Exceptions**: `./grc-data/exceptions/*.json`. Only `status: approved` with `expires_at` in the future covers a failing control.
5. **Metrics**: `./grc-data/metrics/*.json`. Earlier snapshots for trend lines.
6. **Risks**: `./grc-data/risks/*.json`. Link failing controls to the risks that cite them.

If a source is missing, say so in the report. Absence of Findings is not evidence of compliance.

## State model

A control is in exactly one state, checked in this order:

| State | Condition |
|---|---|
| Failing | A current evaluation is `fail` and no approved, unexpired exception covers it |
| Excepted | Failing, but covered by an approved exception |
| Inconclusive | Newest evaluations are `inconclusive` |
| Stale | Newest evidence is older than the control's freshness window |
| Passing | Fresh evidence; all evaluations `pass` or `not_applicable` |
| No evidence | Referenced by an obligation or framework scope, but nothing collected |

Freshness windows: 7 days for connector Findings; for manual evidence, the control's cadence plus a short grace period (monthly 45 days, quarterly 100 days, annual 13 months).

## Due dates

- `audit`, `certification`, `filing`, `contract`: the `due` date.
- `recurring-control`: `last_done + every_days`. Missing `last_done` means the activity has no recorded run; report it as overdue.
- Exceptions: `expires_at`. Policies: `next_review_at`. Risk acceptances: `metadata.acceptance.expires_at`.

Group by "overdue", "due within the window", and "later". Show the owner for each line.

## Reporting rules

- Lead with failing controls and overdue items, not a score.
- Give counts per state. A single compliance percentage is available on request; when given, state the denominator and the number of controls with no evidence.
- Cite every failing control to its source and run (`<source>:<run_id>`) and the evaluation message.
- Do not mark anything compliant on the strength of an obligation alone; obligations say what is due, not what was done, unless `last_done` or `evidence` shows it.
- List data quality problems: invalid Findings files, stale sources, connectors that have never run.

## Framework references

- ISO/IEC 27001:2022 clause 9.1 (monitoring, measurement, analysis, and evaluation), clause 9.3 (management review inputs), A.5.36 (compliance with policies, rules, and standards)
- SOC 2 CC4.1 (ongoing and separate evaluations) and CC4.2 (communicating deficiencies)
- NIST CSF 2.0 GV.OV (oversight) and ID.IM (improvement)
