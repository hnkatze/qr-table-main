import type { Order, OrderStatus } from '@/types/order';

/**
 * Feature-local view types for the Orders Kanban board.
 * Domain types (Order, OrderStatus, OrderItem) live in src/types/order.ts.
 */

/**
 * Grouped orders — one entry per status, already sorted by column order.
 * Produced by group-by-status.mapper.ts.
 */
export interface OrdersByStatus {
  status: OrderStatus;
  orders: Order[];
}

/**
 * Input accepted by useOrders.
 */
export interface UseOrdersInput {
  restaurantId: string | null;
}

/**
 * Public API returned by useOrders.
 */
export interface UseOrdersOutput {
  /** All orders for the active restaurant, kept in local state. */
  orders: Order[];
  /** Orders grouped and sorted by Kanban status column. */
  columns: OrdersByStatus[];
  /** Advance an order to the next status (no-op on 'delivered'). */
  handleAdvance: (orderId: string) => void;
  /** Revert an order to the previous status (no-op on 'pending'). */
  handleRevert: (orderId: string) => void;
}
