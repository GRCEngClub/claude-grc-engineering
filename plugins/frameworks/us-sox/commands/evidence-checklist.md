---
description: SOX evidence checklist organized by ITGC domain, entity-level controls, IT-dependent manual controls, and §302/§404/§906 certification artifacts
---

# SOX Evidence Checklist

Generates the recurring evidence list a SOX program produces and an external auditor will request. Organized around the audience that actually consumes SOX evidence — the SOX PMO, internal audit, and the external auditor's IT and process teams — rather than around SCF families, because in practice SOX evidence is filed by **ITGC domain**, **entity-level control**, and **IT-dependent manual control / report-integrity** category.

> **Never commit evidence artifacts to source control.** Evidence files routinely contain user IDs, system identifiers, change tickets, ledger excerpts, and screenshots that are sensitive even when not classified as PII. Use an access-controlled, encrypted evidence locker; honor §802 (18 U.S.C. § 1519) by retaining at least 7 years.

## Usage

```
/us-sox:evidence-checklist [--scope=<scope>] [--family=<SCF_family_code>] [--audience=<aud>] [--format=<fmt>]
```

## Arguments

- `--scope`: filter by SOX evidence category
  - `itgc-access` — IT General Controls, Access to Programs and Data
  - `itgc-change` — IT General Controls, Program Changes
  - `itgc-operations` — IT General Controls, Computer Operations
  - `itgc-development` — IT General Controls, Program Development
  - `entity-level` — Entity-Level Controls (ELCs)
  - `itdm` — IT-Dependent Manual Controls and report-integrity
  - `certifications` — §302 / §404 / §906 certification packs
  - `vendor-soc1` — Vendor SOC 1 reliance evidence
  - Default: all categories
- `--family=<SCF_family_code>`: optional, restrict to a single SCF family (e.g. `IAC`, `CFG`, `BCD`) when running the SCF-backed half of the assessment.
- `--audience`: target audience
  - `external-auditor` — full evidence pack with citations to §302 / §404 / SOX section, sample sizes annotated
  - `internal` — readiness checklist for the SOX PMO / control owners
- `--format`: `table` (default Markdown), `markdown` (detailed list), `csv` (spreadsheet import)

## Mandatory SOX artifacts (the named documents)

Before per-control evidence, the program must be able to produce these top-level artifacts on demand:

| Artifact | Required by | Owner | Frequency |
|---|---|---|---|
| Management's Report on Internal Control over Financial Reporting (the §404(a) assessment in the 10-K) | 15 U.S.C. § 7262(a) | CEO / CFO / SOX PMO | Annually |
| §302 quarterly disclosure-controls certification (in 10-K and each 10-Q) | 15 U.S.C. § 7241 | CEO / CFO | Each periodic report |
| §906 criminal certification (in 10-K and each 10-Q) | 18 U.S.C. § 1350 | CEO / CFO | Each periodic report |
| External auditor's §404(b) attestation report | 15 U.S.C. § 7262(b); PCAOB AS 2201 | External audit firm | Annually (if accelerated filer) |
| ICFR scoping memo | Internal | SOX PMO / internal audit | Annually + on material change |
| Risk and Control Matrix (RCM / RACM) | Internal | SOX PMO | Annually + on material change |
| Walkthrough narratives (per process) | PCAOB AS 2201 expectation | Process owner / SOX PMO | Annually (refresh) |
| Test-of-design and test-of-operating-effectiveness workpapers | Internal + auditor expectation | Internal audit / SOX testers | Annual cycle (interim + rollforward) |
| Deficiency log with severity classification and remediation plans | Internal + audit-committee reporting | SOX PMO / internal audit | Continuous |
| Vendor SOC 1 Type II reports + CUEC inventory | PCAOB AS 2201 vendor-reliance expectation | SOX PMO / vendor manager | Annually per vendor |

## ITGC evidence by domain

The four classic ITGC domains are where security and platform engineers spend the bulk of their SOX time. For each in-scope IT system, evidence is expected across all four (when relevant to the system).

### Domain 1 — Access to Programs and Data

