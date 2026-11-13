import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

// A hard link publishes the already-closed inode atomically without replacing an
// existing destination. Never fall back to rename/copy if hard links are denied.
export async function publishEvidence(target, evidence, io = fs) {
  const temp = path.join(path.dirname(target), `.${path.basename(target)}.${randomUUID()}.tmp`);
  let file;
  let ownsTemp = false;
  try {
    const data = JSON.stringify(evidence, null, 2);
    file = await io.open(temp, 'wx', 0o600);
    ownsTemp = true;
    await file.writeFile(data);
    const opened = file;
    file = undefined;
    await opened.close();
    await io.link(temp, target);
  } catch {
    // A failed close is not retried: its descriptor state is unspecified.
    if (file) { try { await file.close(); } catch {} }
    throw new Error('Secret Manager evidence publication failed.');
  } finally {
    // Only remove our exclusive temp file, never the final destination. Cleanup
    // is best effort, including after publication has already succeeded.
    if (ownsTemp) { try { await io.unlink(temp); } catch {} }
  }
}
