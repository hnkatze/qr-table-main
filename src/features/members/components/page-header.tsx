import { InviteMemberDialog } from '@/features/members/components/invite-member-dialog';
import type { Role } from '@/features/members/types';

interface PageHeaderProps {
  restaurantName: string | null;
  isOwner: boolean;
  onInvite: (email: string, role: Role) => void;
}

/**
 * Page-level header for the /users route.
 * Eyebrow + title + description + conditional invite button.
 * Pure presentational — all interactivity delegated to onInvite callback.
 */
export function PageHeader({ restaurantName, isOwner, onInvite }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        {/* Eyebrow — matches bento dashboard visual language */}
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand-emerald">
          <span
            className="inline-block h-1.5 w-4 rounded-full bg-brand-emerald"
            aria-hidden="true"
          />
          {restaurantName ?? 'Restaurante'}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Miembros
        </h1>
        <p className="text-sm text-muted-foreground">
          {restaurantName
            ? `Personas con acceso al panel de ${restaurantName}.`
            : 'Seleccioná un restaurante para ver sus miembros.'}
        </p>
      </div>

      {isOwner && restaurantName && (
        <InviteMemberDialog
          restaurantName={restaurantName}
          onInvite={onInvite}
        />
      )}
    </header>
  );
}
