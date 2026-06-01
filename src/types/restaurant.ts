import type { Subscription } from './subscription';

/**
 * A physical area of a restaurant that tables are grouped into
 * (e.g. "Patio", "Salón", "Terraza"). Reusable and orderable.
 */
export interface Zone {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
}

export interface Table {
  id: string;
  /** Display-only sequential label shown in the admin ("Mesa N"). Never a key. */
  number: number;
  /** Optional zone this table belongs to. Tables without one show under "Sin zona". */
  zoneId?: string;
  /** Public, rotatable token used in the customer URL. Unguessable; never the id. */
  qrToken: string;
}

export interface Restaurant {
  id: string;
  /**
   * Public, rotatable business token used in the customer URL
   * (/r/[publicId]/t/[qrToken]). Unguessable and longer than a table token;
   * never the internal id. See `.claude/rules/data-conventions.md`.
   */
  publicId: string;
  name: string;
  tagline?: string;
  currency: string;
  /**
   * The restaurant's subscription to a platform Plan. The tenant (this
   * business) is who PAYS — the subscription lives here, never on the User.
   * See `subscription.ts`.
   */
  subscription: Subscription;
}
