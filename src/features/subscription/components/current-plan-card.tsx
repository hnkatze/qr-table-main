import { QrCode, UtensilsCrossed, CalendarIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { SubscriptionStatusBadge } from './subscription-status-badge';
import { UsageMeter } from './usage-meter';
import { formatPeriodEnd } from '@/features/subscription/mappers/date.mapper';
import type { SubscriptionViewModel } from '@/features/subscription/types';

interface CurrentPlanCardProps {
  vm: SubscriptionViewModel;
}

/**
 * Card showing the current plan name, price, status, renewal date, and usage
 * meters for tables + menu items. Pure presentational — no state.
 */
export function CurrentPlanCard({ vm }: CurrentPlanCardProps) {
  const { plan, status, currentPeriodEnd, usage } = vm;

  return (
    <Card className="relative overflow-hidden">
      {/* Left accent strip */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-brand-sky"
      />

      <CardHeader className="pl-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-foreground">
              Plan actual
            </CardTitle>
            <CardDescription>
              Tu plan vigente y el uso de recursos.
            </CardDescription>
          </div>
          <SubscriptionStatusBadge status={status} />
        </div>
      </CardHeader>

      <CardContent className="pl-6 space-y-6">
        {/* Plan name + price */}
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {plan ? plan.name : '—'}
          </span>
          {plan && (
            <span className="text-sm text-muted-foreground">
              ${plan.priceMonthly.toFixed(2)} USD / mes
            </span>
          )}
          {plan?.description && (
            <p className="w-full text-sm text-muted-foreground">
              {plan.description}
            </p>
          )}
        </div>

        {/* Renewal date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="size-4 shrink-0" aria-hidden="true" />
          <span>
            {status === 'canceled'
              ? 'Acceso hasta el '
              : 'Próxima renovación: '}
            <strong className="font-medium text-foreground">
              {formatPeriodEnd(currentPeriodEnd)}
            </strong>
          </span>
        </div>

        {/* Usage meters */}
        <div className="space-y-4 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Uso actual
          </p>

          <UsageMeter
            label="Mesas"
            usage={usage.tables}
            icon={<QrCode className="size-4" />}
          />

          <UsageMeter
            label="Productos del menú"
            usage={usage.menuItems}
            icon={<UtensilsCrossed className="size-4" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}
