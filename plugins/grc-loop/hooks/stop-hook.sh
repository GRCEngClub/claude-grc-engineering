#!/bin/bash
#
# grc-loop Stop hook — adapted from anthropics/claude-plugins-official/ralph-loop
# (MIT). Same self-referential-loop mechanism, different state file path so
# grc-loop and ralph-loop can coexist without stomping on each other.

set -euo pipefail

HOOK_INPUT=$(cat)
STATE_FILE=".claude/grc-loop.local.md"

if [[ ! -f "$STATE_FILE" ]]; then
  exit 0
fi

FRONTMATTER=$(sed -n '/^---$/,/^---$/{ /^---$/d; p; }' "$STATE_FILE")
ITERATION=$(echo "$FRONTMATTER" | grep '^iteration:' | sed 's/iteration: *//')
MAX_ITERATIONS=$(echo "$FRONTMATTER" | grep '^max_iterations:' | sed 's/max_iterations: *//')
COMPLETION_PROMISE=$(echo "$FRONTMATTER" | grep '^completion_promise:' | sed 's/completion_promise: *//' | sed 's/^"\(.*\)"$/\1/')
TARGET=$(echo "$FRONTMATTER" | grep '^target:' | sed 's/target: *//' || true)

# Session isolation — only the session that started the loop should be blocked.
STATE_SESSION=$(echo "$FRONTMATTER" | grep '^session_id:' | sed 's/session_id: *//' || true)
HOOK_SESSION=$(echo "$HOOK_INPUT" | jq -r '.session_id // ""')
if [[ -n "$STATE_SESSION" ]] && [[ "$STATE_SESSION" != "$HOOK_SESSION" ]]; then
  exit 0
fi

if [[ ! "$ITERATION" =~ ^[0-9]+$ ]] || [[ ! "$MAX_ITERATIONS" =~ ^[0-9]+$ ]]; then
  echo "⚠️  grc-loop: state file corrupted ($STATE_FILE). Removing and exiting." >&2
  rm "$STATE_FILE"
  exit 0
fi

if [[ $MAX_ITERATIONS -gt 0 ]] && [[ $ITERATION -ge $MAX_ITERATIONS ]]; then
  echo "🛑 grc-loop: max iterations ($MAX_ITERATIONS) reached for target '${TARGET:-unknown}'."
  rm "$STATE_FILE"
  exit 0
fi

TRANSCRIPT_PATH=$(echo "$HOOK_INPUT" | jq -r '.transcript_path')
if [[ ! -f "$TRANSCRIPT_PATH" ]]; then
  echo "⚠️  grc-loop: transcript not found, stopping." >&2
  rm "$STATE_FILE"
  exit 0
fi

if ! grep -q '"role":"assistant"' "$TRANSCRIPT_PATH"; then
  rm "$STATE_FILE"
  exit 0
fi

LAST_LINES=$(grep '"role":"assistant"' "$TRANSCRIPT_PATH" | tail -n 100)
set +e
LAST_OUTPUT=$(echo "$LAST_LINES" | jq -rs '
  map(.message.content[]? | select(.type == "text") | .text) | last // ""
' 2>&1)
JQ_EXIT=$?
set -e
if [[ $JQ_EXIT -ne 0 ]]; then
  echo "⚠️  grc-loop: failed to parse transcript JSON, stopping." >&2
  rm "$STATE_FILE"
  exit 0
fi

if [[ "$COMPLETION_PROMISE" != "null" ]] && [[ -n "$COMPLETION_PROMISE" ]]; then
  PROMISE_TEXT=$(echo "$LAST_OUTPUT" | perl -0777 -pe 's/.*?<promise>(.*?)<\/promise>.*/$1/s; s/^\s+|\s+$//g; s/\s+/ /g' 2>/dev/null || echo "")
  if [[ -n "$PROMISE_TEXT" ]] && [[ "$PROMISE_TEXT" = "$COMPLETION_PROMISE" ]]; then
    echo "✅ grc-loop: detected <promise>$COMPLETION_PROMISE</promise> — target '${TARGET:-unknown}' complete."
    rm "$STATE_FILE"
    exit 0
  fi
fi

NEXT_ITERATION=$((ITERATION + 1))
PROMPT_TEXT=$(awk '/^---$/{i++; next} i>=2' "$STATE_FILE")
if [[ -z "$PROMPT_TEXT" ]]; then
  echo "⚠️  grc-loop: no prompt body in state file, stopping." >&2
  rm "$STATE_FILE"
  exit 0
fi

TEMP_FILE="${STATE_FILE}.tmp.$$"
sed "s/^iteration: .*/iteration: $NEXT_ITERATION/" "$STATE_FILE" > "$TEMP_FILE"
mv "$TEMP_FILE" "$STATE_FILE"

if [[ "$COMPLETION_PROMISE" != "null" ]] && [[ -n "$COMPLETION_PROMISE" ]]; then
  SYSTEM_MSG="🔁 grc-loop iteration $NEXT_ITERATION (target: ${TARGET:-unknown}) | output <promise>$COMPLETION_PROMISE</promise> ONLY when the statement is fully true"
else
  SYSTEM_MSG="🔁 grc-loop iteration $NEXT_ITERATION (target: ${TARGET:-unknown}) | no completion promise set — runs until --max-iterations"
fi

jq -n \
  --arg prompt "$PROMPT_TEXT" \
  --arg msg "$SYSTEM_MSG" \
  '{ "decision": "block", "reason": $prompt, "systemMessage": $msg }'

exit 0
