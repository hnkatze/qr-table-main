import { useState } from 'react';
import { MOCK_ORDERS } from '@/features/orders/mock';
import { groupOrdersByStatus } from '@/features/orders/mappers/group-by-status.mapper';
import { advanceOrderStatus, revertOrderStatus } from '@/features/orders/services/orders.service';
import { STATUS_META } from '@/features/orders/constants';
import type { Order } from '@/types/order';
import type { UseOrdersInput, UseOrdersOutput, OrdersByStatus } from '@/features/orders/types';

/**
 * Encapsulates all orders-feature state:
 *
 *   - localOrders: the live order list for the active restaurant (mock today,
 *     Firestore onSnapshot when real backend lands).
 *   - restaurant-change sync: render-phase pattern — same approach as
 *     useMembers — resets when restaurantId changes without a useEffect.
 *   - handleAdvance / handleRevert: optimistic local state update + service
 *     call (no-op today). TODO: rollback on error once Firestore is wired.
 *
 * Status transition logic lives HERE (in the hook layer), not in components.
 * The STATUS_META constant drives the flow; no hard-coded strings in handlers.
 *
 * When Firestore lands: replace the useState + render-phase sync with a
 * useEffect that calls getOrders() and subscribes to the onSnapshot listener.
 */
export function useOrders({ restaurantId }: UseOrdersInput): UseOrdersOutput {
  function seedOrders(id: string | null): Order[] {
    if (!id) return [];
    return MOCK_ORDERS.filter((o) => o.restaurantId === id);
  }

  const [localOrders, setLocalOrders] = useState<Order[]>(
    () => seedOrders(restaurantId)
  );

  const [lastRestaurantId, setLastRestaurantId] = useState<string | null>(
    () => restaurantId
  );

  // Render-phase sync — intentional React pattern for derived state that
  // resets on prop change. Same pattern used by useMembers.
  if (restaurantId !== lastRestaurantId) {
    setLastRestaurantId(restaurantId);
    setLocalOrders(seedOrders(restaurantId));
  }

  /**
   * Advance an order to the next status.
   * Reads the transition from STATUS_META — no hard-coded strings here.
   */
  function handleAdvance(orderId: string): void {
    setLocalOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const meta = STATUS_META[order.status];
        if (!meta.next) return order; // terminal status — no-op
        const updated: Order = {
          ...order,
          status: meta.next,
          updatedAt: Date.now(),
        };
        // Service call (no-op today; TODO: await + rollback on error when Firestore lands)
        void advanceOrderStatus(orderId, meta.next);
        return updated;
      })
    );
  }

  /**
   * Revert an order to the previous status.
   * Reads the transition from STATUS_META — no hard-coded strings here.
   */
  function handleRevert(orderId: string): void {
    setLocalOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const meta = STATUS_META[order.status];
        if (!meta.prev) return order; // initial status — no-op
        const updated: Order = {
          ...order,
          status: meta.prev,
          updatedAt: Date.now(),
        };
        // Service call (no-op today; TODO: await + rollback on error when Firestore lands)
        void revertOrderStatus(orderId, meta.prev);
        return updated;
      })
    );
  }

  const columns: OrdersByStatus[] = groupOrdersByStatus(localOrders);

  return {
    orders: localOrders,
    columns,
    handleAdvance,
    handleRevert,
  };
}
