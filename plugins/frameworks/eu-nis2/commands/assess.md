---
description: EU NIS2 Directive (Directive (EU) 2022/2555) compliance gap assessment
---

# EU NIS2 Assessment

Runs a compliance gap assessment against the **EU NIS2 Directive** (Directive (EU) 2022/2555) by delegating to `/grc-engineer:gap-assessment` with the framework's SCF identifier, then overlays directive-specific context: the entity classification (essential vs important), the ten Article 21 risk-management domains, and the Article 23 reporting readiness.

NIS2 is a Directive — the rules a regulator enforces against an in-scope entity live in the **national transposition law** of each Member State. This assessment delivers the directive-level baseline; flag national-specific overlays separately.

## Usage

```
/eu-nis2:assess [--scope=<scope>] [--sources=<connector-list>]
```

## Arguments

- `--scope=<scope>` (optional) — narrow the assessment to a specific part of the directive. Valid values:
  - `governance` — Article 20 (management-body accountability) only.
  - `article-21` — all ten cybersecurity risk-management measures (Article 21(2)(a)–(j)). Default.
  - `risk-policies` — Article 21(2)(a).
  - `incident-handling` — Article 21(2)(b).
  - `business-continuity` — Article 21(2)(c).
  - `supply-chain` — Article 21(2)(d).
  - `acquisition-development` — Article 21(2)(e).
  - `effectiveness` — Article 21(2)(f).
  - `cyber-hygiene` — Article 21(2)(g).
  - `cryptography` — Article 21(2)(h).
  - `hr-access-asset` — Article 21(2)(i).
  - `mfa-comms` — Article 21(2)(j).
  - `reporting` — Article 23 incident-reporting workflow readiness only.
  - `annex` — overlay Implementing Regulation (EU) 2024/2690 controls (uses the companion `emea-eu-nis2-annex-2024` SCF crosswalk; intended for digital-infrastructure / ICT-service-management / digital-provider entities).
- `--sources=<connector-list>` (optional) — comma-separated connector plugins to draw findings from (`aws-inspector`, `gcp-inspector`, `github-inspector`, `okta-inspector`, etc.).

## Pre-assessment confirmation

Before running, confirm the following with the user. Any of these missing makes the assessment less actionable.

1. **Entity classification** — Has `/eu-nis2:scope` been run? What is the classification (essential, important, or both)? Which Annex I or II sectors apply?
2. **Member State(s) of operation** — Each Member State has its own transposition law and competent authority. Capture all of them; the assessment can flag where national rules diverge from the directive baseline.
3. **DORA pre-emption check** — If the entity is a financial entity in scope of DORA (Regulation (EU) 2022/2554), DORA pre-empts NIS2 on ICT risk management, incident reporting, threat-led penetration testing, and ICT third-party risk. The assessment should de-scope those topics from NIS2 and route them to a DORA workflow.
4. **CER co-designation check** — If the entity is qualified as a "critical entity" under the CER Directive (Directive (EU) 2022/2557), the CER physical-resilience obligations apply alongside NIS2. CER controls are out of scope for this assessment.
5. **Implementing Regulation 2024/2690 applicability** — For the digital-infrastructure / ICT-service-management / digital-provider categories, the technical controls in the Implementing Regulation are the operative compliance text. Add `--scope=annex` to overlay them.

## What the assessment produces

1. **Compliance score** — overall NIS2 readiness percentage, weighted by mapped SCF controls.
2. **Applicable-requirements summary** — which Article 21 domains are in scope (always all ten for in-scope entities); whether the Annex implementing-act controls apply.
3. **Article-by-article gap** — every Article 21 domain and the Article 23 reporting workflow, with pass / partial / gap status from connector findings and narrative evidence.
4. **Article 20 governance gap** — board approval, oversight cadence, training completion, designated responsibility.
5. **Article 23 reporting readiness** — IR runbook aligned to 24h/72h/1mo? Significant-incident classification scheme defined? Past submissions on file? CSIRT / competent-authority contact tree current?
6. **Evidence gaps** — controls where no evidence source is configured (manual or connector).
7. **Remediation roadmap** — prioritised by domain criticality and effort. Quick wins surfaced separately (typically MFA enforcement gaps, IR runbook timing updates, board-approval paperwork).

## Delegation

Under the hood:

```
/grc-engineer:gap-assessment "emea-eu-nis2-2022" [--sources=<connector-list>]
```

The SCF crosswalk expands 68 SCF controls into the 30 NIS2 directive-level controls. Add `--scope=annex` to use the companion `emea-eu-nis2-annex-2024` crosswalk for the 351-control Implementing Regulation (EU) 2024/2690 breakdown.

## Output structure

The assessment is structured by Article 21 domain (rather than by SCF family) so the output maps directly to what a national supervisor will ask about. Example shape:

