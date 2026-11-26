---
description: Weekly 1-page executive summary for the CISO and direct leadership
allowed-tools: Read, Glob, Grep, Write, Bash
---

# Exec Summary

Draft a weekly 1-page update for the CISO or direct leadership. Every section is bulleted and scannable. An exec should get the full picture in 60 seconds. Lead with wins and business impact, not control IDs.

## Arguments

- Argument 1 - Period (optional, defaults to current week, e.g. `2026-W16`)
- Argument 2 - Audience (optional: `ciso`, `cio`, `ceo-weekly`, defaults to `ciso`)

## Instructions

### 1. Context check

Before drafting, verify the toolkit has what it needs. Invoke the `context-bootstrap` skill. Look for:

- Findings cache populated: `ls ~/.cache/claude-grc/findings/*/` returns recent runs
- At least one framework plugin installed
- Optional but recommended: `./grc-data/risks/` and `./grc-data/metrics/` following `docs/GRC-DATA.md`

If context is empty or partial, follow the `context-bootstrap` skill's setup path. Do not generate a hollow report.

### 2. Auto-discover

When context is complete, load without asking:

- Most recent findings run per source
- Risk register deltas from the last 7 days (new risks, closed risks, severity changes)
- Open incidents from `./grc-data/incidents/` if the directory exists

### 3. Ask for narrative context

Ask the user for what Claude cannot infer:

- Wins this week - automations shipped, controls closed, audits passed, programs launched. This is where GRC engineers show their work. If the user says "nothing" push once: closing even one finding is a win worth naming.
- Material events this week (incidents, new regulatory hits, customer escalations) - paste bullets or say "none"
- Leadership asks - decisions you need from the audience, budget requests, or "none"
- Audience-specific framing - if argument 2 is `ceo-weekly`, confirm whether to include board-facing language

Skip questions the args already answered.

### 4. Generate

Apply the `so-what-translation` skill to translate findings into business impact. Apply `exec-narrative-patterns` for audience tone.

Every section is bulleted. No paragraphs. No hedging. Each bullet is one line, scannable at a glance.

Structure:

```markdown
# Weekly Brief - <period>

Audience: <audience>

## Headline

- <One line. What changed this week that leadership should know.>

## Wins

- <Automation shipped, control closed, audit passed. Who drove it. Business impact.>
- <...>

## What Moved

- <Business-impact framing of top changes. Control IDs in the appendix, not here.>
- <...>

## Blockers

- <Open issues that need a decision, budget, or access. Named owner, specific ask.>
- <...>

## Asks

- <Specific decision requested. Context in one line. Deadline.>
- <...>

## Appendix

- Findings run: `<run_id>`
- Frameworks covered: `<list>`
- Full gap report: `<path>`
```

### 5. Save and offer next

Write to `./grc-reports/exec-summary-<period>.md`. Confirm path. Offer:

- PDF render via `pandoc` if installed
- Pass to `/report:board-brief` if this week's content feeds a quarterly draft
- Commit to `grc-data/history/` for trend analysis

## Examples

```bash
# Current week, default audience
/report:exec-summary

# Specific week
/report:exec-summary 2026-W16

# Write for CEO weekly review
/report:exec-summary 2026-W16 ceo-weekly
```
