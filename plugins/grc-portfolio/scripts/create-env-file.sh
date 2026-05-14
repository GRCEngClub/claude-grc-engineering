#!/bin/bash

# Helper script to create .env.local with AWS credentials.
#
# Secrets are read from environment variables to keep them out of shell
# history and ps(1) output. Pipe them in or export them inline:
#
#   AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=... ./create-env-file.sh
#
# Optional:
#   AWS_REGION (default: us-east-1)
#   ENV_FILE   (default: .env.local in the current directory)

set -euo pipefail

: "${AWS_ACCESS_KEY_ID:?AWS_ACCESS_KEY_ID must be set in the environment}"
: "${AWS_SECRET_ACCESS_KEY:?AWS_SECRET_ACCESS_KEY must be set in the environment}"

AWS_REGION="${AWS_REGION:-us-east-1}"
ENV_FILE="${ENV_FILE:-.env.local}"

if [ -f "$ENV_FILE" ]; then
    echo "⚠️  $ENV_FILE already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# Create the file with restrictive permissions before writing secrets.
umask 077
: > "$ENV_FILE"
chmod 600 "$ENV_FILE"

cat > "$ENV_FILE" <<EOF
# AWS SES Configuration
# Generated on $(date)
AWS_REGION=$AWS_REGION
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
EOF

echo "✅ Created $ENV_FILE (mode 600)"
echo ""
echo "🔒 Security reminder:"
echo "   - Never commit this file to version control"
echo "   - It should already be in .gitignore"
echo ""
