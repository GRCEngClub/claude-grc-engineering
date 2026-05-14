---
description: Build the React/Vite site, sync to S3, and invalidate the CloudFront cache. Your portfolio goes live.
---

# Deploy Site

Runs the full deployment pipeline in three steps:

1. `npm run build` — builds the React/Vite project to `dist/`
2. `aws s3 sync` — uploads files to your S3 bucket
3. `aws cloudfront create-invalidation` — clears the CDN cache

Your live URL is printed at the end.

## Arguments

- `$1` — Project directory containing `site-config.json` (optional; defaults to current directory)

## Prerequisites

- `/grc-portfolio:build` must have run (`status.buildComplete === true`)
- `/grc-portfolio:infra` must have run (`status.infraDeployed === true`)

## Example

```
/grc-portfolio:deploy ~/Desktop/repos/my-grc-portfolio
/grc-portfolio:deploy
```

## Next Steps

- Run `/grc-portfolio:repo` to push code to GitHub
- Run `/grc-portfolio:cicd` to set up automatic deploys on every push to `main`
