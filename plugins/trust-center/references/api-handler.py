"""
GRC Trust Center — API Handler (Lambda)

Routes:
  GET    /api/config              → Public site config (company name, certifications)
  GET    /api/documents           → List public + gated document metadata
  GET    /api/documents/:id       → Get single document details
  POST   /api/documents/:id/request-access → Request gated document access (triggers NDA)
  GET    /api/documents/:id/download       → Get presigned download URL (if authorized)

  # Admin routes (require Cognito admin group)
  GET    /api/admin/requests      → List all access requests
  PUT    /api/admin/requests/:id  → Approve/deny an access request
  POST   /api/admin/documents     → Create/update document metadata
  DELETE /api/admin/documents/:id → Remove a document
  GET    /api/admin/audit-log     → View download/access audit log
  PUT    /api/admin/config        → Update site configuration
"""

import json
import os
import uuid
import time
import logging
from datetime import datetime
from decimal import Decimal
from urllib import request as urllib_request

import boto3
from botocore.exceptions import ClientError

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------
logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
s3 = boto3.client("s3")
cognito = boto3.client("cognito-idp")

TABLE_NAME = os.environ.get("TABLE_NAME", "trust-center-documents-prod")
DOCUMENTS_BUCKET = os.environ.get("DOCUMENTS_BUCKET", "trust-center-docs-prod")
USER_POOL_ID = os.environ.get("USER_POOL_ID", "")
COMPANY_NAME = os.environ.get("COMPANY_NAME", "Your Company")
STAGE = os.environ.get("STAGE", "prod")

# E-signature provider configuration (optional — choose your provider)
# Supported providers: documenso, opensign, docuseal, docusign
# Set ESIGN_PROVIDER + credentials. If empty, NDA step is skipped.
ESIGN_PROVIDER = os.environ.get("ESIGN_PROVIDER", "")  # documenso | opensign | docuseal | docusign
ESIGN_API_KEY = os.environ.get("ESIGN_API_KEY", "")
ESIGN_API_URL = os.environ.get("ESIGN_API_URL", "")
ESIGN_NDA_TEMPLATE_ID = os.environ.get("ESIGN_NDA_TEMPLATE_ID", "")
TRUST_CENTER_URL = os.environ.get("TRUST_CENTER_URL", "")

table = dynamodb.Table(TABLE_NAME)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def cors_response(status_code, body=None, headers=None):
    """Return a properly formatted API Gateway response with CORS headers."""
    resp = {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            **(headers or {}),
        },
    }
    if body is not None:
        resp["body"] = json.dumps(body, default=str)
    return resp


def parse_body(event):
    """Parse JSON body from API Gateway event."""
    body = event.get("body", "{}")
    if body is None:
        return {}
    if isinstance(body, str):
        return json.loads(body)
    return body


def get_user_from_token(event):
    """Extract user info from Cognito JWT (passed by API Gateway)."""
    claims = (event.get("requestContext", {})
                   .get("authorizer", {})
                   .get("claims", {}))
    return {
        "email": claims.get("email", "anonymous"),
        "sub": claims.get("sub", ""),
        "groups": claims.get("cognito:groups", ""),
    }


def is_admin(event):
    """Check if the caller belongs to the 'admins' Cognito group."""
    user = get_user_from_token(event)
    groups = user.get("groups", "")
    return "admins" in groups


def now_iso():
    return datetime.utcnow().isoformat() + "Z"


def new_id():
    return str(uuid.uuid4())[:8]


# ---------------------------------------------------------------------------
# DynamoDB single-table design
# ---------------------------------------------------------------------------
# PK / SK patterns:
#   CONFIG                / CONFIG              → site configuration
#   DOC#<id>              / META                → document metadata
#   DOC#<id>              / REQUEST#<req_id>    → access request for a doc
#   AUDIT#<date>          / <timestamp>#<id>    → audit log entry
#   CERT#<id>             / META                → certification entry
#
# GSI1:
#   GSI1PK = "REQUESTS"   GSI1SK = <status>#<timestamp>   → query requests by status
#   GSI1PK = "DOCS"        GSI1SK = <access_level>#<name>  → query docs by access level


