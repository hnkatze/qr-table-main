import { MOCK_ORDERS } from '@/features/orders/mock';
import type { Order, OrderStatus } from '@/types/order';

/**
 * Orders service — the future Firestore realtime boundary.
 *
 * All functions are async to match the eventual Firestore shape.
 * Today they operate on the in-feature mock array; seam comments
 * mark where real implementations will land.
 *
 * TODO seams:
 *   - getOrders      → onSnapshot(query(collection(db, 'orders'), where('restaurantId', '==', id)))
 *   - advanceStatus  → updateDoc(doc(db, 'orders', orderId), { status: next, updatedAt: serverTimestamp() })
 *   - revertStatus   → same as advanceStatus but with prev status
 */

/**
 * Returns the current orders for a given restaurant.
 *
 * Today: reads from the feature-local MOCK_ORDERS array.
 * TODO: Subscribe to Firestore `orders` collection filtered by restaurantId
 *       and return the latest snapshot on each update (onSnapshot listener).
 */
export async function getOrders(restaurantId: string): Promise<Order[]> {
  // TODO: Firestore — replace with real-time onSnapshot listener
  return MOCK_ORDERS.filter((o) => o.restaurantId === restaurantId);
}

/**
 * Advances an order to the next status in the flow.
 *
 * Today: no-op (the hook applies the change locally with an optimistic update).
 * TODO: Firestore — await updateDoc(doc(db, 'orders', orderId), {
 *   status: nextStatus,
 *   updatedAt: serverTimestamp(),
 * })
 */
export async function advanceOrderStatus(
  orderId: string,
  nextStatus: OrderStatus
): Promise<void> {
  // TODO: Firestore — persist status change
  void orderId;
  void nextStatus;
}

/**
 * Reverts an order to the previous status in the flow.
 *
 * Today: no-op (the hook applies the change locally with an optimistic update).
 * TODO: Firestore — same as advanceOrderStatus with prev status.
 */
export async function revertOrderStatus(
  orderId: string,
  prevStatus: OrderStatus
): Promise<void> {
  // TODO: Firestore — persist status revert
  void orderId;
  void prevStatus;
}
