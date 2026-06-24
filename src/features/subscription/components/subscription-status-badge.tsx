import type { SubscriptionStatus } from '@/types/subscription';
import { STATUS_META } from '@/features/subscription/constants';
import { cn } from '@/lib/utils';

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus;
}

/**
 * Pill badge showing a subscription status with a token-based color.
 * Color is never the ONLY signal — the text label always states the status.
 * Pure presentational; no state.
 */
export function SubscriptionStatusBadge({ status }: SubscriptionStatusBadgeProps) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        meta.badgeClass
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {meta.label}
    </span>
  );
}