| Evidence Item | Common Format | Notes / Auditor Expectations |
|---|---|---|
| New-hire / role-change / terminations population for the period, reconciled to in-scope system access changes | HRIS extract + IAM provisioning log | Population completeness is the test — sample selections come from this list. |
| Joiner / mover / leaver tickets with documented manager approval | Ticketing system export (Jira / ServiceNow) | Tickets for in-scope systems should reference the access requested and the approver's role. |
| Periodic user access review (UAR) evidence — in-scope systems, all user populations | UAR campaign export with reviewer sign-offs and removals tracked to closure | Quarterly is common for privileged access; annual minimum for standard users. Reviewer must be independent of the access being reviewed. |
| Privileged access review evidence, separated from standard-user UAR | Dedicated privileged-account UAR | Most common ITGC failure point in Year 1. Auditors expect quarterly cadence and full closure tracking. |
| Segregation of duties (SoD) matrix mapped to in-scope system roles | SoD matrix document | Should be reviewed annually and exceptions risk-accepted at an appropriate management level. |
| SoD conflict scan results for the period | SoD tool output (e.g., from GRC platform) or manual analysis | Auditor will sample conflicts and trace to risk acceptance or remediation. |
| MFA enforcement evidence for in-scope systems | IdP configuration export, conditional access policy | Required for remote and privileged access in nearly all modern programs. |
| Authentication / password policy configuration | IdP policy document or screenshot | Length, complexity, lockout, history. |
| Privileged-action logging on in-scope databases / OSes | Sample log entries + retention configuration | Operations-domain logging often satisfies this too — confirm overlap. |
| Service account inventory and ownership | Service account register | Service accounts are a common audit finding when ownership is unclear. |
| Generic / shared account inventory and justification | Shared-account register with risk acceptance | Auditor expectation: zero shared accounts for in-scope financial systems where feasible. |

### Domain 2 — Program Changes

| Evidence Item | Common Format | Notes / Auditor Expectations |
|---|---|---|
| Change management policy and procedure | Policy document | Must define change types, approval flow, segregation between developer and deployer. |
| Standard change population for the period (reconciled to deployments) | Deployment log + ticket export | **Completeness is the test.** Auditors will reconcile the deployment count to the approved-ticket count; a gap is a red-flag finding. |
| Change tickets with documented peer review and approver evidence | Ticketing system extracts + linked PR / merge records | Approver must be independent of the developer. |
| Emergency change population, separately identified, with after-the-fact approval | Emergency-change ticket extract | Sampled separately; auditor pays particular attention to volume and to approval timeliness. |
| Code review evidence (peer review on PRs touching in-scope systems) | Git platform PR / MR records | GitHub / GitLab / Bitbucket export tied to the change ticket. |
| Production deployment evidence with deployer identity | CI/CD pipeline logs | Must show that deployer ≠ developer for in-scope systems (or that automated deployment with controlled pipeline serves as the SoD). |
| Configuration / parameter changes to in-scope systems, separately tracked | Application or infrastructure change log | Configuration changes are easy to miss in change populations — confirm coverage. |
| Database schema change evidence | DDL change tickets + DBA logs | Common gap when DBAs deploy outside the standard CI/CD pipeline. |

### Domain 3 — Computer Operations

| Evidence Item | Common Format | Notes / Auditor Expectations |
|---|---|---|
| Job scheduling and batch monitoring evidence for in-scope batches (financial close, billing runs, payroll runs) | Scheduler logs (Control-M, AutoSys, cron + monitoring), failure-handling tickets | Sampled across the period; expect testing of failure handling. |
| Backup schedule and configuration for in-scope databases | Backup tool configuration + run history | Backups alone are not evidence; **tested restores** are. |
| Tested-restore evidence for in-scope databases during the period | Restore test report | At least annual restore test expected; documented test results required. |
| Incident management tickets affecting in-scope systems during the period | ITSM incident export | Auditor will sample incidents to confirm root cause / remediation closure. |
| Capacity and availability monitoring for in-scope systems | Monitoring dashboard exports | Especially relevant during financial close windows. |
| Privileged-action logging and log retention configuration | Log aggregator configuration + retention policy | Log retention must cover the audit period plus the audit window itself. |
| Cloud-vendor attestation reliance (e.g., AWS / Azure / GCP SOC 1) for hosting infrastructure | Vendor SOC 1 Type II | If you host in-scope systems on a hyperscaler, the cloud provider's SOC 1 typically covers the data-center / physical-environment portion of operations. Pair with your CUECs. |
| Environmental controls (data-center, on-premises only) | Facility audit / vendor attestation | Mostly covered by hyperscaler SOC 1 for cloud-hosted systems. |

