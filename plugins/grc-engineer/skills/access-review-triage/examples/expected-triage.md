# Access Review Triage — okta 2026-Q2

> Expected output for running `access-review-triage` against the example fixtures in this folder.
> Re-generate this file if the decision rules in `SKILL.md` change.

## Executive summary

| Metric | Count |
|---|---|
| Rows triaged | 9 |
| Auto-certify | 1 |
| Manager confirm | 2 |
| Revoke (suggested) | 1 |
| Investigate | 5 |
| P0 anomalies | 3 |
| P1 anomalies | 2 |

**Scope:** system `okta`, cycle `2026-Q2`, input `okta-access-export.csv` (SHA-256 prefix `<hash>`).

## Inputs and assumptions

| Auxiliary input | Provided? | Effect |
|---|---|---|
| HR list (`hr-list.csv`) | Yes | Rule 1 (terminated user) and rule 6 (role-vs-title) are active. |
| SoD config (`sod-conflicts.yaml`) | Yes | Rule 2 (SoD conflict) is active. |
| Prior decisions (`prior-decisions.csv`) | Yes | Rules 7 (new since last cycle) and 9 (auto-certify) are active. |
| Role definitions | No | Rule 6 (role-vs-title) ran on HR titles only; no expected-entitlement map. |

## P0 anomalies

### 1. `mike.left@acme.com` — terminated user with active access

- **System / role:** okta / analyst
- **Last login:** 2026-04-20
- **HR status:** `terminated`
- **Why P0:** Rule 1. HR list flags this user as terminated. Active access to okta is an audit-fail condition (SOC 2 CC6.2, PCI 8.1.3, ISO A.9.2.6).
- **Recommendation:** Investigate. Confirm separation date with HR, revoke access if confirmed, and document the gap between separation and revocation in a `parse_errors.md`-style retrospective.

### 2. `ap.both@acme.com` — separation-of-duty conflict (AP creator + AP approver)

- **System / roles:** okta / `ap-creator` AND `ap-approver`
- **Last login:** 2026-05-07
- **Why P0:** Rule 2. `sod-conflicts.yaml` defines `[ap-creator, ap-approver]` as a SoD conflict. The user holds both roles. Whoever creates an invoice should not be able to approve it (SOC 2 CC6.1, PCI 7.1, ISO A.9, US-SOX ITGC).
- **Recommendation:** Investigate. Manager and Finance lead should choose which role to retain and revoke the other. Record the decision in the audit packet.

## P1 anomalies

### 3. `dormant.dave@acme.com` — dormant admin

- **System / role:** okta / admin
- **Last login:** 2025-11-20 (171 days ago)
- **Why P1:** Rule 3. Privileged role + last login > 90 days. Dormant admin is a top breach vector. Could indicate a forgotten account or a credential held for off-hours misuse.
- **Recommendation:** Investigate. Confirm whether the user still requires admin access; if yes, why no recent login; if no, revoke.

### 4. `svc-deployer@acme.com` — service account in human review

- **System / role:** okta / deploy-bot
- **Last login:** 2026-05-09
- **Why P1:** Rule 5. Account name matches the `svc-*` service-account pattern. Service accounts belong in a separate review process (ownership, rotation, scope). Including them in a human UAR risks silent certification.
- **Recommendation:** Investigate. Move to the service-account review track. Confirm owner of record and most recent secret rotation.

## Manager confirm queue

Grouped by manager.

### `jdoe@acme.com` (manager: cto@acme.com)

| User | Role | Last login | Reason |
|---|---|---|---|
| jdoe@acme.com | admin | 2026-05-05 | Rule 8: privileged role. Always gets a human in the loop. |

### `marcom.head@acme.com`

| User | Role | Last login | Reason |
|---|---|---|---|
| jane.new@acme.com | marketing | 2026-05-09 | Rule 7: new since last cycle. Not in `prior-decisions.csv`. |

## Revoke (suggested)

| User | Role | Last login | Reason |
|---|---|---|---|
| sleepy.sue@acme.com | viewer | 2025-12-01 (161 days ago) | Rule 4: dormant non-privileged user. Low-cost cleanup. |

## Auto-certified rows

| User | Role | Last login | Why |
|---|---|---|---|
| sarah.kim@acme.com | engineer | 2026-05-08 | Rule 9: unchanged since last cycle, role matches prior cycle, recent login. |

## Control mappings

This review produces evidence for:

| Framework | Controls |
|---|---|
| SOC 2 | CC6.1, CC6.2 |
| PCI DSS v4.0 | 7.1, 7.2, 8.1 |
| ISO 27001 | A.9 |
| NIST 800-53 | AC-2 |

Mappings recorded verbatim in `evidence.json`.

## One-line summary printed at end of run

```
okta 2026-Q2: 9 rows triaged. 1 auto-certify, 2 manager-confirm, 1 revoke (suggested), 5 investigate (3 P0, 2 P1).
```
