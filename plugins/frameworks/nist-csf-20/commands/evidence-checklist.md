---
description: NIST CSF 2.0 evidence checklist organized by Function (GV / ID / PR / DE / RS / RC) covering all 106 Subcategories
---

# NIST CSF 2.0 Evidence Checklist

Baseline evidence checklist for a **NIST Cybersecurity Framework v2.0** Profile assessment. CSF is outcomes-based, not control-based — evidence demonstrates that an outcome (a Subcategory) is achieved, regardless of *how*. This checklist is organized by the six Functions and covers all 106 official Subcategories with the artifacts an assessor or board reviewer typically expects to see.

> **Never commit evidence artifacts to source control.** Configuration exports, access logs, and incident records frequently contain sensitive operational detail. Use an encrypted, access-controlled evidence locker. The repo's default `.gitignore` should already cover `evidence/`.

## Usage

```text
/nist-csf-20:evidence-checklist [--function=<GV|ID|PR|DE|RS|RC>] [--format=table|markdown|csv]
```

## Arguments

- `--function=<code>` (optional) — restrict to a single Function. Codes: `GV`, `ID`, `PR`, `DE`, `RS`, `RC`. Default: all six.
- `--format=<fmt>` (optional) — `table` (default Markdown table), `markdown` (detailed list), `csv` (spreadsheet import).
- `--family=<SCF_family_code>` (optional, advanced) — restrict to a single SCF family (e.g. `IAC`, `CRY`, `AST`, `BCD`). Most users should use `--function` instead; use `--family` only when reusing evidence collection scripts written against the SCF crosswalk.

## How CSF evidence works

CSF Subcategory outcomes can be evidenced in many ways. The same outcome may be supported by:

- A **policy document** (Govern outcomes especially)
- A **configuration export** (Protect, Detect)
- A **log sample** (Detect, Respond)
- A **ticket / runbook** (Respond, Recover)
- A **training completion record** (Protect)
- A **board minute** or **risk register entry** (Govern)

Reference-depth practitioners should accept multiple forms of evidence per Subcategory and avoid demanding a specific format unless the assessment driver (e.g. a federal contract or a sector regulator) imposes one.

## Evidence by Function

### Govern (GV) — strategy, policy, oversight, supply chain

Govern is the new 2.0 Function and the one boards care most about. Govern evidence is mostly **document + sign-off**, not technical config exports.

#### GV.OC — Organizational Context

| Subcategory | What it asks for | Evidence the assessor / board expects |
| --- | --- | --- |
| **GV.OC-01** — organizational mission informs cybersecurity risk management | Cybersecurity strategy tied to the organization's mission | Cybersecurity strategy document referencing mission; board / executive sign-off |
| **GV.OC-02** — internal and external stakeholders' needs and expectations understood | Stakeholder map covering internal teams, regulators, customers, and partners | Stakeholder register; engagement records; CISO / board communication logs showing stakeholder inputs considered |
| **GV.OC-03** — legal, regulatory, and contractual cybersecurity requirements identified and managed | Catalog of regulatory obligations (HIPAA, PCI DSS, GLBA, state breach laws, sector regulators) | Regulatory inventory / register; ownership map; review cadence record |
| **GV.OC-04** — critical services and capabilities external stakeholders depend on are understood | Service dependency map communicated to leadership and relevant teams | Service dependency documentation; customer / partner SLA register; critical service inventory |
| **GV.OC-05** — outcomes and services the organization depends on from others are understood | Inventory of third-party dependencies including cloud, SaaS, and critical vendors | Third-party dependency register; critical vendor inventory; single-point-of-failure analysis |

