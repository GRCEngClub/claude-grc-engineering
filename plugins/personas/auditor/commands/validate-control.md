---
description: Validate control implementation against framework requirements
---

# Validate Control

Tests and validates that a control is properly implemented and effective.

## Arguments

- Argument 1 - Control ID (required, e.g., CC6.1, A.5.15, AC-2)
- Argument 2 - Framework (optional, defaults to auto-detect)

## Instructions

1. Identify the control requirements from the framework
2. Design test procedures to validate the control
3. Execute or guide testing activities
4. Document findings with:
   - Control objective
   - Test procedures performed
   - Results (Pass/Fail/Partial)
   - Evidence references
   - Exceptions noted

## Examples

```bash
# SOC 2 control validation
/auditor:validate-control CC6.1 SOC2

# PCI-DSS requirement validation
/auditor:validate-control 8.4.2 PCIDSS

# ISO 27001 control validation
/auditor:validate-control A.5.15 ISO27001

# NIST 800-53 control validation (auto-detect)
/auditor:validate-control AC-2
```
