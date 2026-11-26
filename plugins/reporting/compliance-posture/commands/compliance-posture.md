---
description: Serve a localhost compliance posture dashboard from monitor-continuous JSON
---

# Compliance Posture Dashboard

Serves a local HTML dashboard from saved
`/grc-engineer:monitor-continuous` JSON output.

Implementation:
[`scripts/serve.js`](../scripts/serve.js).

## Usage

```bash
/dashboard:compliance-posture --data=<path> [--port=8787]
```

Local script form:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/serve.js" \
  --data=grc-data/dashboard/monitor-continuous \
  --port=8787
```

## Options

- `--data=<path>` - JSON file or directory tree to read. Repeat as
  comma-separated paths.
- `--host=<host>` - Bind host. Defaults to `127.0.0.1`.
- `--port=<port>` - Bind port. Defaults to `8787`.
- `--demo` - Serve built-in demo monitor runs and ignore local JSON.
- `--help` - Show CLI help.

## Monitor Output

Generate dashboard input with:

```text
/grc-engineer:monitor-continuous SOC2,NIST-800-53 --output=grc-data/dashboard/monitor-continuous/<timestamp>.json --no-exit-code
```

This needs the `grc-engineer` plugin. Use a UTC timestamp such as `20260115T020000` for the file name.

The dashboard reads the saved JSON manifests and computes latest state, trends,
and deltas at view time. It does not require Claude to retain historical state.
