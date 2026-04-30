---
description: Determine whether and how the California Consumer Privacy Act (CCPA / CPRA) applies to the organization
---

# CCPA / CPRA Scope Determination

Walks the three CPRA-amended applicability thresholds in California Civil Code §1798.140(d) plus the federal-statute data carve-outs, and outputs an in-scope / partially-in-scope / out-of-scope verdict with the specific triggers that led there.

## Usage

```
/us-ccpa:scope
```

## What this produces

- **Applicability verdict**: in-scope / partially in-scope / out-of-scope, with citations to the threshold(s) triggered.
- **In-scope data categories**: which categories of Personal Information (PI) and Sensitive Personal Information (SPI) the business handles for California consumers.
- **Carve-outs claimed**: which federally-preempted data categories are out-of-scope at the data level (HIPAA, GLBA, FCRA, DPPA, clinical trials), with the residual non-carved-out PI still in scope.
- **Entity classification**: business, Service Provider, Contractor, or Third Party for each processing relationship.
- **Sale-vs-share posture**: whether the business sells PI, shares PI for cross-context behavioral advertising, or neither.
- **SPI processing posture**: whether SPI is processed strictly necessary or beyond, triggering the Right to Limit.
- **Next steps**: whether to proceed with `/us-ccpa:assess` and `/us-ccpa:evidence-checklist`.

## Pre-scope confirmation

Before walking the thresholds, confirm with the user:

1. **For-profit?** CCPA/CPRA applies only to **for-profit** entities. Nonprofits and government entities are categorically out of scope (though they may be in scope under other California privacy laws — separate analysis).
2. **Doing business in California?** Conducting commercial activity directed at California consumers — sales, marketing, service delivery, employment of California residents — generally satisfies this prong. Mere passive availability of a website is not by itself "doing business" but combined with revenue or user-base presence in California typically is.
3. **California consumers in scope?** "Consumer" under §1798.140(i) means a natural person who is a California resident. Includes employees, applicants, B2B contacts, and customers as of January 1, 2023 (the HR and B2B partial exemptions sunset).

If any of these is "no," the organization is out of scope at the entity level — stop here and document the rationale.

## Threshold flow

A for-profit business that does business in California and collects PI of California consumers is in scope if it meets **any one** of the three thresholds in §1798.140(d):

### Threshold 1 — Revenue (§1798.140(d)(1)(A))

Annual gross revenues in excess of **US $25 million** in the **preceding calendar year**.

- "Annual gross revenues" is the entity's worldwide gross revenue for the prior calendar year, not California-specific revenue.
- The threshold is subject to periodic CPPA inflation adjustment — confirm the current dollar figure against the current text of §1798.140(d) and any CPPA Board-adopted adjustment notice.

**Walk**: ask the user for the entity's prior calendar year worldwide gross revenue. If > $25M (or the current adjusted figure), Threshold 1 is met.

### Threshold 2 — Volume of PI handled (§1798.140(d)(1)(B))

Alone or in combination, annually **buys, sells, or shares** the personal information of **100,000 or more** California consumers or households.

