---
description: Run recurring compliance checks and emit machine-readable alerts
---

# Monitor Continuous

Runs a single pass of recurring compliance monitoring: orchestrates
`/grc-engineer:gap-assessment`, applies warn/critical thresholds per framework,
optionally chains `/grc-engineer:record-automation-metrics`, and emits a
structured JSON summary suitable for cron, GitHub Actions, Slack, email, or
PagerDuty.

Implementation: [`scripts/monitor-continuous.js`](../scripts/monitor-continuous.js).

## Usage

```bash
/grc-engineer:monitor-continuous <frameworks> [options]
/grc-engineer:monitor-continuous --config=<path>
```

The host scheduler (cron, EventBridge, GitHub Actions) provides recurrence; this
command executes one monitoring pass per invocation. The `schedule` value is
recorded in the output summary so downstream dashboards can group runs by
cadence.

## Arguments

- `<frameworks>` - Comma-separated frameworks (e.g. `SOC2,PCI-DSS,NIST-800-53`).
  Required unless supplied via `--config`.

## Options

- `--config=<path>` - YAML or JSON config (see below). CLI flags override config values.
- `--sources=<csv>` - Connectors whose cached findings should feed the assessment.
- `--schedule=<name>` - Label only (`daily`, `weekly`, `hourly`). Recorded in output.
- `--report-dir=<path>` - Where gap-assessment writes its bundle (default: `./monitor-continuous-<run_id>/`).
- `--output=<path>` - Write the JSON summary to this path. stdout always gets it too.
- `--warn-threshold=<0..1>` - Per-framework pass-rate warning floor (default: `0.90`).
- `--critical-threshold=<0..1>` - Per-framework pass-rate critical floor (default: `0.80`).
- `--record-metrics` - After assessment, run `record-automation-metrics.js`.
- `--metrics-config=<path>` - Config for record-automation-metrics (implies `--record-metrics`).
- `--window-label=<label>` - Forwarded to record-automation-metrics.
- `--cache-dir=<path>` - Forwarded to gap-assessment (finding cache dir).
- `--offline` - Use the local SCF cache only (no network).
- `--no-exit-code` - Always exit 0 even on threshold breach.
- `--quiet` - Suppress stderr progress.
- `--dry-run` - Resolve config + print planned actions; no subprocess runs.

## Examples

```bash
# Single pass over three frameworks using cached findings
node plugins/grc-engineer/scripts/monitor-continuous.js SOC2,PCI-DSS,NIST-800-53

# Daily monitoring driven by a config file
node plugins/grc-engineer/scripts/monitor-continuous.js \
  --config=plugins/grc-engineer/examples/monitor-continuous.yaml

# Chain automation-metrics snapshot on the same run
node plugins/grc-engineer/scripts/monitor-continuous.js SOC2 \
  --metrics-config=./automation-metrics.yaml --window-label=current-week

# Dry-run to validate config without spawning subprocesses
node plugins/grc-engineer/scripts/monitor-continuous.js \
  --config=./monitor-continuous.yaml --dry-run
```

## Exit codes

- `0` - All frameworks at or above the warning threshold.
- `2` - At least one framework below the warning threshold.
- `3` - At least one framework below the critical threshold.
- `1` - Usage error or subprocess failure.

Set `--no-exit-code` to always exit 0 (for example, when a CI step must
continue running downstream notification steps regardless of status).

## Config file

YAML or JSON. Example: [`examples/monitor-continuous.yaml`](../examples/monitor-continuous.yaml).

```yaml
frameworks: [SOC2, PCI-DSS, NIST-800-53]
schedule: daily
sources: [aws-inspector, github-inspector]
thresholds:
  warning: 0.90
  critical: 0.80
report_dir: ./monitor-reports
record_metrics:
  enabled: true
  config: ./automation-metrics.yaml
  window_label: current-week
```

## Output contract

stdout is a single JSON document. Downstream alerting tools (Slack, email,
PagerDuty) should key off `summary.overall_status`, `alerts[]`, and
`framework_results[].status`.

