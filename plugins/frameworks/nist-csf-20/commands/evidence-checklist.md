---
description: NIST CSF 2.0 evidence checklist organized by Function (GV / ID / PR / DE / RS / RC) with representative Subcategories
---

# NIST CSF 2.0 Evidence Checklist

Baseline evidence checklist for a **NIST Cybersecurity Framework v2.0** Profile assessment. CSF is outcomes-based, not control-based — evidence demonstrates that an outcome (a Subcategory) is achieved, regardless of *how*. This checklist is organized by the six Functions, with a few representative Subcategories per Function and the artifacts an assessor or board reviewer typically expects to see.

> **Never commit evidence artifacts to source control.** Configuration exports, access logs, and incident records frequently contain sensitive operational detail. Use an encrypted, access-controlled evidence locker. The repo's default `.gitignore` should already cover `evidence/`.

## Usage

```
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

| Representative Subcategory | What it asks for | Evidence the assessor / board expects |
|---|---|---|
| **GV.OC-01** — mission understands cybersecurity risk | Cybersecurity tied to the organization's mission | Cybersecurity strategy document referencing mission; board / executive sign-off |
| **GV.OC-03** — legal/regulatory cybersecurity requirements identified | Catalog of regulatory obligations (HIPAA, PCI DSS, GLBA, state breach laws, sector regulators) | Regulatory inventory / register; ownership map; review cadence record |
| **GV.RM-01** — risk tolerance and appetite established | Documented risk tolerance / appetite statements | Approved risk appetite statement; integration record with enterprise risk function |
| **GV.RR-02** — roles, responsibilities, authorities for cybersecurity established | RACI for cybersecurity decisions | Cybersecurity RACI / org chart; CISO charter; board cybersecurity oversight charter |
| **GV.PO-01** — policies for managing cybersecurity risk are established | Written, approved cybersecurity policies | Policy library with version control, approval signatures, and review history |
| **GV.OV-01** — cybersecurity strategy results inform improvements | Board / audit committee oversight of strategy | Board cybersecurity reporting deck; audit committee minutes; independent review report |
| **GV.SC-01** — cyber supply chain risk management process established | C-SCRM program documentation | Vendor risk management policy; tiered vendor inventory; due diligence templates |
| **GV.SC-05** — supply chain requirements addressed in contracts | Contract language for vendor cybersecurity | Standard cybersecurity contract clauses; sample executed vendor agreements |

### Identify (ID) — context, assets, risk assessment, improvement

Identify evidence is mostly **inventories and assessments**.

| Representative Subcategory | What it asks for | Evidence |
|---|---|---|
| **ID.AM-01** — hardware inventory maintained | Asset inventory of physical devices | Asset inventory export (CMDB / IT asset management tool); reconciliation cadence record |
| **ID.AM-02** — software inventory maintained | Software inventory | Software asset management export; SBOM (software bill of materials) where applicable |
| **ID.AM-03** — data flows mapped | Data flow diagrams and data inventory | Data flow diagrams; data classification register; data lineage documentation |
| **ID.AM-05** — assets prioritized based on classification, criticality, business value | Asset criticality / classification scheme | Asset classification scheme; tier assignment per system; review record |
| **ID.RA-01** — vulnerabilities in assets identified, validated, recorded | Vulnerability management process | Vulnerability scan reports; remediation ticket samples; SLA / process documentation |
| **ID.RA-05** — threats, vulnerabilities, likelihoods, impacts used to determine risk | Risk assessment methodology and outputs | Risk assessment report; risk register; methodology documentation (often NIST SP 800-30 aligned) |
| **ID.IM-01** — improvements identified from evaluations | Lessons-learned and continuous improvement | Post-incident review reports; security program review minutes; improvement backlog |

### Protect (PR) — identity, training, data, platform, infrastructure

Protect evidence is the largest bucket and is mostly **technical configuration plus operational records**.

| Representative Subcategory | What it asks for | Evidence |
|---|---|---|
| **PR.AA-01** — identities and credentials managed | Identity and access management baseline | IAM configuration export (cloud IdP / Active Directory / Entra / Okta); user provisioning workflow documentation |
| **PR.AA-03** — users, services, hardware authenticated commensurate with risk | Authentication strength | MFA enrollment / enforcement reports; authentication policy; service-account inventory |
| **PR.AA-05** — access permissions managed per least privilege and separation of duties | Role-based access and separation of duties | RBAC role definitions; access review records; SoD conflict matrix |
| **PR.AT-01** — personnel awareness training | Security awareness training program | Training completion reports; training content / curriculum; phishing simulation results |
| **PR.DS-01** — data-at-rest protected | Encryption at rest | Encryption configuration evidence (KMS keys, storage encryption settings); key rotation records |
| **PR.DS-02** — data-in-transit protected | Encryption in transit | TLS configuration evidence; cert inventory; mTLS / VPN configuration where applicable |
| **PR.DS-10** — data integrity protected | Integrity controls | Hash / signature verification logs; tamper-evident logging; change-detection alerts |
| **PR.PS-01** — configuration baselines maintained | System hardening baselines | CIS Benchmark scan reports; STIG compliance reports; configuration management tool (Puppet/Chef/Ansible/Terraform) state |
| **PR.PS-04** — log records generated and made available | Logging coverage | Logging architecture diagram; log source inventory; SIEM ingestion proof |
| **PR.PS-06** — secure software development practices | Secure SDLC | SAST / DAST scan results; code review records; security gates in CI/CD pipeline |
| **PR.IR-01** — networks and environments protected from unauthorized access | Network segmentation and perimeter | Network architecture diagrams; security group / firewall rule exports; segmentation test results |
| **PR.IR-04** — adequate resource capacity ensures availability | Capacity and resilience | Capacity planning documents; load test results; auto-scaling configuration |

### Detect (DE) — continuous monitoring, adverse event analysis

Detect evidence is mostly **monitoring config + log samples + alert records**.

| Representative Subcategory | What it asks for | Evidence |
|---|---|---|
| **DE.CM-01** — networks and network services monitored to find adverse events | Network monitoring | SIEM dashboard screenshots / exports; NDR / IDS configuration; sample alerts |
| **DE.CM-03** — personnel activity monitored to find adverse events | UEBA / insider threat detection | UEBA tool configuration; sample anomalous-activity alerts; data access monitoring |
| **DE.CM-06** — external service provider activities monitored | Third-party access monitoring | Vendor access audit logs; CASB configuration; sample alerts on third-party anomalies |
| **DE.CM-09** — computing hardware/software, runtime environments, configurations monitored | Endpoint and configuration drift monitoring | EDR configuration; configuration drift reports; sample drift alerts |
| **DE.AE-02** — potentially adverse events analyzed to better understand activity | Triage and analysis | SOC playbooks; analyst notes / case management records; sample triaged events |
| **DE.AE-04** — estimated impact and scope of adverse events understood | Impact / scope assessment | Incident severity scoring rubric; sample severity assignments; escalation criteria |
| **DE.AE-06** — information about adverse events provided to authorized staff/tools | Alert routing | Alert routing rules; on-call / paging configuration; escalation matrix |

### Respond (RS) — incident management, analysis, communication, mitigation

Respond evidence is mostly **incident records, runbooks, and after-action reports**.

| Representative Subcategory | What it asks for | Evidence |
|---|---|---|
| **RS.MA-01** — incident response plan executed in coordination with relevant third parties | IR plan in use | Incident response plan; sample incident records; tabletop exercise reports |
| **RS.MA-02** — incidents categorized and prioritized | Incident classification scheme | Severity / category taxonomy; sample categorized incidents |
| **RS.AN-03** — analysis performed to establish what has happened during an incident | Forensic / analysis capability | Forensic analysis reports; chain-of-custody logs (where applicable); analysis tool inventory |
| **RS.CO-02** — internal and external stakeholders notified of incidents | Stakeholder notification | Communication plan; sample notification records (internal and external); regulator notification samples (HHS OCR, state AGs, etc., where applicable) |
| **RS.CO-03** — information shared with designated internal and external stakeholders | Cross-functional coordination | Sample executive briefings; sample post-incident customer notifications |
| **RS.MI-01** — incidents contained | Containment | Sample containment actions; runbook for containment; quarantine / isolation evidence |
| **RS.MI-02** — incidents eradicated | Eradication | Eradication runbooks; sample eradication action records (malware removal, account disablement, etc.) |

### Recover (RC) — recovery plan execution, recovery communication

Recover evidence is mostly **BCDR plans, test reports, and recovery records**.

| Representative Subcategory | What it asks for | Evidence |
|---|---|---|
| **RC.RP-01** — recovery portion of incident response plan executed | Recovery plan in use | BCDR plan; sample recovery records; recovery time achieved vs RTO |
| **RC.RP-02** — recovery actions selected, scoped, prioritized | Recovery prioritization | Recovery priority ranking; sample prioritization decisions during exercises |
| **RC.RP-03** — integrity of backups and other restoration assets verified before use | Backup integrity | Backup verification logs; sample restoration tests; integrity check evidence |
| **RC.RP-04** — critical mission functions and cybersecurity risk management considered to establish post-incident operational norms | Post-incident operational baseline | Post-incident operating model; sample reset-state documentation |
| **RC.RP-06** — end of incident recovery declared and incident-related documentation completed | Recovery closeout | Sample closeout records; lessons-learned reports; incident closure approvals |
| **RC.CO-03** — recovery activities and progress communicated to designated stakeholders | Recovery communication | Sample recovery status updates; executive / customer / regulator communication records |

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

```
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
