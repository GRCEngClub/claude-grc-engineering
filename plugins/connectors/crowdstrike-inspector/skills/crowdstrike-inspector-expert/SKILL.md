---
name: crowdstrike-inspector-expert
description: Interpret CrowdStrike Falcon findings for sensor coverage, policy visibility, and host group scoping.
license: MIT
---

# CrowdStrike Inspector Expert

Use this skill when reviewing `crowdstrike-inspector` output.

Findings are written to `~/.cache/claude-grc/findings/crowdstrike-inspector/<run_id>.json`.

Key SCF mappings:

- `END-03`: endpoint sensor coverage
- `CFG-02`: prevention policy visibility
- `MON-01.2`: detection policy visibility
- `AST-02`: host-group scoping visibility

Treat `inconclusive` as an API permission or plan coverage gap, not a pass.
