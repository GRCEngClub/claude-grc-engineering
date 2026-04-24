# us-finra — FINRA Broker-Dealer Cybersecurity Guidance

Stub-depth framework plugin scaffolded from the SCF crosswalk. Install and use it to run a gap assessment against **FINRA Cybersecurity Rules**:

```bash
/plugin install us-finra@grc-engineering-suite
/us-finra:assess --sources=aws-inspector,github-inspector
```

## Status: Stub

This plugin is at **Stub depth** — it routes to `/grc-engineer:gap-assessment` via the SCF crosswalk (17 SCF controls → 39 FINRA controls) without any framework-specific workflow commands yet.

### Level up to Reference

Reference-depth adds an evidence checklist and framework-specific context. If you have domain expertise for FINRA Cybersecurity Rules, see the [Framework Plugin Guide](../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) and open a PR.

### Level up to Full

Full depth adds framework-native workflow commands tied to the audit ritual (e.g. `/fedramp-rev5:poam-review`, `/soc2:service-auditor-prep`). See the existing Full-depth plugins (`soc2`, `fedramp-rev5`, `pci-dss`, `nist-800-53`) for reference.

## Metadata

| Key | Value |
|-----|-------|
| SCF framework ID | `usa-federal-sro-finra` |
| Region | Americas |
| Country | US |
| SCF controls mapped | 17 |
| Framework controls mapped | 39 |
| Depth | Stub |

## References

- [Secure Controls Framework](https://securecontrolsframework.com) — crosswalk source (CC BY-ND 4.0)
- [SCF API entry](https://hackidle.github.io/scf-api/api/crosswalks/usa-federal-sro-finra.json)
