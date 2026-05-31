'use client';

import type { Order, OrderStatus } from '@/types/order';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BentoCard } from './bento-card';

// ─── Status display map ───────────────────────────────────────────────────────

interface StatusMeta {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  /** Additional classes — colour is NEVER the sole differentiator (text label is always present) */
  className: string;
  /** Dot indicator colour class */
  dotClass: string;
}

const STATUS_META: Record<OrderStatus, StatusMeta> = {
  pending: {
    label: 'Pendiente',
    variant: 'outline',
    className:
      'border-amber-400/40 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    dotClass: 'bg-amber-400',
  },
  preparing: {
    label: 'Preparando',
    variant: 'outline',
    className:
      'border-blue-400/40 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    dotClass: 'bg-blue-400',
  },
  ready: {
    label: 'Lista',
    variant: 'outline',
    className:
      'border-emerald-400/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
    dotClass: 'bg-emerald-400',
  },
  delivered: {
    label: 'Entregada',
    variant: 'secondary',
    className: '',
    dotClass: 'bg-muted-foreground/40',
  },
};

// ─── Currency formatter ───────────────────────────────────────────────────────

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

// ─── Relative time ────────────────────────────────────────────────────────────

function relativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHr = Math.floor(diffMin / 60);
  return `Hace ${diffHr} h`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface RecentOrdersProps {
  orders: readonly Order[];
  currency: string;
  delayClass?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * RecentOrders — prominent bento block spanning 2 columns on lg+.
 * Keeps the table layout with status badges (text + colour — a11y compliant).
 * Adds a relative-time column and a dot indicator for quick scanning.
 */
export function RecentOrders({ orders, currency, delayClass }: RecentOrdersProps) {
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
          <span className="rounded-full bg-foreground/5 px-2 py-1 text-xs font-semibold text-muted-foreground">
            {orders.length} {orders.length === 1 ? 'orden' : 'órdenes'}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No hay órdenes recientes.
            </p>
          </div>
        ) : (
          <section aria-labelledby="recent-orders-heading" className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead scope="col" className="text-xs">Mesa</TableHead>
                  <TableHead scope="col" className="text-xs">Ítems</TableHead>
                  <TableHead scope="col" className="text-right text-xs">Total</TableHead>
                  <TableHead scope="col" className="text-xs">Estado</TableHead>
                  <TableHead scope="col" className="text-right text-xs">Hace</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const meta = STATUS_META[order.status];
                  const itemCount = order.items.reduce(
                    (acc, item) => acc + item.quantity,
                    0
                  );
                  return (
                    <TableRow
                      key={order.id}
                      className="border-border/30 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-semibold">
                        <div className="flex items-center gap-2">
                          {/* Dot indicator — colour is supplementary (text label also present) */}
                          <span
                            aria-hidden="true"
                            className={`size-2 shrink-0 rounded-full ${meta.dotClass}`}
                          />
                          Mesa {order.tableNumber}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {itemCount} {itemCount === 1 ? 'ítem' : 'ítems'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold tabular-nums">
                        {formatCurrency(order.total, currency)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={meta.variant}
                          className={meta.className}
                        >
                          {meta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {relativeTime(order.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </section>
        )}
      </div>
    </BentoCard>
  );
}
