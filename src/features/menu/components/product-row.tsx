'use client';

import Image from 'next/image';
import { PencilIcon, Trash2Icon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AvailabilityBadge } from './availability-badge';
import { formatPrice } from '@/features/menu/mappers/format-price.mapper';
import type { Product } from '@/features/menu/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductRowProps {
  product: Product;
  currency: string;
  isOwner: boolean;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onToggleAvailability: (productId: string, available: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * A single product row inside a category section.
 *
 * Layout: emoji + name/description | price | availability badge | actions (owner only)
 * Mobile: stacks name and price.
 */
export function ProductRow({
  product,
  currency,
  isOwner,
  onEdit,
  onDelete,
  onToggleAvailability,
}: ProductRowProps) {
  const { id, name, description, price, available, emoji, imageUrl } = product;
  const formattedPrice = formatPrice(price, currency);
  const toggleLabel = available
    ? `Marcar "${name}" como no disponible`
    : `Marcar "${name}" como disponible`;

  return (
    <li className="group/row flex items-start gap-3 border-b border-border/60 px-4 py-3 last:border-b-0 transition-colors hover:bg-muted/30 sm:items-center sm:px-6">
      {/* Photo or emoji fallback */}
      {imageUrl ? (
        <span className="relative mt-0.5 size-10 shrink-0 overflow-hidden rounded-md sm:mt-0">
          <Image
            src={imageUrl}
            alt={`Foto de ${name}`}
            fill
            sizes="40px"
            className="object-cover"
          />
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md bg-muted/50 text-base sm:mt-0"
        >
          {emoji ?? '🍽️'}
        </span>
      )}

      {/* Name + description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-tight">
          {name}
        </p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
        {/* Mobile: badge inline */}
        <div className="mt-1.5 sm:hidden">
          <AvailabilityBadge available={available} />
        </div>
      </div>

      {/* Price */}
      <span className="shrink-0 text-sm font-semibold text-foreground tabular-nums">
        {formattedPrice}
      </span>

      {/* Desktop: availability badge */}
      <div className="hidden sm:block shrink-0">
        <AvailabilityBadge available={available} />
      </div>

      {/* Actions — owner only */}
      {isOwner && (
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100">
          {/* Availability toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onToggleAvailability(id, !available)}
            aria-label={toggleLabel}
            aria-pressed={available}
            className={
              available
                ? 'text-brand-emerald hover:bg-brand-emerald/10'
                : 'text-muted-foreground hover:bg-muted'
            }
          >
            {available ? (
              <EyeIcon aria-hidden="true" className="size-4" />
            ) : (
              <EyeOffIcon aria-hidden="true" className="size-4" />
            )}
          </Button>

          {/* Edit */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(product)}
            aria-label={`Editar "${name}"`}
          >
            <PencilIcon aria-hidden="true" className="size-4" />
          </Button>

          {/* Delete */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(id)}
            aria-label={`Eliminar "${name}"`}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2Icon aria-hidden="true" className="size-4" />
          </Button>
        </div>
      )}
    </li>
  );
}