#### GV.RM — Risk Management Strategy

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **GV.RM-01** — risk management objectives established and agreed to by stakeholders | Documented and approved risk management objectives | Approved risk management objectives document; stakeholder sign-off records |
| **GV.RM-02** — risk appetite and risk tolerance statements established, communicated, and maintained | Formal risk appetite and tolerance statements | Approved risk appetite / tolerance statement; board or executive approval record; evidence of communication to relevant teams |
| **GV.RM-03** — cybersecurity risk integrated into enterprise risk management | Cyber risk entries in the enterprise risk register | ERM process documentation showing cyber integration; integrated risk register with cyber entries; ERM committee minutes including cyber items |
| **GV.RM-04** — strategic direction for risk response options established and communicated | Documented framework for choosing among risk response options (accept / transfer / mitigate / avoid) | Risk response strategy or decision framework document; communication records to responsible parties |
| **GV.RM-05** — lines of communication for cybersecurity risks established across the organization | Escalation and communication paths for cyber risk, including third-party risks | Cybersecurity risk escalation matrix; supplier risk communication workflow; CISO reporting cadence to board documentation |
| **GV.RM-06** — standardized method for calculating, documenting, categorizing, and prioritizing cybersecurity risks established | Documented risk scoring or quantification methodology | Risk methodology document; calibration or validation records; sample risk register entries demonstrating methodology applied consistently |
| **GV.RM-07** — strategic opportunities (positive risks) characterized and included in risk discussions | Evidence that upside / opportunity risks are considered alongside threats | Risk committee or board minutes showing positive risks discussed; opportunity register or positive risk entries in risk register |

#### GV.RR — Roles, Responsibilities, and Authorities

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **GV.RR-01** — leadership accountable for cybersecurity risk and fosters a risk-aware culture | Formal accountability at the board and executive level; visible tone-at-the-top for cybersecurity | Board / executive accountability statement; CISO charter; board cybersecurity committee charter; leadership messaging on security culture |
| **GV.RR-02** — roles, responsibilities, and authorities for cybersecurity established, communicated, and enforced | RACI for cybersecurity decisions at program and operational level | Cybersecurity RACI / org chart; CISO charter; board cybersecurity oversight charter |
| **GV.RR-03** — adequate resources allocated commensurate with cybersecurity risk strategy | Cybersecurity budget and staffing aligned to risk posture and strategic priorities | Budget approval records showing cybersecurity allocation; headcount and tooling plans; resource sufficiency review tied to risk appetite |
| **GV.RR-04** — cybersecurity included in human resources practices | HR lifecycle processes (hiring, onboarding, offboarding) incorporate cybersecurity requirements | HR policy referencing cybersecurity requirements; background check records; onboarding security training completion evidence; offboarding access revocation process documentation |

#### GV.PO — Policy

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **GV.PO-01** — policies for managing cybersecurity risks established, communicated, and enforced | Written, approved cybersecurity policies covering the full risk management scope | Policy library with version control, approval signatures, and review history |
| **GV.PO-02** — cybersecurity risk policies reviewed, updated, and enforced to reflect changes | Evidence policies are refreshed in response to threats, technology, and organizational changes | Policy revision history; scheduled review records; change log showing updates triggered by new threats or regulatory changes; communication records for policy updates |

#### GV.OV — Oversight

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **GV.OV-01** — cybersecurity strategy results reviewed to inform and adjust direction | Board or audit committee receives and acts on cybersecurity strategy performance data | Board cybersecurity reporting deck; audit committee minutes; independent review or assurance report |
| **GV.OV-02** — cybersecurity risk management strategy reviewed and adjusted to ensure coverage | Evidence that strategy is revisited when requirements or risk landscape changes | Strategy review meeting minutes; updated strategy documents; records of adjustments made in response to new risks, incidents, or regulatory changes |
| **GV.OV-03** — cybersecurity risk management performance evaluated and reviewed | KPIs, metrics, or program health reviews used to assess and improve performance | KPI / metric dashboard; executive or board performance review records; program effectiveness reports; benchmark comparisons or third-party assessments |

