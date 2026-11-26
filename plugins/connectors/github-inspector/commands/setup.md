---
name: GitHub Inspector Setup
description: Verify the github-inspector connector's prerequisites and write its config. Idempotent.
---

# /github-inspector:setup

Prepares the github-inspector connector. Confirms `gh` CLI is installed and authenticated, writes `~/.config/claude-grc/connectors/github-inspector.yaml`, and runs a read-only health check.

## How to run

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/setup.sh"
```

The script exits 0 on success, 2 on missing auth, 5 on missing `gh` binary.

## Arguments

None. Reads from the environment:

- `GH_TOKEN` — optional; if set, `gh` uses it directly. Otherwise the script honors whatever `gh auth login` already configured.
- `CLAUDE_GRC_CONFIG_DIR` — override `~/.config/claude-grc`.

## What it does

1. Check that `gh` is on `PATH`. If not, fail with remediation (`brew install gh` or `apt install gh`).
2. Run `gh auth status` to verify an active token.
3. Run `gh api user --jq .login` to confirm the token actually works.
4. Write `~/.config/claude-grc/connectors/github-inspector.yaml` with defaults:

   ```yaml
   version: 1
   source: github-inspector
   source_version: "0.1.0"
   authenticated_as: <your-login>
   defaults:
     scope: "@me"         # "@me" | "org:<name>" | "repo:<owner>/<name>"
     include_archived: false
     include_forks: false
   ```

5. Print a one-line success message and a reminder of next steps.

## Typical output

```
github-inspector:setup ✓
  gh version:       2.59.0
  authenticated as: octocat
  config written:   ~/.config/claude-grc/connectors/github-inspector.yaml

Next: /github-inspector:collect --scope=@me
```

## Failure modes

- **gh not installed**: exit 5. Install `gh` and re-run.
- **gh not authenticated**: exit 2. Run `gh auth login`, then re-run.
- **Token has no user scope**: exit 2. Re-login with `gh auth login --scopes=repo,read:org,read:packages`.

## Safe to re-run

Yes. Running again re-validates auth and rewrites the config. It does not destroy cached findings.
