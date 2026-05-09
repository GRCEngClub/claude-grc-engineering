#!/bin/bash

# AWS Website Deployment - Bootstrap Script
# This script sets up your local environment for deploying websites to AWS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_header "AWS Website Deployment - Environment Setup"

echo "This script will check and install the necessary tools for deploying your website to AWS."
echo ""

# Check Operating System
print_info "Detecting operating system..."
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    MINGW*)     MACHINE=Windows;;
    *)          MACHINE="UNKNOWN:${OS}"
esac
print_success "Operating System: ${MACHINE}"

# Check for Homebrew (Mac only)
if [ "$MACHINE" = "Mac" ]; then
    print_info "Checking for Homebrew..."
    if ! command_exists brew; then
        print_warning "Homebrew not found. Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        print_success "Homebrew installed successfully"
    else
        print_success "Homebrew is already installed"
    fi
fi

# Check for AWS CLI
print_info "Checking for AWS CLI..."
if ! command_exists aws; then
    print_warning "AWS CLI not found. Installing..."
    
    if [ "$MACHINE" = "Mac" ]; then
        brew install awscli
    elif [ "$MACHINE" = "Linux" ]; then
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip awscliv2.zip
        sudo ./aws/install
        rm -rf aws awscliv2.zip
    else
        print_error "Please install AWS CLI manually from: https://aws.amazon.com/cli/"
        exit 1
    fi
    
    print_success "AWS CLI installed successfully"
else
    print_success "AWS CLI is already installed ($(aws --version))"
fi

# Check for Node.js
print_info "Checking for Node.js..."
if ! command_exists node; then
    print_warning "Node.js not found. Installing..."
    
    if [ "$MACHINE" = "Mac" ]; then
        brew install node
    elif [ "$MACHINE" = "Linux" ]; then
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        print_error "Please install Node.js manually from: https://nodejs.org/"
        exit 1
    fi
    
    print_success "Node.js installed successfully"
else
    print_success "Node.js is already installed ($(node --version))"
fi

# Check for npm
print_info "Checking for npm..."
if ! command_exists npm; then
    print_error "npm not found. Please reinstall Node.js"
    exit 1
else
    print_success "npm is already installed ($(npm --version))"
fi

# Configure AWS CLI
print_header "AWS Configuration"

if [ ! -f ~/.aws/credentials ]; then
    print_warning "AWS credentials not configured"
    echo ""
    echo "You'll need:"
    echo "  1. AWS Access Key ID"
    echo "  2. AWS Secret Access Key"
    echo "  3. Default region (e.g., us-east-1)"
    echo ""
    print_info "You can get these from the AWS Console: IAM → Users → Security Credentials"
    echo ""
    read -p "Would you like to configure AWS now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        aws configure
        print_success "AWS configured successfully"
    else
        print_warning "Skipping AWS configuration. Run 'aws configure' later to set up credentials"
    fi
else
    print_success "AWS credentials already configured"
    print_info "Current AWS identity:"
    aws sts get-caller-identity 2>/dev/null || print_warning "Could not verify AWS credentials. You may need to run 'aws configure'"
fi

# Verify deployment scripts exist
print_header "Verifying Deployment Scripts"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_SCRIPT="$SCRIPT_DIR/deploy.sh"
VALIDATE_SCRIPT="$SCRIPT_DIR/validate-stack.sh"

if [ -f "$DEPLOY_SCRIPT" ]; then
    print_success "deploy.sh found at scripts/deploy.sh"
else
    print_error "deploy.sh not found! This should not happen."
fi

if [ -f "$VALIDATE_SCRIPT" ]; then
    print_success "validate-stack.sh found at scripts/validate-stack.sh"
else
    print_error "validate-stack.sh not found! This should not happen."
fi

print_info "Use these scripts from your project directory:"
echo "  ../aws-deployment-kit/scripts/deploy.sh <bucket> <distribution-id> [profile]"
echo "  ../aws-deployment-kit/scripts/validate-stack.sh [template-file] [profile]"

# Summary
print_header "Setup Complete!"

echo "✓ All required tools are installed"
echo "✓ Helper scripts created"
echo ""
echo "Next steps:"
echo "  1. Read the GUIDE.md file for detailed instructions"
echo "  2. Customize the CloudFormation template if needed"
echo "  3. Deploy your infrastructure using the AWS Console or CLI"
echo "  4. Use ./deploy.sh to deploy your website"
echo ""
print_success "You're ready to deploy your website to AWS!"
