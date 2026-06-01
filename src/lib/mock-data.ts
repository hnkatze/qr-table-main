/**
 * Mock data for development — stands in for Firestore until Firebase lands.
 * All data is co-located here so it's trivial to swap out for real listeners.
 */

import type { User } from '@/types/user';
import type { Restaurant, Table, Zone } from '@/types/restaurant';
import type { Plan } from '@/types/plan';
import type { Membership, RestaurantMembership } from '@/types/membership';

// ─── Plans (platform catalog) ───────────────────────────────────────────────
//
// Plans are DATA the platform owner manages. Their `limits` gate tenant
// features (e.g. a restaurant on "Básico" can create at most 7 tables).
// See `src/types/plan.ts` and the platform plans page.

// Prices are in USD (the platform billing currency). Limits are sized for
// food entrepreneurs — cafés, food trucks, small eateries — not large chains.
export const PLAN_BASIC: Plan = {
  id: 'plan_basic',
  name: 'Básico',
  priceMonthly: 9,
  description: 'Ideal para un café o emprendimiento que arranca con su menú digital.',
  limits: { maxTables: 5, maxMenuItems: 20 },
  isActive: true,
};

export const PLAN_MEDIUM: Plan = {
  id: 'plan_medium',
  name: 'Medium',
  priceMonthly: 25,
  description: 'Para un negocio en crecimiento con más mesas y un menú más amplio.',
  limits: { maxTables: 12, maxMenuItems: 45 },
  isActive: true,
};

export const PLAN_PRO: Plan = {
  id: 'plan_pro',
  name: 'Pro',
  priceMonthly: 49,
  description: 'Para una operación consolidada con varias zonas y menú completo.',
  limits: { maxTables: 25, maxMenuItems: 90 },
  isActive: true,
};

export const MOCK_PLANS: Plan[] = [PLAN_BASIC, PLAN_MEDIUM, PLAN_PRO];

const PLAN_MAP: Record<string, Plan> = {
  [PLAN_BASIC.id]: PLAN_BASIC,
  [PLAN_MEDIUM.id]: PLAN_MEDIUM,
  [PLAN_PRO.id]: PLAN_PRO,
};

/** Look up a plan by id; null if it does not exist (e.g. archived/removed). */
export function getPlanById(planId: string): Plan | null {
  return PLAN_MAP[planId] ?? null;
}

// ─── Users ────────────────────────────────────────────────────────────────────

/**
 * Ana is the current mock user.
 *
 * DEV NOTE: Ana doubles as the platform `superadmin` so the "Plataforma" nav
 * group is visible during development while she is also a regular tenant
 * owner/staff. In PRODUCTION the SaaS owner would be a SEPARATE account with no
 * restaurant memberships — the two planes (platform vs tenant) stay distinct.
 */
export const MOCK_CURRENT_USER: User = {
  id: 'usr_ana_001',
  email: 'ana@mesaapp.hn',
  displayName: 'Ana García',
  photoUrl: undefined,
  platformRole: 'superadmin',
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
  {
    id: 'usr_sofia_005',
    email: 'sofia@cafelenca.hn',
    displayName: 'Sofía Discua',
  },
  {
    id: 'usr_pedro_006',
    email: 'pedro@mariscosdelsur.hn',
    displayName: 'Pedro Banegas',
  },
];

// ─── Restaurants ──────────────────────────────────────────────────────────────

// publicId is PUBLIC (it goes in the customer URL /r/[publicId]/...), so it MUST
// be unguessable — a real long random token, never the business name/slug.
// `subscription` ties the tenant to a platform Plan; the BUSINESS is who pays.
export const RESTAURANT_A: Restaurant = {
  id: 'rest_a_001',
  publicId: 'Rk9xQm2pVnL4bT7w',
  name: 'La Ceiba',
  tagline: 'Sabores hondureños auténticos',
  currency: 'HNL',
  subscription: {
    planId: 'plan_basic',
    status: 'active',
    currentPeriodEnd: 1_788_000_000_000,
  },
};

