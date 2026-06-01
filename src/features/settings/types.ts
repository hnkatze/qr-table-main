import type { CURRENCY_OPTIONS } from './constants';

// ─── Currency ─────────────────────────────────────────────────────────────────

export type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]['value'];

// ─── Form fields ──────────────────────────────────────────────────────────────

export interface FormFields {
  name: string;
  tagline: string;
  currency: CurrencyCode;
}

// ─── Async save state (discriminated union per error-handling.md) ─────────────

export type SaveState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };
