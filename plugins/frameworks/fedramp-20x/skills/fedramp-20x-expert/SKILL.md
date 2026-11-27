---
name: fedramp-20x-expert
description: FedRAMP 20x under the Consolidated Rules for 2026. Explains certification classes A to D, the Key Security Indicators, the 17 rulesets, the Certification Package (overview and Security Decision Record), independent assessment and ongoing certification. Use for any question about FedRAMP 20x, FedRAMP Certification, KSIs, or moving off Rev5.
allowed-tools: Read, Glob, Grep, Write, Bash, WebFetch
---

# FedRAMP 20x expert

FedRAMP changed more in 2026 than in the ten years before it. Most of what was written about FedRAMP before June 2026, including older versions of this plugin, is now wrong. This skill describes the program as of rules release `2026.11.02.01` (November 2026).

**Check before you rely on a detail.** FedRAMP publishes its rules as one JSON file and updates it about monthly. Run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/rules.js" status
```

It prints the release this plugin bundles and the release FedRAMP has published. If they differ, run `/fedramp-20x:sync-rules` and say which release your answer is based on. Do not quote a rule statement from memory; print it with `node "${CLAUDE_PLUGIN_ROOT}/scripts/rules.js" show <ID>`.

## What changed, in one page

| Before | Now |
|---|---|
| FedRAMP Authorization, "FedRAMP Authorized" | **FedRAMP Certification**, "FedRAMP Certified". Agencies still issue their own authorization to operate. |
| Impact level Low, Moderate, High | **Certification Class A, B, C, D**. B, C and D loosely align with Low, Moderate and High. They are not the same thing: a class says how much assurance information the provider commits to supply. |
| Agency-sponsored or JAB authorization | **Certification Path**: Program (FedRAMP certifies directly, no sponsor) or Agency (Rev5 only). 20x is Program path only. |
| Separate standards documents | One dataset, the **Consolidated Rules for 2026 (CR26)**: 17 rulesets, 245 rules, 46 Key Security Indicators, 81 defined terms. |
| System Security Plan | **Certification Package Overview** plus **Security Decision Record (SDR)** |
| Security Assessment Plan and Report, SRTM, Risk Exposure Table | Not required. The assessor's findings are written per rule and per KSI inside the SDR, with an overall summary in the overview. FedRAMP publishes no templates. |
| POA&M | **Accepted vulnerabilities**. Providers no longer keep a FedRAMP POA&M. |
| Monthly ConMon deliverables | **Ongoing Certification Report** every 3 months, plus a monthly vulnerability activity report |
| 3PAO | **FedRAMP Recognized** independent assessment service |
| Authorization boundary | **Minimum Assessment Scope** |
| FedRAMP Ready | Retired. A new provider starts with an Initial Implementation listing, often then 20x Class A. |
| "FedRAMP 20X", "Rev 5" | Written **20x** and **Rev5** |

## Certification types and classes

- **20x** is the current type, built for cloud-native services that run on FedRAMP Certified infrastructure or platforms. Assessment is against Key Security Indicators and the rulesets.
- **Rev5** is the legacy type, assessed against SP 800-53 control baselines. FedRAMP stops accepting new Rev5 applications on **June 11, 2027**. Existing Rev5 certifications stay active until at least December 31, 2028. Rev5 providers must adopt the shared rulesets too.

| Class | Loose alignment | 20x today | Notes |
|---|---|---|---|
| A | Pilot and low-risk use | Available | Needs a SOC 2 Type II, a FedRAMP Rev5 result or a GovRAMP result from the past 12 months, a reduced rule list and 7 KSIs. An assessor is optional. Agencies should not rely on it for more than 12 months unless the provider is moving up. |
| B | Low | Available | All 46 KSIs, 5 of them optional |
| C | Moderate | Available | All 46 KSIs |
| D | High | Not yet | Pilot expected from January 2027. Until it is published, High-aligned work means Rev5 with an agency sponsor. |

Dates that affect advice today: VDR and VER become mandatory for every certified offering on **December 7, 2026** (grace to March 7, 2027). CR26 is mandatory for all from **January 1, 2027**.

## Key Security Indicators

A KSI is a short statement of a security outcome. The provider decides how to achieve and measure it. FedRAMP defines no pass criteria and attaches no MUST or SHOULD to a KSI; the SP 800-53 controls listed against each one are pointers for analysis, not a checklist. Do not describe KSI work as "compliance".

| Theme | Name | Indicators |
|---|---|---|
| CED | Cybersecurity Education | 1 |
| CMT | Change Management | 4 |
| CNA | Cloud Native Architecture | 8 |
| IAM | Identity and Access Management | 6 |
| INR | Incident Response | 3 |
| MLA | Monitoring, Logging, and Auditing | 5 |
| PIY | Policy and Inventory | 5 |
| RPL | Recovery Planning | 4 |
| SCR | Supply Chain Risk | 2 |
| SVC | Service Configuration | 8 |

IDs have letter keys, for example `KSI-IAM-APM` (Adopting Passwordless Methods). There are no numeric IDs such as `KSI-IAM-01` and there is no `AFR` theme; both belonged to the 2025 pilot. List the current set for a class with `/fedramp-20x:ksi-check`.

The word "persistently" in most KSIs is a defined term: repeated in cycles over a long period, with the status always known. It does not mean continuously.

## The rulesets

| Key | Name | What it covers |
|---|---|---|
| FRC | FedRAMP Certification | How to obtain and keep a certification; Class A rules; Rev5 baselines |
| MAS | Minimum Assessment Scope | Which information resources are in scope |
| CPO | Certification Package Overview | The overview document and how often it is refreshed |
| SDR | Security Decision Record | The per-rule and per-KSI record that replaced the SSP |
| IVV | Independent Verification and Validation | The yearly independent assessment and what the assessor produces |
| CDS | Certification Data Sharing | Trust center, public information, agency access |
| CCM | Collaborative Continuous Monitoring | Ongoing Certification Reports and Quarterly Reviews |
| VDR | Vulnerability Detection and Response | Detection cadences and mitigation timeframes |
| VER | Vulnerability Evaluation and Reporting | Evaluating, rating and reporting vulnerabilities |
| SCN | Significant Change Notification | Routine, adaptive and transformative changes |
| IEC | Incident Evaluation and Communication | Reportable incidents and report timeframes |
| AFC | Addressing FedRAMP Communication | The FedRAMP Security Inbox and emergency messages |
| SCG | Secure Configuration Guide | Guidance customers need to configure the service securely |
| CMU | Cryptographic Module Use | Documenting modules and their CMVP validation status |
| MKT | Marketplace Listing | Listings, including the Initial Implementation Phase |
| REC | FedRAMP Recognition | What an assessor needs to be FedRAMP Recognized |
| AGU | Agency Use | What agencies do when they use a certified service |

A rule has a **force**: MUST, MUST NOT, SHOULD, SHOULD NOT or MAY. A SHOULD still has to be addressed: the provider explains its decision in the Security Decision Record. Many rules vary by class. List what applies with:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/rules.js" rules --class=C --affects=Providers
```

