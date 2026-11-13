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
exceptions = types.ModuleType("botocore.exceptions")
class FakeClientError(Exception):
    def __init__(self, code, reasons=None):
        self.response = {"Error": {"Code": code}}
        if reasons is not None:
            self.response["CancellationReasons"] = [{"Code": reason} for reason in reasons]
exceptions.ClientError = FakeClientError
spec = importlib.util.spec_from_file_location("api_handler", Path(os.environ.get("TRUST_HANDLER", str(Path(__file__).parent / "functions/api_handler.py"))))
api = importlib.util.module_from_spec(spec)
with patch.dict(sys.modules, {"boto3": fake, "botocore": types.ModuleType("botocore"), "botocore.exceptions": exceptions}):
    spec.loader.exec_module(api)


class FakeTable:
    def __init__(self):
        self.docs = {"pub": {"documentId": "pub", "name": "Public", "accessLevel": "public", "s3Key": "public.pdf"},
                     "secret": {"documentId": "secret", "name": "SECRET NAME", "description": "SECRET TEXT", "accessLevel": "gated", "s3Key": "secret.pdf"},
                     "unknown": {"documentId": "unknown", "name": "UNKNOWN SECRET", "s3Key": "hidden.pdf"}}
        for doc_id, doc in self.docs.items():
            doc.update(PK=f"DOC#{doc_id}", SK="META", generation=f"generation-{doc_id}")
        self.requests = []

    def get_item(self, Key, **kwargs):
        if Key["SK"] == "META":
            return {"Item": self.docs.get(Key["PK"].removeprefix("DOC#"))}
        return {"Item": next((r for r in self.requests if r.get("PK") == Key["PK"] and r.get("SK") == Key["SK"]), None)}

    def query(self, **kwargs):
        values = kwargs["ExpressionAttributeValues"]
        if values[":pk"] == "DOCS":
            return {"Items": list(self.docs.values())}
        return {"Items": [r for r in self.requests if r["PK"] == values[":pk"]]}

    def put_item(self, Item, **kwargs):
        if Item["PK"].startswith("DOC#"):
            if Item["SK"] == "META":
                self.docs[Item["documentId"]] = Item
            else:
                if any(r.get("PK") == Item["PK"] and r.get("SK") == Item["SK"] for r in self.requests):
                    raise FakeClientError("ConditionalCheckFailedException")
                self.requests.append(Item)

    def delete_item(self, Key):
        self.docs.pop(Key["PK"].removeprefix("DOC#"), None)

    def update_item(self, Key, **kwargs):
        item = self.get_item(Key)["Item"]
        values = kwargs["ExpressionAttributeValues"]
        if not item or any(item.get(field) != values[val] for field, val in
                           (("generation", ":generation"), ("requesterSub", ":subject"), ("requestId", ":request"), ("documentId", ":doc"), ("version", ":expected"))):
            raise FakeClientError("ConditionalCheckFailedException")
        item.update(version=values[":next"], status=values[":s"], updatedAt=values[":now"], reviewedBy=values[":by"], GSI1SK=values[":gsi"])

    def transact_write_items(self, TransactItems):
        check, update = (TransactItems[0]['ConditionCheck'], TransactItems[1]['Update'])
        unpack = lambda values: {k: v['S'] for k, v in values.items()}
        doc = self.get_item(unpack(check['Key']))['Item'] or {}
        cv = unpack(check['ExpressionAttributeValues'])
        if doc.get('generation') != cv[':generation'] or doc.get('documentId') != cv[':doc']:
            raise FakeClientError('TransactionCanceledException', ['ConditionalCheckFailed', 'None'])
        try:
            self.update_item(unpack(update['Key']), ExpressionAttributeValues=unpack(update['ExpressionAttributeValues']))
        except FakeClientError:
            raise FakeClientError('TransactionCanceledException', ['None', 'ConditionalCheckFailed'])


