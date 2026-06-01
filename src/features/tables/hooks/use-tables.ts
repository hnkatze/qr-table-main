import { useState } from 'react';
import {
  getTablesSnapshot,
  getZonesSnapshot,
  createTable,
  deleteTable,
  createZone,
  deleteZone,
} from '@/features/tables/services/tables.service';
import { buildTableUrl } from '@/features/tables/mappers/public-url.mapper';
import { groupTablesByZone } from '@/features/tables/mappers/group-tables-by-zone.mapper';
import type { TableCard, ZoneGroup } from '@/features/tables/types';
import type { Table, Zone } from '@/types/restaurant';

// ─── Input / Output ───────────────────────────────────────────────────────────

interface UseTablesInput {
  restaurantId: string | null;
  restaurantPublicId: string | null;
}

export interface UseTablesOutput {
  /** Tables grouped into ordered zone sections (zones by sortOrder, then "Sin zona"). */
  zoneGroups: ZoneGroup[];
  /** The restaurant's zones (sorted by sortOrder) — for the add-table zone <Select>. */
  zones: Zone[];
  /** Flat list of in-use table numbers — for the add-table duplicate guard. */
  existingNumbers: number[];
  /** Total table count — for empty-state branching in the page. */
  totalTables: number;
  /** Owner action: create a table with the given number and optional zone. */
  handleCreateTable: (tableNumber: number, zoneId?: string) => Promise<void>;
  /** Owner action: delete a table by id. Optimistic local update. */
  handleDeleteTable: (tableId: string) => void;
  /** Owner action: create a zone with the given name. */
  handleCreateZone: (name: string) => Promise<void>;
  /** Owner action: delete a zone; its tables are reassigned to "Sin zona". */
  handleDeleteZone: (zoneId: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derives TableCard view-models from raw Table entities and the restaurant publicId.
 * Pure — no side effects. Sort is by display number ascending within each call.
 */
function buildTableCards(tables: Table[], restaurantPublicId: string): TableCard[] {
  return tables
    .slice()
    .sort((a, b) => a.number - b.number)
    .map((table) => ({
      table,
      qrToken: table.qrToken,
      // URL is built from the rotatable qrToken, never the display number.
      customerUrl: buildTableUrl(restaurantPublicId, table.qrToken),
    }));
}

function sortZones(zones: Zone[]): Zone[] {
  return [...zones].sort((a, b) => a.sortOrder - b.sortOrder);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Encapsulates all tables-feature state:
 *   - localTables / localZones: in-memory lists, seeded synchronously from the service
 *   - restaurant-change sync: re-derives both when activeRestaurant switches
 *   - handlers: create/delete table + create/delete zone — each calls the service
 *     then applies an optimistic local update
 *
 * Returned data is fully derived (grouped + sorted + URL-enriched). The page is a
 * thin consumer.
 *
 * Design note: the restaurant-sync uses the render-phase pattern (no useEffect),
 * consistent with use-members.ts. The synchronous snapshot seed avoids an empty
 * first paint. When Firestore lands, replace the internals with onSnapshot
 * subscriptions inside a useEffect.
 */
export function useTables({ restaurantId, restaurantPublicId }: UseTablesInput): UseTablesOutput {
  // Seed initial tables + zones synchronously — avoids a loading flash on first paint.
  const [localTables, setLocalTables] = useState<Table[]>(() =>
    restaurantId ? getTablesSnapshot(restaurantId) : []
  );
  const [localZones, setLocalZones] = useState<Zone[]>(() =>
    restaurantId ? getZonesSnapshot(restaurantId) : []
  );

  const [lastRestaurantId, setLastRestaurantId] = useState<string | null>(restaurantId);

  // Render-phase sync: when restaurantId changes, re-derive both lists immediately.
  if (restaurantId !== lastRestaurantId) {
    setLastRestaurantId(restaurantId);
    if (!restaurantId) {
      setLocalTables([]);
      setLocalZones([]);
    } else {
      setLocalTables(getTablesSnapshot(restaurantId));
      setLocalZones(getZonesSnapshot(restaurantId));
    }
  }

  // ── Table handlers ────────────────────────────────────────────────────────────

  async function handleCreateTable(tableNumber: number, zoneId?: string): Promise<void> {
    if (!restaurantId) return;
    const created = await createTable(restaurantId, tableNumber, zoneId);
    setLocalTables((prev) => [...prev, created]);
  }

  function handleDeleteTable(tableId: string): void {
    if (!restaurantId) return;
    setLocalTables((prev) => prev.filter((t) => t.id !== tableId));
    // Service call (no-op-ish today; TODO: await + rollback on error when Firestore lands)
    void deleteTable(restaurantId, tableId);
  }

  // ── Zone handlers ──────────────────────────────────────────────────────────────

  async function handleCreateZone(name: string): Promise<void> {
    if (!restaurantId) return;
    const created = await createZone(restaurantId, name);
    setLocalZones((prev) => [...prev, created]);
  }

  function handleDeleteZone(zoneId: string): void {
    if (!restaurantId) return;
    // Optimistic: drop the zone and reassign its tables locally to "no zone".
    setLocalZones((prev) => prev.filter((z) => z.id !== zoneId));
    setLocalTables((prev) =>
      prev.map((t) => {
        if (t.zoneId !== zoneId) return t;
        // Rebuild the table without zoneId so it falls into the "Sin zona" group.
        return { id: t.id, number: t.number, qrToken: t.qrToken };
      })
    );
    void deleteZone(restaurantId, zoneId);
  }

  // ── Derived view-models ──────────────────────────────────────────────────────

  const tableCards =
    restaurantPublicId ? buildTableCards(localTables, restaurantPublicId) : [];
  const zones = sortZones(localZones);
  const zoneGroups = groupTablesByZone(zones, tableCards);
  const existingNumbers = localTables.map((t) => t.number);

  return {
    zoneGroups,
    zones,
    existingNumbers,
    totalTables: localTables.length,
    handleCreateTable,
    handleDeleteTable,
    handleCreateZone,
    handleDeleteZone,
  };
}
