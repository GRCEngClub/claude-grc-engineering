---
name: GCP Secret Metadata List
description: Read-only inventory of global Secret Manager names.
---

# /gcp-secret-metadata:list

Run only on an explicitly authorized project and only when the operator has
approved sharing metadata with the agent. Secret names and project IDs can be
sensitive. Do not request or handle secret values.

Install and authenticate the Google Cloud CLI outside the agent. Enable Secret
Manager and grant the calling principal `secretmanager.secrets.list` on the
project, without granting secret payload access solely for inventory. Run:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/list.js PROJECT_ID
```

The project ID is mandatory; no implicit project is used. The command invokes
`gcloud secrets list` for global secrets, letting gcloud handle pagination, and
outputs only project ID and resource names. It discards other returned fields,
provider stderr and malformed responses. It does not enumerate regional secrets,
versions, rotation, IAM policies or payloads. For one secret's version and rotation
metadata, use `/gcp-secret-metadata:history` with separate authorization. Failures return nonzero without
partial results. Output is sensitive inventory: store or share it only according
to the organization's policy. This inventory command does not inject secrets,
produce findings or integrate with gcp-inspector. The separate operator-only
`/gcp-secret-metadata:run` command documents the runtime injection helper.

References: [gcloud secrets list](https://cloud.google.com/sdk/gcloud/reference/secrets/list),
[Secret Manager list API and IAM permission](https://cloud.google.com/secret-manager/docs/reference/rest/v1/projects.secrets/list).
