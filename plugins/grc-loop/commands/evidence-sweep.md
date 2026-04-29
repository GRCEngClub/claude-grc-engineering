---
description: "Loop collect-evidence over a framework's controls until every control has a manifest for the target period"
argument-hint: "<framework> [--period=2026-Q1] [--cloud=aws] [--lang=python] [--max-iterations=80]"
allowed-tools: ["Bash(${CLAUDE_PLUGIN_ROOT}/scripts/setup-grc-loop.sh:*)"]
---

# /grc-loop:evidence-sweep

Iteratively walk a framework's in-scope controls and collect evidence for a specific period (e.g., a quarter). Each iteration picks the next control without a manifest, runs collect-evidence, writes the output to `evidence/<framework>/<period>/<control-id>/`, and moves on. Stops when every in-scope control has a manifest, or when `--max-iterations` is reached.

## Arguments

- **`<framework>`** *(required)* — Framework alias accepted by `/grc-engineer:collect-evidence`.
- `--period=<YYYY-Qn>` *(default: current quarter, e.g., `2026-Q1`)* — Evidence period directory.
- `--cloud=<aws|azure|gcp|kubernetes>` *(default: `aws`)*.
- `--lang=<python|bash>` *(default: `python`)*.
- `--max-iterations=<n>` *(default: `80`)* — Most frameworks have 30–80 in-scope controls; tune for size.

## Behavior

```!
"${CLAUDE_PLUGIN_ROOT}/scripts/setup-grc-loop.sh" evidence-sweep \
  --max-iterations 80 \
  --completion-promise "EVIDENCE SWEEP COMPLETE" \
  --prompt "$(cat <<'PROMPT'
You are running an evidence-sweep loop. One control per iteration.

Each iteration:
1. Resolve the in-scope control list for the target framework via /grc-engineer:frameworks --installed and the framework's plugin metadata.
2. Build the set of "completed" controls: every <control-id> for which evidence/<framework>/<period>/<control-id>/manifest.json exists.
3. If completed == in-scope, the sweep is done. Output the completion promise verbatim and stop. Do NOT continue.
4. Otherwise, pick the next uncompleted control (alphabetical within control family, then family order).
5. Run /grc-engineer:collect-evidence <control-id> <cloud> <lang> and capture the output.
6. Write the artifacts to evidence/<framework>/<period>/<control-id>/ — at minimum:
   - manifest.json with: control-id, framework, period, collected_at (ISO 8601 UTC), cloud, lang, artifacts: [list of file paths]
   - the raw collected artifacts (CLI output captures, JSON dumps, screenshots if applicable)
7. If collection fails (credential missing, API not enabled, control not applicable to the cloud), write manifest.json with status="not_collected" and reason="<short explanation>", then move on. A documented failure is a valid sweep result — don't loop on the same broken control.
8. Move to the next uncompleted control.

Completion criterion: every in-scope control has evidence/<framework>/<period>/<control-id>/manifest.json (status either "collected" or "not_collected" — both count).
When that is unequivocally true, output:

<promise>EVIDENCE SWEEP COMPLETE</promise>

Do NOT output the promise speculatively. If the sweep is genuinely unfinishable (auth broken, framework not supported), stop the loop with /grc-loop:cancel and surface the blocker — don't lie to exit.

The framework, period, cloud, lang, and any other arguments the user passed: $ARGUMENTS
PROMPT
)"
```

After setup, work the task. Cancel with `/grc-loop:cancel`.
