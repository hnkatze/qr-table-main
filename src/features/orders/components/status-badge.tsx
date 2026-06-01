'use client';

import { Badge } from '@/components/ui/badge';
import { STATUS_META } from '@/features/orders/constants';
import type { OrderStatus } from '@/types/order';

interface StatusBadgeProps {
  status: OrderStatus;
}

/**
 * Renders a status badge with both text AND color coding.
 *
 * A11y: never color alone — the label text always conveys the state
 * (WCAG 1.4.1 Use of Color). Color is additive reinforcement only.
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, colorBadgeBg, colorBadgeText, colorBadgeBorder } =
    STATUS_META[status];

  return (
    <Badge
      variant="outline"
      className={`${colorBadgeBg} ${colorBadgeText} ${colorBadgeBorder}`}
    >
      {label}
    </Badge>
  );
}
