'use client';

import { useState } from 'react';
import { PlusIcon, CheckCircleIcon } from 'lucide-react';
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
import type { CreateTableState } from '@/features/tables/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddTableDialogProps {
  /** Numbers already in use — prevents duplicates client-side. */
  existingNumbers: number[];
  onCreateTable: (tableNumber: number) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Dialog for adding a new table to the active restaurant.
 *
 * Validates that the table number:
 *   - Is a positive integer
 *   - Is not already in use
 *
 * On success shows inline feedback and auto-closes after 1.5 s.
 * TODO: wire Firestore table create — the onCreateTable callback already
 *   calls the service; Firestore will land inside the service only.
 */
export function AddTableDialog({ existingNumbers, onCreateTable }: AddTableDialogProps) {
  const [open, setOpen] = useState(false);
  const [rawValue, setRawValue] = useState('');
  const [submitState, setSubmitState] = useState<CreateTableState>({ status: 'idle' });

  const parsedNumber = parseInt(rawValue, 10);
  const isValidNumber = !Number.isNaN(parsedNumber) && parsedNumber > 0;
  const isDuplicate = isValidNumber && existingNumbers.includes(parsedNumber);
  const canSubmit = isValidNumber && !isDuplicate && submitState.status === 'idle';

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setRawValue('');
      setSubmitState({ status: 'idle' });
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitState({ status: 'submitting' });

    try {
      await onCreateTable(parsedNumber);
      setSubmitState({ status: 'success', tableNumber: parsedNumber });

      // Auto-close after brief success feedback
      window.setTimeout(() => setOpen(false), 1_500);
    } catch {
      setSubmitState({
        status: 'error',
        message: 'No se pudo crear la mesa. Intentá de nuevo.',
      });
    }
  }

  const isSubmitting = submitState.status === 'submitting';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button className="gap-2 bg-brand-sky text-white hover:bg-brand-sky/90 focus-visible:ring-brand-sky/40">
            <PlusIcon aria-hidden="true" />
            Agregar mesa
          </Button>
        }
      />

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Agregar mesa</DialogTitle>
          <DialogDescription>
            Ingresá el número de la nueva mesa. Se generará un código QR automáticamente.
          </DialogDescription>
        </DialogHeader>

        {/* Success feedback */}
        {submitState.status === 'success' && (
          <Alert className="border-brand-emerald/30 bg-brand-emerald/10">
            <CheckCircleIcon className="size-4 text-brand-emerald" aria-hidden="true" />
            <AlertTitle className="text-brand-emerald">Mesa creada</AlertTitle>
            <AlertDescription className="text-brand-emerald/80">
              La Mesa {submitState.tableNumber} se agregó correctamente.
            </AlertDescription>
          </Alert>
        )}

        {/* Error feedback */}
        {submitState.status === 'error' && (
          <Alert variant="destructive">
            <AlertTitle>Error al crear la mesa</AlertTitle>
            <AlertDescription>{submitState.message}</AlertDescription>
          </Alert>
        )}

        {/* Form — hidden after success */}
        {submitState.status !== 'success' && (
          <form
            id="add-table-form"
            onSubmit={handleSubmit}
            className="space-y-4"
            aria-label="Formulario para agregar mesa"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="table-number">Número de mesa</Label>
              <Input
                id="table-number"
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="Ej: 5"
                value={rawValue}
                onChange={(e) => {
                  setRawValue(e.target.value);
                  // Dismiss error on edit
                  if (submitState.status === 'error') {
                    setSubmitState({ status: 'idle' });
                  }
                }}
                required
                disabled={isSubmitting}
                aria-describedby={isDuplicate ? 'table-number-error' : undefined}
                aria-invalid={isDuplicate ? true : undefined}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              {isDuplicate && (
                <p
                  id="table-number-error"
                  role="alert"
                  className="text-xs text-destructive"
                >
                  Ya existe una Mesa {parsedNumber}. Elegí otro número.
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                Números en uso: {existingNumbers.length > 0 ? existingNumbers.sort((a, b) => a - b).join(', ') : 'ninguno'}
              </p>
            </div>
          </form>
        )}

        {submitState.status !== 'success' && (
          <DialogFooter>
            <Button
              type="submit"
              form="add-table-form"
              disabled={!canSubmit || isSubmitting}
              className="bg-brand-sky text-white hover:bg-brand-sky/90 focus-visible:ring-brand-sky/40 disabled:bg-brand-sky/50"
            >
              {isSubmitting ? 'Creando…' : 'Crear mesa'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
