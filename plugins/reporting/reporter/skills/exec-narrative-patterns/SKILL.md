---
name: exec-narrative-patterns
description: Audience-specific tone and format guidance for leadership communications. Use when drafting any /report:* output to tune length, framing, and technical depth to the reader (board, audit committee, CEO, weekly CISO, regulator).
allowed-tools: Read
---

# Exec Narrative Patterns

Different readers want different things. The same findings should not land the same way in a board deck, a CISO 1:1, and a regulator response.

## Audience quick reference

| Audience | Length budget | Opening line wants | Technical depth | What they skip |
| --- | --- | --- | --- | --- |
| Full board | 1 page max | Strategic posture one-liner | Low. No control IDs in body. | Operational detail, acronyms, tables with >5 rows |
| Audit committee | 2 pages | Risk-and-assurance posture | Medium. Control families OK, not IDs. | Strategy monologue, vendor names unless load-bearing |
| Risk committee | 2 pages | Residual risk movement | Medium-high. Framework names, risk scoring. | Program branding, tool selection detail |
| CEO weekly | Half page | What changed, what's blocking, what's asked | Low. Translate everything. | Framework politics, tool comparisons |
| CISO weekly | 1 page | What moved, what's blocked, what's next | High. Control IDs, tool names, owner names fine. | Over-explained context |
| Regulator / auditor | As long as needed | Precise scope + evidence | Maximum. IDs, artifact paths, timestamps. | Narrative softening |

## Tone rules

**Board and audit committee**

- Past tense for what happened. Present tense for posture. Future tense only for asks.
- Numbers must be honest. Round where range matters more than precision. "Roughly 80%" beats "82.3%" if the instrument is noisy.
- Never start with control IDs. Start with impact.
- Name one person accountable per open item. Anonymous ownership reads as no ownership.

**CEO weekly**

- Assume 90 seconds of attention.
- Lead with the delta from last week. If nothing changed, say that.
- Asks come with the decision you want, not the full context. Attach the context.

**CISO weekly**

- Peer tone. You share context with the reader.
- Bullets, not paragraphs.
- Owner names and dates are load-bearing.

**Regulator / auditor**

- Precision. Timestamps, scope statements, evidence paths.
- Tone is neutral, not defensive. The facts do the work.

## Format conventions

- Headline row: one sentence, no hedging. If the week was quiet, the headline says so.
- Tables beat prose for multi-framework status. Prose beats tables for narrative arcs.
- Appendix is where detail lives. Body stays clean.
- Dates are `YYYY-MM-DD`. Periods are `YYYY-Q#` or `YYYY-W##`.

## Length tests

If you cannot defend every sentence as "the audience needed this to make a decision," cut it.

If the document opens with context before the point, invert it.

If there are three open items and no ask, you are reporting, not communicating. Add the ask.
