import { useState } from 'react';
import type { CommerceDetail, CommerceDetailActionState, ChangePlanDialogState } from '@/features/platform/types';
import type { SubscriptionStatus } from '@/types/subscription';
import {
  getCommerceDetailSnapshot,
  setCommerceStatus,
  setCommercePlan,
} from '@/features/platform/services/platform.service';
import { getPlanById } from '@/lib/mock-data';

export interface UseCommerceDetailOutput {
  /** Full commerce view-model; null only when the id doesn't exist (show not-found). */
  detail: CommerceDetail | null;
  /** State of the in-flight suspend/reactivate action. */
  actionState: CommerceDetailActionState;
  /** State machine for the change-plan dialog. */
  changePlanDialog: ChangePlanDialogState;
  /** Open the change-plan dialog with no plan pre-selected. */
  openChangePlan: () => void;
  /** Update the selected plan id while the dialog is in picking phase. */
  selectPlan: (planId: string) => void;
  /** Advance from picking → confirming. */
  confirmPlan: () => void;
  /** Go back from confirming → picking. */
  backToPicking: () => void;
  /** Close the change-plan dialog from any phase. */
  closeChangePlan: () => void;
  /** Commit the selected plan assignment (confirming → submitting → idle). */
  handleChangePlan: () => Promise<void>;
  /** Suspend this commerce (subscription → 'canceled'). Optimistic. */
  handleSuspend: () => Promise<void>;
  /** Reactivate this commerce (subscription → 'active'). Optimistic. */
  handleReactivate: () => Promise<void>;
}

/**
 * Encapsulates the state for the commerce drill-down page. Seeds synchronously
 * from the service snapshot. All mutations are optimistic with a TODO seam for
 * Firestore.
 *
 * When Firestore lands: replace the seed + service calls with an onSnapshot
 * subscription inside a useEffect — the API surface stays stable.
 */
export function useCommerceDetail(restaurantId: string): UseCommerceDetailOutput {
  const [detail, setDetail] = useState<CommerceDetail | null>(() =>
    getCommerceDetailSnapshot(restaurantId)
  );
  const [actionState, setActionState] = useState<CommerceDetailActionState>({
    status: 'idle',
  });
  const [changePlanDialog, setChangePlanDialog] = useState<ChangePlanDialogState>({
    phase: 'closed',
  });

  // ─── Status mutations ──────────────────────────────────────────────────────

  function applyStatus(status: SubscriptionStatus): void {
    setDetail((prev) =>
      prev
        ? {
            ...prev,
            status,
            restaurant: {
              ...prev.restaurant,
              subscription: { ...prev.restaurant.subscription, status },
            },
          }
        : prev
    );
  }

  async function changeStatus(status: SubscriptionStatus): Promise<void> {
    if (!detail) return;
    applyStatus(status); // optimistic
    setActionState({ status: 'submitting' });
    try {
      await setCommerceStatus(detail.restaurant.id, status);
      setActionState({ status: 'idle' });
    } catch {
      // TODO: roll back optimistic change when Firestore can fail for real.
      setActionState({ status: 'error', message: 'No se pudo actualizar el estado del comercio.' });
    }
  }

  // ─── Change-plan dialog state machine ─────────────────────────────────────

  function openChangePlan(): void {
    const currentPlanId = detail?.restaurant.subscription.planId ?? '';
    setChangePlanDialog({ phase: 'picking', selectedPlanId: currentPlanId });
  }

  function selectPlan(planId: string): void {
    setChangePlanDialog((prev) =>
      prev.phase === 'picking' || prev.phase === 'confirming'
        ? { ...prev, selectedPlanId: planId }
        : prev
    );
  }

  function confirmPlan(): void {
    setChangePlanDialog((prev) =>
      prev.phase === 'picking' ? { phase: 'confirming', selectedPlanId: prev.selectedPlanId } : prev
    );
  }

  function backToPicking(): void {
    setChangePlanDialog((prev) =>
      prev.phase === 'confirming' ? { phase: 'picking', selectedPlanId: prev.selectedPlanId } : prev
    );
  }

  function closeChangePlan(): void {
    setChangePlanDialog({ phase: 'closed' });
  }

  async function handleChangePlan(): Promise<void> {
    if (changePlanDialog.phase !== 'confirming') return;
    const { selectedPlanId } = changePlanDialog;
    setChangePlanDialog({ phase: 'submitting', selectedPlanId });
    try {
      await setCommercePlan(restaurantId, selectedPlanId);
      // Optimistically apply the new plan to the in-memory view-model.
      // The service is a no-op today, so we derive the updated plan here.
      const newPlan = getPlanById(selectedPlanId);
      setDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          plan: newPlan,
          restaurant: {
            ...prev.restaurant,
            subscription: {
              ...prev.restaurant.subscription,
              planId: selectedPlanId,
            },
          },
        };
      });
      setChangePlanDialog({ phase: 'closed' });
    } catch {
      setActionState({ status: 'error', message: 'No se pudo cambiar el plan.' });
      setChangePlanDialog({ phase: 'closed' });
    }
  }

  return {
    detail,
    actionState,
    changePlanDialog,
    openChangePlan,
    selectPlan,
    confirmPlan,
    backToPicking,
    closeChangePlan,
    handleChangePlan,
    handleSuspend: () => changeStatus('canceled'),
    handleReactivate: () => changeStatus('active'),
  };
}
