---
description: India DPDPA (2023) + DPDP Rules (2025) compliance gap assessment via the SCF crosswalk
---

# India DPDPA (2023) + DPDP Rules (2025) Assessment

Runs a compliance gap assessment against **India DPDPA (2023) + DPDP Rules (2025)** by delegating to `/grc-engineer:gap-assessment` with the framework's SCF identifier.

This is a **stub plugin** — the underlying gap assessment is powered by the SCF crosswalk (41 SCF controls mapped to 96 framework controls). The enforceable framework comprises the DPDPA Act (2023) and the DPDP Rules (finalized November 2025).

To add framework-specific workflow commands, evidence checklists, or implementation guidance, see the [Framework Plugin Guide](../../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) for the level-up path to Reference or Full depth.

## Usage

```bash
/ind-dpdpa:assess [--sources=<connector-list>]
```

Delegates to:

```bash
/grc-engineer:gap-assessment "apac-ind-dpdpa-2023" [--sources=<connector-list>]
```

## Arguments

- `--sources=<connector-list>` (optional) — comma-separated list of connector plugins to pull evidence from (e.g. `aws-inspector,github-inspector,okta-inspector`). Defaults to whichever connectors are configured and have recent runs.

## Output

A prioritized gap report listing unmet India - DPDPA (2023) requirements, severity-tagged and grouped by SCF family. The report maps back to the 96 framework-native controls via the SCF crosswalk.

## Further reading

- [Secure Controls Framework](https://securecontrolsframework.com)
- [SCF API entry for this framework](https://grcengclub.github.io/scf-api/api/crosswalks/apac-ind-dpdpa-2023.json)
