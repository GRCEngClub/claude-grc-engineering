---
description: Scaffold a new framework plugin from the SCF crosswalk (Stub or Reference depth)
---

# Scaffold Framework Plugin

Generates a new framework plugin directory under `plugins/frameworks/<slug>/` from templates, filling in framework metadata from the SCF crosswalk ({{SCF_FRAMEWORK_ID}} → 249 possible frameworks).

Turns the usual half-day of hand-authoring `plugin.json` + `SKILL.md` + `commands/*.md` + `README.md` + marketplace registration into a one-command operation. The output is intentionally a starting point, not a finished plugin — you add the framework-specific expertise (`TODO:` markers throughout the templates point at what to fill in).

## Usage

```bash
/grc-engineer:scaffold-framework <scf-framework-id-or-label> [options]
```

## Arguments

| Argument | Required | Notes |
|---|---|---|
| `<scf-framework-id-or-label>` | yes | Either the raw SCF ID (e.g. `apac-sgp-pdpa-2012`) or a human label (`"Singapore PDPA"`, `"Brazil LGPD"`). The script resolves aliases via `scf-client.js`. |
| `--depth=stub\|reference` | optional | Template depth. Default `stub`. Full-depth plugins are authored manually — Full isn't scaffolded because the framework-specific workflow commands are the whole point. |
| `--slug=<name>` | optional | Override the auto-derived plugin directory name. Default strips the SCF region prefix and year suffix (`americas-bra-lgpd-2018` → `bra-lgpd`). |
| `--no-register` | optional | Skip writing to `.claude-plugin/marketplace.json`. Useful when preparing changes to stage manually. |
| `--force` | optional | Overwrite an existing plugin directory. Used for idempotent re-scaffolding. |
| `--offline` | optional | Use cached SCF data only (no network). Fails if cache misses. |
| `--dry-run` | optional | Print the actions that would be taken; don't touch the filesystem. |

## What gets created

### Stub depth (default)

```
plugins/frameworks/<slug>/
├── .claude-plugin/plugin.json             # Plugin metadata + framework_metadata block
├── commands/assess.md                     # Routes to /grc-engineer:gap-assessment
├── skills/<slug>-expert/SKILL.md          # Framework identity + TODO sections
└── README.md                              # Install + level-up instructions
```

Plus a new entry in `.claude-plugin/marketplace.json` (unless `--no-register`).

### Reference depth

Stub, plus:

```
plugins/frameworks/<slug>/
├── commands/scope.md                      # Applicability determination
├── commands/evidence-checklist.md         # Evidence baseline by control family
└── skills/...                             # Richer SKILL.md with TODO scaffolding
```

Full depth (framework-specific workflow commands, persona-specific UX) is not auto-scaffolded — add those commands manually when promoting a Reference plugin to Full.

## Examples

```bash
# Stub scaffold from SCF ID
node plugins/grc-engineer/scripts/scaffold-framework.js apac-sgp-pdpa-2012

# Reference depth with a custom slug
node plugins/grc-engineer/scripts/scaffold-framework.js "Singapore PDPA" \
  --depth=reference --slug=singapore-pdpa

# Preview without writing
node plugins/grc-engineer/scripts/scaffold-framework.js americas-bra-lgpd-2018 --dry-run

# Staging workflow: scaffold files but skip marketplace.json until human review
node plugins/grc-engineer/scripts/scaffold-framework.js emea-che-fadp-2023 --no-register
```

## Error modes

- **Unknown SCF ID / label** → exits with code 2, lists the 5 closest matches.
- **Plugin directory already exists** → exits with code 3 unless `--force` is passed.
- **Offline + cache miss** → exits with a clear message pointing at `~/.cache/claude-grc/scf/`.
- **Invalid slug** → exits with code 1; slug must match `^[a-z][a-z0-9-]*$`.

## Data provenance

Framework metadata (display name, region, country, SCF control counts) comes from the [SCF API](https://grcengclub.github.io/scf-api/) (`api/crosswalks.json` and per-framework `api/crosswalks/<id>.json`). Cached locally under `~/.cache/claude-grc/scf/<version>/` per CC BY-ND 4.0 terms — cached data is redistributed verbatim, never modified.

See [`docs/SCF-ATTRIBUTION.md`](../../../docs/SCF-ATTRIBUTION.md) for licensing detail.

## Next steps after scaffolding

1. Edit `skills/<slug>-expert/SKILL.md` — fill in the `TODO:` sections with framework-specific context.
2. At Reference depth, edit `commands/assess.md`, `commands/scope.md`, `commands/evidence-checklist.md` for framework-specific guidance.
3. Commit. Markdown lint + CODEOWNERS review run on every PR.
4. Claim the matching issue in the [framework coverage tracker](https://github.com/GRCEngClub/claude-grc-engineering/issues/12).
