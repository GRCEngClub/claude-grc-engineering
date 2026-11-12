---
name: GCP Secret Runtime Injection
description: Describe operator-only injection into a trusted local process.
---

# /gcp-secret-metadata:run

Do not run this helper from an agent or request a secret value. An authorized
operator may run it in a trusted terminal, after authenticating the Google Cloud
CLI using their approved identity or workload identity. The principal needs
`secretmanager.versions.access` on the selected secret; IAM conditions and
workload identity are enforced by GCP, not evaluated by this helper.

```bash
node /path/to/gcp-secret-metadata/scripts/run.js PROJECT_ID SECRET_ID latest GCP_SECRET_VALUE -- /path/to/trusted-command
```

Replace `latest` with a positive version number to pin it. The project is always
explicit, and only global secrets are supported. The helper resolves one UTF-8,
non-NUL payload into `GCP_SECRET_VALUE`, then runs the specified
program without a shell. Provider and child output are suppressed, stdin is
closed, and only generic errors are shown. The variable name is fixed to avoid
injecting into runtime or loader control variables. Provider calls time out after
15 seconds; the trusted command itself has no timeout. Empty and binary values are unsupported.
No value is written by the helper to files or command arguments. Only use a
trusted program: it can log, persist, or transmit secrets. Inherited environment
variables are also passed to it. Other privileged processes can inspect process
environment or memory; the helper cannot erase all copies from memory. The
operator is responsible for safe evidence output, permissions, and host security.

This is a manual runtime helper, not automatic integration with gcp-inspector or
Terraform scanning. It does not collect rotation or version history. Neither
secret names nor references should be included in evidence without authorization.
See [gcloud versions access](https://cloud.google.com/sdk/gcloud/reference/secrets/versions/access).
