---
name: GCP Inspector Setup
description: Verify the gcp-inspector connector's prerequisites and write its config. Idempotent.
---

# /gcp-inspector:setup

Prepares the gcp-inspector connector. Confirms `gcloud` CLI is installed and authenticated, writes `~/.config/claude-grc/connectors/gcp-inspector.yaml`, and runs a read-only health check.

## How to run

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/setup.sh" [--project=<id>] [--region=<region>]
```

Exits 0 on success, 2 on missing/invalid credentials, 5 on missing `gcloud` binary.

## Credential precedence

Honors the standard gcloud credential chain:

1. `--project` / `--region` flags (written to config)
2. `GOOGLE_APPLICATION_CREDENTIALS` env var pointing at a service-account JSON
3. `gcloud config get-value project` and `gcloud config get-value compute/region`
4. Application Default Credentials (ADC) via `gcloud auth application-default login`

The setup script runs `gcloud auth list` and `gcloud projects describe` to verify the resolved identity has access *before* writing the config.

## What it does

1. Check `gcloud` CLI is installed (`gcloud --version`).
2. Resolve credentials (`gcloud auth list --filter=status:ACTIVE`).
3. Resolve project (from `--project`, `CLOUDSDK_CORE_PROJECT`, or `gcloud config`).
4. Verify the caller can at least `gcloud projects describe` the project (read IAM policy check).
5. Write config:

   ```yaml
   version: 1
   source: gcp-inspector
   source_version: "0.1.0"
   project_id: "<project>"
   project_number: "<number>"
   caller: "<email-or-sa>"
   default_region: "us-central1"
   defaults:
     services: ["iam", "storage", "logging", "kms", "compute"]
   ```

## Typical output

```
gcp-inspector:setup ✓
  gcloud:          557.0.0
  project:         acme-prod (number 1234567890)
  caller:          ethan@example.com
  default region:  us-central1
  config:          ~/.config/claude-grc/connectors/gcp-inspector.yaml

Next: /gcp-inspector:collect
```

## Failure modes

- **gcloud not installed**: exit 5. `brew install --cask google-cloud-sdk` or https://cloud.google.com/sdk/docs/install.
- **No active account**: exit 2. Run `gcloud auth login` then `gcloud auth application-default login`.
- **Project not accessible**: exit 2. Either the project doesn't exist or the caller lacks `resourcemanager.projects.get`. Required role: at minimum `roles/viewer`; for a full scan, `roles/iam.securityReviewer` + `roles/cloudkms.viewer` + `roles/logging.viewer`.

## Safe to re-run

Yes. Overwrites config; preserves cached findings.
