---
name: collect
description: Run read-only Rippling checks for offboarding, app access of terminated workers, device encryption and management, reporting lines and activity-log availability. Emits schema-conformant findings.
---

# /rippling-inspector:collect

Reads workers, users, devices, app accounts and the activity log from the Rippling REST API and emits Findings against SCF controls. Every request is a `GET`.

## How to run

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/collect.js" [options]
```

Run `/rippling-inspector:setup` first. The token must be exported in the shell that runs this command.

## Arguments

- `--services=<csv>`: subset of `access,devices,apps,activity` (default: all)
- `--offboarding-window-days=<n>`: report passing offboardings, and look up app accounts, for workers terminated within n days (default: 365). Active accounts of terminated workers are reported however old the termination is.
- `--max-app-lookups=<n>`: most recent terminated workers to look up app accounts for (default: 200). Each is one API call.
- `--max-pages=<n>`: pages of 100 records to read per list before stopping (default: 2000, which is 200,000 records). If a list is cut off, the checks that need the whole list report `inconclusive` instead of guessing.
- `--stale-device-days=<n>`: flag active devices with no check-in for n days (default: 30)
- `--retired-states=<csv>`: device lifecycle states that count as returned (default: `DECOMMISSIONED,FULL_WIPED,E_CYCLED,SOLD,LOCKED,MDM_LOCKED`)
- `--top-level-workers=<n>`: active workers allowed to have no manager (default: 1)
- `--activity-days=<n>`: days of activity log to sample, at most 90 (default: 30)
- `--output=<fmt>`: `summary` (default), `json` or `silent`
- `--quiet`: no progress on stderr

## What it evaluates

| Service | SCF | Check | Severity when failing |
|---|---|---|---|
| `access` | IAC-07.2 | A user account is still active although every worker record for that person is terminated | critical after 30 days, otherwise high |
| `access` | IAC-17 | More active workers lack a manager than the allowance | low |
| `apps` | IAC-07.2 | A terminated worker's third-party app account is still provisioned, or its removal failed or is pending | high or medium |
| `devices` | CRY-05 | Disk encryption is off on an active macOS or Windows device | high |
| `devices` | END-01 | An active device is not managed or not enrolled | medium |
| `devices` | AST-02 | An active device has not checked in within the threshold | low |
| `devices` | AST-10 | A device is still assigned to a terminated worker and is not in a retired state | medium |
| `activity` | MON-01 | The activity log is readable; the message counts failures and actions by Rippling staff | info |
| `activity` | MON-10 | Always `inconclusive`: Rippling keeps 90 days, so the user must confirm export elsewhere | low |

A person rehired into the company has several worker records for one user. The offboarding check groups by user, so a rehire is not flagged.

## Output

- `~/.cache/claude-grc/findings/rippling-inspector/<run_id>.json`, readable only by the user
- A line appended to `~/.cache/claude-grc/runs.log`
- A summary on stdout:

  ```
  rippling-inspector: 14 resources, 22 evaluations, 10 failing (1 critical, 4 high, 3 medium), 2 inconclusive.
  Coverage is limited to what the token owner can see in Rippling; a list can be short without any error.
  findings: ~/.cache/claude-grc/findings/rippling-inspector/20261127011211-40f55d7c.json
  ```

Findings identify people and devices by Rippling's opaque IDs. Names, emails, phone numbers, addresses, pay and termination reasons are never written, even when the API returns them. Apps are named by their catalog handle (`slack`, `github`), not by the display name, which is free text a customer can put anything in. Device serial numbers are kept in `raw_attributes` so a device can be found.

When the connector could not check something (a hidden field, a list that was cut off, terminated workers beyond `--max-app-lookups`), it writes an `inconclusive` finding saying so. A clean run with inconclusive findings is not a clean result.

## Exit codes

- `0`: completed
- `2`: bad arguments, token variable unset, or token rejected (HTTP 401)
- `3`: rate limited after retries
- `4`: one or more services failed; the rest were written
- `5`: not configured

A service the token cannot read (HTTP 403) is not an error. It produces one `inconclusive` finding naming the scopes it needs, and the run exits `0`.

## Examples

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/collect.js"
node "${CLAUDE_PLUGIN_ROOT}/scripts/collect.js" --services=access,apps --offboarding-window-days=90
node "${CLAUDE_PLUGIN_ROOT}/scripts/collect.js" --services=devices --stale-device-days=14 --output=json
```

Then feed the findings to a gap assessment:

```
/engineer:gap-assessment SOC2,ISO27001 --sources=rippling-inspector
```
