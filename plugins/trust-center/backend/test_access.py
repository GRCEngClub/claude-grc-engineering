"""Offline Lambda-route security tests; no AWS account or network needed."""
import importlib.util
import json
import os
import sys
import types
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

os.environ.update(AWS_DEFAULT_REGION="us-east-1", AWS_ACCESS_KEY_ID="testing", AWS_SECRET_ACCESS_KEY="testing", AWS_EC2_METADATA_DISABLED="true")
# The Lambda runtime provides boto3; tests stub it before loading the handler.
fake = types.ModuleType("boto3")
fake.resource = Mock()
fake.client = Mock()
sys.modules["boto3"] = fake
exceptions = types.ModuleType("botocore.exceptions")
exceptions.ClientError = type("ClientError", (Exception,), {})
sys.modules["botocore"] = types.ModuleType("botocore")
sys.modules["botocore.exceptions"] = exceptions
spec = importlib.util.spec_from_file_location("api_handler", Path(__file__).parent / "functions/api_handler.py")
api = importlib.util.module_from_spec(spec)
spec.loader.exec_module(api)


class FakeTable:
    def __init__(self):
        self.docs = {"pub": {"documentId": "pub", "name": "Public", "accessLevel": "public", "s3Key": "public.pdf"},
                     "secret": {"documentId": "secret", "name": "SECRET NAME", "description": "SECRET TEXT", "accessLevel": "gated", "s3Key": "secret.pdf"},
                     "unknown": {"documentId": "unknown", "name": "UNKNOWN SECRET", "s3Key": "hidden.pdf"}}
        for doc_id, doc in self.docs.items():
            doc.update(PK=f"DOC#{doc_id}", SK="META")
        self.requests = []

    def get_item(self, Key, **kwargs):
        return {"Item": self.docs.get(Key["PK"].removeprefix("DOC#"))}

    def query(self, **kwargs):
        values = kwargs["ExpressionAttributeValues"]
        if values[":pk"] == "DOCS":
            return {"Items": list(self.docs.values())}
        return {"Items": [r for r in self.requests if r["PK"] == values[":pk"]]}

    def put_item(self, Item):
        if Item["PK"].startswith("DOC#"):
            self.requests.append(Item)


