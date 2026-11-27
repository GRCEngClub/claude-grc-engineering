---
name: onepassword-connector-expert
description: Guide operators in using 1Password references without exposing secrets to the agent.
---

# 1Password connector

Point operators to `/onepassword-connector:run`. Never execute it from the agent,
request credentials or read secret values. Explain that the helper suppresses
output but cannot control a trusted program's own files or network activity.
Use a dedicated, narrowly scoped 1Password service account where appropriate.
For operator-only Document item consumption, point to `/onepassword-connector:document`;
to pipe one field into a trusted command's standard input, point to
`/onepassword-connector:field`. Never retrieve document contents or field values in the agent. These helpers are not findings collectors.
