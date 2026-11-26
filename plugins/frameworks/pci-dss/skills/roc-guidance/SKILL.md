---
name: roc-guidance
description: ROC (Report on Compliance) template guidance
---

# ROC Guidance

Provides guidance for completing the PCI DSS Report on Compliance.

## Arguments

- Argument 1 - ROC section or requirement number (optional)
- Argument 2 - Topic (optional: testing, evidence, findings)

## ROC Template Sections

1. **Contact Information** - Assessor and entity details
2. **Executive Summary** - Assessment scope and results
3. **Scope of Assessment** - CDE, connected systems, segmentation
4. **Detailed PCI DSS Requirements** - Req 1-12 + Appendices
5. **Appendix A** - Additional requirements (A1, A2, A3)
6. **Appendix B** - Compensating Controls Worksheet
7. **Appendix C** - Customized Approach

## Key ROC Elements

### For Each Requirement

- Requirement description
- Testing procedures performed
- In-place / Not in-place / N/A status
- Evidence reviewed
- Findings and observations
- Compensating controls (if applicable)

### Testing Methods

- **Interview** - Personnel discussions
- **Examine** - Document/configuration review
- **Observe** - Process observation

## Example

```bash
/pci-dss:roc-guidance 3 testing
/pci-dss:roc-guidance "executive summary"
```
