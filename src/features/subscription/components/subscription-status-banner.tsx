import { AlertTriangleIcon, XCircleIcon, Loader2Icon, CreditCardIcon } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { SubscriptionStatus } from '@/types/subscription';
import type { ActivateState } from '@/features/subscription/types';

interface SubscriptionStatusBannerProps {
  status: SubscriptionStatus;
  activateState: ActivateState;
  isOwner: boolean;
  onActivate: () => void;
}

/**
 * Contextual banner shown when the subscription requires attention.
 * Renders nothing for `active` status — no noise when everything is fine.
 * Pure presentational.
 */
export function SubscriptionStatusBanner({
  status,
  activateState,
  isOwner,
  onActivate,
}: SubscriptionStatusBannerProps) {
  if (status === 'active') return null;

  if (status === 'trialing') {
    const isActivating = activateState.status === 'activating';
    return (
      <Alert className="border-brand-sky/30 bg-brand-sky/5">
        <CreditCardIcon className="size-4 text-brand-sky" aria-hidden="true" />
        <AlertTitle className="text-brand-sky">Período de prueba activo</AlertTitle>
        <AlertDescription className="text-brand-sky/80">
          Estás usando Mesa en modo de prueba. Activá tu plan para mantener el
          acceso cuando venza el período gratuito.
          {isOwner && (
            <Button
              size="sm"
              onClick={onActivate}
              disabled={isActivating}
              className="mt-3 flex gap-2 bg-brand-sky text-white hover:bg-brand-sky/90 focus-visible:ring-brand-sky/40 disabled:bg-brand-sky/50"
            >
              {isActivating && (
                <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
              )}
              {isActivating ? 'Activando…' : 'Activar plan'}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'past_due') {
    return (
      <Alert className="border-brand-amber/30 bg-brand-amber/5">
        <AlertTriangleIcon className="size-4 text-brand-amber" aria-hidden="true" />
        <AlertTitle className="text-brand-amber">Pago vencido</AlertTitle>
        <AlertDescription className="text-brand-amber/80">
          Tu último pago no pudo procesarse. Actualizá tu método de pago para
          evitar la suspensión del servicio.
          {isOwner && (
            <p className="mt-1.5 text-xs">
              Contactá a soporte o actualizá tu forma de pago para regularizar la
              situación.
            </p>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'canceled') {
    return (
      <Alert className="border-destructive/30 bg-destructive/5">
        <XCircleIcon className="size-4 text-destructive" aria-hidden="true" />
        <AlertTitle className="text-destructive">Suscripción cancelada</AlertTitle>
        <AlertDescription className="text-destructive/80">
          Tu suscripción fue cancelada. Podés seguir usando el servicio hasta que
          venza el período pagado, luego el acceso se suspenderá. Seleccioná un
          plan a continuación para reactivar tu cuenta.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
