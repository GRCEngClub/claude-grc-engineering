---
name: scope
description: Define the system boundary and select the ISM controls in scope for an IRAP assessment
---

# IRAP Scope

Covers the first two steps of the ISM risk management framework: define the system, and select security controls. The output is a scope record an IRAP assessor and the customer's authorising officer can work from.

## Usage

```bash
/irap:scope [--classification <official|official-sensitive|protected|secret>] [--profile <file>]
```

## Arguments

- `--classification`: the highest classification the system will hold. If not given, run `/irap:classification` first.
- `--profile <file>` (optional): YAML or JSON describing the system. Without it, the command asks the questions below.

## Questions

| Question | Why it matters |
|---|---|
| What is in the system boundary: services, environments, management plane, support tooling, staff locations? | The assessment covers what is in the boundary. Admin and support paths are often missed |
| What is the highest classification of data it will store, process, or communicate? | ISM controls are selected by applicability marking (NC, OS, P, S, TS) |
| Which agencies will use it, and who is each one's authorising officer? | Each customer's CISO (or delegate) authorises its own use |
| Does the system implement or inherit Essential Eight controls? Which maturity level is targeted? | Controls marked with Essential Eight maturity levels apply to that target |
| What does the system inherit from underlying providers (for example an IaaS platform with its own IRAP report)? | Inherited controls are scoped as inherited, with the provider's report as evidence |
| Where are data, backups, and support personnel located? | Feeds `/irap:data-residency` and any customer contract terms |
| Which ISM guidelines touch the system? Examples: gateways, email, cryptography, data transfers, database systems, software development | Lets you skip guidelines that don't apply, with a recorded reason |
| Which ISM release are you assessing against? | ASD updates the ISM regularly. Name the release (for example September 2026) and record it |

## Output

- The system definition: boundary, criticality, and security and resilience objectives.
- The classification and the ISM release used.
- Applicable ISM guidelines. Excluded guidelines are listed with reasons.
- A control set filtered by applicability marking. Each control is tagged as implemented, inherited, not applicable (with reason), or planned.
- The Essential Eight target maturity level, if one applies.
- The authorising officer or officers, and any customer-specific requirements.

## Notes

- Tailoring is allowed. Every control you decide not to implement needs a reason and the risk it leaves, because the authorising officer has to accept that risk.
- The SCF crosswalk used by `/irap:assess` maps to the June 2024 ISM. Check control IDs against the release you name here.

## Next step

```bash
/irap:evidence-checklist <guideline>
```
