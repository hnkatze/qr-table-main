'use client';

import { useId } from 'react';
import { CreditCardIcon, CalendarIcon, RefreshCwIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionBadge } from '@/features/platform/components/subscription-badge';
import { formatMoney, formatDate } from '@/features/platform/mappers/format-money.mapper';
import type { CommerceDetail, ChangePlanDialogState } from '@/features/platform/types';
import type { Plan } from '@/types/plan';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CommerceSubscriptionCardProps {
  detail: CommerceDetail;
  /** Full plan catalog so the superadmin can pick from available active plans. */
  availablePlans: Plan[];
  changePlanDialog: ChangePlanDialogState;
  isSubmitting: boolean;
  onOpenChangePlan: () => void;
  onSelectPlan: (planId: string) => void;
  onConfirmPlan: () => void;
  onBackToPicking: () => void;
  onCloseChangePlan: () => void;
  onCommitPlan: () => Promise<void>;
}

// ─── Dialog phases ────────────────────────────────────────────────────────────

interface PickingPhaseProps {
  availablePlans: Plan[];
  selectedPlanId: string;
  onSelectPlan: (planId: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  selectId: string;
}

function PlanPickingContent({
  availablePlans,
  selectedPlanId,
  onSelectPlan,
  onConfirm,
  onClose,
  selectId,
}: PickingPhaseProps) {
  const selectedPlan = availablePlans.find((p) => p.id === selectedPlanId);
  return (
    <>
      <DialogHeader>
        <DialogTitle>Cambiar plan</DialogTitle>
        <DialogDescription>
          Seleccioná el nuevo plan para este comercio. El cambio se aplicará de forma inmediata.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 py-2">
        <label htmlFor={selectId} className="text-sm font-medium text-foreground">
          Plan
        </label>
        <Select value={selectedPlanId} onValueChange={(v) => onSelectPlan(v ?? '')}>
          <SelectTrigger id={selectId} className="w-full h-9">
            <SelectValue placeholder="Elegí un plan" />
          </SelectTrigger>
          <SelectContent>
            {availablePlans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name} — {formatMoney(plan.priceMonthly)}/mes
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedPlan && (
          <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground space-y-1">
            <p>
              <span className="font-medium text-foreground">Mesas:</span> hasta{' '}
              {selectedPlan.limits.maxTables}
            </p>
            <p>
              <span className="font-medium text-foreground">Productos:</span> hasta{' '}
              {selectedPlan.limits.maxMenuItems}
            </p>
            {selectedPlan.description && <p>{selectedPlan.description}</p>}
          </div>
        )}
      </div>

      <DialogFooter>
        <DialogClose
          render={<Button variant="outline" />}
          onClick={onClose}
        >
          Cancelar
        </DialogClose>
        <Button
          onClick={onConfirm}
          disabled={!selectedPlanId}
          className="bg-brand-violet text-white hover:bg-brand-violet/90 focus-visible:ring-brand-violet/40 disabled:bg-brand-violet/50"
        >
          Continuar
        </Button>
      </DialogFooter>
    </>
  );
}

interface ConfirmingPhaseProps {
  planName: string;
  isSubmitting: boolean;
  onBack: () => void;
  onCommit: () => Promise<void>;
}

function PlanConfirmingContent({ planName, isSubmitting, onBack, onCommit }: ConfirmingPhaseProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Confirmar cambio de plan</DialogTitle>
        <DialogDescription>
          ¿Seguro que querés asignar el plan{' '}
          <strong className="font-semibold text-foreground">{planName}</strong> a este comercio?
          Esta acción se aplica de inmediato.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Atrás
        </Button>
        <Button
          onClick={onCommit}
          disabled={isSubmitting}
          className="bg-brand-violet text-white hover:bg-brand-violet/90 focus-visible:ring-brand-violet/40 disabled:bg-brand-violet/50"
        >
          {isSubmitting ? 'Guardando…' : 'Confirmar cambio'}
        </Button>
      </DialogFooter>
    </>
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────

/**
 * Subscription card on the commerce detail page. Shows plan name + price,
 * subscription status, renewal date, and a "change plan" action for the
 * superadmin to assign a different plan.
 */
export function CommerceSubscriptionCard({
  detail,
  availablePlans,
  changePlanDialog,
  isSubmitting,
  onOpenChangePlan,
  onSelectPlan,
  onConfirmPlan,
  onBackToPicking,
  onCloseChangePlan,
  onCommitPlan,
}: CommerceSubscriptionCardProps) {
  const { plan, status, restaurant } = detail;
  const { currentPeriodEnd } = restaurant.subscription;
  const selectId = useId();

  const isDialogOpen = changePlanDialog.phase !== 'closed';
  const selectedPlanId =
    changePlanDialog.phase !== 'closed' ? changePlanDialog.selectedPlanId : '';
  const isConfirming = changePlanDialog.phase === 'confirming' || changePlanDialog.phase === 'submitting';
  const confirmingPlanName =
    isConfirming
      ? (availablePlans.find((p) => p.id === selectedPlanId)?.name ?? selectedPlanId)
      : '';

  return (
    <>
      <Card>
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCardIcon className="size-4 text-brand-violet" aria-hidden="true" />
              Suscripción
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenChangePlan}
              aria-label="Cambiar plan de este comercio"
            >
              <RefreshCwIcon className="size-3.5" aria-hidden="true" />
              Cambiar plan
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Plan name + price */}
          {plan ? (
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-foreground">{plan.name}</span>
              <span className="text-sm text-muted-foreground">
                {formatMoney(plan.priceMonthly)} / mes
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin plan asignado</p>
          )}

          {/* Status + renewal */}
          <div className="flex flex-wrap items-center gap-3">
            <SubscriptionBadge status={status} />
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarIcon className="size-3.5" aria-hidden="true" />
              Vence: {formatDate(currentPeriodEnd)}
            </span>
          </div>

          {/* Plan limits summary */}
          {plan && (
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/60 p-3 text-xs">
              <div>
                <p className="text-muted-foreground">Máx. mesas</p>
                <p className="font-semibold text-foreground">{plan.limits.maxTables}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Máx. productos</p>
                <p className="font-semibold text-foreground">{plan.limits.maxMenuItems}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change-plan dialog — controlled open via isDialogOpen */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) onCloseChangePlan(); }}>
        <DialogContent className="sm:max-w-md">
          {isConfirming ? (
            <PlanConfirmingContent
              planName={confirmingPlanName}
              isSubmitting={isSubmitting}
              onBack={onBackToPicking}
              onCommit={onCommitPlan}
            />
          ) : (
            <PlanPickingContent
              availablePlans={availablePlans}
              selectedPlanId={selectedPlanId}
              onSelectPlan={onSelectPlan}
              onConfirm={onConfirmPlan}
              onClose={onCloseChangePlan}
              selectId={selectId}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
