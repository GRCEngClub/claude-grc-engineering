---
name: record-automation-metrics
description: Write automation coverage metric snapshots into grc-data/metrics
---

# Record Automation Metrics

Writes reporting-friendly automation metric rows into `./grc-data/metrics/` so
`/report:automation-coverage` has real historical snapshots to compare.

The command always writes these metric IDs:

- `automation.coverage_pct`
- `automation.controls_automated`
- `automation.controls_manual`
- `automation.controls_total`

Use it in one of three modes:

1. **Derived mode** for `fedramp-low`, `fedramp-moderate`, `fedramp-high`, or
   `fedramp-20x-ksi`. The first three are FedRAMP's Rev5 Class B, C and D
   control lists (155, 322 and 409 controls). `fedramp-20x-ksi` is the 46
   FedRAMP 20x Key Security Indicators. Both come from FedRAMP's Consolidated
   Rules for 2026 dataset. The total is FedRAMP's count, and the automated count
   is the number of those items the toolkit has a cloud check for on the chosen
   provider. This is a **tooling-capability baseline**, not proof that your
   program is already running every automation in production. The checks are
   the toolkit's own, not FedRAMP's.
2. **Manual mode** for any framework alias, where you provide the total and
   automated counts directly. Use this for operator-observed reporting.
3. **Framework metadata total mode** for framework plugins that publish
   `metadata.framework.framework_controls_mapped`, where you provide only the
   operator-observed automated count and the command derives the total.
4. **Batch mode** with `--config=<path>`, where a scheduler can write multiple
   framework snapshots in one run.

Metric rows follow [`docs/GRC-DATA.md`](../../../../../docs/GRC-DATA.md) and
`schemas/metric.schema.json`.

## Usage

```bash
/engineer:record-automation-metrics <framework> [provider] [options]
```

## Arguments

- Argument 1 - Framework alias, or one of the four FedRAMP names above
- Argument 2 - Provider in derived mode (optional, defaults to `aws`)

## Common options

- `--controls-total=<n>` - Required for manual mode unless paired with
  `--controls-manual`
- `--controls-automated=<n>` - Required for manual mode
- `--controls-manual=<n>` - Optional manual count override
- `--from-framework-metadata` - Derive `controls_total` from the framework
  plugin manifest, leaving `controls_automated` operator-observed
- `--recorded-at=<iso8601>` - Observation timestamp (defaults to now)
- `--window-start=<iso8601>` - Optional reporting window start
- `--window-end=<iso8601>` - Optional reporting window end
- `--window-label=<label>` - Optional period label like `2026-W16` or
  `current-week`
- `--dimension=<key=value>` - Extra dimensions; may be repeated
- `--source=<string>` - Optional provenance override
- `--out-dir=<path>` - Override `./grc-data/metrics/`
- `--config=<path>` - YAML or JSON config for batch mode
- `--dry-run` - Print rows instead of writing files

## Instructions

1. Run the writer directly:

   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/scripts/record-automation-metrics.js" "$ARGUMENTS"
   ```

   For batch mode, copy the example config into the project and point at the copy. Paths inside a config resolve from the config's own folder, so running the bundled file in place would write snapshots inside the plugin:

   ```bash
   cp "${CLAUDE_PLUGIN_ROOT}/examples/automation-metrics.yaml" ./automation-metrics.yaml
   node "${CLAUDE_PLUGIN_ROOT}/scripts/record-automation-metrics.js" \
     --config=./automation-metrics.yaml \
     --window-label=current-week
   ```

2. Commit the generated files under `./grc-data/metrics/`, or let your CI job
   publish them into the repo on a schedule.

3. Rerun `/report:automation-coverage` after you have at least two snapshots
   seven or more days apart.

## Examples

```bash
# Derive coverage for the FedRAMP Rev5 Class C control list (fedramp-moderate) on AWS
/engineer:record-automation-metrics fedramp-moderate aws --window-label=2026-W16

# Derive coverage for the FedRAMP 20x Key Security Indicators on GCP
/engineer:record-automation-metrics fedramp-20x-ksi gcp --window-label=2026-W16

# Record an operator-observed SOC 2 snapshot
/engineer:record-automation-metrics soc2 --controls-total=64 --controls-automated=22 --window-label=2026-W16

# Derive the total from SOC 2 plugin metadata, but keep the automated count observed
/engineer:record-automation-metrics soc2 --controls-automated=22 --from-framework-metadata --window-label=2026-W16

# Add an extra business-unit dimension
/engineer:record-automation-metrics iso27001 --controls-total=93 --controls-automated=40 --dimension=business_unit=platform --window-label=2026-W16

# Write multiple snapshots from a config file in the project
/engineer:record-automation-metrics --config=./automation-metrics.yaml --window-label=current-week
```
