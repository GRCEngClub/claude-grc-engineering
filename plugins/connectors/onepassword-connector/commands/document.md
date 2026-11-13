---
name: 1Password Document to Trusted Command
description: Explain operator-only document retrieval into a trusted command without displaying document contents.
---

# /onepassword-connector:document

Do not run this from Claude or any agent tool. Give instructions to the operator;
never request or read document contents, credentials, or service-account tokens.
In a trusted terminal, install 1Password CLI v2 and authenticate beforehand with
its desktop integration or a narrowly scoped service account. The helper has no
interactive stdin; biometric approval may require a graphical session.

Use the 26-character vault and Document item IDs, not their names:

```bash
node /path/to/onepassword-connector/scripts/document.js VAULT_ID DOCUMENT_ID -- /path/to/trusted-consumer --configured-option
```

The helper retrieves one [Document item](https://1password.dev/cli/reference/management-commands/document)
into memory (maximum 10 MiB) and passes its exact bytes to the trusted consumer's
standard input, with no shell interpretation. It suppresses provider and consumer
output. Exit 0 means success, 1 means retrieval or consumer failure, and 2 means
invalid invocation. The consumer is not started after a failed or oversized
retrieval. No live-provider authentication behavior has been verified here.

This is not a sandbox: the consumer can write, log, or transmit document contents.
It inherits environment variables other than `OP_`-prefixed variables; credentials
stored under other names may still reach it. Provider configuration and inherited
loader variables can affect the processes. Memory or swap may be accessible to
privileged local users. Protect the host, avoid secrets in arguments and logs, and
choose the executable and its arguments yourself. The helper does not create a
sanitized finding, discover metadata, or integrate automatically with evidence
collection. Files attached to other item types are not supported.