### Domain 4 — Program Development

| Evidence Item | Common Format | Notes / Auditor Expectations |
|---|---|---|
| SDLC policy and stage-gate definitions | Policy document | Must define gates: requirements, design, build, test, UAT, deploy, post-implementation review. |
| New-application / major-upgrade project artifacts for the period | Project documentation + sign-off records | Initiation, requirements, design, test plans, UAT sign-off, go-live approval. |
| Data conversion controls for system migrations | Conversion test plan + reconciliation evidence | Data migration is a high-risk SDLC event for SOX; auditor will dig in. |
| Post-implementation review evidence | PIR report | Often the missing artifact; common audit finding. |
| Segregation between development, QA, and production environments | Architecture diagram + access evidence | Demonstrates that developers cannot deploy directly to production. |

## Entity-Level Controls (ELCs)

| Evidence Item | Common Format | Notes / Auditor Expectations |
|---|---|---|
| Audit committee charter and meeting minutes | Charter + minutes from the period | Confirms independence and oversight responsibility per SOX §301. |
| Code of conduct and acknowledgment population | Code document + signed acknowledgment population | Should be acknowledged on hire and periodically thereafter. |
| Whistleblower / ethics hotline records | Hotline report summary | Demonstrates §301 anonymous-reporting mechanism is operational. |
| Fraud risk assessment | Annual FRA document | Owned by SOX PMO or internal audit; refreshed annually. |
| Period-end financial-reporting controls — close calendar, journal-entry review, account reconciliations | Close package, JE review log, recon binder | Often the most heavily-sampled ELC area. |
| Manual journal entry approvals | JE approval log with reviewer signatures | Auditor will sample large or unusual JEs. |
| Disclosure committee charter and meeting minutes | Charter + minutes | Supports CEO / CFO basis for §302 / §906 certifications. |
| Tone-at-the-top communications | Internal communications, training records | Demonstrates control environment per COSO. |

## IT-Dependent Manual Controls (ITDMs)

For each ITDM, the evidence pack includes both the manual-control evidence **and** the report-integrity evidence.

| Evidence Item | Common Format | Notes / Auditor Expectations |
|---|---|---|
| Source-system query / report logic documentation | Query SQL or report-builder definition | The report's logic must be locked down and change-controlled. |
| Report-integrity test — re-perform the query at the audit date and reconcile to a known good source | Reconciliation workpaper | Auditor commonly re-performs this independently. |
| Manual control evidence — reviewer's mark-ups, sign-off, and exception handling | Marked-up report + email or ticket trail | Reviewer independence and timeliness matter. |
| Population of report-driven controls in scope | ITDM register | Often missing in Year 1; build it early. |

## §302 / §404 / §906 certification packs

| Evidence Item | Common Format | Notes / Auditor Expectations |
|---|---|---|
| Disclosure committee meeting pack (per §302 quarterly cycle) | Disclosure committee deck + minutes | Documents the basis for CEO / CFO §302 certification. |
| Sub-certification population from material-process owners and material-subsidiary controllers | Sub-cert tracking spreadsheet + signed sub-certs | Many large companies cascade §302 sign-off down to process / entity owners. |
| §404(a) management assessment narrative | Section of the 10-K Management's Report | Asserts effectiveness of ICFR as of fiscal year-end. |
| External auditor's §404(b) attestation report (accelerated filers) | Auditor's report in the 10-K | Adverse opinion = material weakness publicly disclosed. |
| §906 criminal certification (CEO / CFO signatures) | Exhibit to the 10-K / 10-Q | 18 U.S.C. § 1350 — criminal exposure for knowing or willful false certification. |
| Material-event tracking for §409 / 8-K within 4 business days | 8-K filing log | Real-time material disclosure obligation. |

## Vendor SOC 1 reliance

