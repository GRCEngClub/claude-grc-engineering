---
description: Quarterly audit-committee or board-ready narrative from findings, incidents, and residual risk
allowed-tools: Read, Glob, Grep, Write, Bash
---

# Board Brief

Draft a quarterly board or audit-committee brief. This is a real board brief, not a bulleted slide outline. It uses prose where narrative carries meaning and tables where structure carries meaning. Every section is concise. Length budget: 2 pages for audit committee, 1 page for full board. Business impact first, control text last.

## Arguments

- Argument 1 - Quarter (optional, defaults to current quarter, e.g. `2026-Q1`)
- Argument 2 - Audience (optional: `board`, `audit-committee`, `risk-committee`, defaults to `audit-committee`)

## Instructions

### 1. Context check

Invoke `context-bootstrap`. For a meaningful quarterly brief, check:

- Findings cache has runs across the full quarter, not just the last week
- Risk register at `./grc-data/risks/` with residual risk values, following `docs/GRC-DATA.md`
- Incident history in `./grc-data/incidents/` (if tracked)
- Framework coverage in scope - a board brief needs to name the frameworks the committee oversees

Partial context is acceptable here if the user confirms. A quarterly brief with limited data is a real artifact - just name the gaps.

### 2. Auto-discover

- All findings runs within the quarter window
- Residual risk totals, top 5 risks by score
- Incidents logged in the quarter
- Compliance trend: start-of-quarter coverage vs end-of-quarter coverage per framework

### 3. Ask for narrative context

- Material events this quarter (incidents, audits, framework renewals, regulatory changes)
- Decisions requested from the committee with the level of detail they want (one-line asks or full papers)
- Strategic initiatives the CISO wants the committee to see (automation programs, org changes, budget)
- Audience-specific framing - audit committee wants risk-and-assurance; full board wants strategy

### 4. Generate

Apply `so-what-translation` + `exec-narrative-patterns` + `program-portfolio-composition` for cross-framework synthesis.

Concision rules:

- No paragraph longer than 3 sentences.
- Tables for multi-framework posture and risk tracking. Prose for narrative sections (material events, initiatives).
- Every open item has a named owner and a date. Anonymous ownership reads as no ownership.
- Cut every sentence that doesn't move a decision.

Structure:

```markdown
# <Audience> Brief - <Quarter>

## Headline

<One sentence. The most important thing the committee needs to walk away with.>

## Program Posture

<Short table: framework, coverage %, delta from last quarter, 1-line commentary.>

## Material Events

<Prose. 1-3 short paragraphs. Incidents, audits, regulatory changes, with business impact. No blow-by-blow.>

## Residual Risk

<Short table: top 5 risks, trend vs last quarter, treatment status, owner, expected close.>

## Program Initiatives

<Prose. 2-4 short paragraphs. Automation programs, org changes, tooling. What the CISO wants the committee to know and why it matters.>

## Asks

<Bulleted. Each ask: the decision, the context in one line, the deadline, the owner ready to execute.>

## Appendix

<Findings run IDs, gap reports, incident postmortems. Linked, not inlined.>
```

### 5. Save and offer next

Write to `./grc-reports/board-brief-<quarter>-<audience>.md`. Offer:

- PDF or DOCX via `pandoc` (most boards want a PDF)
- Tighten into a 1-page board summary with a follow-on editing pass if the committee wants a shorter cut
- Commit to `grc-data/history/quarters/` for trend reference

## Examples

```bash
# Current quarter, audit committee
/report:board-brief

# Specific quarter, full board
/report:board-brief 2026-Q1 board

# Risk committee version
/report:board-brief 2026-Q1 risk-committee
```
