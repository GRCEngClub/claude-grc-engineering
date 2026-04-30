---
description: CCPA / CPRA evidence checklist organized by California Civil Code section
---

# CCPA / CPRA Evidence Checklist

Generates a comprehensive evidence request list for a CCPA / CPRA assessment, organized by the relevant California Civil Code section. Suitable for internal readiness, external counsel review, or response to a CPPA or California AG inquiry.

> **Never commit evidence artifacts to source control.** Evidence outputs include consumer PI, ticketing data, ad-tech configurations, and contracts that may contain confidential business or personal information. `.gitignore` covers `evidence/` by default; durable storage is your responsibility. Use an encrypted, access-controlled evidence locker.

## Usage

```bash
/us-ccpa:evidence-checklist [--section=<sec>] [--format=<fmt>] [--audience=<aud>]
```

## Arguments

- `--section`: Civil Code section grouping to include
  - `1798.100` — Notice at Collection and general business obligations
  - `1798.105` — Right to Delete
  - `1798.106` — Right to Correct (CPRA)
  - `1798.110` — Right to Know — categories
  - `1798.115` — Right to Know — sales/sharing/disclosures
  - `1798.120` — Right to Opt Out of Sale or Sharing
  - `1798.121` — Right to Limit Use of Sensitive Personal Information (CPRA)
  - `1798.125` — Non-Discrimination and Financial Incentives
  - `1798.130` — Notices, methods, response timelines, training, metrics
  - `1798.135` — Opt-out and Limit-Use links and Universal Opt-Out Mechanism (GPC)
  - `1798.140` — Definitions; vendor classification (Service Provider / Contractor / Third Party)
  - `1798.145` — Carve-outs and exceptions
  - `1798.150` — Private right of action (security-incident readiness)
  - `1798.185` — CPPA risk assessments and cybersecurity audits
  - Default: all sections
- `--format`: `table` (default), `markdown` (detailed list), `csv` (spreadsheet)
- `--audience`: `auditor` (external counsel / CPPA / AG, with citations), `internal` (simplified readiness check)

## Evidence checklist

### §1798.100 — Notice at Collection and general business obligations

| Evidence item | Citation | Common format | Notes / Gotchas |
|---|---|---|---|
| **Notice at Collection** for each data-collection surface (web, mobile, in-store, telephone, employment) | §1798.100(a); 11 CCR §7012 | Notice templates with version history | Must enumerate categories of PI collected, categories of SPI collected, purposes for each, sale/share status, retention period (or criteria), and link to Limit Use page if SPI processed beyond strictly necessary |
| **Data inventory** mapping PI and SPI categories → sources → purposes → recipients → retention → sale/share/limit-use status | §1798.100(b)–(d) | Spreadsheet, dataflow diagram, or CDP/IGA export | Foundational — every other obligation depends on it |
| **Retention schedule** with documented criteria for each category | §1798.100(a)(3) | Records-retention policy, system-by-system retention configurations | Indefinite retention is not a defensible criterion |
| **Reasonable security measures** appropriate to the nature of the PI | §1798.100(e) | Information-security program documentation, control mapping (e.g. NIST SP 800-53, ISO 27001) | "Reasonable" judged ex post by the regulator |
| **Documentation of personnel access** to consumer PI | §1798.100(e) | IAM exports, access-review records | Supports both reasonable-security obligation and breach-readiness |

### §1798.105 — Right to Delete

