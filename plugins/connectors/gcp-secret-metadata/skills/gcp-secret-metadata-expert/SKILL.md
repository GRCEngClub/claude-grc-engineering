---
name: gcp-secret-metadata-expert
description: Inventory GCP Secret Manager global secret names without reading payloads.
---

# GCP Secret Metadata Expert

Ask for explicit authorization and a project ID before inventory. Follow the
`/gcp-secret-metadata:list` command. Treat names as sensitive. Never request,
access or print secret values in an agent session. With explicit authorization,
`/gcp-secret-metadata:history` reads one secret's version states and schedule;
neither command establishes IAM policy, rotation effectiveness, or compliance. For
runtime injection, provide the operator-only instructions in
`/gcp-secret-metadata:run`; never execute that helper in an agent session.
