# ind-dpdpa — India DPDPA (2023) + DPDP Rules (2025)

Stub-depth framework plugin scaffolded from the SCF crosswalk. Install and use it to run a gap assessment against **India DPDPA (2023) + DPDP Rules (2025)**:

```bash
/plugin install ind-dpdpa@grc-engineering-suite
/ind-dpdpa:assess --sources=aws-inspector,github-inspector
```

## Status: Stub

This plugin is at **Stub depth** — it routes to `/grc-engineer:gap-assessment` via the SCF crosswalk (41 SCF controls → 96 framework controls) without any framework-specific workflow commands yet.

**Framework composition**: The enforceable framework comprises the DPDPA Act (2023) and the DPDP Rules (finalized November 2025). Reference-depth upgrades must cover both the Act's obligations and the Rules' operational requirements (e.g., 72-hour breach notification, consent manager registration by November 2026).

### Level up to Reference

Reference-depth adds an evidence checklist and framework-specific context. If you have domain expertise for India - DPDPA (2023), see the [Framework Plugin Guide](../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) and open a PR.

### Level up to Full

Full depth adds framework-native workflow commands tied to the audit ritual (e.g. `/fedramp-rev5:poam-review`, `/soc2:service-auditor-prep`). See the existing Full-depth plugins (`soc2`, `fedramp-rev5`, `pci-dss`, `nist-800-53`) for reference.

## Metadata

| | |
|---|---|
| SCF framework ID | `apac-ind-dpdpa-2023` |
| Region | APAC |
| Country | IN |
| SCF controls mapped | 41 |
| Framework controls mapped | 96 |
| Depth | Stub |

## References

- [Secure Controls Framework](https://securecontrolsframework.com) — crosswalk source (CC BY-ND 4.0)
- [SCF API entry](https://grcengclub.github.io/scf-api/api/crosswalks/apac-ind-dpdpa-2023.json)
