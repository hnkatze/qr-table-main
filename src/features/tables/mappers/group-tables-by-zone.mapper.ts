import type { Zone } from '@/types/restaurant';
import type { TableCard, ZoneGroup } from '@/features/tables/types';

/**
 * Groups table cards into ordered zone sections.
 *
 * Output order:
 *   1. Each zone (sorted by sortOrder ascending) that HAS at least one table,
 *      in the same order as the sorted zones.
 *   2. A trailing group with `zone: null` ("Sin zona") holding every table whose
 *      `zoneId` is missing OR points to a zone that no longer exists.
 *
 * Empty zones (no tables) are omitted — only zones with tables are rendered.
 * The "Sin zona" group is included only when it actually has tables.
 *
 * Pure function — no side effects, no state.
 *
 * @param zones      The restaurant's zones (any order; sorted internally by sortOrder).
 * @param tableCards The table view-models to distribute across the groups.
 */
export function groupTablesByZone(
  zones: readonly Zone[],
  tableCards: readonly TableCard[]
): ZoneGroup[] {
  const sortedZones = [...zones].sort((a, b) => a.sortOrder - b.sortOrder);
  const knownZoneIds = new Set(sortedZones.map((z) => z.id));

  // Bucket table cards by zoneId; anything missing/unknown goes to the null bucket.
  const byZoneId = new Map<string, TableCard[]>();
  const noZone: TableCard[] = [];

  for (const card of tableCards) {
    const zoneId = card.table.zoneId;
    if (zoneId && knownZoneIds.has(zoneId)) {
      const bucket = byZoneId.get(zoneId);
      if (bucket) {
        bucket.push(card);
      } else {
        byZoneId.set(zoneId, [card]);
      }
    } else {
      noZone.push(card);
    }
  }

  const groups: ZoneGroup[] = [];

  // Zone groups in sortOrder, skipping zones that ended up with no tables.
  for (const zone of sortedZones) {
    const tables = byZoneId.get(zone.id);
    if (tables && tables.length > 0) {
      groups.push({ zone, tables });
    }
  }

  // Trailing "Sin zona" group, only when it has tables.
  if (noZone.length > 0) {
    groups.push({ zone: null, tables: noZone });
  }

  return groups;
}
