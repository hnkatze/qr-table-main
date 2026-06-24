import type { Order } from '@/types/order';
import type { Product } from '@/types/menu';
import type { TopProductRow } from '@/features/dashboard/types';

/** How many top products to return. */
const TOP_LIMIT = 5;

/**
 * Derives the top products by total quantity ordered.
 *
 * Strategy:
 *   1. Aggregate quantity per productId across ALL orders (all statuses).
 *   2. Enrich with the emoji from the product catalog (falls back to '🍽️').
 *   3. Sort descending by count, return top TOP_LIMIT rows.
 *
 * If the products catalog is empty (restaurant has no menu data yet), returns
 * the aggregated rows using just the name from order items and a generic emoji.
 *
 * Pure function — no side effects.
 */
export function buildTopProducts(
  orders: Order[],
  products: Product[]
): TopProductRow[] {
  // Build a lookup map: productId → product metadata
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Aggregate quantity + pick last-seen name per productId
  const aggregated = new Map<string, { name: string; quantity: number }>();

  for (const order of orders) {
    for (const item of order.items) {
      const existing = aggregated.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        aggregated.set(item.productId, {
          name: item.name,
          quantity: item.quantity,
        });
      }
    }
  }

  return Array.from(aggregated.entries())
    .map(([productId, { name, quantity }]) => {
      const product = productMap.get(productId);
      return {
        id: productId,
        name: product?.name ?? name,
        // emoji is optional on Product — fall back to a generic dish icon
        emoji: product?.emoji ?? '🍽️',
        count: quantity,
      } satisfies TopProductRow;
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_LIMIT);
}
