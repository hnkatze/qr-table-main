import { QrCode, UtensilsCrossed, CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Plan } from '@/types/plan';

interface PlanOptionCardProps {
  plan: Plan;
  isCurrent: boolean;
  isDisabled: boolean;
  onSelect: (planId: string) => void;
}

/**
 * A plan option in the upgrade/downgrade catalog. Highlights the current plan.
 * The "Seleccionar" button is hidden when this plan is already active.
 * Pure presentational.
 */
export function PlanOptionCard({
  plan,
  isCurrent,
  isDisabled,
  onSelect,
}: PlanOptionCardProps) {
  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-2xl border p-5 transition-shadow duration-200',
        isCurrent
          ? 'border-brand-sky bg-brand-sky/5 shadow-sm'
          : 'border-border bg-card hover:shadow-sm'
      )}
      aria-current={isCurrent ? 'true' : undefined}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
        {isCurrent && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-sky/10 px-2 py-0.5 text-xs font-medium text-brand-sky ring-1 ring-inset ring-brand-sky/20">
            <CheckIcon className="size-3" aria-hidden="true" />
            Plan actual
          </span>
        )}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight text-foreground">
          ${plan.priceMonthly.toFixed(2)}
        </span>
        <span className="text-sm text-muted-foreground">USD / mes</span>
      </div>

      {plan.description && (
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      )}

      {/* Limits */}
      <ul className="space-y-1.5 text-sm text-foreground" role="list">
        <li className="flex items-center gap-2">
          <QrCode className="size-4 text-brand-sky" aria-hidden="true" />
          Hasta{' '}
          <strong className="font-semibold">{plan.limits.maxTables}</strong> mesas
        </li>
        <li className="flex items-center gap-2">
          <UtensilsCrossed className="size-4 text-brand-sky" aria-hidden="true" />
          Hasta{' '}
          <strong className="font-semibold">{plan.limits.maxMenuItems}</strong> productos
        </li>
      </ul>

      {/* CTA */}
      {!isCurrent && (
        <Button
          variant="outline"
          size="sm"
          disabled={isDisabled}
          onClick={() => onSelect(plan.id)}
          aria-label={`Cambiar al plan ${plan.name} por $${plan.priceMonthly.toFixed(2)} USD al mes`}
          className="mt-auto w-full border-brand-sky/30 text-brand-sky hover:bg-brand-sky/10 hover:text-brand-sky focus-visible:ring-brand-sky/40"
        >
          Seleccionar
        </Button>
      )}
    </article>
  );
}
