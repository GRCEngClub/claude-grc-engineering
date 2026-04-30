---
name: us-sox-expert
description: Sarbanes-Oxley Act of 2002 (SOX) expert for ICFR-relevant IT and security work. Deep knowledge of 15 U.S.C. §§ 7201 et seq., §302/§404/§906 certifications, accelerated/non-accelerated filer scoping, ITGC testing across the four classic domains (Access, Change, Operations, Development), entity-level controls, IT-dependent manual controls, deficiency evaluation, SOC 1 vendor reliance, and the SEC/PCAOB/DOJ enforcement triangle.
allowed-tools: Read, Glob, Grep, Write
---

# Sarbanes-Oxley Act of 2002 (SOX) Expert

Deep, practitioner-level expertise in the Sarbanes-Oxley Act of 2002 — the U.S. federal statute that governs financial reporting controls for SEC-registrant public companies. This skill is written for the security and IT engineer who has been told they "own SOX" or "support SOX" and needs to understand what the audit machine around them actually does.

## Framework identity

- **SCF framework ID**: `usa-federal-law-sox-2002`
- **Statute**: Sarbanes-Oxley Act of 2002, Public Law 107-204, codified at 15 U.S.C. §§ 7201 et seq. (criminal provisions in 18 U.S.C. §§ 1350, 1519)
- **Region**: Americas
- **Country**: US
- **Regulators**:
  - **SEC** (Securities and Exchange Commission) — disclosure-rule enforcement, civil actions, criminal referrals
  - **PCAOB** (Public Company Accounting Oversight Board) — created by SOX §101; oversees auditors of public companies; sets the auditing standards (notably AS 2201 — *An Audit of Internal Control over Financial Reporting that is Integrated with an Audit of Financial Statements*) that drive the way external auditors test ICFR
  - **DOJ** (Department of Justice) — criminal enforcement of §802 (document destruction) and §906 (knowing false certification)
- **SCF crosswalk coverage**: only **4 SCF controls → 17 SOX-relevant controls**. That number is small for a reason — see "Why the SCF mapping is thin" below.

## Framework in plain language

SOX is the U.S. response to the Enron and WorldCom accounting frauds of 2001–2002. It does **not** prescribe specific cybersecurity controls. What it does is impose three things on SEC-registrant public companies and their auditors:

1. **Personal accountability for financial disclosures** by the CEO and CFO (§302 and §906 certifications, with criminal exposure under §906).
2. **An annual management assessment of the design and operating effectiveness of Internal Controls over Financial Reporting (ICFR)** filed in the 10-K (§404(a)).
3. **An external auditor attestation on management's ICFR assessment** for accelerated filers (§404(b), required by 15 U.S.C. § 7262(b)).

The security/IT relevance is indirect but unavoidable: virtually every modern in-scope financial process depends on IT systems, so management's §404(a) assessment must cover the IT General Controls (ITGCs) protecting those systems, and the external auditor will test those ITGCs under AS 2201 as part of the §404(b) attestation. That ITGC testing is where a security or platform engineer's day-to-day SOX work happens.

## Why this plugin frames SOX as a governance-over-ICFR layer

The SCF crosswalk maps only **4 SCF controls** to SOX. That is correct, not a gap — SOX's statutory text is structured around officer certifications, auditor independence, audit committee composition, document retention, and disclosure rules, not technical control objectives. The control catalog that practitioners actually test against is **COSO 2013 Internal Control — Integrated Framework** at the entity-level layer, **COBIT 5 / 2019** for IT-process controls, and the **AICPA Trust Services Criteria** where ITGC overlap exists (e.g., a SOC 1 Type II from a service organization is the typical vendor-reliance evidence).

So SOX's role in this plugin is **the governance and accountability frame**:

- §302 + §906 = personal certification (the "tone at the top" forcing function)
- §404(a) = management assessment of ICFR (forces a control inventory, scope, walkthrough, and test program)
- §404(b) = external auditor attestation (forces independent reperformance of that test program for accelerated filers)
- §802 = document retention with criminal teeth
- §409 = real-time material-event disclosure (8-K within 4 business days)

The actual control objectives flow from COSO + COBIT + the auditor's own internal control workpaper templates. This plugin helps you scope SOX correctly, run an honest ICFR-style gap assessment via the SCF crosswalk, and assemble the ITGC evidence package an external auditor will recognize — without pretending SOX is a security framework.

