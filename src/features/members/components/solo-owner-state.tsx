import { Users2Icon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface SoloOwnerStateProps {
  restaurantName: string;
  canInvite: boolean;
  onInviteOpen?: () => void;
}

/**
 * Empty state shown when the current user is the only member of the restaurant.
 * Pure presentational — all data flows in through props.
 */
export function SoloOwnerState({ restaurantName, canInvite, onInviteOpen }: SoloOwnerStateProps) {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <div className="flex justify-center mb-3">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-emerald/10 ring-1 ring-brand-emerald/25">
            <Users2Icon className="size-6 text-brand-emerald" aria-hidden="true" />
          </span>
        </div>
        <CardTitle className="text-center">Sos el único miembro</CardTitle>
        <CardDescription className="text-center">
          {canInvite
            ? `Invitá a tu equipo para que puedan gestionar ${restaurantName} con vos.`
            : `Todavía no hay más miembros en ${restaurantName}.`}
        </CardDescription>
      </CardHeader>
      {canInvite && onInviteOpen && (
        <CardContent className="flex justify-center pb-5">
          <button
            type="button"
            onClick={onInviteOpen}
            className="text-sm font-medium text-brand-emerald underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald/40 rounded"
          >
            Invitar al primer miembro
          </button>
        </CardContent>
      )}
    </Card>
  );
}
