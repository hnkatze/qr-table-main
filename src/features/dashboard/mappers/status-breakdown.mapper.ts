import type { Order, OrderStatus } from '@/types/order';
import type { StatusCount } from '@/features/dashboard/types';

/**
 * Visual token config for each status — mirrors STATUS_META in the orders
 * feature but is scoped to the dashboard so we don't create a cross-feature
 * import of the orders feature's view constants.
 *
 * Token rules: brand tokens only, NEVER inline oklch() or arbitrary hex.
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

/** Canonical flow order — same as ORDERED_STATUSES in the orders feature. */
const STATUS_ORDER: readonly OrderStatus[] = [
  'pending',
  'preparing',
  'ready',
  'delivered',
];

/**
 * Produces a status-count summary, one entry per status in flow order.
 * Every status is always present (count may be zero — let the UI decide to hide).
 *
 * Pure function — no side effects.
 */
export function buildStatusBreakdown(orders: Order[]): StatusCount[] {
  const counts = new Map<OrderStatus, number>(
    STATUS_ORDER.map((s) => [s, 0])
  );

  for (const order of orders) {
    const current = counts.get(order.status) ?? 0;
    counts.set(order.status, current + 1);
  }

  return STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_DISPLAY[status].label,
    count: counts.get(status) ?? 0,
    colorText: STATUS_DISPLAY[status].colorText,
    colorBg: STATUS_DISPLAY[status].colorBg,
    colorBorder: STATUS_DISPLAY[status].colorBorder,
  }));
}
