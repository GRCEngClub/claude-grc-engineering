---
description: Evidence checklist for EU NIS2, organised by the ten Article 21 risk-management domains and the Article 23 incident-reporting workflow
---

# EU NIS2 Evidence Checklist

Baseline evidence checklist for a NIS2 assessment. Organised by the **ten Article 21 cybersecurity risk-management domains** that every Member State's transposition law requires in-scope entities to address, plus the **Article 20 management-body** evidence and the **Article 23 incident-reporting** workflow. The SCF crosswalk maps 68 SCF controls to the 30 NIS2 directive-level controls; this command pairs each Article 21 domain with the SCF families and connectors that automate evidence collection.

## Usage

```
/eu-nis2:evidence-checklist [--domain=<article-21-domain>] [--include-annex]
```

## Arguments

- `--domain=<article-21-domain>` (optional) — restrict to a single Article 21(2) domain. Valid values: `risk-policies`, `incident-handling`, `business-continuity`, `supply-chain`, `acquisition-development`, `effectiveness`, `cyber-hygiene`, `cryptography`, `hr-access-asset`, `mfa-comms`, `governance`, `reporting`. Defaults to all.
- `--include-annex` (optional) — when set, expand each domain with the corresponding controls from Implementing Regulation (EU) 2024/2690 (the NIS2 "Annex" implementing act) using the `emea-eu-nis2-annex-2024` SCF crosswalk. Use this for entities in the digital-infrastructure / ICT-service-management / digital-provider categories.

## Output

Markdown checklist grouped by Article 21 domain (and optionally by Annex implementing-act control family) with:

- Domain → Article 21(2)(letter) citation → SCF family → SCF control IDs (from the crosswalk).
- Evidence types typically expected (policy documents, registers, logs, tickets, configurations, training records, board minutes).
- Which connector plugins (`aws-inspector`, `gcp-inspector`, `github-inspector`, `okta-inspector`, etc.) can collect each evidence type automatically.
- Which items require manual upload / narrative (governance evidence, contracts, board approvals).
- Retention guidance — NIS2 itself does not set a single retention period; the plugin defers to the Member State transposition law and to the entity's ISMS retention rules. Most national supervisors expect at least the audit cycle plus the limitation period for administrative fines (commonly 5 years).

## Article 20 — Management-body governance evidence

NIS2 makes the **management body** legally accountable for cybersecurity. Evidence here is unusually high-stakes because a national supervisor will typically open with: "show me that your board approved the Article 21 measures and is overseeing implementation."

| Evidence | Source / format | Auditor expectation |
|---|---|---|
| Board minutes approving the Article 21 cybersecurity risk-management measures | Board pack, signed minutes | Date-stamped, with the specific resolution; must reference the Article 21 measures, not just "the security policy" |
| Board minutes showing periodic oversight of the cybersecurity programme | Quarterly or annual cadence | Evidence that the board is reviewing KPIs, incidents, exceptions, and the risk register — not just receiving a status update |
| Cybersecurity training completion records for the management body | LMS export, training-vendor certificates | Article 20(2) requires training "to gain sufficient knowledge and skills" |
| Cascade training plan and completion records for employees | LMS, training calendar, attendance records | Article 21(2)(g) — basic cyber-hygiene practices and cybersecurity training |
| Job description / mandate of the cybersecurity programme owner | Org chart, role description | National laws often require a designated person; may be CISO or equivalent |
| Risk-treatment plan signed off by the management body | Risk register extract, signed cover sheet | Demonstrates that the board approved the risk-management approach, not just the policy |

## Article 21(2)(a) — Risk analysis and information system security policies

| Evidence | Source / format |
|---|---|
| Cybersecurity policy (master) approved by the management body | PDF, version-controlled |
| Risk-analysis methodology document | ISO 27005-aligned or equivalent |
| Risk register with current entries | GRC tool export (CSV/JSON) |
| Asset inventory linked to risk register | CMDB export, cloud asset inventory |
| Information classification scheme | Policy document |
| Periodic risk-analysis review records | Meeting minutes, risk-committee outputs |

SCF families typically referenced: `RSK` (risk management), `GOV` (governance), `AST` (asset management).

## Article 21(2)(b) — Incident handling

