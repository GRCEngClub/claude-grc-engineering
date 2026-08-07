---
description: Start or resume an academic research project — idea through literature, methodology, writing, feedback, and publishing
---

# /academic-research-companion:research

Guide a research project through the academic lifecycle, one phase at a time. Holds the work to real academic standards (rigor, honest limitations, verified sources) while adapting logistics to the user's stated constraints (affiliation, platforms, communities, and goals — gathered on first use, never assumed).

## Usage

```
/academic-research-companion:research [topic-or-question] [--phase=<phase>] [--resume=<tracker-path>]
```

## Arguments

- `[topic-or-question]` (optional) — a raw idea, working title, or research question. If omitted, ask what the user wants to work on (or whether they are resuming).
- `--phase=<phase>` (optional) — force a phase: `idea` | `literature` | `methodology` | `writing` | `feedback` | `publishing` | `authorship`. Defaults to whatever the tracker (or conversation) implies.
- `--resume=<tracker-path>` (optional) — path to an existing project tracker markdown file. When provided, load it and continue from the recorded phase.

## What this produces

Depends on the current phase. Typical session outputs:

1. **Phase work** — Socratic sharpening, verified sources, design choices, draft sections, review guidance, or venue next steps (never all phases at once).
2. **Updated project tracker** — for project sessions, created from `references/tracker-template.md` before first-use intake; updated whenever the question, decisions, sources, or phase change. Omitted for one-off questions unless the user starts a project.
3. **Next 1–3 concrete actions** — so the project can resume cleanly in a later session.

## Delegation

The `academic-research-companion` skill is invoked. Before substantive work in a phase, it reads the matching file under `skills/academic-research-companion/references/`:

| Phase | Reference |
|---|---|
| Idea development | `idea-development.md` |
| Literature review | `literature-review.md` |
| Methodology | `methodology.md` |
| Writing | `writing.md` |
| Feedback & peer review | `feedback-and-review.md` |
| Publishing | `publishing.md` |
| Authorship & collaboration | `authorship-collaboration.md` |

## Non-negotiables

- **Never fabricate sources.** Every citation, title, author, DOI, or URL must be verified live before it appears. Unverified memory recalls are labeled or omitted. If web tools are unavailable, say so and do not present memory recalls as verified — continue with search strategy / user-supplied records, or pause literature work until verification is possible.
- **No hardcoded personal context.** Do not assume a PhD track, specific university, personal website, employer, or community membership. Ask on first use and record answers in the tracker.
- **One phase at a time.** Name the current phase and what comes next; do not dump the whole lifecycle.
- **Socratic before generative** in early phases — sharpen the user's question before writing for them.
- **Tracker is memory.** For project sessions, create the tracker before intake and end with an updated tracker plus next actions. Skip tracker create/update for one-off questions unless the user starts a project.

## Examples

```
/academic-research-companion:research
/academic-research-companion:research "AI governance adoption in state agencies"
/academic-research-companion:research --resume=research/ai-gov-state/tracker.md
/academic-research-companion:research --phase=literature
/academic-research-companion:research --phase=authorship
```
