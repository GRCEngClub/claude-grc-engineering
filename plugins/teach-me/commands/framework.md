---
description: Get a working primer on a GRC framework — purpose, scope, artifacts, cadence, and where to start
---

# /teach-me:framework

Produce a working primer on a framework for someone who doesn't know it yet. The output is a paraphrased explainer the reader can act on — not a regurgitation of the standard.

## Usage

```
/teach-me:framework <framework-name> [--background=<level>]
```

## Arguments

- `<framework-name>` (required) — common name (`SOC2`, `FedRAMP`, `ISO 27001`, `PCI DSS`) or SCF framework ID (`apac-sgp-pdpa-2012`). The `framework-tutor` skill resolves aliases.
- `--background=<level>` (optional) — `none` | `adjacent` | `practitioner`. Adjusts depth. Defaults to `none` (career-transitioner audience).

## What this produces

A primer covering, in order:

1. **In one paragraph** — what this framework exists to do and who it affects.
2. **Who must comply** — territorial scope, entity types, common triggers.
3. **What you have to produce** — the named artifacts (e.g. SOC 2 SOC report, FedRAMP SSP/SAP/SAR/POA&M, ISO 27001 SoA, PCI ROC/SAQ).
4. **Cadence** — assessment frequency, recertification windows, breach-notification clocks.
5. **Who enforces it** — regulator or accrediting body, recent enforcement patterns worth knowing.
6. **Control families at a glance** — names + count, no normative text.
7. **Common misinterpretations** — 2–3 things people new to this framework get wrong.
8. **Where to go next in this toolkit** — the framework's own plugin (`/<framework>:scope`, `/<framework>:assess`) plus `/teach-me:control <id>` for any control the user wants to drill on.

## Delegation

The `framework-tutor` skill is invoked. It calls:

- `/grc-engineer:frameworks` to confirm the framework has a plugin and to fetch its `framework_metadata` (depth, region, SCF ID, control counts).
- The SCF API at [`grcengclub.github.io/scf-api`](https://grcengclub.github.io/scf-api/) for the framework's mapped control list (control IDs and families only).

If the requested framework has no plugin in this toolkit, the primer still produces output but flags it: "This framework has no dedicated plugin. SCF crosswalk gives you the control set; ask `/teach-me:framework SOC2` (or similar) for a flow that has full plugin support."

## What this command will not do

- **Not reproduce normative standard text.** PCI DSS, ISO 27001, HITRUST text is copyrighted. This primer paraphrases and references control IDs only. The reader's licensed copy of the standard is the source of truth.
- **Not give legal advice.** Frameworks like ITAR/EAR have legal exposure; the primer flags that and points at the framework plugin's own disclaimer.
- **Not invent control IDs.** Every control reference comes from SCF or the framework plugin's own metadata.

## Examples

```
/teach-me:framework SOC2
/teach-me:framework FedRAMP --background=adjacent
/teach-me:framework apac-sgp-pdpa-2012 --background=practitioner
/teach-me:framework "ISO 27001"
```