| Evidence item | Citation | Common format | Notes / Gotchas |
|---|---|---|---|
| **Deletion intake** workflow with at least two methods | §1798.130(a)(1) | DSAR portal screenshots, email alias inbox, ticketing exports | One method must be toll-free unless business operates exclusively online with a direct consumer relationship |
| **Verification procedures** matched to risk and PI sensitivity | 11 CCR §7060 et seq. | Verification policy, sample request transcripts | Reasonable-degree-of-certainty standard; document escalation for high-risk requests |
| **Deletion fulfillment evidence**: ticket logs with timestamps, downstream-system propagation records | §1798.105(c) | Ticket export, deletion-job logs from each system | Must direct Service Providers / Contractors to delete; must use commercially reasonable efforts to notify Third Parties to whom PI was sold or shared |
| **Documented deletion exceptions** with rationale per the nine §1798.105(d) categories | §1798.105(d) | Denial templates, reviewer sign-offs | Common exceptions: completing the transaction, security/integrity, debugging, free-speech rights, research, legal compliance |
| **Response timing**: acknowledgment within 10 business days; substantive response within 45 calendar days (extendable once by 45 days with notice) | 11 CCR §7021; §1798.130(a)(2) | Ticketing SLA dashboards, sample notice-of-extension communications | Track end-to-end metrics; missed timelines are individually citable violations |

### §1798.106 — Right to Correct (CPRA)

| Evidence item | Citation | Common format | Notes / Gotchas |
|---|---|---|---|
| **Correction intake** workflow | §1798.106(a) | DSAR portal screenshots | Same intake channels as deletion |
| **Documentation request procedure** for supporting evidence of inaccuracy | 11 CCR §7023 | Request templates, sample correspondence | May require consumer to provide documentation; cannot impose unreasonable burdens |
| **Correction fulfillment evidence** | §1798.106(c) | Ticket export, downstream-correction propagation logs | Must use commercially reasonable efforts to correct in all systems |
| **Denial documentation** with rationale | §1798.106(c) | Denial templates with citation to exception | Denials must be reasoned; consumer may file complaint with CPPA |

### §1798.110 — Right to Know (categories)

| Evidence item | Citation | Common format | Notes / Gotchas |
|---|---|---|---|
| **Categories disclosure**: PI categories collected, sources, business/commercial purposes, recipients | §1798.110(a) | Standardized response template | Must align with the data inventory |
| **12-month look-back, plus pre-2022 collected PI** unless impossible / disproportionate effort | §1798.130(a)(2)(B) | Response procedure documentation | CPRA extended look-back beyond 12 months for PI collected on/after Jan 1, 2022 |

### §1798.115 — Right to Know (sales / sharing / disclosures)

| Evidence item | Citation | Common format | Notes / Gotchas |
|---|---|---|---|
| **Categories of PI sold or shared** by category and recipient class | §1798.115(a)–(c) | Disclosure template | Includes "share" (cross-context behavioral advertising) added by CPRA |
| **Categories of PI disclosed for a business purpose** | §1798.115(a) | Disclosure template | Distinct from sale/share — covers Service Provider and Contractor disclosures |

### §1798.120 — Right to Opt Out of Sale or Sharing

| Evidence item | Citation | Common format | Notes / Gotchas |
|---|---|---|---|
| **Opt-out intake mechanism** | §1798.120(a); §1798.135 | Footer link, intake page | "Do Not Sell or Share My Personal Information" or single combined "Your Privacy Choices" with the standardized icon |
| **Downstream propagation evidence** to ad-tech, analytics, and partner recipients | §1798.120(a) | Tag-management configuration, CMP exports, partner opt-out API logs | Most common gap — opt-out honored at page level but ad-tech pixels still fire |
| **No-reverify-for-12-months evidence** | §1798.135(c)(4) | Reconsent flow logic, suppression list | Cannot solicit reconsent for at least 12 months after opt-out |

### §1798.121 — Right to Limit Use of SPI (CPRA)

| Evidence item | Citation | Common format | Notes / Gotchas |
|---|---|---|---|
| **SPI inventory** with purpose-of-use classification: strictly necessary vs. beyond | §1798.121(a) | Spreadsheet keyed to data inventory | If only strictly-necessary uses, Right to Limit does not apply; document the determination |
| **Limit Use intake mechanism** if any SPI is processed beyond strictly necessary | §1798.135(a)(2) | Footer link, intake page | "Limit the Use of My Sensitive Personal Information" link |
| **Limit Use fulfillment evidence**: SPI use restricted to the §1798.121(a) enumerated purposes (strictly necessary, security, fraud prevention, transient use, quality improvement) | §1798.121(a) | Configuration evidence, suppression rules | Includes downstream Service Provider obligations |

