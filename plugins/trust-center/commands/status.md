# `/trust-center:status`

Deployment is blocked; do not deploy or use sensitive data. NDA enforcement is not implemented. See `docs/ACCESS-SECURITY.md`. This command is read-only and must not modify resources or suggest that a stack's existence proves it is secure.

## Steps

1. Describe the CloudFormation stack and surface stack status
2. Show the CloudFront domain and API URL from stack outputs
3. Report Lambda function last-modified and memory config
4. Check DynamoDB table item count

## Usage

```
/trust-center:status
```
