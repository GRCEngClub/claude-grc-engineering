---
description: Run experimental security control checks
---

# Test Control

Run experimental checks for `access_control_account_management` on AWS. The checks are not a complete control assessment and must not be used as proof of framework compliance. Other controls and providers are not implemented.

## Usage

`/grc-engineer:test-control <control-id> [cloud-provider] [--output=json]`

Use the user's arguments verbatim when invoking the script; do not substitute an example control or provider. For example, `/grc-engineer:test-control access_control_account_management aws --output=json` runs:

```bash
node plugins/grc-engineer/scripts/test-control.js access_control_account_management aws --output=json
```

For any other invocation, pass the requested control ID, optional provider, and options as separate shell-quoted arguments to the same script. Do not run the example unless the user requested those arguments.

The provider defaults to `aws`. JSON is written to stdout and progress and errors to stderr. A nonzero exit indicates a failure, warning, error, or unimplemented check. An `INDETERMINATE` status means the control or framework could not be assessed; it is not a finding of compliance or noncompliance. Unimplemented checks report `NOT_IMPLEMENTED` and do not produce evidence. The tool does not collect an evidence package or automatically remediate findings.

Summary `pass_rate` and framework `score` are fractions of assessed checks only: PASS divided by PASS + FAIL + WARNING. ERROR and NOT_IMPLEMENTED are excluded, and `assessed` gives the denominator. A score is null (shown as N/A in text) when no checks were assessed. A partial score is not an overall effectiveness or compliance determination; any unknown or error makes the relevant status INDETERMINATE.

The existing AWS checks inspect limited configuration indicators, not complete control effectiveness. Review their scope and independently validate any observations before relying on them.
