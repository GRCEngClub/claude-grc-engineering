# jp-appi - Japan APPI

Reference-depth framework plugin. Install and run:

```bash
/plugin install jp-appi@grc-engineering-suite
/jp-appi:scope                    # determine applicability first
/jp-appi:evidence-checklist       # see what to collect
/jp-appi:assess                   # run the gap assessment
```

## Status: Reference

This plugin is at **Reference depth** - it provides scope determination, evidence checklist, and a framework-specific gap assessment, all backed by the SCF crosswalk (58 SCF controls -> 134 APPI/PPI controls).

### Level up to Full

Full depth adds framework-native workflow commands tied to the audit ritual. If you have domain expertise for Japan APPI, see the [Framework Plugin Guide](../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) for the level-up checklist.

## Metadata

| | |
|---|---|
| SCF framework ID | `apac-jpn-ppi-2020` |
| Region | APAC |
| Country | JP |
| SCF controls mapped | 58 |
| Framework controls mapped | 134 |
| Depth | Reference |
| Regulator | Personal Information Protection Commission (PPC), Japan |

## References

- [Secure Controls Framework](https://securecontrolsframework.com) - crosswalk source (CC BY-ND 4.0)
- [SCF API entry](https://hackidle.github.io/scf-api/api/crosswalks/apac-jpn-ppi-2020.json)
- [Personal Information Protection Commission, Japan](https://www.ppc.go.jp/en/)
- [PPC English APPI translation](https://www.ppc.go.jp/files/pdf/APPI_english.pdf)
- [Japanese Law Translation: Act on the Protection of Personal Information](https://www.japaneselawtranslation.go.jp/en/laws/view/4241/en)
