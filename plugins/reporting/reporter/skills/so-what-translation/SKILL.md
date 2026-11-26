---
name: so-what-translation
description: Translates GRC findings, risks, and program activity into language leadership actually reads. Use when any /report:* command is composing output intended for a CISO, CIO, or above. Opinionated rules on what lands and what doesn't.
allowed-tools: Read
---

# So-What Translation

Every GRC person needs this skill and most don't have it. The controls are not the point. The frameworks are not the point. The deliverable is not the point. The point is the decision you want the reader to make.

These are the rules for translating the work into something a CISO or above will read, trust, and act on.

## The 6 rules for talking with a CISO

### 1. They care about money

Not selfishly. Because their bosses care about money. The CFO, the CEO, the board. Every finding needs a dollar or time translation.

"We have a control deficiency in CC6.1" is invisible to a CISO.
"This blocks a $2M SOC 2 deal closing in Q2" is not.

If you cannot translate a finding into dollars saved, dollars at risk, deals unblocked, or time returned to the team, you have not finished the work. Do that step before you walk into the room.

### 2. They don't care about GRC. They care about outcomes

More secure. More deals. Fewer surprises. Faster audits. Cleaner board meetings.

GRC is the plumbing. Nobody talks about plumbing at dinner. Talk about what's running through it: revenue, trust, speed, sleep. The controls and frameworks are how you get there. They are never the thing.

If your weekly update reads like a control checklist, you've written it wrong.

### 3. Excuses don't matter

What went wrong, and what are we doing about it.

"The connector failed this week" is not an update.
"The connector failed Tuesday, we caught it by Thursday, here's the fix going in tomorrow, and here's what we're building so it can't happen again" is an update.

Every problem you name needs a response attached. If the response isn't ready, say "response in 48 hours, here's who owns it." Never leave a problem floating without an owner and a timeline.

### 4. Find out what they specifically care about

Every CISO has a personal scorecard. Budget defense. Security metrics the board sees. Making the CEO confident. Clean audits. Low-noise SOC. Getting promoted. Not getting fired.

You cannot communicate up effectively without knowing which of those scorecards you are moving this week. The only way to find out is to ask. In a 1:1. Directly.

"What do you want me making you look good on this quarter?" is a legitimate question from a GRC engineer to a CISO. Ask it.

### 5. Understand reporting lines

A CISO reporting to a CIO tells a different story than one reporting to a CEO.

- CISO → CIO: budget defense, uptime, engineering velocity
- CISO → CFO: cost of controls, audit spend, insurance posture
- CISO → CEO: customer trust, regulatory exposure, board narrative
- CISO → General Counsel: legal risk, regulatory posture, incident liability

Same finding, different framing, depending on whose ear you're actually reaching through the CISO.

### 6. Take initiative

Don't wait to be asked.

Bring the weekly update before it's requested. Bring the risk the board hasn't noticed yet. Bring the proposal for the automation project that didn't have a sponsor. Bring the framework expansion the company will need in 18 months.

The GRC engineers who rise are not the ones who execute the plan. They're the ones who name the next plan.

## Patterns that land

- "X open high-sev findings. Y block the audit. Plan attached."
- "Automation shipped this week gives us 40 hours back per audit cycle."
- "This finding maps across SOC 2 and FedRAMP. One fix, two closures. Owner: `name`. ETA: `date`."
- "Residual risk moved from Medium to Low this quarter. Driver: `specific control automation`."

## Patterns that don't

- "We are 82% compliant." (Compliant with what? Measured how? Compared to when?)
- "Ongoing monitoring continues." (This tells the reader nothing.)
- Long paragraphs explaining framework history.
- Control IDs in the body with no business translation.
- Passive voice. "It was decided that..." Somebody decided. Name them.
- Hedging. "We may want to consider..." If you're recommending it, recommend it.

## Before publishing any exec-facing doc

Run this check on every section:

1. Can a reader get the point in the first sentence?
2. Is every open item owned by a named person with a date?
3. Is every number defendable if questioned?
4. Would the reader know what decision you want them to make?

If any answer is no, rewrite that section.
