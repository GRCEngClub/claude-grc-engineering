---
name: setup
description: Install the oscal-cli Go binary and register it with the plugin. Idempotent.
---

# /oscal:setup

Installs the OSCAL CLI binary (a fast Go rewrite of NIST's Java `oscal-cli`) and records its path in `~/.config/claude-grc/connectors/oscal.yaml`.

## How to run

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/setup.sh" [--from-source] [--prefix=$HOME/.local]
```

## What it does

1. Detects if `oscal` is already on `PATH`. If so, records version + path and exits success.
2. If `--from-source` is passed (or no binary is available and Go is installed):
   - `git clone https://github.com/ethanolivertroy/oscal-cli ~/.local/share/claude-grc/tools/oscal-cli`
   - `make build`
   - Symlinks the binary into `$PREFIX/bin`
3. Otherwise, downloads the latest release binary for your platform from `gh release list` under `ethanolivertroy/oscal-cli`.
4. Runs `oscal --version` to verify.
5. Writes config:

   ```yaml
   version: 1
   source: oscal
   source_version: "0.1.0"
   binary: "/Users/you/.local/bin/oscal"
   binary_version: "1.0.0"
   oscal_schema_version: "1.1.3"
   ```

## Typical output

```
oscal:setup ✓
  binary:         /Users/you/.local/bin/oscal v1.0.0
  OSCAL schema:   1.1.3
  config:         ~/.config/claude-grc/connectors/oscal.yaml

Next:
  /oscal:validate <file>
  /oscal:convert  <file> --to json|xml|yaml
```

## Failure modes

- **No Go compiler and no release binary for platform**: exit 5. Install Go or grab a binary manually from https://github.com/ethanolivertroy/oscal-cli/releases.
- **Network unavailable**: exit 2.

## Safe to re-run

Yes.
