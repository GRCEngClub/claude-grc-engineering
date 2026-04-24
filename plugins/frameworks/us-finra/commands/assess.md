---
description: FINRA Broker-Dealer Cybersecurity Guidance compliance gap assessment via the SCF crosswalk
---

# FINRA Broker-Dealer Cybersecurity Guidance Assessment

Runs a compliance gap assessment against **FINRA Broker-Dealer Cybersecurity Guidance** by delegating to `/grc-engineer:gap-assessment` with the framework's SCF identifier.

This is a **stub plugin** — the underlying gap assessment is powered by the SCF crosswalk (17 SCF controls mapped to 39 framework controls). To add framework-specific workflow commands, evidence checklists, or implementation guidance, see the [Framework Plugin Guide](../../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) for the level-up path to Reference or Full depth.

## Usage

```
/us-finra:assess [--sources=<connector-list>]
```

Delegates to:

```
/grc-engineer:gap-assessment "usa-federal-sro-finra" [--sources=<connector-list>]
```

## Arguments

- `--sources=<connector-list>` (optional) — comma-separated list of connector plugins to pull evidence from (e.g. `aws-inspector,github-inspector,okta-inspector`). Defaults to whichever connectors are configured and have recent runs.

## Output

A prioritized gap report listing unmet FINRA Broker-Dealer Cybersecurity Guidance requirements, severity-tagged and grouped by SCF family. The report maps back to the 39 framework-native controls via the SCF crosswalk.

## Further reading

- [Secure Controls Framework](https://securecontrolsframework.com)
- [SCF API entry for this framework](https://hackidle.github.io/scf-api/api/crosswalks/usa-federal-sro-finra.json)
