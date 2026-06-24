/**
 * Dashboard feature constants.
 * All display-only values live here so they are easy to adjust.
 */

/** How many recent orders to show in the recent-orders list. */
export const RECENT_ORDERS_LIMIT = 5 as const;

/**
 * Quick-link tiles rendered below the bento section.
 * href must be a relative path within the dashboard.
 */
export interface QuickLink {
  href: string;
  label: string;
  description: string;
  /** Tailwind bg class for the icon chip */
  chipBg: string;
  /** Tailwind text class for label emphasis */
  accentText: string;
  /** Tailwind from class for bento accent gradient */
  accentFrom: string;
  /** Tailwind to class for bento accent gradient */
  accentTo: string;
}

export const QUICK_LINKS: readonly QuickLink[] = [
  {
    href: '/orders',
    label: 'Órdenes',
    description: 'Ver y gestionar el tablero Kanban',
    chipBg: 'bg-sky-500',
    accentText: 'text-sky-600 dark:text-sky-400',
    accentFrom: 'from-sky-500/10',
    accentTo: 'to-blue-500/5',
  },
  {
    href: '/menu',
    label: 'Menú',
    description: 'Categorías, productos y disponibilidad',
    chipBg: 'bg-violet-500',
    accentText: 'text-violet-600 dark:text-violet-400',
    accentFrom: 'from-violet-500/10',
    accentTo: 'to-purple-500/5',
  },
  {
    href: '/tables',
    label: 'Mesas',
    description: 'Zonas, mesas y códigos QR',
    chipBg: 'bg-amber-500',
    accentText: 'text-amber-600 dark:text-amber-400',
    accentFrom: 'from-amber-500/10',
    accentTo: 'to-orange-500/5',
  },
  {
    href: '/subscription',
    label: 'Suscripción',
    description: 'Plan activo y facturación',
    chipBg: 'bg-emerald-500',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    accentFrom: 'from-emerald-500/10',
    accentTo: 'to-teal-500/5',
  },
] as const;
