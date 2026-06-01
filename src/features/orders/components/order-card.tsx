'use client';

import {
  ClockIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  UtensilsIcon,
  UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/features/orders/components/status-badge';
import { STATUS_META } from '@/features/orders/constants';
import {
  formatCurrency,
  formatItemsSummary,
  totalItemCount,
} from '@/features/orders/mappers/format-order.mapper';
import { useRelativeTime } from '@/features/orders/hooks/use-relative-time';
import type { Order } from '@/types/order';

// ─── Props ────────────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: Order;
  currency: string;
  onAdvance: (orderId: string) => void;
  onRevert: (orderId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Kanban card for a single Order.
 *
 * Layout:
 *   - Header: Mesa # + StatusBadge (text + color — a11y safe)
 *   - Body: customer name?, items summary, total (Intl.NumberFormat), relative time
 *   - Footer: advance CTA (primary) + optional revert link (subtle)
 *
 * Pure presentational — all data derived from props.
 * Formatting (currency, time, items summary) lives in mappers, not here.
 *
 * A11y:
 *   - Buttons have descriptive aria-label (includes table number + action)
 *   - Time uses <time> element with dateTime attribute
 *   - Status conveyed by text label AND color (never color alone)
 */
export function OrderCard({ order, currency, onAdvance, onRevert }: OrderCardProps) {
  const meta = STATUS_META[order.status];
  const itemCount = totalItemCount(order);
  const itemsSummary = formatItemsSummary(order.items);
  // Client-only: stable absolute time during SSR/first render, live relative
  // string after mount. Prevents the hydration mismatch (see use-relative-time).
  const relativeTime = useRelativeTime(order.createdAt);
  const formattedTotal = formatCurrency(order.total, currency);
  const createdAtIso = new Date(order.createdAt).toISOString();

  return (
    <article
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-shadow duration-200 hover:shadow-sm"
      aria-label={`Orden mesa ${order.tableNumber}, estado: ${meta.label}`}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-foreground leading-none">
            Mesa {order.tableNumber}
          </span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        {/* Customer name (optional) */}
        {order.customerName && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <UserIcon className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{order.customerName}</span>
          </p>
        )}

        {/* Items summary */}
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <UtensilsIcon className="size-3 shrink-0 mt-px" aria-hidden="true" />
          <span className="line-clamp-2">
            {itemsSummary}
          </span>
        </p>

        {/* Item count + total */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="text-xs text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'ítem' : 'ítems'}
          </span>
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {formattedTotal}
          </span>
        </div>

        {/* Relative time */}
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <ClockIcon className="size-3 shrink-0" aria-hidden="true" />
          {/* suppressHydrationWarning: the text is intentionally time-dependent
              and client-only (see useRelativeTime). The dateTime attribute is
              fully deterministic, so a11y/SEO still get a stable machine value. */}
          <time dateTime={createdAtIso} suppressHydrationWarning>
            {relativeTime}
          </time>
        </p>
      </div>

      {/* ── Actions ────────────────────────────────────────────────────── */}
      {(meta.advanceLabel ?? meta.revertLabel) && (
        <div className="flex flex-col gap-1.5 border-t border-border pt-3">
          {/* Primary action: advance to next status */}
          {meta.advanceLabel && (
            <Button
              size="sm"
              className="w-full justify-between"
              onClick={() => onAdvance(order.id)}
              aria-label={`${meta.advanceLabel} — Mesa ${order.tableNumber}`}
            >
              {meta.advanceLabel}
              <ChevronRightIcon aria-hidden="true" />
            </Button>
          )}

          {/* Secondary action: revert to previous status (subtle) */}
          {meta.revertLabel && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-muted-foreground hover:text-foreground"
              onClick={() => onRevert(order.id)}
              aria-label={`${meta.revertLabel} — Mesa ${order.tableNumber}`}
            >
              <ChevronLeftIcon aria-hidden="true" />
              {meta.revertLabel}
            </Button>
          )}
        </div>
      )}
    </article>
  );
}
