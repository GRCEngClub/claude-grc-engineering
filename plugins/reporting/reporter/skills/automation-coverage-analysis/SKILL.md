---
name: automation-coverage-analysis
description: Composes week-over-week automation coverage narratives. Use when /report:automation-coverage is running. Frames the delta for leadership around time saved, quality of evidence, and forward-looking compounding value.
allowed-tools: Read, Glob, Grep, Bash
---

# Automation Coverage Analysis

Week-over-week automation is the most under-sold thing GRC engineers do. A control moved from manual to automated is an hour given back to the team, a better evidence trail, and a compounding asset the next audit leverages without anyone thinking about it.

The analysis has to land the story, not the raw number.

Do not infer automation coverage from Finding remediation metadata alone. If the
program did not record explicit automation metrics or curated notes, say the
delta is unknown rather than inventing one.

## The three anchors

Every automation-coverage report is built on three pieces. Pick the one that matters most for this period's audience and lead with it.

### 1. Time saved from humans

This is the headline most weeks.

Every automated control is hours back to a GRC analyst, security engineer, or auditor. Do not present automation as a technical metric. Present it as labor cost.

"We automated evidence collection for 12 controls this week" is the setup.
"That's roughly 40 hours per audit cycle returned to the team, 160 hours per year" is the point.

Honest ranges beat fake precision. If the manual version took "between 2 and 4 hours per cycle," say that. Do not round up to make the number bigger.

### 2. Quality of evidence

This anchor matters most when the audience is an auditor, a regulator, or a security-posture-minded exec.

An automated control tested every hour is not the same as a manual control tested quarterly. Say that out loud.

"Before: we sampled 25 repositories annually. Now: every repository, every hour, every push."

That's a security posture change, not a tooling change. Frame it as one. This is where you earn engineering credit from security leadership, not just GRC leadership.

### 3. Forward-looking compounding value

This anchor is where you graduate from "did the work" to "shape the program."

Automation done is table stakes. The story is what it enables.

- "This automation means the next SOC 2 audit is half the effort of the last one."
- "This means we can onboard a new framework in 2 weeks instead of 12."
- "This gives us continuous FedRAMP evidence, which means we stop batching evidence collection the week before the annual assessment."

The value of automation compounds. The narrative should show the compound. If you only report what got done, you're reporting tasks. If you report what it unlocks, you're reporting strategy.

## Structure of a good automation-coverage report

Lead with one of the three anchors. Do not lead with the table. The table is proof, not message.

1. **Headline**: time saved, quality lifted, or future impact. One line.
2. **The table**: per-framework coverage, previous period, delta. Proof for the headline.
3. **What moved**: name the controls automated only when the source data or operator notes explicitly identify them. Take-credit-by-name matters for retention, but invented names are worse than anonymous wins.
4. **What it unlocks**: 1-3 bullets on downstream effects. This is where you pull on the compounding thread.
5. **Next targets**: top 3-5 manually evidenced controls by cost. Not a full backlog. Just the priorities.

## Anti-patterns

- **Reporting raw numbers without context.** "5 controls automated" tells the reader nothing. "5 controls automated, saving 20 hours per cycle, closing a cross-framework gap in 3 baselines" tells them what happened.
- **Taking credit without naming people.** Promotions happen when leadership sees specific engineers shipping specific wins. Anonymous program updates hide your team from their own leadership. Name the engineer.
- **Stopping at 'done.'** A report that ends at "done this week" leaves the strategic thread on the floor. Always close with "what this enables next."
- **Performative ROI math.** If the time savings are modest, say so. A modest win is still a win. Fake dollar figures cost credibility for the next six months.
- **Regressions swept under the rug.** If a control moved automated → manual this week, name it, name the cause, name the fix plan. Silent regressions read as either sloppy reporting or hidden problems. Both are worse than the regression itself.

## When to skip this report

Do not run this analysis in weeks where the pipeline only has one metric snapshot. The delta isn't real. Use `context-bootstrap` to explain why and schedule the next snapshot period instead.

Do not fabricate a week-over-week comparison to fill the slot. A missing report is better than a hollow one.

## Picking the anchor for this week's audience

- CISO or CIO weekly: time-saved anchor
- Board or audit committee: forward-looking-value anchor
- Audit planning meeting or pre-audit kickoff: quality-of-evidence anchor
- Engineering leadership: any of the three, but name the engineer and show the compounding

If the audience isn't clear, default to time-saved. It's the most universally legible.
