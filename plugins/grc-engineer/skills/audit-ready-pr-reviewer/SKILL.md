---
name: audit-ready-pr-reviewer
description: Reviews pull requests for compliance regressions. Scans code diffs for security and compliance violations, flags issues, and suggests fixes aligned with frameworks like SOC 2, ISO 27001, NIST 800-53.
allowed-tools: Bash, Read, Glob, Write, Edit
---

# Audit-Ready PR Reviewer

Reviews GitHub/GitLab pull requests specifically for compliance regressions. Shifts compliance "left" into the developer's daily workflow.

## Quick Commands

**Review a PR for SOC 2 compliance:**

```bash
node plugins/grc-engineer/scripts/review-pr.js myorg/infrastructure 42 SOC2
```

**Review a PR for ISO 27001:**

```bash
node plugins/grc-engineer/scripts/review-pr.js myorg/infrastructure 42 ISO27001
```

**Review a PR with custom framework:**

```bash
node plugins/grc-engineer/scripts/review-pr.js myorg/infrastructure 42 NIST80053
```

## What It Checks

- **Privilege Escalation** - Detects overly permissive IAM roles/policies
- **Encryption** - Flags missing encryption at rest or in transit
- **Tagging/Labeling** - Ensures required tags/labels are present
- **Network Security** - Validates VPC configurations, security groups
- **Access Controls** - Checks authentication and authorization
- **Logging** - Verifies audit logging is enabled
- **Backup/Recovery** - Ensures backup configurations

## Output Format

Posts GitHub comments with:

- ⚠️ Warning level and control reference
- 📝 Description of the issue
- ✅ Suggested fix with code example
- 🔗 Link to relevant compliance control

## Example Comment

```markdown
⚠️ **Compliance Warning: SOC 2 CC6.1 - Least Privilege**

This PR introduces an IAM role with `AdministratorAccess`, which violates the Least Privilege principle.

**Issue:** Line 23 in `terraform/iam.tf` assigns full administrative access.

**Suggested Fix:**
```hcl
resource "aws_iam_role" "app_role" {
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:GetObject",
        "s3:PutObject"
      ]
      Resource = "arn:aws:s3:::my-bucket/*"
    }]
  })
}
```

**Control Reference:** SOC 2 CC6.1, NIST 800-53 AC-6

```

## Prerequisites

- GitHub repository (owner/repo format)
- PR number
- `GITHUB_TOKEN` environment variable (requires `repo` scope)
- Optional: Framework name (defaults to SOC2)
