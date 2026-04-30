# us-sox — US Sarbanes-Oxley Act of 2002 (SOX)

Reference-depth framework plugin for the Sarbanes-Oxley Act of 2002 (Public Law 107-204), codified at 15 U.S.C. §§ 7201 et seq. Install and run:

```bash
/plugin install us-sox@grc-engineering-suite
/us-sox:scope                    # determine SEC-registrant + filer-status applicability
/us-sox:evidence-checklist       # ITGC + entity-level + IT-dependent manual evidence
/us-sox:assess                   # gap assessment via the SCF crosswalk
```

## Status: Reference

This plugin is at **Reference depth**. It ships scope determination, an evidence checklist organized by the four IT General Control (ITGC) domains, and a SCF-backed gap assessment. The SKILL paraphrases SOX statutory requirements and PCAOB / COSO concepts without reproducing PCAOB Auditing Standards or COSO IC-IF text.

## What this plugin is honest about

SOX is a **financial-reporting law**, not a cybersecurity control catalog. The SCF crosswalk only maps **4 SCF controls → 17 SOX-relevant controls** because SOX itself does not enumerate technical security requirements. The actual security work that practitioners do "for SOX" is **IT General Control (ITGC) testing in support of Internal Controls over Financial Reporting (ICFR)**, executed against control objectives drawn from COSO 2013, COBIT, and (for vendor systems) AICPA SOC 1 reports.

This plugin therefore frames SOX as the **governance and accountability layer over ICFR**: §302 / §404 / §906 are the certification and assessment requirements; the security and IT controls flow in from the COSO framework and the ITGC discipline that auditors test against PCAOB AS 2201.

### Level up to Full

A Full-depth follow-on PR could add framework-native workflow commands such as `/us-sox:scope-itgc-population`, `/us-sox:itgc-walkthrough`, `/us-sox:soc1-reliance-map`, `/us-sox:deficiency-evaluation`, or `/us-sox:302-certification-pack`. See the [Framework Plugin Guide](../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) for the level-up checklist.

## Metadata

| | |
|---|---|
| SCF framework ID | `usa-federal-law-sox-2002` |
| Statute | Public Law 107-204; 15 U.S.C. §§ 7201 et seq. |
| Region | Americas |
| Country | US |
| Regulators | SEC (disclosure), PCAOB (auditor oversight), DOJ (criminal enforcement of §802 / §906) |
| SCF controls mapped | 4 |
| Framework controls mapped | 17 |
| Depth | Reference |

## References

- [SOX statute (15 U.S.C. §§ 7201 et seq., via Cornell LII)](https://www.law.cornell.edu/uscode/text/15/chapter-98)
- [SEC SOX overview](https://www.sec.gov/spotlight/sarbanes-oxley.htm)
- [PCAOB Auditing Standards (license required to read in full)](https://pcaobus.org/oversight/standards/auditing-standards)
- [COSO 2013 Internal Control — Integrated Framework (license required)](https://www.coso.org/internal-control)
- [Secure Controls Framework](https://securecontrolsframework.com) — crosswalk source (CC BY-ND 4.0)
- [SCF API entry](https://grcengclub.github.io/scf-api/api/crosswalks/usa-federal-law-sox-2002.json)
