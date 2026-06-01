'use client';

import { KanbanColumn } from '@/features/orders/components/kanban-column';
import type { OrdersByStatus } from '@/features/orders/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface OrdersBoardProps {
  columns: OrdersByStatus[];
  currency: string;
  onAdvance: (orderId: string) => void;
  onRevert: (orderId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Kanban board — renders all status columns side by side on desktop,
 * stacked vertically on mobile.
 *
 * Responsive strategy:
 *   - Mobile (< md): single column, vertical stack — each section stacks.
 *   - md+: four-column grid, each column scrolls independently.
 *
 * Layout is 100% Tailwind — no inline styles, no CSS files.
 *
 * A11y:
 *   - Outer element is `<main>` to anchor the page landmark.
 *   - Each KanbanColumn is a `<section>` with aria-label.
 *   - Horizontal scroll region has aria-label for screen readers.
 */
export function OrdersBoard({
  columns,
  currency,
  onAdvance,
  onRevert,
}: OrdersBoardProps) {
  return (
    <div
      aria-label="Tablero de órdenes Kanban"
      className={[
        // Mobile: single column vertical stack
        'flex flex-col gap-6',
        // md+: horizontal grid with independent column scroll
        'md:grid md:grid-cols-4 md:gap-4 md:items-start',
      ].join(' ')}
    >
      {columns.map(({ status, orders }) => (
        <KanbanColumn
          key={status}
          status={status}
          orders={orders}
          currency={currency}
          onAdvance={onAdvance}
          onRevert={onRevert}
        />
      ))}
    </div>
  );
}