## Territorial scope and applicability

### Who must comply

Any company whose securities are **registered under §12** of the Securities Exchange Act of 1934 (listed on a U.S. national securities exchange like NYSE or Nasdaq) **or** required to file periodic reports under **§15(d)** of the 1934 Act (e.g., issuers with publicly registered debt). In short: **U.S.-listed public companies**, plus a number of issuers required to file 10-K / 10-Q / 8-K reports with the SEC even if not exchange-listed.

### Foreign private issuers

A non-U.S. company with securities listed on a U.S. exchange is generally subject to SOX, with limited carve-outs and accommodation for home-country governance practices (e.g., 20-F annual filings instead of 10-K, but the §302 and §404 substance still applies). Don't assume "we're headquartered abroad" gets you out of SOX scope.

### Private companies in the SOX runway

Two common cases where a private company should be running SOX-grade ICFR even though it is not yet a §12 registrant:

- **Pre-IPO (S-1 readiness)** — once the S-1 lands, the company effectively needs §404(a)-quality ICFR documentation in place; underwriters, auditors, and the SEC review team will probe it. Most pre-IPO companies start the ICFR build 12–24 months before the planned listing.
- **Acquisition by a public company** — once acquired, the target's financially significant systems become in-scope for the parent's §404(a) assessment, typically with a one-year integration window.

### Filer-status determinations (this drives §404(b) exposure)

The §404(b) external-auditor attestation requirement does **not** apply to all SOX filers. The applicable categories under SEC rules:

- **Large accelerated filer**: public float ≥ $700M. §404(b) required.
- **Accelerated filer**: public float ≥ $75M and < $700M. §404(b) required, except where the SEC's 2020 amendments exclude qualifying low-revenue issuers — for example, an issuer with $75M–$700M public float, annual revenues below $100M, and no prior accelerated or large-accelerated-filer status.
- **Non-accelerated filer**: public float < $75M. **§404(b) not required** (per amendments stemming from the Dodd-Frank Act). §404(a) management assessment **is** still required.
- **Emerging Growth Company (EGC)** — under the JOBS Act, an EGC is exempt from §404(b) for up to **5 years** from its IPO (or until it loses EGC status by exceeding revenue, debt issuance, or large-accelerated-filer thresholds). §404(a) still applies.
- **Smaller Reporting Company (SRC)** — the SRC vs. non-SRC determination affects scaled disclosure rules but is partly orthogonal to §404(b); confirm by walking the current SEC filer-status definitions.

**Practitioner tip**: Year-1 SOX scope and effort are dominated by whether the company is required to engage an external auditor for §404(b). Confirm filer status with the controller and the external auditor *before* sizing the SOX program — the difference is the difference between a management self-assessment and a full integrated audit.

## Mandatory artifacts (the "named documents" SOX practitioners produce)

SOX has fewer named regulatory artifacts than GDPR or PCI DSS, but practitioners build a recurring set of documents around the ICFR cycle. The ones an auditor will ask for first:

- **Management's §404(a) assessment** — included in the 10-K Management's Report on Internal Control over Financial Reporting. Asserts whether ICFR is effective as of the fiscal year-end. Required.
- **§302 quarterly disclosure-controls certification** — signed by CEO and CFO; included in each 10-K and 10-Q. Asserts personal review of the report and effectiveness of disclosure controls and procedures.
- **§906 certification** — separate criminal certification by CEO and CFO under 18 U.S.C. § 1350 that the periodic report fully complies with the Exchange Act and fairly presents financial condition.
- **External auditor's §404(b) attestation report** — for accelerated filers; included in the 10-K alongside the financial-statement audit opinion.
- **ICFR scoping memo** — internal document linking material accounts to in-scope processes and in-scope IT systems (often produced by internal audit or the SOX PMO; reviewed by external auditor).
- **Risk and control matrix (RCM) / RACM** — the operational artifact that lists each in-scope control, its owner, frequency, evidence type, and links to the financial-statement assertion(s) it supports.
- **Walkthrough documentation** — narratives and flowcharts demonstrating that the documented design of each in-scope control matches reality.
- **Test-of-design and test-of-operating-effectiveness workpapers** — sample-based testing results, supporting management's §404(a) assertion and feeding the external auditor's §404(b) reperformance.
- **Deficiency log** — running list of identified control deficiencies with severity classification (deficiency, significant deficiency, material weakness) and remediation plans.
- **SOC 1 Type II reports for in-scope vendors**, plus **complementary user entity controls (CUECs)** — see "SOC 1 vs. SOC 2" below.

