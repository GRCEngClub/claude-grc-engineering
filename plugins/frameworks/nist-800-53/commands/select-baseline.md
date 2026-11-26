---
description: Select and customize NIST 800-53 baseline
---

# Select NIST Baseline

Helps select and tailor a NIST 800-53 baseline for your system.

## Arguments

- Argument 1 - Impact level (required: low, moderate, high)
- Argument 2 - System type (optional: general, cloud, mobile, industrial)

## Baselines

### Low Impact

- ~125 controls
- Basic security requirements
- Suitable for non-sensitive systems

### Moderate Impact

- ~325 controls
- Enhanced security requirements
- Most common for federal systems

### High Impact

- ~425 controls
- Maximum security requirements
- National security systems

## Tailoring Options

- **Scoping**: Remove non-applicable controls
- **Compensating**: Substitute equivalent controls
- **Organization-defined**: Set parameters
- **Overlays**: Apply specific requirements (privacy, cloud)

## Example

```bash
/nist:select-baseline moderate cloud
```
