'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BentoCard } from '@/components/dashboard/home/bento-card';
import type { StatusCount } from '@/features/dashboard/types';

interface StatusBreakdownProps {
  breakdown: StatusCount[];
  delayClass?: string;
}

/**
 * StatusBreakdown — bento block showing order counts per Kanban status.
 *
 * Each pill links to /orders so the user can jump directly to the board.
 * Both color and text convey status — never color alone (WCAG 1.4.1).
 */
export function StatusBreakdown({ breakdown, delayClass }: StatusBreakdownProps) {
  const totalOrders = breakdown.reduce((sum, s) => sum + s.count, 0);
  // Only show statuses with at least one order (cleaner than showing zeros)
  const active = breakdown.filter((s) => s.count > 0);

  return (
    <BentoCard
      colSpan="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2"
      accentFrom="from-foreground/[0.02]"
      accentTo="to-transparent"
      delayClass={delayClass}
      ariaLabel="Resumen de órdenes por estado"
    >
      <div className="flex flex-col gap-4 p-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Órdenes
            </p>
            <h2 className="mt-0.5 text-sm font-semibold text-foreground">
              Estado del tablero
            </h2>
          </div>
          <Link
            href="/orders"
            className="rounded-full bg-foreground/5 px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Ver tablero completo de órdenes"
          >
            Ver tablero →
          </Link>
        </div>

        {totalOrders === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No hay órdenes activas.
          </p>
        ) : (
          <ul
            className="flex flex-wrap gap-2"
            aria-label="Conteo de órdenes por estado"
          >
            {active.map((s) => (
              <li key={s.status}>
                <Link
                  href="/orders"
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5',
                    'text-sm font-semibold transition-opacity hover:opacity-80',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    s.colorBg,
                    s.colorText,
                    s.colorBorder
                  )}
                  aria-label={`${s.label}: ${s.count} ${s.count === 1 ? 'orden' : 'órdenes'}. Ir al tablero.`}
                >
                  {/* Large count — easy to scan */}
                  <span className="text-base font-bold tabular-nums">
                    {s.count}
                  </span>
                  {/* Text label — a11y: status conveyed by text, not color alone */}
                  <span className="text-xs">{s.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BentoCard>
  );
}
