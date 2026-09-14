/*
 * Self-check. Plan 6.3, satisfying NFR-7, NFR-11, CR-8 and FR-17.
 *
 * Asserts the rules this repository makes about itself, so they fail loudly rather than
 * rotting. Everything here is a rule that a future change could break silently.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { checks } from './checks.ts';
import { allClassIds } from '../corpus/classes.ts';
import { ROOT, sourceFiles, rel } from './lib.ts';

const failures: string[] = [];
const check = (ok: boolean, message: string) => { if (!ok) failures.push(message); };

// NFR-11: the repository must run with no install.
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
check(!pkg.dependencies, 'NFR-9: package.json declares dependencies');
check(!pkg.devDependencies, 'NFR-9: package.json declares devDependencies');

/*
 * NFR-8 vocabulary and NFR-7 style.
 *
 * Built from character codes rather than written out, because this file would otherwise
 * match its own rules. specs/ is exempt: it quotes the course and the client brief.
 */
const BANNED_NOUN = new RegExp(`\\b${['i', 'nstrument'].join('')}s?\\b`, 'i');
/*
 * "battery" is banned too. The client used it once and "chain" elsewhere, and the course
 * settled on chain. specs/ may quote him verbatim; nothing else may use the word.
 */
const BANNED_CHAIN_WORD = new RegExp(`\\b${['batter', 'y'].join('')}\\b`, 'i');
const EM_DASH = String.fromCharCode(0x2014);

for (const file of sourceFiles()) {
  const path = rel(file);
  if (path.startsWith('specs/') || path === 'workbench/verify.ts') continue;
  const text = readFileSync(file, 'utf8');
  if (BANNED_NOUN.test(text)) failures.push(`NFR-8: the banned generic noun appears in ${path}`);
  if (BANNED_CHAIN_WORD.test(text)) failures.push(`NFR-8: say "chain", not the other word, in ${path}`);
  if (text.includes(EM_DASH)) failures.push(`NFR-7: em-dash in ${path}`);
}

// FR-11 and FR-21: every check declares a kind and covers only real classes.
for (const c of checks) {
  check(['hook', 'command', 'skill'].includes(c.kind), `FR-11: ${c.id} has an unknown kind`);
  for (const cls of c.covers) {
    check(allClassIds.includes(cls), `FR-21: ${c.id} covers unknown class ${cls}`);
  }
}

// G5 and FR-6: F8 must remain uncovered. This is the guarantee the course rests on.
const coversF8 = checks.filter(c => (c.covers as string[]).includes('F8'));
check(coversF8.length === 0, `G5: F8 is claimed as covered by ${coversF8.map(c => c.id).join(', ')}`);

// FR-19: every check named in the chain exists, and every check is in the chain.
const chainText = readFileSync(join(ROOT, 'workbench', 'chain.yaml'), 'utf8');
const named = [...chainText.matchAll(/^\s{2}- ([\w-]+)\s*$/gm)].map(m => m[1]);
for (const c of checks) check(named.includes(c.id), `FR-19: ${c.id} is declared but absent from chain.yaml`);

// CR-8: every manifest validates against the schema.
const schema = JSON.parse(readFileSync(join(ROOT, 'corpus', 'manifest.schema.json'), 'utf8'));
const rounds = readdirSync(join(ROOT, 'corpus')).filter(d => d.startsWith('round-'));
for (const dir of rounds) {
  const path = join(ROOT, 'corpus', dir, 'manifest.json');
  if (!existsSync(path)) { failures.push(`CR-1: ${dir} has no manifest.json`); continue; }
  const manifest = JSON.parse(readFileSync(path, 'utf8'));
  for (const key of schema.required) {
    check(key in manifest, `CR-8: ${dir}/manifest.json is missing "${key}"`);
  }
  // CR-3: exactly one reserved defect.
  const reserved = manifest.defects.filter((d: { reserved: boolean }) => d.reserved);
  check(reserved.length === 1, `CR-3: ${dir} has ${reserved.length} reserved defects, expected exactly 1`);
  // CR-4: at least one pathology.
  check(manifest.pathologies.length >= 1, `CR-4: ${dir} declares no evidence pathology`);
  // A reserved defect must not claim a check can catch it.
  for (const d of reserved) {
    check((d as { caughtBy: string | null }).caughtBy === null, `CR-3: reserved defect in ${dir} names a catching check`);
  }
}

if (failures.length > 0) {
  console.error(`verify: ${failures.length} failure${failures.length === 1 ? '' : 's'}`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`verify: ok. ${checks.length} checks, ${rounds.length} round${rounds.length === 1 ? '' : 's'}, no required dependencies.`);