### §1798.125 — Non-Discrimination and Financial Incentives

| Evidence item | Citation | Common format | Notes / Gotchas |
|---|---|---|---|
| **Equal-service evidence**: opt-out consumers receive equivalent goods, services, prices, quality | §1798.125(a) | Pricing-engine logic, A/B-test exclusion configurations | Cannot degrade UX for opt-out consumers |
| **Notice of Financial Incentive** for any program conditioning price/quality on PI collection or sale/share, including loyalty programs | §1798.125(b) | Standalone notice document, opt-in confirmation records | Opt-in consent required; value-of-data calculation must be documented |
| **Bona-fide loyalty program documentation**: data-value calculation, terms, opt-in records | 11 CCR §7080 | Program documentation, opt-in evidence | Discount must be reasonably related to the value of the PI to the business |

### §1798.130 — Notices, methods, response timelines, training, metrics

| Evidence item | Citation | Common format | Notes / Gotchas |
|---|---|---|---|
| **Privacy Policy** updated within the last 12 months | §1798.130(a)(5); 11 CCR §7011 | Posted policy with version history | Must contain all enumerated disclosures; review and update at least annually |
| **At least two methods** to submit consumer requests | §1798.130(a)(1) | Web form + email + (toll-free if not exclusively online) | One method must be toll-free unless business operates exclusively online with direct consumer relationship |
| **Response-timing records** | §1798.130(a)(2); 11 CCR §7021 | Ticketing SLA dashboards | 10-business-day acknowledgment, 45-calendar-day substantive response (one 45-day extension permitted with notice) |
| **Training records** for personnel handling consumer requests | §1798.130(a)(6) | LMS exports, completion rosters, training content | All personnel handling requests or compliance must be trained |
| **Metrics** for businesses processing PI of ≥10,000,000 California consumers in a calendar year | 11 CCR §7102 | Annual metrics published in Privacy Policy | Number of requests received, complied with, denied; median and mean response time |

### §1798.135 — Opt-out / Limit-Use links and Universal Opt-Out Mechanism (GPC)

| Evidence item | Citation | Common format | Notes / Gotchas |
|---|---|---|---|
| **"Do Not Sell or Share My Personal Information" link** in website footer | §1798.135(a)(1) | Website screenshot, sitewide-template confirmation | Required if business sells or shares; must be clear and conspicuous on every page |
| **"Limit the Use of My Sensitive Personal Information" link** in website footer | §1798.135(a)(2) | Website screenshot | Required if SPI processed beyond strictly necessary |
| **Single combined "Your Privacy Choices" link** with standardized opt-out icon (alternative format) | 11 CCR §7015 | Website screenshot, icon implementation | Permitted alternative under regulation |
| **GPC handling evidence**: server-side or client-side recognition of `Sec-GPC: 1` header that propagates through ad-tech and analytics fanout | §1798.135(b); 11 CCR §7025 | Test transcripts, network captures, CMP configuration, opt-out propagation logs | Sephora settlement (Aug 2022) made clear this is enforced; treat as real-time |
| **Display of opt-out status when known** | 11 CCR §7025(c)(7) | UI screenshot showing "you have opted out" message | Must reflect GPC-derived opt-out, not just account-bound preference |

### §1798.140 — Definitions; Service Provider / Contractor / Third Party classification

| Evidence item | Citation | Common format | Notes / Gotchas |
|---|---|---|---|
| **Vendor inventory** classifying each recipient as Service Provider, Contractor, Third Party, or Other (e.g. carved-out by §1798.145) | §1798.140(ag), (j), (ai) | Spreadsheet keyed to vendor management system | Misclassification of a Third Party as a Service Provider is a common enforcement finding |
| **Service Provider / Contractor contracts** with all required §1798.140(ag)(1) / (j)(1) provisions | §1798.140(ag)(1), (j)(1) | Signed master agreements, DPAs, addenda | Must include: limited business purpose, no sale/share, no use beyond contract, no combining with other sources, subcontractor flow-down, monitoring rights, notification of inability to comply |
| **Third Party contracts** with §1798.115(d) certification re: notice and opt-out | §1798.115(d) | Contract terms, certification documentation | Recipient must certify it understands restrictions and will comply |
| **Subcontractor flow-down evidence** | 11 CCR §7053 | Subcontractor agreements with materially equivalent terms | Required for Service Providers and Contractors |
| **Vendor monitoring / audit evidence** | §1798.140(ag)(1)(F) | Periodic compliance attestations, audit reports, SOC 2 reports | Monitoring may be manual, automated scans, periodic assessments, audits, or technical/operational testing |

