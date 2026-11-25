---
description: Map controls to ISO 27001/27017/27018 standards
---

# ISO Standard Mapping

Maps ISMAP requirements to ISO 27001 Annex A, ISO 27017 cloud controls, and ISO 27018 PII protection.

## ISO 27001 Annex A

ISMAP's control criteria in force today follow ISO/IEC 27001:2013 (JIS Q 27001:2014) numbering. ISMAP has published a draft revision that adopts JIS Q 27001:2023 (ISO/IEC 27001:2022) and JIS Q 27002:2024; its effective date has not been set ([ISMAP管理基準改定案](https://www.ismap.go.jp/csm?id=kb_article_view&sysparm_article=KB0012199)). ISO 27001 certificates themselves are now issued only against the 2022 edition, because the 2013 transition period ended on October 31, 2025.

- **Current ISMAP criteria (2013 structure):** built on the 114 ISO/IEC 27001:2013 Annex A controls across 14 domains (A.5 to A.18), plus ISMAP's own cloud-service controls marked with a `.PB` suffix (for example `9.2.1.6.PB`). Count both when scoping an assessment; the 114 figure alone leaves the `.PB` controls out.
- **ISO/IEC 27001:2022:** 93 controls in four themes: organizational (A.5), people (A.6), physical (A.7), and technological (A.8).

When mapping, give both IDs so the result works with today's ISMAP criteria and with a 2022 ISO certificate. For example, 2013 A.9.2.1 (user registration) is 2022 A.5.16 (identity management), A.10.1.1 (cryptographic controls) is A.8.24 (use of cryptography), and A.12.4.1 (event logging) is A.8.15 (logging). ISO/IEC 27002:2022 Annex B has the full correspondence table.

## ISO 27017:2015

Cloud-specific controls with CLD prefix for cloud service providers and customers.

## ISO 27018:2019

Privacy controls for protection of Personally Identifiable Information (PII) in public clouds.

## Examples

```bash
/ismap:iso-mapping
```
