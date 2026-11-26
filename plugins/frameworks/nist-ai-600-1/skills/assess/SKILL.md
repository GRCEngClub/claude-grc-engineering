---
name: assess
description: NIST AI 600-1 evidence and gap review via the SCF crosswalk
---

# NIST AI 600-1 Assessment

Reviews evidence relevant to **NIST AI 600-1** by delegating to `/engineer:gap-assessment` with the framework's SCF identifier.

The profile is voluntary guidance layered on AI RMF 1.0. Run
`/nist-ai-600-1:scope` first so the review covers the right generative AI
systems and the GAI risks that matter for them, and run `/nist-ai-rmf:assess`
for the AI RMF program the profile sits inside.

## Usage

```bash
/nist-ai-600-1:assess [--sources=<connector-list>] [--risks=<gai-risk-list>]
```

Delegates to:

```bash
/engineer:gap-assessment "general-nist-600-1-gen-ai-profile" [--sources=<connector-list>]
```

## Arguments

- `--sources=<connector-list>` (optional) — comma-separated list of connector plugins to pull evidence from (e.g. `aws-inspector,github-inspector,okta-inspector`). Defaults to whichever connectors are configured and have recent runs.
- `--risks=<gai-risk-list>` (optional) - limit the report to the GAI risks
  chosen during scoping, for example `confabulation,information-security,data-privacy`.

## Output

A gap report groups observed connector findings by SCF control and maps them to profile items. Missing evidence or a mapped finding is not by itself proof that an action is unmet, a control has failed, or the organization is noncompliant. Review applicability, evidence, and mappings before drawing conclusions; the crosswalk does not establish equivalence. The 250 distinct mapped items are a crosswalk inventory, not a promise that all are assessed. Coverage counts distinct mapped item IDs; where multiple SCF controls map to one item, the report uses the worst observed status. These statuses summarize connector observations, not conformance to NIST guidance.

Report results by AI RMF function and suggested-action ID (for example
`MS-2.7-007`). The gap report carries item IDs but not their GAI risk tags,
so look each action up in the NIST AI 600-1 action tables before tagging it
with the risks it addresses. Mark a tag `unverified` when you cannot confirm
it, and keep unverified items in a `--risks` filtered report instead of
dropping them. Suggested
actions are options, not requirements: an action the organization chose not
to take is a documented decision, not a gap, if the risk is covered another
way.

## Further reading

- [Secure Controls Framework](https://securecontrolsframework.com)
- [SCF API entry for this framework](https://grcengclub.github.io/scf-api/api/crosswalks/general-nist-600-1-gen-ai-profile.json)
- [NIST AI 600-1](https://doi.org/10.6028/NIST.AI.600-1)
