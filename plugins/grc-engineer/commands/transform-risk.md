---
description: Transform risk assessments into Jira tickets
---

# Transform Risk

Converts unstructured risk assessments into structured Jira tickets.

## Arguments

- `$1` - Risk description (required, in quotes)
- `$2` - Jira project key (optional, defaults to SEC)

## Instructions

1. Run the transform-risk script:

   ```bash
   node plugins/grc-engineer/scripts/transform-risk.js "$ARGUMENTS"
   ```

2. The script extracts likelihood, impact, and mitigation from the description.

3. Review the generated Jira ticket JSON.

4. Post to Jira using the API or import manually.

## Example

```bash
/grc-engineer:transform-risk "Vulnerability in auth service. High likelihood, critical impact. Mitigation: Implement OAuth2 with PKCE." SEC
```
