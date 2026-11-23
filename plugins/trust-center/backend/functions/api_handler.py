import json
import os
import uuid
import time
import hmac
import hashlib
import logging
from datetime import datetime, timedelta
from decimal import Decimal

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
s3 = boto3.client("s3")
cognito = boto3.client("cognito-idp")

TABLE_NAME = os.environ.get("TABLE_NAME", "trust-center-documents-prod")
DOCUMENTS_BUCKET = os.environ.get("DOCUMENTS_BUCKET", "trust-center-docs-prod")
USER_POOL_ID = os.environ.get("USER_POOL_ID", "")
COMPANY_NAME = os.environ.get("COMPANY_NAME", "Accountable CRM")
STAGE = os.environ.get("STAGE", "prod")
WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET", "")

table = dynamodb.Table(TABLE_NAME)

def cors_response(status_code, body=None, headers=None):
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
    body = event.get("body", "{}")
    if body is None:
        return {}
    if isinstance(body, str):
        return json.loads(body)
    return body


def get_user_from_token(event):
    claims = (event.get("requestContext", {})
                   .get("authorizer", {})
                   .get("claims", {}))
    return {
        "email": claims.get("email", "anonymous"),
        "sub": claims.get("sub", ""),
        "groups": claims.get("cognito:groups", ""),
    }


def is_admin(event):
    user = get_user_from_token(event)
    groups = user.get("groups", "")
    return "admins" in groups


def now_iso():
    return datetime.utcnow().isoformat() + "Z"


def new_id():
    return str(uuid.uuid4())


def verify_webhook_signature(event):
    if not WEBHOOK_SECRET:
        logger.error("WEBHOOK_SECRET not configured")
        return False
    raw_body = event.get("body") or ""
    if isinstance(raw_body, str):
        raw_body = raw_body.encode()
    expected = hmac.new(
        WEBHOOK_SECRET.encode(), raw_body, hashlib.sha256
    ).hexdigest()
    received = (event.get("headers") or {}).get("X-Webhook-Signature", "")
    return hmac.compare_digest(expected, received)


def handle_webhook(event):
    if not verify_webhook_signature(event):
        logger.warning("Webhook signature verification failed")
        return cors_response(401, {"error": "Invalid webhook signature"})

    body = parse_body(event)
    event_type = body.get("event", "")
    logger.info(f"Webhook received: {event_type}")

    _write_audit_log("webhook_received", {"event": event_type})
    return cors_response(200, {"message": "Webhook processed"})


def get_config(event):
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


def update_config(event):
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


def list_documents(event):
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

            if access_level == "public" or is_authenticated:
                doc["downloadable"] = access_level == "public"
            else:
                doc["downloadable"] = False

            documents.append(doc)

        return cors_response(200, {"documents": documents})
    except Exception as e:
        logger.error(f"list_documents error: {e}")
        return cors_response(500, {"error": "Failed to list documents"})


def get_document(event, doc_id):
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


def request_access(event, doc_id):
    body = parse_body(event)
    now = now_iso()
    req_id = new_id()

    requester_email = body.get("email", "")
    requester_name = body.get("name", "")
    requester_company = body.get("company", "")
    reason = body.get("reason", "")

    if not requester_email:
        return cors_response(400, {"error": "Email is required"})

    doc_resp = table.get_item(Key={"PK": f"DOC#{doc_id}", "SK": "META"})
    doc = doc_resp.get("Item")
    if not doc:
        return cors_response(404, {"error": "Document not found"})

    if doc.get("accessLevel") == "public":
        return cors_response(400, {"error": "Document is publicly available, no request needed"})

    item = {
        "PK": f"DOC#{doc_id}",
        "SK": f"REQUEST#{req_id}",
        "GSI1PK": "REQUESTS",
        "GSI1SK": f"pending#{now}",
        "requestId": req_id,
        "documentId": doc_id,
        "documentName": doc.get("name", ""),
        "requesterEmail": requester_email,
        "requesterName": requester_name,
        "requesterCompany": requester_company,
        "reason": reason,
        "status": "pending",
        "ndaSigned": False,
        "createdAt": now,
        "updatedAt": now,
    }

    table.put_item(Item=item)

    _write_audit_log("access_requested", {
        "documentId": doc_id,
        "requestId": req_id,
        "requesterEmail": requester_email,
    })

    return cors_response(201, {
        "message": "Access request submitted",
        "requestId": req_id,
        "status": "pending",
    })


