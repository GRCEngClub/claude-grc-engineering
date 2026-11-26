---
description: Build a FINRA cybersecurity evidence checklist organized by FINRA's 12 cybersecurity principles
---

# FINRA Cybersecurity Evidence Checklist

Builds an evidence list for a FINRA or SEC cybersecurity exam. Items are grouped by the 12 principles in FINRA's Cybersecurity Effective Practices (August 2026), and each item names the rule it supports.

> **Never commit evidence to source control.** Exam evidence includes customer information, account data, and incident records that Reg S-P protects. Keep it in an access-controlled evidence store, and follow the firm's books-and-records retention.

## Usage

```bash
/us-finra:evidence-checklist [<principle>|all] [--export <markdown|csv|json>]
```

## Arguments

- `<principle>`: one of the 12 principle names or numbers (for example `incident-response` or `11`). Defaults to `all`.
- `--export`: output format. Defaults to `markdown`.

## Evidence by principle

### 1. Governance

- Written cybersecurity policies approved by senior management, with review dates.
- Written supervisory procedures that assign cybersecurity responsibilities (Rule 3110).
- Records of reports to senior management or the board on cyber risk.

### 2. Risk Management

- A current cyber risk assessment covering customer information and critical systems.
- The risk register, with owners and treatment decisions.

### 3. Third-Party Risk Management

- An inventory of service providers that receive, maintain, process, or access customer information.
- Due diligence and monitoring records for each provider (Reg S-P service-provider oversight).
- Evidence that each provider will notify the firm within 72 hours of a breach affecting customer information. This can be contract terms or documented procedures.
- Any written agreement that delegates customer notification to a provider. The firm still owns the obligation to notify.

### 4. Asset Management

- Hardware, software, and data inventories, including where customer information lives.
- End-of-life tracking for systems that hold customer data.

### 5. Access Control and Identity Management

- An MFA configuration export for staff access to systems with customer information, and for customer-facing accounts.
- Records of access reviews and terminations.
- Privileged account inventory and review records.
- The Reg S-ID identity theft prevention program, its red flags, and its last update, if the firm has covered accounts.

### 6. Data Protection

- Encryption settings for customer information at rest and in transit.
- Data retention and disposal procedures and records (Reg S-P disposal rule).
- Electronic records configuration, showing WORM storage or the audit-trail alternative (Rule 17a-4).

### 7. Security Awareness and Training

- Training content and completion records, including phishing and social-engineering topics.
- Phishing simulation results and follow-up.

### 8. Vulnerability and Patch Management

- Vulnerability scan reports and remediation tracking.
- Patch timelines for systems that hold customer information.

### 9. Security Monitoring

- Log sources and alerting rules for account takeover, imposter domains, and outbound email.
- Proof that security logs relied on for Reg S-P are kept at least three years (Rule 17a-4(e)(14)(ii)).

### 10. Threat Intelligence and Information Sharing

- Threat feeds or information-sharing memberships, and how alerts are acted on.

### 11. Incident Response and Reporting

- The written Reg S-P incident response program: detect, respond to, and recover from unauthorized access to or use of customer information.
- Customer-notification procedures: notice as soon as practicable and no later than 30 days after becoming aware of an incident involving sensitive customer information.
- Records for each incident:
  - the assessment of whether notice was required;
  - the notices sent;
  - any delay the firm relied on.
- Tabletop exercise reports and lessons learned.
- Any regulatory reports the incident triggered, as advised by compliance counsel.

### 12. Resilience and Recovery

- The business continuity plan, with cyber scenarios such as ransomware (Rule 4370).
- Backup test results, recovery objectives, and the last recovery exercise.
- The emergency contact information on file with FINRA (Rule 4370).

## Output

One checklist row per evidence item with these fields:

- principle;
- item;
- rule supported;
- owner;
- location;
- collected (yes or no);
- date.

Items with no rule citation come from FINRA's effective practices, which are guidance. Examiners still ask for them.

## Automating collection

Pair this checklist with connectors to pull technical evidence (MFA, logging, encryption, access reviews):

```bash
/us-finra:assess --sources=aws-inspector,okta-inspector,github-inspector
```