| Article 21 domain | SCF families | Status | Evidence gap | Remediation |
|---|---|---|---|---|
| 21(2)(a) Risk policies | RSK, GOV, AST | Partial | Risk register lacks supplier-risk integration | Extend register; quarterly review |
| 21(2)(b) Incident handling | IRO, MON | Partial | IR runbook predates NIS2; not aligned to 24h/72h/1mo | Update runbook; tabletop with new timing |
| 21(2)(c) Business continuity | BCD | Implemented | DR test reports current | Continue cadence |
| 21(2)(d) Supply chain | TPM, RSK | Gap | No supplier-risk register; contracts lack security clauses | Build register; update contract templates |
| 21(2)(e) SDLC / vulnerability mgmt | CHG, VPM, TDA | Partial | Patch SLAs not enforced for medium-severity | Tighten SLAs; track exceptions |
| 21(2)(f) Effectiveness | CPL, MON, RSK | Partial | Internal audit covers IT; not yet covering Article 21 explicitly | Add NIS2 module to internal audit plan |
| 21(2)(g) Cyber hygiene + training | SAT, HRS | Implemented | Workforce training current | Add management-body training records (Article 20) |
| 21(2)(h) Cryptography | CRY, IAC | Implemented | Encryption at rest / in transit deployed | Verify post-quantum agility plan |
| 21(2)(i) HR / access / asset | IAC, HRS, AST | Partial | Quarterly access reviews not running for legacy systems | Bring legacy systems into review cycle |
| 21(2)(j) MFA / secured comms | IAC, NET, END | Partial | MFA gaps for service accounts | Move to phishing-resistant MFA; close service-account gaps |
| Article 20 governance | GOV | Gap | Board has not formally approved Article 21 measures | Place item on next board meeting; add to oversight cadence |
| Article 23 reporting readiness | IRO | Partial | Runbook does not pre-populate national reporting-portal fields | Build a Member-State-specific submission template |

**Status categories**: Implemented (no gap), Partial (improvements needed), Gap (not implemented), N/A (not applicable to entity).

## Framework-specific notes

**Most-commonly-requested scopes**:

- First-time NIS2 readiness: full `--scope=article-21` assessment, plus `governance` and `reporting` overlays.
- For digital-infrastructure / ICT-service-management / digital-provider entities: add `--scope=annex` to overlay Implementing Regulation 2024/2690 controls — these entities are subject to the more detailed technical breakdown.
- Pre-incident-reporting drill: targeted `--scope=incident-handling` and `--scope=reporting` to validate the 24h/72h/1mo runbook against the national portal requirements.
- Board pack preparation: `--scope=governance` to surface Article 20 evidence gaps before the next board meeting.

**Known interactions with sibling frameworks**:

- **DORA** is *lex specialis* for in-scope financial entities. Where an Article 21 domain is fully covered by DORA (notably ICT risk management, incident reporting, threat-led penetration testing, and ICT third-party risk), the NIS2 assessment should defer to the DORA assessment for that topic and avoid double-counting.
- **GDPR** overlaps on incident reporting. A single event can trigger both Article 23 (NIS2, 24h/72h/1mo to the CSIRT) and Article 33 (GDPR, 72h to the DPA). The assessment should remind users to evaluate both regimes for every reportable event.
- **CER** (Critical Entities Resilience Directive) co-applies for entities qualified as critical entities. CER physical-resilience controls are out of scope here.
- **eIDAS** trust-service-provider obligations sit alongside NIS2 obligations for those providers; supervision is coordinated under Article 32(7).
- **ISO/IEC 27001:2022**: a certified ISMS is widely treated as good prima facie evidence of the Article 21 domains, but is not a safe harbour. The assessment will still expect explicit mapping to NIS2's specific concerns (especially supply chain and incident reporting timing).

**Mandatory cadence**:

- The directive does not set a single recertification cycle. National laws and ISMS practice typically drive **annual** review of the Article 21 measures, **annual or more-frequent** management-body training, and **event-driven** re-assessment after material changes.
- **Six-monthly** aggregated incident statistics from competent authorities to the Commission and ENISA (Article 23(9)).
- Commission review of NIS2 itself by **17 October 2027** and every 36 months thereafter (Article 40).

**Common misinterpretations the assessment corrects**:

- Treating Article 23 as "GDPR-style 72-hour reporting" — it is a three-stage 24h/72h/1mo flow. The assessment flags IR runbooks that lack the 24-hour early-warning step.
- Treating Article 21 as an ISO 27001 mapping exercise — Article 21(2)(d) supply chain and Article 23 reporting require explicit NIS2-shaped evidence, not just an ISO Annex A reference.
- Treating Article 20 as just management-body training — the assessment also checks for **board approval** and **oversight cadence** evidence.
- Treating size-threshold ineligibility as a definitive out-of-scope answer — the assessment runs the Article 2(2) override checks (trust services, DNS, public electronic communications, sole provider, CER critical entity, central-government public administration).

## SCF crosswalk

This assessment uses the Secure Controls Framework crosswalk for `emea-eu-nis2-2022` (the directive itself, 68 SCF → 30 directive controls) and optionally `emea-eu-nis2-annex-2024` (Implementing Regulation 2024/2690 technical breakdown, 351 controls).

- **SCF ID (directive)**: `emea-eu-nis2-2022`
- **SCF ID (Annex implementing act)**: `emea-eu-nis2-annex-2024`
- **Region**: EMEA
- **Depth**: Reference (tier 2 of 3)

## Related commands

- `/eu-nis2:scope` — entity classification and applicability decision tree (run this first).
- `/eu-nis2:evidence-checklist` — evidence list organised by Article 21 domain and Article 23 reporting workflow.
- `/grc-engineer:gap-assessment` — direct access to the SCF-backed gap assessment.

## Citations

- **Directive (EU) 2022/2555** — Articles 2 (scope), 3 (essential vs important), 20 (governance), 21 (risk-management measures), 23 (incident reporting), 26 (jurisdiction), 27 (registry of digital-infrastructure entities at ENISA), 32–34 (supervision and enforcement).
- **Commission Implementing Regulation (EU) 2024/2690** — technical and methodological requirements for digital-infrastructure / ICT-service-management / digital-provider entities under Article 21(5).
- **Recommendation 2003/361/EC** — definition of micro, small, and medium-sized enterprises used by the size threshold in Article 2(1).
- National transposition laws of each Member State of operation — the operative legal text for enforcement.
