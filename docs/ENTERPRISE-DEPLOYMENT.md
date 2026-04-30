# Enterprise Deployment Guide

This guide covers deploying Claude Code with GRC Engineering plugins through AWS Bedrock or Google Vertex AI, which route inference through your own cloud account instead of the Anthropic API. It also tracks [Claude Platform on AWS](https://aws.amazon.com/claude-platform/) so teams can choose between Bedrock's AWS-managed model service and Anthropic's native platform experience through AWS commercial controls. Data handling depends on the provider's documented behavior; verify the specifics against the authoritative provider docs before relying on them for a compliance posture.

## Why Use Enterprise Deployment?

| Benefit | What's actually documented |
|---------|---------|
| **Cloud-account routing** | For Bedrock and Vertex AI, inference requests go through your AWS or GCP account rather than Anthropic's API. Data residency and in-region processing guarantees are defined by the cloud provider's docs ([Bedrock data protection](https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html), [Vertex AI locations](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/locations)), not by this toolkit. Some Vertex endpoints don't guarantee in-region ML processing for every operation; check the provider docs for your region and model. |
| **Compliance authorizations** | FedRAMP, HIPAA, SOC 2, and other authorizations are held by the cloud provider for their Anthropic-model offering. See the AWS Bedrock and GCP FedRAMP pages for current status (authorization scope changes). |
| **Model training use** | Per Anthropic's [commercial terms](https://www.anthropic.com/legal/commercial-terms), prompts and completions to commercial endpoints are not used to train models. Confirm the same for your cloud provider's terms. |
| **Enterprise support** | Cloud provider SLAs and support apply. |
| **Audit trails** | Invocations log to CloudTrail or Cloud Audit Logs per the provider's standard logging. |

---

## AWS Options: Bedrock vs Claude Platform on AWS

AWS now documents two different ways to use Claude with AWS account controls. Treat them as separate deployment patterns:

| Option | Use when | Data boundary | GRC notes |
|--------|----------|---------------|-----------|
| **Claude on Amazon Bedrock** | You need AWS-managed model access, regional processing controls, Guardrails, Knowledge Bases, PrivateLink, or access to multiple foundation model providers through one service. | AWS states that Bedrock processes customer data within AWS infrastructure and does not share it with Anthropic or other third parties. Verify regional support for the exact model and feature set before committing to a control assertion. | Best fit for strict residency, FedRAMP, private networking, and AWS-native control inheritance narratives. Use the Bedrock configuration below for Claude Code. |
| **Claude Platform on AWS** | You want Anthropic's native Claude Platform APIs, features, and console experience while using AWS credentials, IAM authorization, AWS billing, and CloudTrail logging. | AWS states that the first-party platform is operated by Anthropic and customer data is processed by Anthropic outside the AWS boundary. | Best fit when native Anthropic platform features matter more than AWS-only processing. Document the Anthropic processing boundary, IAM policy design, CloudTrail event coverage, and billing ownership in your system boundary. |

As of the current AWS product page, Claude Platform on AWS is marked "Coming Soon." Do not write procedures that assume CLI flags, IAM actions, SDK endpoints, or CloudTrail event names until AWS publishes implementation docs. This repository therefore does not add a separate connector or plugin for it yet; the existing `aws-inspector` connector remains focused on AWS account control evidence, and this guide records the deployment decision point.

Practical assessment checklist for Claude Platform on AWS:

- Confirm whether your data residency, customer contract, and regulatory obligations allow Anthropic processing outside the AWS boundary.
- Define IAM least-privilege policies for the platform once AWS publishes service actions and condition keys.
- Decide whether CloudTrail coverage is enough for your audit trail, or whether you also need Anthropic-side activity exports.
- Record AWS billing ownership and cost allocation tags or account structure in the financial control narrative.
- Keep Bedrock as the default recommendation when the control objective requires AWS-managed processing, regional residency, PrivateLink, or AWS Guardrails.

---

## AWS Bedrock Configuration

### Prerequisites

1. AWS account with Bedrock access enabled
2. Claude model access enabled in Bedrock console
3. AWS CLI configured (optional, for credential management)
4. Claude Code v1.0.33 or later

### Enable Claude in Bedrock

1. Navigate to AWS Console → Bedrock → Model access
2. Request access to Anthropic Claude models
3. Wait for access approval (usually immediate)

### Configuration Methods

#### Method 1: Environment Variables

```bash
# Required
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1

# Optional: Specify model
export ANTHROPIC_MODEL='us.anthropic.claude-sonnet-4-20250514'

# Start Claude Code
claude
```

#### Method 2: Settings File

Add to `~/.claude/settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_USE_BEDROCK": "1",
    "AWS_REGION": "us-east-1",
    "ANTHROPIC_MODEL": "us.anthropic.claude-sonnet-4-20250514"
  }
}
```

### AWS Authentication Options

Claude Code uses the standard AWS SDK credential chain:

#### Option A: IAM Identity Center (Recommended for Organizations)

```bash
# Configure SSO
aws configure sso

# Login
aws sso login --profile your-profile

# Set profile
export AWS_PROFILE=your-profile
```

#### Option B: Environment Variables

```bash
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
# Optional for temporary credentials
export AWS_SESSION_TOKEN=your-session-token
```

#### Option C: IAM Role (EC2/ECS/Lambda)

When running on AWS infrastructure, use IAM roles attached to your compute resource. No additional configuration needed.

### Required IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-*"
      ]
    }
  ]
}
```

### Available Models in Bedrock

| Model | Model ID |
|-------|----------|
| Claude Sonnet 4 | `us.anthropic.claude-sonnet-4-20250514` |
| Claude 3.5 Sonnet | `us.anthropic.claude-3-5-sonnet-20241022-v2:0` |
| Claude 3.5 Haiku | `us.anthropic.claude-3-5-haiku-20241022-v1:0` |

---

## Google Vertex AI Configuration

### Prerequisites

1. Google Cloud project with Vertex AI enabled
2. Claude model access enabled in Model Garden
3. gcloud CLI configured (optional)
4. Claude Code v1.0.33 or later

### Enable Claude in Vertex AI

1. Navigate to Google Cloud Console → Vertex AI → Model Garden
2. Search for "Claude" and select desired model
3. Enable the model for your project

### Configuration Methods

#### Method 1: Environment Variables

```bash
# Required
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=us-east5
export ANTHROPIC_VERTEX_PROJECT_ID=your-project-id

