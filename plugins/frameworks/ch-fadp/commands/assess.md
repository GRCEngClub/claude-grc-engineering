---
description: Swiss Federal Act on Data Protection (nFADP) compliance gap assessment via the SCF crosswalk
---

# Swiss Federal Act on Data Protection (nFADP) Assessment

Runs a compliance gap assessment against **Swiss Federal Act on Data Protection (nFADP)** by delegating to `/grc-engineer:gap-assessment` with the framework's SCF identifier.

This is a **stub plugin** — the underlying gap assessment is powered by the SCF crosswalk (35 SCF controls mapped to 90 framework controls). To add framework-specific workflow commands, evidence checklists, or implementation guidance, see the [Framework Plugin Guide](../../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) for the level-up path to Reference or Full depth.

## Usage

```
/ch-fadp:assess [--sources=<connector-list>]
```

Delegates to:

```
/grc-engineer:gap-assessment "CH-FADP" [--sources=<connector-list>]
```

## Arguments

- `--sources=<connector-list>` (optional) — comma-separated list of connector plugins to pull evidence from (e.g. `aws-inspector,github-inspector,okta-inspector`). Defaults to whichever connectors are configured and have recent runs.

## Output

A prioritized gap report listing unmet Swiss FADP requirements, severity-tagged and grouped by SCF family. The report maps back to the 90 framework-native controls via the SCF crosswalk.

## Further reading

- [Secure Controls Framework](https://securecontrolsframework.com)
- [SCF API entry for this framework](https://hackidle.github.io/scf-api/api/crosswalks/CH-FADP.json)