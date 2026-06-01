'use client';

import { useState } from 'react';
import { LayoutGridIcon, CheckCircleIcon } from 'lucide-react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CreateZoneState } from '@/features/tables/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddZoneDialogProps {
  /** Existing zone names (case-insensitive) — prevents duplicates client-side. */
  existingNames: string[];
  onCreateZone: (name: string) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Owner-only dialog for creating a new zone (e.g. "Patio", "Terraza").
 * Validates a non-empty, non-duplicate name. Shows inline success/error feedback
 * and auto-closes after a brief success state.
 *
 * TODO: wire Firestore zone create — onCreateZone already calls the service;
 *   Firestore will land inside the service only.
 */
export function AddZoneDialog({ existingNames, onCreateZone }: AddZoneDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [submitState, setSubmitState] = useState<CreateZoneState>({ status: 'idle' });

  const trimmed = name.trim();
  const isDuplicate = existingNames.some(
    (n) => n.toLowerCase() === trimmed.toLowerCase()
  );
  const canSubmit =
    trimmed.length > 0 && !isDuplicate && submitState.status === 'idle';

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setName('');
      setSubmitState({ status: 'idle' });
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitState({ status: 'submitting' });

    try {
      await onCreateZone(trimmed);
      setSubmitState({ status: 'success', zoneName: trimmed });
      window.setTimeout(() => setOpen(false), 1_500);
    } catch {
      setSubmitState({
        status: 'error',
        message: 'No se pudo crear la zona. Intentá de nuevo.',
      });
    }
  }

  const isSubmitting = submitState.status === 'submitting';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="gap-2 focus-visible:ring-brand-sky/40"
          >
            <LayoutGridIcon aria-hidden="true" />
            Agregar zona
          </Button>
        }
      />

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Agregar zona</DialogTitle>
          <DialogDescription>
            Agregá una zona para agrupar mesas (por ejemplo, Patio o Terraza).
          </DialogDescription>
        </DialogHeader>

        {submitState.status === 'success' && (
          <Alert className="border-brand-emerald/30 bg-brand-emerald/10">
            <CheckCircleIcon className="size-4 text-brand-emerald" aria-hidden="true" />
            <AlertTitle className="text-brand-emerald">Zona creada</AlertTitle>
            <AlertDescription className="text-brand-emerald/80">
              La zona “{submitState.zoneName}” se agregó correctamente.
            </AlertDescription>
          </Alert>
        )}

        {submitState.status === 'error' && (
          <Alert variant="destructive">
            <AlertTitle>Error al crear la zona</AlertTitle>
            <AlertDescription>{submitState.message}</AlertDescription>
          </Alert>
        )}

        {submitState.status !== 'success' && (
          <form
            id="add-zone-form"
            onSubmit={handleSubmit}
            className="space-y-4"
            aria-label="Formulario para agregar zona"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="zone-name">Nombre de la zona</Label>
              <Input
                id="zone-name"
                type="text"
                placeholder="Ej: Patio"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (submitState.status === 'error') {
                    setSubmitState({ status: 'idle' });
                  }
                }}
                required
                autoComplete="off"
                disabled={isSubmitting}
                aria-describedby={isDuplicate ? 'zone-name-error' : undefined}
                aria-invalid={isDuplicate ? true : undefined}
              />

              {isDuplicate && (
                <p
                  id="zone-name-error"
                  role="alert"
                  className="text-xs text-destructive"
                >
                  Ya existe una zona con ese nombre. Elegí otro.
                </p>
              )}
            </div>
          </form>
        )}

        {submitState.status !== 'success' && (
          <DialogFooter>
            <Button
              type="submit"
              form="add-zone-form"
              disabled={!canSubmit || isSubmitting}
              className="bg-brand-sky text-white hover:bg-brand-sky/90 focus-visible:ring-brand-sky/40 disabled:bg-brand-sky/50"
            >
              {isSubmitting ? 'Creando…' : 'Crear zona'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
