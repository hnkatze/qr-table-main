import type { OrderStatus } from '@/types/order';

/**
 * Feature-local view types for the Dashboard home.
 * Domain types (Order, Table, Product) live in src/types/.
 */

// ─── KPI metrics ──────────────────────────────────────────────────────────────

/**
 * Core KPIs shown in the four MetricTile slots.
 * Revenue is the sum of delivered-order totals.
 * Tables / products counts come from their respective services.
 */
export interface DashboardKpis {
  /** Count of all orders for this restaurant in the mock set. */
  totalOrders: number;
  /** Sum of totals for delivered orders only. */
  revenueDelivered: number;
  /** Total table count for the restaurant. */
  tableCount: number;
  /** Count of tables that have at least one non-delivered order. */
  tablesWithOpenOrders: number;
  /** Count of products where available === true. */
  availableProducts: number;
  /** Total product count (available + unavailable). */
  totalProducts: number;
}

// ─── Status breakdown ─────────────────────────────────────────────────────────

/** One row in the Kanban status summary. */
export interface StatusCount {
  status: OrderStatus;
  label: string;
  count: number;
  colorText: string;
  colorBg: string;
  colorBorder: string;
}

// ─── Recent orders list ───────────────────────────────────────────────────────

/** Flat, display-ready row for the recent-orders section. */
export interface RecentOrderRow {
  id: string;
  tableNumber: number;
  itemCount: number;
  total: number;
  status: OrderStatus;
  statusLabel: string;
  statusColorText: string;
  statusColorBg: string;
  statusColorBorder: string;
  /** Fixed epoch timestamp — safe for SSR; relative rendering is client-only. */
  createdAt: number;
}

// ─── Top products ─────────────────────────────────────────────────────────────

/** Product appearance count derived from order items. */
export interface TopProductRow {
  /** Product id (may be a partial key from order items — used as React key). */
  id: string;
  name: string;
  emoji: string;
  /** Total quantity ordered across all orders. */
  count: number;
}

// ─── Full dashboard payload ───────────────────────────────────────────────────

export interface DashboardData {
  kpis: DashboardKpis;
  statusBreakdown: StatusCount[];
  recentOrders: RecentOrderRow[];
  topProducts: TopProductRow[];
}

// ─── Async state (discriminated union) ────────────────────────────────────────

export type DashboardState =
  | { status: 'loading' }
  | { status: 'success'; data: DashboardData }
  | { status: 'error'; message: string };
