---
description: India DPDPA evidence checklist — what to collect, where it lives, how to verify
---

# India DPDPA Evidence Checklist

Operational checklist of evidence patterns the Data Protection Board, an independent auditor (for SDFs), or an internal review will expect across the DPDPA obligation themes. Each theme lists **what** to collect, **where** it typically lives, and **what good looks like**.

Run `/ind-dpdpa:scope` first to know which themes apply to your entity.

## Usage

```
/ind-dpdpa:evidence-checklist [--theme=<theme>] [--role=<fiduciary|processor>] [--sdf]
```

Themes:

- `notice` — Section 5
- `consent` — Section 6
- `legitimate-uses` — Section 7
- `purpose-limitation` — derived from Sections 5, 6, 7, 8
- `accuracy` — Section 8(3)
- `security` — Section 8(5)
- `breach` — Section 8(6) + DPDP Rules 2025 R7
- `retention` — Section 8(7)
- `principal-rights` — Sections 11–14
- `children` — Section 9
- `sdf` — Section 10
- `cross-border` — Section 16
- `consent-manager` — Consent Manager integration
- `governance` — overarching programme evidence

Use `--sdf` to include SDF-specific intensification across all themes.

## 1. Notice (Section 5)

**Why**: Notice is the gateway. A defective notice undermines the consent that follows.

**Collect**:

- ☐ Versioned **notice templates** in English plus the languages used to engage the Principal (Eighth Schedule languages where applicable).
- ☐ **Change log** of notice versions with effective dates.
- ☐ **Sample as-served notices** — three samples per channel (web, app, in-store, vendor onboarding flow, etc.) showing the notice exactly as a Principal would see it.
- ☐ **Mapping** of each notice version to the specific processing purpose(s) it covers.
- ☐ **Accessibility evidence** — screen-reader compatibility, font-size controls, simplified-language version where applicable.
- ☐ For pre-Act consents, **first-after-Act notice** evidence (Section 5(2)).

**Where to find it**:

- Product CMS, in-app screen catalogue, vendor master with notice attachments, contact-centre script repository.
- Translation service or in-house language QA system.
- Accessibility audit report.

**What good looks like**:

- One notice per processing purpose, in the Principal's language at point of choice.
- Plain-language; no nested cross-references that defeat clarity.
- Each notice version has a unique identifier and an audit trail of approvals.
- Samples can be retrieved per-Principal on request: "Show me the notice this user saw on 14 March 2026."

## 2. Consent (Section 6)

**Why**: Consent must be free, specific, informed, unconditional, unambiguous, with clear affirmative action — and withdrawable at parity. Defects are common.

**Collect**:

- ☐ **Consent records** for every Principal × purpose, with timestamp, version of notice shown, mode of capture (clickwrap, in-app toggle, voice with recording, Consent Manager flow), IP / device hash where lawful.
- ☐ **Consent receipts** issued to the Principal where applicable (the Rules contemplate receipts in some flows).
- ☐ **Pre-ticked-box / dark-pattern audit** — UI inspection of every consent surface; certification that no pre-ticked, default-on, or coercive flows exist.
- ☐ **Granularity** — evidence that distinct purposes have distinct consent toggles, not bundled.
- ☐ **Withdrawal events** with timestamp and downstream action records (purpose ceased, Processor instructed, deletion job triggered).
- ☐ **Withdrawal-parity test** — same number of clicks / steps to withdraw as to grant.
- ☐ For onboarding flows, **screen recording or step-by-step screenshot trail** of the consent journey.

**Where to find it**:

- Consent management platform (CMP) database.
- Application audit logs.
- Consent Manager reconciliation reports (where integrated).
- UX team's product copy repository.

**What good looks like**:

- A single query returns the full consent timeline of any Principal: granted → modified → withdrawn → re-granted.
- Withdrawal events show downstream consequences within the SLA: cessation in primary system, Processor notification, deletion job ticket, sub-processor notification.
- No consent is "bundled" — the user can refuse one purpose and still consume the core service.
- The consent receipt format matches the Rules' content requirements.

## 3. Legitimate uses (Section 7)

**Why**: Section 7 is exhaustive. Misclassifying a processing activity here is a common audit finding.

**Collect**:

- ☐ **Per-activity determination memo** — for every processing activity that does not rely on consent, the specific Section 7 clause being relied on, with reasoning.
- ☐ **Boundary documentation** — what falls outside the Section 7 use; how drift is detected.
- ☐ **Periodic review** — evidence that legitimate-use determinations are reviewed (at least annually, on material change of processing).
- ☐ **For employment-related processing under 7(i)**: which employee data, what use, with what safeguard.
- ☐ **For medical-emergency / disaster-response**: incident logs showing the trigger event and the bounded processing.

