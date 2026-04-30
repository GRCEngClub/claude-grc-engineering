---
name: vanta-bridge-expert
description: Interpret vanta-bridge normalized findings and explain the dual-install Vanta plugin plus GRC Engineering bridge workflow.
license: MIT
---

# Vanta Bridge Expert

Use this skill when reviewing Findings produced by `vanta-bridge`.

## Bridge Model

`vanta-bridge` does not implement Vanta's MCP server and does not vendor Vanta's Claude Code plugin. Users install Vanta's official plugin, export or provide MCP output, and this bridge normalizes that output into Finding schema v1.

## Output Shape

Findings are written to:

```text
~/.cache/claude-grc/findings/vanta-bridge/<run_id>.json
```

Resource types include:

- `vanta_test_entity`
- `vanta_control`
- `vanta_vulnerability`

## Review Guidance

- Prefer `SCF` evaluations when the input includes `scf_control_id`.
- Fall back to framework-native IDs such as `SOC2-TSC-2017` or `ISO-27001-2022` when no SCF mapping is present.
- Treat missing collections in the input as an export coverage issue, not a Vanta compliance result.
- Preserve Vanta IDs and URLs in evidence references for audit traceability.