def download_document(event, doc_id):
    doc_resp = table.get_item(Key={"PK": f"DOC#{doc_id}", "SK": "META"})
    doc = doc_resp.get("Item")
    if not doc:
        return cors_response(404, {"error": "Document not found"})

    access_level = doc.get("accessLevel", "public")
    s3_key = doc.get("s3Key")

    if not s3_key:
        return cors_response(404, {"error": "Document file not found"})

    if access_level != "public":
        user = get_user_from_token(event)
        if not user.get("sub"):
            return cors_response(401, {"error": "Authentication required"})
        email = user.get("email", "")

        if not is_admin(event):
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

    try:
        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": DOCUMENTS_BUCKET, "Key": s3_key},
            ExpiresIn=3600,
        )
    except ClientError as e:
        logger.error(f"Presigned URL error: {e}")
        return cors_response(500, {"error": "Failed to generate download link"})

    user = get_user_from_token(event)
    _write_audit_log("document_downloaded", {
        "documentId": doc_id,
        "documentName": doc.get("name", ""),
        "downloadedBy": user.get("email", "anonymous"),
    })

    return cors_response(200, {"downloadUrl": url, "expiresIn": 3600})


def list_requests(event):
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


def update_request(event, request_id):
    if not is_admin(event):
        return cors_response(403, {"error": "Admin access required"})

    body = parse_body(event)
    new_status = body.get("status")
    doc_id = body.get("documentId")

    if new_status not in ("approved", "denied"):
        return cors_response(400, {"error": "Status must be 'approved' or 'denied'"})

    if not doc_id:
        return cors_response(400, {"error": "documentId is required"})

    now = now_iso()
    admin_user = get_user_from_token(event)

    try:
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

        _write_audit_log(f"request_{new_status}", {
            "requestId": request_id,
            "documentId": doc_id,
            "reviewedBy": admin_user["email"],
        })

        return cors_response(200, {
            "message": f"Request {new_status}",
            "requestId": request_id,
        })
    except Exception as e:
        logger.error(f"update_request error: {e}")
        return cors_response(500, {"error": "Failed to update request"})


def create_document(event):
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


def delete_document(event, doc_id):
    if not is_admin(event):
        return cors_response(403, {"error": "Admin access required"})

    key = {"PK": f"DOC#{doc_id}", "SK": "META"}
    s3_key = table.get_item(Key=key).get("Item", {}).get("s3Key")
    if s3_key:
        s3.delete_object(Bucket=DOCUMENTS_BUCKET, Key=s3_key)
    table.delete_item(Key=key)

    _write_audit_log("document_deleted", {
        "documentId": doc_id,
        "deletedBy": get_user_from_token(event)["email"],
    })

    return cors_response(200, {"message": "Document deleted", "documentId": doc_id})


def get_audit_log(event):
    if not is_admin(event):
        return cors_response(403, {"error": "Admin access required"})

    params = event.get("queryStringParameters") or {}
    limit = int(params.get("limit", "50"))
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    start_str = params.get("start_date", today_str)
    end_str = params.get("end_date", today_str)

    try:
        start_dt = datetime.strptime(start_str, "%Y-%m-%d")
        end_dt = datetime.strptime(end_str, "%Y-%m-%d")
    except ValueError:
        return cors_response(400, {"error": "Invalid date format; use YYYY-MM-DD"})

    if start_dt > end_dt:
        return cors_response(400, {"error": "start_date must be <= end_date"})

    entries = []
    try:
        current = start_dt
        while current <= end_dt:
            date_str = current.strftime("%Y-%m-%d")
            resp = table.query(
                KeyConditionExpression="PK = :pk",
                ExpressionAttributeValues={":pk": f"AUDIT#{date_str}"},
                ScanIndexForward=False,
                Limit=limit,
            )
            for item in resp.get("Items", []):
                entries.append({
                    "action": item.get("action"),
                    "details": item.get("details", {}),
                    "timestamp": item.get("timestamp"),
                    "ip": item.get("ip", ""),
                    "date": date_str,
                })
            current += timedelta(days=1)

        entries.sort(key=lambda e: e.get("timestamp", ""), reverse=True)
        return cors_response(200, {
            "entries": entries,
            "start_date": start_str,
            "end_date": end_str,
        })
    except Exception as e:
        logger.error(f"get_audit_log error: {e}")
        return cors_response(500, {"error": "Failed to get audit log"})


def _write_audit_log(action, details):
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


def handler(event, context):
    http_method = event.get("httpMethod", "GET")
    path = event.get("path", "")

    if f"/{STAGE}/" in path:
        path = path.split(f"/{STAGE}", 1)[1]

    logger.info(f"{http_method} {path}")

    try:
        if path == "/api/webhook" and http_method == "POST":
            return handle_webhook(event)

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