class AccessTests(unittest.TestCase):
    def setUp(self):
        api.table = FakeTable()
        api.s3 = Mock()
        api.s3.generate_presigned_url.return_value = "https://signed.example/file"

    def call(self, method, path, sub=None, email="a@example.test", groups="", body=None):
        claims = {"sub": sub, "email": email, "cognito:groups": groups} if sub else {}
        event = {"httpMethod": method, "path": path, "requestContext": {"authorizer": {"claims": claims}}, "body": json.dumps(body or {})}
        response = api.handler(event, None)
        return response["statusCode"], json.loads(response.get("body", "{}"))

    def test_public_never_exposes_private_metadata_or_file_even_if_claims_are_supplied(self):
        status, result = self.call("GET", "/api/documents", sub="alice")
        self.assertEqual(status, 200)
        self.assertEqual([x["id"] for x in result["documents"]], ["pub"])
        for doc in ("secret", "unknown"):
            for suffix in ("", "/download"):
                status, result = self.call("GET", f"/api/documents/{doc}{suffix}", sub="alice")
                self.assertEqual(status, 404)
                self.assertNotIn("SECRET", str(result))
        self.assertEqual(self.call("GET", "/api/documents/pub/download")[0], 200)
        self.assertNotIn("s3Key", self.call("GET", "/api/documents/pub")[1])

    def test_stale_public_index_does_not_expose_private_metadata(self):
        original_query = api.table.query

        def stale_query(**kwargs):
            result = original_query(**kwargs)
            if kwargs['ExpressionAttributeValues'][':pk'] == 'DOCS':
                result['Items'] = [dict(item, accessLevel='public') for item in result['Items']]
            return result

        api.table.query = stale_query
        status, result = self.call('GET', '/api/documents')
        self.assertEqual(status, 200)
        self.assertEqual([item['id'] for item in result['documents']], ['pub'])
        self.assertNotIn('SECRET', json.dumps(result))

    def test_authenticated_approval_bound_to_subject_and_document(self):
        self.assertEqual(self.call("POST", "/api/documents/secret/request-access", body={"email": "victim@example.test"})[0], 401)
        status, result = self.call("POST", "/api/private/documents/secret/request-access", sub="alice", email="alice@example.test", body={"email": "victim@example.test"})
        self.assertEqual(status, 201)
        request = api.table.requests[0]
        self.assertEqual((request["requesterSub"], request["requesterEmail"]), ("alice", "alice@example.test"))
        request["status"] = "approved"
        self.assertEqual(self.call("GET", "/api/private/documents/secret/download", sub="bob", email="alice@example.test")[0], 404)
        self.assertEqual(self.call("GET", "/api/private/documents/secret", sub="bob")[0], 404)
        self.assertEqual(self.call("GET", "/api/private/documents/secret", sub="alice")[0], 200)
        self.assertEqual(self.call("GET", "/api/private/documents/secret/download", sub="alice")[0], 200)
        self.assertEqual(self.call("GET", "/api/private/documents/unknown/download", sub="alice")[0], 404)
        request["status"] = "denied"
        self.assertEqual(self.call("GET", "/api/private/documents/secret/download", sub="alice")[0], 404)

    def test_missing_file_does_not_disclose_private_document(self):
        api.table.docs['secret']['s3Key'] = ''
        status, result = self.call('GET', '/api/documents/secret/download')
        self.assertEqual((status, result), (404, {'error': 'Document not found'}))

    def test_private_alias_cannot_reach_admin_and_stage_prefix_is_anchored(self):
        self.assertEqual(self.call('GET', '/api/private/admin/requests', sub='alice', groups='admins')[0], 404)
        self.assertEqual(self.call('GET', '/api/unrelated/prod/api/admin/requests', sub='alice', groups='admins')[0], 404)
        self.assertEqual(self.call('GET', '/prod/api/documents')[0], 200)

    def test_exact_routes_reject_extra_empty_or_wrong_method_segments(self):
        cases = [
            ('GET', '/api/documents/pub/extra'),
            ('GET', '/api/documents/pub/extra/download'),
            ('GET', '/api/documents//download'),
            ('GET', '/api/documents/pub/download/'),
            ('POST', '/api/private/documents/secret/extra/request-access'),
            ('POST', '/api/private/documents//request-access'),
            ('DELETE', '/api/admin/documents/pub/extra'),
            ('DELETE', '/api/admin/documents/'),
            ('PUT', '/api/admin/requests/request/extra'),
            ('PUT', '/api/admin/requests/'),
            ('POST', '/api/documents/pub/download'),
            ('GET', '/api/private/admin/requests'),
        ]
        handlers = ('get_document', 'download_document', 'request_access', 'delete_document', 'update_request')
        with patch.multiple(api, **{name: Mock() for name in handlers}) as mocks:
            for method, path in cases:
                with self.subTest(method=method, path=path):
                    self.assertEqual(self.call(method, path, sub='alice', groups='admins')[0], 404)
            for mock in mocks.values():
                mock.assert_not_called()

    def test_exact_routes_dispatch_expected_ids_and_preserve_identity_boundary(self):
        response = api.cors_response(200, {})
        cases = [
            ('GET', '/api/documents/pub', 'get_document', 'pub', False),
            ('GET', '/prod/api/documents/pub/download', 'download_document', 'pub', False),
            ('POST', '/api/private/documents/secret/request-access', 'request_access', 'secret', True),
            ('DELETE', '/api/admin/documents/pub', 'delete_document', 'pub', False),
            ('PUT', '/api/admin/requests/req', 'update_request', 'req', False),
        ]
        for method, path, name, identifier, private in cases:
            with self.subTest(path=path), patch.object(api, name, return_value=response) as target:
                self.assertEqual(self.call(method, path, sub='alice', groups='admins')[0], 200)
                event, actual_id = target.call_args.args
                self.assertEqual(actual_id, identifier)
                self.assertEqual(event['_private_route'], private)
                if not private and '/admin/' not in path:
                    self.assertEqual(event['requestContext'], {})

    def test_approval_query_paginates_and_uses_consistent_reads(self):
        api.table.query = Mock(side_effect=[{'Items': [], 'LastEvaluatedKey': {'PK': 'DOC#secret', 'SK': 'REQUEST#1'}},
                                             {'Items': [{'requesterSub': 'alice', 'status': 'approved'}]}])
        self.assertEqual(self.call('GET', '/api/private/documents/secret/download', sub='alice')[0], 200)
        self.assertTrue(all(call.kwargs['ConsistentRead'] for call in api.table.query.call_args_list))
        self.assertIn('ExclusiveStartKey', api.table.query.call_args_list[1].kwargs)

    def test_document_listing_paginates_and_filters_each_page(self):
        docs = api.table.docs
        api.table.query = Mock(side_effect=[
            {"Items": [docs["pub"]], "LastEvaluatedKey": {"PK": "DOC#pub", "SK": "META"}},
            {"Items": [docs["secret"], docs["unknown"]]},
        ])
        status, result = self.call("GET", "/api/documents")
        self.assertEqual(status, 200)
        self.assertEqual([d["id"] for d in result["documents"]], ["pub"])
        self.assertIn("ExclusiveStartKey", api.table.query.call_args_list[1].kwargs)

    def test_private_route_without_subject_cannot_access_or_request(self):
        api.table.requests.append({"PK": "DOC#secret", "requesterSub": "alice", "status": "approved"})
        for method, suffix in (("GET", ""), ("GET", "/download"), ("POST", "/request-access")):
            status, result = self.call(method, "/api/private/documents/secret" + suffix)
            self.assertIn(status, (401, 404))
            self.assertNotIn("SECRET", str(result))
        api.s3.generate_presigned_url.assert_not_called()

    def test_reference_artifacts_match_deployed_sources(self):
        root = Path(__file__).resolve().parents[1]
        reference = root / "skills/trust-center/references"
        for source, copy in ((root / "backend/functions/api_handler.py", reference / "api-handler.py"),
                             (root / "infrastructure/template.yaml", reference / "infrastructure-template.yaml"),
                             (root / "frontend/src/pages/TrustCenter.jsx", reference / "frontend-files/src/pages/TrustCenter.jsx"),
                             (root / "frontend/src/pages/AdminDashboard.jsx", reference / "frontend-files/src/pages/AdminDashboard.jsx"),
                             (root / "frontend/src/hooks/useAuth.jsx", reference / "frontend-files/src/hooks/useAuth.jsx"),
                             (root / "frontend/src/utils/api.js", reference / "frontend-files/src/utils/api.js")):
            self.assertEqual(source.read_bytes(), copy.read_bytes(), str(copy))

    def test_admin_group_is_exact(self):
        self.assertEqual(self.call("GET", "/api/admin/requests", sub="user", groups="not-admins")[0], 403)
        self.assertEqual(self.call("GET", "/api/admin/requests", sub="user", groups="[admins]")[0], 200)


if __name__ == "__main__":
    unittest.main()