### §1798.145 — Carve-outs and exceptions

| Evidence item | Citation | Common format | Notes / Gotchas |
|---|---|---|---|
| **Documentation of which data carve-outs are claimed** (HIPAA, GLBA, FCRA, DPPA, clinical trials) | §§1798.145–1798.146 | Carve-out determination memo with data scope | Carve-outs are data-level, not entity-level; document residual in-scope PI |
| **Boundary documentation** showing how carved-out data is segregated from in-scope PI | §1798.146 | Data-flow diagram, system boundary documentation | Auditors will look for commingling that defeats the carve-out |

### §1798.150 — Private right of action (security-incident readiness)

| Evidence item | Citation | Common format | Notes / Gotchas |
|---|---|---|---|
| **Encryption-and-redaction posture** for the categories of PI subject to the private right of action | §1798.150(a) | Encryption inventory by data store, key-management documentation | Statutory damages of $100–$750 per consumer per incident apply only to non-encrypted, non-redacted PI |
| **Reasonable security procedures and practices** documentation | §1798.150(a) | Security program documentation, control catalog mapping | "Reasonable" judged against organizational size, complexity, and nature of activities |
| **Breach response plan** with notification procedures | Civil Code §1798.82 (separate California breach-notification statute) | IRP document, tabletop exercise records | Note: §1798.82 (not §1798.150) governs breach notification; both are relevant to private right of action exposure |
| **Tabletop / IR test results** with corrective actions tracked | Implicit in §1798.150(a) | Exercise reports, AAR documentation | Pattern of unaddressed findings can defeat reasonable-security defense |

### §1798.185 — CPPA risk assessments and cybersecurity audits

| Evidence item | Citation | Common format | Notes / Gotchas |
|---|---|---|---|
| **Risk assessment** for each processing activity that triggers the CPPA risk-assessment regulation (selling/sharing PI, processing SPI, ADMT for significant decisions, training generative AI/ML on PI, other high-risk processing) | §1798.185(a)(15)(B); 11 CCR §7150 et seq. | Risk-assessment report; abridged version submitted to CPPA per regulatory cadence | Must include purpose, categories of PI, processing operations, benefits, harms, safeguards, and a documented determination that benefits outweigh risks |
| **Annual independent cybersecurity audit** with appropriate scope and rigor | §1798.185(a)(15)(A); 11 CCR §7120 et seq. | Engagement letter, audit report, certification, abridged report submitted to CPPA | Auditor independence requirements apply; scope must cover the processing activities that triggered the obligation |
| **Auditor independence documentation** | 11 CCR §7122 | Engagement letter with independence representations, conflict-of-interest disclosures | Internal audit can perform if it meets independence standards; external audit is the safer default |
| **ADMT documentation** for any automated decision-making technology used for significant decisions or extensive profiling | §1798.185(a)(15)(C); 11 CCR §7200 et seq. | Pre-use notice, opt-out mechanism, access-right response, logic and outcome documentation | Active rulemaking area — confirm the operative regulatory text at assessment time |

## Evidence collection patterns

### Privacy Policy snapshot

```bash
# Capture current Privacy Policy with timestamp for version history
curl -sS https://example.com/privacy > evidence/ccpa/policies/privacy-policy-$(date +%Y%m%d).html
```

### Notice at Collection inventory

```bash
# Enumerate collection surfaces and their notices
# (manually maintained; output to spreadsheet keyed to data inventory)
```

### GPC honoring validation

