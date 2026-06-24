import type { SubscriptionStatus } from '@/types/subscription';
import type { Plan } from '@/types/plan';

// ─── Usage info ───────────────────────────────────────────────────────────────

/**
 * Usage view-model for a single resource against its plan limit.
 * `max` is null when the plan is unknown — no ceiling is enforced.
 */
export interface UsageInfo {
  used: number;
  max: number | null;
  /** 0–1 fraction, null when max is null */
  fraction: number | null;
  isAtLimit: boolean;
}

// ─── Subscription view-model ─────────────────────────────────────────────────

/**
 * The combined view-model returned by the subscription service.
 * Derived — the service joins Restaurant.subscription + Plan.
 */
export interface SubscriptionViewModel {
  /** The resolved plan (null when the restaurant's planId is unknown). */
  plan: Plan | null;
  status: SubscriptionStatus;
  /** Epoch ms when the current paid period ends/renews. */
  currentPeriodEnd: number;
  /** Usage breakdown for tables and menu items. */
  usage: {
    tables: UsageInfo;
    menuItems: UsageInfo;
  };
}

// ─── Async load state (discriminated union per error-handling.md) ─────────────

export type SubscriptionLoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: SubscriptionViewModel }
  | { status: 'error'; message: string };

// ─── Plan switch dialog state ─────────────────────────────────────────────────

export type PlanSwitchState =
  | { status: 'idle' }
  | { status: 'confirming'; targetPlanId: string }
  | { status: 'switching'; targetPlanId: string }
  | { status: 'success'; planName: string }
  | { status: 'error'; message: string };

// ─── Activate (trialing → active) dialog state ───────────────────────────────

export type ActivateState =
  | { status: 'idle' }
  | { status: 'confirming' }
  | { status: 'activating' }
  | { status: 'success' }
  | { status: 'error'; message: string };
