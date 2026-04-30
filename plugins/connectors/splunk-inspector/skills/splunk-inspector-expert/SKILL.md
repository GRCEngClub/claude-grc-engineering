---
name: splunk-inspector-expert
description: Interpret splunk-inspector findings and translate Splunk retention, RBAC, audit, search ACL, and auth posture into compliance evidence and remediation.
license: MIT
---

# Splunk Inspector Expert

Use this skill when reviewing `splunk-inspector` output or planning Splunk logging and access-control remediation.

## Output Shape

Findings are written to:

```text
~/.cache/claude-grc/findings/splunk-inspector/<run_id>.json
```

Resource types:

- `splunk_deployment`
- `splunk_index`
- `splunk_role`

## Control Focus

- `LOG-05`: log retention
- `LOG-08`: audit event coverage
- `IAC-07`: role and saved-search access control
- `IAC-04`: SSO / authentication method visibility

## Review Guidance

- Treat missing API permissions as coverage gaps, not passes.
- Confirm retention expectations with the user's regulatory and incident-response needs before accepting short retention.
- Broad capabilities such as `admin_all_objects`, `edit_roles`, and `indexes_edit` require owner review.
- Local authentication may be valid for break-glass accounts, but should be documented and monitored.

## Remediation Patterns

- Increase retention on regulated or security-relevant indexes.
- Preserve `_audit` data and export it where long-term retention is required.
- Restrict broad role capabilities and review inherited roles.
- Limit saved-search sharing and write access.
- Prefer SAML/LDAP/SSO-backed authentication for normal users.
