# academic-research-companion

Guide a research project through the full academic lifecycle — from raw idea to concrete research question, literature grounding, methodology, writing, feedback, publishing, and authorship. Built for researchers who want doctoral-caliber rigor whether they are independent practitioners, students, faculty, or industry authors. On first use it asks for goal, affiliation, publishing platforms, and feedback communities so advice stays personalized without hardcoding one person's context.

```bash
/plugin install academic-research-companion@grc-engineering-suite

/academic-research-companion:research
/academic-research-companion:research "AI governance adoption in state agencies"
/academic-research-companion:research --resume=research/ai-gov-state/tracker.md
/academic-research-companion:research --phase=literature
```

## What this plugin is

A phase-by-phase research companion. It identifies where you are in the lifecycle, reads the matching reference playbook, and works that phase — then updates a project tracker so the work survives across conversations.

| Phase | What you get |
|---|---|
| Idea development | Raw idea → defensible research question (FINER stress-test, contribution claim) |
| Literature review | Verified source base, gap confirmation, synthesis (no fabricated citations) |
| Methodology | Defensible research design matched to the question and your constraints |
| Writing | Draft structure and prose for paper / whitepaper / long-form independent piece |
| Feedback & peer review | Feedback ladder + how to handle formal review |
| Publishing | Escalation ladder: independent → conference/workshop → journal / preprint |
| Authorship & collaboration | Author criteria, order, joining others' work (any phase) |

## What this plugin is not

- Not a citation fabricator. Every source presented must be verified live; unverified recalls are labeled or omitted.
- Not a substitute for IRB, licensed standards text, or institutional ethics review when a design truly requires them — it flags those constraints and offers feasible redesigns.
- Not an auto-publisher. Venue choice and submission remain yours; the plugin prepares the path.

## Tracker

Every project gets a markdown tracker (template in `skills/academic-research-companion/references/tracker-template.md`). Store it in the workspace (e.g. `research/<project>/tracker.md`), in Notion if available, or as a downloadable file you re-upload to resume.

## Status

v0.1.0 — ported from the Claude desktop/web skill into this marketplace as a Claude Code plugin.
