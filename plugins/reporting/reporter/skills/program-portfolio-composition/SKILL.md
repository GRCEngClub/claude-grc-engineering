---
name: program-portfolio-composition
description: Patterns for synthesizing findings across multiple frameworks into one readable portfolio view. Use when a /report:* command is pulling from more than one framework plugin and needs to avoid drowning the reader in control IDs.
allowed-tools: Read, Glob, Grep
---

# Program Portfolio Composition

Most GRC programs run 3 to 8 frameworks. Presenting each one in full is how leadership reports get ignored. The job is to show the portfolio, not every control.

## The SCF crosswalk is the unifier

Most "different" controls across frameworks map back to the same SCF control. `SCF IAC-01` shows up as SOC 2 CC6.1, NIST AC-2, ISO A.5.16, CMMC AC.L2-3.1.1, and more. When you report the portfolio, collapse down to SCF first, then expand back to frameworks for the appendix.

A 15-framework program is usually a 400 SCF control program. That's the denominator that matters.

## The 3 views that work

**1. Coverage table (one row per framework)**

| Framework | Coverage | 30-day delta | Top gap | Owner |
| --- | --- | --- | --- | --- |
| SOC 2 | 82% | +3 pp | Access reviews | IAM |

Five columns. Never more. If you need more, split into a second table with a clear break (e.g., "priority frameworks" vs "monitored frameworks").

**2. Leverage list (cross-framework patterns)**

Controls that fail in 3+ frameworks. Fix one, close many. This is the board-friendly version of "we are investing in the right things."

Example: "`SCF IAC-15` (account-recertification) fails in SOC 2, FedRAMP, and ISO 27001. One automation project closes all three. Scoped for Q2."

**3. Watch list (at-risk items)**

Controls or frameworks trending down. Specifically name what could slip, why, and what prevents it.

## What to drop from the portfolio view

- Individual control status for anything that's green. It noise-floors the real signal.
- Framework-specific language that doesn't translate. A SOC 2 person and a FedRAMP person use different vocabulary for the same thing. Use the SCF vocabulary in the body.
- Every connector. Name the 2-3 that produce the most findings; relegate the rest to appendix.

## What the appendix carries

- Per-framework full gap reports, linked
- SCF-to-framework crosswalk run ID
- Connector inventory and coverage map
- Any framework that was descoped this period, with reason

## Red flags while composing

If the portfolio view is more than 2 pages, it has become the detailed report.

If the leverage list is empty, either you haven't mapped through SCF yet, or the program has no compounding work in flight. The first is a tooling fix. The second is a program problem worth naming.

If every framework shows identical coverage week over week, the pipeline isn't producing fresh findings. Flag this in the report rather than reporting stale numbers as if they were current.
