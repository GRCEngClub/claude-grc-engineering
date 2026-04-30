---
name: tenable-inspector-expert
description: Interpret Tenable vulnerability-management findings for scan coverage, credentialed scans, vulnerability age, and scan access visibility.
license: MIT
---

# Tenable Inspector Expert

Use this skill when reviewing `tenable-inspector` output.

Findings are written to `~/.cache/claude-grc/findings/tenable-inspector/<run_id>.json`.

Key mappings:

- `VPM-02`: vulnerability scan coverage
- `VPM-03`: credentialed/authenticated scan evidence
- `VPM-04`: vulnerability remediation timeliness

Treat inconclusive credentialed-scan signals as a coverage gap that should be verified in Tenable.
