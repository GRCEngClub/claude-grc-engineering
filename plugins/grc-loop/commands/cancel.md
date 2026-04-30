---
description: "Cancel the active grc-loop"
allowed-tools: ["Bash(test -f .claude/grc-loop.local.md:*)", "Bash(rm .claude/grc-loop.local.md)", "Read(.claude/grc-loop.local.md)"]
---

# /grc-loop:cancel

Stop the active loop. Removes the state file so the Stop hook stops blocking exits.

1. Check if `.claude/grc-loop.local.md` exists: `test -f .claude/grc-loop.local.md && echo EXISTS || echo NOT_FOUND`.
2. If `NOT_FOUND`, report "No active grc-loop." and stop.
3. If `EXISTS`:
   - Read `.claude/grc-loop.local.md` to capture `target:` and `iteration:` from the frontmatter.
   - Remove the file: `rm .claude/grc-loop.local.md`.
   - Report: `Cancelled grc-loop (target: <target>, was at iteration <N>)`.
