'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BentoCard } from '@/components/dashboard/home/bento-card';
import { useRelativeTime } from '@/features/orders/hooks/use-relative-time';
import { formatCurrency } from '@/features/orders/mappers/format-order.mapper';
import type { RecentOrderRow } from '@/features/dashboard/types';
import { cn } from '@/lib/utils';

// ─── Single row — needs its own component to call useRelativeTime per-row ─────

interface OrderRowProps {
  row: RecentOrderRow;
  currency: string;
}

/**
 * Renders one row in the recent-orders table.
 * Must be its own component so useRelativeTime (a hook) can be called per row.
 */
function OrderRow({ row, currency }: OrderRowProps) {
  // useRelativeTime: returns stable absolute time during SSR / first render,
  // then switches to the live relative string after mount — no hydration mismatch.
  const timeLabel = useRelativeTime(row.createdAt);

  return (
    <TableRow className="border-border/30 transition-colors hover:bg-muted/30">
      <TableCell className="font-semibold">Mesa {row.tableNumber}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {row.itemCount} {row.itemCount === 1 ? 'ítem' : 'ítems'}
      </TableCell>
      <TableCell className="text-right font-mono text-sm font-semibold tabular-nums">
        {formatCurrency(row.total, currency)}
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={cn(
            row.statusColorBg,
            row.statusColorText,
            row.statusColorBorder
          )}
        >
          {row.statusLabel}
        </Badge>
      </TableCell>
      <TableCell className="text-right text-xs text-muted-foreground">
        {timeLabel}
      </TableCell>
    </TableRow>
  );
}

// ─── List component ───────────────────────────────────────────────────────────

interface RecentOrdersListProps {
  orders: RecentOrderRow[];
  currency: string;
  delayClass?: string;
}

/**
 * RecentOrdersList — bento block for the dashboard home.
 *
 * Spans 2 columns on lg+, reuses BentoCard for consistent visual treatment.
 * Time labels use useRelativeTime (client-only after mount) — no SSR mismatch.
 * Header links to /orders; status conveyed by text + badge, not color alone.
 */
export function RecentOrdersList({
  orders,
  currency,
  delayClass,
}: RecentOrdersListProps) {
  return (
    <BentoCard
      colSpan="col-span-1 sm:col-span-2 lg:col-span-2"
      accentFrom="from-foreground/[0.02]"
      accentTo="to-transparent"
      delayClass={delayClass}
      ariaLabel="Órdenes recientes"
    >
      <div className="flex flex-col gap-0 p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Órdenes
            </p>
            <h2
              id="recent-orders-heading"
              className="mt-0.5 text-sm font-semibold text-foreground"
            >
              Actividad reciente
            </h2>
          </div>
          <Link
            href="/orders"
            className="rounded-full bg-foreground/5 px-2 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Ver todas las órdenes en el tablero Kanban"
          >
            {orders.length} {orders.length === 1 ? 'orden' : 'órdenes'}
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No hay órdenes recientes.
            </p>
          </div>
        ) : (
          <section
            aria-labelledby="recent-orders-heading"
            className="overflow-x-auto"
          >
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead scope="col" className="text-xs">
                    Mesa
                  </TableHead>
                  <TableHead scope="col" className="text-xs">
                    Ítems
                  </TableHead>
                  <TableHead scope="col" className="text-right text-xs">
                    Total
                  </TableHead>
                  <TableHead scope="col" className="text-xs">
                    Estado
                  </TableHead>
                  <TableHead scope="col" className="text-right text-xs">
                    Hace
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((row) => (
                  <OrderRow key={row.id} row={row} currency={currency} />
                ))}
              </TableBody>
            </Table>
          </section>
        )}
      </div>
    </BentoCard>
  );
}
