import { ClipboardListIcon } from 'lucide-react';
import type { OrderStatus } from '@/types/order';
import { STATUS_META } from '@/features/orders/constants';

interface OrdersEmptyStateProps {
  status: OrderStatus;
}

/**
 * Empty state shown in a Kanban column when there are no orders with that status.
 * Pure presentational.
 */
export function OrdersEmptyState({ status }: OrdersEmptyStateProps) {
  const { label } = STATUS_META[status];

  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center"
      role="status"
      aria-label={`Sin órdenes ${label.toLowerCase()}`}
    >
      <ClipboardListIcon
        className="size-8 text-muted-foreground/50"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-muted-foreground">Sin órdenes</p>
      <p className="text-xs text-muted-foreground/70">{label}</p>
    </div>
  );
}
