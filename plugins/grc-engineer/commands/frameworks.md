---
description: List every SCF-mapped framework (249) and show which have a dedicated plugin
---

# Frameworks Discovery

Lists every framework in the [Secure Controls Framework](https://securecontrolsframework.com) crosswalk (249 total) and annotates each with its plugin status in this repo:

- `✓ shipped` — a dedicated plugin exists in `plugins/frameworks/<slug>/` (filterable by depth)
- `○ not started` — no dedicated plugin yet, but the framework is already usable today via `/grc-engineer:gap-assessment <scf-framework-id>` through the crosswalk

Answers the everyday question: *"is X supported, and if so, how do I use it?"* — without scrolling through the marketplace.

## Usage

```bash
/grc-engineer:frameworks [options]
```

## Options

| Option | Values | Notes |
|---|---|---|
| `--region=` | `americas` · `apac` · `emea` · `global` | Filter by SCF region. `global` covers general-purpose frameworks (NIST, ISO, PCI DSS, etc.). |
| `--depth=` | `stub` · `reference` · `full` · `unknown` | Filter by plugin depth. `unknown` matches plugins without a `framework_metadata.depth` field yet. |
| `--status=` | `shipped` · `not-started` | Filter by whether a plugin exists. |
| `--installed` | — | Shorthand for `--status=shipped`. |
| `--not-installed` | — | Shorthand for `--status=not-started`. |
| `--search=` | substring | Case-insensitive match against display name, SCF ID, or plugin slug. |
| `--format=` | `text` · `json` · `table` | Output format. `text` (default) groups shipped/not-started with a summary header; `json` is machine-readable; `table` is columnar. |
| `--limit=N` | integer | Cap the result set (useful with `--not-installed` which otherwise lists 234 rows). |
| `--offline` | — | Use cached SCF data only (no network). |

## Examples

```bash
# Everything, grouped by status
/grc-engineer:frameworks

# Just what's shipped
/grc-engineer:frameworks --installed

# APAC frameworks without plugins — what could a contributor pick up?
/grc-engineer:frameworks --region=apac --not-installed --limit=10

# Find all PDPA-like frameworks
/grc-engineer:frameworks --search=pdpa

# Everything in machine-readable form (pipe to jq / other tools)
/grc-engineer:frameworks --format=json > coverage.json

# Which plugins are at Reference depth and could be promoted to Full?
/grc-engineer:frameworks --depth=reference
```

## Output semantics

- **SCF coverage summary** — total SCF frameworks vs shipped vs not-started.
- **Shipped plugins** — every registered plugin under `plugins/frameworks/`, matched to its SCF framework_id when known. Plugins without a `framework_metadata.scf_framework_id` or a legacy mapping appear as *"no SCF mapping recorded"* — a gentle nudge to add the metadata in a follow-up PR.
- **Not-started** — every SCF framework without a plugin. Each row includes the SCF framework ID (copy-paste into `scaffold-framework`) and the display name.

## Data sources

- [SCF API](https://hackidle.github.io/scf-api/) — `crosswalks.json` for the 249 framework index. Cached locally under `~/.cache/claude-grc/scf/<version>/` per CC BY-ND 4.0 (verbatim).
- `.claude-plugin/marketplace.json` — registered plugins.
- Each `plugins/frameworks/<slug>/.claude-plugin/plugin.json` → `framework_metadata` block (if present).
- Hard-coded legacy mapping in `scripts/frameworks.js` for the ~15 pre-Club-handoff plugins that predate the `framework_metadata` convention. Entries become obsolete as plugins backfill their metadata.

## Pairs with

- [`/grc-engineer:scaffold-framework`](scaffold-framework.md) — use the SCF framework_id from this command's output to scaffold a new plugin with one command.
- Framework coverage tracker ([#12](https://github.com/GRCEngClub/claude-grc-engineering/issues/12)) — the meta issue that this command's `--format=json` output will eventually drive (auto-generated `docs/FRAMEWORK-COVERAGE.md`).
