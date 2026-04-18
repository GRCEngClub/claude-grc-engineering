---
name: singapore-pdpa-expert
description: Singapore - Personal Data Protection Ac (PDPA) (2012) expert. Reference-depth framework plugin with assessment, scope determination, and evidence checklist — backed by the SCF crosswalk. Level up to Full by adding framework-specific workflow commands.
allowed-tools: Read, Glob, Grep, Write
---

# Singapore - Personal Data Protection Ac (PDPA) (2012) Expert

Reference-depth expertise for **Singapore - Personal Data Protection Ac (PDPA) (2012)**. This plugin bundles the SCF crosswalk (30 SCF controls → 14 framework controls) with framework-specific context.

## Framework identity

- **SCF framework ID**: `apac-sgp-pdpa-2012`
- **Region**: APAC
- **Country**: SG

TODO: add the following when filling in expertise. Reference depth expects all of these to have at least two-sentence answers.

### Framework in plain language

TODO: one-paragraph summary of what Singapore - Personal Data Protection Ac (PDPA) (2012) exists to do and who it affects. Avoid verbatim regulation text — paraphrase and cite articles/sections by number.

### Territorial scope and applicability

TODO: who must comply, where operations must be happening, what the carve-outs are.

### Mandatory artifacts

TODO: the named documents or registers the framework requires (e.g. GDPR's ROPA/DPIA, PCI DSS's ROC/SAQ, ISO 27001's Statement of Applicability). Stub if uncertain; a Full-depth PR can add commands to generate each.

### Cadence and timelines

TODO: notification windows (e.g. GDPR 72 hours), assessment frequency, recertification cycles.

### Regulator and enforcement

TODO: who enforces, how penalties are calculated, recent enforcement patterns worth knowing.

### Interaction with other frameworks

TODO: overlaps with GDPR / ISO / NIST / sectoral rules. Reference the [cross-framework analyzer](../../../../grc-engineer/scripts/cross-framework-analyzer.js) outputs when useful.

### Common misinterpretations

TODO: at least 2–3 community-level misunderstandings this plugin should correct. Example: "ITAR only affects munitions" (it covers technical data too).

## Command routing

- `/singapore-pdpa:scope` — determine applicability
- `/singapore-pdpa:assess` — run a gap assessment
- `/singapore-pdpa:evidence-checklist` — enumerate evidence requirements

All three delegate to `/grc-engineer:gap-assessment` with SCF framework ID `apac-sgp-pdpa-2012` for the control-by-control mechanics, and wrap the results in Singapore - Personal Data Protection Ac (PDPA) (2012)-specific terminology.

## Levelling up to Full

Full-depth plugins add framework-specific workflow commands tied to the audit ritual. Candidates for this framework:

TODO: propose 2–4 framework-specific commands. Examples from existing Full-depth plugins:

- `soc2`: `/soc2:service-auditor-prep`, `/soc2:trust-service-matrix`
- `fedramp-rev5`: `/fedramp-rev5:poam-review`, `/fedramp-rev5:ssp-outline`
- `pci-dss`: `/pci-dss:roc-walkthrough`, `/pci-dss:saq-route`
- `cmmc`: `/cmmc:c3pao-readiness`

## References

- [Secure Controls Framework](https://securecontrolsframework.com)
- [SCF API entry for this framework](https://hackidle.github.io/scf-api/api/crosswalks/apac-sgp-pdpa-2012.json)
- Official regulator publications (TODO: add primary-source links)