export const RESTAURANT_B: Restaurant = {
  id: 'rest_b_002',
  publicId: 'Hd3yPj8mZc5Nf1Ws',
  name: 'El Mercado',
  tagline: 'Cocina de mercado, ingredientes frescos',
  currency: 'HNL',
  subscription: {
    planId: 'plan_medium',
    status: 'active',
    currentPeriodEnd: 1_790_000_000_000,
  },
};

export const RESTAURANT_C: Restaurant = {
  id: 'rest_c_003',
  publicId: 'Qw7nFt2kLp9xVb3m',
  name: 'Café Lenca',
  tagline: 'Café de altura y repostería artesanal',
  currency: 'HNL',
  subscription: {
    planId: 'plan_basic',
    status: 'trialing',
    currentPeriodEnd: 1_781_500_000_000,
  },
};

export const RESTAURANT_D: Restaurant = {
  id: 'rest_d_004',
  publicId: 'Zx4cVn8bMq1wRt6y',
  name: 'Pupusería Olancho',
  tagline: 'Pupusas hechas a mano todos los días',
  currency: 'HNL',
  subscription: {
    planId: 'plan_medium',
    status: 'past_due',
    currentPeriodEnd: 1_777_000_000_000,
  },
};

export const RESTAURANT_E: Restaurant = {
  id: 'rest_e_005',
  publicId: 'Lp2mKd9wFx5nQt8b',
  name: 'Mariscos del Sur',
  tagline: 'Lo mejor del Pacífico hondureño',
  currency: 'HNL',
  subscription: {
    planId: 'plan_pro',
    status: 'canceled',
    currentPeriodEnd: 1_775_000_000_000,
  },
};

export const MOCK_RESTAURANTS: Restaurant[] = [
  RESTAURANT_A,
  RESTAURANT_B,
  RESTAURANT_C,
  RESTAURANT_D,
  RESTAURANT_E,
];

const RESTAURANT_MAP: Record<string, Restaurant> = {
  [RESTAURANT_A.id]: RESTAURANT_A,
  [RESTAURANT_B.id]: RESTAURANT_B,
  [RESTAURANT_C.id]: RESTAURANT_C,
  [RESTAURANT_D.id]: RESTAURANT_D,
  [RESTAURANT_E.id]: RESTAURANT_E,
};

// ─── Zones ────────────────────────────────────────────────────────────────────

// La Ceiba has two zones; the rest have none yet (their tables show "Sin zona").
export const MOCK_ZONES_A: Zone[] = [
  { id: 'zone_a_patio', restaurantId: 'rest_a_001', name: 'Patio', sortOrder: 1 },
  { id: 'zone_a_terraza', restaurantId: 'rest_a_001', name: 'Terraza', sortOrder: 2 },
];

export const MOCK_ZONES_B: Zone[] = [];

/** Zones keyed by restaurantId — the source of truth for the tables service. */
export const MOCK_ZONES_BY_RESTAURANT: Record<string, Zone[]> = {
  [RESTAURANT_A.id]: MOCK_ZONES_A,
  [RESTAURANT_B.id]: MOCK_ZONES_B,
  [RESTAURANT_C.id]: [],
  [RESTAURANT_D.id]: [],
  [RESTAURANT_E.id]: [],
};

// ─── Tables ───────────────────────────────────────────────────────────────────

// qrToken is PUBLIC (it goes in the customer URL), so it MUST be unguessable —
// a real short random token, never a predictable pattern like `qr-<slug>-t<n>`.
// The internal `id` may stay readable since it is private. See
// `.claude/rules/data-conventions.md` and `src/lib/id.ts` (newQrToken()).
export const MOCK_TABLES_A: Table[] = [
  { id: 'tbl_a1', number: 1, zoneId: 'zone_a_patio', qrToken: 'qr_7Kp2Qx9aZ3mN' },
  { id: 'tbl_a2', number: 2, zoneId: 'zone_a_patio', qrToken: 'qr_W4bV8sLp1qXr' },
  { id: 'tbl_a3', number: 3, zoneId: 'zone_a_terraza', qrToken: 'qr_9Rt5Hn3Kf6Dy' },
];