#### GV.SC — Cybersecurity Supply Chain Risk Management

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **GV.SC-01** — cybersecurity supply chain risk management program established | C-SCRM program with documented strategy, objectives, policies, and processes | Vendor risk management policy; tiered vendor inventory; due diligence templates |
| **GV.SC-02** — cybersecurity roles for suppliers, customers, and partners established and coordinated | Clear accountability for supply chain cybersecurity internally and with third parties | Vendor RACI; third-party cybersecurity responsibility matrix; partner agreements referencing security roles and coordination |
| **GV.SC-03** — C-SCRM integrated into enterprise risk management and improvement processes | Supply chain risks visible in ERM and feeding continuous improvement cycles | Process documentation showing C-SCRM feeds into ERM; integrated risk register with supply chain entries; evidence of supply chain risk inputs to improvement activities |
| **GV.SC-04** — suppliers known and prioritized by criticality | Tiered vendor inventory with criticality rationale | Tiered vendor inventory; criticality scoring criteria and methodology; critical vendor shortlist with documented rationale |
| **GV.SC-05** — supply chain cybersecurity requirements addressed in contracts | Standard cybersecurity contract clauses in supplier agreements | Standard cybersecurity contract clauses; sample executed vendor agreements referencing security requirements |
| **GV.SC-06** — planning and due diligence performed before entering new supplier relationships | Pre-engagement vetting process for new vendors | Pre-engagement vendor assessment checklist; due diligence questionnaires and vendor responses; approval records for new vendor relationships |
| **GV.SC-07** — risks from suppliers monitored throughout the relationship | Ongoing vendor risk monitoring and re-assessment cadence | Ongoing vendor risk monitoring schedule; periodic vendor assessment records; risk re-evaluation trigger criteria and evidence of application |
| **GV.SC-08** — suppliers included in incident planning, response, and recovery | Third parties incorporated into IR exercises and response activities | IR plan sections referencing key third-party suppliers; tabletop exercise records involving critical vendors; vendor IR contact list and notification procedures |
| **GV.SC-09** — supply chain security practices integrated and monitored through the product/service life cycle | SCRM embedded across the full technology acquisition and management lifecycle | SCRM lifecycle process documentation; component integrity verification records; hardware / software provenance tracking evidence |
| **GV.SC-10** — C-SCRM plans include provisions for end-of-partnership activities | Offboarding and wind-down security steps covered in contracts and internal processes | Contract offboarding / termination clauses referencing security; end-of-relationship security checklist; access revocation and data return / destruction records post-contract |

---

### Identify (ID) — context, assets, risk assessment, improvement

Identify evidence is mostly **inventories and assessments**.

#### ID.AM — Asset Management

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **ID.AM-01** — hardware inventory maintained | Asset inventory of physical devices | Asset inventory export (CMDB / IT asset management tool); reconciliation cadence record |
| **ID.AM-02** — software, services, and systems inventory maintained | Software and services asset management | Software asset management export; SBOM (software bill of materials) where applicable |
| **ID.AM-03** — authorized network communication and data flows documented | Data flow diagrams and network communication maps | Data flow diagrams; data classification register; data lineage documentation |
| **ID.AM-04** — inventories of services provided by suppliers maintained | Catalog of third-party and cloud services in use | Supplier service catalog; SaaS / IaaS / PaaS inventory; contract register tied to service inventory |
| **ID.AM-05** — assets prioritized based on classification, criticality, resources, and impact on the mission | Asset criticality / classification scheme applied and maintained | Asset classification scheme; tier or criticality assignment per system; review record |
| **ID.AM-07** — inventories of data and metadata maintained for designated data types | Data inventory and classification records | Data inventory / register; data classification records; metadata tagging evidence; data map |
| **ID.AM-08** — assets managed throughout their life cycles | Asset lifecycle management covering acquisition through decommission | Asset lifecycle policy; decommission and disposal records; end-of-life hardware / software disposition evidence (certificate of destruction where applicable) |

