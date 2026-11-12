// Resolve numeric resource names only when needed. Never expose provider output.
import { spawnSync } from 'node:child_process';

export function projectScope(project) {
  let number;
  return returnedProject => {
    if (returnedProject === project) return;
    if (!/^[0-9]+$/.test(returnedProject)) throw new Error('scope');
    if (number === undefined) {
      const result = spawnSync('gcloud', ['projects', 'describe', project, '--format=json(projectId,projectNumber)', '--quiet'], {
        encoding: 'utf8', shell: false, stdio: ['ignore', 'pipe', 'ignore'],
        maxBuffer: 1024 * 1024, timeout: 15000, killSignal: 'SIGKILL',
      });
      if (result.error || result.signal || result.status !== 0) throw new Error('mapping');
      let mapping;
      try { mapping = JSON.parse(result.stdout); } catch { throw new Error('mapping'); }
      if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping) ||
          mapping.projectId !== project || typeof mapping.projectNumber !== 'string' ||
          !/^[1-9][0-9]*$/.test(mapping.projectNumber)) throw new Error('mapping');
      number = mapping.projectNumber;
    }
    if (returnedProject !== number) throw new Error('scope');
  };
}
