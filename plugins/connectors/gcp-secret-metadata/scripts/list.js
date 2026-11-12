#!/usr/bin/env node
// Metadata inventory only. Never access secret versions or print provider errors.
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
if (args.length !== 1 || !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(args[0])) {
  console.error('Usage: node list.js <project-id>');
  process.exit(2);
}
const result = spawnSync('gcloud', ['secrets', 'list', `--project=${args[0]}`, '--format=json', '--quiet'], {
  encoding: 'utf8', shell: false, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 16 * 1024 * 1024, timeout: 15000, killSignal: 'SIGKILL',
});
if (result.error || result.signal || result.status !== 0) {
  console.error('Secret inventory failed. Check gcloud authentication, permissions and project; provider output suppressed.');
  process.exit(1);
}
try {
  const data = JSON.parse(result.stdout);
  if (!Array.isArray(data)) throw new Error();
  const secrets = data.map(secret => {
    if (!secret || typeof secret.name !== 'string' || !/^projects\/(?:[a-z][a-z0-9-]{4,28}[a-z0-9]|[0-9]+)\/secrets\/[a-zA-Z0-9_-]+$/.test(secret.name)) throw new Error();
    return { name: secret.name };
  });
  console.log(JSON.stringify({ project: args[0], secrets }, null, 2));
} catch {
  console.error('Secret inventory returned malformed data; provider output suppressed.');
  process.exit(1);
}
