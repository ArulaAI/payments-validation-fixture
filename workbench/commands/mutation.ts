/*
 * Mutation testing. Plan 3.8, satisfying FR-15 and FR-16.
 *
 * Inject the defect, then ask whether the suite notices. A surviving mutant is positive
 * proof that the test cannot distinguish correct from broken, which is the only decisive
 * evidence about test strength.
 *
 * Changed files only, per FR-16. Mutating the whole tree would blow the 90-second budget
 * (NFR-1), and a workflow that cannot finish is a workflow nobody runs.
 *
 * Not every survivor is a defect. An equivalent mutant changes the source without
 * changing behaviour, so no test can kill it and fixing it is wasted work. Telling those
 * apart is the judgment this command exists to teach, per FR-17.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { type Finding, type Result, ROOT } from '../lib.ts';

type Mutator = { name: string; find: RegExp; replace: string };

const MUTATORS: Mutator[] = [
  { name: 'conditional-boundary', find: /([^<>=!])>=/g, replace: '$1>' },
  { name: 'conditional-boundary', find: /([^<>=!])<=/g, replace: '$1<' },
  { name: 'invert-negation', find: /!==/g, replace: '===' },
  { name: 'arithmetic', find: /([\w)\]]) \+ /g, replace: '$1 - ' },
  { name: 'return-true', find: /return sum % 10 === 0;/g, replace: 'return true;' },
];

/*
 * Targeted mutants. Each one reintroduces a defect this service has had or is built to
 * prevent, so a survivor here is a regression in the suite's strength, not a curiosity.
 * They run on every invocation, whatever the diff touches. A pattern that no longer
 * matches is reported, because a mutant that silently stops applying proves nothing.
 */
export type Mutant = { name: string; file: string; find: RegExp; replace: string };

export const TARGETED: Mutant[] = [
  {
    name: 'applyRate-truncation',
    file: 'src/domain/money.ts',
    find: /const rounded = magnitude \/ den \+ \(.*\);/,
    replace: 'const rounded = magnitude / den;',
  },
  {
    name: 'allocate-remainder-dropped',
    file: 'src/domain/money.ts',
    find: /minor\(base \+ \(i < Math\.abs\(remainder\) \? step : 0\)\)/,
    replace: 'minor(base)',
  },
  {
    name: 'refund-bound-ignores-earlier-refunds',
    file: 'src/payments/service.ts',
    find: /const refundable = sub\(capture\.amount, refunded\);/,
    replace: 'const refundable = capture.amount;',
  },
  {
    name: 'capture-ignores-void-state',
    file: 'src/payments/service.ts',
    find: /if \(payment\.status === 'voided'\) throw new RangeError\('cannot capture a voided payment'\);/,
    replace: '',
  },
];

/** The mutated source and the 1-based line it changed, or null when the pattern no longer matches. */
export const applyMutant = (source: string, mutant: Mutant): { source: string; line: number } | null => {
  const match = mutant.find.exec(source);
  if (!match) return null;
  return {
    source: source.slice(0, match.index) + mutant.replace + source.slice(match.index + match[0].length),
    line: source.slice(0, match.index).split('\n').length,
  };
};

const DEFAULT_TARGETS = ['src/domain/money.ts', 'src/domain/ledger.ts', 'src/payments/service.ts'];

const changedFiles = (base: string): string[] => {
  try {
    return execFileSync('git', ['diff', '--name-only', `${base}...HEAD`], {
      cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).split('\n').filter(f => f.endsWith('.ts') && f.startsWith('src/'));
  } catch {
    return [];
  }
};

/*
 * WORKBENCH_MUTANT tells the suite it is judging a mutant, so the test that itself runs
 * mutants skips rather than recursing. NODE_TEST_CONTEXT is dropped because, inherited from
 * a parent test run, it makes the nested runner report to that parent instead of exiting
 * with its own status.
 */
export const suitePasses = (cwd = ROOT): boolean => {
  const { NODE_TEST_CONTEXT: _, ...env } = process.env;
  try {
    execFileSync(process.execPath, ['--test', 'test/**/*.test.ts'], {
      cwd, stdio: 'ignore', env: { ...env, WORKBENCH_MUTANT: '1' },
    });
    return true;
  } catch {
    return false;
  }
};

export function run(opts: { base?: string } = {}): Result {
  /*
   * A mutant is "killed" when the suite fails with it applied. If the suite already
   * fails without it, every mutant looks killed and the command reports a confident
   * zero. That is worse than useless, so refuse to run and say why.
   */
  if (!suitePasses()) {
    return { findings: [], skipped: 'suite is red before mutation, so survivors cannot be measured' };
  }

  const targets = changedFiles(opts.base ?? 'main');
  const files = targets.length > 0 ? targets : DEFAULT_TARGETS;
  const findings: Finding[] = [];

  for (const relPath of files) {
    const full = join(ROOT, relPath);
    let original: string;
    try {
      original = readFileSync(full, 'utf8');
    } catch {
      continue;
    }
    const lines = original.split('\n');

    for (const mutator of MUTATORS) {
      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        if (line.trimStart().startsWith('*') || line.trimStart().startsWith('//')) continue;
        const mutated = line.replace(mutator.find, mutator.replace);
        if (mutated === line) continue;

        const copy = [...lines];
        copy[i] = mutated;
        writeFileSync(full, copy.join('\n'));
        const survived = suitePasses();
        writeFileSync(full, original);

        if (survived) {
          findings.push({
            file: relPath,
            line: i + 1,
            summary: `surviving mutant (${mutator.name}): the suite passes with this line changed`,
            severity: 'high',
          });
        }
      }
    }
  }

  for (const mutant of TARGETED) {
    const full = join(ROOT, mutant.file);
    const original = readFileSync(full, 'utf8');
    const mutated = applyMutant(original, mutant);
    if (!mutated) {
      findings.push({
        file: mutant.file,
        line: 1,
        summary: `targeted mutant (${mutant.name}) no longer matches the source, so it was not applied`,
        severity: 'medium',
      });
      continue;
    }
    writeFileSync(full, mutated.source);
    let survived: boolean;
    try {
      survived = suitePasses();
    } finally {
      writeFileSync(full, original);
    }
    if (survived) {
      findings.push({
        file: mutant.file,
        line: mutated.line,
        summary: `surviving mutant (${mutant.name}): the suite passes with this defect injected`,
        severity: 'high',
      });
    }
  }
  return { findings };
}