# ---------------------------------------------------------------------------
# Route: GET /api/config
# ---------------------------------------------------------------------------
def get_config(event):
    """Return public trust center configuration."""
    try:
        resp = table.get_item(Key={"PK": "CONFIG", "SK": "CONFIG"})
        item = resp.get("Item", {})

        config = {
            "companyName": item.get("companyName", COMPANY_NAME),
            "tagline": item.get("tagline", "Security & Compliance"),
            "description": item.get("description", ""),
            "logoUrl": item.get("logoUrl", ""),
            "primaryColor": item.get("primaryColor", "#1a56db"),
            "certifications": item.get("certifications", []),
            "contactEmail": item.get("contactEmail", ""),
            "lastUpdated": item.get("lastUpdated", ""),
        }
        return cors_response(200, config)
    except Exception as e:
        logger.error(f"get_config error: {e}")
        return cors_response(500, {"error": "Failed to load configuration"})


# ---------------------------------------------------------------------------
# Route: PUT /api/admin/config
# ---------------------------------------------------------------------------
def update_config(event):
    """Update trust center configuration (admin only)."""
    if not is_admin(event):
        return cors_response(403, {"error": "Admin access required"})

    body = parse_body(event)
    now = now_iso()

    item = {
        "PK": "CONFIG",
        "SK": "CONFIG",
        "companyName": body.get("companyName", COMPANY_NAME),
        "tagline": body.get("tagline", ""),
        "description": body.get("description", ""),
        "logoUrl": body.get("logoUrl", ""),
        "primaryColor": body.get("primaryColor", "#1a56db"),
        "certifications": body.get("certifications", []),
        "contactEmail": body.get("contactEmail", ""),
        "lastUpdated": now,
        "updatedBy": get_user_from_token(event)["email"],
    }

    table.put_item(Item=item)
    return cors_response(200, {"message": "Configuration updated", "lastUpdated": now})


# ---------------------------------------------------------------------------
# Route: GET /api/documents
# ---------------------------------------------------------------------------
def list_documents(event):
    """List all documents. Public users see public docs; authed users see gated too."""
    try:
        resp = table.query(
            IndexName="GSI1",
            KeyConditionExpression="GSI1PK = :pk",
            ExpressionAttributeValues={":pk": "DOCS"},
        )
        items = resp.get("Items", [])

        user = get_user_from_token(event)
        is_authenticated = bool(user.get("sub"))

        documents = []
        for item in items:
            access_level = item.get("accessLevel", "public")

            doc = {
                "id": item.get("documentId"),
                "name": item.get("name"),
                "description": item.get("description", ""),
                "category": item.get("category", ""),
                "accessLevel": access_level,
                "fileType": item.get("fileType", "pdf"),
                "lastUpdated": item.get("lastUpdated", ""),
            }

            # Public docs visible to everyone
            # Gated docs: metadata visible but download requires access request
            if access_level == "public" or is_authenticated:
                doc["downloadable"] = access_level == "public"
            else:
                doc["downloadable"] = False

            documents.append(doc)

        return cors_response(200, {"documents": documents})
    except Exception as e:
        logger.error(f"list_documents error: {e}")
        return cors_response(500, {"error": "Failed to list documents"})


