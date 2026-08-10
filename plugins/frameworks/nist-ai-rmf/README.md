# nist-ai-rmf — NIST AI 100-1 (AI RMF 1.0)

Stub-depth framework plugin scaffolded from the SCF crosswalk. Install and use it to run a gap assessment against **NIST AI 100-1 (AI RMF 1.0)**:

```bash
/plugin install nist-ai-rmf@grc-engineering-suite
/nist-ai-rmf:assess --sources=aws-inspector,github-inspector
```

## Status: Stub

This plugin is at **Stub depth** — it routes to `/grc-engineer:gap-assessment` via the SCF crosswalk (158 SCF controls → 91 NIST AI 100-1 (AI RMF 1.0) subcategories) without any framework-specific workflow commands yet. AI RMF 1.0 is NIST’s voluntary outcomes framework for AI risk management, organized across four functions: GOVERN, MAP, MEASURE, and MANAGE.

### Level up to Reference

Reference-depth adds an evidence checklist and framework-specific context. If you have domain expertise for NIST AI 100-1 (AI RMF 1.0), see the [Framework Plugin Guide](../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) and open a PR.

### Level up to Full

Full depth adds framework-native workflow commands tied to the audit ritual (e.g. `/fedramp-rev5:poam-review`, `/soc2:service-auditor-prep`). See the existing Full-depth plugins (`soc2`, `fedramp-rev5`, `pci-dss`, `nist-800-53`) for reference.

## Metadata

| | |
|---|---|
| SCF framework ID | `general-nist-100-1-ai-rmf` |
| Region | Global |
| Country | US |
| SCF controls mapped | 158 |
| Framework controls mapped | 91 |
| Depth | Stub |

## References

- [Secure Controls Framework](https://securecontrolsframework.com) — crosswalk source (CC BY-ND 4.0)
- [SCF API entry](https://grcengclub.github.io/scf-api/api/crosswalks/general-nist-100-1-ai-rmf.json)