| Evidence | Source / format |
|---|---|
| Incident response plan / runbook | Document, with a NIS2-specific section for the 24h/72h/1mo timeline |
| Incident classification scheme distinguishing significant incidents (Article 23 trigger) | Annex to the IR plan |
| Incident register / ticketing-system extract | Jira/ServiceNow/SOAR export |
| Detection capability evidence (SIEM, EDR, NDR coverage) | Tool inventory, detection-rule export |
| Tabletop exercise reports (cyber, ransomware, supply-chain) | Exercise after-action reports |
| Post-incident reviews for past significant incidents | PIR documents |
| Copies of past Article 23 submissions (early warning, notification, final report) | Portal exports / signed copies |

SCF families: `IRO` (incident response operations), `MON` (monitoring).

## Article 21(2)(c) — Business continuity and crisis management

| Evidence | Source / format |
|---|---|
| Business impact analysis covering NIS2-covered services | BIA document |
| Backup management policy | Policy document |
| Backup test reports (most recent) | Test logs |
| Disaster-recovery plan with RTO/RPO per service | DR plan document |
| DR test reports (most recent) | Test reports, lessons learned |
| Crisis-management plan (org-wide) | Document, with cyber-specific annex |
| Business-continuity exercise records | Exercise reports |

SCF families: `BCD` (business continuity and disaster recovery), `CRP` (cryptographic protections — for backup encryption).

## Article 21(2)(d) — Supply-chain security

| Evidence | Source / format |
|---|---|
| Supplier inventory (ICT and ICT-adjacent suppliers) | Procurement system export |
| Supplier risk-rating methodology | Methodology document |
| Supplier risk register with current ratings | Register extract |
| Standard security clauses in supplier contracts | Contract templates, master service agreements |
| Right-to-audit / SOC2-acceptance / ISO27001-acceptance evidence per critical supplier | Vendor questionnaires, third-party assessment reports |
| Subcontractor / fourth-party tracking for material suppliers | Supplier questionnaire responses |
| Process for handling vulnerabilities in supplier products/services | Documented procedure |
| Cooperation Group Article 22 coordinated risk-assessment outputs that affect the entity | Reference to published assessments |

SCF families: `TPM` (third-party management), `RSK`.

## Article 21(2)(e) — Security in network and information systems acquisition, development, and maintenance

| Evidence | Source / format |
|---|---|
| Secure development lifecycle policy | Policy document |
| Security requirements in procurement / SDLC stage gates | Procurement checklist, stage-gate template |
| Vulnerability management policy and SLA | Policy document |
| Vulnerability scan reports (most recent) | Scanner exports (network, infra, app) |
| Penetration testing reports (most recent, plus remediation evidence) | Pentest report |
| Patch management evidence (deployment success rate, time-to-patch by severity) | Patch tooling export |
| Coordinated vulnerability disclosure policy / `security.txt` / VDP page | Public policy URL |
| Change-management records for production changes | Change tickets export |

SCF families: `CHG` (change management), `VPM` (vulnerability and patch management), `TDA` (technology development & acquisition).

## Article 21(2)(f) — Effectiveness assessment

| Evidence | Source / format |
|---|---|
| Internal audit programme covering cybersecurity controls | Audit charter, audit calendar |
| Internal audit reports (most recent cycle) | Audit reports |
| Control-testing programme outputs (sampling, results) | Test logs |
| Cybersecurity KPIs / KRIs reported to management | Metrics dashboard export |
| Management review minutes for the cybersecurity programme | Meeting minutes |
| External assessment reports (penetration test, red team, ISO 27001 certification audit, SOC 2) | Reports, certificates |
| Corrective-action tracking from prior assessments | Action register |

SCF families: `CPL` (compliance), `MON`, `RSK`.

## Article 21(2)(g) — Cyber hygiene and training

| Evidence | Source / format |
|---|---|
| Cyber-hygiene baseline standard (passwords, MFA, patching, backups, phishing-resistance) | Standard document |
| Security awareness training curriculum | Curriculum outline |
| Training completion records (overall workforce + role-based + management body) | LMS export |
| Phishing simulation results (most recent) | Simulation tool export |
| New-joiner security onboarding records | HR system export |
| Specialist training records for privileged roles (admins, developers, IR team) | Certifications, attendance records |