# ---------------------------------------------------------------------------
# Route: GET /api/documents/:id
# ---------------------------------------------------------------------------
def get_document(event, doc_id):
    """Get single document details."""
    try:
        resp = table.get_item(Key={"PK": f"DOC#{doc_id}", "SK": "META"})
        item = resp.get("Item")
        if not item:
            return cors_response(404, {"error": "Document not found"})

        return cors_response(200, {
            "id": item.get("documentId"),
            "name": item.get("name"),
            "description": item.get("description", ""),
            "category": item.get("category", ""),
            "accessLevel": item.get("accessLevel", "public"),
            "fileType": item.get("fileType", "pdf"),
            "s3Key": item.get("s3Key", ""),
            "lastUpdated": item.get("lastUpdated", ""),
        })
    except Exception as e:
        logger.error(f"get_document error: {e}")
        return cors_response(500, {"error": "Failed to get document"})


# ---------------------------------------------------------------------------
# Route: POST /api/documents/:id/request-access
# ---------------------------------------------------------------------------
def request_access(event, doc_id):
    """Request access to a gated document.
    
    Flow:
    1. Visitor submits request (name, email, company, reason)
    2. If an e-signature provider is configured → sends NDA for e-signature, status = "nda_pending"
    3. If no e-signature provider is configured → status = "pending" (admin reviews without NDA)
    4. E-signature webhook fires when NDA is signed → status moves to "pending"
    5. Admin approves → Cognito account created → visitor can download
    """
    body = parse_body(event)
    now = now_iso()
    req_id = new_id()

    requester_email = body.get("email", "")
    requester_name = body.get("name", "")
    requester_company = body.get("company", "")
    reason = body.get("reason", "")

    if not requester_email:
        return cors_response(400, {"error": "Email is required"})

    # Check document exists and is gated
    doc_resp = table.get_item(Key={"PK": f"DOC#{doc_id}", "SK": "META"})
    doc = doc_resp.get("Item")
    if not doc:
        return cors_response(404, {"error": "Document not found"})

    if doc.get("accessLevel") == "public":
        return cors_response(400, {"error": "Document is publicly available, no request needed"})

    # Determine initial status based on E-sign provider configuration
    nda_enabled = bool(ESIGN_API_KEY and ESIGN_NDA_TEMPLATE_ID)
    requires_nda = doc.get("requiresNda", True) and nda_enabled
    initial_status = "nda_pending" if requires_nda else "pending"

    item = {
        "PK": f"DOC#{doc_id}",
        "SK": f"REQUEST#{req_id}",
        "GSI1PK": "REQUESTS",
        "GSI1SK": f"{initial_status}#{now}",
        "requestId": req_id,
        "documentId": doc_id,
        "documentName": doc.get("name", ""),
        "requesterEmail": requester_email,
        "requesterName": requester_name,
        "requesterCompany": requester_company,
        "reason": reason,
        "status": initial_status,
        "ndaSigned": False,
        "ndaRequired": requires_nda,
        "createdAt": now,
        "updatedAt": now,
    }

    # If NDA is required, send it via E-sign provider
    nda_result = None
    if requires_nda:
        nda_result = _send_nda_via_esign(
            requester_email, requester_name, req_id, doc_id
        )
        if nda_result:
            item["esignDocumentId"] = str(nda_result.get("envelopeId", ""))

    table.put_item(Item=item)

    _write_audit_log("access_requested", {
        "documentId": doc_id,
        "requestId": req_id,
        "requesterEmail": requester_email,
        "ndaSent": bool(nda_result),
    })

    response_msg = "Access request submitted"
    if requires_nda and nda_result:
        response_msg = "Access request submitted — please check your email to sign the NDA"
    elif requires_nda and not nda_result:
        response_msg = "Access request submitted — NDA sending failed, admin will follow up"

    return cors_response(201, {
        "message": response_msg,
        "requestId": req_id,
        "status": initial_status,
        "ndaRequired": requires_nda,
        "ndaSent": bool(nda_result),
    })


