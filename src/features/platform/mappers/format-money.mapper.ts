/**
 * Platform billing currency — USD. This is what a commerce pays the PLATFORM
 * for its subscription, distinct from each restaurant's own `currency` (HNL),
 * which is what the restaurant charges ITS customers for food.
 */
const BILLING_CURRENCY = 'USD';
const BILLING_LOCALE = 'en-US';

/**
 * Formats a platform monetary amount (e.g. a plan's monthly price).
 * Pure function — no side effects.
 *
 *   formatMoney(25) → '$25.00'
 */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat(BILLING_LOCALE, {
    style: 'currency',
    currency: BILLING_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats an epoch-ms timestamp as a short localized date (es-HN).
 *   formatDate(1788000000000) → '29 ago 2026'
 */
export function formatDate(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
