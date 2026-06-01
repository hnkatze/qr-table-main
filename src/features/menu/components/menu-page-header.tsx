import type { ReactNode } from 'react';

interface MenuPageHeaderProps {
  restaurantName: string | null;
  isOwner: boolean;
  actions?: ReactNode;
}

/**
 * Page-level header for the /menu route.
 * Eyebrow + title + description + optional CTA slot (for owner-only actions).
 * Pure presentational.
 */
export function MenuPageHeader({ restaurantName, isOwner, actions }: MenuPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        {/* Eyebrow — matches members page visual language */}
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand-violet">
          <span
            className="inline-block h-1.5 w-4 rounded-full bg-brand-violet"
            aria-hidden="true"
          />
          {restaurantName ?? 'Restaurante'}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Menú</h1>
        <p className="text-sm text-muted-foreground">
          {restaurantName
            ? isOwner
              ? `Gestioná las categorías y productos de ${restaurantName}.`
              : `Estás viendo el menú de ${restaurantName} en modo de solo lectura.`
            : 'Seleccioná un restaurante para ver su menú.'}
        </p>
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
