# Phase 1: Idea Development

Goal: transform a raw idea into a concrete, defensible research question with a plausible contribution — or consciously park it.

## Step 1 — Capture the idea raw

Let the user state the idea in their own words first. Then reflect it back in one sentence and confirm. Don't polish yet.

## Step 2 — Locate it: topic → problem → question

Most raw ideas are **topics** ("AI governance in state government"). Research needs a **question**. Walk the ladder:

- **Topic**: the territory. Too broad to research.
- **Problem**: something unresolved, contested, or poorly understood within the topic. ("State agencies are adopting AI faster than governance frameworks mature — nobody knows which controls actually get implemented.")
- **Research question**: a specific, answerable question about the problem. ("Which NIST AI RMF functions do U.S. state agencies operationalize first, and what predicts the sequence?")

Ask questions to move down the ladder: *What specifically is unknown here? Who disagrees about what? What would you be able to say at the end that nobody can credibly say now?*

## Step 3 — Stress-test with FINER

Score the candidate question honestly on each:

- **F — Feasible**: Can one person, no institution, part-time, actually answer this? What data would it take, and is that data accessible? (See feasibility patterns below.)
- **I — Interesting**: To whom, specifically? Name the audience: practitioners, policymakers, an academic subfield.
- **N — Novel**: What's the closest existing work, and what does this add? (Provisional at this stage — Phase 2 confirms or kills novelty.)
- **E — Ethical**: Does it involve human subjects, sensitive data, or dual-use findings? Human-subjects designs need IRB review the user can't self-provide — flag early (details in `methodology.md`).
- **R — Relevant**: Does answering it change anything — a decision, a practice, a theory?

A question failing F or E needs redesign now, not later.

## Step 4 — Name the contribution type

Pin down what kind of contribution this is; it determines the method and venue later:

| Type | What it does | Independent-researcher fit |
|---|---|---|
| Empirical | New data or new analysis of data | Good if data is public/collectable |
| Theoretical/conceptual | New framework, taxonomy, or argument | Excellent — no data infrastructure needed |
| Methodological | New way to measure or study something | Good, often paired with a demo |
| Synthesis | Systematic/scoping review of existing literature | Excellent — rigorous and institution-free |
| Replication/validation | Test whether prior findings hold | Good if original materials are open |
| Artifact/design science | Build a tool/process and evaluate it | Excellent fit for an engineer — build + evaluate rigorously |

## Step 5 — Scope to a first study

One idea usually contains a research *program*. Carve out the smallest study that stands alone: one question, one method, one contribution. Record the spillover as **follow-up ideas** in the tracker — this is where the user's abundance of ideas becomes an asset instead of scope creep.

A useful test: can the user state the study as "*I will [method] [data/subject] to answer [question], which matters because [relevance]*" in one breath?

## Feasibility patterns for independent researchers

Designs that work well without institutional backing:
- Analysis of public datasets (government data, breach databases, regulatory filings, legislative trackers)
- Document/content analysis (policies, RFPs, audit reports, published incident postmortems)
- Systematic or scoping literature reviews
- Framework development grounded in literature + illustrative cases
- Open-source tool development with benchmarked evaluation
- Case studies of public events

Designs that need extra machinery (possible, but plan for it): surveys and interviews (human subjects → IRB question), proprietary data (access agreements), longitudinal studies (time).

## Exit criteria for Phase 1

- One-sentence research question written in the tracker
- FINER assessment recorded, with known risks named
- Contribution type chosen
- Follow-up ideas parked in the tracker
- Next action: Phase 2 search strategy

## Failure modes to watch for

- **Question shaped like an opinion** ("Why is X bad?") — reframe to something evidence can answer.
- **Boil-the-ocean scope** — apply Step 5 again.
- **Answer already decided** — if the user can't describe a finding that would surprise them, the design is confirmation-seeking. Ask: "What result would prove you wrong, and would you publish it?"
- **Novelty by ignorance** — feels new only because the literature hasn't been checked. Don't let enthusiasm skip Phase 2.
