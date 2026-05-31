/**
 * MetricTile — a single KPI bento block.
 *
 * Displays:
 *  - accent icon chip (coloured background + white icon)
 *  - metric label
 *  - large formatted value
 *  - trend badge (↑/↓ percentage, colour-coded AND text-labelled for a11y)
 *  - optional Sparkline micro-chart at the bottom
 *
 * All colour tokens are Tailwind scale (no arbitrary values).
 */

import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sparkline } from './sparkline';
import { BentoCard } from './bento-card';
import type { BentoCardProps } from './bento-card';

// ─── Trend badge ──────────────────────────────────────────────────────────────

interface TrendBadgeProps {
  /** Positive = up, negative = down */
  value: number;
  /** Human-readable label to append, e.g. "vs ayer" */
  label?: string;
}

function TrendBadge({ value, label }: TrendBadgeProps) {
  const isUp = value >= 0;
  const Icon = isUp ? TrendingUp : TrendingDown;
  const sign = isUp ? '+' : '';
  const colorClasses = isUp
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
    : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
        'text-xs font-semibold',
        colorClasses
      )}
      aria-label={`Tendencia: ${isUp ? 'al alza' : 'a la baja'} ${sign}${value}%${label ? ' ' + label : ''}`}
    >
      <Icon className="size-3 shrink-0" aria-hidden="true" />
      {/* Text conveys the same info as colour — a11y requirement met */}
      <span aria-hidden="true">
        {sign}{value}%{label ? ` ${label}` : ''}
      </span>
    </span>
  );
}

// ─── Icon chip ────────────────────────────────────────────────────────────────

interface IconChipProps {
  icon: LucideIcon;
  /** Tailwind bg class, e.g. "bg-emerald-500" */
  bgClass: string;
  ariaLabel: string;
}

function IconChip({ icon: Icon, bgClass, ariaLabel }: IconChipProps) {
  return (
    <span
      aria-label={ariaLabel}
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-xl',
        bgClass
      )}
    >
      <Icon className="size-5 text-white" aria-hidden="true" />
    </span>
  );
}

// ─── MetricTile ───────────────────────────────────────────────────────────────

export interface MetricTileProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconAriaLabel: string;
  /** Chip background, e.g. "bg-emerald-500" */
  chipBg: string;
  /** Sparkline stroke class, e.g. "text-emerald-500" */
  sparkStroke: string;
  /** Sparkline fill class, e.g. "text-emerald-500/20" */
  sparkFill: string;
  sparkData?: readonly number[];
  trend?: number;
  trendLabel?: string;
  description?: string;
  // BentoCard placement
  colSpan?: BentoCardProps['colSpan'];
  rowSpan?: BentoCardProps['rowSpan'];
  accentFrom?: BentoCardProps['accentFrom'];
  accentTo?: BentoCardProps['accentTo'];
  delayClass?: string;
}

export function MetricTile({
  label,
  value,
  icon,
  iconAriaLabel,
  chipBg,
  sparkStroke,
  sparkFill,
  sparkData,
  trend,
  trendLabel = 'vs ayer',
  description,
  colSpan,
  rowSpan,
  accentFrom,
  accentTo,
  delayClass,
}: MetricTileProps) {
  return (
    <BentoCard
      colSpan={colSpan}
      rowSpan={rowSpan}
      accentFrom={accentFrom}
      accentTo={accentTo}
      delayClass={delayClass}
      ariaLabel={label}
    >
      <div className="flex flex-col gap-3 p-5">
        {/* Top row: icon chip + trend badge */}
        <div className="flex items-start justify-between gap-2">
          <IconChip icon={icon} bgClass={chipBg} ariaLabel={iconAriaLabel} />
          {trend !== undefined && (
            <TrendBadge value={trend} label={trendLabel} />
          )}
        </div>

        {/* Value */}
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Sparkline — grows to fill remaining space */}
        {sparkData && sparkData.length >= 2 && (
          <div
            className="mt-auto"
            role="img"
            aria-label={`Gráfica de tendencia para ${label}`}
          >
            <Sparkline
              data={sparkData}
              strokeClass={sparkStroke}
              fillClass={sparkFill}
              height={48}
            />
          </div>
        )}
      </div>
    </BentoCard>
  );
}
