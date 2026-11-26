# Licensing notice for the `cis-controls` plugin

## Summary

This plugin is **dual-licensed**:

- **Original code** (plugin.json, helper scripts, CLI glue): **MIT License** — same as the rest of this repository. See the root [LICENSE](../../../LICENSE).
- **CIS-derived content** (command documents, skill prose, safeguard explanations, control crosswalk references that paraphrase or summarize CIS Controls v8): **[Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/)** — inherited from the upstream CIS Controls v8.

## Why this plugin is CC BY-SA 4.0

The CIS Controls v8 framework is published by the [Center for Internet Security](https://www.cisecurity.org/controls) under CC BY-SA 4.0. That license requires that **any derivative work that incorporates CIS content must be distributed under the same license**. Because this plugin's content is derived from CIS Controls v8 — safeguards are listed, explained, and cross-mapped — it inherits the CC BY-SA obligation.

This is a deliberate carve-out. The rest of `claude-grc-engineering` stays MIT; only `plugins/frameworks/cis-controls/` is CC BY-SA 4.0.

## What this means for you

**You may**:

- Use this plugin in both commercial and non-commercial settings.
- Modify or extend it.
- Redistribute your modifications.

**You must**:

- Attribute the Center for Internet Security as the source of the CIS Controls content. See "Attribution" below.
- Release your modifications to this plugin's CIS-derived content under **the same CC BY-SA 4.0 license**. This is "share-alike."
- Not add additional restrictions on the redistribution of this plugin.

**You may NOT**:

- Strip CIS attribution from the plugin's output or documentation.
- Relicense CIS-derived content as MIT, Apache-2.0, or any proprietary license.

## Attribution

This plugin uses content derived from the **CIS Controls v8**, published by the **Center for Internet Security, Inc.** (https://www.cisecurity.org/controls/v8) and licensed under CC BY-SA 4.0.

CIS Controls® is a registered trademark of the Center for Internet Security, Inc.

## What is and isn't CIS-derived

- **IS CIS-derived** (CC BY-SA 4.0):
  - `skills/cis-expert/SKILL.md` — the safeguard explanations, implementation group definitions, and control summaries.
  - `skills/*/SKILL.md` — skill documents, including the former `commands/*.md`, that reference specific CIS safeguards, IG levels, and crosswalk mappings.

- **NOT CIS-derived** (MIT):
  - `.claude-plugin/plugin.json` — plugin metadata.
  - Any standalone scripts or generic helpers that do not reproduce or summarize CIS content.

If you're unsure whether a contribution falls under CC BY-SA or MIT, bias toward CC BY-SA 4.0 — it's the safer default for this subdirectory.

## Questions?

- CIS Controls licensing: https://www.cisecurity.org/controls/v8
- This plugin's licensing: open an issue at https://github.com/GRCEngClub/claude-grc-engineering
