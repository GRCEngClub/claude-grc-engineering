# Compliance Posture Dashboard

Localhost dashboard for the `/dashboard:` category proposed in
[RFC #38](https://github.com/GRCEngClub/claude-grc-engineering/issues/38).

This first pass intentionally avoids deployment infrastructure. It reads saved
JSON output from `/grc-engineer:monitor-continuous`, serves a local web UI, and
derives current posture, framework health, alerts, and run-over-run deltas
outside Claude's context window.

## Run It

Generate one or more monitor runs:

```bash
node plugins/grc-engineer/scripts/monitor-continuous.js SOC2,NIST-800-53 \
  --cache-dir=tests/fixtures/findings \
  --no-exit-code \
  --output=grc-data/dashboard/monitor-continuous/latest.json
```

Serve the dashboard:

```bash
npm run dashboard:compliance-posture -- \
  --data=grc-data/dashboard/monitor-continuous \
  --port=8787
```

Open `http://127.0.0.1:8787`.

If you only want to see the UI shape before collecting real data:

```bash
npm run dashboard:compliance-posture -- --demo --port=8788
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
