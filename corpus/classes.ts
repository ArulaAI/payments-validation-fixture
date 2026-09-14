/*
 * The eight failure classes. Plan 1.3, satisfying FR-21.
 *
 * The chain runner subtracts the classes covered by checks that actually ran from this
 * list to compute `notExamined`. That is why the list lives in data rather than prose.
 */

export type ClassId = 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8';

export type FailureClass = {
  id: ClassId;
  title: string;
  /** True when no check can decide it. Reserved for human judgment. See G5. */
  humanReserved: boolean;
};

export const failureClasses: FailureClass[] = [
  { id: 'F1', title: 'Hallucinated API, config key or dependency', humanReserved: false },
  { id: 'F2', title: 'Cardholder data leakage', humanReserved: false },
  { id: 'F3', title: 'Weak test that passes and proves nothing', humanReserved: false },
  { id: 'F4', title: 'Broken invariant under concurrency or retry', humanReserved: false },
  { id: 'F5', title: 'Sycophantic self-approval', humanReserved: false },
  { id: 'F6', title: 'Wrong problem, scope creep, over-engineering', humanReserved: false },
  { id: 'F7', title: 'Silent regression in untouched behaviour', humanReserved: false },
  { id: 'F8', title: 'Specification gap, where the defect is what nobody specified', humanReserved: true },
];

export const classById = new Map(failureClasses.map(c => [c.id, c]));

export const allClassIds = failureClasses.map(c => c.id);
