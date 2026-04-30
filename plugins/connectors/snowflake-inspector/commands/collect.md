# /snowflake-inspector:collect

Query Snowflake `ACCOUNT_USAGE` and write Finding documents to:

```text
~/.cache/claude-grc/findings/snowflake-inspector/<run_id>.json
```

Coverage includes MFA user posture, network policies, masking and row access policies, session timeout, and data retention signals.
