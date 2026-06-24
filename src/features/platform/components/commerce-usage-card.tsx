import type { ElementType } from 'react';
import { QrCode, UtensilsCrossed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CommerceDetail } from '@/features/platform/types';

interface UsageBarProps {
  label: string;
  used: number;
  max: number;
  icon: ElementType;
}

/**
 * Single usage gauge: icon + label + numeric fraction + progress bar.
 * Uses semantic color tokens — amber when over 80% capacity, emerald otherwise.
 */
function UsageBar({ label, used, max, icon: Icon }: UsageBarProps) {
  const pct = max > 0 ? Math.min((used / max) * 100, 100) : 0;
  const isAtRisk = pct >= 80;

  const barColor = isAtRisk
    ? 'bg-brand-amber'
    : 'bg-brand-emerald';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-foreground font-medium">
          <Icon className="size-4 text-brand-violet" aria-hidden="true" />
          {label}
        </span>
        <span
          className="tabular-nums text-muted-foreground"
          aria-label={`${used} de ${max}`}
        >
          {used}
          <span className="text-xs"> / {max}</span>
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${used} de ${max}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {isAtRisk && (
        <p className="text-xs text-brand-amber" role="status">
          Cerca del límite del plan
        </p>
      )}
    </div>
  );
}

interface CommerceUsageCardProps {
  detail: CommerceDetail;
}

/**
 * Shows table count and product count vs plan limits.
 * Falls back gracefully when no plan is assigned (renders raw counts only).
 */
export function CommerceUsageCard({ detail }: CommerceUsageCardProps) {
  const { tableCount, productCount, plan } = detail;

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-center gap-2">
          <QrCode className="size-4 text-brand-violet" aria-hidden="true" />
          Uso del plan
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-5">
        {plan ? (
          <>
            <UsageBar
              label="Mesas"
              used={tableCount}
              max={plan.limits.maxTables}
              icon={QrCode}
            />
            <UsageBar
              label="Productos en el menú"
              used={productCount}
              max={plan.limits.maxMenuItems}
              icon={UtensilsCrossed}
            />
          </>
        ) : (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-1.5">
              <QrCode className="size-4" aria-hidden="true" />
              {tableCount} mesas
            </p>
            <p className="flex items-center gap-1.5">
              <UtensilsCrossed className="size-4" aria-hidden="true" />
              {productCount} productos
            </p>
            <p className="text-xs">Sin plan asignado — los límites no aplican.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
