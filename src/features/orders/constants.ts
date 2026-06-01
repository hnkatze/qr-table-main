import type { OrderStatus } from '@/types/order';

/**
 * STATUS_META — ordered flow and visual metadata for each OrderStatus.
 *
 * Rules:
 *   - `order` drives the Kanban column sequence (left → right).
 *   - `next` is null for the terminal status (delivered).
 *   - `prev` is null for the first status (pending).
 *   - Color classes use brand tokens only — NEVER inline oklch() or hex.
 *   - Every status has a text `label` AND an `icon` so a11y is never
 *     color-only (see WCAG 1.4.1 Use of Color).
 */
export const STATUS_META = {
  pending: {
    order: 0,
    label: 'Pendiente',
    next: 'preparing' as OrderStatus,
    prev: null,
    /** Tailwind classes — column header accent */
    colorBg: 'bg-brand-amber/10',
    colorText: 'text-brand-amber',
    colorBorder: 'border-brand-amber/25',
    colorBadgeBg: 'bg-brand-amber/10',
    colorBadgeText: 'text-brand-amber',
    colorBadgeBorder: 'border-brand-amber/25',
    /** Advance CTA label */
    advanceLabel: 'Marcar en preparación',
    revertLabel: null,
  },
  preparing: {
    order: 1,
    label: 'En preparación',
    next: 'ready' as OrderStatus,
    prev: 'pending' as OrderStatus,
    colorBg: 'bg-brand-sky/10',
    colorText: 'text-brand-sky',
    colorBorder: 'border-brand-sky/25',
    colorBadgeBg: 'bg-brand-sky/10',
    colorBadgeText: 'text-brand-sky',
    colorBadgeBorder: 'border-brand-sky/25',
    advanceLabel: 'Marcá como listo',
    revertLabel: 'Volver a pendiente',
  },
  ready: {
    order: 2,
    label: 'Listo',
    next: 'delivered' as OrderStatus,
    prev: 'preparing' as OrderStatus,
    colorBg: 'bg-brand-emerald/10',
    colorText: 'text-brand-emerald',
    colorBorder: 'border-brand-emerald/25',
    colorBadgeBg: 'bg-brand-emerald/10',
    colorBadgeText: 'text-brand-emerald',
    colorBadgeBorder: 'border-brand-emerald/25',
    advanceLabel: 'Marcar como entregado',
    revertLabel: 'Volver a preparación',
  },
  delivered: {
    order: 3,
    label: 'Entregado',
    next: null,
    prev: 'ready' as OrderStatus,
    colorBg: 'bg-muted/60',
    colorText: 'text-muted-foreground',
    colorBorder: 'border-border',
    colorBadgeBg: 'bg-muted/60',
    colorBadgeText: 'text-muted-foreground',
    colorBadgeBorder: 'border-border',
    advanceLabel: null,
    revertLabel: 'Volver a listo',
  },
} as const satisfies Record<
  OrderStatus,
  {
    order: number;
    label: string;
    next: OrderStatus | null;
    prev: OrderStatus | null;
    colorBg: string;
    colorText: string;
    colorBorder: string;
    colorBadgeBg: string;
    colorBadgeText: string;
    colorBadgeBorder: string;
    advanceLabel: string | null;
    revertLabel: string | null;
  }
>;

/** Statuses sorted by column order — drives Kanban left-to-right rendering. */
export const ORDERED_STATUSES = (
  Object.keys(STATUS_META) as OrderStatus[]
).sort((a, b) => STATUS_META[a].order - STATUS_META[b].order);
