---
description: New mandatory requirements effective March 31, 2025
---

# March 2025 Mandatory Requirements

Requirements that became mandatory on March 31, 2025 (previously "future-dated").

## Arguments

- Argument 1 - Requirement number or category (optional)

## Critical March 2025 Requirements

### Requirement 3: Protect Stored Account Data

| Req | Description |
|-----|-------------|
| 3.3.3 | SAD stored prior to authorization is encrypted |
| 3.4.2 | Technical controls prevent copy/relocation of PAN |
| 3.5.1.1 | Keyed cryptographic hashes if used for PAN storage |
| 3.5.1.2 | Disk-level encryption only for removable media |

### Requirement 5: Malware Protection

| Req | Description |
|-----|-------------|
| 5.3.3 | Anti-malware for removable media |
| 5.4.1 | Mechanisms detect phishing attacks |

### Requirement 6: Secure Development

| Req | Description |
|-----|-------------|
| 6.4.2 | WAF for public-facing web apps |
| 6.4.3 | Payment page scripts inventoried and managed |

### Requirement 7 & 8: Access Control

| Req | Description |
|-----|-------------|
| 7.2.5 | Application/system account access reviewed |
| 7.2.5.1 | Access reviews include all access types |
| 8.4.2 | MFA for all access into CDE |
| 8.5.1 | MFA systems secured against replay |
| 8.6.1 | Interactive login for app/system accounts managed |
| 8.6.2 | Passwords/passphrases for interactive use not hardcoded |
| 8.6.3 | Passwords for app/system accounts meet complexity |

### Requirement 10: Logging

| Req | Description |
|-----|-------------|
| 10.4.1.1 | Automated audit log review mechanisms |
| 10.4.2.1 | Targeted risk analysis for log review frequency |
| 10.7.2 | Failures of security controls detected and reported |
| 10.7.3 | Failures responded to promptly |

### Requirement 11: Security Testing

| Req | Description |
|-----|-------------|
| 11.3.1.1 | Internal vulnerability scans via authenticated scanning |
| 11.3.1.2 | Internal scans performed after significant changes |
| 11.4.7 | Multi-tenant service providers support pen testing |
| 11.5.1.1 | IDS/IPS detect covert malware channels |
| 11.6.1 | Change/tamper detection on payment pages |

### Requirement 12: Policies

| Req | Description |
|-----|-------------|
| 12.3.1 | Targeted risk analysis for each flexible requirement |
| 12.3.2 | Targeted risk analyses documented and reviewed |

## Priority Actions

1. **Payment page security** (6.4.3, 11.6.1) - Script inventory, change detection
2. **MFA everywhere** (8.4.2, 8.5.1) - CDE access requires MFA
3. **Automated log review** (10.4.1.1) - Manual review no longer sufficient
4. **Authenticated scanning** (11.3.1.1) - Better vulnerability detection

## Example

```bash
/pci-dss:march-2025
/pci-dss:march-2025 8
/pci-dss:march-2025 "payment page"
```