| Evidence Item | Common Format | Notes / Auditor Expectations |
|---|---|---|
| Vendor SOC 1 Type II report covering the audit period | Vendor SOC 1 PDF | Must cover services in your contract and the period under audit. |
| Mapping of SOC 1 controls to your in-scope process | SOC 1 reliance matrix | Document which of the vendor's controls you are relying on. |
| Complementary user entity controls (CUECs) inventory and operation evidence | CUEC checklist + evidence per CUEC | Auditor will test that you actually operate the CUECs. |
| Subservice organization treatment (inclusive vs. carve-out) | Documented in the SOC 1 reliance matrix | If carved out, you may need separate evidence for the subservice provider. |
| SOC 1 exception review and impact analysis | Exception log with accept / reject / mitigate decisions | Each exception in the vendor's SOC 1 must be assessed for impact on your ICFR. |
| Bridge letter for the gap between SOC 1 period-end and your fiscal year-end | Vendor-issued bridge letter | Common when the vendor's SOC 1 period closes before your fiscal year-end. |

## Cloud-agnostic technical evidence patterns (optional examples)

These are vendor-neutral examples of how engineering teams typically produce ITGC evidence. They are illustrative — none of them is required by SOX.

- **Identity provider (IdP) export** of in-scope app group memberships at period start and period end, used for both UAR evidence and JML reconciliation.
- **Audit log archive** for in-scope databases and OSes, retained for the audit period plus the audit window.
- **CI/CD pipeline run history** for in-scope systems, used for change-completeness reconciliation.
- **Backup tool run history** plus a periodic restore test report, used for Operations-domain testing.

Brief vendor-specific example: AWS CloudTrail (or the equivalent on other clouds) can serve as evidence of privileged-account activity for §404(a) ITGC testing in the Operations and Access domains, provided retention is set to cover the audit period and the trail integrity validation is enabled. This is an example, not a requirement — non-cloud or multi-cloud environments use different log sources.

## Output by audience

### External auditor (full pack)

Provide an evidence package organized by:

1. **Cover memo** — engagement scope, period, in-scope inventory, point of contact
2. **Mandatory SOX artifacts** — RCM, walkthroughs, scoping memo, deficiency log
3. **Entity-level controls** — full ELC test pack
4. **ITGC evidence** — by system × by domain (Access, Change, Operations, Development), with sample selections noted
5. **IT-dependent manual controls** — for each ITDM, the manual-control evidence plus the report-integrity workpaper
6. **Vendor SOC 1 reliance** — SOC 1 reports + CUEC evidence + bridge letters + exception analyses
7. **Certification artifacts** — disclosure-committee packs, sub-certifications, draft §302 / §404(a) / §906 statements

### Internal readiness

Simplified checklist for the SOX PMO and control owners:

- [ ] In-scope system inventory current
- [ ] RCM updated for the period
- [ ] All walkthroughs refreshed
- [ ] User access reviews completed for the period
- [ ] Privileged access reviews completed for the period
- [ ] SoD scan run and exceptions risk-accepted
- [ ] Change-completeness reconciliation run for each in-scope system
- [ ] Emergency change population reviewed
- [ ] Backup restore test completed during the period
- [ ] Privileged-action logging active and retained for the audit period
- [ ] SOC 1 Type II reports collected for all in-scope vendors, CUECs operating, bridge letters obtained where needed
- [ ] Period-end close ELC evidence assembled
- [ ] Disclosure committee packs current for each quarter
- [ ] Deficiency log up to date with remediation status

## Evidence retention

- **PCAOB rule**: auditor work papers must be retained **7 years**.
- **§802 (18 U.S.C. § 1519)**: criminal penalty up to **20 years** for knowing destruction of documents with intent to obstruct a federal investigation.
- **Practical default**: retain SOX evidence (testing workpapers, screenshots, walkthroughs, deficiency logs, vendor SOC 1s) for at least **7 years** in an access-controlled, encrypted store with documented chain-of-custody if subject to litigation hold.

## SCF crosswalk

This evidence checklist supplements (rather than replaces) the SCF-driven evidence list produced by `/grc-engineer:gap-assessment usa-federal-law-sox-2002`. The crosswalk maps **4 SCF controls → 17 SOX-relevant controls** — small because SOX itself does not enumerate technical control objectives. Use the SCF gap assessment for the control-by-control mechanics; use this checklist for the artifacts and evidence the SOX cycle actually produces.

---

**Statute**: Public Law 107-204; 15 U.S.C. §§ 7201 et seq.
**Regulators**: SEC, PCAOB, DOJ
**Evidence retention**: 7 years (PCAOB rule); §802 (18 U.S.C. § 1519) imposes criminal exposure for knowing destruction
**Related commands**: `/us-sox:scope`, `/us-sox:assess`, `/grc-engineer:gap-assessment`
