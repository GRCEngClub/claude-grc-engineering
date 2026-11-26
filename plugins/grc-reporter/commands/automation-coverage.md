---
description: Week-over-week automation coverage analysis with ROI narrative
allowed-tools: Read, Glob, Grep, Write, Bash
---

# Automation Coverage

Report how much of your control portfolio is covered by automated evidence this week, how that compares to last week, and what the trend says about the GRC engineering work.

This is where GRC engineers prove their worth. Manual evidence is expensive and doesn't scale. Shifting a control from manual to automated is the engineering work that compounds. This command surfaces that work so leadership sees it.

## Arguments

- Argument 1 - Period (optional, defaults to current week, e.g. `2026-W16`)
- Argument 2 - Frameworks (optional, comma-separated framework aliases accepted by `/grc-engineer:gap-assessment`; defaults to all with current runs)

## Instructions

### 1. Context check

Invoke `context-bootstrap`. Week-over-week analysis requires history:

- At least 2 automation metric snapshots, at least 7 days apart, in `./grc-data/metrics/`
- Metric rows that make the delta explicit, typically `automation.coverage_pct` and `automation.controls_automated`
- Framework metadata available in plugin.json files (for total control counts)
- Findings runs in scope as supporting evidence, not as the primary source of automation coverage truth

If history is thin (0 or 1 runs, or runs clustered in the last few days), this command's empty-context path is the one users will hit. Do not fabricate a delta. Walk the user through:

- Getting their first baseline into `./grc-data/metrics/` if they have none, usually with `/grc-engineer:record-automation-metrics`
- Scheduling regular collection if they have one (`/grc-engineer:monitor-continuous`)
- Setting a reminder to rerun this command once they have 2+ weeks of history

### 2. Auto-discover

- Current-period metric rows for `automation.coverage_pct` and `automation.controls_automated`
- Previous-period metric rows (closest to 7 days prior)
- Total controls in scope per framework (from framework metadata)
- Supporting findings runs per source for examples and appendix references
- Regressions only when the source data or the operator's notes explicitly record them

Prefer operator-observed metric rows. Capability baselines derived from toolkit
config are useful for setup and planning, but should not be presented as proof
that a given environment already automated those controls.

### 3. Ask for narrative context

- GRC engineering initiatives landing this period (helps attribute the delta to real work)
- Any scope changes (new framework added, controls de-scoped) that affect the denominator
- Audience - is this for CISO 1:1 (internal framing) or for a broader leadership update (more context needed)

### 4. Generate

Apply `automation-coverage-analysis` for the delta analysis and ROI framing. Apply `so-what-translation` for business-impact translation.

Do not infer manual → automated state from `evaluations[].remediation.automation` in Findings. That field describes remediation effort, not evidence-collection coverage.

Structure:

```markdown
# Automation Coverage - <period>

## Headline
<One sentence. Coverage moved from X% to Y%. Z new controls automated this week.>

## Coverage Snapshot
| Framework | Total controls | Automated this period | Previous period | Delta |
|---|---|---|---|---|
| <fw> | <n> | <n (%)> | <n (%)> | <+/- n (+/- pp)> |

## What Moved This Period
### Gains
- <Metric-supported gain, and named controls only when the source data or operator notes explicitly identify them>

### Regressions (if any)
- <Only include when the source data explicitly records the regression and the cause>

## ROI Framing
<If prior-period manual evidence took X hours per cycle and the automated version is effectively free, this is the compounded saving. Avoid fake precision. Use honest ranges.>

## Next Targets
<Top 5 manually-evidenced controls by cost (frequency x hours) when the program tracks them. Otherwise, list next automation themes rather than pretending you have control-level precision.>

## Appendix
Current-period run: <run_id>
Previous-period run: <run_id>
Period delta: <days>
```

### 5. Save and offer next

Write to `./grc-reports/automation-coverage-<period>.md`. Offer:

- Commit the source metric rows to `grc-data/metrics/` for longitudinal tracking
- Use `/grc-engineer:record-automation-metrics` to add the current-period snapshot if the week is missing
- Pass to `/report:board-brief` as a program-initiative input for the quarterly brief
- Open an issue on the Next Targets list if the user wants to queue them as engineering work

## Examples

```bash
# Current week, all frameworks
/report:automation-coverage

# Specific week
/report:automation-coverage 2026-W16

# SOC 2 and FedRAMP only
/report:automation-coverage 2026-W16 soc2,fedramp-moderate
```
