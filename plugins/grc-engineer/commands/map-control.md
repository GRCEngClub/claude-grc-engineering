---
description: Map infrastructure code to compliance framework controls
---

# Map Control

Maps infrastructure-as-code (IaC) files to specific compliance framework controls.

## Arguments

- `$1` - IaC file path (required)
- `$2` - Framework name (optional, defaults to SOC2)

## Supported Frameworks

- SOC2
- ISO27001
- NIST80053
- PCIDSS
- HIPAA
- GDPR
- CMMC
- HITRUST
- CIS
- CSA-CCM
- NYDFS
- DORA
- STATERAMP
- ESSENTIAL8
- GLBA

## Instructions

1. Run the map-control script:

   ```bash
   node plugins/grc-engineer/scripts/map-control.js $ARGUMENTS
   ```

2. The script analyzes the IaC file and generates a compliance mapping report.

3. Review the generated markdown report showing which controls are satisfied.

4. Use the report for audit documentation and compliance tracking.

## Examples

```bash
# Map to SOC 2 controls
/grc-engineer:map-control main.tf SOC2

# Map to PCI-DSS requirements
/grc-engineer:map-control main.tf PCIDSS

# Map to ISO 27001 controls
/grc-engineer:map-control terraform/ ISO27001

# Map to NIST 800-53 controls
/grc-engineer:map-control infrastructure/ NIST80053
```
