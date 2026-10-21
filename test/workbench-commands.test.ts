/*
 * The workbench commands against the reconciled service and invariants. FR-9, FR-10, FR-15.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ROOT } from '../workbench/lib.ts';
import { run as invariant } from '../workbench/commands/invariant.ts';
import { OPS, run as property, runSeed } from '../workbench/commands/property.ts';
import { TARGETED, applyMutant, suitePasses } from '../workbench/commands/mutation.ts';
import { replay } from '../workbench/commands/differential.ts';

test('[WB-01] the property command reports no violation over its seeded sequences', () => {
  assert.deepEqual(property(), { findings: [] });
});

test('[WB-02] the property generator exercises every operation, including capture-after-void, cross-payment refunds and replays', () => {
  const totals = Object.fromEntries(OPS.map(op => [op, 0])) as Record<string, number>;
  for (let seed = 1; seed <= 200; seed += 1) {
    for (const [op, n] of Object.entries(runSeed(seed).counts)) totals[op] += n;
  }
  for (const op of OPS) assert.ok(totals[op] > 0, `${op} never ran`);
});

test('[WB-03] the property command is reproducible from its seed', () => {
  assert.deepEqual(runSeed(42), runSeed(42));
});

test('[WB-04] the invariant command runs capture, refund and void and reports no violation', () => {
  assert.deepEqual(invariant(), { findings: [] });
});

test('[WB-05] the differential replay matches the golden corpus', () => {
  const golden = JSON.parse(readFileSync(join(ROOT, 'corpus', 'golden.json'), 'utf8'));
  assert.deepEqual(replay(), golden);
});

test('[WB-06] the targeted mutants cover the four named defects and each applies to one line', () => {
  assert.deepEqual(TARGETED.map(m => m.name), [
    'applyRate-truncation',
    'allocate-remainder-dropped',
    'refund-bound-ignores-earlier-refunds',
    'capture-ignores-void-state',
  ]);
  for (const mutant of TARGETED) {
    const source = readFileSync(join(ROOT, mutant.file), 'utf8');
    const mutated = applyMutant(source, mutant);
    assert.ok(mutated, `${mutant.name} no longer matches ${mutant.file}`);
    assert.notEqual(mutated.source, source);
    assert.equal(mutated.source.split('\n').length, source.split('\n').length);
  }
});

/*
 * Mutants are applied in a temporary copy of the tree, because the suite's other files
 * run in parallel against the real one. Skipped while the mutation command is judging a
 * mutant, so it does not recurse.
 */
test('[WB-07] every targeted mutant is killed by the suite', { skip: process.env.WORKBENCH_MUTANT === '1' }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'workbench-mutant-'));
  try {
    for (const part of ['src', 'test', 'workbench', 'corpus', 'package.json']) {
      cpSync(join(ROOT, part), join(dir, part), { recursive: true });
    }
    // The control. If the unmutated copy fails, every mutant would look killed.
    assert.equal(suitePasses(dir), true, 'the suite fails in the unmutated copy');
    for (const mutant of TARGETED) {
      const full = join(dir, mutant.file);
      const original = readFileSync(full, 'utf8');
      const mutated = applyMutant(original, mutant);
      assert.ok(mutated, `${mutant.name} no longer matches ${mutant.file}`);
      writeFileSync(full, mutated.source);
      assert.equal(suitePasses(dir), false, `${mutant.name} survived`);
      writeFileSync(full, original);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
