---
name: vdr-assess
description: Assess Vulnerability Detection and Response capabilities
---

# VDR Assessment

Evaluates Vulnerability Detection and Response capabilities per FedRAMP 20X.

## Arguments

- Argument 1 - Assessment scope (optional: scanning, response, reporting)
- Argument 2 - Evidence path (optional)

## VDR Requirements

### Detection

- Continuous vulnerability scanning
- Coverage of all system components
- Authenticated and unauthenticated scans
- Container and cloud-native scanning

### Response

- Defined remediation timelines
- Patching automation
- Risk-based prioritization
- Exception handling process

### Reporting

- Automated reporting to FedRAMP
- Machine-readable vulnerability data
- Trend analysis and metrics
- SLA compliance tracking

## Assessment Output

- Scanning coverage analysis
- Response time metrics
- Automation maturity score
- Gap identification
- Tool recommendations

## Example

```bash
/fedramp-20x:vdr-assess scanning
/fedramp-20x:vdr-assess response ./vuln-data/
```