#### ID.RA — Risk Assessment

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **ID.RA-01** — vulnerabilities in assets identified, validated, and recorded | Vulnerability management process and outputs | Vulnerability scan reports; remediation ticket samples; SLA / process documentation |
| **ID.RA-02** — cyber threat intelligence received from information sharing forums and sources | Active participation in threat intelligence sharing | Threat intel feed subscriptions (ISAC membership, government feeds such as CISA); threat reports received; threat intel integration or processing logs |
| **ID.RA-03** — internal and external threats identified and recorded | Threat catalog or threat model maintained | Threat catalogue or threat modeling outputs; threat identification records in risk register; threat landscape review documentation |
| **ID.RA-04** — potential impacts and likelihoods of threats exploiting vulnerabilities identified | Likelihood and impact analysis for identified risks | Risk assessment methodology outputs with likelihood / impact scoring; risk heat maps or risk matrices |
| **ID.RA-05** — threats, vulnerabilities, likelihoods, and impacts used to inform risk response prioritization | Risk assessment drives prioritized response | Risk assessment report; risk register with prioritization rationale; methodology documentation (often NIST SP 800-30 aligned) |
| **ID.RA-06** — risk responses chosen, prioritized, planned, tracked, and communicated | Risk treatment decisions documented and tracked through to completion | Risk treatment decisions in risk register; remediation plans and status reports; stakeholder communication records on risk response |
| **ID.RA-07** — changes and exceptions managed, assessed for risk impact, recorded, and tracked | Change management and exception processes include risk assessment step | Change management records showing risk review; exception request logs with risk assessments; tracking records for open exceptions |
| **ID.RA-08** — processes for receiving, analyzing, and responding to vulnerability disclosures established | Vulnerability disclosure or responsible disclosure program | Vulnerability disclosure policy (VDP) or responsible disclosure process documentation; bug bounty program documentation (if applicable); disclosure intake and response records |
| **ID.RA-09** — authenticity and integrity of hardware and software assessed before acquisition and use | Supply chain integrity checks in procurement | Procurement security requirements; software composition analysis (SCA) results; hardware provenance checks; signing / verification records |
| **ID.RA-10** — critical suppliers assessed before acquisition | Security vetting of critical vendors prior to onboarding | Pre-acquisition vendor security assessment records; supplier vetting questionnaire responses; risk rating documentation for critical suppliers |

#### ID.IM — Improvement

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **ID.IM-01** — improvements identified from evaluations | Formal evaluations feed a documented improvement process | Post-assessment review reports; security program review minutes; improvement backlog or tracking record |
| **ID.IM-02** — improvements identified from security tests and exercises | Penetration tests, red team exercises, and tabletop exercises yield tracked improvements | Penetration test reports; red team or tabletop exercise after-action reports; improvement items with owner and target date |
| **ID.IM-03** — improvements identified from execution of operational processes, procedures, and activities | Lessons learned from operational reviews integrated into the improvement cycle | Operational review improvement logs; process performance review records; recurring finding tracking across monitoring cycles |
| **ID.IM-04** — incident response plans and other cybersecurity plans that affect operations are established, communicated, maintained, and improved | Cybersecurity plans beyond the IR plan are kept current and shared with relevant parties | IR plan with version history and communication records; business continuity / BCDR plan; sector-specific operational plans; improvement records from exercises and post-incident reviews |

---

### Protect (PR) — identity, training, data, platform, infrastructure

Protect evidence is the largest bucket and is mostly **technical configuration plus operational records**.

#### PR.AA — Identity Management, Authentication, and Access Control

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **PR.AA-01** — identities and credentials managed by the organization | Identity and access management baseline | IAM configuration export (cloud IdP / Active Directory / Entra / Okta); user provisioning workflow documentation |
| **PR.AA-02** — identities proofed and bound to credentials based on context of interactions | Identity proofing process matched to risk level of the interaction | Identity proofing process documentation; credential issuance records; identity verification audit log samples |
| **PR.AA-03** — users, services, and hardware authenticated commensurate with risk | Authentication strength appropriate to the sensitivity of resources | MFA enrollment / enforcement reports; authentication policy; service-account inventory |
| **PR.AA-04** — identity assertions protected, conveyed, and verified | Federation and single sign-on security controls in place | SAML / OIDC / OAuth configuration evidence; federation trust records; token validation logs; SSO assertion integrity controls documentation |
| **PR.AA-05** — access permissions managed per least privilege and separation of duties | Role-based access and SoD controls defined, enforced, and reviewed | RBAC role definitions; access review records; SoD conflict matrix |
| **PR.AA-06** — physical access to assets managed, monitored, and enforced commensurate with risk | Physical access controls for facilities, data centers, and sensitive areas | Physical access control system configuration; badge access logs; visitor logs; data center physical security audit or inspection records |

#### PR.AT — Awareness and Training

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **PR.AT-01** — personnel provided with security awareness and training | Security awareness training program for all staff | Training completion reports; training content / curriculum; phishing simulation results |
| **PR.AT-02** — individuals in specialized roles provided with role-specific training | Targeted training for security, development, IR, and other roles with elevated risk | Role-specific security training completion records; CISO, developer, and IR team training evidence; relevant certifications held |

