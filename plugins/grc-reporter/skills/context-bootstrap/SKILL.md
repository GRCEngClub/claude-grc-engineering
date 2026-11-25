---
name: context-bootstrap
description: Setup guidance for users running a /report:* command before their toolkit has enough context. Use when a report command detects missing findings, frameworks, or history. Walks the user through installation and first collection rather than generating a hollow report.
allowed-tools: Read, Glob, Bash
---

# Context Bootstrap

Hollow reports are worse than no reports. When a user runs `/report:exec-summary` with an empty findings cache, the right move is to teach them the setup, not to make up a report.

## What to check

Before any report command generates, verify:

1. **Plugins installed.** Run `/plugin list` or inspect the marketplace. Need at least:
   - `grc-engineer` (the pipeline hub)
   - One connector (e.g., `github-inspector`, `aws-inspector`, `okta-inspector`)
   - One framework plugin (e.g., `soc2`, `fedramp-20x`, `iso27001`)

2. **Findings cache populated.** Look in `~/.cache/claude-grc/findings/<source>/*.json`. Timestamps within the last 30 days mean the pipeline is active.

3. **Framework metadata available.** Each framework plugin's `plugin.json` should have a `framework_metadata` block. Without it, coverage math fails silently.

4. **History depth (for week-over-week commands).** `/report:automation-coverage` needs at least 2 metric snapshots in `./grc-data/metrics/` that are 7+ days apart. Verify snapshot dates there rather than inferring movement from the findings cache.

5. **Optional GitOps state.** `./grc-data/risks/*`, `./grc-data/metrics/*`, `./grc-data/incidents/*.md`. The JSON contracts live in `docs/GRC-DATA.md`. Missing is fine; present is better.

## Command-specific minimums

- **`/report:exec-summary`**: one connector, one framework, recent findings. Risks and metrics improve it but are not mandatory.
- **`/report:program-health`**: two framework plugins plus one successful gap-assessment run per framework. A single-framework setup is not enough.
- **`/report:board-brief`**: quarter-spanning findings history plus a real risk register if you want residual-risk sections to be grounded.
- **`/report:automation-coverage`**: two metric snapshots in `./grc-data/metrics/` at least 7 days apart. Findings cache alone is not enough to claim week-over-week automation movement.

## The three paths

### Complete context

Auto-discover everything. Ask at most one or two narrative questions (audience, material asks). Generate.

### Partial context

Name what's missing. Auto-discover what exists. Offer to proceed with interview mode where the user fills the gaps conversationally. Example:

> I see findings from github-inspector across the last 14 days, SOC 2 framework installed. No risk register at `./grc-data/risks/`. I can still write the report using findings and metrics only, or you can set up a risk register first. `docs/GRC-DATA.md` shows the file shape. Which do you want?

### Empty context

Walk through the setup. Do not generate.

## The empty-context setup script

Deliver these steps in plain conversational form. Do not dump all commands at once; confirm each step before moving to the next.

1. **Add the marketplace**

   ```
   /plugin marketplace add GRCEngClub/claude-grc-engineering
   ```

2. **Install the minimum plugin set**

   ```
   /plugin install grc-engineer@grc-engineering-suite
   /plugin install github-inspector@grc-engineering-suite
   /plugin install soc2@grc-engineering-suite
   ```

   `github-inspector` is the lowest-setup connector (uses the `gh` CLI you probably already have authenticated). `soc2` is the most common first framework.

3. **Set up the connector**

   ```
   /github-inspector:setup
   ```

   Confirms `gh auth status` and writes a default config.

4. **Collect findings**

   ```
   /github-inspector:collect --scope=@me
   ```

   For a first run, `@me` scopes to the user's own repos. For org-wide scans, use `--scope=<org-name>` with a token that has `admin:org`.

5. **Run the first gap assessment (optional but recommended)**

   ```
   /grc-engineer:gap-assessment SOC2 --sources=github-inspector
   ```

   Not strictly required for `/report:*` commands, but produces the crosswalked finding structure report commands read.

6. **Come back to the report command.** With findings in cache, rerun the report command that sent the user here.

7. **If the user wants `/report:program-health`, add a second framework now.**

   ```
   /plugin install fedramp-20x@grc-engineering-suite
   /grc-engineer:gap-assessment SOC2,FedRAMP-Moderate --sources=github-inspector
   ```

   `program-health` needs more than one framework in scope or it is not a portfolio view.

## For `/report:automation-coverage` specifically

This command needs history. If the user just finished a first-time setup, tell them:

> You have one baseline from today. Automation coverage needs at least two metric snapshots 7+ days apart so there's a delta to report. Two options:
>
> 1. Schedule regular collection with `/grc-engineer:monitor-continuous SOC2 daily --sources=github-inspector`. Come back in 7-14 days.
> 2. Run `/grc-engineer:record-automation-metrics <framework> --controls-total=<n> --controls-automated=<n> --window-label=<period>` once per week so `./grc-data/metrics/` builds a real history, then rerun the report after you have two snapshots.

Do not fabricate a week-over-week comparison from Findings alone.

## When to break the "no hollow report" rule

Never. A fake report is worse than no report because it teaches the user to trust numbers that aren't real. If the user explicitly asks for a template rendering with placeholder data for demo purposes, that is a different ask and gets a clearly-labeled `DEMO DATA` output.
