#!/usr/bin/env bash
set -euo pipefail
exec node "$(dirname "$0")/gcp-docs.js" query "$@"
