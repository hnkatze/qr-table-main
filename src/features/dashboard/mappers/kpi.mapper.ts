import type { DashboardRawData } from '@/features/dashboard/services/dashboard.service';
import type { DashboardKpis } from '@/features/dashboard/types';

/**
 * Derives the four KPI values from raw dashboard data.
 *
 * Pure function — no side effects, no state.
 * When Firestore lands, only the data sources change; this mapper is untouched.
 */
export function buildKpis(raw: DashboardRawData): DashboardKpis {
  const { orders, tables, products } = raw;

  // Revenue: sum totals of delivered orders only.
  // "Revenue today" semantics — for now all orders in the mock are treated as
  // today's; when real timestamps and date filtering land, add a date filter here.
  // TODO: filter orders by today's date (createdAt >= startOfDay) once real data lands.
  const revenueDelivered = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);

  // Open orders: any status other than 'delivered'.
  const openOrderTableIds = new Set(
    orders
      .filter((o) => o.status !== 'delivered')
      .map((o) => o.tableId)
  );
  const tablesWithOpenOrders = tables.filter((t) =>
    openOrderTableIds.has(t.id)
  ).length;

  const availableProducts = products.filter((p) => p.available).length;

  return {
    totalOrders: orders.length,
    revenueDelivered,
    tableCount: tables.length,
    tablesWithOpenOrders,
    availableProducts,
    totalProducts: products.length,
  };
}
