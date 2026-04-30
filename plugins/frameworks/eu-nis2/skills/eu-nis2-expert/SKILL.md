---
name: eu-nis2-expert
description: EU NIS2 Directive (Directive (EU) 2022/2555) expert. Reference-depth knowledge of essential vs important entity classification, Article 20 governance, the Article 21 ten cybersecurity risk-management measures, the Article 23 24h/72h/1mo incident-reporting timeline, and supervision/enforcement under Articles 32-34. SCF-backed gap assessment via the crosswalk.
allowed-tools: Read, Glob, Grep, Write
---

# EU NIS2 Directive Expert

Reference-depth expertise for the **EU NIS2 Directive** — Directive (EU) 2022/2555 of the European Parliament and of the Council of 14 December 2022 on measures for a high common level of cybersecurity across the Union. NIS2 repealed the original NIS Directive (Directive (EU) 2016/1148) and entered into force on 16 January 2023, with a transposition deadline of 17 October 2024.

This plugin bundles the SCF crosswalk (68 SCF controls → 30 NIS2 directive-level controls) with directive-specific scoping, governance, evidence, and incident-reporting context. Detailed technical and organisational measures from Article 21 are elaborated in the NIS2 implementing acts (Commission Implementing Regulation (EU) 2024/2690 for digital infrastructure / DNS / TLD / cloud / data centre / CDN / managed service / managed security / online marketplace / search engine / social networking entities — known here as "the Annex"); a parallel SCF mapping `emea-eu-nis2-annex-2024` covers the 351-control breakdown of those technical measures.

## Framework identity

