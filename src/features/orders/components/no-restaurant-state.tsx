import { StoreIcon } from 'lucide-react';

/**
 * Shown on the /orders route when there is no active restaurant selected.
 * Mirrors NoRestaurantState in the members feature.
 * Pure presentational — no state, no callbacks.
 */
export function NoRestaurantState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center"
      role="status"
      aria-label="Sin restaurante activo"
    >
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-amber/10 ring-1 ring-brand-amber/25">
        <StoreIcon className="size-7 text-brand-amber" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">
          Sin restaurante seleccionado
        </p>
        <p className="text-sm text-muted-foreground">
          Seleccioná un restaurante desde el menú lateral para ver sus órdenes.
        </p>
      </div>
    </div>
  );
}
