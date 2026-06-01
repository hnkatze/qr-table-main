import { PRICE_LOCALE } from '@/features/menu/constants';

/**
 * Formats a numeric price with the restaurant's currency code.
 *
 * Examples:
 *   formatPrice(120, 'HNL') → 'L 120.00'
 *   formatPrice(9.5, 'USD') → 'US$ 9.50'
 *
 * Pure function — no side effects.
 */
export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat(PRICE_LOCALE, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}
