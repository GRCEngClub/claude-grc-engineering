---
description: Review Minimum Assessment Scope requirements
---

# MAS Review

Reviews compliance with FedRAMP 20X Minimum Assessment Scope.

## Arguments

- Argument 1 - System boundary description or file (required)
- Argument 2 - Service model (optional: saas, paas, iaas)

## MAS Components

### Boundary Definition

- All components within authorization boundary
- Data flows in and out of boundary
- Interconnections with external systems
- Shared responsibility delineation

### Required Coverage

- All production environments
- Development/staging if data flows exist
- Management plane and control plane
- Third-party integrations

### Continuous Scope

- New components added automatically
- Decommissioned components tracked
- Scope changes reported promptly
- Dynamic inventory maintained

## Assessment Output

- Boundary completeness check
- Coverage gap analysis
- Scope change recommendations
- Automation requirements

## Example

```bash
/fedramp-20x:mas-review ./system-boundary.md saas
```
