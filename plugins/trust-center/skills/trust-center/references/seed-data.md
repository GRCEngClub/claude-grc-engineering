# Seed Data Script Template

Use this template when generating `backend/seed_data.py` during `/trust-center:init`.
Replace every `{{ PLACEHOLDER }}` with the value collected from the user.

---

```python
"""
Seed script — populates the Trust Center DynamoDB table with
{{ COMPANY_NAME }}'s compliance documents and configuration.

Usage:
  python seed_data.py --table <table-name> --bucket <bucket-name>

This creates:
  1. Site configuration (company name, certifications, branding)
  2. Document metadata for policies, audit reports, and certifications
"""

import argparse
from datetime import datetime
import boto3

dynamodb = boto3.resource("dynamodb")


def now_iso():
    return datetime.utcnow().isoformat() + "Z"


def seed(table_name, bucket_name):
    table = dynamodb.Table(table_name)
    now = now_iso()

    # ── Site Configuration ──────────────────────────────────────
    print("Seeding site configuration...")
    table.put_item(Item={
        "PK": "CONFIG",
        "SK": "CONFIG",
        "companyName": "{{ COMPANY_NAME }}",
        "tagline": "{{ TAGLINE }}",                  # e.g. "Security & Compliance"
        "description": "{{ DESCRIPTION }}",
        "logoUrl": "",                                # upload logo separately
        "primaryColor": "{{ PRIMARY_COLOR }}",        # hex, e.g. "#1a56db"
        "certifications": [
            # Add one dict per certification the user listed.
            # Template for each entry:
            {
                "name": "{{ CERT_NAME }}",            # e.g. "SOC 2 Type II"
                "status": "active",                   # active | in-progress | planned
                "description": "{{ CERT_DESCRIPTION }}",
                "auditPeriod": "{{ AUDIT_PERIOD }}",  # e.g. "Jan 1, 2025 – Dec 31, 2025"
                "auditor": "{{ AUDITOR_NAME }}",
                "badge": "{{ BADGE_SLUG }}",          # e.g. "soc2", "iso27001", "pci"
            },
            # … repeat for each certification
        ],
        "contactEmail": "{{ SECURITY_EMAIL }}",
        "lastUpdated": now,
        "complianceStats": {
            "totalControls": {{ TOTAL_CONTROLS }},
            "complianceRate": "{{ COMPLIANCE_RATE }}",   # e.g. "94%"
            "currentAuditPeriod": "{{ CURRENT_AUDIT_PERIOD }}",
        },
    })

    # ── Documents ───────────────────────────────────────────────
    # Access levels:
    #   "public"  — downloadable by anyone, no login required
    #   "gated"   — metadata visible to all, download requires approved request + NDA
    #
    # File types: "pdf" | "docx" | "xlsx"
    # s3Key: path within the documents bucket, e.g. "documents/SOC3Report.pdf"
    print("Seeding document metadata...")

    documents = [
        # ── PUBLIC documents ────────────────────────────────────
        {
            "id": "{{ DOC_ID }}",            # URL-safe slug, e.g. "soc3-report"
            "name": "{{ DOC_NAME }}",
            "description": "{{ DOC_DESCRIPTION }}",
            "category": "{{ CATEGORY }}",    # e.g. "Audit Reports" | "Policies" | "Certifications"
            "accessLevel": "public",
            "fileType": "pdf",
            "s3Key": "documents/{{ FILENAME }}",
        },

        # ── GATED documents (add requiresNda: True for SOC 2, pen-test reports, etc.) ──
        {
            "id": "{{ DOC_ID }}",
            "name": "{{ DOC_NAME }}",
            "description": "{{ DOC_DESCRIPTION }}",
            "category": "{{ CATEGORY }}",
            "accessLevel": "gated",
            "fileType": "pdf",
            "s3Key": "documents/{{ FILENAME }}",
            "requiresNda": True,
        },

        # Common policy documents — add or remove to match the user's actual policy library:
        # Information Security Policy, Access Control & Termination Policy,
        # Acceptable Use Policy, Business Continuity & Disaster Recovery Plan,
        # Change Management Policy, Data Classification Policy,
        # Data Retention & Disposal Policy, Encryption & Key Management Policy,
        # Incident Response Plan, Network Security Policy,
        # Privacy & Data Protection Policy, Risk Assessment & Treatment Policy,
        # Secure Development Policy, Vendor Management Policy,
        # Vulnerability & Patch Management Policy
    ]

    for doc in documents:
        access_level = doc["accessLevel"]
        table.put_item(Item={
            "PK": f"DOC#{doc['id']}",
            "SK": "META",
            "GSI1PK": "DOCS",
            "GSI1SK": f"{access_level}#{doc['name']}",
            "documentId": doc["id"],
            "name": doc["name"],
            "description": doc["description"],
            "category": doc["category"],
            "accessLevel": access_level,
            "fileType": doc["fileType"],
            "s3Key": doc["s3Key"],
            "requiresNda": doc.get("requiresNda", access_level == "gated"),
            "lastUpdated": now,
            "createdBy": "seed-script",
        })

    print(f"  Seeded {len(documents)} documents")
    print("Done! Trust center data is ready.")
    print(f"\nNext: upload the actual files to s3://{bucket_name}/documents/")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed Trust Center data")
    parser.add_argument("--table", required=True, help="DynamoDB table name (from CloudFormation output TableName)")
    parser.add_argument("--bucket", required=True, help="Documents S3 bucket name (from CloudFormation output DocumentsBucket)")
    args = parser.parse_args()
    seed(args.table, args.bucket)
```

