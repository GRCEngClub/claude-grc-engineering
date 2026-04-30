# eu-nis2 — EU NIS2 Directive (Directive (EU) 2022/2555)

Reference-depth framework plugin for the **EU NIS2 Directive** — Directive (EU) 2022/2555 of the European Parliament and of the Council of 14 December 2022 on measures for a high common level of cybersecurity across the Union. NIS2 repealed NIS1 (Directive (EU) 2016/1148) and had a transposition deadline of 17 October 2024.

Install and run:

```bash
/plugin install eu-nis2@grc-engineering-suite
/eu-nis2:scope                    # essential vs important entity classification
/eu-nis2:evidence-checklist       # evidence by Article 21 domain + Article 23 reporting
/eu-nis2:assess                   # SCF-backed gap assessment
```

## Status: Reference

Reference-depth: scope determination across the Article 2/3 decision tree, an evidence checklist organised by the **ten Article 21 cybersecurity risk-management domains** plus the Article 23 incident-reporting workflow, and a SCF-backed gap assessment. Backed by the SCF crosswalk (68 SCF controls → 30 NIS2 directive-level controls). For digital-infrastructure / ICT-service-management / digital-provider entities, the plugin can also overlay Implementing Regulation (EU) 2024/2690 controls via the companion `emea-eu-nis2-annex-2024` SCF crosswalk.

### Important — NIS2 is a Directive, not a Regulation

NIS2 is enforced by each EU Member State through its own national transposition law. Examples in force or in legislative passage as of late 2025: Germany's NIS2UmsuCG, Belgium's NIS2 law, Italy's Decreto Legislativo n. 138/2024, Hungary's Act XXIII of 2023. The substantive rules a regulator can enforce against an in-scope entity live in those national instruments, not in NIS2 itself. This plugin gives the directive-level baseline; always read the national transposition law alongside.

### Level up to Full

Strong candidates for a Full-depth level-up PR:

- `/eu-nis2:incident-runbook` — produce a 24h/72h/1mo runbook tailored to the user's national competent authority and CSIRT.
- `/eu-nis2:board-pack` — generate the Article 20 board-approval pack.
- `/eu-nis2:registration` — walk through the registration workflow with the national competent authority and (for digital-infrastructure / ICT-service-management / digital-provider entities) ENISA under Article 27.
- `/eu-nis2:supply-chain-attestation` — supplier-side attestation pack for Article 21(2)(d).
- `/eu-nis2:annex-mapping` — map Article 21 down to the 351-control Implementing Regulation 2024/2690 breakdown.

See the [Framework Plugin Guide](../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) for the level-up checklist.

## Metadata

| | |
|---|---|
| Instrument | Directive (EU) 2022/2555 |
| SCF framework ID (directive) | `emea-eu-nis2-2022` |
| SCF framework ID (Annex implementing act) | `emea-eu-nis2-annex-2024` |
| Region | EMEA (EU + EEA where applicable) |
| Country | — (supranational EU instrument) |
| Regulator | National competent authorities + CSIRTs in each Member State; coordinated by ENISA |
| SCF controls mapped (directive) | 68 |
| Framework controls mapped (directive) | 30 |
| Depth | Reference |

## References

- [Directive (EU) 2022/2555 on EUR-Lex](https://eur-lex.europa.eu/eli/dir/2022/2555/oj)
- [Commission Implementing Regulation (EU) 2024/2690](https://eur-lex.europa.eu/eli/reg_impl/2024/2690/oj) — technical and methodological requirements for digital-infrastructure / ICT-service-management / digital-provider entities
- [European Commission — NIS2 Directive](https://digital-strategy.ec.europa.eu/en/policies/nis2-directive)
- [Secure Controls Framework](https://securecontrolsframework.com) — crosswalk source (CC BY-ND 4.0)
- [SCF API entry — directive](https://grcengclub.github.io/scf-api/api/crosswalks/emea-eu-nis2-2022.json)
- [SCF API entry — Annex implementing act](https://grcengclub.github.io/scf-api/api/crosswalks/emea-eu-nis2-annex-2024.json)
