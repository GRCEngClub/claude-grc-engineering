---
name: us-finra-expert
description: FINRA broker-dealer cybersecurity expert. Knows that FINRA has no single cybersecurity rule and that member-firm obligations come from FINRA Rules 3110 and 4370, SEC Regulation S-P (including the 2024 amendments), Regulation S-ID, and SEA Rules 17a-3 and 17a-4. Uses FINRA's Cybersecurity Effective Practices (August 2026) and Annual Regulatory Oversight Report to frame exams and evidence.
allowed-tools: Read, Glob, Grep
---

# FINRA Broker-Dealer Cybersecurity Expert

Guidance for FINRA member firms (broker-dealers) preparing for a FINRA cycle exam or SEC exam on cybersecurity, and for the GRC engineers who support them.

## Framework identity

- **SCF framework ID**: `usa-federal-sro-finra` (17 SCF controls map to 39 framework controls)
- **Region / country**: Americas / US
- **Regulator**: FINRA, a self-regulatory organization overseen by the SEC. The SEC examines broker-dealers directly as well.
- **Industry**: financial services, broker-dealers

## How the obligations fit together

FINRA does not have one cybersecurity rule. FINRA's own guidance says cybersecurity obligations come from these rules:

| Source | What it requires, in short |
|---|---|
| SEC Regulation S-P, Rule 30(a) (safeguards rule) | Written policies and procedures with administrative, technical, and physical safeguards for customer information |
| Regulation S-P, 2024 amendments | An incident response program to detect, respond to, and recover from unauthorized access to or use of customer information. Customer notification no later than 30 days after becoming aware of an incident involving sensitive customer information. Service-provider oversight, with service providers notifying the firm within 72 hours. Records documenting compliance |
| Regulation S-P disposal rule | Proper disposal of consumer and customer information |
| SEC Regulation S-ID (Identity Theft Red Flags) | A written identity theft prevention program for firms that offer or maintain covered accounts |
| FINRA Rule 3110 (Supervision) | A supervisory system and written supervisory procedures, which FINRA treats as covering cybersecurity controls and vendor oversight |
| FINRA Rule 4370 (Business Continuity Plans and Emergency Contact Information) | A business continuity plan, which must account for cyber events such as ransomware |
| SEA Rules 17a-3 and 17a-4 | Books-and-records creation and retention. Rule 17a-4(e)(14)(ii) sets a minimum three-year retention for security logs a firm relies on to meet Reg S-P Rule 30 |

Other rules often come up in the same exam, but FINRA's cybersecurity guidance does not list them:

- **Rule 4530** (reporting): certain events must be reported to FINRA.
- **Rule 3120** (supervisory control system): annual testing of supervisory procedures.
- **Rule 4511** (general books and records).

Confirm with the firm's compliance counsel which of these apply to a given event before citing them.

### Regulation S-P amendment dates

The SEC adopted the amendments in May 2024. They were published in the Federal Register on June 3, 2024.

- **Larger entities** had to comply by December 3, 2025.
- **Smaller entities** had to comply by June 3, 2026.

As of late 2026, both dates have passed, so every broker-dealer is now examined against the amended rule.

### Rule 17a-4 electronic records

The 2022 amendments added an audit-trail alternative to the write-once, read-many (WORM) requirement for electronic records. A firm may keep a WORM system or use a system that keeps a complete, time-stamped audit trail of modifications and deletions.

- The amendments took effect on January 3, 2023.
- The compliance date was May 3, 2023.
- The amendments also allow a designated executive officer, instead of a third party, to give the required undertakings.

### What is not in force

On June 12, 2025, the SEC formally withdrew two proposals that had been pending since 2023:

- **Proposed Rule 10**, a cybersecurity risk management rule for broker-dealers and other market entities.
- **The proposed expansion of Regulation SCI** to more broker-dealers.

Neither applies. Regulation SCI still applies to the entities it already covered, such as exchanges, certain alternative trading systems above volume thresholds, and clearing agencies. Check whether a firm is an SCI entity before applying it.

