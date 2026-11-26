---
name: collect
description: Query Okta for authentication policies, MFA, password policy, session settings, and admin accounts. Emits schema-conformant findings.
---

# /okta-inspector:collect

Scans an Okta org and emits Findings evaluating identity-related SCF controls.

## How to run

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/collect.js" [options]
```

## Arguments

- `--services=<csv>` — subset of `policies,users,factors,logs` (default: all)
- `--output=<fmt>` — `silent` | `summary` (default) | `json`
- `--include-deactivated` — include deactivated users in the scan (default: no)
- `--inactive-threshold-days=<n>` — flag users inactive beyond this many days (default: 90)
- `--quiet` — no stderr progress

## What it evaluates

**Authentication policies**:

| SCF | Check | Severity |
|---|---|---|
| IAC-01.2 | MFA required for all users | high |
| IAC-06 | Password policy meets baseline (length ≥14, complexity, age ≤90d, history ≥24) | high |
| IAC-15 | Session maximum duration ≤ 12 hours | medium |
| IAC-15 | Session idle timeout ≤ 15 minutes | medium |

**MFA enrollment (per user, sampled)**:

| SCF | Check | Severity |
|---|---|---|
| IAC-01.2 | All admin users have MFA enrolled | critical |
| IAC-01.2 | At least 2 factors enrolled per admin (no single-factor fallback) | high |

**Users**:

| SCF | Check | Severity |
|---|---|---|
| IAC-15.1 | No users inactive > N days (default 90) still active | medium |
| IAC-07.1 | Super-admin count is reasonable (<5 super admins) | medium |

**Audit logs**:

| SCF | Check | Severity |
|---|---|---|
| MON-02 | System log retention reachable (logs fetched successfully) | info |

## Output

- `~/.cache/claude-grc/findings/okta-inspector/<run_id>.json`
- Summary to stdout unless `--quiet`:

  ```
  okta-inspector: 12 resources, 38 evaluations, 4 failing (0 critical, 2 high, 2 medium).
  ```

## Exit codes

- `0` success
- `2` auth invalid
- `3` rate-limited (Okta has tight per-token limits — the connector waits then retries once)
- `4` partial
- `5` config missing — run setup

## Token permissions

A **Read-only** API token created in Okta admin is sufficient. The connector never calls write endpoints. Required scopes (all covered by Read-only):

- Users: read, admins read
- Policies: read
- Groups: read (optional, enhances admin scope analysis)
- System log: read

## Example output narrative

When policies miss the baseline, findings include specific remediation:

```
IAC-06 — Password policy
  fail (high): Okta default password policy 'Default Policy' has minLength=8 (<14),
               no history (<24), maxAgeDays=0 (unset).
  remediation: Tighten the policy for /api/v1/policies/{id} with {settings.password: {...}}.
```

## Examples

```bash
# All checks
export OKTA_API_TOKEN=00abc...
/okta-inspector:collect

# Just authentication policies (fast)
/okta-inspector:collect --services=policies

# Strict inactivity threshold (e.g., FedRAMP 30-day requirement)
/okta-inspector:collect --inactive-threshold-days=30
```
