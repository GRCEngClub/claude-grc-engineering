---
description: NIST AI 600-1 evidence and gap review via the SCF crosswalk
---

# NIST AI 600-1 Assessment

Reviews evidence relevant to **NIST AI 600-1** by delegating to `/grc-engineer:gap-assessment` with the framework's SCF identifier.

This is a **stub plugin** — the underlying gap assessment is powered by the SCF crosswalk (139 SCF controls mapped to 250 non-normative profile / suggested-action items). To add framework-specific workflow commands, evidence checklists, or implementation guidance, see the [Framework Plugin Guide](../../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) for the level-up path to Reference or Full depth.

## Usage

```
/nist-ai-600-1:assess [--sources=<connector-list>]
```

Delegates to:

```
/grc-engineer:gap-assessment "general-nist-600-1-gen-ai-profile" [--sources=<connector-list>]
```

## Arguments

- `--sources=<connector-list>` (optional) — comma-separated list of connector plugins to pull evidence from (e.g. `aws-inspector,github-inspector,okta-inspector`). Defaults to whichever connectors are configured and have recent runs.

## Output

A gap report groups observed connector findings by SCF control and maps them to profile items. Missing evidence or a mapped finding is not by itself proof that an action is unmet, a control has failed, or the organization is noncompliant. Review applicability, evidence, and mappings before drawing conclusions; the crosswalk does not establish equivalence. The 250 distinct mapped items are a crosswalk inventory, not a promise that all are assessed. Coverage counts distinct mapped item IDs; where multiple SCF controls map to one item, the report uses the worst observed status. These statuses summarize connector observations, not conformance to NIST guidance.

## Further reading

- [Secure Controls Framework](https://securecontrolsframework.com)
- [SCF API entry for this framework](https://grcengclub.github.io/scf-api/api/crosswalks/general-nist-600-1-gen-ai-profile.json)
- [NIST AI 600-1](https://doi.org/10.6028/NIST.AI.600-1)
