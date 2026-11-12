---
description: Run experimental security control checks
---

# Test Control

Run experimental checks for `access_control_account_management` on AWS. The checks are not a complete control assessment and must not be used as proof of framework compliance. Other controls and providers are not implemented.

```bash
node plugins/grc-engineer/scripts/test-control.js access_control_account_management aws --output=json
```

The provider defaults to `aws`. JSON is written to stdout and progress and errors to stderr. A nonzero exit indicates a failure, warning, error, or unimplemented check. An `INDETERMINATE` status means the control or framework could not be assessed; it is not a finding of compliance or noncompliance. Unimplemented checks report `NOT_IMPLEMENTED` and do not produce evidence. The tool does not collect an evidence package or automatically remediate findings.

The existing AWS checks inspect limited configuration indicators, not complete control effectiveness. Review their scope and independently validate any observations before relying on them.
