'use client';

import { useState, useId, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category, Product, ProductFields } from '@/features/menu/types';
import type { DialogMode } from '@/features/menu/constants';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function productToFields(product: Product, defaultCategoryId: string): ProductFields {
  return {
    name: product.name,
    description: product.description ?? '',
    price: product.price.toFixed(2),
    emoji: product.emoji ?? '',
    available: product.available,
    categoryId: product.categoryId,
    imageUrl: product.imageUrl,
  };
}

function emptyFields(defaultCategoryId: string): ProductFields {
  return {
    name: '',
    description: '',
    price: '',
    emoji: '',
    available: true,
    categoryId: defaultCategoryId,
    imageUrl: undefined,
  };
}

function validateFields(fields: ProductFields): string | null {
  if (!fields.name.trim()) return 'El nombre del producto es requerido.';
  const price = parseFloat(fields.price);
  if (isNaN(price) || price < 0) return 'El precio debe ser un número mayor o igual a 0.';
  if (!fields.categoryId) return 'Seleccioná una categoría.';
  return null;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: DialogMode;
  /** Product being edited — provided when mode === 'edit' */
  product?: Product;
  /** Category pre-selected for new product */
  defaultCategoryId?: string;
  categories: Category[];
  isMutating: boolean;
  onSave: (fields: ProductFields, productId?: string) => Promise<void>;
  /** Compress + upload a photo, returning its public URL. */
  onUploadImage: (file: File) => Promise<string>;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Dialog for adding or editing a product.
 *
 * Controlled from the parent (open + onOpenChange) so the parent decides
 * which product to edit without this dialog holding a product reference.
 *
 * Fields: name, emoji, price, description (optional), category, available.
 */
export function ProductDialog({
  open,
  onOpenChange,
  mode,
  product,
  defaultCategoryId = '',
  categories,
  isMutating,
  onSave,
  onUploadImage,
}: ProductDialogProps) {
  const isEdit = mode === 'edit';
  const title = isEdit ? 'Editar producto' : 'Nuevo producto';
  const description = isEdit
    ? 'Modificá los datos del producto.'
    : 'Completá los datos para agregar un nuevo producto al menú.';
  const submitLabel = isEdit ? 'Guardar cambios' : 'Agregar producto';
  const submittingLabel = isEdit ? 'Guardando…' : 'Agregando…';

  const [fields, setFields] = useState<ProductFields>(() =>
    isEdit && product
      ? productToFields(product, defaultCategoryId)
      : emptyFields(defaultCategoryId)
  );
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // The dialog stays mounted, so re-seed the form whenever it opens (or the
  // target product changes) — otherwise edit would show the stale initial state.
  useEffect(() => {
    if (!open) return;
    setFields(
      isEdit && product
        ? productToFields(product, defaultCategoryId)
        : emptyFields(defaultCategoryId)
    );
    setError(null);
  }, [open, product, isEdit, defaultCategoryId]);

  // Stable IDs for a11y
  const nameId = useId();
  const emojiId = useId();
  const priceId = useId();
  const descId = useId();
  const categoryId = useId();
  const imageId = useId();
  const errorId = useId();

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const url = await onUploadImage(file);
      updateField('imageUrl', url);
    } catch {
      setError('No se pudo subir la imagen. Intentá de nuevo.');
    } finally {
      setIsUploading(false);
    }
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      // Reset form on close
      const reset = isEdit && product
        ? productToFields(product, defaultCategoryId)
        : emptyFields(defaultCategoryId);
      setFields(reset);
      setError(null);
    }
  }

  function updateField<K extends keyof ProductFields>(key: K, value: ProductFields[K]): void {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const validationError = validateFields(fields);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    try {
      await onSave(fields, isEdit ? product?.id : undefined);
      handleOpenChange(false);
    } catch {
      setError('No se pudo guardar. Intentá de nuevo.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          id="product-form"
          onSubmit={handleSubmit}
          noValidate
          aria-label={`Formulario para ${isEdit ? 'editar' : 'agregar'} producto`}
          className="space-y-4"
        >
          {/* Error live region */}
          {error && (
            <p id={errorId} role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}

          <fieldset className="border-0 m-0 p-0 space-y-4" disabled={isMutating}>
            <legend className="sr-only">Datos del producto</legend>

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor={nameId}>
                Nombre{' '}
                <span aria-hidden="true" className="text-destructive">*</span>
              </Label>
              <Input
                id={nameId}
                type="text"
                value={fields.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Ej. Baleada especial"
                required
                className="h-9 text-sm"
                autoFocus
              />
            </div>

            {/* Emoji + Price — side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor={emojiId}>Emoji</Label>
                <Input
                  id={emojiId}
                  type="text"
                  value={fields.emoji}
                  onChange={(e) => updateField('emoji', e.target.value)}
                  placeholder="🍽️"
                  maxLength={4}
                  className="h-9 text-center text-base"
                  aria-describedby={`${emojiId}-hint`}
                />
                <p id={`${emojiId}-hint`} className="text-xs text-muted-foreground">
                  Opcional
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={priceId}>
                  Precio{' '}
                  <span aria-hidden="true" className="text-destructive">*</span>
                </Label>
                <Input
                  id={priceId}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={fields.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="0.00"
                  required
                  className="h-9 text-sm tabular-nums"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor={descId}>
                Descripción{' '}
                <span className="font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id={descId}
                type="text"
                value={fields.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Descripción breve del producto"
                className="h-9 text-sm"
              />
            </div>

            {/* Photo */}
            <div className="space-y-1.5">
              <Label htmlFor={imageId}>
                Foto{' '}
                <span className="font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <div className="flex items-center gap-3">
                {fields.imageUrl ? (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-border">
                    <Image
                      src={fields.imageUrl}
                      alt={`Foto de ${fields.name || 'producto'}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="flex size-16 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground"
                    aria-hidden="true"
                  >
                    <ImageIcon className="size-5" />
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    id={imageId}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                    disabled={isUploading || isMutating}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isMutating}
                  >
                    {isUploading
                      ? 'Subiendo…'
                      : fields.imageUrl
                        ? 'Cambiar foto'
                        : 'Subir foto'}
                  </Button>
                  {fields.imageUrl && !isUploading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateField('imageUrl', undefined)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      Quitar
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Se convierte a WebP y se optimiza automáticamente.
              </p>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor={categoryId}>
                Categoría{' '}
                <span aria-hidden="true" className="text-destructive">*</span>
              </Label>
              <Select
                value={fields.categoryId}
                onValueChange={(v) => updateField('categoryId', v ?? '')}
                disabled={isMutating}
              >
                <SelectTrigger
                  id={categoryId}
                  className="h-9 w-full text-sm"
                  aria-label="Seleccioná la categoría del producto"
                >
                  <SelectValue placeholder="Seleccioná una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Availability */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Disponible</p>
                <p className="text-xs text-muted-foreground">
                  Los clientes pueden ver y pedir este producto.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updateField('available', !fields.available)}
                aria-pressed={fields.available}
                aria-label={fields.available ? 'Marcar como no disponible' : 'Marcar como disponible'}
                className={
                  fields.available
                    ? 'border-brand-emerald/40 bg-brand-emerald/10 text-brand-emerald hover:bg-brand-emerald/20'
                    : 'border-border text-muted-foreground'
                }
              >
                {fields.available ? 'Sí' : 'No'}
              </Button>
            </div>
          </fieldset>
        </form>

        <DialogFooter>
          <Button
            type="submit"
            form="product-form"
            disabled={isMutating || isUploading || !fields.name.trim() || !fields.price}
            className="bg-brand-sky text-white hover:bg-brand-sky/90 focus-visible:ring-brand-sky/40 disabled:bg-brand-sky/50"
          >
            {isMutating ? submittingLabel : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
