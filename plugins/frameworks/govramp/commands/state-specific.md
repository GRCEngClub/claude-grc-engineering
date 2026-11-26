---
description: How individual governments use GovRAMP and what they may add on top
---

# GovRAMP State-Specific Requirements

Explains how to find out what a particular state, local, tribal, territorial, or education government expects on top of a GovRAMP verification. GovRAMP sets one program. Each government decides whether it requires a GovRAMP status, which status, and what else it adds.

## Arguments

- Argument 1 - Government (optional: a state code such as `TX`, an agency or district name, or `multi` for a multi-government plan)

## What GovRAMP standardizes

- The verification ladder (Snapshot, Progressing Snapshot, Core, Ready, Authorized/Provisional), its control sets, and continuous monitoring. See `/govramp:assess`.
- The Authorized Product List (APL), which any government can check.
- ConMon visibility: a participating government can request access to a provider's ConMon profile, and the provider approves it.

## What varies by government

Participation in GovRAMP is free for eligible public-sector organizations, and it means different things for different members. GovRAMP's own description is that "participation can reflect exploration, planning, or active implementation." Being on the participating list does not mean a government requires a GovRAMP status in its contracts.

What a government may decide:

- **Whether a status is required**: by statute, by policy, by procurement language, or case by case.
- **Which status**: for example, Core accepted for some purchases and Ready or Authorized required for others.
- **Impact level**: some governments set Moderate or High for certain data types.
- **Extra clauses**: data location, personnel screening, breach notification timing, records retention, audit rights. GovRAMP does not require U.S. citizenship for employees, but a government may add personnel requirements for some data.
- **Other programs**: some states run their own programs alongside or instead of GovRAMP. Texas, for example, has TX-RAMP, run by the Department of Information Resources, with its own levels and rules.

## How to find a government's actual requirements

1. Check [GovRAMP's participating governments list](https://govramp.org/participating-government-organizations) and any program page GovRAMP publishes for that government (GovRAMP has pages for Arizona, Texas, and Utah, among others).
2. Read the solicitation or contract. Its security terms override general guidance.
3. Look for a statute or state IT policy that names GovRAMP or StateRAMP. Many older policies still say StateRAMP; it is the same program.
4. Check the state's breach notification law and records retention schedule. These apply whatever GovRAMP status you hold.
5. Ask the agency's security or procurement office which status and impact level they expect, and get the answer in writing.

Do not rely on remembered numbers for notification windows or retention periods. Cite the statute or contract clause.

## Planning for several governments

- Target the highest status and impact level any planned customer needs. A verification is reused across governments, so one assessment at the right level beats several partial ones.
- Keep a short table per customer: required status, impact level, extra clauses, and the source document for each.
- Write extra clauses into the SSP as customer-specific parameters instead of forking the whole package.
- Starting at Core or Progressing Snapshot gets a product onto the APL early while you work toward Ready or Authorized.

## Output

1. What the named government requires, with a source for each item, or the questions to ask where no source was found
2. Requirements beyond GovRAMP (statutes, policies, contract clauses)
3. For `multi`: the combined target status and impact level, and the per-government extras

## Examples

```bash
/govramp:state-specific TX
/govramp:state-specific "Utah Department of Technology Services"
/govramp:state-specific multi
```

## Related commands

1. `/govramp:assess` for readiness against the target status
2. `/govramp:impact-select` for the impact level
3. `/govramp:documentation` for the package
