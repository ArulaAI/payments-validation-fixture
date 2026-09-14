/* The suite as written. Plan 3.7, satisfying FR-15. Covers nothing on its own. */
import { execFileSync } from 'node:child_process';
import { type Result, ROOT } from '../lib.ts';

export function run(): Result {
  try {
    execFileSync(process.execPath, ['--test', 'test/**/*.test.ts'], {
      cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { findings: [] };
  } catch (error) {
    const out = String((error as { stdout?: string }).stdout ?? '');
    const failures = [...out.matchAll(/^not ok \d+ - (.+)$/gm)].map(m => m[1]);
    return {
      findings: failures.map(name => ({
        file: 'test/', line: 1, summary: `failing test: ${name}`, severity: 'high' as const,
      })),
    };
  }
}