#### PR.DS — Data Security

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **PR.DS-01** — data-at-rest protected | Encryption at rest across storage and databases | Encryption configuration evidence (KMS keys, storage encryption settings); key rotation records |
| **PR.DS-02** — data-in-transit protected | Encryption in transit across all communication channels | TLS configuration evidence; cert inventory; mTLS / VPN configuration where applicable |
| **PR.DS-10** — data-in-use protected | Controls protecting data during active processing | Hash / signature verification logs; tamper-evident logging; memory protection or secure enclave configuration where applicable |
| **PR.DS-11** — backups created, protected, maintained, and tested | Backup program covering creation, integrity, protection, and periodic restoration testing | Backup policy; backup completion logs; restoration test records; offsite or cloud backup configuration; backup access control evidence |

#### PR.PS — Platform Security

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **PR.PS-01** — configuration baselines maintained | System hardening baselines applied and monitored | CIS Benchmark scan reports; STIG compliance reports; configuration management tool (Puppet / Chef / Ansible / Terraform) state |
| **PR.PS-02** — software maintained, replaced, and removed commensurate with risk | Patch management and software lifecycle discipline | Patch management records; software EOL tracking; decommission logs; unsupported software inventory with exception approvals |
| **PR.PS-03** — hardware maintained, replaced, and removed commensurate with risk | Hardware refresh and disposal process | Hardware EOL / refresh schedule; decommission records; hardware disposal records with certificate of destruction where required |
| **PR.PS-04** — log records generated and made available for continuous monitoring | Logging coverage across systems and services with logs fed to monitoring tooling | Logging architecture diagram; log source inventory; SIEM ingestion proof |
| **PR.PS-05** — unauthorized software installation and execution prevented | Application control or allowlisting enforced | Application allowlisting configuration; EDR block records; software restriction policy documentation |
| **PR.PS-06** — secure software development practices integrated | Secure SDLC with security gates | SAST / DAST scan results; code review records; security gates in CI/CD pipeline |

#### PR.IR — Technology Infrastructure Resilience

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **PR.IR-01** — networks and environments protected from unauthorized logical access | Network segmentation and perimeter security controls | Network architecture diagrams; security group / firewall rule exports; segmentation test results |
| **PR.IR-02** — technology assets protected from environmental threats | Environmental controls protecting physical infrastructure | Environmental controls evidence (HVAC, fire suppression, flood protection); data center environmental audit records; UPS / power redundancy configuration |
| **PR.IR-03** — mechanisms implemented to achieve resilience in normal and adverse situations | Failover, redundancy, and DR capabilities tested and validated | Resilience architecture documentation; failover and DR test results; high-availability configuration evidence |
| **PR.IR-04** — adequate resource capacity maintained for availability | Capacity planning and auto-scaling in place | Capacity planning documents; load test results; auto-scaling configuration |

---

### Detect (DE) — continuous monitoring, adverse event analysis

Detect evidence is mostly **monitoring config + log samples + alert records**.

#### DE.CM — Continuous Monitoring

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **DE.CM-01** — networks and network services monitored for adverse events | Network monitoring and intrusion detection | SIEM dashboard screenshots / exports; NDR / IDS configuration; sample alerts |
| **DE.CM-02** — physical environment monitored for adverse events | Physical security monitoring of facilities | Physical security monitoring logs; CCTV configuration; environmental sensor alerts; physical access anomaly reports |
| **DE.CM-03** — personnel activity and technology usage monitored for adverse events | User and entity behavior analytics or insider threat detection | UEBA tool configuration; sample anomalous-activity alerts; data access monitoring configuration |
| **DE.CM-06** — external service provider activities and services monitored | Third-party access and activity monitoring | Vendor access audit logs; CASB configuration; sample alerts on third-party anomalous activity |
| **DE.CM-09** — computing hardware, software, runtime environments, and their data are monitored | Endpoint and runtime environment monitoring for anomalies | EDR configuration; runtime monitoring tool configuration; sample drift or anomaly alerts |