## The Certification Package

A package sent to FedRAMP holds at least:

1. A **Certification Package Overview**: the offering, its services, information flows, third-party resources, cryptographic modules, and the assessor's overall summary.
2. A **Security Decision Record**: for every applicable rule and KSI, how it is implemented, how the provider validates it, and what the independent assessor found. Build and check one with `/fedramp-20x:sdr`.
3. A real or example **Ongoing Certification Report**.

Each is published in human-readable form and as JSON matching FedRAMP's schemas, from a FedRAMP-compatible trust center the provider runs. It is maintained data, not a folder of documents.

## Assessment

- A FedRAMP independent assessment by a FedRAMP Recognized assessor is required at least yearly for Class B, C and D, and optional for Class A.
- The assessor verifies that what is implemented matches what is documented and validates that it has the intended outcome, by looking at the real system, not screenshots.
- The assessor writes a summary for each rule and KSI, which goes in the SDR, and an overall summary of results, failures and disputes, which goes in the overview.
- Assessors no longer recommend for or against certification. FedRAMP decides, and returns its own Certification Report.
- Automated validation of KSIs: Class A may, Class B should have at least 1 automated method per KSI, Class C must have at least 2.

## Ongoing certification

- **Ongoing Certification Report** every 3 months to FedRAMP and every agency customer.
- **Quarterly Review** meeting 3 to 10 business days after each report (required for Class C and D).
- **Vulnerability activity report** at least monthly. Timeframes key on class, the Potential Agency Impact N-rating (N0 to N5), likely exploitability and internet reachability. Work through it with `/fedramp-20x:vdr-assess` and build the reports with `/fedramp-20x:ver-report`.
- **Significant changes** are notified, not approved in advance.
- **Incidents** that affect federal customer data are reported to `fedramp_security@fedramp.gov` and affected agencies on class-based clocks.

## Commands in this plugin

| Command | Use |
|---|---|
| `/fedramp-20x:ksi-check` | Walk the KSIs for a class and record how each is met |
| `/fedramp-20x:mas-review` | Review the Minimum Assessment Scope |
| `/fedramp-20x:vdr-assess` | Review vulnerability detection, evaluation and reporting |
| `/fedramp-20x:sdr` | Build, check and summarise a Security Decision Record |
| `/fedramp-20x:ver-report` | Build the monthly vulnerability reports |
| `/fedramp-20x:sync-rules` | Check for and download FedRAMP's latest rules |

## How to answer

- Say which rules release you are describing.
- Use the current terms. If the user says "authorization", "Moderate", "3PAO" or "POA&M", answer in the current terms and give the old one once so they can follow.
- Keep the two meanings of "authorize" apart: FedRAMP certifies; an agency authorizes its own use.
- If the user is on Rev5, say what still applies (their control baseline) and what has changed for them anyway (the shared rulesets, the SDR, no templates, the June 2027 cut-off).
- Things FedRAMP has not settled, which you must not state as fact: the 20x Class D rules, Phase 4 dates, and the transition path from Rev5 to 20x.
- Primary sources: <https://www.fedramp.gov/2026/> for the rules in prose, <https://github.com/FedRAMP/rules> for the dataset, <https://www.fedramp.gov/schemas/> for the JSON schemas, <https://www.fedramp.gov/notices/> for dated announcements. The pages under `fedramp.gov/legacy` are reference-only.
