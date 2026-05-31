'use client';

import { useState } from 'react';
import { UserPlusIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Role } from '@/types/membership';

// ─── Types ────────────────────────────────────────────────────────────────────

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; email: string }
  | { status: 'error'; message: string };

interface InviteMemberDialogProps {
  restaurantName: string;
  onInvite?: (email: string, role: Role) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Dialog for inviting a new member to the active restaurant.
 * Mock-only: on submit, records locally and shows a success alert.
 * TODO: wire Firestore membership create — create a membership document with
 *   { userId, restaurantId, role, createdAt } after resolving the user by email.
 */
export function InviteMemberDialog({
  restaurantName,
  onInvite,
}: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('staff');
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      // Reset form when closing — but keep success state visible briefly
      setEmail('');
      setRole('staff');
      setSubmitState({ status: 'idle' });
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    setSubmitState({ status: 'submitting' });

    // Simulate async invite (mock — no real persistence)
    // TODO: wire Firestore membership create here
    setTimeout(() => {
      setSubmitState({ status: 'success', email: trimmedEmail });
      onInvite?.(trimmedEmail, role);

      // Auto-close after showing success feedback
      setTimeout(() => {
        setOpen(false);
      }, 1800);
    }, 400);
  }

  const isSubmitting = submitState.status === 'submitting';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button className="gap-2">
            <UserPlusIcon aria-hidden="true" />
            Invitar miembro
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invitar miembro</DialogTitle>
          <DialogDescription>
            El usuario tendrá acceso al panel de {restaurantName} con el rol
            que seleccionés.
          </DialogDescription>
        </DialogHeader>

        {submitState.status === 'success' && (
          <Alert>
            <AlertTitle>Invitación enviada</AlertTitle>
            <AlertDescription>
              Se invitó a <strong>{submitState.email}</strong> correctamente.
            </AlertDescription>
          </Alert>
        )}

        {submitState.status === 'error' && (
          <Alert variant="destructive">
            <AlertTitle>Error al invitar</AlertTitle>
            <AlertDescription>{submitState.message}</AlertDescription>
          </Alert>
        )}

        {submitState.status !== 'success' && (
          <form
            id="invite-member-form"
            onSubmit={handleSubmit}
            className="space-y-4"
            aria-label="Formulario de invitación"
          >
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Correo electrónico</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isSubmitting}
                aria-describedby="invite-email-hint"
              />
              <p
                id="invite-email-hint"
                className="text-xs text-muted-foreground"
              >
                El usuario debe estar registrado en Mesa.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invite-role-trigger">Rol</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as Role)}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="invite-role-trigger"
                  aria-label="Seleccionar rol para el nuevo miembro"
                  className="w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Propietario</SelectItem>
                  <SelectItem value="staff">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        )}

        {submitState.status !== 'success' && (
          <DialogFooter>
            <Button
              type="submit"
              form="invite-member-form"
              disabled={isSubmitting || email.trim().length === 0}
            >
              {isSubmitting ? 'Invitando…' : 'Invitar'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
