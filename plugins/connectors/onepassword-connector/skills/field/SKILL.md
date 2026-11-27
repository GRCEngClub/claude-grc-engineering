---
name: field
description: Explain operator-only retrieval of one item field into a trusted command's standard input without displaying the value.
---

# /onepassword-connector:field

Do not run this from Claude or any agent tool. Give instructions to the operator;
never request or read field values, credentials, or service-account tokens.
In a trusted terminal, install 1Password CLI v2 and authenticate beforehand with
its desktop integration or a narrowly scoped service account. The helper has no
interactive stdin; biometric approval may require a graphical session.

Pass one [secret reference](https://developer.1password.com/docs/cli/secret-reference-syntax/)
built from the 26-character vault and item IDs, an optional section label and a
field label:

```bash
node /path/to/onepassword-connector/scripts/field.js "op://VAULT_ID/ITEM_ID/FIELD" -- /path/to/trusted-consumer --configured-option
node /path/to/onepassword-connector/scripts/field.js "op://VAULT_ID/ITEM_ID/SECTION/FIELD" -- /path/to/trusted-consumer
```

Vault and item names are rejected; use their IDs. Section and field labels may
contain letters, digits, spaces, `_`, `.` and `-`, and must start with a letter,
digit or `_`. Query parameters such as `?attribute=otp` are not accepted.

The helper reads the field with `op read --no-newline` into memory (maximum
1 MiB) and passes its exact bytes to the trusted consumer's standard input, with
no shell interpretation. It suppresses provider and consumer output. Exit 0 means
success, 1 means retrieval or consumer failure, and 2 means invalid invocation.
The consumer is not started after a failed or oversized retrieval. No
live-provider authentication behavior has been verified here. The provider has a
2-minute deadline and the consumer a 5-minute deadline; the direct process is
forcibly terminated on timeout. Descendants are not contained and can outlive
the helper or keep inherited pipes open, delaying its return.

This is not a sandbox: the consumer can write, log, or transmit the value. It
inherits environment variables other than `OP_`-prefixed variables; credentials
stored under other names may still reach it. Provider configuration and inherited
loader variables can affect the processes. Memory or swap may be accessible to
privileged local users. Protect the host, avoid secrets in arguments and logs, and
choose the executable and its arguments yourself. The helper does not create a
sanitized finding, discover metadata, or integrate automatically with evidence
collection. To pass a value as an environment variable instead, see
`/onepassword-connector:run`; for Document items, see `/onepassword-connector:document`.
