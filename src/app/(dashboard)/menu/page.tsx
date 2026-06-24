'use client';

import { Loader2 } from 'lucide-react';
import { useAuth, useActiveRole } from '@/lib/auth/auth-context';
import { useMenu } from '@/features/menu/hooks/use-menu';
import { MenuPageHeader } from '@/features/menu/components/menu-page-header';
import { MenuList } from '@/features/menu/components/menu-list';
import { MenuEmptyState } from '@/features/menu/components/menu-empty-state';
import { NoRestaurantMenuState } from '@/features/menu/components/no-restaurant-menu-state';
import { CategoryDialog } from '@/features/menu/components/category-dialog';
import { DIALOG_MODE } from '@/features/menu/constants';

/**
 * /menu — Menu management for the active restaurant.
 *
 * Thin orchestrator: reads auth context, delegates all state to useMenu(),
 * and renders presentational components. Zero business logic inline.
 *
 * Owner-gating:
 *   - useActiveRole() === 'owner' → CRUD buttons visible; dialogs enabled.
 *   - 'staff' or null → read-only view with lock notice.
 *
 * Firestore seams:
 *   - All CRUD calls flow through menu.service.ts — replace mock with
 *     Firestore writes there; the hook and components stay untouched.
 */
export default function MenuPage() {
  const { activeRestaurant } = useAuth();
  const activeRole = useActiveRole();
  const isOwner = activeRole === 'owner';

  const {
    categories,
    grouped,
    isLoading,
    isMutating,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleToggleAvailability,
  } = useMenu({ restaurantId: activeRestaurant?.id ?? null });

  if (!activeRestaurant) {
    return (
      <div className="flex flex-col gap-6">
        <MenuPageHeader restaurantName={null} isOwner={isOwner} />
        <NoRestaurantMenuState />
      </div>
    );
  }

  const currency = activeRestaurant.currency;

  // Owner header actions: "Nueva categoría" shortcut in the header area
  const headerActions = isOwner ? (
    <CategoryDialog
      mode={DIALOG_MODE.add}
      isMutating={isMutating}
      onSave={handleAddCategory}
    />
  ) : undefined;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <MenuPageHeader
          restaurantName={activeRestaurant.name}
          isOwner={isOwner}
          actions={headerActions}
        />
        <div
          className="flex items-center justify-center py-20"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Cargando menú…</span>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <MenuPageHeader
          restaurantName={activeRestaurant.name}
          isOwner={isOwner}
          actions={headerActions}
        />
        <MenuEmptyState restaurantName={activeRestaurant.name} isOwner={isOwner} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <MenuPageHeader
        restaurantName={activeRestaurant.name}
        isOwner={isOwner}
        actions={headerActions}
      />

      <MenuList
        grouped={grouped}
        categories={categories}
        currency={currency}
        isOwner={isOwner}
        isMutating={isMutating}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddProduct={handleAddProduct}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
        onToggleAvailability={handleToggleAvailability}
      />

      {!isOwner && (
        <p className="text-center text-xs text-muted-foreground" role="note">
          Solo los propietarios pueden crear, editar o eliminar categorías y productos.
        </p>
      )}
    </div>
  );
}
