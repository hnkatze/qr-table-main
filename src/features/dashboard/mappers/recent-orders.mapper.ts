import type { Order, OrderStatus } from '@/types/order';
import type { RecentOrderRow } from '@/features/dashboard/types';
import { RECENT_ORDERS_LIMIT } from '@/features/dashboard/constants';

/**
 * Display tokens for status labels — scoped to this feature.
 * (Mirror of the orders feature's STATUS_META without the flow logic.)
 */
const STATUS_DISPLAY: Record<
  OrderStatus,
  { label: string; colorText: string; colorBg: string; colorBorder: string }
> = {
  pending: {
    label: 'Pendiente',
    colorText: 'text-amber-700 dark:text-amber-400',
    colorBg: 'bg-amber-50 dark:bg-amber-950/30',
    colorBorder: 'border-amber-400/40',
  },
  preparing: {
    label: 'Preparando',
    colorText: 'text-blue-700 dark:text-blue-400',
    colorBg: 'bg-blue-50 dark:bg-blue-950/30',
    colorBorder: 'border-blue-400/40',
  },
  ready: {
    label: 'Lista',
    colorText: 'text-emerald-700 dark:text-emerald-400',
    colorBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    colorBorder: 'border-emerald-400/40',
  },
  delivered: {
    label: 'Entregada',
    colorText: 'text-muted-foreground',
    colorBg: 'bg-muted/60',
    colorBorder: 'border-border',
  },
};

/**
 * Returns the RECENT_ORDERS_LIMIT most-recent orders, mapped to display rows.
 *
 * Sort: newest first (descending createdAt).
 * The `createdAt` field is forwarded as-is (fixed epoch from the mock) so SSR
 * and client render the same timestamp — relative-time rendering is client-only
 * via useRelativeTime in the component layer (same pattern as order-card.tsx).
 *
 * Pure function — no side effects.
 */
export function buildRecentOrders(orders: Order[]): RecentOrderRow[] {
  return [...orders]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, RECENT_ORDERS_LIMIT)
    .map((order) => {
      const display = STATUS_DISPLAY[order.status];
      const itemCount = order.items.reduce((acc, item) => acc + item.quantity, 0);

      return {
        id: order.id,
        tableNumber: order.tableNumber,
        itemCount,
        total: order.total,
        status: order.status,
        statusLabel: display.label,
        statusColorText: display.colorText,
        statusColorBg: display.colorBg,
        statusColorBorder: display.colorBorder,
        createdAt: order.createdAt,
      } satisfies RecentOrderRow;
    });
}
