import type { Order } from '@/types/order';

/**
 * Mock orders — scoped to this feature only.
 * Contains believable data across all four statuses for both restaurants.
 *
 * Timestamps are FIXED absolute constants (anchored at ANCHOR below), NOT
 * computed from Date.now(). This is deliberate: a mock that changes per render
 * causes SSR/client hydration mismatches (server and client evaluate Date.now()
 * milliseconds apart). With a stable anchor, the ISO `dateTime` is identical on
 * both sides; the live "hace X min" text is computed client-only via
 * use-relative-time.ts, which reads the real current time only after mount.
 *
 * TODO: Remove when Firestore realtime listener lands in orders.service.ts.
 */

/**
 * Fixed reference epoch: 2026-05-31T18:00:00.000Z.
 * All createdAt/updatedAt values are offsets back from this anchor, giving a
 * believable spread (3 min → 2 h ago) without ever calling Date.now().
 */
const ANCHOR = Date.UTC(2026, 4, 31, 18, 0, 0); // month is 0-indexed → 4 = May
const min = (n: number) => n * 60_000;
const hr = (n: number) => n * 3_600_000;

export const MOCK_ORDERS: Order[] = [
  // ── La Ceiba (rest_a_001) ────────────────────────────────────────────────────

  // pending
  {
    id: 'ord_a_001',
    restaurantId: 'rest_a_001',
    tableId: 'tbl_a1',
    tableNumber: 1,
    items: [
      { productId: 'prod_baleada', name: 'Baleada especial', price: 85, quantity: 2 },
      { productId: 'prod_jugo', name: 'Jugo natural', price: 40, quantity: 2, notes: 'Sin azúcar' },
    ],
    total: 250,
    status: 'pending',
    customerName: 'Mesa 1',
    createdAt: ANCHOR - min(3),
    updatedAt: ANCHOR - min(3),
  },
  {
    id: 'ord_a_002',
    restaurantId: 'rest_a_001',
    tableId: 'tbl_a3',
    tableNumber: 3,
    items: [
      { productId: 'prod_carne', name: 'Carne asada', price: 180, quantity: 1 },
      { productId: 'prod_tajadas', name: 'Tajadas con crema', price: 60, quantity: 1 },
    ],
    total: 240,
    status: 'pending',
    customerName: 'Pedro Alvarez',
    createdAt: ANCHOR - min(7),
    updatedAt: ANCHOR - min(7),
  },

  // preparing
  {
    id: 'ord_a_003',
    restaurantId: 'rest_a_001',
    tableId: 'tbl_a2',
    tableNumber: 2,
    items: [
      { productId: 'prod_sopa', name: 'Sopa de caracol', price: 120, quantity: 3 },
      { productId: 'prod_tortillas', name: 'Tortillas (4 uds)', price: 30, quantity: 3 },
      { productId: 'prod_agua', name: 'Agua mineral', price: 25, quantity: 3 },
    ],
    total: 525,
    status: 'preparing',
    createdAt: ANCHOR - min(18),
    updatedAt: ANCHOR - min(12),
  },
  {
    id: 'ord_a_004',
    restaurantId: 'rest_a_001',
    tableId: 'tbl_a1',
    tableNumber: 1,
    items: [
      { productId: 'prod_pollo', name: 'Pollo en salsa', price: 145, quantity: 2, notes: 'Poco picante' },
      { productId: 'prod_arroz', name: 'Arroz con leche', price: 55, quantity: 2 },
    ],
    total: 400,
    status: 'preparing',
    customerName: 'Mesa 1',
    createdAt: ANCHOR - min(22),
    updatedAt: ANCHOR - min(15),
  },

  // ready
  {
    id: 'ord_a_005',
    restaurantId: 'rest_a_001',
    tableId: 'tbl_a3',
    tableNumber: 3,
    items: [
      { productId: 'prod_nacatamales', name: 'Nacatamales (2 uds)', price: 90, quantity: 1 },
      { productId: 'prod_cafe', name: 'Café hondureño', price: 35, quantity: 2 },
    ],
    total: 160,
    status: 'ready',
    createdAt: ANCHOR - min(35),
    updatedAt: ANCHOR - min(5),
  },

  // delivered
  {
    id: 'ord_a_006',
    restaurantId: 'rest_a_001',
    tableId: 'tbl_a2',
    tableNumber: 2,
    items: [
      { productId: 'prod_enchiladas', name: 'Enchiladas hondureñas', price: 75, quantity: 4 },
      { productId: 'prod_refresco', name: 'Refresco', price: 30, quantity: 4 },
    ],
    total: 420,
    status: 'delivered',
    createdAt: ANCHOR - hr(1) - min(10),
    updatedAt: ANCHOR - min(45),
  },
  {
    id: 'ord_a_007',
    restaurantId: 'rest_a_001',
    tableId: 'tbl_a1',
    tableNumber: 1,
    items: [
      { productId: 'prod_desayuno', name: 'Desayuno típico', price: 95, quantity: 2 },
    ],
    total: 190,
    status: 'delivered',
    customerName: 'Ana Torres',
    createdAt: ANCHOR - hr(2),
    updatedAt: ANCHOR - hr(1) - min(30),
  },

  // ── El Mercado (rest_b_002) ──────────────────────────────────────────────────

  {
    id: 'ord_b_001',
    restaurantId: 'rest_b_002',
    tableId: 'tbl_b1',
    tableNumber: 1,
    items: [
      { productId: 'prod_ceviche', name: 'Ceviche de camarón', price: 130, quantity: 2 },
      { productId: 'prod_limonada', name: 'Limonada', price: 45, quantity: 2 },
    ],
    total: 350,
    status: 'pending',
    createdAt: ANCHOR - min(4),
    updatedAt: ANCHOR - min(4),
  },
  {
    id: 'ord_b_002',
    restaurantId: 'rest_b_002',
    tableId: 'tbl_b2',
    tableNumber: 2,
    items: [
      { productId: 'prod_tamales', name: 'Tamales de elote', price: 60, quantity: 3 },
    ],
    total: 180,
    status: 'preparing',
    customerName: 'Jorge Hernández',
    createdAt: ANCHOR - min(14),
    updatedAt: ANCHOR - min(8),
  },
  {
    id: 'ord_b_003',
    restaurantId: 'rest_b_002',
    tableId: 'tbl_b1',
    tableNumber: 1,
    items: [
      { productId: 'prod_pinchos', name: 'Pinchos de res', price: 110, quantity: 2 },
      { productId: 'prod_guifiti', name: 'Guifiti', price: 80, quantity: 1, notes: 'Bien frío' },
    ],
    total: 300,
    status: 'ready',
    createdAt: ANCHOR - min(40),
    updatedAt: ANCHOR - min(8),
  },
];
