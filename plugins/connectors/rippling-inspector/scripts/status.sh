#!/usr/bin/env bash
# Entry point that /engineer:pipeline-status looks for in every connector.
set -uo pipefail
exec node "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/status.js" "$@"
