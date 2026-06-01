// ─── Dialog modes ─────────────────────────────────────────────────────────────

export const DIALOG_MODE = {
  add: 'add',
  edit: 'edit',
} as const;

export type DialogMode = (typeof DIALOG_MODE)[keyof typeof DIALOG_MODE];

// ─── Accent classes per category index (cycles) ───────────────────────────────

export const CATEGORY_ACCENT_CLASSES = [
  'bg-brand-emerald',
  'bg-brand-sky',
  'bg-brand-violet',
  'bg-brand-amber',
] as const;

export type CategoryAccentClass = (typeof CATEGORY_ACCENT_CLASSES)[number];

// ─── Price formatting locale ──────────────────────────────────────────────────

export const PRICE_LOCALE = 'es-HN' as const;

// ─── Mock delay ───────────────────────────────────────────────────────────────

/** Simulated async latency in ms for mock service calls. */
export const MOCK_WRITE_DELAY_MS = 600 as const;
