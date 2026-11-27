---
name: mas-review
description: Review a cloud service offering's Minimum Assessment Scope against the five FedRAMP MAS rules, covering in-scope information resources, information flows, third-party resources and the artifacts an assessor expects. Use when defining or checking scope for a FedRAMP 20x or Rev5 certification.
---

# Minimum Assessment Scope review

The Minimum Assessment Scope (MAS) replaced the "authorization boundary". It is one ruleset of five rules, and it is the same for 20x and Rev5. It applies to Class B, C and D; Class A must meet `MAS-CSO-IIR`.

## Arguments

- Argument 1 - path to scope material: an inventory export, architecture description, infrastructure-as-code folder or data-flow document (optional)

`$ARGUMENTS`

Print the rules as currently bundled, and their full statements once synced:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/rules.js" rules --set=MAS --class=C
node "${CLAUDE_PLUGIN_ROOT}/scripts/rules.js" show MAS-CSO-IIR
```

## The test for scope

An information resource is in scope when it is **likely to handle federal customer data**, or **likely to affect the confidentiality, integrity or availability** of federal customer data the offering handles. That set of resources is the cloud service offering. Everything else the offering depends on is a third-party information resource.

This is narrower than the old boundary on purpose. Do not pull in a resource because it sits in the same account or network. Do not leave one out because it is "only" a management tool, if it can change or read what is in scope.

Two things are outside FedRAMP's scope entirely and are not part of the offering: product categories OMB has excluded, and software the provider ships for installation on agency systems that the provider does not operate (agents, desktop and mobile clients).

## Review each rule

| Rule | Force | What to check |
|---|---|---|
| `MAS-CSO-IIR` Identify Information Resources | MUST | Is there a defined set of in-scope resources, and does each one meet the test above? Is anything that meets the test missing? |
| `MAS-CSO-FLO` Information Flows and Security Categories | MUST | For every in-scope resource: are the information flows documented, and is a security category recorded? |
| `MAS-CSO-TPR` Third-Party Information Resources | MUST | For each third-party resource: what it is used for, why it is justified, what mitigations and compensating controls apply |
| `MAS-CSO-MDI` Metadata Inclusion | MUST | Is metadata, including metadata about federal customer data, treated as part of the scope? |
| `MAS-CSO-SUP` Supplemental Information | MAY | If the package describes resources outside the offering, is that material in a clearly marked, separate supplement? Those resources are not certified. |

Read the rule statements with `show` before making a call on a borderline resource. The one-line descriptions above are a guide, not the rule.

## Artifacts an assessor expects

For `MAS-CSO-IIR` FedRAMP lists three:

1. Machine-readable output listing the in-scope components
2. A human-readable explanation of how that output is derived
3. The code for the automated process that generates it

So a hand-maintained spreadsheet is the weakest form of this evidence. If the inventory comes from cloud APIs or infrastructure-as-code, point to the generator. Generating inventories from authoritative sources is also a KSI in its own right (`KSI-PIY-GIV`).

## What does not belong in a MAS review

Older guidance, including earlier versions of this skill, listed requirements that are not in the rules:

- There is no rule that every production environment, or any development or staging environment, is in scope. Apply the test to each resource.
- Scope does not vary by service model (SaaS, PaaS, IaaS).
- Keeping scope current as the system changes is covered by change notification (the SCN ruleset) and inventory generation, not by MAS.

## Output

- The in-scope set, with any resources that meet the test but are missing, and any that are listed but do not meet it
- For each rule: what is documented, what is missing
- Third-party resources lacking a justification or mitigation
- Whether the three `MAS-CSO-IIR` artifacts exist
- The rules release used

Record the result in the Security Decision Record under the five `MAS-CSO-*` entries with `/fedramp-20x:sdr`.

## Examples

```
/fedramp-20x:mas-review
/fedramp-20x:mas-review ./infrastructure
/fedramp-20x:mas-review ./docs/system-inventory.json
```
