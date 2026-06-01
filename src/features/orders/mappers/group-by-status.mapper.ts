import type { Order } from '@/types/order';
import { ORDERED_STATUSES } from '@/features/orders/constants';
import type { OrdersByStatus } from '@/features/orders/types';

/**
 * Groups an array of orders into Kanban columns, one per status.
 *
 * Guarantees:
 *   - Every status always has a column (even if the count is zero).
 *   - Columns appear in the canonical flow order (pending → delivering).
 *   - Within each column, orders are sorted oldest-first (ascending createdAt)
 *     so urgency is immediately visible — the top card needs attention first.
 *
 * Pure function — no side effects, no state.
 */
export function groupOrdersByStatus(orders: Order[]): OrdersByStatus[] {
  const map = new Map<string, Order[]>(
    ORDERED_STATUSES.map((s) => [s, []])
  );

  for (const order of orders) {
    map.get(order.status)?.push(order);
  }

  return ORDERED_STATUSES.map((status) => ({
    status,
    orders: (map.get(status) ?? []).sort((a, b) => a.createdAt - b.createdAt),
  }));
}
