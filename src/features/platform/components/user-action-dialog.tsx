'use client';

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

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserActionKind =
  | 'grant-platform-role'
  | 'revoke-platform-role'
  | 'disable-account'
  | 'enable-account';

interface UserActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: UserActionKind | null;
  /** Display name or email of the user being acted on. */
  userName: string;
  isMutating: boolean;
  onConfirm: () => Promise<void>;
}

// ─── Copy map ─────────────────────────────────────────────────────────────────

const ACTION_COPY: Record<
  UserActionKind,
  { title: string; description: string; confirmLabel: string; confirmClass: string }
> = {
  'grant-platform-role': {
    title: 'Otorgar rol de plataforma',
    description:
      'Al confirmar, este usuario tendrá acceso completo al panel de plataforma: podrá gestionar comercios, planes y usuarios. Esta acción tiene un alto impacto — asegurate de que es la persona correcta.',
    confirmLabel: 'Otorgar acceso',
    confirmClass:
      'bg-brand-violet text-white hover:bg-brand-violet/90 focus-visible:ring-brand-violet/40 disabled:bg-brand-violet/50',
  },
  'revoke-platform-role': {
    title: 'Revocar rol de plataforma',
    description:
      'Al confirmar, este usuario perderá el acceso al panel de plataforma de forma inmediata. Seguirá teniendo acceso a los comercios a los que pertenece como miembro.',
    confirmLabel: 'Revocar acceso',
    confirmClass:
      'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/40 disabled:bg-destructive/50',
  },
  'disable-account': {
    title: 'Deshabilitar cuenta',
    description:
      'Al confirmar, esta cuenta quedará deshabilitada: el usuario no podrá iniciar sesión hasta que la reactives. Sus datos y comercios no se ven afectados.',
    confirmLabel: 'Deshabilitar cuenta',
    confirmClass:
      'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/40 disabled:bg-destructive/50',
  },
  'enable-account': {
    title: 'Habilitar cuenta',
    description:
      'Al confirmar, esta cuenta volverá a estar activa y el usuario podrá iniciar sesión con normalidad.',
    confirmLabel: 'Habilitar cuenta',
    confirmClass:
      'bg-brand-emerald text-white hover:bg-brand-emerald/90 focus-visible:ring-brand-emerald/40 disabled:bg-brand-emerald/50',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Reusable confirm dialog for all platform user management actions.
 * The caller owns `open` state and which action is pending.
 * Focus is trapped by Base UI's Dialog automatically.
 */
export function UserActionDialog({
  open,
  onOpenChange,
  kind,
  userName,
  isMutating,
  onConfirm,
}: UserActionDialogProps) {
  if (kind === null) return null;

  const copy = ACTION_COPY[kind];

  async function handleConfirm(): Promise<void> {
    await onConfirm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isMutating}>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{userName}</span>
            {' — '}
            {copy.description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant="outline"
                disabled={isMutating}
                aria-label="Cancelar acción"
              />
            }
          >
            Cancelar
          </DialogClose>

          <Button
            onClick={handleConfirm}
            disabled={isMutating}
            className={copy.confirmClass}
          >
            {isMutating ? 'Procesando…' : copy.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
