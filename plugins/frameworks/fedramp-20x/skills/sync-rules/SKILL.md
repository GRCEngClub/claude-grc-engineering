---
name: sync-rules
description: Check whether FedRAMP has published a newer release of its machine-readable Consolidated Rules and download it for the other fedramp-20x commands. Use before relying on a rule statement, KSI list or timeframe.
---

# Sync FedRAMP rules

FedRAMP publishes all of its rules as one JSON file in <https://github.com/FedRAMP/rules> and updates it about monthly, usually in the first week of the month. This plugin bundles an index of one release so it works offline. This command checks for a newer release and downloads the full file.

## Arguments

- Argument 1 - `check` (default) or `sync`

`$ARGUMENTS`

## Check

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/rules.js" status
```

Prints three versions: the bundled index, your cached copy if there is one, and the release FedRAMP has published. Add `--offline` to skip the network.

## Sync

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/rules.js" sync
```

Downloads the published release to `~/.cache/claude-grc/fedramp/fedramp-consolidated-rules.json`. After that, `rules.js show <ID>` prints the full statement and notes of any rule.

## What the cached copy changes, and what it does not

- `show` uses the cached file for rule statements and notes.
- The lists and timeframes printed by `ksi`, `rules` and `timeframes`, and the checks in `/fedramp-20x:sdr` and `/fedramp-20x:ver-report`, use the **bundled index**. When `status` shows the published release differs from the bundled one, tell the user, and check anything that matters (a timeframe, whether a KSI applies to a class) against the cached file or <https://www.fedramp.gov/2026/> before relying on it.
- A maintainer of this plugin refreshes the bundled index with `node tools/build-fedramp-index.mjs` from a clone of the repository.

## What changed in a release

FedRAMP keeps a changelog at <https://www.fedramp.gov/2026/changelog/> and in `CHANGELOG.yml` in the rules repository. Read it rather than guessing from a diff. Treat the version as an opaque label: FedRAMP has said the numbering scheme will change.

## Notes

- The old source, `FedRAMP/docs` with its `FRMR.*.json` files, was retired in June 2026. It now redirects to a legacy repository that says it is not a source of truth. Nothing in this plugin reads it.
- This command runs only when you ask. The plugin has no hook and makes no network request on its own.

## Examples

```
/fedramp-20x:sync-rules
/fedramp-20x:sync-rules sync
```