# ---------------------------------------------------------------------------
# E-Signature NDA Integration (Provider-Agnostic)
# ---------------------------------------------------------------------------
def _send_nda_via_esign(email, name, request_id, document_id):
    """Send an NDA for e-signature via E-signature API.
    
    Creates a document from the configured NDA template and sends it to the signer.
    The provider emails the signer a link to review and sign the NDA.
    When they complete it, The provider fires a DOCUMENT_COMPLETED webhook.
    
    API: POST /api/v2/template/:templateId/create-document
    Auth: Authorization header with API key
    Docs: https://docs.the provider
    """
    if not ESIGN_API_KEY or not ESIGN_NDA_TEMPLATE_ID:
        logger.warning("E-sign provider not configured, skipping NDA")
        return None

    try:
        # Build redirect URL for after signing
        redirect_url = TRUST_CENTER_URL or ""
        if redirect_url:
            redirect_url = f"{redirect_url}?nda_signed=true&request_id={request_id}"

        payload = json.dumps({
            "recipients": [
                {
                    "email": email,
                    "name": name or "Signer",
                    "role": "SIGNER",
                }
            ],
            "meta": {
                "subject": f"NDA — Access Request for Compliance Documents",
                "message": f"Please review and sign this Non-Disclosure Agreement to access confidential compliance documents. Reference: {request_id}",
                "redirectUrl": redirect_url,
            },
            "externalId": request_id,
        }).encode("utf-8")

        url = f"{ESIGN_API_URL}/template/{ESIGN_NDA_TEMPLATE_ID}/create-document"

        req = urllib_request.Request(
            url,
            data=payload,
            headers={
                "Authorization": ESIGN_API_KEY,
                "Content-Type": "application/json",
            },
            method="POST",
        )

        with urllib_request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read().decode("utf-8"))

        envelope_id = result.get("id", "")
        logger.info(f"E-sign provider NDA sent to {email}, envelopeId={envelope_id}")

        return {"envelopeId": envelope_id}

    except Exception as e:
        logger.error(f"E-signature API error: {e}")
        return None


# ---------------------------------------------------------------------------
# Route: POST /api/webhook/esign
# ---------------------------------------------------------------------------
def handle_esign_webhook(event):
    """Handle E-signature webhook when an NDA is completed.
    
    The e-signature provider sends a POST with event data when a document is completed.
    We use the externalId (our request_id) to find and update the access
    request, marking ndaSigned=true and moving status to "pending".
    
    Webhook event: DOCUMENT_COMPLETED
    Docs: https://docs.the provider
    """
    body = parse_body(event)
    event_type = body.get("event", "")

    # We only care about DOCUMENT_COMPLETED
    if event_type != "DOCUMENT_COMPLETED":
        return cors_response(200, {"message": f"Ignored event: {event_type}"})

    payload_data = body.get("payload", {})
    external_id = payload_data.get("externalId", "")  # This is our request_id
    envelope_id = str(payload_data.get("id", ""))
    recipients = payload_data.get("recipients", [])
    signer_email = recipients[0].get("email", "") if recipients else ""

    # Try externalId first, then search by envelope ID
    request_id = external_id
    if not request_id and envelope_id:
        request_id = _find_request_by_esign_doc_id(envelope_id)

    if not request_id:
        logger.warning("E-signature webhook: could not find matching request")
        return cors_response(200, {"message": "No matching request found"})

    logger.info(f"E-sign provider NDA completed: request_id={request_id}, email={signer_email}")

    now = now_iso()

    try:
        # Search for the request in nda_pending status
        resp = table.query(
            IndexName="GSI1",
            KeyConditionExpression="GSI1PK = :pk AND begins_with(GSI1SK, :sk)",
            ExpressionAttributeValues={
                ":pk": "REQUESTS",
                ":sk": "nda_pending#",
            },
        )
        for item in resp.get("Items", []):
            if item.get("requestId") == request_id:
                doc_id = item.get("documentId")
                _update_nda_status(doc_id, request_id, now)
                break

        _write_audit_log("nda_completed", {
            "requestId": request_id,
            "signerEmail": signer_email,
            "esignDocumentId": envelope_id,
        })

        return cors_response(200, {"message": "NDA completion processed"})

    except Exception as e:
        logger.error(f"E-signature webhook processing error: {e}")
        return cors_response(500, {"error": "Webhook processing failed"})


