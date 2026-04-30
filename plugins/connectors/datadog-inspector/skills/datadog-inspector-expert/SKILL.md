---
name: datadog-inspector-expert
description: Interpret datadog-inspector findings and translate Datadog monitoring, audit, log-retention, SSO, and RBAC results into GRC evidence and remediation.
license: MIT
---

# Datadog Inspector Expert

Use this skill when reviewing `datadog-inspector` output or planning Datadog control remediation.

## Output Shape

Findings are written to:

```text
~/.cache/claude-grc/findings/datadog-inspector/<run_id>.json
```

The connector emits a `datadog_organization` resource with SCF evaluations for:

- `DCH-07`: log retention
- `LOG-08`: audit log availability
- `MON-01.2`: critical monitor coverage
- `IAC-04`: SSO enforcement visibility
- `IAC-07`: RBAC role inventory visibility
- `GOV-03`: organization/API inventory

## Review Guidance

- Treat `inconclusive` as a permission or plan-coverage gap, not a pass.
- Confirm monitor coverage against the user's actual critical service inventory; the collector can only infer criticality from Datadog monitor metadata.
- Pair API output with Datadog org settings screenshots when SSO or audit APIs are unavailable.

## Remediation Patterns

- Set log index retention according to incident-response and regulatory requirements.
- Ensure audit events are retained and exportable to long-term evidence storage.
- Create monitors for production services and route critical alerts to incident response.
- Enforce SSO and review local-user exceptions.
- Review custom roles for least privilege.
