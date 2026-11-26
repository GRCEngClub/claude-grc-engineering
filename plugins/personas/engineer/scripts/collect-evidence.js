import { generateEvidenceScript, getAvailableProviders } from '../src/evidence-collector.js';
import fs from 'fs/promises';

async function main() {
  const control = process.argv[2];
  const provider = process.argv[3] || 'aws';
  const format = process.argv[4] || 'python';

  if (!control) {
    const providers = await getAvailableProviders();
    console.error('Usage: node scripts/collect-evidence.js "<control>" [provider] [format]');
    console.error('');
    console.error('Examples:');
    console.error('  node scripts/collect-evidence.js "MFA for all root users" aws python');
    console.error('  node scripts/collect-evidence.js "All S3 buckets encrypted" aws bash');
    console.error('  node scripts/collect-evidence.js "Storage accounts encrypted" azure bash');
    console.error('  node scripts/collect-evidence.js "2-step verification" gcp python');
    console.error('  node scripts/collect-evidence.js "RBAC roles configured" kubernetes bash');
    console.error('');
    console.error(`Supported providers: ${providers.join(', ')}`);
    console.error('Supported formats: python, bash');
    process.exit(1);
  }

  try {
    const result = await generateEvidenceScript(control, provider, format);
    
    const ext = format === 'python' ? '.py' : '.sh';
    const filename = `evidence_${Date.now()}${ext}`;
    
    await fs.writeFile(filename, result.script, 'utf-8');
    
    if (format === 'bash') {
      await fs.chmod(filename, 0o755);
    }
    
    console.log(`Evidence script generated: ${filename}`);
    console.log('');
    console.log('---');
    console.log(result.script);
    console.log('---');
    
    if (result.instructions) {
      const instructionsFile = filename.replace(ext, '_instructions.md');
      await fs.writeFile(instructionsFile, result.instructions, 'utf-8');
      console.log(`\nInstructions saved: ${instructionsFile}`);
    }
    
    console.log(`\nControl: ${control}`);
    console.log(`Provider: ${provider}`);
    console.log(`Format: ${format}`);
    console.log(`Generated: ${result.metadata.generated}`);
    console.log(`\nNext steps:`);
    console.log(`  1. Review the generated script`);
    console.log(`  2. Configure credentials for ${provider}`);
    console.log(`  3. Run: ${format === 'python' ? `python3 ${filename}` : `./${filename}`}`);
    console.log(`  4. Save output for audit documentation`);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error);

