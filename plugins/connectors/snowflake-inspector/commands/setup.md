# /snowflake-inspector:setup

Configure `snowflake-inspector` to use `snowsql`.

```bash
plugins/connectors/snowflake-inspector/scripts/setup.sh --account=<account> --user=<user> --warehouse=<warehouse> --role=<role>
```

Auth follows normal SnowSQL configuration and environment variables. Use a dedicated audit role with access to `SNOWFLAKE.ACCOUNT_USAGE`.
