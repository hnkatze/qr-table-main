import type { Table } from '@/types/restaurant';

/**
 * View-model for a single table card.
 * Extends the domain Table with the derived customer-facing URL
 * so components never build URLs themselves.
 */
export interface TableCard {
  /** Original domain entity */
  table: Table;
  /** The rotatable public token the customer URL is built from (from Table.qrToken). */
  qrToken: string;
  /** Fully-formed public customer URL: /r/[slug]/t/[qrToken] */
  customerUrl: string;
}

/** Discriminated union for the create-table dialog submit state */
export type CreateTableState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; tableNumber: number }
  | { status: 'error'; message: string };
