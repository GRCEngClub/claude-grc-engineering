---
description: NIST AI RMF 1.0 gap assessment via the SCF crosswalk, reported by AI RMF function and subcategory
---

# NIST AI RMF 1.0 Assessment

Runs a gap assessment against **NIST AI 100-1 (AI RMF 1.0)** by delegating to
`/engineer:gap-assessment` with the framework's SCF identifier, then reports
the results in AI RMF terms: function, category, and subcategory ID.

AI RMF is an outcomes framework, not a control catalog. A gap means the
organization cannot show evidence that an outcome is achieved for the AI
systems in scope. It does not mean a mandatory requirement is violated.

## Usage

```bash
/nist-ai-rmf:assess [--sources=<connector-list>] [--systems=<ai-system-ids>]
```

Delegates to:

```bash
/engineer:gap-assessment "general-nist-100-1-ai-rmf" [--sources=<connector-list>]
```

Run `/nist-ai-rmf:scope` first. The assessment is only meaningful for a defined
set of AI systems and a stated organizational role (developer, deployer, or
both).

## Arguments

- `--sources=<connector-list>` (optional) - connector plugins to pull evidence
  from (for example `aws-inspector,github-inspector,okta-inspector`). Defaults
  to configured connectors with recent runs. Connectors cover the
  infrastructure side (access, logging, change control); most AI RMF evidence
  is documentary and must be supplied by hand.
- `--systems=<ai-system-ids>` (optional) - limit the report to named systems
  from the AI system inventory.

## Output

- Results grouped by function (GOVERN, MAP, MEASURE, MANAGE), then by
  category, with subcategory IDs such as `GOVERN 1.4` or `MEASURE 2.11`.
- For each subcategory: status (evidenced, partial, no evidence, not
  applicable), the evidence found, and the SCF controls that drove the
  mapping.
- A short current-profile summary: which outcomes the organization achieves
  today, as input to a target profile.
- Applicability notes. Some subcategories only apply to developers (for
  example, training-data documentation) or only to deployers (for example,
  post-deployment monitoring of a purchased model).

Do not label the result "compliant" or "non-compliant". Use "evidenced" and
"not evidenced", and keep the organization's own risk tolerance in view: AI
RMF expects organizations to prioritize outcomes, not achieve all 72.

## Further reading

- [NIST AI 100-1](https://doi.org/10.6028/NIST.AI.100-1)
- [AI RMF Playbook](https://airc.nist.gov/airmf-resources/playbook/)
- [SCF API entry for this framework](https://grcengclub.github.io/scf-api/api/crosswalks/general-nist-100-1-ai-rmf.json)
