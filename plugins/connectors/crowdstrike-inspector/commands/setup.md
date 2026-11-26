---
description: "Configure crowdstrike-inspector for CrowdStrike Falcon API access"
---

# /crowdstrike-inspector:setup

Configure `crowdstrike-inspector` for CrowdStrike Falcon API access.

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/setup.sh" --client-id=<id> --client-secret=<secret>
```

Config is written to:

```text
~/.config/claude-grc/connectors/crowdstrike-inspector.yaml
```

Secrets are stored separately with user-only file permissions.

## Options

- `--client-id=<id>` or `FALCON_CLIENT_ID`
- `--client-secret=<secret>` or `FALCON_CLIENT_SECRET`
- `--base-url=<url>` defaults to `https://api.crowdstrike.com`

## Next

```text
/crowdstrike-inspector:collect
/crowdstrike-inspector:status
```
