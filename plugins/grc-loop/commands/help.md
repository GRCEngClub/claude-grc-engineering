---
description: "Explain grc-loop and its targets"
---

# /grc-loop:help

Explain the plugin to the user:

## What grc-loop is

A specialization of the Ralph Wiggum / ralph-loop technique for GRC iteration patterns. Same mechanism (Stop hook re-feeds the prompt until a completion promise fires), but with prompt templates and grc-engineer command integration baked in.

The loop body never changes. What changes between iterations is the repo: each iteration sees the previous iteration's commits, evidence files, and gap-assessment cache, and works on the next item.

## Targets in v0.1

- **`/grc-loop:gap-burndown <framework>`** — close all severity-N gaps for a framework. Loops gap-assessment + generate-implementation until zero findings at the target severity remain.
- **`/grc-loop:evidence-sweep <framework>`** — collect evidence for every in-scope control for a target period. Loops collect-evidence and writes manifests until every control has one.

## Targets under consideration (not built yet)

- `/grc-loop:control-test` — loop test-control over a list, auto-remediate where supported
- `/grc-loop:poam-burndown` — work an open POA&M queue down to zero
- `/grc-loop:vendor-tprm` — iterate vendor risk assessments

## Operations

- `/grc-loop:cancel` — stop the active loop
- Inspect state: `head -10 .claude/grc-loop.local.md`

## When NOT to use grc-loop

- One-shot operations where you already know the fix (just run the command directly)
- Tasks that require a human design decision per item (the loop will plough through them)
- Anything touching production where you wouldn't trust autonomous iteration — the loop applies generated IaC under `compliance/<control-id>/` but never runs `terraform apply`. Apply gates stay with the operator.

## Attribution

The Stop-hook + state-file mechanism is adapted from [`anthropics/claude-plugins-official/ralph-loop`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/ralph-loop) (MIT). Original technique by [Geoffrey Huntley](https://ghuntley.com/ralph/).
