/**
 * BentoCard — asymmetric bento-grid cell.
 *
 * Wraps a shadcn Card with:
 *  - per-metric accent colour (gradient overlay on top of bg-card)
 *  - optional col/row span classes passed in
 *  - consistent border, radius, and layered shadow
 *  - entrance animation class (bento-reveal)
 *
 * Styling philosophy:
 *  - bg-card is the base (theme-aware)
 *  - a subtle gradient is overlaid via a pseudo-element (::before) to add
 *    the metric accent without breaking dark-mode card tokens
 *  - all colour classes come from Tailwind scale tokens, no arbitrary values
 */

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface BentoCardProps {
  /** Grid-column span class(es), e.g. "col-span-1 sm:col-span-2" */
  colSpan?: string;
  /** Grid-row span class(es), e.g. "row-span-2" */
  rowSpan?: string;
  /** Tailwind from-* class for the accent gradient, e.g. "from-emerald-500/10" */
  accentFrom?: string;
  /** Tailwind to-* class for the gradient end, e.g. "to-teal-500/5" */
  accentTo?: string;
  /** Entrance animation delay class, e.g. "bento-delay-1" */
  delayClass?: string;
  className?: string;
  children: ReactNode;
  /** a11y: section label (renders as aria-label on the section wrapper) */
  ariaLabel?: string;
}

export function BentoCard({
  colSpan = 'col-span-1',
  rowSpan,
  accentFrom = 'from-primary/5',
  accentTo = 'to-transparent',
  delayClass,
  className,
  children,
  ariaLabel,
}: BentoCardProps) {
  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={cn(
        // Grid placement
        colSpan,
        rowSpan,
        // Card base — theme-aware bg + border
        'relative overflow-hidden rounded-2xl bg-card',
        'ring-1 ring-foreground/10 dark:ring-white/10',
        // Multi-layer shadow
        'shadow-sm hover:shadow-md',
        // Subtle transition on hover
        'transition-shadow duration-200',
        // Entrance animation
        'bento-reveal',
        delayClass,
        className
      )}
    >
      {/* Accent gradient overlay — bg-gradient-to-br sits on top of bg-card */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br',
          accentFrom,
          accentTo
        )}
      />
      {/* Content layer — above the gradient */}
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </div>
  );
}