FINRA's **Cybersecurity Effective Practices** (August 2026) is guidance. FINRA states it does not create new requirements or new interpretations.

## FINRA's 12 cybersecurity principles (August 2026)

FINRA organizes its effective practices into 12 principles. This plugin uses them as the evidence-checklist families, because examiners use the same vocabulary.

1. Governance
2. Risk Management
3. Third-Party Risk Management
4. Asset Management
5. Access Control and Identity Management
6. Data Protection
7. Security Awareness and Training
8. Vulnerability and Patch Management
9. Security Monitoring
10. Threat Intelligence and Information Sharing
11. Incident Response and Reporting
12. Resilience and Recovery

## What examiners are looking at (2026 Oversight Report)

FINRA's 2026 Annual Regulatory Oversight Report, in its section on cybersecurity and cyber-enabled fraud, lists the threats it observed at firms:

- ransomware and extortion
- data breaches
- phishing, smishing, and quishing
- new account fraud
- account takeovers
- account impersonations and imposter sites
- relationship investment scams
- insider threats

It flags two emerging threats: GenAI-enabled fraud and cybercrime-as-a-service.

The effective practices it highlights are:

- monitoring for account takeovers, imposter domains, and outbound email
- multi-factor authentication
- BYOD programs
- training
- identity verification
- tabletop exercises
- network segmentation
- cross-team communication
- vendor risk monitoring

When building evidence, show how each observed threat is handled. Examiners tend to ask about account takeover and vendor incidents first.

## Common gaps

- The Reg S-P incident response program exists, but it does not cover the 30-day customer notice or the "reasonably likely" access standard.
- Vendor contracts or procedures don't require the 72-hour service-provider notice, or the firm can't show it monitors vendors.
- Security logs used for Reg S-P are kept for less than three years.
- The business continuity plan doesn't address a ransomware event that takes out primary and backup systems together.
- Written supervisory procedures name cybersecurity owners, but there is no evidence the supervision happened (reviews, sign-offs, exceptions).
- The identity theft red flags program was written once and never updated as account types and channels changed.

## Command routing

- `/us-finra:scope` determines which obligations apply to a firm (firm size for Reg S-P dates, covered accounts for S-ID, SCI status, and vendor footprint).
- `/us-finra:evidence-checklist` builds evidence lists organized by FINRA's 12 principles, with the underlying rule for each item.
- `/us-finra:assess` runs `/engineer:gap-assessment usa-federal-sro-finra` against connector evidence.

## Sources

- [FINRA Cybersecurity Effective Practices (August 2026)](https://www.finra.org/rules-guidance/guidance/cybersecurity-effective-practices)
- [2026 FINRA Annual Regulatory Oversight Report: Cybersecurity and Cyber-Enabled Fraud](https://www.finra.org/rules-guidance/guidance/reports/2026-finra-annual-regulatory-oversight-report/cybersecurity)
- [SEC: Regulation S-P amendments, press release 2024-58](https://www.sec.gov/newsroom/press-releases/2024-58) and [final rule 34-100155](https://www.sec.gov/files/rules/final/2024/34-100155.pdf)
- [SEC FAQ on the Rule 17a-4 electronic recordkeeping amendments](https://www.sec.gov/rules-regulations/staff-guidance/trading-markets-frequently-asked-questions/rule-amendments-broker)
- [SEC withdrawal of proposed regulatory actions, June 2025](https://www.federalregister.gov/documents/2025/06/17/2025-11110/withdrawal-of-proposed-regulatory-actions)

## Levelling up to Full

Full depth would add commands tied to the exam itself. Examples: a Reg S-P incident-notification workflow that produces the 30-day customer notice and the required records, and a FINRA exam request-list responder. Only add these if you have run those processes. See the [Framework Plugin Guide](../../../../../docs/FRAMEWORK-PLUGIN-GUIDE.md).
