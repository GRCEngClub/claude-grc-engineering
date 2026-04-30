---
name: us-ccpa-expert
description: California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA) expert. Deep knowledge of California Civil Code §1798.100 et seq., CPRA-amended applicability thresholds, the seven consumer rights, Sensitive Personal Information handling, Service Provider / Contractor / Third Party distinctions, the Universal Opt-Out Mechanism (Global Privacy Control), CPPA risk assessments and cybersecurity audits, and dual enforcement by the California Privacy Protection Agency and the California Attorney General.
allowed-tools: Read, Glob, Grep, Write
---

# California Consumer Privacy Act / California Privacy Rights Act Expert

Reference-depth expertise for the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA). This skill paraphrases the statute and cites California Civil Code section by section — never reproduce verbatim statute text.

## Framework identity

- **SCF framework ID**: `usa-state-ca-ccpa-cpra-2026`
- **Region**: Americas
- **Country**: United States
- **Statute**: California Civil Code §1798.100 et seq.
- **Implementing regulations**: 11 California Code of Regulations §7000 et seq.
- **Regulators**: California Privacy Protection Agency (CPPA) and the California Attorney General — both have civil-enforcement authority.

## Framework in plain language

CCPA gives California residents ("consumers" in the statute, which includes households for some rights) the right to know what personal information a business collects about them, the right to delete and correct it, the right to opt out of its sale or sharing, and the right to limit a business's use of certain sensitive categories. CPRA — passed by California voters as Proposition 24 in November 2020 and operative January 1, 2023 with enforcement beginning July 1, 2023 — amended the original 2018 CCPA (effective 2020) by adding the right to correct, the right to limit use of Sensitive Personal Information, the new "share" concept covering cross-context behavioral advertising, the standalone CPPA agency, and a mandatory recognition of Universal Opt-Out Mechanisms such as the Global Privacy Control. CPRA also raised one of the applicability thresholds, removed the AG's prior 30-day mandatory cure period, and authorized CPPA rulemaking on risk assessments and cybersecurity audits for processing that presents significant risk.

## Key dates and history

- **June 2018**: California Legislature enacts AB 375 (CCPA), Civil Code §§1798.100–1798.199.
- **January 1, 2020**: CCPA operative.
- **July 1, 2020**: Attorney General begins enforcement under original CCPA.
- **November 3, 2020**: Voters pass Proposition 24 (CPRA).
- **January 1, 2023**: CPRA amendments operative; B2B and HR partial exemptions sunset; CPPA rulemaking authority active.
- **July 1, 2023**: CPPA enforcement begins (the CPPA, distinct from the AG, takes over its share of administrative enforcement).
- **2024–2026**: CPPA finalizes regulations on automated decision-making technology (ADMT), risk assessments, cybersecurity audits, and Universal Opt-Out Mechanisms — practitioners should track CPPA Board meeting agendas for current rulemaking status.

## Territorial scope and applicability

CCPA/CPRA applies to a **for-profit business** that:

