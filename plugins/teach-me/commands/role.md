---
description: Onboarding primer for a GRC role — what you'll do, what you'll touch in this toolkit, and where to start
---

# /teach-me:role

For someone who just got hired into (or pivoted to) a GRC role. Outputs a practical "your first 90 days" primer for the role, mapped to commands in this toolkit.

## Usage

```
/teach-me:role <persona> [--background=<level>]
```

## Arguments

- `<persona>` (required) — `grc-engineer`, `grc-auditor`, `grc-internal`, `grc-tprm`. Aliases (`engineer`, `auditor`, `internal`, `tprm`, `vendor-risk`) resolve to the canonical name.
- `--background=<level>` (optional) — `none` (career transitioner), `adjacent` (security or platform-engineering background), `practitioner` (already in GRC, switching specialties). Default `none`.

## What this produces

1. **What this role does** — paraphrased role definition; what they own, what they don't, who they report into.
2. **Day in the life** — concrete activities the role performs weekly and quarterly.
3. **What you'll touch in this toolkit** — the persona's plugin (`grc-engineer`, `grc-auditor`, `grc-internal`, `grc-tprm`) plus the framework and connector plugins they'll lean on. Names actual commands.
4. **Common mistakes new-to-role practitioners make** — 2–3, with the toolkit feature that prevents each.
5. **First-week, first-month, first-quarter recommendations** — concrete commands to run, things to read, people to meet.
6. **Adjacent roles you'll work with** — and how their toolkit footprint intersects with yours.

## Delegation

The `framework-tutor` skill is invoked. It reads:

- The persona plugin's commands directory for the actual command surface.
- `MAINTAINERS.md` and `CONTRIBUTORS.md` to point new practitioners at people active in that role.

## Examples

```
/teach-me:role grc-engineer
/teach-me:role auditor --background=adjacent
/teach-me:role grc-tprm --background=practitioner
```
