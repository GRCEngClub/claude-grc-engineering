---
name: GCP Inspector Collect
description: Query GCP for compliance-relevant configuration across IAM, Cloud Storage, audit logs, KMS, and Compute; emit findings conforming to the v1 contract.
---

# /gcp-inspector:collect

Scans a GCP project for compliance-relevant resources and configurations.

## How to run

```bash
node plugins/connectors/gcp-inspector/scripts/collect.js [options]
```

## Arguments

- `--project=<id>` — override the configured project
- `--services=<csv>` — subset of `iam,storage,logging,kms,compute,secret-manager` (default: first five only). Secret Manager must be explicitly selected on the command line, not just in config. Duplicate services (including in config defaults) and repeated `--services` flags are usage errors before collection or run artifacts.
- `--output=<fmt>` — `silent` | `summary` (default) | `json`
- `--refresh` — ignore any cached data; re-query GCP
- `--quiet` — no stderr progress

## What it evaluates

**Project-level (IAM)**:

| SCF | Check | Severity |
|---|---|---|
| IAC-07.2 | No user accounts with primitive roles (`roles/owner`, `roles/editor`) | high |
| IAC-15.1 | Service account key rotation (< 90 days) | medium |
| IAC-15.1 | No unused service account keys | medium |
| IAC-01.2 | Organization policy service enabled | low |

**Storage (Cloud Storage)**:

| SCF | Check | Severity |
|---|---|---|
| CRY-05 | Bucket encryption (default or CMEK) | pass if any encryption; medium if only Google-managed for sensitive buckets |
| DCH-01.2 | Uniform bucket-level access enabled | medium |
| DCH-01.2 | Public access prevention enforced | critical if bucket is public |
| MON-01.2 | Bucket logging enabled | low |

**Audit logs (Logging)**:

| SCF | Check | Severity |
|---|---|---|
| MON-02 | Admin Activity logs going to a retained sink | high |
| MON-02 | Data Access logs enabled for sensitive services (Storage, IAM) | medium |
| MON-02.1 | Log sink destination is not publicly accessible | high |

**KMS**:

| SCF | Check | Severity |
|---|---|---|
| CRY-09 | All CMEK keys have rotation period ≤ 90 days | medium |

**Compute**:

| SCF | Check | Severity |
|---|---|---|
| IAC-02 | OS Login enabled at project level | medium |
| CFG-03 | Default encryption on disks (usually automatic but verified) | low |

## Output

- `~/.cache/claude-grc/findings/gcp-inspector/<run_id>.json` — array of Findings
- `~/.cache/claude-grc/runs.log` — run manifest appended
- With explicit `--services=secret-manager`, `~/.cache/claude-grc/evidence/gcp-inspector/<run_id>.json` contains a separate metadata-only inventory and version history. JSON output and the run log include `secret_manager_evidence_path`. This is not a Finding or compliance evaluation; a rotation schedule is not proof a rotation occurred. Names and timestamps can be sensitive; protect and retain the evidence accordingly. New files are mode 0600.
- stdout summary unless `--quiet`:

  ```
  gcp-inspector: 18 resources, 64 evaluations, 7 failing (1 critical, 3 high, 3 medium).
  ```

## Exit codes

- `0` success
- `2` usage error or credentials invalid
- `3` rate-limited (GCP quota exhausted)
- `4` partial (some services inaccessible; report still written)
- `5` config missing — run setup

## Minimum IAM role

```
roles/iam.securityReviewer        # IAM policies, service accounts
roles/cloudkms.viewer             # KMS keys + rotation
roles/logging.viewer              # log sinks
roles/compute.viewer              # instance + metadata
roles/storage.objectViewer        # bucket settings
roles/resourcemanager.folderViewer  # (optional; multi-project)
```

Alternatively, `roles/viewer` covers the basics.

For opt-in Secret Manager evidence, install the adjacent `gcp-secret-metadata` plugin in the same marketplace checkout and grant `secretmanager.secrets.list`, `secretmanager.secrets.get`, and `secretmanager.versions.list` on the selected project/resources. Numeric resource names also require permission to describe the selected project to bind its project number to its ID. The collector calls only metadata list/describe commands, never version access. It uses gcloud's automatic pagination without a limit; successful collection reflects what the caller can list, not proof of broader visibility or an atomic snapshot. Permission, malformed-response, project mismatch, or helper errors cause a partial exit (4) and no Secret Manager evidence file. Review other services' results separately.

Secret Manager collection rejects inventories over 100 secrets rather than producing incomplete evidence. It has a five-minute time budget checked before and after each sequential helper; a helper already running can extend the elapsed time beyond five minutes, and is subject to its own 120-second timeout. These limits apply only to Secret Manager collection, not the whole multi-service run. Exceeding either limit causes exit 4 with no Secret Manager evidence; findings and a run manifest may still be written for the run.

## Examples

```bash
# Current project, all services
/gcp-inspector:collect

# Multi-project scan
for p in prod-01 prod-02 stage-01; do
  /gcp-inspector:collect --project=$p
done

# Storage only
/gcp-inspector:collect --services=storage

# Metadata-only Secret Manager inventory and version history
/gcp-inspector:collect --project=example-project --services=secret-manager --output=json
```

## CI/CD usage

```bash
gcloud auth activate-service-account --key-file=sa.json
node plugins/connectors/gcp-inspector/scripts/collect.js --quiet
node plugins/grc-engineer/scripts/gap-assessment.js FedRAMP-Moderate --sources=gcp-inspector --output=sarif --quiet > gcp-gap.sarif
```
