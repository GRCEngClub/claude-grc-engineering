import { mapControl, getAvailableFrameworks } from '../src/control-mapper.js';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  const iacFile = process.argv[2];
  const framework = process.argv[3] || 'soc2';

  if (!iacFile) {
    const frameworks = await getAvailableFrameworks();
    console.error('Usage: node scripts/map-control.js <iac-file> [framework]');
    console.error('');
    console.error('Examples:');
    console.error('  node scripts/map-control.js main.tf soc2');
    console.error('  node scripts/map-control.js k8s/deployment.yaml iso27001');
    console.error('  node scripts/map-control.js template.yaml nist800-53');
    console.error('');
    console.error(`Supported frameworks: ${frameworks.join(', ')}`);
    process.exit(1);
  }

  let stat;
  try {
    stat = await fs.stat(iacFile);
  } catch {
    console.error(`Error: File not found: ${iacFile}`);
    process.exit(1);
  }
  if (stat.isDirectory()) {
    console.error(`Error: ${iacFile} is a directory. map-control reads one file; use /engineer:scan-iac for a directory.`);
    process.exit(1);
  }

  try {
    const result = await mapControl(iacFile, framework);
    
    console.log(result.report);
    
    const reportFile = path.join(
      path.dirname(iacFile),
      `${path.basename(iacFile, path.extname(iacFile))}_compliance_report.md`
    );
    
    await fs.writeFile(reportFile, result.report, 'utf-8');
    console.log(`\nReport saved to: ${reportFile}`);
    
    console.log(`\n---\n`);
    console.log(`Summary:`);
    console.log(`  Framework: ${result.framework}`);
    console.log(`  Mappings found: ${result.mappings.length}`);
    console.log(`  Satisfied: ${result.mappings.filter(m => m.status.includes('Satisfied')).length}`);
    console.log(`  Violations: ${result.mappings.filter(m => m.status.includes('Violation')).length}`);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error);

