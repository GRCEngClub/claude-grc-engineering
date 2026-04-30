---
description: CCPA / CPRA compliance gap assessment via SCF crosswalk
---

# CCPA / CPRA Assessment

Runs a compliance gap assessment against the California Consumer Privacy Act and the California Privacy Rights Act amendments by delegating to `/grc-engineer:gap-assessment` with the framework's SCF identifier, then overlays CCPA/CPRA-specific context.

## Usage

```
/us-ccpa:assess [--scope=<scope>] [--sources=<connector-list>]
```

## Arguments

- `--scope` (optional) — narrow the assessment to a thematic slice. Valid scopes:
  - `notices` — Privacy Policy, Notice at Collection, financial-incentive notices (§§1798.100, 1798.125, 1798.130)
  - `rights` — consumer-rights workflows (§§1798.100, 1798.105, 1798.106, 1798.110, 1798.115, 1798.120, 1798.121)
  - `opt-out` — sale/share opt-out, GPC handling, and Limit Use mechanisms (§§1798.120, 1798.121, 1798.135)
  - `vendors` — Service Provider, Contractor, and Third Party contracts and classification (§§1798.140, 1798.115)
  - `risk-and-audit` — CPPA risk assessments and annual cybersecurity audit (§1798.185)
  - `security` — reasonable security and §1798.150 private-right-of-action exposure
  - Default: full assessment across all sections
- `--sources` (optional) — comma-separated connector plugins to feed evidence into the assessment.

## Pre-assessment confirmation

Before running, confirm with the user:

1. **Have you run `/us-ccpa:scope`?** Applicability determination should precede assessment. If not, run scope first.
2. **Entity classification**: Are you assessing yourself as a business, a Service Provider, or a Contractor? Different obligations attach.
3. **Sale-vs-share posture**: Do you sell PI? Do you share PI for cross-context behavioral advertising? Both? Neither?
4. **SPI processing posture**: Do you process Sensitive Personal Information for purposes beyond strictly necessary?
5. **CPPA triggers**: Do any of your processing activities trigger the CPPA risk-assessment regulation (selling/sharing PI, processing SPI, ADMT for significant decisions, generative-AI training on PI, other high-risk processing)?
6. **Enforcement history**: Any prior CPPA or California AG inquiries, investigations, settlements, or active complaints?

## What the assessment produces

1. **Compliance score** — overall CCPA/CPRA readiness percentage, weighted by mapped SCF controls.
2. **Applicable-requirements summary** — which parts of the framework apply, based on `/us-ccpa:scope` outputs and the answers above.
3. **Control-by-control gap** — every mapped control, with pass/fail/inconclusive status from connector findings.
4. **Section-grouped findings** — gaps organized by California Civil Code section with severity and remediation guidance.
5. **Evidence gaps** — controls where no evidence source is configured.
6. **Remediation roadmap** — prioritized by severity, exposure (per-violation and class-action), and effort.

## Delegation

Under the hood:

```
/grc-engineer:gap-assessment "usa-state-ca-ccpa-cpra-2026" [--sources=<connector-list>]
```

The SCF crosswalk expands 258 SCF controls into the 623 CCPA/CPRA framework controls.

## Output structure

| Civil Code section | Topic | SCF control(s) | Status | Severity | Remediation |
|---|---|---|---|---|---|
| §1798.100(a) | Notice at Collection | PRI-04, PRI-05 | Gap | High | Deploy Notice at Collection at all data-collection surfaces; include SPI categories and Limit Use link |
| §1798.105 | Right to Delete | PRI-09 | Partially | Medium | Add downstream propagation to Service Provider deletion endpoints |
| §1798.121 | Right to Limit SPI | PRI-06 | Gap | High | Determine SPI processing posture; deploy Limit Use mechanism if any non-strictly-necessary use |
| §1798.135(b) | GPC honoring | PRI-07 | Gap | Critical | Implement Sec-GPC header recognition; propagate through ad-tech and analytics fanout |
| §1798.140(ag) | Service Provider contracts | TPM-04 | Partially | High | Audit existing DPAs for missing required provisions; remediate or reclassify recipient as Third Party |
| §1798.185(a)(15)(B) | Risk assessment | RSK-04 | Gap | High | Conduct risk assessment per CPPA regulation for triggering processing activities |
| §1798.185(a)(15)(A) | Cybersecurity audit | AST-09 | Gap | High | Engage independent auditor per CPPA regulation; establish annual cadence |

**Status categories**:

- **Implemented**: fully compliant with no identified gaps
- **Partially**: partially compliant; remediation needed
- **Gap**: not implemented — non-compliant
- **N/A**: not applicable based on scope outputs

**Severity**:

