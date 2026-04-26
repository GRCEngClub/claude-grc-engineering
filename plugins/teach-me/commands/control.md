---
description: Explain a single control once and show every framework it maps to via the SCF crosswalk
---

# /teach-me:control

Take one control — by SCF ID, framework-specific ID, or plain English — and explain what it means, why it exists, what evidence proves it, and every other framework that maps to it. Designed for the question "I have to implement CC6.1 / IA-2 / 8.3 / CHG-02 — what is this and where else does it show up?"

## Usage

```
/teach-me:control <control-id> [--lens=<framework>]
```

## Arguments

- `<control-id>` (required) — accepts:
  - SCF ID (e.g. `IAC-01`, `CHG-02`)
  - Framework-specific ID (e.g. `CC6.1` for SOC 2, `IA-2` for NIST 800-53, `8.3` for ISO 27001)
  - Plain-English description (e.g. "MFA on root accounts") — the `control-explainer` skill resolves to the closest match and lists alternatives if ambiguous.
- `--lens=<framework>` (optional) — explain the control through one framework's vocabulary. Default is SCF.

## What this produces

1. **In plain English** — what this control requires, paraphrased. No normative quoting.
2. **Why it exists** — the threat or failure mode the control addresses.
3. **What good looks like** — 2–3 evidence patterns that demonstrate the control is in place.
4. **Common implementation gaps** — where teams typically half-implement this control.
5. **Cross-framework view** — every framework in the SCF crosswalk that maps this SCF control, with their local IDs. Lets the reader see "the same control shows up as CC6.1, IA-2, and 8.3."
6. **Where this shows up in the toolkit** — relevant connector that detects it (e.g. `/aws-inspector:setup` for IAM controls), framework plugins that include it, and `/grc-engineer:test-control` to validate end-to-end.

## Delegation

The `control-explainer` skill calls:

- `/grc-engineer:map-controls-unified` for the cross-framework view.
- The SCF API for the canonical control vocabulary.
- Reads the relevant framework plugins' `skills/<framework>-expert/SKILL.md` for any framework-specific notes the plugin author left.

## Examples

```
/teach-me:control IAC-01
/teach-me:control CC6.1 --lens=SOC2
/teach-me:control "MFA on root accounts"
/teach-me:control IA-2 --lens="NIST 800-53"
```