```bash
# Cloud-agnostic test: send Sec-GPC header and confirm response treats it as opt-out
curl -sS -H 'Sec-GPC: 1' https://example.com/ -o /dev/null -D - | tee evidence/ccpa/gpc/headers-$(date +%Y%m%d).txt
# Confirm downstream ad-tech: load the page in a headless browser with GPC enabled
# and capture network requests to ad-tech and analytics destinations
```

### DSAR ticket export

```bash
# From your ticketing system (cloud-agnostic):
# Export the prior 12 months of consumer-rights tickets with timestamps,
# request type, verification method, disposition, and response time.
# Format: CSV with columns ticket_id, received_at, acknowledged_at,
# substantive_response_at, request_type, verified, disposition, denial_reason
```

### Vendor classification spreadsheet

| Vendor | Data shared | Classification | Contract reference | §1798.140(ag)/(j) provisions confirmed | Subcontractor flow-down |
|---|---|---|---|---|---|
| Example CDP | Hashed email, browsing events | Service Provider | MSA §12 + DPA Addendum A | Yes (all 9) | Yes |
| Example ad network | Hashed email, IP, page URL | Third Party (share) | IO + standard adtech terms | N/A — Third Party | N/A |

## Output formats

### For external counsel / CPPA / AG inquiry response

Provide an organized package with:

1. **Cover letter**: scope, point of contact, time period covered.
2. **Index**: table of contents keyed to Civil Code section.
3. **Executive summary**: applicability determination (from `/us-ccpa:scope`), high-level posture, identified gaps, remediation status.
4. **Evidence sections**: by Civil Code section, in the order above.
5. **Vendor inventory and contracts**: with §1798.140(ag)/(j) provision checklist per vendor.
6. **Risk assessments and cybersecurity audit**: separately tabbed.
7. **Attachments**: notices, policies, training materials, ticketing exports, screenshots.

### For internal readiness

Simplified checklist:

- [ ] Data inventory current and complete
- [ ] Privacy Policy reviewed and updated within last 12 months
- [ ] Notice at Collection deployed at every collection surface
- [ ] DSAR intake operational with at least two methods, verification procedures, and SLA tracking
- [ ] Right to Delete, Know, Correct, Opt Out, and Limit Use workflows implemented end-to-end
- [ ] Do Not Sell or Share / Limit Use links live in footer (or combined Your Privacy Choices link with icon)
- [ ] GPC signal honored end-to-end through ad-tech and analytics fanout
- [ ] All vendor contracts classified and reviewed against §1798.140(ag)/(j) provisions
- [ ] SPI inventory current; Right to Limit applicability determined
- [ ] Risk assessments performed for processing activities that trigger the CPPA regulation
- [ ] Annual cybersecurity audit scoped, scheduled, and (if triggered) completed
- [ ] Personnel training completed for staff handling consumer requests
- [ ] Public metrics published if processing PI of ≥10M California consumers
- [ ] Encryption / redaction posture documented for §1798.150 exposure reduction
- [ ] Breach-response plan tested

## Examples

```bash
# Generate full evidence checklist (all sections)
/us-ccpa:evidence-checklist

# Generate checklist limited to consumer-rights sections
/us-ccpa:evidence-checklist --section=1798.105
/us-ccpa:evidence-checklist --section=1798.120

# Generate vendor / Service Provider checklist
/us-ccpa:evidence-checklist --section=1798.140

# Export to CSV for spreadsheet import
/us-ccpa:evidence-checklist --format=csv

# Internal readiness checklist
/us-ccpa:evidence-checklist --audience=internal
```

## Related commands

- `/us-ccpa:scope` — determine applicability before collecting evidence.
- `/us-ccpa:assess` — run the gap assessment via SCF crosswalk.
- `/grc-engineer:gap-assessment usa-state-ca-ccpa-cpra-2026` — direct SCF crosswalk assessment.

---

**Statute**: California Civil Code §1798.100 et seq.
**Implementing regulations**: 11 California Code of Regulations §7000 et seq.
**Regulators**: California Privacy Protection Agency (CPPA); California Attorney General
**Region**: Americas
**Country**: United States