def _find_request_by_esign_doc_id(envelope_id):
    """Search for a request by its stored E-sign provider envelope ID."""
    try:
        resp = table.query(
            IndexName="GSI1",
            KeyConditionExpression="GSI1PK = :pk AND begins_with(GSI1SK, :sk)",
            ExpressionAttributeValues={
                ":pk": "REQUESTS",
                ":sk": "nda_pending#",
            },
        )
        for item in resp.get("Items", []):
            if item.get("esignDocumentId") == envelope_id:
                return item.get("requestId")
    except Exception as e:
        logger.error(f"Error searching by esignDocumentId: {e}")
    return ""


def _update_nda_status(document_id, request_id, now):
    """NDA signed → auto-approve access and create Cognito account.
    
    Per AJ's requirement: once NDA is signed, access is granted automatically.
    No admin approval step. We notify security@ via audit log but the visitor
    gets their login credentials immediately.
    """
    # Get the request to find the requester's email for Cognito provisioning
    req_resp = table.get_item(
        Key={"PK": f"DOC#{document_id}", "SK": f"REQUEST#{request_id}"}
    )
    request_item = req_resp.get("Item", {})
    requester_email = request_item.get("requesterEmail", "")
    requester_name = request_item.get("requesterName", "")

    # Update request: NDA signed + auto-approved
    table.update_item(
        Key={"PK": f"DOC#{document_id}", "SK": f"REQUEST#{request_id}"},
        UpdateExpression="SET ndaSigned = :signed, #s = :status, updatedAt = :now, GSI1SK = :gsi, reviewedBy = :reviewer",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={
            ":signed": True,
            ":status": "approved",
            ":now": now,
            ":gsi": f"approved#{now}",
            ":reviewer": "auto-approved-via-nda",
        },
    )

    # Auto-provision Cognito account so they can log in and download
    cognito_created = False
    if requester_email:
        cognito_created = _provision_requester_account(requester_email, requester_name)

    _write_audit_log("nda_auto_approved", {
        "requestId": request_id,
        "documentId": document_id,
        "requesterEmail": requester_email,
        "cognitoAccountCreated": cognito_created,
    })

    logger.info(
        f"NDA auto-approved: request={request_id}, email={requester_email}, "
        f"cognito_created={cognito_created}"
    )
    )


# ---------------------------------------------------------------------------
# Route: GET /api/documents/:id/download
# ---------------------------------------------------------------------------
def download_document(event, doc_id):
    """Generate a presigned S3 URL for downloading a document."""
    # Get document metadata
    doc_resp = table.get_item(Key={"PK": f"DOC#{doc_id}", "SK": "META"})
    doc = doc_resp.get("Item")
    if not doc:
        return cors_response(404, {"error": "Document not found"})

    access_level = doc.get("accessLevel", "public")
    s3_key = doc.get("s3Key")

    if not s3_key:
        return cors_response(404, {"error": "Document file not found"})

    # Public docs: anyone can download
    # Gated docs: check if requester has an approved request
    if access_level != "public":
        user = get_user_from_token(event)
        email = user.get("email", "")

        if not is_admin(event):
            # Check for approved access request
            resp = table.query(
                KeyConditionExpression="PK = :pk AND begins_with(SK, :sk)",
                ExpressionAttributeValues={
                    ":pk": f"DOC#{doc_id}",
                    ":sk": "REQUEST#",
                },
            )
            requests = resp.get("Items", [])
            approved = any(
                r.get("requesterEmail") == email and r.get("status") == "approved"
                for r in requests
            )
            if not approved:
                return cors_response(403, {"error": "Access not approved for this document"})

    # Generate presigned URL (valid for 1 hour)
    try:
        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": DOCUMENTS_BUCKET, "Key": s3_key},
            ExpiresIn=3600,
        )
    except ClientError as e:
        logger.error(f"Presigned URL error: {e}")
        return cors_response(500, {"error": "Failed to generate download link"})

    # Audit log
    user = get_user_from_token(event)
    _write_audit_log("document_downloaded", {
        "documentId": doc_id,
        "documentName": doc.get("name", ""),
        "downloadedBy": user.get("email", "anonymous"),
    })

    return cors_response(200, {"downloadUrl": url, "expiresIn": 3600})


