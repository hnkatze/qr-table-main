'use client';

import { useAuth, useActiveRole } from '@/lib/auth/auth-context';
import { useTables } from '@/features/tables/hooks/use-tables';
import { TablesPageHeader } from '@/features/tables/components/tables-page-header';
import { TablesGrid } from '@/features/tables/components/tables-grid';
import { TablesEmptyState } from '@/features/tables/components/tables-empty-state';
import { NoRestaurantState } from '@/features/tables/components/no-restaurant-state';

/**
 * /tables — Tables and QR codes for the active restaurant.
 *
 * Thin orchestrator: reads auth context, delegates all state logic to
 * useTables(), and renders presentational components.
 *
 * Owner-gating:
 *   - useActiveRole() === 'owner' → add/delete table affordances visible.
 *   - 'staff' or null → read-only grid, no action buttons.
 */
export default function TablesPage() {
  const { activeRestaurant } = useAuth();
  const activeRole = useActiveRole();
  const isOwner = activeRole === 'owner';

  const { tableCards, handleCreateTable, handleDeleteTable } = useTables({
    restaurantId: activeRestaurant?.id ?? null,
    restaurantSlug: activeRestaurant?.slug ?? null,
  });

  // ── No restaurant selected ─────────────────────────────────────────────────
  if (!activeRestaurant) {
    return (
      <div className="flex flex-col gap-6">
        <TablesPageHeader
          restaurantName={null}
          isOwner={false}
          existingNumbers={[]}
          onCreateTable={async () => undefined}
        />
        <NoRestaurantState />
      </div>
    );
  }

  const existingNumbers = tableCards.map((tc) => tc.table.number);

  // ── Normal view ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      <TablesPageHeader
        restaurantName={activeRestaurant.name}
        isOwner={isOwner}
        existingNumbers={existingNumbers}
        onCreateTable={handleCreateTable}
      />

      {tableCards.length === 0 ? (
        <TablesEmptyState isOwner={isOwner} />
      ) : (
        <TablesGrid
          tableCards={tableCards}
          restaurantSlug={activeRestaurant.slug}
          restaurantName={activeRestaurant.name}
          isOwner={isOwner}
          onDeleteTable={handleDeleteTable}
        />
      )}

      {!isOwner && tableCards.length > 0 && (
        <p className="text-xs text-muted-foreground text-center" role="note">
          Solo los propietarios pueden agregar o eliminar mesas.
        </p>
      )}
    </div>
  );
}
