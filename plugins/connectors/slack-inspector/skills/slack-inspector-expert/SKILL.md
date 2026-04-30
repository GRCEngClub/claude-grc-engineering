---
name: slack-inspector-expert
description: Interpret slack-inspector findings, explain Slack API coverage limits, and turn Slack workspace posture results into control evidence or remediation.
license: MIT
---

# Slack Inspector Expert

Use this skill when reviewing output from `slack-inspector` or planning remediation for Slack workspace security.

## Output Shape

`slack-inspector` writes Finding schema v1 documents to:

```text
~/.cache/claude-grc/findings/slack-inspector/<run_id>.json
```

Each run emits a workspace-level `slack_workspace` resource with SCF evaluations for:

- `IAC-02`: MFA / 2FA evidence
- `IAC-04`: SSO and session-duration evidence
- `DCH-07`: message and file retention visibility
- `TPM-03`: app approval workflow visibility
- `DLP-01`: DLP or discovery visibility
- `GOV-03`: workspace metadata inventory

## Coverage Limits

Slack exposes many workspace governance controls only through Enterprise Grid or admin-scoped APIs. Treat `inconclusive` as a coverage signal, not as a pass:

- `missing_scope`, `not_allowed_token_type`, or `not_authed`: request an admin-approved token with the listed scope.
- `feature_not_enabled` or `enterprise_required`: verify manually in Slack Enterprise Admin settings or document plan limitations.
- `channel_not_found` on retention checks: configure a representative channel for retention policy sampling.

## Review Guidance

- Prefer SCF control IDs already present in the finding.
- Do not claim Slack-wide 2FA, SSO, retention, app approvals, or DLP are compliant from a bot-token-only run.
- For audit evidence, pair collector output with Slack admin screenshots or exported policy records when the API returns inconclusive.

## Remediation Patterns

- Require 2FA for all users, especially workspace owners and admins.
- Enforce SSO and appropriate session duration through Enterprise settings.
- Enable app approval workflows and periodically review approved applications.
- Define retention rules for messages and files according to legal and compliance requirements.
- Enable DLP or discovery integrations where regulated data may appear in Slack.
