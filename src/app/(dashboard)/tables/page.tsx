'use client';

import { useAuth, useActiveRole } from '@/lib/auth/auth-context';
import { useTables } from '@/features/tables/hooks/use-tables';
import { TablesPageHeader } from '@/features/tables/components/tables-page-header';
import { ZoneSection } from '@/features/tables/components/zone-section';
import { TablesEmptyState } from '@/features/tables/components/tables-empty-state';
import { NoRestaurantState } from '@/features/tables/components/no-restaurant-state';

/**
 * /tables — Tables and QR codes for the active restaurant, grouped by zone.
 *
 * Thin orchestrator: reads auth context, delegates all state logic to
 * useTables(), and renders one ZoneSection per group (zones by sortOrder, then
 * the trailing "Sin zona" group).
 *
 * Owner-gating:
 *   - useActiveRole() === 'owner' → add/delete table + zone affordances visible.
 *   - 'staff' or null → read-only sections, no action buttons.
 */
export default function TablesPage() {
  const { activeRestaurant } = useAuth();
  const activeRole = useActiveRole();
  const isOwner = activeRole === 'owner';

  const {
    zoneGroups,
    zones,
    existingNumbers,
    totalTables,
    handleCreateTable,
    handleDeleteTable,
    handleCreateZone,
    handleDeleteZone,
  } = useTables({
    restaurantId: activeRestaurant?.id ?? null,
    restaurantPublicId: activeRestaurant?.publicId ?? null,
  });

  // ── No restaurant selected ─────────────────────────────────────────────────
  if (!activeRestaurant) {
    return (
      <div className="flex flex-col gap-6">
        <TablesPageHeader
          restaurantName={null}
          isOwner={false}
          existingNumbers={[]}
          suggestedNumber={1}
          zones={[]}
          existingZoneNames={[]}
          onCreateTable={async () => undefined}
          onCreateZone={async () => undefined}
        />
        <NoRestaurantState />
      </div>
    );
  }

  const suggestedNumber =
    existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
  const existingZoneNames = zones.map((z) => z.name);

  // ── Normal view ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8">
      <TablesPageHeader
        restaurantName={activeRestaurant.name}
        isOwner={isOwner}
        existingNumbers={existingNumbers}
        suggestedNumber={suggestedNumber}
        zones={zones}
        existingZoneNames={existingZoneNames}
        onCreateTable={handleCreateTable}
        onCreateZone={handleCreateZone}
      />

      {totalTables === 0 ? (
        <TablesEmptyState isOwner={isOwner} />
      ) : (
        zoneGroups.map((group) => (
          <ZoneSection
            key={group.zone?.id ?? '__no_zone__'}
            group={group}
            restaurantPublicId={activeRestaurant.publicId}
            restaurantName={activeRestaurant.name}
            isOwner={isOwner}
            onDeleteTable={handleDeleteTable}
            onDeleteZone={handleDeleteZone}
          />
        ))
      )}

      {!isOwner && totalTables > 0 && (
        <p className="text-xs text-muted-foreground text-center" role="note">
          Solo los propietarios pueden agregar o eliminar mesas y zonas.
        </p>
      )}
    </div>
  );
}
