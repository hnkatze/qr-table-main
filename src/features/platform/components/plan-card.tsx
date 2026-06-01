'use client';

import { PencilIcon, QrCode, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/features/platform/mappers/format-money.mapper';
import { cn } from '@/lib/utils';
import type { Plan } from '@/types/plan';

interface PlanCardProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onToggleActive: (planId: string, isActive: boolean) => void;
}

/**
 * A single plan in the catalog. Shows price + limits, lets the platform admin
 * edit it or toggle its availability for new subscriptions. Archived (inactive)
 * plans are visually dimmed but still listed.
 */
export function PlanCard({ plan, onEdit, onToggleActive }: PlanCardProps) {
  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-2xl border bg-card p-5 transition-shadow duration-200 hover:shadow-sm',
        plan.isActive ? 'border-border' : 'border-dashed border-border opacity-70'
      )}
    >
      {/* Header: name + status */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-foreground">{plan.name}</h2>
          {!plan.isActive && (
            <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              Archivado
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Editar plan ${plan.name}`}
          onClick={() => onEdit(plan)}
        >
          <PencilIcon aria-hidden="true" />
        </Button>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight text-foreground">
          {formatMoney(plan.priceMonthly)}
        </span>
        <span className="text-sm text-muted-foreground">/ mes</span>
      </div>

      {plan.description && (
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      )}

      {/* Limits */}
      <ul className="space-y-1.5 text-sm text-foreground" role="list">
        <li className="flex items-center gap-2">
          <QrCode className="size-4 text-brand-violet" aria-hidden="true" />
          Hasta <strong className="font-semibold">{plan.limits.maxTables}</strong> mesas
        </li>
        <li className="flex items-center gap-2">
          <UtensilsCrossed className="size-4 text-brand-violet" aria-hidden="true" />
          Hasta <strong className="font-semibold">{plan.limits.maxMenuItems}</strong> productos
        </li>
      </ul>

      {/* Availability toggle */}
      <label className="mt-auto flex items-center gap-2.5 border-t border-border pt-3">
        <input
          type="checkbox"
          checked={plan.isActive}
          onChange={(e) => onToggleActive(plan.id, e.target.checked)}
          className="size-4 rounded border-border text-brand-violet focus-visible:ring-2 focus-visible:ring-brand-violet/40"
        />
        <span className="text-xs text-muted-foreground">
          Disponible para nuevas suscripciones
        </span>
      </label>
    </article>
  );
}
