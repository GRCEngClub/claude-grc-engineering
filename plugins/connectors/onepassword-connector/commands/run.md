---
name: 1Password Connector Run
description: Explain how to run a trusted local command with 1Password references without exposing output to the agent.
---

# /onepassword-connector:run

Do not run this command from Claude or any agent tool. Provide the operator the
instructions below; never ask for, read, or print secret values or service tokens.
This connector is an opt-in runtime-injection helper, not an evidence collector.

Install 1Password CLI v2 and authenticate outside the agent session using the
vendor-supported desktop integration or a narrowly scoped service account. Its
vault permissions should grant access only to needed items. This helper provides
no interactive stdin, so sign in beforehand; desktop biometric approval may
require a graphical session. It does not pass tokens in command arguments.

In a trusted terminal, set references (not values), then invoke a trusted command:

```bash
export CONNECTOR_TOKEN='op://MyVault/MyItem/credential'
node /path/to/onepassword-connector/scripts/run.js -- /path/to/trusted-collector --configured-option
```

The reference is an example; use a valid field reference for your item. `op run`
resolves *all* `op://` references in the inherited environment. The helper does
not fetch fields into the agent, write secret files or findings, or forward child
stdout/stderr. Exit 0 means the child succeeded; 1 means provider or child
failure; 2 means invalid invocation or no environment reference. Diagnostics are
intentionally generic. Provider/child errors cannot be distinguished here.

Only run programs you trust: the child receives resolved secrets in its
environment and can write, log, transmit, or disclose them. Other inherited
environment variables, including service-account credentials, may also reach the
child. A local process with sufficient privileges may inspect process memory or
environment. Protect the terminal, host and CI logs; do not put secret values in
arguments, shell history, tickets, findings, or agent conversations. Arguments are
passed literally without a shell; pipes and redirects are not interpreted.
The helper cannot control files or network calls made by the selected program.
Use a secure collector that writes sanitized evidence itself. Document retrieval,
metadata discovery, finding generation, and automatic integration with
`collect-evidence` are not implemented.
