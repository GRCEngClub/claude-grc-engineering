---
description: Portfolio view across every framework in scope, sized for CISO 1:1s and program reviews
allowed-tools: Read, Glob, Grep, Write, Bash
---

# Program Health

Draft a portfolio snapshot of the whole GRC program. Built for CISO 1:1s and program reviews, not for audit evidence.

## Arguments

- Argument 1 - As-of date (optional, defaults to today, e.g. `2026-04-18`)
- Argument 2 - Frameworks (optional, comma-separated framework aliases accepted by `/grc-engineer:gap-assessment`; defaults to all frameworks with recent runs)

## Instructions

### 1. Context check

Invoke `context-bootstrap`. Program-health needs:

- At least two framework plugins installed
- At least one successful gap-assessment run per framework in scope
- Optional: `./grc-data/metrics/` for trend data

Without at least two frameworks, this command has no portfolio to report on. Suggest `/grc-engineer:frameworks` to discover what's available and install a second framework before proceeding.

### 2. Auto-discover

- All framework plugins installed
- Most recent gap-assessment coverage per framework
- Trend: 30-day, 90-day coverage deltas if history allows
- Shared controls across frameworks (SCF crosswalk helps here)

### 3. Ask for narrative context

- Framework priority order - which frameworks the CISO cares about most this period
- Any frameworks to exclude from the view (scoping changes, deprecations)
- Known initiatives not yet reflected in findings (e.g., automation project landing next week)

### 4. Generate

Apply `program-portfolio-composition` for cross-framework synthesis. Apply `so-what-translation` for the commentary column.

Structure:

```markdown
# Program Health - <as-of>

## Portfolio Snapshot
| Framework | Coverage | 30-day trend | Top gap | Owner |
|---|---|---|---|---|
| <framework> | <%> | <+/- pp> | <1-line gap> | <name or team> |

## Cross-Framework Patterns
<Controls that fail in multiple frameworks get called out here. SCF crosswalk shows the leverage points where one fix unblocks many.>

## Program Momentum
<What got better this period. What got worse. What's static and shouldn't be.>

## Watch List
<Frameworks or controls at risk of slipping without intervention.>

## Appendix
Per-framework full reports: <paths>
SCF crosswalk run: <run_id>
```

### 5. Save and offer next

Write to `./grc-reports/program-health-<as-of>.md`. Offer:

- Pass to `/report:exec-summary` for a weekly cut
- Pass to `/report:board-brief` for a quarterly roll-up
- PDF render via `pandoc`

## Examples

```bash
# Today, all frameworks with runs
/report:program-health

# Specific date, specific frameworks
/report:program-health 2026-04-18 soc2,fedramp-moderate,iso27001
```
