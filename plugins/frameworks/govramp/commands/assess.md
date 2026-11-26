---
description: GovRAMP verification readiness assessment (Snapshot, Core, Ready, Authorized)
---

# GovRAMP Assessment

Evaluates a cloud product's readiness for a GovRAMP verification status. GovRAMP was called StateRAMP until February 2025.

## Arguments

- Argument 1 - Target status (optional: `snapshot`, `core`, `ready`, `authorized`; default `core`)
- Argument 2 - Impact level for Ready and Authorized (optional: `low`, `moderate`, `high`; default `moderate`)

## GovRAMP in brief

GovRAMP is a nonprofit membership organization (legally still StateRAMP, Inc., doing business as GovRAMP) that runs a NIST SP 800-53 Rev. 5 based security program for cloud products sold to state, local, tribal, territorial, and education governments. A provider is verified once, and participating governments reuse the result. Verified products appear on the [Authorized Product List (APL)](https://govramp.org/program-participants).

- Providers must be active GovRAMP members before they enter the program.
- RAMPQuest runs the Program Management Office (PMO), which reviews documentation and validates results.
- The cloud definition follows NIST SP 800-145 (IaaS, PaaS, SaaS, and hybrid models that meet its characteristics).

## The verification ladder

| Status | Controls | Who assesses | Continuous monitoring |
|--------|----------|--------------|-----------------------|
| Security Snapshot | 40 | PMO scores it; a gap assessment, not a verification | None |
| Progressing Security Snapshot | 40 | PMO, reassessed quarterly | Quarterly reassessment |
| Core Verification | 60 | PMO validates evidence; no 3PAO | Quarterly |
| Ready Verification | 80 | 3PAO Readiness Assessment Report (RAR), validated by the PMO | Monthly |
| Authorized / Provisional Verification | 300+ (Low, Moderate, or High baseline) | 3PAO Security Assessment Report (SAR), government sponsor or GovRAMP Approvals Committee | Monthly, plus annual reassessment |

Each status lasts 12 months and is kept through continuous monitoring.

Core's 60 controls were chosen using the MITRE ATT&CK framework and align with the Moderate baseline. Core is not a self-attestation: the PMO reviews submitted evidence, scan results, and program posture.

Provisional means the Authorized requirements are met, but the product relies on interconnected technology that is not yet GovRAMP or FedRAMP verified, and may carry limited POA&M items. It can move to Authorized once those dependencies are resolved.

## Assessment process

1. **Pick the target status.** Most providers start with Snapshot or Core and move up. Buyers often ask for a specific status in a solicitation, so check the solicitation first.
2. **Scope the boundary.** List components, data flows, external services, and any interconnected products, with their GovRAMP or FedRAMP status.
3. **Gap assessment.** Compare implemented controls with the target control set:
   - Snapshot or Core: the 40 or 60 controls in GovRAMP's published packages.
   - Ready: the 80 Ready controls.
   - Authorized: the full Low, Moderate, or High baseline.
   - For a crosswalk-based first pass, run `/engineer:gap-assessment GovRAMP-Core` (or `GovRAMP-Low`, `GovRAMP`, `GovRAMP-High`). SCF publishes crosswalks for each GovRAMP baseline.
4. **Documentation check.** See `/govramp:documentation` for the package each status needs.
5. **Continuous monitoring readiness.** Core submissions need 90 days of continuous monitoring data and a POA&M. Ready and Authorized need monthly ConMon after verification.
6. **Reuse existing federal work.** A current FedRAMP Ready status can be used toward GovRAMP Ready, and GovRAMP Fast Track accepts existing RAR, SAR, and ConMon material. For FedRAMP itself, use the `fedramp-20x` plugin.

## Output

1. **Readiness by status**: which statuses are reachable now, and which controls block the next one.
2. **Control gaps**: missing or partial controls, ranked by whether they block the target status.
3. **Documentation gaps**: missing package items.
4. **ConMon gaps**: missing scan cadence, POA&M tracking, or reporting.
5. **Next steps**: membership, 3PAO engagement (Ready and above), and submission order.

## Fees

GovRAMP publishes fees by provider revenue band on its [pricing overview](https://govramp.org/pricing-overview). Quote the current page rather than estimating; fees change.

## Examples

```bash
# Default: readiness for Core Verification
/govramp:assess

# Readiness for Ready Verification at Moderate
/govramp:assess ready moderate

# Readiness for Authorized at High
/govramp:assess authorized high
```

## Related commands

1. `/govramp:impact-select` to choose Low, Moderate, or High
2. `/govramp:documentation` for package contents
3. `/govramp:state-specific` for how individual governments use GovRAMP
4. The `govramp-expert` skill for control-level guidance

## Sources

- [GovRAMP Core](https://govramp.org/core), [Ready](https://govramp.org/ready), [Authorized/Provisional](https://govramp.org/authorized), [Progressing Snapshot](https://govramp.org/progressing-snapshot-security-program)
- [StateRAMP announces rebrand to GovRAMP](https://govramp.org/news/blog/stateramp-announces-rebrand-to-govramp-reflecting-mission-to-unite-public-and-private-sectors-in-advancing-cybersecurity) (February 14, 2025)
