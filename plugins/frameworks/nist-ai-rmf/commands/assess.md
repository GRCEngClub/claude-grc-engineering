---
description: NIST AI 100-1 (AI RMF 1.0) compliance gap assessment via the SCF crosswalk
---

# NIST AI 100-1 (AI RMF 1.0) Assessment

Runs a compliance gap assessment against **NIST AI 100-1 (AI RMF 1.0)** by delegating to `/grc-engineer:gap-assessment` with the framework's SCF identifier.

This is a **stub plugin** — the underlying gap assessment is powered by the SCF crosswalk (158 SCF controls mapped to 91 framework controls). To add framework-specific workflow commands, evidence checklists, or implementation guidance, see the [Framework Plugin Guide](../../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) for the level-up path to Reference or Full depth.

## Usage

```
/nist-ai-rmf:assess [--sources=<connector-list>]
```

Delegates to:

```
/grc-engineer:gap-assessment "general-nist-100-1-ai-rmf" [--sources=<connector-list>]
```

## Arguments

- `--sources=<connector-list>` (optional) — comma-separated list of connector plugins to pull evidence from (e.g. `aws-inspector,github-inspector,okta-inspector`). Defaults to whichever connectors are configured and have recent runs.

## Output

A prioritized gap report listing unmet NIST AI 100-1 (AI RMF 1.0) requirements, severity-tagged and grouped by SCF family. The report maps back to the 91 framework-native controls via the SCF crosswalk.

## Further reading

- [Secure Controls Framework](https://securecontrolsframework.com)
- [SCF API entry for this framework](https://grcengclub.github.io/scf-api/api/crosswalks/general-nist-100-1-ai-rmf.json)
