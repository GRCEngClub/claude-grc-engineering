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

- `--region=us|eu|aus` selects the Vanta MCP region. Default: `us`.
- `--input=<path>` records the default Vanta MCP/export JSON path for sync.

## Output

Config is written to:

```text
~/.config/claude-grc/bridges/vanta-bridge.yaml
```
