# /vanta-bridge:setup

Configure the Vanta normalization bridge.

```bash
plugins/bridges/vanta-bridge/scripts/setup.sh
```

This bridge does not vendor or replace Vanta's official plugin. Users should install Vanta's plugin directly:

```text
/plugin marketplace add VantaInc/vanta-mcp-plugin
/plugin install vanta
```

The setup command records the expected Vanta region and verifies whether a Claude plugin CLI is available to inspect local plugin state.

## Options

- `--region=us|eu|aus` records the Vanta MCP region for operator context and future direct-MCP sync. The current `sync` command normalizes local JSON input and does not make region-specific network calls.
- `--input=<path>` records the default Vanta MCP/export JSON path for sync.

## Output

Config is written to:

```text
~/.config/claude-grc/bridges/vanta-bridge.yaml
```
