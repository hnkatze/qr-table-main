import type { Table, Zone } from '@/types/restaurant';

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
  /** Fully-formed public customer URL: /r/[publicId]/t/[qrToken] */
  customerUrl: string;
}

/**
 * A group of tables under a single zone, used to render one zone section.
 * `zone` is null for the trailing "Sin zona" group (tables with no/unknown zone).
 */
export interface ZoneGroup {
  zone: Zone | null;
  tables: TableCard[];
}

/** Discriminated union for the create-table dialog submit state */
export type CreateTableState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; tableNumber: number }
  | { status: 'error'; message: string };

/** Discriminated union for the create-zone dialog submit state */
export type CreateZoneState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; zoneName: string }
  | { status: 'error'; message: string };

/**
 * Lightweight zone option for the add-table dialog's <Select>.
 * The sentinel "no zone" choice is modeled as a constant value (see constants.ts).
 */
export interface ZoneOption {
  id: string;
  name: string;
}