- "Buys" includes paid acquisition of PI from a data broker or partner.
- "Sells" includes any disclosure for monetary or other valuable consideration.
- "Shares" includes any disclosure for cross-context behavioral advertising — even with no monetary exchange.
- The CPRA-era threshold is **100,000** (raised from CCPA's original 50,000) and now uses **consumers or households** rather than CCPA's "consumers, households, or devices."

**Walk**: ask the user to estimate the number of distinct California consumers or households whose PI the business buys, sells, or shares annually. Account for ad-tech and analytics partner disclosures (these are commonly underestimated). If ≥ 100,000, Threshold 2 is met.

### Threshold 3 — Revenue derivation (§1798.140(d)(1)(C))

Derives **50 percent or more** of annual revenue from **selling or sharing** consumers' personal information.

- Applies even at very low absolute revenue.
- Captures pure-play data brokers and adtech intermediaries.

**Walk**: ask whether selling or sharing PI is the primary revenue model. If ≥ 50%, Threshold 3 is met.

### Affiliate / common-branding hook

Even if no threshold is met, the entity is in scope if it:

- Controls or is controlled by a covered business **and** shares common branding (parent, subsidiary, sister entity), where common branding means a shared name, service mark, or trademark such that the average consumer would understand they are commonly owned, **and** with whom the business shares consumers' PI; or
- Is a joint venture or partnership composed of businesses in which each has at least a 40 percent interest, with the JV treated as a separate business.

**Walk**: ask about parent/subsidiary structure and whether PI is shared across commonly-branded entities.

## Carve-out flow

Even when an entity is in scope, specific **categories of data** are carved out of CCPA/CPRA. These are data-level carve-outs, not entity exemptions — the entity remains in scope for any non-carved-out PI.

| Data category | Citation | Notes |
|---|---|---|
| Protected Health Information governed by HIPAA, plus information collected by a covered entity / business associate to the extent treated under HIPAA or California Confidentiality of Medical Information Act | §1798.146 | The PHI itself is out of scope; web analytics on the marketing site, employee marketing, non-PHI loyalty data are still in scope. |
| Personal information collected, processed, sold, or disclosed pursuant to GLBA or California Financial Information Privacy Act | §1798.145(e) | Covers financial-account data; non-financial PI from the same institution remains in scope. |
| Personal information collected, processed, sold, or disclosed under the Driver's Privacy Protection Act | §1798.145(f) | DMV-derived data only. |
| Personal information processed pursuant to the Fair Credit Reporting Act when used for FCRA-permissible purposes | §1798.145(d) | Carve-out is purpose-specific; non-FCRA uses of the same data are not exempt. |
| Clinical-trial information governed by federal common rule | §1798.145(c) | Specifically defined research contexts. |

**Walk**: for each data carve-out category, ask whether the business holds data of that category. For each "yes," confirm the residual non-carved-out PI is still being assessed.

## Outputs

After the walk, produce a structured verdict:

```
APPLICABILITY VERDICT: IN SCOPE

Triggers met:
  ✓ Threshold 1 (Revenue): $X.YM in calendar year 2025
  ✓ Threshold 2 (Volume): ~140,000 California consumers in shared ad-tech audiences

Carve-outs claimed:
  - HIPAA-covered PHI: YES — separate HIPAA program in place
    Residual in-scope: marketing PI, web analytics, non-PHI portal accounts

Sale/share posture:
  - Sells PI: NO
  - Shares PI for cross-context behavioral advertising: YES (Meta Pixel, Google Ads, ad-network partners)
  - Triggers: Do Not Sell or Share link required; GPC handling required

SPI processing posture:
  - Processes SPI beyond strictly necessary: YES (precise geolocation for ad targeting)
  - Triggers: Limit Use link required; Right to Limit applies

Recommended next commands:
  - /us-ccpa:evidence-checklist
  - /us-ccpa:assess
```

## Common scoping mistakes this command corrects

- **Treating "we don't sell data" as out-of-scope of the opt-out**. If the business shares for cross-context behavioral advertising, the opt-out applies — that is the "share" added by CPRA.
- **Assuming employee or B2B data is exempt**. The HR and B2B partial exemptions sunset on January 1, 2023; both are fully in scope.
- **Treating the HIPAA carve-out as entity-wide**. Only the HIPAA-covered PHI is exempt; everything else the entity holds about California consumers is in scope.
- **Underestimating the volume threshold**. Programmatic ad-tech, analytics, and CDP partner disclosures push most consumer-facing businesses past 100,000 California consumers/households quickly. Audit the partner list, not just the customer list.
- **Treating the $25M revenue threshold as the only trigger**. Threshold 2 (volume) and Threshold 3 (revenue derivation) are independent — an under-$25M business can still be in scope.
- **Ignoring the affiliate hook**. Common-branded subsidiaries that share PI are pulled into scope by §1798.140(d)(2)(B).

## Citations

- California Civil Code §1798.140 (definitions and applicability thresholds)
- California Civil Code §1798.145 (federal-statute carve-outs)
- California Civil Code §1798.146 (HIPAA carve-out)
- 11 California Code of Regulations §7000 et seq. (CPPA implementing regulations)

---

**Statute**: California Civil Code §1798.100 et seq.
**Regulator**: California Privacy Protection Agency (CPPA); California Attorney General
**Region**: Americas
**Country**: United States
