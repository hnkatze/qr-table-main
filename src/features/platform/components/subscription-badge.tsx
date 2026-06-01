import type { SubscriptionStatus } from '@/types/subscription';
import { SUBSCRIPTION_STATUS_META } from '@/features/platform/constants';
import { cn } from '@/lib/utils';

interface SubscriptionBadgeProps {
  status: SubscriptionStatus;
}

/**
 * Pill showing a subscription status with a token-based color.
 * Color is never the ONLY signal — the text label always states the status.
 */
export function SubscriptionBadge({ status }: SubscriptionBadgeProps) {
  const meta = SUBSCRIPTION_STATUS_META[status];
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
