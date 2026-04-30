---
description: Determine whether APRA CPS 234 applies to the organization
---

# APRA CPS 234 Scope

Determines whether and how APRA Prudential Standard CPS 234 Information Security
applies to the organization. Reference-depth scope is a decision-tree prompt;
Full-depth plugins extend this with entity- and asset-aware logic.

## Usage

```bash
/au-apra-cps-234:scope
```

## What this produces

- **Applicability verdict**: in-scope, out-of-scope, or partially in-scope.
- **In-scope entity types**: APRA-regulated entity, RSE licensee, insurer,
  authorised deposit-taking institution, related party, or third-party service
  provider supporting regulated operations.
- **In-scope assets**: information assets classified by sensitivity,
  criticality, owner, hosting model, and dependency.
- **Jurisdiction reach**: APRA-regulated Australian operations and supporting
  offshore, cloud, related-party, or outsourced services.
- **Next steps**: whether to proceed with `/au-apra-cps-234:assess` or
  `/au-apra-cps-234:evidence-checklist`.

## Framework-specific scope triggers

Ask the minimum questions needed to classify CPS 234 applicability:

- Is the organization an APRA-regulated entity or part of a regulated group?
- Does it manage information assets for an APRA-regulated entity?
- Which information assets are critical or sensitive?
- Which assets are managed by related parties, outsourced providers, cloud
  services, or offshore teams?
- Who owns each information asset and who is accountable for control design,
  control testing, and incident escalation?
- Are there materiality thresholds for information security incidents and
  control weaknesses?
- Are control testing results, third-party assurance, and incident exercises
  reported to board or senior management?

Return an applicability verdict, in-scope assets, accountable owners, and the
follow-up command that should run next. Do not ask users to search CPS 234;
translate their answers into practical scoping outcomes.