# ---------------------------------------------------------------------------
# Route: GET /api/admin/requests
# ---------------------------------------------------------------------------
def list_requests(event):
    """List all access requests (admin only)."""
    if not is_admin(event):
        return cors_response(403, {"error": "Admin access required"})

    status_filter = (event.get("queryStringParameters") or {}).get("status", "")

    try:
        if status_filter:
            resp = table.query(
                IndexName="GSI1",
                KeyConditionExpression="GSI1PK = :pk AND begins_with(GSI1SK, :sk)",
                ExpressionAttributeValues={
                    ":pk": "REQUESTS",
                    ":sk": f"{status_filter}#",
                },
            )
        else:
            resp = table.query(
                IndexName="GSI1",
                KeyConditionExpression="GSI1PK = :pk",
                ExpressionAttributeValues={":pk": "REQUESTS"},
            )

        items = resp.get("Items", [])
        requests = [
            {
                "requestId": item.get("requestId"),
                "documentId": item.get("documentId"),
                "documentName": item.get("documentName", ""),
                "requesterEmail": item.get("requesterEmail"),
                "requesterName": item.get("requesterName", ""),
                "requesterCompany": item.get("requesterCompany", ""),
                "reason": item.get("reason", ""),
                "status": item.get("status"),
                "ndaSigned": item.get("ndaSigned", False),
                "createdAt": item.get("createdAt"),
                "updatedAt": item.get("updatedAt"),
            }
            for item in items
        ]

        return cors_response(200, {"requests": requests})
    except Exception as e:
        logger.error(f"list_requests error: {e}")
        return cors_response(500, {"error": "Failed to list requests"})


# ---------------------------------------------------------------------------
# Route: PUT /api/admin/requests/:id
# ---------------------------------------------------------------------------
def update_request(event, request_id):
    """Approve or deny an access request (admin only).
    
    On approval: creates a Cognito user for the requester (if they don't already
    have one). Cognito sends them an email with a temporary password so they can
    log in and download their approved documents.
    """
    if not is_admin(event):
        return cors_response(403, {"error": "Admin access required"})

    body = parse_body(event)
    new_status = body.get("status")  # "approved" or "denied"
    doc_id = body.get("documentId")

    if new_status not in ("approved", "denied"):
        return cors_response(400, {"error": "Status must be 'approved' or 'denied'"})

    if not doc_id:
        return cors_response(400, {"error": "documentId is required"})

    now = now_iso()
    admin_user = get_user_from_token(event)

    # First, get the request to find the requester's email
    req_resp = table.get_item(
        Key={"PK": f"DOC#{doc_id}", "SK": f"REQUEST#{request_id}"}
    )
    request_item = req_resp.get("Item", {})
    requester_email = request_item.get("requesterEmail", "")
    requester_name = request_item.get("requesterName", "")

    try:
        # Update the request status
        table.update_item(
            Key={"PK": f"DOC#{doc_id}", "SK": f"REQUEST#{request_id}"},
            UpdateExpression="SET #s = :s, updatedAt = :now, reviewedBy = :by, GSI1SK = :gsi",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={
                ":s": new_status,
                ":now": now,
                ":by": admin_user["email"],
                ":gsi": f"{new_status}#{now}",
            },
        )

        # On approval: create a Cognito account so they can log in and download
        cognito_account_created = False
        if new_status == "approved" and requester_email:
            cognito_account_created = _provision_requester_account(
                requester_email, requester_name
            )

        _write_audit_log(f"request_{new_status}", {
            "requestId": request_id,
            "documentId": doc_id,
            "reviewedBy": admin_user["email"],
            "cognitoAccountCreated": cognito_account_created,
        })

        message = f"Request {new_status}"
        if cognito_account_created:
            message += f" — login credentials sent to {requester_email}"

        return cors_response(200, {
            "message": message,
            "requestId": request_id,
            "cognitoAccountCreated": cognito_account_created,
        })
    except Exception as e:
        logger.error(f"update_request error: {e}")
        return cors_response(500, {"error": "Failed to update request"})


