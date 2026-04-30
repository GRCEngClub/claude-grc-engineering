---
name: jp-appi-expert
description: Japan APPI expert for the Act on the Protection of Personal Information. Reference-depth framework plugin with scope determination, evidence checklist, and SCF-backed assessment guidance for Japanese personal data.
allowed-tools: Read, Glob, Grep, Write
---

# Japan APPI Expert

Reference-depth expertise for **Japan's Act on the Protection of Personal Information (APPI)**, represented in SCF as `apac-jpn-ppi-2020`. This plugin bundles the SCF crosswalk (58 SCF controls -> 134 framework controls) with APPI-specific assessment context.

## Framework Identity

- **SCF framework ID**: `apac-jpn-ppi-2020`
- **Region**: APAC
- **Country**: JP
- **Regulator**: Personal Information Protection Commission (PPC), Japan
- **Common shorthand**: APPI / Japan PPI
- **Current assessment baseline**: amended APPI fully in effect from April 1, 2022

### Framework In Plain Language

APPI is Japan's national privacy law for organizations that handle personal information and retained personal data. It focuses on purpose specification, fair collection and use, security safeguards, third-party disclosure, cross-border transfer, breach response, and individual rights. For GRC work, treat APPI as both a privacy governance framework and an operational evidence framework: the assessor needs to see where Japanese personal data is collected, how it is used, who receives it, how incidents are escalated, and whether transfer and consent records match actual system flows.

### Territorial Scope And Applicability

APPI applies to business operators handling personal information in Japan and can reach foreign operators that provide goods or services to individuals in Japan and handle their personal information. Scope analysis should identify whether the organization is a personal information handling business operator, whether it handles retained personal data, and whether it transfers personal data to third parties or recipients outside Japan. Do not assume APPI is only for Japan-incorporated entities; customer location, service targeting, and Japan data flows matter.

### Mandatory Artifacts

Evidence usually centers on documented purposes of use, privacy notices, consent and opt-out records, third-party transfer records, cross-border transfer disclosures, processor or entrustee management, security-control policies, breach response procedures, and data subject request handling records. APPI does not mirror GDPR's Article 30 ROPA or DPIA terminology, but mature programs should maintain equivalent data inventories, transfer registers, incident logs, and vendor oversight files so APPI obligations can be demonstrated.

### Cadence And Timelines

There is no SOC-style annual certification cycle in APPI. Assess recurring operating evidence on a risk-based cadence: access reviews, vendor reviews, privacy notice updates, transfer records, consent changes, and breach exercises should be refreshed when systems or purposes change and at least during annual privacy governance review. Breach reporting under the amended APPI is mandatory for specified incident categories; teams should preserve both the initial triage timeline and final report package to the PPC, plus affected-individual notification analysis.

### Regulator And Enforcement

The Personal Information Protection Commission (PPC) is Japan's data protection regulator. PPC oversight can involve guidance, recommendations, orders, reporting demands, and administrative or criminal consequences for serious non-compliance. In assessment output, separate legal penalty analysis from technical control evidence: this plugin should identify likely gaps and evidence needs, not provide a penalty calculation.

### Interaction With Other Frameworks

APPI commonly overlaps with GDPR for EU-Japan transfers, especially because Japan has an EU adequacy decision with supplementary rules. It also overlaps with ISO 27001/27002, SOC 2 privacy/security criteria, NIST privacy and security controls, and sectoral Japanese obligations for finance, healthcare, telecom, and government suppliers. Use the SCF crosswalk for control mechanics, but keep APPI-specific reporting focused on Japanese personal-data purpose, disclosure, transfer, and breach obligations.

### Common Misinterpretations

- **"APPI only applies to companies incorporated in Japan."** Foreign operators can be in scope when they provide goods or services to people in Japan and handle their personal information.
- **"EU adequacy means no APPI transfer work is needed."** Adequacy helps EU-to-Japan transfers, but APPI still requires evidence for onward transfer, third-party provision, purpose limitation, and security safeguards.
- **"Breach notification is voluntary guidance."** The amended APPI made PPC reporting and affected-person notification mandatory for specified breach categories; assessors should request incident triage and notification evidence.
- **"Pseudonymized information is unregulated."** APPI introduced specific handling rules for pseudonymously processed information; teams still need governance over creation, separation, access, and downstream use.

## Command Routing

- `/jp-appi:scope` - determine applicability
- `/jp-appi:assess` - run a gap assessment
- `/jp-appi:evidence-checklist` - enumerate evidence requirements

All three delegate to `/grc-engineer:gap-assessment` with SCF framework ID `apac-jpn-ppi-2020` for the control-by-control mechanics, and wrap the results in APPI-specific terminology.

## Levelling Up To Full

Full-depth plugins add framework-specific workflow commands tied to the audit ritual. Candidates for this framework:

- `/jp-appi:breach-triage` - classify whether an incident likely triggers PPC reporting and affected-person notification.
- `/jp-appi:cross-border-transfer-check` - review recipient country, consent/disclosure basis, equivalent-measures monitoring, and onward-transfer records.
- `/jp-appi:purpose-use-register` - build or review the purpose-of-use inventory for Japanese personal data.
- `/jp-appi:entrustee-review` - assess outsourced processing, sub-entrustee controls, and supervision evidence.

## References

- [Secure Controls Framework](https://securecontrolsframework.com)
- [SCF API entry for this framework](https://hackidle.github.io/scf-api/api/crosswalks/apac-jpn-ppi-2020.json)
- [Personal Information Protection Commission, Japan](https://www.ppc.go.jp/en/)
- [PPC English APPI translation](https://www.ppc.go.jp/files/pdf/APPI_english.pdf)
- [Japanese Law Translation: Act on the Protection of Personal Information](https://www.japaneselawtranslation.go.jp/en/laws/view/4241/en)
