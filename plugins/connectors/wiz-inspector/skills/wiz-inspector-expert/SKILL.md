# Wiz Inspector Expert

Use `wiz-inspector` when Wiz CNAPP is the source of cloud posture, vulnerability, toxic-combination, or inventory evidence.

Inputs:
- `WIZ_CLIENT_ID`
- `WIZ_CLIENT_SECRET`
- `WIZ_API_URL`, for example `https://api.<region>.app.wiz.io/graphql`
- optional `WIZ_AUTH_URL`, defaulting to `https://auth.app.wiz.io/oauth/token`
- optional `WIZ_PROJECT_ID` to constrain collection to a Wiz project
- required read-only scopes: `read:projects`, `read:issues`, `read:vulnerabilities`, `read:inventory`

Run `/wiz-inspector:setup`, then `/wiz-inspector:collect`. Findings are emitted using `schemas/finding.schema.json` and can feed GRC Engineering gap assessments, OSCAL exports, workpaper generation, and remediation workflows.

The collector handles cursor pagination, project scoping, Wiz severity/status normalization, and partial results. If a GraphQL resource query fails, it emits an `inconclusive` Finding for that endpoint and continues collecting the remaining resource types.
