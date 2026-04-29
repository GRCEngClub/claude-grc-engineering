---
description: Review pull requests for compliance regressions
---

# Review PR

Reviews GitHub pull requests for compliance regressions and security issues.

## Arguments

- `$1` - Repository (required, format: owner/repo)
- `$2` - PR number (required)
- `$3` - Framework (optional, defaults to SOC2)

## Prerequisites

- `GITHUB_TOKEN` environment variable (requires `repo` scope)

## Instructions

1. Set up GitHub token:

   ```bash
   export GITHUB_TOKEN=your_token_here
   ```

2. Run the review-pr script:

   ```bash
   node plugins/grc-engineer/scripts/review-pr.js $ARGUMENTS
   ```

3. The script analyzes the PR diff and generates compliance review comments.

4. Review the generated comments and post them to the PR if needed.

## Example

```bash
/grc-engineer:review-pr myorg/infrastructure 42 SOC2
```