---

## Placeholder Reference

| Placeholder | Where to get it | Example |
|---|---|---|
| `COMPANY_NAME` | Asked during `/trust-center:init` | `"Acme Corp"` |
| `TAGLINE` | Asked during init or inferred | `"Security & Compliance"` |
| `DESCRIPTION` | Asked during init | 1-2 sentence blurb |
| `PRIMARY_COLOR` | Asked or use brand color | `"#1a56db"` |
| `CERT_NAME` | Each certification listed by user | `"SOC 2 Type II"` |
| `CERT_DESCRIPTION` | Standard text per cert type | See examples below |
| `AUDIT_PERIOD` | Asked during init | `"Jan 1, 2025 – Dec 31, 2025"` |
| `AUDITOR_NAME` | Asked during init | `"Deloitte"` |
| `BADGE_SLUG` | Derived from cert type | `soc2`, `iso27001`, `pci`, `hipaa` |
| `SECURITY_EMAIL` | Asked during init | `"security@acme.com"` |
| `TOTAL_CONTROLS` | Infer from framework or ask | `55` |
| `COMPLIANCE_RATE` | Ask or omit | `"94%"` |
| `DOC_ID` | Generate from name | `"soc3-report"`, `"pol-infosec"` |
| `DOC_NAME` | From user's document list | `"SOC 3 Report"` |
| `FILENAME` | From actual file name | `"SOC3Report.pdf"` |
| `CATEGORY` | Group by type | `"Audit Reports"`, `"Policies"` |

## Standard Certification Descriptions

```
SOC 2 Type I  — Design of controls against the Security trust services criteria
SOC 2 Type II — Design and operating effectiveness of Security controls, covering <period>
SOC 3         — General use report on Security controls — publicly downloadable
ISO 27001     — Information security management system certified to ISO/IEC 27001:<year>
PCI DSS       — Payment card industry data security standard v<version> compliance
HIPAA         — HIPAA Security Rule safeguards for protected health information
```

## Document ID Conventions

Use kebab-case slugs prefixed by type:

- Audit reports: `soc2-type2`, `soc3-report`, `pen-test-2025`
- Policies: `pol-infosec`, `pol-access`, `pol-bcdr`, `pol-incident`
- Certifications: `cert-iso27001`, `cert-pci`

## After Running the Seed Script

```bash
# 1. Upload actual document files to S3
aws s3 cp ./documents/ s3://<bucket-name>/documents/ --recursive

# 2. Verify records were written
aws dynamodb scan --table-name <table-name> --select COUNT
```
