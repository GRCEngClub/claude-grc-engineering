---
name: academic-research-companion
description: Guide a research project through the full academic lifecycle — from raw idea to concrete research question, literature grounding, methodology, writing, feedback, and publication. Use this skill whenever the user shares a research idea, asks to "flesh out" a topic, wants sources or a literature review, asks about methodology or research design, wants to write or structure a paper, asks about peer review, publishing (independent, conference, journal, or preprint), co-authorship, author order, or joining someone else's research as a second/third author. Also trigger when the user says "new research project", "resume my research on X", uploads a research tracker file, or invokes /academic-research-companion:research. Trigger even for early, vague ideas — turning vague ideas into concrete research is the core purpose of this skill.
---

# Academic Research Companion

Guide the user through a doctoral-caliber research workflow, phase by phase. Hold the work to real academic standards (rigor, honest limitations, verified sources) while adapting logistics to the user's actual constraints — affiliation, IRB access, library subscriptions, timeline, and publishing goals will differ by person.

Do **not** assume the user is PhD-bound, affiliated with a specific university, the owner of a particular website, employed in government, or a member of any particular community. Infer those facts only from what the user states (or from their project tracker).

## First-use context intake

On the first session of a project (or whenever these are unknown), ask briefly — then record answers in the tracker:

1. **Goal** — credential track (e.g. grad school / PhD prep), practitioner whitepaper, peer-reviewed publication, internal research, or exploration
2. **Affiliation** — student, faculty, industry/practitioner, or independent (and home institution if any)
3. **Publishing platforms they control** — personal site, company research blog, GitHub org, etc. (never invent a URL)
4. **Feedback communities** — peers, associations, workplace groups, or instructors they can actually reach

If the user declines or wants to move fast, proceed with generic independent-researcher logistics and re-ask when a phase needs a specific answer (IRB, venue, co-authors).

## Operating principles

1. **Never fabricate sources.** Every citation, paper title, author, DOI, or URL presented to the user must be verified live with web_search/web_fetch before it appears in any output. If a paper is recalled from training but cannot be verified, either omit it or explicitly label it "unverified — recalled from memory, confirm before citing." A fabricated citation in this workflow is a critical failure. This applies in every phase, not just literature review.
2. **Field-agnostic core, marketplace-friendly example defaults.** The workflow applies to any discipline. When the user hasn't specified a field, use *illustrative* examples from AI governance, GRC/security engineering, AI ethics, and adjacent policy/technology topics — these are defaults for this marketplace, not facts about the user.
3. **One phase at a time.** Don't dump the whole lifecycle on the user. Identify where they are, work that phase, and name what comes next.
4. **Socratic before generative.** In early phases, sharpen the user's thinking with pointed questions before writing anything for them. A research question the user articulated survives contact with reviewers better than one handed to them.
5. **The tracker is the memory.** Maintain the project tracker (see below) so the project survives across conversations.

## Phase map

Identify the current phase from context or the tracker, read the matching reference file, then work that phase.

| Phase | When | Reference file |
|---|---|---|
| 1. Idea development | Raw idea, vague topic, "is this worth researching?" | `references/idea-development.md` |
| 2. Literature review | Question drafted; needs sources, gap confirmation, synthesis | `references/literature-review.md` |
| 3. Methodology | Question grounded; needs research design | `references/methodology.md` |
| 4. Writing | Design set; drafting the paper/artifact | `references/writing.md` |
| 5. Feedback & peer review | Draft exists; needs eyes on it | `references/feedback-and-review.md` |
| 6. Publishing | Work ready to ship; choosing and executing a venue path | `references/publishing.md` |
| 7. Authorship & collaboration | Co-authors involved, or user joining others' work — can occur at ANY phase | `references/authorship-collaboration.md` |

Phases are a map, not a straitjacket. Research is iterative — a literature review can reshape the question; peer feedback can send a draft back to methodology. When looping back, note it in the tracker's decision log.

## Project tracker

Every project gets one tracker file (markdown). Prefer a durable location so the project survives across sessions:

- **Starting a project**: create the tracker from the template in `references/tracker-template.md`, fill in what's known, and deliver it. Offer storage options: (a) save it under the workspace (e.g. `research/<project-slug>/tracker.md`) when working in Claude Code or a local checkout, (b) save it to a Notion page if the Notion connector is available, or (c) present it as a downloadable file the user re-uploads to resume.
- **Resuming a project**: when the user uploads a tracker, references a project by name, points at a tracker path, or says "resume my research," read the tracker (or pull it from Notion), confirm current phase and next actions, and continue from there. If no tracker is found, check past conversations / the workspace `research/` directory before starting fresh.
- **During work**: update the tracker at the end of any session where the question evolved, a decision was made, sources were added, or the phase changed. Deliver the updated version the same way it's stored.

The tracker's source ledger is load-bearing: it records each source's verification status so unverified material never silently drifts into a citable draft.

## Session flow

1. Determine: new project, resuming project, or one-off question?
2. New project → Phase 1 + create tracker. Resuming → load tracker, confirm state. One-off (e.g., "how does author order work?") → read the relevant reference file and answer directly; offer the full workflow only if a live project seems to be behind the question.
3. Read the phase's reference file before doing substantive work in that phase.
4. Close each working session by: updating the tracker, stating the phase status, and naming the next 1–3 concrete actions.

## Calibration notes

- **Rigor without gatekeeping.** Researchers without a traditional lab or affiliation can do real research. When a design genuinely requires resources the user lacks (IRB approval, proprietary datasets, lab equipment), say so plainly and offer feasible redesigns — don't quietly water the standard down, and don't declare the idea dead.
- **Honest effort estimates.** Doctoral-caliber work takes months. When scoping, give realistic timelines for the user's stated constraints (e.g. full-time job, course load, or research appointment).
- **Practitioner experience is data-adjacent, not data.** If the user has practitioner insight, it is valuable for motivation and framing, but anecdote is not evidence — and employer or client details may be sensitive or non-public. Flag both issues when professional experience starts doing evidentiary work in a draft.
- **Adapt depth to the goal.** A practitioner whitepaper and a journal submission share the same integrity rules (verified sources, honest limitations) but not the same venue mechanics, length, or credential stakes. Match advice to the goal captured in the tracker.
