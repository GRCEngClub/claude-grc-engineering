---
description: "Loop on gap-assessment + generate-implementation until severity-N findings = 0"
argument-hint: "<framework> [--severity=HIGH] [--cloud=aws] [--max-iterations=20]"
allowed-tools: ["Bash(${CLAUDE_PLUGIN_ROOT}/scripts/setup-grc-loop.sh:*)"]
---

# /grc-loop:gap-burndown

Iteratively close gaps for a framework at a chosen severity tier. Each iteration runs the gap assessment, picks the next-highest-impact open finding, generates the implementation, applies it, re-runs the assessment, and moves on. Stops when zero findings remain at that severity, or when `--max-iterations` is reached.

## Arguments

- **`<framework>`** *(required)* — Framework alias (`SOC2`, `HIPAA`, `NIST-800-53`, `ISO27001`, `PCI-DSS`, etc.) — same alias accepted by `/grc-engineer:gap-assessment`.
- `--severity=<HIGH|MEDIUM|LOW>` *(default: `HIGH`)* — Severity tier to burn down.
- `--cloud=<aws|azure|gcp|kubernetes>` *(default: `aws`)* — Cloud provider passed to `/grc-engineer:generate-implementation`.
- `--max-iterations=<n>` *(default: `20`)* — Hard stop. Tune up for greenfield, down for incremental work.

## Behavior

The setup script writes the prompt below to `.claude/grc-loop.local.md` and activates the Stop hook. Each iteration, the hook re-feeds the same prompt; Claude sees its previous work in the repo and the gap-assessment cache, and continues.

```!
"${CLAUDE_PLUGIN_ROOT}/scripts/setup-grc-loop.sh" gap-burndown \
  --max-iterations 20 \
  --completion-promise "GAP BURNDOWN COMPLETE" \
  --prompt "$(cat <<'PROMPT'
You are running a gap-burndown loop. Stay focused — one gap per iteration.

Each iteration:
1. Run /grc-engineer:gap-assessment for the target framework. Parse the output for findings at the target severity.
2. If zero findings remain at the target severity, output the completion promise verbatim and stop. Do NOT continue working.
3. Otherwise, pick the next-highest-impact open finding (most-frameworks-affected first if cross-framework data is available).
4. Run /grc-engineer:generate-implementation <control-id> <cloud> ./generated/<control-id> to produce IaC + scripts.
5. Review the generated Terraform / scripts. If they require destructive changes (security-group rewrites, IAM policy deletions), STOP and surface them to the user instead of applying.
6. For non-destructive changes: commit them under a `compliance/<control-id>` directory with a short message. Do not run `terraform apply` — leave that to the operator.
7. If the gap requires manual policy/process work that cannot be automated (training, governance, vendor agreements):
   - Append a row to evidence/<framework>/manual-actions.md with: control-id, what's needed, who-owns, due-date placeholder.
   - Treat the gap as "deferred-manual" and move on.
8. Re-run /grc-engineer:gap-assessment to confirm the finding count decreased. If it didn't, the implementation is wrong — debug it before moving to the next finding.
9. Move to the next finding.

Completion criterion: zero findings at the target severity for the target framework.
When that is unequivocally true (verified by a fresh gap-assessment run, not assumed), output:

<promise>GAP BURNDOWN COMPLETE</promise>

Do NOT output the promise speculatively. Do NOT output it because you're stuck — surface the blocker instead and let the user decide.

The framework, severity, cloud, and any other arguments the user passed: $ARGUMENTS
PROMPT
)"
```

After setup, work the task. The Stop hook re-feeds the prompt until the promise fires or you hit max iterations. Cancel anytime with `/grc-loop:cancel`.
