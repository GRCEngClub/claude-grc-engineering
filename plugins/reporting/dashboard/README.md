# Compliance Posture Dashboard

A dashboard that runs on your own machine, with no deployment infrastructure. It reads saved
JSON output from `/engineer:monitor-continuous`, serves a local web UI, and
derives current posture, framework health, alerts, and run-over-run deltas
outside Claude's context window.

## Install

```text
/plugin install dashboard --marketplace GRCEngClub/claude-grc-engineering
```

On Claude Code older than 2.1.275, add the marketplace first with `/plugin marketplace add GRCEngClub/claude-grc-engineering`, then run `/plugin install dashboard@grc-engineering-suite`.

The dashboard reads runs produced by `/engineer:monitor-continuous`, so install the `engineer` plugin from the same marketplace too. `--demo` works without it.

## Run It

Generate one or more monitor runs:

```text
/engineer:monitor-continuous SOC2,NIST-800-53 --no-exit-code --output=grc-data/dashboard/monitor-continuous/latest.json
```

Serve the dashboard:

```text
/dashboard:compliance-posture --data=grc-data/dashboard/monitor-continuous --port=8787
```

Open `http://127.0.0.1:8787`.

If you only want to see the UI shape before collecting real data:

```text
/dashboard:compliance-posture --demo --port=8788
```

From a clone of this repository, the same server runs without Claude Code. Options take the `--key=value` form:

```bash
node plugins/reporting/dashboard/scripts/serve.js --demo --port=8788
```

## Data Contract

The server accepts either a single JSON file or a directory tree containing
JSON files. Each file can be one `monitor_continuous_run` document or an array
of those documents.

The dashboard uses:

- `generated_at`, `run_id`, `schedule`, `frameworks`, and `sources`
- `summary.overall_status`, `summary.overall_pass_rate`, and tier totals
- `framework_results[]` with pass rates, evaluated controls, coverage, and
  per-framework status
- `alerts[]` for the operational queue
- `artifacts.gap_report_dir` for traceability back to the report bundle

Historical comparison is deliberately a dashboard concern. Claude generates the
run manifest; the viewer compares saved manifests over time.
