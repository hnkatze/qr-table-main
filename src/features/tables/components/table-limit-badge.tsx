import { QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TableLimitInfo } from '@/features/tables/types';

interface TableLimitBadgeProps {
  limit: TableLimitInfo;
}

/**
 * Compact "used / max mesas" meter for the active restaurant's plan.
 * Renders nothing when the plan has no enforced ceiling (max === null).
 * Color is never the only signal — the count text always states usage.
 */
export function TableLimitBadge({ limit }: TableLimitBadgeProps) {
  if (limit.max === null) return null;

  const tone = limit.isAtLimit
    ? 'bg-brand-amber/10 text-brand-amber ring-brand-amber/20'
    : 'bg-muted text-muted-foreground ring-border';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        tone
      )}
      aria-label={`${limit.used} de ${limit.max} mesas usadas en este plan`}
    >
      <QrCode className="size-3.5" aria-hidden="true" />
      <span className="tabular-nums">
        {limit.used} / {limit.max} mesas
      </span>
    </span>
  );
}
