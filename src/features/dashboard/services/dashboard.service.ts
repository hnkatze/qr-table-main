import { getOrders } from '@/features/orders/services/orders.service';
import { getTablesSnapshot } from '@/features/tables/services/tables.service';
import { MOCK_PRODUCTS_BY_RESTAURANT } from '@/features/menu/services/menu-mock-data';
import type { Order } from '@/types/order';
import type { Table } from '@/types/restaurant';
import type { Product } from '@/types/menu';

/**
 * Raw data bundle fetched for the dashboard.
 *
 * Services are the Firestore boundary — when the real backend lands:
 *   - orders   → onSnapshot listener in getOrders
 *   - tables   → getTablesSnapshot replaced with onSnapshot in useEffect
 *   - products → getProducts() from menu.service
 *
 * The dashboard mapper layer consumes this bundle and produces DashboardData.
 */
export interface DashboardRawData {
  orders: Order[];
  tables: Table[];
  products: Product[];
}

/**
 * Fetches all raw data needed to compute dashboard KPIs for a given restaurant.
 *
 * Today: reads from in-memory mock stores.
 * TODO: Firestore — replace each source with a real-time listener.
 */
export async function getDashboardData(
  restaurantId: string
): Promise<DashboardRawData> {
  // TODO: Firestore — replace with Promise.all([getOrders, getTables, getProducts]) once all are async listeners
  const orders = await getOrders(restaurantId);

  // Tables: use the synchronous snapshot (same seam as useTables) since the
  // mock store is in-memory. When Firestore lands, wire an onSnapshot here.
  const tables = getTablesSnapshot(restaurantId);

  // Products: menu service is async-shaped but reads from a static mock map.
  // TODO: Firestore — await getProducts(restaurantId) from menu.service
  const products: Product[] = MOCK_PRODUCTS_BY_RESTAURANT[restaurantId] ?? [];

  return { orders, tables, products };
}
