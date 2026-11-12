---
name: Vault KV Runtime Injection
description: Explain operator-only injection into a trusted local process.
---

# /vault-kv:run

Do not run this helper from an agent, ask for secret values, or capture provider or
child output. An authorized operator can run it in a trusted terminal after
configuring `VAULT_ADDR`, TLS verification, and authenticating the Vault CLI
using the organization's approved method. Install a trusted Vault CLI on `PATH`.
The CLI supports token-based authentication and previously authenticated AppRole
sessions; this helper does not perform login or accept credentials in arguments.

```bash
node /path/to/vault-kv/scripts/run.js secret evidence/service api_key -- /path/to/trusted-command
```

This invokes `vault kv get -mount=secret -field=api_key evidence/service` and
injects the result only as `VAULT_KV_VALUE` into the child. Mount and secret path
are separate; both KV v1 and v2 are supported by the CLI. The field must be a
nonempty UTF-8 string without NUL; no trimming or newline is added. Unsupported
values and provider errors fail closed. Provider and child output are suppressed,
stdin is closed, and no shell is used. Provider calls time out after 15 seconds;
the trusted command has no timeout. Exit 0 means the child succeeded, 1 means
provider/payload/child failure, and 2 means invalid usage. Errors are generic.

Grant the identity `read` only on the selected data path, e.g. `secret/evidence/service`
for KV v1 or `secret/data/evidence/service` for KV v2. CLI mount discovery may
need access depending on deployment; consult Vault's policy guidance rather than
granting broad privileges. Secret paths and field names are arguments and may
appear in process listings and Vault audit logs; do not put secret values in them.
Vault audit configuration governs what is recorded server-side.

Only use a trusted command: it can persist, transmit or log the value even though
its stdout and stderr are suppressed. `VAULT_TOKEN` is removed from the child
environment, but other inherited environment variables and Vault CLI token-helper
files may still allow access. Local privileged processes may inspect memory or
environments. The helper cannot erase all in-memory copies. Never place secrets in
evidence, chat, shell history, or command arguments; the operator must secure the
host and any child-generated files. Restrict access to those artifacts.

This is a manual runtime helper, not automatic integration with evidence collection
or IaC scans. It does not generate dynamic credentials, write to Vault, manage
leases, authenticate AppRole, or emit findings. Those remain future scope; do not
assume a read operation always has no side effects for non-KV engines.

Sources: [Vault KV get](https://developer.hashicorp.com/vault/docs/commands/kv/get),
[Vault policies](https://developer.hashicorp.com/vault/docs/concepts/policies),
[Vault CLI](https://developer.hashicorp.com/vault/docs/commands).
Offline tests use a mock `vault` executable; no live Vault compatibility or
account permissions have been verified.
