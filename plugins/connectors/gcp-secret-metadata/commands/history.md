---
name: GCP Secret Metadata History
description: Read metadata, version states and rotation schedule for one global secret.
---

# /gcp-secret-metadata:history

Obtain explicit authorization for this project and secret, including approval to
share sensitive identifiers and metadata with the agent. Do not request or
handle secret values. Authenticate gcloud outside the agent. The principal needs
`secretmanager.secrets.get` and `secretmanager.versions.list`; payload access is
not needed. Specify the project explicitly to prevent accidental cross-project
collection.

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/history.js PROJECT_ID SECRET_ID
```

The script retrieves the secret metadata and all version pages for that single
global secret. It outputs resource names, available creation/expiration and
version destruction timestamps, version states, and the rotation schedule, if
present. Labels, annotations, provider diagnostics and other fields are omitted.
It does not access payloads, retrieve IAM policies or evaluate controls. Failed
or malformed calls return no partial output. A missing rotation object is shown
as null, not as evidence of compliance or noncompliance. GCP rotation schedules
send notifications; they do not themselves prove a credential was rotated.
The two calls are not an atomic snapshot. Regional secrets are not supported.
Store or share this sensitive inventory only under organizational policy.

Use alongside `/gcp-inspector:collect` for the same explicitly selected project;
this is separate metadata, not a fabricated finding or automatic integration.
Terraform scans should never consume secret values or untrusted secret metadata
as configuration. No automatic Terraform integration is provided.

References: [Secret metadata](https://cloud.google.com/secret-manager/docs/reference/rest/v1/projects.secrets),
[version metadata](https://cloud.google.com/secret-manager/docs/reference/rest/v1/projects.secrets.versions),
[version list](https://cloud.google.com/sdk/gcloud/reference/secrets/versions/list).
