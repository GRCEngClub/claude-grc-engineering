# /drata-inspector:setup

Configure `drata-inspector`, a workflow wrapper over [`drata-cli`](https://github.com/ethanolivertroy/drata-cli).

```bash
plugins/connectors/drata-inspector/scripts/setup.sh
```

The setup command verifies that `drata` is available, checks read-only auth, and writes:

```text
~/.config/claude-grc/connectors/drata-inspector.yaml
```

## Auth

`drata-inspector` uses `drata-cli` auth directly. Configure one of:

- `drata auth login --api-key-stdin`
- `DRATA_API_KEY`
- `DRATA_API_KEY_CMD`
- `DRATA_REGION=us|eu|apac`
- `DRATA_BASE_URL`

The connector runs Drata collection commands with `DRATA_READ_ONLY=1`.

## Options

- `--region=us|eu|apac` records the expected Drata region. Default: `DRATA_REGION` or `us`.
- `--command=<path>` records a custom `drata` executable path.

## Next

```text
/drata-inspector:collect
/drata-inspector:status
```
