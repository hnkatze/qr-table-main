import { useState } from 'react';
import {
  getTablesSnapshot,
  createTable,
  deleteTable,
} from '@/features/tables/services/tables.service';
import { buildTableUrl } from '@/features/tables/mappers/public-url.mapper';
import type { TableCard } from '@/features/tables/types';
import type { Table } from '@/types/restaurant';

// ─── Input / Output ───────────────────────────────────────────────────────────

interface UseTablesInput {
  restaurantId: string | null;
  restaurantSlug: string | null;
}

export interface UseTablesOutput {
  /** Derived view-models — each table enriched with the customer URL. */
  tableCards: TableCard[];
  /** Owner action: create a new table with the given number. Optimistic local update. */
  handleCreateTable: (tableNumber: number) => Promise<void>;
  /** Owner action: delete a table by id. Optimistic local update. */
  handleDeleteTable: (tableId: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derives TableCard view-models from raw Table entities and the restaurant slug.
 * Pure — no side effects.
 */
function buildTableCards(tables: Table[], restaurantSlug: string): TableCard[] {
  return tables
    .slice()
    .sort((a, b) => a.number - b.number)
    .map((table) => ({
      table,
      qrToken: table.qrToken,
      // URL is built from the rotatable qrToken, never the display number.
      customerUrl: buildTableUrl(restaurantSlug, table.qrToken),
    }));
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Encapsulates all tables-feature state:
 *   - localTables: the in-memory list, derived from mock data via the service
 *   - restaurant-change sync: re-derives when activeRestaurant switches (render-phase pattern)
 *   - handlers: createTable, deleteTable — each calls the service then applies
 *     an optimistic local update
 *
 * The returned tableCards are already sorted by number ascending and enriched
 * with the customer-facing URL.
 *
 * Design note: the restaurant-sync uses the render-phase pattern (no useEffect)
 * consistent with use-members.ts. When Firestore lands, replace the internals
 * with an onSnapshot subscription inside a useEffect.
 */
export function useTables({ restaurantId, restaurantSlug }: UseTablesInput): UseTablesOutput {
  // Seed initial tables synchronously — avoids a loading flash while data is mock/local.
  // When Firestore lands, replace this initialiser with [] and add a useEffect subscription.
  const [localTables, setLocalTables] = useState<Table[]>(() =>
    restaurantId ? getTablesSnapshot(restaurantId) : []
  );

  const [lastRestaurantId, setLastRestaurantId] = useState<string | null>(restaurantId);

  // Render-phase sync: when restaurantId changes, re-derive immediately.
  // Intentional React pattern for derived state that resets on a key prop change.
  if (restaurantId !== lastRestaurantId) {
    setLastRestaurantId(restaurantId);
    if (!restaurantId) {
      setLocalTables([]);
    } else {
      setLocalTables(getTablesSnapshot(restaurantId));
    }
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleCreateTable(tableNumber: number): Promise<void> {
    if (!restaurantId) return;
    const created = await createTable(restaurantId, tableNumber);
    // Optimistic local update
    setLocalTables((prev) => [...prev, created]);
  }

  function handleDeleteTable(tableId: string): void {
    if (!restaurantId) return;
    // Optimistic local update first
    setLocalTables((prev) => prev.filter((t) => t.id !== tableId));
    // Service call (no-op today; TODO: await + rollback on error when Firestore lands)
    void deleteTable(restaurantId, tableId);
  }

  // ── Derived view-models ──────────────────────────────────────────────────────

  const tableCards =
    restaurantSlug ? buildTableCards(localTables, restaurantSlug) : [];

  return { tableCards, handleCreateTable, handleDeleteTable };
}