# Start Claude Code
claude
```

#### Method 2: Settings File

Add to `~/.claude/settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_USE_VERTEX": "1",
    "CLOUD_ML_REGION": "us-east5",
    "ANTHROPIC_VERTEX_PROJECT_ID": "your-project-id"
  }
}
```

### GCP Authentication Options

#### Option A: Application Default Credentials (Recommended)

```bash
gcloud auth application-default login
```

#### Option B: Service Account Key

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

#### Option C: Workload Identity (GKE)

Configure Workload Identity Federation for your GKE cluster.

### Required IAM Permissions

Grant the following roles to your service account or user:

- `roles/aiplatform.user` - Vertex AI User

Or create a custom role with:

```yaml
includedPermissions:
  - aiplatform.endpoints.predict
```

### Available Regions

Claude is available in these Vertex AI regions:

- `us-east5` (Virginia)
- `europe-west1` (Belgium)

---

## Compliance Considerations

Compliance authorizations for Anthropic models hosted on third-party cloud providers move as the providers add and extend them. Always check the provider's current authorization page before committing to a posture in a customer-facing compliance document.

### FedRAMP

- **AWS Bedrock**: Anthropic Claude models are offered in AWS GovCloud regions under AWS's FedRAMP High authorization. Verify the specific Bedrock endpoints and model variants you plan to use against the [AWS GovCloud Bedrock availability page](https://aws.amazon.com/bedrock/) and the [AWS FedRAMP marketplace entry](https://marketplace.fedramp.gov/products) before relying on it.
- **Vertex AI (Claude on Vertex AI)**: Google announced on October 31, 2025 that Claude on Vertex AI operates within a FedRAMP High authorization boundary (formerly Moderate). See the [Google Cloud FedRAMP page for Claude on Vertex AI](https://cloud.google.com/security/compliance/fedramp-claude-on-vertex-ai) for the current scope.

### HIPAA

Both AWS Bedrock and Vertex AI support HIPAA workloads with appropriate BAAs in place. The BAA is between you and the cloud provider; Anthropic is not a direct party when you're using Bedrock or Vertex.

### SOC 2

Both platforms maintain SOC 2 Type II reports. Request the current report from your account team; don't rely on a stated date in this document.

### Data Processing

| Provider | Data usage (per provider docs) |
|----------|------------|
| AWS Bedrock | Per [Bedrock data protection](https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html), prompts and completions are not used to train Anthropic models. |
| Vertex AI | Per [Vertex AI generative data governance](https://cloud.google.com/vertex-ai/generative-ai/docs/data-governance), customer data is not used to train foundation models. |

Authoritative terms are the cloud provider's and Anthropic's own contracts, not this document.
| Anthropic API | Not used for model training (with API) |

---

## Troubleshooting

### AWS Bedrock

**Error: Access Denied**

- Verify model access is enabled in Bedrock console
- Check IAM permissions include `bedrock:InvokeModel`
- Confirm region supports Claude models

**Error: Model not found**

- Use fully qualified model ID with region prefix
- Verify model is available in your region

### Vertex AI

**Error: Permission Denied**

- Verify Vertex AI API is enabled
- Check service account has `aiplatform.user` role
- Confirm project ID is correct

**Error: Region not supported**

- Use `us-east5` or `europe-west1` for Claude

---

## Cost Optimization

### Prompt Caching

Both platforms support prompt caching to reduce costs for repeated context:

```bash
# AWS Bedrock - enabled automatically
export ANTHROPIC_MODEL='us.anthropic.claude-sonnet-4-20250514'

# Vertex AI - check documentation for cache configuration
```

### Model Selection

| Use Case | Recommended Model |
|----------|-------------------|
| Complex GRC analysis | Claude Sonnet 4 |
| Quick queries | Claude 3.5 Haiku |
| High-volume processing | Claude 3.5 Haiku |

---

## Next Steps

1. Choose your deployment option (Bedrock or Vertex AI)
2. Configure authentication
3. Install the GRC Engineering plugins:

   ```bash
   /plugin marketplace add GRCEngClub/claude-grc-engineering
   /plugin install grc-engineer@grc-engineering-suite
   ```

4. Start using GRC commands with enterprise-grade security!