**Where to find it**:

- Privacy programme document repository.
- HR system policy library (for employment-related processing).
- Incident logs (for emergency-related processing).

**What good looks like**:

- Every processing activity has a documented lawful basis: consent OR a named Section 7 clause.
- No "legitimate interest" framing imported from GDPR practice.
- Boundary policing is automated where feasible (e.g. the data store flagged as Section-7-only refuses non-7 reads).

## 4. Purpose limitation

**Why**: A specified purpose constrains downstream processing. Drift is the most common compliance erosion.

**Collect**:

- ☐ **Purpose register** — per system, the registered purposes; data fields used per purpose; retention per purpose.
- ☐ **Data flow diagrams** — origin, transformations, destinations, sub-processors, deletion.
- ☐ **Access reviews** — proof that operators only access data they need for a registered purpose.
- ☐ **Model / analytics governance** — for ML / AI uses, evidence that training data scope matches a registered purpose; no silent re-use of operational data for model training.
- ☐ **Cross-purpose-use risk register** — list of "almost-drift" cases that were caught and contained.

**Where to find it**:

- GRC platform / privacy register.
- Architecture documentation, data lineage tooling.
- IAM / entitlement-review reports.
- ML / data science governance records.

**What good looks like**:

- Adding a new processing purpose triggers a notice / consent review automatically.
- Cross-environment data movement (prod → analytics → ML) is gated by purpose review.
- Data-quality / model-training datasets carry purpose tags propagated from source.

## 5. Accuracy (Section 8(3))

**Collect**:

- ☐ **Correction-request log** with intake, response, outcome, SLA conformance.
- ☐ **Data quality controls** — validation at intake, periodic reconciliation, source-of-truth designation per data category.
- ☐ Where data is shared with another Fiduciary, evidence the shared copy is **accurate at point of share**.

**What good looks like**:

- Median correction-request closure within the prescribed SLA.
- Stale-data detection runs at material cadence; corrections propagate downstream.

## 6. Security safeguards (Section 8(5))

**Why**: Largest single penalty band — up to ₹250 crore. Auditors examine this in depth.

**Collect**:

- ☐ **Information Security Management System (ISMS) evidence** — ISO 27001:2022 Statement of Applicability, internal audit reports, management review minutes, ISMS scope.
- ☐ **Risk register** — assets, threats, controls, residual risk; reviewed periodically.
- ☐ **Encryption inventory** — data at rest, data in transit, key management. Algorithms and key lengths conform to current best practice.
- ☐ **Access control evidence** — RBAC / ABAC design, joiner-mover-leaver process, periodic access recertification, privileged-access management.
- ☐ **Logging and monitoring** — what is logged, retention period, integrity protection, SIEM alert library, response runbooks. Conform to CERT-In 180-day India-side log retention where applicable.
- ☐ **Vulnerability management** — scanning cadence, asset coverage, SLA per severity, evidence of closure.
- ☐ **Penetration test reports** — annual minimum; remediation closure evidence; follow-up retest.
- ☐ **Secure SDLC** — SAST / DAST / SCA in pipelines; threat-modelling for new features; security review gates.
- ☐ **Backup and recovery** — backup schedule, restoration tests, integrity protection, encryption.
- ☐ **Vendor security assessment** — for every Processor and material vendor.
- ☐ **Cloud configuration baseline** — CIS / cloud-provider best-practice conformance; drift detection.
- ☐ **Sectoral overlay**: where applicable, RBI Cyber Security Framework, SEBI CSCRF, IRDAI cyber guidelines artefacts.

**Where to find it**:

- ISMS document set; GRC platform; vulnerability scanner / pen-test vendor portals; SIEM; cloud security posture management (CSPM) tooling.
- For Connectors users: many of these are continuously verified by `aws-inspector`, `gcp-inspector`, `okta-inspector`, `github-inspector`. Run those and feed findings into `/ind-dpdpa:assess`.

**What good looks like**:

- The ISMS scope explicitly covers all processing activities subject to DPDPA.
- Pen-test findings have a closure SLA tied to severity; HIGH and CRITICAL closed within stated window.
- A drill in the past 12 months has tested the breach-response capability end-to-end.
- Cloud accounts have CSPM in place with drift-alerting; access review evidence per quarter.
- Sectoral overlay artefacts are mapped against the same baseline (not maintained as a separate compliance silo).

## 7. Breach notification (Section 8(6) + DPDP Rules 2025 R7)