def _provision_requester_account(email, name=""):
    """Create a Cognito user for an approved requester.
    
    If the user already exists, this is a no-op (returns False).
    If created, Cognito sends them an email with a temporary password.
    They log in → set a new password → can download approved docs.
    """
    if not USER_POOL_ID:
        logger.warning("No USER_POOL_ID configured, skipping account provisioning")
        return False

    try:
        # Check if user already exists
        cognito.admin_get_user(
            UserPoolId=USER_POOL_ID,
            Username=email,
        )
        logger.info(f"Cognito user already exists: {email}")
        return False
    except cognito.exceptions.UserNotFoundException:
        pass  # User doesn't exist — create them
    except Exception as e:
        logger.error(f"Error checking Cognito user {email}: {e}")
        return False

    try:
        # Create the user — Cognito sends a welcome email with temp password
        user_attributes = [
            {"Name": "email", "Value": email},
            {"Name": "email_verified", "Value": "true"},
        ]
        if name:
            user_attributes.append({"Name": "name", "Value": name})

        cognito.admin_create_user(
            UserPoolId=USER_POOL_ID,
            Username=email,
            UserAttributes=user_attributes,
            DesiredDeliveryMediums=["EMAIL"],
            # Cognito auto-generates a temp password and emails it
        )
        logger.info(f"Created Cognito account for approved requester: {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to create Cognito user {email}: {e}")
        return False


# ---------------------------------------------------------------------------
# Route: POST /api/admin/documents
# ---------------------------------------------------------------------------
def create_document(event):
    """Create or update document metadata (admin only)."""
    if not is_admin(event):
        return cors_response(403, {"error": "Admin access required"})

    body = parse_body(event)
    doc_id = body.get("id") or new_id()
    now = now_iso()

    access_level = body.get("accessLevel", "public")
    name = body.get("name", "")

    item = {
        "PK": f"DOC#{doc_id}",
        "SK": "META",
        "GSI1PK": "DOCS",
        "GSI1SK": f"{access_level}#{name}",
        "documentId": doc_id,
        "name": name,
        "description": body.get("description", ""),
        "category": body.get("category", ""),
        "accessLevel": access_level,
        "fileType": body.get("fileType", "pdf"),
        "s3Key": body.get("s3Key", ""),
        "requiresNda": body.get("requiresNda", access_level == "gated"),
        "lastUpdated": now,
        "createdBy": get_user_from_token(event)["email"],
    }

    table.put_item(Item=item)

    return cors_response(201, {"message": "Document saved", "documentId": doc_id})


# ---------------------------------------------------------------------------
# Route: DELETE /api/admin/documents/:id
# ---------------------------------------------------------------------------
def delete_document(event, doc_id):
    """Delete document metadata (admin only). Does NOT delete the S3 file."""
    if not is_admin(event):
        return cors_response(403, {"error": "Admin access required"})

    table.delete_item(Key={"PK": f"DOC#{doc_id}", "SK": "META"})

    _write_audit_log("document_deleted", {
        "documentId": doc_id,
        "deletedBy": get_user_from_token(event)["email"],
    })

    return cors_response(200, {"message": "Document deleted", "documentId": doc_id})


