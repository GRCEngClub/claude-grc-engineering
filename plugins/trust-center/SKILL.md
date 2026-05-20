---
name: trust-center
description: >
  Build and deploy a production-ready Trust Center for any company. Use this skill
  whenever someone asks to create a trust center, compliance portal, security page,
  or wants to publish their SOC 2/SOC 3/ISO 27001/HIPAA/compliance posture publicly.
  Also triggers when someone mentions gated document access for audit reports, NDA-based
  document sharing, or wants to replace paid trust center tools like Secureframe, Vanta,
  Drata, or SafeBase. Even if they just say "I need a place to share my SOC 2 with
  customers" — that's a trust center. Use this skill.
---

# Trust Center Builder

Build a serverless trust center that publishes a company's compliance posture —
certifications, policies, and audit reports — with gated access for sensitive documents.

## What This Skill Produces

A fully deployed trust center with:
- **Public page**: Company overview, certification badges, compliance stats, downloadable public reports
- **Gated access**: Visitors request access to sensitive docs (SOC 2, policies) → approval flow → visitor downloads
- **Admin dashboard**: Approve/deny requests, manage documents, view audit log
- **Authentication**: Cognito-based admin login
- **Infrastructure**: Serverless AWS (S3, CloudFront, WAF, API Gateway, Lambda, DynamoDB, Cognito)
- **NDA integration** (optional): Pluggable e-signature workflow — user chooses their provider

Monthly cost: ~$5-15/mo for the trust center infrastructure (e-signature provider costs vary).

## Workflow

Follow these steps in order. Each step builds on the previous one.

### Step 1: Gather Company Information

Ask the user for the following. Be conversational — don't dump all questions at once.
Ask 2-3 at a time, then move on.

**Required:**
- Company name
- What the company does (1-2 sentence description for the trust center landing page)
- Admin email address (for Cognito login)
- Which certifications they have (SOC 2 Type I/II, SOC 3, ISO 27001, HIPAA, PCI DSS, FedRAMP, etc.)

**For each certification, ask:**
- Status: active, in progress, or planned
- Audit period (e.g., "Jan 2025 – Dec 2025")
- Auditor name (e.g., "Deloitte", "KPMG")

**Ask about documents:**
- Do they have a SOC 2 report to upload? SOC 3?
- Which policies do they want to publish? (Information Security, Access Control, BCDR, etc.)
- Which documents should be public vs. gated (require access request)?

**Ask about NDA / e-signature (optional):**
- Do they want an NDA signing step before gated document access?
- If yes, which e-signature provider do they want to use? (See "NDA Integration" section below)
- Or should access requests go straight to admin for manual review?

**Optional:**
- Custom domain (e.g., trust.company.com)
- Contact email for security inquiries
- Company logo URL
- Brand color (hex code)

If they have a SOC 2 report file, ask them to share it — the skill can extract
certification details, control counts, and audit period automatically.

### Step 2: Read Uploaded Documents

If the user provides a SOC 2 report or other compliance documents:

1. Read the document using appropriate tools
2. Extract:
   - Audit period and auditor name
   - Trust services criteria covered
   - Number of controls
   - Any qualified opinions or exceptions
   - Management's description of the system
3. Use this extracted data to pre-fill the trust center configuration
4. Confirm the extracted data with the user before proceeding

### Step 3: Generate the Trust Center Code

Read the reference files to generate the code. The order matters:

1. Read `references/infrastructure-template.yaml` → Generate `infrastructure/template.yaml`
   - Customize default CompanyName parameter with the user's company name
   - This CloudFormation template deploys the full AWS stack

2. Read `references/api-handler.py` → Generate `backend/functions/api_handler.py`
   - This is the Lambda API handler
   - The NDA section uses generic env vars (ESIGN_API_KEY, ESIGN_API_URL, etc.)
   - If the user chose a specific provider, update the API call format to match that provider's API
   - If the user chose NO NDA, the handler gracefully skips NDA (requests go straight to pending)

3. Read `references/seed-data.md` → Generate `backend/seed_data.py`
   - **This is where all the company-specific data goes**
   - Customize with: company name, description, certifications, documents, contact email
   - Map each document the user mentioned to a seed entry with correct access level

4. Copy frontend files from `references/frontend-files/` → Generate the React frontend:
   - Customize `TrustCenter.jsx` DEMO_CONFIG and DEMO_DOCUMENTS with the user's data
   - All other frontend files are generic — copy as-is

5. Copy `references/deploy-script.sh` → Generate `deploy.sh`
   - Make executable (chmod +x)

6. Generate `README.md` with company-specific details

### Step 4: Project Structure

The final output should be:

```
trust-center/
├── README.md
├── deploy.sh                    # One-command deploy
├── infrastructure/
│   └── template.yaml            # CloudFormation (full AWS stack)
├── backend/
│   ├── functions/
│   │   └── api_handler.py       # Lambda API
│   └── seed_data.py             # Company-specific data population
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── hooks/useAuth.jsx
│       ├── pages/TrustCenter.jsx
│       ├── pages/AdminDashboard.jsx
│       ├── pages/LoginPage.jsx
│       └── utils/api.js
└── docs/
    └── DEPLOYMENT.md            # Step-by-step guide
```