```json
{
  "schema_version": "1.0.0",
  "kind": "monitor_continuous_run",
  "run_id": "20260424T140000-a1b2c3d4",
  "generated_at": "2026-04-24T14:00:00Z",
  "schedule": "daily",
  "frameworks": ["SOC2", "PCI-DSS", "NIST-800-53"],
  "sources": ["aws-inspector", "github-inspector"],
  "thresholds": { "warning": 0.9, "critical": 0.8 },
  "framework_results": [
    {
      "framework": "SOC2",
      "evaluated": 50,
      "passing": 49,
      "failing": 1,
      "inconclusive": 0,
      "total_controls": 64,
      "pass_rate": 0.98,
      "pass_rate_pct": 98,
      "coverage_pct": 78,
      "status": "ok"
    }
  ],
  "summary": {
    "overall_status": "warning",
    "overall_pass_rate": 0.92,
    "tier1_blockers": 3,
    "tier2_findings": 7,
    "tier3_recommendations": 4,
    "passes": 118,
    "inconclusive": 2
  },
  "alerts": [
    {
      "severity": "warning",
      "framework": "PCI-DSS",
      "pass_rate": 0.86,
      "threshold": 0.9,
      "message": "PCI-DSS pass rate 86.0% below warning floor 90%"
    }
  ],
  "artifacts": {
    "gap_report_dir": "./monitor-reports",
    "metrics": { "skipped": false, "failed": false }
  },
  "gap_assessment_summary": { "...": "pass-through from gap-assessment.js" }
}
```

## What this command does not ship

By design, the runner is transport-agnostic. It does **not** POST to Slack,
send email, or page on-call. Those steps live in the host scheduler (examples
below), so the same run output can drive any combination of channels.

For trend analysis over time, consume the JSON output (or the `grc-data/metrics/`
snapshots written when `record_metrics` is enabled) with a reporting workflow
such as `/report:exec-summary`.

## Setup

### 1. Stage a config file

Copy `plugins/grc-engineer/examples/monitor-continuous.yaml` to your project
root and edit the framework list, thresholds, and optional
`record_metrics.config` pointer.

### 2. Schedule in your host

The runner itself is stateless; point a scheduler at it.

GitHub Actions:

```yaml
# .github/workflows/compliance-monitor.yml
name: Continuous Compliance Monitoring

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 02:00 UTC
  workflow_dispatch:

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci

      - name: Run monitor-continuous
        run: |
          node plugins/grc-engineer/scripts/monitor-continuous.js \
            --config=./monitor-continuous.yaml \
            --output=./monitor-result.json
        continue-on-error: true

      - name: Alert on threshold breach
        if: always()
        run: |
          STATUS=$(jq -r '.summary.overall_status' monitor-result.json)
          if [ "$STATUS" = "critical" ] || [ "$STATUS" = "warning" ]; then
            jq '.alerts' monitor-result.json
            exit 1
          fi
```

Cron on a runner:

```bash
0 2 * * *  cd /srv/grc && node plugins/grc-engineer/scripts/monitor-continuous.js \
             --config=./monitor-continuous.yaml --output=./monitor-result.json
```

### 3. Wire alerts downstream

The runner emits JSON; wiring to channels is a CI concern. Example Slack step
that only fires when the run crossed the warning threshold:

