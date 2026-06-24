'use client';

import { CheckCircleIcon, AlertCircleIcon, Loader2Icon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { PlanSwitchState } from '@/features/subscription/types';
import type { Plan } from '@/types/plan';

interface PlanSwitchDialogProps {
  state: PlanSwitchState;
  targetPlan: Plan | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

/**
 * Confirm dialog for switching plans (upgrade or downgrade).
 * The parent owns open/closed state via `state.status`.
 * Pure presentational — no internal async state.
 */
export function PlanSwitchDialog({
  state,
  targetPlan,
  onConfirm,
  onCancel,
}: PlanSwitchDialogProps) {
  const isOpen =
    state.status === 'confirming' ||
    state.status === 'switching' ||
    state.status === 'success' ||
    state.status === 'error';

  const isSwitching = state.status === 'switching';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {state.status === 'success' ? 'Plan actualizado' : 'Cambiar de plan'}
          </DialogTitle>
          <DialogDescription>
            {state.status === 'success'
              ? 'El cambio de plan se aplicó correctamente.'
              : targetPlan
              ? `Estás por cambiar tu suscripción al plan ${targetPlan.name} ($${targetPlan.priceMonthly.toFixed(2)} USD/mes).`
              : 'Confirmá el cambio de plan.'}
          </DialogDescription>
        </DialogHeader>

        {/* Success feedback */}
        {state.status === 'success' && (
          <Alert className="border-brand-emerald/30 bg-brand-emerald/10">
            <CheckCircleIcon className="size-4 text-brand-emerald" aria-hidden="true" />
            <AlertTitle className="text-brand-emerald">¡Listo!</AlertTitle>
            <AlertDescription className="text-brand-emerald/80">
              Ahora estás en el plan <strong>{state.planName}</strong>.
            </AlertDescription>
          </Alert>
        )}

        {/* Error feedback */}
        {state.status === 'error' && (
          <Alert variant="destructive">
            <AlertCircleIcon className="size-4" aria-hidden="true" />
            <AlertTitle>Error al cambiar el plan</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        {/* Confirming body */}
        {(state.status === 'confirming' || state.status === 'switching') && targetPlan && (
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
            <p>
              Nuevo plan: <strong>{targetPlan.name}</strong>
            </p>
            <p className="mt-0.5 text-muted-foreground">
              ${targetPlan.priceMonthly.toFixed(2)} USD / mes ·{' '}
              {targetPlan.limits.maxTables} mesas ·{' '}
              {targetPlan.limits.maxMenuItems} productos
            </p>
          </div>
        )}

        {state.status !== 'success' && (
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSwitching}
            >
              Cancelar
            </Button>
            {(state.status === 'confirming' || state.status === 'switching') && (
              <Button
                onClick={onConfirm}
                disabled={isSwitching}
                className="gap-2 bg-brand-sky text-white hover:bg-brand-sky/90 focus-visible:ring-brand-sky/40 disabled:bg-brand-sky/50"
              >
                {isSwitching && (
                  <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
                )}
                {isSwitching ? 'Cambiando…' : 'Confirmar cambio'}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
