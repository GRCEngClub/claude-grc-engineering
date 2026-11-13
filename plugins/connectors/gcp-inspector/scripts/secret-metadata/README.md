# Bundled Secret Manager metadata helpers

The source of truth is `plugins/connectors/gcp-secret-metadata/scripts/` in
this repository. After changing `list.js`, `history.js`, or `project-scope.js`,
run `node scripts/vendor-gcp-secret-metadata.mjs` from the repository root and
commit the resulting copies. CI runs the same script with `--check` to reject
missing or divergent copies. Only metadata-only helpers are bundled; the
secret-value retrieval helper is not included.