1. **Does business in California**, AND
2. **Collects (or has collected on its behalf) personal information about California residents**, AND **alone or jointly determines the purposes and means** of processing that information, AND
3. Meets **at least one** of the following three thresholds — see California Civil Code §1798.140(d) for the current text:

   - **Revenue threshold**: had annual gross revenues in excess of **US $25 million** in the preceding calendar year (the dollar figure was $25M from inception and is subject to periodic CPPA inflation adjustment — confirm current value at assessment time).
   - **Volume threshold**: alone or in combination, annually **buys, sells, or shares** the personal information of **100,000 or more** California consumers or households. *(CCPA's original threshold was 50,000 consumers/households/devices and used "buys, receives, sells, or shares for commercial purposes." CPRA raised the count to 100,000, removed "receives," removed "devices," and added "shares" — narrowing what triggers the threshold but extending coverage to behavioral-advertising recipients.)*
   - **Revenue-derivation threshold**: derives **50 percent or more** of annual revenue from **selling or sharing** consumers' personal information. *(CPRA added "sharing" — relevant for adtech businesses that exchange data without monetary consideration.)*

Two additional categories of entity are also covered:

- Any **entity that controls or is controlled by** a covered business and shares common branding (the parent/affiliate hook).
- A **joint venture or partnership** in which each business has at least a 40 percent interest, with the joint venture itself treated as a separate business for compliance.

### Coverage carve-outs

Several categories of data — not entire entities — are carved out so that the Civil Code does not apply to them:

- **Protected Health Information** governed by HIPAA / California Confidentiality of Medical Information Act, and other patient information collected by a covered entity or business associate to the extent it is treated under those laws.
- **Personal information collected, processed, sold, or disclosed pursuant to the GLBA** (financial institutions) or California Financial Information Privacy Act.
- **Personal information collected, processed, sold, or disclosed under the Driver's Privacy Protection Act**.
- **Personal information processed pursuant to the Fair Credit Reporting Act** when used for FCRA-permissible purposes.
- **Clinical-trial information** governed by federal common-rule requirements.

Important: these are **data-level carve-outs**, not entity-level exemptions. A bank that holds GLBA-covered customer financial data is still subject to CCPA/CPRA for its non-GLBA personal information (employee marketing, cookie-collected web traffic, etc.).

The **B2B exemption** (personal information collected from a person in a business-to-business communications context) and the **HR exemption** (personal information of employees, applicants, contractors, owners, directors, officers) **expired on January 1, 2023**. From that date forward, employee and B2B contact data are fully in scope, including the right to know, delete, correct, opt out of sale/share, and limit use of SPI.

## Definitions worth getting right

- **Consumer** — a natural person who is a California resident (Civil Code §1798.140(i)). Includes employees, applicants, B2B contacts, and customers; the post-2023 sunset of the partial exemptions made this matter much more.
- **Personal information** (§1798.140(v)) — information that identifies, relates to, describes, is reasonably capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular consumer or household. Includes inferred profiles. Does **not** include deidentified or aggregate consumer information, or publicly available information from government records.
- **Sensitive Personal Information (SPI)** (§1798.140(ae)) — a CPRA-introduced category whose processing for purposes other than those strictly necessary to provide the goods or services requested triggers the **Right to Limit**. SPI includes:
  - Government identifiers — Social Security number, driver's license, state ID, passport.
  - Account credentials — username/password combinations or security questions allowing account access.
  - Precise geolocation (defined in regulations as a radius of 1,850 feet or smaller).
  - Racial or ethnic origin, religious or philosophical beliefs, union membership.
  - Contents of mail, email, and text messages (unless the business is the intended recipient).
  - Genetic data.
  - Biometric information processed for the purpose of uniquely identifying a consumer.
  - Personal information collected and analyzed concerning health.
  - Personal information collected and analyzed concerning sex life or sexual orientation.
- **Sale** (§1798.140(ad)) — selling, renting, releasing, disclosing, disseminating, making available, transferring, or otherwise communicating personal information to a third party for **monetary or other valuable consideration**. Note: the "or other valuable consideration" language is broad; data-for-data swaps and ad-network exchanges have been treated as sales by the AG.
- **Share** (§1798.140(ah)) — disclosing personal information to a third party for **cross-context behavioral advertising**, whether or not for monetary consideration. Specifically introduced by CPRA to cover programmatic-advertising disclosures that businesses argued did not qualify as "sales."
- **Cross-context behavioral advertising** (§1798.140(k)) — targeting based on personal information obtained from the consumer's activity across businesses, distinctly-branded websites, applications, or services other than those with which the consumer intentionally interacts.
- **Service Provider** (§1798.140(ag)) — a person that processes personal information on behalf of a business pursuant to a written contract that meets the CCPA's specific restrictions (use limited to specified business purposes, no selling/sharing, no combining with other sources, etc.).
- **Contractor** (§1798.140(j)) — same role as Service Provider but for entities to whom the business **makes available** personal information rather than discloses it; contractually equivalent obligations.
- **Third party** (§1798.140(ai)) — anyone who is not the business that collected the personal information and is not a Service Provider or Contractor of that business. Disclosures to a Third Party generally constitute a "sale" or "share."

The **Service Provider / Contractor / Third Party trichotomy** is one of the most error-prone areas in CCPA/CPRA practice. The contractual provisions in §1798.140(ag)/(j) — including the obligation to flow down restrictions to subcontractors, to comply with consumer-rights requests, and to notify the business of any use that exceeds the contract — are mandatory; if they're missing, the recipient is treated as a Third Party even if both parties intended a Service Provider relationship.

## Consumer rights

CPRA recognizes seven consumer rights (often counted as eight if you split out access from "right to know"):

1. **Right to Know / Access** (§1798.100, §1798.110, §1798.115) — categories of PI collected, sources, business or commercial purposes, third parties to whom PI was disclosed, and the specific pieces of PI collected. Lookback period is generally the prior 12 months; CPRA extended this to allow consumers to request information beyond 12 months for PI collected on or after January 1, 2022, unless doing so is impossible or would involve disproportionate effort.
2. **Right to Delete** (§1798.105) — request deletion of PI collected from the consumer. Subject to nine enumerated exceptions including completing the transaction, security, debugging, exercising free speech, complying with legal obligations, internal uses reasonably aligned with consumer expectations, and so on. Business must direct Service Providers and Contractors to delete; must use commercially reasonable efforts to notify Third Parties to whom the PI was sold or shared.
3. **Right to Correct** (§1798.106) — *new with CPRA*. Request correction of inaccurate PI. Business must use commercially reasonable efforts to correct; consumer may be required to provide documentation supporting the correction.
4. **Right to Opt Out of Sale or Sharing** (§1798.120, §1798.135) — at any time. Opt-out applies prospectively; reverification cannot be required for at least 12 months. Businesses that sell or share must provide a clear and conspicuous "Do Not Sell or Share My Personal Information" link, and must process Universal Opt-Out Mechanisms (see GPC discussion below).
5. **Right to Limit Use and Disclosure of Sensitive Personal Information** (§1798.121) — *new with CPRA*. Restricts use of SPI to that which is strictly necessary to perform the services or provide the goods reasonably expected by an average consumer, plus enumerated security, fraud-prevention, transient-use, and quality-improvement purposes. If a business processes SPI only for these strictly-necessary purposes, the right to limit does not apply (and the "Limit Use" link is not required). Otherwise, a "Limit the Use of My Sensitive Personal Information" link is mandatory.
6. **Right to Non-Discrimination / Equal Service** (§1798.125) — a business may not deny goods or services, charge different prices, or provide a different level of quality because a consumer exercised CCPA rights. Financial incentives and bona-fide loyalty programs are permitted but must be reasonably related to the value of the consumer's data and require opt-in consent.
7. **Right to Data Portability** — implemented as part of the Right to Know: when responding to an access request, the response must be in a portable and, to the extent technically feasible, readily usable format that allows the consumer to transmit the information to another entity without hindrance.

CPRA also imposes obligations around **automated decision-making technology (ADMT)** — the CPPA has issued multiple draft regulations through 2024–2026 covering pre-use notice, opt-out rights, and access rights for significant decisions and extensive profiling. Practitioners should treat ADMT as an active rulemaking area and confirm the operative regulatory text at assessment time.

### Verification, response timelines, and method

- **Acknowledgment**: within **10 business days** of receiving a request.
- **Substantive response**: within **45 calendar days**, extendable once by an additional 45 days when reasonably necessary, with notice to the consumer.
- **Verification**: businesses must verify the requester's identity to a reasonable degree of certainty (or higher for Right to Know specific pieces). Verification standards are set in the CPPA regulations at 11 CCR §7060 et seq.
- **At least two methods to submit requests**: a toll-free phone number is no longer mandatory for businesses operating exclusively online with a direct relationship to the consumer; a designated email address plus an interactive web form is acceptable. Other businesses must offer two methods, one of which must be toll-free.

## Universal Opt-Out Mechanism (Global Privacy Control)

CPRA and the CPPA regulations require businesses that sell or share personal information to honor a Universal Opt-Out Mechanism that meets the technical specification in 11 CCR §7025. The **Global Privacy Control (GPC)** signal — a browser-based HTTP header (`Sec-GPC: 1`) and JavaScript property — is the recognized implementation. Treatment requirements:

- Treat a GPC signal as a valid opt-out of sale **and** sharing for that browser/device, plus any consumer profile linked by an identifier already known to the business.
- Honor it as soon as technically feasible (the AG's 2022 Sephora settlement made clear that "reasonable" is measured in seconds, not days).
- Do not require additional account creation, sign-in, or attestation as a precondition to honoring GPC.
- Display the consumer's opt-out status when known.

A common failure mode is recognizing GPC at the page level but continuing to fire ad-tech pixels and SDKs that propagate the consumer's PI to programmatic exchanges. Treat the requirement as covering the full pixel/SDK fanout, not just the visible cookie banner.

## Service Provider, Contractor, and Third Party contracts

A written contract with required CPRA provisions (§1798.140(ag)(1), (j)(1)) is **mandatory** to establish Service Provider or Contractor status. Required terms include:

- Specified, limited business purpose for processing.
- Prohibition on selling or sharing the PI.
- Prohibition on retaining, using, or disclosing the PI for any purpose other than the specified business purpose, including a prohibition on using PI outside the direct business relationship.
- Prohibition on combining the received PI with PI from other sources except as permitted (security, fraud, regulatory).
- Obligation to comply with applicable CCPA/CPRA obligations, including consumer-rights requests passed through.
- Obligation to notify the business if it can no longer meet its CCPA/CPRA obligations.
- Obligation to allow the business to take reasonable and appropriate steps to remediate unauthorized use.
- Flow-down to subcontractors with materially equivalent restrictions.
- Right to monitor compliance through measures such as ongoing manual reviews, automated scans, regular assessments, audits, or technical and operational testing.

If the contract is missing any required term, the regulator may treat the recipient as a Third Party — and the disclosure as a "sale" or "share" requiring opt-out, notice, and Do Not Sell/Share linkage.

## CPPA risk assessments and cybersecurity audits

CPRA §1798.185(a)(15) directs the CPPA to issue regulations requiring businesses whose processing presents **significant risk** to consumers' privacy or security to:

- **Conduct and submit risk assessments** to the CPPA on a regular basis. Triggers in the draft and adopted CPPA regulations include selling or sharing PI, processing SPI, using ADMT for significant decisions, training generative AI/ML on PI, and other high-risk processing.
- **Perform annual independent cybersecurity audits** with appropriate scope and rigor for the size and complexity of the business and the nature of the processing. The CPPA regulations specify auditor independence, scope, methodology, retention, and certification requirements.

These requirements are operative in regulatory form and have phased compliance dates — practitioners should treat the operative compliance date as a moving target through the first full enforcement cycle and confirm against the current text of 11 CCR §7150 et seq. (risk assessments) and §7120 et seq. (cybersecurity audits).

## Notices and disclosures

- **Notice at Collection** (§1798.100(a), 11 CCR §7012) — provided at or before the point of collection. Must enumerate categories of PI collected, categories of SPI collected, the purposes for each, whether each is sold or shared, and the retention period (or criteria) for each category. If the business uses SPI for purposes that trigger the Right to Limit, the notice must say so and link to the limit-use page.
- **Privacy Policy** (§1798.130(a)(5), 11 CCR §7011) — a comprehensive online disclosure updated at least every 12 months. Includes the categories of PI collected in the prior 12 months, sources, business and commercial purposes, categories of recipients, sale/share status by category, retention, all consumer rights, and contact methods.
- **Notice of Right to Opt Out / Notice of Right to Limit** — accessible from a clear and conspicuous link in the website footer. Common labels: "Do Not Sell or Share My Personal Information" and "Limit the Use of My Sensitive Personal Information." A single combined "Your Privacy Choices" link is permitted under 11 CCR §7015 with the standardized opt-out icon.
- **Notice of Financial Incentive** (§1798.125(b)) — for any program that conditions price, level, or quality on the collection, retention, sale, or sharing of PI, including loyalty programs and bona-fide bring-your-own-discount tiers.

## Enforcement and penalties

- **Two enforcers**, both via civil action: the CPPA (administrative enforcement under its own procedures, 11 CCR §7300 et seq.) and the California Attorney General (civil action in superior court). Coordination is governed by an MOU but both agencies have independent authority.
- **Civil penalties** under §1798.155: up to **US $2,500 per violation** for non-intentional violations; up to **US $7,500 per violation** for intentional violations or violations involving the personal information of consumers under 16. Each affected consumer can be a separate violation.
- **No mandatory 30-day right to cure** for AG actions after CPRA. CPPA enforcement may, but is not required to, consider a business's good-faith efforts to comply when assessing penalties.
- **Limited private right of action** (§1798.150) — only available for **data breaches involving non-encrypted and non-redacted personal information** (a defined subset, narrower than the general "personal information" definition) caused by the business's failure to implement and maintain reasonable security procedures and practices. Statutory damages: **US $100 to $750 per consumer per incident**, or actual damages, whichever is greater. Class-action vehicle in practice.
- **Notable enforcement examples to internalize**:
  - Sephora (AG, August 2022) — US $1.2 million settlement for failure to disclose sale of PI, failure to process opt-out signals (including GPC), and contract-deficiency findings. First public CCPA enforcement action and the touchstone for GPC compliance expectations.
  - DoorDash (AG, February 2024) — US $375,000 settlement involving alleged sale of PI through a marketing co-op without proper notice/opt-out.
  - CPPA enforcement advisories on data-broker registration and dark-pattern opt-out flows have signaled near-term enforcement priorities.

## How CCPA/CPRA differs from GDPR (narrative contrast)

CCPA/CPRA and the EU GDPR are both broad consumer/data-subject privacy regimes, but they're structurally different in ways that matter operationally. GDPR is **opt-in for processing** generally (a lawful basis must be established before processing) and applies to any controller or processor handling EU/EEA data subjects' personal data regardless of size. CCPA/CPRA is **opt-out for sale and sharing**, presumes the business may collect and use PI for disclosed purposes, and only applies to for-profit entities meeting the revenue/scale thresholds described above. GDPR's right to erasure mirrors CCPA's right to delete but with different exceptions; GDPR's right to data portability is broader (covers all data the subject provided and is processed by automated means under consent or contract). GDPR has a 72-hour breach notification to the supervisory authority; CCPA/CPRA has no parallel administrative breach-notification requirement (California's separate breach-notification statute, Civil Code §1798.82, governs that). GDPR fines reach the greater of €20M or 4% of global turnover; CCPA/CPRA per-violation penalties are smaller in absolute terms but accumulate rapidly. Sensitive Personal Information under CPRA partially overlaps with GDPR's special categories of personal data (Article 9) but adds account credentials and contents of communications, and provides a "right to limit" rather than a near-prohibition with enumerated exceptions. A practical implication: an organization meeting GDPR Article 5 / 6 / 9 / 13–22 obligations is *not* automatically CCPA/CPRA-compliant — it still needs the Notice at Collection, the Do Not Sell or Share / Limit Use links, GPC handling, the Service Provider / Contractor contractual terms, and the CPPA risk-assessment and cybersecurity-audit posture.

Do **not** maintain a hand-curated CCPA-to-GDPR control mapping inside this plugin — use the SCF crosswalk for that.

## Common misinterpretations this plugin should correct

1. **"We don't sell data, so the opt-out doesn't apply."** Wrong if the business engages in cross-context behavioral advertising — that is a "share" under §1798.140(ah) and triggers the same Do Not Sell or Share link, GPC handling, and contractual obligations.
2. **"Service Provider status protects us by default if we use the vendor's standard DPA."** Wrong if the contract is missing any of the §1798.140(ag) provisions. Vendor-default DPAs frequently lack the subcontractor flow-down or the explicit business-purpose limitation. Audit the contract against the statute, not against the vendor's marketing.
3. **"GPC is a browser-vendor preference, not a legal opt-out."** Wrong post-Sephora. The AG and CPPA both treat GPC as a valid Universal Opt-Out Mechanism; failure to honor it is enforceable.
4. **"Employee data is exempt."** Wrong since January 1, 2023. The HR partial exemption sunset; employee, applicant, contractor, and B2B contact PI is fully in scope.
5. **"We're under $25M in revenue, so we're exempt."** Not necessarily. The revenue threshold is one of three independent triggers — a small business that buys, sells, or shares PI of 100,000+ California consumers/households, or that derives 50%+ of revenue from selling/sharing, is still in scope.
6. **"The 30-day cure period gives us time to fix issues."** That mandatory cure period was removed by CPRA. Cure is now discretionary on the regulator's part.
7. **"Anonymized data is fine."** True only if it actually meets the deidentification standard in §1798.140(m): the business has implemented technical safeguards and business processes specifically prohibiting reidentification, has implemented business processes to prevent inadvertent release, and makes no attempt to reidentify.
8. **"HIPAA covers all of our health data, so CCPA doesn't apply."** Only the HIPAA-covered PHI itself is carved out. Health data collected outside the HIPAA context — wellness apps, web analytics on a clinic's marketing site, employee health records that are not part of the HIPAA-covered group health plan — is in scope and is SPI under §1798.140(ae).
9. **"Adequacy or SCCs cover our cross-border transfers."** Those are GDPR concepts. CCPA/CPRA does not impose data-localization or adequacy requirements on cross-border transfers, but transferring PI to a non-Service-Provider/Contractor recipient is a "sale" or "share" regardless of destination.

## Mandatory artifacts

Reference-depth assessment expects a business to be able to produce or attest to the following:

- **Data inventory** of PI and SPI by category, source, purpose, recipients, retention, and sale/share/limit-use status. This is not statutorily mandated as a freestanding "ROPA," but every other obligation depends on it.
- **Privacy Policy** updated within the last 12 months containing the §1798.130(a)(5) / 11 CCR §7011 disclosures.
- **Notice at Collection** templates for each data-collection surface (web, mobile, in-store, telephone, employment).
- **Do Not Sell or Share My Personal Information** mechanism — link, intake page, downstream propagation.
- **Limit the Use of My Sensitive Personal Information** mechanism — if SPI is processed beyond strictly-necessary purposes.
- **GPC handling implementation** — server-side or client-side recognition that propagates through the ad-tech and analytics fanout.
- **Consumer-rights intake and fulfillment workflow** — at least two methods, verification process per 11 CCR §7060, response within 45 days, training records for personnel handling requests.
- **Service Provider / Contractor contracts** with the §1798.140(ag) / (j) provisions; a vendor inventory categorizing each recipient as Service Provider, Contractor, Third Party, or Other (e.g. CCPA-exempt by data carve-out).
- **Risk assessment artifacts** for any processing that triggers the CPPA risk-assessment regulation (selling/sharing, SPI, ADMT for significant decisions, generative AI training on PI, etc.) — including the assessment, the management response, and the abridged version submitted to the CPPA on its required cadence.
- **Cybersecurity audit artifacts** — independent auditor engagement, scope, methodology, findings, certification, and the abridged report submitted to the CPPA.
- **Records of consumer-rights requests** including ticketing data, response times, dispositions, denial reasons.
- **Training records** for personnel handling consumer requests (§1798.130(a)(6)).
- **Metrics** for any business that processes PI of 10,000,000 or more consumers in a calendar year (§1798.130(a)(5)(B)) — number of requests received, complied with, denied, and median/mean response time, posted in the Privacy Policy.

## Cadence and timelines

| Obligation | Cadence | Citation |
|---|---|---|
| Privacy Policy update | At least every 12 months | §1798.130(a)(5) |
| Acknowledgment of consumer request | Within 10 business days | 11 CCR §7021 |
| Substantive response to consumer request | Within 45 calendar days (extendable once by 45 days) | §1798.130(a)(2) |
| Honor opt-out signal (sale/share, including GPC) | As soon as feasible; reverification not for at least 12 months | §1798.135(c) |
| Look-back for Right to Know | Generally 12 months; extended for PI collected on or after Jan 1, 2022 unless impossible / disproportionate | §1798.130(a)(2)(B) |
| Honor opt-out from sale/share | Until consumer reconsents; cannot solicit reconsent for 12 months | §1798.135(c)(4) |
| Notice at Collection for new data category | At or before point of collection | §1798.100(a) |
| Annual cybersecurity audit | Annual once triggered (per CPPA regs) | §1798.185(a)(15)(A) |
| Risk assessment | Per CPPA regs; submit abridged version on the cadence the regulation specifies | §1798.185(a)(15)(B) |
| Public metrics for >10M-consumer businesses | Annual (in Privacy Policy) | 11 CCR §7102 |

## Regulator and enforcement detail

- **California Privacy Protection Agency (CPPA)** — the only privacy-dedicated state agency in the United States. Five-member board. Created by CPRA. Has rulemaking authority for all CCPA/CPRA implementing regulations, runs administrative enforcement actions through the Enforcement Division, can order compliance, and can impose civil penalties through administrative orders.
- **California Attorney General** — retains civil enforcement authority in California superior court. Was the sole enforcer 2020–2023. Continues to handle larger and higher-profile actions; coordinates with CPPA via interagency MOU.
- **Penalty calculation** — per violation; "violation" can be a single consumer's PI mishandled, a single failure to honor an opt-out, a single missing required disclosure. Aggregate exposure for a noncompliant data-driven business can reach the millions even at the $2,500 per-violation rate.
- **Recent enforcement themes** — failure to honor GPC, deficient Service Provider contracts, dark-pattern opt-out flows, misclassification of "share" as not a "sale," missing or stale Notice at Collection, data-broker registration failures, and (emerging) ADMT and risk-assessment compliance.

## Interaction with other frameworks

- **GDPR** — overlaps substantially on rights, transparency, and vendor management. Use the SCF crosswalk to identify shared SCF controls; do not maintain a hand-mapped CCPA-to-GDPR table inside this plugin (an anti-pattern per the Framework Plugin Guide).
- **HIPAA** — PHI carve-out; non-PHI personal information of patients (e.g. marketing, web analytics) and any non-HIPAA-covered health data is still in scope.
- **GLBA / California Financial Information Privacy Act** — financial-account data is carved out; non-financial PI from the same institution is in scope.
- **State analogs** — Virginia (VCDPA), Colorado (CPA), Connecticut (CTDPA), Utah (UCPA), Texas (TDPSA), and others have CCPA-influenced regimes with subtly different scope, rights, and definitions. CCPA/CPRA remains the most stringent in several dimensions (broad PI definition, extensive SPI category, GPC mandate, risk-assessment regime).
- **NIST Privacy Framework / SP 800-53 PT family** — useful for mapping internal controls to a recognized control catalog. Use `/grc-engineer:gap-assessment` and the SCF crosswalk for control-by-control mechanics.
- **SOC 2 Privacy criterion** — the AICPA Privacy criterion can support evidence for several CCPA/CPRA obligations (notice, choice, access, disclosure to third parties, retention) but does not substitute for the statute's specific requirements.

## Command routing

- `/us-ccpa:scope` — determine applicability against the three CPRA-amended thresholds and the data carve-outs; outputs an in-scope / partially / out-of-scope verdict.
- `/us-ccpa:assess` — run a gap assessment delegated to `/grc-engineer:gap-assessment` against SCF framework `usa-state-ca-ccpa-cpra-2026`.
- `/us-ccpa:evidence-checklist` — enumerate evidence items organized by California Civil Code section.

## Levelling up to Full

Full-depth plugins add framework-native workflow commands tied to the audit ritual. Candidates for CCPA/CPRA:

- `/us-ccpa:risk-assessment` — generate a CPPA-compliant risk assessment package for a defined processing activity, including the abridged version for CPPA submission.
- `/us-ccpa:cybersecurity-audit-prep` — scoping, methodology, and evidence package for the annual independent cybersecurity audit required by CPPA regulations.
- `/us-ccpa:dsar-review` — review a sample of consumer-rights requests for verification, completeness, response time, and denial-rationale defensibility.
- `/us-ccpa:vendor-contract-review` — assess Service Provider, Contractor, and Third Party contracts against the §1798.140(ag) / (j) checklist.
- `/us-ccpa:gpc-validation` — runtime validation that a website honors the Sec-GPC header through the full ad-tech and analytics fanout.

## Capabilities

- CCPA/CPRA scope determination (three thresholds + data carve-outs + entity-affiliate hooks)
- Privacy Policy and Notice at Collection completeness review
- Consumer-rights workflow design (intake, verification, fulfillment, denial) per §§1798.100–1798.130 and 11 CCR §7060 et seq.
- SPI inventory and Right to Limit applicability analysis
- Service Provider / Contractor / Third Party classification and contract review
- Universal Opt-Out Mechanism (Global Privacy Control) handling assessment
- CPPA risk-assessment readiness
- CPPA cybersecurity-audit readiness
- Sale-versus-share distinction analysis for ad-tech and partner data flows
- Data-broker registration scoping (Cal. Civ. Code §1798.99.80 et seq. — the Delete Act, distinct but adjacent)
- Breach-readiness for the §1798.150 private right of action (encryption / redaction posture)
- Cross-framework reconciliation with GDPR, HIPAA, GLBA, and other US state privacy laws (via SCF crosswalk)

## References

- [California Privacy Protection Agency (CPPA)](https://cppa.ca.gov)
- [California Attorney General — CCPA](https://oag.ca.gov/privacy/ccpa)
- California Civil Code §§1798.100–1798.199.100 (current text via the [California Legislative Information portal](https://leginfo.legislature.ca.gov))
- 11 California Code of Regulations §7000 et seq. — CPPA regulations
- [Secure Controls Framework](https://securecontrolsframework.com)
- [SCF API entry for this framework](https://grcengclub.github.io/scf-api/api/crosswalks/usa-state-ca-ccpa-cpra-2026.json)
