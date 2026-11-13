"""Offline botocore Stubber checks for the actual low-level DynamoDB wire shapes."""
import importlib.util
import json
import os
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

os.environ.update(AWS_DEFAULT_REGION='us-east-1', AWS_ACCESS_KEY_ID='testing', AWS_SECRET_ACCESS_KEY='testing', AWS_EC2_METADATA_DISABLED='true')
try:
    import boto3
    from botocore.stub import Stubber
except ImportError:
    boto3 = None
    Stubber = None


@unittest.skipIf(boto3 is None, 'boto3 is required for SDK shape tests')
class SdkShapeTests(unittest.TestCase):
    def test_transaction_and_cancellation_for_both_copies(self):
        root = Path(__file__).resolve().parents[1]
        for path in (root / 'backend/functions/api_handler.py', root / 'skills/trust-center/references/api-handler.py'):
            for failure in (False, True):
                with self.subTest(path=path, failure=failure):
                    spec = importlib.util.spec_from_file_location('sdk_handler', path)
                    api = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(api)
                    client = boto3.client('dynamodb', region_name='us-east-1')
                    api.ddb_client = client
                    req_id = api.authorization_id('gen', 'alice')
                    request = {'requestId': req_id, 'documentId': 'doc', 'generation': 'gen', 'requesterSub': 'alice', 'version': 'v1'}
                    api.table = Mock()
                    api.table.get_item.side_effect = [{'Item': request}, {'Item': {'documentId': 'doc', 'generation': 'gen'}}]
                    av = lambda d: {k: {'S': v} for k, v in d.items()}
                    expected = {'TransactItems': [
                        {'ConditionCheck': {'TableName': api.TABLE_NAME, 'Key': av({'PK': 'DOC#doc', 'SK': 'META'}), 'ConditionExpression': 'generation = :generation AND documentId = :doc', 'ExpressionAttributeValues': av({':generation': 'gen', ':doc': 'doc'})}},
                        {'Update': {'TableName': api.TABLE_NAME, 'Key': av({'PK': 'DOC#doc', 'SK': 'REQUEST#' + req_id}), 'ConditionExpression': 'generation = :generation AND requesterSub = :subject AND requestId = :request AND documentId = :doc AND #v = :expected', 'UpdateExpression': 'SET #v = :next, #s = :s, updatedAt = :now, reviewedBy = :by, GSI1SK = :gsi', 'ExpressionAttributeNames': {'#s': 'status', '#v': 'version'}, 'ExpressionAttributeValues': av({':expected': 'v1', ':next': 'v2', ':generation': 'gen', ':subject': 'alice', ':request': req_id, ':doc': 'doc', ':s': 'approved', ':now': 'timestamp', ':by': 'admin@example.test', ':gsi': 'approved#timestamp'})}},
                    ]}
                    event = {'requestContext': {'authorizer': {'claims': {'cognito:groups': 'admins', 'email': 'admin@example.test'}}}, 'body': json.dumps({'status': 'approved', 'documentId': 'doc', 'expectedVersion': 'v1'})}
                    with Stubber(client) as stub, patch.object(api, 'now_iso', return_value='timestamp'), patch.object(api, 'new_id', return_value='v2'), patch.object(api, '_write_audit_log') as audit:
                        if failure:
                            stub.add_client_error('transact_write_items', service_error_code='TransactionCanceledException', expected_params=expected, modeled_fields={'CancellationReasons': [{'Code': 'ConditionalCheckFailed'}, {'Code': 'None'}]})
                        else:
                            stub.add_response('transact_write_items', {}, expected)
                        response = api.update_request(event, req_id)
                        self.assertEqual(response['statusCode'], 409 if failure else 200)
                        if failure: audit.assert_not_called()
                        stub.assert_no_pending_responses()


if __name__ == '__main__':
    unittest.main()
