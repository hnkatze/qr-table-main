import type { SubscriptionStatus } from '@/types/subscription';

/** Simulated network latency for mock write operations (ms). */
export const MOCK_WRITE_DELAY_MS = 400;

/** Dialog open/close + create/edit discriminator for the plan dialog. */
export const DIALOG_MODE = {
  CLOSED: 'closed',
  CREATE: 'create',
  EDIT: 'edit',
} as const;

export type DialogMode = (typeof DIALOG_MODE)[keyof typeof DIALOG_MODE];

/**
 * Display metadata per subscription status — label + token-based badge classes.
 * Colors reference the shared brand palette (never inline oklch/hex).
 */
export const SUBSCRIPTION_STATUS_META: Record<
  SubscriptionStatus,
  { label: string; badgeClass: string }
> = {
  active: {
    label: 'Activa',
    badgeClass: 'bg-brand-emerald/10 text-brand-emerald ring-brand-emerald/20',
  },
  trialing: {
    label: 'En prueba',
    badgeClass: 'bg-brand-sky/10 text-brand-sky ring-brand-sky/20',
  },
  past_due: {
    label: 'Pago vencido',
    badgeClass: 'bg-brand-amber/10 text-brand-amber ring-brand-amber/20',
  },
  canceled: {
    label: 'Cancelada',
    badgeClass: 'bg-muted text-muted-foreground ring-border',
  },
};