SCF families: `SAT` (security awareness and training), `HRS` (human resources security).

## Article 21(2)(h) — Cryptography

| Evidence | Source / format |
|---|---|
| Cryptographic policy (algorithms, key lengths, modes, key-management) | Policy document |
| Encryption-at-rest evidence per data store | Cloud-provider config exports, SIEM compliance findings |
| Encryption-in-transit evidence per public-facing service | TLS scan results, load-balancer configs |
| Key-management evidence (KMS/HSM inventory, rotation logs) | KMS configuration export |
| Certificate inventory and lifecycle evidence | Certificate-management tool export |
| Cryptographic-agility plan (post-quantum readiness, where appropriate) | Plan document |

SCF families: `CRY` (cryptography), `IAC` (identity and access control).

## Article 21(2)(i) — HR security, access control, asset management

| Evidence | Source / format |
|---|---|
| Joiner/mover/leaver process documentation | Procedure document |
| HR-to-IAM provisioning evidence (sample tickets) | Identity-system audit log |
| Periodic access-review evidence (most recent cycle, by application/system) | Access-review tool export |
| Privileged-access management evidence (PAM session logs, vault inventory) | PAM tool export |
| Segregation-of-duties matrix and exception register | Matrix document, exceptions register |
| Background-check policy (where lawful in the Member State) and execution evidence | Policy + sample records |
| Asset inventory with ownership per asset | CMDB / cloud asset inventory |
| Acceptable-use policy with employee acknowledgement | Policy + signed acknowledgements (or digital equivalent) |

SCF families: `IAC`, `HRS`, `AST`.

## Article 21(2)(j) — Multi-factor authentication, secured comms, secured emergency comms

| Evidence | Source / format |
|---|---|
| MFA enforcement evidence for all administrative and remote access | IdP configuration export, MFA coverage report |
| Continuous-authentication or risk-based authentication where deployed | IdP policy export |
| Secured email / messaging baseline (DMARC/DKIM/SPF, transport encryption, internal messaging hardening) | DNS records, mail-flow configuration |
| Secured voice/video baseline (provider security posture, encryption-in-transit) | Vendor security pack, configuration |
| Emergency-communication system (out-of-band channel for incident response) | Documented IR contact tree, OOB channel inventory |

SCF families: `IAC`, `NET` (network defense), `END` (endpoint security).

## Article 23 — Incident reporting workflow evidence

The 24h/72h/1mo timeline is itself an evidence-generating workflow. For every reportable incident the plugin records:

| Stage | Artifact | Required content (Article 23(4)) |
|---|---|---|
| Early warning | 24-hour submission to the national CSIRT / competent authority | Whether the incident is suspected of being caused by unlawful or malicious acts; whether it could have a cross-border impact |
| Incident notification | 72-hour submission | Update on the early warning; initial assessment of severity and impact; where available, indicators of compromise |
| Final report | 1-month submission (or interim report at 1 month + final after handling) | Detailed incident description; type of threat / root cause; mitigation measures applied and ongoing; cross-border impact (where applicable) |
| Recipients of services notification | Where appropriate (Article 23(2)) | Notification to recipients adversely affected; for significant cyber threats, notification of the threat and any measures or remedies recipients can take |

Maintain a register that, for each incident, contains: detection time, awareness time, classification rationale (significant or not), submission timestamps and reference numbers, copies of the submissions, recipients-of-services notifications, and the post-incident review.

## Connector coverage notes

The Tier-1 connector plugins (`aws-inspector`, `gcp-inspector`, `github-inspector`, `okta-inspector`) emit findings that map to the SCF families above and are particularly useful for:

- Article 21(2)(h) — encryption at rest / in transit configuration evidence (cloud connectors).
- Article 21(2)(i)–(j) — IAM, MFA, access-review evidence (`okta-inspector`, cloud connectors).
- Article 21(2)(b) — log/SIEM coverage and detection control evidence (cloud connectors for log destinations and retention).
- Article 21(2)(e) — vulnerability findings and patch state (cloud connectors, `github-inspector` for code-level findings).

Governance evidence (Article 20 board minutes, training records, supplier contracts, tabletop exercise reports) is manual-upload territory. Plan for narrative evidence to make up roughly half of a NIS2 evidence pack.
