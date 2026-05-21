# `/trust-center:deploy`

Deploy the trust center to AWS.

## Steps
1. Validate AWS credentials and region
2. Deploy the CloudFormation stack from `infrastructure/template.yaml`
3. Package and upload the Lambda function (`backend/functions/api_handler.py`)
4. Run `backend/seed_data.py` to populate DynamoDB
5. Build the React frontend and sync to S3
6. Output the live CloudFront URL

## Usage
```
/trust-center:deploy --email admin@company.com
/trust-center:deploy --email admin@company.com --domain trust.company.com
```