### Step 5: Deploy

Walk the user through deployment:

1. Verify AWS CLI is configured: `aws sts get-caller-identity`
2. Verify region is us-east-1: `aws configure get region`
3. Run the deploy script: `./deploy.sh --email ADMIN_EMAIL`
4. Wait for CloudFormation (~10-15 min for CloudFront)
5. Upload actual documents to S3
6. Check admin email for temporary Cognito password
7. Visit the live URL

If deploying from Claude Code, run these commands directly.

### Step 6: Upload Documents

After deployment, upload the user's actual compliance documents:

```bash
DOCS_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name trust-center-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`DocumentsBucket`].OutputValue' \
  --output text)

aws s3 cp SOC2_Report.pdf "s3://$DOCS_BUCKET/documents/SOC2_Report.pdf"
aws s3 cp SOC3_Report.pdf "s3://$DOCS_BUCKET/documents/SOC3_Report.pdf"
# ... etc for each policy document
```

### Step 7: Set Up NDA Integration (Optional)

If the user wants automated NDA signing, guide them through connecting their chosen
e-signature provider. See the "NDA Integration" section below for details.

## NDA Integration — Choose Your Provider

The trust center supports an optional NDA signing step before granting access to gated
documents. The backend is designed to be **provider-agnostic** — it uses environment
variables for the API key, URL, and template ID, and a webhook endpoint for completion
callbacks.

**The user must choose an e-signature provider.** Here are the tested options:

### Option 1: Documenso (Open Source — Recommended for Self-Hosting)
- **Cloud**: Free tier (5 docs/month) or Individual plan ($25/month, unlimited)
- **Self-hosted**: Free, unlimited, runs on Docker (EC2/ECS)
- **API**: Full REST API on all plans including self-hosted
- **Webhook event**: `DOCUMENT_COMPLETED`
- **Setup**: Create account → Settings → API Tokens → Create → Templates → Create NDA template
- Website: https://documenso.com

### Option 2: OpenSign (Open Source — Recommended for Cloud)
- **Cloud**: Professional plan ($9.99/month yearly, 240 API signatures/year)
- **Self-hosted**: Free UI, but API requires paid Teams license ($720/year)
- **Webhook event**: `completed`
- **Setup**: Subscribe to Pro → Settings → API Token → Templates → Create NDA template
- Website: https://www.opensignlabs.com

### Option 3: DocuSeal (Open Source)
- **Cloud**: Pro plan ($20/month + $0.20 per API-signed document)
- **Self-hosted**: Free UI, but API requires Pro license ($20/month)
- **Webhook event**: `form.completed`
- **Setup**: Subscribe to Pro → Get API key → Create NDA template
- Website: https://www.docuseal.com

### Option 4: DocuSign (Commercial)
- **Cloud**: Developer API Starter plan ($50/month, 40 envelopes/month)
- **Webhook event**: `envelope-completed`
- **Setup**: Create Developer account → Get API key → Create NDA template
- Website: https://developers.docusign.com

### Option 5: No NDA (Manual Review)
- Access requests go directly to admin for review
- Admin manually approves or denies from the dashboard
- No e-signature integration needed
- Suitable for low-volume trust centers or when NDA is handled offline

### Connecting the Provider

After choosing, the user needs to:
1. Create an NDA template in their chosen provider's web UI
2. Get an API key from the provider
3. Set the webhook URL in the provider to: `https://TRUST_CENTER_URL/api/webhook/esign`
4. Update the Lambda environment variables:
   - `ESIGN_PROVIDER`: documenso | opensign | docuseal | docusign
   - `ESIGN_API_KEY`: their API key
   - `ESIGN_API_URL`: provider's API base URL
   - `ESIGN_NDA_TEMPLATE_ID`: the template ID from step 1

The backend auto-detects the provider and formats API calls accordingly. If no
provider is configured (env vars are empty), the NDA step is skipped and requests
go straight to admin review.

## Important Notes

- The CloudFormation stack MUST be deployed in **us-east-1** (WAF + CloudFront requirement)
- The frontend uses DEMO_MODE=true by default for local development. The deploy script
  sets up the real API URL via environment variables during build.
- Admin authentication uses Cognito. First login requires setting a new password.
- Public visitors do NOT need to log in. They see certifications, stats, and public docs.
  Gated docs show a "Request Access" button that collects name/email/company/reason.
- All document downloads generate presigned S3 URLs (1-hour expiry) and are audit-logged.
- NDA integration is completely optional — the trust center works fully without it.

## Customization Options

After the initial build, users can ask to:
- Add or remove documents
- Change which docs are public vs. gated
- Add new certification types
- Customize colors/branding
- Add a custom domain
- Connect an e-signature provider for NDA automation
- Switch the NDA flow from admin-approved to auto-approved (NDA signed = access granted)