- **Instrument**: Directive (EU) 2022/2555 (NIS2). A *Directive*, not a Regulation — Member States transpose it into national law.
- **Predecessor**: NIS1 (Directive (EU) 2016/1148), repealed by Article 44 of NIS2.
- **Entry into force**: 16 January 2023.
- **Transposition deadline**: 17 October 2024. As of late 2025–early 2026, transposition status varies sharply by Member State; some states (Germany's NIS2UmsuCG, Belgium's NIS2 law, Italy's Decreto Legislativo n. 138/2024) had national laws in force on or near time, several others were delayed and ran (or are still running) Commission infringement procedures.
- **SCF framework ID**: `emea-eu-nis2-2022` (directive). Companion: `emea-eu-nis2-annex-2024` (Implementing Regulation 2024/2690 technical measures).
- **Region**: EMEA (EU + EEA where applicable through joint committee decisions).
- **Direct enforcement**: No. NIS2 is enforced by each Member State's national competent authority via that state's transposition law. ENISA coordinates EU-wide and runs the CSIRTs Network and EU-CyCLONe.
- **Affected sectors**: 18 categories grouped into Annex I (essential) and Annex II (important) — see "Sectoral scope" below.
- **Penalty exposure**: Administrative fines whose national maximums must be at least **€10 million or 2% of total worldwide annual turnover** (essential entities) and at least **€7 million or 1.4% of total worldwide annual turnover** (important entities), whichever is higher, per Article 34. Member States may set higher national maximums.

## Framework in plain language

NIS2 is the EU's baseline cybersecurity law for organisations that run critical or important services. It does four things at once:

1. Expands NIS1's scope from a small list of "operators of essential services" and "digital service providers" to roughly 18 sectors covering most medium and large organisations in critical supply chains (energy, transport, healthcare, drinking water, wastewater, banking, financial market infrastructure, digital infrastructure, ICT service management, postal services, manufacturing of medical devices and machinery, digital providers, food, chemicals, waste, public administration, research, space).
2. Imposes a **harmonised baseline of cybersecurity risk-management measures** on in-scope entities (the ten Article 21 domains).
3. Imposes a **harmonised incident-reporting regime** with a 24-hour early warning, a 72-hour incident notification, and a 1-month final report (Article 23).
4. Introduces **management-body accountability** (Article 20): the management body of an in-scope entity must approve cybersecurity risk-management measures, oversee their implementation, and undergo regular cybersecurity training. National laws may attach personal liability to management-body members for serious failures.

NIS2 is jurisdictionally uneven. Because it is a Directive, the substantive rules a regulator can enforce against you are in your Member State's transposition law, not in NIS2 itself. The directive defines a floor; many Member States layer additional national requirements on top (mandatory CISO appointments, registration deadlines, sectoral rules, sector-specific reporting portals). This plugin focuses on the directive-level baseline that all Member State laws must implement; national specifics are downstream.

## Sectoral scope and entity classification

NIS2 applies a **size-based threshold** combined with a **sector list**, with carve-outs that pull smaller organisations in.

### Step 1: Sector check (Annex I or Annex II?)

**Annex I — high-criticality sectors (default classification: essential)**:

- **Energy** — electricity, district heating and cooling, oil, gas, hydrogen
- **Transport** — air, rail, water, road
- **Banking** — credit institutions
- **Financial market infrastructures** — trading venues, central counterparties
- **Health** — healthcare providers, EU reference laboratories, R&D entities for medicinal products, manufacturers of basic pharmaceutical products and preparations, manufacturers of critical medical devices
- **Drinking water** — suppliers and distributors of water intended for human consumption
- **Wastewater** — wastewater collection, disposal, treatment undertakings
- **Digital infrastructure** — IXPs, DNS service providers (excluding root servers), TLD name registries, cloud computing service providers, data centre service providers, content delivery network providers, trust service providers, providers of public electronic communications networks, providers of publicly available electronic communications services
- **ICT service management (B2B)** — managed service providers, managed security service providers
- **Public administration** — central government, certain regional government entities (Member States choose how far down the public sector this reaches)
- **Space** — operators of ground-based infrastructure that supports the provision of space-based services

**Annex II — other critical sectors (default classification: important)**:

- **Postal and courier services**
- **Waste management**
- **Manufacture, production and distribution of chemicals**
- **Production, processing and distribution of food**
- **Manufacturing** — medical devices and in-vitro diagnostic medical devices; computer, electronic and optical products; electrical equipment; machinery and equipment; motor vehicles, trailers, semi-trailers; other transport equipment
- **Digital providers** — providers of online marketplaces, online search engines, social networking services platforms
- **Research** — research organisations (excluding educational institutions, unless Member States choose to include them)

### Step 2: Size check

Apply the **medium-sized enterprise threshold from Recommendation 2003/361/EC** at the entity level:

- Medium-sized = **50 or more employees** OR **annual turnover and balance sheet total each above €10 million**.
- Below the medium threshold = micro/small = generally out of scope under the size threshold alone.

Entities that meet or exceed the medium threshold in an Annex I sector are **essential**; in an Annex II sector are **important**. This is the default classification before carve-outs.

### Step 3: Carve-outs and overrides (size-independent)

The size threshold is overridden in either direction by Article 2 and Article 3:

- **Always in scope regardless of size** — qualified and non-qualified trust service providers; TLD name registries and DNS service providers; providers of public electronic communications networks and publicly available electronic communications services; sole providers in a Member State of a service essential for societal or economic activities; entities providing services on which the Member State's economy or constitutional order depends; entities qualified as critical entities under the Critical Entities Resilience Directive (Directive (EU) 2022/2557, "CER"); public administration entities of central government as designated by the Member State.
- **Member-State discretion to widen scope** — Member States may classify additional entities as essential or important based on the role they play in their economy.
- **Member-State discretion to narrow scope** — limited carve-outs for entities providing services exclusively to defence or national security.

### Step 4: Essential vs important — what changes?

The classification matters because supervisory regime and fines differ:

| Aspect | Essential entities | Important entities |
|---|---|---|
| Supervision | Ex-ante (proactive) — regular and targeted security audits, on-site inspections, requests for evidence by the competent authority on its own initiative | Ex-post (reactive) — supervision triggered by evidence of non-compliance, incidents, or complaints |
| Maximum administrative fine | At least €10 million **or** 2% of total worldwide annual turnover (whichever is higher) | At least €7 million **or** 1.4% of total worldwide annual turnover (whichever is higher) |
| Management-body accountability | Article 20 applies fully; management-body members can be temporarily prohibited from exercising managerial functions for serious non-compliance | Article 20 applies fully but the temporary management-prohibition power does not apply to the same extent |
| Registration | Required with the national competent authority; some sectors (DNS, TLD, cloud, data centre, CDN, managed service, managed security, marketplace, search engine, social networking) register additionally with ENISA via Article 27 | Required with the national competent authority |

In practice, most enterprise GRC questions about NIS2 collapse into: "are we Annex I or Annex II?" and "do we exceed the medium threshold?" Get those two right and the rest of the obligations follow.

## Article 20 — Management-body accountability

Article 20 shifts cybersecurity from "the security team's problem" to "the board's problem":

- The management body of an in-scope entity must **approve** the cybersecurity risk-management measures taken under Article 21.
- The management body must **oversee** the implementation of those measures.
- Members of the management body must **follow training** sufficient to identify risks and assess cybersecurity risk-management practices, and must offer similar training to employees on a regular basis.
- Member States must provide that **management-body members can be held liable** for breaches of these duties under conditions defined by national law.
- Competent authorities may, for essential entities, **temporarily prohibit** any natural person discharging managerial responsibilities at CEO or legal-representative level from exercising those responsibilities until non-compliance is remedied (Article 32(5)).

In practice this means the plugin should help the user produce **board-level evidence**: minutes showing approval of cybersecurity policies and the risk-treatment plan, training completion records for the management body, and a clear paper trail showing the board oversees the implementation programme (not just rubber-stamps it).

## Article 21 — The ten cybersecurity risk-management measures

Article 21(1) requires in-scope entities to take "appropriate and proportionate technical, operational and organisational measures" to manage the risks posed to the security of network and information systems used for their operations, and to prevent or minimise the impact of incidents. Article 21(2) lists ten domains the measures must cover **at a minimum**. The plugin organises evidence and assessment by these ten domains:

1. **(a) Policies on risk analysis and information system security** — formally approved policies for risk analysis, asset management, change management, vulnerability management, secure development, secure operations, and the overall ISMS or equivalent.
2. **(b) Incident handling** — detection, response, recovery, post-incident analysis, and the procedures that feed Article 23 reporting.
3. **(c) Business continuity** — backup management and disaster recovery, crisis management, and tested recovery plans for the services covered by NIS2.
4. **(d) Supply chain security** — security of relationships with direct suppliers and service providers, including the cybersecurity practices of suppliers and the impact of vulnerabilities in their products and services. The Cooperation Group's coordinated supply-chain risk assessments (Article 22) feed this domain.
5. **(e) Security in network and information systems acquisition, development and maintenance** — including vulnerability handling and disclosure.
6. **(f) Policies and procedures to assess the effectiveness of cybersecurity risk-management measures** — assurance, internal audit, control testing, KPIs, and management review.
7. **(g) Basic cyber hygiene practices and cybersecurity training** — for all staff, including the management body (cross-references Article 20).
8. **(h) Policies and procedures regarding the use of cryptography** — including, where appropriate, encryption.
9. **(i) Human resources security, access control policies and asset management** — joiners/movers/leavers, identity lifecycle, least privilege, asset inventory.
10. **(j) Multi-factor or continuous authentication, secured voice/video/text communications, and secured emergency communication systems** within the entity.

Article 21(3) tells competent authorities to take into account the entity's exposure, size, likelihood of incidents, and the costs of measures when assessing proportionality. Article 21(5) authorises the Commission to adopt implementing acts setting more detailed requirements for specific sectors — the most consequential of these to date is **Commission Implementing Regulation (EU) 2024/2690**, which fleshes out the technical and methodological requirements for digital infrastructure, ICT service management, and digital providers (cloud, data centre, CDN, DNS, TLD, managed service, managed security, online marketplace, search engine, social networking). For organisations in those sectors, the Implementing Regulation 2024/2690 control catalogue is the operative compliance text.

## Article 23 — Incident reporting timeline

Article 23 sets a **three-stage reporting timeline** for any "significant incident" affecting an in-scope entity. A significant incident is one that:

- has caused or is capable of causing **severe operational disruption of the services or financial loss** for the entity, OR
- has affected or is capable of affecting **other natural or legal persons** by causing considerable material or non-material damage.

The three deadlines run from the moment the entity **becomes aware** of the incident:

| Stage | Deadline | Required content |
|---|---|---|
| **Early warning** | Within **24 hours** | Whether the incident is suspected of being caused by unlawful or malicious acts; whether it could have a cross-border impact. Brief — designed to alert the CSIRT/competent authority quickly. |
| **Incident notification** | Within **72 hours** | Update on the early warning; initial assessment of the incident including its severity and impact; where available, indicators of compromise. |
| **Final report** | Within **1 month** of the incident notification | Detailed description of the incident (severity and impact); the type of threat or root cause that likely triggered the incident; the mitigation measures applied and ongoing; where applicable, the cross-border impact. If the incident is ongoing at the 1-month mark, an **interim report** is due at 1 month, with the final report due 1 month after the incident is handled. |

Additional reporting touchpoints from Article 23:

- The CSIRT or competent authority must respond to the early warning **within 24 hours**, including initial feedback and, on request, guidance on possible mitigation measures.
- Where appropriate, in particular where the incident concerns two or more Member States, the competent authority/CSIRT informs the other affected Member States and ENISA.
- Recipients of the entity's services may need to be **notified directly** if the incident may adversely affect the provision of the service (Article 23(2)).
- For significant cyber threats, in-scope entities should also notify recipients of services that may be affected of the threat and any measures or remedies available (Article 23(2) second subparagraph).

The 24h/72h/1mo cadence is the single most operationally consequential part of NIS2. Every IR runbook in scope must be re-timed against it. National competent authorities have published reporting portals and templates — the plugin's `breach-reporting` runbook (a Full-depth candidate) should pre-populate the structured fields each portal requires.

## Article 24 — European cybersecurity certification schemes

Article 24 lets the Commission, by implementing act, require categories of essential and important entities to use certified ICT products, services, and processes — under EU cybersecurity certification schemes adopted under the EU Cybersecurity Act (Regulation (EU) 2019/881). As of early 2026 the candidate scheme most often discussed in this context is **EUCS** (EU Cloud Services scheme, in development at ENISA). When adopted and an Article 24 implementing act references it, in-scope cloud customers may need to procure only EUCS-certified services at the relevant assurance level. The plugin should flag this as a forward-looking obligation rather than an immediate one.

## Articles 32–34 — Supervision and enforcement

- **Article 32 — Supervisory and enforcement measures for essential entities**: ex-ante supervision. Competent authorities can carry out on-site inspections, off-site supervision, regular and targeted security audits at the entity's expense, ad-hoc audits, security scans based on objective non-discriminatory risk assessment criteria, requests for information and evidence demonstrating implementation of cybersecurity policies, requests for the results of security audits, and orders to comply.
- **Article 33 — Supervisory and enforcement measures for important entities**: ex-post supervision. The same toolkit applies but is triggered by evidence of non-compliance, incidents, or complaints — not by routine inspection.
- **Article 34 — General conditions for imposing administrative fines**: fines are effective, proportionate and dissuasive. The directive sets the floors for the maximum fines: **€10 million or 2% of worldwide annual turnover** for essential entities, **€7 million or 1.4% of worldwide annual turnover** for important entities, whichever is higher in each case. Member States may set higher caps in national law and must define the criteria for setting the actual fine in a concrete case (gravity, intentional or negligent character, prior infringements, financial benefit gained, cooperation with the authority, etc.).

Beyond fines, Article 32(4) and (5) give competent authorities a strong corrective toolkit for essential entities: orders to bring conduct into compliance, orders to inform affected service recipients about the threat, orders to implement specific measures within a deadline, designation of a monitoring officer, orders to make a public statement, and (uniquely to NIS2) the temporary prohibition on management-body members exercising managerial responsibilities.

## Mandatory artifacts

The directive does not name a single canonical artifact in the way GDPR names ROPAs, PCI DSS names ROCs, or FedRAMP names SSPs. But a NIS2-compliant programme typically maintains:

- **Risk-management policy and risk register** covering the ten Article 21 domains (Article 21(2)(a), (f)).
- **Asset inventory** (hardware, software, data, third-party services) feeding the risk register (Article 21(2)(i)).
- **Incident-handling procedure / IR runbook** explicitly aligned to the 24h/72h/1mo Article 23 timeline (Article 21(2)(b), Article 23).
- **Business continuity plan and DR plan**, with evidence of testing (Article 21(2)(c)).
- **Supply-chain security register** with supplier risk ratings, security clauses in contracts, and treatment of vulnerabilities in supplier products/services (Article 21(2)(d), Article 22).
- **SDLC / change-management / vulnerability-management procedures and records** (Article 21(2)(e)).
- **Effectiveness-assessment evidence** — internal audit reports, management reviews, KPIs, control test results (Article 21(2)(f)).
- **Cyber-hygiene baseline and training records**, including completion records for the management body (Article 20, Article 21(2)(g)).
- **Cryptographic policy** and inventory of where cryptography is applied (Article 21(2)(h)).
- **Access-control policy and identity lifecycle records** — joiner/mover/leaver tickets, periodic access reviews, MFA enforcement evidence (Article 21(2)(i), (j)).
- **Board-approval evidence** — minutes of the meeting at which the management body approved the Article 21 measures, and minutes showing periodic oversight (Article 20).
- **Registration record** with the national competent authority (and with ENISA for the digital-infrastructure / ICT-service-management / digital-provider categories under Article 27).
- **Incident register** — every reported incident with the chronology and copies of the early-warning, notification, and final-report submissions.

National transposition laws can name and specify additional artifacts (e.g., Germany's NIS2UmsuCG references specific evidence formats for KRITIS operators carried over from the IT-Sicherheitsgesetz lineage). Confirm against your Member State's law.

## Cadence and timelines

- **Incident reporting**: 24-hour early warning, 72-hour notification, 1-month final report (Article 23).
- **Management-body training**: regular — Article 20 does not specify a frequency but national laws and competent-authority guidance commonly land on annual training plus refresher when material changes occur.
- **Risk-management measure review**: not specified in the directive but typically aligned to the entity's ISMS cycle (annual review, plus event-driven re-assessment after significant change). Article 21(3) requires the measures to evolve with the threat landscape.
- **Cooperation Group coordinated supply-chain risk assessments**: ad hoc, when the Cooperation Group decides under Article 22.
- **Member-State reporting to the Commission**: Member States report aggregated incident statistics to the Commission and ENISA every six months (Article 23(9)) and a summary report on NIS2 implementation every two years (Article 40).
- **Registration with national competent authority**: deadlines are set by the national transposition law. Many Member States set short deadlines (3-6 months) after the transposition law takes effect; check yours.
- **Commission review of NIS2 itself**: by **17 October 2027** and every 36 months thereafter, the Commission reviews the functioning of NIS2 (Article 40).

## Regulator and enforcement

- **National competent authorities** designated by each Member State carry out supervision and enforcement. Examples: ANSSI (France), BSI (Germany — supervision currently shared with sectoral regulators), CCB (Belgium), NCSC-NL (Netherlands), AGID/ACN (Italy), INCIBE (Spain), HSCC (Ireland and other variants).
- **National CSIRTs** (Computer Security Incident Response Teams) handle incident notifications and provide initial response support.
- **ENISA** (European Union Agency for Cybersecurity) coordinates EU-wide, runs the CSIRTs Network and EU-CyCLONe (large-scale crisis cooperation), and maintains the registry of certain digital-infrastructure entities.
- **Cooperation Group** under Article 14 brings together Member State representatives, the Commission, and ENISA to coordinate and produce guidance.
- **Enforcement patterns** (early years post-transposition, 2024–2026): regulators have prioritised entity registration, baseline supervision questionnaires, and follow-up on reported incidents. Several Member States have published audit checklists aligned to the ten Article 21 domains. Significant fines have not yet dominated the early enforcement story — orders to comply, requests for evidence, and management-body training audits have. Expect this to shift as transposition matures.

## Interaction with other frameworks

- **GDPR (Regulation (EU) 2016/679)** — overlapping incident reporting. A single security incident can simultaneously be a NIS2 "significant incident" (Article 23, 24h/72h/1mo to the CSIRT) and a GDPR "personal data breach" (Article 33, 72h to the Data Protection Authority). The two notifications go to different authorities and have different content requirements. Run them in parallel; do not let one block the other. The plugin's incident workflow should remind users to evaluate both regimes for every event.
- **DORA (Regulation (EU) 2022/2554, Digital Operational Resilience Act)** — *lex specialis* for financial entities. DORA is a Regulation (directly applicable, no transposition) covering ICT risk for banks, investment firms, insurance undertakings, payment institutions, crypto-asset service providers, and other financial entities. For topics DORA covers (ICT risk management, incident reporting, threat-led penetration testing, third-party ICT risk including the critical-third-party oversight regime), DORA overrides NIS2 for in-scope financial entities (NIS2 Recital 28 and Article 4). NIS2 still applies to financial entities for topics DORA does not cover. The plugin should detect financial-sector entities and route them to a DORA workflow for the overlapping topics.
- **CER (Directive (EU) 2022/2557, Critical Entities Resilience Directive)** — sister directive to NIS2 covering physical resilience of critical entities in 11 sectors. Many entities are in scope of both. NIS2 Article 2(3) and CER explicitly coordinate: an entity identified as a "critical entity" under CER is automatically in scope of NIS2 as essential. The plugin should remind users that the two regimes apply jointly and that the national-law touchpoints often share governance structures and reporting portals.
- **eIDAS (Regulation (EU) No 910/2014, as amended by Regulation (EU) 2024/1183 — eIDAS 2)** — trust service providers are simultaneously eIDAS-regulated and in NIS2 scope, with eIDAS supervision coordinated with NIS2 competent authorities under Article 32(7).
- **EU Cybersecurity Act (Regulation (EU) 2019/881)** — feeds NIS2 via Article 24 (use of European cybersecurity certification schemes for essential and important entities).
- **NIS1 (Directive (EU) 2016/1148)** — fully repealed by NIS2 Article 44. Member-State NIS1 transposition laws have been or are being replaced by NIS2 transposition laws.
- **National cybersecurity laws that pre-date NIS2** (e.g., Germany's IT-Sicherheitsgesetz / KRITIS regime, France's LPM-OIV regime) — generally amended or partially superseded by the NIS2 transposition law. Check the national instrument; many keep the operator-of-essential-services concept under a new label.
- **ISO/IEC 27001:2022 and Annex A controls** — a certified ISMS is widely treated as good prima facie evidence for the Article 21 domains, but is not a safe harbour. A NIS2 supervisor will still want to see how the ISMS scope, risk register, and controls map to NIS2's specific concerns (notably supply chain in 21(2)(d) and incident reporting in Article 23).
- **NIST CSF 2.0 / NIST 800-53** — useful internal mappings; the SCF crosswalk this plugin uses provides automated cross-reference, so contributors should not maintain a hand-rolled mapping table.

## Common misinterpretations

1. **"NIS2 is directly applicable like GDPR."** It is not. NIS2 is a **Directive**; the substantive obligations a regulator can enforce against you live in your Member State's transposition law, not in NIS2 itself. Always read the national law alongside the directive.
2. **"NIS2 only applies if we're an essential service operator."** That was NIS1's framing. NIS2 added the much-broader "important entity" tier and 18 sectors. Many organisations now in scope (manufacturers of medical devices, food producers, postal services, social networking platforms, research organisations) had no NIS1 obligations.
3. **"We're below 50 employees so we're out of scope."** Often true under the size threshold alone, but the **size-independent overrides** (Article 2(2)) pull in trust service providers, DNS providers, TLD registries, providers of public electronic communications networks/services, sole providers, providers of services on which the Member State depends, and entities qualified as "critical entities" under CER — regardless of size.
4. **"We have 72 hours to report a breach, like GDPR."** The Article 23 timeline is **24 hours for an early warning**, then 72 hours for the notification, then 1 month for the final report. The 24-hour clock starts when the entity becomes aware of the incident, not when investigation is complete. Do not conflate with GDPR's 72-hour breach notification — they are separate regimes and may both apply to one event.
5. **"Cybersecurity is the security team's responsibility — Article 20 is about training."** Article 20 makes the **management body** legally accountable for approving and overseeing the Article 21 measures, with personal-liability hooks in national law. Training is the floor; approval and oversight are the substance.
6. **"NIS2 requires an ISO 27001 certificate."** It does not. Article 21 requires "appropriate and proportionate" measures across the ten domains. ISO 27001 is one widely used way to demonstrate them, but national supervisors will still want to see explicit mapping to NIS2's concerns (especially supply chain, incident reporting, and management-body oversight).
7. **"Financial entities have to do NIS2 and DORA in full."** Not for the topics DORA covers. DORA is *lex specialis* and overrides NIS2 for in-scope financial entities on ICT risk management, incident reporting, TLPT, and ICT third-party risk (NIS2 Article 4). NIS2 still applies for topics DORA does not cover.
8. **"NIS2 has its own EU-level fine schedule like GDPR."** Article 34 sets the *floors* for the maximum administrative fine each Member State must allow (€10M / 2% for essential, €7M / 1.4% for important). Actual fines and the criteria for setting them are set by national law. Some Member States have set higher caps and stricter aggravating factors.

## Command routing

- `/eu-nis2:scope` — determine essential vs important vs out-of-scope, walking through the sector → size → carve-out decision tree.
- `/eu-nis2:assess` — run a gap assessment against the directive baseline via the SCF crosswalk.
- `/eu-nis2:evidence-checklist` — enumerate evidence requirements organised by the ten Article 21 domains and the Article 23 reporting workflow.

All three commands delegate to `/grc-engineer:gap-assessment` with SCF framework ID `emea-eu-nis2-2022` for the control-by-control mechanics, and wrap the results in NIS2-specific terminology (essential/important entity classification, Article 21 domain headings, Article 23 timing).

## Levelling up to Full

Full-depth NIS2 plugins ship workflow commands tied to the NIS2 audit and reporting ritual. Strong candidates for level-up PRs:

- `/eu-nis2:incident-runbook` — produce a 24h/72h/1mo runbook tailored to the user's national competent authority and CSIRT, with the structured fields each portal requires pre-populated.
- `/eu-nis2:board-pack` — generate the board-approval pack required by Article 20 (cybersecurity policy, risk register, treatment plan, training plan, KPIs, decisions to be ratified).
- `/eu-nis2:registration` — walk through the registration workflow with the national competent authority and (for the digital-infrastructure / ICT-service-management / digital-provider categories) with ENISA under Article 27.
- `/eu-nis2:supply-chain-attestation` — produce the supplier-side attestation pack used to satisfy Article 21(2)(d) when an in-scope entity is itself a supplier to another in-scope entity.
- `/eu-nis2:annex-mapping` — for entities in scope of Implementing Regulation (EU) 2024/2690, map the 10 Article 21 domains down to the 351-control technical breakdown via the `emea-eu-nis2-annex-2024` SCF crosswalk.

## References

- [Directive (EU) 2022/2555 on EUR-Lex](https://eur-lex.europa.eu/eli/dir/2022/2555/oj) — the directive text.
- [Commission Implementing Regulation (EU) 2024/2690](https://eur-lex.europa.eu/eli/reg_impl/2024/2690/oj) — technical and methodological requirements for digital infrastructure, ICT service management, and digital providers (the "Annex" controls).
- [European Commission — NIS2 Directive](https://digital-strategy.ec.europa.eu/en/policies/nis2-directive) — EU-level policy overview, scope, and implementation guidance.
- [Cooperation Group publications](https://digital-strategy.ec.europa.eu/en/policies/nis-cooperation-group) — EU-level coordinated guidance and Article 22 supply-chain risk assessments.
- [Secure Controls Framework](https://securecontrolsframework.com) — crosswalk source (CC BY-ND 4.0).
- [SCF API entry for NIS2 directive](https://grcengclub.github.io/scf-api/api/crosswalks/emea-eu-nis2-2022.json) and [NIS2 Annex (Implementing Regulation 2024/2690)](https://grcengclub.github.io/scf-api/api/crosswalks/emea-eu-nis2-annex-2024.json).
- National transposition laws — check your Member State's official journal; the obligations a regulator can enforce against you live in the national instrument, not in the directive itself.
