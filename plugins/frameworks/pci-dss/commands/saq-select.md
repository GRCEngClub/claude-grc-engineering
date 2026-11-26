---
description: Help select the appropriate SAQ type
---

# SAQ Selection

Helps determine the appropriate Self-Assessment Questionnaire type.

## Arguments

- Argument 1 - Business description or SAQ type (optional)

## SAQ Types

| SAQ | For | Questions |
|-----|-----|-----------|
| **A** | Card-not-present, fully outsourced payment | ~20 |
| **A-EP** | E-commerce with website affecting security | ~140 |
| **B** | Imprint or standalone dial-out terminals | ~40 |
| **B-IP** | Standalone IP-connected PTS POI terminals | ~80 |
| **C** | Payment app connected to internet | ~150 |
| **C-VT** | Web-based virtual terminal, no storage | ~80 |
| **D-Merchant** | All other merchants | ~300+ |
| **D-SP** | Service providers | ~300+ |
| **P2PE** | Hardware terminals in validated P2PE solution | ~30 |

## Selection Criteria

### SAQ A Eligibility

- Card-not-present only (e-commerce, mail, phone)
- All payment processing outsourced
- No electronic cardholder data storage
- Website hosted entirely by PCI DSS compliant provider

### SAQ A-EP Eligibility

- E-commerce only
- Website affects payment security (redirects, iframes)
- All payment processing outsourced
- No electronic cardholder data storage

### SAQ B Eligibility

- Imprint-only machines, OR
- Standalone dial-out terminals (no IP)
- No electronic cardholder data storage

### SAQ C Eligibility

- Payment application connected to internet
- No electronic cardholder data storage
- Standalone terminal or PC-based

## Example

```bash
/pci-dss:saq-select "e-commerce with Stripe"
/pci-dss:saq-select A-EP
```
