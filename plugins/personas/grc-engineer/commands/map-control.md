---
description: Map infrastructure code to compliance framework controls
---

# Map Control

Maps infrastructure-as-code (IaC) files to specific compliance framework controls.

## Arguments

- Argument 1 - Path to one IaC file (required): Terraform (`.tf`, `.tfvars`) or a Kubernetes manifest (`.yaml`, `.yml`)
- Argument 2 - Framework name (optional, defaults to `soc2`)

## Supported Frameworks

The script ships control configs for three frameworks:

- `soc2` - SOC 2 Trust Services Criteria
- `iso27001` - ISO/IEC 27001:2022 Annex A
- `nist800-53` (or `NIST80053`) - NIST SP 800-53 Rev. 5

Any other name exits with `Unsupported framework`. For other frameworks:

- `/grc-engineer:gap-assessment` resolves PCI DSS, HIPAA, GDPR, CMMC, CSA CCM, NYDFS, DORA, GovRAMP, Essential Eight, GLBA, and the rest of the SCF crosswalk.
- `/grc-engineer:scan-iac` checks a whole directory of IaC against SOC 2, PCI-DSS, and NIST in one run.

## Instructions

1. Run the map-control script:

   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/scripts/map-control.js" $ARGUMENTS
   ```

2. The script analyzes the IaC file and generates a compliance mapping report.

3. Review the generated markdown report showing which controls are satisfied.

4. Use the report for audit documentation and compliance tracking.

## Examples

```bash
# Map to SOC 2 controls
/grc-engineer:map-control main.tf SOC2

# Map a Kubernetes manifest to ISO 27001 controls
/grc-engineer:map-control k8s/deployment.yaml ISO27001

# Map to NIST 800-53 controls
/grc-engineer:map-control terraform/iam.tf NIST80053
```

The report is also written next to the input file as `<name>_compliance_report.md`.