**Why**: 72-hour clock to DPB **and** to each affected Principal. Penalty up to ₹50 crore for notification failure (separate from the up-to-₹250-crore security failure that may have caused the breach).

**Collect**:

- ☐ **Personal data breach playbook** that distinguishes a "personal data breach" from a "cyber incident" — they overlap but are not identical. Both clocks may run.
- ☐ **Parallel-clock matrix** — per regulator and per incident type, what notification is owed, by when, in what format. At minimum: DPDPA 72h, CERT-In 6h, RBI 6h (if banking), SEBI 6h (if SEBI-regulated), IRDAI per direction (if insurer), DoT/TRAI per Telecom Cyber Security Rules (if telecom).
- ☐ **Notification templates** to the DPB and to affected Principals — content compliant with Rules-prescribed fields (nature, scope, time, consequences, mitigation, contact).
- ☐ **Receipt/acknowledgement protocol** — proof of submission to DPB; proof of delivery to Principals (where reasonable best efforts demonstrated).
- ☐ **Tabletop exercise records** — at least one full-clock tabletop in the past 12 months that exercised the parallel-regulator coordination.
- ☐ **Severity classification matrix** — what counts as a notifiable breach; what doesn't (e.g. encrypted data with intact key custody — paraphrased criterion subject to current interpretation).
- ☐ **Forensic evidence preservation** — chain-of-custody plan; logs immutable for the retention window.
- ☐ **Communications register** — every breach (notifiable or not) recorded with the determination basis.
- ☐ **Post-breach review** — root cause, control failure, remediation, communication to leadership / Audit Committee.

**Where to find it**:

- Incident response repository (Confluence / Notion / equivalent).
- SIEM and forensics tooling.
- Tabletop exercise reports.

**What good looks like**:

- Average detection-to-classification time below the fastest applicable regulatory clock.
- Tabletop drills involve cross-functional teams: security, privacy, legal, comms, sectoral compliance, customer service.
- The notification template is pre-approved by legal and updated on Rules amendment.
- Drills report parallel notifications going out within their respective SLAs (CERT-In within 6h, etc.) — not just the DPDPA 72-hour notification.

## 8. Retention and erasure (Section 8(7))

**Collect**:

- ☐ **Retention schedule** by data category × purpose, with statutory minimums (PMLA 5y, RBI sectoral retention rules, tax records, etc.) called out explicitly.
- ☐ **Deletion job evidence** — periodic execution logs showing data deleted on schedule, with integrity (hash, count) check.
- ☐ **Withdrawal-triggered deletion** — for every consent withdrawal, the deletion ticket and its closure evidence.
- ☐ **Legal-hold register** — data preserved beyond default retention with the basis recorded.
- ☐ **Backup-retention coherence** — deletion propagates to backups within the documented backup-retention window; backups not kept indefinitely.
- ☐ **Sub-processor deletion** — evidence each Processor / sub-processor performed the deletion they were instructed to perform.

**What good looks like**:

- Retention schedule is current; reviewed when regulation or business model changes.
- Deletion jobs are automated, audited, and report failures.
- A request "delete my data" results in evidence of deletion across primary system, backups, sub-processors, log stores (subject to legal retention) within a stated SLA.

## 9. Data Principal rights (Sections 11 – 14)

**Collect**:

- ☐ **Rights-request intake** — channel diversity (web form, app, email, contact centre, postal); accessibility.
- ☐ **Verification process** — how the entity verifies the requester is the Principal (proportionate to risk; not over-collecting).
- ☐ **SLA conformance** — per request type, response within the Rules-prescribed window.
- ☐ **Refusal records** — when rights cannot be fulfilled (e.g. retention required by law), the basis is documented and communicated.
- ☐ **Sample responses** — at least one of each request type executed end-to-end, redacted of PII, available for audit.
- ☐ **Grievance redressal** — records of complaints, time-to-resolution, escalation to DPB cases.
- ☐ **Nomination handling** (Section 14) — process to register nominations, validate them on death/incapacity, and execute requests.

**What good looks like**:

- Rights requests are tracked centrally with status, owner, and SLA dashboard.
- Verification is proportionate — not requiring more identity proof than the original onboarding.
- Refusals are rare and well-justified; the Principal is informed of escalation routes (grievance officer → DPB).

## 10. Children's data (Section 9)

**Collect**:

- ☐ **Age-determination mechanism** — design document; conformance test evidence.
- ☐ **Verifiable parental consent flow** — for Principals identified as children, the verification artefact (KYC-bearing, payment-instrument verified, declaration with ID, Consent Manager flow).
- ☐ **Targeted-advertising suppression** — configuration evidence in ad-serving systems; periodic test evidence.
- ☐ **Behavioural-tracking suppression** — analytics / personalisation systems exclude child-flagged accounts; periodic test evidence.
- ☐ **Default-on protections** — where age is unverified, the more conservative posture applies.
- ☐ **Educational / health exemption** — where claimed under a Government notification, the gazette reference and operational scope.

**What good looks like**:

- A user identified as under-18 cannot be served behavioural-targeted ads, regardless of which ad partner is in the chain.
- Child-account flags propagate across system boundaries.
- The age-determination mechanism's false-negative rate is measured.

## 11. Significant Data Fiduciary (Section 10)

**Collect (in addition to all the above)**:

- ☐ **DPO appointment record** — name, India residency, governance/reporting line to Board, term, replacement plan.
- ☐ **DPO independence evidence** — no operational conflict; budget and staffing.
- ☐ **DPIA framework** — trigger criteria; methodology (typically harm × likelihood); template; sign-off authority.
- ☐ **DPIA register** — all DPIAs performed, with conclusions and residual risks.
- ☐ **Periodic independent audit** — auditor selection criteria; engagement letter; audit report; management response; remediation tracking.
- ☐ **Algorithmic / automated-decision risk register** where applicable — model inventory, risk classification, mitigation.
- ☐ **Board / Audit Committee minutes** showing oversight of privacy programme.
- ☐ **DPB filing register** — every notification, response, and order from / to the DPB.

**What good looks like**:

- DPO is empowered: budget, staffing, escalation rights.
- DPIA register has visible cadence; not just paper exercises.
- Independent auditor is rotated per organisation policy and is genuinely independent.

## 12. Cross-border transfers (Section 16)

**Collect**:

- ☐ **Transfer register** — every cross-border data flow with destination, data category, volume, recipient, basis.
- ☐ **Restricted-territory check artefact** — evidence the latest gazette notification was checked at posture-determination and at material change.
- ☐ **Sectoral-localisation conformance** — where applicable, evidence that payment-system data is stored in India per RBI; insurance data per IRDAI; telecom data per the relevant Rules.
- ☐ **Sub-processor flow-down** — every Processor's cross-border posture is contractually flowed down.

**What good looks like**:

- Transfer register maps cleanly onto the data inventory.
- Restricted-territory check is a recurring compliance task with an owner and a date.
- Sectoral localisation is enforced at the storage layer (cloud region selection), not just policy.

## 13. Consent Manager integration (where applicable)

**Collect**:

- ☐ **Integration design** — APIs, message formats, error handling.
- ☐ **Consent receipt format** — fields conform to Rules-prescribed content.
- ☐ **Reconciliation reports** — periodic comparison of Consent Manager records with Fiduciary's own consent log.
- ☐ **Withdrawal-event handling** — evidence of cascading actions on withdrawal events.

**What good looks like**:

- Consents and withdrawals stay in sync between Consent Manager and Fiduciary; discrepancies are alerted and closed within SLA.
- The Fiduciary maintains its own consent record; the Consent Manager is corroborative, not the only source of truth.

## 14. Governance overlay

**Collect**:

- ☐ **Privacy governance charter** — roles, accountability, approval authority, escalation routes.
- ☐ **Privacy programme metrics** — consent capture rate, withdrawal rate, rights-request SLA conformance, breach drill cadence, training completion.
- ☐ **Training records** — engineering, product, support, partner-handling staff trained on DPDPA basics.
- ☐ **Vendor / Processor inventory** — every Processor; contract has DPDPA clauses (security, deletion, breach cooperation, sub-processor flow-down).
- ☐ **Risk register** — privacy risks, owners, mitigations, review cadence.
- ☐ **Programme review cadence** — quarterly internal; annual leadership; external review for SDFs.

**What good looks like**:

- Privacy is part of design, not a bolt-on.
- The metrics are read at leadership cadence.
- Vendor inventory is current; new vendors cannot onboard without privacy review.

## Output

Produces a per-theme checklist with status (`Collected` / `Partial` / `Missing` / `Not applicable`), gaps prioritised by penalty exposure (security ₹250cr > children ₹200cr > SDF ₹150cr > breach-notification ₹50cr), and a remediation-effort estimate.

This output feeds into `/ind-dpdpa:assess` (gap-by-control) and `/grc-engineer:generate-implementation` (where automation is feasible).

## Disclaimer

Engineering and assessment guidance only. **Not legal advice.** Confirm artefact adequacy with qualified counsel before relying on this checklist for regulatory submission.
