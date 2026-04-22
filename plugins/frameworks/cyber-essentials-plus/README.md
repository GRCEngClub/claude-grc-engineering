# cyber-essentials-plus — UK NCSC Cyber Essentials Plus (CE+) v3.3 Danzell

Reference-depth framework plugin. Install and run:

```bash
/plugin install cyber-essentials-plus@grc-engineering-suite
/cyber-essentials-plus:scope                    # determine applicability first
/cyber-essentials-plus:evidence-checklist       # see what to collect
/cyber-essentials-plus:assess                   # run the gap assessment
```

## Status: Reference

This plugin is at **Reference depth** — it provides scope determination, evidence checklist, and a framework-specific gap assessment, all backed by the SCF crosswalk (30 SCF controls → 5 Cyber Essentials Plus controls).

### Level up to Full

Full depth adds framework-native workflow commands tied to the audit ritual. If you have domain expertise for UK NCSC Cyber Essentials Plus (CE+) v3.3 Danzell, see the [Framework Plugin Guide](../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) for the level-up checklist.

## Metadata

| Property | Value |
|---|---|
| SCF framework ID | `emea-gbr-ce-2021` |
| Region | EMEA |
| Country | GB |
| SCF controls mapped | 30 |
| Framework controls mapped | 5 |
| Depth | Reference |
| Question set | Danzell v3.3 (effective 27 April 2026) |

## Five Core Controls

1. **Firewalls** — boundary and host-based firewalls protecting all devices
2. **Secure Configuration** — default passwords changed, unnecessary services removed
3. **User Access Control** — least-privilege accounts; MFA mandatory for all cloud services
4. **Malware Protection** — anti-malware active on all in-scope devices
5. **Patch Management** — critical patches applied within 14 days; unsupported software removed

## References

- [Secure Controls Framework](https://securecontrolsframework.com) — crosswalk source (CC BY-ND 4.0)
- [SCF API entry](https://www.securecontrolsframework.com)
- [NCSC Cyber Essentials](https://www.ncsc.gov.uk/cyberessentials/overview)
- [IASME Consortium](https://iasme.co.uk/cyber-essentials/)
