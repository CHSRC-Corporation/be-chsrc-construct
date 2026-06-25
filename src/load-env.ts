import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Minimal, dependency-free .env loader (works on any Node version).
// Loaded as the very first import in server.ts so vars are set before
// data-source.ts reads process.env at module-evaluation time.
// Shell-exported vars take precedence (standard dotenv behaviour).
const envPath = resolve(process.cwd(), '.env');

if (existsSync(envPath)) {
  for (const rawLine of readFileSync(envPath, 'utf8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const eq = line.indexOf('=');
    if (eq === -1) {
      continue;
    }

    const key = line.slice(0, eq).replace(/^export\s+/, '').trim();
    if (!key || key in process.env) {
      continue;
    }

    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}
