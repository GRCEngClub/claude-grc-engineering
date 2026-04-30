# /crowdstrike-inspector:collect

Collect CrowdStrike Falcon endpoint posture and write Finding documents to:

```text
~/.cache/claude-grc/findings/crowdstrike-inspector/<run_id>.json
```

Coverage:

- Sensor coverage and stale/offline hosts
- Detection policy visibility
- Prevention policy visibility
- Host-group scoping visibility

Options:

- `--output=summary|json|silent`
- `--quiet`
- `--limit=<n>` host ID cap for the first release. Default: `100`
