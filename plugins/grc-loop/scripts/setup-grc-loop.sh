#!/bin/bash
#
# grc-loop setup script — adapted from anthropics/claude-plugins-official/ralph-loop
# (MIT). Writes .claude/grc-loop.local.md with target metadata + the prompt body
# the Stop hook re-feeds each iteration.

set -euo pipefail

TARGET="${1:-}"
shift || true

if [[ -z "$TARGET" ]]; then
  echo "❌ Error: setup-grc-loop.sh requires a target as the first arg." >&2
  echo "   Targets supported in v0.1: gap-burndown, evidence-sweep" >&2
  exit 1
fi

PROMPT=""
MAX_ITERATIONS=0
COMPLETION_PROMISE="null"

# Guard `${2:-}` on every flag so a missing value reports a clear error
# instead of crashing with `unbound variable` under `set -u`.
require_value() {
  local flag="$1"
  local value="${2:-__MISSING__}"
  if [[ "$value" == "__MISSING__" ]]; then
    echo "❌ Error: $flag requires a value." >&2
    exit 1
  fi
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --prompt)
      require_value "--prompt" "${2:-__MISSING__}"
      PROMPT="$2"
      shift 2
      ;;
    --max-iterations)
      require_value "--max-iterations" "${2:-__MISSING__}"
      if ! [[ "$2" =~ ^[0-9]+$ ]]; then
        echo "❌ Error: --max-iterations must be a non-negative integer (got: $2)" >&2
        exit 1
      fi
      MAX_ITERATIONS="$2"
      shift 2
      ;;
    --completion-promise)
      require_value "--completion-promise" "${2:-__MISSING__}"
      COMPLETION_PROMISE="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

if [[ -z "$PROMPT" ]]; then
  echo "❌ Error: --prompt is required." >&2
  exit 1
fi

mkdir -p .claude

if [[ -n "$COMPLETION_PROMISE" ]] && [[ "$COMPLETION_PROMISE" != "null" ]]; then
  COMPLETION_PROMISE_YAML="\"$COMPLETION_PROMISE\""
else
  COMPLETION_PROMISE_YAML="null"
fi

SESSION_ID="${CLAUDE_CODE_SESSION_ID:-}"
if [[ -z "$SESSION_ID" ]]; then
  echo "⚠️  Warning: CLAUDE_CODE_SESSION_ID is not set. Loop will run, but session" >&2
  echo "   isolation is disabled — the Stop hook will block exits in any session" >&2
  echo "   that opens this directory until the loop completes or is cancelled." >&2
fi

cat > .claude/grc-loop.local.md <<EOF
---
active: true
target: "$TARGET"
iteration: 1
session_id: "$SESSION_ID"
max_iterations: $MAX_ITERATIONS
completion_promise: $COMPLETION_PROMISE_YAML
started_at: "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
---

$PROMPT
EOF

cat <<EOF
🔁 grc-loop activated — target: $TARGET

  iteration:           1
  max_iterations:      $(if [[ $MAX_ITERATIONS -gt 0 ]]; then echo $MAX_ITERATIONS; else echo "unlimited"; fi)
  completion_promise:  $(if [[ "$COMPLETION_PROMISE" != "null" ]]; then echo "$COMPLETION_PROMISE"; else echo "(none — relies on --max-iterations)"; fi)

The Stop hook will re-feed this prompt each time the session tries to exit,
until the completion promise fires (verbatim match in a <promise> tag) or
--max-iterations is reached.

Cancel with: /grc-loop:cancel
Inspect:     head -10 .claude/grc-loop.local.md
EOF
