---
description: NIST AI 600-1 compliance gap assessment via the SCF crosswalk
---

# NIST AI 600-1 Assessment

Runs a compliance gap assessment against **NIST AI 600-1** by delegating to `/grc-engineer:gap-assessment` with the framework's SCF identifier.

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

A prioritized gap report listing unmet SCF-mapped assessment items for the AI 600-1 profile, severity-tagged and grouped by SCF family. The report maps back to the 250 non-normative mapped items via the SCF crosswalk.

## Further reading

- [Secure Controls Framework](https://securecontrolsframework.com)
- [SCF API entry for this framework](https://grcengclub.github.io/scf-api/api/crosswalks/general-nist-600-1-gen-ai-profile.json)
