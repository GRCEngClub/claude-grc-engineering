# nist-ai-600-1 — NIST AI 600-1

Stub-depth framework plugin scaffolded from the SCF crosswalk. Install and use it to run a gap assessment against **NIST AI 600-1 (Generative AI Profile)**:

```bash
/plugin install nist-ai-600-1@grc-engineering-suite
/nist-ai-600-1:assess --sources=aws-inspector,github-inspector
```

## Status: Stub

This plugin is at **Stub depth** — it routes to `/grc-engineer:gap-assessment` via the SCF crosswalk (139 SCF controls → 250 SCF-mapped profile / suggested-action items) without any framework-specific workflow commands yet.

AI 600-1 is NIST's cross-sectoral profile of AI RMF 1.0 for generative AI. It identifies generative-AI risks and maps suggested actions to AI RMF subcategories; it is an application of AI RMF, and it defines no standalone control catalog. Concrete controls come from the SCF crosswalk.

### Level up to Reference

Reference-depth adds an evidence checklist and framework-specific context. If you have domain expertise for NIST AI 600-1, see the [Framework Plugin Guide](../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) and open a PR.

### Level up to Full

Full depth adds framework-native workflow commands tied to the audit ritual (e.g. `/fedramp-rev5:poam-review`, `/soc2:service-auditor-prep`). See the existing Full-depth plugins (`soc2`, `fedramp-rev5`, `pci-dss`, `nist-800-53`) for reference.

## Metadata

| | |
|---|---|
| SCF framework ID | `general-nist-600-1-gen-ai-profile` |
| Region | Global |
| Country | US |
| SCF controls mapped | 139 |
| SCF-mapped profile items | 250 |
| Depth | Stub |

## References

- [Secure Controls Framework](https://securecontrolsframework.com) — crosswalk source (CC BY-ND 4.0)
- [SCF API entry](https://grcengclub.github.io/scf-api/api/crosswalks/general-nist-600-1-gen-ai-profile.json)
