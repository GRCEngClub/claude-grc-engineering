---
description: Map controls to SOC 2 Trust Service Criteria
---

# Map SOC 2 Controls

Maps existing controls or implementations to SOC 2 Trust Service Criteria.

## Arguments

- Argument 1 - Control document or IaC file (required)
- Argument 2 - Trust Service Category (optional, defaults to all)

## Control Categories

### Common Criteria (CC)

- CC1: Control Environment
- CC2: Communication and Information
- CC3: Risk Assessment
- CC4: Monitoring Activities
- CC5: Control Activities
- CC6: Logical and Physical Access
- CC7: System Operations
- CC8: Change Management
- CC9: Risk Mitigation

## Output

- Control-to-criteria mapping matrix
- Coverage analysis
- Gap identification
- Evidence mapping

## Example

```bash
/soc2:map-controls ./policies/access-control.md CC6
```
