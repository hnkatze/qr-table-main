import type { Order } from '@/types/order';

interface OrdersPageHeaderProps {
  restaurantName: string | null;
  orders: Order[];
}

/**
 * Page-level header for the /orders route.
 *
 * Mirrors the visual language of PageHeader in the members feature:
 *   - Eyebrow (restaurant name + accent bar)
 *   - H1 + description
 *   - Live count summary (polite aria-live to update screen readers)
 *
 * Pure presentational — no state, no fetching.
 */
export function OrdersPageHeader({ restaurantName, orders }: OrdersPageHeaderProps) {
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;

  const activeCount = pendingCount + preparingCount + readyCount;

  return (
    <header className="flex flex-col gap-1">
      {/* Eyebrow */}
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand-amber">
        <span
          className="inline-block h-1.5 w-4 rounded-full bg-brand-amber"
          aria-hidden="true"
        />
        {restaurantName ?? 'Restaurante'}
      </p>

      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Órdenes
          </h1>
          <p className="text-sm text-muted-foreground">
            {restaurantName
              ? `Tablero en tiempo real de ${restaurantName}.`
              : 'Seleccioná un restaurante para ver sus órdenes.'}
          </p>
        </div>

        {/* Live summary */}
        <p
          className="text-sm text-muted-foreground tabular-nums"
          aria-live="polite"
          aria-atomic="true"
        >
          {activeCount > 0 ? (
            <>
              <span className="font-semibold text-foreground">{activeCount}</span>
              {' '}orden{activeCount !== 1 ? 'es' : ''} activa{activeCount !== 1 ? 's' : ''}
              {readyCount > 0 && (
                <span className="ml-2 text-brand-emerald font-medium">
                  · {readyCount} lista{readyCount !== 1 ? 's' : ''}
                </span>
              )}
            </>
          ) : (
            'Sin órdenes activas'
          )}
        </p>
      </div>
    </header>
  );
}
