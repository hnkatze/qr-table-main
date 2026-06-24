'use client';

import { useState } from 'react';
import { BanIcon, RotateCcwIcon, AlertTriangleIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SubscriptionStatus } from '@/types/subscription';
import type { CommerceDetailActionState } from '@/features/platform/types';

interface CommerceDangerZoneProps {
  restaurantName: string;
  status: SubscriptionStatus;
  actionState: CommerceDetailActionState;
  onSuspend: () => Promise<void>;
  onReactivate: () => Promise<void>;
}

type PendingAction = 'suspend' | 'reactivate' | null;

/**
 * Danger zone section for the commerce detail page.
 * Suspend / reactivate with a confirmation dialog before committing.
 */
export function CommerceDangerZone({
  restaurantName,
  status,
  actionState,
  onSuspend,
  onReactivate,
}: CommerceDangerZoneProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const isCanceled = status === 'canceled';
  const isSubmitting = actionState.status === 'submitting';

  async function handleConfirm(): Promise<void> {
    if (pendingAction === 'suspend') await onSuspend();
    else if (pendingAction === 'reactivate') await onReactivate();
    setPendingAction(null);
  }

  const dialogTitle = pendingAction === 'suspend' ? 'Suspender comercio' : 'Reactivar comercio';
  const dialogDescription =
    pendingAction === 'suspend'
      ? `¿Seguro que querés suspender "${restaurantName}"? El comercio perderá acceso a la plataforma.`
      : `¿Querés reactivar "${restaurantName}"? El comercio recuperará acceso de inmediato.`;

  return (
    <>
      <Card className="border-destructive/30">
        <CardHeader className="border-b border-destructive/20 pb-3">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangleIcon className="size-4" aria-hidden="true" />
            Zona de riesgo
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Las siguientes acciones afectan directamente el acceso de este comercio a la plataforma.
          </p>

          {actionState.status === 'error' && (
            <p role="alert" className="text-xs text-destructive">
              {actionState.message}
            </p>
          )}

          {isCanceled ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPendingAction('reactivate')}
              disabled={isSubmitting}
              aria-label={`Reactivar comercio ${restaurantName}`}
              className="gap-1.5 border-brand-emerald/40 text-brand-emerald hover:bg-brand-emerald/10 focus-visible:ring-brand-emerald/40"
            >
              <RotateCcwIcon className="size-3.5" aria-hidden="true" />
              Reactivar comercio
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setPendingAction('suspend')}
              disabled={isSubmitting}
              aria-label={`Suspender comercio ${restaurantName}`}
            >
              <BanIcon className="size-3.5" aria-hidden="true" />
              Suspender comercio
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Confirmation dialog */}
      <Dialog
        open={pendingAction !== null}
        onOpenChange={(open) => { if (!open) setPendingAction(null); }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" disabled={isSubmitting} />}
            >
              Cancelar
            </DialogClose>
            <Button
              variant={pendingAction === 'suspend' ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={isSubmitting}
              className={
                pendingAction === 'reactivate'
                  ? 'bg-brand-emerald text-white hover:bg-brand-emerald/90 focus-visible:ring-brand-emerald/40'
                  : undefined
              }
            >
              {isSubmitting
                ? 'Procesando…'
                : pendingAction === 'suspend'
                  ? 'Sí, suspender'
                  : 'Sí, reactivar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
