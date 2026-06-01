import { CURRENCY_OPTIONS } from '../constants';
import type { FormFields, CurrencyCode } from '../types';
import type { Restaurant } from '@/types/restaurant';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCY_OPTIONS.some((opt) => opt.value === value);
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

/**
 * Maps a Restaurant domain object to the flat form fields shape.
 * Pure — no side-effects, no state.
 */
export function restaurantToFormFields(restaurant: Restaurant): FormFields {
  return {
    name: restaurant.name,
    tagline: restaurant.tagline ?? '',
    currency: isCurrencyCode(restaurant.currency) ? restaurant.currency : 'HNL',
  };
}
