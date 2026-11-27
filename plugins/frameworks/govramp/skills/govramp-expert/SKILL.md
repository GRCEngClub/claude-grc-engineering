---
name: govramp-expert
description: GovRAMP (formerly StateRAMP) expert for cloud products sold to state, local, tribal, territorial, and education governments. Knows the verification ladder (Security Snapshot, Progressing Snapshot, Core, Ready, Authorized/Provisional), NIST SP 800-53 Rev. 5 baselines, package documentation, continuous monitoring, and how individual governments apply GovRAMP.
allowed-tools: Read, Glob, Grep, Write
---

# GovRAMP Expert

Guidance for cloud service providers working toward a GovRAMP verification, and for government buyers reading one.

## Program basics

- **Name**: StateRAMP announced on February 14, 2025 that it would operate as GovRAMP. The legal entity is still StateRAMP, Inc., doing business as GovRAMP. Memberships, contracts, and verifications made under the StateRAMP name carried over. Older statutes, policies, and solicitations that say "StateRAMP" mean the same program.
- **Who it serves**: state, local, tribal, territorial, and education governments. GovRAMP also works alongside federal programs, but it is not FedRAMP.
- **Structure**: a 501(c)(6) nonprofit membership organization. Providers must be active members to take part. Participation is free for eligible public-sector organizations.
- **PMO**: RAMPQuest is the contracted Program Management Office. It reviews documentation, validates results, and runs continuous monitoring reviews.
- **Approvals**: Authorized Verification needs a government sponsor or the GovRAMP Approvals Committee, which acts as an appointed sponsor.
- **Public record**: verified products are listed on the Authorized Product List (APL).
- **Control basis**: NIST SP 800-53 Rev. 5. Low, Moderate, and High service provider packages. Cloud is defined per NIST SP 800-145.

## Verification ladder

| Status | Controls | Assessment | ConMon |
|--------|----------|------------|--------|
| Security Snapshot | 40 | PMO-scored gap assessment; not a verification | None |
| Progressing Security Snapshot | 40 | PMO, reassessed quarterly with guidance | Quarterly reassessment |
| Core Verification | 60 | PMO review of evidence, scans, and program posture; no 3PAO; not self-attestation | Quarterly |
| Ready Verification | 80 | GovRAMP 3PAO Readiness Assessment Report (RAR) plus PMO validation | Monthly |
| Authorized / Provisional | 300+ (full Low/Moderate/High baseline) | GovRAMP 3PAO Security Assessment Report (SAR), sponsor or Approvals Committee approval | Monthly, annual reassessment |

Every status lasts 12 months and is kept through continuous monitoring.

- **Core** launched in May 2025. Its 60 controls were selected using the MITRE ATT&CK framework and align with the Moderate baseline. It gives smaller providers a verified APL listing without paying for a 3PAO up front.
- **Provisional** means the Authorized requirements are met, but the product depends on interconnected technology that is not yet GovRAMP or FedRAMP verified. It may carry limited POA&M items, and it moves to Authorized once those dependencies are resolved.
- **Reuse of federal work**: a current FedRAMP Ready status can be used toward GovRAMP Ready. GovRAMP Fast Track accepts existing RAR, SAR, and ConMon material instead of a repeat assessment. FedRAMP retired FedRAMP Ready in July 2026 and no longer requires a RAR or SAR, so confirm with GovRAMP what it accepts from a provider certified under FedRAMP's current rules.

## Core submission contents

GovRAMP's Core page lists these items for the Service Request:

- SSP, system diagrams, policies and procedures (including the Configuration Management, Incident Response, and Contingency Plans)
- User guide, rules of behavior, plans catalog
- 90 days of ConMon data and a POA&M
- Applicable laws and regulations

GovRAMP also publishes a Core evidence collection package with examples and folders for all 60 controls.

Penetration testing is optional at Core. Where it is done, it must follow GovRAMP's formal testing procedures; bug bounty results are not accepted as standalone evidence.

## Impact levels

Use FIPS 199. Rate confidentiality, integrity, and availability, and take the highest of the three as the overall level. GovRAMP says to choose "based on your government customers and data sensitivity."

- **Low**: public information; limited harm if compromised.
- **Moderate**: the usual case for state and local SaaS with PII, health, tax, benefits, or HR data.
- **High**: severe or catastrophic harm, such as public safety systems.

Other rules apply on top of the impact level: CJIS for criminal justice information, IRS Publication 1075 for federal tax information, and HIPAA where it applies.

