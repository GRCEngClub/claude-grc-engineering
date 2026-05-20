"""
Seed script — populates the Trust Center DynamoDB table with
your company's compliance documents and configuration.

Usage:
  python seed_data.py --table trust-center-documents-prod --bucket trust-center-docs-prod

This creates:
  1. Site configuration (company name, certs, branding)
  2. Document metadata for all policies, reports, and certifications
  3. Certification entries displayed on the public page
"""

import argparse
import json
import boto3
from datetime import datetime

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
        "companyName": "Your Company",
        "tagline": "Security & Compliance",
        "description": (
            "Your Company takes the security of your data seriously and maintains "
            "rigorous compliance standards. We are committed to protecting your "
            "information through industry-leading security practices."
        ),
        "logoUrl": "",
        "primaryColor": "#1a56db",
        "certifications": [
            {
                "name": "SOC 2 Type II",
                "status": "active",
                "description": "System and Organization Controls covering Security trust services criteria",
                "auditPeriod": "Oct 1, 2025 – Dec 31, 2025",
                "auditor": "Your Auditor",
                "badge": "soc2",
            },
            {
                "name": "SOC 3",
                "status": "active",
                "description": "General use report on Security controls — publicly available",
                "auditPeriod": "Oct 1, 2025 – Dec 31, 2025",
                "auditor": "Your Auditor",
                "badge": "soc3",
            },
        ],
        "contactEmail": "security@yourcompany.com",
        "lastUpdated": now,
        "complianceStats": {
            "totalControls": 55,
            "trustServicesCriteria": 33,
            "complianceRate": "94%",
            "currentAuditPeriod": "Feb 1, 2026 – Jan 31, 2027",
        },
    })

    # ── Documents ───────────────────────────────────────────────
    print("Seeding document metadata...")

    documents = [
        # PUBLIC documents (downloadable without login)
        {
            "id": "soc3-report",
            "name": "SOC 3 Report",
            "description": "General use report on security controls. Publicly available.",
            "category": "Audit Reports",
            "accessLevel": "public",
            "fileType": "pdf",
            "s3Key": "documents/SOC3Report.pdf",
        },

        # GATED documents (require access request / NDA)
        {
            "id": "soc2-type2",
            "name": "SOC 2 Type II Report",
            "description": "Detailed report on the suitability of design and operating effectiveness of security controls. Covers the period Oct 1, 2025 – Dec 31, 2025.",
            "category": "Audit Reports",
            "accessLevel": "gated",
            "fileType": "pdf",
            "s3Key": "documents/SOC2Report.pdf",
            "requiresNda": True,
        },

        # POLICIES — all gated
        {
            "id": "pol-infosec",
            "name": "Information Security Policy",
            "description": "Overarching policy governing the protection of information assets, risk management, and security controls.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Information_Security_Policy.docx",
        },
        {
            "id": "pol-access",
            "name": "Access Control & Termination Policy",
            "description": "Defines user provisioning, role-based access, periodic reviews, and offboarding procedures.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Access_Control_and_Termination_Policy.docx",
        },
        {
            "id": "pol-acceptable-use",
            "name": "Acceptable Use Policy",
            "description": "Standards for acceptable use of company systems, networks, and data.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Acceptable_Use_Policy.docx",
        },
        {
            "id": "pol-bcdr",
            "name": "Business Continuity & Disaster Recovery Plan",
            "description": "Outlines procedures for maintaining operations during disruptions and recovering from disasters.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Business_Continuity_and_Disaster_Recovery_Plan.docx",
        },
        {
            "id": "pol-change-mgmt",
            "name": "Change Management Policy",
            "description": "Controls for authorizing, testing, and deploying changes to production systems.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Change_Management_Policy.docx",
        },
        {
            "id": "pol-code-conduct",
            "name": "Code of Conduct",
            "description": "Employee and contractor standards of behavior and ethical expectations.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Code_of_Conduct.docx",
        },
        {
            "id": "pol-config-asset",
            "name": "Configuration & Asset Management Policy",
            "description": "Standards for managing hardware and software assets, including configuration baselines.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Configuration_and_Asset_Management_Policy.docx",
        },
        {
            "id": "pol-data-class",
            "name": "Data Classification Policy",
            "description": "Framework for classifying data by sensitivity level and applying appropriate controls.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Data_Classification_Policy.docx",
        },
        {
            "id": "pol-data-retention",
            "name": "Data Retention & Disposal Policy",
            "description": "Requirements for retaining and securely disposing of data across all systems.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Data_Retention_and_Disposal_Policy.docx",
        },
        {
            "id": "pol-dpa",
            "name": "Data Processing Agreement",
            "description": "Terms governing the processing of personal data on behalf of customers.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Data_Processing_Agreement.docx",
        },
        {
            "id": "pol-encryption",
            "name": "Encryption & Key Management Policy",
            "description": "Standards for encryption at rest and in transit, and cryptographic key lifecycle management.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Encryption_and_Key_Management_Policy.docx",
        },
        {
            "id": "pol-network",
            "name": "Network Security Policy",
            "description": "Requirements for protecting information systems across internal and external networks.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Network_Security_Policy.docx",
        },
        {
            "id": "pol-incident",
            "name": "Security Incident Response Plan",
            "description": "Procedures for detecting, responding to, and recovering from security incidents.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Security_Incident_Response_Plan.docx",
        },
        {
            "id": "pol-privacy",
            "name": "Privacy & Data Protection Policy",
            "description": "Commitment to privacy, data subject rights, and compliance with applicable privacy laws.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Privacy_and_Data_Protection_Policy.docx",
        },
        {
            "id": "pol-risk",
            "name": "Risk Assessment & Treatment Policy",
            "description": "Framework for identifying, assessing, and treating information security risks.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Risk_Assessment_and_Treatment_Policy.docx",
        },
        {
            "id": "pol-secdev",
            "name": "Secure Development Policy",
            "description": "Secure SDLC requirements including code review, testing, and deployment controls.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Secure_Development_Policy.docx",
        },
        {
            "id": "pol-vendor",
            "name": "Vendor Management Policy",
            "description": "Third-party risk management procedures including vendor assessment and ongoing monitoring.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Vendor_Management_Policy.docx",
        },
        {
            "id": "pol-vuln",
            "name": "Vulnerability & Patch Management Policy",
            "description": "Standards for vulnerability scanning, risk-based prioritization, and timely patching.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Vulnerability_and_Patch_Management_Policy.docx",
        },
        {
            "id": "pol-internal-control",
            "name": "Internal Control Policy",
            "description": "Framework for internal controls supporting the reliability and integrity of operations.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Internal_Control_Policy.docx",
        },
        {
            "id": "pol-physical",
            "name": "Physical Security Policy",
            "description": "Controls for protecting physical facilities and assets from unauthorized access.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Physical_Security_Policy.docx",
        },
        {
            "id": "pol-processing",
            "name": "Processing Integrity Policy",
            "description": "Ensuring system processing is complete, valid, accurate, timely, and authorized.",
            "category": "Policies",
            "accessLevel": "gated",
            "fileType": "docx",
            "s3Key": "documents/Processing_Integrity_Policy.docx",
        },
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
    print("Done! Your trust center data is ready.")
    print(f"\nNext: upload the actual files to s3://{bucket_name}/documents/")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed Trust Center data")
    parser.add_argument("--table", required=True, help="DynamoDB table name")
    parser.add_argument("--bucket", required=True, help="Documents S3 bucket name")
    args = parser.parse_args()

    seed(args.table, args.bucket)
