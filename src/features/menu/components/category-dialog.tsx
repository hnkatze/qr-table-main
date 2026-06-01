'use client';

import { useState, useId } from 'react';
import { FolderPlusIcon } from 'lucide-react';
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
import type { CategoryFields } from '@/features/menu/types';

// ─── Props ────────────────────────────────────────────────────────────────────

/**
 * Add mode: uncontrolled — dialog manages its own open state; renders a branded button trigger.
 * Edit mode: controlled — caller owns open/onOpenChange; no internal trigger rendered.
 */
type CategoryDialogProps =
  | {
      mode: 'add';
      isMutating: boolean;
      onSave: (fields: CategoryFields) => Promise<void>;
    }
  | {
      mode: 'edit';
      open: boolean;
      onOpenChange: (open: boolean) => void;
      initialName: string;
      categoryId: string;
      isMutating: boolean;
      onSave: (fields: CategoryFields, categoryId: string) => Promise<void>;
    };

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Dialog for adding or editing a category.
 *
 * Add mode: uncontrolled — the dialog owns its open state and renders a trigger button.
 * Edit mode: controlled — the parent drives open/close; no trigger is rendered.
 */
export function CategoryDialog(props: CategoryDialogProps) {
  const isAdd = props.mode === 'add';

  // Uncontrolled open for add mode
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isAdd ? internalOpen : props.open;

  const initialName = isAdd ? '' : props.initialName;
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);

  const nameId = useId();
  const errorId = useId();

  // For edit mode: sync name + reset error whenever the dialog opens.
  // Since `mode` is stable for a mounted instance, this conditional is safe.
  const [prevOpen, setPrevOpen] = useState(false);
  if (!isAdd) {
    const editProps = props as Extract<CategoryDialogProps, { mode: 'edit' }>;
    if (editProps.open && !prevOpen) {
      setPrevOpen(true);
      setName(editProps.initialName);
      setError(null);
    } else if (!editProps.open && prevOpen) {
      setPrevOpen(false);
    }
  }

  const title = isAdd ? 'Nueva categoría' : 'Editar categoría';
  const description = isAdd
    ? 'Creá una nueva categoría para agrupar productos en el menú.'
    : 'Cambiá el nombre de la categoría.';
  const submitLabel = isAdd ? 'Crear' : 'Guardar';
  const submittingLabel = isAdd ? 'Creando…' : 'Guardando…';

  function handleOpenChange(next: boolean) {
    if (isAdd) {
      setInternalOpen(next);
    } else {
      props.onOpenChange(next);
    }
    if (!next) {
      setName(initialName);
      setError(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('El nombre de la categoría es requerido.');
      return;
    }
    setError(null);
    try {
      if (isAdd) {
        await props.onSave({ name: trimmed });
      } else {
        await props.onSave({ name: trimmed }, props.categoryId);
      }
      handleOpenChange(false);
    } catch {
      setError('No se pudo guardar. Intentá de nuevo.');
    }
  }

  const dialogContent = (
    <DialogContent className="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <form
        id="category-form"
        onSubmit={handleSubmit}
        className="space-y-4"
        aria-label={`Formulario para ${isAdd ? 'crear' : 'editar'} categoría`}
        noValidate
      >
        <div className="space-y-1.5">
          <Label htmlFor={nameId}>
            Nombre{' '}
            <span aria-hidden="true" className="text-destructive">*</span>
          </Label>
          <Input
            id={nameId}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Ej. Entradas, Bebidas, Postres"
            required
            disabled={props.isMutating}
            aria-invalid={error !== null}
            aria-describedby={error ? errorId : undefined}
            className="h-9 text-sm"
            autoFocus
          />
          {error && (
            <p id={errorId} role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
      </form>

      <DialogFooter>
        <Button
          type="submit"
          form="category-form"
          disabled={props.isMutating || name.trim().length === 0}
          className="bg-brand-violet text-white hover:bg-brand-violet/90 focus-visible:ring-brand-violet/40 disabled:bg-brand-violet/50"
        >
          {props.isMutating ? submittingLabel : submitLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  if (isAdd) {
    return (
      <Dialog open={internalOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger
          render={
            <Button
              className="gap-2 bg-brand-violet text-white hover:bg-brand-violet/90 focus-visible:ring-brand-violet/40"
              aria-label="Agregar nueva categoría al menú"
            >
              <FolderPlusIcon aria-hidden="true" className="size-4" />
              Nueva categoría
            </Button>
          }
        />
        {dialogContent}
      </Dialog>
    );
  }

  // Edit mode: controlled, no trigger
  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      {dialogContent}
    </Dialog>
  );
}
