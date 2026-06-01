'use client';

import { useState, useId } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PlanFields } from '@/features/platform/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  /** Initial form values — empty defaults for create, plan-derived for edit. */
  initialFields: PlanFields;
  isMutating: boolean;
  onSave: (fields: PlanFields) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Controlled dialog for creating or editing a plan. The parent owns open state
 * and which plan is being edited (passed via initialFields). Fields re-seed
 * whenever the dialog transitions to open.
 */
export function PlanDialog({
  open,
  onOpenChange,
  mode,
  initialFields,
  isMutating,
  onSave,
}: PlanDialogProps) {
  const [fields, setFields] = useState<PlanFields>(initialFields);
  const [error, setError] = useState<string | null>(null);

  const nameId = useId();
  const priceId = useId();
  const descId = useId();
  const tablesId = useId();
  const itemsId = useId();
  const activeId = useId();
  const errorId = useId();

  // Re-seed fields when the dialog opens (create → blank, edit → plan values).
  const [prevOpen, setPrevOpen] = useState(false);
  if (open && !prevOpen) {
    setPrevOpen(true);
    setFields(initialFields);
    setError(null);
  } else if (!open && prevOpen) {
    setPrevOpen(false);
  }

  const isCreate = mode === 'create';
  const title = isCreate ? 'Nuevo plan' : 'Editar plan';
  const description = isCreate
    ? 'Definí el precio y los límites del nuevo plan.'
    : 'Actualizá el precio y los límites de este plan.';
  const submitLabel = isCreate ? 'Crear plan' : 'Guardar cambios';
  const submittingLabel = isCreate ? 'Creando…' : 'Guardando…';

  function set<K extends keyof PlanFields>(key: K, value: PlanFields[K]): void {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!fields.name.trim()) {
      setError('El nombre del plan es requerido.');
      return;
    }
    if (Number.parseFloat(fields.priceMonthly) < 0 || fields.priceMonthly === '') {
      setError('Ingresá un precio mensual válido.');
      return;
    }
    if (Number.parseInt(fields.maxTables, 10) <= 0) {
      setError('El límite de mesas debe ser mayor que cero.');
      return;
    }
    setError(null);
    try {
      await onSave({ ...fields, name: fields.name.trim() });
      onOpenChange(false);
    } catch {
      setError('No se pudo guardar. Intentá de nuevo.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          id="plan-form"
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-label={`Formulario para ${isCreate ? 'crear' : 'editar'} plan`}
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor={nameId}>
              Nombre <span aria-hidden="true" className="text-destructive">*</span>
            </Label>
            <Input
              id={nameId}
              type="text"
              value={fields.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ej. Básico, Medium, Pro"
              disabled={isMutating}
              aria-invalid={error !== null}
              aria-describedby={error ? errorId : undefined}
              className="h-9 text-sm"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={priceId}>
                Precio / mes (US$){' '}
                <span aria-hidden="true" className="text-destructive">*</span>
              </Label>
              <Input
                id={priceId}
                type="number"
                min={0}
                step="1"
                inputMode="decimal"
                value={fields.priceMonthly}
                onChange={(e) => set('priceMonthly', e.target.value)}
                placeholder="25"
                disabled={isMutating}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={tablesId}>
                Máx. mesas <span aria-hidden="true" className="text-destructive">*</span>
              </Label>
              <Input
                id={tablesId}
                type="number"
                min={1}
                step="1"
                inputMode="numeric"
                value={fields.maxTables}
                onChange={(e) => set('maxTables', e.target.value)}
                placeholder="20"
                disabled={isMutating}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={itemsId}>
              Máx. productos del menú{' '}
              <span aria-hidden="true" className="text-destructive">*</span>
            </Label>
            <Input
              id={itemsId}
              type="number"
              min={1}
              step="1"
              inputMode="numeric"
              value={fields.maxMenuItems}
              onChange={(e) => set('maxMenuItems', e.target.value)}
              placeholder="120"
              disabled={isMutating}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={descId}>Descripción</Label>
            <Input
              id={descId}
              type="text"
              value={fields.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Breve descripción comercial del plan"
              disabled={isMutating}
              className="h-9 text-sm"
            />
          </div>

          <label
            htmlFor={activeId}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 px-3 py-2.5"
          >
            <input
              id={activeId}
              type="checkbox"
              checked={fields.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
              disabled={isMutating}
              className="size-4 rounded border-border text-brand-violet focus-visible:ring-2 focus-visible:ring-brand-violet/40"
            />
            <span className="text-sm text-foreground">
              Disponible para nuevas suscripciones
            </span>
          </label>

          {error && (
            <p id={errorId} role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </form>

        <DialogFooter>
          <Button
            type="submit"
            form="plan-form"
            disabled={isMutating || fields.name.trim().length === 0}
            className="bg-brand-violet text-white hover:bg-brand-violet/90 focus-visible:ring-brand-violet/40 disabled:bg-brand-violet/50"
          >
            {isMutating ? submittingLabel : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