export const MOCK_TABLES_B: Table[] = [
  { id: 'tbl_b1', number: 1, qrToken: 'qr_2Mw8Jc4Vb7Lx' },
  { id: 'tbl_b2', number: 2, qrToken: 'qr_6Pq3Yd9Sn1Zk' },
];

export const MOCK_TABLES_C: Table[] = [
  { id: 'tbl_c1', number: 1, qrToken: 'qr_3Fn7Wd2Kp8Qx' },
  { id: 'tbl_c2', number: 2, qrToken: 'qr_8Bm4Lc6Vt1Rz' },
  { id: 'tbl_c3', number: 3, qrToken: 'qr_5Yk9Pn3Wd7Mx' },
];

export const MOCK_TABLES_D: Table[] = [
  { id: 'tbl_d1', number: 1, qrToken: 'qr_Tn2Wk8Fp4Lx6' },
  { id: 'tbl_d2', number: 2, qrToken: 'qr_Rc7Bv3Mq9Zd1' },
  { id: 'tbl_d3', number: 3, qrToken: 'qr_Yp5Kn8Wt2Fx4' },
  { id: 'tbl_d4', number: 4, qrToken: 'qr_Hm9Bd3Lc6Qn7' },
  { id: 'tbl_d5', number: 5, qrToken: 'qr_Vx1Pk7Wn4Rt2' },
];

export const MOCK_TABLES_E: Table[] = [
  { id: 'tbl_e1', number: 1, qrToken: 'qr_Wd8Kp2Fn5Lx9' },
  { id: 'tbl_e2', number: 2, qrToken: 'qr_Bm3Vc7Qt1Rz4' },
];

/** Tables keyed by restaurantId — the source of truth for the tables service. */
export const MOCK_TABLES_BY_RESTAURANT: Record<string, Table[]> = {
  [RESTAURANT_A.id]: MOCK_TABLES_A,
  [RESTAURANT_B.id]: MOCK_TABLES_B,
  [RESTAURANT_C.id]: MOCK_TABLES_C,
  [RESTAURANT_D.id]: MOCK_TABLES_D,
  [RESTAURANT_E.id]: MOCK_TABLES_E,
};

// ─── Memberships ──────────────────────────────────────────────────────────────

/**
 * Multi-tenancy is exercised from day one:
 *   - Ana: owner of La Ceiba, staff at El Mercado.
 *   - José: owner of TWO restaurants (El Mercado + Pupusería Olancho) — the
 *     "one user manages several restaurants" business case.
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
  // José: owner of Pupusería Olancho (same user, second restaurant)
  {
    id: 'mem_jose_d',
    userId: 'usr_jose_004',
    restaurantId: 'rest_d_004',
    role: 'owner',
    createdAt: 1_715_000_000_000,
  },
  // Sofía: owner of Café Lenca
  {
    id: 'mem_sofia_c',
    userId: 'usr_sofia_005',
    restaurantId: 'rest_c_003',
    role: 'owner',
    createdAt: 1_712_000_000_000,
  },
  // Pedro: owner of Mariscos del Sur
  {
    id: 'mem_pedro_e',
    userId: 'usr_pedro_006',
    restaurantId: 'rest_e_005',
    role: 'owner',
    createdAt: 1_706_000_000_000,
  },
];

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

/**
 * Memberships for a given user across all restaurants (for the platform users
 * page — shows every restaurant a user belongs to and their role in each).
 */
export function getMembershipsForUser(userId: string): RestaurantMembership[] {
  return MOCK_ALL_RESTAURANT_MEMBERSHIPS.filter((m) => m.userId === userId);
}
