import type { Order, OrderItem } from '@/types/order';

/**
 * Pure formatting helpers for order display.
 * No state, no side effects — safe to call anywhere.
 */

/**
 * Formats a monetary amount using the restaurant's currency code
 * and the es-HN locale (standard for Honduran restaurants).
 *
 * Example: formatCurrency(250, 'HNL') → "L 250.00"
 */
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Returns a human-readable relative time string from a Unix timestamp (ms).
 *
 * PURE: `now` is passed in (never reads Date.now() internally). This keeps the
 * function deterministic and SSR-safe — the caller (use-relative-time hook)
 * supplies the current time, and only does so AFTER mount on the client, so the
 * value can never differ between server render and client hydration.
 *
 * Uses Intl.RelativeTimeFormat when the gap is under 24 h,
 * otherwise falls back to a readable absolute date.
 */
export function formatRelativeTime(createdAt: number, now: number): string {
  const diffMs = now - createdAt;
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'hace menos de 1 min';
  if (diffMin < 60) {
    const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
    return rtf.format(-diffMin, 'minute');
  }

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) {
    const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
    return rtf.format(-diffHr, 'hour');
  }

  // Fallback to locale date for very old orders
  return new Date(createdAt).toLocaleDateString('es-HN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Returns a stable absolute clock time (es-HN, HH:mm) for a timestamp.
 *
 * Deterministic given a fixed `createdAt` — safe for SSR. Used as the
 * pre-mount fallback in the order card so the card always shows a meaningful
 * time even before the client-only relative string is computed.
 */
export function formatAbsoluteTime(createdAt: number): string {
  return new Date(createdAt).toLocaleTimeString('es-HN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Returns a short summary of the items in an order.
 * E.g. "Baleada especial ×2, Jugo natural ×1"
 * Truncates to the first 2 items and appends "y N más" if needed.
 */
export function formatItemsSummary(items: readonly OrderItem[]): string {
  const MAX_SHOWN = 2;
  const shown = items.slice(0, MAX_SHOWN);
  const rest = items.length - MAX_SHOWN;

  const parts = shown.map((item) =>
    item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name
  );

  if (rest > 0) parts.push(`y ${rest} más`);
  return parts.join(', ');
}

/**
 * Returns the total item count (sum of all quantities) in an order.
 */
export function totalItemCount(order: Order): number {
  return order.items.reduce((acc, item) => acc + item.quantity, 0);
}
