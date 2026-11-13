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
node /path/to/vault-kv/scripts/run.js 2 secret evidence/service api_key -- /path/to/trusted-command
```

Specify the actual mount version (`1` or `2`); do not guess. The helper uses it
to select the KV v1 or KV v2 JSON data shape, not to verify the mount version.
This invokes `vault kv get -format=json -mount=secret evidence/service` and
injects the selected field only as `VAULT_KV_VALUE` into the child. The entire
secret at that path is retrieved into helper memory, not just the selected field.
Mount and secret path are separate. The selected field must be a
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
[KV v1 API](https://developer.hashicorp.com/vault/api-docs/secret/kv/kv-v1),
[KV v2 API](https://developer.hashicorp.com/vault/api-docs/secret/kv/kv-v2),
[Vault policies](https://developer.hashicorp.com/vault/docs/concepts/policies),
[Vault CLI](https://developer.hashicorp.com/vault/docs/commands).
Offline tests use a mock `vault` executable; no live Vault compatibility or
account permissions have been verified.
