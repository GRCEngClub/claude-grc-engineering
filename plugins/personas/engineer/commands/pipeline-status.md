---
name: Pipeline Status
description: Summarize every configured connector — auth validity, cache freshness, last-run counts — so operators can see the data-pipeline state at a glance.
---

# /engineer:pipeline-status

Reports on every connector registered in `~/.config/claude-grc/connectors/`. One block per connector with: status, auth validity, last-run timestamp, cached resource/evaluation counts, and any stale/expired signals.

## How to run

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/pipeline-status.sh"
```

## Output

```
CLAUDE-GRC PIPELINE STATUS (2026-04-13 15:04 UTC)

github-inspector
  status:         ready
  auth:           valid (octocat, scopes: repo,read:org)
  last run:       3h ago
  cached:         127 resources, 512 evaluations
  rate limit:     4872/5000 remaining

aws-inspector
  status:         credentials-expired
  fix:            aws sso login --profile=audit
  last run:       17h ago (stale)
  cached:         24 resources, 87 evaluations

okta-inspector
  status:         not-configured
  fix:            /okta-inspector:setup

SCF
  version:        2026.1
  cache age:      2d (refresh in 5d)

Aggregate
  configured:     3 connectors
  healthy:        1 / 3
  cached total:   151 resources, 599 evaluations
  oldest cache:   17h (aws-inspector)
```

## Status semantics

- `ready` — configured, auth valid, runs available
- `credentials-expired` — configured but the tool rejected auth at check time
- `not-configured` — config file doesn't exist
- `stale` — last run > 7 days ago
- `no-cache` — configured but never run

## Exit codes

- `0` — every connector is `ready` (possibly `stale`)
- `2` — at least one connector is `credentials-expired` or `not-configured`