class AccessTests(unittest.TestCase):
    def setUp(self):
        api.table = FakeTable()
        api.ddb_client = api.table
        api.s3 = Mock()
        api.s3.generate_presigned_url.return_value = "https://signed.example/file"

    def call(self, method, path, sub=None, email="a@example.test", groups="", body=None):
        claims = {"sub": sub, "email": email, "cognito:groups": groups} if sub else {}
        event = {"httpMethod": method, "path": path, "requestContext": {"authorizer": {"claims": claims}}, "body": json.dumps(body or {})}
        if method == "PUT" and path.startswith("/api/admin/requests/") and "expectedVersion" not in (body or {}):
            req = next((r for r in api.table.requests if r.get("requestId") == path.rsplit("/", 1)[-1]), {})
            event["body"] = json.dumps({**(body or {}), "expectedVersion": req.get("version", "missing")})
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
        self.assertEqual(self.call("GET", "/api/documents/pub/download")[0], 503)
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
        self.assertEqual(self.call("GET", "/api/private/documents/secret/download", sub="alice")[0], 404)
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

    def test_canonical_read_is_consistent_and_legacy_duplicate_never_grants(self):
        api.table.requests.append({'PK': 'DOC#secret', 'SK': 'REQUEST#old', 'requesterSub': 'alice', 'status': 'approved'})
        original = api.table.get_item
        api.table.get_item = Mock(side_effect=original)
        self.assertEqual(self.call('GET', '/api/private/documents/secret/download', sub='alice')[0], 404)
        self.assertTrue(all(c.kwargs['ConsistentRead'] for c in api.table.get_item.call_args_list))

    def test_duplicate_revocation_and_recreation(self):
        path = '/api/private/documents/secret/request-access'
        status, result = self.call('POST', path, sub='alice')
        self.assertEqual(status, 201)
        request_id = result['requestId']
        admin = '/api/admin/requests/' + request_id
        decision = lambda status: self.call('PUT', admin, sub='admin', groups='admins', body={'documentId': 'secret', 'status': status})[0]
        self.assertEqual(decision('approved'), 200)
        self.assertEqual(self.call('POST', path, sub='alice')[0], 409)
        api.table.requests.append({'PK': 'DOC#secret', 'SK': 'REQUEST#legacy', 'requesterSub': 'alice', 'status': 'approved'})
        self.assertEqual(decision('denied'), 200)
        self.assertEqual(self.call('GET', '/api/private/documents/secret/download', sub='alice')[0], 404)
        self.assertEqual(self.call('POST', path, sub='alice')[0], 409)
        self.assertEqual(self.call('DELETE', '/api/admin/documents/secret', sub='admin', groups='admins')[0], 200)
        self.assertEqual(self.call('POST', '/api/admin/documents', sub='admin', groups='admins', body={'id': 'secret', 'name': 'new', 'accessLevel': 'gated', 's3Key': 'new.pdf'})[0], 201)
        self.assertEqual(decision('approved'), 409)
        self.assertEqual(self.call('GET', '/api/private/documents/secret/download', sub='alice')[0], 404)
        self.assertEqual(self.call('POST', path, sub='alice')[0], 201)

    def test_legacy_and_metadata_save_fail_closed(self):
        del api.table.docs['secret']['generation']
        self.assertEqual(self.call('POST', '/api/private/documents/secret/request-access', sub='alice')[0], 409)
        self.assertEqual(self.call('PUT', '/api/admin/requests/missing', sub='admin', groups='admins', body={'documentId': 'secret', 'status': 'approved'})[0], 409)
        body = {'id': 'secret', 'name': 'secret', 'accessLevel': 'gated', 's3Key': 'secret.pdf'}
        self.assertEqual(self.call('POST', '/api/admin/documents', sub='admin', groups='admins', body=body)[0], 201)
        status, result = self.call('POST', '/api/private/documents/secret/request-access', sub='alice')
        self.assertEqual(status, 201)
        self.assertEqual(self.call('PUT', '/api/admin/requests/' + result['requestId'], sub='admin', groups='admins', body={'documentId': 'secret', 'status': 'approved'})[0], 200)
        self.assertEqual(self.call('POST', '/api/admin/documents', sub='admin', groups='admins', body=body)[0], 201)
        self.assertEqual(self.call('GET', '/api/private/documents/secret', sub='alice')[0], 404)

    def test_identity_encoding_and_tampered_canonical_record(self):
        self.assertNotEqual(api.authorization_id('a#b', 'c'), api.authorization_id('a', 'b#c'))
        self.assertNotEqual(api.authorization_id('g', 'Alice'), api.authorization_id('g', 'alice'))
        status, result = self.call('POST', '/api/private/documents/secret/request-access', sub='alice')
        self.assertEqual(status, 201)
        request = api.table.requests[0]
        request['status'] = 'approved'
        for field, value in [('requesterSub', 'bob'), ('documentId', 'pub'), ('generation', 'old'), ('requestId', 'forged')]:
            old = request[field]
            request[field] = value
            self.assertEqual(self.call('GET', '/api/private/documents/secret/download', sub='alice')[0], 404)
            self.assertEqual(self.call('PUT', '/api/admin/requests/' + result['requestId'], sub='admin', groups='admins', body={'documentId': 'secret', 'status': 'approved'})[0], 409)
            request[field] = old

    def test_conditional_creation_rejects_losing_concurrent_writer(self):
        original = api.table.put_item
        def losing_write(Item, **kwargs):
            if kwargs.get('ConditionExpression'):
                raise FakeClientError('ConditionalCheckFailedException')
            return original(Item, **kwargs)
        api.table.put_item = losing_write
        self.assertEqual(self.call('POST', '/api/private/documents/secret/request-access', sub='alice')[0], 409)
        self.assertEqual(api.table.requests, [])

    def test_document_listing_fails_explicitly_if_incomplete(self):
        docs = api.table.docs
        api.table.query = Mock(side_effect=[
            {"Items": [docs["pub"]], "LastEvaluatedKey": {"PK": "DOC#pub", "SK": "META"}},
            {"Items": [docs["secret"], docs["unknown"]]},
        ])
        status, result = self.call("GET", "/api/documents")
        self.assertEqual(status, 503)
        self.assertIn('pagination is not yet available', result['error'])
        self.assertNotIn('documents', result)
        self.assertEqual(api.table.query.call_count, 1)
        self.assertEqual(api.table.query.call_args.kwargs['Limit'], 50)

    def test_transaction_conflict_is_retryable(self):
        _, result = self.call('POST', '/api/private/documents/secret/request-access', sub='alice')
        request_id = result['requestId']
        api.ddb_client = Mock()
        api.ddb_client.transact_write_items.side_effect = FakeClientError('TransactionCanceledException', ['None', 'TransactionConflict'])
        status, result = self.call('PUT', '/api/admin/requests/' + request_id, sub='admin', groups='admins', body={'documentId': 'secret', 'status': 'approved'})
        self.assertEqual(status, 409)
        self.assertTrue(result['retryable'])
        self.assertIn('refresh and retry', result['error'])

    def test_private_route_without_subject_cannot_access_or_request(self):
        api.table.requests.append({"PK": "DOC#secret", "requesterSub": "alice", "status": "approved"})
        for method, suffix in (("GET", ""), ("GET", "/download"), ("POST", "/request-access")):
            status, result = self.call(method, "/api/private/documents/secret" + suffix)
            self.assertIn(status, (401, 404))
            self.assertNotIn("SECRET", str(result))
        api.s3.generate_presigned_url.assert_not_called()

    def test_stale_approve_loses_to_interleaved_denial(self):
        _, result = self.call('POST', '/api/private/documents/secret/request-access', sub='alice')
        request = api.table.requests[0]
        old = request['version']
        original = api.table.update_item
        def interleave(Key, **kwargs):
            request.update(status='denied', version='newer')
            return original(Key, **kwargs)
        api.table.update_item = interleave
        status, _ = self.call('PUT', '/api/admin/requests/' + result['requestId'], sub='admin', groups='admins', body={'documentId': 'secret', 'status': 'approved', 'expectedVersion': old})
        self.assertEqual(status, 409)
        self.assertEqual((request['status'], request['version']), ('denied', 'newer'))

    def test_no_signing_even_with_public_to_private_interleaving_or_admin(self):
        original = api.table.get_item
        def interleave(Key, **kwargs):
            result = original(Key, **kwargs)
            if Key['SK'] == 'META' and Key['PK'] == 'DOC#pub':
                snapshot = dict(result['Item'])
                api.table.docs['pub'].update(accessLevel='gated', generation='replacement')
                return {'Item': snapshot}
            return result
        api.table.get_item = interleave
        self.assertEqual(self.call('GET', '/api/documents/pub/download')[0], 503)
        self.assertEqual(self.call('GET', '/api/private/documents/secret/download', sub='admin', groups='admins')[0], 404)
        api.s3.generate_presigned_url.assert_not_called()

    def test_no_signing_after_interleaved_denial_or_deletion(self):
        for action in ('deny', 'delete', 'replace'):
            with self.subTest(action=action):
                self.setUp()
                self.call('POST', '/api/private/documents/secret/request-access', sub='alice')
                api.table.requests[0]['status'] = 'approved'
                original = api.table.get_item
                def interleave(Key, **kwargs):
                    result = original(Key, **kwargs)
                    if Key['SK'] == 'META':
                        snapshot = dict(result['Item'])
                        if action == 'deny': api.table.requests[0]['status'] = 'denied'
                        elif action == 'delete': api.table.docs.pop('secret')
                        else: api.table.docs['secret']['generation'] = 'new-incarnation'
                        return {'Item': snapshot}
                    return result
                api.table.get_item = interleave
                self.assertEqual(self.call('GET', '/api/private/documents/secret/download', sub='alice')[0], 404)
                api.s3.generate_presigned_url.assert_not_called()

    def test_old_version_rejected_after_aba_and_missing_version_rejected(self):
        _, result = self.call('POST', '/api/private/documents/secret/request-access', sub='alice')
        req = api.table.requests[0]
        old = req['version']
        path = '/api/admin/requests/' + result['requestId']
        for status in ('approved', 'denied', 'approved'):
            self.assertEqual(self.call('PUT', path, sub='admin', groups='admins', body={'documentId': 'secret', 'status': status})[0], 200)
        self.assertEqual(self.call('PUT', path, sub='admin', groups='admins', body={'documentId': 'secret', 'status': 'denied', 'expectedVersion': old})[0], 409)
        event = {'requestContext': {'authorizer': {'claims': {'cognito:groups': 'admins'}}}, 'body': json.dumps({'documentId': 'secret', 'status': 'denied'})}
        self.assertEqual(api.update_request(event, result['requestId'])['statusCode'], 400)

    def test_request_listing_paginates_filtered_and_unfiltered(self):
        for status_filter in ('', 'pending'):
            with self.subTest(status=status_filter):
                key = {'PK': 'DOC#x', 'SK': 'REQUEST#y', 'GSI1PK': 'REQUESTS', 'GSI1SK': 'pending#time'}
                api.table.query = Mock(side_effect=[{'Items': [{'requestId': 'one'}], 'LastEvaluatedKey': key}, {'Items': [{'requestId': 'two'}]}])
                event = {'requestContext': {'authorizer': {'claims': {'sub': 'admin', 'cognito:groups': 'admins'}}}, 'queryStringParameters': {'status': status_filter}}
                response = api.list_requests(event)
                page = json.loads(response['body'])
                self.assertEqual([r['requestId'] for r in page['requests']], ['one'])
                self.assertEqual(api.table.query.call_count, 1)
                self.assertEqual(api.table.query.call_args.kwargs['Limit'], 50)
                event['queryStringParameters']['cursor'] = page['nextCursor']
                page = json.loads(api.list_requests(event)['body'])
                self.assertEqual([r['requestId'] for r in page['requests']], ['two'])
                self.assertIsNone(page['nextCursor'])
                self.assertEqual(api.table.query.call_args_list[1].kwargs['ExclusiveStartKey'], key)

    def test_decision_document_replacement_or_deletion_at_commit_fails(self):
        for action in ('replace', 'delete'):
            with self.subTest(action=action):
                self.setUp()
                _, result = self.call('POST', '/api/private/documents/secret/request-access', sub='alice')
                original = api.table.transact_write_items
                def interleave(**kwargs):
                    if action == 'replace': api.table.docs['secret']['generation'] = 'replacement'
                    else: del api.table.docs['secret']
                    return original(**kwargs)
                api.table.transact_write_items = interleave
                status, _ = self.call('PUT', '/api/admin/requests/' + result['requestId'], sub='admin', groups='admins', body={'documentId': 'secret', 'status': 'approved'})
                self.assertEqual(status, 409)
                self.assertEqual(api.table.requests[0]['status'], 'pending')

    def test_invalid_cursor_and_filter_fail_before_query(self):
        api.table.query = Mock()
        event = {'requestContext': {'authorizer': {'claims': {'cognito:groups': 'admins'}}}}
        for query in ({'status': 'bogus'}, {'cursor': '!!!'}, {'cursor': 'x' * 4097}):
            event['queryStringParameters'] = query
            self.assertEqual(api.list_requests(event)['statusCode'], 400)
        api.table.query.assert_not_called()

    def test_reference_artifacts_match_deployed_sources(self):
        root = Path(__file__).resolve().parents[1]
        reference = root / "skills/trust-center/references"
        for source, copy in ((root / "backend/functions/api_handler.py", reference / "api-handler.py"),
                             (root / "infrastructure/template.yaml", reference / "infrastructure-template.yaml"),
                             (root / "frontend/src/main.jsx", reference / "frontend-files/src/main.jsx"),
                             (root / "frontend/src/pages/TrustCenter.jsx", reference / "frontend-files/src/pages/TrustCenter.jsx"),
                             (root / "frontend/src/pages/LoginPage.jsx", reference / "frontend-files/src/pages/LoginPage.jsx"),
                             (root / "frontend/src/pages/RequesterAccess.jsx", reference / "frontend-files/src/pages/RequesterAccess.jsx"),
                             (root / "frontend/src/pages/AdminDashboard.jsx", reference / "frontend-files/src/pages/AdminDashboard.jsx"),
                             (root / "frontend/src/hooks/useAuth.jsx", reference / "frontend-files/src/hooks/useAuth.jsx"),
                             (root / "frontend/src/utils/api.js", reference / "frontend-files/src/utils/api.js")):
            self.assertEqual(source.read_bytes(), copy.read_bytes(), str(copy))

    def test_admin_group_is_exact(self):
        self.assertEqual(self.call("GET", "/api/admin/requests", sub="user", groups="not-admins")[0], 403)
        self.assertEqual(self.call("GET", "/api/admin/requests", sub="user", groups="[admins]")[0], 200)


if __name__ == "__main__":
    unittest.main()
