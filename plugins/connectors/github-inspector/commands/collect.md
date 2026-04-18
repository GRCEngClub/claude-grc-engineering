---
name: GitHub Inspector Collect
description: Query GitHub for compliance-relevant configuration and emit findings conforming to the v1 contract.
---

# /github-inspector:collect

Scans GitHub repositories in the configured scope and emits one Finding document per repository.

## How to run

```bash
node plugins/connectors/github-inspector/scripts/collect.js [options]
```

## Arguments

- `--scope=<value>` — repository scope. Overrides the config default.
  - `@me` — all repos you own
  - `org:<name>` — all repos in an org you're a member of
  - `repo:<owner>/<name>` — single repo
  - `repos-file` — scan repos listed in a YAML config file (see below)
- `--repos-file=<path>` — path to repos YAML file (default: `config/repos.yaml` in the plugin dir)
- `--refresh` — ignore cache; always re-query GitHub
- `--output=<fmt>` — `silent` (default for CLI piping) | `summary` (one-line summary) | `json`
- `--limit=<n>` — cap the number of repos scanned (useful for testing)
- `--concurrency=<n>` — parallel API calls (default 4, max 8 to respect rate limits)
- `--quiet` — no stderr progress

## What it evaluates

For each repository in scope, the connector emits evaluations against SCF controls:

| SCF ID | Check | Typical severity |
|---|---|---|
| `CHG-02` — Configuration Change Control | Default branch has protection with required reviews | high if missing |
| `CHG-02.1` — Change Approval | Required status checks configured | medium |
| `IAO-04` — Secure Coding | CodeQL / code scanning enabled | medium |
| `MON-01` — Continuous Monitoring | Secret scanning enabled | high |
| `MON-01.4` — Dependency monitoring | Dependabot alerts enabled | medium |
| `TDA-01` — Third-party Risk | Outside collaborators with admin access | medium |
| `IAC-02` — Authentication | Deploy keys rotated and scoped read-only | medium |
| `GOV-05` — Governance | Repository is not archived without notice | low |

More checks land as the connector matures; see the SKILL for the authoritative list.

## Output

- Writes `~/.cache/claude-grc/findings/github-inspector/<run_id>.json` — one JSON file per run containing an array of Findings (one per repository).
- Appends a run manifest to `~/.cache/claude-grc/runs.log`.
- Prints a one-line summary to stdout unless `--quiet`:

  ```
  github-inspector: 127 resources, 512 evaluations, 38 findings (6 high, 15 medium, 17 low).
  ```

## Exit codes

- `0` — success, cache written
- `2` — auth failure (re-run `/github-inspector:setup`)
- `3` — rate-limited (the connector waited but still hit the ceiling; retry later)
- `4` — partial result (some repos unreadable; a report is still written)
- `5` — config missing (run `/github-inspector:setup` first)

## Rate limits

GitHub's REST API gives you 5,000 requests/hour authenticated. The connector budgets ~5 requests per repo and reports remaining headroom in the Finding's `metadata.rate_limit_remaining`.

## Examples

```bash
# Personal account
/github-inspector:collect --scope=@me

# Whole org
/github-inspector:collect --scope=org:acme --concurrency=6

# Single repo for testing
/github-inspector:collect --scope=repo:acme/prod-api

# Curated list from config file
/github-inspector:collect --scope=repos-file

# Custom repos file path
/github-inspector:collect --scope=repos-file --repos-file=./my-repos.yaml
```

## Repos file format

Create a YAML file listing specific repositories to scan:

```yaml
# config/repos.yaml
repos:
  - acme/prod-api
  - acme/billing-service
  - acme/infrastructure
  - other-org/shared-lib
  - acme/svc-*            # glob pattern: all svc- repos in acme

exclude:
  - acme/deprecated-app
  - acme/test-*           # exclude test repos
```

## CI/CD usage

```bash
gh auth login --with-token < $GH_TOKEN_FILE
node plugins/connectors/github-inspector/scripts/collect.js --scope=org:acme --quiet
node plugins/grc-engineer/scripts/gap-assessment.js SOC2 --sources=github-inspector --output=sarif --quiet > gap.sarif
```
