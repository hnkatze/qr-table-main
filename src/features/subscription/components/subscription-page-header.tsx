import type { ReactNode } from 'react';

interface SubscriptionPageHeaderProps {
  restaurantName: string | null;
  isOwner: boolean;
  /** Optional action slot (e.g. "Activar plan" CTA). */
  action?: ReactNode;
}

/**
 * Page header for the subscription page. Matches the bento visual language of
 * the settings page (eyebrow pill, h1, description). Pure presentational.
 */
export function SubscriptionPageHeader({
  restaurantName,
  isOwner,
  action,
}: SubscriptionPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand-sky">
          <span
            className="inline-block h-1.5 w-4 rounded-full bg-brand-sky"
            aria-hidden="true"
          />
          Cuenta
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Suscripción
        </h1>
        <p className="text-sm text-muted-foreground">
          {restaurantName
            ? isOwner
              ? `Gestioná el plan y los límites de ${restaurantName}.`
              : `Estás viendo la suscripción de ${restaurantName} en modo de solo lectura.`
            : 'Seleccioná un restaurante para ver su suscripción.'}
        </p>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
