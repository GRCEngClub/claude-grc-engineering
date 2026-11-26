---
name: assess
description: FINRA broker-dealer cybersecurity gap assessment via the SCF crosswalk
---

# FINRA Cybersecurity Assessment

Runs a gap assessment for a FINRA member firm by delegating to `/engineer:gap-assessment` with the SCF framework ID `usa-federal-sro-finra` (17 SCF controls map to 39 framework controls).

## Usage

```bash
/us-finra:assess [--sources=<connector-list>]
```

Delegates to:

```bash
/engineer:gap-assessment "usa-federal-sro-finra" [--sources=<connector-list>]
```

## Arguments

- `--sources=<connector-list>` (optional): comma-separated connector plugins to pull evidence from, for example `aws-inspector,okta-inspector,github-inspector`. Defaults to connectors with recent runs.

## Before you run it

1. Run `/us-finra:scope` so the report covers only the obligations that apply. For example, Reg S-ID matters only for firms with covered accounts.
2. Collect the policy and procedure evidence from `/us-finra:evidence-checklist`. Connectors find technical gaps; they cannot read written supervisory procedures or the incident response program.

## Output

A prioritized gap report grouped by SCF family, mapped back to the FINRA framework controls. When reading it, tie each gap to the rule it supports:

- Reg S-P safeguards and incident response;
- Reg S-ID;
- Rule 3110 supervision;
- Rule 4370 business continuity;
- Rule 17a-4 records.

That is how the finding will be written up in an exam.

## Further reading

- [FINRA Cybersecurity Effective Practices (August 2026)](https://www.finra.org/rules-guidance/guidance/cybersecurity-effective-practices)
- [SCF API entry for this framework](https://grcengclub.github.io/scf-api/api/crosswalks/usa-federal-sro-finra.json)
