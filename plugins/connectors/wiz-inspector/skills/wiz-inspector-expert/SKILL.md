# Wiz Inspector Expert

Use `wiz-inspector` when Wiz CNAPP is the source of cloud posture, vulnerability, toxic-combination, or inventory evidence.

Inputs:
- `WIZ_CLIENT_ID`
- `WIZ_CLIENT_SECRET`
- `WIZ_API_URL`, for example `https://api.<region>.app.wiz.io/graphql`
- optional `WIZ_AUTH_URL`, defaulting to `https://auth.app.wiz.io/oauth/token`
- optional `WIZ_PROJECT_ID` to constrain collection to a Wiz project

Run `/wiz-inspector:setup`, then `/wiz-inspector:collect`. Findings are emitted using `schemas/finding.schema.json` and can feed GRC Engineering gap assessments, OSCAL exports, workpaper generation, and remediation workflows.
