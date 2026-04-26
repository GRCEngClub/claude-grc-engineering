# ch-fadp — Swiss Federal Act on Data Protection (nFADP)

Stub-depth framework plugin scaffolded from the SCF crosswalk. Install and use it to run a gap assessment against **Swiss Federal Act on Data Protection (revised 2023)**:

```bash
/plugin install ch-fadp@grc-engineering-suite
/ch-fadp:assess --sources=aws-inspector,github-inspector
```

## Status: Stub

This plugin is at **Stub depth** — it routes to `/grc-engineer:gap-assessment` via the SCF crosswalk (35 SCF controls → 90 nFADP controls) without any framework-specific workflow commands yet.

### Level up to Reference

Reference-depth adds scope determination, evidence checklist, and framework-specific context (GDPR divergences, voluntary DSO, risk-based breach notification, Swiss transfer mechanisms). If you have domain expertise for Swiss data protection law, see the [Framework Plugin Guide](../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) and open a PR.

### Level up to Full

Full depth adds framework-native workflow commands tied to the Swiss audit ritual (e.g. `/ch-fadp:dpia-review`, `/ch-fadp:transfer-mechanism-check`, `/ch-fadp:breach-triage`). See the existing Full-depth plugins (`gdpr`, `soc2`, `fedramp-rev5`) for reference.

## Metadata

| Key | Value |
|-----|-------|
| SCF framework ID | `CH-FADP` |
| Region | EMEA |
| Country | CH |
| SCF controls mapped | 35 |
| Framework controls mapped | 90 |
| Depth | Stub |
| Regulator | Swiss Federal Data Protection and Information Commissioner (FDPIC) |

## Key GDPR Divergences

| Aspect | nFADP Position |
|--------|----------------|
| **Breach notification** | Risk-based ("as soon as possible"), NO fixed 72-hour clock |
| **Enforcement** | Individual criminal liability (CHF 250,000), not entity fines |
| **DSO appointment** | Voluntary — no mandatory requirement |
| **Transfer mechanisms** | FDPIC-approved SCCs required; EU SCCs alone insufficient |
| **Protected entities** | Both natural persons AND legal entities |

## References

- [Secure Controls Framework](https://securecontrolsframework.com) — crosswalk source (CC BY-ND 4.0)
- [Swiss FDPIC](https://www.edoeb.admin.ch/edoeb/en/home.html)
- [nFADP full text (Federal Chancellery)](https://www.fedlex.admin.ch/eli/cc/2020/765)