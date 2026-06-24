import { useState } from 'react';
import type { Restaurant } from '@/types/restaurant';
import type { Plan } from '@/types/plan';
import type {
  SubscriptionViewModel,
  SubscriptionLoadState,
  PlanSwitchState,
  ActivateState,
} from '@/features/subscription/types';
import {
  getSubscriptionSnapshot,
  switchPlan,
  activateSubscription,
} from '@/features/subscription/services/subscription.service';
import { getPlanById, MOCK_PLANS } from '@/lib/mock-data';

// ─── Input / Output ───────────────────────────────────────────────────────────

interface UseSubscriptionInput {
  restaurant: Restaurant | null;
}

export interface UseSubscriptionOutput {
  /** Async load state for the subscription view-model. */
  loadState: SubscriptionLoadState;
  /** Active plans available to switch to (excludes archived). */
  availablePlans: Plan[];
  /** State machine for the plan-switch confirm dialog. */
  planSwitchState: PlanSwitchState;
  /** State machine for the activate (trialing → active) dialog. */
  activateState: ActivateState;

  // ── Actions ──────────────────────────────────────────────────────────────────

  /** Open the confirm dialog for a plan switch. */
  startPlanSwitch: (targetPlanId: string) => void;
  /** Cancel and close the plan-switch dialog. */
  cancelPlanSwitch: () => void;
  /** Confirm the plan switch — calls the service, updates local state. */
  confirmPlanSwitch: () => Promise<void>;

  /** Open the confirm dialog for activating the trial. */
  startActivate: () => void;
  /** Cancel and close the activate dialog. */
  cancelActivate: () => void;
  /** Confirm activation — calls the service, transitions trialing → active. */
  confirmActivate: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Encapsulates all subscription-feature state for the active restaurant:
 *   - loadState: the view-model seeded synchronously (no loading flash on first paint)
 *   - restaurant-change sync: render-phase pattern (same as use-tables.ts)
 *   - planSwitchState / activateState: discriminated-union state machines
 *   - handlers: plan switch + trial activation (both optimistic + service call)
 *
 * The page is a thin consumer; all business logic lives here.
 */
export function useSubscription({ restaurant }: UseSubscriptionInput): UseSubscriptionOutput {
  // Seed synchronously so there is no loading flash on first paint.
  const [loadState, setLoadState] = useState<SubscriptionLoadState>(() => {
    if (!restaurant) return { status: 'idle' };
    return {
      status: 'success',
      data: getSubscriptionSnapshot(restaurant),
    };
  });

  // Render-phase sync: when restaurant changes, re-derive immediately.
  const [lastRestaurantId, setLastRestaurantId] = useState<string | null>(
    restaurant?.id ?? null
  );
  if ((restaurant?.id ?? null) !== lastRestaurantId) {
    setLastRestaurantId(restaurant?.id ?? null);
    if (!restaurant) {
      setLoadState({ status: 'idle' });
    } else {
      setLoadState({ status: 'success', data: getSubscriptionSnapshot(restaurant) });
    }
  }

  const [planSwitchState, setPlanSwitchState] = useState<PlanSwitchState>({ status: 'idle' });
  const [activateState, setActivateState] = useState<ActivateState>({ status: 'idle' });

  // ── Plan switch ─────────────────────────────────────────────────────────────

  function startPlanSwitch(targetPlanId: string): void {
    setPlanSwitchState({ status: 'confirming', targetPlanId });
  }

  function cancelPlanSwitch(): void {
    setPlanSwitchState({ status: 'idle' });
  }

  async function confirmPlanSwitch(): Promise<void> {
    if (!restaurant || planSwitchState.status !== 'confirming') return;
    const { targetPlanId } = planSwitchState;
    const targetPlan = getPlanById(targetPlanId);
    if (!targetPlan) return;

    setPlanSwitchState({ status: 'switching', targetPlanId });

    try {
      await switchPlan(restaurant.id, targetPlanId);

      // Optimistic: refresh the view-model from the updated in-memory store.
      setLoadState({ status: 'success', data: getSubscriptionSnapshot(restaurant) });
      setPlanSwitchState({ status: 'success', planName: targetPlan.name });

      // Auto-dismiss after 3 s so the success state doesn't linger.
      window.setTimeout(() => {
        setPlanSwitchState({ status: 'idle' });
      }, 3_000);
    } catch {
      setPlanSwitchState({
        status: 'error',
        message: 'No se pudo cambiar el plan. Revisá tu conexión e intentá de nuevo.',
      });
    }
  }

  // ── Activate trial ──────────────────────────────────────────────────────────

  function startActivate(): void {
    setActivateState({ status: 'confirming' });
  }

  function cancelActivate(): void {
    setActivateState({ status: 'idle' });
  }

  async function confirmActivate(): Promise<void> {
    if (!restaurant || activateState.status !== 'confirming') return;

    setActivateState({ status: 'activating' });

    try {
      await activateSubscription(restaurant.id);

      // Optimistic: refresh the view-model so the status badge flips immediately.
      setLoadState({ status: 'success', data: getSubscriptionSnapshot(restaurant) });
      setActivateState({ status: 'success' });

      window.setTimeout(() => {
        setActivateState({ status: 'idle' });
      }, 3_000);
    } catch {
      setActivateState({
        status: 'error',
        message: 'No se pudo activar el plan. Revisá tu conexión e intentá de nuevo.',
      });
    }
  }

  // ── Available plans ─────────────────────────────────────────────────────────

  const availablePlans = MOCK_PLANS.filter((p) => p.isActive).sort(
    (a, b) => a.priceMonthly - b.priceMonthly
  );

  // ── Derived view-model for convenience ─────────────────────────────────────

  const currentData: SubscriptionViewModel | null =
    loadState.status === 'success' ? loadState.data : null;

  return {
    loadState: currentData
      ? { status: 'success', data: currentData }
      : loadState,
    availablePlans,
    planSwitchState,
    activateState,
    startPlanSwitch,
    cancelPlanSwitch,
    confirmPlanSwitch,
    startActivate,
    cancelActivate,
    confirmActivate,
  };
}