## Cadence and timelines

- **10-K** — annual report; includes the §404(a) assessment and (if accelerated filer) the §404(b) attestation. Filing deadlines vary by filer status: 60 days after fiscal year-end for large accelerated, 75 days for accelerated, 90 days for non-accelerated.
- **10-Q** — quarterly report; includes the §302 certification and updates on any material changes to ICFR. Filing deadlines: 40 days after quarter-end for large accelerated and accelerated filers, 45 days for non-accelerated.
- **8-K** — current report for material events. SOX §409 codifies "real-time" disclosure; the SEC's implementing rules require an 8-K filing within **4 business days** of a triggering event.
- **ICFR cycle** — typical large public-company cadence: scoping refresh in Q1, walkthroughs in Q2, interim operating-effectiveness testing in Q2/Q3, year-end (rollforward) testing in Q4 and into Q1 of the next fiscal year, deficiency aggregation and remediation tracking continuous.
- **Document retention** — §802 (codified at 18 U.S.C. § 1519) carries up to **20 years** imprisonment for knowing destruction of documents with intent to obstruct a federal investigation. Auditor work papers must be retained for **7 years** under PCAOB rules. Practical guidance: retain SOX evidence (testing workpapers, screenshots, walkthroughs, deficiency logs) for at least 7 years.

## Regulator and enforcement

SOX enforcement is shared across three institutions — understanding which one is on the line for which provision matters:

### SEC (civil disclosure enforcement)

The SEC enforces the disclosure provisions and can bring civil actions against issuers, officers, directors, and gatekeepers (auditors, lawyers) for violations of the Exchange Act, Rules 13a-14 / 13a-15, and the §404 requirements. Sanctions include monetary penalties, officer-and-director bars, disgorgement, and cease-and-desist orders. Common SEC enforcement themes around SOX:

- Restatements traceable to material weaknesses in ICFR that management failed to disclose
- §302 certifications signed despite known material control gaps
- Failure of the audit committee or disclosure committee to perform an effective review

### PCAOB (auditor oversight)

The PCAOB does not directly enforce SOX against issuers — it enforces against the audit firms that audit them. PCAOB inspections produce findings on the audit firm's work, including ICFR audit deficiencies under AS 2201. When the PCAOB inspects an audit firm and finds the firm's ICFR audit work insufficient at a particular issuer, the issuer often becomes the subject of additional auditor scrutiny in the next cycle. Practitioner consequence: if your external auditor is in an active PCAOB inspection, your ITGC and process-control evidence requests will be more rigorous than usual.

### DOJ (criminal enforcement)

Criminal exposure under SOX runs through two main channels:

- **§906** (codified at 18 U.S.C. § 1350) — knowingly false CEO/CFO certifications. Statutory maximum is **10 years** for "knowing" violations and **20 years** for "willful" violations, plus fines.
- **§802** (codified at 18 U.S.C. § 1519) — destroying, altering, or falsifying records with intent to obstruct a federal investigation. Statutory maximum **20 years**.

These criminal provisions are why §302 and §906 sign-off processes inside public companies are taken with extreme seriousness — the personal exposure is real, and disclosure committees exist specifically to give CEOs and CFOs a documented basis for their certifications.

### Penalty calculation

Unlike GDPR's percentage-of-revenue model, SOX civil penalties are statutory and per-violation, with the SEC empowered to bring enforcement actions seeking disgorgement and officer/director bars in addition to fines. There is no published SOX-specific tier table; penalty exposure is driven by the underlying disclosure or accounting violation, not by SOX itself. The criminal exposure under §906 and §802 is the more significant practical deterrent for officers.

## Internal Controls over Financial Reporting (ICFR) — where IT and security plug in