#### DE.AE — Adverse Event Analysis

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **DE.AE-02** — potentially adverse events analyzed to better understand associated activities | Event triage and analysis capability | SOC playbooks; analyst notes / case management records; sample triaged events |
| **DE.AE-03** — information correlated from multiple sources | Multi-source log correlation and enrichment | SIEM correlation rule examples; log aggregation architecture diagram; sample multi-source correlated alerts |
| **DE.AE-04** — estimated impact and scope of adverse events understood | Impact and scope analysis integrated into triage | Incident severity scoring rubric; sample severity assignments; escalation criteria documentation |
| **DE.AE-06** — information on adverse events provided to authorized staff and tools | Alert routing to the right people and downstream tooling | Alert routing rules; on-call / paging configuration; escalation matrix |
| **DE.AE-07** — cyber threat intelligence integrated into adverse event analysis | Threat intel enriching alerts and investigations | Threat intel platform (TIP) integration records; enriched alert samples; STIX / TAXII feed configuration |
| **DE.AE-08** — incidents declared when adverse events meet defined criteria | Formal incident declaration process with documented thresholds | Incident declaration criteria / severity thresholds; sample incident declarations; escalation workflow records |

---

### Respond (RS) — incident management, analysis, communication, mitigation

Respond evidence is mostly **incident records, runbooks, and after-action reports**.

#### RS.MA — Incident Management

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **RS.MA-01** — incident response plan executed in coordination with relevant third parties | IR plan in active use during incidents | Incident response plan; sample incident records; tabletop exercise reports |
| **RS.MA-02** — incident reports triaged and validated | Initial triage process to validate and assess incoming incident reports | Triage workflow documentation; sample triage records showing validation steps; runbook for initial incident intake |
| **RS.MA-03** — incidents categorized and prioritized | Classification and prioritization scheme applied consistently | Severity / category taxonomy; sample categorized and prioritized incident records |
| **RS.MA-04** — incidents escalated or elevated as needed | Escalation thresholds and paths defined and followed | Escalation policy / thresholds; sample escalation records; on-call / escalation matrix |
| **RS.MA-05** — criteria for initiating incident recovery applied | Defined and applied criteria for transitioning from response to recovery | Recovery initiation criteria documentation; sample decisions to initiate recovery with rationale; IR plan section defining recovery triggers |

#### RS.AN — Incident Analysis

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **RS.AN-03** — analysis performed to establish what occurred and root cause of incident | Forensic and root cause analysis capability | Forensic analysis reports; chain-of-custody logs where applicable; root cause analysis (RCA) documentation |
| **RS.AN-06** — investigation actions recorded with integrity and provenance preserved | Tamper-evident investigation audit trail | Investigation log with integrity controls; chain-of-custody records; forensic tool audit trails showing actions taken |
| **RS.AN-07** — incident data and metadata are collected, and their integrity and provenance are preserved | Evidence handling practices maintain chain of custody and integrity throughout the investigation | Forensic evidence collection procedures; chain-of-custody records; integrity hash / signing evidence; evidence storage access logs |
| **RS.AN-08** — an incident's magnitude is estimated and validated | Scope and impact quantification performed and validated during incident response | Incident scope assessment records; magnitude / impact estimates with validation notes; escalation decisions tied to magnitude assessments |

#### RS.CO — Incident Response Reporting and Communication

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **RS.CO-02** — internal and external stakeholders notified of incidents in a timely manner | Stakeholder notification process and records | Communication plan; sample notification records (internal and external); regulator notification samples (HHS OCR, state AGs, etc., where applicable) |
| **RS.CO-03** — information shared with designated internal and external stakeholders | Cross-functional and external coordination | Sample executive briefings; sample post-incident customer notifications; coordinated disclosure records |

#### RS.MI — Incident Mitigation

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **RS.MI-01** — incidents contained | Containment actions taken and documented | Sample containment actions; containment runbook; quarantine / isolation evidence |
| **RS.MI-02** — incidents eradicated | Eradication actions taken and documented | Eradication runbooks; sample eradication action records (malware removal, account disablement, etc.) |

---

### Recover (RC) — recovery plan execution, recovery communication

Recover evidence is mostly **BCDR plans, test reports, and recovery records**.

