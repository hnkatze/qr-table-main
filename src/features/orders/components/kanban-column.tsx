'use client';

import { OrderCard } from '@/features/orders/components/order-card';
import { OrdersEmptyState } from '@/features/orders/components/orders-empty-state';
import { STATUS_META } from '@/features/orders/constants';
import type { Order, OrderStatus } from '@/types/order';

// ─── Props ────────────────────────────────────────────────────────────────────

interface KanbanColumnProps {
  status: OrderStatus;
  orders: Order[];
  currency: string;
  onAdvance: (orderId: string) => void;
  onRevert: (orderId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * A single Kanban column for one OrderStatus.
 *
 * Layout:
 *   - Sticky header: colored accent bar + status label + order count badge
 *   - Scrollable card list (or empty state when zero orders)
 *
 * A11y:
 *   - `<section>` with aria-label makes each column a landmark
 *   - Count displayed as text, not just a visual badge
 *   - Card list has role="list" so screen readers announce item count
 */
export function KanbanColumn({
  status,
  orders,
  currency,
  onAdvance,
  onRevert,
}: KanbanColumnProps) {
  const { label, colorText, colorBg, colorBorder } = STATUS_META[status];
  const count = orders.length;

  return (
    <section
      aria-label={`Columna ${label} — ${count} ${count === 1 ? 'orden' : 'órdenes'}`}
      className="flex min-h-0 flex-col gap-3"
    >
      {/* ── Column header ────────────────────────────────────────────── */}
      <div
        className={`flex items-center justify-between rounded-lg border px-3 py-2 ${colorBg} ${colorBorder}`}
      >
        <h2 className={`text-sm font-semibold ${colorText}`}>{label}</h2>
        <span
          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${colorBg} ${colorText} ring-1 ${colorBorder}`}
          aria-label={`${count} ${count === 1 ? 'orden' : 'órdenes'}`}
        >
          {count}
        </span>
      </div>

      {/* ── Card list ────────────────────────────────────────────────── */}
      {count === 0 ? (
        <OrdersEmptyState status={status} />
      ) : (
        <ul
          role="list"
          aria-label={`Órdenes ${label.toLowerCase()}`}
          className="flex flex-col gap-3"
        >
          {orders.map((order) => (
            <li key={order.id}>
              <OrderCard
                order={order}
                currency={currency}
                onAdvance={onAdvance}
                onRevert={onRevert}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
