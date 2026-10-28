/*
 * Double-entry ledger. Plan 2.2, satisfying FR-4.
 *
 * Every movement writes a balanced pair. Nothing in the service may write a single
 * entry, which is what makes LEDGER_BALANCED assertable after any operation sequence.
 */

import { type Minor, add, minor } from './money.ts';

export type Account =
  | 'cardholder'
  | 'merchant_receivable'
  | 'merchant_settled'
  | 'scheme_fees'
  | 'refunds_payable';

export type Entry = {
  id: string;
  pairId: string;
  account: Account;
  amount: Minor;
  paymentId: string;
  kind: 'authorise' | 'capture' | 'refund' | 'void';
  at: number;
};

const ACCOUNTS: ReadonlySet<string> = new Set<Account>([
  'cardholder',
  'merchant_receivable',
  'merchant_settled',
  'scheme_fees',
  'refunds_payable',
]);

const KINDS: ReadonlySet<string> = new Set<Entry['kind']>(['authorise', 'capture', 'refund', 'void']);

let seq = 0;
const nextId = (prefix: string) => `${prefix}_${(++seq).toString(36).padStart(6, '0')}`;

export class Ledger {
  /** Only `post` appends here, and always two entries at a time. */
  readonly #entries: Readonly<Entry>[] = [];

  /** A frozen snapshot. Pushing to it or editing an entry throws, so it cannot write. */
  get entries(): readonly Readonly<Entry>[] {
    return Object.freeze([...this.#entries]);
  }

  /**
   * Write a balanced pair. Debit and credit are the same magnitude, opposite sign.
   * Everything is validated before the first write, so a throw leaves the ledger unchanged.
   */
  post(args: {
    debit: Account;
    credit: Account;
    amount: Minor;
    paymentId: string;
    kind: Entry['kind'];
  }): string {
    const amount = minor(args.amount);
    const reversed = minor(0 - amount);
    if (!ACCOUNTS.has(args.debit)) throw new RangeError(`unknown debit account ${args.debit}`);
    if (!ACCOUNTS.has(args.credit)) throw new RangeError(`unknown credit account ${args.credit}`);
    if (!KINDS.has(args.kind)) throw new RangeError(`unknown entry kind ${args.kind}`);

    const pairId = nextId('pair');
    const at = Date.now();
    const { paymentId, kind } = args;
    this.#entries.push(
      Object.freeze({ id: nextId('ent'), pairId, account: args.debit, amount, paymentId, kind, at }),
      Object.freeze({ id: nextId('ent'), pairId, account: args.credit, amount: reversed, paymentId, kind, at }),
    );
    return pairId;
  }

  /** Signed total over all entries, or over one pair when a pairId is given. */
  net(pairId?: string): number {
    return this.#entries
      .filter(e => pairId === undefined || e.pairId === pairId)
      .reduce((sum, e) => add(sum, e.amount), minor(0));
  }

  forPayment(paymentId: string): Entry[] {
    return this.#entries.filter(e => e.paymentId === paymentId);
  }

  totalFor(paymentId: string, kind: Entry['kind']): number {
    return this.#entries
      .filter(e => e.paymentId === paymentId && e.kind === kind && e.amount > 0)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  reset(): void {
    this.#entries.length = 0;
  }
}
