/**
 * Policy-as-Code Generator CLI
 *
 * Usage: node scripts/generate-policy.js "<requirement>" [format]
 *
 * Examples:
 *   node scripts/generate-policy.js "Ensure no S3 buckets are public" rego
 *   node scripts/generate-policy.js "All EC2 instances must have encryption enabled" rego
 */

import { generatePolicy } from '../src/policy-generator.js';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  const requirement = process.argv[2];
  const format = process.argv[3] || 'rego';

  if (!requirement) {
    console.error('Usage: node scripts/generate-policy.js "<requirement>" [format]');
    console.error('');
    console.error('Examples:');
    console.error('  node scripts/generate-policy.js "Ensure no S3 buckets are public" rego');
    console.error('  node scripts/generate-policy.js "All EC2 instances must have encryption enabled" rego');
    console.error('');
    console.error('Supported formats: rego, sentinel, aws-config (template availability varies).');
    console.error('Outputs are drafts, not enforceable policies; independently review and test them.');
    process.exit(1);
  }

  try {
    const policy = generatePolicy(requirement, format);
    
    // Determine file extension
    const extensions = {
      rego: '.rego',
      sentinel: '.sentinel',
      'aws-config': '.py'
    };
    
    const ext = extensions[format] || '.txt';
    const filename = `policy_${Date.now()}${ext}`;
    
    // Write policy code
    await fs.writeFile(filename, policy.code, 'utf-8');
    console.log(`Policy generated: ${filename}`);
    console.log('');
    console.log('---');
    console.log(policy.code);
    console.log('---');
    
    // Write documentation if available
    if (policy.documentation) {
      const docFile = filename.replace(ext, '.md');
      await fs.writeFile(docFile, policy.documentation, 'utf-8');
      console.log(`\nDocumentation saved: ${docFile}`);
    }
    
    console.log(`\nRequirement: ${requirement}`);
    console.log(`Format: ${format}`);
    console.log(`Generated: ${policy.metadata.generated}`);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error);

