---
name: website-deploy
description: Builds the React/Vite site, syncs to S3, and invalidates CloudFront cache. Uses the plugin's bundled deploy.sh script.
allowed-tools: Bash, Read, Write, Edit, Glob
---

# Website Deploy Skill

You are running the `/grc-portfolio:deploy` skill. Your job is to build the website and deploy it to the AWS infrastructure created by `/grc-portfolio:infra`.

## Step 1: Locate and Validate Config

Find `site-config.json`:
- Check `$ARGUMENTS` for a project directory path
- Check the current working directory
- Ask the user if not found

Read it and validate that `status.infraDeployed === true`. If not, tell the user to run `/grc-portfolio:infra` first.

Also validate that `status.buildComplete === true`. If not, tell the user to run `/grc-portfolio:build` first.

Extract needed values:
- `aws.bucketName`
- `aws.distributionId`
- `aws.profile`
- `aws.contactApiEndpoint` (if contact form enabled)
- `aws.cloudFrontUrl`
- `aws.domain` (if custom domain)

## Step 2: Set Environment Variables (if contact form)

If `features.contactForm` is true and `aws.contactApiEndpoint` is set:

Create or update `.env` in the project directory:
```
VITE_CONTACT_API_ENDPOINT=<aws.contactApiEndpoint>
```

## Step 3: Build the Site

```bash
cd <projectDir>
npm run build
```

Verify the `dist/` directory was created and contains files.

If the build fails, diagnose and fix the issue.

## Step 4: Deploy to AWS

Use the toolkit's deploy script:
```bash
$TOOLKIT_DIR/scripts/deploy.sh <aws.bucketName> <aws.distributionId> <aws.profile>
```

Run this from the project directory (it expects `dist/` in the current working directory).

## Step 5: Verify Deployment

Wait a moment for CloudFront to propagate, then tell the user their site is live.

Provide the URL:
- If custom domain: `https://<aws.domain>`
- Otherwise: `https://<aws.cloudFrontUrl>`

## Step 6: Update Config

Update `site-config.json`:
- Set `status.siteDeployed = true`

## Step 7: Summary

Tell the user:
- The site is deployed and live
- Provide the live URL
- Note that CloudFront cache invalidation takes 1-2 minutes to fully propagate
- Suggest running `/grc-portfolio:repo` to create a GitHub repo (if not done)
- Suggest running `/grc-portfolio:cicd` to set up automatic deployments on push

## Variables

- `$TOOLKIT_DIR` = read from `site-config.json` `toolkitDir` field
- `$ARGUMENTS` = arguments passed after `/deploy` (expected: project directory path)
