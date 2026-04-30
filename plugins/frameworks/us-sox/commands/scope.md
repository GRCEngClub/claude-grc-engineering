---
description: Determine SOX applicability — SEC-registrant status, filer category, §404(b) exposure, ICFR scope cascade, and in-scope IT inventory
---

# SOX Scope

Determines whether and how **the Sarbanes-Oxley Act of 2002 (Public Law 107-204; 15 U.S.C. §§ 7201 et seq.)** applies to the organization, and — if it does — produces the inputs needed to scope an Internal Controls over Financial Reporting (ICFR) program.

SOX is a financial-reporting law, not a security control catalog. The scope determination is a sequence of registrant-status, filer-status, materiality, and process / system-inventory questions. This command should ask only the questions that actually matter and produce a defensible scope verdict — not walk the user through the whole statute.

## Usage

```
/us-sox:scope
```

## What this produces

- **Applicability verdict**: In-scope / out-of-scope / pre-scope (S-1 runway or post-acquisition integration)
- **Filer category**: large accelerated, accelerated, non-accelerated, EGC, SRC — drives §404(b) attestation requirement and 10-K filing deadline
- **§404(b) exposure**: yes / no, with the rule basis (filer status, EGC 5-year exemption, etc.)
- **Materiality cascade input**: confirmation that the external auditor has set a financial-statement materiality threshold for the period, since this drives account / process / system scope
- **In-scope account / process / system inventory** (initial draft): material accounts → significant business processes → in-scope applications → supporting infrastructure → vendor (SOC 1) reliance map
- **Carve-outs and exemptions**: foreign private issuer accommodations, EGC exemption from §404(b), non-accelerated filer exemption from §404(b)
- **Next steps**: whether to proceed with `/us-sox:evidence-checklist` (collection planning) or `/us-sox:assess` (gap assessment)

## Decision tree

Walk these questions in order. Stop and document the verdict at the first decision that resolves applicability.

### 1. SEC-registrant status

Ask the user:

- Are the company's securities registered under §12 of the Securities Exchange Act of 1934 (i.e., listed on a U.S. national securities exchange such as NYSE or Nasdaq)?
- Is the company required to file periodic reports (10-K / 10-Q / 8-K) under §15(d) of the Exchange Act (e.g., publicly registered debt)?
- Is the company a foreign private issuer (FPI) with U.S.-listed securities? (FPIs are generally subject to SOX with limited home-country accommodations and 20-F annual filings.)
- Is the company on an active S-1 (IPO) runway, with an underwriter and an external audit firm engaged for ICFR readiness?
- Has the company recently been acquired by a public company that will need to integrate it into its §404(a) assessment?

**Verdict logic**:

- Yes to §12 / §15(d) / FPI → **in scope**, proceed.
- S-1 runway → **pre-scope (IPO readiness)**: ICFR build typically begins 12–24 months pre-IPO. Proceed as if in-scope and note the runway timeline.
- Recent acquisition by a public company → **pre-scope (integration window)**: typical one-year integration before full §404(a) inclusion. Confirm the parent company's expected inclusion date.
- None of the above → **out of scope**. Document the verdict and stop.

### 2. Filer category (drives §404(b))

If in-scope, determine the filer category. The current SEC definitions (paraphrased):

- **Large accelerated filer**: public float ≥ $700M. §404(b) external-auditor attestation **required**. 10-K due 60 days after fiscal year-end.
- **Accelerated filer**: public float ≥ $75M and < $700M. §404(b) **required** (subject to the 2020 SEC narrowing for certain low-revenue filers). 10-K due 75 days after fiscal year-end.
- **Non-accelerated filer**: public float < $75M. §404(b) **not required** (per Dodd-Frank-driven amendments). §404(a) management assessment **is** required. 10-K due 90 days after fiscal year-end.
- **Emerging Growth Company (EGC)** — JOBS Act category. §404(b) exempt for up to **5 years** from IPO or until disqualifying threshold breach (revenue, debt issuance, large-accelerated status). §404(a) still required.
- **Smaller Reporting Company (SRC)** — orthogonal to §404(b); affects scaled disclosure obligations. Confirm separately.

**Practitioner note**: confirm filer status with the controller and the external audit engagement letter. Year 1 of accelerated-filer status is a step-change in SOX program effort.

### 3. Materiality and in-scope account inventory

If §404(a) applies, the next gate is the auditor's financial-statement materiality threshold for the current fiscal year. Without that threshold, scope cannot be set defensibly.

Ask:

- Has the external auditor set a financial-statement materiality threshold for the period? (Common rule of thumb: 5% of pre-tax income, with significant judgment.)
- What financial-statement accounts and disclosures sit above the materiality / qualitatively-significant threshold?

If the materiality threshold has not been set, surface this as the **first scope blocker** — everything downstream depends on it.

### 4. Significant business processes

For each in-scope account, identify the business process(es) that initiate, authorize, process, or report transactions affecting that account. Common cycles:

- Order-to-cash (revenue recognition)
- Procure-to-pay (expense recognition, AP)
- Payroll
- Inventory
- Fixed assets
- Treasury (cash, debt, hedging)
- Tax (provision and compliance)
- Equity (stock-based comp, share issuances)
- Financial close and consolidation

Ask which cycles are in scope and at which legal entities / locations. Multinational consolidation often pulls in non-U.S. subsidiaries that feed material accounts.