SOX itself does not define a control framework. Almost every U.S. public company uses **COSO 2013 Internal Control — Integrated Framework** as its ICFR framework, because the SEC's §404 implementing rules permit management to use any "suitable" recognized framework and COSO 2013 is the de facto standard. (The PCAOB's AS 2201 is the *auditor's* standard for testing ICFR; COSO is *management's* control framework.) This plugin paraphrases COSO concepts but does not reproduce COSO IC-IF text — that text is copyrighted by the Committee of Sponsoring Organizations.

### COSO's five components (paraphrased)

1. **Control Environment** — the governance "tone at the top": board oversight, ethical values, organizational structure, accountability, HR policies.
2. **Risk Assessment** — identifying and analyzing risks to financial-reporting objectives; includes fraud risk assessment.
3. **Control Activities** — the policies and procedures that mitigate identified risks, executed at entity, process, and IT levels.
4. **Information and Communication** — the systems that produce, capture, and communicate financial information.
5. **Monitoring Activities** — ongoing and separate evaluations of whether the other four components are functioning.

### Three categories of controls in a SOX program

- **Entity-Level Controls (ELCs)** — operate at the company level. Tone-at-the-top, code of conduct, fraud risk assessment, audit-committee composition, whistleblower hotline, period-end financial-reporting controls. Often tested first because effective ELCs let the auditor place reliance on a smaller sample of process-level controls.
- **Process-Level Controls** — operate inside a business process. Order-to-cash (revenue recognition), procure-to-pay (expense recognition), payroll, inventory, fixed assets, treasury, financial close and reporting, tax. These are the "business cycle" controls.
- **IT General Controls (ITGCs)** — controls over the IT environment that enable reliance on automated process controls and IT-dependent manual controls. **This is where security and platform engineers spend almost all of their SOX time.** The four classic ITGC domains:

  1. **Access to Programs and Data** — logical access provisioning / deprovisioning, periodic user access reviews (UARs), privileged access management, segregation of duties (SoD) in IAM, authentication and password controls.
  2. **Program Changes** — change management for application and infrastructure changes: ticketed change requests, peer code review, segregation between developer and production-deployer, emergency change procedures, change population completeness.
  3. **Computer Operations** — job scheduling, batch processing monitoring, backup and recovery, incident management, environmental controls in data centers (or attestation reliance for cloud).
  4. **Program Development** — SDLC controls for new applications and major upgrades: project initiation, requirements / design / testing / approval gates, data conversion controls, post-implementation review.

- **IT-Dependent Manual Controls (ITDMs)** — business-process controls that rely on system-generated reports, queries, or calculations. Auditors test these by re-performing the report extract and re-running the manual control on the verified data. ITDMs are why "report integrity" testing matters: if the underlying report's logic is wrong, the manual control built on top of it fails too.

### How ITGCs support process-level reliance

The standard mental model: process-level automated controls (e.g., a three-way match in the ERP) can be tested with a single sample if the supporting ITGCs are operating effectively across the period. If ITGCs fail, the auditor must drop reliance on the automated control and either test process-level transactions in much larger samples or qualify the ICFR opinion. This is why ITGC testing dominates the IT SOX workload — a single failed ITGC can cascade into massive additional testing on the business-process side.

## Deficiency evaluation

PCAOB AS 2201 defines three severity levels for control deficiencies (paraphrased — do not paste the AS 2201 text into client deliverables):

- **Control deficiency** — a control, when designed or operating, does not allow management or employees, in the normal course of performing their assigned functions, to prevent or detect misstatements on a timely basis.
- **Significant deficiency** — a deficiency, or combination of deficiencies, less severe than a material weakness, but important enough to merit attention by those charged with governance.
- **Material weakness** — a deficiency, or combination, such that there is a reasonable possibility that a material misstatement of the annual or interim financial statements will not be prevented or detected on a timely basis.

A **material weakness** is the headline outcome: management must disclose it in the 10-K, and the external auditor will issue an adverse §404(b) opinion on ICFR. This is the result every SOX program is structured to avoid. Significant deficiencies are reported to the audit committee but not publicly disclosed.

Severity is judged on **likelihood × magnitude**. Magnitude is calibrated against the materiality threshold set by the external auditor for the financial statements; likelihood is qualitative and considers the nature of the control, compensating controls, and history of failures.

## Materiality, scoping, and the "in-scope" decision