#### RC.RP — Incident Recovery Plan Execution

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **RC.RP-01** — recovery portion of incident response plan executed | Recovery plan in active use | BCDR plan; sample recovery records; recovery time achieved vs. RTO |
| **RC.RP-02** — recovery actions selected, scoped, prioritized, and performed | Recovery prioritization decisions documented and carried through to execution | Recovery priority ranking; sample prioritization decisions made during exercises or actual incidents; recovery task completion records |
| **RC.RP-03** — integrity of backups and restoration assets verified before use | Backup integrity validation before restoring | Backup verification logs; sample restoration tests; integrity check evidence |
| **RC.RP-04** — critical mission functions considered to establish post-incident operational norms | Return-to-operations criteria defined and applied | Post-incident operating model; sample reset-state documentation; criteria for declaring stabilized operations |
| **RC.RP-05** — integrity of restored assets verified and normal operating status confirmed | Post-restoration validation and sign-off | Restoration verification checklist; system health check records; sign-off records confirming normal operations resumed |
| **RC.RP-06** — end of incident recovery declared and incident-related documentation completed | Formal recovery closeout process | Sample closeout records; lessons-learned reports; incident closure approvals |

#### RC.CO — Incident Recovery Communication

| Subcategory | What it asks for | Evidence |
| --- | --- | --- |
| **RC.CO-03** — recovery activities and progress communicated to designated stakeholders | Internal and external recovery status updates | Sample recovery status updates; executive / customer / regulator communication records |
| **RC.CO-04** — public updates on incident recovery shared using approved methods and messaging | Controlled public communications during and after recovery | Public communications log; approved messaging templates; records of communications with media, customers, or regulators using approved channels |

---

## Reusing evidence across frameworks

CSF evidence is highly reusable. If the organization is also subject to:

- **HIPAA Security Rule** — most PR and DE evidence (encryption configs, audit logs, training records, BAAs) doubles as HIPAA evidence
- **PCI DSS v4.0.1** — PR.AA, PR.DS, DE.CM evidence covers most of the PCI technical requirements within CDE scope
- **NIST SP 800-53 Rev. 5** — direct mapping via Informative References; reuse 800-53 control evidence wholesale
- **ISO/IEC 27001:2022** — Annex A controls map to CSF Subcategories; reuse ISO ISMS evidence
- **GLBA Safeguards Rule** — Govern + Identify + Protect evidence covers most of the Safeguards Rule's written-program requirements
- **SOX ITGC** — PR.AA (access control), PR.PS-01 (configuration baselines), DE.CM (monitoring) feed ITGC testing

Use `/grc-engineer:optimize-multi-framework` to plan evidence collection that satisfies multiple frameworks at once. Avoid duplicating collection effort.

## Retention

CSF imposes no specific retention period. In practice, retain evidence for at least:

- **3 years** for general CSF Profile assessment artifacts (most cyber insurance carriers and federal contracting officers expect this)
- **6 years** if the same evidence supports HIPAA Security Rule (45 CFR §164.316(b)(2))
- **As specified by sector regulator** if the evidence is reused for FERC/NERC, FFIEC, PCI DSS, etc. — those regulators' retention requirements govern.
- **As specified by state law** for breach-related evidence — varies by state; conservative default is 7 years.

## Examples

```bash
# Full evidence checklist (all six Functions)
/nist-csf-20:evidence-checklist

# Govern Function evidence only — useful for board reporting prep
/nist-csf-20:evidence-checklist --function=GV

# Detect + Respond + Recover for an IR readiness engagement
/nist-csf-20:evidence-checklist --function=DE
/nist-csf-20:evidence-checklist --function=RS
/nist-csf-20:evidence-checklist --function=RC

# CSV export for spreadsheet-driven evidence tracking
/nist-csf-20:evidence-checklist --format=csv
```

## Related commands

- `/nist-csf-20:scope` — define Profile / Tier / Function scope before collecting evidence
- `/nist-csf-20:assess` — gap-assess the collected evidence against the Target Profile
- `/grc-engineer:gap-assessment general-nist-csf-2-0` — direct SCF-crosswalk-driven assessment

---

**Framework**: NIST Cybersecurity Framework v2.0 (final, February 26, 2024)
**SCF ID**: `general-nist-csf-2-0`
**Status**: Voluntary; widely adopted as a U.S. and international cybersecurity baseline
