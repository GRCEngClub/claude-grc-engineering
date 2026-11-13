---
name: gcp-inspector-expert
description: Expertise in evaluating GCP projects for compliance — what checks are meaningful, which SCF controls they map to, and how to interpret gcloud output.
---

# gcp-inspector expert

You are the interpretation layer between raw GCP configuration data and compliance frameworks.

## Checks this connector runs (v0.1.0)

**IAM (project-scoped)**:

| SCF | Check | Severity |
|---|---|---|
| IAC-07.2 | No user accounts with primitive roles (owner/editor) | high |
| IAC-15.1 | Service-account user-managed keys < 90 days old | medium |

**Cloud Storage (per bucket)**:

| SCF | Check | Severity |
|---|---|---|
| DCH-01.2 | Public access prevention enforced | critical |
| IAC-10 | Uniform bucket-level access enabled | medium |
| CRY-05 | Encryption at rest (Google-managed is default; CMEK for regulated data) | info (pass) |
| MON-01.2 | Access logging to a log bucket | low |

**Audit logging (project)**:

| SCF | Check | Severity |
|---|---|---|
| MON-02 | At least one log sink exists | high |
| MON-02.1 | Log sink destination isn't publicly readable | high |

**KMS (per key)**:

| SCF | Check | Severity |
|---|---|---|
| CRY-09 | Rotation period ≤ 90 days (7,776,000s) on ENCRYPT_DECRYPT keys | medium |

**Compute (project)**:

| SCF | Check | Severity |
|---|---|---|
| IAC-02 | OS Login enabled at project level | medium |

## Framework mappings (auto-expanded by gap-assessment)

- **IAC-07.2 (primitive role ban)** → SOC 2 CC6.3 · NIST 800-53 AC-06(01), AC-06(02) · FedRAMP AC-06 · CIS GCP 1.4
- **IAC-15.1 (key rotation)** → NIST 800-53 IA-05(01) · PCI 8.2.4 · FedRAMP IA-05
- **DCH-01.2 (public access)** → SOC 2 CC6.7 · NIST 800-53 AC-03, SC-07 · PCI 1.3 · FedRAMP AC-03
- **CRY-09 (KMS rotation)** → NIST 800-53 SC-12(01) · PCI 3.6.4 · FedRAMP SC-12

## Interpreting output

### Primitive roles on user accounts (IAC-07.2 fail)

`roles/owner` and `roles/editor` are over-broad. A user with `roles/editor` can delete almost anything except IAM. FedRAMP auditors flag any human user with primitive roles. Service accounts are evaluated separately because automation sometimes needs broader roles (though even then, custom roles are preferred).

**Fix pattern**: custom roles or predefined roles scoped to the specific service. See the Terraform template `/grc-engineer:generate-implementation least_privilege gcp`.

### Service account key age (IAC-15.1 fail)

Google recommends keys ≤ 90 days. Even better: use Workload Identity Federation or IAM conditions to avoid long-lived keys entirely. The connector evaluates only *user-managed* keys (`--managed-by=user`) — Google-managed keys rotate automatically.

### Public access prevention on buckets (DCH-01.2 fail)

`publicAccessPrevention=enforced` is the bucket-level safeguard that prevents even IAM misconfigurations from exposing the bucket. Without it, an accidental `allUsers:storage.objectViewer` binding would make the bucket public.

**Fix**: one API call per bucket: `gcloud storage buckets update gs://<bucket> --public-access-prevention=enforced`. For new buckets, set at creation.

### KMS rotation (CRY-09 fail)

Only applies to `ENCRYPT_DECRYPT` purpose keys. `ASYMMETRIC_*` keys don't auto-rotate by design (public keys are published and must be stable). Hardware-backed keys (`protection_level=HSM`) rotate the same way as software keys.

**Fix**: `rotationPeriod=7776000s` (90d). Shorter is fine; longer triggers the warning.

## Limits (v0.1.0)

Not covered yet:

- **Compute**: shielded VM enforcement, secure boot, confidential computing
- **Networking**: firewall rules, private Google access, VPC Service Controls
- **BigQuery**: dataset access, CMEK, data retention
- **Pub/Sub**: message encryption, schema enforcement
- **GKE**: Workload Identity, Binary Authorization, private clusters, shielded nodes
- **Cloud SQL**: encryption, backup, private IP
- **Secret Manager**: optional metadata-only inventory and version history is separate evidence, not a control evaluation. It does not establish that rotation occurred or that a policy is satisfied; automatic replication is not evaluated.
- **Cloud Functions**: execution service account scope

When a user asks about these, say "v0.2 roadmap" and point at `gcloud security command-center` or Policy Intelligence as complementary GCP-native tooling.

## Common pitfalls

- **Multi-project environments**: this connector runs per-project. Automate by looping over your project list.
- **Org-level policies**: checks see project-effective state, not where the policy is set. A project may pass because an org policy enforces public-access-prevention even though the bucket config itself is silent.
- **Workload Identity**: if the caller is a service account running in GKE or Cloud Run with Workload Identity, `gcloud auth list` may show it indirectly. Setup still works.
- **Long key lists**: projects with 100+ service accounts can take 30-60s to scan. Use `--services=storage,logging,kms,compute` if you want a faster run and will do IAM separately.
