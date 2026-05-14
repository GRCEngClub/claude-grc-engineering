---
name: testssl-inspector setup
description: Locate testssl.sh (native install or Docker), record version, and write default targets to the connector config.
---

# /testssl-inspector:setup

One-time configuration step. Verifies `testssl.sh` is reachable, captures its version, and seeds a config file with any targets you pass.

## How to run

```bash
bash plugins/connectors/testssl-inspector/scripts/setup.sh [options]
```

## Options

- `--docker` — use the `drwetter/testssl.sh` Docker image instead of a native binary. Pulls the image if not already present.
- `--target=host[:port]` — repeatable; pre-populate the targets list. Port defaults to 443.

## What it does

1. Locates `testssl.sh` — checks `$PATH`, then `~/.local/share/testssl.sh/testssl.sh`, `/opt/testssl.sh/testssl.sh`, `/usr/local/bin/testssl.sh`.
2. If not found and `--docker` not passed, prints install instructions and exits with code 3.
3. Captures the testssl version.
4. Writes `~/.config/claude-grc/connectors/testssl-inspector.yaml` with:
   - `use_docker` and `testssl_path`
   - `testssl_version`
   - `targets:` list (empty if not provided)
5. Creates the cache dir `~/.cache/claude-grc/findings/testssl-inspector/`.

## Install paths

| OS / approach | Command |
|---|---|
| macOS (Homebrew) | `brew install testssl` |
| Debian / Ubuntu | `sudo apt-get install -y testssl.sh` |
| From source | `git clone https://github.com/testssl/testssl.sh ~/.local/share/testssl.sh && export PATH="$HOME/.local/share/testssl.sh:$PATH"` |
| Docker (no install) | run `/testssl-inspector:setup --docker` and the plugin will use the image |

## Exit codes

- `0` success
- `2` unknown flag
- `3` testssl.sh and Docker both unavailable

## Examples

```bash
# Native testssl on PATH, no targets yet
/testssl-inspector:setup

# Docker-based, pre-load two targets
/testssl-inspector:setup --docker --target=example.com --target=api.example.com:8443
```

## Next

```bash
/testssl-inspector:scan --target=example.com
/testssl-inspector:status
```
