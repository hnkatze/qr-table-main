import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StatCardProps {
  /** Short label shown above the value (e.g. "Órdenes hoy") */
  label: string;
  /** Formatted value string (e.g. "24" or "L 1,250.00") */
  value: string;
  /** Optional supporting note below the value */
  description?: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Accessible label for the icon — defaults to label if omitted */
  iconAriaLabel?: string;
  /** Extra class names for the card root */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Summary metric card used in the dashboard overview row.
 * Renders a label, a large formatted value, an icon, and an optional description.
 */
export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconAriaLabel,
  className,
}: StatCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="flex flex-col gap-3">
        {/* Label row with icon */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <span
            aria-label={iconAriaLabel ?? label}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted"
          >
            <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </span>
        </div>

        {/* Value */}
        <div>
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
