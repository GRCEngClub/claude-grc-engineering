#!/bin/bash

# Helper script to create .env.local file with AWS credentials

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <ACCESS_KEY_ID> <SECRET_ACCESS_KEY>"
    exit 1
fi

ACCESS_KEY_ID=$1
SECRET_ACCESS_KEY=$2
ENV_FILE=".env.local"

# Check if .env.local already exists
if [ -f "$ENV_FILE" ]; then
    echo "⚠️  $ENV_FILE already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# Create .env.local file
cat > "$ENV_FILE" << EOF
# AWS SES Configuration
# Generated on $(date)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=$ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY
EOF

echo "✅ Created $ENV_FILE successfully!"
echo ""
echo "🔒 Security reminder:"
echo "   - Never commit this file to version control"
echo "   - It's already in .gitignore"
echo ""