- **Critical**: enforcement risk, ongoing public-facing violation, blocks defensible posture
- **High**: serious gap, remediate before next regulator inquiry or audit cycle
- **Medium**: important improvement
- **Low**: best-practice recommendation

## Common assessment scopes

### Most-requested scopes

- **`rights`** — consumer-rights workflow assessment is the most-requested standalone scope; useful when DSAR volume is rising or SLA breaches have been observed.
- **`opt-out`** — driven by post-Sephora enforcement attention to GPC handling.
- **`vendors`** — driven by enforcement attention to Service Provider contractual deficiencies.
- **`risk-and-audit`** — driven by the CPPA regulations becoming operative; first audit cycle is the riskiest.

### Combined regimes

- **CCPA/CPRA + GDPR** — overlapping rights and vendor management; use `/grc-engineer:find-conflicts` and `/grc-engineer:optimize-multi-framework` to identify "implement once, satisfy many" controls. Do not maintain a hand-curated CCPA-to-GDPR mapping inside this plugin.
- **CCPA/CPRA + HIPAA** — bifurcate at the data-carve-out boundary; PHI is governed by HIPAA, residual PI by CCPA/CPRA.
- **CCPA/CPRA + state analogs** (Virginia, Colorado, Connecticut, Texas, Utah, etc.) — for multi-state programs, run CCPA/CPRA first because it is the most stringent in several dimensions and the others can largely be satisfied by a CCPA/CPRA-compliant baseline.

## Cadence and recurrence

CCPA/CPRA does not impose a single recertification cycle, but the following are time-bound:

- **Privacy Policy review and update**: at least every 12 months.
- **Annual cybersecurity audit**: annual once triggered.
- **Risk assessments**: per CPPA regulatory cadence; submit abridged version on schedule.
- **Public metrics**: annual, in Privacy Policy, for businesses processing PI of ≥10M California consumers.
- **Internal recommended cadence**: full assessment annually plus targeted scope assessments quarterly (rights, opt-out) and semi-annually (vendors).

## Common findings

Based on CPPA enforcement advisories, AG settlements, and observed assessment patterns:

1. **Failure to honor GPC end-to-end** (post-Sephora — most cited)
2. **"Share" misclassified as not a "sale"** — adtech disclosures excluded from opt-out logic
3. **Missing or deficient Service Provider contractual provisions** — particularly the subcontractor flow-down and the no-combining restriction
4. **Notice at Collection missing or stale** at one or more collection surfaces
5. **SPI processing without a Limit Use mechanism** — typically precise geolocation in adtech or contents of communications in support tooling
6. **Missing risk assessments** for processing that triggers the CPPA regulation
7. **No annual independent cybersecurity audit** for businesses that trigger the requirement
8. **DSAR response timelines missed** without notice-of-extension
9. **Verification procedures inadequate** — over-collecting verification information or under-verifying for high-risk requests
10. **Reasonable-security posture undocumented** — making §1798.150 private-right-of-action defense difficult

## Examples

```bash
# Full assessment
/us-ccpa:assess

# Consumer-rights workflow assessment only
/us-ccpa:assess --scope=rights

# Opt-out and GPC handling assessment
/us-ccpa:assess --scope=opt-out

# Vendor / Service Provider assessment
/us-ccpa:assess --scope=vendors

# CPPA risk-assessment and cybersecurity-audit readiness
/us-ccpa:assess --scope=risk-and-audit

# Pull connector evidence
/us-ccpa:assess --sources=aws-inspector,github-inspector,okta-inspector
```

## Related commands

- `/us-ccpa:scope` — determine applicability before assessing.
- `/us-ccpa:evidence-checklist` — enumerate evidence requirements organized by Civil Code section.
- `/grc-engineer:gap-assessment usa-state-ca-ccpa-cpra-2026` — direct SCF crosswalk assessment.

## Enforcement context

- **Penalties** (§1798.155): up to **US $2,500 per violation** non-intentional; up to **US $7,500 per violation** intentional or involving consumers under 16. Per-consumer aggregation applies — exposure for a noncompliant data-driven business reaches the millions even at the lower rate.
- **No mandatory cure period** under post-CPRA AG enforcement; CPPA may discretionarily consider good-faith remediation.
- **Private right of action** (§1798.150): statutory damages of US $100–$750 per consumer per incident for breaches of non-encrypted, non-redacted PI caused by failure to maintain reasonable security.
- **Two enforcers**: CPPA (administrative) and California AG (civil action in superior court). Coordination via interagency MOU.

---

**Statute**: California Civil Code §1798.100 et seq.
**Implementing regulations**: 11 California Code of Regulations §7000 et seq.
**Regulators**: California Privacy Protection Agency (CPPA); California Attorney General
**Region**: Americas
**Country**: United States
**Depth**: Reference (tier 2 of 3)
