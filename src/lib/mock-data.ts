/**
 * Mock data for development — stands in for Firestore until Firebase lands.
 * All data is co-located here so it's trivial to swap out for real listeners.
 */

import type { User } from '@/types/user';
import type { Restaurant, Table, Zone } from '@/types/restaurant';
import type { Membership, RestaurantMembership } from '@/types/membership';

// ─── Users ────────────────────────────────────────────────────────────────────

export const MOCK_CURRENT_USER: User = {
  id: 'usr_ana_001',
  email: 'ana@mesaapp.hn',
  displayName: 'Ana García',
  photoUrl: undefined,
};

export const MOCK_USERS: User[] = [
  MOCK_CURRENT_USER,
  {
    id: 'usr_carlos_002',
    email: 'carlos@mesaapp.hn',
    displayName: 'Carlos López',
  },
  {
    id: 'usr_marta_003',
    email: 'marta@mesaapp.hn',
    displayName: 'Marta Rodríguez',
  },
  {
    id: 'usr_jose_004',
    email: 'jose@restauranteb.hn',
    displayName: 'José Mejía',
  },
];

// ─── Restaurants ──────────────────────────────────────────────────────────────

// publicId is PUBLIC (it goes in the customer URL /r/[publicId]/...), so it MUST
// be unguessable — a real long random token, never the business name/slug.
export const RESTAURANT_A: Restaurant = {
  id: 'rest_a_001',
  publicId: 'Rk9xQm2pVnL4bT7w',
  name: 'La Ceiba',
  tagline: 'Sabores hondureños auténticos',
  currency: 'HNL',
};

export const RESTAURANT_B: Restaurant = {
  id: 'rest_b_002',
  publicId: 'Hd3yPj8mZc5Nf1Ws',
  name: 'El Mercado',
  tagline: 'Cocina de mercado, ingredientes frescos',
  currency: 'HNL',
};

export const MOCK_RESTAURANTS: Restaurant[] = [RESTAURANT_A, RESTAURANT_B];

// ─── Zones ────────────────────────────────────────────────────────────────────

// La Ceiba has two zones; El Mercado has none yet (its tables show under "Sin zona").
export const MOCK_ZONES_A: Zone[] = [
  { id: 'zone_a_patio', restaurantId: 'rest_a_001', name: 'Patio', sortOrder: 1 },
  { id: 'zone_a_terraza', restaurantId: 'rest_a_001', name: 'Terraza', sortOrder: 2 },
];

export const MOCK_ZONES_B: Zone[] = [];

// ─── Tables ───────────────────────────────────────────────────────────────────

// qrToken is PUBLIC (it goes in the customer URL), so it MUST be unguessable —
// a real short random token, never a predictable pattern like `qr-<slug>-t<n>`.
// The internal `id` may stay readable since it is private. See
// `.claude/rules/data-conventions.md` and `src/lib/id.ts` (newQrToken()).
// `zoneId` is optional — tables without one render under "Sin zona".
export const MOCK_TABLES_A: Table[] = [
  { id: 'tbl_a1', number: 1, zoneId: 'zone_a_patio', qrToken: 'qr_7Kp2Qx9aZ3mN' },
  { id: 'tbl_a2', number: 2, zoneId: 'zone_a_patio', qrToken: 'qr_W4bV8sLp1qXr' },
  { id: 'tbl_a3', number: 3, zoneId: 'zone_a_terraza', qrToken: 'qr_9Rt5Hn3Kf6Dy' },
];

export const MOCK_TABLES_B: Table[] = [
  { id: 'tbl_b1', number: 1, qrToken: 'qr_2Mw8Jc4Vb7Lx' },
  { id: 'tbl_b2', number: 2, qrToken: 'qr_6Pq3Yd9Sn1Zk' },
];

// ─── Memberships ──────────────────────────────────────────────────────────────

/**
 * Ana is owner of Restaurant A, and staff at Restaurant B.
 * This exercises the multi-tenancy requirement on day one.
 */
const MEMBERSHIPS_RAW: Membership[] = [
  // Ana: owner of La Ceiba
  {
    id: 'mem_ana_a',
    userId: 'usr_ana_001',
    restaurantId: 'rest_a_001',
    role: 'owner',
    createdAt: 1_700_000_000_000,
  },
  // Ana: staff at El Mercado
  {
    id: 'mem_ana_b',
    userId: 'usr_ana_001',
    restaurantId: 'rest_b_002',
    role: 'staff',
    createdAt: 1_710_000_000_000,
  },
  // Carlos: staff at La Ceiba
  {
    id: 'mem_carlos_a',
    userId: 'usr_carlos_002',
    restaurantId: 'rest_a_001',
    role: 'staff',
    createdAt: 1_705_000_000_000,
  },
  // Marta: staff at La Ceiba
  {
    id: 'mem_marta_a',
    userId: 'usr_marta_003',
    restaurantId: 'rest_a_001',
    role: 'staff',
    createdAt: 1_708_000_000_000,
  },
  // José: owner of El Mercado
  {
    id: 'mem_jose_b',
    userId: 'usr_jose_004',
    restaurantId: 'rest_b_002',
    role: 'owner',
    createdAt: 1_702_000_000_000,
  },
];

const RESTAURANT_MAP: Record<string, Restaurant> = {
  [RESTAURANT_A.id]: RESTAURANT_A,
  [RESTAURANT_B.id]: RESTAURANT_B,
};

export const MOCK_MEMBERSHIPS: Membership[] = MEMBERSHIPS_RAW;

/**
 * All memberships enriched with the full restaurant object.
 * This is the shape returned by useAuth().memberships.
 */
export const MOCK_ALL_RESTAURANT_MEMBERSHIPS: RestaurantMembership[] =
  MEMBERSHIPS_RAW.map((m) => ({
    ...m,
    restaurant: RESTAURANT_MAP[m.restaurantId]!,
  }));

/**
 * Memberships for the current mock user (Ana).
 */
export const MOCK_CURRENT_USER_MEMBERSHIPS: RestaurantMembership[] =
  MOCK_ALL_RESTAURANT_MEMBERSHIPS.filter(
    (m) => m.userId === MOCK_CURRENT_USER.id
  );

/**
 * Members of a given restaurant (for the Users admin page).
 */
export function getMembersForRestaurant(restaurantId: string): RestaurantMembership[] {
  return MOCK_ALL_RESTAURANT_MEMBERSHIPS.filter(
    (m) => m.restaurantId === restaurantId
  );
}