```yaml
- uses: slackapi/slack-github-action@v1
  if: failure()
  with:
    payload: |
      {
        "text": "Compliance alert: $(jq -r '.summary.overall_status' monitor-result.json)",
        "attachments": $(jq '.alerts' monitor-result.json)
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## Roadmap (not in this runner yet)

These were part of the original `/monitor-continuous` spec and are tracked for
follow-up:

- 30-day trend analysis over `grc-data/metrics/` history
- Control-health degradation detection (per-control pass rates over time)
- Built-in Slack/email/PagerDuty HTTP calls
- Live compliance dashboard
- Auto-remediation hooks

---

<details>
<summary>Legacy reference output (pre-executable spec)</summary>

The example below was the narrative output described before the command had an
executable runner. It is kept for reference while reporting workflows continue
to build on this data. The actual runtime contract is the JSON shape above.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTINUOUS COMPLIANCE MONITORING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Frameworks: SOC2, PCI-DSS, NIST 800-53
Schedule: Daily @ 02:00 UTC
Status: ACTIVE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLIANCE TREND (Last 30 Days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Jan 1:  ████████████████████░  95% (142/150 controls)
Jan 8:  ████████████████████░  94% (141/150 controls)  ⚠ -1%
Jan 15: ████████████████████░  94% (141/150 controls)  → Stable
Jan 22: █████████████████████  96% (144/150 controls)  ✓ +2%
Jan 28: █████████████████████  96% (144/150 controls)  → Stable

Trend: ↗ IMPROVING (+1% this month)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall Compliance: 96% (144/150 controls)

By Framework:
  SOC2:       98% ████████████████████░  (49/50)
  PCI-DSS:    92% ███████████████████░░  (46/50)
  NIST 800-53: 98% ████████████████████░  (49/50)

By Status:
  ✓ Effective: 144 controls (96%)
  ⚠ Partially Effective: 4 controls (3%)
  ✗ Ineffective: 2 controls (1%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECENT FAILURES (Last 7 Days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 HIGH PRIORITY (1):
  Jan 28: AU-11 (Audit Retention)
    Status: FAILING (2 days)
    Cause: S3 lifecycle policy misconfigured
    Impact: Logs deleted after 60 days (should be 365)
    Action: Fix S3 lifecycle policy
    Frameworks: NIST, SOC2, PCI-DSS

🟡 MEDIUM PRIORITY (3):
  Jan 25: AC-2 (Account Management)
    Status: DEGRADED (was passing, now partial)
    Cause: 3 inactive users detected >90 days
    Impact: PCI-DSS 8.1.4 violation
    Action: Disable inactive users

  Jan 22: IA-5 (Password Policy)
    Status: WARNING
    Cause: 2 users with weak passwords detected
    Impact: Best practice violation
    Action: Enforce password complexity

  ... 1 more

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTROL HEALTH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 HEALTHY (30-day pass rate >95%):
  ✓ Access Control (AC-2): 100% (30/30)
  ✓ Encryption (SC-28): 100% (30/30)
  ✓ Logging (AU-2): 97% (29/30)
  ... 138 more

🟡 DEGRADING (pass rate declining):
  ⚠ Vulnerability Management (SI-2): 93% → 87% (-6%)
    Last 7 days: 3 failures
    Trend: Declining
    Action: Review patch management process

🔴 AT RISK (pass rate <80%):
  ✗ Audit Retention (AU-11): 73% (22/30)
    Recent failures: 8 in last 10 days
    Trend: Failing consistently
    Action: URGENT - Fix S3 lifecycle configuration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALERTS SENT (Last 24 Hours)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 CRITICAL (1):
  22:15 - Audit retention control failed (AU-11)
  → Sent to: #security-alerts (Slack)
  → Sent to: security@company.com

⚠ WARNING (2):
  14:30 - 3 inactive users detected
  06:00 - Daily compliance summary (96%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCHEDULED TESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next run: 2025-01-29 02:00 UTC (in 3h 15m)

Test schedule:
  02:00 - Full control test suite (all 150 controls)
  06:00 - Daily summary report
  14:00 - High-priority controls only
  22:00 - High-priority controls only

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Schedule: Daily @ 02:00 UTC
Alerts: Slack (#security-alerts), Email (security@company.com)
Retention: 90 days of test history
Dashboard: https://compliance.company.com/dashboard
Auto-remediation: Disabled (manual approval required)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Fix AU-11 S3 lifecycle policy (URGENT)
   Command: /grc-engineer:scan-iac ./terraform PCI-DSS --fix
   Estimated time: 15 minutes

2. Disable 3 inactive users
   Command: python scripts/disable_inactive_users.py --execute
   Estimated time: 10 minutes

3. Review vulnerability management process (SI-2 declining)
   Action: Schedule patch management review with ops team
   Estimated time: 2 hours
```

</details>

## Related Commands

- `/grc-engineer:test-control` - Test individual controls
- `/grc-engineer:scan-iac` - Scan infrastructure for violations
- `/grc-engineer:collect-evidence` - Collect compliance evidence
- `/grc-engineer:record-automation-metrics` - Persist weekly automation coverage history
- `/grc-engineer:generate-implementation` - Implement controls