# ---------------------------------------------------------------------------
# Route: GET /api/admin/audit-log
# ---------------------------------------------------------------------------
def get_audit_log(event):
    """Return recent audit log entries (admin only)."""
    if not is_admin(event):
        return cors_response(403, {"error": "Admin access required"})

    params = event.get("queryStringParameters") or {}
    limit = int(params.get("limit", "50"))

    # Query today and recent dates
    today = datetime.utcnow().strftime("%Y-%m-%d")

    try:
        resp = table.query(
            KeyConditionExpression="PK = :pk",
            ExpressionAttributeValues={":pk": f"AUDIT#{today}"},
            ScanIndexForward=False,
            Limit=limit,
        )
        entries = [
            {
                "action": item.get("action"),
                "details": item.get("details", {}),
                "timestamp": item.get("timestamp"),
                "ip": item.get("ip", ""),
            }
            for item in resp.get("Items", [])
        ]
        return cors_response(200, {"entries": entries, "date": today})
    except Exception as e:
        logger.error(f"get_audit_log error: {e}")
        return cors_response(500, {"error": "Failed to get audit log"})


# ---------------------------------------------------------------------------
# Audit log writer
# ---------------------------------------------------------------------------
def _write_audit_log(action, details):
    """Write an entry to the audit log partition."""
    now = now_iso()
    today = datetime.utcnow().strftime("%Y-%m-%d")
    entry_id = new_id()

    try:
        table.put_item(Item={
            "PK": f"AUDIT#{today}",
            "SK": f"{now}#{entry_id}",
            "action": action,
            "details": details,
            "timestamp": now,
        })
    except Exception as e:
        logger.error(f"Audit log write failed: {e}")


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------
def handler(event, context):
    """Main Lambda handler — routes requests by path and method."""
    http_method = event.get("httpMethod", "GET")
    path = event.get("path", "")

    # Strip stage prefix if present (e.g., /prod/api/... → /api/...)
    if f"/{STAGE}/" in path:
        path = path.split(f"/{STAGE}", 1)[1]

    logger.info(f"{http_method} {path}")

    try:
        # --- Public routes ---
        if path == "/api/config" and http_method == "GET":
            return get_config(event)

        if path == "/api/documents" and http_method == "GET":
            return list_documents(event)

        if path.startswith("/api/documents/") and path.endswith("/request-access") and http_method == "POST":
            doc_id = path.split("/")[3]
            return request_access(event, doc_id)

        if path.startswith("/api/documents/") and path.endswith("/download") and http_method == "GET":
            doc_id = path.split("/")[3]
            return download_document(event, doc_id)

        if path.startswith("/api/documents/") and http_method == "GET":
            doc_id = path.split("/")[3]
            return get_document(event, doc_id)

        # --- Webhook routes ---
        if path == "/api/webhook/esign" and http_method == "POST":
            return handle_esign_webhook(event)

        # --- Admin routes ---
        if path == "/api/admin/config" and http_method == "PUT":
            return update_config(event)

        if path == "/api/admin/documents" and http_method == "POST":
            return create_document(event)

        if path.startswith("/api/admin/documents/") and http_method == "DELETE":
            doc_id = path.split("/")[4]
            return delete_document(event, doc_id)

        if path == "/api/admin/requests" and http_method == "GET":
            return list_requests(event)

        if path.startswith("/api/admin/requests/") and http_method == "PUT":
            req_id = path.split("/")[4]
            return update_request(event, req_id)

        if path == "/api/admin/audit-log" and http_method == "GET":
            return get_audit_log(event)

        return cors_response(404, {"error": f"Route not found: {http_method} {path}"})

    except Exception as e:
        logger.error(f"Unhandled error: {e}", exc_info=True)
        return cors_response(500, {"error": "Internal server error"})
