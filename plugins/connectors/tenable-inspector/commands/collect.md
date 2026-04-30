# /tenable-inspector:collect

Collect Tenable vulnerability-management posture and write Finding documents to:

```text
~/.cache/claude-grc/findings/tenable-inspector/<run_id>.json
```

Coverage:

- scan inventory coverage
- credentialed scan signals
- vulnerability age distribution
- scan access visibility

Options:

- `--output=summary|json|silent`
- `--quiet`
- `--limit=<n>` scan/vulnerability page cap. Default: `100`
