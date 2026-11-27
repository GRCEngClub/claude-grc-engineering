---
name: rippling-inspector-expert
description: Interpret rippling-inspector findings and explain what the Rippling API can and cannot show about offboarding, app access, devices and audit logs. Use when the user asks about Rippling evidence, joiner-mover-leaver controls from HR data, or why a Rippling check is inconclusive.
---

# Rippling inspector

`rippling-inspector` reads Rippling's REST API (`https://rest.ripplingapis.com`) with a customer's own read-only API token and turns what it finds into Findings. Rippling is the system of record for who works at the company, so it is the best source for one question auditors always ask: when someone left, was their access removed?

Use `/rippling-inspector:setup`, then `/rippling-inspector:collect`. `/rippling-inspector:status` shows whether the token still works.

## Never handle the token

The token lives in an environment variable in the user's shell. Do not ask for it, do not echo it, and do not run commands that would print the environment. If a command fails for lack of a token, tell the user to export it in their own terminal.

## What each finding means

- **`rippling_user`, IAC-07.2, fail.** Every worker record for this person is terminated, yet the user account can still sign in. This is the finding to act on first. Severity is critical once 30 days have passed since the end date.
- **`rippling_app_user`, IAC-07.2.** Rippling's record of a terminated worker's account in a connected app. `CREATE_CONFIRMED` or `INVITE_CONFIRMED` means still provisioned; `DELETE_FAILED` or `SUSPEND_FAILED` means Rippling tried to remove it and could not. Both are high. This is what Rippling believes, not proof from the app, so confirm in the app before closing the finding.
- **`rippling_device`.** CRY-05 is disk encryption (FileVault or BitLocker; Rippling does not report it for iOS and iPadOS). END-01 is MDM management and enrolment. AST-02 is a stale check-in. AST-10 is a device still assigned to someone who has left.
- **`rippling_reporting_structure`, IAC-17.** Active workers with no manager beyond the allowance. Manager-based access reviews have no reviewer for them. Low severity; often a data-quality issue.
- **`rippling_activity_log`.** MON-01 passes when the log is readable. MON-10 is always inconclusive because Rippling keeps only 90 days; the user must show that events are exported somewhere that meets their retention requirement.

## Why a check is inconclusive

- **Missing scope or product.** A 403 produces one inconclusive finding that names the scopes needed. "Insufficient entitlements" means the company has not bought that API; device and app data need Rippling's IT products.
- **Redacted fields.** Rippling returns `null` for fields the token's owner cannot see and lists them in `__meta.redacted_fields`. The connector reports inconclusive instead of treating `null` as "no manager" or "inactive".
- **Activity log.** Only full admins and Activity Log admins see company-wide events.
- **Cut-off lists.** If a list stops at `--max-pages`, offboarding and reporting-line checks are not attempted, because a rehire's active record could be on a page that was not read.
- **Missing end dates.** Terminated workers with no readable end date cannot be placed in the look-back window, so their app accounts are not checked and the run says how many.

## Limits to state plainly

- **Partial visibility is silent.** A token sees only what its creator can see. A list can be short with HTTP 200 and no signal. Compare the worker count in the run with the headcount the user expects before relying on a clean result.
- **Not available from the API, so not checked:** admin roles and permission profiles, MFA or SSO enforcement, password and session policy, per-user MFA enrolment, last sign-in, installed software, patch or antivirus state, and API token inventory. Use an identity-provider connector such as `okta-inspector` for sign-in policy.
- **Statuses.** Only `TERMINATED` counts as terminated and only `ACTIVE` counts for the manager check. `INIT`, `HIRED` and `ACCEPTED` workers are not evaluated.
- **Nothing here has been run against a production Rippling tenant by the maintainers.** Request and response shapes follow Rippling's documentation as of November 2026. Whether `GET /app-users/` requires a `worker_id` filter is documented inconsistently; the connector always sends one.

## Personal data

Findings carry opaque Rippling IDs, dates and states. The connector never writes names, emails, phone numbers, addresses, pay, demographic fields or termination reasons. Keep it that way when summarising: refer to people by ID and let the user look them up in Rippling.

## Terms of use

Rippling's developer terms restrict letting third-party systems, including AI agents, use an API key, and restrict passing data to third parties. The connector is built so the token stays in the user's environment and the data stays on their machine, but the user is responsible for checking their own Rippling agreement. Do not describe this connector as endorsed by Rippling.

## Feeding other commands

```
/engineer:gap-assessment SOC2,ISO27001 --sources=rippling-inspector
```

The gap assessment maps each SCF control to the chosen frameworks through the SCF crosswalk. IAC-07.2, for example, maps to ISO 27002:2022 control 5.18 and NIST 800-53 AC-2. Do not quote a mapping from memory; let the assessment resolve it.
