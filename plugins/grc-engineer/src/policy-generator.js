/**
 * Policy-as-Code Generator
 * Converts natural language requirements to executable policies
 */

const POLICY_TEMPLATES = {
  rego: {
    s3_public: `package s3.public

import future.keywords.if
import future.keywords.in

# Deny S3 buckets that are public
deny[msg] {
    bucket := input.resource_changes[_]
    bucket.type == "aws_s3_bucket"
    bucket.change.after.public_access_block == null
    msg := "S3 bucket must have public access block configured"
}

# Deny S3 buckets without required tags
deny[msg] {
    bucket := input.resource_changes[_]
    bucket.type == "aws_s3_bucket"
    required_tags := {"Department"}
    tag_keys := {k | bucket.change.after.tags[k]}
    missing := required_tags - tag_keys
    count(missing) > 0
    msg := sprintf("S3 bucket missing required tags: %v", [missing])
}`,
    ec2_encryption: `package ec2.encryption

import future.keywords.if

# Deny EC2 instances without encryption
deny[msg] {
    instance := input.resource_changes[_]
    instance.type == "aws_instance"
    instance.change.after.root_block_device[0].encrypted != true
    msg := "EC2 instance root volume must be encrypted"
}

# Deny EC2 instances not in VPC
deny[msg] {
    instance := input.resource_changes[_]
    instance.type == "aws_instance"
    instance.change.after.subnet_id == null
    msg := "EC2 instance must be in a VPC"
}`
  },
  sentinel: {
    s3_public: `import "tfplan/v2" as tfplan

main = rule {
    all tfplan.resource_changes as _, rc {
        rc.type is not "aws_s3_bucket" or
        (rc.change.after.public_access_block is not null and
         rc.change.after.tags.Department is not null)
    }
}`
  },
  'aws-config': {
    s3_public: `import boto3
import json

def evaluate_compliance(configuration_item, rule_parameters):
    """AWS Config Rule: Ensure S3 buckets are not public and have Department tag"""
    compliance_type = 'COMPLIANT'
    annotation = 'S3 bucket is compliant'
    
    s3 = boto3.client('s3')
    bucket_name = configuration_item['configuration']['name']
    
    # Check public access block
    try:
        public_access = s3.get_public_access_block(Bucket=bucket_name)
        if not public_access.get('PublicAccessBlockConfiguration', {}).get('BlockPublicAcls', False):
            compliance_type = 'NON_COMPLIANT'
            annotation = 'S3 bucket does not have public access blocked'
    except:
        compliance_type = 'NON_COMPLIANT'
        annotation = 'S3 bucket public access block not configured'
    
    # Check for Department tag
    try:
        tags = s3.get_bucket_tagging(Bucket=bucket_name)
        tag_dict = {tag['Key']: tag['Value'] for tag in tags['TagSet']}
        if 'Department' not in tag_dict:
            compliance_type = 'NON_COMPLIANT'
            annotation = 'S3 bucket missing required Department tag'
    except:
        compliance_type = 'NON_COMPLIANT'
        annotation = 'S3 bucket missing required Department tag'
    
    return {
        'ComplianceType': compliance_type,
        'Annotation': annotation
    }`
  }
};

export function generatePolicy(requirement, format = 'rego') {
  if (!Object.hasOwn(POLICY_TEMPLATES, format)) {
    throw new Error(`Unsupported format: ${format}. Supported: ${Object.keys(POLICY_TEMPLATES).join(', ')}`);
  }
  const normalizedReq = requirement.toLowerCase();
  
  // Detect requirement type
  let policyType = 'default';
  if (normalizedReq.includes('s3') && (normalizedReq.includes('public') || normalizedReq.includes('tag'))) {
    policyType = 's3_public';
  } else if (normalizedReq.includes('ec2') && normalizedReq.includes('encrypt')) {
    policyType = 'ec2_encryption';
  }

  const template = Object.hasOwn(POLICY_TEMPLATES[format], policyType) ? POLICY_TEMPLATES[format][policyType] : undefined;
  
  if (!template) {
    throw new Error(`No policy template available for this requirement in format: ${format}. No policy was generated.`);
  }

  // Generate policy with requirement context
  const policy = {
    requirement,
    format,
    code: `# DRAFT - DO NOT ENFORCE without independent review and testing. Keyword matching may not reflect the requirement.\n${template}`,
    metadata: {
      generated: new Date().toISOString(),
      requirement_type: policyType
    }
  };

  // Add format-specific documentation
  if (format === 'rego') {
    policy.documentation = generateRegoDocs(requirement);
  } else if (format === 'sentinel') {
    policy.documentation = generateSentinelDocs(requirement);
  } else if (format === 'aws-config') {
    policy.documentation = generateAwsConfigDocs(requirement);
  }

  policy.documentation = `> DRAFT: Do not enforce without independent review and testing. Keyword matching may not reflect the requirement.\n\n${policy.documentation}`;
  return policy;
}

function generateRegoDocs(requirement) {
  return `# OPA Rego Policy

## Requirement
${requirement}

## Usage

1. Save this policy to \`policy.rego\`
2. Test with: \`opa test policy.rego\`
3. Integrate into CI/CD:
   \`\`\`bash
   opa test --format json policy.rego | opa eval -d policy.rego -i plan.json 'data.policy'
   \`\`\`

## Example Test

\`\`\`rego
test_deny_public_bucket {
    deny["S3 bucket must have public access block configured"] with input as {
        "resource_changes": [{
            "type": "aws_s3_bucket",
            "change": {
                "after": {
                    "public_access_block": null
                }
            }
        }]
    }
}
\`\`\`
`;
}

function generateSentinelDocs(requirement) {
  return `# Sentinel Policy

## Requirement
${requirement}

## Usage

1. Save this policy to \`policy.sentinel\`
2. Test with Terraform:
   \`\`\`bash
   terraform plan -out=tfplan.binary
   terraform show -json tfplan.binary > tfplan.json
   sentinel test policy.sentinel
   \`\`\`

3. Integrate into Terraform Cloud/Enterprise
`;
}

function generateAwsConfigDocs(requirement) {
  return `# AWS Config Rule

## Requirement
${requirement}

## Usage

1. Save this code to a Lambda function
2. Create AWS Config Rule:
   \`\`\`bash
   aws configservice put-config-rule \\
     --config-rule file://config-rule.json
   \`\`\`

3. The Lambda function will be invoked by AWS Config to evaluate compliance
`;
}