## How governments use GovRAMP

- Each government decides whether a GovRAMP status is required, which status, and what it adds on top.
- Being on GovRAMP's participating governments list can mean exploration, planning, or active implementation. It is not proof of a contract requirement.
- Additions often cover data location, personnel screening, breach notification timing, records retention, and audit rights.
- GovRAMP itself does not require U.S. citizenship for employees, but a government may add personnel requirements for some data.
- Some states run separate programs, such as Texas's TX-RAMP, run by the Department of Information Resources. Check that program's own rules instead of assuming GovRAMP equivalence.

Always source a government-specific requirement to a statute, policy, or contract clause. If you can't find a source, give the question to ask rather than a guessed number.

## Control responsibility

Document every control as provider, customer, shared, or inherited.

- **Mostly provider in SaaS**: SC, SI, CM, and most PE, which is usually inherited from the IaaS provider.
- **Mostly customer**: who gets access to the customer's tenant (part of AC-2), the customer's own staff training (AT) and personnel screening (PS).
- **Shared**: IR (coordination and notification), AU (provider collects, customer reviews its tenant's logs), CP (provider recovers the service, customer plans for its business process).
- **Inherited**: name the provider you inherit from and its GovRAMP or FedRAMP status. An unverified dependency is what makes a product Provisional instead of Authorized.

## Common gaps

**Technical**

- MFA not enforced for every user and admin path (IA-2). SMS codes are a frequent finding; prefer phishing-resistant MFA.
- Missing encryption at rest (SC-28) or weak TLS (SC-8); unclear key management (SC-12).
- Logging gaps (AU-2, AU-12), short or inconsistent retention (AU-11), no alerting (SI-4).
- Irregular scanning (RA-5) and slow patching (SI-2), which shows up immediately in ConMon.
- Access reviews not done on the stated cadence (AC-2); over-privileged roles (AC-6).

**Documentation**

- SSP text copied from a template and not matching the system.
- Diagrams, inventory, and SSP disagreeing with each other.
- Policies that exist but aren't followed, or have no review date.
- Contingency plan never tested (CP-4); backups never restored (CP-9).

**ConMon**

- Missing or late monthly or quarterly deliverables.
- POA&M items past due with no escalation.
- Remediation deadlines taken from memory instead of GovRAMP's Continuous Monitoring Guide and Escalation Process.

## Relationship to other frameworks

- **FedRAMP**: GovRAMP and FedRAMP's Rev5 certification type both build on NIST SP 800-53 Rev. 5. FedRAMP's Consolidated Rules for 2026 replaced the SSP and the provider POA&M in FedRAMP packages, while GovRAMP still uses them. FedRAMP also now grants a FedRAMP Certification in Class A to D in place of Low, Moderate and High authorizations. Use the `fedramp-20x` plugin for FedRAMP. A FedRAMP Ready package can be used toward GovRAMP Ready.
- **SOC 2 and ISO/IEC 27001:2022**: useful supporting evidence for policies and operations, but neither replaces a GovRAMP verification.
- **CJIS**: law enforcement systems usually need both a GovRAMP status and CJIS Security Policy compliance.
- **TX-RAMP**: a separate Texas program with its own requirements.

## Fees

GovRAMP publishes fees by provider revenue band on its [pricing overview](https://govramp.org/pricing-overview). Quote the current page instead of estimating. 3PAO assessment costs for Ready and Authorized are set by the 3PAO.

## Capabilities

- Picking the right starting status and planning the path up the ladder
- FIPS 199 impact level selection for Ready and Authorized
- Gap assessment against the Core, Ready, or full baseline control sets
- SSP, POA&M, and ConMon preparation using GovRAMP's templates
- Control responsibility and inheritance documentation
- Reusing FedRAMP or other federal material through the Ready reuse path and Fast Track
- Finding and citing a specific government's additional requirements
- Multi-government planning

## Sources

- [GovRAMP Core](https://govramp.org/core), [Ready](https://govramp.org/ready), [Authorized/Provisional](https://govramp.org/authorized), [Progressing Snapshot](https://govramp.org/progressing-snapshot-security-program)
- [Participating government organizations](https://govramp.org/participating-government-organizations)
- [StateRAMP announces rebrand to GovRAMP](https://govramp.org/news/blog/stateramp-announces-rebrand-to-govramp-reflecting-mission-to-unite-public-and-private-sectors-in-advancing-cybersecurity) (February 14, 2025)
