import { MOCK_TABLES_A, MOCK_TABLES_B, RESTAURANT_A } from '@/lib/mock-data';
import { shortId, newQrToken } from '@/lib/id';
import type { Table } from '@/types/restaurant';

/**
 * Tables service — the future Firestore boundary.
 *
 * All functions are async to match the eventual Firestore shape.
 * Today they operate on mock data; each function has a seam comment
 * marking where the real implementation will land.
 *
 * TODO seams:
 *   - getTables      → Firestore collection query: tables filtered by restaurantId
 *   - createTable    → Firestore addDoc: tables/{id} with { restaurantId, number, qrToken }
 *   - deleteTable    → Firestore deleteDoc: tables/{id}
 */

/** In-memory store keyed by restaurantId for local mock mutations. */
const mockStore: Map<string, Table[]> = new Map([
  [RESTAURANT_A.id, [...MOCK_TABLES_A]],
]);

function getStore(restaurantId: string): Table[] {
  if (!mockStore.has(restaurantId)) {
    // Restaurant B and any future restaurant start from their own mock set.
    const initial = restaurantId === RESTAURANT_A.id ? [...MOCK_TABLES_A] : [...MOCK_TABLES_B];
    mockStore.set(restaurantId, initial);
  }
  return mockStore.get(restaurantId)!;
}

/**
 * Returns all tables for a given restaurant.
 * Today: reads from the in-memory mock store seeded from MOCK_TABLES_A / MOCK_TABLES_B.
 * TODO: Firestore — query the `tables` collection where restaurantId == restaurantId.
 */
export async function getTables(restaurantId: string): Promise<Table[]> {
  // TODO: Firestore — return a real-time listener result instead
  return [...getStore(restaurantId)];
}

/**
 * Synchronous snapshot of the current tables for a restaurant.
 *
 * Used by the hook to seed initial state without a loading flash, since the
 * mock store is in-memory and fully synchronous. A Promise `.then()` callback
 * can NEVER run synchronously (it always defers to the microtask queue), so we
 * cannot derive synchronous state from the async `getTables` — hence this
 * dedicated sync reader that touches the same store.
 *
 * TODO: Firestore — remove this. Replace the hook's seed with an empty array
 * and hydrate via an onSnapshot subscription inside a useEffect.
 */
export function getTablesSnapshot(restaurantId: string): Table[] {
  return [...getStore(restaurantId)];
}

/**
 * Creates a new table with the given display number.
 *
 * Identifiers follow the project data convention (.claude/rules/data-conventions.md):
 *   - `id`      = shortId('tbl')  — non-sequential, URL-safe internal PK
 *   - `qrToken` = newQrToken()    — rotatable public token used in the customer URL
 *   - `number`  = human-entered display label only; NOT an identifier
 *
 * shortId / newQrToken are invoked here (call time inside the create handler),
 * never at module scope, to stay SSR/hydration-safe.
 *
 * TODO: Firestore — await addDoc(collection(db, 'tables'), { restaurantId, number, qrToken, createdAt })
 */
export async function createTable(
  restaurantId: string,
  tableNumber: number
): Promise<Table> {
  // TODO: Firestore — persist new table document and return the created entity
  const store = getStore(restaurantId);
  const newTable: Table = {
    id: shortId('tbl'),
    number: tableNumber,
    qrToken: newQrToken(),
  };
  store.push(newTable);
  return newTable;
}

/**
 * Deletes a table by id.
 * Today: removes from the in-memory mock store.
 * TODO: Firestore — await deleteDoc(doc(db, 'tables', tableId))
 */
export async function deleteTable(
  restaurantId: string,
  tableId: string
): Promise<void> {
  // TODO: Firestore — delete the table document
  const store = getStore(restaurantId);
  const idx = store.findIndex((t) => t.id === tableId);
  if (idx !== -1) {
    store.splice(idx, 1);
  }
}