The external auditor sets a financial-statement materiality threshold during planning (commonly 5% of pre-tax income, with significant judgment). Management's ICFR scope must cover all material accounts and significant disclosures; from there, scope cascades to the business processes that feed those accounts and to the IT systems that support those processes.

A practical scoping cascade:

1. **Material accounts and disclosures** — driven by the auditor's materiality threshold.
2. **Significant business processes** — the cycles that initiate, authorize, process, or report transactions affecting material accounts.
3. **In-scope applications and supporting infrastructure** — the systems that record, calculate, or report financial data for those processes. "Supporting infrastructure" includes operating systems, databases, middleware, and identity providers underneath the application.
4. **In-scope vendor systems** — SaaS or hosted systems supporting in-scope processes. Reliance is typically established via the vendor's **SOC 1 Type II** report (see below).

A system supporting only operational decisions, with no financial-reporting impact, is generally **out of scope** for SOX even if it is critical to the business. A common scoping mistake is treating "important system" as a synonym for "in-scope system" — they are not the same for SOX.

## SOC 1 vs. SOC 2 — distinguishing them is a SOX-relevant skill

Both are AICPA service-organization-control reports, both produced by independent CPAs, both come in Type I (point-in-time) and Type II (period-of-coverage) flavors. The difference is **what they opine on**:

- **SOC 1** — opines on the service organization's controls over financial reporting **as relevant to the user entity's ICFR**. SOC 1 reports are the appropriate evidence of vendor ITGCs for SOX reliance. They include a description of the service organization's system, the controls in place, the auditor's tests of those controls, and **complementary user entity controls (CUECs)** — controls the user entity (you) must implement to make the vendor's controls effective on your end.
- **SOC 2** — opines on controls relevant to the **AICPA Trust Services Criteria** (Security plus optionally Availability, Confidentiality, Processing Integrity, Privacy). SOC 2 is a security and operational-control attestation; it is **not** designed for SOX ICFR reliance, even though it overlaps heavily with ITGC content.

**Practitioner consequence**: when your finance team asks you to "get the SOC 2" from a vendor whose system is in-scope for SOX, push back and ask for the SOC 1. If the vendor only has a SOC 2, the external auditor will likely not accept it for §404 reliance, and your team may have to perform direct vendor testing (questionnaires, sample-based control testing on your side) — which is much more work than reading and mapping a SOC 1.

A vendor's SOC 1 mapping work for SOX includes:

- Confirming the SOC 1 covers your contract's services and your fiscal period
- Reading the auditor's exceptions and assessing impact on your ICFR
- Documenting your CUECs and confirming you operate them
- Confirming the SOC 1 covers any subservice organizations (e.g., the SaaS vendor's underlying cloud provider) using the inclusive or carve-out method appropriately

## Interaction with other frameworks

A narrative summary — this plugin deliberately does **not** ship a hand-maintained crosswalk table. The SCF crosswalk is the authoritative source for control mappings; see `/grc-engineer:gap-assessment` and the [cross-framework analyzer](../../../../grc-engineer/scripts/cross-framework-analyzer.js) outputs.

- **COSO 2013 IC-IF** — the de facto control framework most U.S. public companies use to satisfy management's §404(a) assessment. SOX provides the legal mandate; COSO provides the substantive framework.
- **COBIT 5 / 2019** — IT-process control framework commonly used to map ITGC objectives. Many SOX programs cite COBIT control objectives as the basis for their ITGC testing program.
- **PCAOB AS 2201** — the external auditor's standard for testing ICFR. Drives auditor expectations on test design, sample sizes, evidence sufficiency, and reliance strategy. Practitioners should understand AS 2201's structure even though only auditors execute against it directly.
- **SOC 1 (SSAE 18 / AT-C 320)** — vendor reliance evidence for SOX (see above).
- **SOC 2 (TSC)** — security/operational attestation; informative but not sufficient evidence of vendor ITGCs for SOX. SOC 2 ITGC-overlap controls (logical access, change management) are conceptually similar but the audit objective is different.
- **NIST 800-53 / 800-171 / CSF** — security frameworks that overlap heavily with the IT-side of SOX ITGC content (access control, audit logging, change management) but are not SOX evidence on their own.
- **NYDFS 23 NYCRR 500, ISO 27001, PCI DSS** — sector or scope-specific security frameworks that often share underlying controls with SOX ITGCs; many engineering teams structure their ITGC testing program to also produce evidence for these adjacent frameworks.
- **HIPAA Security Rule** — separate jurisdiction (ePHI), but for healthcare-sector public companies the same change-management and logical-access tooling typically supports both HIPAA Technical Safeguards and SOX ITGCs.

## Common misinterpretations

This plugin should correct the following recurring misunderstandings whenever they appear in user prompts:

1. **"SOX is a cybersecurity regulation."** It is not. SOX is a financial-reporting accountability statute. Cybersecurity work happens under SOX only to the extent it supports ICFR over in-scope financial-reporting systems. A breach of a non-financial system (e.g., a marketing CRM) is a serious incident but is not, on its own, a SOX matter. (Cybersecurity disclosure obligations exist under separate SEC rules — most prominently the 2023 cybersecurity disclosure rules requiring an 8-K within 4 business days of determining a material cybersecurity incident — but those derive from §409's real-time disclosure mandate and SEC regulatory authority, not from SOX's ICFR provisions.)
2. **"§404(b) applies to every public company."** No — non-accelerated filers are exempt, and emerging growth companies have a 5-year exemption from IPO. Confirm filer status before you scope §404(b) work.
3. **"A SOC 2 satisfies SOX."** No. SOC 2 is a Trust Services Criteria attestation. The right vendor-reliance evidence for SOX is a SOC 1 Type II covering the period under audit and the services in your contract. SOC 2 may be useful supplementary evidence but does not satisfy the §404 reliance requirement on its own.
4. **"PCAOB AS 2201 is the management framework."** No. AS 2201 is the *auditor's* standard for the §404(b) integrated audit. *Management* uses COSO (or another suitable framework) for its §404(a) assessment. The two perspectives are coordinated but not identical.
5. **"Material weakness equals a breach."** No. Material weakness is a control-design or operating-effectiveness condition tied to the financial statements. A control deficiency can be a material weakness without any actual misstatement having occurred — the standard is "reasonable possibility" of material misstatement, not actual misstatement.
6. **"If the system isn't financial, it isn't in scope."** Mostly true, with two important exceptions: (a) shared identity providers (Okta, AD) are in-scope when they grant access to in-scope financial systems; (b) shared change-management or deployment platforms (Jira, GitHub, CI/CD) are in-scope when they govern changes to in-scope financial systems. The boundary follows the integration, not the application's primary purpose.
7. **"SOX evidence retention is 6 years (like HIPAA)."** No. PCAOB rules require auditor work-paper retention of **7 years**. §802 (18 U.S.C. § 1519) imposes criminal penalties for knowing destruction of documents in connection with a federal investigation, with no fixed retention period — practitioners default to 7+ years for SOX evidence.

## Assessment approach guidance

When asked to perform a SOX assessment or readiness check, walk this sequence:

### 1. Confirm SEC-registrant status and filer category

- Is the company a §12 registrant or §15(d) filer? If neither and not on an S-1 runway and not recently acquired by a public company, **SOX likely does not apply** — confirm and document.
- What is the filer category (large accelerated, accelerated, non-accelerated, EGC, SRC)? This determines §404(b) applicability and disclosure deadlines.
- Is the external audit firm engaged for §404(b) attestation, or only for the financial-statement audit?

### 2. Confirm the materiality threshold and account scope

- What materiality threshold has the external auditor set for the current fiscal year? (Don't proceed without this — it determines what's in scope.)
- Which financial-statement accounts and disclosures are above the materiality / qualitatively-significant threshold?

### 3. Walk the in-scope process inventory

- Order-to-cash, procure-to-pay, payroll, inventory, fixed assets, treasury, financial close, tax, equity — confirm which are in scope and at what locations.
- For each in-scope process, identify the supporting applications and the supporting infrastructure (OS, DB, identity provider, scheduler, deployment pipeline).

### 4. Build the in-scope IT system inventory

- For each in-scope application: where it runs (own data center, cloud, SaaS), who operates it, how it authenticates, how changes are managed, where its data lives.
- For SaaS / hosted vendors: do you have a current SOC 1 Type II covering your contract scope and your fiscal period? If not, plan for direct vendor testing or escalate.

### 5. Identify the four ITGC domains for each in-scope system

- **Access** — who provisions, who reviews, where MFA applies, what the SoD model looks like, how privileged access is controlled.
- **Change** — change ticketing tool, approval flow, deployment mechanism, emergency change exception process, completeness reconciliation between deployments and tickets.
- **Operations** — batch jobs, monitoring, backup schedule and tested-restore evidence, incident management, capacity / availability for financial close.
- **Development** — SDLC stage gates for new applications and major upgrades, data conversion controls.

### 6. Map entity-level controls

- Code of conduct, ethics hotline, audit-committee charter, board oversight, fraud risk assessment, whistleblower process, period-end close controls, financial reporting policies.

### 7. Identify IT-dependent manual controls

- Any process-level control that relies on a system-generated report or query — flag for report-integrity testing.

### 8. Aggregate deficiencies

- Run the deficiency severity assessment (deficiency / significant deficiency / material weakness) on all identified gaps. Apply both quantitative (magnitude vs. materiality) and qualitative (nature, history, compensating controls) factors.

### 9. Produce the readiness output

- Surface the highest-severity gaps first, especially anything pointing toward a potential material weakness.
- Frame remediation in terms of control design changes, evidence improvements, or scope adjustments.
- Note any §404(b)-driven items the external auditor will want to retest after remediation.

## Common pain points: the "I just inherited SOX" survival guide

If you have just been handed a SOX program — or your SaaS company has been told it is now in-scope because of an acquisition or an IPO runway — these are the failure modes to look for first. They are also the items external auditors push back on most often in early-program engagements.

### Year 1 inventory — what to find first

1. **In-scope financial applications**: ERP (NetSuite, SAP, Oracle, Workday), billing system, revenue subledger, equity management, treasury, payroll, expense management, tax provisioning. Add the supporting databases, OSes, identity provider(s), and CI/CD platforms. This list anchors everything else.
2. **The ICFR scoping memo (if it exists)**: confirms the auditor and management's shared understanding of in-scope accounts → processes → systems. If it does not exist, building one is the most valuable Year-1 deliverable.
3. **Existing user access reviews**: how often, who reviews, what evidence is captured, whether privileged accounts are reviewed separately. Privileged-access reviews are the single most common ITGC failure point in Year 1.
4. **Change management completeness**: can you reconcile the population of production deployments to the population of approved change tickets? If not, change-management completeness is at risk and likely the auditor's first finding.
5. **Vendor SOC 1 inventory**: which in-scope SaaS vendors have SOC 1 Type II reports covering your fiscal period? Where the vendor only provides SOC 2, plan for direct testing.

### Auditor pushback — the recurring early-engagement themes

- **IT user access reviews**: privileged access reviewed quarterly (or more often), reviewer is independent of the access being reviewed, evidence is signed and dated, removals from the review are tracked to closure. Expect detailed sampling.
- **Segregation of duties (SoD)**: a documented SoD matrix mapped to roles in each in-scope system, periodic SoD conflict scans, exceptions tracked and risk-accepted at an appropriate level. Auditors will test against the matrix and against actual production role assignments.
- **Change management completeness**: a reconciliation between the change-ticketing system and the deployment population for each in-scope system, run at a frequency that supports operating-effectiveness reliance. Emergency-change population is reviewed separately for after-the-fact approval evidence.
- **Vendor reliance / SOC 1**: SOC 1 Type II reports for in-scope vendors that cover the right scope and the right period; CUECs are documented and operated; subservice organizations are addressed with the right method (inclusive or carve-out).
- **Backup and restore**: tested restores (not just successful backups), with evidence of the test results, for in-scope databases.
- **Logging and monitoring**: privileged-action logging on in-scope databases and OSes, log retention sufficient for the audit period.

### Year 1 vs. steady state

- **Year 1**: scope is contested (auditor and management often disagree on system boundaries); walkthroughs are heavy because no documented narratives exist; ITGC remediation typically dominates Q3 and Q4.
- **Steady state**: scope is stable; walkthroughs are confirmation-only ("any changes since last year?"); testing is efficient because workpapers carry forward; the focus shifts to acquisitions, system migrations, and remediation of prior-year deficiencies.

## Capabilities

- SOX ICFR scoping (filer status, materiality cascade, in-scope account/process/system inventory)
- ITGC testing across the four classic domains (Access, Change, Operations, Development)
- Entity-level control evaluation (code of conduct, audit-committee charter, fraud risk assessment, period-end close)
- IT-dependent manual control identification and report-integrity testing
- §302 / §906 disclosure-controls certification readiness review
- §404(a) management assessment workflow guidance
- §404(b) external-auditor coordination guidance for accelerated filers
- §409 real-time disclosure (8-K) timeline awareness
- §802 / 18 U.S.C. § 1519 document-retention guidance
- Deficiency evaluation (deficiency / significant deficiency / material weakness) with magnitude × likelihood logic
- SOC 1 vs. SOC 2 vendor-reliance distinction and CUEC documentation
- COSO 2013 component coverage at the conceptual level (paraphrased — does not reproduce COSO IC-IF text)
- COBIT alignment guidance for ITGC objectives
- Pre-IPO (S-1 readiness) ICFR build
- Post-acquisition ICFR integration scoping
- Cloud-agnostic ITGC patterns with brief vendor-specific examples (e.g., AWS CloudTrail as Operations-domain logging evidence)
- SCF crosswalk routing (`usa-federal-law-sox-2002`) — `/grc-engineer:gap-assessment` integration

## Command routing

- `/us-sox:scope` — SEC-registrant determination, filer-status, materiality cascade, in-scope inventory
- `/us-sox:assess` — gap assessment via the SCF crosswalk for `usa-federal-law-sox-2002`
- `/us-sox:evidence-checklist` — ITGC + entity-level + IT-dependent manual evidence patterns

All three delegate to `/grc-engineer:gap-assessment` with SCF framework ID `usa-federal-law-sox-2002` for the control-by-control mechanics, and wrap the results in SOX-specific terminology (filer status, ITGC domains, deficiency severity, SOC 1 reliance).

## Levelling up to Full

A Full-depth follow-on PR could add framework-native workflow commands tied to the ICFR audit ritual. Strong candidates:

- `/us-sox:scope-itgc-population` — generate the in-scope IT system inventory from a list of in-scope applications, including supporting infrastructure layers
- `/us-sox:itgc-walkthrough` — produce ITGC walkthrough narratives for the four domains, ready for auditor review
- `/us-sox:soc1-reliance-map` — capture vendor SOC 1 Type II coverage, exceptions, CUECs, and subservice-organization treatment
- `/us-sox:deficiency-evaluation` — apply the magnitude × likelihood logic to a deficiency log and produce a draft severity classification (with the explicit caveat that final classification is a judgment call requiring the external auditor and management's input)
- `/us-sox:302-certification-pack` — assemble the disclosure-controls evidence the disclosure committee needs to support a §302 sign-off

Each of those is a "framework-native" workflow that does not fit any generic gap-assessment output and would justify Full depth.

## References

- [SOX statute text — 15 U.S.C. §§ 7201 et seq. (Cornell LII)](https://www.law.cornell.edu/uscode/text/15/chapter-98)
- [§302 statutory text — 15 U.S.C. § 7241](https://www.law.cornell.edu/uscode/text/15/7241)
- [§404 statutory text — 15 U.S.C. § 7262](https://www.law.cornell.edu/uscode/text/15/7262)
- [§906 criminal certification — 18 U.S.C. § 1350](https://www.law.cornell.edu/uscode/text/18/1350)
- [§802 document destruction — 18 U.S.C. § 1519](https://www.law.cornell.edu/uscode/text/18/1519)
- [SEC Spotlight on Sarbanes-Oxley](https://www.sec.gov/spotlight/sarbanes-oxley.htm)
- [SEC filer-status definitions (Securities Act / Exchange Act rules)](https://www.sec.gov/files/accelerated-filer-srs-faq.pdf)
- [PCAOB Auditing Standards index](https://pcaobus.org/oversight/standards/auditing-standards) — license required to read AS 2201 in full
- [COSO 2013 Internal Control — Integrated Framework](https://www.coso.org/internal-control) — license required for the framework text
- [AICPA SOC 1 / SOC 2 overview](https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc)
- [SCF API entry for `usa-federal-law-sox-2002`](https://grcengclub.github.io/scf-api/api/crosswalks/usa-federal-law-sox-2002.json)
