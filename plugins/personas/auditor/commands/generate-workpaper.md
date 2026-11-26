---
description: Generate audit workpaper documentation
---

# Generate Workpaper

Creates structured audit workpaper documentation for findings and testing.

## Arguments

- Argument 1 - Workpaper type (required: finding, test, summary)
- Argument 2 - Control or area (required)

## Workpaper Types

- **finding** - Document an audit finding with condition, criteria, cause, effect
- **test** - Document control testing procedures and results
- **summary** - Generate executive summary of audit area

## Instructions

1. Gather relevant information about the control/area
2. Structure the workpaper per professional standards
3. Include all required elements:
   - Objective
   - Scope
   - Procedures
   - Results
   - Conclusions
   - Preparer/Reviewer signoff blocks

## Examples

```bash
# Generate finding workpaper
/auditor:generate-workpaper finding "Access Control Deficiency"

# Generate PCI-DSS control test workpaper
/auditor:generate-workpaper test "PCI-DSS Requirement 8.4.2 - MFA Implementation"

# Generate SOC 2 summary workpaper
/auditor:generate-workpaper summary "CC6 - Logical and Physical Access Controls"
```