### 5. In-scope IT system inventory

For each in-scope process, capture:

- **Application**: ERP (NetSuite / SAP / Oracle / Workday), billing, revenue subledger, equity management, treasury system, payroll, expense management, tax provisioning, financial consolidation tool.
- **Supporting infrastructure**: operating system, database, middleware, identity provider, scheduler, deployment / CI-CD platform underneath the application. ITGC scope follows the integration — a shared identity provider granting access to in-scope apps is itself in-scope.
- **Hosting model**: on-premises, IaaS, PaaS, SaaS. SaaS systems pull in vendor-reliance considerations (see step 6).

### 6. Vendor SOC 1 reliance

For each in-scope SaaS or hosted vendor:

- Does the vendor produce a **SOC 1 Type II** report? (Not SOC 2 — see SKILL on the distinction.)
- Does the report cover the services in your contract and the period under audit?
- Are there exceptions in the SOC 1 report? (Read them.)
- What are the **complementary user entity controls (CUECs)**, and do you operate them?
- Are subservice organizations (the SaaS vendor's own underlying providers) addressed via the inclusive or carve-out method?

If a vendor only has a SOC 2 (or no service-organization report at all), flag direct vendor testing as a likely Year-1 effort.

### 7. Entity-level controls

Confirm presence and ownership of the standard entity-level controls:

- Audit-committee charter, composition (independence), and meeting cadence
- Code of conduct and ethics hotline / whistleblower process
- Fraud risk assessment (typically annual, owned by internal audit or the SOX PMO)
- Period-end financial-reporting controls (close calendar, journal-entry review, account reconciliations, manual journal approvals)
- Disclosure committee charter and meeting cadence (supports §302 / §906 sign-off)

### 8. IT-dependent manual controls

For each in-scope process, ask whether any control depends on a system-generated report, query, or calculation. These are **IT-dependent manual controls (ITDMs)** and require report-integrity testing in addition to manual control testing. Common examples:

- AP three-way-match exception report reviewed by the controller
- Revenue cutoff report compared to invoice population at period-end
- Aged-AR review based on a query against the receivables ledger

### 9. Carve-outs to confirm

- **Foreign private issuer**: SOX applies but with home-country governance accommodations (e.g., 20-F filings rather than 10-K, audit-committee composition rules adapted to home-country law). Confirm with counsel.
- **Non-accelerated filer**: §404(b) attestation not required; §404(a) management assessment still required. Disclosure-controls (§302) and financial-statement audit still required.
- **EGC**: §404(b) attestation exempt for 5 years from IPO or until disqualified. §404(a), §302, §906 still required.
- **Recent acquisitions**: a target acquired during the fiscal year is generally allowed up to one year to integrate before being included in the §404 assessment. Confirm the parent's expected inclusion date.

## Output template

Structure the output as:

```
SOX SCOPE VERDICT
=================

Applicability:        [In scope / Pre-scope (S-1) / Pre-scope (acquisition) / Out of scope]
Registrant basis:     [§12 / §15(d) / FPI / S-1 runway / acquired by public co. / N/A]
Filer category:       [Large accelerated / Accelerated / Non-accelerated / EGC / SRC]
§404(a) (mgmt):       [Required / Not required] — [basis]
§404(b) (auditor):    [Required / Not required / EGC-exempt until <date>] — [basis]
10-K filing deadline: [60/75/90 days post fiscal year-end]
Materiality:          [Threshold set / Not yet set — BLOCKER]

In-scope cycles:
  - [list]

In-scope applications + supporting infrastructure:
  - [app] @ [hosting] — supporting [identity provider / DB / OS / scheduler / CI-CD]

Vendor SOC 1 reliance:
  - [vendor] — SOC 1 Type II [coverage period] / SOC 2 only / none
    CUECs documented: [yes/no/n/a]

Entity-level controls present:
  - [list]

IT-dependent manual controls flagged:
  - [process / control / report dependency]

Carve-outs claimed:
  - [list]

Open scope blockers:
  - [list]

Next steps:
  → /us-sox:evidence-checklist [--family=<SCF_family>] for collection planning
  → /us-sox:assess for gap assessment via the SCF crosswalk (usa-federal-law-sox-2002)
```

## Notes for the practitioner

- **Don't conflate "important system" with "in-scope system."** Many critical operational systems are not SOX in-scope. The boundary follows financial-reporting impact.
- **Filer status changes.** A company can move between accelerated and non-accelerated as public float crosses thresholds, which can materially change SOX program effort year-over-year.
- **Acquisitions reshape scope mid-year.** A material acquisition will pull in the target's accounts (and ultimately its IT systems) under the parent's §404(a) assessment, typically with a one-year integration runway.
- **Cybersecurity-only events are not SOX events.** A breach of a non-financial system is a serious incident — and may be reportable under SEC cybersecurity disclosure rules separate from SOX — but is not, on its own, a SOX matter.

---

**Statute**: Public Law 107-204; 15 U.S.C. §§ 7201 et seq.
**Regulators**: SEC (disclosure), PCAOB (auditor oversight), DOJ (criminal enforcement of §802 / §906)
**Depth**: Reference (tier 2 of 3)
**Related commands**: `/us-sox:assess`, `/us-sox:evidence-checklist`, `/grc-engineer:gap-assessment`
