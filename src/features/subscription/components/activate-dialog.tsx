'use client';

import { CheckCircleIcon, AlertCircleIcon, Loader2Icon, CreditCardIcon } from 'lucide-react';
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
import type { ActivateState } from '@/features/subscription/types';

interface ActivateDialogProps {
  state: ActivateState;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

/**
 * Confirm dialog for activating a trial subscription (trialing → active).
 * Simulates a payment confirmation step.
 * Pure presentational — no internal async state.
 */
export function ActivateDialog({ state, onConfirm, onCancel }: ActivateDialogProps) {
  const isOpen =
    state.status === 'confirming' ||
    state.status === 'activating' ||
    state.status === 'success' ||
    state.status === 'error';

  const isActivating = state.status === 'activating';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {state.status === 'success' ? 'Plan activado' : 'Activar plan'}
          </DialogTitle>
          <DialogDescription>
            {state.status === 'success'
              ? 'Tu suscripción está activa.'
              : 'Confirmá para activar tu suscripción y salir del período de prueba.'}
          </DialogDescription>
        </DialogHeader>

        {/* Success feedback */}
        {state.status === 'success' && (
          <Alert className="border-brand-emerald/30 bg-brand-emerald/10">
            <CheckCircleIcon className="size-4 text-brand-emerald" aria-hidden="true" />
            <AlertTitle className="text-brand-emerald">¡Suscripción activa!</AlertTitle>
            <AlertDescription className="text-brand-emerald/80">
              Tu plan está activo. Ya podés usar todas sus funciones.
            </AlertDescription>
          </Alert>
        )}

        {/* Error feedback */}
        {state.status === 'error' && (
          <Alert variant="destructive">
            <AlertCircleIcon className="size-4" aria-hidden="true" />
            <AlertTitle>Error al activar el plan</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        {/* Confirming body */}
        {(state.status === 'confirming' || state.status === 'activating') && (
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <p>
              Al confirmar, tu período de prueba termina y tu plan queda activo.
            </p>
            <p className="mt-1 text-xs">
              (En producción, este paso activaría el cobro via el proveedor de pago.)
            </p>
          </div>
        )}

        {state.status !== 'success' && (
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isActivating}
            >
              Cancelar
            </Button>
            {(state.status === 'confirming' || state.status === 'activating') && (
              <Button
                onClick={onConfirm}
                disabled={isActivating}
                className="gap-2 bg-brand-emerald text-white hover:bg-brand-emerald/90 focus-visible:ring-brand-emerald/40 disabled:bg-brand-emerald/50"
              >
                {isActivating ? (
                  <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <CreditCardIcon className="size-4" aria-hidden="true" />
                )}
                {isActivating ? 'Activando…' : 'Activar plan'}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
