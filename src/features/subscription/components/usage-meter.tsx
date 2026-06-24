import type { ReactNode } from 'react';
import type { UsageInfo } from '@/features/subscription/types';
import { cn } from '@/lib/utils';

interface UsageMeterProps {
  label: string;
  usage: UsageInfo;
  /** Icon rendered before the label. */
  icon: ReactNode;
}

/**
 * Compact usage meter: icon + label + "used / max" count + visual bar.
 * When `max` is null (plan unknown), renders a plain count with no bar.
 * Accessible: the track uses role="meter" with aria-valuenow/min/max/valuetext.
 * Pure presentational.
 */
export function UsageMeter({ label, usage, icon }: UsageMeterProps) {
  const { used, max, fraction, isAtLimit } = usage;

  const barColor = isAtLimit
    ? 'bg-brand-amber'
    : 'bg-brand-sky';

  const pct = fraction !== null ? Math.round(fraction * 100) : null;

  return (
    <div className="flex flex-col gap-2">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <span aria-hidden="true" className="size-4 shrink-0 text-muted-foreground">
            {icon}
          </span>
          {label}
        </span>

        <span
          className={cn(
            'text-xs font-medium tabular-nums',
            isAtLimit ? 'text-brand-amber' : 'text-muted-foreground'
          )}
        >
          {max !== null ? `${used} / ${max}` : String(used)}
        </span>
      </div>

      {/* Bar — only when a ceiling exists */}
      {max !== null && pct !== null && (
        <div
          role="meter"
          aria-valuenow={used}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuetext={`${used} de ${max} ${label.toLowerCase()} usados`}
          aria-label={label}
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn('h-full rounded-full transition-all duration-300', barColor)}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      )}

      {/* At-limit notice */}
      {isAtLimit && (
        <p className="text-xs text-brand-amber" role="alert">
          Llegaste al límite de {label.toLowerCase()} de tu plan.
        </p>
      )}
    </div>
  );
}
