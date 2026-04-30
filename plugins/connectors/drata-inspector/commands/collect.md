# /drata-inspector:collect

Run curated `drata-cli` workflows and write Finding documents to:

```text
~/.cache/claude-grc/findings/drata-inspector/<run_id>.json
```

The collector appends a run manifest to:

```text
~/.cache/claude-grc/runs.log
```

## Workflow Source

This connector adapts `drata-cli` workflow commands:

- `drata summary --json --compact`
- `drata controls failing --json --compact`
- `drata monitors failing --json --compact`
- `drata connections list --json --compact`
- `drata personnel issues --json --compact`
- `drata evidence expiring --json --compact`

## Options

- `--output=summary|json|silent` controls stdout. Default: `summary`.
- `--quiet` suppresses progress logs on stderr.
- `--limit=<n>` passes a display cap through to workflow commands. Default: `50`.
- `--max-pages=<n>` bounds Drata API pagination. Default: `20`.
- `--evidence-days=<n>` marks evidence older than this as expiring/stale. Default: `60`.

## Notes

The connector prefers SCF IDs where there is a stable GRC meaning. Drata-native control codes are preserved in metadata and messages so downstream reviewers can trace findings back to Drata.
