'use client';

import { LockIcon } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CurrentPlanCard } from './current-plan-card';
import { PlanCatalogSection } from './plan-catalog-section';
import { PlanSwitchDialog } from './plan-switch-dialog';
import { ActivateDialog } from './activate-dialog';
import { SubscriptionStatusBanner } from './subscription-status-banner';
import { useSubscription } from '@/features/subscription/hooks/use-subscription';
import { getPlanById } from '@/lib/mock-data';
import type { Restaurant } from '@/types/restaurant';

interface SubscriptionPanelProps {
  restaurant: Restaurant;
  isOwner: boolean;
}

/**
 * The main subscription panel — wires the hook to all presentational
 * sub-components. "Smart" in the sense that it owns the hook; all rendering
 * logic delegates to the pure presentational components.
 *
 * Mounted only when `activeRestaurant` is non-null (the page guarantees this).
 */
export function SubscriptionPanel({ restaurant, isOwner }: SubscriptionPanelProps) {
  const {
    loadState,
    availablePlans,
    planSwitchState,
    activateState,
    startPlanSwitch,
    cancelPlanSwitch,
    confirmPlanSwitch,
    startActivate,
    cancelActivate,
    confirmActivate,
  } = useSubscription({ restaurant });

  // Should never happen (service seeds synchronously) but handle defensively.
  if (loadState.status === 'loading' || loadState.status === 'idle') {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        Cargando suscripción…
      </div>
    );
  }

  if (loadState.status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error al cargar la suscripción</AlertTitle>
        <AlertDescription>{loadState.message}</AlertDescription>
      </Alert>
    );
  }

  const { data: vm } = loadState;
  const currentPlanId = vm.plan?.id ?? null;
  const isSwitching = planSwitchState.status === 'switching';

  // Resolve the target plan for the switch dialog label.
  const targetPlan =
    planSwitchState.status === 'confirming' || planSwitchState.status === 'switching'
      ? getPlanById(planSwitchState.targetPlanId)
      : planSwitchState.status === 'success'
      ? null
      : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Staff read-only notice */}
      {!isOwner && (
        <Alert className="border-border bg-muted/40">
          <LockIcon aria-hidden="true" className="size-4 text-muted-foreground" />
          <AlertTitle>Solo lectura</AlertTitle>
          <AlertDescription>
            Solo los propietarios pueden cambiar el plan. Estás viendo la
            información en modo de solo lectura.
          </AlertDescription>
        </Alert>
      )}

      {/* Status banners (trialing CTA, past_due warning, canceled) */}
      <SubscriptionStatusBanner
        status={vm.status}
        activateState={activateState}
        isOwner={isOwner}
        onActivate={startActivate}
      />

      {/* Current plan + usage */}
      <CurrentPlanCard vm={vm} />

      {/* Plan catalog — visible to owners regardless of status.
          For canceled: lets them reactivate by selecting a plan.
          For trialing/active/past_due: lets them upgrade or downgrade. */}
      {isOwner && (
        <PlanCatalogSection
          plans={availablePlans}
          currentPlanId={currentPlanId}
          isSwitching={isSwitching}
          onSelectPlan={startPlanSwitch}
        />
      )}

      {/* Dialogs — always rendered, open state driven by hook state */}
      <PlanSwitchDialog
        state={planSwitchState}
        targetPlan={targetPlan}
        onConfirm={confirmPlanSwitch}
        onCancel={cancelPlanSwitch}
      />

      <ActivateDialog
        state={activateState}
        onConfirm={confirmActivate}
        onCancel={cancelActivate}
      />
    </div>
  );
}
