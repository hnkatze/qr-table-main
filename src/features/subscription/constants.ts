import type { SubscriptionStatus } from '@/types/subscription';

/** Simulated network latency for mock write operations (ms). */
export const MOCK_WRITE_DELAY_MS = 700;

/**
 * Display metadata per subscription status — label + token-based badge classes.
 * Mirrors SUBSCRIPTION_STATUS_META from platform/constants but lives here so
 * the subscription feature is self-contained (no cross-feature constants import).
 */
export const STATUS_META: Record<
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
} as const;
