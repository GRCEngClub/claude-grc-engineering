---
name: drata-inspector-expert
description: Interpret drata-inspector findings generated from drata-cli workflows and turn Drata control, monitor, evidence, personnel, and integration posture into GRC action.
license: MIT
---

# Drata Inspector Expert

Use this skill when reviewing `drata-inspector` output or planning remediation from Drata workflow findings.

## Source

`drata-inspector` wraps the MIT-licensed [`drata-cli`](https://github.com/ethanolivertroy/drata-cli) workflow commands. It does not reimplement Drata APIs and does not require Drata MCP.

## Output Shape

Findings are written to:

```text
~/.cache/claude-grc/findings/drata-inspector/<run_id>.json
```

Resource types:

- `drata_tenant`: summary status across controls, monitors, personnel, and integrations
- `drata_control`: failing or incomplete controls from `drata controls failing`
- `drata_monitor`: failed automated checks from `drata monitors failing`
- `drata_connection`: disconnected, failed, or never-connected integrations
- `drata_personnel`: personnel/device compliance issues
- `drata_evidence`: stale or expiring evidence from `drata evidence expiring`

## Review Guidance

- Treat Drata-native control codes as source metadata. The connector emits SCF IDs for normalized downstream reporting.
- Keep Drata as the evidence source of record; use these Findings for cross-framework gap analysis and engineering remediation.
- `inconclusive` means a `drata-cli` workflow failed or permissions were insufficient.

## Remediation Patterns

- Assign owners for ownerless controls.
- Refresh stale evidence and repair disconnected evidence sources.
- Investigate failed monitors before assuming a control is ineffective.
- Resolve personnel device compliance failures or document approved exceptions.
- Reconnect Drata integrations that feed automated evidence.
