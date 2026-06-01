import {
  MOCK_TABLES_BY_RESTAURANT,
  MOCK_ZONES_BY_RESTAURANT,
} from '@/lib/mock-data';
import { shortId, newQrToken } from '@/lib/id';
import type { Table, Zone } from '@/types/restaurant';

/**
 * Tables service — the future Firestore boundary.
 *
 * All functions are async to match the eventual Firestore shape.
 * Today they operate on mock data; each function has a seam comment
 * marking where the real implementation will land.
 *
 * TODO seams:
 *   - getTables    → Firestore collection query: tables filtered by restaurantId
 *   - createTable  → Firestore addDoc: tables/{id} with { restaurantId, number, zoneId, qrToken }
 *   - deleteTable  → Firestore deleteDoc: tables/{id}
 *   - getZones     → Firestore collection query: zones filtered by restaurantId
 *   - createZone   → Firestore addDoc: zones/{id} with { restaurantId, name, sortOrder }
 *   - deleteZone   → Firestore deleteDoc: zones/{id} + reassign affected tables' zoneId
 */

// ─── In-memory stores (mock) ──────────────────────────────────────────────────

/** Tables store keyed by restaurantId for local mock mutations. */
const tablesStore: Map<string, Table[]> = new Map();

/** Zones store keyed by restaurantId for local mock mutations. */
const zonesStore: Map<string, Zone[]> = new Map();

function getTablesStore(restaurantId: string): Table[] {
  if (!tablesStore.has(restaurantId)) {
    // Seed each restaurant from its OWN mock set (empty if it has none).
    tablesStore.set(restaurantId, [...(MOCK_TABLES_BY_RESTAURANT[restaurantId] ?? [])]);
  }
  return tablesStore.get(restaurantId)!;
}

function getZonesStore(restaurantId: string): Zone[] {
  if (!zonesStore.has(restaurantId)) {
    zonesStore.set(restaurantId, [...(MOCK_ZONES_BY_RESTAURANT[restaurantId] ?? [])]);
  }
  return zonesStore.get(restaurantId)!;
}

// ─── Tables ───────────────────────────────────────────────────────────────────

/**
 * Returns all tables for a given restaurant.
 * Today: reads from the in-memory mock store seeded from MOCK_TABLES_A / MOCK_TABLES_B.
 * TODO: Firestore — query the `tables` collection where restaurantId == restaurantId.
 */
export async function getTables(restaurantId: string): Promise<Table[]> {
  // TODO: Firestore — return a real-time listener result instead
  return [...getTablesStore(restaurantId)];
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
  return [...getTablesStore(restaurantId)];
}

/**
 * Creates a new table with the given display number and optional zone.
 *
 * Identifiers follow the project data convention (.claude/rules/data-conventions.md):
 *   - `id`      = shortId('tbl')  — non-sequential, URL-safe internal PK
 *   - `qrToken` = newQrToken()    — rotatable public token used in the customer URL
 *   - `number`  = human-entered display label only; NOT an identifier
 *   - `zoneId`  = optional; omitted ⇒ the table renders under "Sin zona"
 *
 * shortId / newQrToken are invoked here (call time inside the create handler),
 * never at module scope, to stay SSR/hydration-safe.
 *
 * TODO: Firestore — await addDoc(collection(db, 'tables'), { restaurantId, number, zoneId, qrToken, createdAt })
 */
export async function createTable(
  restaurantId: string,
  tableNumber: number,
  zoneId?: string
): Promise<Table> {
  // TODO: Firestore — persist new table document and return the created entity
  const store = getTablesStore(restaurantId);
  const newTable: Table = {
    id: shortId('tbl'),
    number: tableNumber,
    qrToken: newQrToken(),
    // Only set zoneId when one was chosen — keep the field absent otherwise.
    ...(zoneId ? { zoneId } : {}),
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
  const store = getTablesStore(restaurantId);
  const idx = store.findIndex((t) => t.id === tableId);
  if (idx !== -1) {
    store.splice(idx, 1);
  }
}

// ─── Zones ────────────────────────────────────────────────────────────────────

/**
 * Returns all zones for a given restaurant.
 * Today: reads from the in-memory mock store seeded from MOCK_ZONES_A / MOCK_ZONES_B.
 * TODO: Firestore — query the `zones` collection where restaurantId == restaurantId.
 */
export async function getZones(restaurantId: string): Promise<Zone[]> {
  // TODO: Firestore — return a real-time listener result instead
  return [...getZonesStore(restaurantId)];
}

/**
 * Synchronous snapshot of the current zones for a restaurant.
 * Same rationale as getTablesSnapshot — used for the hook's first-paint seed.
 *
 * TODO: Firestore — remove this; hydrate via onSnapshot in a useEffect.
 */
export function getZonesSnapshot(restaurantId: string): Zone[] {
  return [...getZonesStore(restaurantId)];
}

/**
 * Creates a new zone with the given name.
 *
 * The new zone id is generated with shortId('zone') per the data convention.
 * sortOrder is appended after the current max so new zones land at the end.
 *
 * TODO: Firestore — await addDoc(collection(db, 'zones'), { restaurantId, name, sortOrder })
 */
export async function createZone(
  restaurantId: string,
  name: string
): Promise<Zone> {
  // TODO: Firestore — persist new zone document and return the created entity
  const store = getZonesStore(restaurantId);
  const maxSortOrder = store.reduce((max, z) => Math.max(max, z.sortOrder), 0);
  const newZone: Zone = {
    id: shortId('zone'),
    restaurantId,
    name,
    sortOrder: maxSortOrder + 1,
  };
  store.push(newZone);
  return newZone;
}

/**
 * Deletes a zone and REASSIGNS its tables to no zone (zoneId undefined) — the
 * tables themselves are kept and simply move to the "Sin zona" group.
 *
 * Today: mutates the in-memory stores.
 * TODO: Firestore — a batched write:
 *   1. for each table where zoneId == zoneId → update { zoneId: deleteField() }
 *   2. deleteDoc(doc(db, 'zones', zoneId))
 */
export async function deleteZone(
  restaurantId: string,
  zoneId: string
): Promise<void> {
  // TODO: Firestore — batch: reassign affected tables, then delete the zone doc
  const tables = getTablesStore(restaurantId);
  for (const table of tables) {
    if (table.zoneId === zoneId) {
      delete table.zoneId;
    }
  }

  const zones = getZonesStore(restaurantId);
  const idx = zones.findIndex((z) => z.id === zoneId);
  if (idx !== -1) {
    zones.splice(idx, 1);
  }
}
